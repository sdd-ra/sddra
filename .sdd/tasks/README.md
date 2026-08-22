# .sdd/tasks/

Generated only after a proposal (`.sdd/project/proposals/<ID>.md`) is
marked **APPROVE** by a human — never before (see `system/MASTER.md`).

Expected shape per task, e.g. `PAY-001.md`:

```
PAY-001 Implement Payment Module
├── PAY-001.1 Domain design
├── PAY-001.2 Database design
├── PAY-001.3 API contract
├── PAY-001.4 Implementation
├── PAY-001.5 Unit tests
├── PAY-001.6 Integration tests
├── PAY-001.7 Security review
├── PAY-001.8 Architecture review
└── PAY-001.9 Deployment verification
```

Each task/subtask also carries: Dependencies, Related cases, Acceptance
criteria, Validation criteria (per `prompt/new/4.md`).

Status: `!` empty — no proposal has been approved yet in this replay.
