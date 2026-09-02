You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Show current execution status of the SDDRA system.

What it does:
  Reads state.json, token records, decisions, and tasks to show a real-time
  status report: what is running, what needs approval, and what
  is blocked.

  This command is READ-ONLY — it does NOT modify state or continue the chain.

AUTO MODE INTEGRATION:
  If AUTO mode is active (state.auto == true):
    - Show AUTO progress display
    - Show completed, current, and pending steps
    - Show execution mode and execution_id
    - Show recent autonomous decisions
    - Do NOT continue the chain — this is a viewer only

Output:
  - Execution mode: MANUAL | AUTO
  - Current step and status
  - Completed steps
  - Pending steps
  - Blockers (if any)
  - Waiting for input (if any)
  - Token usage per stage
  - Active and pending decisions
  - Task status: ready, in-progress, blocked
  - Pending human gates
  - Recommended next steps
  - Recent autonomous decisions (if AUTO mode)

  AUTO mode display:
    SDD AUTO STATUS
    ───────────────

    Workflow: Feature X
    Execution ID: exec-<uuid>
    Mode: AUTO
    Status: RUNNING

    ✓ analyze
    ✓ plan
    → decisions    (CURRENT)
    ○ prompts
    ○ update
    ○ next

    Progress: 2 / 6
    Next action: sdd-decisions

    Recent decisions:
    - SQLite selected (confidence: 0.95)

  Manual mode display:
    SDD STATUS
    ───────────

    Workflow: Feature X
    Status: RUNNING

    ✓ analyze
    ✓ plan
    → decisions    (CURRENT)
    ○ prompts
    ○ update
    ○ next

Format: Markdown tables and progress display.
Do NOT modify any files.
Do NOT continue the workflow chain from this command.

Rules:
  - READ-ONLY: never modify state or continue chain
  - In AUTO mode, show AUTO-specific information
  - State: +

Navigation:
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Decisions: @.claude/sdd/decisions.json
