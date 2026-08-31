import { PatternsRuntime } from "../security/patterns-runtime";
import { HookBridge } from "../hook-bridge";

const runtime = new PatternsRuntime();
const bridge = new HookBridge();

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

console.log("=== Hook Binding Simulation Tests ===\n");

console.log("1. PreToolUse[Write] with insecure Python blocks:");
const pyResult = bridge.processHook({
  session_id: "sim-1",
  tool_name: "Write",
  tool_input: {
    file_path: "src/processor.py",
    content: "import yaml\nyaml.load(user_input)\n",
  },
  tool_use_id: "tool-1",
});
assert(pyResult.exitCode === 2, `Blocks insecure Python: ${pyResult.exitCode}`);
assert(pyResult.findings.some(f => f.patternId === "PAT.yaml_load"), "Identifies yaml.load pattern");

console.log("\n2. PreToolUse[Write] with insecure JS blocks:");
const jsResult = bridge.processHook({
  session_id: "sim-2",
  tool_name: "Write",
  tool_input: {
    file_path: "src/app.js",
    content: "element.innerHTML = userContent;\n",
  },
  tool_use_id: "tool-2",
});
assert(jsResult.exitCode === 2, `Blocks insecure JS: ${jsResult.exitCode}`);
assert(jsResult.findings.some(f => f.patternId === "PAT.innerHTML"), "Identifies innerHTML pattern");

console.log("\n3. PreToolUse[Write] with safe code passes:");
const safeResult = bridge.processHook({
  session_id: "sim-3",
  tool_name: "Write",
  tool_input: {
    file_path: "src/app.js",
    content: "element.textContent = userContent;\nimport yaml\nyaml.safe_load(config)\n",
  },
  tool_use_id: "tool-3",
});
assert(safeResult.exitCode === 0, `Safe code passes: ${safeResult.exitCode}`);

console.log("\n4. Edit tool triggers same enforcement:");
const editResult = bridge.processHook({
  session_id: "sim-4",
  tool_name: "Edit",
  tool_input: {
    file_path: "src/config.py",
    content: "import pickle\npickle.loads(data)\n",
  },
  tool_use_id: "tool-4",
});
assert(editResult.exitCode === 2, `Edit tool blocks: ${editResult.exitCode}`);

console.log("\n=== Results ===");
console.log(`Passed: ${passCount}, Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
