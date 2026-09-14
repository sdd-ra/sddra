import fs from "fs";
import os from "os";
import path from "path";
import { DeliveryRunner, DeliveryState, FLOW_VERSION } from "../delivery-runner";

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
  console.log("=== Delivery Runner Tests (v2) ===\n");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-dl-"));
  const runner = new DeliveryRunner(tmpDir);
  const state = runner.load("RUN-A");

  console.log("Flow order ([DL1-1]):");
  const first = runner.nextStep(state);
  assert(first === "BC", `first step is BC: ${first}`);
  assert(state.flow_version === FLOW_VERSION, `fresh state carries flow_version ${FLOW_VERSION}`);

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

  console.log("\nv2 ordering: SC-XX before XX-TS ([SK6]):");
  const v2 = runner.load("RUN-SC");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    runner.completeStep(v2, step);
  }
  for (const b of ["BE", "DB", "API", "FE", "MD", "DC"] as const) {
    runner.completeStep(v2, b as never);
    runner.completeStep(v2, `CR-${b}` as never);
    runner.recordCrOutcome(v2, b, true); // clean CR => RF skipped
    runner.completeStep(v2, `RF-${b}` as never); // registered as skipped; completeStep no-ops if resolvable
  }
  const scFirst = runner.nextStep(v2);
  assert(scFirst === "SC-BE", `after branch impl + CR (+RF skipped) comes SC-BE, not BE-TS: ${scFirst}`);
  runner.completeStep(v2, "SC-BE");
  const tsAfter = runner.nextStep(v2);
  assert(tsAfter === "SC-DB", `SC-DB next (SC row before TS row): ${tsAfter}`);

  console.log("\nBE-TS unreachable while SC-BE incomplete:");
  const beOnly = new DeliveryRunner(tmpDir, ["BE"]);
  const partial = beOnly.load("RUN-SC2");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD", "BE", "CR-BE"] as const) {
    beOnly.completeStep(partial, step as never);
  }
  beOnly.recordCrOutcome(partial, "BE", true); // RF-BE skipped
  const midSc = beOnly.nextStep(partial);
  assert(midSc === "SC-BE", `SC-BE must resolve before BE-TS: ${midSc}`);

  console.log("\nFTS gates AN ([DL1-8]):");
  const fts = runner.load("RUN-FTS");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    runner.completeStep(fts, step);
  }
  for (const b of ["BE", "DB", "API", "FE", "MD", "DC"] as const) {
    runner.completeStep(fts, b as never);
    runner.completeStep(fts, `CR-${b}` as never);
    runner.recordCrOutcome(fts, b, true);
    runner.completeStep(fts, `SC-${b}` as never);
    runner.completeStep(fts, `${b}-TS` as never);
  }
  const beforeFts = runner.nextStep(fts);
  assert(beforeFts === "FTS", `all branch steps done -> FTS (not AN): ${beforeFts}`);
  assert(!runner.canVerify(fts), "VR blocked while FTS incomplete");
  runner.completeStep(fts, "FTS");
  const afterFts = runner.nextStep(fts);
  assert(afterFts === "AN", `after FTS comes AN: ${afterFts}`);

  console.log("\nFTS blocked until every ACTIVE branch XX-TS done:");
  const ftsPartial = new DeliveryRunner(tmpDir, ["BE", "DB"]);
  const fp = ftsPartial.load("RUN-FTS2");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    ftsPartial.completeStep(fp, step);
  }
  for (const b of ["BE", "DB"] as const) {
    ftsPartial.completeStep(fp, b as never);
    ftsPartial.completeStep(fp, `CR-${b}` as never);
    ftsPartial.recordCrOutcome(fp, b, true);
    ftsPartial.completeStep(fp, `SC-${b}` as never);
  }
  ftsPartial.completeStep(fp, "DB-TS"); // BE-TS still incomplete
  const ftsGate = ftsPartial.nextStep(fp);
  assert(ftsGate === "BE-TS", `FTS waits for remaining BE-TS: ${ftsGate}`);

  console.log("\nVR gating ([DL1-6]):");
  const full = runner.load("RUN-V");
  for (const step of ["BC", "BR", "BD", "DS", "TK", "BDD"] as const) {
    runner.completeStep(full, step);
  }
  for (const b of ["BE", "DB", "API", "FE", "MD", "DC"] as const) {
    runner.completeStep(full, b as never);
    runner.completeStep(full, `CR-${b}` as never);
    runner.recordCrOutcome(full, b, true);
    runner.completeStep(full, `SC-${b}` as never);
    runner.completeStep(full, `${b}-TS` as never);
  }
  runner.completeStep(full, "FTS");
  const beforeAn = runner.nextStep(full);
  assert(beforeAn === "AN", `scoped steps + FTS done -> AN: ${beforeAn}`);
  assert(!runner.canVerify(full), "VR blocked while AN incomplete");
  runner.completeStep(full, "AN");
  assert(runner.canVerify(full), "all required steps done + no bugs => VR allowed");

  console.log("\nComplete flow finish:");
  const last = runner.nextStep(full);
  runner.completeStep(full, "VR");
  const afterVr = runner.nextStep(full);
  assert(afterVr === null, `flow returns null after VR: ${afterVr}`);

  console.log("\nv1 state deprecation ([DL1-7]):");
  // Hand-craft a v1 state file (no flow_version) and load it.
  const v1Dir = path.join(tmpDir, "delivery", "RUN-V1");
  fs.mkdirSync(v1Dir, { recursive: true });
  const v1State = {
    run_id: "RUN-V1",
    current_step: "BE-TS",
    completed_steps: ["BC", "BR", "BD", "DS", "TK", "BDD", "BE", "CR-BE", "RF-BE"],
    first_incomplete: "BE-TS",
    branch_states: { BE: "in_progress" },
    rf_skipped: {},
    blocking_bugs: [],
    last_checkpoint: null,
    // flow_version intentionally absent => v1
  };
  fs.writeFileSync(path.join(v1Dir, "state.json"), JSON.stringify(v1State, null, 2), "utf-8");
  const deprecated = runner.load("RUN-V1");
  assert(deprecated.flow_version === FLOW_VERSION, "deprecated v1 run re-initialized at v2");
  assert(deprecated.completed_steps.length === 0, "v1 progress NOT resumed (fresh init)");
  assert(deprecated.deprecated_from === "RUN-V1", "deprecation provenance recorded");
  assert(deprecated.first_incomplete === "BC", "re-initialized run restarts at BC");

  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
