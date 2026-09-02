# SDDRA Human Documentation

This directory contains human-readable documentation for the SDDRA system,
organized by topic with a book-like navigation structure.

## Structure

```
.claude/docs/
├── INDEX.md                    ← This file (master TOC)
├── README.md                   ← Doc system overview
├── overview/                   ← ECC integration and architecture
│   ├── INDEX.md
│   ├── ecc-integration.md
│   └── chain-graph-comparison.md
├── agents/                     ← Agent system documentation
│   ├── INDEX.md
│   ├── overview.md
│   ├── roles.md
│   ├── capabilities.md
│   ├── policies.md
│   └── mapping/
│       ├── agent-mapping.tsv
│       └── skill-crosswalk.tsv
├── api/                        ← API and token management
│   ├── INDEX.md
│   └── usage.md
└── data/                       ← Raw data tables
    ├── INDEX.md
    └── ecc-mapping.tsv
```

## Append Protocol

Documents in this tree use append markers to enable token-efficient updates.
AI should:

1. Read the category `INDEX.md` to find the target document
2. Read the target document and locate the `[APPEND:<SECTION_ID>]` marker
3. Insert new content between start and end markers
4. Update the `<!-- Last updated: -->` timestamp
5. Update the category `INDEX.md` table if a new section was added

## Related Documentation

- [SDDRA Documentation Index](.sdd/docs/INDEX.md) — Machine-readable docs
- [SDDRA Overview](.sdd/docs/overview/sdd-overview.md)
- [Project README](../README.md)
