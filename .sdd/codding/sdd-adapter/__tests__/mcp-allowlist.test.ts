import { McpAllowlist, ActivationRecord, sha256Hex } from "../mcp-allowlist";

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

function makeRecord(overrides: Partial<ActivationRecord> = {}): ActivationRecord {
  return {
    server_id: "dev.example.tools",
    publisher: "Example Org",
    publisher_verification: "registry",
    version: "1.4.2",
    tool_schema_hashes: [
      { tool_name: "query", sha256: sha256Hex("query-schema-v1") },
      { tool_name: "fetch", sha256: sha256Hex("fetch-schema-v1") },
    ],
    security_scan: { mcp_scan: "PASS", dlp: "PASS" },
    l_level: 1,
    sandbox: "docker:default",
    activated_at: new Date().toISOString(),
    approved_by: "human-1",
    ...overrides,
  };
}

async function main(): Promise<void> {
  console.log("=== MCP Allowlist Tests ===\n");

  const allow = new McpAllowlist();

  console.log("Registration:");
  const rec = allow.register(makeRecord());
  assert(allow.isAllowed("dev.example.tools"), "registered server is allowed [MAL-01]");
  assert(!allow.isAllowed("dev.unknown.tools"), "unregistered server NOT allowed");

  console.log("\nAppend-only ([MAL-02]):");
  try {
    allow.register(makeRecord());
    assert(false, "double registration throws");
  } catch (e) {
    assert((e as Error).message.includes("append-only"), "double registration blocked");
  }

  console.log("\nExact version pinning ([MAL-05]):");
  try {
    allow.register(makeRecord({ server_id: "dev.latest.tools", version: "latest" }));
    assert(false, "latest version throws");
  } catch (e) {
    assert((e as Error).message.includes("MAL-05"), "@latest forbidden");
  }

  console.log("\nPublisher verification ([MAL-02]):");
  try {
    allow.register(makeRecord({ server_id: "dev.unver.tools", publisher_verification: "unverified" }));
    assert(false, "unverified publisher throws");
  } catch (e) {
    assert((e as Error).message.includes("publisher"), "unverified publisher blocked");
  }

  console.log("\nmcp-scan gate ([MAL-06]):");
  try {
    allow.register(
      makeRecord({
        server_id: "dev.failed.tools",
        security_scan: { mcp_scan: "FAIL", dlp: "PENDING" },
      })
    );
    assert(false, "failed scan throws");
  } catch (e) {
    assert((e as Error).message.includes("MAL-06"), "failed scan blocked");
  }

  console.log("\nSession-start verification ([MAL-03]):");
  const ok = allow.verifySessionStart("dev.example.tools", [
    { name: "query", schema: "query-schema-v1" },
    { name: "fetch", schema: "fetch-schema-v1" },
  ]);
  assert(ok.status === "ALLOW", "matching hashes allow");

  const changed = allow.verifySessionStart("dev.example.tools", [
    { name: "query", schema: "query-schema-CHANGED" },
    { name: "fetch", schema: "fetch-schema-v1" },
  ]);
  assert(changed.status === "BLOCK", `changed schema BLOCKs: ${(changed as { reason?: string }).reason}`);

  const added = allow.verifySessionStart("dev.example.tools", [
    { name: "query", schema: "query-schema-v1" },
    { name: "fetch", schema: "fetch-schema-v1" },
    { name: "evil", schema: "new-tool" },
  ]);
  assert(added.status === "REACTIVATE", "added tool => REACTIVATE (drift)");

  const removed = allow.verifySessionStart("dev.example.tools", [
    { name: "query", schema: "query-schema-v1" },
  ]);
  assert(removed.status === "REACTIVATE", "removed tool => REACTIVATE (drift)");

  const notRegistered = allow.verifySessionStart("nope.tools", []);
  assert(notRegistered.status === "BLOCK", "unknown server BLOCKs [MAL-01]");

  console.log("\nTier mapping:");
  const tier = allow.tierOf("dev.example.tools");
  assert(tier !== null, "tier derived from record");

  console.log("\nAudit listing:");
  assert(allow.list().length === 1, "append-only list holds registered record");

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
