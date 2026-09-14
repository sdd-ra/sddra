# Repo Cleanup Analysis — Stale & Candidate Files

Status: ANALYSIS ONLY (Phase H) — no deletions applied; user decides
Date: 2026-09-13 (compiled 2026-09-14)
Method: every entry lists path, size, last-commit date, what references
it (grep across core files), and a keep/move/delete recommendation with
rationale. [R81] link-over-copy and source-of-truth rules applied.

## 1. Root-level artifacts

| Path | Size | Last commit | Referenced by | Recommendation |
|------|------|-------------|---------------|----------------|
| `files.txt` | 1.7 KB | 2026-08-31 | nothing (0 refs in INDEX/PROJECT/CLAUDE/README) | **DELETE** — stale file-list snapshot from before Phase 152 restructures; superseded by `git ls-files` and INDEX routing |
| `AGENT_README.md` | 8.6 KB | 2026-08-28 | README.md:24 (tree diagram only) | **DELETE after README rewrite (Phase I)** — content overlaps CLAUDE.md (single agent-facing file rule); README tree entry updated in same commit |
| `TEST_GUIDE.md` | 8.2 KB | 2026-08-30 | nothing | **MOVE → .sdd/docs/** — describes chain-graph test scenarios; partially stale vs current architecture; if content is fully superseded by `.sdd/testing/` specs, DELETE instead |

## 2. .sdd root-level markdown/spec files (12 candidates)

INDEX.sdd read-order is the routing source of truth; files NOT in the
read order and not referenced are consolidation candidates.

| Path | Size | Last commit | INDEX.sdd refs | Recommendation |
|------|------|-------------|----------------|----------------|
| `.sdd/ANALYSIS.md` | 3.9 KB | 2026-08-29 | 1 | **MOVE → .sdd/docs/analysis/** — historical analysis; docs/ is the archival home (deep-analysis.md already lives there) |
| `.sdd/AUDIT-REPORT.md` | 6.2 KB | 2026-08-30 | 0 | **MOVE → .sdd/docs/analysis/** or DELETE — historical audit report, zero routing refs |
| `.sdd/AUDIT.sdd` | 4.1 KB | 2026-08-31 | 2 | **KEEP** (referenced) — verify the 2 refs are live routing, not historical mentions; if historical, move to docs/ |
| `.sdd/CLI_INTEGRATION.md` | 2.4 KB | 2026-08-29 | 0 | **MOVE → .sdd/docs/** — CLI integration notes; zero routing refs |
| `.sdd/DOCUMENTATION.md` | 6.2 KB | 2026-08-30 | 1 | **VERIFY then MOVE → .sdd/docs/** — documentation standards; likely superseded by DOCUMENTATION domain specs |
| `.sdd/EVOLUTION.sdd` | 9.1 KB | 2026-08-31 | 1 | **KEEP** (referenced) — evolution history record; check ref liveness |
| `.sdd/GIT-WORKFLOW.sdd` | 3.0 KB | 2026-08-31 | 1 | **KEEP** (referenced) — git branching spec (main→stage→test→MODUL→DEC→TASK) |
| `.sdd/INITIALIZATION.md` | 5.2 KB | 2026-08-29 | 0 | **MOVE → docs/getting-started/** (Phase I consumes it) — init/bootstrapping notes; zero routing refs |
| `.sdd/README.md` | 16.4 KB | 2026-08-31 | — (is a readme) | **REWRITE in Phase I** — .sdd-facing intro; fold into .sdd/INDEX.sdd read order or shrink to pointer |
| `.sdd/RESILIENCE.md` | 7.2 KB | 2026-08-30 | 1 | **KEEP** (referenced) — resilience model; check ref liveness |
| `.sdd/RESOURCES.sdd` | 4.4 KB | 2026-08-30 | 3 | **KEEP** (referenced) — resource registry |
| `.sdd/SKILLS-REFERENCE.md` | 22.9 KB | 2026-08-31 | 0 | **MOVE → .sdd/docs/** — largest orphan; skills INDEX.sdd supersedes it |
| `.sdd/WORK-PLAN.sdd` | 9.0 KB | 2026-09-01 | 1 | **ARCHIVE → .sdd/legacy/ or docs** — superseded by projects/sddra registry + /sdd-plan; verify ref liveness first |

## 3. Command descriptions audit (H2 — FIXED in this phase)

9 `.sdd/commands/*.sdd` files carried stub purposes
("Auto-generated purpose for X"): sdd, sdd-backup, sdd-decisions,
sdd-health, sdd-migrate, sdd-next, sdd-restore, sdd-resume, sdd-status.
**All replaced with real descriptions (2026-09-14)** — derived from each
command's own Description section; `.claude/commands/` and
`.kilo/command/` wrappers had zero stubs (sync verification next).

## 4. {project_name}/ template check (H3)

Template folders: cases/, migrations/, tokens/ (D0, D1, DEP1 sample token
files), context/, history/, decisions/, tasks/, phases/ + INDEX/MAP/
STRUCTURE files. **Verdict: intentional template material** — tokens D0/
D1/ DEP1 align with the chain arms (P1→D1→S1→C1→R1→DEP1 + D0 checkpoints)
and are instantiated per-project. No stale leftovers detected. One
nit: MAP.md/STRUCTURE.md duplicate INDEX.sdd routing — acceptable as
template scaffolding, not flagged.

## 5. Runtime state (verified clean)

`.claude/sdd/` tracked files = orchestrator.md + workflow.yaml (product)
only; state.json, history.json, plan-cache.json, decisions.json are
gitignored ([R97]/[R103] enforced — verified via git ls-files +
check-ignore 2026-09-14).

## 6. Known out-of-scope cleanup

- TranslationBacklog: ~20 AZ-language legacy docs (15,596 AZ-hits)
  under .sdd/ — EN docs suite (Phase I) is the global surface; full
  translation is a separate user decision.
- `old/` — already gitignored.
- User-profile temp dirs — outside repo; [R96] prevents future use.

## Summary counts

- DELETE candidates: 2 (files.txt, AGENT_README.md — post-README-rewrite)
- MOVE candidates: 6 (TEST_GUIDE, ANALYSIS, AUDIT-REPORT, CLI_INTEGRATION,
  DOCUMENTATION, SKILLS-REFERENCE, INITIALIZATION → docs; WORK-PLAN → archive)
- KEEP (referenced): 5 (AUDIT.sdd, EVOLUTION.sdd, GIT-WORKFLOW.sdd,
  RESILIENCE.md, RESOURCES.sdd) — ref-liveness verification pending
- FIXED: 9 command stub descriptions
- TEMPLATE: clean, intentional

Next step: user reviews this list and approves deletions/moves;
executor applies in a follow-up task with [R95] commit.
