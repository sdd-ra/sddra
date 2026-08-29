# Human Approval Workflow

This file explains the human approval process.

## Approval Gates

```
┌─────────────┐
│   Prompt    │
│   (You)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI Docs    │
│  Generation │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GATE 1     │ ← Human approves
│  Docs       │
│  Approval   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI .sdd/   │
│  project/   │
│  Generation │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GATE 2     │ ← Human approves
│  SDD        │
│  Approval   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI Code    │
│  Execution  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GATE 3     │ ← Human tests
│  Code       │
│  Review     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Production │
│  Deploy     │
└─────────────┘
```

## Gate 1: Docs Approval

**AI presents:**
- `docs/00-about/project.md`
- `docs/20-architecture/overview.md`
- `docs/30-backend/overview.md`
- `docs/40-frontend/overview.md`
- `docs/60-database/overview.md`
- `docs/70-api/overview.md`
- `docs/100-devops/overview.md`

**Human checks:**
- Are technology choices correct?
- Is the architecture decision correct?
- Are scale requirements met?
- Is the risk analysis correct?

**Decision:**
- ✅ **I approve** → .sdd/project/ is created
- 🔄 **Corrections needed** → AI fixes, re-approval
- ❌ **I reject** → Start from scratch

## Gate 2: SDD Approval

**AI presents:**
- `.sdd/project/PROJECT.sdd`
- `.sdd/project/domains.sdd`
- `.sdd/projects/vkard.az/tasks/*.sdd`
- `.sdd/projects/vkard.az/decisions/*.sdd`

**Human checks:**
- Is the domain structure correct?
- Are tasks executable?
- Are dependencies correct?
- Are decisions logical?

**Decision:**
- ✅ **Start execution** → AI creates code
- 🔄 **Corrections needed** → AI fixes
- ❌ **I reject** → Start from scratch

## Gate 3: Code Review

**AI presents:**
- Implemented code
- Test results
- Deployment plan

**Human checks:**
- Is code high quality?
- Do tests pass?
- Does it comply with security rules?
- Is it safe to deploy to production?

**Decision:**
- ✅ **I approve** → Deploy to production
- 🔄 **Corrections needed** → AI fixes
- ❌ **Send back** → Explain the problem

## Recording

All approvals are recorded:
```
.sdd/projects/vkard.az/decisions/approvals/
├── GATE-1-001.sdd  # Docs approval
├── GATE-2-001.sdd  # SDD approval
├── GATE-3-001.sdd  # Code approval
└── ...
```

Each approval file:
```yaml
approval:
  gate: GATE-1
  task: TASK-001
  approved_by: HUMAN
  approved_at: 2026-08-27T18:00:00Z
  expires_at: 2026-08-27T19:00:00Z
  decision: approved
  feedback: null
```
