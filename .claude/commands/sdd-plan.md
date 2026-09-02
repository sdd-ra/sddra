You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → Enable AUTO mode for this command
    → Read .claude/sdd/orchestrator.md for the AUTO protocol
    → Read .claude/sdd/workflow.yaml for prerequisites
    → Read .claude/sdd/state.json for current state
    → Follow AUTO execution lifecycle below

Scan .sdd/ and prompts/ directories to auto-generate an execution plan.
Read-only — does not modify any files.

MANUAL MODE:
  Steps:
    1. Read .sdd/PROJECT.sdd → extract project name, domain, stack
    2. Read .sdd/chains/graph.sdd → extract execution trace and arms
    3. Read .sdd/decisions/INDEX.sdd → extract active decisions
    4. Read .sdd/projects/ → extract instantiated projects
    5. Scan prompts/inbox/ → extract pending user requests
       - Extract: intent, target arm (P1/D1/S1/C1/R1/DEP1), priority
       - Tag each prompt with likely chain arm based on keywords:
         "write/plan/design" → D1 (docs)
         "implement/code/build" → C1 (code)
         "review/audit/test" → R1 (review)
         "deploy/release" → DEP1 (deploy)
         "analyze/explain" → P1 (prompt)
         "spec/define" → S1 (.sdd)
    6. Scan prompts/archive/ → extract completed tasks (if exists)
    7. Scan .sdd/tasks/ → map task IDs to decisions
    8. For each chain arm (P1, D1, S1, C1, R1, DEP1):
       - Check if existing work exists for that arm
       - If yes → reference existing artifact
       - If no → generate new task spec (tsk-XXX)
    9. Query git log (read-only) → map commits to completed tasks
    10. Output plan in trace format #01-#16

AUTO MODE LIFECYCLE:
  1. Parse arguments → detect "auto" flag
  2. Load .claude/sdd/state.json
  3. Set execution_mode = AUTO, auto_continue = true
  4. Load .claude/sdd/workflow.yaml
  5. RESOLVE PREREQUISITES:
     - plan.requires = [analyze]
     - If analyze NOT in completed_steps → execute sdd-analyze first
  6. EXECUTE plan (same as manual mode above)
  7. VALIDATE result:
     - Plan document produced
     - Task breakdown complete
     - DAG validated
  8. SAVE state:
     - Mark plan as completed
     - Set next_step = decisions
  9. RESOLVE NEXT:
     - next = decisions
     - auto_continue = true
  10. IF AUTO → continue to sdd-decisions

STRUCTURED RESULT (AUTO mode):
  step: plan
  status: COMPLETE
  next: decisions
  auto_continue: true
  decisions: []
  artifacts: [".sdd/plans/..."]  # if created

Output:
  ```
  # Project: <name> | Domain: <domain> | Stack: <stack>
  # Active Decisions: <count> | Pending Tasks: <count>

  Execution Plan:
    #01  Discover    -> [EXISTING/.sdd/PROJECT.sdd] - <summary>
    #02  BuildCtx    -> [AUTO] 4-tier memory (Long-Term, Project, Task, Working)
    #03  Plan        -> [TASK/tsk-XXX] - <description>
    #04  PlanCheck   -> [AUTO] validate DAG + dependencies
    #05  Implement   -> [CODE/.sdd/skills/] - <summary>
    #06  Test        -> [CODE/.sdd/testing/] - <summary>
    #07  TestCheck   -> [AUTO] PASS or FAIL branch
    #08  Classify    -> [AUTO] map failure types
    #09  Fix         -> [TASK/tsk-XXX] - <description>
    #10  LoopGuard   -> [AUTO] evaluate loop score + failure budget
    #11  ReTest      -> [AUTO] re-run affected tests
    #12  DoneProof   -> [AUTO] verify requirements + tests + arch + review
    #13  Document    -> [DOCS/.sdd/docs/] - <summary>
    #14  LearnGate   -> [AUTO] evaluate learning gate outcome
    #15  Consolidate -> [AUTO] DROP | ARCHIVE | LINK | PROMOTE knowledge
    #16  Complete    -> [AUTO] mark task COMPLETED

  Next Action: <description of next step>
  ```
  If no pending work: "All chain arms are up to date."

  AUTO mode adds:
    SDD AUTO
    ────────────
    ✓ analyze
    → plan
    ○ decisions
    ○ prompts
    ○ update
    ○ next

    [AUTO CONTINUE]

Business Context:
  - Analyzes prompts/inbox/ for user intents
  - Cross-references decisions → tasks → git commits
  - Identifies knowledge gaps per SDDRA evolution system

Rules:
  - Do NOT modify any files
  - State: +
  - In AUTO mode, do NOT ask for confirmation
  - In AUTO mode, make autonomous decisions for routine choices
  - Record autonomous decisions in .claude/sdd/decisions.json

Navigation:
  ChainGraph: @../chains/graph.sdd
  Decisions: @../decisions/INDEX.sdd
  Tasks: @../tasks/
  Projects: @../projects/INDEX.sdd
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
