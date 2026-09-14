# Garry Tan Prompt / Rentier Critique / gstack — SDDRA Alignment Analysis

Status: ANALYSIS COMPLETE — spec adoptions applied 2026-09-13 (Phase 152 / F)
Related: [R100] duplication_findings, CR ReviewPillars (workflow/stages.sdd),
DOC-2026-0913-004, TASK 2026-0913-005

## Purpose

Evaluate three external sources (Garry Tan's AI review prompt, the
Rentier Digital critique of AI review systems, and garrytan/gstack)
against SDDRA, adopt what strengthens the system, and reject — with
rationale — what conflicts with SDDRA's Layer-3 contract philosophy.

## Sources

1. **Garry Tan review prompt** (howaiworks.ai, published prompt):
   4-pillar review — Architecture / Code Quality / Test Quality /
   Performance; DRY enforced aggressively; recommendations are
   opinionated (one recommended option with rationale, not neutral
   lists); BIG/SMALL change mode with plan-mode-first for BIG.
2. **Rentier critique** (rentierdigital.xyz): AI review systems sort
   into three layers — L1 review (catches defects after the fact),
   L2 enforcement hooks (blocks during execution), L3 intent
   contracts (prevents defect classes before code exists). Claim:
   L1 "review treadmills" turn humans into QA for the robot; real
   leverage is in L3.
3. **gstack** (github.com/garrytan/gstack): 23 role skills, sprint
   order Think→Plan→Build→Review→Test→Ship→Reflect, /office-hours
   (product interrogation), /autoplan (review pipeline),
   /review (auto-fix), /cso (OWASP+STRIDE), /ship.

## SDDRA position

- SDDRA is a **Layer-3 system**: `.sdd/` files are intent contracts
  (specs, rules R1-R106, chains) that constrain what code can even
  be proposed. L2 exists as the hook-bridge (PreToolUse/PostToolUse
  runtime enforcement, `.sdd/runtime/adapter-runtime.sdd`).
- **DL1 delivery chain = gstack sprint equivalent**:
  BC→BR→BD→DS→TK→BDD→(BE/DB/API/FE/MD/DC parallel with CR/RF/TS/SC
  each)→AN→VR maps onto Think→Plan→Build→Review→Test→Ship; VR+commit
  discipline ([R95]) covers Reflect via registries (phases/tasks/
  decisions/context).
- **Human gates stay minimal** (irreversible decisions only —
  `workflow.yaml` escalation criteria), rejecting the L1
  review-treadmill: SDDRA does not adopt every-feature 4-section
  human review. The 4-pillar checklist runs inside CR-XX (AI
  scoped review), not as a human gate.

## Adopted (with spec locations)

| Adoption | Where | Evidence |
|----------|-------|----------|
| 4-pillar checklist | CR ReviewPillars in `workflow/stages.sdd` | architecture fit, DRY+duplication_findings, test quality, performance (N+1, I/O, memory) |
| Opinionated recommendations | CR OpinionatedRecommendations in `workflow/stages.sdd`; agent contract below | findings carry one recommended option + rationale |
| DRY aggressive flagging | [R100] + CR output `duplication_findings[]` | component registry checked at BD/DS; CR flags DRY |
| BIG/SMALL change mode | `commands/sdd-plan.sdd` | BIG = full 16-trace + phase registry review; SMALL = fast-path (`chains/fast-path.sdd`) |

## Rejected (with rationale)

| Rejection | Why |
|-----------|-----|
| Role-skill inflation (23 fixed role skills) | SDDRA already has `agent/roles.sdd` — roles are contracts, not duplicated skill packages; 23 canned roles would violate [SK13] granularity and [R81] link-over-copy |
| Every-feature 4-section human review | Rentier L1 review-treadmill; SDDRA human gates are escalation-only (irreversible decisions), per `workflow.yaml` |
| External image/repo dependencies (gstack git-clone into skills path) | Conflicts with marketplace/validator rules and [R92]/[R91] local-only discipline; imports go through marketplace provenance instead |

## Layer coverage map

| Layer | SDDRA mechanism | Status |
|-------|-----------------|--------|
| L3 intent contracts | `.sdd/` specs + rules + chains | core system |
| L2 enforcement hooks | hook-bridge PreToolUse/PostToolUse (`runtime/adapter-runtime.sdd`), health gates (/sdd-health drift/mojibake/purity checks) | active |
| L1 review | CR-XX scoped review with 4 pillars + RF-XX fix loop | scoped, non-treadmill |

## Conclusion

SDDRA was already a Layer-3 system; the three sources refine its L1
scope (4-pillar CR, opinionated findings) and its planning entry
(BIG/SMALL). Nothing structural was adopted — that is the point of
L3: prevent defect classes by contract, review only what contracts
cannot prevent.
