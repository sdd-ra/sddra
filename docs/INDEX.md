# SDDRA Documentation

English documentation for SDDRA — SDD & Reasoning Architecture. Source of truth: the `.sdd/` spec tree.

| Doc | What it covers |
|-----|----------------|
| [Getting started — Install](getting-started/install.md) | three install paths (auto local, manual global, vendored) with pros/cons |
| [Architecture overview](architecture/overview.md) | three-language model, chain graph, delivery chain, enforcement layers (Mermaid diagrams) |
| [How it works](concepts/how-it-works.md) | deep dive: contracts, gates, state, EXPAND, memory, skills, security |
| [Contributing](contributing/contributing.md) | commands (3-way), rules, skills, architecture changes — with worked examples |
| [Philosophy](contributing/philosophy.md) | why SDDRA exists: Layer-3 contracts over review treadmills |

## Also in the repo

- `.sdd/docs/` — organized deep docs (analysis, overviews, appendices)
- `.claude/docs/` — human-facing docs (agents, API, data)
- `.sdd/INDEX.sdd` — the machine routing table for the whole spec tree

All repo documentation is English. Historical Azerbaijani input
prompts are preserved verbatim only in the append-only prompt-pair
ledger (`prompts/history/prompt-pairs.jsonl`, [R104]).
