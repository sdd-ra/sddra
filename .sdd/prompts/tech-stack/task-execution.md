# Task Execution System

This file shows the AI how to execute tasks from .sdd/project/.

## Execution Model

```
.sdd/project/
    ↓
Task Scheduler (dependency graph)
    ↓
Chain Selector (default/feature/bugfix/hotfix)
    ↓
Skill Resolver (load relevant skills)
    ↓
Agent Execution (AI executes task)
    ↓
Validation (tests, review)
    ↓
State Update (mark complete)
```

## Task Structure

```yaml
task:
  id: TASK-001
  title: "Auth domain setup"
  domain: auth
  chain: default
  status: ready

  dependencies: []

  skills:
    - languages/go/L1-fundamentals
    - databases/postgresql/L1-fundamentals

  inputs:
    - .sdd/project/domains.sdd
    - .sdd/project/stack/backend.sdd

  outputs:
    - backend/domain/auth/
    - backend/usecase/auth/
    - docs/30-backend/auth.md

  validation:
    - go test ./...
    - golangci-lint
```

## Chain Types

### default
```
Plan → Design → Implement → Test → Review → Deploy
```

### feature
```
Plan → Design → Implement → Test → Review → PR → Approve → Merge
```

### bugfix
```
Investigate → Fix → Test → Review → Deploy
```

### hotfix
```
Fix → Test → Emergency Review → Deploy
```

## Execution Steps

### 1. Task Discovery
AI reads `.sdd/project/tasks/` and finds ready tasks:
- `status: ready`
- `dependencies: []` (all dependencies satisfied)

### 2. Skill Loading
Required skills are loaded for each task:
- Task: "Auth domain setup"
- Skills: `languages/go/L1-fundamentals`, `databases/postgresql/L1-fundamentals`

### 3. Execution
AI executes the task:
- Creates domain entities
- Implements use cases
- Writes tests

### 4. Validation
- Tests are run
- Lint is run
- Code is reviewed

### 5. State Update
Task status updated:
```
status: completed
completed_at: 2026-08-27
artifacts: [list of created files]
```

## Human Interaction

### Review Points
1. **Task Plan Review** — AI presents plan, human approves
2. **Implementation Review** — AI creates code, human reviews
3. **Deployment Review** — AI presents deployment plan, human approves

### Approval Gates
- **Low risk** (refactor, docs): Auto
- **Medium risk** (new feature): Review after
- **High risk** (security, production deploy): Approval required

## Example Execution

### Task: TASK-001 — Auth domain setup

1. **AI loads context:**
   - `.sdd/project/domains.sdd` (auth domain)
   - `.sdd/project/stack/backend.sdd` (Go, Gin)
   - Skills: `languages/go/L2-patterns`

2. **AI plans:**
   ```
   Plan:
   1. Create domain/entities/user.go
   2. Create usecase/auth.go
   3. Create infrastructure/repository/postgres.go
   4. Create presentation/handler/auth.go
   5. Write tests
   ```

3. **Human approves plan**

4. **AI executes:**
   - Creates files
   - Implements logic
   - Writes tests

5. **AI validates:**
   - `go test ./...` → PASS
   - `golangci-lint` → PASS

6. **Human reviews:**
   - Code review
   - Approve / Request changes

7. **AI updates state:**
   ```
   status: completed
   artifacts:
     - backend/domain/auth/user.go
     - backend/usecase/auth.go
     - ...
   ```

## State Management

```
.sdd/project/state/
├── current.sdd      # Current execution state
├── tasks/
│   ├── TASK-001.sdd  # Task state
│   ├── TASK-002.sdd
│   └── ...
├── executions/
│   ├── EXEC-001.sdd  # Execution history
│   └── ...
└── decisions/
    ├── DEC-<ID>.sdd   # Approved decisions
    └── ...
```
