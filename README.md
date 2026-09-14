# SDDRA — SDD & Reasoning Architecture

**A specification-first operating system for AI-assisted software
engineering.** The `.sdd/` directory is the single source of truth:
rules, chains, gates, and registries that an AI agent operates
inside — with human approval reserved for irreversible decisions.

> Azərbaycan dilli qısa icmal aşağıdadır (§ AZ icmal).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sandboxed](https://img.shields.io/badge/execution-Docker--only-2496ed.svg)](docker-compose.yml)
[![Specs](https://img.shields.io/badge/specs-.sdd%2F-106%20rules-green.svg)](.sdd/PROJECT.sdd)

## Why

AI agents ship plausible code for goals nobody wrote down. Review
treadmills turn humans into QA for the robot. SDDRA is a **Layer-3
system**: intent is captured as machine-checkable contracts (`.sdd/`)
before code exists, so whole defect classes never happen.

- **Spec → Docs → Code** — the only legal change order
- **Human gates, minimal** — approve the irreversible, automate the rest
- **State over memory** — registries, not chat threads; resume is reading
- **Sandboxed by default** — every build/test runs in a locked container

## Quick start

```bash
git clone https://github.com/<you>/sddra.git && cd sddra
docker compose build sdd-sandbox
# then pick an install path — see docs/getting-started/install.md
```

Three install paths (auto local / manual global / vendored) with
pros and cons: **[docs/getting-started/install.md](docs/getting-started/install.md)**

## Documentation

| | |
|---|---|
| Architecture + diagrams | [docs/architecture/overview.md](docs/architecture/overview.md) |
| How it works (deep dive) | [docs/concepts/how-it-works.md](docs/concepts/how-it-works.md) |
| Contributing (worked examples) | [docs/contributing/contributing.md](docs/contributing/contributing.md) |
| Philosophy | [docs/contributing/philosophy.md](docs/contributing/philosophy.md) |
| Install paths | [docs/getting-started/install.md](docs/getting-started/install.md) |

Legacy deep docs (analysis, overviews, appendices) live in
`.sdd/docs/` — routed by `.sdd/INDEX.sdd`.

## The 30 commands

| Command | What it does |
|---------|--------------|
| `/sdd` | Execute the chain graph from a prompt |
| `/sdd-plan` | Cache-first execution plan (BIG/SMALL change mode) |
| `/sdd-status` | Execution status: tokens, decisions, tasks, approvals |
| `/sdd-next` | Advance to the next step from saved state |
| `/sdd-resume` | Resume interrupted chain from checkpoint |
| `/sdd-health` | Integrity: critical files, 3-way sync, mojibake, purity |
| `/sdd-analyze` | Deep analysis of the .sdd/ structure |
| `/sdd-explain` | Explain a completed task on demand |
| `/sdd-decisions` | List and explain decision-ledger entries |
| `/sdd-assumptions` | Track and validate project assumptions |
| `/sdd-intents` | Classify and route user intents |
| `/sdd-prompts` | Automate prompt lifecycle (inbox → active → archive) |
| `/sdd-update` | Sync .sdd/ state from the git repository |
| `/sdd-knowledge` | Knowledge-graph health and trust report |
| `/sdd-backup` | Timestamped backups of critical .sdd/ files |
| `/sdd-restore` | Restore .sdd/ from backup (approval required) |
| `/sdd-migrate` | Run pending migrations after schema updates |
| `/sdd-compact` | Compress context after a task |
| `/sdd-clean` | Clear context for the next task |
| `/sdd-skills` | Discover and map the skill ecosystem |
| `/sdd-design` | Design analysis, evaluation, discovery |
| `/sdd-scan` | Security pattern scans against code files |
| `/sdd-dependencies` | Analyze and visualize the dependency graph |
| `/sdd-purge` | Audit and clean AI provenance marks |
| `/sdd-drift` | Detect drift: .sdd declarations vs reality |
| `/sdd-sync` | Propose and execute sync for detected drift |
| `/sdd-trace` | Bidirectional requirement↔proof traceability |
| `/sdd-context` | Compile a minimal context pack for a task |
| `/sdd-marketplace` | External skill marketplace (list/sync/import/audit) |
| `/sdd-research` | Deep research round (RS1 arm) |

Every command is registered 3-way: `.sdd/commands/` (spec),
`.claude/commands/`, `.kilo/command/` ([R98]); `/sdd-health`
verifies zero drift.

## Architecture at a glance

```mermaid
flowchart LR
    U["Human prompt"] --> INBOX["prompts/inbox/"]
    INBOX --> D0(("D0"))
    D0 --> P1["P1 Prompt"]
    D0 --> D1["D1 Docs"]
    D0 --> S1["S1 Spec"]
    D0 --> C1["C1 Code"]
    D0 --> R1["R1 Review"]
    D0 --> DEP1["DEP1 Deploy"]
    C1 --> R1 --> DEP1 --> D0
```

Full delivery chain (BC→…→VR), decision lifecycle, and enforcement
layers: [docs/architecture/overview.md](docs/architecture/overview.md)

## Repository map

```
.sdd/            specs — rules R1-R106, chains, gates, registries (source of truth)
sdd-adapter/     TypeScript runtime executing the specs
.claude/commands/ + .kilo/command/    /sdd* command wrappers
.kilo/skills/    Kilo skill routing wrappers (R106)
docs/            English documentation (this suite)
.sdd/docs/       deep docs: analysis, overviews, appendices
prompts/         prompt inbox/history (R104)
var/             Docker bind-mount root (R92, gitignored)
```

## Security posture

All execution happens inside the sandbox: locally built image only
([R91]), `var/` bind mounts only ([R92]), read-only rootfs, no-new-
privileges, CPU/memory/pids limits, internal-only network, DNS
egress allowlist ([R59]-[R66], [R102]). Security alerts are fixed
before product work ([R101]). Commits carry no AI signatures
([R97], [R103]).

## Contributing

Commands, rules, skills, and architecture changes each have a defined
path with worked examples — **[docs/contributing/contributing.md](docs/contributing/contributing.md)**.
Philosophy: **[docs/contributing/philosophy.md](docs/contributing/philosophy.md)**.

## License

[MIT](LICENSE)

---

## AZ icmal

SDDRA — AI dəstəkli proqram təminatı üçün spesifikasiya-first əməliyyat
sistemi. `.sdd/` faylları (qaydalar R1-R106, chain graph, qapılar,
registrlər) sistemin beynidir; AI onların içində işləyir. İnsan qapıları
yalnız geri döndərilə bilməyən qərarlardadır. Bütün icra Docker
sandbox-dadır; commit-lərdə AI imzası yoxdur. 30 /sdd* əmri üç
səthdə qeydiyyatlıdır. Ətraflı: `docs/` (EN), `.sdd/docs/` (dərin
sənədlər). Yeni başlayanlar üçün: `docs/getting-started/install.md`.
