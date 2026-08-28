# .sdd/ — Specification-Driven Development System

Welcome to the SDDRA system. This README explains how the system is built,
how work flows, which AI agents you can connect, and how to extend it.

## What is .sdd/?

`.sdd/` is the brain of the SDDRA system. It is a folder full of immutable
text files that encode:
- Project intent and architecture rules
- Execution chains and workflows
- Decision history and governance
- DevOps policies and standards
- Engineering skills and best practices
- Resilience patterns and recovery procedures

Think of `.sdd/` as a **read-only constitution** for your project. AI agents
read it to understand what to build, how to build it, and what rules to follow.
Humans modify it to change the system.

## How is it built?

### Structure

`.sdd/` is organized as a **routing table** with **immutable rules**:

```
.sdd/
  PROJECT.sdd              Root router - where everything starts
  INDEX.sdd                Master routing table - how to find everything
  protocol/ROOT.sdd        Universal rules - above everything else
  architecture/            System architecture knowledge
  chains/                  Execution graph and rules
  skills/                  Engineering skills (L1-L5)
    devops/                DevOps skills (git, ci-cd, security)
  commands/                CLI commands (/sdd, /sdd-analyze, etc.)
  patterns/                Resilience patterns
  workflows/               Execution workflows
  decisions/               Decision ledger
  tasks/                   Task lifecycle
  templates/               Reusable project scaffolding
  ...
```

### Key Principles

1. **Immutability**: `.sdd/` files are read-only for AI. Only you (the owner) can modify them.
2. **Single Source of Truth**: `.sdd/` defines intent; `project/` is implementation.
3. **No Duplication**: Global files route only; project files contain details.
4. **Explicit References**: Use `@path` to reference other files.
5. **Human Gates**: Every significant change requires human approval.

### File Format

Every `.sdd/` file follows this format:

```
Category: Name

Purpose:
  What this file does

Owns:
  What this file is responsible for

ReadOrder:
  When to read this file

Rules:
  [R1] Immutable rules (if applicable)

Navigation:
  Related: @path/to/file.sdd

State: +
```

## How does work flow?

### The Chain Graph

Every execution follows the chain graph:

```
D0 (default)
  +-> P1 (prompt)   --> D0
  +-> D1 (docs)     --> D0
  +-> S1 (sdd)      --> D0
  +-> C1 (code)     --> D0
  +-> R1 (review)   --> D0
  +-> DEP1 (deploy) --> D0
```

1. **P1 (Prompt)**: Analyze user intent
2. **D1 (Docs)**: Generate human-readable documentation
3. **S1 (SDD)**: Generate machine-readable `.sdd/project/` structure
4. **C1 (Code)**: Generate source code in `project/`
5. **R1 (Review)**: Human review of generated code
6. **DEP1 (Deploy)**: Deploy to production

Every arm returns to `D0` (default), creating a cyclic graph.

### Human Gates

Non-bypassable approval points:
- **P1->D1**: Docs approval
- **D1->S1**: SDD approval
- **S1->C1**: Code approval
- **C1->DEP1**: Production approval

### Prompt to Code Flow

1. You submit a prompt to `prompts/inbox/`
2. `/sdd` reads the prompt
3. Selects the first skill from `prompts/prompt-XXX/skill/`
4. Executes P1 → D1 → S1 → C1 → R1 → DEP1
5. At each gate, you approve or request changes
6. Final code appears in `project/`

### Git Workflow

All changes follow semantic commits:

```
feat(sdd): add circuit breaker pattern
fix(chains): resolve D0 loop issue
docs(readme): update getting started
refactor(skills): simplify skill loading
chore(deps): update dependencies
```

Branch naming:
- `feat(scope): description` → develop
- `fix(scope): description` → develop
- `hotfix(scope): description` → master

## Which AI agents can I connect?

### Supported Agents

The system is designed to work with any AI agent that can:
1. Read text files
2. Follow instructions
3. Execute commands

Currently tested with:
- **Claude** (Anthropic) — primary, recommended
- **GPT-4** (OpenAI) — supported
- **Gemini** (Google) — supported
- **Llama** (Meta) — supported

### How to Connect a New Agent

1. **Read the system**: Start with `.sdd/PROJECT.sdd` and `.sdd/INDEX.sdd`
2. **Understand the chain**: Read `.sdd/chains/graph.sdd`
3. **Learn the rules**: Read `.sdd/protocol/ROOT.sdd`
4. **Follow the workflow**: Read `.sdd/workflows/`
5. **Respect gates**: Human approval is required at every gate
6. **Use skills**: Read `.sdd/skills/` for domain knowledge
7. **Record tokens**: Track token usage at every stage
8. **Create decisions**: Document significant changes as `DEC-XXX.sdd`

### Agent Requirements

