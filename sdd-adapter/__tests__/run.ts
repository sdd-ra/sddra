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
  { name: "skill-validator", file: "__tests__/skill-validator.test.ts" },
  { name: "skill-importer", file: "__tests__/skill-importer.test.ts" },
  { name: "commands-marketplace", file: "__tests__/commands-marketplace.test.ts" },
  { name: "commands-health", file: "__tests__/commands-health.test.ts" },
  { name: "checkpoint-engine", file: "__tests__/checkpoint-engine.test.ts" },
  { name: "mcp-allowlist", file: "__tests__/mcp-allowlist.test.ts" },
  { name: "context-emitter", file: "__tests__/context-emitter.test.ts" },
  { name: "integration-routing", file: "__tests__/integration-routing.test.ts" },
  { name: "delivery-runner", file: "__tests__/delivery-runner.test.ts" },
];

let totalPass = 0;
let totalFail = 0;

function runTest(name: string, file: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n>>> Running ${name}...`);
    // Direct ts-node binary — works offline in the Docker sandbox
    // (npx would need registry DNS; SANDBOX_RO marks container runs).
    const tsNodeBin = path.join(__dirname, "..", "node_modules", "ts-node", "dist", "bin.js");
    const child = process.platform === "win32" && process.env.SANDBOX_RO !== "1"
      ? spawn("npx", ["ts-node", "--transpile-only", file], {
          cwd: path.join(__dirname, ".."),
          stdio: "inherit",
          shell: true,
        })
      : spawn(process.execPath, [tsNodeBin, "--transpile-only", file], {
          cwd: path.join(__dirname, ".."),
          stdio: "inherit",
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

  // Sequential — parallel spawns race on shared tmp/ paths
  // (e.g. design tests writing the same cwd/tmp/design-test dir).
  for (const t of tests) {
    await runTest(t.name, t.file);
  }

  console.log("\n=== Test Suite Results ===");
  console.log(`Passed: ${totalPass}, Failed: ${totalFail}`);

  if (totalFail > 0) {
    process.exit(1);
  }
}

main();
