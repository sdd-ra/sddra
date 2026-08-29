# SDDRA System — Current State and Architecture

## Overview

SDDRA (Specification-Driven Development for AI) is a framework that transforms `.sdd` markdown specifications into executable AI development workflows. It combines deterministic control (compiler, validator, policy engine) with AI reasoning (agents, skills, context resolution).

## What Has Been Built

### 1. Protocol Layer (`.sdd/protocol/`)
- **ROOT.sdd**: Universal rules — state symbols, stage vocabulary, chain syntax, reference system, context priority, agent behavior rules, failure routing, human approval levels, conflict resolution, pyramid branching hierarchy
- **skill-execution.sdd**: Skill execution protocol — contracts, chains, gates, guards, versioning, autonomy/trust levels, least privilege, failure classification

### 2. Architecture Layer (`.sdd/architecture/`)
- **runtime-architecture.sdd**: Compiler, validator, resolver, graph builder, planner, execution engine, event-driven state machine, plan versioning, replanning
- **data.sdd**: Entity/relationship data model, hybrid storage (filesystem + PostgreSQL + graph), temporal graph, snapshots, graph integrity
- **observability.sdd**: AI decision trace, context trace, policy trace, cost tracking, token efficiency, tool/agent/skill performance, data classification, secret redaction, event architecture

### 3. Graph Layer (`.sdd/graph/`)
- **model.sdd**: Formal entity and relationship schema — node types, edge types, cardinality, typed relationships, storage model
- **nodes.sdd, relations.sdd, traceability.sdd, impact.sdd**: Graph traversal, forward/reverse impact analysis, blast radius, coverage, drift detection

