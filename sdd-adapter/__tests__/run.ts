import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const tests = [
  { name: "patterns-runtime", file: "__tests__/patterns-runtime.test.ts" },
  { name: "hook-bridge", file: "__tests__/hook-bridge.test.ts" },
  { name: "hook-bridge-provenance", file: "__tests__/hook-bridge-provenance.test.ts" },
  { name: "integration", file: "__tests__/integration.test.ts" },
  { name: "hook-binding", file: "__tests__/hook-binding.test.ts" },
  { name: "commands", file: "__tests__/commands.test.ts" },
  { name: "commands-purge", file: "__tests__/commands-purge.test.ts" },
  { name: "provenance-client", file: "__tests__/provenance-client.test.ts" },
  { name: "context-router", file: "__tests__/context-router.test.ts" },
  { name: "relevance-engine", file: "__tests__/relevance-engine.test.ts" },
  { name: "dependency-resolver", file: "__tests__/dependency-resolver.test.ts" },
  { name: "context-budget", file: "__tests__/context-budget.test.ts" },
  { name: "context-compiler", file: "__tests__/context-compiler.test.ts" },
  { name: "design-analyzer", file: "__tests__/design-analyzer.test.ts" },
  { name: "skill-auto-invoker", file: "__tests__/skill-auto-invoker.test.ts" },
  { name: "commands-design", file: "__tests__/commands-design.test.ts" },
];

let totalPass = 0;
let totalFail = 0;

function runTest(name: string, file: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n>>> Running ${name}...`);
    const child = spawn("npx", ["ts-node", "--transpile-only", file], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      const passed = code === 0;
      if (passed) {
        totalPass++;
      } else {
        totalFail++;
      }
      resolve(passed);
    });

    child.on("error", (err) => {
      console.error(`  FAIL: ${err.message}`);
      totalFail++;
      resolve(false);
    });
  });
}

async function main() {
  console.log("=== SDD Adapter Test Suite ===\n");

  const results = await Promise.all(tests.map(t => runTest(t.name, t.file)));

  console.log("\n=== Test Suite Results ===");
  console.log(`Passed: ${totalPass}, Failed: ${totalFail}`);

  if (totalFail > 0) {
    process.exit(1);
  }
}

main();
