# Prompt Engine — From Simple Prompt to Docs

This file shows the AI how to create docs/ from a simple English prompt.

## Input Format

```markdown
Build an education platform for schools.

Requirements:
- Teachers and students can video conference
- Course materials can be uploaded (video, document)
- AI-powered search should be included
- Payment system should be included (Stripe)

Users:
- Teacher (creates courses, uploads videos)
- Student (joins courses, makes payments)
- Admin (system management)

Scale:
- First 10 months: 20,000 users
- 2 years: 1,000,000 users

Server load will be high, so choose infrastructure accordingly.
```

## Processing Steps

### 1. Prompt Analysis
AI reads the prompt and extracts:
- **System type:** Education platform
- **Users:** Teacher, student, admin
- **Features:** Video, search, payment
- **Scale:** 20K → 1M
- **Difficulty:** Server load

### 2. Technology Selection
The best technology is chosen for each feature:

| Feature | Choice | Reason |
|------------|-------|--------|
| Backend | Go + Gin | High performance, simple deployment |
| Frontend | React + TS | Large ecosystem, typing |
| Database | PostgreSQL | ACID, JSONB, robust |
| Video | WebRTC + mediasoup | P2P + SFU, high quality |
| Payment | Stripe | Secure, simple integration |
| Hosting | AWS | High availability, global |

### 3. Architecture Design
```
┌─────────────────────────────────────┐
│           Load Balancer             │
│          (AWS ALB / Nginx)          │
└─────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Backend │ │ Backend │ │ Backend │
   │ (Go)    │ │ (Go)    │ │ (Go)    │
   └─────────┘ └─────────┘ └─────────┘
        │          │          │
        └──────────┼──────────┘
                   ▼
          ┌────────────────┐
          │   PostgreSQL   │
          │   (Primary +   │
          │   Replicas)    │
          └────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Redis  │ │  S3     │ │  CDN    │
   │ Cache   │ │  Media  │ │  Cloud  │
   └─────────┘ └─────────┘ └─────────┘
```

### 4. Domain Structure
```
├── auth/           — Login, registration, JWT
├── users/          — Teacher, student, admin
├── courses/        — Courses, modules, textbooks
├── video/          — Video conferencing, upload
├── payments/       — Stripe integration
├── search/         — AI-powered search (Meilisearch)
├── notifications/  — Email, push notifications
└── admin/          — Admin panel
```

### 5. Risk Analysis
| Risk | Probability | Impact | Solution |
|------|---------|-------|------|
| Video load | High | Medium | CDN + caching |
| Payment downtime | Medium | High | Stripe webhook + retry |
| DB bottleneck | High | High | Read replicas + cache |
| DDoS | Medium | Medium | AWS Shield + rate limit |

## Output

AI creates:
- `docs/00-about/project.md` — about the system
- `docs/20-architecture/overview.md` — architecture decision
- `docs/30-backend/overview.md` — backend technology
- `docs/40-frontend/overview.md` — frontend technology
- `docs/60-database/overview.md` — DB structure
- `docs/70-api/overview.md` — API contracts
- `docs/100-devops/overview.md` — deployment
- `docs/110-infrastructure/overview.md` — server setup

## Next Step

You (human):
1. Read docs/
2. Check decisions
3. Make corrections (if needed)
4. Say "I approve"

Then AI creates `.sdd/project/`.
