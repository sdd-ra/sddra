You are the SDDRA prompts agent. Follow CLAUDE.md rules.

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → Enable AUTO mode for this command
    → Read .claude/sdd/orchestrator.md for the AUTO protocol
    → Read .claude/sdd/workflow.yaml for prerequisites
    → Read .claude/sdd/state.json for current state
    → Follow AUTO execution lifecycle below

Execute /sdd-prompts for: "$ARGUMENTS"

What it does:
  Automates prompt lifecycle: structure raw prompts, move to inbox,
  formalize, and archive after human approval.

MANUAL MODE:
  Steps:
    1. Scan prompts/ root for unstructured files (non-markdown, missing frontmatter)
    2. For each unstructured file:
       - Add YAML frontmatter: id, type, status, created
       - Add Purpose, Description, Usage sections
       - Normalize naming: prompt-XXX.md
    3. Move structured files to prompts/inbox/
    4. Flag duplicates for review
    5. Wait for human approval before archive
    6. Move approved prompts to prompts/archive/

  AutoMode:
    trigger: file created in prompts/
    scope: single file
    mode: background structure + inbox move
    approval: required before archive

  Output:
    [scanned: X files]
    [structured: Y files]
    [moved_to_inbox: Z files]
    [archived: W files]

  Rules:
    - Do NOT delete any prompts
    - Do NOT archive without human approval
    - Do NOT modify prompts/active/ or prompts/archive/ contents
    - Preserve original filename in frontmatter
    - Flag duplicates, do not overwrite

AUTO MODE LIFECYCLE:
  1. Parse arguments → detect "auto" flag
  2. Load .claude/sdd/state.json
  3. Set execution_mode = AUTO, auto_continue = true
  4. Load .claude/sdd/workflow.yaml
  5. RESOLVE PREREQUISITES:
     - prompts.requires = [plan, decisions]
     - If plan NOT in completed_steps → execute sdd-plan first
     - If decisions NOT in completed_steps → execute sdd-decisions first
  6. EXECUTE prompts (same as manual mode above)
  7. VALIDATE result:
     - Prompts structured and formalized
     - Inbox populated
  8. SAVE state:
     - Mark prompts as completed
     - Set next_step = update
  9. RESOLVE NEXT:
     - next = update
     - auto_continue = true
  10. IF AUTO → continue to sdd-update

STRUCTURED RESULT (AUTO mode):
  step: prompts
  status: COMPLETE
  next: update
  auto_continue: true
  decisions: []
  artifacts: ["prompts/inbox/..."]

Output:
  [scanned: X files]
  [structured: Y files]
  [moved_to_inbox: Z files]
  [archived: W files]

  AUTO mode adds:
    SDD AUTO
    ────────────
    ✓ analyze
    ✓ plan
    ✓ decisions
    → prompts
    ○ update
    ○ next

    [AUTO CONTINUE]

Rules:
  - Do NOT delete any prompts
  - Do NOT archive without human approval
  - Do NOT modify prompts/active/ or prompts/archive/ contents
  - Preserve original filename in frontmatter
  - Flag duplicates, do not overwrite
  - In AUTO mode, do NOT ask for confirmation between steps
  - In AUTO mode, make autonomous decisions for routine choices
  - Record autonomous decisions in .claude/sdd/decisions.json

Navigation:
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
