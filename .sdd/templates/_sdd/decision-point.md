# Decision Point Template

**Type**: {CONTINUE | GATE | DECISION | ERROR | REVIEW}
**Triggered by**: {command/task}
**Session**: {sessionId}
**Timestamp**: {ISO-8601}

## Result

{Outcome summary — what just completed}

## Recommended Next Steps

| # | Action | Command | Risk | Description |
|---|--------|---------|------|-------------|
| 1 | {label} | `{command}` | {LOW/MEDIUM/HIGH/CRITICAL} | {description} |
| 2 | {label} | `{command}` | {LOW/MEDIUM/HIGH/CRITICAL} | {description} |

## Workflow Control

- **Approve and Proceed**: `{approveAndProceed}`
  → Advances past CONTINUE and REVIEW types; pauses at GATE/DECISION/ERROR.
- **Review and Modify**: `{reviewAndModify}`
  → Re-opens current stage for modification with full context preserved.

## Evidence

{evidence references or "none"}
