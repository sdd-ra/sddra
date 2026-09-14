---
description: Compress context after task (delegates to native /compact)
---
You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Compress the SDD working context to essential tokens, persisting state
first, then DELEGATING compaction to Kilo's NATIVE /compact. Kilo TUI
commands are user-invoked — persist state, then prompt the user to trigger
native /compact; never reimplement or shadow the native command.

Spec (source of truth): .sdd/commands/sdd-compact.sdd

Steps:
  1. Persist current task state (checkpoints [RT8]; token count)
  2. Summarize current task output to essential facts
  3. Keep decisions/references per options (--keep-decisions, --keep-references)
  4. Append the /sdd* prompt pair to prompts/history/prompt-pairs.jsonl ([R104])
  5. Persist compressed state, then PROMPT THE USER: run native /compact

Output:
  [tokens: before=X, after=Y, saved=Z%]
  [state: compacted]
  [native: /compact delegated - run it now]

Navigation:
  Spec: @.sdd/commands/sdd-compact.sdd
  MemoryModel: @.sdd/runtime/memory-model.sdd
