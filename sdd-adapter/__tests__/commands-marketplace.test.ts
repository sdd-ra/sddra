import path from "path";
import fs from "fs";
import os from "os";
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

async function main(): Promise<void> {
  console.log("=== Marketplace Command Tests ===\n");

  console.log("Testing /sdd-marketplace list:");
  const listResult = await runner.run("/sdd-marketplace", ["list"]);
  assert(listResult.command === "/sdd-marketplace", `Command name correct: ${listResult.command}`);
  assert(listResult.exitCode === 0, `Exit code 0: ${listResult.exitCode}`);
  assert(listResult.output.includes("MARKETPLACE REGISTRY"), `Output includes header`);
  assert(listResult.output.includes("artemrudenko-skill-governance-toolkit"), `Registry source listed`);
  assert(listResult.output.includes("BLOCKED SOURCES"), `Blocked sources section present`);
  assert(listResult.output.includes("nvidia-skills"), `NVIDIA blocked entry shown`);

  console.log("\nTesting /sdd-marketplace sync (unknown source):");
  const syncUnknown = await runner.run("/sdd-marketplace", ["sync", "does-not-exist"]);
  assert(syncUnknown.exitCode === 2, `Unknown source exits 2: ${syncUnknown.exitCode}`);
  assert(syncUnknown.output.includes("Unknown source"), `Unknown source message`);

  console.log("\nTesting /sdd-marketplace sync (backup/restore registry):");
  const registryPath = path.join(projectRoot, ".sdd", "marketplace", "registry.json");
  const registryWritable = ((): boolean => {
    // In the read-only Docker sandbox the baked-in registry cannot be
    // written; skip the mutation test there (SANDBOX_RO=1 is set in compose).
    if (process.env.SANDBOX_RO === "1") return false;
    try {
      fs.accessSync(registryPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  })();
  if (registryWritable) {
    const backup = fs.readFileSync(registryPath, "utf-8");
    const syncResult = await runner.run("/sdd-marketplace", ["sync", "vercel-labs-skills"]);
    assert(syncResult.exitCode === 0, `Sync exits 0: ${syncResult.exitCode}`);
    assert(syncResult.output.includes("Synced vercel-labs-skills"), `Sync confirmation`);
    const updated = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    const source = updated.sources.find((s: { id: string }) => s.id === "vercel-labs-skills");
    assert(source.lastSync !== null, `lastSync updated in registry`);
    fs.writeFileSync(registryPath, backup, "utf-8");
  } else {
    console.log("  SKIP: registry is read-only in this environment (sandbox)");
  }

  console.log("\nTesting /sdd-marketplace import (usage):");
  const importUsage = await runner.run("/sdd-marketplace", ["import"]);
  assert(importUsage.exitCode === 0, `Usage exits 0: ${importUsage.exitCode}`);
  assert(importUsage.output.includes("Usage:"), `Usage hint shown`);

  console.log("\nTesting /sdd-marketplace import (unknown source):");
  const importUnknown = await runner.run("/sdd-marketplace", ["import", "nope", "some-skill"]);
  assert(importUnknown.exitCode === 2, `Unknown import source exits 2: ${importUnknown.exitCode}`);

  console.log("\nTesting /sdd-marketplace import (blocked source):");
  const importBlocked = await runner.run("/sdd-marketplace", ["import", "nvidia-skills", "some-skill"]);
  assert(importBlocked.exitCode === 2, `Blocked source exits 2: ${importBlocked.exitCode}`);
  assert(importBlocked.output.includes("blocked list"), `Blocked reason shown`);

  console.log("\nTesting /sdd-marketplace audit:");
  const auditResult = await runner.run("/sdd-marketplace", ["audit"]);
  assert(auditResult.exitCode === 0 || auditResult.exitCode === 2, `Audit completes: ${auditResult.exitCode}`);
  assert(auditResult.output.includes("MARKETPLACE AUDIT"), `Audit header present`);
  assert(auditResult.output.includes("Skills Audited:"), `Audit count present`);
  assert(auditResult.output.includes("SHIP") || auditResult.output.includes("FIX") || auditResult.output.includes("BLOCK"), `Verdict counts present`);

  console.log("\nTesting unknown subcommand:");
  const unknownSub = await runner.run("/sdd-marketplace", ["explode"]);
  assert(unknownSub.exitCode === 0, `Unknown subcommand exits 0: ${unknownSub.exitCode}`);
  assert(unknownSub.output.includes("Unknown subcommand"), `Unknown subcommand message`);

  console.log("\nIsolation check: importer in temp workspace:");
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-mkt-"));
  try {
    const tmpRunner = new CommandRunner(".sdd", tmpRoot);
    const tmpResult = await tmpRunner.run("/sdd-marketplace", ["list"]);
    assert(tmpResult.output.includes("not found"), `Missing registry handled gracefully`);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) {
    process.exit(1);
  }
}

main();
