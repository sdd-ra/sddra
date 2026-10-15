You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Clear all context and start fresh for the next task, DELEGATING the final
context wipe to Claude Code's NATIVE /clear so the agent's own memory
management is used — never reimplemented or shadowed.

Spec (source of truth): .sdd/commands/sdd-clean.sdd

Steps:
  1. If --save-state: persist current task state (checkpoints [RT8])
  2. If --archive: move context to the history log ([R57] append-only)
  3. Append the /sdd* prompt pair to prompts/history/prompt-pairs.jsonl ([R104])
  4. Persist SDD state, then RUN CLAUDE CODE'S NATIVE /clear
     (the native command performs the actual context wipe)

Output:
  [tokens: cleared]
  [state: fresh]
  [history: archived|discarded]
  [native: /clear delegated]

Rules:
  - Never reimplement or shadow the native /clear — delegate to it.
  - Persist state BEFORE the wipe; completed steps are never re-executed ([RT9]).

Navigation:
  Spec: @.sdd/commands/sdd-clean.sdd
  Compact: @.claude/commands/sdd-compact.md
  MemoryModel: @.sdd/runtime/memory-model.sdd
