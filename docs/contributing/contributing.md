# Contributing to SDDRA

SDDRA changes are spec changes first. This guide shows the exact
path for each contribution type, with worked examples.

## The universal rule

Never edit a derived surface without editing its spec. Specs live in
`.sdd/`; wrappers (`.claude/`, `.kilo/`) are generated/synced from
them. Every contribution ends with a semantic commit referencing
its DEC/TASK ids ([R95]) and NO AI signatures ([R103]).

## Adding a new command (3-way registration, [R98]/[CMD8])

A command exists only when it exists in THREE places:

1. `.sdd/commands/<name>.sdd` — the spec (source of truth)
2. `.claude/commands/<name>.md` — Claude Code wrapper
3. `.kilo/command/<name>.md` — Kilo wrapper

### Worked example: `/sdd-echo`

**Step 1 — the spec** `.sdd/commands/sdd-echo.sdd`:

```
# /sdd-echo

Purpose:
  Echo the given text back through the chain graph logging arm.

Owns: commands/sdd-echo.sdd

Description:
  Echo text. Useful for smoke-testing command registration.

Usage:
  /sdd-echo "text"

Options:
  --upper   Uppercase the echo

Output:
  ECHO: <text>

Rules:
  [ECHO-01] /sdd-echo MUST NOT touch files outside tmp/.
  [ECHO-02] /sdd-echo MUST append a prompt-pair record ([R104]).

Navigation:
  Commands: @INDEX.sdd

State: +
```

**Step 2 — register** in `.sdd/commands/INDEX.sdd` (ReadOrder +
Navigation entry + description).

**Step 3 — wrappers** `.claude/commands/sdd-echo.md` and
`.kilo/command/sdd-echo.md`: thin files with `description: Echo text`,
pointing at the spec.

**Step 4 — verify**: `/sdd-health` must report the new count with
0 drift.

## Adding a new rule ([R#])

Rules live in `.sdd/PROJECT.sdd` with sequential ids (currently
R1-R106).

### Worked example: rule R107

1. Open a DEC record (see below) proposing the rule with rationale
2. Human gate approves (rules are architecture — irreversible)
3. Add to `.sdd/PROJECT.sdd`:
   ```
   [R107] <short name> — <one-line statement with MUST/NEVER>,
          <enforcement point>; violations are <severity> findings.
   ```
4. Update derived docs that digest rules (`.kilo/skills/sddra/SKILL.md`
   keeps a digest; update its list)
5. If machine-checkable, add a check to `/sdd-health`
   (sdd-adapter/commands.ts)

## Adding a skill

Skills come from the marketplace (with provenance) or are authored
natively; both follow [SK6] lifecycle:
DISCOVER → ANALYZE → PROPOSE → REVIEW → APPROVE → UPDATE.

1. Author the package under `.sdd/skills/<domain>/<name>/INDEX.sdd`
   with metadata ([SK3]: ID, Domain, Level, Version, Status…)
2. Add the routing entry to the domain INDEX.sdd
3. Kilo wrapper: `.kilo/skills/<name>/SKILL.md` — a thin router
   ([R106]), never a content copy
4. Record provenance if imported; never import by cloning external
   repos into the skills path (rejected in the gstack analysis)

## Architecture changes

Architecture = irreversible. Path: DEC record → human gate → spec
patch → adapter/tests → docs. Big architecture work uses BIG change
mode (full 16-trace plan, `/sdd-plan`).

### Worked example: DEC record

`.sdd/projects/sddra/decisions/2026-0913-00X.md`:

```
# DEC-2026-0913-00X — <title>

Status: PROPOSED
Date: 2026-09-14
Owner: <you>

## Context
What forces this decision.

## Options
- A: ... (recommended) — why
- B: ... — why not

## Decision
A — because <evidence>.

## Consequences
- What changes, what becomes irreversible, what is enforced where.
```

(Recommendations are opinionated — one option with rationale, never
neutral lists; see agent contract OpinionatedOutput.)

## Task registry entry (worked example)

`.sdd/projects/sddra/tasks/INDEX.sdd`:

```
2026-0914-001 | Implement R107 health check | SPEC→CODE | IN_PROGRESS
  Links: DEC-2026-0913-00X, R107
```

## Validation for every contribution

Run everything in the sandbox (never host toolchains, [R102]):

```bash
docker compose build sdd-sandbox
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node node_modules/typescript/bin/tsc --outDir /var/sandbox/dist
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node node_modules/ts-node/dist/bin.js --transpile-only __tests__/run.ts
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node -e "...run('/sdd-health')..."
```

All green + `/sdd-health` HEALTHY → commit:

```
feat(commands): add /sdd-echo smoke command [DEC-2026-0913-00X]
```

## Commit message rules

- Semantic prefix (feat/fix/docs/chore/refactor)
- Subject states WHAT and WHY in one line
- Body lists changes and validation results
- DEC/TASK references in the body ([R95])
- No AI trailers, no emoji tags ([R97], [R103])
