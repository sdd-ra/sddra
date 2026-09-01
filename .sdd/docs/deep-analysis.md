# SDDRA Deep System Analysis

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Name** | SDDRA |
| **Domain** | AI Dev Tools / Spec-Driven Development |
| **Stack** | TypeScript (`.sdd` specification model) |
| **Architecture** | Modular Monolith (per `PROJECT.sdd`) |
| **Execution Model** | Docker-based (per [R59]) |
| **Git Workflow** | main → stage → test → MODUL/<module> → DEC/<id> → TASK/<id> (per [R75]) |

---

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
#16  Complete    -> mark task COMPLETED, update .specdd/task-context/
```

### Chain Variants:
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

---

## 3. File Classification Catalog

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

### Business Domain: **Governance/Architecture**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/decisions/INDEX.sdd` | Central decision ledger | DECIDE Framework |
| `.sdd/decisions/rules.sdd` | Decision rules (DR1-DR90) | Governance |
| `.sdd/decisions/workflow.sdd` | Decision workflow states | Decision Process |
| `.sdd/decisions/stack-selection.sdd` | Tech stack decision | Architecture Decision |

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

### Business Domain: **Agent Contract/Roles**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/agent/INDEX.sdd` | Agent registry | Role Definition |
| `.sdd/agent/roles.sdd` | Roles: discovery, architect, implementer, tester, reviewer, documentation, security, supervisor | Agent Roles |
| `.sdd/agent/capabilities.sdd` | Agent capabilities and constraints | Capability Modeling |
| `.sdd/agent/contract.sdd` | Agent contract (CAN/MUST/CANNOT) | Contract Definition |
| `.sdd/agent/ecc-bridge.sdd` | ECC agent → SDD role bridge | Integration |
| `.sdd/agent/permissions.sdd` | Permission rules for agents | Security |
| `.sdd/agent/approvals.sdd` | Approval requirements | Governance |

### Business Domain: **Quality/Compliance**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/gates/INDEX.sdd` | Universal gate engine | Quality Gates |
| `.sdd/gates/security.sdd` | Security gate definitions | OWASP/Compliance |
| `.sdd/gates/quality.sdd` | Code quality gates | Quality Assurance |
| `.sdd/gates/security/SAST.sdd` | Static analysis gate | Security Testing |
| `.sdd/gates/security/SECRETS.sdd` | Secret detection gate | Security Scanning |
| `.sdd/gates/security/ABUSE.sdd` | Abuse prevention gate | Security Controls |

### Business Domain: **Knowledge/Design**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/concepts/INDEX.sdd` | Knowledge model registry | Knowledge Management |
| `.sdd/concepts/KNOWLEDGE-MODEL.sdd` | Knowledge model (4-tier memory) | Memory Architecture |
| `.sdd/concepts/CANONICALIZATION.sdd` | Concept normalization rules | Canonicalization |
| `.sdd/concepts/RELATIONSHIP-VOCABULARY.sdd` | Graph edge types (USES, REQUIRES, etc.) | Semantic Relationships |
| `.sdd/knowledge/` | Knowledge lifecycle, compression, versioning | Knowledge Lifecycle |
| `.sdd/evolution/` | Self-evolution pipeline | Evolution System |
| `.sdd/patterns/` | Design patterns (circuit breaker, graceful degradation) | Pattern Library |

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

### Business Domain: **CLI Interface**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/commands/INDEX.sdd` | All 14+ commands | CLI Interface |
| `.sdd/commands/sdd-analyze.sdd` | `/sdd-analyse` command spec | Analysis |
| `.sdd/commands/sdd-next.sdd` | `/sdd-next` command spec | Decision Navigation |
| `.sdd/commands/sdd-update.sdd` | `/sdd-update` command spec | Sync |
| `.sdd/commands/sdd-prompts.sdd` | `/sdd-prompts` command spec | Prompt Lifecycle |
| `.sdd/commands/sdd.sdd` | `/sdd` main entry command | Execution |

### Business Domain: **Policy/Ops**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/policies/INDEX.sdd` | Policy registry | Governance |
| `.sdd/policies/evolution.sdd` | Evolution promotion levels | Knowledge Governance |
| `.sdd/policies/authority.sdd` | Authority levels (AUTO/ASSISTED/REVIEW/HUMAN_ONLY) | Authority Management |

### Business Domain: **Test Suite**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/testing/INDEX.sdd` | Testing framework overview | Test Strategy |
| `.sdd/testing/levels.sdd` | T-level testing standards | TDD |
| `.sdd/testing/scripts/run.ps1` | Main test runner (7/7 unit tests) | Test Execution |
| `.sdd/testing/scripts/integration/` | Integration test scripts | Integration Testing |

### Business Domain: **Runtime**
| File | Purpose | Method |
|------|---------|--------|
| `.sdd/runtime/INDEX.sdd` | Runtime state overview | Runtime Management |
| `.sdd/runtime/memory-model.sdd` | 4-tier memory model | Memory Architecture |
| `.sdd/runtime/context-builder.sdd` | Context compilation | Context Management |
| `.sdd/runtime/adapter-runtime.sdd` | Adapter runtime engine | Runtime Engine |

---

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

---

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

---

## 6. Knowledge Gaps & Risks

1. **No instantiated project** — `{project_name}` remains a template per [R47] and [R48]. A real project name must be selected by a human.

2. **Pending prompts** — `prompts/inbox/` contains 6 unprocessed user requests (IDs 165-171), including:
   - PHASE 130: Time, version, and system evolution
   - PHASE 131: Task graph & autonomous execution planner
   - PHASE 132: Multi-agent coordination & shared state
   - PHASE 133: Semantic engineering graph
   - PHASE 134: Self-evolving SDD
   - ECC integration reference document

3. **Gitignored command files** — `.claude/commands/` is gitignored per `.gitignore`, meaning command files (`sdd-plan.md`, `sdd-analyze.md`, `sdd-next.md`) persist only locally.

4. **No runtime snapshots** — No `SNAPSHOT-*.sdd` files exist yet; the temporal/versioning system is defined in `.sdd/evolution/` but not yet instantiated.

5. **No active tasks** — The `projects/{project_name}/tasks/` directory has an `INDEX.sdd` but no concrete task files.

---

## 7. Recommendations

1. **Process prompts/inbox/ first** — 6 pending prompts represent the user's deepest requirements. Run `/sdd-plan` to auto-generate an execution plan.

2. **Select a project name** — `{project_name}` must be replaced with a real project name before any work can be tracked meaningfully.

3. **Enable `/sdd-plan` workflow** — The command is ready in `.claude/commands/sdd-plan.md` and registered in `.sdd/commands/INDEX.sdd`.

4. **Use `/sdd-next` after task completion** — To advance the decision chain after executing planned tasks.

5. **Run `/sdd-health` periodically** — To check system integrity as the `.sdd/` structure evolves.