# SDDRA — Specification-Driven Development Engine

Specification-Driven Development framework for AI-assisted software engineering.
The `.sdd/` folder is the brain: it encodes project intent, architecture rules,
execution chains, decisions, and DevOps policies. AI reads `.sdd/` first, then
generates `project/` (source code) with human approval at every gate.

## Core Concepts

### Two-Language Model
- `.sdd/` — machine-readable AI intent (immutable rules, schemas, workflows, DevOps)
- `project/` — human source-of-truth code (concrete implementations)
- `.sdd/projects/vkard.az/docs/` — human-readable documentation generated from prompts

### Chain Graph
Cyclic root `D0` with 6 arms. Every arm returns to `D0`:

```
D0 (default)
  +-> P1 (prompt)   --> D0
  +-> D1 (docs)     --> D0
  +-> S1 (sdd)      --> D0
  +-> C1 (code)     --> D0
  +-> R1 (review)   --> D0
  +-> DEP1 (deploy) --> D0
```

### Human Gates (non-bypassable)
1. **P1->D1**: Docs approval
2. **D1->S1**: SDD approval
3. **S1->C1**: Code approval
4. **C1->DEP1**: Production approval

### Decision Ledger
Every significant change requires `DEC-XXX.sdd`. Workflow: `proposed -> review -> approved -> implemented -> verified -> closed`.

### Templates
Reusable project scaffolding lives at `.sdd/templates/`. These are immutable and
consumed by the system to generate concrete `project/` content per prompt.

### DevOps Skills
All DevOps practices are encoded as skills in `.sdd/skills/devops/`. This includes:
- Git branching strategy
- Semantic commits
- Git hooks (pre-commit, pre-push)
- CI/CD pipelines
- Local validation
- Security testing
- Test automation

## Directory Structure

```
.sdd/
  PROJECT.sdd              Root router / constitution
  INDEX.sdd                Universal routing table
  protocol/ROOT.sdd        Universal rules (above everything)
  architecture/            System architecture knowledge base
  chains/                  Execution graph + arms + rules + tokens
  skills/                  Engineering skills (L1-L5)
    devops/                DevOps skills (git, ci-cd, security, testing)
  prompts/                 Prompt intelligence engine
  workflows/               Execution workflows
  commands/                Claude CLI commands (/sdd, /sdd-analyze)
  plugins/                 External plugin adapters
  project/                 Project-specific schemas & routing
  tasks/                   Task lifecycle engine
  decisions/               Decision ledger engine
  state/                   State symbols
  templates/               Reusable project structure templates
  context/                 Context loading & budgets
  dependencies/            Dependency graph engine
  gates/                   Quality/security/release gates
  graph/                   Knowledge graph (nodes, relations, drift)
  observability/           Logging, metrics, tracing, incidents
  runtime/                 Agent runtime state
  schemas/                 Canonical schemas
  security/                Security controls & scanners
  stages/                  Stage definitions (AN, AR, DB, BE, API, FE, MD, QA, DO, VR)
  standards/               Naming, levels, states, relations
  testing/                 Test types, levels, gates, scripts
  patterns/                Resilience patterns
  orchestrator/            Orchestration engine
  agent/                   Agent behavior rules
  cases/                   Case specifications
  bugs/                    Bug tracking
  projects/                Formalized prompts and multi-project support
    prompts/               Formalized prompt examples

project/                      # Concrete source code
  backend/
  frontend/
  mobile/
  database/

prompts/                      # Root-level prompt inbox (user submissions)
  inbox/                      # New prompts awaiting processing
  active/                     # Active prompts
  archive/                    # Completed prompts
  extracted/                  # Extracted knowledge

old/                           # Archived external assets and historical versions (excluded from distribution)
```

## Principles

- **Immutability**: Core `.sdd/` rules (protocol, architecture, standards) are immutable. AI may append decisions, tasks, and project state only.
- **Token Minimalism**: Short IDs, `INDEX.sdd` routing, lazy loading, no full-catalog reads
- **Single Source of Truth**: `.sdd/` defines intent; `project/` is implementation
- **No Duplication**: Global files route only; project files contain details
- **Explicit References**: `@path` format, resolved before reading
- **Human Control**: Architectural changes and production deployments require approval
- **DevOps as Code**: All DevOps practices are encoded as skills in `.sdd/`

