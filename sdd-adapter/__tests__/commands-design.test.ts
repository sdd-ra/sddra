import path from "path";
import fs from "fs";
import { CommandRunner } from "../commands";

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const runner = new CommandRunner(".sdd", PROJECT_ROOT);

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  PASS: ${message}`);
  } else {
    console.error(`  FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("=== /sdd-design Command Tests ===\n");

  const tempDir = path.join(PROJECT_ROOT, "tmp", "design-cmd-test");
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, "Component.tsx"), `
    <div className="p-4">
      <button className="rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500">
        Submit
      </button>
      <img src="test.png" />
    </div>
  `);

  const discoverResult = await runner.run("/sdd-design", ["--discover"]);
  assert(discoverResult.command === "/sdd-design", "Command name correct");
  assert(discoverResult.exitCode === 0, "Discover exits 0");
  assert(discoverResult.output.includes("DESIGN SKILL DISCOVERY"), "Discover output header present");

  const evalResult = await runner.run("/sdd-design", ["--evaluate", "--directory", tempDir]);
  assert(evalResult.command === "/sdd-design", "Evaluate command name correct");
  assert(evalResult.output.includes("DESIGN EVALUATION"), "Evaluate output header present");
  assert(evalResult.output.includes("Overall Score"), "Evaluate shows overall score");
  assert(evalResult.findings !== undefined, "Evaluate returns findings");

  const reviewResult = await runner.run("/sdd-design", ["--review", tempDir]);
  assert(reviewResult.command === "/sdd-design", "Review command name correct");
  assert(reviewResult.output.includes("DESIGN EVALUATION"), "Review delegates to evaluate");

  const autoResult = await runner.run("/sdd-design", ["--auto"]);
  assert(autoResult.command === "/sdd-design", "Auto command name correct");
  assert(autoResult.exitCode === 0 || autoResult.exitCode === 2, "Auto exits 0 or 2");

  const noArgsResult = await runner.run("/sdd-design", []);
  assert(noArgsResult.command === "/sdd-design", "No-args command name correct");
  assert(noArgsResult.output.includes("DESIGN EVALUATION"), "No-args defaults to evaluate");

  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log("\n=== /sdd-design Command Tests Complete ===");
}

main();
