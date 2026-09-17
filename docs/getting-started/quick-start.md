# Getting Started — Quick Start

This guide walks through installing SDDRA and running a complete
delivery chain (BC→BR→BD→DS→TK→BDD→BE/DB/API/FE/MD/DC) with
mobile build simulation, all inside Docker.

## 1. Prerequisites

- Git
- Docker Engine 24+
- Docker Compose v2
- An AI coding agent with `/sdd*` command support

## 2. Clone and Build

```bash
git clone https://github.com/<you>/sddra.git
cd sddra
docker compose build
```

This builds all 4 services:
- `sdd-sandbox` — framework runtime
- `fe-builder` — frontend build service
- `be-builder` — backend build service
- `mobile-builder` — mobile build simulator

Verify all services are configured:

```bash
docker compose config
```

Expected: 4 services, all `:local` images, all under `sdd-internal` network.

## 3. Verify Installation

```bash
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node -e "process.chdir('/workspace'); \
    const {CommandRunner} = require('/var/sandbox/dist/commands.js'); \
    new CommandRunner('.sdd', '/workspace').run('/sdd-health') \
      .then(r => console.log(r.output, 'EXIT:', r.exitCode));"
```

Expected: `Status: HEALTHY`, `EXIT: 0`

## 4. Install Dependencies and Build Adapter

```bash
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  npm ci
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  npx tsc --outDir /var/sandbox/dist
```

## 5. Run Security Scan (includes prompt injection check)

```bash
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node -e "process.chdir('/workspace'); \
    const {CommandRunner} = require('/var/sandbox/dist/commands.js'); \
    new CommandRunner('.sdd', '/workspace').run('/sdd-scan', ['--inject']) \
      .then(r => console.log(r.output, 'EXIT:', r.exitCode));"
```

Expected: Security scan output with PI-001 through PI-010 pattern checks.

## 6. Sample Project — Execute a Delivery Chain

Create a sample project spec to demonstrate the FE/BE/MD chain:

```bash
mkdir -p .sdd/project
cat > .sdd/project/profile.sdd << 'EOF'
Project: Sample Task Tracker
Architecture: ModularMonolith
Profile:
  BE: Node.js + Express
  FE: React + TypeScript
  MD: React Native
EOF
```

Execute the chain:

```bash
docker compose run --rm --workdir /workspace/sdd-adapter sdd-sandbox \
  node -e "process.chdir('/workspace'); \
    const {CommandRunner} = require('/var/sandbox/dist/commands.js'); \
    new CommandRunner('.sdd', '/workspace').run('/sdd', ['build a task tracker']) \
      .then(r => console.log(r.output, 'EXIT:', r.exitCode));"
```

## 7. Mobile Build Simulation

```bash
docker compose run --rm mobile-builder
```

Expected output:
```
MOBILE BUILD COMPLETE (SIMULATION)
Build ID: mobile-<timestamp>
Framework: react-native
Status: COMPLETED
Artifacts: 5
Output: /workspace/output
```

Verify artifacts:

```bash
ls var/mobile-build/output/
# app.android.apk, app.ios.ipa, bundle.android.jsbundle, bundle.ios.jsbundle, assets.zip, build-report.json, summary.txt
```

## 8. Frontend Deployment

```bash
docker compose build fe-builder
docker compose run --rm fe-builder
docker compose up -d fe-builder
curl http://localhost:3000  # nginx serves built SPA
```

## 9. Backend Deployment

```bash
docker compose build be-builder
docker compose up -d be-builder
curl http://localhost:3000  # BE API endpoint
```

## 10. Verify Full Stack

```bash
docker compose ps
```

Expected: All 4 services running with resource limits.

## What Each Path Gives You

- 30 `/sdd*` commands (`.kilo/command/`, `.claude/commands/`)
- 5 Kilo skills (`.kilo/skills/sddra*`)
- The `.sdd/` spec tree — rules R1-R111, chains, gates, registries
- The sandboxed adapter runtime (`sdd-adapter/`)
- 4 Docker services (sandbox, FE, BE, mobile) — all containerized

## Uninstall

Delete the directory (or revert the merge for vendored).
No system-wide state exists outside the project.
