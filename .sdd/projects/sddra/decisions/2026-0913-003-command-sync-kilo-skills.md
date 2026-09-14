# DEC-2026-0913-003 — 3-way command registry + .kilo skills + prompt-pairs

id: DEC-2026-0913-003
type: technical
status: closed
title: 3-way command sync (30/30/30) + Kilo skills surface + prompt-pair history
context: Commands existed as specs + Claude wrappers; Kilo users had
  no command/skill surface; /sdd* invocations left no reusable
  prompt trail.
problem: Surface drift between agent ecosystems; no cross-session
  prompt corpus for normalization analysis.
options:
  - option: full 3-way registration + thin Kilo skills + jsonl history
    pros: [single source of truth, health-gated drift, corpus accrues]
    cons: [3 files per new command]
    cost: LOW
  - option: generate wrappers on demand
    pros: [fewer files]
    cons: [no static verification, drift invisible to health]
    cost: MEDIUM
decision: 3-way registration (spec + .claude + .kilo) + thin skills
rationale: Static registration is verifiable by /sdd-health
  (30/30/30, 0 drift); wrappers are thin routers ([SK1]/[R81]) so
  duplication cost is near zero; [R98]/[R104]/[R106] encode it.
impact:
  files: [.sdd/commands/, .claude/commands/, .kilo/command/, .kilo/skills/, prompts/history/prompt-pairs.jsonl]
  modules: [commands, skills, prompts]
  risks: [R2]
owner: human
approved_by: human
approved_at: 2026-09-13
implementation:
  - 30 commands synced 3-way; /sdd-health drift gate green
  - 5 Kilo skills: sddra, sddra-engineering, sddra-design,
    sddra-writing, sddra-languages ([R106])
  - prompt-pairs.jsonl appender ([R104])
State: closed
