<!-- [APPEND:system-analysis-overview] -->
<!-- Section: SDDRA Deep System Analysis -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# SDDRA Deep System Analysis

## 1. Project Overview

<!-- [END:APPEND:system-analysis-overview] -->

<!-- [APPEND:project-overview] -->
<!-- Section: Project Overview -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Field | Value |
|-------|-------|
| **Name** | SDDRA |
| **Domain** | AI Dev Tools / Spec-Driven Development |
| **Stack** | TypeScript (`.sdd` specification model) |
| **Architecture** | Modular Monolith (per `PROJECT.sdd`) |
| **Execution Model** | Docker-based (per [R59]) |
| **Git Workflow** | main → stage → test → MODUL/<module> → DEC/<id> → TASK/<id> (per [R75]) |

<!-- [END:APPEND:project-overview] -->

<!-- [APPEND:chain-graph-overview] -->
<!-- Section: Chain Graph Overview -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

## 2. Chain Graph Overview

The SDDRA execution graph is defined in `.sdd/chains/graph.sdd`. It's a cyclic graph where every arm branches from D0 and returns.

### Arms:
| Arm Code | Name | Purpose | Chain Files |
|----------|------|---------|-------------|
| **D0** | Default | Central hub — all arms branch from here | `chains/default.sdd` |
| **P1** | Prompt | User intents → prompt processing | `chains/arms/prompt.sdd` |
| **D1** | Docs | Human-readable documentation | `chains/arms/docs.sdd` |
| **S1** | `.sdd` | Machine specs, schemas, workflows | `chains/arms/sdd.sdd` |
| **C1** | Code | Implementation per task contracts | `chains/arms/code.sdd` |
| **R1** | Review | Quality gates, security, tests | `chains/arms/review.sdd` |
| **DEP1** | Deploy | Deployment and release planning | `chains/arms/deploy.sdd` |

### Execution Trace (16 steps):
<!-- [END:APPEND:chain-graph-overview] -->

<!-- [APPEND:execution-trace] -->
<!-- Section: Execution Trace -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

```
#01  Discover    -> load task context and project memory
#02  BuildCtx    -> compile 4-tier memory (Long-Term, Project, Task, Working)
#03  Plan        -> decompose task into atomic sub-tasks, assign skills
#04  PlanCheck   -> validate DAG structure, dependencies, coverage matrix
#05  Implement   -> write code per plan, stage files
#06  Test        -> run unit/integration/BDD tests (CHANGED FILES ONLY)
#07  TestCheck   -> PASS branch -> Review | FAIL branch -> Classify
#08  Classify    -> map failure to FAILURE_CLASSIFICATION.sdd types
#09  Fix         -> apply fix from fix-index.sdd or new analysis
#10  LoopGuard   -> evaluate LOOP_SCORE, check failure_budget, iteration cap
#11  ReTest      -> re-run tests for changed files
#12  DoneProof   -> verify requirements, tests, architecture, review, docs
#13  Document    -> generate docs/ with WHY + WHAT
#14  LearnGate   -> evaluate learning gate outcome
#15  Consolidate -> DROP | ARCHIVE | LINK | PROMOTE knowledge into .sdd/
#16  Complete    -> mark task COMPLETED, update projects/{project_name}/.specdd/task-context/
```

### Chain Variants:
<!-- [END:APPEND:execution-trace] -->

<!-- [APPEND:chain-variants] -->
<!-- Section: Chain Variants -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Chain | Description | File |
|-------|-------------|------|
| `feature` | Feature development workflow | `chains/feature.sdd` |
| `bugfix` | Bug fix workflow | `chains/bugfix.sdd` |
| `hotfix` | Hot production fix | `chains/hotfix.sdd` |
| `incident` | Incident response | `chains/incident.sdd` |
| `refactor` | Refactoring workflow | `chains/refactor.sdd` |
| `migration` | Data/schema migration | `chains/migration.sdd` |
| `maintenance` | Ongoing maintenance | `chains/maintenance.sdd` |
| `fast-path` | Accelerated execution | `chains/fast-path.sdd` |
| `security` | Security-focused pipeline | `chains/security.sdd` |
| `default` | Base/default chain | `chains/default.sdd` |

