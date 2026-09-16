# DEC 2026-0915-001 — AI Engineering Operating System: 20-Point Gap Analysis

Date: 2026-09-15
Status: approved/implemented (S1+C1)
Type: architectural
Owner: human (proposer), AI (analysis)

## Context

User proposal: evolve SDDRA from "SDD + AI coding flow" into a full
**AI Engineering Operating System** — 20 mechanisms (EVIDENCE layer,
ASSUMPTION system, QUESTION→DECISION, ADR format, REVERSIBILITY
score, BLAST RADIUS, RISK SCORE, SC-D/C/R three-level security,
Dependency Firewall, Architecture Fitness Rules, Architecture
Linter, Monolith/Microservice Compatibility Gate, Architecture
Migration Score, DRIFT DETECTION, TRACEABILITY, CHANGE IMPACT
ANALYSIS, STOP CONDITIONS, HUMAN APPROVAL GATE, Context Budget,
unified architecture model).

## Analysis — current coverage (verified against repo)

| # | Proposal | Existing SDDRA construct | Verdict |
|---|----------|---------------------------|---------|
| 1 | EVIDENCE layer (CASE→…→EVIDENCE→DONE) | @tasks/DONE-PROOF.sdd — 5-dimension proof template (tests/architecture/rules/docs evidence) before DONE | EXISTS — extend CASE-level scope if gaps found |
| 2 | ASSUMPTION system (ASM-xxx, confidence, BLOCKED on critical) | @assumptions/INDEX.sdd registry + /sdd-assumptions command; epistemic layers (@concepts/epistemic-entities.sdd: ASSUMPTION distinct from FACT) | EXISTS — verify confidence+BLOCKED wiring |
| 3 | QUESTION→DECISION (Q-xxx ledger, no repeat questions) | No Q-entity registry. Closest: intents/ (@intents/) classify but do not persist open questions | GAP (partial) — new QUESTION entity + DEC link |
| 4 | ADR format (Context/Options/Why/Trade-offs/Consequences/Security/Reversibility) | @concepts/decision-canvas.sdd — CONTEXT, OPTIONS, TRADE-OFFS sections ([DC-03]) | EXISTS — add SECURITY IMPACT + REVERSIBILITY fields to canvas |
| 5 | REVERSIBILITY score | Phase 131 risk engine: "risk engine scoring reversibility/blast radius/environment/data criticality" (session digest ses_fc5535e3effe) + @agent/roles.sdd blast-radius mapping | EXISTS — verify per-DEC field + review-strength rule |
| 6 | BLAST RADIUS (per CASE) | Risk engine blast radius (roles.sdd); deployment.sdd blast radius | PARTIAL — extend to CASE-level impact field |
| 7 | RISK SCORE (security/data/availability/…; LOW→flow, CRITICAL→human) | Phase 131 5 authority levels L0-L4 + risk engine scoring | EXISTS — verify dimension breakdown surface |
| 8 | SC-D/SC-C/SC-R three-level security | Gates: SEC.SAST, SEC.DEP, SEC.SECRET, SEC.CONTAINER, SEC.DAST, SEC.ABUSE, SEC.API, SEC.PENTEST, SEC.IAC (@gates/security/); cicd-pipeline.sdd maps all to PR pipeline; SC stage in DL1 v2 | EXISTS — map SC-D (design-time threat model) explicitly; SC-C/SC-R covered |
| 9 | Dependency Firewall (request→approval before adding; allowed-deps manifest) | @gates/dependency-gate.sdd Phase 155: 9-check gate, APPROVE/REJECT, HardFail, DEFER→assumptions; [DG1] no APPROVE → never added | EXISTS — allowed-dependencies.yaml manifest = enhancement candidate |
| 10 | Architecture Fitness Rules (import bans, CI-checked) | @queries/architecture-drift.sdd + /sdd-drift + drift-detection query; enforcement layers L1-L3 | PARTIAL — fitness-rule DSL + CI adapter candidate |
| 11 | Architecture LINTER | No dedicated arch-linter spec. Drift queries cover spec-vs-reality, not import-graph lint | GAP — new spec + CI adapter |
| 12 | Mono/Micro Compatibility Gate (per-module deployment modes) | @architecture/patterns.sdd Monolith+Microservices supported; migration registry @legacy/ | PARTIAL — per-module compatibility manifest = new spec |
| 13 | Architecture Migration Score (coupling/cohesion/DB/API isolation) | No quantitative readiness score spec | GAP — new scoring spec (offline analysis) |
| 14 | DRIFT DETECTION (expected vs actual, DEC review trigger) | @queries/drift-detection.sdd + architecture-drift.sdd + /sdd-drift + /sdd-sync | EXISTS |
| 15 | TRACEABILITY (CODE→CASE→TASK→DEC→REQ chain) | @queries/traceability.sdd + /sdd-trace bidirectional | EXISTS |
| 16 | CHANGE IMPACT ANALYSIS (pre-CASE affected-layers, pipeline auto-expand) | dependencies/ graph engine (DAG, impact); per-layer pipeline in DL1 | PARTIAL — pre-CASE impact step + auto pipeline expansion |
| 17 | STOP CONDITIONS (ambiguous req, unresolved risk, …) | STOP→REPORT→WAIT pattern in EXECUTION-CONTRACT/loop protection; [R101] security-first; gates block | EXISTS — verify enumerated stop list completeness |
| 18 | HUMAN APPROVAL GATE (auto vs human-required lists) | Phase 131 authority levels; CLAUDE.md 4 impassable gates; @agent/approvals.sdd | EXISTS |
| 19 | Context Budget (minimal per-CASE context pack) | /sdd-context minimal context pack command; [CMD7] InitialLoad; context/cache.sdd pull-based | EXISTS — verify CASE-scope variant |
| 20 | Unified architecture (QUESTION→DECISION→TASK→CASE→EVIDENCE; security parallel SC-D/C/R; CI/CD enforcement gates) | Chain graph D0/7 arms; DL1 v2 delivery chain; cicd-pipeline 12-step mapping | EXISTS (model) — proposal's 3 gaps fold in: #3, #11, #13 |

