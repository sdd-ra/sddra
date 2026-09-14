---
name: sddra
description: SDDRA (sddra.git) — SDD & Reasoning Architecture. Read-order, chain graph, command map, and core rules for working inside this repo.
---

# SDDRA — SDD & Reasoning Architecture

This repo runs on SDDRA: specifications in `.sdd/` are the single source
of truth; code, docs, and agent surfaces are derived from them.

## What this skill gives you

- The read-order for entering the system productively
- The chain-graph mental model (how work flows)
- The command map (30 /sdd* commands, registered 3-way)
- The hard rules you must never violate (R59-R105 digest)

## Read order (first session in this repo)

1. `CLAUDE.md` — agent-facing rules (derived pointer)
2. `.sdd/INDEX.sdd` — the routing table for the whole spec tree
3. `.sdd/PROJECT.sdd` — project identity + rules R1-R105
4. `.sdd/chains/INDEX.sdd` — the chain graph (arms and delivery)
5. `.sdd/commands/INDEX.sdd` — command registry ([CMD1..8])

## Chain graph (mental model)

- Arms (research to delivery): P1 → D1 → S1 → C1 → R1 → DEP1 (+RS1 research)
- Delivery chain DL1: BC → BR → BD → DS → TK → BDD → six parallel
  branches (BE/DB/API/FE/MD/DC), each CR-XX → RF-XX → XX-TS → SC-XX,
  then AN → VR (see `.sdd/chains/delivery.sdd`)
- /next continues from SAVED STATE, never conversation memory ([DL1-2])

## Command map (see .sdd/commands/INDEX.sdd)

30 commands, every one registered in .sdd/ + .claude/commands/ +
.kilo/command/ ([CMD8]). Highlights: /sdd (execute chain from prompt),
/sdd-plan, /sdd-next, /sdd-health, /sdd-research, /sdd-marketplace.

## Hard rules digest (full list: .sdd/PROJECT.sdd)

- Docker-only execution, resource-limited ([R59-R66], [R102])
- Locally built images only, var/ mounts only ([R91], [R92])
- Task end = git commit with DEC/TASK refs ([R95])
- No AI signatures in commits; runtime state never committed ([R97], [R103])
- UTF-8 only; mojibake is a CRITICAL defect ([R99])
- Security alerts fixed before product work ([R101])
- Every /sdd* run appends a prompt pair to prompts/history/prompt-pairs.jsonl ([R104])
- Work in repo tmp/ only; prompts/ is the prompt root ([R96])
- Prefer reuse/linking over copying ([R81-R83]); duplication routes to RF ([R100])

## When to use this skill

Use whenever you work in this repository: before planning, before
creating files, before committing. It routes you to the right spec instead
of guessing.
