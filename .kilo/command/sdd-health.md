---
description: Check system integrity
---
You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Check system integrity.

Spec (source of truth): .sdd/commands/sdd-health.sdd
Read the spec FIRST; execute its Behavior steps in order. Honor its
InitialLoad manifest - load only what it declares, EXPAND for the rest
([CMD7]). This is a StatefulExecution command ([CMD6]): discover,
analyze, locate the CURRENT step, execute ONLY that step, verify,
save state, stop.

Before executing, append the /sdd* prompt pair to
prompts/history/prompt-pairs.jsonl ([R104]):
{"ts":"<ISO-8601>","command":"/sdd-health","customer_prompt":"<raw user text>","ai_prompt":"<normalized English prompt actually executed>"}

Arguments: $ARGUMENTS

Output: human-readable Markdown per the spec's Output section.

Rules:
  - Follow the spec's mode (READ_ONLY | SUPERVISED | READ_WRITE) exactly.
  - Do NOT execute future steps early - that is a FLOW VIOLATION ([CMD6]).
  - Three-way registry: this wrapper pairs with .sdd/commands/sdd-health.sdd
    and .claude/commands/sdd-health.md ([CMD8]/[R98]).

Navigation:
  Spec: @.sdd/commands/sdd-health.sdd
  CommandsIndex: @.sdd/commands/INDEX.sdd
## Execution rule: Targeted investigation
When investigating to answer the user's request:
1) Define 1 concrete question
2) Consult .sdd/INDEX.sdd`n3) grep for key terms/IDs with context
4) ead only matching offset+limit ranges
Do NOT read entire spec files unless justified by the stated question. Follow CLAUDE.md Reading Strategy.