## Verdict summary

- **EXISTS (verified)**: 12 — #1, #2, #4, #5, #7, #8, #9, #14, #15, #17, #18, #19
- **PARTIAL (extend)**: 4 — #6, #10, #12, #16
- **GAP (new spec)**: 3 — #3 QUESTION ledger, #11 Architecture Linter, #13 Migration Score
- Net new work: 3 new specs + 4 extensions, all S1-layer (.sdd system)

## Proposal (if approved)

- Phase 157: QUESTION entity registry (Q-xxx → DEC link, dedup of
  asked questions) — closes #3
- Phase 158: Architecture Linter spec (import-graph rules → CI
  adapter, reuses drift-query patterns) — closes #11
- Phase 159: Architecture Migration Score spec (coupling/cohesion/
  DB/API isolation scoring per module) — closes #13
- Extensions bundled into respective phases: #4 canvas fields,
  #6 CASE blast-radius field, #10 fitness-rule DSL, #12 module
  compatibility manifest, #16 pre-CASE impact step
- All follow [EVO-01]-style records, DEC entries, /sdd-health
  verification, [R95] commit refs

## Gate

[gate: human_required] — approve scope/verdicts to advance to S1
(spec drafting), or amend.

## Approval

- **APPROVED** — 2026-09-15T04:58:41Z, human (session). Scope:
  Phase 157 (QUESTION registry), Phase 158 (Architecture Linter),
  Phase 159 (Migration Readiness), plus bundled extensions
  (#4 canvas fields, #6 CASE blast radius, #10 fitness DSL, #12
  module compatibility manifest, #16 pre-CASE impact step).
  Status: proposed -> approved -> implemented (S1 in same session).
