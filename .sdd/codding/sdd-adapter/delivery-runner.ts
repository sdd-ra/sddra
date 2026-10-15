import fs from "fs";
import path from "path";

/**
 * Delivery Runner — implements .sdd/chains/delivery.sdd (DL1) StepState
 * semantics with persisted step states, conditional RF-XX skips, and
 * blocking-BUG stops ([DL1-1..8]).
 *
 * FLOW VERSION 2 (Phase 155): within each branch, scoped security
 * (SC-XX) PRECEDES branch tests (XX-TS) — security-defective code is
 * never tested first. FTS (Final Test Suite: cross-layer E2E,
 * integration, regression) runs after all active branches' XX-TS and
 * before AN.
 *
 * The flow is IMMUTABLE ([DL1-1]); /next continues from SAVED STATE
 * ([DL1-2][DL1-3]); a step is DONE only with proof ([DL1-4]); a blocking
 * BUG stops the flow ([DL1-5]); VR requires all required steps complete
 * AND no blocking BUG ([DL1-6]). v1 runs (state files without
 * flow_version) are DEPRECATED — re-initialized, never resumed under
 * the v2 ordering ([DL1-7]); FTS is mandatory ([DL1-8]).
 */

export type DeliveryStep =
  | "BC" | "BR" | "BD" | "DS" | "TK" | "BDD"
  | "BE" | "DB" | "API" | "FE" | "MD" | "DC"
  | "CR-BE" | "CR-DB" | "CR-API" | "CR-FE" | "CR-MD" | "CR-DC"
  | "RF-BE" | "RF-DB" | "RF-API" | "RF-FE" | "RF-MD" | "RF-DC"
  | "SC-BE" | "SC-DB" | "SC-API" | "SC-FE" | "SC-MD" | "SC-DC"
  | "BE-TS" | "DB-TS" | "API-TS" | "FE-TS" | "MD-TS" | "DC-TS"
  | "FTS"
  | "AN" | "VR";

export const FLOW_VERSION = 2;

export interface DeliveryState {
  run_id: string;
  current_step: DeliveryStep | null;
  completed_steps: DeliveryStep[];
  first_incomplete: DeliveryStep | null;
  branch_states: Record<string, "pending" | "in_progress" | "done">;
  rf_skipped: Record<string, boolean>;
  blocking_bugs: string[];
  last_checkpoint: string | null;
  /** 2 = current ordering; absent = v1 deprecated run ([DL1-7]). */
  flow_version: number;
  /** Set when a v1 run is re-initialized (original run_id recorded). */
  deprecated_from?: string;
}

/** Canonical DL1 v2 flow order (fixed; immutable [DL1-1]). */
const FLOW: DeliveryStep[][] = [
  ["BC"], ["BR"], ["BD"], ["DS"], ["TK"], ["BDD"],
  // Parallel implementation branches (each entry independent).
  ["BE", "DB", "API", "FE", "MD", "DC"],
  ["CR-BE", "CR-DB", "CR-API", "CR-FE", "CR-MD", "CR-DC"],
  // RF-XX is conditional per-branch (skipped when CR-XX passed clean).
  ["RF-BE", "RF-DB", "RF-API", "RF-FE", "RF-MD", "RF-DC"],
  // v2: scoped security runs BEFORE branch tests.
  ["SC-BE", "SC-DB", "SC-API", "SC-FE", "SC-MD", "SC-DC"],
  ["BE-TS", "DB-TS", "API-TS", "FE-TS", "MD-TS", "DC-TS"],
  // FTS: cross-layer E2E/integration/regression after branch tests.
  ["FTS"],
  ["AN"], ["VR"],
];

const ALL_STEPS: DeliveryStep[] = FLOW.flat();

const BRANCH_STEPS = ["BE", "DB", "API", "FE", "MD", "DC"] as const;

export class DeliveryRunner {
  constructor(
    private readonly storeDir: string,
    private readonly impactMatrix: string[] = [...BRANCH_STEPS]
  ) {}

  /** Branches not in the task's ImpactMatrix are skipped EXPLICITLY. */
  isBranchSkipped(branch: string): boolean {
    return !this.impactMatrix.includes(branch);
  }

  /** Load (or initialize) the persisted run state. [DL1-2] */
  load(run_id: string): DeliveryState {
    const file = this.statePath(run_id);
    if (fs.existsSync(file)) {
      const loaded = JSON.parse(fs.readFileSync(file, "utf-8"));
      // [DL1-7] v1 runs (no flow_version) are DEPRECATED: re-initialize,
      // never silently resume under the v2 ordering.
      if (loaded.flow_version !== FLOW_VERSION) {
        const fresh = this.freshState(run_id);
        fresh.deprecated_from = loaded.run_id ?? run_id;
        this.save(fresh);
        return fresh;
      }
      return loaded as DeliveryState;
    }
    const fresh = this.freshState(run_id);
    this.save(fresh);
    return fresh;
  }

