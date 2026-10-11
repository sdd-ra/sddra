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

const projectRoot = path.resolve(
  process.env.SDD_TEST_PROJECT_ROOT || path.resolve(__dirname, "..", "..")
);

function readSpec(relativePath: string): string {
  const fullPath = path.join(projectRoot, relativePath);
  return fs.readFileSync(fullPath, "utf-8");
}

function run() {
  console.log("\n=== Pyramid Orchestration Spec Tests ===");

  // 1. dispatch-channels.sdd
  const dc = readSpec(".sdd/workflow/dispatch-channels.sdd");
  assert(dc.includes("# Workflow: DISPATCH-CHANNELS"), "dispatch-channels.sdd has '# Workflow: DISPATCH-CHANNELS'");
  assert(dc.includes("DispatchChannels:"), "dispatch-channels.sdd has 'DispatchChannels:' section");
  assert(dc.includes("routing_rule:"), "dispatch-channels.sdd has 'routing_rule:'");
  assert(dc.includes("[DC1]"), "dispatch-channels.sdd has rule [DC1]");
  assert(dc.includes("[DC2]"), "dispatch-channels.sdd has rule [DC2]");
  assert(dc.includes("[DC3]"), "dispatch-channels.sdd has rule [DC3]");
  assert(dc.includes("[DC4]"), "dispatch-channels.sdd has rule [DC4]");
  assert(dc.includes("channel_routing[]"), "dispatch-channels.sdd has 'channel_routing[]'");
  assert(dc.includes("Navigation:"), "dispatch-channels.sdd has 'Navigation:' section");
  assert(dc.includes("State: +"), "dispatch-channels.sdd has 'State: +'");

  // 2. subagent-lifecycle.sdd
  const sal = readSpec(".sdd/agent/subagent-lifecycle.sdd");
  assert(sal.includes("# Agent Subagent Lifecycle"), "subagent-lifecycle.sdd has '# Agent Subagent Lifecycle'");
  assert(sal.includes("Levels:"), "subagent-lifecycle.sdd has 'Levels:' section");
  assert(sal.includes("SPAWN DEPTH CAP"), "subagent-lifecycle.sdd has 'SPAWN DEPTH CAP'");
  assert(sal.includes("Self-delegation"), "subagent-lifecycle.sdd has 'Self-delegation'");
  assert(sal.includes("Notification:"), "subagent-lifecycle.sdd has 'Notification:' section");
  assert(sal.includes("Reconciliation:"), "subagent-lifecycle.sdd has 'Reconciliation:' section");
  assert(sal.includes("[SAL1]"), "subagent-lifecycle.sdd has rule [SAL1]");
  assert(sal.includes("[SAL2]"), "subagent-lifecycle.sdd has rule [SAL2]");
  assert(sal.includes("[SAL3]"), "subagent-lifecycle.sdd has rule [SAL3]");
  assert(sal.includes("[SAL4]"), "subagent-lifecycle.sdd has rule [SAL4]");
  assert(sal.includes("[SAL5]"), "subagent-lifecycle.sdd has rule [SAL5]");
  assert(sal.includes("[SAL6]"), "subagent-lifecycle.sdd has rule [SAL6]");
  assert(sal.includes("[SAL7]"), "subagent-lifecycle.sdd has rule [SAL7]");
  assert(sal.includes("[SAL8]"), "subagent-lifecycle.sdd has rule [SAL8]");
  assert(sal.includes("Navigation:"), "subagent-lifecycle.sdd has 'Navigation:' section");
  assert(sal.includes("State: +"), "subagent-lifecycle.sdd has 'State: +'");

  // 3. swarm.sdd
  const swarm = readSpec(".sdd/chains/swarm.sdd");
  assert(swarm.includes("RECONCILE"), "swarm.sdd contains 'RECONCILE'");
  assert(swarm.includes("CloseLadder"), "swarm.sdd contains 'CloseLadder'");
  assert(swarm.includes("level_1_subtask"), "swarm.sdd contains 'level_1_subtask'");
  assert(swarm.includes("level_2_task"), "swarm.sdd contains 'level_2_task'");
  assert(swarm.includes("level_3_dec"), "swarm.sdd contains 'level_3_dec'");
  assert(swarm.includes("[SW1-9]"), "swarm.sdd has rule [SW1-9]");
  assert(swarm.includes("[SW1-10]"), "swarm.sdd has rule [SW1-10]");
  assert(swarm.includes("[SW1-11]"), "swarm.sdd has rule [SW1-11]");
  assert(swarm.includes("[SW1-12]"), "swarm.sdd has rule [SW1-12]");
  assert(swarm.includes("[SW1-13]"), "swarm.sdd has rule [SW1-13]");
  assert(swarm.includes("[SW1-14]"), "swarm.sdd has rule [SW1-14]");
  assert(swarm.includes("sub_agent_registry[]"), "swarm.sdd has 'sub_agent_registry[]'");
  assert(swarm.includes("channel_routing[]"), "swarm.sdd has 'channel_routing[]'");
  assert(swarm.includes("folders[]"), "swarm.sdd has 'folders[]'");

  // 4. micro-unit schema
  const muSchema = readSpec(".sdd/schemas/micro-unit.sdd");
  assert(muSchema.includes("channel: R | F"), "micro-unit schema has 'channel: R | F'");
  assert(muSchema.includes("parent_agent:"), "micro-unit schema has 'parent_agent:' field");
  assert(muSchema.includes("child_agents:"), "micro-unit schema has 'child_agents:' field");
  assert(muSchema.includes("folder:"), "micro-unit schema has 'folder:' field");
  assert(muSchema.includes("[MS9]"), "micro-unit schema has rule [MS9]");
  assert(muSchema.includes("[MS10]"), "micro-unit schema has rule [MS10]");
  assert(muSchema.includes("[MS11]"), "micro-unit schema has rule [MS11]");

  // 5. micro-unit workflow
  const muWorkflow = readSpec(".sdd/workflow/micro-unit.sdd");
  assert(muWorkflow.includes("channel: R | F"), "micro-unit workflow has 'channel: R | F'");
  assert(muWorkflow.includes("self_delegation:"), "micro-unit workflow has 'self_delegation:' section");
  assert(muWorkflow.includes("[MU-7]"), "micro-unit workflow has rule [MU-7]");
  assert(muWorkflow.includes("[MU-8]"), "micro-unit workflow has rule [MU-8]");
  assert(muWorkflow.includes("[MU-9]"), "micro-unit workflow has rule [MU-9]");

  // 6. supervisor.sdd
  const sup = readSpec(".sdd/agent/supervisor.sdd");
  assert(sup.includes("ChannelRouting:"), "supervisor.sdd has 'ChannelRouting:' section");
  assert(sup.includes("ReconcileGate:"), "supervisor.sdd has 'ReconcileGate:' section");
  assert(sup.includes("CleanupVerification:"), "supervisor.sdd has 'CleanupVerification:' section");
  assert(sup.includes("[SUP-06]"), "supervisor.sdd has rule [SUP-06]");
  assert(sup.includes("[SUP-07]"), "supervisor.sdd has rule [SUP-07]");
  assert(sup.includes("[SUP-08]"), "supervisor.sdd has rule [SUP-08]");

  // 7. sdd-swarm.sdd
  const swarmCmd = readSpec(".sdd/commands/sdd-swarm.sdd");
  assert(swarmCmd.includes("RECONCILE"), "sdd-swarm.sdd contains 'RECONCILE'");
  assert(swarmCmd.includes("dispatch-channels.sdd"), "sdd-swarm.sdd references 'dispatch-channels.sdd'");
  assert(swarmCmd.includes("subagent-lifecycle.sdd"), "sdd-swarm.sdd references 'subagent-lifecycle.sdd'");
  assert(swarmCmd.includes("[SWARM-08]"), "sdd-swarm.sdd has rule [SWARM-08]");

  // 8. .gitignore
  const gitignore = readSpec(".gitignore");
  assert(gitignore.includes(".specdd/"), ".gitignore contains '.specdd/' ignore entry");

  // 9. INDEX files reference the new specs
  const wfIndex = readSpec(".sdd/workflow/INDEX.sdd");
  assert(wfIndex.includes("dispatch-channels.sdd"), "workflow/INDEX.sdd references 'dispatch-channels.sdd'");

  const agentIndex = readSpec(".sdd/agent/INDEX.sdd");
  assert(agentIndex.includes("subagent-lifecycle.sdd"), "agent/INDEX.sdd references 'subagent-lifecycle.sdd'");

  const rootIndex = readSpec(".sdd/INDEX.sdd");
  assert(rootIndex.includes("@workflow/dispatch-channels.sdd"), "root INDEX.sdd references '@workflow/dispatch-channels.sdd'");
  assert(rootIndex.includes("@agent/subagent-lifecycle.sdd"), "root INDEX.sdd references '@agent/subagent-lifecycle.sdd'");

  // 10. Decision record
  const decision = readSpec(".sdd/projects/sddra/decisions/2026-1011-002-pyramid-agent-orchestration.md");
  assert(decision.includes("DEC-2026-1011-002"), "decision record contains 'DEC-2026-1011-002'");
  assert(decision.includes("[gate: human_required]"), "decision record contains '[gate: human_required]'");
  assert(decision.includes("D1"), "decision record contains 'D1'");
  assert(decision.includes("D4"), "decision record contains 'D4'");

  console.log(`\nResults: Passed=${passCount}, Failed=${failCount}`);
  if (failCount > 0) process.exit(1);
}

run();