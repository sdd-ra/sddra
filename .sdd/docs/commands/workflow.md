<!-- [APPEND:command-workflow] -->
<!-- Section: Command Workflow -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# Command Workflow

Commands follow a natural workflow when working on a project:

## Typical Workflow

1. **`/sdd-plan`** — Start here. Scans `.sdd/` + `prompts/` and generates an execution plan. Shows you what to do next.

2. **Execute tasks** in the C1, R1, or DEP1 arms as the plan directs.

3. **`/sdd-next`** — After completing the "Next Action" tasks from `/sdd-plan`, run this to advance the decision chain. It checks if all linked tasks are complete and moves to the next decision or case.

4. **`/sdd-analyse`** — Run anytime for a deep analysis of the `.sdd/` system with business context classification.

5. **`/sdd-update`** — After git operations, sync `.sdd/` state to pick up changes.

6. **`/sdd`** — Execute the full chain graph from a natural language prompt.

## AUTO Mode Workflow

When using `auto` mode (`/sdd-<command> auto`), the system automatically executes
the entire chain without manual intervention:

```
/sdd-analyze auto
  → /sdd-plan auto
    → /sdd-decisions auto
      → /sdd-prompts auto
        → /sdd-update auto
          → /sdd-next auto
            → (loop back to /sdd-analyze auto for next cycle)
```

## Control Commands

| Command | Purpose |
|---------|---------|
| `/sdd-status` | Show current execution state |
| `/sdd-resume` | Resume from a paused AUTO state |
| `/sdd-health` | Check system integrity |

## Related Documentation

- [Commands Reference](reference.md)
- [AUTO Chain Engine](auto-chain.md)
- [SDDRA Overview](../overview/sdd-overview.md)

<!-- [END:APPEND:command-workflow] -->
