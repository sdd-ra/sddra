import path from "path";
import { CommandRunner } from "../commands";

const projectRoot = path.resolve(process.env.SDD_TEST_PROJECT_ROOT || path.resolve(__dirname, "..", ".."));
const runner = new CommandRunner(".sdd", projectRoot);

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
  console.log("=== Purge Command Tests ===\n");

  console.log("Testing /sdd-purge missing target:");
  const noTarget = await runner.run("/sdd-purge");
  assert(noTarget.exitCode === 0, `Exit code is 0: ${noTarget.exitCode}`);
  assert(noTarget.output.includes("Usage:"), `Output includes usage hint`);

  console.log("\nTesting /sdd-purge on existing directory (offline — fail-open):");
  const existingDir = path.join(projectRoot, "sdd-adapter", "__tests__");
  const dirResult = await runner.run("/sdd-purge", ["--directory", existingDir]);
  assert(dirResult.command === "/sdd-purge", `Command correct: ${dirResult.command}`);
  assert(dirResult.output.includes("PROVENANCE AUDIT"), `Output includes PROVENANCE AUDIT`);
  assert(dirResult.output.includes("Files Scanned:"), `Output includes Files Scanned`);

  console.log("\nTesting /sdd-purge --inspect flag:");
  const inspectResult = await runner.run("/sdd-purge", ["--directory", existingDir, "--inspect"]);
  assert(inspectResult.command === "/sdd-purge", `Command correct: ${inspectResult.command}`);
  assert(inspectResult.output.includes("PROVENANCE AUDIT"), `Output includes PROVENANCE AUDIT`);

  console.log("\nTesting /sdd-purge --layer a flag:");
  const layerAResult = await runner.run("/sdd-purge", ["--directory", existingDir, "--layer", "a"]);
  assert(layerAResult.command === "/sdd-purge", `Command correct: ${layerAResult.command}`);
  assert(layerAResult.output.includes("PROVENANCE AUDIT"), `Output includes PROVENANCE AUDIT`);

  console.log("\nTesting /sdd-purge --layer files flag:");
  const layerFilesResult = await runner.run("/sdd-purge", ["--directory", existingDir, "--layer", "files"]);
  assert(layerFilesResult.command === "/sdd-purge", `Command correct: ${layerFilesResult.command}`);
  assert(layerFilesResult.output.includes("PROVENANCE AUDIT"), `Output includes PROVENANCE AUDIT`);

  console.log("\nTesting /sdd-purge with provenance flags in /sdd-scan:");
  const scanWithProvenance = await runner.run("/sdd-scan", ["--directory", existingDir, "--provenance"]);
  assert(scanWithProvenance.command === "/sdd-scan", `Command correct: ${scanWithProvenance.command}`);
  assert(scanWithProvenance.output.includes("SECURITY SCAN"), `Output includes SECURITY SCAN`);

  console.log("\n=== Results ===");
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
