# Agent-Reach Round 2 — Analysis (2026-09-14)

Status: ANALYSIS COMPLETE — pros/cons below; adoption decisions follow
Source: https://github.com/Panniantong/Agent-Reach (MIT; 375 commits;
80.6k stars at analysis time; prior round analyzed v1.5.0 2026-09-10 —
Phase 150, see .sdd/projects/sddra/tmp-analysis.sdd §10)
Method: [RS1] research protocol — read current README/docs, diff vs
prior round + vs our adopted rules [IR-01..10], [SEC-09..13],
[RS1-11], Pareto-decide.

## What changed since v1.5.0 (Round 1)

The core model is unchanged (capability layer: select/install/
health-check/route, no wrapper — already validated as kinship [IR-10]).
New/emphasized surfaces:

1. **One-liner agent-mediated install/update** — "帮我安装 Agent
   Reach：<raw install.md URL>" — the user hands the AGENT a URL, the
   agent reads the doc and performs the install. Update is the same
   shape. No scripts downloaded blindly; the doc IS the instruction.
2. **Default-safe install (3-level authorization)** — `install`
   checks only by default; `--system` mutates; `--dry-run` previews.
   Skills registration is opt-in per directory, never silent.
3. **Uninstall symmetry** — `uninstall --dry-run` (preview only),
   `--keep-config` (skills removed, tokens kept for reinstall), full
   (wipes ~/.agent-reach incl. credentials).
4. **Doctor prescriptions** — per-channel failure output includes a
   HOW-TO-FIX hint, not just a status.
5. **Tier-grouped health** — doctor output groups channels by tier
   (zero-config / needs-login / complex), matching [IR-08].
6. **Menu-gated channel activation** — default activates only
   zero-config channels; login-backed channels are listed and
   installed only on explicit user pick.

## Pros and cons (vs SDDRA)

| # | Agent-Reach pattern | Pros for us | Cons / conflicts |
|---|--------------------|-------------|------------------|
| P1 | One-liner agent-mediated install doc | Zero-script bootstrap: user pastes one sentence; agent reads install.md and acts; auditable (doc is versioned in repo) | Our install doc is manual-command oriented; adopting means restructuring docs/getting-started/install.md to be agent-executable first |
| P2 | Default-safe authorization levels (check → --dry-run → --system) | Maps 1:1 to [R131] authority levels and L2 enforcement; "no mutation without explicit grant" is our deny-by-default | None structural; we already deny-by-default in sandbox — but our docs don't express the 3-level ladder explicitly |
| P3 | Uninstall symmetry (dry-run / keep-config / full) | Clean reversibility story; matches our uninstall section (already documents paths) — we lack dry-run preview semantics | Minor: uninstall docs only; no tooling to dry-run |
| P4 | Doctor prescriptions (fix hint per failure) | /sdd-health currently reports findings without remediation; prescriptions would add the "recommended option + rationale" (OpinionatedOutput!) | Slightly bigger health output; must keep token-efficient ([SK1]) |
| P5 | Tier-grouped health output | Already adopted as [IR-08]; consistency confirmed — no change | — |
| P6 | Menu-gated activation (login-backed channels only on explicit pick) | Matches credential discipline [SEC-09..13]; "agent lists options, user picks" = human-gate pattern | Only relevant if SDDRA grows external channels; today scope is our own toolchain |

## Kinship (re-validated, no change)

- Capability-layer philosophy = spec-first routing ([IR-10])
- Ordered backends + real probing + switch-by-reorder ([IR-01..03],
  ProbeSemantics) — unchanged upstream, our rules still mirror it
- Credential local-only / no-login-for-user / env-only injection
  ([SEC-09..13]) — upstream strengthened (cookie disclosure notes,
  dedicated low-value accounts) — we already encode both

## Adoption decisions (Pareto)

**ADOPT:**
- A1 (from P1): install.md becomes agent-executable — add a
  "paste this to your agent" one-liner at the top with the raw URL
  of our install doc; commands stay (agent executes them, not a
  downloaded script).
- A2 (from P2): express the authorization ladder explicitly in
  install.md (check → dry-run → apply) for the sandbox build steps
  where applicable; reference [R131] authority levels.
- A3 (from P4): /sdd-health findings gain a prescription line
  (one-sentence fix hint) — spec edit in commands/sdd-health.sdd;
  consistent with OpinionatedOutput.

**NOT ADOPTED (rationale):**
- P3 uninstall dry-run tooling: uninstall is delete-directory for all
  our paths (documented); preview adds tooling without a felt pain.
- P6 menu-gated channel activation: no external channel surface in
  SDDRA core today (capability-layer scope stays with the agent's
  own tooling, [IR-10]); revisit if channels land.
- Upstream channel selections (bili-cli, OpenCLI etc.): user-machine
  capability, not SDDRA core — unchanged from Round 1.

## Net position

Agent-Reach Round 2 confirms the Round 1 adoption surface is stable
and adds 3 small adoptions (A1-A3) — all documentation/UX-level,
zero architecture change. This is what a healthy pattern-borrowing
relationship looks like: their ops UX maturity, our governance frame.
