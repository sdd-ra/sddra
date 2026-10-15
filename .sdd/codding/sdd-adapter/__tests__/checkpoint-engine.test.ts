import fs from "fs";
import os from "os";
import path from "path";
import { CheckpointEngine, ChainArm } from "../checkpoint-engine";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passCount++;
    console.log(`  PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  FAIL: ${message}`);
  }
}

async function main(): Promise<void> {
  console.log("=== Checkpoint Engine Tests ===\n");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-cp-"));
  const engine = new CheckpointEngine(tmpDir);

  console.log("Arm-boundary checkpointing:");
  const cp1 = engine.checkpoint({
    run_id: "RUN-1",
    arm: "P1",
    step: 1,
    state: { intent: "parse user request" },
    inputs: ["prompts/inbox/1.md"],
    iteration: 0,
    outcome: "SUCCESS",
  });
  assert(cp1.checkpoint_id === "CPR-RUN-1-1", `checkpoint id format: ${cp1.checkpoint_id}`);
  assert(cp1.arm === "P1", "arm recorded");
  assert(cp1.ts.includes("T"), `ISO timestamp: ${cp1.ts}`);

  const cp2 = engine.checkpoint({
    run_id: "RUN-1",
    arm: "P1",
    step: 2,
    state: { intent: "deeper" },
    iteration: 1,
    outcome: "SUCCESS",
  });
  assert(cp2.checkpoint_id !== cp1.checkpoint_id, "second checkpoint distinct id");

  console.log("\nRetention (last per arm):");
  const resumeCp = engine.resume("RUN-1");
  assert(!!resumeCp, "resume returns a checkpoint");
  assert(resumeCp?.step === 2, `resume returns last: step ${resumeCp?.step}`);

  console.log("\nNever-re-execute ([RT9]):");
  assert(engine.isComplete("RUN-1", "P1", 1), "P1 step 1 marked complete");
  assert(engine.isComplete("RUN-1", "P1", 2), "P1 step 2 marked complete");
  assert(!engine.isComplete("RUN-1", "P1", 3), "step 3 not complete");
  assert(!engine.isComplete("RUN-1", "D1", 1), "other arm not complete");

  console.log("\nCircuit breakers ([RT10][RT11]):");
  const now = Date.now();
  const arm: ChainArm = "S1";
  assert(engine.canDispatch(arm, now), "CLOSED initially - dispatch allowed");
  engine.recordFailure(arm, now);
  engine.recordFailure(arm, now + 1000);
  const after2 = engine.breakerState(arm);
  assert(after2.state === "CLOSED", `2 failures stay CLOSED: ${after2.state}`);
  engine.recordFailure(arm, now + 2000);
  const after3 = engine.breakerState(arm);
  assert(after3.state === "OPEN", `3rd failure in window opens breaker: ${after3.state}`);
  assert(!engine.canDispatch(arm, now + 3000), "OPEN arm receives NO dispatches [RT11]");
  const afterCooldown = now + 16 * 60 * 1000;
  assert(engine.canDispatch(arm, afterCooldown), "HALF_OPEN probe allowed after cooldown");
  engine.recordSuccess(arm);
  assert(engine.breakerState(arm).state === "CLOSED", "success closes breaker");

  console.log("\nRetry cap:");
  assert(CheckpointEngine.RETRY_CAP === 3, "Layer1 retry cap is 3");

  console.log("\nWindow expiry:");
  const engine2 = new CheckpointEngine();
  engine2.recordFailure("R1", Date.now() - 12 * 60 * 1000);
  engine2.recordFailure("R1", Date.now() - 11.5 * 60 * 1000);
  engine2.recordFailure("R1", Date.now() - 11.2 * 60 * 1000);
  const old = engine2.breakerState("R1");
  assert(old.state === "CLOSED", `failures outside window do not open: ${old.state} (${old.failures.length} in window)`);

  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
