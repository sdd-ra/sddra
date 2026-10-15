import { emitAgentsMd, emitClaudeMdPointer, emissionFingerprint, EmissionInput } from "../context-emitter";

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

const input: EmissionInput = {
  projectName: "SDDRA",
  projectPurpose: "Spec-Driven Development & Reasoning Architecture.",
  stack: "Node.js + TypeScript + Docker",
  topRules: [
    "All execution runs in the Docker sandbox - never on host toolchains [R102].",
    "Route through .sdd/INDEX.sdd first.",
  ],
  commands: [
    { name: "/sdd-plan", purpose: "open or create the current execution plan" },
    { name: "/sdd-health", purpose: "run integrity checks" },
  ],
  keyPaths: [".sdd/INDEX.sdd - routing table", ".sdd/PROJECT.sdd - rules"],
};

async function main(): Promise<void> {
  console.log("=== Context Emitter Tests ===\n");

  console.log("AGENTS.md emission:");
  const result = emitAgentsMd(input);
  assert(result.agentsMd.includes("# SDDRA"), "project name present");
  assert(result.agentsMd.includes("DERIVED FILE"), "DERIVED marker present [CE-04]");
  assert(result.agentsMd.includes("/sdd-plan"), "command map present");
  assert(result.agentsMd.includes(".sdd/INDEX.sdd"), "key path routing present");
  assert(result.tokenEstimate >= 100, `token estimate sane: ${result.tokenEstimate}`);
  assert(result.tokenEstimate <= 2000, `within budget [CE-02]: ${result.tokenEstimate}`);
  assert(result.bytes < 32 * 1024, `under 32 KiB hard cap: ${result.bytes}B`);

  console.log("\nOverflow trimming ([CE-02]):");
  const huge: EmissionInput = {
    ...input,
    commands: Array.from({ length: 500 }, (_, i) => ({
      name: `/sdd-cmd-${i}`,
      purpose: `command number ${i} with a fairly long purpose line to inflate size`,
    })),
    keyPaths: Array.from({ length: 200 }, (_, i) => `.sdd/path-${i}/INDEX.sdd - deep path ${i}`),
  };
  const trimmed = emitAgentsMd(huge);
  assert(trimmed.bytes < 32 * 1024, `overflow trimmed under cap: ${trimmed.bytes}B`);

  console.log("\nCLAUDE.md pointer emission:");
  const claude = emitClaudeMdPointer("SDDRA");
  assert(claude.includes("@AGENTS.md"), "pointer imports AGENTS.md");
  assert(claude.includes("DERIVED FILE"), "DERIVED marker present");

  console.log("\nFingerprint drift ([CE-03][CE-06]):");
  const fp1 = emissionFingerprint(input);
  const fp2 = emissionFingerprint(input);
  const fp3 = emissionFingerprint({ ...input, stack: "Python" });
  assert(fp1 === fp2, "same input => same fingerprint");
  assert(fp1 !== fp3, "changed input => changed fingerprint");

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
