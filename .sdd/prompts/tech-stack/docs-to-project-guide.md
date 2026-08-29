# Docs to Project Converter

This file shows the AI how to create .sdd/project/ from approved docs/.

## Input: Approved docs/

Approved documents:
- `docs/00-about/project.md`
- `docs/20-architecture/overview.md`
- `docs/30-backend/overview.md`
- `docs/40-frontend/overview.md`
- `docs/60-database/overview.md`
- `docs/70-api/overview.md`
- `docs/100-devops/overview.md`
- `docs/110-infrastructure/overview.md`

## Processing Steps

### 1. Docs Parsing
Each document is read and extracted:
- **Tech stack:** Go, React, PostgreSQL, AWS
- **Architecture:** Modular Monolith
- **Domains:** auth, users, courses, video, payments, search
- **Scale:** 20K → 1M users
- **Decisions:** Domain-local decisions

### 2. Skill Resolution
Technologies are mapped to .sdd/skills/:
- `go` → `languages/go/L2-patterns`
- `gin` → `frameworks/gin/L2-patterns`
- `react` → `frameworks/react/L2-patterns`
- `postgresql` → `databases/postgresql/L2-patterns`
- `docker` → `platforms/docker/L2-patterns`
- `aws` → `platforms/aws/L2-patterns`

### 3. .sdd/project/ Generation

#### PROJECT.sdd
```
Spec: Project

TechStack:
  Backend: go 1.24, gin
  Frontend: react 18, typescript
  Database: postgresql 16
  Infrastructure: docker, aws

Scale:
  Current: 20,000 users
  Target: 1,000,000 users
  Growth: 50x in 24 months

Architecture:
  Style: modular_monolith
  Domains: auth, users, courses, video, payments, search
```

#### domains.sdd
```
Domains:
  - id: auth
    purpose: Authentication and authorization
    owns: login, logout, jwt, password-reset
    depends_on: users

  - id: users
    purpose: User management (teachers, students, admins)
    owns: profile, roles, permissions
    depends_on: auth

  - id: courses
    purpose: Course and lesson management
    owns: courses, lessons, enrollments
    depends_on: users

  - id: video
    purpose: Video conferencing and streaming
    owns: sessions, recordings, chat
    depends_on: courses, users

  - id: payments
    purpose: Payment processing
    owns: subscriptions, invoices, webhooks
    depends_on: users, courses

  - id: search
    purpose: AI-powered content search
    owns: indexing, search-api, recommendations
    depends_on: courses, video
```

#### stack/backend.sdd
```
Stack: Backend

Language: go 1.24+
Framework: gin
Architecture: clean-architecture + ddd

Layers:
  - domain/      # Entities, value objects, aggregates
  - usecase/     # Application business rules
  - infrastructure/ # DB, cache, message broker
  - presentation/  # HTTP handlers, gRPC

Skills:
  - languages/go/L2-patterns
  - frameworks/gin/L2-patterns
  - databases/postgresql/L2-patterns
```

#### tasks/
Generated tasks from domains:
- TASK-001: auth domain setup
- TASK-002: users domain setup
- TASK-003: courses domain setup
- TASK-004: video integration
- TASK-005: payments integration
- TASK-006: search integration
- TASK-007: API documentation
- TASK-008: Testing setup
- TASK-009: CI/CD pipeline
- TASK-010: Deployment

## Output

AI creates:
- `.sdd/project/PROJECT.sdd`
- `.sdd/project/domains.sdd`
- `.sdd/project/modules.sdd`
- `.sdd/project/flows.sdd`
- `.sdd/projects/vkard.az/stack/*.sdd`
- `.sdd/projects/vkard.az/tasks/*.sdd`
- `.sdd/projects/vkard.az/decisions/*.sdd`

## Human Gate

Then human:
1. Read `.sdd/project/`
2. Check tasks
3. Approve decisions
4. Say "Start execution"

Then AI executes tasks.
