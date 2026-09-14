---
description: Propose and execute sync operations for detected drift
---
You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Propose and execute sync operations for detected drift.

Spec (source of truth): .sdd/commands/sdd-sync.sdd
Read the spec FIRST; execute its Behavior steps in order. Honor its
InitialLoad manifest - load only what it declares, EXPAND for the rest
([CMD7]). This is a StatefulExecution command ([CMD6]): discover,
analyze, locate the CURRENT step, execute ONLY that step, verify,
save state, stop.

Before executing, append the /sdd* prompt pair to
prompts/history/prompt-pairs.jsonl ([R104]):
{"ts":"<ISO-8601>","command":"/sdd-sync","customer_prompt":"<raw user text>","ai_prompt":"<normalized English prompt actually executed>"}

Arguments: $ARGUMENTS

Output: human-readable Markdown per the spec's Output section.

Rules:
  - Follow the spec's mode (READ_ONLY | SUPERVISED | READ_WRITE) exactly.
  - Do NOT execute future steps early - that is a FLOW VIOLATION ([CMD6]).
  - Three-way registry: this wrapper pairs with .sdd/commands/sdd-sync.sdd
    and .claude/commands/sdd-sync.md ([CMD8]/[R98]).

Navigation:
  Spec: @.sdd/commands/sdd-sync.sdd
  CommandsIndex: @.sdd/commands/INDEX.sdd