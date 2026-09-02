<!-- [APPEND:auto-chain] -->
<!-- Section: AUTO Chain Workflow Engine -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# AUTO Chain Workflow Engine

The AUTO chain workflow engine enables autonomous execution of the SDDRA
command pipeline. When any `/sdd-<command>` is called with the `auto` argument,
the engine orchestrates the entire A→Z workflow without manual intervention.

## Activation

```
/sdd-plan auto        → command=sdd-plan, auto=true
/sdd-analyze auto     → command=sdd-analyze, auto=true
/sdd-decisions        → command=sdd-decisions, auto=false
```

The `auto` flag is an execution-mode modifier, not a separate command.
It can be attached to any workflow command.

## Workflow Definition

The workflow is defined in `.claude/sdd/workflow.yaml`:

```yaml
steps:
  analyze:
    command: sdd-analyze
    requires: []
    next: plan
    terminal: false

  plan:
    command: sdd-plan
    requires:
      - analyze
    next: decisions
    terminal: false

  decisions:
    command: sdd-decisions
    requires:
      - analyze
      - plan
    next: prompts
    terminal: false

  prompts:
    command: sdd-prompts
    requires:
      - plan
      - decisions
    next: update
    terminal: false

  update:
    command: sdd-update
    requires:
      - prompts
    next: next
    terminal: false

  next:
    command: sdd-next
    requires:
      - update
    next: null
    terminal: true
```

## Execution Protocol

The AUTO orchestrator follows this protocol:

1. **Parse arguments** for `auto` flag
2. **Load state** from `.claude/sdd/state.json`
3. **Load workflow** from `.claude/sdd/workflow.yaml`
4. **Resolve prerequisites** — execute missing steps in dependency order
5. **Execute step** — run command-specific logic
6. **Validate result** — check success/failure/blocked/needs-input
7. **Save state** — persist to `.claude/sdd/state.json`
8. **Resolve next step** — follow workflow chain
9. **Continue** — if AUTO and not terminal, proceed to next step

## State Management

State is persisted in `.claude/sdd/state.json`:

```json
{
  "version": "1.0",
  "execution_id": "<uuid>",
  "auto": true,
  "workflow": "sdd-cli",
  "status": "running",
  "current_step": "plan",
  "completed_steps": ["analyze"],
  "pending_steps": ["decisions", "prompts", "update", "next"],
  "loop_protection": {
    "last_states": [],
    "cycle_count": 0,
    "same_transition_count": 0
  }
}
```

## Terminal States

AUTO execution stops for these terminal states:

| State | Meaning |
|-------|---------|
| DONE | Workflow completed successfully |
| BLOCKED | Cannot proceed without human intervention |
| NEEDS_INPUT | Requires user input to continue |
| FAILED | Step execution failed |
| CANCELLED | User cancelled execution |

## Autonomous Decision Policy

When a step encounters a decision point:

1. Check `decisions.json` for existing decision
2. Check `.sdd/` decisions for related decisions
3. Inspect repository for patterns/conventions
4. Apply priority order:
   a. Explicit user requirements
   b. Existing project architecture
   c. Existing SDD decisions
   d. Repository conventions
   e. Safest reasonable default
5. Record the decision in `decisions.json`
6. Continue — do NOT ask user

Only escalate if the decision meets escalation criteria.

## Loop Protection

The engine tracks transitions to prevent infinite loops:

- `same_transition_count` > threshold → HALT
- `transition_count` > max iterations → HALT
- Repeated state sequences detected → HALT

## Idempotency

Before executing a step:

- If step is already in `completed_steps` AND output is still valid → SKIP
- A step's output is valid if dependencies and inputs haven't changed

## Output Format

```
SDD AUTO [mode=auto]
─────────────────────

✓ analyze
✓ plan
→ decisions
○ prompts
○ update
○ next

[AUTO CONTINUE]
```

On completion:

```
SDD AUTO COMPLETE

Workflow: sdd-cli
Completed:
✓ analyze
✓ plan
✓ decisions
✓ prompts
✓ update
✓ next

Status: DONE
```

On NEEDS_INPUT:

```
SDD AUTO PAUSED

Step: sdd-decisions
Status: NEEDS_INPUT

Questions:
1. <question text>

Waiting for user input...
State saved. Resume with: /sdd-resume
```

## Related Documentation

- [Command Workflow](workflow.md)
- [Commands Reference](reference.md)
- [SDDRA Overview](../overview/sdd-overview.md)
- [Orchestrator Protocol](.claude/sdd/orchestrator.md)

<!-- [END:APPEND:auto-chain] -->