<!-- [END:APPEND:chain-variants] -->

<!-- [APPEND:file-classification] -->
<!-- Section: File Classification Catalog -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

## 3. File Classification Catalog

<!-- [END:APPEND:file-classification] -->

<!-- [APPEND:business-domain-execution] -->
<!-- Section: Business Domain: Execution/Workflow -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Execution/Workflow**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/chains/graph.sdd` | Master execution graph (16-step trace, arms, rules) | SDDRA Execution |
| `.sdd/chains/chains.sdd` | Execution chains registry | Workflow Definition |
| `.sdd/chains/selector.sdd` | Chain selection logic | Routing |
| `.sdd/chains/default.sdd` | Default chain definition | Base Workflow |
| `.sdd/chains/feature.sdd` | Feature development chain | Feature Workflow |
| `.sdd/chains/bugfix.sdd` | Bug fix chain | Bugfix Workflow |
| `.sdd/chains/fast-path.sdd` | Accelerated execution path | Fast Path |

<!-- [END:APPEND:business-domain-execution] -->

<!-- [APPEND:business-domain-governance] -->
<!-- Section: Business Domain: Governance/Architecture -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Governance/Architecture**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/decisions/INDEX.sdd` | Central decision ledger | DECIDE Framework |
| `.sdd/decisions/rules.sdd` | Decision rules (DR1-DR90) | Governance |
| `.sdd/decisions/workflow.sdd` | Decision workflow states | Decision Process |
| `.sdd/decisions/stack-selection.sdd` | Tech stack decision | Architecture Decision |

<!-- [END:APPEND:business-domain-governance] -->

<!-- [APPEND:business-domain-implementation] -->
<!-- Section: Business Domain: Implementation/Patterns -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Implementation/Patterns**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/skills/skills.sdd` | Root skills index | Skill Registry |
| `.sdd/skills/INDEX.sdd` | Skills directory structure | Organization |
| `.sdd/skills/SKILL-EXECUTION.sdd` | Core execution skill | TDD |
| `.sdd/skills/SKILLS-REFERENCE.md` | Skills reference (human-readable) | Documentation |
| `.sdd/skills/cross-cutting/testing/` | TDD, BDD, E2E, integration skills | Testing Methods |
| `.sdd/skills/languages/` | Language-specific skills (Go L1-L5, Python L1-L5, etc.) | Language Patterns |
| `.sdd/skills/frameworks/` | Framework skills (Django, React, Next.js, etc.) | Framework Patterns |
| `.sdd/skills/devops/` | DevOps skills (git, CI/CD, security, testing) | CI/CD |
| `.sdd/skills/meta/` | Meta-skills (discovery, gap analysis, recommendation) | Self-Management |

<!-- [END:APPEND:business-domain-implementation] -->

<!-- [APPEND:business-domain-agent] -->
<!-- Section: Business Domain: Agent Contract/Roles -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Agent Contract/Roles**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/agent/INDEX.sdd` | Agent registry (8 core + 4 specialty roles) | Role Definition |
| `.sdd/agent/roles.sdd` | Roles: discovery, architect, implementer, tester, reviewer, documentation, security, supervisor, knowledge + health/ml/devops/business | Agent Roles |
| `.sdd/agent/capabilities.sdd` | Agent capabilities and constraints | Capability Modeling |
| `.sdd/agent/contract.sdd` | Agent contract (CAN/MUST/CANNOT) | Contract Definition |
| `.sdd/agent/ecc-bridge.sdd` | ECC agent → SDD role bridge (67 ECC agents) | Integration |
| `.sdd/agent/supervisor.sdd` | Supervisor orchestration role (4 ECC equivalents) | Orchestration |
| `.sdd/agent/security-rules.sdd` | AgentShield 102 rules → SDD L0-L5 mapping | Security |
| `.sdd/agent/prompts/INDEX.sdd` | ECC agent prompt summaries index | Prompt Reference |
| `.sdd/agent/permissions.sdd` | Permission rules for agents | Security |
| `.sdd/agent/approvals.sdd` | Approval requirements | Governance |

<!-- [END:APPEND:business-domain-agent] -->

