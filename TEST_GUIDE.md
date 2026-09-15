# SDDRA — Test & Deploy Guide

## Purpose
A practical guide for testing the SDDRA system and integrating it
with external agent systems such as Claude AI.

---

## 1. System Architecture

```
.sdd/
├── PROJECT.sdd              # Root entry point
├── chains/                  # Chain graph
│   ├── graph.sdd           # D0 root + 6 arms
│   ├── arms/               # P1, D1, S1, C1, R1, DEP1
│   ├── rules/              # CR1-CR14 laws
│   ├── tokens/             # Token tracking
│   └── {chain}.sdd         # Feature, bugfix, hotfix, etc.
├── decisions/               # Decision ledger
│   ├── schema.sdd
│   ├── workflow.sdd
│   ├── rules.sdd
│   └── project/
│       ├── DEC-001.sdd ... DEC-007.sdd
│       └── task-map.sdd
├── project/                 # Project context
│   ├── docs/                # Human language
│   │   ├── 00-about/
│   │   ├── 20-architecture/
│   │   ├── 30-backend/
│   │   ├── 40-frontend/
│   │   ├── 60-database/
│   │   ├── 70-api/
│   │   ├── 100-devops/
│   │   └── 110-infrastructure/
│   ├── sdd/                 # AI language (machine-readable)
│   │   ├── PROJECT.sdd
│   │   ├── domains.sdd
│   │   ├── stack/*.sdd
│   │   └── tasks/*.sdd
│   ├── decisions/           # Approved decisions
│   ├── architecture/
│   └── INDEX.sdd
├── skills/                  # 158 technology files
├── prompts/                 # Prompt engine
├── workflow/                # Task execution, recovery
└── state/                   # State symbols

project/                      # Human code (source of truth)
├── backend/
├── frontend/
├── database/
└── tests/
```

---

## 2. Chain Graph Test Scenario

### Test: Schools platform

**Input (your prompt):**
```
Build an education platform for schools.
Include video conferencing, payments, and AI search.
20K users in the first 10 months, 1M in 2 years.
```

**Expected Flow:**
```
D0 (default)
  ├─> P1 (prompt) ──> D0
  ├─> D1 (docs) ────> D0
  ├─> S1 (sdd) ────> D0
  ├─> C1 (code) ────> D0
  ├─> R1 (review) ─> D0
  └─> DEP1 (deploy) -> D0
```

**Token Budget:**
```
P1:  5,000  (prompt analysis)
D1: 10,000  (docs generation)
S1: 15,000  (sdd generation)
C1: 40,000  (code execution)
R1:  5,000  (review)
DEP1: 5,000  (deploy)
Total: 70,000
```

**Human Gates:**
1. **Gate P1→D1**: Docs review — you read, you decide
2. **Gate D1→S1**: SDD review — you read .sdd/project/, you approve
3. **Gate S1→C1**: Code review — you read the code, you approve
4. **Gate C1→DEP1**: Deploy approval — you approve production

---

## 3. Claude AI Integration Test

### Test Procedure

**Step 1:** Present the SDDRA structure to Claude

```
Context given to Claude:

.sdd/PROJECT.sdd — root entry
.sdd/chains/graph.sdd — D0 root + 6 arms
.sdd/chains/arms/*.sdd — each arm's definition
.sdd/decisions/schema.sdd — decision structure
.sdd/instances/{project_name}/docs/00-about/project.md — human-language description
```

**Step 2:** Ask Claude to execute the chain graph

```
Prompt:
"Start from the .sdd/ structure.
1. Read .sdd/PROJECT.sdd
2. Read .sdd/chains/graph.sdd
3. Read .sdd/chains/arms/prompt.sdd (P1)
4. Read .sdd/instances/{project_name}/docs/00-about/project.md
5. Read .sdd/decisions/DEC-001.sdd
6. Explain the chain graph: which arm from D0, why, and explain tokens"
```

**Step 3:** Measure token usage

```
Claude's answer must show:
- How many tokens each file consumes
- Which files are needed and which are not
- Whether short IDs are used (P1, D1, S1)
- Whether indexes are used
```

**Step 4:** Test the decision ledger

```
Prompt:
"Explain the decision ledger system:
1. Read .sdd/decisions/DEC-001.sdd
2. Read .sdd/decisions/workflow.sdd
3. Read .sdd/instances/{project_name}/decisions/task-map.sdd
4. Which tasks does DEC-001 link to?
5. How does the decision lifecycle work?"
```

**Step 5:** Full workflow test

