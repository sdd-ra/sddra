import path from "path";
import { ScopeGuard, ScopeViolationError } from "../scope-guard";

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
  console.log("=== ScopeGuard Tests ===\n");
  const guard = new ScopeGuard({ projectName: "sddra", sddRoot: ".sdd", projectRoot: "." });

  console.log("validateWrite - allows writes within projects/sddra/:");
  let r = guard.validateWrite("projects/sddra/docs/readme.md");
  assert(r.allowed === true, "in-scope write allowed");

  console.log("validateWrite - allows writes at projects/sddra/ root:");
  r = guard.validateWrite("projects/sddra");
  assert(r.allowed === true, "sddra root allowed");

  console.log("validateWrite - blocks writes to .sdd/:");
  r = guard.validateWrite(".sdd/commands/sdd-health.sdd");
  assert(r.allowed === false, "sdd/ write blocked");
  assert(r.reason !== undefined, "reason provided");
  assert(r.reason!.includes("Scope violation"), "scope violation in reason");
  assert(r.reason!.includes("projects/sddra/"), "project scope in reason");

  console.log("validateWrite - blocks writes at repo root (outside project scope):");
  r = guard.validateWrite("prompts/history/prompt-pairs.jsonl");
  assert(r.allowed === false, "root write blocked");
  assert(r.reason !== undefined, "reason provided");

  console.log("validateWrite - blocks writes to .specdd/ at repo root:");
  r = guard.validateWrite(".specdd/flow-index.md");
  assert(r.allowed === false, "specdd write blocked");

  console.log("validateWrite - allows writes for different project names:");
  const g = new ScopeGuard({ projectName: "my-app", sddRoot: ".sdd", projectRoot: "." });
  r = g.validateWrite("projects/my-app/docs/readme.md");
  assert(r.allowed === true, "my-app scope allowed");

  console.log("validateWrite - blocks foreign project directories:");
  r = guard.validateWrite("projects/other-project/data.txt");
  assert(r.allowed === false, "foreign project blocked");
  assert(r.reason !== undefined, "reason provided");
  assert(r.reason!.includes("projects/sddra/"), "correct project scope in reason");

  console.log("\nenforceWrite - returns check when target is in scope:");
  r = guard.enforceWrite("projects/sddra/tasks/TASK-001.sdd");
  assert(r.allowed === true, "enforce write allowed");

  console.log("enforceWrite - throws when target is out of scope:");
  let threw = false;
  try {
    guard.enforceWrite(".sdd/INDEX.sdd");
  } catch (e) {
    threw = true;
    assert(e instanceof ScopeViolationError, "ScopeViolationError thrown");
  }
  assert(threw, "ScopeViolationError was thrown");

  console.log("\ngetProjectScope - returns project scope path:");
  assert(guard.getProjectScope() === `projects${path.sep}sddra` || guard.getProjectScope() === "projects/sddra", "project scope correct");

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
