# DEC-2026-1011-002 — Pyramid agent orchestration on SW1: dual dispatch channels, sub-agent lifecycle, reconcile gate

Date: 2026-10-11
Status: approved/implemented (Phase 161)
Type: architectural
Owner: human (proposer), AI (analysis)

## Context

User directive (2026-10-11) — continue partial agent work, deep analysis, reconcile prompt vs analysis, reconcile test cases, split work into parallel streams with subtask agents doing DB/BE/FE/MD work in parallel, then {DB,BE,FE,MD} tests with fix-on-error, a communication channel between all agents/sub-agents with error notification, and cleanup after completion.

## Analysis — current coverage (verified against repo)

| # | Proposal | Existing SDDRA construct | Verdict |
|---|----------|---------------------------|---------|
| 1 | Dual dispatch channels (R = related/ordered, F = free within-stage) | `swarm.sdd` defines SWARMCycle and parallel_ready but has no channel model; `micro-unit.sdd` lacks channel field/derivation | GAP — only binary parallel_ready exists, no channel model |
| 2 | Sub-agent lifecycle + self-delegation (spawn, notify via typed outcome, folders, cleanup) | `agent/supervisor.sdd` defines supervision but no spawn depth cap, no typed-outcome registry, no agent runtime folders, no self-delegation rule | GAP — no spawn depth cap, no typed-outcome registry, no agent folders |
| 3 | RECONCILE gate before every dispatch (registry check, orphan re-verify, block until clean) | SW1 cycle lacks explicit RECONCILE step before DECOMPOSE/DISPATCH; no sub_agent_registry[] | GAP — no pre-dispatch registry check |
| 4 | Close ladder: MU→TASK→DEC with business validation and Docker tests | Stage DONE exists ([SW1-4] stage-DONE) but close ladder not codified (MU/TASK/DEC closure steps not explicit in swarm.sdd) | GAP — only [SW1-4] stage-DONE exists |
| 5 | `.specdd/` in .gitignore (runtime state never committed) | `.specdd/` is runtime-only ([R103],[SWARM-06]) and currently untracked but not ignored by root .gitignore | GAP — untracked-but-not-ignored |
| 6 | Supervisor channel-routing duty + reconcile duty + cleanup verification before stage DONE | Supervisor has general duties but no explicit channel routing (R/F), no RECONCILE gate duty, no folder-cleanup verification before stage DONE | GAP — supervisor channel-routing duty missing |
| 7 | Test reconciliation `pyramid-orchestration.test.ts` (new) | No existing pyramid-orchestration test; registration in `sdd-adapter/__tests__/run.ts` absent | GAP — test file missing |
| 8 | Agent communication channel (typed outcomes, state-driven) | `coordination.sdd` defines state-based coordination principle and typed outcomes; no direct peer messaging required | EXISTS — coordination.sdd state-based principle + typed outcomes; no direct messaging needed |

## Verdict summary

- **EXISTS (verified):** 1 (#8)
- **PARTIAL (extend):** 0
- **GAP (new spec/fields/rules):** 7 (#1–#7)
- **DRIFT (fix):** 0
- **Net new work:** 2 new spec files + edits to swarm.sdd, micro-unit.sdd, micro-unit schema, supervisor.sdd, sdd-swarm.sdd, INDEX files + .gitignore + 1 test file

## Proposal (D1-D4)

**D1.** Extend SW1 (DL1 immutable). Add RECONCILE step, CloseLadder section, and rules [SW1-9]-[SW1-14] in `.sdd/chains/swarm.sdd`; record `sub_agent_registry[]`, `channel_routing[]`, `folders[]` in StepState. Update `.sdd/commands/sdd-swarm.sdd` (RECONCILE step, initial load, rule refs). Do not modify DL1 chain.

**D2.** Dual channel dispatch (R/F) scoped within-stage only. Create `.sdd/workflow/dispatch-channels.sdd` defining Channel R (related/ordered via depends_on, sequential), Channel F (free: parallel_ready && shared_state == none, concurrent), routing rule `channel = F iff parallel_ready && shared_state == none else R`, scope constraint (within current stage only; no cross-stage dispatch per [SW1-1]), and `channel_routing[]` recorded per dispatch.

**D3.** Sub-agent lifecycle — self-delegation spawn, depth cap 2, typed outcomes to STATE, runtime agent folders, cleanup after DONE+VERIFIED. Create `.sdd/agent/subagent-lifecycle.sdd` (levels L0 supervisor → L1 stage-agent → L2 sub-agent; depth cap 2). Sub-agent writes code in path-locked scope; parent never edits child scope ([MU-9]). Typed outcomes (SUCCESS/PARTIAL/BLOCKED/NEEDS_CLARIFICATION/POLICY_VIOLATION/TOOL_ERROR/UNSAFE) written to STATE (state-driven, not message-driven). Runtime folders `.specdd/swarm/{run_id}/agents/{agent_id}/` hold context pack + outcome + evidence; deleted only when unit DONE+VERIFIED with no open attributed defect. RECONCILE verifies registry (parent_id ownership), re-verifies or defects orphans, prefers re-verify over destructive cleanup.

**D4.** RECONCILE gate before every DISPATCH + CloseLadder (MU → TASK → DEC). Add RECONCILE as step 0 before DECOMPOSE in SW1 cycle; block new dispatch until registry clean (or explicitly waived). CloseLadder: (1) MU close on typed SUCCESS + done_proof ([MU-4]); (2) TASK close on all units DONE + business-case analysis (BDD scenarios vs acceptance) + stage tests pass in Docker; (3) DEC close on all tasks DONE + full-system tests (E2E/E2E-TS/FULL) + business validation → decision closed → next stage/decision. Supervisor enforces channel routing, RECONCILE gate, and folder-cleanup verification before stage DONE.

## Gate

[gate: human_required] — approve scope (D1-D4) to advance, or amend.

## Approval

- **APPROVED** — 2026-10-11T21:51Z, human (session). Scope: D1-D4, full Phase 161 (T1-T11): dispatch-channels.sdd, subagent-lifecycle.sdd, swarm.sdd RECONCILE+CloseLadder+[SW1-9]-[SW1-14], micro-unit channel/self-delegation+[MU-7]-[MU-9], schema fields+[MS9]-[MS11], supervisor routing/reconcile/cleanup duty+[SUP-06]-[SUP-08], sdd-swarm RECONCILE step 1, INDEX updates, .specdd/ gitignore (T9), pyramid-orchestration.test.ts (72 assertions). Validated: Docker 32/32 test files pass, 0 failures.

State: approved