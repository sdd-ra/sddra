# ECC Framework Integration Guide

This guide explains how SDDRA integrates with the ECC (Enterprise Coordination Core) framework.

## Overview

SDDRA bridges to ECC through a multi-layer integration defined across several `.sdd` specs:

| ECCEntity | Count | SDD Mapping |
|-----------|-------|-------------|
| Agents | 67 | `agent/ecc-bridge.sdd` — mapped to 8 core + 4 specialty SDD roles |
| Skills | 281 | `.sdd/skills/` — adapted to SDD skill format |
| Commands | 94 | `commands/INDEX.sdd` — 17 SDD `/sdd-*` commands bridged |
| MCP Servers | 35 | `runtime/mcp-integration.sdd` — GateBridge/SecurityBridge/MemoryBridge |
| AgentShield Rules | 102 | `agent/security-rules.sdd` — mapped to L0-L5 security levels |

## Agent Mapping

ECC's 67 agents are consolidated into SDD's abstract role model:

### Core Roles (91% of ECC agents)

- `@agent.discovery` ← `code-explorer`
- `@agent.architect` ← `architect`, `code-architect`
- `@agent.implementer` ← `build-error-resolver` + variants, `tdd-guide`, `refactor-cleaner` (9 agents)
- `@agent.reviewer` ← all language-specific reviewers + quality reviewers (16 agents)
- `@agent.tester` ← `e2e-runner`
- `@agent.documentation` ← `doc-updater`, `docs-lookup`, `prompt-engineering`
- `@agent.security` ← `security-reviewer`, `security-scan`

### Specialty Roles (9% of ECC agents)

- `@agent.healthcare` ← `healthcare-reviewer`
- `@agent.ml` ← `mle-reviewer`, `gan-generator`, `gan-evaluator`, `gan-planner`
- `@agent.devops` ← `homelab-architect`, `mcp-setup`
- `@agent.business` ← `marketing-agent`, `chief-of-staff`

### Supervision (4 agents)

- `@agent.supervisor` ← `loop-operator`, `harness-optimizer`, `orchestration-planner`, `orchestration-deployer`

## Security Integration

AgentShield's 102 static rules are mapped to 5 categories spanning SDD L0-L5 levels:

| Category | ECC Rules | SDD Controls | L-Level |
|----------|-----------|--------------|---------|
| Secrets Detection | 14 patterns | `PAT_SECRET_*` | L2 |
| Permission Auditing | AG1-AG10 | `@permissions.sdd` | L3 |
| Hook Injection | ADAPTER1-15 | `adapter-runtime.sdd` | L4 |
| MCP Risk Profiling | 35 servers | `mcp-integration.sdd` | L3-L4 |
| Agent Config Review | AG1-AG10 | `@roles.sdd` validation | L2-L5 |

**Enforcement modes:**
- `OBSERVE`: L1-L3 patterns, warnings logged
- `ENFORCE`: L4-L5 patterns, blocks on critical findings (grade F)

## Memory & Hooks Bridge

| ECC Hook | SDD Integration |
|----------|-----------------|
| `SessionStart` | `TaskMemory` loading via `runtime/memory-model.sdd` |
| `PostToolUse[Edit/Write]` | Security controls enforcement via `adapter-runtime.sdd` |
| `Stop` | Memory consolidation (100 events → 3 decisions + 1 skill) |

## Commands Bridge

ECC's 94 commands are bridged to SDD's 17 `/sdd-*` commands, with key mappings:

| SDD Command | ECC Equivalent |
|-------------|----------------|
| `/sdd-plan` | `orchestration-planner` |
| `/sdd-analyze` | `code-explorer` + `agent-evaluator` |
| `/sdd-explain` | `doc-updater` + `conversation-analyzer` |
| `/sdd-knowledge` | `conversation-analyzer` + `knowledge-lifecycle` |

## Getting Started

1. Read `agent/ecc-bridge.sdd` for the full agent mapping
2. Read `agent/security-rules.sdd` for security enforcement details
3. Read `runtime/mcp-integration.sdd` for MCP server integration
4. Read `agent/supervisor.sdd` for orchestration details
5. Browse `agent/prompts/` for ECC agent prompt summaries