<!-- [APPEND:business-domain-quality] -->
<!-- Section: Business Domain: Quality/Compliance -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Quality/Compliance**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/gates/INDEX.sdd` | Universal gate engine | Quality Gates |
| `.sdd/gates/security.sdd` | Security gate definitions | OWASP/Compliance |
| `.sdd/gates/quality.sdd` | Code quality gates | Quality Assurance |
| `.sdd/gates/security/SAST.sdd` | Static analysis gate | Security Testing |
| `.sdd/gates/security/SECRETS.sdd` | Secret detection gate | Security Scanning |
| `.sdd/gates/security/ABUSE.sdd` | Abuse prevention gate | Security Controls |

<!-- [END:APPEND:business-domain-quality] -->

<!-- [APPEND:business-domain-knowledge] -->
<!-- Section: Business Domain: Knowledge/Design -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Knowledge/Design**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/concepts/INDEX.sdd` | Knowledge model registry | Knowledge Management |
| `.sdd/concepts/KNOWLEDGE-MODEL.sdd` | Knowledge model (4-tier memory) | Memory Architecture |
| `.sdd/concepts/CANONICALIZATION.sdd` | Concept normalization rules | Canonicalization |
| `.sdd/concepts/RELATIONSHIP-VOCABULARY.sdd` | Graph edge types (USES, REQUIRES, etc.) | Semantic Relationships |
| `.sdd/knowledge/` | Knowledge lifecycle, compression, versioning | Knowledge Lifecycle |
| `.sdd/evolution/` | Self-evolution pipeline + candidates/challenges/proposals/approved | Evolution System |
| `.sdd/evolution/import-plan.sdd` | ECC skill import plan (281 skills, 4 phases) | Integration |
| `.sdd/patterns/` | Design patterns (circuit breaker, graceful degradation) | Pattern Library |
| `.sdd/references/sdd/` | SDD methodology references (ECC, living specs) | Methodology |

<!-- [END:APPEND:business-domain-knowledge] -->

<!-- [APPEND:business-domain-project] -->
<!-- Section: Business Domain: Project Management -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Project Management**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/projects/INDEX.sdd` | Project registry | Project Management |
| `.sdd/projects/{project_name}/` | Template project instance | Project Template |
| `.sdd/projects/{project_name}/INDEX.sdd` | Project-level configuration | Project Configuration |
| `.sdd/tasks/TASK-STATE-MACHINE.sdd` | Task lifecycle states | State Management |
| `.sdd/tasks/LOOP-PROTECTION.sdd` | Loop detection and prevention | Risk Management |
| `.sdd/tasks/AUTONOMY-POLICY.sdd` | L0-L5 autonomy levels | Autonomy Policy |
| `.sdd/tasks/DONE-PROOF.sdd` | Completion proof requirements | Verification |
| `.sdd/tasks/FAILURE-CLASSIFICATION.sdd` | Failure type taxonomy | Failure Analysis |

<!-- [END:APPEND:business-domain-project] -->

<!-- [APPEND:business-domain-cli] -->
<!-- Section: Business Domain: CLI Interface -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **CLI Interface**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/commands/INDEX.sdd` | All 17 commands | CLI Interface |
| `.sdd/commands/sdd-analyze.sdd` | `/sdd-analyse` command spec | Analysis |
| `.sdd/commands/sdd-next.sdd` | `/sdd-next` command spec | Decision Navigation |
| `.sdd/commands/sdd-update.sdd` | `/sdd-update` command spec | Sync |
| `.sdd/commands/sdd-prompts.sdd` | `/sdd-prompts` command spec | Prompt Lifecycle |
| `.sdd/commands/sdd.sdd` | `/sdd` main entry command | Execution |
| `.sdd/commands/sdd-plan.sdd` | `/sdd-plan` command spec | Planning |
| `.sdd/commands/sdd-status.sdd` | `/sdd-status` command spec | Status |
| `.sdd/commands/sdd-health.sdd` | `/sdd-health` command spec | Health Check |
| `.sdd/commands/sdd-decisions.sdd` | `/sdd-decisions` command spec | Decision Listing |
| `.sdd/commands/sdd-compact.sdd` | `/sdd-compact` command spec | Context Compaction |
| `.sdd/commands/sdd-clean.sdd` | `/sdd-clean` command spec | Context Clearing |
| `.sdd/commands/sdd-backup.sdd` | `/sdd-backup` command spec | Backup |
| `.sdd/commands/sdd-restore.sdd` | `/sdd-restore` command spec | Restore |
| `.sdd/commands/sdd-resume.sdd` | `/sdd-resume` command spec | Resume from Checkpoint |
| `.sdd/commands/sdd-migrate.sdd` | `/sdd-migrate` command spec | Run Migrations |
| `.sdd/commands/sdd-knowledge.sdd` | `/sdd-knowledge` command spec | Knowledge Graph Health |
| `.sdd/commands/sdd-explain.sdd` | `/sdd-explain` command spec | Explain Completed Task |

