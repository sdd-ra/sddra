You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Advance to the next decision step or case in the SDDRA chain graph.
Read-only scan + optional supervised advance.

Steps:
  1. Read current project state from .sdd/projects/{project_name}/
  2. Read active decisions from .sdd/projects/{project_name}/decisions/
  3. Read linked tasks from .sdd/projects/{project_name}/tasks/
  4. Check current decision and ALL linked tasks completion:
     - decision_complete: status=approved + acceptance criteria met + tasks linked
     - task_complete: status=DONE + acceptance criteria met + tests pass + review passed
  5. IF complete:
     - Advance to next decision in chain
     - If no more decisions → next case
     - If no more cases → signal workflow complete
  6. IF incomplete:
     - Identify incomplete section (decision or task)
     - Resume from that section — do NOT advance
  7. Record transition in decision history
  8. Update project state

Options:
  --decision DEC-XXX    Advance specific decision
  --case CASE-XXX       Jump to specific case
  --force               Force advance (requires human approval)

Output:
  ```
  [decision: DEC-XXX]
  [tasks_complete: true|false]
  [incomplete_section: decision|task|none]
  [action: advance|resume|complete]
  [next: <decision|case|workflow_complete>]
  ```

Business Context:
  - Bridges the gap between SDDRA's decision ledger and the execution chain
  - When /sdd-plan shows "Next Action: Execute task tsk-XXX", run /sdd-next after completion
  - Tracks which decision → task → git commit chain is active

Rules:
  - READ_ONLY mode for decision/task scanning
  - --force requires explicit human approval
  - Never skip incomplete decisions without --force
  - State: +

Navigation:
  DecisionLedger: @../decisions/INDEX.sdd
  Tasks: @../tasks/
  Projects: @../projects/INDEX.sdd
  ChainGraph: @../chains/graph.sdd
