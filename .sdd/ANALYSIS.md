# SDDRA System Analysis Index

Purpose:
  This file documents the analysis performed on the SDDRA system.
  It serves as a starting point for understanding the system structure,
  what was cleaned up, and where to find things.

## Analysis Date
2026-08-27

## System Overview

SDDRA is a Specification-Driven Development framework where:
- `.sdd/` = immutable AI-readable rules, schemas, workflows
- `project/` = concrete source code and project data
- `old/` = archived external assets and historical versions
- `templates/` = reusable scaffolding (now in `.sdd/templates/`)

## What Was Analyzed

### 1. .sdd/ Structure
- Total files: 300+ .sdd/.md files
- Directories: 35+ subdirectories
- Languages: Mostly English, some Azerbaijani (translated)
- Status: Clean, immutable, well-structured

### 2. Templates
- Moved from `templates/` to `.sdd/templates/`
- 12 templates created (docs, decisions, tasks, stack, modules, architecture, flows)
- All templates use `{PLACEHOLDER}` format
- Templates are READ-ONLY

### 3. External Repositories (tmp/ → old/)
- 10 external repositories audited
- Best practices extracted into .sdd/
- Originals preserved in `old/external-repo-audit/`
- See `old/INDEX.md` for mapping

### 4. Duplicate/Stale Content
- `best-practices.sdd` removed (merged into `protocol/ROOT.sdd`)
- EduNexus-specific examples replaced with generic placeholders
- PAY-1023, DEC-001..007 examples parameterized
- Old `_template/` directory removed

### 5. Translation Status
- All .sdd/ files now in English
- Azerbaijani content translated
- Mixed-content files cleaned

## Where to Start

### For Users
1. Read `README.md` — system overview
2. Read `.sdd/PROJECT.sdd` — root rules
3. Read `.sdd/INDEX.sdd` — routing table
4. Run `/sdd-analyze` in Claude CLI

### For AI Agents
1. Read `.sdd/PROJECT.sdd` first
2. Follow ReadOrder in `.sdd/INDEX.sdd`
3. Read `.sdd/protocol/ROOT.sdd` for universal rules
4. Check `.sdd/chains/graph.sdd` for execution flow
5. Use `.sdd/templates/` for scaffolding

### For Developers
1. Read `README.md` for architecture
2. Read `.sdd/architecture/architecture.sdd` for system design
3. Read `.sdd/chains/arms/*.sdd` for chain arms
4. Read `.sdd/decisions/workflow.sdd` for decision lifecycle

## Key Files

| File | Purpose | Owner |
|------|---------|-------|
| `.sdd/PROJECT.sdd` | Root router, rules | User |
| `.sdd/INDEX.sdd` | Universal routing table | User |
| `.sdd/protocol/ROOT.sdd` | Universal principles | User |
| `.sdd/chains/graph.sdd` | Chain graph definition | User |
| `.sdd/decisions/workflow.sdd` | Decision lifecycle | User |
| `.sdd/templates/INDEX.sdd` | Template index | User |
| `README.md` | System documentation | User |

## Chain Graph

```
D0 (default)
  ├─> P1 (prompt)   ──> D0
  ├─> D1 (docs)     ──> D0
  ├─> S1 (sdd)      ──> D0
  ├─> C1 (code)     ──> D0
  ├─> R1 (review)   ──> D0
  └─> DEP1 (deploy) ──> D0
```

## Decision Workflow

```
proposed → review → approved → implemented → verified → closed
```

## AI Behavior Rules

1. `.sdd/` files are IMMUTABLE — only owner can modify
2. AI creates new files in `project/`, never in `.sdd/`
3. AI updates `.sdd/` only for new decisions, tasks, or states
4. Templates in `.sdd/templates/` are READ-ONLY
5. Follow the chain graph — never skip gates
6. Record token usage for every stage
7. Create decision records for significant changes

## Cleanup Summary

| Action | Count |
|--------|-------|
| Files translated to English | 11 |
| Templates moved to .sdd/ | 12 |
| Stale references removed | 20+ |
| Duplicate files removed | 1 |
| Old directories archived | 1 (tmp/ → old/) |

## Next Steps

1. Verify all .sdd/ files are in English
2. Test chain execution with `/sdd-analyze`
3. Validate template instantiation
4. Review decision workflow examples
5. Update CLAUDE.md with new rules