### 4. Skills Layer (`.sdd/skills/`)
- **INDEX.sdd**: Skill intelligence engine — layered skills (L1-L5) for languages, frameworks, databases, platforms, messaging, DevOps
- **cross-cutting/, meta/**: Skill discovery, recommendation, gap analysis, testing, security, architecture, observability

### 5. Task Engine (`.sdd/tasks/`)
- **tasks.sdd**: Task contracts, lifecycle (DRAFT → READY → IN_PROGRESS → BLOCKED → DONE), scope boundaries, acceptance criteria, pyramid branching hierarchy
- **decomposition.sdd**: AI proposal protocol, engine validation, coverage matrix, orphan detection, dynamic task graph, plan versioning, research tasks

### 6. Orchestrator (`.sdd/orchestrator/`)
- **routing.sdd**: Agent selection, capability matching, policy evaluation, cost-aware routing, handoff contracts, trust/autonomy levels, multi-agent orchestration
- **pipeline.sdd**: New project, existing project, skill integration, cross-layer pipelines
- **intent.sdd, modes.sdd, state.sdd, boundary.sdd**: Intent normalization, execution modes, state management, trust boundaries

### 7. Runtime (`.sdd/runtime/`)
- **context.sdd**: Context engine — graph-based retrieval, hybrid semantic+graph search, token budget, context priority, staleness detection, context versioning
- **execution.sdd**: Execution engine — state machine (11 states), event-driven execution, idempotency, checkpoints, durable execution, crash recovery, retry/backoff, compensation/saga, leases/heartbeats, execution budget
- **events.sdd**: Event architecture — envelope, versioning, event bus, DLQ, correlation/causation IDs, duplicate handling, ordering, data classification

### 8. Workflow (`.sdd/workflow/`)
- **policies.sdd**: Governance model — capability/permission/policy distinction, rule/constraint/guard/gate/approval, policy engine, precedence, deny-by-default, scopes, versioning, snapshots, tool sandbox, human-in-the-loop
- **stages.sdd, transitions.sdd, gates.sdd**: Stage registry, transitions, gate criteria
- **testing.sdd**: Test levels T0-T7, test pyramid

### 9. Observability (`.sdd/observability/`)
- **ai-observability.sdd**: AI execution fingerprint, end-to-end trace, provenance, root cause analysis, failure taxonomy, budget policy, feedback loop
- **logging.sdd, metrics.sdd, tracing.sdd, alerting.sdd, health.sdd, diagnostics.sdd, incident.sdd**: System observability

### 10. Git Workflow (`.sdd/GIT-WORKFLOW.sdd`)
- **Pyramid Branching**: decision → model → task → subtask → BE/FE/MD/TS/SC/CR → commits
- **Merge Flow**: Bottom-up merge to decision, then decision → test → stage → prod
- **Deletion**: All intermediate branches deleted after PR merge, except master/develop
- **Semantic Commits**: `<type>(<scope>): <subject>` with SDDRA-specific scopes

## Key Principles

1. **Separation of Concerns**: Specification, Execution, and Observation are separate layers
2. **Deterministic Core**: Compiler, validator, policy engine are deterministic; AI is only for reasoning
3. **AI Freedom + SDD Control**: AI has intelligence within boundaries set by SDD
4. **No Signatures**: Agent MUST NOT add signatures, emojis, or decorative symbols — reserved for human use only
5. **Minimal Context**: Agent gets minimum sufficient context, never full project dump
6. **Event Sourcing**: Events are immutable, append-only; state is projection of events
7. **Capability ≠ Permission ≠ Policy**: Agent can do something ≠ allowed to do it ≠ allowed under current conditions
8. **Agent ≠ Authority**: Agents have autonomy but not authority; authority comes from SDD governance

## Current State

The system is fully specified at the `.sdd` level. The following components have formal definitions:
- Protocol and universal rules
- Architecture and data model
- Skill system and execution protocol
- Task engine and decomposition
- Agent orchestration and routing
- Context engine
- Execution engine and state machine
- Policy engine and governance
- Event architecture
- Observability and audit
- Git workflow with pyramid branching

## What Remains

1. **Implementation**: The `.sdd` files are specifications. An actual compiler/runtime needs to be implemented (likely in Go, based on the system's own skill definitions).
2. **PostgreSQL Schema**: The hybrid storage model needs physical database schema.
3. **Event Store**: Durable event storage implementation.
4. **Agent Runtime**: LLM integration with tool calling, context injection, policy enforcement.
5. **Chain Execution**: Actual chain graph traversal and stage execution.
6. **Testing**: The `.sdd/testing/` directory exists but needs test implementations.
7. **CLI**: The `.sdd/commands/` directory needs command implementations.

## How to Extend

To add a new concept:
1. Identify the appropriate layer (protocol, architecture, task, runtime, etc.)
2. Create or update the `.sdd` file with formal rules
3. Update INDEX files with new navigation entries
4. Ensure all references use `@path` format
5. Run `.sdd/testing/scripts/run.ps1` to validate

## File Structure Summary

```
.sdd/
├── protocol/           # Universal rules (ROOT.sdd, skill-execution.sdd)
├── architecture/       # Runtime, data, observability architecture
├── graph/              # Entity/relationship model, traceability
├── skills/             # Engineering skills by technology
├── tasks/              # Task engine, decomposition, branching
├── orchestrator/       # Intent, pipeline, routing, modes
├── runtime/            # Context, execution, events, agent
├── workflow/           # Stages, transitions, gates, policies, testing
├── observability/      # AI observability, logging, metrics, tracing
├── chains/             # Execution chains and token tracking
├── commands/           # CLI commands
├── project/            # Project-specific instances
├── GIT-WORKFLOW.sdd    # Git branching and commit strategy
└── PROJECT.sdd         # Root entry point
```

## Key Files to Read First

1. `.sdd/PROJECT.sdd` — Root entry point
2. `.sdd/protocol/ROOT.sdd` — Universal rules
3. `.sdd/architecture/runtime-architecture.sdd` — System architecture
4. `.sdd/tasks/tasks.sdd` — Task model
5. `.sdd/orchestrator/routing.sdd` — Agent orchestration
6. `.sdd/GIT-WORKFLOW.sdd` — Branching strategy
