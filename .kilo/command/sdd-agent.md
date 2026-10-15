---
description: Clear context for next task (delegates to native /clear)
---
You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Clear all SDD context and start fresh for the next task, DELEGATING the
context wipe to Kilo's NATIVE /clear. Kilo TUI commands are user-invoked —
persist state, then prompt the user to trigger native /clear; never attempt
programmatic invocation and never reimplement or shadow the native command.

Spec (source of truth): .sdd/commands/sdd-clean.sdd

Steps:
  1. If --save-state: persist current task state (checkpoints [RT8])
  2. If --archive: move context to the history log ([R57] append-only)
  3. Append the /sdd* prompt pair to prompts/history/prompt-pairs.jsonl ([R104])
  4. Persist SDD state, then PROMPT THE USER: run native /clear
     (Ctrl+P or the native clear command performs the actual wipe)

Output:
  [tokens: cleared]
  [state: fresh]
  [history: archived|discarded]
  [native: /clear delegated — run it now]

Navigation:
  Spec: @.sdd/commands/sdd-clean.sdd
  MemoryModel: @.sdd/runtime/memory-model.sdd
