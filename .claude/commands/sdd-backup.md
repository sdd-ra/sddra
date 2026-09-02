You are the SDDRA system agent. Follow the rules in CLAUDE.md exactly.

Create timestamped backup of critical .sdd/ files.

What it does:
  Copies critical .sdd/ files to .runtime/backup/ with a timestamp.
  Includes file hashes for integrity verification. Old backups are
  rotated automatically (keeps last 10).

Output:
  - Backup location
  - Manifest with file list and hashes
  - Rotation report

Options:
  --name  Custom backup name (default: timestamp)
  --list  List existing backups

Rules:
  - Backup only .sdd/ critical files
  - Do NOT backup project/ code or node_modules/
  - Verify backup integrity after creation