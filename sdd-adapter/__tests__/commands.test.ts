import path from "path";
import { CommandRunner } from "../commands";

const projectRoot = path.resolve(__dirname, "..", "..");
const runner = new CommandRunner(".sdd", projectRoot);

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

console.log("=== Command Runner Tests ===\n");

console.log("Testing /sdd-skills:");
const skillsResult = runner.run("/sdd-skills");
assert(skillsResult.command === "/sdd-skills", `Command name correct: ${skillsResult.command}`);
assert(skillsResult.exitCode === 0, `Exit code is 0: ${skillsResult.exitCode}`);
assert(skillsResult.output.includes("SKILL CATALOG"), `Output includes SKILL CATALOG`);
assert(skillsResult.output.includes("Total Skills:"), `Output includes Total Skills count`);

console.log("\nTesting /sdd-scan with missing target:");
const scanNoTarget = runner.run("/sdd-scan");
assert(scanNoTarget.exitCode === 0, `Exit code is 0 for missing target: ${scanNoTarget.exitCode}`);
assert(scanNoTarget.output.includes("Usage:"), `Output includes usage hint`);

console.log("\nTesting /sdd-dependencies:");
const depsResult = runner.run("/sdd-dependencies");
assert(depsResult.command === "/sdd-dependencies", `Command name correct: ${depsResult.command}`);
assert(depsResult.output.includes("DEPENDENCY GRAPH"), `Output includes DEPENDENCY GRAPH`);

console.log("\nTesting /sdd-assumptions:");
const assumptionsResult = runner.run("/sdd-assumptions");
assert(assumptionsResult.command === "/sdd-assumptions", `Command name correct: ${assumptionsResult.command}`);
assert(assumptionsResult.output.includes("ASSUMPTIONS"), `Output includes ASSUMPTIONS`);

console.log("\nTesting /sdd-intents:");
const intentsResult = runner.run("/sdd-intents");
assert(intentsResult.command === "/sdd-intents", `Command name correct: ${intentsResult.command}`);
assert(intentsResult.output.includes("INTENT PIPELINE"), `Output includes INTENT PIPELINE`);

console.log("\nTesting unknown command fallback:");
const unknownResult = runner.run("/sdd-unknown");
assert(unknownResult.exitCode === 0, `Unknown command returns exit code 0: ${unknownResult.exitCode}`);
assert(unknownResult.output.includes("not implemented"), `Output mentions not implemented`);

console.log("\n=== Results ===");
console.log(`Passed: ${passCount}, Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
