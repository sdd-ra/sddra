---
name: sddra-engineering
description: SDDRA engineering intelligence — memory architecture, deep research pipeline, orchestration hardening, MCP runtime ops, integration routing. Routes to .sdd/skills/engineering/ specs.
---

# SDDRA Engineering Skills

Source of truth: `.sdd/skills/engineering/` — this skill is the routing
wrapper. Read `.sdd/skills/engineering/INDEX.sdd` before applying.

## What it covers

- **Memory architecture** (memory-architecture.sdd): how this project
  models agent memory — layered stores, retention, recall policies.
  Prior art analyzed: claude-mem v13.18.0 (SQLite FTS5 + ChromaDB +
  SHA256 dedup) — analysis lives in tmp/repo-analysis/claude-mem/.
- **Deep research pipeline** (deep-research-pipeline.sdd): multi-stream
  research with convergence gates; results land in .sdd/docs/deep-analysis.md.
- **Orchestration hardening** (orchestration-hardening.sdd): agent
  orchestration failure modes and hardening patterns.
- **MCP runtime ops** (mcp-runtime-ops.sdd): MCP server operation rules
  under [R59-R66] Docker-only execution.
- **Integration routing** (integration-routing.sdd): how SDD events map
  to skill surfaces (.sdd, .claude, .kilo — 3-way sync [CMD8]).

## When to use

Use when a task touches: agent memory, research streams, orchestration,
MCP servers, or cross-surface integration. Read the named spec first;
never re-derive from memory of past sessions.
