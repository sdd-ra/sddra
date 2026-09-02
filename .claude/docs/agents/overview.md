<!-- [APPEND:agent-system-overview] -->
<!-- Section: Agent System Overview -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# Agent System

The SDD system uses a multi-agent coordination framework where agents are execution units,
roles define responsibilities, and ownership defines accountability.

## Overview

Agents are replaceable; state is not. Every action must be traceable, and the system enforces
strict stop conditions for safety-critical scenarios.

## Execution Modes

<!-- [END:APPEND:agent-system-overview] -->

<!-- [APPEND:agent-execution-modes] -->
<!-- Section: Execution Modes -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Mode | Purpose |
|------|---------|
| PLAN | Plan only, no execution |
| ANALYZE | Analysis only |
| IMPLEMENT | Implement changes |
| REVIEW | Review changes |
| TEST | Run tests |
| SECURITY | Security checks |
| DEPLOY | Deployment operations |
| DIAGNOSE | Diagnose issues |
| AUDIT | Full audit |

## Core Rules

<!-- [END:APPEND:agent-execution-modes] -->

<!-- [APPEND:agent-core-rules] -->
<!-- Section: Core Rules -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

1. AI MUST NEVER act on "I think this is okay" for production actions
2. Agent MUST record traceability for every action
3. Agent MUST create checkpoint before destructive/risky actions
4. Agent MUST stop on security critical, policy violation, context insufficient, unsafe command, production risk, data loss risk, test failure, or unexpected diff
5. Agent MUST enforce BDD-first when project policy requires it
6. Agent MUST pass all quality gates before marking task complete
7. Agent MUST NOT push to production by default
8. Agent MUST NOT load secrets into context
9. Agent MUST perform multi-layer impact analysis
10. Agent MUST escalate after 3 failed attempts

## Navigation

<!-- [END:APPEND:agent-core-rules] -->

<!-- [APPEND:agent-navigation] -->
<!-- Section: Navigation -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

- [Capabilities](../agents/capabilities.md)
- [Policies](../agents/policies.md)
- [Roles](../agents/roles.md)

<!-- [END:APPEND:agent-navigation] -->
