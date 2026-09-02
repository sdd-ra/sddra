<!-- [APPEND:ecc-integration-overview] -->
<!-- Section: ECC Integration Overview -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# ECC → SDD Integration Guide

This document explains how the Everything-Claude-Code (ECC) framework integrates
with the SDD specification system.

## Overview

<!-- [END:APPEND:ecc-integration-overview] -->

<!-- [APPEND:ecc-integration-matrix] -->
<!-- Section: ECC to SDD Overview Matrix -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| ECC | SDD |
|-----|-----|
| 67 agents | 14 roles (+ 23 specialty) |
| 281 skills | `.sdd/skills/` |
| 94 commands | `.sdd/commands/` (14) + `.claude/commands/` |
| 21 hooks | `.sdd/runtime/adapter-runtime.sdd` |
| 35 MCP servers | New integration layer |

## Agent Bridge

<!-- [END:APPEND:ecc-integration-matrix] -->

<!-- [APPEND:ecc-agent-bridge] -->
<!-- Section: Agent Bridge -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

ECC agents provide implementation details; SDD roles define abstract responsibilities.

| ECC Agent | SDD Role | Usage |
|-----------|----------|-------|
| `code-reviewer` | `@agent.reviewer` | Use at R1 (review) gate |
| `architect` + `code-architect` | `@agent.architect` | Use at D1 (docs) gate |
| `build-error-resolver` | `@agent.implementer` | Use at C1 (code) gate |
| `security-reviewer` + `security-scan` | `@agent.security` | Use at R1 with AgentShield |
| `e2e-runner` | `@agent.tester` | Use at DEP1 (deploy) gate |
| `doc-updater` | `@agent.documentation` | Use after D1 stage |
| `loop-operator` | `@agent.supervisor` | Orchestration coordination |

## Skill Import Priority

<!-- [END:APPEND:ecc-agent-bridge] -->

<!-- [APPEND:ecc-skill-import] -->
<!-- Section: Skill Import Priority -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### P0: Critical (Import First)
- `tdd-workflow` → C1 chain arm
- `security-review` → R1 chain arm
- `build-error-resolver` → C1 chain arm
- `code-architect` → D1 chain arm

### P1: High Value
- `django-tdd`, `golang-patterns`, `typescript-patterns`
- `database-reviewer`, `security-scan`, `code-review`

### P2: Language-Specific
- `go-reviewer`, `python-reviewer`, `rust-reviewer`, etc.
- Mapped to `@agent.reviewer` role with language tags

### P3: Specialty
- `healthcare-reviewer`, `homelab-architect`, `marketing-agent`
- Documented as references only

## Workflow Integration

<!-- [END:APPEND:ecc-skill-import] -->

<!-- [APPEND:ecc-workflow-integration] -->
<!-- Section: Workflow Integration -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Hybrid Chain
```
D0 → P1 → D1(ECC planner) → S1(ECC architect) → C1(ECC builder + TDD) → R1(ECC reviewer + AgentShield) → DEP1(ECC MCP tools)
```

### Key Integrations
1. **ECC planners** → SDD D1 (Docs) stage
2. **ECC builder agents** → SDD C1 (Code) stage
3. **ECC reviewer agents** → SDD R1 (Review) stage
4. **ECC MCP tools** → SDD DEP1 (Deploy) stage
5. **ECC session memory** → SDD runtime state persistence

## Best Practices Alignment

<!-- [END:APPEND:ecc-workflow-integration] -->

<!-- [APPEND:ecc-best-practices] -->
<!-- Section: Best Practices Alignment -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| ECC Practice | SDD Equivalent | Integration |
|--------------|----------------|-------------|
| Confidence-threshold review | SDD quality gates | Import to R1 gate |
| Diff-aware scanning | Security controls | Map to PAT_* patterns |
| Multi-reviewer (language-specific) | @agent.reviewer specializations | Add language tags |
| OWASP Top 10 audit | Security levels L0-L5 | Map to L2+ controls |
| Session memory persistence | Runtime state DB | Use .sdd/runtime/state.sdd |

## MCP Server Integration

<!-- [END:APPEND:ecc-best-practices] -->

<!-- [APPEND:ecc-mcp-integration] -->
<!-- Section: MCP Server Integration -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

ECC provides 35 MCP servers. SDD needs an integration layer in
`.sdd/runtime/mcp-integration.sdd` to route these through the adapter-runtime.

**Default-enabled MCP:** `chrome-devtools` (1 server)
**Opt-in required for:** GitHub, Supabase, Vercel, Railway, etc.

## Getting Started

<!-- [END:APPEND:ecc-mcp-integration] -->

<!-- [APPEND:ecc-getting-started] -->
<!-- Section: Getting Started -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

1. Read `.claude/docs/overview/ecc-integration.md` (this file)
2. Check `.claude/docs/data/ecc-mapping.tsv` for component mapping
3. Review `.claude/docs/agents/mapping/skill-crosswalk.tsv` for skill imports
4. See `.claude/docs/agents/mapping/agent-mapping.tsv` for agent bridge
5. Read `.sdd/agent/ecc-bridge.sdd` for bridge specification
6. Read `.sdd/evolution/import-plan.sdd` for import roadmap

## Command Quick Reference

<!-- [END:APPEND:ecc-getting-started] -->

<!-- [APPEND:ecc-command-reference] -->
<!-- Section: Command Quick Reference -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| ECC Command | SDD Command |
|-------------|-------------|
| `/plan` | `/sdd P1` |
| `/code-review` | `/sdd R1` |
| `/security-scan` | `/sdd R1 + AgentShield` |
| `/build-fix` | `/sdd C1` |
| `/sdd` | `/sdd` (orchestration) |

<!-- [END:APPEND:ecc-command-reference] -->
