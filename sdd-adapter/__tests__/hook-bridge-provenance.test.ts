import { HookBridge } from "../hook-bridge";

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
  console.log("=== Hook Bridge Provenance Tests ===\n");

  console.log("Testing provenance check with no client (fail-open):");
  const bridgeNoClient = new HookBridge();
  const resultNoClient = await bridgeNoClient.processHook({
    session_id: "test-provenance-1",
    tool_name: "Write",
    tool_input: {
      file_path: "notes.md",
      content: "Hello world",
    },
    tool_use_id: "tool-1",
  });
  assert(resultNoClient.decision === "PASS", `No client passes: ${resultNoClient.decision}`);
  assert(resultNoClient.exitCode === 0, `No client exit code 0: ${resultNoClient.exitCode}`);

  console.log("\nTesting provenance check with client but service offline:");
  const { ProvenanceClient } = require("../provenance-client");
  const offlineClient = new ProvenanceClient({ serviceUrl: "http://127.0.0.1:9999", timeoutMs: 200 });
  const bridgeOffline = new HookBridge(offlineClient);
  const resultOffline = await bridgeOffline.processHook({
    session_id: "test-provenance-2",
    tool_name: "Write",
    tool_input: {
      file_path: "notes.md",
      content: "Hello world",
    },
    tool_use_id: "tool-2",
  });
  assert(resultOffline.decision === "PASS", `Offline client passes: ${resultOffline.decision}`);
  assert(resultOffline.exitCode === 0, `Offline client exit code 0: ${resultOffline.exitCode}`);

  console.log("\nTesting provenance check on binary file extension (skipped):");
  const resultBinary = await bridgeOffline.processHook({
    session_id: "test-provenance-3",
    tool_name: "Write",
    tool_input: {
      file_path: "photo.jpg",
      content: "Hello world",
    },
    tool_use_id: "tool-3",
  });
  assert(resultBinary.decision === "PASS", `Binary extension skipped: ${resultBinary.decision}`);

  console.log("\nTesting provenance check on text file extension:");
  const resultText = await bridgeOffline.processHook({
    session_id: "test-provenance-4",
    tool_name: "Write",
    tool_input: {
      file_path: "notes.md",
      content: "Hello world",
    },
    tool_use_id: "tool-4",
  });
  assert(resultText.decision === "PASS", `Text file processed: ${resultText.decision}`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
