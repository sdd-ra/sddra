You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Scan .sdd/ and prompts/ directories to auto-generate an execution plan.
Read-only — does not modify any files.

Steps:
  1. Read .sdd/PROJECT.sdd → extract project name, domain, stack
  2. Read .sdd/chains/graph.sdd → extract execution trace and arms
  3. Read .sdd/decisions/INDEX.sdd → extract active decisions
  4. Read .sdd/projects/ → extract instantiated projects
  5. Scan prompts/inbox/ → extract pending user requests (if exists)
  6. Scan prompts/archive/ → extract completed tasks (if exists)
  7. Scan .sdd/tasks/ → map task IDs to decisions
  8. For each chain arm (P1, D1, S1, C1, R1, DEP1):
     - Check if existing work exists for that arm
     - If yes → reference existing artifact
     - If no → generate new task spec (tsk-XXX)
  9. Query git log (read-only) → map commits to completed tasks
  10. Output plan in trace format #01-#16

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

Business Context:
  - Analyzes prompts/inbox/ for user intents
  - Cross-references decisions → tasks → git commits
  - Identifies knowledge gaps per SDDRA evolution system

Rules:
  - Do NOT modify any files
  - State: +

Navigation:
  ChainGraph: @../chains/graph.sdd
  Decisions: @../decisions/INDEX.sdd
  Tasks: @../tasks/
  Projects: @../projects/INDEX.sdd
