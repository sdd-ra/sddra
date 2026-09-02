# SDD AUTO Orchestrator Protocol

Purpose:
  This file defines the AUTO execution engine for SDD commands.
  When any /sdd-<command> is called with the `auto` argument,
  this protocol governs the entire A→Z workflow execution.

  This is the single source of truth for AUTO behavior.
  All SDD commands must follow this protocol when auto=true.

---

## 1. AUTO DETECTION

Parse $ARGUMENTS for the `auto` flag.

  /sdd-plan auto        → command=sdd-plan, auto=true
  /sdd-plan             → command=sdd-plan, auto=false
  /sdd-analyze auto     → command=sdd-analyze, auto=true
  /sdd-decisions        → command=sdd-decisions, auto=false

The `auto` flag is an execution-mode modifier, not a separate command.
It can be attached to any workflow command.

---

## 2. EXECUTION MODE

When auto=true:

  execution_mode = AUTO
  auto_continue = true
  auto remains true for all internally-triggered transitions

When auto=false:

  execution_mode = MANUAL
  auto_continue = false
  execute only the requested command

---

## 3. STATE LOADING

Always load state BEFORE executing any step:

  1. Read .claude/sdd/state.json
  2. Validate state version
  3. If state is corrupted or missing, reset to initial state:
     {
       "version": "1.0",
       "execution_id": generate_uuid(),
       "auto": auto_flag,
       "workflow": "sdd-cli",
       "status": "running",
       "current_step": requested_step,
       "completed_steps": [],
       "pending_steps": all_steps_from_workflow,
       "next_step": null,
       "blocked": false,
       "waiting_for_input": false,
       "started_at": now_iso(),
       "updated_at": now_iso(),
       "step_history": [],
       "transition_count": 0,
       "loop_protection": {
         "last_states": [],
         "cycle_count": 0,
         "same_transition_count": 0
       },
       "decisions": [],
       "blockers": [],
       "input_questions": []
     }

---

## 4. WORKFLOW LOADING

Read .claude/sdd/workflow.yaml to get:

  - step definitions (command, requires, next, terminal)
  - policies (max iterations, loop threshold)
  - terminal states
  - escalation criteria

---

## 5. PREREQUISITE RESOLUTION

Before executing the requested step:

  1. Read workflow.yaml → get requires list for requested step
  2. For each required step:
     a. If already in completed_steps → skip
     b. If not completed → execute that step first
  3. Execute prerequisites in dependency order (topological sort)

Example:

  Requested: /sdd-prompts auto
  State: analyze=COMPLETE, plan=COMPLETE, decisions=INCOMPLETE

  Resolve:
    decisions (missing prerequisite)
      → execute sdd-decisions
      → if COMPLETE → continue
    prompts (requested step)
      → execute sdd-prompts

Do NOT ask the user "Should I run decisions?"
AUTO mode means automatic continuation.

---

## 6. STEP EXECUTION CONTRACT

Every step follows this lifecycle:

  PARSE ARGUMENTS
    ↓
  LOAD STATE
    ↓
  CHECK AUTO FLAG
    ↓
  RESOLVE PREREQUISITES
    ↓
  EXECUTE STEP (command-specific logic)
    ↓
  VALIDATE RESULT
    ↓
  SAVE STATE
    ↓
  RESOLVE NEXT STEP
    ↓
  IF AUTO AND NOT TERMINAL → CONTINUE

---

## 7. STEP RESULT FORMAT

Every step must return a structured result:

  step: <step_name>
  status: COMPLETE | FAILED | BLOCKED | NEEDS_INPUT | SKIPPED | CANCELLED
  next: <next_step_name> | null
  auto_continue: true | false
  reason: <string>  # only for BLOCKED/FAILED
  questions:        # only for NEEDS_INPUT
    - "question text"
  decisions:        # only for AUTO mode
    - {decision: "...", selected: "...", reason: "...", confidence: 0.0-1.0}
  artifacts:        # optional: paths to created/modified files
    - ".sdd/..."

---

## 8. AUTO CONTINUATION RULE

