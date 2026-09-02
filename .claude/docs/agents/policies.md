<!-- [APPEND:agent-policies] -->
<!-- Section: Agent Policies -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# Agent Policies

This is the single source of truth for all policy decisions in the SDD system.

## Risk Levels

<!-- [END:APPEND:agent-policies] -->

<!-- [APPEND:agent-policies-risk-levels] -->
<!-- Section: Risk Levels -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Level | Label | Examples |
|-------|-------|----------|
| R0 | Safe | Read file, list files, search |
| R1 | Low | Create temp file, run formatter, run unit test |
| R2 | Moderate | Modify source, install dependency, change config |
| R3 | High | DB migration, change security config, infra change |
| R4 | Critical | Production deployment, secret rotation, data migration |
| R5 | Destructive | Delete production data, drop database, destroy infra |

## Approval Matrix

<!-- [END:APPEND:agent-policies-risk-levels] -->

<!-- [APPEND:agent-approval-matrix] -->
<!-- Section: Approval Matrix -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Risk Level | Resolution |
|------------|------------|
| R0 | Auto-approved |
| R1 | Auto-approved |
| R2 | Auto / Policy |
| R3 | Approval required |
| R4 | Approval required |
| R5 | Explicit approval required |

## Policy Hierarchy

<!-- [END:APPEND:agent-approval-matrix] -->

<!-- [APPEND:agent-policy-hierarchy] -->
<!-- Section: Policy Hierarchy -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

1. **Global** — Applies to all projects
2. **Project** — Applies to current project
3. **Action** — Applies to specific action

**Conflict Resolution**: Most specific policy wins; when in conflict, the safer policy wins.

## Stop Conditions

<!-- [END:APPEND:agent-policy-hierarchy] -->

<!-- [APPEND:agent-stop-conditions] -->
<!-- Section: Stop Conditions -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Condition | Action |
|-----------|--------|
| SECURITY_CRITICAL | Stop immediately |
| POLICY_VIOLATION | Stop immediately |
| CONTEXT_INSUFFICIENT | Stop and request more context |
| UNSAFE_COMMAND | Stop and report |
| PRODUCTION_RISK | Stop and request approval |
| DATA_LOSS_RISK | Stop and request approval |
| TEST_FAILURE | Stop and report |
| UNEXPECTED_DIFF | Stop and review |

## Quality Gates

<!-- [END:APPEND:agent-stop-conditions] -->

<!-- [APPEND:agent-quality-gates] -->
<!-- Section: Quality Gates -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

All gates MUST pass before marking task as READY:

| Gate | Requirement |
|------|-------------|
| BUILD | PASS / FAIL |
| TEST | PASS / FAIL |
| BDD | PASS / FAIL |
| SECURITY | PASS / FAIL |
| LINT | PASS / FAIL |
| TYPECHECK | PASS / FAIL |

## Escalation Rules

<!-- [END:APPEND:agent-quality-gates] -->

<!-- [APPEND:agent-escalation-rules] -->
<!-- Section: Escalation Rules -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

1. **AP1**: After 3 failed attempts, agent MUST escalate to human
2. **AP2**: Production actions ALWAYS require explicit approval
3. **AP3**: Agent MUST NOT auto-approve actions with data loss risk
4. **AP4**: Agent MUST record approval decision in audit log

<!-- [END:APPEND:agent-escalation-rules] -->
