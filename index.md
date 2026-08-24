# Repo Index

Single resume/tracking file for this repo's two ongoing background processes:

1. **ReplayProgress** — where the `prompt/new/{N}.md` "next"-gated replay
   currently stands, and which file to read next.
2. **TranslationBacklog** — which `.sdd/` files still contain Azerbaijani
   prose, so English translation can proceed in tracked batches instead of
   one unreviewed mass rewrite.

This file does not replace `.sdd/README.md` (the engine's own STEP-by-STEP
build log lives there, with full rationale per STEP) — it's a short
top-level pointer so a fresh session/agent knows where to pick up without
reading the whole history first.


## ReplayProgress

Source material: `prompt/new/1.md` – `prompt/new/114.md` (114 files, see
`run.md` for how they were produced from `chat_history.md`).

Gated rule: read and act on exactly one `prompt/new/{N}.md` per explicit
"next" trigger, never ahead of it. See `.sdd/README.md` for full STEP
rationale; this table is just the resume pointer.

| STEP | Source file(s)      | What it did                                              | Commit(s) |
|------|----------------------|-----------------------------------------------------------|-----------|
| 1    | 17.md                | Reset `.sdd/` root to STEP-1 skeleton (user-approved)      | abd38de, 5c98839 |
| 2    | 19.md                | Rewrote `PROJECT.sdd` as root router                       | e597367, 1d598be |
| 3    | 20.md                | Added `.sdd` system architecture graph                     | 8ac8dc0, 949f247 |
| 4    | ~21-22               | Reset `project/` to schema-only model; fixed stale refs    | 171e516, f5f33d3 |
| 5    | ~23                  | Reset `chains/` to chain-type model                        | 9b1810e, 0a81c08 |
| 6    | ~24                  | Added `skills.sdd` router + 8 SkillDomain directories       | 8b3c886, 93695b0 |
| 7    | ~25                  | Added `prompts.sdd` router, reset directory model           | 93b4886, 98db6b2 |
| 8    | ~26-27               | `tasks/` model: reset -> moved -> reverted -> refined        | a564858, 2c37a95, 9fb51bd, 242b850, a4c9752, 28f0e38 |
| 9    | ~28-29               | Built decision layer engine (`decisions/decisions.sdd`)     | 2342946, 05bb22c, 8896a76 |
| 10   | ~30                  | Added state notation engine (`state/state.sdd`)             | 1da2992 |
| 11   | 34.md (attempt)      | Restructured chains into `stages/`+`templates/` (later reverted) | 392d355 |
| 12   | 34.md                | Collapsed chain engine back to single-file model            | 8081c4b |
| 13   | 35.md                | Added global architecture principles engine                 | 5418e43 |
| 14   | 36.md                | Added Feature/Component model + `project/flows.sdd`         | 3645898 |
| 15   | 37.md                | Added `project/instantiation.sdd` (project decision pipeline) | 2266f3c |
| 16   | 38.md                | Correction pass: softened `[AP18]` + `ArchitectureSelection` (architecture/principles.sdd), `[C22]`/`DefaultFlow` addendum (chains/chains.sdd), `Evolution:`/`[PI7]-[PI9]` (project/instantiation.sdd), `[S17]` catalog-vs-applicability note (skills/skills.sdd) | 93bcb3a |
| 17   | 39.md                | Extended `prompts/prompts.sdd`: `InputForms:` (7 forms), `[P21]-[P24]`, `ConflictResolution:`, `Branches:`, `ImpactAreas:`, `Navigation:` | 57717de |
| 18   | 40.md                | Extended `skills/skills.sdd`: 4 new SkillDomains (architecture/security/performance/engineering), `[S18]-[S24]`, `Applicability:`, `SkillPriority:`/`SkillConflict:`/`SkillOutput:`/`Evolution:`/`SkillDiscovery:`/`ComplexityControl:` | a7b8910 |
| 19   | 41.md                | Extended `tasks/tasks.sdd`: `TaskResolution:`, `TaskKnowledge:`, `NoLoop:`/`Escalation:`, `[T21]-[T22]`, `TaskContract` `skills`/`attempts` Optional fields | 51a2e13 |
| 20   | 42.md                | Extended `PROJECT.sdd`: new `Operations:` section + `ANALYZE_PROJECT` (`[PA1]-[PA9]`); declined proposed `protocol.sdd` (stage IDs/skill sigils/alt state table) and `tasks.sdd` `Origin` field (NoDuplication/`[S2]`/`[T18]`) | PENDING |

**Resume pointer: next file to read is `prompt/new/43.md`, gated on the
next explicit "next" trigger.** Files 1–42 are fully read and actioned;
43–114 are untouched and must stay untracked/unread until triggered.


## TranslationBacklog

Origin: side-task requested alongside the replay rule — build a system
that scans `.sdd/` for Azerbaijani-language text, then translate it to
English incrementally (not as one mass rewrite). Detection tool:
`scripts/translate-check.ps1` (run it to re-check current counts —
these files are actively being edited by the STEP process above, so
counts will drift).

Baseline scan (STEP 14 snapshot):

| File                              | AZ-char hits | Status    |
|------------------------------------|-------------:|-----------|
| README.md                          | 4859         | pending   |
| PROJECT.sdd                        | 2112         | pending   |
| tasks/tasks.sdd                    | 1910         | pending   |
| decisions/decisions.sdd            | 1078         | pending   |
| architecture/architecture.sdd      | 843          | pending   |
| prompts/prompts.sdd                | 699          | pending   |
| skills/skills.sdd                  | 680          | pending   |
| chains/chains.sdd                  | 664          | pending   |
| architecture/principles.sdd        | 535          | pending   |
| state/state.sdd                    | 433          | pending   |
| project/project.sdd                | 371          | pending   |
| project/architecture.sdd           | 288          | pending   |
| project/flows.sdd                  | 284          | pending   |
| project/map.sdd                    | 242          | pending   |
| project/domains.sdd                | 131          | pending   |
| project/indexes.sdd                | 121          | pending   |
| prompts/README.md                  | 119          | pending   |
| project/modules.sdd                | 92           | pending   |
| project/dependencies.sdd           | 84           | pending   |
| decisions/README.md                | 51           | pending   |

TOTAL: 20 files, 15596 matched characters.

Rules for working this backlog:
- Detection only, never mechanical replace — each file gets a human/AI
  judgment pass (per the standing "apply, don't copy" rule), same as any
  other `.sdd/` edit.
- Work in small batches (a few files at a time), commit each batch
  separately, update `Status` here (`pending` -> `done`) as files clear.
- Files still under active STEP construction (anything the replay loop
  will touch again soon) should be translated only once their STEP
  content has settled, to avoid retranslating churn.
- Re-run `scripts/translate-check.ps1` after each batch to confirm the
  count actually dropped and no new AZ text crept back in.

Not yet started: no files have been translated yet.
