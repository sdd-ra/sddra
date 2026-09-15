# CLAUDE.md — SDDRA Instructions

This file tells Claude AI how to operate inside the SDDRA system.

## Who you are
You are an AI agent working inside the SDDRA system.

## Core principle
The `.sdd/` directory is the system's **brain**. Read what is written
there, understand it, and work by those rules.

## Stateful flow rule — applies to EVERY command
Whenever any `/sdd*` command is given (plan, analysis, next —
anything), the flow is ALWAYS this sequence — the order is never
broken:

```
PROMPT-PAIR LOG → DISCOVER → ANALYZE → LOCATE CURRENT STEP → EXECUTE ONLY CURRENT STEP
→ VERIFY → SAVE STATE → STOP
```

- **PROMPT-PAIR LOG ([R104], first step)**: the user's RAW text
  (`customer_prompt`) and the normalized best-practice English
  prompt you executed (`ai_prompt`) are appended as a pair to
  `prompts/history/prompt-pairs.jsonl` — append-only, never edited
  or deleted. The `ai_prompt` is NOT a mechanical echo — it is the
  protocol translation of the intent (chain steps, DEC/TASK
  openings, provenance, language context). Example:
  customer_prompt: "Men lahiyyemde buglar var fix ederdin"
  ai_prompt: "/sdd Full check of the project against my prompt; if a case
  was resolved in a misleading way, open a new DEC and a new TASK to close
  the bug. Reported by customer in Azerbaijani — preserve the original
  wording as the authoritative intent."
  The adapter writes the pair automatically at runtime; if you
  execute outside the adapter, you must write the pair yourself.

- **Source of truth**: project files + saved workflow state.
  Conversation history is NOT a source of truth.
- **Only the current step executes**: pre-executing a future step,
  skipping a step, or reordering is FORBIDDEN (delivery chain
  [DL1-1]).
- **A step is DONE only when 5 conditions pass**: input exists;
  work completed; output/artifact exists; internally consistent;
  validation passed. There is no writing DONE on assumption.
- **/next = continue from state**: read saved state → find the last
  completed step → find the first incomplete step → execute ONLY
  that one → verify → update state → stop. Called 100 times, it
  continues from the actual last state every time. Do not ask
  "what should I do next?" — determine it from state.
- **BUG stops the flow**: if the current step has a blocking BUG,
  the flow stops (BUG-REGISTRY.sdd); no advancement to the next step
  until the BUG is resolved.
- Step short-keys live in the canonical dictionary:
  `.sdd/workflow/step-keys.sdd`.

## Shell backend rule
When the tool executes shell commands, the background shell MUST be
**`bash.exe`, not PowerShell's own `powershell.exe`**. Custom
executables like `arxasin.exe` / `arxasin` MUST NOT be set as the
shell backend:
- Shell commands run only through standard shells
  (`powershell.exe`, `bash.exe`)
- If a custom binary is needed for sandbox/analysis, it is invoked
  INSIDE a command (e.g. `some-tool --analyze file`) — it never
  replaces the shell itself
- If this rule is violated the command does not execute — the user
  is informed

## External skill import rules
1. **Source citation is mandatory**: whenever a new skill arrives
   from anywhere (tmp/, GitHub, marketplace), the skill file itself
   must carry the source citation:
   - `Source: <repo-url>` (e.g. `Source: https://github.com/anthropics/skills`)
   - `Imported: <date>` and `Format: anthropic-skill | vercel-agent-skill | native`
   - If SKILL.md content is embedded, the original file path is
     also given (`Origin: tmp/skills/skills/xlsx/SKILL.md`)
2. **Code-bearing skills are analyzed via Docker**: if a skill
   carries scripts/, code, or executable files:
   - The code is never run locally — the plan is written for
     execution/analysis inside the Docker container (`.sdd` rules
     [R59]-[R66])
   - Runtime dependencies (python, node, pip packages) are recorded
     in skill metadata (`Runtime: python3 | docker`)
   - When a skill's SKILL.md is read and it contains code, the
     analysis plan is prepared for Docker — no host installation

## Registration point
Before every piece of work, start in this order:

1. `.sdd/PROJECT.sdd` — what exists, what does not, rules
2. `.sdd/chains/graph.sdd` — which chain will run
3. `.sdd/chains/arms/*.sdd` — what each arm does
4. `.sdd/decisions/DEC-*.sdd` — which decisions are approved
5. `.sdd/instances/{project_name}/docs/` — human-language description
6. `templates/INDEX.sdd` — reusable project templates
7. `.sdd/skills/cross-cutting/project-structure/` — project
   generation skill

## Chain graph — unbreakable flow
```
D0 (default)
  ├─> P1 (prompt) ──> D0
  ├─> D1 (docs) ────> D0
  ├─> S1 (sdd) ────> D0
  ├─> C1 (code) ────> D0
  ├─> R1 (review) ─> D0
  └─> DEP1 (deploy) -> D0
```

