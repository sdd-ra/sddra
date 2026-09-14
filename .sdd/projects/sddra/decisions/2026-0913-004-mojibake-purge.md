# DEC-2026-0913-004 — Mojibake purge + scanner self-trip prevention

id: DEC-2026-0913-004
type: technical
status: closed
title: UTF-8 mojibake purge and scanner-signature relocation
context: 13 files carried double-encoded UTF-8 (UTF-8 bytes read as
  CP1252); the /sdd-health scanner pattern list was itself quoted
  inside scanned specs, so specs could trip the scanner.
problem: Mojibake is a CRITICAL defect class ([R99]); self-referential
  signature examples make the detector unreliable.
options:
  - option: repair all files + keep signatures in scanner code only
    pros: [clean repo, detector reliable, translation-proof escapes]
    cons: [signatures not visible in spec docs]
    cost: LOW
  - option: repair files + keep quoted examples with escaping
    pros: [examples visible]
    cons: [fragile — every re-quote risks reintroduction]
    cost: MEDIUM
decision: purge + signatures live in scanner code only
rationale: Specs describe the defect class, code defines its
  signatures; commands.ts uses unicode escapes; /sdd-health verifies
  0 hits; sweep repaired 13 files (11 em-dash INDEX files, AZ vowels
  in meta/imported, plan-cache, commands.ts literal list).
impact:
  files: [sdd-adapter/commands.ts, .sdd/PROJECT.sdd, 11 .sdd/skills INDEX files]
  modules: [health, i18n]
  risks: [R1]
owner: human
approved_by: human
approved_at: 2026-09-13
implementation:
  - 13 files repaired; scanner signature list unicode-escaped
  - specs de-literalized (R99, sdd-health.sdd)
  - /sdd-health: 0 mojibake hits, exit 0
State: closed
