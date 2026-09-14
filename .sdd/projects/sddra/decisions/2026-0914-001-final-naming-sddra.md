# DEC-2026-0914-001 — Final naming: SDDRA = SDD & Reasoning Architecture, repo sddra

id: DEC-2026-0914-001
type: operational
status: closed
title: Settle final naming — expansion "SDD & Reasoning Architecture", repo renamed to sddra
context: DEC-2026-0913-006 performed an intermediate repo rename; the
  user settled the final identity: the expansion is "SDD & Reasoning
  Architecture" and the repo name is sddra (short, discoverable,
  matches package name sddra). Earlier repository names are retired
  and MUST NOT appear anywhere in the repo, its history, or its PRs.
problem: One name everywhere — README/docs/plugin manifests/package
  metadata/remote URL must not diverge; retired names are treated as
  provenance pollution (same standing as [R103] AI signatures).
options:
  - option: rename to sddra + expansion SDD & Reasoning Architecture
    pros: [matches package.json name, short/discoverable, one identity]
    cons: [URL churn once more]
    cost: LOW
  - option: keep the intermediate name, expansion stays Spec-Driven
    pros: [no churn]
    cons: [longer name, diverges from package name, the "Spec-Driven
      Development & Engineering" expansion was never the user's
      chosen identity]
    cost: LOW
decision: sddra everywhere; expansion "SDD & Reasoning Architecture"
rationale: The repo is the product — the name should be the product
  name. GitHub auto-redirects old URLs after rename, so churn cost is
  near zero.
impact:
  files: [README.md, docs/, package.json, .claude-plugin/plugin.json, .codex-plugin/plugin.json, .cursor-plugin/plugin.json, .kimi-plugin/plugin.json, .hermes-plugin/plugin.yaml, .pi/extensions/sddra.ts, .kilo/skills/sddra/SKILL.md]
  modules: [docs, plugins, package]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-14
implementation:
  - README/docs/package/plugin manifests updated to sddra URLs
  - expansion "SDD & Reasoning Architecture" in all title surfaces
  - GitHub repo renamed to sddra (redirect preserved)
  - local remote URL updated to RasimAghayev/sddra.git
State: closed
