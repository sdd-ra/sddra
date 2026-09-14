import fs from "fs";
import os from "os";
import path from "path";
import { CommandRunner } from "../commands";

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
  console.log("=== /sdd-health Command Tests ===\n");

  // Isolated temp workspace so repo-state does not leak in
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-health-"));
  fs.mkdirSync(path.join(tmpRoot, ".sdd", "commands"), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, ".sdd", "chains"), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, ".claude", "commands"), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, ".kilo", "command"), { recursive: true });
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "INDEX.sdd"), "# Index\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "PROJECT.sdd"), "# Project\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "commands", "INDEX.sdd"), "# Commands\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "chains", "INDEX.sdd"), "# Chains\n", "utf-8");

  console.log("Healthy baseline (3-way synced, no mojibake):");
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "commands", "sdd-demo.sdd"), "# demo\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".claude", "commands", "sdd-demo.md"), "demo\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".kilo", "command", "sdd-demo.md"), "demo\n", "utf-8");
  const runner = new CommandRunner(".sdd", tmpRoot);
  const healthy = await runner.run("/sdd-health");
  assert(healthy.command === "/sdd-health", `command name correct: ${healthy.command}`);
  assert(healthy.exitCode === 0, `healthy workspace exits 0: ${healthy.exitCode}`);
  assert(healthy.output.includes("HEALTH CHECK"), "header present");
  assert(healthy.output.includes("Command sync: 1 specs, 0 drift"), `sync line shows no drift`);

  console.log("\n3-way drift detection ([HEALTH-08]/[CMD8]):");
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "commands", "sdd-orphan.sdd"), "# orphan\n", "utf-8");
  const drift = await runner.run("/sdd-health");
  assert(drift.exitCode === 1, `missing wrappers degrade to 1: ${drift.exitCode}`);
  assert(drift.output.includes("sdd-orphan missing .claude + .kilo"), "orphan drift flagged");

  console.log("\nMojibake detection ([HEALTH-09]/[R99]):");
  fs.writeFileSync(path.join(tmpRoot, ".sdd", "commands", "sdd-bad.sdd"), "# bad \u00e2\u20ac\u201c mojibake\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".claude", "commands", "sdd-bad.md"), "bad\n", "utf-8");
  fs.writeFileSync(path.join(tmpRoot, ".kilo", "command", "sdd-bad.md"), "bad\n", "utf-8");
  const moji = await runner.run("/sdd-health");
  assert(moji.exitCode === 2 || moji.exitCode === 3, `mojibake is UNHEALTHY+: ${moji.exitCode}`);
  assert(moji.output.includes("mojibake"), "mojibake finding rendered");
  assert((moji.findings ?? []).some((f) => f.check === "mojibake"), "mojibake finding recorded");

  console.log("\nProjects purity ([HEALTH-10]/[R105]):");
  fs.mkdirSync(path.join(tmpRoot, ".sdd", "projects", "foreign-junk"), { recursive: true });
  const pure = await runner.run("/sdd-health");
  assert(pure.output.includes("foreign-junk"), "foreign projects folder flagged");
  fs.rmSync(path.join(tmpRoot, ".sdd", "projects", "foreign-junk"), { recursive: true });

  fs.rmSync(tmpRoot, { recursive: true, force: true });

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