  private freshState(run_id: string): DeliveryState {
    return {
      run_id,
      current_step: "BC",
      completed_steps: [],
      first_incomplete: "BC",
      branch_states: Object.fromEntries(
        BRANCH_STEPS.map((b) => [b, "pending" as const])
      ),
      rf_skipped: {},
      blocking_bugs: [],
      last_checkpoint: null,
      flow_version: FLOW_VERSION,
    };
  }

  /** Persist state after every change ([RT5] discipline). */
  save(state: DeliveryState): void {
    const dir = path.join(this.storeDir, "delivery", state.run_id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.statePath(state.run_id), JSON.stringify(state, null, 2), "utf-8");
  }

  /**
   * /next semantics: continues from the FIRST INCOMPLETE step — never
   * from conversation memory; completed steps never re-executed.
   * Returns the step to execute now, or null when the flow is finished.
   */
  nextStep(state: DeliveryState): DeliveryStep | null {
    for (const step of ALL_STEPS) {
      if (state.completed_steps.includes(step)) continue;
      if (this.isRfConditionalSkipped(state, step)) continue;
      if (this.isSkippedBranchStep(step)) continue;
      return step;
    }
    return null;
  }

  /** Mark a step done (with proof assumed by the caller). [DL1-4] */
  completeStep(state: DeliveryState, step: DeliveryStep): DeliveryState {
    if (!state.completed_steps.includes(step)) {
      state.completed_steps.push(step);
    }
    if (state.current_step === step) state.current_step = null;
    const next = this.nextStep(state);
    state.first_incomplete = next;
    state.current_step = next;
    this.save(state);
    return state;
  }

  /**
   * CR-XX outcome drives conditional RF-XX ([DL1-1] explicit exception):
   * a clean CR (no change requests) marks RF-XX skipped.
   */
  recordCrOutcome(state: DeliveryState, branch: string, clean: boolean): DeliveryState {
    state.rf_skipped[`RF-${branch}`] = clean;
    this.save(state);
    return state;
  }

  isRfConditionalSkipped(state: DeliveryState, step: DeliveryStep): boolean {
    const m = /^RF-(BE|DB|API|FE|MD|DC)$/.exec(step);
    if (!m) return false;
    return state.rf_skipped[step] === true;
  }

  private isSkippedBranchStep(step: DeliveryStep): boolean {
    // Any scoped step of a non-impacted branch is explicitly skipped.
    // Matches: branch impl steps (BE/DB/...), CR-XX, RF-XX, SC-XX, XX-TS.
    const scoped = /^(CR|RF|SC)-(BE|DB|API|FE|MD|DC)$/.exec(step);
    if (scoped) return this.isBranchSkipped(scoped[2]);
    const tsMatch = /^(BE|DB|API|FE|MD|DC)-TS$/.exec(step);
    if (tsMatch) return this.isBranchSkipped(tsMatch[1]);
    const implMatch = /^(BE|DB|API|FE|MD|DC)$/.exec(step);
    if (implMatch) return this.isBranchSkipped(implMatch[1]);
    return false;
  }

  /** Register a blocking BUG — stops the current step and the flow. [DL1-5] */
  addBlockingBug(state: DeliveryState, bugId: string): DeliveryState {
    if (!state.blocking_bugs.includes(bugId)) {
      state.blocking_bugs.push(bugId);
    }
    this.save(state);
    return state;
  }

  resolveBlockingBug(state: DeliveryState, bugId: string): DeliveryState {
    state.blocking_bugs = state.blocking_bugs.filter((b) => b !== bugId);
    this.save(state);
    return state;
  }

  /**
   * VR is reachable ONLY when all required steps BEFORE VR are complete
   * (per impact matrix) AND no blocking BUG remains. [DL1-6]
   */
  canVerify(state: DeliveryState): boolean {
    if (state.blocking_bugs.length > 0) return false;
    for (const step of ALL_STEPS) {
      if (step === "VR") continue; // VR itself is what this gates
      if (this.isRfConditionalSkipped(state, step)) continue;
      if (this.isSkippedBranchStep(step)) continue;
      if (!state.completed_steps.includes(step)) return false;
    }
    return true;
  }

  private statePath(run_id: string): string {
    return path.join(this.storeDir, "delivery", run_id, "state.json");
  }
}
