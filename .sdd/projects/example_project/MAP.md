# example_project — Project Map

Purpose:
  AI representation of the example_project codebase.
  This file maps the real project structure so AI can understand
  where code lives, what it does, and how components relate.

IMPORTANT:
  The source code does NOT live inside .sdd/.
  The actual project is located at:

  ../../../../example_project/

  Every file reference in this directory points to a real file
  inside the source project.

## Source → AI Mapping

Real Project Root: `D:\Tasks\ai_code\example_project\`

### Directory Structure

```
example_project/
├── src/
│   ├── auth/
│   ├── api/
│   ├── core/
│   ├── database/
│   └── main.ts
├── public/
├── tests/
├── docs/
├── package.json
├── tsconfig.json
└── README.md
```

### File Reference Format

Each file in the project can be represented as:

# src/auth/login.ts

Real file:
`../../../../example_project/src/auth/login.ts`

Purpose:
<description>

Exports:
- <export1>
- <export2>

Dependencies:
- <dependency1>

Used by:
- <file1>
- <file2>

Layer:
- L0/L1/L2/L3/L4

Status:
- DONE/IN_PROGRESS/PENDING

### Navigation

- Project Root: `../../../../example_project/`
- Source Files: `src/`
- Tests: `tests/`
- Documentation: `docs/`
- Configuration: root-level config files

## Feature Context

Current Layer: L1 (Customer Features)
MVP Status: COMPLETED
Next Features: <to be filled based on customer requests>

Notes:
  This map is updated as the project evolves.
  AI uses this to understand the codebase before making changes.

State: +
