# DEC-2026-0913-006 — Rename sddra + projects-dir purity + open-source docs

> Partially superseded 2026-09-14 by DEC-2026-0914-001: final naming
> settled as SDDRA = "SDD & Reasoning Architecture" with repo name
> **sddra** (sddra was an intermediate step). Purity ([R105])
> and docs decisions below remain in force.

id: DEC-2026-0913-006
type: operational
status: closed
title: Rename to sddra, enforce projects purity, ship EN open-source docs suite
context: Repo identity needed the new name everywhere; .sdd/projects/
  risked accumulating foreign folders; global-readiness required an
  English documentation surface with install paths and contribution
  guides.
problem: Consistent naming, registry purity, and a global audience
  surface were missing.
options:
  - option: rename + [R105] purity rule + full docs/ suite + README rewrite
    pros: [one identity, guarded registry, global onboarding path]
    cons: [docs maintenance surface grows]
    cost: MEDIUM
  - option: keep AZ-primary docs, no rename
    pros: [no churn]
    cons: [naming drift, unreachable global audience]
    cost: LOW
decision: rename + purity + EN docs suite
rationale: Open-source intent is explicit; docs/ is the global human
  surface while .sdd remains the machine source of truth; README
  becomes a hub (references, not duplication); MIT LICENSE added;
  install doc offers 3 paths with honest trade-offs.
impact:
  files: [README.md, LICENSE, docs/, .sdd/PROJECT.sdd (R105), .sdd/docs/analysis/repo-cleanup-analysis.md]
  modules: [docs, governance]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-13
implementation:
  - [R105] projects purity rule
  - docs/: install (3 paths), architecture (Mermaid), how-it-works,
    contributing (worked examples), philosophy, INDEX
  - README EN-first with AZ icmal; MIT LICENSE
  - cleanup analysis report delivered (deletions pending user review)
State: closed
