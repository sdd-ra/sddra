# D1: .specdd/ Setup Documentation

Generated: 2026-09-18T12:00:34Z
Source: R112 ([PROJECT.sdd](#specdd)), user prompt (Azerbaijani)

---

## 1. .specdd/ Directory Specification

Per [R112](file:///D:/Tasks/ai_code/sddra.ai/.sdd/PROJECT.sdd) and PROJECT.sdd `specdd` directory declaration:

| Property | Value |
|----------|-------|
| **Location** | `.sdd/projects/sddra/.specdd/` |
| **Scope** | Per-project runtime artifacts |
| **Rule** | MUST NOT exist at repo root or `.sdd/` level |
| **Rule** | All artifacts are runtime-only (not immutable `.sdd/` specs) |

### Required Artifacts

| File/Dir | Purpose | Status |
|----------|---------|--------|
| `flow-index.md` | CASE dependency tree (depends-on, related) for `/sdd next` navigation | **TO CREATE** |
| `fix-index.sdd` | Local fix-lookup table — AI checks before web search | **TO CREATE** |
| `dependency-ledger.md` | Security and dependency monitoring log | **TO CREATE** |
| `task-context/` | Per-task context artifacts from execution | **TO CREATE** |
| `state/current.sdd` | Current runtime state | **TO CREATE** |

## 2. Text References to Fix

These files reference `.specdd/` and need accuracy review:

| File | Line(s) | Issue | Action |
|------|---------|-------|--------|
| `.sdd/README.md` | 74, 127-141, 455-456 | Lists `.specdd/` as runtime artifacts — verify location accuracy | UPDATE |
| `.sdd/docs/analysis/system-analysis.md` | 72 | References `.specdd/task-context/` in execution trace | VERIFY |

## 3. Content Move Plan (sequential)

When `.specdd/` is populated with runtime artifacts, move contents to appropriate destinations in this order:

1. **flow-index.md** → consumed by `/sdd next` (runtime, stays in .specdd/)
2. **fix-index.sdd** → referenced by C1 fix routines (runtime, stays in .specdd/)
3. **dependency-ledger.md** → referenced by security scan (runtime, stays in .specdd/)
4. **task-context/** → consolidated into `.sdd/tasks/` per task lifecycle (move after task completion)
5. **state/current.sdd** → persisted to `.sdd/runtime/` after consolidation (move on schedule)

**Note**: All artifacts remain in `.specdd/` during active runtime. Moves happen only at lifecycle boundaries (task completion, session end, consolidation gate).

## 4. Immediate Actions

| # | Action | Step |
|---|--------|------|
| 1 | Create `.sdd/projects/sddra/.specdd/` directory | C1 ✅ |
| 2 | Create stub files: flow-index.md, fix-index.sdd, dependency-ledger.md, task-context/, state/current.sdd | C1 ✅ |
| 3 | Fix text references in `.sdd/README.md` | C1 ✅ |
| 4 | Verify `.sdd/docs/analysis/system-analysis.md` reference | C1 ✅ |
| 5 | Human approval gate before C1 execution | **DONE** |

## 5. Next Step

**DEP1 (Deploy)**: Commit and push chain results — .specdd/ artifacts, reference fixes, R104 logs.
