# SDD Health Check

**Command:** `/sdd-health`
**Purpose:** Check the integrity of the `.sdd/` specification system and AUTO workflow state

You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

## What It Does

Runs a comprehensive health check on the `.sdd/` system and AUTO workflow:

1. **File integrity** — Verifies all `.sdd` files have required fields (Purpose, State)
2. **Reference resolution** — Checks all `@path` links resolve to real files
3. **Chain graph validation** — Verifies the execution chain is well-formed
4. **Memory model check** — Confirms runtime memory tiers are correctly configured
5. **Workflow integrity** — Validates `.claude/sdd/workflow.yaml` is well-formed
6. **State integrity** — Validates `.claude/sdd/state.json` is parseable and consistent
7. **Command integrity** — Verifies all referenced commands in workflow.yaml exist
8. **Orphan detection** — Detects workflow steps with missing command files
9. **Decision log integrity** — Validates `.claude/sdd/decisions.json` is parseable

## Output

```
=== SDDRA Health Check ===

[✓] PROJECT.sdd: OK
[✓] INDEX.sdd: OK
[✓] protocol/ROOT.sdd: OK
[✓] chains/graph.sdd: OK
[✓] All .sdd files have Purpose: PASS
[✓] All .sdd files have State: PASS
[✓] References resolved: 0 broken links
[✓] workflow.yaml: OK
[✓] state.json: OK
[✓] decisions.json: OK
[✓] All workflow commands exist: PASS
[✓] No orphan steps detected

Health: HEALTHY
```

If issues found:
```
=== SDDRA Health Check ===

[✓] PROJECT.sdd: OK
[✗] chains/graph.sdd: BROKEN LINK @ ../tasks/TASK-001
[✓] workflow.yaml: OK
[✗] state.json: CORRUPT (invalid JSON at line 42)
[✗] sdd-decisions.md: MISSING (referenced in workflow.yaml)

Health: UNHEALTHY
Issues: 3
```

## Rules

  - Do NOT modify any files
  - Report all failures with file path and line number
  - Exit with code 0 if healthy, non-zero if issues found
  - Validate both `.sdd/` system and `.claude/sdd/` workflow state

## Related

  - [SDDRA Overview](sdd.md)
  - [Analysis](sdd-analyze.md)
  - [AUTO Orchestrator](.claude/sdd/orchestrator.md)

Navigation:
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Decisions: @.claude/sdd/decisions.json
  Commands: @.claude/commands/
