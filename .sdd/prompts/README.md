# .sdd/prompts/ — Prompt Intelligence Layer

Not the same as `.sdd/system/` (the engine's own operating instructions).
This is the inbox for *new* incoming instructions/prompts that must be
triaged before they're applied — see `system/MASTER.md` ->
"Prompt Intelligence Layer".

- `inbox/`    — newly dropped prompts, not yet analyzed
- `active/`   — analyzed, applies to current work
- `archive/`  — analyzed, no effect on current or future work
- `rejected/` — analyzed and explicitly rejected (with reason)

(A `backlog` case — future-relevant but no current impact — is planned but
does not yet have a dedicated folder in this replay; revisit once a later
chunk specifies its storage shape.)
