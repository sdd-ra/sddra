---
name: sddra-languages
description: SDDRA language and framework intelligence map — 12 languages, 17 frameworks, layered L1-L5 competency skills. Routes into .sdd/skills/languages/ and .sdd/skills/frameworks/.
---

# SDDRA Languages & Frameworks

Source of truth: `.sdd/skills/languages/` and `.sdd/skills/frameworks/`
— this skill is the routing wrapper. Read the domain INDEX.sdd first.

## Languages (12)

cpp, csharp, go, java, javascript, kotlin, php, python, ruby, rust,
swift, typescript — each with layered skills L1 (fundamentals) to
L5 (architecture) per `.sdd/skills/languages/INDEX.sdd` read order.

## Frameworks (17)

angular, django, dotnet, express, fastapi, flutter,
kotlin-multiplatform, laravel, nestjs, nextjs, react, react-native,
spring-boot, svelte, swiftui, symfony, vue — plus
`frontend/react-best-practices` rules pack.

## Also routed from here

- Databases: postgresql, mongodb, redis, mysql, cassandra, elasticsearch
- Platforms: docker, kubernetes, aws, gcp, azure, terraform
- Messaging: kafka, rabbitmq, nats
- DevOps: git, ci-cd, security, testing, vercel-optimize
- Cross-cutting: testing, security, architecture, observability

## How to use

1. Identify the technology domain of the task.
2. Read that domain's INDEX.sdd (read order is defined there).
3. Apply the layered skill at the right competency level (L1-L5).
4. Follow [SK6] lifecycle — never modify skills directly.
5. Testing skills: see `.sdd/testing/` and the run.ps1 categories
   (knowledge, runtime, workflow, tasks, crossref, phase5).

## Rules that always apply

[SPO]: Docker-only execution [R59-R66], locally built images [R91],
var/ mounts [R92]. Language toolchains run in the sdd-sandbox, never
on the host.
