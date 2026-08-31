# .sdd/ Directory Reference

Alphabetical reference for all directories and files in the `.sdd/` system.
This document explains what each folder contains and what each skill/file is for.

## Directory Index

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `.runtime/` | Agent runtime state | INDEX.sdd |
| `agent/` | Agent behavior rules | approvals, audit, capabilities, execution, limits, permissions, policies, rollback |
| `agents/` | Multi-agent configuration | (agent definitions) |
| `architecture/` | System architecture knowledge | architecture, availability, data, deployment, levels, networking, observability, patterns, principles, scaling |
| `bugs/` | Bug tracking | INDEX.sdd |
| `branches/` | Branch naming and transition protocols | INDEX.sdd, sdlc.sdd, stlc.sdd, DOWN-UP-TRANSITION.sdd |
| `cases/` | Case specifications | cases, ecommerce, microservices, mobile-banking, payment, real-time-analytics |
| `chains/` | Execution graph and rules | graph, selector, arms, rules, tokens, fast-path |
| `commands/` | CLI commands | sdd, sdd-analyze, sdd-status, sdd-decisions, sdd-health, sdd-knowledge, sdd-explain, sdd-next, sdd-backup, sdd-restore, sdd-resume |
| `concepts/` | Canonical knowledge concepts | KNOWLEDGE-MODEL.sdd, CANONICALIZATION.sdd, RELATIONSHIP-VOCABULARY.sdd, INDEX.sdd |
| `context/` | Context loading and budgets | budgets, cache, dependencies, loading, priorities, routing |
| `decisions/` | Decision ledger | decisions, integration, rules, schema, task-lifecycle, template, workflow, examples |
| `dependencies/` | Dependency graph engine | graph, locking |
| `discovery/` | Project discovery | baseline, confidence, conflicts, detectors, mapping, rules, scanners |
| `gates/` | Quality/security/release gates | evidence, exceptions, infrastructure, levels, performance, policy, quality, release, security, testing |
| `graph/` | Knowledge graph | coverage, dependencies, drift, graph, impact, nodes, ownership, relations, traceability |
| `insights/` | AI-discovered observations | INDEX.sdd, gaps.sdd, patterns.sdd, smells.sdd |
| `knowledge/` | Knowledge lifecycle and management | KNOWLEDGE-LIFECYCLE.sdd, COMPRESSION.sdd, VERSIONING.sdd, GOLDEN-RULES.sdd, INDEX.sdd |
| `legacy/` | Legacy audit and migration procedures | AUDIT-README.sdd |
| `lessons/` | Negative knowledge and rejected approaches | REJECTED-APPROACHES.sdd |
| `observability/` | Logging, metrics, tracing | alerting, diagnostics, health, incident, logging, metrics, observability, tracing |
| `orchestrator/` | Orchestration engine | boundary, intent, modes, pipeline, state, reasoning |
| `patterns/` | Resilience patterns | circuit-breaker, checkpoint-restore, graceful-degradation |
| `plugins/` | External plugin adapters | adapter-map, plugin-adapters/ |
| `project/` | Project-specific schemas | architecture, dependencies, domains, flows, indexes, instantiation, map, mode, modules, project, README |
| `prompts/` | Prompt intelligence engine | INDEX, prompts, tech-stack, role-assignment, provisioning |
| `protocol/` | Universal rules | ROOT.sdd |
| `references/` | Trust-weighted engineering knowledge | index, ddd, architecture, patterns, database, engineering, best-practices |
| `runtime/` | Agent runtime state and memory model | INDEX.sdd, execution.sdd, events.sdd, context.sdd, memory-model.sdd, context-builder.sdd, context-policy.sdd, context-manifest.sdd, memory-consolidation.sdd |
| `schemas/` | Canonical schemas | decision, gate, module, skill, task, workflow |
| `security/` | Security controls | controls, gates, levels, scanners, SECURITY, threats |
| `skills/` | Engineering skills | languages, frameworks, databases, platforms, messaging, cross-cutting, devops, meta |
| `stack/` | Technology stack knowledge | backend, cache, database, frontend, infrastructure, languages, messaging, mobile, observability, testing |
| `stages/` | Stage definitions | API, AR, BE, DB, DO, FE, MD, QA, RV, SC, TS, VR |
| `standards/` | Naming, levels, states | conventions, levels, naming, relations, states |
| `state/` | State symbols | state |
| `tasks/` | Task lifecycle and execution model | tasks.sdd, INDEX.sdd, TASK-STATE-MACHINE.sdd, LOOP-PROTECTION.sdd, FAILURE-CLASSIFICATION.sdd, EXECUTION-CONTRACT.sdd, AUTONOMY-POLICY.sdd, DONE-PROOF.sdd, PARTIAL-DONE.sdd, SKILL-CHAIN.sdd, TASK-SCHEDULING.sdd |
| `templates/` | Reusable project templates | INDEX, docs, decisions, tasks, stack, modules, architecture, flows, domains |
| `testing/` | Test types and gates | api, bdd, contract, e2e, gates, index, integration, levels, load, mobile, performance, types, ui, unit |
| `workflow/` | Workflow engine and implementations | dependencies, engine-recovery, gates, impl-agent-implementation, impl-agent-workflow, impl-backup-integrity, impl-chain-implementation, impl-example-prompt-to-code, impl-feature-planning, impl-intelligent-runtime, impl-knowledge-sharing, impl-migration, impl-parallel-execution, impl-recovery, impl-skill-auto-integration, impl-task-execution, lifecycle, policies, stages, state, testing, transitions |

