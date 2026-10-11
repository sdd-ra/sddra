# Git Status Analysis — Uncommitted Working-Tree Changes

Status: ANALYSIS ONLY (D1) — no commits made; human decides
Date: 2026-09-26
Method: `git status`, `git diff`, `git diff --stat`, directory listing of
untracked roots. Every entry lists path, change type, and a keep/commit/
defer recommendation. [R81] link-over-copy and source-of-truth rules applied.

## 0. Summary

| Metric | Value |
|--------|-------|
| Modified tracked files | 12 |
| Untracked roots | 3 (`.sdd/codding/`, `.sdd/projects/sddra/history/`, `docs/assets/`) |
| Staged files | 0 |
| Branch | `master`, up to date with `origin/master` |
| Last commit | `9a92c27` Merge origin/master |
| DEP1 gate | **human_required** — nothing committed |

## 1. Modified tracked files (12)

All 12 are **repo-ownership migration** artifacts from DEC-2026-0914-001
(`RasimAghayev` -> `sdd-ra`). Each is a single-line URL or handle swap.
They
are complete, self-consistent, and safe to commit together.

| # | Path | Change | Recommendation |
|---|------|--------|----------------|
| 1 | `.claude-plugin/plugin.json` | `repository` URL `RasimAghayev/sddra` -> `sdd-ra/sddra` | **COMMIT** |
| 2 | `.codex-plugin/plugin.json` | same URL swap | **COMMIT** |
| 3 | `.cursor-plugin/plugin.json` | same URL swap | **COMMIT** |
| 4 | `.hermes-plugin/plugin.yaml` | same URL swap | **COMMIT** |
| 5 | `.kimi-plugin/plugin.json` | same URL swap | **COMMIT** |
| 6 | `.opencode/plugins/sddra.js` | same URL swap | **COMMIT** |
| 7 | `.pi/extensions/sddra.ts` | same URL swap | **COMMIT** |
| 8 | `.sdd/projects/sddra/decisions/2026-0914-001-final-naming-sddra.md` | line 41: `RasimAghayev/sddra.git` -> `sdd-ra/sddra.git` (implementation note) | **COMMIT** |
| 9 | `CODEOWNERS` | `.sdd/ @RasimAghayev` -> `@sdd-ra` | **COMMIT** |
| 10 | `package.json` | `repository.url` swap | **COMMIT** |
| 11 | `projects/sddra/history/prompt-pairs.jsonl` | appended 1 R104 line (2026-09-18T19:14:42Z, `/sdd-next`); trailing-newline fix | **COMMIT** (see §3) |
| 12 | `sdd-adapter/__tests__/ownership-guard.test.ts` | 5 `RasimAghayev` -> `sdd-ra` (owner literal + env + assertion strings) | **COMMIT** |

### 1a. Cross-cutting observation

Files 1-10 and 12 are one logical change: the repo's canonical owner
identifier moved from `RasimAghayev` to `sdd-ra`. They were made across
multiple prior sessions and never committed. **Commit them as a single
atomic change** (one commit, message referencing DEC-2026-0914-001) so the
migration is reviewable as a unit. Do NOT split them.

### 1b. File 11 caveat

`projects/sddra/history/prompt-pairs.jsonl` is the **stale copy** of the
prompt-pairs history. The canonical copy lives at repo root
(`prompts/history/prompt-pairs.jsonl`, 461 lines, verified valid JSON).
The stale copy is tracked in git and has drifted (it is missing R104
entries from 2026-09-26/27). Per [R104] and the link-over-copy rule, the
stale copy should be **deleted from the tree** rather than kept in sync by
hand. Recommendation: **COMMIT the deletion** alongside the migration
change, and add `.sdd/projects/sddra/history/` to `.gitignore`.

## 2. Untracked roots (3)

| Path | Contents | Recommendation |
|------|----------|----------------|
| `.sdd/codding/` | 4 empty dirs (`be-builder`, `fe-builder`, `mobile-builder`, `sdd-adapter`) + 3 `Dockerfile.*` (2039/1462/749 bytes, dated 2026-09-17) | **DEFER** — build scaffolding, not product; not referenced by any INDEX.sdd routing. Add to `.gitignore` or move out of `.sdd/` |
| `.sdd/projects/sddra/history/` | `prompt-pairs.jsonl` (63592 bytes, 2026-09-26) — stale duplicate of the canonical copy | **DELETE** — duplicate history; canonical copy is at `prompts/history/prompt-pairs.jsonl` |
| `docs/assets/` | `logo.png` (289632 bytes, 2026-09-26) — the new sddra logo | **DECIDE** — product asset. If the README/docs reference it, COMMIT; otherwise ignore |

## 3. Prompt-pairs history — two copies, one canonical

| Copy | Path | Lines | State |
|------|------|-------|-------|
| Canonical | `prompts/history/prompt-pairs.jsonl` | 461 | current, valid JSON, last line 2026-09-26T21:34:14Z |
| Stale (tracked) | `projects/sddra/history/prompt-pairs.jsonl` | 417 | missing all 2026-09-26/27 R104 entries |

[R104] says the prompt pair is appended to
`prompts/history/prompt-pairs.jsonl`. The `projects/sddra/history/` copy is
a leftover from before the canonical path was corrected (commit
`1726522 fix(r104): correct prompt-pairs history location`). It is now pure
drift. **Delete it from the tree** and ignore the directory.

## 4. Recommended commit plan (DEP1 — requires human approval)

**Commit A** (migration, atomic):
- `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`,
  `.cursor-plugin/plugin.json`, `.hermes-plugin/plugin.yaml`,
  `.kimi-plugin/plugin.json`, `.opencode/plugins/sddra.js`,
  `.pi/extensions/sddra.ts`, `CODEOWNERS`, `package.json`,
  `sdd-adapter/__tests__/ownership-guard.test.ts`,
  `.sdd/projects/sddra/decisions/2026-0914-001-final-naming-sddra.md`
- Message: `chore(identity): RasimAghayev -> sdd-ra ownership migration (DEC-2026-0914-001)`

**Commit B** (history hygiene):
- Delete `projects/sddra/history/prompt-pairs.jsonl`
- Add `.sdd/projects/sddra/history/` to `.gitignore`
- Message: `chore(history): remove stale prompt-pairs duplicate (R104)`

**Not committed** (defer to human decision):
- `.sdd/codding/` — build scaffolding
- `docs/assets/logo.png` — only if referenced by product docs

## 5. DEP1 gate

[gate: human_required] — no commit, push, or push-to-new-org action taken.
Per [R101] security-first ordering, the `sdd-ra/sddra` repo does not yet
exist on GitHub, so even after a local commit there is nothing to push to
until the org-owner creates it. 6 open Renovate PRs (#6-#10) also remain
pending merge/close decision.

## 6. References

- DEC-2026-0914-001: final naming — sddra, identity purge, R107/R108
- DEC-2026-0913-001: security-first ordering + rename the intermediate repo
- [R101] security-first ordering; [R104] prompt-pairs history; [R81] link-over-copy
- `.sdd/docs/analysis/INDEX.md` — this doc registered there