<!-- [APPEND:commands-reference] -->
<!-- Section: SDDRA Commands Reference -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

# SDDRA Commands

## `/sdd-plan`

<!-- [END:APPEND:commands-reference] -->

<!-- [APPEND:command-sdd-plan] -->
<!-- Section: /sdd-plan -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

**Category:** Planning  
**Mode:** READ_ONLY  
**Output:** Markdown trace format

### Description
Scans `.sdd/` and `prompts/` directories to auto-generate an execution plan matching the SDDRA execution trace format (#01-#16). References existing artifacts or creates new task spec references.

### Steps
1. Reads `.sdd/PROJECT.sdd` → extracts project name, domain, stack
2. Reads `.sdd/chains/graph.sdd` → extracts execution trace and arms
3. Reads `.sdd/decisions/INDEX.sdd` → extracts active decisions
4. Reads `.sdd/projects/` → extracts instantiated projects
5. Scans `prompts/inbox/` → extracts pending user requests
6. Scans `prompts/archive/` → extracts completed tasks
7. Scans `.sdd/tasks/` → maps task IDs to decisions
8. For each chain arm (P1, D1, S1, C1, R1, DEP1): checks for existing work
9. Queries git log → maps commits to completed tasks
10. Outputs plan in trace format

### Output Example
```
# Project: SDDRA | Domain: AI Dev Tools | Stack: TypeScript
# Active Decisions: 3 | Pending Tasks: 2

Execution Plan:
  #01  Discover    -> [EXISTING/.sdd/PROJECT.sdd]
  #02  BuildCtx    -> [AUTO] 4-tier memory
  #03  Plan        -> [TASK/tsk-050] - Generate chain graph validation
  #04  PlanCheck   -> [AUTO] validate DAG
  #05  Implement   -> [CODE/.sdd/skills/] 
  ...
  #16  Complete    -> [AUTO]

Next Action: Execute task tsk-050 in C1 arm
```

### When to Use
- You want to see what should be done next
- You have new prompts and need an execution plan
- You want to verify no chain arms are missing work

---

## `/sdd-analyse`

<!-- [END:APPEND:command-sdd-plan] -->

<!-- [APPEND:command-sdd-analyse] -->
<!-- Section: /sdd-analyse -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

**Category:** Analysis  
**Mode:** READ_ONLY (writes only to `.sdd/docs/`)  
**Output:** Markdown with tables + narrative

### Description
Performs a deep, business-aware analysis of the `.sdd/` system. Classifies every file by business domain, method/approach, and chain arm. Traces cross-references and maps git commits to tasks to decisions. Can generate human-readable docs.

### Steps
1. Reads project metadata
2. Catalogs all `.sdd/` files
3. Reads execution trace and chain arms
4. Reads decisions (active + history)
5. Reads skills catalog
6. Reads task states + git commit mapping
7. Scans prompt history (if exists)
8. Classifies each file: Domain + Method + Arm
9. Traces cross-references (`@` references)
10. Maps commit → task → decision traceability

### Business Domains
| Path | Domain |
|------|--------|
| `/chains/` | Execution/Workflow |
| `/decisions/` | Governance/Architecture |
| `/skills/` | Implementation/Patterns |
| `/agent/` | Agent Contract/Roles |
| `/gates/` | Quality/Compliance |
| `/concepts/` | Knowledge/Design |
| `/tasks/` | Project Management |
| `/commands/` | CLI Interface |
| `/governance/` | Policy/Ops |
| `/testing/` | Test Suite |

### Methods Detected
| Keyword | Method |
|---------|--------|
| `tdd`/`test` | TDD (Test-Driven Development) |
| `security` | OWASP/Compliance |
| `git` | CI/CD / GitOps |
| `decision` | DECIDE Framework |
| `chain` | SDDRA Execution |
| `migration` | Data/Business Migration |
| `quality` | Quality Assurance |
| `autonomy` | Autonomy Policy |

### When to Use
- You need to understand the full SDDRA system
- You want to find which files relate to which business domain
- You need to trace decisions → tasks → git commits
- You want human-readable documentation generated

---

## Other SDDRA Commands

<!-- [END:APPEND:command-sdd-analyse] -->

<!-- [APPEND:commands-other] -->
<!-- Section: Other SDDRA Commands -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

| Command | Purpose |
|---------|---------|
| `/sdd` | Execute chain graph from prompt |
| `/sdd-update` | Sync `.sdd/` state from git repository |
| `/sdd-prompts` | Automate prompt lifecycle |
| `/sdd-status` | Show execution status |
| `/sdd-decisions` | List decisions |
| `/sdd-health` | Check system integrity |
| `/sdd-next` | Advance decision chain to next step |
| `/sdd-knowledge` | Report knowledge graph health |
| `/sdd-explain` | Explain completed task |
| `/sdd-backup` | Create backup |
| `/sdd-restore` | Restore from backup |
| `/sdd-resume` | Resume from checkpoint |
| `/sdd-migrate` | Run migrations |
| `/sdd-compact` | Compress context after task |
| `/sdd-clean` | Clear context for next task |

---

## Command Workflow

<!-- [END:APPEND:commands-other] -->

<!-- [APPEND:command-workflow] -->
<!-- Section: Command Workflow -->
<!-- Last updated: 2026-09-02 -->
<!-- Append new content below this line -->

Commands follow a natural workflow when working on a project:

1. **`/sdd-plan`** — Start here. Scans `.sdd/` + `prompts/` and generates an execution plan. Shows you what to do next.

2. **Execute tasks** in the C1, R1, or DEP1 arms as the plan directs.

3. **`/sdd-next`** — After completing the "Next Action" tasks from `/sdd-plan`, run this to advance the decision chain. It checks if all linked tasks are complete and moves to the next decision or case.

4. **`/sdd-analyse`** — Run anytime for a deep analysis of the `.sdd/` system with business context classification.

5. **`/sdd-update`** — After git operations, sync `.sdd/` state to pick up changes.

6. **`/sdd`** — Execute the full chain graph from a natural language prompt.

<!-- [END:APPEND:command-workflow] -->