```
Prompt:
"Explain the full workflow for the schools platform:
1. Start from D0
2. P1 arm: convert the prompt into docs/
3. D1 arm: create docs, create decision records
4. S1 arm: create .sdd/project/ from docs, create tasks
5. C1 arm: create code from .sdd/project/
6. R1 arm: review
7. DEP1 arm: deploy
8. Show token usage at every step
9. Mark the human gates"
```

---

## 4. Token Minimalism Tests

### Test 1: Short IDs
```
Check:
- Node IDs 2-6 characters? (P1, D1, S1, C1, R1, DEP1)
- No long names? (not "prompt_arm", but "P1")
```

### Test 2: Indexes
```
Check:
- INDEX.sdd files exist?
- Is directory scanning avoided? (no — INDEX is used)
- Is every INDEX routing table the same shape?
```

### Test 3: Lazy Loading
```
Check:
- Does each arm load only its own files?
- Does it not load the whole chain?
- Skills only for the needed stage?
```

### Test 4: Cache
```
Check:
- Is the same file read twice?
- Are resolved references cached?
```

---

## 5. Decision Ledger Tests

### Test 1: Are decision records present?
```
Check:
- .sdd/decisions/ has DEC-001.sdd ... DEC-007.sdd?
- Does every decision have ID, type, status, options, rationale,
  impact?
- Is every decision linked to tasks?
```

### Test 2: Does the decision workflow run?
```
Check:
- proposed → review → approved → implemented → verified → closed
- rejected → archived
- Superseded → archived
```

### Test 3: Chain graph integration
```
Check:
- CR11: A decision record for every change?
- CR12: Does the AI check decisions/?
- CR13: Do conflicting decisions block?
- D1 arm: creates decisions?
- S1 arm: references decisions?
- C1 arm: implements decisions?
```

---

## 6. Full System Test Checklist

### Pre-flight
- [ ] `.sdd/PROJECT.sdd` read, structure understood
- [ ] `.sdd/chains/graph.sdd` read, D0 root understood
- [ ] `.sdd/chains/arms/*.sdd` read, 6 arms identified
- [ ] `.sdd/decisions/DEC-001..DEC-007.sdd` read
- [ ] `.sdd/instances/{project_name}/docs/` human-language docs read

### Token Budget
- [ ] P1: <= 5,000
- [ ] D1: <= 10,000
- [ ] S1: <= 15,000
- [ ] C1: <= 40,000
- [ ] R1: <= 5,000
- [ ] DEP1: <= 5,000
- [ ] Total: <= 70,000

### Human Gates
- [ ] P1→D1: docs approval
- [ ] D1→S1: .sdd/project/ approval
- [ ] S1→C1: code approval
- [ ] C1→DEP1: production approval

### Decision Ledger
- [ ] 7 decision records present
- [ ] Every decision has ID, type, status
- [ ] Every decision linked to tasks
- [ ] Decision workflow followed

### Chain Rules
- [ ] CR1: Every arm returns to D0
- [ ] CR2: D1→S1 human approval
- [ ] CR3: S1→C1 human approval
- [ ] CR4: Token delta recorded
- [ ] CR5: AI looks at project/ only after S1
- [ ] CR6: Output validation
- [ ] CR7: Retry max 3
- [ ] CR8: project/ code truth, .sdd intent truth
- [ ] CR9: docs/ human, .sdd/project/ AI
- [ ] CR10: Idempotent
- [ ] CR11: Decision record required
- [ ] CR12: AI checks decisions/
- [ ] CR13: Conflicts block execution
- [ ] CR14: Implementation references decisions

### Context Separation
- [ ] AI starts from .sdd/
- [ ] AI looks at project/ only after S1 approval
- [ ] docs/ human language
- [ ] .sdd/project/ AI language
- [ ] project/ human code

---

## 7. Next Steps

1. **Test**: Run the checklist above with Claude AI
2. **Measure tokens**: Record real token usage for each arm
3. **Improve**: If there are gaps, add them to .sdd/
4. **Automate**: Extend `scripts/test_chain.py`
5. **Production**: Apply on a real project

---

## 8. Quick Instructions: "How do I test this?"

```
1. Give this document to Claude AI
2. Say "Explain the SDDRA system starting from .sdd/"
3. Ask about token usage
4. Test the decision ledger
5. Test the chain graph
6. Return the results here
```

**Success criteria:**
- Claude correctly understands the .sdd structure
- Explains the token minimalism principles
- Uses the decision ledger correctly
- Explains the chain graph's unbreakable flow
- Identifies the human gates
