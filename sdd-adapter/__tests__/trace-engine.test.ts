import path from "path";
import { TraceEngine } from "../trace-engine";

const projectRoot = path.resolve(__dirname, "..", "..");
const tracer = new TraceEngine(".sdd", projectRoot);

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

async function main() {
  console.log("=== Trace Engine Tests ===\n");

  console.log("Testing traceForward with unknown entity:");
  const unknownTrace = await tracer.traceForward("R999");
  assert(unknownTrace.direction === "forward", `traceForward direction is forward`);
  assert(unknownTrace.start === "R999", `traceForward start is R999`);
  assert(unknownTrace.nodes.length >= 0, `traceForward returns nodes array`);

  console.log("\nTesting traceForward with D entity:");
  const dTrace = await tracer.traceForward("D202");
  assert(dTrace.direction === "forward", `D trace direction is forward`);
  assert(dTrace.start === "D202", `D trace start is D202`);

  console.log("\nTesting traceForward with T entity:");
  const tTrace = await tracer.traceForward("T303");
  assert(tTrace.direction === "forward", `T trace direction is forward`);
  assert(tTrace.start === "T303", `T trace start is T303`);

  console.log("\nTesting traceReverse with non-existent file:");
  const reverseTrace = await tracer.traceReverse("nonexistent/file.ts");
  assert(reverseTrace.direction === "reverse", `traceReverse direction is reverse`);
  assert(reverseTrace.start.includes("nonexistent"), `traceReverse start includes file path`);

  console.log("\nTesting computeCoverage:");
  const coverage = await tracer.computeCoverage();
  assert(typeof coverage.requirements === "number", `coverage.requirements is number`);
  assert(typeof coverage.implemented === "number", `coverage.implemented is number`);
  assert(typeof coverage.tested === "number", `coverage.tested is number`);
  assert(typeof coverage.verified === "number", `coverage.verified is number`);
  assert(coverage.requirements >= 0, `requirements count >= 0`);

  console.log("\nTesting traceForward returns TraceChain:");
  const chain = await tracer.traceForward("R101");
  assert(chain.nodes !== undefined, `chain has nodes array`);
  assert(Array.isArray(chain.nodes), `chain.nodes is array`);

  console.log("\nTesting traceReverse returns TraceChain:");
  const revChain = await tracer.traceReverse("src/index.ts");
  assert(revChain.nodes !== undefined, `reverse chain has nodes array`);
  assert(Array.isArray(revChain.nodes), `reverse chain.nodes is array`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
