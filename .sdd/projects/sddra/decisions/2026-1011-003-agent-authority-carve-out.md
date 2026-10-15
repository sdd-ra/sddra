# DEC-2026-1011-003 — Agent-authority carve-out: gated agent generation (`/sdd-agent`)

Date: 2026-10-15
Status: proposed
Type: architectural (policy + schema + generator)
Owner: human (approver), AI (analysis + proposal)
Gate: human_required — D1 carve-out boundary MUST be confirmed by human before any generator code lands; approval unblocks Phase 163 implementation.

## Context

Phase 161 (DEC-2026-1011-002, APPROVED) delivered the pyramid agent orchestration on SW1: dual dispatch channels R/F, sub-agent lifecycle L0→L1→L2 with depth cap 2, RECONCILE gate, CloseLadder (MU→TASK→DEC), typed outcomes to STATE, runtime folders under `.specdd/swarm/{run_id}/agents/{agent_id}/`, and registry/folders governance.

The remaining capability gap (U6-U8 in the Phase 161–162 review plan): AI agents cannot author new agent definitions — there is no `agent.sdd` schema, no carve-out boundary policy, no `/sdd-agent` command, and no `sdd-adapter/agent-generator.ts` runtime. "Agents build agents" is blocked by [R109], the weak-point-map, [ADAPTER2]/[MCP-02], and [IMP4], which prohibit constitution/routing/adapter auto-generation.

Goal: the narrowest, gate-lit carve-out that lets AI generate leaf, non-constitution agent definitions — never constitution/core routing/adapter/bootstrap/security-core artifacts, never authority expansion, never DL1 mutation — under a human gate and parity verification.

## Analysis — coverage vs. prohibition

| # | Area | Existing construct | Verdict |
|---|------|-------------------|---------|
| A1 | Machine-readable agent schema | Agent specs exist under `.sdd/agent/*.sdd`; no formal schema for agent instances | GAP — add `.sdd/schemas/agent.sdd` |
| A2 | Carve-out boundary (what AI MAY generate) | Policy blocks constitution/routing/core adapter/bootstrap/security-core auto-gen; no explicit least-authority boundary | GAP — define D1 allowed vs. forbidden |
| A3 | `/sdd-agent` command + generator runtime | 3-way command wrappers exist (`.sdd/commands/`, `.claude/commands/`, `.kilo/command/`); no `sdd-agent` command, no `agent-generator.ts` | PARTIAL — add command + propose-only runtime |
| A4 | Validators + parity tests + ownership enforcement | Compile-first Docker test flow, `/sdd-health`, `/sdd-drift`, ownership-guard tests exist | PARTIAL — add `agent-validator.ts` + parity test |
| A5 | Swarm integration (L0/L1/L2, RECONCILE, registry, folders) | Phase 161 EXISTS ([SW1-9]-[SW1-14], [SAL1]-[SAL8], [SUP-06]-[SUP-08], `.specdd/swarm/` folders) | EXISTS — reuse as-is |

## Proposal (D1–D4)

### D1. Carve-out boundary (least authority)

Allowed (AI MAY generate, under gates) | Forbidden (AI MUST NOT generate/modify) | Gate
--- | --- | ---
Leaf/domain non-constitution agent definitions (role, capabilities, tools allowlist, inputs/outputs, typed outcomes, folder scope, level L1/L2) | Constitution/core routing: `.sdd/INDEX.sdd`, core `.sdd/workflow/INDEX.sdd`, core `.sdd/agent/INDEX.sdd`, adapter/core runtime `sdd-adapter/core/*`, bootstrap authority core `.sdd/bootstrap/AI_BOOTSTRAP.sdd`, security enforcement core `.sdd/security/*`, DL1 immutable sections | Human approval on first generation + parity pass
Agent test stubs (parity, non-destructive) | Ownership/guardrails that expand authority (`ownership-guard.*`, `scope-guard.*`) | Parity MUST pass
Schema-conforming `agent.sdd` instances (non-constitution, `constitution: false`) | Any artifact touching constitution paths; level L0 with `constitution: true` | [IMP4]-style propose-only + human gate

Principle: never auto-promote to constitution; constitution-path changes require a separate DEC.

### D2. Schema `.sdd/schemas/agent.sdd` (minimal required)

- `agent_id` (slug, unique), `name`, `level` (L0\|L1\|L2), `parent_agent_id?`, `depth` (0–2)
- `role`, `description`, `capabilities[]`, `tools_allowlist[]`
- `channel` (R\|F), `parallel_ready`, `shared_state`
- `inputs[]`, `outputs[]`, `typed_outcomes[]` = {SUCCESS, PARTIAL, BLOCKED, NEEDS_CLARIFICATION, POLICY_VIOLATION, TOOL_ERROR, UNSAFE}
- `scope.paths[]` (path-locked), `folder` = `.specdd/swarm/{run_id}/agents/{agent_id}/`
- `constraints`: `max_depth <= 2`, self-delegation L0→L1→L2 only ([SAL1]-[SAL4]), `ownership.parent_id`, `status` (draft\|proposed\|approved\|retired)
- `governance`: `constitution = false`, `human_gate_required = true`
- Validation rejects: `level == L0` and `constitution == true`; `depth > 2`; `scope` escapes parent path-lock ([MU-9])

### D3. Command + Generator runtime

- Command spec: `.sdd/commands/sdd-agent.sdd` (args: `--name`, `--level L1\|L2`, `--parent`, `--capabilities`, `--scope`, `--channel R\|F`, `--dry-run`, `--propose-only`, `--approve`)
- 3-way wrappers: `.sdd/commands/sdd-agent.sdd`, `.claude/commands/sdd-agent.md`, `.kilo/command/sdd-agent.md`
- Runtime: `sdd-adapter/agent-generator.ts` — schema validate → generate instance; **read-only by default**, propose-only. Default `--propose-only` writes only to `.specdd/proposals/agents/{agent_id}.agent.sdd`. Write to `.sdd/agent/` only if `--approve` **and** the human gate is satisfied. No DL1 mutation.
- Typed outcomes to STATE ([SAL5]), folders ([SAL6]-[SAL7]), RECONCILE registry ([SW1-9]+[SUP-07]), cleanup DONE+VERIFIED ([SAL8])

### D4. Validators + Parity + Swarm + First self-build

- `agent-validator.ts`: carve-out boundary, path-lock ([MU-9]), `depth <= 2` ([SAL2]), channel scope within-stage, registry ownership, `constitution` forbidden for non-core generation
- `sdd-adapter/__tests__/agent-generator-parity.test.ts`: schema roundtrip, boundary violations rejected, depth cap enforced, propose-only default, approved path requires human gate
- Swarm integration per A5 (RECONCILE, registry, folders, CloseLadder)
- **First self-build (gated):** swarm (L0/L1/L2, RECONCILE) regenerates a **non-constitution** agent definition; parity verified; **no commit without human gate**. Self-build = regeneration + parity, not constitution authoring.

## Gate

[gate: human_required] — approve D1 carve-out boundary (what AI MAY/MUST NOT generate), schema D2, and generator defaults D3 before Phase 163 code (`agent-generator.ts`, `agent-validator.ts`, parity test, command wrappers) may be implemented or committed. Human commit is separately required (host `git add`/`commit` are permission-denied for agents).

## Approval

Pending. Proposal submitted for human review; no Phase 163 implementation until gate is satisfied.

State: proposed
