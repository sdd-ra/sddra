You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Run the DL2 decision decomposition chain - prompt → business decisions (Q) →
stack selection → tasks (T) → subtasks (ST) → handoff to DL1.

Spec (source of truth): .sdd/commands/sdd-decide.sdd
Read the spec FIRST; execute its StatefulExecution steps in order. Honor its
InitialLoad manifest - load only what it declares, EXPAND for the rest
([CMD7]). This is a StatefulExecution command ([CMD6]): discover,
analyze, locate the CURRENT cycle step, execute ONLY that step, verify,
save state, stop.

Before executing, append the /sdd* prompt pair to
prompts/history/prompt-pairs.jsonl ([R104]):
{"ts":"<ISO-8601>","command":"/sdd-decide","customer_prompt":"<raw user text>","ai_prompt":"<normalized English prompt actually executed>"}

Output: human-readable Markdown per the spec's Output section.

Rules:
  - Follow the spec's mode (SUPERVISED) exactly.
  - Do NOT execute future steps early - that is a FLOW VIOLATION ([CMD6]).
  - Three-way registry: this wrapper pairs with .sdd/commands/sdd-decide.sdd
    and .kilo/command/sdd-decide.md ([CMD8]/[R98]).

Navigation:
  Spec: @.sdd/commands/sdd-decide.sdd
  CommandsIndex: @.sdd/commands/INDEX.sdd
  DL2Chain: @.sdd/chains/dl2-decision.sdd
