# DEC-2026-0914-004 — RIE + Skill Evolution Engine

id: DEC-2026-0914-004
type: architectural
status: closed
title: Adopt Reference Intelligence Engine (RIE) + Skill Evolution & Update Engine (/sdd-evolve)
context: User's Phase 135/136 designs: (a) reference-driven decisions
  (URL → design intent → project adaptation, never cloning);
  (b) knowledge ecosystem that researches, compares, validates,
  deduplicates, and safely delivers skill updates (UPDATE is not
  GIT PULL).
problem: SDDRA's skills were static; references had no contract;
  /sdd-update only synced git state.
options:
  - option: implement both engines as specs + read-only status runtime
    pros: [knowledge lifecycle governed by same L3 contracts, R110/R111
      guardrails, evidence hierarchy, audit manifests]
    cons: [larger spec surface (31 commands)]
    cost: MEDIUM
  - option: extend /sdd-update in place
    pros: [no new command]
    cons: [conflates git sync with knowledge evolution — the user's
      design explicitly separates DISCOVER/EVOLVE/DELIVER]
    cost: MEDIUM
decision: separate engines — RIE (references/) + /sdd-evolve (skills/evolution.sdd)
rationale: Separation mirrors the user's DISCOVER/EVOLVE/DELIVER
  principle; /sdd-update keeps UPD-01..05 semantics; evolution runs
  SUPERVISED with human gates per Phase 131 authority (research and
  delivery are deliberate acts, never background).
impact:
  files: [.sdd/references/*, .sdd/skills/evolution.sdd, .sdd/commands/sdd-evolve.sdd, .kilo/command/sdd-evolve.md, .claude/commands/sdd-evolve.md, .sdd/commands/INDEX.sdd, .sdd/updates/INDEX.sdd, .sdd/projects/{project_name}/research/DR.template.sdd, .sdd/PROJECT.sdd (R110, R111), sdd-adapter/commands.ts (runEvolveCommand), sdd-adapter/__tests__/commands-evolve.test.ts, .sdd/projects/{project_name}]
  modules: [references, skills, commands, governance]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-14
implementation:
  - RIE: pipeline, reference contract (intent/scope/forbid/target),
    multi-reference matrix, project fit, evidence levels, freshness/
    delta, provenance that survives tmp deletion ([R111])
  - /sdd-evolve: 11-step supervised flow; SKILL_EVOLUTION records;
    source hierarchy L0-L5; dedup; promotion; Update Manifests;
    TRUST_0..5 delivery; PR standards (SOURCE+EVIDENCE+REASON+CHANGE)
  - [R110] reference never overrides project rules; [R111] no-copy
    ingestion with surviving provenance
  - Runtime: status/due/manifest surface (read-only; --report);
    26/26 tests green; /sdd-health HEALTHY 31 specs 0 drift
State: closed
