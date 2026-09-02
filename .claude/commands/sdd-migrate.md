You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Run pending migrations after .sdd/ schema updates.

What it does:
  Executes pending migrations for the active project instance.
  Migrations are applied in order and tracked in migrations/ state.
  Run this after any .sdd/ update that changes file locations,
  schemas, or project structure.

Output:
  - Applied migrations
  - Skipped migrations (already applied)
  - Failed migrations (if any)
  - Validation results

Options:
  --list      List pending and applied migrations
  --apply     Apply specific migration by ID
  --rollback  Rollback specific migration by ID

Rules:
  - Migrations MUST be applied in numerical order
  - Failed migrations halt the pipeline
  - Migrations MUST be idempotent
  - Validate after each migration