## AI Behavior Rules

1. **READ `.sdd/` FIRST**: AI MUST read `.sdd/` files before touching `project/`
2. **CREATE IN `project/`**: AI creates implementation code in `project/`, never in `.sdd/`
3. **UPDATE `.sdd/` ONLY FOR PROJECT ARTIFACTS**: AI updates `.sdd/` only for new decisions, tasks, states, or project-specific content
4. **FOLLOW THE CHAIN**: D0 -> arm -> D0, never skip gates
5. **USE TEMPLATES**: `.sdd/templates/` provides immutable scaffolding
6. **RECORD TOKENS**: Every stage records token usage
7. **CREATE DECISIONS**: Every significant change gets a `DEC-XXX.sdd`
8. **SKILLS ARE EXECUTABLE**: Skills are not just knowledge — they are executable units
9. **DEVOPS AS SKILLS**: All DevOps practices are skills in `.sdd/skills/devops/`
10. **LOCAL VALIDATION**: All changes must pass local validation before push

## DevOps Rules (Immutable)

### Git Commits
- All commits MUST follow semantic format: `<type>(<scope>): <subject>`
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`
- Valid scopes: `sdd`, `project`, `docs`, `chains`, `skills`, `prompts`, `commands`, `templates`, `patterns`, `workflows`, `decisions`, `gates`, `tests`, `testing`, `orchestrator`, `agent`, `security`, `architecture`, `stages`, `state`, `tasks`, `plugins`, `context`, `dependencies`, `observability`, `runtime`, `schemas`, `standards`, `cases`, `bugs`
- Breaking changes MUST include `!` and footer: `BREAKING CHANGE: <description>`

### Git Hooks
- **pre-commit**: Validates .sdd/ files, checks for secrets, validates references
- **commit-msg**: Validates semantic commit format
- **pre-push**: Runs tests, validates chain graph, checks documentation

### Local Validation (Before Push)
Every developer MUST run:
1. `.sdd/` validation: all files have required fields, references resolve
2. Semantic commit check: commit message follows format
3. Local tests: unit tests, integration tests pass
4. Security checks: no secrets, no vulnerabilities
5. Linting: .sdd/ formatting, code formatting

### CI/CD Pipeline
1. Lint .sdd/ files
2. Validate references
3. Run tests (unit, integration, chain)
4. Run security scans
5. Validate semantic commits
6. Deploy to staging
7. Production deployment requires human approval

### Branching Strategy
- `feat(scope): description` → develop
- `fix(scope): description` → develop
- `docs(scope): description` → develop
- `refactor(scope): description` → develop
- `chore(scope): description` → develop
- `hotfix(scope): description` → master
- Never commit directly to master

## Getting Started

### For Users
1. Read `README.md` — system overview (this file)
2. Read `.sdd/PROJECT.sdd` — root rules and directory map
3. Read `.sdd/INDEX.sdd` — routing table
4. Read `.sdd/protocol/ROOT.sdd` — universal principles
5. Read `.sdd/chains/graph.sdd` — execution chain
6. Read `.sdd/skills/devops/` — DevOps rules and skills
7. Run `/sdd-analyze` in Claude CLI to inspect the system
8. Run `/sdd "prompt"` to execute the chain graph

### For Developers
1. Clone repository
2. Install dependencies
3. Run `/sdd-analyze` to verify system
4. Create feature branch: `feat(scope): description`
5. Make changes
6. Run local validation: `.sdd/skills/devops/ci-cd/local-validation.sdd`
7. Commit with semantic message
8. Push and create PR
9. Wait for CI/CD checks
10. Merge after approval

### For AI Agents
1. Read `.sdd/PROJECT.sdd` first
2. Follow ReadOrder in `.sdd/INDEX.sdd`
3. Read `.sdd/protocol/ROOT.sdd` for universal rules
4. Read `.sdd/chains/graph.sdd` for execution flow
5. Read `.sdd/skills/devops/` for DevOps rules
6. Use `.sdd/templates/` for scaffolding
7. Follow chain graph: D0 -> arm -> D0
8. Respect human gates
9. Record token usage
10. Create decision records for significant changes

## Commands

| Command | Purpose |
|---------|---------|
| `/sdd` | Execute chain graph from prompt (reads prompts/ folder) |
| `/sdd-analyze` | Analyze .sdd/ structure |
| `/sdd-status` | Show execution status |
| `/sdd-decisions` | List decisions |
| `/sdd-health` | Check system integrity |
| `/sdd-backup` | Create backup of critical files |
| `/sdd-restore` | Restore from backup |
| `/sdd-resume` | Resume from checkpoint |
| `/sdd-fast` | Fast path execution |
| `/sdd-full` | Full chain execution |
| `/sdd-auto` | Auto-select path |

## Skills System

Skills are organized by technology and competency layers (L1-L5):

- **L1**: Fundamentals (beginner)
- **L2**: Intermediate patterns
- **L3**: Advanced techniques
- **L4**: Architecture & design
- **L5**: Expert/mastery

Skills are self-contained executable units with:
- Clear input/output contracts
- Examples of usage
- Validation criteria
- Fallback behavior

### DevOps Skills
All DevOps practices are encoded as skills:
- Git semantic commits
- Git branching strategy
- Git hooks
- CI/CD pipelines
- Local validation
- Security testing
- Test automation

## Resilience

The system includes resilience patterns:
- **Circuit Breaker**: Prevents cascading failures
- **Checkpoint/Restore**: Resume from last successful stage
- **Graceful Degradation**: Continue with reduced functionality
- **Backup/Integrity**: Automatic backups and integrity checks

## Work Flow

### Prompt to Code
1. User submits prompt to `prompts/inbox/`
2. `/sdd` reads prompt
3. Analyzes and formalizes prompt into `.sdd/projects/prompts/`
4. Documents prompt with ID in `.sdd/projects/vkard.az/docs/prompts/`
5. Human reviews documented prompt
6. Executes P1 (prompt analysis)
7. Executes D1 (docs generation)
8. Human approves docs
9. Executes S1 (sdd generation)
10. Human approves sdd
11. Executes C1 (code generation)
12. Human reviews code
13. Executes R1 (review)
14. Human approves production
15. Executes DEP1 (deploy)
16. Moves prompt to `prompts/archive/`

### Git Workflow
1. Create branch: `feat(scope): description`
2. Make changes
3. Run local validation
4. Commit with semantic message
5. Push to remote
6. Create PR
7. CI/CD runs checks
8. Human reviews
9. Merge to develop
10. Deploy to staging
11. Human approves production
12. Merge to master
13. Deploy to production

## Connecting AI Agents

### Supported Agents
- Claude (Anthropic) — primary
- GPT-4 (OpenAI) — supported
- Gemini (Google) — supported
- Llama (Meta) — supported
- Custom agents — via adapter pattern

### How to Connect
1. Read `.sdd/PROJECT.sdd` for system rules
2. Read `.sdd/INDEX.sdd` for routing
3. Read `.sdd/protocol/ROOT.sdd` for principles
4. Implement agent adapter in `.sdd/plugins/`
5. Follow chain graph: D0 -> arm -> D0
6. Respect human gates
7. Record token usage
8. Create decisions for significant changes

### Agent Requirements
- Must read `.sdd/` before touching `project/`
- Must follow semantic commits
- Must run local validation before push
- Must respect immutability of `.sdd/`
- Must create files in `project/`, never in `.sdd/`
- Must update `.sdd/` only for new decisions, tasks, or states
- Must record token usage
- Must create decision records

## Future extensibility

### Adding New Skills
1. Create skill file in appropriate `.sdd/skills/` subdirectory
2. Add to skill INDEX.sdd
3. Add to `.sdd/INDEX.sdd` navigation
4. Document in README.md

### Adding New Commands
1. Create command file in `.sdd/commands/`
2. Add to `.sdd/commands/INDEX.sdd`
3. Add to `.sdd/INDEX.sdd` navigation
4. Document in README.md

### Adding New Patterns
1. Create pattern file in `.sdd/patterns/`
2. Add to `.sdd/patterns/INDEX.sdd`
3. Add to `.sdd/INDEX.sdd` navigation
4. Document in README.md

### Adding New Workflows
1. Create workflow file in `.sdd/workflows/`
2. Add to `.sdd/workflows/INDEX.sdd`
3. Add to `.sdd/INDEX.sdd` navigation
4. Document in README.md

## Troubleshooting

### System won't start
1. Run `/sdd-health` to check integrity
2. Verify `.sdd/PROJECT.sdd` exists
3. Verify `.sdd/INDEX.sdd` exists
4. Verify `.sdd/protocol/ROOT.sdd` exists
5. Restore from backup if needed

### Chain execution fails
1. Check `/sdd-status` for current state
2. Run `/sdd-resume` to continue from checkpoint
3. Check logs in `.sdd/testing/scripts/results/`
4. Review decisions in `.sdd/decisions/`

### Git commit rejected
1. Check commit message format
2. Run pre-commit hook manually
3. Fix validation errors
4. Try commit again

### Tests failing
1. Run tests locally
2. Check test output
3. Fix failing tests
4. Run local validation
5. Push again

## Status

Active development. Model is live and incrementally refined. All `.sdd/` files are immutable and owned by the user.

## License

Proprietary - All rights reserved

## Installation

### As Standalone Repository

```bash
git clone https://github.com/sddra/vkard.az.git
cd vkard.az
```

Clone the repo and use `.sdd/` as your engineering OS. No additional installation required.

### As Claude Code Plugin

```bash
/plugin marketplace add sddra/sddra-marketplace
/plugin install sddra@sddra-marketplace
```

### As Codex CLI Plugin

```bash
codex plugin install sddra
```

### As Cursor Extension

Install from Cursor Marketplace: search for "SDDRA".

### As OpenCode Plugin

```bash
opencode plugin install sddra
```

### As Hermes Agent Plugin

```bash
hermes plugin install sddra
```

### As Pi Extension

```bash
pi extension install sddra
```

### As Kimi Code Plugin

```bash
kimi plugin install sddra
```

## Plugin Manifests

This repo includes plugin manifests for multiple AI agent platforms:

- `.agents/plugins/marketplace.json` — Claude Code marketplace
- `.claude-plugin/plugin.json` — Claude Code plugin
- `.codex-plugin/plugin.json` — Codex CLI plugin
- `.cursor-plugin/plugin.json` — Cursor extension
- `.opencode/plugins/sddra.js` — OpenCode plugin
- `.pi/extensions/sddra.ts` — Pi extension
- `.hermes-plugin/plugin.yaml` — Hermes plugin
- `.kimi-plugin/plugin.json` — Kimi Code plugin

Each manifest points to the same `.sdd/` core, so the system behaves identically whether cloned directly or installed from a marketplace.

## Usage After Installation

1. Open your project root
2. Run `/sdd` to analyze prompts
3. Follow the chain graph: P1 → D1 → S1 → C1 → DEP1
4. Human approval required at each gate
5. `.sdd/` remains immutable — all execution metadata stays in `.sdd/`

## Troubleshooting

### System won't start
1. Run `/sdd-health` to check integrity
2. Verify `.sdd/PROJECT.sdd` exists
3. Verify `.sdd/INDEX.sdd` exists
4. Verify `.sdd/protocol/ROOT.sdd` exists
5. Restore from backup if needed

### Plugin not loading
1. Verify plugin manifest exists for your platform
2. Check platform-specific logs
3. Ensure `.sdd/` structure is intact
4. Reinstall plugin from marketplace

### Chain execution fails
1. Check `/sdd-status` for current state
2. Run `/sdd-resume` to continue from checkpoint
3. Check logs in `.sdd/testing/scripts/results/`
4. Review decisions in `.sdd/decisions/`

### Git commit rejected
1. Check commit message format
2. Run pre-commit hook manually
3. Fix validation errors
4. Try commit again

### Tests failing
1. Run tests locally
2. Check test output
3. Fix failing tests
4. Run local validation
5. Push again
