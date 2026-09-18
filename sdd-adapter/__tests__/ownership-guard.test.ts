import { OwnershipGuard, OwnershipViolationError } from "../ownership-guard";

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
  console.log("=== OwnershipGuard Tests ===\n");
  const guard = new OwnershipGuard({ owner: "RasimAghayev", sddRoot: ".sdd" });

  console.log("canEdit - allows non-.sdd paths:");
  let r = guard.canEdit("projects/sddra/docs/readme.md", "write");
  assert(r.allowed === true, "non-.sdd path allowed");

  console.log("canEdit - allows .sdd/ writes when owner matches:");
  process.env.SDD_OWNER = "RasimAghayev";
  r = guard.canEdit(".sdd/commands/sdd-health.sdd", "write");
  assert(r.allowed === true, "owner write allowed");
  assert(r.owner === "RasimAghayev", "owner name correct");

  console.log("canEdit - blocks .sdd/ writes when owner does not match:");
  process.env.SDD_OWNER = "hacker";
  r = guard.canEdit(".sdd/commands/sdd-health.sdd", "write");
  assert(r.allowed === false, "non-owner write blocked");
  assert(r.reason !== undefined, "reason provided");
  assert(r.reason!.includes("Ownership violation"), "ownership violation in reason");
  assert(r.reason!.includes("RasimAghayev"), "owner name in reason");

  console.log("canEdit - allows when SDD_OWNER is explicitly owner:");
  process.env.SDD_OWNER = "RasimAghayev";
  r = guard.canEdit(".sdd/INDEX.sdd", "write");
  assert(r.allowed === true, "owner write allowed");

  console.log("canEdit - reports correct action and target:");
  process.env.SDD_OWNER = "RasimAghayev";
  r = guard.canEdit(".sdd/security/controls.sdd", "delete");
  assert(r.allowed === true, "owner delete allowed");
  assert(r.action === "delete", "action is delete");
  assert(r.target === ".sdd/security/controls.sdd", "target correct");

  console.log("\nenforceWrite - returns check when owner matches:");
  r = guard.enforceWrite(".sdd/projects/sddra/INDEX.sdd");
  assert(r.allowed === true, "enforce write allowed");

  console.log("enforceWrite - throws when not owner:");
  process.env.SDD_OWNER = "other-user";
  let threw = false;
  try {
    guard.enforceWrite(".sdd/INDEX.sdd");
  } catch (e) {
    threw = true;
    assert(e instanceof OwnershipViolationError, "OwnershipViolationError thrown");
  }
  assert(threw, "OwnershipViolationError was thrown");

  console.log("\ngetOwner - returns configured owner:");
  assert(guard.getOwner() === "RasimAghayev", "getOwner returns configured owner");

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