## Detailed Reference

### .runtime/

Agent runtime state and temporary data.

| File | Purpose |
|------|---------|
| INDEX.sdd | Runtime index and state |

### agent/

Agent behavior rules and capabilities.

| File | Purpose |
|------|---------|
| approvals.sdd | Agent approval workflows |
| audit.sdd | Agent audit logging |
| capabilities.sdd | Agent capability definitions |
| execution.sdd | Agent execution rules |
| INDEX.sdd | Agent registry |
| limits.sdd | Agent resource limits |
| permissions.sdd | Agent permission matrix |
| policies.sdd | Agent policies |
| rollback.sdd | Agent rollback procedures |

### agents/

Multi-agent configuration and definitions.

### architecture/

System architecture knowledge base.

| File | Purpose |
|------|---------|
| architecture.sdd | Architecture overview |
| availability.sdd | Availability patterns |
| data.sdd | Data architecture |
| deployment.sdd | Deployment patterns |
| INDEX.sdd | Architecture index |
| levels.sdd | Architecture levels (L1-L5) |
| networking.sdd | Networking patterns |
| observability.sdd | Architecture observability |
| patterns.sdd | Architecture patterns |
| principles.sdd | Architecture principles |
| scaling.sdd | Scaling patterns |

### bugs/

Bug tracking system.

| File | Purpose |
|------|---------|
| INDEX.sdd | Bug registry and tracking rules |

### cases/

Case specifications and examples.

| File | Purpose |
|------|---------|
| cases.sdd | Case framework |
| ecommerce-platform.sdd | E-commerce case study |
| INDEX.sdd | Case index |
| microservices-migration.sdd | Microservices migration case |
| mobile-banking-app.sdd | Mobile banking case |
| payment-integration.sdd | Payment integration case |
| real-time-analytics.sdd | Real-time analytics case |

### chains/

Execution graph, arms, rules, and tokens.

| File | Purpose |
|------|---------|
| bugfix.sdd | Bugfix chain |
| chains.sdd | Chain definitions |
| default.sdd | Default chain |
| feature.sdd | Feature chain |
| fast-path.sdd | Fast path for LOW/MEDIUM risk |
| graph.sdd | Chain graph definition |
| hotfix.sdd | Hotfix chain |
| incident.sdd | Incident chain |
| INDEX.sdd | Chain index |
| maintenance.sdd | Maintenance chain |
| migration.sdd | Migration chain |
| refactor.sdd | Refactor chain |
| security.sdd | Security chain |
| selector.sdd | Chain selector |
| test-runner.sdd | Test runner chain |
| test-scenario.sdd | Test scenario chain |
| arms/ | Chain arms (code, deploy, docs, prompt, review, sdd) |
| rules/ | Chain rules |
| tokens/ | Token budgets per stage |

### commands/

CLI commands for SDDRA.

