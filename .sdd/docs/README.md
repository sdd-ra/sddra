# SDDRA Machine Documentation

This directory contains machine-readable SDD specification documentation,
organized by topic with a book-like navigation structure.

## Structure

```
.sdd/docs/
├── INDEX.md                    ← This file (master TOC)
├── README.md                   ← Doc system overview
├── overview/                   ← System overview and ECC integration
│   ├── INDEX.md
│   └── sdd-overview.md
├── commands/                   ← Command reference and workflows
│   ├── INDEX.md
│   ├── reference.md
│   ├── workflow.md
│   └── auto-chain.md
├── analysis/                   ← Deep analysis documents
│   ├── INDEX.md
│   ├── system-analysis.md
│   ├── heretic-analysis.md
│   └── ecc-integration.md
└── appendices/                 ← Glossary and supplementary material
    └── glossary.md
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

- [Human Documentation Index](.claude/docs/INDEX.md) — Human-readable docs
- [SDDRA Overview](overview/sdd-overview.md)
- [Project README](../../README.md)
