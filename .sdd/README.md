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
  concepts/                Canonical concepts and knowledge model (PHASE 122)
  knowledge/               Knowledge lifecycle, compression, versioning (PHASE 120-122)
  lessons/                 Negative knowledge and rejected approaches (PHASE 123)
  references/              Trust-weighted references and evidence graph (PHASE 120)
  legacy/                  Legacy audit and migration procedures
  runtime/                 Runtime-only state: memory, context, traces (PHASE 123-124)
  chains/                  Execution graph and rules
  skills/                  Engineering skills (L1-L5)
    devops/                DevOps skills (git, ci-cd, security)
  commands/                CLI commands (/sdd, /sdd-analyze, etc.)
  patterns/                Resilience patterns
  workflow/                Execution workflows
  decisions/               Decision ledger
  tasks/                   Task lifecycle (10-state machine, PHASE 124)
  templates/               Reusable project scaffolding
  ...
```

### Knowledge Memory Model (PHASE 120-124)

The knowledge memory model is a 4-tier system that governs how AI agents
acquire, validate, store, and retrieve knowledge during execution:

```
Long-Term Knowledge  (established concepts, validated skills, architecture decisions)
       |
Project Memory       (project-specific rules, module context, decision history)
       |
Task Memory           (per-task context loaded during execution, task-scoped skills)
       |
Working Memory        (active reasoning context, temporary observations)
       |
TMP Memory            (raw observations before concept extraction — not persisted)
```

**Tier characteristics:**

| Tier | Persistence | TTL | Promotion gate |
|------|-------------|-----|----------------|
| TMP | None (runtime) | End of session | Observation threshold |
| Working | None (runtime) | End of task | Context sufficiency check |
| Task | projects/{project_name}/.specdd/task-context/ | Task lifecycle | End-of-task consolidation |
| Project | .sdd/knowledge/ | Persistent | Human or automated review |
| Long-Term | .sdd/concepts/, .sdd/references/ | Permanent | Deprecated only, never deleted |

**Context Budget (PHASE 123 §10):**
- Default loading: Level 0 (Long-Term) → Level 1 (Project) → Level 2 (Task)
- Expand to Level 3 (Domain) and Level 4 (Dependencies) on demand
- Context sufficiency check: confidence rating MUST be recorded before implementation
- Human override: `@context.include` and `@context.exclude` directives

**Consolidation Pipeline (end-of-task):**
1. **DROP**: Temporary or irrelevant observations are discarded
2. **ARCHIVE**: Candidate knowledge is archived with TTL (30 days default)
3. **LINK**: Validated knowledge is linked to existing canonical concepts
4. **PROMOTE**: Established knowledge is promoted to Long-Term tier

**Trust Hierarchy (PHASE 120 §13):**
Explicit project constraints > decisions > validated project skills >
established org knowledge > general best practices > AI suggestions

### Knowledge Lifecycle

Every knowledge entry in `.sdd/` follows a lifecycle:

```
OBSERVED → CANDIDATE → VALIDATED → ESTABLISHED
              ↓              ↓
           DEPRECATED ←────────┘
```

**OBSERVED**: Raw observation from code, test, task, or human input.
  - Stored in TMP memory or .sdd/lessons/
  - Has evidence metadata: type, source, timestamp

**CANDIDATE**: Extracted concept or skill not yet validated.
  - Stored in .sdd/knowledge/
  - Has trust: low, confidence: estimated
  - Aging threshold: 30 days without promotion → deprecation review

**VALIDATED**: Concept verified through evidence (tests, production, human review).
  - Trust: medium, confidence: high
  - Evidence count >= threshold (configurable per domain)
  - Links to @concept.* canonical namespace

**ESTABLISHED**: Canonical knowledge used across multiple projects.
  - Trust: high, confidence: verified
  - Immutable — deprecated only, never silently overwritten or deleted
  - Governed by knowledge golden rules (K1-K10)

**DEPRECATED**: No longer valid or superseded by better knowledge.
  - Archived with `deprecated_reason:` and `replaced_by:` metadata
  - Retained for audit trail — never silently deleted (K8)

### Per-Project Runtime Artifacts (.specdd/)

Each project instance (`projects/{project_name}/`) contains a `.specdd/`
directory with runtime artifacts:

| File | Purpose |
|------|---------|
| `flow-index.md` | CASE dependency tree (depends-on, related) for `/sdd next` navigation |
| `fix-index.sdd` | Local fix-lookup table — AI checks before web search |
| `dependency-ledger.md` | Security and dependency monitoring log |
| `task-context/` | Per-task context artifacts from execution |

`.specdd/` artifacts are **runtime-only** — they are not part of the immutable
`.sdd/` specification system and can be updated during execution.

### Key Principles

1. **Immutability**: `.sdd/` files are read-only for AI. Only you (the owner) can modify them.
2. **Single Source of Truth**: `.sdd/` defines intent; `project/` is implementation.
3. **No Duplication**: Global files route only; project files contain details.
4. **Explicit References**: Use `@path` to reference other files.
5. **Human Gates**: Every significant change requires human approval.

### Knowledge Golden Rules (K1-K10)

The 10 knowledge principles govern all knowledge operations in `.sdd/`:

1. **Reuse over creation** — Search existing knowledge before creating new concepts.
2. **Link over copy** — Use `@reference` links instead of duplicating content.
3. **Specialize over duplicate** — Extend existing concepts rather than creating variants.
4. **Evidence over assumption** — Every knowledge entry must have evidence metadata.
5. **Canonical over synonyms** — Use the canonical namespace (`@concept.*`).
6. **Never silently learn** — All knowledge additions require explicit promotion or human approval.
7. **Never silently overwrite** — Existing knowledge entries must be deprecated before replacement.
8. **Never silently delete** — Deprecated knowledge is archived, not removed.
9. **Scope project rules** — Project-specific rules do not propagate to global `.sdd/`.
10. **Preserve rationale** — Every decision must include why it was made and what evidence supports it.

These rules are encoded in `.sdd/knowledge/GOLDEN-RULES.sdd` and enforced by
the AI runtime during knowledge consolidation.

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
4. **Follow the workflow**: Read `.sdd/workflow/`
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

1. Create workflow file in `.sdd/workflow/`
2. Follow the format: Purpose, Stages, Rules, State
3. Add to `.sdd/workflow/INDEX.sdd`
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
| `.sdd/workflow/` | Execution workflows |
| `.sdd/commands/` | CLI commands |
| `.sdd/architecture/` | System architecture knowledge |
| `.sdd/concepts/` | Canonical concepts and knowledge model |
| `.sdd/knowledge/` | Knowledge lifecycle, compression, versioning |
| `.sdd/lessons/` | Negative knowledge and rejected approaches |
| `.sdd/references/` | Trust-weighted references and evidence graph |
| `.sdd/runtime/` | Runtime-only state (memory, context, traces) |
| `.sdd/legacy/` | Legacy audit and migration procedures |
| `.sdd/tasks/` | Task lifecycle (10-state machine) |
| `.sdd/commands/sdd-analyze.sdd` | System analysis (knowledge, .specdd/) |
| `projects/{project_name}/.specdd/` | Per-project runtime artifacts |
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
