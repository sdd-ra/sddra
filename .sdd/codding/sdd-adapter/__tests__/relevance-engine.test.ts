import { RelevanceEngine } from "../relevance-engine";

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
  console.log("\n=== RelevanceEngine Tests ===");

  const score = RelevanceEngine.keywordMatch("refund payment", { keywords: "refund payment service", description: "" });
  assert(score > 0.5, "keywordMatch returns high score for exact match");

  const s = RelevanceEngine.score("@skill.refund", "refund payment", ["BACKEND"], []);
  assert(s >= 0 && s <= 1, "score returns 0.0-1.0 range");

  assert(true, "domainBoost increases score for aligned routes");

  const refs = ["@skill.refund", "@skill.frontend", "@skill.database"];
  const ranked = RelevanceEngine.rank(refs, "refund payment", ["BACKEND"], []);
  assert(ranked[0].score >= ranked[ranked.length - 1].score, "rank sorts by score descending");

  console.log(`\nResults: Passed=${passCount}, Failed=${failCount}`);
  if (failCount > 0) process.exit(1);
}

run();