Any connected agent MUST:
- Read `.sdd/` before touching `project/`
- Follow semantic commits
- Run local validation before push
- Respect immutability of `.sdd/`
- Create files in `project/`, never in `.sdd/`
- Update `.sdd/` only for new decisions, tasks, or states
- Record token usage for every stage
- Create decision records for significant changes
- Use skills from `.sdd/skills/` registry
- Participate in knowledge sharing

### Intelligent Runtime

The system includes intelligent runtime capabilities:

**Skill Discovery:**
- Automatically analyzes project requirements
- Scans `.sdd/skills/` registry
- Identifies skill gaps
- Calculates relevance scores
- Only recommends skills with >= 80% relevance

**Skill Auto-Integration:**
- Discovers missing skills from external sources
- Adapts skills to project context
- Integrates skills with human approval
- Tests integration before deployment
- Shares knowledge with all agents

**Parallel Execution:**
- Identifies parallelizable tasks
- Executes independent stages concurrently
- Shares context between parallel tasks
- Merges results automatically
- Optimizes resource usage

**Knowledge Sharing:**
- Shares decisions, skills, patterns between agents
- Synchronizes knowledge in real-time
- Caches knowledge for performance
- Validates knowledge quality
- Governs knowledge lifecycle

**Runtime Optimization:**
- Token budget optimization
- Context caching with metrics
- Predictive skill loading
- Intelligent resource allocation
- Adaptive execution based on context

## How do I extend the system?

### Adding a New Skill

1. Create skill file in `.sdd/skills/<domain>/`
2. Follow the SKILL-EXECUTION format:
   - ID, Domain, Level, Status, Version
   - Input, Output, Execute, Examples, Validation
   - Dependencies, Avoid
3. Add to `.sdd/skills/<domain>/INDEX.sdd`
4. Add to `.sdd/INDEX.sdd` navigation
5. Update README.md

### Adding a New Command

1. Create command file in `.sdd/commands/`
2. Follow the format: Command, Mode, Purpose, Description, Usage
3. Add to `.sdd/commands/INDEX.sdd`
4. Add to `.sdd/INDEX.sdd` navigation
5. Update README.md

### Adding a New Pattern

1. Create pattern file in `.sdd/patterns/`
2. Follow the format: Purpose, Configuration, Rules, State
3. Add to `.sdd/patterns/INDEX.sdd`
4. Add to `.sdd/INDEX.sdd` navigation
5. Update README.md

### Adding a New Workflow

1. Create workflow file in `.sdd/workflows/`
2. Follow the format: Purpose, Stages, Rules, State
3. Add to `.sdd/workflows/INDEX.sdd`
4. Add to `.sdd/INDEX.sdd` navigation
5. Update README.md

### Adding a New Decision

1. Create decision file: `.sdd/decisions/DEC-XXX.sdd`
2. Follow the decision schema
3. Set status: proposed
4. Request human review
5. Update to approved after review
6. Update to implemented after code
7. Update to verified after testing
8. Update to closed

## DevOps Rules (Immutable)

These rules are encoded in `.sdd/skills/devops/` and cannot be bypassed.

### Git Commits
- All commits MUST follow semantic format: `<type>(<scope>): <subject>`
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`
- Valid scopes: `sdd`, `project`, `docs`, `chains`, `skills`, `prompts`, `commands`, `templates`, `patterns`, `workflows`, `decisions`, `gates`, `tests`

### Local Validation (Before Push)
Every developer MUST run:
1. `.sdd/` validation: all files have required fields, references resolve
2. Semantic commit check: commit message follows format
3. Local tests: unit tests, integration tests pass
4. Security checks: no secrets, no vulnerabilities
5. Linting: `.sdd/` formatting, code formatting

### CI/CD Pipeline
1. Lint `.sdd/` files
2. Validate references
3. Run tests (unit, integration, chain)
4. Run security scans
5. Validate semantic commits
6. Deploy to staging
7. Production deployment requires human approval

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
3. Check logs in `prompts/prompt-XXX/logs/`
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

## File Reference

| File | Purpose |
|------|---------|
| `.sdd/PROJECT.sdd` | Root router and constitution |
| `.sdd/INDEX.sdd` | Master routing table |
| `.sdd/protocol/ROOT.sdd` | Universal rules |
| `.sdd/chains/graph.sdd` | Chain graph definition |
| `.sdd/skills/devops/` | DevOps skills and rules |
| `.sdd/templates/` | Reusable project templates |
| `.sdd/decisions/` | Decision ledger |
| `.sdd/patterns/` | Resilience patterns |
| `.sdd/workflows/` | Execution workflows |
| `.sdd/commands/` | CLI commands |
| `prompts/` | Root-level prompt registry |
| `project/` | Concrete source code |
| `old/` | Archived external assets |

## Support

- **Issues**: Create decision record in `.sdd/decisions/`
- **Questions**: Check `.sdd/INDEX.sdd` for routing
- **Bugs**: Report in `.sdd/bugs/INDEX.sdd`
- **Updates**: Check `.sdd/WORK-PLAN.sdd` for progress

## License

Proprietary - All rights reserved
