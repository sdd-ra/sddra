import { ContextBudgetEnforcer } from "../context-budget";
import { ContextReference, ContextLayer } from "../types";

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

function run() {
  console.log("\n=== ContextBudgetEnforcer Tests ===");

  const low = ContextBudgetEnforcer.resolveBudget("LOW");
  assert(low.maxRefs === 20, "LOW budget maxRefs is 20");
  assert(low.maxTokens === 8000, "LOW budget maxTokens is 8000");

  const critical = ContextBudgetEnforcer.resolveBudget("CRITICAL");
  assert(critical.maxRefs === 120, "CRITICAL budget maxRefs is 120");
  assert(critical.maxTokens === 50000, "CRITICAL budget maxTokens is 50000");

  const refs: ContextReference[] = [
    { id: "r1", layer: "L3", priority: "P3", score: 0.9, included: true },
    { id: "r2", layer: "L3", priority: "P3", score: 0.5, included: true },
    { id: "r3", layer: "L3", priority: "P3", score: 0.1, included: true },
  ];
  const budget = { maxRefs: 2, maxTokens: 4000, maxLayers: ["L0", "L1", "L2", "L3"] as ContextLayer[] };
  const result = ContextBudgetEnforcer.enforce(refs, budget);
  assert(result.length <= 2, "enforce drops to budget limit");
  assert(result.map(r => r.id).includes("r1"), "enforce keeps high score refs");

  assert(ContextBudgetEnforcer.estimateTokens([{ id: "r1", layer: "L3", priority: "P3", score: 0.9, included: true }]) === 200, "estimateTokens counts refs");

  console.log(`\nResults: Passed=${passCount}, Failed=${failCount}`);
  if (failCount > 0) process.exit(1);
}

run();
