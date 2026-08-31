# API Token Management & Usage

This document describes how API tokens are obtained, stored, and used
in the SDD system — for both humans and AI agents.

## Overview

| Concept | Description |
|---------|-------------|
| **Attestation-bound tokens** | OIDC tokens cryptographically bound to TLS channel + TEE session |
| **claude-mem API** | REST endpoints for observation storage and recall |
| **PolicyAsCode** | Access control via Open Policy Agent (OPA) compiled to WebAssembly |
| **CryptoErasure** | Per-memory-unit Data Unit Keys (DUK → DEK → MEK hierarchy) |

## Token Acquisition (Top-to-Bottom)

### 1. Service Account (0->hero flow)

```
┌─────────────────┐
│   Human User    │
│  (Level 0 trust)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vault /         │
│  GitHub Secrets  │
│  (source of truth)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Token Broker   │
│  (attestation)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude-Code     │
│  Hook Bridge     │
│  .clauderc.json  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  claude-mem      │
│  Daemon          │
│  (per-user port: │
│   37700 + uid%100)│
└─────────────────┘
```

### 2. Attestation Flow

1. **Attestation request** → Token broker validates TLS channel + TEE session
2. **Token issuance** → Attestation-bound OIDC token generated
3. **Token injection** → Token injected into claude-code session context
4. **Context recall** → Token validated at recall via PolicyAsCode (OPA/Wasm)

## Where Tokens Are Stored

| Location | Token Type | Scope | Access |
|----------|------------|-------|--------|
| `.sdd/runtime/INDEX-INTEGRITY.sdd` | Runtime config | Global | AI agent (read) |
| `.clauderc.json` | Claude API | Project | Human + agent |
| `~/.claude-mem.db` | Memory observations | Per-user | claude-mem daemon |
| `CLAUDE_MEM_*` env vars | Daemon config | Runtime | Process |
| **Never in `.sdd/` content files** | Any | — | **Prohibited by AG8** |

## API Endpoints

### claude-mem Daemon

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/observations` | Store observation (sanitized) |
| GET | `/recall?query=...` | Retrieve relevant context |
| POST | `/migrate` | Run idempotent migration |
| GET | `/health` | Daemon health check |

**Default port**: `37700 + (uid % 100)`

**Config env vars**:
- `CLAUDE_MEM_TIER_ROUTING_ENABLED` (true/false)
- `CLAUDE_MEM_SANITIZATION_ENABLED` (true/false)
- `CLAUDE_MEM_MAX_RECALL_AGE` (default: 90 days)

## Security Controls

### For AI Agents

Per `.sdd/agent/policies.sdd` AG8:
> **Agent MUST NOT load secrets into context.**

Secrets are never stored in `.sdd/` files or in AI context. They are injected
at runtime via attestation-bound tokens.

### For Production Actions

Per `.sdd/security/levels.sdd`:
- **R3 (High)**: Production deployment requires approval
- **R4 (Critical)**: Secret rotation requires explicit approval
- **R5 (Destructive)**: Any data deletion requires explicit approval

## Trust Markers

Every observation carries trust markers per `.sdd/runtime/memory-model.sdd`:

| Marker | Values | Rule |
|--------|--------|------|
| trustLevel | `external-import`, `internal-verified`, `runtime-generated` | External API results are `provider_untrusted` until schema-validated |
| provenance | `script_confirmed`, `provider_untrusted`, `llm_asserted` | AI-generated content is `llm_asserted` |
| readiness | `fresh`, `stale`, `degraded`, `not-run`, `unknown` | Fail-safe on unavailable provider: mark `unknown`, emit OBS17 |

## Policy Enforcement

Access control is enforced at runtime via **PolicyAsCode** in `.sdd/runtime/memory-model.sdd`:

```yaml
policy_binding:
  engine: Open Policy Agent (OPA) compiled to WebAssembly
  rule: Policy changes invalidate attestation (cannot be silently modified)
  attestation: Attestation-bound OIDC tokens for secure access
  tamper_evidence: Audit logs cryptographically chained; head hash signed
    and anchored to immutable ledger (blockchain/transparency log)
```

## Crypto Erasure (GDPR Compliance)

Per `.sdd/runtime/memory-model.sdd` CryptoErasure section:

| Component | Role |
|-----------|------|
| **DUK** (Data Unit Key) | Unique per memory unit |
| **DEK** (Data Encryption Key) | Encrypts memory content |
| **MEK** (Master Encryption Key) | Root key |
| **TEE-protected key vault** | DUK storage |

**Deletion mechanism**: Destroy DUK to render encrypted data computationally
intractachable (no need to scrub storage).

## References

- [Runtime Memory Model](runtime.md) — Full 4-tier memory hierarchy
- [Execution Runtime](execution.md) — Execution state and recovery
- [Agent Policies](policies.md) — Risk levels and approval matrix
- [Security Controls](security.md) — Security levels and gates