| File | Purpose |
|------|---------|
| INDEX.sdd | Command registry |
| sdd.sdd | Main /sdd command |
| sdd-analyze.sdd | /sdd-analyze command |
| sdd-decisions.sdd | /sdd-decisions command |
| sdd-health.sdd | /sdd-health command |
| sdd-status.sdd | /sdd-status command |
| sdd-backup.sdd | /sdd-backup command |
| sdd-restore.sdd | /sdd-restore command |
| sdd-resume.sdd | /sdd-resume command |

### context/

Context loading, caching, and budgets.

| File | Purpose |
|------|---------|
| budgets.sdd | Token budgets |
| cache.sdd | Context caching |
| dependencies.sdd | Context dependencies |
| INDEX.sdd | Context index |
| loading.sdd | Context loading rules |
| priorities.sdd | Context priorities |
| routing.sdd | Context routing |

### decisions/

Decision ledger and workflow.

| File | Purpose |
|------|---------|
| decisions.sdd | Decision engine |
| example-lifecycle.sdd | Decision lifecycle example |
| INDEX.sdd | Decision index |
| integration.sdd | Decision integration |
| README.md | Decision guide |
| rules.sdd | Decision rules |
| schema.sdd | Decision schema |
| task-lifecycle.sdd | Task lifecycle |
| template.sdd | Decision template |
| workflow.sdd | Decision workflow |

### dependencies/

Dependency graph and locking.

| File | Purpose |
|------|---------|
| graph.sdd | Dependency graph |
| INDEX.sdd | Dependency index |
| locking.sdd | Dependency locking |

### discovery/

Project discovery and analysis.

| File | Purpose |
|------|---------|
| baseline.sdd | Discovery baseline |
| confidence.sdd | Confidence scoring |
| conflicts.sdd | Conflict detection |
| detectors.sdd | Discovery detectors |
| INDEX.sdd | Discovery index |
| mapping.sdd | Discovery mapping |
| rules.sdd | Discovery rules |
| scanners.sdd | Discovery scanners |

### gates/

Quality, security, and release gates.

| File | Purpose |
|------|---------|
| evidence.sdd | Gate evidence |
| exceptions.sdd | Gate exceptions |
| infrastructure.sdd | Infrastructure gates |
| INDEX.sdd | Gate index |
| levels.sdd | Gate levels |
| performance.sdd | Performance gates |
| policy.sdd | Gate policies |
| quality.sdd | Quality gates |
| release.sdd | Release gates |
| security.sdd | Security gates |
| testing.sdd | Testing gates |

### graph/

Knowledge graph (nodes, relations, drift).

| File | Purpose |
|------|---------|
| coverage.sdd | Graph coverage |
| dependencies.sdd | Graph dependencies |
| drift.sdd | Graph drift detection |
| graph.sdd | Graph engine |
| impact.sdd | Impact analysis |
| INDEX.sdd | Graph index |
| nodes.sdd | Graph nodes |
| ownership.sdd | Graph ownership |
| relations.sdd | Graph relations |
| traceability.sdd | Traceability |

### observability/

Logging, metrics, tracing, incidents.

| File | Purpose |
|------|---------|
| alerting.sdd | Alerting rules |
| diagnostics.sdd | Diagnostics |
| health.sdd | Health checks |
| incident.sdd | Incident management |
| INDEX.sdd | Observability index |
| logging.sdd | Logging rules |
| metrics.sdd | Metrics collection |
| observability.sdd | Observability overview |
| tracing.sdd | Distributed tracing |

### orchestrator/

Orchestration engine and reasoning.

| File | Purpose |
|------|---------|
| boundary.sdd | Orchestrator boundaries |
| INDEX.sdd | Orchestrator index |
| intent.sdd | Intent engine |
| modes.sdd | Orchestrator modes |
| pipeline.sdd | Pipeline definitions |
| reasoning.sdd | Human-like reasoning patterns |
| state.sdd | Orchestrator state |

### patterns/

Resilience and reliability patterns.

| File | Purpose |
|------|---------|
| INDEX.sdd | Pattern registry |
| circuit-breaker.sdd | Circuit breaker pattern |
| checkpoint-restore.sdd | Checkpoint/restore pattern |
| graceful-degradation.sdd | Graceful degradation pattern |

### plugins/

External plugin adapters.

| File | Purpose |
|------|---------|
| adapter-map.sdd | Plugin adapter map |
| INDEX.sdd | Plugin index |
| README.sdd | Plugin guide |
| plugin-adapters/ | Individual plugin adapters |

