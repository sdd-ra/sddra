You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → This is the AUTO orchestrator entry point
    → Read .claude/sdd/orchestrator.md for the full AUTO protocol
    → Read .claude/sdd/workflow.yaml for workflow definition
    → Read .claude/sdd/state.json for current state
    → Execute the orchestrator loop

Advance to the next decision step or case in the SDDRA chain graph.
In AUTO mode, this becomes the central workflow orchestrator that drives
the entire A→Z chain.

AUTO ORCHESTRATOR MODE:
  When called with "auto":
    1. Load state.json and workflow.yaml
    2. Determine current step and next step
    3. Check prerequisites for current step
    4. Execute missing prerequisites automatically
    5. Execute current step
    6. Validate result
    7. Save state
    8. If COMPLETE and next exists and auto=true → continue to next
    9. If terminal state → report and stop
    10. Loop until DONE, BLOCKED, NEEDS_INPUT, FAILED, or CANCELLED

  The orchestrator maintains:
    - execution_mode = AUTO (persists through all transitions)
    - auto_continue = true
    - step_history (append-only)
    - loop_protection state

MANUAL MODE:
  Without "auto", preserve original behavior:
    Read current project state from .sdd/projects/{project_name}/
    Read active decisions from .sdd/projects/{project_name}/decisions/
    Read linked tasks from .sdd/projects/{project_name}/tasks/
    Check current decision and ALL linked tasks completion
    IF complete: Advance to next decision in chain
    IF incomplete: Resume from that section — do NOT advance
    Record transition in decision history
    Update project state

Steps (AUTO mode):
  1. Parse arguments → detect "auto" flag
  2. Read .claude/sdd/state.json
  3. Read .claude/sdd/workflow.yaml
  4. Set execution_mode = AUTO if not already set
  5. Determine requested step (from state or default to next)
  6. RESOLVE PREREQUISITES:
     - For each required step in workflow.yaml:
       - If not in completed_steps → execute it
       - Record result in state
  7. EXECUTE current step
  8. VALIDATE result against workflow expectations
  9. SAVE state to .claude/sdd/state.json
  10. RESOLVE NEXT:
      - If COMPLETE and next exists → auto continue
      - If terminal state → stop and report
  11. LOOP PROTECTION check
  12. If AUTO and not terminal → repeat from step 7

Steps (MANUAL mode):
  1. Read current project state from .sdd/projects/{project_name}/
  2. Read active decisions from .sdd/projects/{project_name}/decisions/
  3. Read linked tasks from .sdd/projects/{project_name}/tasks/
  4. Check current decision and ALL linked tasks completion
  5. IF complete → Advance to next decision in chain
  6. IF incomplete → Resume from that section
  7. Record transition in decision history
  8. Update project state

Options:
  --decision DEC-XXX    Advance specific decision
  --case CASE-XXX       Jump to specific case
  --force               Force advance (requires human approval)
  --auto                Enable AUTO mode (full chain orchestration)

Output:
  ```
  [decision: DEC-XXX]
  [tasks_complete: true|false]
  [incomplete_section: decision|task|none]
  [action: advance|resume|complete]
  [next: <decision|case|workflow_complete>]
  ```

  AUTO mode output:
  ```
  SDD AUTO
  ────────────
  ✓ analyze
  ✓ plan
  → decisions
  ○ prompts
  ○ update
  ○ next
  [AUTO CONTINUE]
  ```

Business Context:
  - Bridges the gap between SDDRA's decision ledger and the execution chain
  - When /sdd-plan shows "Next Action: Execute task tsk-XXX", run /sdd-next after completion
  - Tracks which decision → task → git commit chain is active
  - In AUTO mode, becomes the central workflow controller

Rules:
  - In AUTO mode, NEVER ask for confirmation between steps
  - In AUTO mode, make autonomous decisions using repository context
  - In AUTO mode, only stop for terminal states (NEEDS_INPUT, BLOCKED, FAILED, CANCELLED, DONE)
  - In AUTO mode, record all decisions in .claude/sdd/decisions.json
  - In AUTO mode, persist state after every step
  - In AUTO mode, implement loop protection
  - READ_ONLY mode for decision/task scanning in MANUAL mode
  - --force requires explicit human approval
  - Never skip incomplete decisions without --force
  - State: +

Navigation:
  DecisionLedger: @../decisions/INDEX.sdd
  Tasks: @../tasks/
  Projects: @../projects/INDEX.sdd
  ChainGraph: @../chains/graph.sdd
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
