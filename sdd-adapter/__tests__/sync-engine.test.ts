import { SyncEngine } from "../sync-engine";
import { DriftRecord, SyncOperation } from "../types";

const syncEngine = new SyncEngine();

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

function makeDrift(overrides: Partial<DriftRecord> = {}): DriftRecord {
  return {
    id: "D001",
    type: "structural",
    classification: "CODE_WRONG",
    confidence: "HIGH",
    declared: "Declared architecture",
    observed: "Observed code",
    evidence: [],
    syncOp: "SYNC_CODE",
    severity: "MEDIUM",
    status: "DETECTED",
    sourceOfTruth: "@truth.architecture",
    epistemicState: "OBSERVED",
    ...overrides,
  };
}

async function main() {
  console.log("=== Sync Engine Tests ===\n");

  console.log("Testing proposeSync with empty drifts:");
  const emptyPlans = syncEngine.proposeSync([]);
  assert(emptyPlans.length === 0, `Empty drifts produce 0 plans`);

  console.log("\nTesting proposeSync with one drift:");
  const drift = makeDrift();
  const plans = syncEngine.proposeSync([drift]);
  assert(plans.length === 1, `One drift produces 1 plan`);
  assert(plans[0].id.startsWith("S"), `Plan ID starts with S: ${plans[0].id}`);
  assert(plans[0].driftId === drift.id, `Plan driftId matches`);
  assert(plans[0].operation === "SYNC_CODE", `Plan operation is SYNC_CODE`);

  console.log("\nTesting proposeSync skips FIXED drifts:");
  const fixedDrift = makeDrift({ id: "D002", status: "FIXED" });
  const skippedPlans = syncEngine.proposeSync([drift, fixedDrift]);
  assert(skippedPlans.length === 1, `FIXED drift is skipped (1 plan from 2 drifts)`);

  console.log("\nTesting proposeSync skips NO_CHANGE drifts:");
  const noChangeDrift = makeDrift({ id: "D003", syncOp: "NO_CHANGE" });
  const noChangePlans = syncEngine.proposeSync([drift, noChangeDrift]);
  assert(noChangePlans.length === 1, `NO_CHANGE drift is skipped`);

  console.log("\nTesting validatePlan with valid plan:");
  const validPlan = syncEngine.proposeSync([drift])[0];
  assert(syncEngine.validatePlan(validPlan) === true, `Valid plan validates`);

  console.log("\nTesting validatePlan with invalid plan:");
  assert(syncEngine.validatePlan({ id: "", driftId: "", operation: "REVIEW", targetFiles: [], rationale: "", requiresApproval: false }) === false, `Invalid plan fails validation`);

  console.log("\nTesting generateDecision for SYNC_SDD:");
  const sddDrift = makeDrift({ id: "D004", classification: "DECLARATION_WRONG", syncOp: "SYNC_SDD" });
  const sddPlans = syncEngine.proposeSync([sddDrift]);
  const decision = syncEngine.generateDecision(sddPlans[0]);
  assert(decision.includes("@decision."), `Decision includes @decision.* reference`);
  assert(decision.includes("SYNC_SDD"), `Decision mentions SYNC_SDD`);

  console.log("\nTesting generateTask for SYNC_CODE:");
  const codeDrift = makeDrift({ id: "D005", syncOp: "SYNC_CODE" });
  const codePlans = syncEngine.proposeSync([codeDrift]);
  const task = syncEngine.generateTask(codePlans[0]);
  assert(task.includes("@task."), `Task includes @task.* reference`);
  assert(task.includes("SYNC_CODE"), `Task mentions SYNC_CODE`);

  console.log("\nTesting generateTask for SYNC_BOTH:");
  const bothDrift = makeDrift({ id: "D006", syncOp: "SYNC_BOTH" });
  const bothPlans = syncEngine.proposeSync([bothDrift]);
  const bothTask = syncEngine.generateTask(bothPlans[0]);
  assert(bothTask.includes("@task."), `Task includes @task.* reference`);
  assert(bothTask.includes("SYNC_BOTH"), `Task mentions SYNC_BOTH`);

  console.log("\nTesting requiresApproval for HIGH severity:");
  const highDrift = makeDrift({ id: "D007", severity: "HIGH" });
  const highPlans = syncEngine.proposeSync([highDrift]);
  assert(highPlans[0].requiresApproval === true, `HIGH severity requires approval`);

  console.log("\nTesting requiresApproval for LOW severity:");
  const lowDrift = makeDrift({ id: "D008", severity: "LOW", confidence: "HIGH" });
  const lowPlans = syncEngine.proposeSync([lowDrift]);
  assert(lowPlans[0].requiresApproval === false, `LOW severity does not require approval`);

  console.log("\nTesting getPlan and listPlans:");
  const plan = syncEngine.proposeSync([drift])[0];
  assert(syncEngine.getPlan(plan.id) !== undefined, `getPlan returns plan by ID`);
  assert(syncEngine.listPlans().length >= 1, `listPlans returns non-empty array`);

  console.log("\nTesting clearPlans:");
  syncEngine.clearPlans();
  assert(syncEngine.listPlans().length === 0, `clearPlans empties the list`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