### project/

Project-specific schemas and routing.

| File | Purpose |
|------|---------|
| architecture.sdd | Project architecture |
| dependencies.sdd | Project dependencies |
| domains.sdd | Project domains |
| flows.sdd | Project flows |
| INDEX.sdd | Project index |
| indexes.sdd | Project indexes |
| instantiation.sdd | Project instantiation |
| map.sdd | Project map |
| mode.sdd | Project mode |
| modules.sdd | Project modules |
| project.sdd | Project model |
| README.sdd | Project guide |
| architecture/ | Project architecture files |
| context/ | Project context |
| decisions/ | Project decisions |
| docs/ | Project docs |
| stack/ | Project stack |
| tasks/ | Project tasks |

### prompts/

Prompt intelligence engine.

| File | Purpose |
|------|---------|
| INDEX.sdd | Prompt index |
| prompts.sdd | Prompt manager |
| README.md | Prompt guide |
| provisioning/ | Provisioning prompts |
| role-assignment/ | Role assignment prompts |
| tech-stack/ | Tech stack prompts |

### protocol/

Universal rules (above everything).

| File | Purpose |
|------|---------|
| ROOT.sdd | Universal rules and principles |

### runtime/

Agent runtime state.

| File | Purpose |
|------|---------|
| agent.sdd | Runtime agent state |
| current.sdd | Current runtime state |
| events.sdd | Runtime events |
| session.sdd | Runtime session |

### schemas/

Canonical schemas for .sdd/ files.

| File | Purpose |
|------|---------|
| decision.sdd | Decision schema |
| gate.sdd | Gate schema |
| module.sdd | Module schema |
| skill.sdd | Skill schema |
| task.sdd | Task schema |
| workflow.sdd | Workflow schema |

### security/

Security controls and scanners.

| File | Purpose |
|------|---------|
| controls.sdd | Security controls |
| gates/ | Security gates (ABUSE, API, CONTAINER, DAST, DEPENDENCY, PENTEST, SAST, SECRETS) |
| INDEX.sdd | Security index |
| levels.sdd | Security levels |
| scanners.sdd | Security scanners |
| SECURITY.sdd | Security overview |
| threats.sdd | Threat models |

### skills/

Engineering skills organized by technology and competency layers (L1-L5).

| Directory | Purpose |
|-----------|---------|
| cross-cutting/ | Cross-cutting concerns (testing, security, architecture, observability) |
| databases/ | Database skills (postgresql, mongodb, redis, mysql, cassandra, elasticsearch) |
| devops/ | DevOps skills (git, ci-cd, security, testing) |
| frameworks/ | Framework skills (react, flutter, nextjs, nestjs, spring-boot, django, fastapi, express, dotnet, laravel, symfony, svelte, swiftui, kotlin-multiplatform, react-native) |
| languages/ | Language skills (go, rust, java, python, csharp, cpp, typescript, javascript, swift, kotlin, ruby, php) |
| meta/ | Meta-skills (discovery, recommendation, gap analysis) |
| messaging/ | Messaging skills (kafka, rabbitmq, nats) |
| platforms/ | Platform skills (docker, kubernetes, aws, gcp, azure, terraform) |

### stack/

Technology stack knowledge base.

| File | Purpose |
|------|---------|
| INDEX.sdd | Stack index |
| backend.sdd | Backend technologies |
| cache.sdd | Cache technologies |
| database.sdd | Database technologies |
| frontend.sdd | Frontend technologies |
| infrastructure.sdd | Infrastructure technologies |
| languages.sdd | Programming languages |
| messaging.sdd | Messaging technologies |
| mobile.sdd | Mobile technologies |
| observability.sdd | Observability technologies |
| testing.sdd | Testing technologies |

### stages/

Stage definitions for chain graph.

| File | Purpose |
|------|---------|
| API.sdd | API stage |
| AR.sdd | Architecture stage |
| BE.sdd | Backend stage |
| DB.sdd | Database stage |
| DO.sdd | DevOps stage |
| FE.sdd | Frontend stage |
| MD.sdd | Mobile stage |
| QA.sdd | Quality assurance stage |
| RV.sdd | Review stage |
| SC.sdd | Security check stage |
| TS.sdd | Testing stage |
| VR.sdd | Verification stage |

