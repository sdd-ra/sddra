# DEC-2026-0914-003 — External research round adoptions

id: DEC-2026-0914-003
type: technical
status: closed
title: Adopt RA-1..RA-4 from external research (SpecD, context engineering field, orchestration patterns)
context: User-directed research round: find 2026 material online, adopt
  only what fits SDDRA. Sources: SpecD (context compilation, staleness
  fallback), Moderne/Sourcegraph (compiled-context token economics),
  arXiv 2602.11988 (auto-generated context files harmful), arXiv
  2602.00180 (SDD rigor taxonomy), LangGraph/Azure (loop caps, HITL
  scoping — kinship only).
problem: Independent 2026 evidence should either strengthen SDDRA
  specs or be rejected with rationale — never ignored.
options:
  - option: surgical adoptions RA-1..RA-4 + kinship validation
    pros: [evidence-backed specs, zero architecture change, 6 kinship confirmations]
    cons: [none identified]
    cost: LOW
  - option: adopt SpecD wholesale (CLI/code-graph/plugins)
    pros: [complete SDD toolchain]
    cons: [foreign runtime violates [R102] sandbox discipline and
      spec-first identity; code-graph out of core scope]
    cost: HIGH
decision: surgical adoptions
rationale: Research CONFIRMED SDDRA's core (EXPAND, InitialLoad, CR
  pillars, authority levels, loop caps all match 2026 best practice
  independently); four adoptions strengthen context compilation and
  codify an evidence-backed authorship rule.
impact:
  files: [.sdd/PROJECT.sdd (R109), .sdd/commands/sdd-context.sdd (CTX-CMD-05/06 + ContextCompilation section), .sdd/context/cache.sdd (evidence block), sdd-adapter/context-compiler.ts (dependsOnTraversal + traversal manifest), .sdd/docs/analysis/external-research-2026-09.md]
  modules: [context, governance]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-14
implementation:
  - RA-1 dependsOnTraversal: context-compiler.ts walks the spec graph
    transitively from task-declared dependencies; graph-reached specs
    gain a relevance boost; manifest carries seeds+expanded
  - RA-2 stalenessFallback: per-ref freshness policy encoded
    ([CTX-CMD-06]); stale items fall back to raw content + notice
  - RA-3 [R109]: routing files are human-authored; auto-generation is
    CRITICAL drift (arXiv 2602.11988 evidence)
  - RA-4 evidence citations in context/cache.sdd (Moderne 5-6x,
    Sourcegraph precision@5, arXiv)
  - Rejected with rationale: code-graph indexing, SpecD runtime,
    parallel lifecycle-hook system (CR/RF/VR + hook-bridge suffice)
  - Validation: 25/25 tests, /sdd-health HEALTHY (0/0/0), exit 0
State: closed
