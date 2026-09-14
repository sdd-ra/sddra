# External Research Round — SDD Alignment (2026-09-14)

Status: RESEARCH COMPLETE — pros adopted below, everything else rejected
Sources:
  - SpecD (github.com/specd-sdd/SpecD, MIT, 984 commits, npm @specd/*)
  - Context engineering field reports 2026 (Moderne, Sourcegraph,
    Anthropic agentic coding report, arXiv 2602.11988, 2601.20404)
  - LangGraph/stateful orchestration patterns (arXiv 2607.19297,
    Azure AI Agent Design Patterns, Camunda agentic orchestration)
Method: [RS1] research protocol — web research → verify vs our specs
→ Pareto-decide → adopt only what fits SDDRA's Layer-3 contracts.

## Findings vs SDDRA — gap map

| # | External pattern | Evidence | SDDRA today | Verdict |
|---|-----------------|----------|-------------|---------|
| F1 | Spec dependsOn traversal in context compilation (SpecD step 4: transitive dependency walk from touched specs) | SpecD docs "Context compilation" — 5-step resolution | /sdd-context compiles by task/intent/budget; NO transitive dependsOn walk across .sdd specs | **ADOPT** — the graph data exists (dependencies/INDEX.sdd, dependency-resolver.ts) but context packs do not traverse it |
| F2 | Staleness-aware content injection (SpecD assembly: metadata when fresh, raw-content fallback when stale) | SpecD assembly step 5 | /sdd-context --validate checks staleness at pack level, not per-item assembly | **ADOPT (light)** — per-item freshness check at compile time |
| F3 | Verified 5-6x token savings from compiled context vs agent-discovered context (Moderne demo; Sourcegraph: 5K targeted > 100K summary) | Moderne 2026-04-29 live demo; Sourcegraph benchmarks | Our EXPAND/InitialLoad ([CMD7]) already implements this doctrine | **CONFIRMED KINSHIP** — no change; add citation to spec rationale |
| F4 | Auto-generated context files REDUCE agent success ~3%, raise cost 20%+; human-written improve ~4% (arXiv 2602.11988 AGENTS.md study) | arXiv evaluation | Our INDEX.sdd files are hand-authored, routing-first | **KINSHIP + RULE CANDIDATE** — codify: never auto-generate routing files |
| F5 | Code graph + impact analysis (SpecD @specd/code-graph: TS/Go/Py/PHP symbol indexing, upstream/downstream reach) | SpecD packages | /sdd-dependencies builds .sdd dependency graph — no code-symbol graph | **REJECT for now** — our scope is spec-driven governance, not code indexing; revisit when product repos need it (registry: opportunities) |
| F6 | Lifecycle hooks pre/post on state transitions (SpecD schema workflow hooks) | SpecD docs "Hooks" | hook-bridge.ts PreToolUse/PostToolUse exists — narrower (tool-level, not lifecycle-state-level) | **PARTIAL ADOPT** — add lifecycle-transition hooks concept to workflow spec as SDDRA-native hook stages (CR/RF/VR gates already act as this) |
| F7 | Mandatory verification skill post-implementation, before approval (SpecD verifying step with send-back) | SpecD lifecycle | CR-XX 4-pillar review + RF loop — already mandatory in DL1 | **CONFIRMED KINSHIP** — no change |
| F8 | HITL gates scoped to tool invocations, not full outputs (Azure pattern: low-risk auto, sensitive ops gated) | Azure AI Agent Design Patterns | Phase 131 authority levels L0-L4 — same doctrine, tool-scoped | **CONFIRMED KINSHIP** — no change |
| F9 | Iteration caps + escalation fallback for refinement loops (LangGraph/Azure: max 5-8 replans; maker-checker caps) | arXiv 2607.19297; Azure patterns | LOOP-PROTECTION.sdd failure_budget + iteration cap | **CONFIRMED KINSHIP** — no change |
| F10 | Manifest-controlled segment loading ("bill of lading" pattern; progressive disclosure ~200 tokens/skill name+desc, full on invoke) | Zylos research; Claude Code skills | InitialLoad manifests ([CMD7]) — exact same pattern | **CONFIRMED KINSHIP** — no change |
| F11 | Three-level spec rigor taxonomy: spec-first / spec-anchored / spec-as-source (arXiv 2602.00180) | Piskala SDD paper | SDDRA is spec-as-source (contracts govern) | **CITATION ONLY** — docs/concepts/how-it-works.md gains taxonomy context |

## Adoptions (pros only, SDDRA-fit)

| ID | Adoption | Where it lands | Effort |
|----|----------|---------------|--------|
| RA-1 | dependsOn traversal in /sdd-context: when compiling a pack for a task, walk the .sdd dependencies graph transitively from touched specs; include what the spec graph itself declares relevant | sdd-adapter/context-compiler.ts + commands/sdd-context.sdd spec (ContextCompilation section) | M |
| RA-2 | Per-item staleness fallback: pack items carry freshness metadata; stale items inject raw content with a staleness notice instead of silent stale metadata | context-compiler.ts + spec section | S |
| RA-3 | No auto-generated routing files rule: INDEX/InitialLoad/routing files are human-authored artifacts; generation is CRITICAL drift (evidence: arXiv 2602.11988) | PROJECT.sdd candidate R109 + /sdd-drift spec | S |
| RA-4 | Citation: EXPAND/InitialLoad doctrine gains measured-evidence references (Moderne 5-6x, Sourcegraph structural retrieval precision 0.140→0.478) | context/cache.sdd rationale block | S |

## Rejections (with rationale)

- F5 code-graph: out of SDDRA core scope today; specs govern, code
  indexing is a product-repo concern (registered as opportunity).
- F6 full lifecycle hooks: CR/RF/VR gates + hook-bridge already cover
  the need; adding a parallel hook system would violate [R81] reuse.
- SpecD CLI/MCP/plugins: SDDRA is spec-first; adapter is ours ([R102]
  sandbox discipline); no foreign runtime.

## Kinship validation (no change, confidence up)

EXPAND ([CMD7]), InitialLoad manifests, CR 4-pillar, authority levels,
loop caps, prompt-pair history — all map to 2026 field best practice.
The research round CONFIRMS SDDRA's core design against independent
evidence; four surgical adoptions strengthen it.

State: +
