import { ProvenanceClient } from "../provenance-client";

const baseUrl = "http://127.0.0.1:9999";

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
  console.log("=== Provenance Client Tests ===\n");

  const client = new ProvenanceClient({ serviceUrl: baseUrl, timeoutMs: 200 });

  console.log("Testing health endpoint (offline — fail-open):");
  const health = await client.health();
  assert(health.available === false, `Health reports unavailable: ${health.available}`);
  assert((health as { error?: string }).error !== undefined, `Health includes error`);

  console.log("\nTesting capabilities endpoint (offline — fail-open):");
  const capabilities = await client.capabilities();
  assert(capabilities.available === false, `Capabilities reports unavailable: ${capabilities.available}`);
  assert((capabilities as { error?: string }).error !== undefined, `Capabilities includes error`);

  console.log("\nTesting inspect endpoint (offline — fail-open):");
  const inspectResult = await client.inspect("notes.md", "Hello world", false);
  assert(inspectResult.available === false, `Inspect reports unavailable: ${inspectResult.available}`);
  assert(inspectResult.suspicious === false, `Inspect reports not suspicious: ${inspectResult.suspicious}`);
  assert(inspectResult.report.length === 0, `Inspect returns empty report: ${inspectResult.report.length}`);

  console.log("\nTesting detect endpoint (offline — fail-open):");
  const detectResult = await client.detect("notes.txt", "Hello world");
  assert(detectResult.available === false, `Detect reports unavailable: ${detectResult.available}`);
  assert(detectResult.suspicious === false, `Detect reports not suspicious: ${detectResult.suspicious}`);

  console.log("\nTesting clean endpoint (offline — fail-open):");
  const cleanResult = await client.clean("notes.md", "Hello world", {});
  assert(cleanResult.available === false, `Clean reports unavailable: ${cleanResult.available}`);
  assert(cleanResult.suspicious === false, `Clean reports not suspicious: ${cleanResult.suspicious}`);

  console.log("\nTesting base64 encoding (content preserved):");
  const encoded = Buffer.from("Hello\u200bWorld", "utf-8").toString("base64");
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  assert(decoded === "Hello\u200bWorld", `Base64 round-trip preserves content: ${decoded}`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