After any step completes:

  if status == COMPLETE and next != null and auto_continue == true:
    → automatically execute next step

  if status in (BLOCKED, NEEDS_INPUT, FAILED, CANCELLED):
    → STOP auto execution
    → save state
    → report to user
    → do NOT continue

  if status == COMPLETE and next == null:
    → workflow DONE
    → report completion

---

## 9. AUTONOMOUS DECISION POLICY

When a step encounters a decision point in AUTO mode:

  1. Check decisions.json for existing decision
  2. Check .sdd/ decisions for related decisions
  3. Inspect repository for patterns/conventions
  4. Apply priority order:
     a. Explicit user requirements
     b. Existing project architecture
     c. Existing SDD decisions
     d. Repository conventions
     e. Safest reasonable default
  5. Record the decision in decisions.json
  6. Continue — do NOT ask user

Only escalate to user if decision meets escalation_criteria from workflow.yaml.

---

## 10. CONFIDENCE-BASED AUTONOMY

  HIGH confidence (>0.8):
    → decide automatically
    → record decision
    → continue

  MEDIUM confidence (0.5-0.8):
    → choose safest compatible option
    → record decision with confidence note
    → continue

  LOW confidence (<0.5):
    → gather more information autonomously
    → inspect repository, .sdd/, config, tests
    → re-evaluate
    → if still low AND escalation criteria met → ask user

---

## 11. ASSUMPTION MANAGEMENT

When making an assumption in AUTO mode:

  1. Record assumption in state.decisions:
     {
       "type": "assumption",
       "assumption": "<what was assumed>",
       "reason": "<why>",
       "confidence": "<high|medium|low>",
       "step": "<step that made assumption>"
     }
  2. Do NOT repeatedly ask about the same assumption
  3. If later evidence contradicts it:
     → invalidate assumption
     → re-evaluate
     → update decision
     → continue

---

## 12. LOOP PROTECTION

Track in state.loop_protection:

  - last_states: circular buffer of last N state transitions
  - cycle_count: number of full cycles completed
  - same_transition_count: count of repeated A→B transitions

Check every iteration:

  if same_transition_count > loop_protection_threshold:
    → HALT
    → Report: "AUTO workflow halted. Loop detected: A → B → A → B"
    → Save state
    → Exit

  if transition_count > max_auto_iterations:
    → HALT
    → Report: "AUTO workflow halted. Max iterations reached."
    → Save state
    → Exit

  if last_n_states contains same sequence 3+ times:
    → HALT
    → Report loop detected
    → Save state
    → Exit

---

## 13. IDEMPOTENCY

Before executing a step:

  if step in completed_steps AND step output is still valid:
    → SKIP execution
    → Report: "✓ <step> already complete → continuing to <next>"
    → Continue to next step

A step's output is valid if:
  - Its dependencies haven't changed
  - Its inputs haven't changed
  - No invalidation signal has been recorded

---

## 14. STATE PERSISTENCE

After every state change:

  1. Create backup of current state.json → state.json.bak
  2. Write new state.json
  3. Validate written state can be parsed
  4. If write fails → restore from .bak

State update timing:
  - After prerequisite resolution
  - After step execution
  - After transition decision
  - After loop protection check
  - On BLOCKED/NEEDS_INPUT/FAILED/CANCELLED stop

---

## 15. RESUME PROTOCOL

When AUTO is resumed (via sdd-resume or re-invocation):

  1. Load state.json
  2. Verify execution_mode == AUTO
  3. Find current_step in state
  4. Validate prerequisites for current_step are still met
  5. If prerequisites broken → repair state or re-execute missing prereqs
  6. Continue from current_step
  7. Do NOT restart from beginning unless state is corrupted

---

## 16. STEP-SPECIFIC BEHAVIOR

Each command has domain responsibilities, but in AUTO mode they also:

  a. Read and respect state.json
  b. Return structured result (see section 7)
  c. Record decisions in decisions.json
  d. Update state.json after execution
  e. Signal next step via result.next

sdd-analyze:
  - Analyze requirements, context, constraints
  - Output: analysis document, scope definition
  - Auto-continue: plan

sdd-plan:
  - Create implementation plan
  - Check: analyze must be complete
  - Output: plan with steps, risks, dependencies
  - Auto-continue: decisions

