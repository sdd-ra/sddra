# DEC-2026-0913-005 — gstack / Garry Tan / Rentier alignment

id: DEC-2026-0913-005
type: architectural
status: closed
title: Adopt 4-pillar CR review, opinionated output, BIG/SMALL change mode; reject role inflation and review treadmills
context: User directive "analiz et, öz skillərinlə uzlaşdır" — analyze
  Garry Tan's review prompt, the Rentier 3-layer critique, and
  garrytan/gstack; align SDDRA skills with them.
problem: Determine what an L3 contract system should legitimately
  absorb from L1/L2-flavored systems without degrading its gates.
options:
  - option: scoped adoption (pillars + opinionated findings + change-mode)
    pros: [sharper CR output, planning depth control, zero gate inflation]
    cons: [none identified]
    cost: LOW
  - option: full gstack model (23 role skills, every-feature review)
    pros: [proven sprint shape]
    cons: [role duplication vs agent/roles.sdd, review treadmill per
      Rentier, external clone deps conflict marketplace rules]
    cost: HIGH
decision: scoped adoption
rationale: SDDRA is Layer-3; DL1 already is the sprint equivalent;
  adoption goes to CR scope (4 pillars), agent output (one
  recommendation + rationale), and /sdd-plan depth (BIG/SMALL).
  Analysis: .sdd/docs/analysis/garry-tan-gstack-alignment.md
impact:
  files: [.sdd/workflow/stages.sdd, .sdd/agent/contract.sdd, .sdd/commands/sdd-plan.sdd, .sdd/docs/analysis/garry-tan-gstack-alignment.md]
  modules: [workflow, agent, commands]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-13
implementation:
  - CR ReviewPillars + OpinionatedRecommendations (stages.sdd)
  - OpinionatedOutput contract rule (contract.sdd)
  - ChangeMode BIG/SMALL (sdd-plan.sdd)
State: closed
