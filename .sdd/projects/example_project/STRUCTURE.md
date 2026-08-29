# example_project — Project Structure

Purpose:
  Detailed description of the example_project codebase structure.
  Used by AI to understand the project architecture, layers,
  and where to implement new features.

## Architecture Overview

<to be filled: describe the overall architecture>

## Directory Breakdown

### src/
Source code root.

#### auth/
Authentication and authorization logic.
- login.ts
- register.ts
- middleware.ts

#### api/
API endpoints and controllers.
- users.ts
- cards.ts
- health.ts

#### core/
Core business logic.
- services/
- models/
- utils/

#### database/
Database layer.
- migrations/
- seeds/
- connection.ts

### tests/
Test suites.
- unit/
- integration/
- e2e/

### docs/
Human-readable documentation.

## Layer Assignment

| Layer | Description | Status |
|-------|-------------|--------|
| L0 | MVP Core | COMPLETED |
| L1 | Customer Features | IN_PROGRESS |
| L2 | Enhancements | PENDING |
| L3 | Scalability | PENDING |
| L4 | Innovation | FUTURE |

## Feature Locations

<to be filled: map features to directories>

## Dependencies

<to be filled: key dependencies and their purposes>

## Conventions

<to be filled: coding standards, naming conventions, etc.>

## Notes

This structure document is updated as the project evolves.
AI uses this to determine where new code should be placed
and how it should integrate with existing code.

State: +
