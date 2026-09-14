# DEC-2026-0913-002 — Docker reference implementation + rules R91-R105

id: DEC-2026-0913-002
type: architectural
status: closed
title: Sandbox reference implementation + housekeeping rules R91-R105
context: [R59-R66] execution rules needed a concrete compose reference;
  review-driven completion requests (user review feedback) surfaced
  gaps in commit discipline, tmp usage, UTF-8 integrity, duplication
  routing, and registry purity.
problem: Rules existed as principles without a canonical runnable
  reference and without enforcement points.
options:
  - option: encode R91-R105 + hardened docker-compose reference
    pros: [one canonical reference, machine-checkable rules, health-gated]
    cons: [compose file becomes normative]
    cost: LOW
  - option: keep principles, document examples ad hoc
    pros: [no normative file]
    cons: [drift, unverifiable]
    cost: LOW
decision: encode rules + compose reference
rationale: SDDRA's own repo must be the first system governed by its
  rules; the compose file encodes [R59-R66]/[R91]/[R92]/[R102] with
  resource limits, read-only rootfs, internal network.
impact:
  files: [.sdd/PROJECT.sdd, docker-compose.yml, .sdd/workflow/stages.sdd]
  modules: [process, runtime, workflow]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-13
implementation:
  - R91-R105 added to PROJECT.sdd
  - compose reference: local build only, var/ mounts only, limits
  - RF scoped-refactor stage + CR ReviewPillars (workflow/stages.sdd)
State: closed
