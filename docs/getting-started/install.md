# Installing SDDRA

SDDRA runs all compile/lint/test/build work inside a locked-down
Docker sandbox ([R59]-[R66], [R102]). Choose one of three install
paths below.

## Requirements (all paths)

- Git
- Docker Engine + Docker Compose v2
- An AI coding agent with command support (Claude Code and/or Kilo)

## Path A — Auto-install (local, per-project clone) — recommended

One clone, one build. Everything stays inside the project; the
sandbox is built from the local Dockerfile (never pulled from a
registry, [R91]); all bind mounts live under `./var/` ([R92]).

```bash
git clone https://github.com/<you>/sddra.git sddra
cd sddra
docker compose build sdd-sandbox        # builds sddra-sandbox:local
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  npm ci                                 # dependencies (egress-allowlisted)
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node node_modules/typescript/bin/tsc --outDir /var/sandbox/dist
```

Verify the installation:

```bash
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node -e "process.chdir('/workspace'); \
    const {CommandRunner} = require('/var/sandbox/dist/commands.js'); \
    new CommandRunner('.sdd', '/workspace').run('/sdd-health') \
      .then(r => console.log(r.output, 'EXIT:', r.exitCode));"
```

Expected: `Status: HEALTHY`, `EXIT: 0`.

**Pros:** fully isolated; upgrade = `git pull` + rebuild; runtime
state (`var/`, `.claude/sdd/*.json`) never leaves the project;
uninstall = delete the directory.
**Cons:** one sandbox build per machine/project clone; repo carries
its own copy of the framework.

## Path B — Manual global install (shared across all your projects)

Copy the framework surfaces into your agent's global config so every
project on the machine gets the `/sdd*` commands and skills.

```bash
git clone https://github.com/<you>/sddra.git /tmp/sddra
# Claude Code global commands:
mkdir -p ~/.claude/commands
cp /tmp/sddra/.claude/commands/*.md ~/.claude/commands/
# Kilo global commands + skills:
mkdir -p ~/.config/kilo/command ~/.config/kilo/skills
cp /tmp/sddra/.kilo/command/*.md ~/.config/kilo/command/
cp -r /tmp/sddra/.kilo/skills/* ~/.config/kilo/skills/
# Per-project runtime (still required in every project using SDDRA):
cd your-project
mkdir -p .sdd && cp -r /tmp/sddra/.sdd/PROJECT.sdd /tmp/sddra/.sdd/INDEX.sdd .sdd/
cp /tmp/sddra/docker-compose.yml /tmp/sddra/Dockerfile .
```

**Pros:** one copy updates every project; commands available everywhere.
**Cons:** **version drift** — projects silently diverge from the global
copy; no per-project pinning; you maintain the sync manually. Use only
when you accept being the integration test.

## Path C — Manual project-base install (vendored into one repo)

Vendor the whole framework into a single product repository and treat
it as part of your codebase.

```bash
cd your-product-repo
git remote add sddra https://github.com/<you>/sddra.git
git fetch sddra && git merge sddra/master --allow-unrelated-histories
# resolve .gitignore (keep SDDRA's) and commit
```

**Pros:** one repo carries product + framework; SDDRA upgrades are
normal merge requests; CI sees everything.
**Cons:** framework files interleave with product files; history noise;
renames upstream can conflict.

## Comparison

| | A: auto local | B: manual global | C: vendored |
|---|---|---|---|
| Isolation | full | shared | repo-merged |
| Upgrade | `git pull` | manual copy | git merge |
| Version pinning | per clone | none (drift risk) | per repo |
| Best for | solo builders, teams | command power users | single-product repos |

## What each path gives you

- 30 `/sdd*` commands (`.kilo/command/`, `.claude/commands/`)
- 5 Kilo skills (`.kilo/skills/sddra*`)
- The `.sdd/` spec tree — rules R1-R106, chains, gates, registries
- The sandboxed adapter runtime (`sdd-adapter/`)

## Uninstall

Path A/C: delete the directory (or revert the merge). Path B: remove
the copied files from `~/.claude/commands/` and `~/.config/kilo/`.
No system-wide state exists outside those locations.
