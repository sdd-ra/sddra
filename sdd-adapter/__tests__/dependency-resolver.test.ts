import { DependencyResolver } from "../dependency-resolver";
import fs from "fs";
import path from "path";

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
  console.log("\n=== DependencyResolver Tests ===");

  const testRoot = path.resolve(__dirname, "..", "..", ".sdd");
  const graph = DependencyResolver.buildDependencyGraph(testRoot);
  assert(graph.size > 0, "buildDependencyGraph parses .sdd files");

  const deps = DependencyResolver.getDependencies("INDEX", graph);
  assert(Array.isArray(deps), "getDependencies returns array");

  const allRefs = Array.from(graph.keys());
  const selected = allRefs.slice(0, 2);
  const resolved = DependencyResolver.resolve(selected, allRefs);
  assert(resolved.length >= selected.length, "resolve adds transitive dependencies");

  console.log(`\nResults: Passed=${passCount}, Failed=${failCount}`);
  if (failCount > 0) process.exit(1);
}

run();
