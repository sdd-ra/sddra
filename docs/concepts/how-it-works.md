# How SDDRA Works

A deep, plain-language tour of the system. Source of truth: the
`.sdd/` spec tree (English); this doc is its human-facing surface.

## 1. The core idea: contracts before code

Most AI-coding failures are intent failures: the agent produced
plausible code for an unstated goal. SDDRA inverts the flow — the
intent is written down as a machine-checkable contract (`.sdd/`
files) BEFORE any code exists. The AI then operates inside the
contract; when the contract is ambiguous, the system stops and asks
instead of guessing.

## 2. The chain graph

Work enters through a prompt and flows through six arms:

- **P1 (Prompt)** — classify the request, resolve ambiguity (or
  escalate via DEC/TASK per [R104])
- **D1 (Docs)** — produce human-readable documentation
- **S1 (Spec)** — write/patch `.sdd/` specifications
- **C1 (Code)** — implement, inside the Docker sandbox only ([R102])
- **R1 (Review)** — 4-pillar review: architecture, code quality
  (DRY), test quality, performance
- **DEP1 (Deploy)** — release per the deployment strategy

All arms start and end at **D0**, the checkpoint center. State is
persisted, never remembered: `/sdd-next` continues from saved state,
not from chat context ([DL1-2]).

## 3. Human gates — minimal by design

A human approves only what is **irreversible or architectural**:
merging to main, schema migrations, security decisions, L4 authority
actions (Phase 131: the interrupt primitive fires structurally before
irreversible nodes — the agent cannot talk its way past it).

Everything else — reviews, refactors, test fixes — is AI-scoped
(CR-XX → RF-XX). SDDRA explicitly rejects the "review treadmill"
where a human QA-checks every robot output; that trades one problem
for a worse one.

## 4. State symbols and liveness

Every `.sdd` file carries a `State:` marker:

- `+` — active (routing includes it)
- `-` — inactive (kept for history, not routed)
- `~` — archived

Drift between state markers and reality is a health finding.

## 5. EXPAND token protocol

Long files do not load wholesale. Files declare
`InitialLoad`/`ReadOrder` sections; everything else is loaded on
demand via the EXPAND protocol (Phase 151). `/sdd-plan` serves plans
from a fingerprint cache — 100 invocations of an unchanged repo cost
1 scan + 99 cache hits.

## 6. Memory model

SDDRA memory is the registry, not the chat: phases, tasks, decisions
(DEC ledger with typed outcomes), context files, and prompt-pair
history (`prompts/history/prompt-pairs.jsonl`, [R104]). What the
agent "remembers" between sessions is exactly what it committed.

## 7. Bug registry

Bugs enter a typed registry (not a chat thread): impact scope,
affected stages, reproduction, severity. Fixes route through the
delivery chain with the same gates as features.

## 8. Skills

Engineering knowledge lives in `.sdd/skills/` — 12 languages,
17 frameworks, databases, platforms, plus design, writing, and
meta-skills. Skills are executable contracts ([SK19]) with lifecycle
rules ([SK6] DISCOVER→…→UPDATE); they are never edited in place.
Kilo users get thin routing wrappers in `.kilo/skills/sddra*`
([R106]).

## 9. Security posture

- All execution inside a locked sandbox: read-only rootfs, no-new-
  privileges, resource limits, internal-only network, `var/` mounts
  only ([R59]-[R66], [R91], [R92], [R102])
- Security alerts are fixed before product work ([R101])
- No AI signatures in git history; authorship is human ([R97], [R103])
- Mojibake/encoding defects are CRITICAL ([R99])

## 10. A session in practice

1. You drop a request (any language) — via prompt file or `/sdd "…"`
2. `/sdd-plan` classifies it to an arm and produces the 16-step
   execution trace (BIG vs SMALL change mode)
3. The chain runs; irreversible steps interrupt for approval
4. `/sdd-health` verifies: critical files, 30-command 3-way sync,
   mojibake scan, projects purity
5. The task ends with a semantic commit referencing DEC/TASK ids
   ([R95]); registries update; next session resumes from state
