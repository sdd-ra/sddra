# Why SDDRA Exists

## The problem

AI coding agents ship plausible code fast — for goals nobody wrote
down. The industry's reflex answer is more review: AI reviews AI, a
human reviews the robot, a second robot reviews the first. That
creates a treadmill where the human becomes QA for the machine, and
the defects keep coming because nothing prevents them at the source.

## The three layers

Any AI-assurance system falls into one of three layers:

1. **L1 — Review**: catch defects after the fact. Necessary, but
   the treadmill lives here; it scales with output volume.
2. **L2 — Enforcement**: block defects during execution (hooks,
   sandboxes, linters). Better: cost is per-mechanism, not per-output.
3. **L3 — Intent contracts**: prevent defect *classes* before code
   exists. The goal is stated as a machine-checkable contract; whole
   categories of failure become inexpressible.

SDDRA is an L3 system. `.sdd/` files are the contracts: rules
R1-R106, chain graphs, gates, typed outcomes. Reviews still happen
(CR-XX, 4 pillars) — but they are scoped, not the foundation.

## What SDDRA stands on

- **Spec-first**: a change is legal only as spec → docs → code
- **Human gates, minimal**: approve the irreversible; automate the
  reversible. Judgment is spent where it cannot be replaced
- **State over memory**: registries, not chat threads; resuming is
  reading, not remembering
- **Opinionated machines**: findings carry one recommendation with
  rationale; the agent accepts being overruled instead of delegating
  judgment back with neutral option lists
- **Sandboxed by default**: every build, lint, and test runs inside
  a locked, resource-limited, network-isolated container
- **Human authorship**: commits belong to people; no AI signatures
  in the history

## Sharing is beautiful

SDDRA is open-sourced in that spirit: solo builders get an operating
system for their agent; teams get reviewable intent; maintainers get
governance that scales past chat. Take the specs, break them, send
back better ones — through the same gates the project itself uses.

## Who it is for

- **Solo builders** who want their agent to keep working the way they
  decided last month, not the way it feels today
- **Teams** who need AI output to be reviewable at the intent level
- **OSS maintainers** who want contribution governance that is a
  process, not a document
