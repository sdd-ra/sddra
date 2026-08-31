# SDD Adapter

Runtime adapter that bridges `.sdd` specifications to claude-code hooks.

## Components

- **hook-bridge.ts** — Translates `.sdd` gate decisions into claude-code hook exit codes
- **spec-loader.ts** — Parses and validates `.sdd` specs at runtime
- **memory-bridge.ts** — Minimal stub for claude-mem integration (Phase 2)
- **security/patterns-runtime.ts** — Executes 17 regex security patterns from `.sdd/security/controls.sdd`
- **security/commit-gate.ts** — Pre-commit security enforcement

## Usage

```bash
# Run hook bridge (reads hook JSON from stdin)
npx ts-node hook-bridge.ts < hook-payload.json

# Run tests
npm test
```

## Hook Binding

Wire into `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx ts-node sdd-adapter/hook-bridge.ts"
          }
        ]
      }
    ]
  }
}
```

## Design

- Zero runtime dependencies beyond Node.js built-ins
- Fail-open in observe mode; fail-closed in enforce mode
- All gate decisions emit OBS1-20 observability events
