# Prompts

Purpose:
  Root-level prompt inbox. This is where users submit raw prompts.
  `/sdd` analyzes prompts from this folder, creates intelligent
  best-practice formalizations in `.sdd/projects/prompts/`,
  documents them with IDs in `.sdd/instances/{project_name}/docs/prompts/`,
  and waits for human approval before execution.

Structure:
  inbox/       — New prompts awaiting processing (user submissions)
  active/      — Prompts currently being worked on
  archive/     — Completed prompts
  extracted/   — Knowledge extracted from prompts

## Prompt Workflow

  1. User submits raw prompt to `prompts/inbox/`
  2. `/sdd` analyzes the prompt
  3. AI creates formalized prompt in `.sdd/projects/prompts/`
  4. AI documents prompt with ID and best practice in `.sdd/instances/{project_name}/docs/prompts/`
  5. Human reviews documented prompt
  6. If approved, flow-based planning begins
  7. Execution proceeds through chain engine

## Submitting a Prompt

  Copy prompt to `prompts/inbox/` as `prompt-XXX.md` or any descriptive name.

## Processing a Prompt

  `/sdd` reads `prompts/inbox/` and processes the next prompt:
  - Analyzes requirements
  - Matches against existing skills
  - Generates architecture decisions
  - Creates task graph

## Prompt Documentation

  After analysis, prompts are documented in:
  - `.sdd/projects/prompts/` — formalized prompt with expected skills, decisions, tasks
  - `.sdd/instances/{project_name}/docs/prompts/` — human-readable documentation with ID and best practice

## Rules
  [P1] Root prompts/ contains ONLY raw user prompts — no .sdd metadata
  [P2] Every prompt MUST be analyzed before execution
  [P3] Formalized prompts MUST live in `.sdd/projects/prompts/`
  [P4] Documented prompts with IDs MUST live in `.sdd/instances/{project_name}/docs/prompts/`
  [P5] Human MUST approve documented prompt before execution
  [P6] Prompts are NEVER deleted, only archived

State: +
