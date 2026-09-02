# SDDRA Documentation Index

Master table of contents for human-readable documentation.

## Categories

| Category | Description | Path |
|----------|-------------|------|
| Overview | ECC integration overview and architecture comparison | [overview/](overview/INDEX.md) |
| Agents | Agent system: roles, capabilities, policies, mappings | [agents/](agents/INDEX.md) |
| API | API token management and usage | [api/](api/INDEX.md) |
| Data | Raw data tables (TSV mappings) | [data/](data/INDEX.md) |

## Quick Links

- [Documentation System README](README.md)
- [SDDRA Overview](.sdd/docs/overview/sdd-overview.md)
- [SDDRA Commands Reference](.sdd/docs/commands/reference.md)

## Append Protocol

Each document contains append markers that guide AI to the correct insertion point.

```markdown
<!-- [APPEND:<SECTION_ID>] -->
<!-- Section: <Human-readable name> -->
<!-- Last updated: <date> -->
<!-- Append new content below this line -->

existing content here

<!-- [END:APPEND:<SECTION_ID>] -->
```

See [agents/overview.md](agents/overview.md) for an example.
