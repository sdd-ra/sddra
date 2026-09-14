# DEC-2026-0913-001 — Security-first ordering + AI-signature history purge

Decision: Schema-compliant record
id: DEC-2026-0913-001
type: security
status: closed
title: Security-first ordering + AI-signature purge from git history
context: Dependabot/security alerts must never queue behind product
  work; git history carried AI-agent signature trailers, violating
  human authorship.
problem: Unordered alert handling defers risk; AI signatures in
  history misattribute authorship and pollute provenance.
options:
  - option: security-first ordering + full history signature purge
    pros: [risk-first discipline, clean provenance, matches [R101]/[R103]]
    cons: [history rewrite requires force-push consent]
    cost: LOW
  - option: alerts in normal backlog + signatures removed going forward
    pros: [no history rewrite]
    cons: [risk deferral, permanent provenance pollution]
    cost: LOW
decision: security-first ordering + full history purge
rationale: Security and provenance are irreversible-in-nature; both
  must be fixed before any product work continues.
impact:
  files: [.sdd/PROJECT.sdd, git history all branches]
  modules: [process, governance]
  risks: [R1]
owner: human
approved_by: human
approved_at: 2026-09-13
implementation:
  - [R101] security-first ordering encoded in PROJECT.sdd
  - [R103] AI-signature ban encoded; signatures purged from all
    branches (2026-09-13); force-push consent pending user
State: closed
