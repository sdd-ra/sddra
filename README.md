# SDDRA — Specification-Driven Development Engine

Specification-Driven Development framework for AI-assisted software engineering.
The `.sdd/` folder is the brain: it encodes project intent, architecture rules,
execution chains, decisions, and DevOps policies. AI reads `.sdd/` first, then
generates `project/` (source code) with human approval at every gate.

## Core Concepts

### Two-Language Model
- `.sdd/` — machine-readable AI intent (immutable rules, schemas, workflows, DevOps)
- `project/` — human source-of-truth code (concrete implementations)
- `.sdd/projects/{project_name}/docs/` — human-readable documentation generated from prompts

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
  workflow/               Execution workflows
  commands/                Claude CLI commands (/sdd, /sdd-analyze)
  plugins/                 External plugin adapters
  project/                 Project-specific schemas & routing
    schema.sdd              Core hierarchy (Project > Domain > Module > Feature > Component)
    profile.sdd             Project operational context
    ownership.sdd           Ownership rules
    code-mapping.sdd        Source code to semantic mapping
    drift.sdd               Declared/observed/drift model
    decisions.sdd           Project decision storage
    docs.sdd                Documentation structure
    risk.sdd                Risk register
  tasks/                   Task lifecycle engine
  decisions/               Decision ledger engine
  standards/               Naming, levels, states, relations
    states.sdd              State symbols and task state machine
  templates/               Reusable project structure templates
  context/                 Context loading & budgets
  dependencies/            Dependency graph engine
  gates/                   Quality/security/release gates
    stage/gates.sdd         Stage-specific gate criteria
    security/               Security gate specifications
  graph/                   Knowledge graph (nodes, relations, drift)
  observability/           Logging, metrics, tracing, incidents
  runtime/                 Agent runtime state
    state.sdd               Runtime state for crash recovery
  schemas/                 Canonical schemas
  security/                Security controls & scanners
  stages/                  Stage definitions (AN, AR, DB, BE, API, FE, MD, QA, DO, VR)
  testing/                 Test types, levels, gates, scripts
    t-levels.sdd            Test type levels T0-T7
  patterns/                Resilience patterns
  orchestrator/            Orchestration reference
  agent/                   Agent behavior rules
  cases/                   Case specifications
  bugs/                    Bug tracking
  projects/                Project instances
    {project_name}/         Concrete project data

project/                      # Concrete source code
  backend/
  frontend/
  mobile/
  database/

prompts/                      # Root-level prompt inbox (user submissions)
  inbox/                      # New prompts awaiting processing

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
- **SOLID/KISS/YAGNI/DRY**: Framework modules follow these principles — single responsibility, simple design, no premature abstraction, no duplication
- **Docker Only**: All execution runs inside Docker — no local tool installation
- **Local Bind Mounts**: Docker uses local bind mounts — named volumes are forbidden
- **Changed Files Only**: Only changed files are tested — regression suites run on unchanged code only

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
11. **DOCKER ONLY**: All execution MUST run inside Docker — no local tool installation
12. **RESOURCE LIMITS**: Docker containers MUST be resource-limited (CPU, memory, PIDs, network)
13. **LOCAL BIND MOUNTS**: Docker MUST use local bind mounts — named volumes are forbidden
14. **CHANGED FILES ONLY**: Only changed files are tested — regression suites are not run on unchanged code
15. **BRANCH PER TASK**: Each task has its own branch linked to its module and decision

## Fixed Flow

The SDLC flow is fixed and MUST be followed in order:

```
BE -> BE_TS -> CR -> FE -> FE_TS -> CR -> MD -> MD_TS -> CR -> BRU -> CRU -> MANUAL -> VR
```

Where:
- **BE_TS**: Backend Test Suite (unit, integration, contract tests — only changed files)
- **FE_TS**: Frontend Test Suite (component, integration, E2E tests — only changed files)
- **MD_TS**: Mobile Test Suite (platform, integration, offline tests — only changed files)
- **CR**: Code Review (mandatory after each implementation stage and test suite)
- **BRU**: Business Requirement Unit (human-gated business validation)
- **CRU**: Code Requirement Unit (automated code quality and compliance check)
- **MANUAL**: Manual check (requires user login with full permissions)

## DevOps Rules (Immutable)

### Git Commits
- All commits MUST follow semantic format: `<type>(<scope>): <subject> [DEC:<id>] [TASK:<id>]`
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
- `MODUL/<module>` → module development branch
- `DEC/<id>` → decision implementation branch
- `TASK/<id>` → task execution branch
- Branch hierarchy: main -> stage -> test -> MODUL -> DEC -> TASK
- Every commit MUST reference linked DEC and TASK IDs
- Only changed files are tested

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
| `/sdd` | Execute chain graph from prompt |
| `/sdd-analyze` | Analyze .sdd/ structure |
| `/sdd-status` | Show execution status |
| `/sdd-decisions` | List decisions |
| `/sdd-health` | Check system integrity |
| `/sdd-backup` | Create backup of critical files |
| `/sdd-restore` | Restore from backup |
| `/sdd-resume` | Resume from checkpoint |
| `/sdd-compact` | Compress context after task |
| `/sdd-clear` | Clear context for next task |
| `/sdd-next` | Advance decision chain to next step |

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
3. Analyzes and formalizes prompt into `.sdd/projects/{project_name}/docs/`
4. Human reviews documented prompt
5. Executes P1 (prompt analysis)
6. Executes D1 (docs generation)
7. Human approves docs
8. Executes S1 (sdd generation)
9. Human approves sdd
10. Executes C1 (code generation)
11. Human reviews code
12. Executes R1 (review)
13. Human approves production
14. Executes DEP1 (deploy)
15. Moves prompt to archive

### Git Workflow
1. Create branch: `MODUL/<module>`, `DEC/<id>`, or `TASK/<id>`
2. Make changes
3. Run local validation (only changed files)
4. Commit with semantic message referencing DEC and TASK IDs
5. Push to remote
6. Create PR
7. CI/CD runs checks
8. Human reviews
9. Merge through stage -> test -> main
10. Deploy to staging
11. Human approves production
12. Merge to main
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
1. Create workflow file in `.sdd/workflow/`
2. Add to `.sdd/workflow/INDEX.sdd`
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
git clone https://github.com/sddra/{project_name}.git
cd {project_name}
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
5. Ensure Docker is running (all execution requires Docker)

### Docker issues
1. Verify Docker is installed and running
2. Check container resource limits (CPU, memory, PIDs)
3. Verify local bind mounts are configured correctly
4. Ensure no named volumes are used
5. Check Docker logs for errors

### Tests failing
1. Run tests locally in Docker
2. Check test output (only changed files are tested)
3. Fix failing tests
4. Run local validation
5. Push again