<!-- [END:APPEND:business-domain-cli] -->

<!-- [APPEND:business-domain-temporal] -->
<!-- Section: Business Domain: Temporal -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Temporal**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/timeline/INDEX.sdd` | Temporal knowledge, snapshots, evolution | Temporal Management |
| `.sdd/timeline/changes.sdd` | Change records (CH-XXX) | Change Tracking |
| `.sdd/timeline/changes/INDEX.sdd` | Change subdirectory index | Index |
| `.sdd/timeline/snapshots/INDEX.sdd` | Immutable snapshot subdirectory | Snapshots |
| `.sdd/timeline/migrations/INDEX.sdd` | Migration records (M-XX) | Migrations |

<!-- [END:APPEND:business-domain-temporal] -->

<!-- [APPEND:business-domain-testing] -->
<!-- Section: Business Domain: Testing -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Testing**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/testing/INDEX.sdd` | Testing framework overview | Test Strategy |
| `.sdd/testing/levels.sdd` | T-level testing standards | TDD |
| `.sdd/testing/scripts/run.ps1` | Main test runner (15/15 unit tests pass) | Test Execution |
| `.sdd/testing/scripts/integration/` | Integration test scripts | Integration Testing |

<!-- [END:APPEND:business-domain-testing] -->

<!-- [APPEND:business-domain-query] -->
<!-- Section: Business Domain: Query Language -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Query Language**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/queries/INDEX.sdd` | SDD Query Language spec (18 keywords, @navigation, saved queries) | Query Definition |
| `.sdd/queries/architecture-drift.sdd` | Saved query: drift detection | Saved Query |
| `.sdd/queries/orphan-knowledge.sdd` | Saved query: orphan knowledge detection | Saved Query |
| `.sdd/queries/unverified-skills.sdd` | Saved query: low-confidence skills | Saved Query |
| `.sdd/queries/high-risk-tasks.sdd` | Saved query: risk assessment | Saved Query |
| `.sdd/queries/payment-impact.sdd` | Saved query: domain impact analysis | Saved Query |

<!-- [END:APPEND:business-domain-query] -->

<!-- [APPEND:business-domain-intent] -->
<!-- Section: Business Domain: Intent System -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Intent System**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/intents/INDEX.sdd` | Intent object schema, lifecycle, requirements extraction | Intent Processing |

<!-- [END:APPEND:business-domain-intent] -->

<!-- [APPEND:business-domain-planning] -->
<!-- Section: Business Domain: Planning System -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Planning System**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/plans/INDEX.sdd` | Execution plan schema, modes, approval gates, versioning | Plan Management |
| `.sdd/plans/execution-plan.sdd` | Dependency graph, critical path, risk, journal, crash recovery | Execution Planning |

<!-- [END:APPEND:business-domain-planning] -->

<!-- [APPEND:business-domain-assumptions] -->
<!-- Section: Business Domain: Assumptions -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Assumptions**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/assumptions/INDEX.sdd` | Assumption registry with risk levels and replan triggers | Risk Management |

<!-- [END:APPEND:business-domain-assumptions] -->

