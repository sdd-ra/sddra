import { PatternsRuntime } from "../security/patterns-runtime";
import { CommitGate } from "../security/commit-gate";

console.log("=== Integration Tests ===\n");

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

const runtime = new PatternsRuntime();

console.log("1. Insecure code is blocked:");
const insecure = `
import yaml
yaml.load(user_input)
import pickle
pickle.loads(data)
eval(expr)
`;
const insecureResult = runtime.evaluate(runtime.scan(insecure), 2);
assert(insecureResult.decision === "BLOCK", "Insecure code blocks");
assert(insecureResult.exitCode === 2, "Block exit code is 2");
assert(insecureResult.findings.length >= 3, `Found >=3 patterns: ${insecureResult.findings.length}`);

console.log("\n2. Safe code passes:");
const safe = `
import yaml
yaml.safe_load(config)
import json
json.loads(data)
result = ast.literal_eval(expr)
`;
const safeResult = runtime.evaluate(runtime.scan(safe), 2);
assert(safeResult.decision === "PASS", "Safe code passes");
assert(safeResult.exitCode === 0, "Pass exit code is 0");

console.log("\n3. Hardcoded secret is blocked:");
const secretCode = `
API_KEY = "1234567890abcdefghij"
PASSWORD = "supersecret123456"
`;
const secretResult = runtime.evaluate(runtime.scan(secretCode), 2);
assert(secretResult.decision === "BLOCK", "Hardcoded secret blocks");
assert(secretResult.exitCode === 2, "Secret block exit code is 2");
assert(secretResult.findings.some(f => f.patternId === "PAT_hardcoded_secret"), "Identifies hardcoded secret pattern");

console.log("\n4. Shell injection is blocked:");
const shellCode = `
import subprocess
subprocess.run(cmd, shell=True)
`;
const shellResult = runtime.evaluate(runtime.scan(shellCode), 2);
assert(shellResult.decision === "BLOCK", "Shell injection blocks");
assert(shellResult.exitCode === 2, "Shell injection exit code is 2");

console.log("\n5. Medium findings warn:");
const mediumCode = `
import random
random.random()
`;
const mediumResult = runtime.evaluate(runtime.scan(mediumCode), 2);
assert(mediumResult.decision === "WARN", "Medium findings warn");
assert(mediumResult.exitCode === 0, "Warn exit code is 0 (allow with warning)");

console.log("\n=== Results ===");
console.log(`Passed: ${passCount}, Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
