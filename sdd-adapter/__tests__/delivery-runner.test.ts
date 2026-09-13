import fs from "fs";
import os from "os";
import path from "path";
import { DeliveryRunner, DeliveryState } from "../delivery-runner";

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
  console.log("=== Delivery Runner Tests ===\n");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-dl-"));
  const runner = new DeliveryRunner(tmpDir);
  const state = runner.load("RUN-A");

  console.log("Flow order ([DL1-1]):");
  const first = runner.nextStep(state);
  assert(first === "BC", `first step is BC: ${first}`);

  console.log("\nSequential completion + saved-state continuation ([DL1-2][DL1-3]):");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    runner.completeStep(state, step);
  }
  const nextAfterBdd = runner.nextStep(state);
  assert(nextAfterBdd === "BE", `after BDD comes parallel BE: ${nextAfterBdd}`);
  assert(state.completed_steps.includes("BC"), "completed steps tracked");

  console.log("\nPersisted state reload (resume never re-executes):");
  const reloaded = runner.load("RUN-A");
  assert(reloaded.completed_steps.length === 6, `state persisted: ${reloaded.completed_steps.length} steps`);
  assert(reloaded.first_incomplete === "BE", "first incomplete persisted");

  console.log("\nConditional RF skip ([DL1-1] exception):");
  runner.recordCrOutcome(state, "BE", true); // clean CR-BE => RF-BE skipped
  assert(runner.isRfConditionalSkipped(state, "RF-BE"), "RF-BE marked skipped after clean CR-BE");
  assert(!runner.isRfConditionalSkipped(state, "RF-DB"), "RF-DB not skipped");

  console.log("\nImpact-matrix branch skipping:");
  const feOnly = new DeliveryRunner(tmpDir, ["FE"]);
  assert(feOnly.isBranchSkipped("BE"), "BE skipped when not in impact matrix");
  assert(!feOnly.isBranchSkipped("FE"), "FE kept when in impact matrix");
  const feState = feOnly.load("RUN-FE");
  const feNext = feOnly.nextStep(feState);
  assert(feNext === "BC", "flow always starts at BC");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    feOnly.completeStep(feState, step);
  }
  const feBranch = feOnly.nextStep(feState);
  assert(feBranch === "FE", `only FE branch executes: ${feBranch}`);

  console.log("\nBlocking BUG stops the flow ([DL1-5]):");
  runner.addBlockingBug(state, "BUG-001");
  assert(state.blocking_bugs.includes("BUG-001"), "bug registered");
  assert(!runner.canVerify(state), "VR unreachable while blocking BUG open");
  runner.resolveBlockingBug(state, "BUG-001");
  assert(!state.blocking_bugs.includes("BUG-001"), "bug resolved");
  assert(runner.canVerify(state) === false, "still gated on incomplete steps");

  console.log("\nVR gating ([DL1-6]):");
  const full = runner.load("RUN-V");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    runner.completeStep(full, step);
  }
  for (const step of ["BE", "DB", "API", "FE", "MD", "DC"] as const) {
    runner.completeStep(full, step);
  }
  for (const b of ["BE", "DB", "API", "FE", "MD", "DC"] as const) {
    runner.completeStep(full, `CR-${b}` as never);
    runner.recordCrOutcome(full, b, true);
    runner.completeStep(full, `${b}-TS` as never);
    runner.completeStep(full, `SC-${b}` as never);
  }
  const beforeAn = runner.nextStep(full);
  assert(beforeAn === "AN", `scoped steps done -> AN: ${beforeAn}`);
  assert(!runner.canVerify(full), "VR blocked while AN incomplete");
  runner.completeStep(full, "AN");
  assert(runner.canVerify(full), "all required steps done + no bugs => VR allowed");

  console.log("\nComplete flow finish:");
  const last = runner.nextStep(full);
  runner.completeStep(full, "VR");
  const afterVr = runner.nextStep(full);
  assert(afterVr === null, `flow returns null after VR: ${afterVr}`);

  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
