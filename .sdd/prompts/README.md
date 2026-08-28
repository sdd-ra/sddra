# .sdd/prompts/ — Prompt Intelligence Layer

See `prompts.sdd` — this folder's full rule engine (Purpose, Directories,
Lifecycle, PromptTypes, Rules `[P1]-[P20]`, Comparison, Impact, Decision,
KnowledgeExtraction, Traceability) is defined there. This README is only
a short navigation summary.

Prompts pass through the `RECEIVE > ANALYZE > CLASSIFY > COMPARE > IMPACT > DECIDE >
EXECUTE / BACKLOG / ARCHIVE` flow and fall into one of the following
folders depending on the decision:

- `inbox/`      — newly arrived, not yet analyzed prompts
- `active/`     — analyzed, affects current work
- `archive/`    — analyzed, no active effect (rejected ones are
  included — there is no separate `rejected/` folder, see `prompts.sdd` -> `[P19]`)
- `extracted/`  — useful knowledge extracted from prompts, not yet moved to `project/` /
  `skills/` / `decisions/` (see `prompts.sdd` ->
  `KnowledgeExtraction`)
- `conflicts/`  — unresolved prompt conflicts, awaiting human
  decision (see `prompts.sdd` -> `[P11]`/`[P20]`)
