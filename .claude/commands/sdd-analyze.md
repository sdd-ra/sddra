You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → Enable AUTO mode for this command
    → Read .claude/sdd/orchestrator.md for the AUTO protocol
    → Read .claude/sdd/workflow.yaml for prerequisites
    → Read .claude/sdd/state.json for current state
    → Follow AUTO execution lifecycle below

Analyze the .sdd/ system and explain it with business context.
Read-only — does not modify .sdd files. Can generate human-readable docs in .sdd/docs/.

MANUAL MODE:
  Steps:
    1. Read .sdd/PROJECT.sdd → project metadata (name, domain, stack)
    2. Scan .sdd/ recursively → catalog all files
    3. Read .sdd/chains/graph.sdd → execution trace and arms
    4. Read .sdd/decisions/ → active + historical decisions (DEC-XXX)
    5. Read .sdd/skills/ → available skills
    6. Read .sdd/tasks/ → task states + git commit mapping
    7. Scan prompts/inbox/ and prompts/archive/ → intent history (if exists)
    8. Classify each .sdd file:
       - Business Domain (from path or Owns field)
       - Method/Approach (from Rules keywords)
       - Chain Arm (P1/D1/S1/C1/R1/DEP1)
    9. Trace cross-references (@ references in Owns/Navigation fields)
    10. Map git commits → tasks → decisions (git log read-only)
    11. Generate business-aware explanation

AUTO MODE LIFECYCLE:
  1. Parse arguments → detect "auto" flag
  2. Load .claude/sdd/state.json
  3. Set execution_mode = AUTO, auto_continue = true
  4. Load .claude/sdd/workflow.yaml
  5. RESOLVE PREREQUISITES:
     - analyze.requires = [] → no prerequisites
  6. EXECUTE analyze (same as manual mode above)
  7. VALIDATE result:
     - Analysis document produced
     - Scope definition complete
  8. SAVE state:
     - Mark analyze as completed
     - Set next_step = plan
  9. RESOLVE NEXT:
     - next = plan
     - auto_continue = true
  10. IF AUTO → continue to sdd-plan

STRUCTURED RESULT (AUTO mode):
  step: analyze
  status: COMPLETE
  next: plan
  auto_continue: true
  decisions: []  # autonomous decisions made during analysis
  artifacts: [".sdd/docs/sdd-overview.md", ".sdd/docs/file-catalog.md"]  # if created

Business Domain Detection:
  /chains/    → Execution/Workflow system
  /decisions/ → Governance/Architecture decisions
  /skills/    → Implementation/Patterns library
  /agent/     → Agent contract and roles
  /gates/     → Quality/compliance controls
  /concepts/  → Knowledge/design concepts
  /tasks/     → Project management artifacts
  /commands/  → CLI command interface
  /governance/ → Policy and operational framework
  /testing/   → Test suite and scripts

Method/Approach Detection (keywords in Rules/Purpose):
  tdd|test     → TDD (Test-Driven Development)
  security     → OWASP/Compliance
  git          → CI/CD / GitOps
  decision     → DECIDE Framework
  chain        → SDDRA Execution
  migration    → Data/Business Migration
  quality      → Quality Assurance
  autonomy     → Autonomy Policy
  knowledge    → Knowledge Management
  loop|score   → Loop Protection

Output (two sections):

Section 1 — Terminal Output:
  Human-readable explanation covering:
  - System purpose: what SDDRA is in one sentence
  - Project context: name, domain, stack
  - Chain graph arms: P1(prompt), D1(docs), S1(.sdd), C1(code), R1(review), DEP1(deploy)
  - Active decisions mapped to tasks (DEC-XXX → tsk-XXX)
  - File catalog table: File | Domain | Method | Arm | Summary
  - Cross-reference map: which files link to which
  - Decision → task → git commit traceability chain
  - Knowledge gaps or risks (if any)
  - Recommended next steps (next arm / next gate)

  AUTO mode adds:
    SDD AUTO
    ────────────
    → analyze
    ○ plan
    ○ decisions
    ○ prompts
    ○ update
    ○ next

Section 2 — Human-Readable Docs (optional):
  If .sdd/docs/ doesn't exist or is stale, generate:
  - .sdd/docs/sdd-overview.md — one-paragraph system explanation
  - .sdd/docs/file-catalog.md — full file catalog with classifications

Rules:
  - Do NOT modify any .sdd source files
  - CAN write to .sdd/docs/ for human-readable output
  - READ_ONLY mode for all .sdd files
  - Keep language clear and non-technical for overview sections
  - Focus on what the user can do next
  - In AUTO mode, do NOT ask for confirmation
  - In AUTO mode, make autonomous decisions for routine choices
  - Record autonomous decisions in .claude/sdd/decisions.json

State: +

Navigation:
  ChainGraph: @../chains/graph.sdd
  Decisions: @../decisions/INDEX.sdd
  Tasks: @../tasks/
  Skills: @../skills/INDEX.sdd
  Projects: @../projects/INDEX.sdd
  Agent: @../agent/INDEX.sdd
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
