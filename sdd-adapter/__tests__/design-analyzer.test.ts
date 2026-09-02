import path from "path";
import fs from "fs";
import { DesignAnalyzer } from "../design-analyzer";

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const analyzer = new DesignAnalyzer();

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  PASS: ${message}`);
  } else {
    console.error(`  FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("=== Design Analyzer Tests ===\n");

  const tempDir = path.join(PROJECT_ROOT, "tmp", "design-test");
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, "test.tsx"), `
    <div className="p-4">
      <button className="rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500">
        Submit
      </button>
      <img src="test.png" />
    </div>
  `);

  const evaluations = await analyzer.evaluate(tempDir);
  assert(evaluations.length > 0, "evaluate returns evaluations for valid path");

  const tasteEvals = evaluations.filter(e => e.category === "taste");
  assert(tasteEvals.length > 0, "taste evaluation is produced");

  const slopEval = tasteEvals[0];
  assert(slopEval.issues.some(i => i.description.includes("gradient") || i.description.includes("purple")),
    "slop detection flags generic gradient");

  const a11yEvals = evaluations.filter(e => e.category === "accessibility");
  assert(a11yEvals.length > 0, "accessibility evaluation is produced");
  assert(a11yEvals[0].issues.some(i => i.description.includes("alt")),
    "accessibility flags missing alt attributes");

  const visualEvals = evaluations.filter(e => e.category === "visual");
  assert(visualEvals.length > 0, "visual evaluation is produced");

  const uxEvals = evaluations.filter(e => e.category === "ux");
  assert(uxEvals.length > 0, "ux evaluation is produced");

  const systemEvals = evaluations.filter(e => e.category === "design-system");
  assert(systemEvals.length > 0, "design-system evaluation is produced");

  const discovery = await analyzer.discover();
  assert(Array.isArray(discovery.missing), "discover returns missing array");
  assert(Array.isArray(discovery.recommendations), "discover returns recommendations array");
  assert(discovery.recommendations.every(r => r.relevance >= 0.8),
    "all recommendations have relevance >= 80%");

  const review = await analyzer.review(tempDir);
  assert(review.length > 0, "review delegates to evaluate");

  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log("\n=== Design Analyzer Tests Complete ===");
}

main();
