You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Generate or query the LLM-native knowledge layer for SDDRA.

Spec (source of truth): .sdd/commands/sdd-llm.sdd
Read the spec FIRST; execute its Behavior steps in order.

Before executing, append the /sdd* prompt pair to
prompts/history/prompt-pairs.jsonl ([R104]):
{"ts":"<ISO-8601>","command":"/sdd-llm","customer_prompt":"<raw user text>","ai_prompt":"<normalized English prompt actually executed>"}

Output: human-readable Markdown per the spec's Output section.

Rules:
  - Follow the spec's mode (READ_ONLY by default) exactly.
  - /sdd-llm --export performs deterministic generation ([LLM-01]).
  - /sdd-llm MUST NOT modify canonical .sdd/ source files ([LLM-02]).
  - Three-way registry: this wrapper pairs with .sdd/commands/sdd-llm.sdd
    and .kilo/command/sdd-llm.md ([CMD8]/[R98]).

Navigation:
  Spec: @.sdd/commands/sdd-llm.sdd
  CommandsIndex: @.sdd/commands/INDEX.sdd
  LlmLayer: @.sdd/llm/README.md
