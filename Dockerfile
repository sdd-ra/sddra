# SDDRA Docker sandbox — reference implementation of .sdd rules [R59]-[R66], [R91], [R102]
# Multi-stage, pinned base digest, non-root user, no secrets, healthcheck.
# This is THE ONLY environment where build/test/lint run for this repo.

# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:26-bookworm-slim@sha256:662933cf47f013bc8e4beb31a6116448427a82057ba7c42c97e4c5ba766504c2

# ---------- Stage 1: dependencies ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /workspace
COPY .sdd/codding/sdd-adapter/package.json .sdd/codding/sdd-adapter/package-lock.json* ./
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
COPY --chown=node:node .sdd ./.sdd
COPY --from=deps --chown=node:node /workspace/node_modules ./.sdd/codding/sdd-adapter/node_modules
COPY --chown=node:node .gitignore ./
COPY --chown=node:node .claude/commands ./.claude/commands
COPY --chown=node:node .kilo/command ./.kilo/command

USER node
ENV NODE_ENV=sandbox
WORKDIR /workspace/.sdd/codding/sdd-adapter

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "process.exit(0)"

# Default: no CMD — everything runs via `docker compose run --rm sdd-sandbox <cmd>`
