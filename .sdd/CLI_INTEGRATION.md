# Claude CLI Integration — SDDRA

Purpose:
  Allow running `/sdd "..."` in Claude CLI and have it execute
  based solely on .sdd/ materials, with optional project analysis.

## Setup

1. Place `CLAUDE.md` in project root.
2. Ensure `.sdd/` exists and is complete.
3. In Claude CLI, the project root is automatically scanned.
4. Claude reads `CLAUDE.md` and follows its rules.

## Commands

### /sdd "prompt"
Execute SDDRA chain graph from prompt.

Flow:
  D0 -> P1 -> D0 -> D1 -> D0 -> S1 -> D0 -> C1 -> D0 -> R1 -> D0 -> DEP1 -> D0

Example:
  /sdd "Build an education platform for schools"

### /sdd-analyze
Analyze .sdd/ structure and explain the system.

Flow:
  Read:
    .sdd/PROJECT.sdd
    .sdd/chains/graph.sdd
    .sdd/decisions/INDEX.sdd
    .sdd/project/INDEX.sdd
  Output:
    Human-readable explanation of:
      - What SDDRA is
      - How the chain graph works
      - What decisions are made
      - What the next steps are

### /sdd-status
Show current execution status.

Flow:
  Read:
    .sdd/chains/tokens/*.sdd
    .sdd/projects/vkard.az/decisions/*.sdd
  Output:
    - Token usage per stage
    - Decision status
    - Next steps

### /sdd-decisions
List all decisions.

Flow:
  Read:
    .sdd/decisions/INDEX.sdd
    .sdd/projects/vkard.az/decisions/INDEX.sdd
  Output:
    - Active decisions
    - Superseded decisions
    - Decision relationships

## Behavior Rules

1. Claude MUST read .sdd/ before touching project/
2. Claude MUST respect human gates
3. Claude MUST record token usage
4. Claude MUST create decision records for significant changes
5. Claude MUST use short IDs and indexes

## Output Format

Every SDDRA response should include:
```
[tokens: in=X, out=Y, delta=Z]
[decision: DEC-XXX]
[gate: human_required|auto]
[next: D0->P1|D0->D1|...]
```

## Example Session

User: /sdd-analyze
Claude: [reads .sdd/ structure, explains system]

User: /sdd "Education platform for schools"
Claude: [tokens: in=1200, out=3400, delta=2200]
       [decision: DEC-<ID> proposed]
       [gate: human_required]
       [next: D0->D1]
       "Docs created. Please approve."

User: I approve
Claude: [tokens: in=3400, out=8200, delta=4800]
       [decision: DEC-<ID> approved]
       [gate: human_required]
       [next: D0->S1]
       ".sdd/project/ created. Please approve."
