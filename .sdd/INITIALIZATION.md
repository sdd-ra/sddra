# INITIALIZATION WORKFLOW

## Purpose
This document describes how to initialize the SDDRA system from scratch and how to execute the first case.

## Prerequisites
- `.sdd/` directory exists with proper structure
- `AGENT_README.md` has been read
- Agent understands the 5-step workflow

## Phase 1: System Bootstrap

### Step 1.1: Verify .sdd Structure
```
.sdd/
├── INDEX.sdd          ✓ Must exist
├── PROJECT.sdd        ✓ Must exist
├── cases/
│   └── cases.sdd      ✓ Must exist
├── templates/
│   └── templates.sdd  ✓ Must exist
├── chains/
│   └── chains.sdd     ✓ Must exist
├── skills/
│   └── skills.sdd     ✓ Must exist
├── prompts/
│   └── prompts.sdd    ✓ Must exist
├── tasks/
│   └── tasks.sdd      ✓ Must exist
├── decisions/
│   └── decisions.sdd  ✓ Must exist
├── state/
│   └── state.sdd      ✓ Must exist
└── architecture/
    └── architecture.sdd ✓ Must exist
```

### Step 1.2: Verify project/ Structure
```
project/
├── backend/          ← Will be created by .sdd
├── frontend/         ← Will be created by .sdd
├── mobile/           ← Will be created by .sdd
├── qa/               ← Will be created by .sdd
└── devops/           ← Will be created by .sdd
```

### Step 1.3: Load Core Files
1. Read `.sdd/INDEX.sdd` — get read order
2. Read `.sdd/PROJECT.sdd` — get navigation rules
3. Read `.sdd/cases/cases.sdd` — understand case structure
4. Read `.sdd/chains/chains.sdd` — understand available chains
5. Read `.sdd/templates/templates.sdd` — understand available templates

## Phase 2: First Case Execution

### Step 2.1: Select or Create Case
```
Option A: Use existing case
  → .sdd/cases/payment-integration.sdd

Option B: Create new case
  → Create .sdd/cases/<case-id>.sdd
```

### Step 2.2: Analyze Case
Read the case file and extract:
- `id`: Unique identifier
- `type`: feature|bugfix|change
- `purpose`: Why this exists
- `depends_on`: Prerequisites
- `produces`: What will be created
- `chain`: Which chain to use
- `template`: Which template to use
- `stages`: Current state

### Step 2.3: Load Chain
1. Read `.sdd/chains/<chain>.sdd`
2. Identify first stage
3. Check conditions for conditional stages

### Step 2.4: Load Template
1. Read `.sdd/templates/<template>.sdd`
2. Get stage definitions
3. Get required skills for first stage

### Step 2.5: Execute First Stage (AN)
1. Load required skills from `.sdd/skills/`
2. Execute stage according to template
3. Produce output files
4. Update case state: `AN: ~` → `AN: +`
5. Move to next stage

## Phase 3: Continuous Execution

### Step 3.1: Stage Loop
For each stage in chain:
1. Check if stage is conditional
2. If conditional, evaluate condition
3. If skipped, mark as `-` and continue
4. If required, execute stage
5. Update state
6. Move to next stage

### Step 3.2: Completion
When VR stage completes:
1. Update case state: `VR: ~` → `VR: +`
2. Update case status: `ACTIVE` → `DONE`
3. Archive case in `tasks/done/`
4. Log decision in `decisions/`

## Phase 4: Project Generation

### Step 4.1: Generate project/ from .sdd
For each `produces` entry in case:
1. Create directory in `project/`
2. Generate code based on:
   - `.sdd/cases/<case>.sdd` — what to build
   - `.sdd/templates/<template>.sdd` — how to build
   - `.sdd/chains/<chain>.sdd` — structure
   - `.sdd/skills/` — implementation rules

### Step 4.2: Sync Check
After generation:
1. Verify `project/` matches `.sdd` specifications
2. Update `.sdd` state if discrepancies found
3. Log any decisions needed

## Example: Payment Integration

### Bootstrap
1. Read `.sdd/INDEX.sdd` → ReadOrder: 1-53
2. Read `.sdd/PROJECT.sdd` → Navigation, Rules
3. Read `.sdd/cases/cases.sdd` → Case structure
4. Read `.sdd/chains/chains.sdd` → Available chains
5. Read `.sdd/templates/templates.sdd` → Available templates

### Case Analysis
- Case: `payment-integration.sdd`
- Chain: `default` (feature.sdd)
- Template: `modular-feature`
- First stage: `AN`

### Execution
1. Load `.sdd/skills/analyzers/requirements-analysis`
2. Analyze payment requirements
3. Write `analysis.md`
4. Update case: `AN: ~` → `AN: +`
5. Next: `AR`

### Continue...
Repeat for AR, DB, BE, API, FE, MD, QA, DO, VR

### Completion
- Case status: `DONE`
- Project structure:
  ```
  project/
  ├── backend/<domain>/
  ├── frontend/<domain>/
  ├── mobile/<domain>/
  ├── qa/tests/<domain>/
  └── devops/infrastructure/<domain>/
  ```

## Troubleshooting

### Case not found
→ Check `.sdd/cases/` for existing cases
→ Create new case if needed

### Chain not found
→ Check `.sdd/chains/` for available chains
→ Use `default` chain if unsure

### Template not found
→ Check `.sdd/templates/` for available templates
→ Use `modular-feature` template if unsure

### Stage condition unclear
→ Re-read `.sdd/templates/<template>.sdd`
→ Check `condition:` field for stage

### Skill not found
→ Check `.sdd/skills/` for available skills
→ Use global skills if domain-specific not found
