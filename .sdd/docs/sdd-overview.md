# SDDRA — Specification-Driven Development Engine

SDDRA (Spec-Driven Development & Engineering) is an operating system for AI-assisted software engineering. It uses `.sdd/` files as machine-readable specifications that define workflows, decisions, skills, and agent contracts. The system guides AI agents through a 6-arm chain graph (P1→D1→S1→C1→R1→DEP1) with human gates at each transition.

## How It Works

1. **D0** (default): Central hub — all arms branch from here and return
2. **P1** (prompt): User intents arrive — parsed from `prompts/inbox/`
3. **D1** (docs): Human-readable documentation — requires approval
4. **S1** (.sdd): Machine specs — schemas, workflows, routing tables
5. **C1** (code): Implementation — write code per task contracts
6. **R1** (review): Quality gates — security, tests, architecture checks
7. **DEP1** (deploy): Deployment and release planning

Each arm returns to D0, enabling iterative refinement. The system enforces loop protection (loop_score ≥ 60 → blocked), tracks 4-tier memory (Long-Term, Project, Task, Working), and maintains an evolution pipeline where AI-discovered knowledge awaits human validation before promotion.

## Project Structure
```
.sdd/                      Machine Language (immutable specs)
├── PROJECT.sdd            Project metadata
├── chains/                Execution graph and arms
├── decisions/             Decision ledger (DEC-XXX)
├── skills/                Reusable skill specs
├── tasks/                 Task definitions + state machine
├── agent/                 Agent contract + roles
├── gates/                 Quality gate definitions
├── concepts/              Knowledge model
├── commands/              CLI interface
└── docs/                  Human-readable documentation (this folder)
```

## Active Decisions
- Check `.sdd/decisions/INDEX.sdd` for current architectural and technical decisions
- Active decisions (status = approved, not superseded) drive implementation

## Available Commands
| Command | Purpose |
|---------|---------|
| `/sdd-plan` | Auto-generate execution plan from `.sdd/` + `prompts/` |
| `/sdd-analyse` | Deep business-aware analysis of `.sdd/` system |
| `/sdd-status` | Show execution status |
| `/sdd-decisions` | List decisions |
| `/sdd-next` | Advance decision chain |
| `/sdd` | Execute chain graph from prompt |

## Next Steps
1. Run `/sdd-analyse` for a full system overview
2. Run `/sdd-plan` to generate an execution plan from current context
3. Submit intents via `prompts/inbox/` to drive P1 arm
