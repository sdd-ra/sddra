# BDD Scenarios

Human-readable BDD uses Given / When / Then.

## Duplicate refund

**Given** a transaction has already been refunded

**When** the same refund request is submitted again

**Then** the refund must not be processed twice

Compact SDD may use `G`, `W`, `T` after protocol resolution.
