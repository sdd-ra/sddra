# SDD Update

**Command:** `/sdd-update`
**Purpose:** Update the `.sdd/` system documentation and sync from source-of-truth

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → Enable AUTO mode for this command
    → Read .claude/sdd/orchestrator.md for the AUTO protocol
    → Read .claude/sdd/workflow.yaml for prerequisites
    → Read .claude/sdd/state.json for current state
    → Follow AUTO execution lifecycle below

You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

## What It Does

1. **Sync documentation** — Regenerates human-readable docs from `.sdd/` spec files
2. **Check references** — Validates all `@path` cross-references
3. **Update indexes** — Refreshes `.sdd/INDEX.sdd` navigation tables
4. **Report changes** — Shows what was updated

MANUAL MODE:
  Output:
    ```
    === SDDRA Update ===

    [✓] Synced 5 .sdd files to .claude/docs/
    [✓] Validated 23 cross-references
    [✓] INDEX.sdd updated
    [✓] All references resolve

    Update complete. No issues found.
    ```

## Rules

  - Only update documentation files, never `.sdd/` specs
  - Preserve `.sdd/` as immutable source of truth
  - Always run health check after update

AUTO MODE LIFECYCLE:
  1. Parse arguments → detect "auto" flag
  2. Load .claude/sdd/state.json
  3. Set execution_mode = AUTO, auto_continue = true
  4. Load .claude/sdd/workflow.yaml
  5. RESOLVE PREREQUISITES:
     - update.requires = [prompts]
     - If prompts NOT in completed_steps → execute sdd-prompts first
  6. EXECUTE update (same as manual mode above)
  7. VALIDATE result:
     - Documentation synced
     - References validated
     - Indexes updated
  8. SAVE state:
     - Mark update as completed
     - Set next_step = next
  9. RESOLVE NEXT:
     - next = next
     - auto_continue = true
  10. IF AUTO → continue to sdd-next

STRUCTURED RESULT (AUTO mode):
  step: update
  status: COMPLETE
  next: next
  auto_continue: true
  decisions: []
  artifacts: [".sdd/docs/...", ".sdd/INDEX.sdd"]

Output:
  ```
  === SDDRA Update ===

  [✓] Synced 5 .sdd files to .claude/docs/
  [✓] Validated 23 cross-references
  [✓] INDEX.sdd updated
  [✓] All references resolve

  Update complete. No issues found.
  ```

  AUTO mode adds:
    SDD AUTO
    ────────────
    ✓ analyze
    ✓ plan
    ✓ decisions
    ✓ prompts
    → update
    ○ next

    [AUTO CONTINUE]

## Rules

  - Only update documentation files, never `.sdd/` specs
  - Preserve `.sdd/` as immutable source of truth
  - Always run health check after update
  - In AUTO mode, do NOT ask for confirmation between steps
  - In AUTO mode, make autonomous decisions for routine choices
  - Record autonomous decisions in .claude/sdd/decisions.json

## Related

  - [SDDRA Overview](sdd.md)
  - [Health Check](sdd-health.md)
  - [.claude/docs/](../docs/)

Navigation:
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