### standards/

Naming conventions, levels, states, relations.

| File | Purpose |
|------|---------|
| conventions.sdd | Naming conventions |
| INDEX.sdd | Standards index |
| levels.sdd | Competency levels (L1-L5) |
| naming.sdd | Naming standards |
| relations.sdd | Relation types |
| states.sdd | State symbols |

### state/

State symbols and transitions.

| File | Purpose |
|------|---------|
| state.sdd | State definitions |

### tasks/

Task lifecycle engine.

| File | Purpose |
|------|---------|
| tasks.sdd | Task engine |

### templates/

Reusable project structure templates.

| File | Purpose |
|------|---------|
| INDEX.sdd | Template registry |
| _sdd/docs/ | Documentation templates |
| _sdd/decisions/ | Decision templates |
| _sdd/tasks/ | Task templates |
| _sdd/stack/ | Stack templates |
| _sdd/modules/ | Module templates (api, db, cases, flow, module) |
| _sdd/architecture/ | Architecture templates |
| _sdd/flows/ | Flow templates |
| _sdd/domains/ | Domain templates |

### testing/

Test types, levels, and gates.

| File | Purpose |
|------|---------|
| api.sdd | API testing |
| bdd.sdd | BDD testing |
| contract.sdd | Contract testing |
| e2e.sdd | E2E testing |
| gates.sdd | Test gates |
| INDEX.sdd | Testing index |
| integration.sdd | Integration testing |
| levels.sdd | Test levels |
| load.sdd | Load testing |
| mobile.sdd | Mobile testing |
| performance.sdd | Performance testing |
| types.sdd | Test types |
| ui.sdd | UI testing |
| unit.sdd | Unit testing |

### workflow/

Workflow engine components and implementations.

| File | Purpose |
|------|---------|
| dependencies.sdd | Workflow dependencies |
| engine-recovery.sdd | Workflow engine recovery |
| gates.sdd | Workflow gates |
| INDEX.sdd | Workflow index |
| impl-agent-implementation.sdd | Agent implementation workflow |
| impl-agent-workflow.sdd | Agent workflow |
| impl-backup-integrity.sdd | Backup and integrity workflow |
| impl-chain-implementation.sdd | Chain implementation workflow |
| impl-example-prompt-to-code.sdd | Example: prompt to code |
| impl-feature-planning.sdd | Feature planning workflow |
| impl-intelligent-runtime.sdd | Intelligent runtime workflow |
| impl-knowledge-sharing.sdd | Knowledge sharing workflow |
| impl-migration.sdd | Migration workflow |
| impl-parallel-execution.sdd | Parallel execution workflow |
| impl-recovery.sdd | Recovery workflow |
| impl-skill-auto-integration.sdd | Skill auto-integration workflow |
| impl-task-execution.sdd | Task execution workflow |
| lifecycle.sdd | Workflow lifecycle |
| policies.sdd | Workflow policies |
| stages.sdd | Workflow stages |
| state.sdd | Workflow state |
| testing.sdd | Workflow testing |
| transitions.sdd | Workflow transitions |

## Skills Reference

Skills are organized by domain and competency level (L1-L5).

### Languages

| Skill | Purpose |
|-------|---------|
| go/ | Go programming (L1-L5 + testing) |
| rust/ | Rust programming (L1-L5) |
| java/ | Java programming (L1-L5) |
| python/ | Python programming (L1-L5) |
| csharp/ | C# programming (L1-L3) |
| cpp/ | C++ programming (L1-L2) |
| typescript/ | TypeScript programming (L1-L4) |
| javascript/ | JavaScript programming (L1-L3) |
| swift/ | Swift programming (L1-L2) |
| kotlin/ | Kotlin programming (L1-L2) |
| ruby/ | Ruby programming (L1-L2) |
| php/ | PHP programming (L1-L3) |

### Frameworks

| Skill | Purpose |
|-------|---------|
| react/ | React (L1-L4) |
| flutter/ | Flutter (L1-L2) |
| react-native/ | React Native (L1) |
| swiftui/ | SwiftUI (L1) |
| kotlin-multiplatform/ | Kotlin Multiplatform (L1) |
| nextjs/ | Next.js (L1) |
| nestjs/ | NestJS (L1) |
| spring-boot/ | Spring Boot (L1) |
| django/ | Django (L1) |
| fastapi/ | FastAPI (L1) |
| express/ | Express (L1) |
| dotnet/ | .NET (L1) |
| laravel/ | Laravel (L1) |
| symfony/ | Symfony (L1) |
| svelte/ | Svelte (L1) |
| vue/ | Vue (L1) |

