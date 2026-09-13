You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → Enable AUTO mode for this command
    → Read .claude/sdd/orchestrator.md for the AUTO protocol
    → Read .claude/sdd/workflow.yaml for prerequisites
    → Read .claude/sdd/state.json for current state
    → Follow AUTO execution lifecycle below

IDEMPOTENT PLAN GENERATION — CACHE FIRST:
  This command is IDEMPOTENT. Call it 100 times, it works ONCE.

  1. Read .claude/sdd/plan-cache.json → get fingerprint + hit_count
  2. CHECK FINGERPRINT (cheap — no full scans):
     - git HEAD commit hash (read-only, `git rev-parse HEAD`)
     - File state of: .sdd/plans/current-plan.sdd, .sdd/projects/sddra/tasks/INDEX.sdd,
       .sdd/projects/sddra/phases/INDEX.sdd, .sdd/projects/sddra/context/active.sdd
     - Existence of any NEW file in prompts/inbox/
  3. IF fingerprint UNCHANGED (cache HIT):
     → Increment hit_count in plan-cache.json (only write)
     → Output plan FROM .sdd/plans/current-plan.sdd — DO NOT rescan .sdd/, decisions, git log
     → Report: "PLAN [cache HIT #<hit_count>] — served from .sdd/plans/current-plan.sdd (rev <rev>). Inputs unchanged since <generated_at>. Use /sdd-plan --replan to force."
     → DONE. This is the ONLY work performed on a hit.
  4. IF fingerprint CHANGED or --replan given (cache MISS):
     → Execute full scan ONCE (Manual Mode steps below)
     → Write plan to .sdd/plans/current-plan.sdd
     → Bump Revision: vN in the plan file
     → Update plan-cache.json: fingerprint, generated_at, plan_revision, reset hit_count=0
     → Append execution record to .claude/sdd/history.json
     → Report: "PLAN [cache MISS → regenerated, rev <N>]"

  Fingerprint inputs (any change = cache invalidation):
    - git HEAD (new commit)
    - .sdd/projects/sddra/tasks/INDEX.sdd (task state change)
    - .sdd/projects/sddra/phases/INDEX.sdd (phase status change)
    - .sdd/projects/sddra/context/active.sdd (context change)
    - prompts/inbox/ (new pending prompt)

  Manual override: /sdd-plan --replan forces regeneration regardless of cache.

MANUAL MODE (full scan — runs ONLY on cache MISS):
  Steps:
    1. Read .sdd/PROJECT.sdd → extract project name, domain, stack
    2. Read .sdd/plans/current-plan.sdd → prior plan (for revision diff)
    3. Read .sdd/projects/sddra/tasks/INDEX.sdd → task states (TODAY filter: tasks dated today or IN_PROGRESS/PENDING)
    4. Read .sdd/projects/sddra/phases/INDEX.sdd → phase registry → current phase + layer
    5. Read .sdd/chains/graph.sdd → extract execution trace and arms
    6. Read .sdd/decisions/INDEX.sdd → extract active decisions
    7. Scan prompts/inbox/ → extract pending user requests (skip if empty)
       - Tag each prompt with likely chain arm based on keywords:
         "write/plan/design" → D1 (docs)
         "implement/code/build" → C1 (code)
         "review/audit/test" → R1 (review)
         "deploy/release" → DEP1 (deploy)
         "analyze/explain" → P1 (prompt)
         "spec/define" → S1 (.sdd)
    8. Read .claude/sdd/history.json → last 3-5 execution records (HISTORY section)
    9. Query git log --oneline -10 (read-only) → map commits to completed tasks
   10. BUILD PLAN with these sections (write to .sdd/plans/current-plan.sdd):
       a. Project Header (name, domain, stack, decision/task counts, current phase)
       b. Today's Work — what must be done TODAY (from tasks + inbox + phases)
       c. Execution Trace #01-#16 (standard format)
       d. Phase / Layer Position — which phase, which layer (L-level), where in the flow (D0->arm->D0)
       e. History Context — last sessions summary (from history.json)
       f. Next Action — single next step + /sdd-next guidance
   11. Compute new fingerprint → save to plan-cache.json

RE-PLAN PROTOCOL (user requests a change):
  When the user asks for ANY modification to the plan:
    1. Read .sdd/plans/current-plan.sdd (cache — no rescan)
    2. Apply the requested change to the plan content
    3. Bump Revision: vN (MINOR for task changes, MAJOR for goal/scope changes)
    4. Append to history.json: {command: "/sdd-plan --replan", reason: "<user request>"}
    5. Output the DIFF summary: what changed, why, new revision
    6. System NEVER scans from scratch for a user edit — plan edits are plan-local.

AUTO MODE LIFECYCLE:
  1. Parse arguments → detect "auto" flag
  2. Load .claude/sdd/state.json
  3. Set execution_mode = AUTO, auto_continue = true
  4. Load .claude/sdd/workflow.yaml
  5. RESOLVE PREREQUISITES:
     - plan.requires = [analyze]
     - If analyze NOT in completed_steps → execute sdd-analyze first
  6. EXECUTE plan (cache-first logic above; full scan only on MISS)
  7. VALIDATE result:
     - Plan document produced (or cache hit served)
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
  cache: HIT|MISS  # new: cache outcome
  artifacts: [".sdd/plans/current-plan.sdd"]  # only on MISS

Output (both cache HIT and MISS — trace format from .sdd/plans/current-plan.sdd):
  ```
  # Project: <name> | Domain: <domain> | Stack: <stack>
  # Active Decisions: <count> | Pending Tasks: <count> | Phase: <phase>
  # [cache: HIT #<n> | MISS → rev <N>]

  Today's Work:
    1. [DONE] <item>
    2. [IN_PROGRESS] <item>
    ...

  Execution Plan:
    #01  Discover    -> [EXISTING/.sdd/PROJECT.sdd] - <summary>
    #02  BuildCtx    -> [AUTO] cache-first: plan-cache.json => no rescan
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

  Phase/Layer: <phase> | Layer: <layer> | Flow: D0 -> <arm> -> D0

  History (recent):
    <date>: <one-line summary>
    ...

  Next Action: <description>
  ```

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
  - Token economy: 100 calls → 1 real run + 99 cache hits (near-zero tokens)
  - History gives the user "what did we do today / recently" without re-derivation
  - Phase registry shows WHERE in the system lifecycle work currently sits
  - Re-plan is plan-local: user edits never trigger full rescans

Rules:
  - CACHE HIT: read ONLY plan-cache.json + current-plan.sdd. NOTHING else. No git log, no .sdd scans.
  - Do NOT modify any .sdd source files EXCEPT .sdd/plans/current-plan.sdd (the plan itself)
  - Every regeneration MUST bump Revision and append to .claude/sdd/history.json
  - State: +
  - In AUTO mode, do NOT ask for confirmation
  - In AUTO mode, make autonomous decisions for routine choices
  - Record autonomous decisions in .claude/sdd/decisions.json

Navigation:
  PlanCache: @.claude/sdd/plan-cache.json
  CurrentPlan: @.sdd/plans/current-plan.sdd
  PhaseRegistry: @.sdd/projects/sddra/phases/INDEX.sdd
  History: @.claude/sdd/history.json
  ChainGraph: @../chains/graph.sdd
  Decisions: @../decisions/INDEX.sdd
  Tasks: @../tasks/
  Projects: @../projects/INDEX.sdd
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
