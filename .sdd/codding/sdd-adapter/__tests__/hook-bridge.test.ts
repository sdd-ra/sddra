import { HookBridge } from "../hook-bridge";
import { emitObsEvent } from "../spec-loader";

console.log("=== Hook Bridge Tests ===\n");

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

const bridge = new HookBridge();

async function main() {
  console.log("Testing insecure content blocks:");
  const insecureResult = await bridge.processHook({
    session_id: "test-1",
    tool_name: "Write",
    tool_input: {
      file_path: "src/app.py",
      content: "import yaml\nyaml.load(user_input)\n",
    },
    tool_use_id: "tool-1",
  });
  assert(insecureResult.decision === "BLOCK", `Decision is BLOCK: ${insecureResult.decision}`);
  assert(insecureResult.exitCode === 2, `Exit code is 2: ${insecureResult.exitCode}`);
  assert(insecureResult.findings.length > 0, `Findings reported: ${insecureResult.findings.length}`);

  console.log("\nTesting safe content passes:");
  const safeResult = await bridge.processHook({
    session_id: "test-2",
    tool_name: "Write",
    tool_input: {
      file_path: "src/app.py",
      content: "import yaml\nyaml.safe_load(config)\n",
    },
    tool_use_id: "tool-2",
  });
  assert(safeResult.decision === "PASS", `Decision is PASS: ${safeResult.decision}`);
  assert(safeResult.exitCode === 0, `Exit code is 0: ${safeResult.exitCode}`);

  console.log("\nTesting empty content passes:");
  const emptyResult = await bridge.processHook({
    session_id: "test-3",
    tool_name: "Write",
    tool_input: {
      file_path: "src/empty.txt",
      content: "",
    },
    tool_use_id: "tool-3",
  });
  assert(emptyResult.decision === "PASS", `Empty content passes: ${emptyResult.decision}`);
  assert(emptyResult.exitCode === 0, `Empty content exit code: ${emptyResult.exitCode}`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
