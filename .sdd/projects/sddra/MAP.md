# sddra — Project Map

Purpose:
  AI representation of the sddra.ai codebase.
  This file maps the real project structure so AI can understand
  where code lives, what it does, and how components relate.

## Source Project

Real Project Root: `D:\Tasks\ai_code\sddra.ai\`

### Directory Structure

```
sddra.ai/
├── .claude/                    # Claude Code configuration
│   ├── commands/               # Slash command definitions (sdd-*.md)
│   ├── docs/                   # Human-readable documentation (NEW: organized)
│   └── sdd/                    # AUTO workflow engine (workflow.yaml, state.json)
├── .sdd/                       # Machine-readable specifications (source of truth)
│   ├── INDEX.sdd               # Universal entry point
│   ├── PROJECT.sdd             # Project metadata
│   ├── protocol/               # Core protocol
│   ├── chains/                 # Execution graph and arms
│   ├── decisions/              # Decision ledger (DEC-XXX)
│   ├── skills/                 # Reusable skill specs
│   ├── tasks/                  # Task definitions + state machine
│   ├── agent/                  # Agent contract, roles, security
│   ├── gates/                  # Quality gate definitions
│   ├── concepts/               # Knowledge model
│   ├── commands/               # CLI interface specs
│   ├── runtime/                # Runtime state, MCP, memory model
│   ├── evolution/              # Candidate pool, discovery, proposals
│   ├── timeline/               # Temporal knowledge, snapshots
│   ├── references/             # Reusable engineering knowledge
│   ├── docs/                   # Human-readable docs (NEW: organized)
│   ├── testing/                # Test scripts and validation
│   └── projects/sddra/         # THIS PROJECT instance
├── sdd-adapter/                # TypeScript runtime implementation
│   ├── src/                    # Source code
│   └── tests/                  # Unit tests
├── prompts/                    # User intent inbox/archive
├── tmp/                        # External repos, analysis, research
│   ├── agent-skills/           # Vercel agent-skills (cloned)
│   ├── skills/                 # Anthropic skills repo (cloned)
│   ├── taste-skill/            # Vercel taste-skill (cloned)
│   ├── heretic/                # p-e-w/heretic (cloned, analyzed)
│   ├── watermarks-remover/     # guillaumemeyer/watermarks-remover (cloned, analyzed)
│   ├── playwright-cli/         # Playwright CLI (cloned)
│   ├── awesome-claude-skills/  # Awesome list (cloned)
│   ├── awesome-claude-design/  # Awesome list (cloned)
│   └── html/                   # Fetched HTML templates
├── package.json                # Node.js project config
├── README.md                   # Root human-readable entry point
├── CLAUDE.md                   # Claude Code instructions
├── AGENT_README.md             # Agent-specific instructions
└── TEST_GUIDE.md               # Testing guide

## Layer Assignment

| Layer | Description | Status |
|-------|-------------|--------|
| L0 | SDD Specification System | COMPLETED |
| L1 | AUTO Chain Workflow | COMPLETED |
| L2 | Design Analysis & Skills | COMPLETED |
| L3 | Provenance & Security | COMPLETED |
| L4 | External Tool Integration | IN_PROGRESS |
| L5 | Multi-Agent Orchestration | PENDING |

## Feature Context

Current Focus: Documentation reorganization, project instance creation, tmp/ analysis
Next Steps: Bring valuable tmp/ content into .sdd/ system, refine design skills

## Notes

This map is updated as the project evolves.
AI uses this to understand the codebase before making changes.

State: +
