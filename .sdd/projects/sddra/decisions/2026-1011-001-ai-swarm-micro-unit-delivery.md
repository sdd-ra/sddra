# DEC-2026-1011-001 — /sdd-swarm + SW1 chain: parallel micro-unit delivery with defect-focus loop

Date: 2026-10-11
Status: proposed
Type: architectural
Owner: human (proposer), AI (analysis)

## Context

User directive (2026-10-11): (1) deep analysis of gaps and problems; (2)
new command: a 16-stage macro pipeline
(DB→DB_Test→BE→BE_Test→API→API_Test→FE→FE_Test→Unit→Unit_Test→E2E→E2E_Test→Full→Refactor→FindBug→Release)
that is macro-sequential BUT each stage decomposes its scope into tiny
micro-units, those units run in parallel across independent subagents,
the supervisor watches the results, and after merge + test-case check,
if there is a defect — the loop drops and this time focuses ONLY on that
defect to fix it. The piece must be so small that the AI can execute it
in one step and with minimal tokens.

## Analysis — current coverage (verified against repo)

| # | Proposal | Existing SDDRA construct | Verdict |
|---|----------|---------------------------|---------|
| 1 | Micro-unit primitive (≤1 file / ≤150 line diff / ≤8k token context pack / 1 subagent step) | SUBTASK is the smallest unit (MODUL→CASE→TASK→SUBTASK) but has NO sizing rule — "one step / minimal tokens" is not a constraint | GAP — new MICRO-UNIT entity with budget rules |
| 2 | Phantom command drift | `impl-parallel-execution.sdd` defines /sdd-parallel, /sdd-fanout, /sdd-merge; `impl-intelligent-runtime.sdd` defines /sdd-run, /sdd-metrics, /sdd-optimize. NONE are registered in `.sdd/commands/INDEX.sdd` (31 real commands, none match) — violates [CMD8]/[R98] | DRIFT — redirect phantom refs to /sdd-swarm; retire old names as aliases |
| 3 | Defect-focus loop | LOOP-PROTECTION BLOCKS loops; there is no FOCUS primitive: defect→micro-unit attribution, narrow-context re-dispatch. FIX/REWORK only at task/subtask level | GAP — new FOCUS loop inside SW1 cycle |
| 4 | User pipeline not representable in DL1 | Stages UNIT, UNIT_TS, E2E, E2E_TS, FULL, global RF (after tests, not in-branch), FB (FindBug), REL do not exist in DL1; DL1 VR ends the flow, release gate is external | GAP — 8 new stages + SW1 chain (DL1 untouched, immutable) |
| 5 | Combined parallel progress view | /sdd-status is decision-chain oriented; no micro-unit board | GAP — /sdd-swarm --board |
| 6 | Broken navigation refs | `.sdd/INDEX.sdd` references `@orchestrator/INDEX.sdd` (3×) and `@workflow/intelligent-runtime.sdd` — neither exists (real file: `impl-intelligent-runtime.sdd`) | DRIFT — fix refs |
| 7 | Blocked/hygiene state | current.sdd: workflow complete; 23 no-op /sdd-next invocations grew prompt-pairs.jsonl to 463 lines; LoopGuard blocks /sdd-next until a new DEC exists | This DEC is the path forward |
| 8 | L5 Multi-Agent Orchestration | MAP.md: L5 PENDING — user request is exactly this layer | GAP — SW1 + /sdd-swarm deliver L5 |

## Verdict summary

- **EXISTS (verified)**: 0 — every item is a gap or drift
- **PARTIAL (extend)**: 0
- **GAP (new spec)**: 5 — #1 micro-unit, #3 defect-focus loop, #4 user pipeline stages, #5 board, #8 L5
- **DRIFT (fix)**: 3 — #2 phantom commands, #6 broken refs, #7 blocked state
- Net new work: 5 new specs + 1 new chain + 1 new command + 3 drift fixes, all S1/L5-layer

## Proposal (if approved)

- New `/sdd-swarm` command + SW1 chain (D1): DL1 is immutable — SW1 is a
  separate chain, not an overlay.
- Micro-unit budget (D2): ≤1 file / ≤150 line diff / ≤8k token context
  pack / 1 subagent step. Budget-exceeded units are recursively
  subdivided.
- Generic spec + dry-run on sddra (D3): real small slice
  (sdd-adapter/src one module), 2-3 micro-units, injected defect focused
  into ≤3 focus iterations.
- 8 new stages in workflow/stages.sdd: UNIT, UNIT_TS, E2E, E2E_TS, FULL,
  RF-G (RF global instance scoped per RFScopedSemantics), FB, REL.
- SW1 pipeline keys: DB→DB-TS→BE→BE-TS→API→API-TS→FE→FE-TS→UNIT→UNIT-TS→E2E→E2E-TS→FULL→RF-G→FB→REL.
- 3-way command registry ([CMD8]): .sdd/commands/sdd-swarm.sdd +
  .claude/commands/sdd-swarm.md + .kilo/command/sdd-swarm.md.
- Runtime-only state (never committed, [R103]): .specdd/swarm/{run_id}/state.sdd.
- All follow [EVO-01]-style records, DEC entries, /sdd-health verification,
  [R95] commit refs, [R99] UTF-8 only, [R104] prompt-pairs append.

## Gate

[gate: human_required] — approve scope (D1-D3) to advance to S1
(spec drafting), or amend.

## Approval

- **APPROVED** — 2026-10-11, human. Scope: /sdd-swarm command, SW1
  chain, micro-unit budget (D1-D3), 8 new stages, 3-way registry,
  phantom-command redirects, broken-ref fixes, dry-run on sddra.
  Status: proposed -> approved.

State: proposed