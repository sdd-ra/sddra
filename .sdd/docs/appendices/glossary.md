<!-- [APPEND:glossary] -->
<!-- Section: Glossary -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# Glossary

Canonical terminology for the SDDRA system.

## Terms

| Term | Aliases | Definition |
|------|---------|------------|
| SDDRA | Spec-Driven Development & Engineering, SDD | Operating system for AI-assisted software engineering using `.sdd/` files as machine-readable specifications |
| Chain Graph | Execution Graph, Workflow Graph | Cyclic graph where every arm branches from D0 and returns, defining the SDDRA execution flow |
| Chain Arm | Arm, Stage | A branch of the chain graph (P1, D1, S1, C1, R1, DEP1) |
| D0 | Default, Hub | Central hub of the chain graph where all arms branch from and return to |
| P1 | Prompt | User intents arrive — parsed from `prompts/inbox/` |
| D1 | Docs | Human-readable documentation — requires approval |
| S1 | Spec, SDD | Machine specs — schemas, workflows, routing tables |
| C1 | Code | Implementation — write code per task contracts |
| R1 | Review | Quality gates — security, tests, architecture checks |
| DEP1 | Deploy | Deployment and release planning |
| AUTO Mode | Auto, Autonomous Mode | Execution mode where the system automatically resolves prerequisites and continues the workflow chain |
| MANUAL Mode | Manual | Execution mode where only the requested command runs without continuation |
| Prerequisite | Dep, Dependency | A step that must complete before another step can execute |
| Terminal State | End State, Final State | A state that stops AUTO execution (DONE, BLOCKED, NEEDS_INPUT, FAILED, CANCELLED) |
| Decision Ledger | DEC, Decisions | Record of architectural and technical decisions (DEC-XXX) |
| Skill | Capability, Pattern | Reusable specification defining how to perform a task |
| Role | Agent Role | Abstract responsibility definition (e.g., `@agent.reviewer`) |
| Capability | Ability | What an agent can do technically (e.g., `READ`, `WRITE`) |
| Permission | Authorization | Whether a capability may be used under current policy |
| Risk Level | L-Level, R-Level | Classification of action risk from R0 (Safe) to R5 (Destructive) |
| Trust Level | Trust Tier | Classification of content trust from L0 (Internal) to L6 (External) |
| 4-Tier Memory | Memory Hierarchy | Long-Term, Project, Task, Working memory layers |
| Loop Protection | Loop Guard | Mechanism to detect and halt infinite workflow loops |
| Idempotency | Re-runnability | Property allowing steps to be safely re-executed without side effects |
| ECC | Everything-Claude-Code | External framework integrated with SDDRA (67 agents, 281 skills, 94 commands) |
| AgentShield | Security Scanner | ECC security tool with 102 static rules mapped to SDD L0-L5 levels |
| PolicyAsCode | PAC, OPA | Access control via Open Policy Agent compiled to WebAssembly |
| CryptoErasure | DUK/DEK/MEK | Per-memory-unit key hierarchy for GDPR-compliant data deletion |
| Provenance | Source Tracking | Tracking of content origin and modification history |
| TVL | Tool Verification Layer | Rules for evaluating external tools (TVL-01 through TVL-09) |
| CANDIDATE | Pending Knowledge | Knowledge awaiting human validation before promotion |
| ACTIVE | Validated Knowledge | Knowledge that has passed validation and is in use |
| ARCHIVED | Retired Knowledge | Knowledge retained for reference but not executable |
| Awesome Claude Skills | Community Skills | Curated list of Claude skills: https://github.com/PatrickCodeMe/awesome-claude-skills |
| Awesome Claude Design | Community Design | Curated list of design resources: https://github.com/PatrickCodeMe/awesome-claude-design |

<!-- [END:APPEND:glossary] -->