sdd-decisions:
  - Resolve architectural/technical decisions
  - Check: analyze + plan must be complete
  - Output: decisions, DEC-xxx records
  - NEEDS_INPUT: if genuine human decision required
  - Auto-continue: prompts

sdd-prompts:
  - Generate implementation prompts/instructions
  - Check: plan + decisions must be complete
  - Output: prompts, implementation instructions
  - Auto-continue: update

sdd-update:
  - Sync SDD artifacts/state after implementation
  - Check: prompts must be complete
  - Output: updated docs, synced state
  - Auto-continue: next

sdd-next:
  - Determine next workflow transition
  - Check: update must be complete
  - Output: next task or DONE signal
  - If MORE_WORK → new cycle (analyze → ... → next)
  - If DONE → terminal

---

## 17. OUTPUT FORMAT

AUTO progress output (concise):

  SDD AUTO [mode=auto]
  ─────────────────────

  ✓ analyze
  ✓ plan
  → decisions
  ○ prompts
  ○ update
  ○ next

  [AUTO CONTINUE]

After each transition, update the display.

On completion:

  SDD AUTO COMPLETE

  Workflow: <name>
  Completed:
  ✓ analyze
  ✓ plan
  ✓ decisions
  ✓ prompts
  ✓ update
  ✓ next

  Status: DONE

On NEEDS_INPUT:

  SDD AUTO PAUSED

  Step: sdd-decisions
  Status: NEEDS_INPUT

  Questions:
  1. <question text>

  Waiting for user input...
  State saved. Resume with: /sdd-resume

On BLOCKED:

  SDD AUTO PAUSED

  Step: sdd-plan
  Status: BLOCKED

  Reason: <reason>

  Required action: <action>
  State saved. Resume with: /sdd-resume

On loop detected:

  SDD AUTO HALTED

  Reason: Loop detected
  Sequence: <A → B → A → B>

  State saved. Resume with: /sdd-resume

---

## 18. IMPORTANT RULES

  [AUTO-01] AUTO mode MUST NOT ask for confirmation between steps.
  [AUTO-02] AUTO mode MUST NOT ask routine questions.
  [AUTO-03] AUTO mode MUST propagate auto=true through all transitions.
  [AUTO-04] AUTO mode MUST stop only for terminal states.
  [AUTO-05] AUTO mode MUST record all autonomous decisions.
  [AUTO-06] AUTO mode MUST implement loop protection.
  [AUTO-07] AUTO mode MUST be idempotent (skip completed steps).
  [AUTO-08] AUTO mode MUST persist state after every change.
  [AUTO-09] AUTO mode MUST support resume from exact interruption point.
  [AUTO-10] AUTO mode MUST NOT break manual mode behavior.
  [AUTO-11] AUTO mode MUST inspect repository for missing context before asking user.
  [AUTO-12] AUTO mode MUST use confidence-based autonomy.
  [AUTO-13] AUTO mode MUST record assumptions.
  [AUTO-14] AUTO mode MUST self-correct when results don't satisfy requirements.
  [AUTO-15] AUTO mode MUST treat workflow as a wheel, not a line (cycles supported).

---

## 19. MANUAL vs AUTO BEHAVIOR

These MUST behave differently:

  /sdd-plan          → MANUAL: execute only sdd-plan, no continuation
  /sdd-plan auto     → AUTO: resolve prereqs, execute, auto-continue chain

  /sdd-status        → READ-ONLY: show state, never modify or continue
  /sdd-resume        → RESUME: continue from saved AUTO state
  /sdd-health        → READ-ONLY: validate system, never modify workflow

Manual mode behavior is PRESERVED. AUTO is opt-in only.

---

## 20. FINAL PRINCIPLE

Once /sdd-<command> auto is activated, the SDD system becomes
a self-driving workflow engine:

  THINK → DECIDE → EXECUTE → VALIDATE → IMPROVE → NEXT → THINK → ...

The user provides direction ONCE at the beginning.
SDD takes responsibility for execution, routine decisions,
validation, recovery, and progression until a legitimate
terminal state is reached.

Human interaction is the exception, not the transition mechanism.
