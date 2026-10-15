// /sdd-evolve status surface tests (Phase 136 runtime)
const path = require("path");

let passCount = 0;
let failCount = 0;

function check(name: string, cond: boolean): void {
  if (cond) {
    console.log(`  PASS: ${name}: PASS`);
    passCount++;
  } else {
    console.log(`  FAIL: ${name}: FAIL`);
    failCount++;
  }
}

async function main(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CommandRunner } = require("../commands");
  const projectRoot = process.env.SDD_TEST_PROJECT_ROOT
    ? path.resolve(process.env.SDD_TEST_PROJECT_ROOT)
    : path.resolve(__dirname, "..", "..");
  const runner = new CommandRunner(".sdd", projectRoot);

  // 1. Status command runs and reports the engine surface
  const res = await runner.run("/sdd-evolve", [], "evolve status goster");
  check("Command name correct", res.command === "/sdd-evolve");
  check("Exit code is 0", res.exitCode === 0);
  check("Output includes status header", res.output.includes("SKILL EVOLUTION STATUS"));
  check("Output includes engine reference", res.output.includes("skills/evolution.sdd"));
  check("Output includes UPDATE distinction", res.output.includes("UPDATE is not GIT PULL"));

  // 2. --report mode stays read-only
  const report = await runner.run("/sdd-evolve", ["--report"], "report only");
  check("Report mode exit 0", report.exitCode === 0);
  check("Report mode marker present", report.output.includes("Mode: report only"));

  // 3. Prompt pair appended ([R104])
  const pairFile = path.join(projectRoot, "prompts", "history", "prompt-pairs.jsonl");
  const lastLine = require("fs").readFileSync(pairFile, "utf-8").trim().split("\n").pop();
  const pair = JSON.parse(lastLine);
  check("Prompt pair recorded for /sdd-evolve", pair.command === "/sdd-evolve");
  check("Customer prompt raw text preserved", pair.customer_prompt === "report only");

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
