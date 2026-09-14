# SDDRA Docker sandbox — reference implementation of .sdd rules [R59]-[R66], [R91], [R102]
# Multi-stage, pinned base digest, non-root user, no secrets, healthcheck.
# This is THE ONLY environment where build/test/lint run for this repo.

# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:26-bookworm-slim@sha256:cd9f682fa2885cd1056e830424764158570061c59736a1da836bc3d73df095ae

# ---------- Stage 1: dependencies ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /workspace
COPY sdd-adapter/package.json sdd-adapter/package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# ---------- Stage 2: runtime sandbox ----------
FROM ${NODE_IMAGE} AS sandbox
LABEL org.opencontainers.image.title="SDDRA sandbox"
LABEL org.opencontainers.image.description="Resource-limited execution sandbox for SDDRA build/test/lint and code-bearing skill analysis ([R59]-[R66], [R91], [R102])"

# python3 present in slim image for skill-script analysis (clean-user-facing-text etc.)
# node:22-bookworm-slim already ships a non-root `node` user (uid/gid 1000) — reuse it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY --from=deps --chown=node:node /workspace/node_modules ./sdd-adapter/node_modules
COPY --chown=node:node sdd-adapter/package.json sdd-adapter/tsconfig.json ./sdd-adapter/
COPY --chown=node:node sdd-adapter/commands.ts sdd-adapter/context-budget.ts sdd-adapter/context-compiler.ts \
    sdd-adapter/context-manifest.ts sdd-adapter/context-router.ts sdd-adapter/dependency-resolver.ts \
    sdd-adapter/design-analyzer.ts sdd-adapter/drift-detector.ts sdd-adapter/evidence-binder.ts \
    sdd-adapter/hook-bridge.ts sdd-adapter/memory-bridge.ts sdd-adapter/provenance-client.ts \
    sdd-adapter/relevance-engine.ts sdd-adapter/skill-auto-invoker.ts sdd-adapter/skill-importer.ts \
    sdd-adapter/skill-validator.ts sdd-adapter/spec-loader.ts sdd-adapter/sync-engine.ts \
    sdd-adapter/trace-engine.ts sdd-adapter/types.ts \
    sdd-adapter/checkpoint-engine.ts sdd-adapter/mcp-allowlist.ts sdd-adapter/context-emitter.ts \
    sdd-adapter/integration-routing.ts sdd-adapter/delivery-runner.ts ./sdd-adapter/
COPY --chown=node:node sdd-adapter/security ./sdd-adapter/security
COPY --chown=node:node sdd-adapter/__tests__ ./sdd-adapter/__tests__
COPY --chown=node:node .sdd ./.sdd
COPY --chown=node:node .claude/commands ./.claude/commands
COPY --chown=node:node .kilo/command ./.kilo/command

USER node
ENV NODE_ENV=sandbox
WORKDIR /workspace/sdd-adapter

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "process.exit(0)"

# Default: no CMD — everything runs via `docker compose run --rm sdd-sandbox <cmd>`
