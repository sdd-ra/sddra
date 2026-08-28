# Prompt: Add User Authentication

Purpose:
  Example prompt for adding user authentication to an existing system.

Source:
  User request

Context:
  This is an example prompt demonstrating a feature addition.

Prompt:
  "Add JWT-based user authentication to the existing API.
   Requirements:
   - Login endpoint with email/password
   - JWT token generation and validation
   - Protected route middleware
   - Token refresh mechanism
   - Password reset flow"

Expected Skills:
  - SKILL-SECURITY-AUTH-L2 (first skill)
  - SKILL-BE-AUTH-L3
  - SKILL-DB-USER-L2

Expected Decisions:
  - DEC-200: Use JWT with short expiry + refresh tokens
  - DEC-201: Store passwords with bcrypt
  - DEC-202: Use Redis for token blacklist

Expected Tasks:
  - TASK-301: Design auth schema
  - TASK-302: Implement login endpoint
  - TASK-303: Implement JWT middleware
  - TASK-304: Add password reset flow

Status: example

State: +
