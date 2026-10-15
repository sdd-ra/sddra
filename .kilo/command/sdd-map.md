---
description: Map prompts to tasks and subtasks (read-only)
---
You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Map prompts to tasks and subtasks. Reads prompts from
prompts/inbox/ (or accepts --prompt), classifies each to a
chain arm via keyword matching, derives tasks (T-NNN) and
subtasks (DB, BE, API, FE, MD, DC, Test), and prints the
mapping in formatted output.

Spec (source of truth): .sdd/commands/sdd-map.sdd
Read the spec FIRST; execute its Behavior steps in order. Honor its
InitialLoad manifest - load only what it declares, EXPAND for the rest
([CMD7]). This is a READ_ONLY mapping command (not full StatefulExecution
with side effects): discover, analyze, execute mapping, verify, output.

Before executing, append the /sdd* prompt pair to
prompts/history/prompt-pairs.jsonl ([R104]):
{"ts":"<ISO-8601>","command":"/sdd-map","customer_prompt":"<raw user text>","ai_prompt":"<normalized English prompt actually executed>"}

Arguments: $ARGUMENTS

Output: human-readable Markdown per the spec's Output section.

Rules:
  - Follow the spec's mode (READ_ONLY) exactly.
  - Do NOT modify any files ([MAP-01]).
  - Three-way registry: this wrapper pairs with .sdd/commands/sdd-map.sdd
    and .claude/commands/sdd-map.md ([CMD8]/[R98]).

Navigation:
  Spec: @.sdd/commands/sdd-map.sdd
  CommandsIndex: @.sdd/commands/INDEX.sdd
  IntentsCommand: @.sdd/commands/sdd-intents.sdd
