# DEC-2026-0914-002 — Full identity purge: retired names out of history + PRs

id: DEC-2026-0914-002
type: operational
status: closed
title: Purge retired repository names from all git history and the PR/issue surface; encode R107/R108
context: The 2026-09-14 rename settled the identity as sddra, but the
  retired names remained in commit messages/blobs (6 commits), the
  working tree (plugin manifests, DEC records, prompt ledger), and
  all 5 renovate PR bodies (generated-by credit + job-log URLs).
problem: Retired names are provenance pollution with the same
  standing as AI signatures ([R103]) — the identity must be single
  everywhere the repo is experienced.
options:
  - option: full purge — tree + history rewrite + PR body edits + scanner
    pros: [single identity everywhere, machine-enforced going forward]
    cons: [history rewrite invalidates all commit hashes]
    cost: MEDIUM
  - option: tree-only cleanup, leave history untouched
    pros: [no hash churn]
    cons: [old names recoverable forever; violates user's hard rule]
    cost: LOW
decision: full purge with enforcement
rationale: User's explicit hard rule: no trace of AI involvement and
  no old-name variants anywhere — history and PRs included. Hash
  churn is acceptable (backup bundle retained in tmp/).
impact:
  files: [.sdd/PROJECT.sdd (R107, R108), sdd-adapter/commands.ts (HEALTH-11), .opencode/plugins/sddra.js, DEC records, prompt-pairs.jsonl, docs/analysis/INDEX.md, git history all branches, PR #1-#5 bodies]
  modules: [governance, health, identity]
  risks: [R2, hash references stale]
owner: human
approved_by: human
approved_at: 2026-09-14
implementation:
  - Tree: retired names rewritten in 9 files; templates/specdd exempt
    (naming concept)
  - PROJECT.sdd: [R107] no AI traces in PR/issue surface; [R108]
    single identity — retired names = provenance pollution, CRITICAL
    health findings
  - /sdd-health [HEALTH-11]: retired-name scan across .sdd, docs,
    .claude/docs, .kilo/skills, prompts (templates/ exempt)
  - History: git-filter-repo replace-text + replace-message on all
    branches (191 commits preserved); pre-rewrite backup bundle in
    tmp/pre-rewrite-backup.bundle
  - Remote: force-push master; diagnostic-tray verified clean and
    unchanged; fresh-clone verification 0 messages 0 blobs
  - PRs #1-#5: bodies edited — retired-name URLs rewritten to sddra,
    renovate generated-by credit + job-log links removed
  - Verification: local all-branch 0/0; fresh clone 0/0; PR surface
    0 flagged; merge subjects 0
State: closed
