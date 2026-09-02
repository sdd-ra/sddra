You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Resume a failed or interrupted SDDRA execution from the last checkpoint.
This command resumes AUTO mode if it was previously active.

What it does:
  Reads state.json to determine where execution stopped.
  Skips completed stages and resumes from the next pending stage.
  In AUTO mode, restores execution_mode = AUTO and continues the chain.

AUTO MODE RESUME:
  If state.auto == true:
    1. Load state.json
    2. Verify execution_mode == AUTO
    3. Find current_step in state
    4. Validate prerequisites for current_step are still met
    5. If prerequisites broken → repair state or re-execute missing prereqs
    6. Continue from current_step with AUTO mode active
    7. The chain continues automatically until terminal state

  The user does NOT need to add "auto" again — AUTO mode is preserved in state.

MANUAL MODE:
  If state.auto == false or no state exists:
    → Standard resume behavior (read token files, determine last checkpoint)
    → Show resume path

Steps:
  1. Read .claude/sdd/state.json
  2. Check if AUTO mode was active
  3. If AUTO:
     a. Set execution_mode = AUTO
     b. Load workflow.yaml
     c. Determine current_step
     d. Validate prerequisites
     e. Resume orchestrator loop from current_step
  4. If MANUAL:
     a. Read token files and task state
     b. Determine last completed stage
     c. Show next executable stage
  5. Update state with resume timestamp
  6. Continue execution

Options:
  --list         List available checkpoints
  --chain        Resume specific chain
  --checkpoint   Resume from specific checkpoint

Output:
  - Last completed stage
  - Next executable stage
  - Pending tasks
  - Resume path
  - AUTO mode status (if applicable)

  AUTO resume output:
    SDD AUTO RESUME

    Execution ID: exec-<uuid>
    Mode: AUTO

    Completed:
    ✓ analyze
    ✓ plan

    Resuming:
    → decisions

    [AUTO CONTINUE]

Safety:
  - Validate state before resuming
  - Human confirmation required for destructive resume
  - Halt if checkpoint is corrupt
  - In AUTO mode, validate prerequisites before continuing

Rules:
  - State: +
  - Preserve AUTO mode if it was active
  - Do NOT restart from beginning unless state is corrupted
  - Validate prerequisites before resuming AUTO

Navigation:
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
