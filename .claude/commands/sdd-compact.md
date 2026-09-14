You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Compress the SDD working context to essential tokens, persisting SDD state
first, then DELEGATING the actual compaction to Claude Code's NATIVE
/compact so the agent's own summarization is used — never reimplemented.

Spec (source of truth): .sdd/commands/sdd-compact.sdd

Steps:
  1. Persist current task state (checkpoints [RT8]; token count)
  2. Summarize current task output to essential facts
  3. Keep decisions/references per options (--keep-decisions, --keep-references)
  4. Append the /sdd* prompt pair to prompts/history/prompt-pairs.jsonl ([R104])
  5. Persist compressed state, then RUN CLAUDE CODE'S NATIVE /compact

Output:
  [tokens: before=X, after=Y, saved=Z%]
  [state: compacted]
  [native: /compact delegated]

Rules:
  - Never reimplement or shadow the native /compact — delegate to it.
  - Persist state BEFORE compaction.

Navigation:
  Spec: @.sdd/commands/sdd-compact.sdd
  Clean: @.claude/commands/sdd-clean.md
  MemoryModel: @.sdd/runtime/memory-model.sdd
