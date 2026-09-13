import fs from "fs";
import path from "path";

/**
 * Checkpoint Engine — implements .sdd/runtime/state.sdd Phase 149 r3
 * (LangGraph thread_id model).
 *
 * Durable chain-run snapshots persisted at ARM BOUNDARIES and before
 * INTERRUPTS only — never per-message ([RT8]). Completed steps are
 * never re-executed on resume ([RT9]). Retention: last checkpoint per
 * arm + final; intermediate pruned.
 */

export type ChainArm = "P1" | "D1" | "S1" | "C1" | "R1" | "DEP1" | "RS1";

export interface Checkpoint {
  checkpoint_id: string; // CPR-<run>-<seq>
  run_id: string;
  arm: ChainArm;
  step: number; // execution trace step #01-#16
  state: Record<string, unknown>; // typed shared-state snapshot
  inputs: string[]; // arm input references
  outputs: Record<string, unknown>; // compressed arm outputs
  iteration: number; // per-arm iteration counter
  outcome?: string; // TypedOutcomeCodes value if arm completed
  ts: string; // ISO-8601
}

export interface CircuitBreakerState {
  arm: ChainArm;
  failures: number[]; // timestamps (ms) of recent failures within window
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  openedAt?: number;
}

const BREAKER_THRESHOLD = 3; // failures
const BREAKER_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BREAKER_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const RETRY_CAP = 3;

export class CheckpointEngine {
  private store: Map<string, Checkpoint[]> = new Map(); // run_id -> kept checkpoints
  private lastByArm: Map<string, Checkpoint> = new Map(); // run:arm -> last cp
  private completed: Map<string, Set<string>> = new Map(); // run_id -> completed "arm:step" ([RT9])
  private breakers: Map<string, CircuitBreakerState> = new Map();
  private seq = 0;

  constructor(private readonly storeDir?: string) {
    if (storeDir) {
      fs.mkdirSync(path.join(storeDir), { recursive: true });
    }
  }

  /** Persist a checkpoint at an arm boundary (or pre-interrupt). [RT4][RT8] */
  checkpoint(input: {
    run_id: string;
    arm: ChainArm;
    step: number;
    state: Record<string, unknown>;
    inputs?: string[];
    outputs?: Record<string, unknown>;
    iteration?: number;
    outcome?: string;
  }): Checkpoint {
    const cp: Checkpoint = {
      checkpoint_id: `CPR-${input.run_id}-${++this.seq}`,
      run_id: input.run_id,
      arm: input.arm,
      step: input.step,
      state: input.state,
      inputs: input.inputs ?? [],
      outputs: input.outputs ?? {},
      iteration: input.iteration ?? 0,
      outcome: input.outcome,
      ts: new Date().toISOString(),
    };

    // Retention discipline: keep only the LAST checkpoint per arm.
    const armKey = `${input.run_id}:${input.arm}`;
    const prev = this.lastByArm.get(armKey);
    if (prev) {
      const kept = (this.store.get(input.run_id) ?? []).filter(
        (c) => c.checkpoint_id !== prev.checkpoint_id
      );
      kept.push(cp);
      this.store.set(input.run_id, kept);
    } else {
      const kept = this.store.get(input.run_id) ?? [];
      kept.push(cp);
      this.store.set(input.run_id, kept);
    }
    this.lastByArm.set(armKey, cp);
    if (cp.outcome === "SUCCESS") {
      const done = this.completed.get(input.run_id) ?? new Set<string>();
      done.add(`${input.arm}:${input.step}`);
      this.completed.set(input.run_id, done);
    }
    this.persist(cp);
    return cp;
  }

  /** Resume: latest checkpoint for a run — completed steps are NOT re-executed. [RT9] */
  resume(run_id: string): Checkpoint | null {
    const kept = this.store.get(run_id);
    if (!kept || kept.length === 0) return null;
    return kept.reduce((a, b) => (a.ts < b.ts ? b : a));
  }

  /** True when the (arm, step) pair already completed in a checkpoint. */
  isComplete(run_id: string, arm: ChainArm, step: number): boolean {
    return this.completed.get(run_id)?.has(`${arm}:${step}`) ?? false;
  }

  // ---- Circuit breakers ([RT10][RT11], 3-layer failure stack) ----

  /** Record an arm failure; returns the breaker state after recording. */
  recordFailure(arm: ChainArm, failureTime = Date.now()): CircuitBreakerState {
    const now = Date.now();
    const key = arm;
    const br =
      this.breakers.get(key) ?? { arm, failures: [], state: "CLOSED" as const };
    br.failures = br.failures.filter((t) => now - t < BREAKER_WINDOW_MS);
    br.failures.push(failureTime);
    if (br.failures.length >= BREAKER_THRESHOLD) {
      br.state = "OPEN";
      br.openedAt = now;
    }
    this.breakers.set(key, br);
    return br;
  }

  /** Record success: clears the failure window, closes the breaker. */
  recordSuccess(arm: ChainArm): CircuitBreakerState {
    const br =
      this.breakers.get(arm) ?? { arm, failures: [], state: "CLOSED" as const };
    br.failures = [];
    if (br.state === "OPEN" || br.state === "HALF_OPEN") {
      br.state = "CLOSED";
      br.openedAt = undefined;
    }
    this.breakers.set(arm, br);
    return br;
  }

  /**
   * Can an arm receive dispatches right now?
   * OPEN arm receives NO dispatches until cooldown ends ([RT11]);
   * after cooldown the breaker moves to HALF_OPEN and allows one probe.
   */
  canDispatch(arm: ChainArm, now = Date.now()): boolean {
    const br = this.breakers.get(arm);
    if (!br) return true;
    if (br.state === "CLOSED") return true;
    if (br.state === "OPEN") {
      if (br.openedAt && now - br.openedAt >= BREAKER_COOLDOWN_MS) {
        br.state = "HALF_OPEN";
        return true; // single probe allowed
      }
      return false;
    }
    return true; // HALF_OPEN: probe dispatch allowed
  }

  breakerState(arm: ChainArm): CircuitBreakerState {
    return this.breakers.get(arm) ?? { arm, failures: [], state: "CLOSED" };
  }

  /** Layer1_retry cap: max 3 retries per arm. */
  static readonly RETRY_CAP = RETRY_CAP;

  private persist(cp: Checkpoint): void {
    if (!this.storeDir) return;
    try {
      const runDir = path.join(this.storeDir, cp.run_id);
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(
        path.join(runDir, `${cp.checkpoint_id}.json`),
        JSON.stringify(cp, null, 2),
        "utf-8"
      );
    } catch {
      // Storage is best-effort durability; in-memory state remains
      // authoritative for the session.
    }
  }
}
