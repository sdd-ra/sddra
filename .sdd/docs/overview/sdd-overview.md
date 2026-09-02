<!-- [APPEND:sddra-overview] -->
<!-- Section: SDDRA Overview -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# SDDRA — Specification-Driven Development Engine

SDDRA (Spec-Driven Development & Engineering) is an operating system for AI-assisted software engineering. It uses `.sdd/` files as machine-readable specifications that define workflows, decisions, skills, and agent contracts. The system guides AI agents through a 6-arm chain graph (P1→D1→S1→C1→R1→DEP1) with human gates at each transition.

## How It Works

<!-- [END:APPEND:sddra-overview] -->

<!-- [APPEND:sddra-how-it-works] -->
<!-- Section: How It Works -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

1. **D0** (default): Central hub — all arms branch from here and return
2. **P1** (prompt): User intents arrive — parsed from `prompts/inbox/`
3. **D1** (docs): Human-readable documentation — requires approval
4. **S1** (.sdd): Machine specs — schemas, workflows, routing tables
5. **C1** (code): Implementation — write code per task contracts
6. **R1** (review): Quality gates — security, tests, architecture checks
7. **DEP1** (deploy): Deployment and release planning

Each arm returns to D0, enabling iterative refinement. The system enforces loop protection (loop_score ≥ 60 → blocked), tracks 4-tier memory (Long-Term, Project, Task, Working), and maintains an evolution pipeline where AI-discovered knowledge awaits human validation before promotion.

## Project Structure

<!-- [END:APPEND:sddra-how-it-works] -->

<!-- [APPEND:sddra-project-structure] -->
<!-- Section: Project Structure -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

```
.sdd/                      Machine Language (immutable specs)
├── INDEX.sdd              Universal entry point and routing table
├── PROJECT.sdd            Project metadata
├── protocol/              Core protocol and root spec
├── chains/                Execution graph and arms
├── decisions/             Decision ledger (DEC-XXX)
├── skills/                Reusable skill specs
├── tasks/                 Task definitions + state machine
├── agent/                 Agent contract, roles, supervisor, security
├── gates/                 Quality gate definitions
├── concepts/              Knowledge model
├── commands/              CLI interface (17 /sdd commands)
├── runtime/               Runtime state, MCP integration, memory model
├── evolution/             Candidate pool, discovery, challenges, proposals
├── timeline/              Temporal knowledge, snapshots, migrations
├── references/            Reusable engineering knowledge
│   ├── sdd/               SDD methodology references (ECC, living specs)
│   └── ...                (ddd, architecture, patterns, engineering, etc.)
├── docs/                  Human-readable documentation (this folder)
└── testing/               Test scripts and validation suite
```

## ECC Framework Integration

<!-- [END:APPEND:sddra-project-structure] -->

<!-- [APPEND:sddra-ecc-integration] -->
<!-- Section: ECC Framework Integration -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

SDDRA integrates with the ECC (Enterprise Coordination Core) framework:
- **67 agents** mapped to SDD roles via `agent/ecc-bridge.sdd`
- **281 skills** with SDD-aligned skill specs
- **94 commands** bridged to 17 SDD `/sdd-*` commands
- **35 MCP servers** integrated via `runtime/mcp-integration.sdd`
- **AgentShield security** (102 static rules) mapped to SDD L0-L5 levels via `agent/security-rules.sdd`
- **Supervisor agent** orchestrates multi-agent workflows (`agent/supervisor.sdd`)

## Active Decisions

<!-- [END:APPEND:sddra-ecc-integration] -->

<!-- [APPEND:sddra-active-decisions] -->
<!-- Section: Active Decisions -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

- Check `.sdd/decisions/INDEX.sdd` for current architectural and technical decisions
- Active decisions (status = approved, not superseded) drive implementation

## Available Commands

<!-- [END:APPEND:sddra-active-decisions] -->

<!-- [APPEND:sddra-available-commands] -->
<!-- Section: Available Commands -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| `/sdd-plan` | Auto-generate execution plan from `.sdd/` + `prompts/` |
| `/sdd-analyse` | Deep business-aware analysis of `.sdd/` system |
| `/sdd-status` | Show execution status |
| `/sdd-decisions` | List decisions |
| `/sdd-next` | Advance decision chain |
| `/sdd-health` | Check system integrity |
| `/sdd` | Execute chain graph from prompt |
| `/sdd-update` | Sync `.sdd/` state from git repository |
| `/sdd-prompts` | Automate prompt lifecycle |
| `/sdd-knowledge` | Report knowledge graph health |
| `/sdd-explain` | Explain completed task |
| `/sdd-backup` | Create backup |
| `/sdd-restore` | Restore from backup |
| `/sdd-resume` | Resume from checkpoint |
| `/sdd-migrate` | Run migrations |
| `/sdd-compact` | Compress context after task |
| `/sdd-clear` | Clear context for next task |

## Next Steps

<!-- [END:APPEND:sddra-available-commands] -->

<!-- [APPEND:sddra-next-steps] -->
<!-- Section: Next Steps -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

1. Run `/sdd-analyse` for a full system overview
2. Run `/sdd-plan` to generate an execution plan from current context
3. Submit intents via `prompts/inbox/` to drive P1 arm

<!-- [END:APPEND:sddra-next-steps] -->
