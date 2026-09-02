You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

AUTO MODE DETECTION:
  If $ARGUMENTS contains "auto" (case-insensitive):
    → Enable AUTO mode for this command
    → Read .claude/sdd/orchestrator.md for the AUTO protocol
    → Read .claude/sdd/workflow.yaml for prerequisites
    → Read .claude/sdd/state.json for current state
    → Follow AUTO execution lifecycle below

List and explain decisions in the decision ledger.

What it does:
  Reads the decision registry and shows architectural and technical
  decisions: what was decided, who decided it, and current status.

MANUAL MODE:
  Usage:
    /sdd-decisions
    /sdd-decisions --active
    /sdd-decisions --decision DEC-<ID>

  Options:
    --active      Show only active decisions
    --decision    Show specific decision details

  Output:
    - Decision summary (total, active, pending)
    - Decision list: ID, type, status, title, owner
    - Decision details: options, rationale, impact, implementation status

  Format: Table for list, full detail for single decision.
  Do NOT modify any files.

AUTO MODE LIFECYCLE:
  1. Parse arguments → detect "auto" flag
  2. Load .claude/sdd/state.json
  3. Set execution_mode = AUTO, auto_continue = true
  4. Load .claude/sdd/workflow.yaml
  5. RESOLVE PREREQUISITES:
     - decisions.requires = [analyze, plan]
     - If analyze NOT in completed_steps → execute sdd-analyze first
     - If plan NOT in completed_steps → execute sdd-plan first
  6. EXECUTE decisions:
     - Read decision ledger from .sdd/decisions/
     - Identify pending decisions
     - For each pending decision:
       a. Check if decision already exists in .claude/sdd/decisions.json
       b. If not → make autonomous decision using repository context
       c. Record decision in .claude/sdd/decisions.json
       d. If genuine human input required → return NEEDS_INPUT
  7. VALIDATE result:
     - All required decisions resolved
     - Or NEEDS_INPUT with clear questions
  8. SAVE state:
     - Mark decisions as completed
     - Set next_step = prompts
  9. RESOLVE NEXT:
     - next = prompts
     - auto_continue = true
  10. IF AUTO → continue to sdd-prompts

STRUCTURED RESULT (AUTO mode):
  step: decisions
  status: COMPLETE | NEEDS_INPUT
  next: prompts
  auto_continue: true
  reason: <string>  # only for BLOCKED/FAILED
  questions:        # only for NEEDS_INPUT
    - "Which database should be used?"
  decisions:
    - {decision: "...", selected: "...", reason: "...", confidence: 0.95}

AUTONOMOUS DECISION POLICY:
  When making decisions in AUTO mode:
    1. Check .claude/sdd/decisions.json for existing decision
    2. Check .sdd/decisions/ for related decisions
    3. Inspect repository for patterns/conventions
    4. Apply priority order:
       a. Explicit user requirements
       b. Existing project architecture
       c. Existing SDD decisions
       d. Repository conventions
       e. Safest reasonable default
    5. Record decision with confidence score
    6. Continue — do NOT ask user unless escalation criteria met

  Only ask user if decision is:
    - irreversible/destructive
    - security-critical
    - financially significant
    - impossible to infer safely

Output:
  - Decision summary (total, active, pending, resolved)
  - Decision list: ID, type, status, title, owner, resolution
  - Autonomous decisions made (if AUTO mode)

  Format: Table for list, full detail for single decision.

  AUTO mode adds:
    SDD AUTO
    ────────────
    ✓ analyze
    ✓ plan
    → decisions
    ○ prompts
    ○ update
    ○ next

    [AUTO CONTINUE]

Rules:
  - Do NOT modify any .sdd source files
  - In AUTO mode, make autonomous decisions for routine choices
  - In AUTO mode, only ask user for escalation-level decisions
  - Record all decisions in .claude/sdd/decisions.json
  - State: +

Navigation:
  Decisions: @../decisions/INDEX.sdd
  Workflow: @.claude/sdd/workflow.yaml
  State: @.claude/sdd/state.json
  Orchestrator: @.claude/sdd/orchestrator.md