<!-- [APPEND:business-domain-bootstrap] -->
<!-- Section: Business Domain: Bootstrap -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Bootstrap**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/bootstrap/INDEX.sdd` | Bootstrap protocol overview with authority, identity, navigation | AI Entry Point |
| `.sdd/bootstrap/AI_BOOTSTRAP.sdd` | 13-phase machine-oriented entry protocol | AI Bootstrap |
| `.sdd/bootstrap/authority.sdd` | Authority model — can/cannot lists + check chain | Permission Model |
| `.sdd/bootstrap/identity.sdd` | AI identity — role, capabilities, environment | Identity Resolution |
| `.sdd/bootstrap/handoff.sdd` | Agent-to-agent handoff with context compression | State Transfer |

<!-- [END:APPEND:business-domain-bootstrap] -->

<!-- [APPEND:business-domain-glossary] -->
<!-- Section: Business Domain: Glossary -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Glossary**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/glossary/INDEX.sdd` | Canonical terminology system (15 terms with aliases) | Terminology Management |

<!-- [END:APPEND:business-domain-glossary] -->

<!-- [APPEND:business-domain-system] -->
<!-- Section: Business Domain: System -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **System**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/system/context/INDEX.sdd` | Context compiler with progressive disclosure + manifests | Context Compilation |
| `.sdd/system/tool-governance.sdd` | Tool governance capability chain + source trust hierarchy + action journal | Tool Gatekeeping |

<!-- [END:APPEND:business-domain-system] -->

<!-- [APPEND:business-domain-governance] -->
<!-- Section: Business Domain: Governance -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Governance**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/governance/INDEX.sdd` | Governance system overview and capability chain | Tool Governance |
| `.sdd/governance/capabilities.sdd` | 20 capabilities across 8 categories (CODE, DATA, TEST, GIT, DEPLOY, NETWORK, SECRET, SYSTEM) | Capability Taxonomy |
| `.sdd/governance/permissions.sdd` | Permission matrix + environment policies (local/staging/production) | Access Control |
| `.sdd/governance/resources.sdd` | 15 resources with data classification tiers (PUBLIC to RESTRICTED) | Resource Classification |
| `.sdd/governance/locks.sdd` | Lock types (READ, WRITE, EXCLUSIVE, MIGRATION, DEPLOYMENT) + compatibility matrix | Concurrency Control |
| `.sdd/governance/security-events.sdd` | Trust hierarchy (7 levels) + security event format + action journal | Security Logging |

<!-- [END:APPEND:business-domain-governance] -->

<!-- [APPEND:business-domain-lifecycle] -->
<!-- Section: Business Domain: Lifecycle -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Lifecycle**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/lifecycle/INDEX.sdd` | Knowledge lifecycle system with garbage collector + compactor | Knowledge Maintenance |
| `.sdd/lifecycle/states.sdd` | State machine: ACTIVE → STALE → DEPRECATED → ARCHIVED + transition rules | Lifecycle Management |
| `.sdd/lifecycle/quality-dimensions.sdd` | 6 quality dimensions (duplicate, fragmented, orphan, unused, contradicted, superseded) + scoring | Quality Assessment |

<!-- [END:APPEND:business-domain-lifecycle] -->

<!-- [APPEND:business-domain-runtime] -->
<!-- Section: Business Domain: Runtime -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

### Business Domain: **Runtime**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/runtime/INDEX.sdd` | Runtime state overview | Runtime Management |
| `.sdd/runtime/memory-model.sdd` | 4-tier memory model | Memory Architecture |
| `.sdd/runtime/context-builder.sdd` | Context compilation | Context Management |
| `.sdd/runtime/adapter-runtime.sdd` | Adapter runtime engine + SecurityScanner/MCPBridge | Runtime Engine |
| `.sdd/runtime/mcp-integration.sdd` | MCP server integration (35 servers, 3 bridges) | MCP Integration |

<!-- [END:APPEND:business-domain-runtime] -->

<!-- [APPEND:git-commit-traceability] -->
<!-- Section: Git Commit → Task Traceability -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

## 4. Git Commit → Task Traceability

| Commit | Message | Impact |
|--------|---------|--------|
| `e70aa4f` | feat(security): runtime scanner patterns | Security patterns added |
| `aca7600` | docs(commands): SDD health + commands | Documentation updates |
| `27a0106` | chore(sdd): State: + markers (40 files) | Spec integrity |
| `5b68007` | feat(integration): ECC bridge | ECC framework integration |
| `d3985eb` | chore: ignore prompts/inbox | `.gitignore` update |
| `31dc4a7` | feat(commands): /sdd-plan + enhanced analyser | Command system |
| `fefdd76` | chore: force-add command files | Command persistence |
| `f9454ca` | feat: add /sdd-next command | Decision navigation |
| `5411c2b` | docs: command workflow guidance | Human-readable docs |

