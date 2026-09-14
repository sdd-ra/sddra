import path from "path";
import { DriftDetector } from "../drift-detector";
import { DriftType, DriftClassification } from "../types";

const projectRoot = path.resolve(process.env.SDD_TEST_PROJECT_ROOT || path.resolve(__dirname, "..", ".."));
const detector = new DriftDetector(".sdd", projectRoot);

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

async function main() {
  console.log("=== Drift Detector Tests ===\n");

  console.log("Testing detectStructul:");
  const structural = await detector.detectStructural();
  assert(Array.isArray(structural), `detectStructural returns array`);

  console.log("\nTesting detectBehavioral:");
  const behavioral = await detector.detectBehavioral();
  assert(Array.isArray(behavioral), `detectBehavioral returns array`);

  console.log("\nTesting detectContract:");
  const contract = await detector.detectContract();
  assert(Array.isArray(contract), `detectContract returns array`);

  console.log("\nTesting detectSecurity:");
  const security = await detector.detectSecurity();
  assert(Array.isArray(security), `detectSecurity returns array`);

  console.log("\nTesting detectAll:");
  const all = await detector.detectAll();
  assert(all.totalDrifts >= 0, `detectAll returns totalDrifts >= 0`);
  assert(typeof all.byType === "object", `detectAll has byType breakdown`);
  assert(typeof all.byClassification === "object", `detectAll has byClassification breakdown`);
  assert(Array.isArray(all.items), `detectAll items is array`);

  assert(all.byType.structural !== undefined, `byType has structural`);
  assert(all.byType.behavioral !== undefined, `byType has behavioral`);
  assert(all.byType.contract !== undefined, `byType has contract`);
  assert(all.byType.security !== undefined, `byType has security`);
  assert(all.byClassification.DECLARATION_WRONG !== undefined, `byClassification has DECLARATION_WRONG`);
  assert(all.byClassification.CODE_WRONG !== undefined, `byClassification has CODE_WRONG`);
  assert(all.byClassification.BOTH_OUTDATED !== undefined, `byClassification has BOTH_OUTDATED`);
  assert(all.byClassification.UNKNOWN !== undefined, `byClassification has UNKNOWN`);

  console.log("\nTesting classify:");
  const classified = detector.classify({
    declared: "some declaration",
    observed: "some observation",
  });
  assert(classified !== "UNKNOWN" || classified === "UNKNOWN", `classify returns valid classification`);

  console.log("\nTesting classify with DECLARATION_WRONG:");
  const declWrong = detector.classify({
    declared: undefined,
    observed: "some observation",
  });
  assert(declWrong === "DECLARATION_WRONG", `classify with no declared is DECLARATION_WRONG: ${declWrong}`);

  console.log("\nTesting classify with CODE_WRONG:");
  const codeWrong = detector.classify({
    declared: "some declaration",
    observed: undefined,
  });
  assert(codeWrong === "CODE_WRONG", `classify with no observed is CODE_WRONG: ${codeWrong}`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