Every arm returns to D0. Unbreakable.

## Token minimalism — mandatory
- Use short IDs: `P1`, `D1`, `S1`, `C1`, `R1`, `DEP1`
- Use `INDEX.sdd`, do not scan directories
- Lazy loading: load only what is needed
- Never load the whole `.sdd/` structure at once

## EXPAND protocol — bulk-load FORBIDDEN
The `.sdd/` directory is never sent wholesale to the other side
(model context).

1. **InitialLoad manifest**: every session starts ONLY with the
   INDEX + the current command's `InitialLoad:` manifest (each
   command spec in `.sdd/commands/*.sdd` has an `InitialLoad:`
   section — only those 2-3 files load automatically). Target:
   initial load <1% (previously ~9%).
2. **EXPAND request**: when deep content is needed, the AI asks
   EXPLICITLY: `EXPAND <path-or-section>` — only that section is
   given. Nobody sends heavy files unasked.
3. **Push ban**: any heavy files (whole skill trees, all phase
   specs, large analysis files) are NEVER sent proactively —
   requested or not. Only on request.
4. **Progressive disclosure = pull-based**: context LEVEL 0 (INDEX +
   manifest) is the only automatic load; LEVEL 1-2 only via EXPAND.

## Two-language model
- `docs/` — human language, plain English
- `.sdd/project/` — AI language, machine-readable
- `templates/_sdd/` — reusable scaffolding, machine-readable
- `project/` — human code, source of truth

The AI starts from `.sdd/`, takes scaffolding from
`templates/_sdd/`, and writes into `project/` only after S1
approval.

## Human gates — impassable
1. **P1→D1**: Docs approval — a human reads and decides
2. **D1→S1**: SDD approval — a human reads .sdd/project/
3. **S1→C1**: Code approval — a human reads the code
4. **C1→DEP1**: Production approval — a human approves deployment

Never pass any of these gates yourself. Wait for human approval.

## Decision ledger — principle
> "If it is not in the decision ledger, it does not happen."

Every change creates `.sdd/decisions/DEC-XXX.sdd`. Decisions flow
through `proposed → review → approved → implemented → verified →
closed`.

## If ... happens
- **A file is not found**: do not search file-by-file line-by-line.
  Read `INDEX.sdd`, follow the routing table.
- **No decision ledger entry exists**: make no change, ask the human.
- **Conflicting decisions exist**: stop execution, inform the human.
- **Token budget runs out**: keep the most important stage, stop the
  rest.

## What you can do
- Analyze and explain the `.sdd/` structure
- Execute the chain graph
- Create and track decision ledger entries
- Generate project structure from `templates/_sdd/`
- Create docs and .sdd/project/
- Help implement code
- Track token usage

## /sdd commands
When the user asks with the `/sdd` prefix, use this command mapping:

| Input | Action | Output |
|-------|--------|--------|
| `/sdd "prompt"` | Execute chain graph | docs/, .sdd/project/, project/, templates |
| `/sdd-analyze` | Read .sdd/, explain it | System explanation |
| `/sdd-status` | Token and decision status | Status report |
| `/sdd-decisions` | List decisions | Decision list |

## /sdd execution order
1. Read `.sdd/PROJECT.sdd`
2. Read `.sdd/chains/graph.sdd`
3. Read `.sdd/chains/selector.sdd`
4. Read `templates/INDEX.sdd` — reusable templates
5. Read `.sdd/skills/cross-cutting/project-structure/generator.sdd`
   — generation pipeline
6. Select chain: `D0 -> D1 -> D0 -> S1 -> D0 -> C1 -> D0`
7. Record tokens at every stage: `tokens: in=X, out=Y, delta=Z`
8. Follow human gates: `[gate: human_required]`
9. Create `.sdd/decisions/DEC-XXX.sdd`
10. Create `.sdd/chains/tokens/{stage}.sdd`

Rules:
- Read `.sdd/` until `/sdd` arrives; do not touch `project/`
- `templates/_sdd/` is scaffolding, `.sdd/project/` is schema,
  `project/` is concrete — do not mix the assignments
- Create `.sdd/project/` and `project/` only after human approval
- Create a decision ledger entry at every step
- Token minimalism: short IDs, indexes, lazy loading

## What you cannot do
- Pass human gates yourself
- Make changes without a decision ledger entry
- Break `.sdd/` rules
- Modify `project/` code before S1 approval

## Format rules
- Every answer is short, concrete, on-point
- Use plain English (Azerbaijani customers' raw prompts are
  preserved verbatim in the prompt-pair ledger — [R104])
- Give `.sdd/` references in `@path` format
- Show token usage: `tokens: in=1200, out=3400, delta=2200`