<!-- [END:APPEND:git-commit-traceability] -->

<!-- [APPEND:cross-reference-mapping] -->
<!-- Section: Cross-Reference Mapping -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

## 5. Cross-Reference Mapping

### Key Reference Chains:
```
PROJECT.sdd
  → chains/graph.sdd (execution graph)
  → decisions/INDEX.sdd (decision rules)
  → project/INDEX.sdd (project model)
  → skills/skills.sdd (skills registry)
  → tasks/index.sdd (task management)
  → agent/INDEX.sdd (agent contract)
  → runtime/INDEX.sdd (runtime state)

graph.sdd
  → chains/rules/chain-rules.sdd
  → chains/arms/INDEX.sdd (P1, D1, S1, C1, R1, DEP1)
  → workflow/execution-loop.sdd
  → tasks/TASK-STATE-MACHINE.sdd
  → tasks/LOOP-PROTECTION.sdd
  → workflow/learning-gate.sdd
  → workflow/human-docs-gate.sdd
```

<!-- [END:APPEND:cross-reference-mapping] -->

<!-- [APPEND:knowledge-gaps-risks] -->
<!-- Section: Knowledge Gaps & Risks -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

## 6. Knowledge Gaps & Risks

1. **No instantiated project** — `{project_name}` remains a template per [R47] and [R48]. A real project name must be selected by a human.

2. **Pending prompts** — `prompts/inbox/` contains 5 remaining unprocessed user requests (IDs 165-169). Prompts 170-171 have been extracted into `.sdd/references/sdd/ecc-framework-overview.sdd` and `.sdd/references/sdd/living-specs-best-practices.sdd`. Prompts 165-169 (Phases 130-134) have been synthesized into `.sdd/references/sdd/phases-130-134-overview.sdd` with cross-references to existing implementation files:
   - PHASE 130: Time, version, and system evolution → `timeline/` directory
   - PHASE 131: Task graph & autonomous execution planner → `graph/`, `tasks/`
   - PHASE 132: Multi-agent coordination & shared state → `agent/`
   - PHASE 133: Semantic engineering graph → `graph/`, `concepts/`
   - PHASE 134: Self-evolving SDD → `evolution/`, `knowledge/`, `workflow/`

3. **Gitignored command files** — `.claude/commands/` is gitignored per `.gitignore`, meaning command files persist only locally. ECC integration plans to force-add command files (see import-plan.sdd).

4. **No runtime snapshots** — `timeline/snapshots/INDEX.sdd` exists as a directory index but no `SNAPSHOT-*.sdd` files have been created yet.

5. **No active tasks** — The `projects/{project_name}/tasks/` directory has an `INDEX.sdd` but no concrete task files.

6. **Pester 3.4.0 limitation** — Test script uses custom PowerShell test framework (no external dependencies), avoiding `BeGreaterOrEqual` operator issue.

7. **Prompt encoding** — Prompts 165-169 contain non-ASCII encoding artifacts (likely Turkish characters in original prompt), requiring careful extraction.

<!-- [END:APPEND:knowledge-gaps-risks] -->

<!-- [APPEND:recommendations] -->
<!-- Section: Recommendations -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

## 7. Recommendations

1. **Process prompts/inbox/ first** — 6 pending prompts represent the user's deepest requirements. Run `/sdd-plan` to auto-generate an execution plan.

2. **Select a project name** — `{project_name}` must be replaced with a real project name before any work can be tracked meaningfully.

3. **Enable `/sdd-plan` workflow** — The command is ready in `.claude/commands/sdd-plan.md` and registered in `.sdd/commands/INDEX.sdd`.

4. **Use `/sdd-next` after task completion** — To advance the decision chain after executing planned tasks.

5. **Run `/sdd-health` periodically** — To check system integrity as the `.sdd/` structure evolves.

<!-- [END:APPEND:recommendations] -->
