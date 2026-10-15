import { CommandRunner } from "../commands";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(FAIL: );
    process.exit(1);
  }
}

function main() {
  const projectRoot = ".";
  const sddRoot = ".sdd";
  const runner = new CommandRunner(sddRoot, projectRoot);

  let res = runner.run("/sdd-map", ["--prompt", "Implement refund service"], "Implement refund service", "Implement refund service");
  assert(res.exitCode === 0, "exit code 0");
  assert(res.output.includes("PROMPT-TASK MAP"), "has header");
  assert(res.output.includes("C1"), "maps to C1");
  assert(res.output.includes("T-001"), "has T-001");
  assert(res.output.includes("[DB]"), "has DB subtask");
  assert(res.output.includes("[BE]"), "has BE subtask");
  assert(res.output.includes("[API]"), "has API subtask");
  assert(res.output.includes("[FE]"), "has FE subtask");
  assert(res.output.includes("[MD]"), "has MD subtask");
  assert(res.output.includes("[DC]"), "has DC subtask");
  assert(res.output.includes("[Test]"), "has Test subtask");

  res = runner.run("/sdd-map", ["--prompt", "Design API docs"], "Design API docs", "Design API docs");
  assert(res.exitCode === 0, "exit code 0");
  assert(res.output.includes("D1"), "maps to D1");

  res = runner.run("/sdd-map", ["--prompt", "Deploy v2 to production"], "Deploy v2 to production", "Deploy v2 to production");
  assert(res.exitCode === 0, "exit code 0");
  assert(res.output.includes("DEP1"), "maps to DEP1");

  res = runner.run("/sdd-map", ["--prompt", "Fix typo"], "Fix typo", "Fix typo");
  assert(res.exitCode === 0, "exit code 0");
  assert(res.output.includes("UNKNOWN"), "maps to UNKNOWN");

  res = runner.run("/sdd-map", ["--prompt", "Analyze data", "--json"], "Analyze data", "Analyze data");
  assert(res.exitCode === 0, "exit code 0");
  try {
    JSON.parse(res.output);
    assert(true, "valid json");
  } catch (e) {
    assert(false, "invalid json");
  }

  console.log("All tests passed");
}

main();