### Databases

| Skill | Purpose |
|-------|---------|
| postgresql/ | PostgreSQL (L1-L4) |
| mongodb/ | MongoDB (L1) |
| redis/ | Redis (L1) |
| mysql/ | MySQL (L1) |
| cassandra/ | Cassandra (L1) |
| elasticsearch/ | Elasticsearch (L1) |

### Platforms

| Skill | Purpose |
|-------|---------|
| docker/ | Docker (L1-L4) |
| kubernetes/ | Kubernetes (L1) |
| aws/ | AWS (L1) |
| gcp/ | GCP (L1) |
| azure/ | Azure (L1) |
| terraform/ | Terraform (L1) |

### Messaging

| Skill | Purpose |
|-------|---------|
| kafka/ | Apache Kafka (L1) |
| rabbitmq/ | RabbitMQ (L1) |
| nats/ | NATS (L1) |

### Cross-Cutting

| Skill | Purpose |
|-------|---------|
| testing/ | Testing patterns (bdd, e2e, integration, performance, tdd) |
| security/ | Security patterns (authentication, authorization, encryption) |
| architecture/ | Architecture patterns (clean-architecture, ddd, event-driven, microservices) |
| observability/ | Observability patterns (alerting, logging, metrics, tracing) |

### DevOps

| Skill | Purpose |
|-------|---------|
| git/ | Git operations (semantic-commits, branching, hooks) |
| ci-cd/ | CI/CD (pipeline, local-validation) |
| security/ | Security testing |
| testing/ | Test automation |

### Meta

| Skill | Purpose |
|-------|---------|
| SKILL-DISCOVERY | Discover needed skills for project |
| SKILL-RECOMMENDATION | Recommend skills (>= 80% relevance) |
| SKILL-GAP-ANALYSIS | Analyze skill coverage gaps |

## How to Use This Reference

### For Humans

1. **Start here**: Read this file to understand the system structure
2. **Find skills**: Look in the Skills Reference section for your technology
3. **Understand workflows**: Check the Workflows section for execution patterns
4. **Troubleshoot**: Use the Commands section for diagnostic tools

### For AI Agents

1. **Read first**: `.sdd/PROJECT.sdd` and `.sdd/INDEX.sdd`
2. **Follow ReadOrder**: Each .sdd/ file specifies when to read it
3. **Use skills**: Load skills from `.sdd/skills/` as needed
4. **Respect gates**: Human approval required at every gate
5. **Record tokens**: Track token usage at every stage

### Adding New Skills

1. Determine the domain (language, framework, database, platform, devops, meta, cross-cutting)
2. Determine the level (L1-L5)
3. Follow the SKILL-EXECUTION format
4. Add to the appropriate directory
5. Update the domain INDEX.sdd
6. Update `.sdd/INDEX.sdd` navigation
7. Update this README

## File Naming Conventions

- **Directories**: kebab-case (e.g., `cross-cutting`, `skill-auto-integration`)
- **Files**: kebab-case for workflow/patterns, UPPER-CASE for decisions/tasks (e.g., `DEC-100.sdd`, `TASK-201.sdd`)
- **Skills**: SKILL-{DOMAIN}-{NAME}-L{LEVEL} format
- **IDs**: UPPER-CASE with hyphens

## State Symbols

- `+` = Active/Stable
- `~` = In progress
- `@` = Review/Pending
- `>` = Implemented
- `*` = Verified
- `_` = Closed/Deprecated

## Versioning

- **Major**: Breaking changes to .sdd/ structure
- **Minor**: New features, skills, patterns
- **Patch**: Bug fixes, documentation updates

## Support

- **Issues**: Create decision record in `.sdd/decisions/`
- **Questions**: Check `.sdd/INDEX.sdd` for routing
- **Bugs**: Report in `.sdd/bugs/INDEX.sdd`
- **Updates**: Check `.sdd/WORK-PLAN.sdd` for progress

## License

Proprietary - All rights reserved
