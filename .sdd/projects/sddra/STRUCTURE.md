# sddra — Project Structure

Purpose:
  Detailed description of the sddra.ai codebase structure.
  Used by AI to understand the project architecture, layers,
  and where to implement new features.

## Architecture Overview

SDDRA is a Specification-Driven Development engine with two main layers:
1. **Machine Language** (`.sdd/`) — Immutable specifications, schemas, workflows
2. **Runtime** (`sdd-adapter/`) — TypeScript implementation of the SDD runtime

The project follows a layered architecture where `.sdd/` files define
the "what" and `sdd-adapter/` implements the "how".

## Directory Breakdown

### .sdd/ — Specification Layer

The source of truth for all project definitions.

#### protocol/
Core protocol definitions and root specifications.

#### chains/
Execution graph definition with 6 arms (P1, D1, S1, C1, R1, DEP1)
and 16-step execution trace.

#### decisions/
Decision ledger with DEC-XXX records, rules, and workflow states.

#### skills/
Reusable skill specifications organized by category:
- design/ — Design evaluation skills (taste, anti-slop, etc.)
- testing/ — TDD, BDD, E2E skills
- security/ — Security review and scanning skills
- backend/, frontend/ — Language/framework skills

#### tasks/
Task state machine, loop protection, autonomy policy, failure classification.

#### agent/
Agent contracts, roles, capabilities, permissions, approvals, security rules.

#### gates/
Quality gate definitions (build, test, security, lint, typecheck).

#### commands/
CLI command specifications for 17 /sdd-* commands.

#### runtime/
Runtime state management, memory model, MCP integration, adapter runtime.

#### evolution/
Self-evolution pipeline with candidates, challenges, proposals, approved.

#### projects/sddra/
**THIS PROJECT** — project-specific data, decisions, tasks, docs, stack.

### sdd-adapter/ — Runtime Implementation

TypeScript implementation of the SDD runtime.

#### src/
- `commands.ts` — Command runner with implementations
- `types.ts` — Type definitions for design/orchestration
- `design-analyzer.ts` — Design evaluation engine
- `skill-auto-invoker.ts` — Context-based skill auto-invocation
- `hook-bridge.ts` — Hook integration for provenance
- `provenance-client.ts` — HTTP client for watermarks-remover

#### tests/
Unit tests for all runtime components.

### .claude/ — Claude Code Configuration

#### commands/
Slash command definitions (sdd-*.md) with AUTO mode support.

#### sdd/
AUTO workflow engine:
- `workflow.yaml` — 6-step pipeline definition
- `state.json` — Persistent workflow state
- `decisions.json` — Autonomous decision log
- `history.json` — Append-only execution history
- `orchestrator.md` — AUTO execution protocol

#### docs/
Human-readable documentation (reorganized 2026-09-02):
- overview/ — ECC integration, chain graph comparison
- agents/ — Roles, capabilities, policies, mappings
- api/ — Token management, security controls
- data/ — Raw TSV mappings

### tmp/ — External Research & Analysis

Cloned repositories and fetched resources for analysis:
- External tools: heretic, watermarks-remover
- Skill references: agent-skills, skills, taste-skill
- Awesome lists: awesome-claude-skills, awesome-claude-design
- Utilities: playwright-cli, OmniRoute
- Fetched HTML: skillsllm-design.html

## Layer Assignment

| Layer | Directory | Description | Status |
|-------|-----------|-------------|--------|
| L0 | .sdd/protocol/ | Core protocol | COMPLETED |
| L1 | .sdd/chains/, .sdd/tasks/ | Execution engine | COMPLETED |
| L2 | .sdd/skills/, sdd-adapter/src/ | Skills + runtime | COMPLETED |
| L3 | .sdd/agent/, .sdd/gates/ | Security + quality | COMPLETED |
| L4 | .sdd/runtime/, sdd-adapter/src/ | Runtime + MCP | IN_PROGRESS |
| L5 | .sdd/evolution/, tmp/ | Evolution + external | PENDING |

## Feature Locations

| Feature | Location |
|---------|----------|
| AUTO workflow | .claude/sdd/workflow.yaml |
| Command runtime | sdd-adapter/src/commands.ts |
| Design analysis | sdd-adapter/src/design-analyzer.ts |
| Provenance | sdd-adapter/src/provenance-client.ts |
| Agent roles | .sdd/agent/roles.sdd |
| Security rules | .sdd/agent/security-rules.sdd |
| Decision ledger | .sdd/decisions/INDEX.sdd |
| Project data | .sdd/projects/sddra/ |

## Dependencies

**Runtime:**
- Node.js + TypeScript
- Playwright (browser automation)
- PowerShell 5.1 (test runner)

**External (analyzed, not bundled):**
- Python 3.10+ (heretic, watermarks-remover)
- PyTorch 2.2+ (heretic)
- Optuna (heretic)

## Conventions

- `.sdd/` files are the source of truth — never modify runtime to contradict specs
- All commands follow AUTO protocol when `auto` flag is present
- Human docs use append markers for token-efficient updates
- Project-specific data lives in `.sdd/projects/sddra/`
- External analysis lives in `tmp/` and `.sdd/docs/`

## Notes

This structure document is updated as the project evolves.
AI uses this to determine where new code should be placed
and how it should integrate with existing code.

State: +
