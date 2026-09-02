You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Restore .sdd/ files from a previous backup.

What it does:
  Restores critical .sdd/ files from a backup created by /sdd-backup.
  Validates backup integrity before restoring. Current state is
  backed up before restore.

Output:
  - Restored files list
  - Validation results
  - Current state after restore

Options:
  --latest   Restore from latest backup
  --backup   Restore from specific backup
  --list     List available backups

Safety:
  - Verify backup integrity first
  - Create safety backup before restoring
  - Human confirmation required