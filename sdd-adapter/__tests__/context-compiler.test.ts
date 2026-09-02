import { ContextCompiler } from "../context-compiler";

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

async function run() {
  console.log("\n=== ContextCompiler Tests ===");

  const compiler = new ContextCompiler();
  const pack = await compiler.compile({ intent: "implement refund payment", risk: "MEDIUM" });
  assert(pack.manifest !== undefined, "returns ContextPack with manifest");
  assert(pack.manifest.taskId === "unknown", "sets taskId to unknown when not provided");
  assert(pack.manifest.layers.length > 0, "manifest has layers");

  assert(Array.isArray(pack.manifest.contradictions), "contradictions is array");

  assert(pack.manifest.budgetUsed.refs <= pack.manifest.budget.maxRefs, "enforces context budget");

  const pack2 = await compiler.compile({
    intent: "implement refund payment",
    risk: "LOW",
    budgetOverride: { maxRefs: 5, maxTokens: 1000, maxLayers: ["L0", "L1", "L2", "L3"] as any },
  });
  assert(pack2.manifest.budget.maxRefs === 5, "respects budget override");

  console.log(`\nResults: Passed=${passCount}, Failed=${failCount}`);
  if (failCount > 0) process.exit(1);
}

run();
