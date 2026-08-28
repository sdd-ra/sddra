# AGENT README — SDDRA System

## Purpose
Bu fayl AI agent-lərə `.sdd` sisteminin necə işlədiyini və onunla necə işləməli olduqlarını izah edir. Hər hansı işdən əvvəl bunu oxu.

## Core Concept
```
.sdd/           ← Cases, templates, chains (brain)
project/        ← Real implementation (body)
```

`.sdd` sadəcə documentation deyil. O, **Engineering Intelligence Layer**-dir:
- Layihənin nə olduğunu başa düşür
- İşin necə görülməli olduğunu bilir
- İşin harada getməli olduğunu bilir
- Nənin nədən asılı olduğunu bilir
- Bütün artifact-lərin vəziyyətini izləyir

## Directory Structure
```
.sdd/
├── INDEX.sdd           ← Ana giriş nöqtəsi, read order
├── PROJECT.sdd         ← Root router
├── cases/              ← Nə edilməlidir? (WHAT)
├── templates/          ← Necə edilməlidir? (HOW)
├── chains/             ← Hansı ardıcıllıqla? (WHEN/ORDER)
├── skills/             ← Engineering qaydaları (HOW)
│   ├── languages/      ← Dillər (Go, Java, Python, TS, JS) — L1-L5 layihələr
│   ├── frameworks/     ← Framework-lər (React, Spring Boot, Django, etc.)
│   ├── databases/      ← Verilənlər bazası (PostgreSQL, MongoDB, Redis)
│   ├── platforms/      ← Platformalar (Docker, K8s, AWS, Terraform)
│   └── cross-cutting/  ← Üzərindən keçən Concerns (testing, security, arch, observability)
├── prompts/            ← Prompt intelligence
├── tasks/              ← Task state
├── decisions/          ← İnsan qərarları
├── state/              ← State symbols
├── architecture/       ← .sdd arxitekturası
├── security/           ← Security layer
└── observability/      ← Observability layer

project/
├── backend/            ← Backend implementation
├── frontend/           ← Frontend implementation
├── mobile/             ← Mobile implementation
├── qa/                 ← QA implementation
├── devops/             ← DevOps implementation
└── ...
```

## Agent Workflow — 5 Addım

### Addım 1: INDEX.sdd Oxu
Hər işdən əvvəl `.sdd/INDEX.sdd` oxu. O sənə deyir:
- Hansı faylları oxumaq lazımdır
- Hansı sıra ilə oxumaq lazımdır
- Hansı qaydalara əməl etmək lazımdır

### Addım 2: Case Oxu / Analiz Et
İş tapşırığı gəldi:
1. `.sdd/cases/`-də uyğun case-i tap
2. Case-i oxu:
   - `id` və `type`
   - `purpose` — nə üçün edilir?
   - `depends_on` — hansılardan asılıdır?
   - `produces` — nə istehsal edir?
   - `chain` — hansı zincir ilə?
   - `template` — hansı template ilə?
   - `stages` — hazırki vəziyyət

### Addım 3: Chain və Template Yüklə
1. `.sdd/chains/<chain>.sdd` oxu — hansı mərhələlərdən keçəcəyini öyrən
2. `.sdd/templates/<template>.sdd` oxu — hər mərhələdə necə işləməli olduğunu öyrən
3. `.sdd/skills/`-dən lazımi skill-ləri yüklə (dil və framework əsasında)
   - Dil üzrə: `languages/go/`, `languages/java/`, `languages/python/`, `languages/typescript/`, `languages/javascript/`
   - Framework üzrə: `frameworks/react/`, `frameworks/spring-boot/`, `frameworks/django/`, `frameworks/fastapi/`
   - Verilənlər bazası: `databases/postgresql/`, `databases/mongodb/`, `databases/redis/`, `databases/mysql/`
   - Platforma: `platforms/docker/`, `platforms/kubernetes/`, `platforms/aws/`, `platforms/terraform/`
   - Üzərindən keçən: `cross-cutting/testing/`, `cross-cutting/security/`, `cross-cutting/architecture/`, `cross-cutting/observability/`

### Addım 4: Zinciri İcra Et
```
AN → AR → DB → BE → API → FE → MD → QA → DO → VR
```

Qaydalar:
- Mərhələləri atlama — YOX
- Chain-i pozma — YOX
- Hər mərhələdən sonra `.sdd` state-i yenilə
- Uyğun skill-ləri yüklə
- Output-ları doğru yerlə saxla

### Addım 5: State Yenilə
Hər mərhələ bitdikdən sonra:
1. Case faylındakı `stages`-i yenilə: `AN: ~` → `AN: +`
2. `decisions/`-ə lazım gələrsə qərar yaz
3. `tasks/`-i yenilə

## Key Rules

### [R1] Resolve Before Search
`.sdd` reference-ləri həll et, sonra source code axtar.

### [R2] Lazy Loading
Yalnız lazım olan skill-ləri yüklə. Hamısını yükləma.

### [R3] Update State
Hər mərhələdən sonra `.sdd` state-i yenilə.

### [R4] No Secrets in .sdd
`.sdd` fayllarına secret daxil etmə. Yalnız reference ver.

### [R5] Code is Truth
`.sdd` kodu təsvir edir. Kod həqiqəti həyata keçirir.

### [R6] Ask for Approval
Arxitektura dəyişiklikləri insan təsdiqi tələb edir.

## State Symbols
```
+ = done
~ = active
- = failed
! = blocked
? = decision required
> = next
@ = reference
[x] = completed
[ ] = pending
```

## Execution Chain
```
AN  → Analyze        (təhlil)
AR  → Architecture   ( Arxitektura qərarı)
DB  → Database       (DB schema)
BE  → Backend        (Backend kodu)
API → API            (API kontraktları)
FE  → Frontend       (Frontend kodu)
MD  → Mobile         (Mobile kodu)
QA  → Quality Assurance (Test)
DO  → DevOps         (Infrastructure)
VR  → Verify         (Final yoxlama)
```

## Conditional Stages
```
DB?  → database-impact varsa
API? → api-impact varsa
FE?  → frontend-impact varsa
MD?  → mobile-impact varsa
DO?  → deploy varsa
```

## Example: Payment Integration

1. **Case oxu**: `.sdd/cases/payment-integration.sdd`
   - `state: ~` (active)
   - `chain: default`
   - `template: modular-feature`

2. **Chain oxu**: `.sdd/chains/feature.sdd`
   - Sequence: AN > AR > DB > BE > API > FE > MD > QA > DO > VR

3. **Template oxu**: `.sdd/templates/modular-feature.sdd`
   - Hər mərhələdə necə işləməli

4. **İcra et**:
   - AN: Analyze → `analysis.md` yaz
   - AR: Architecture → `architecture.md` yaz
   - DB: Database → `database.md`, migrations/ yarat
   - BE: Backend → `backend/`, `tests/` yarat
   - ...

5. **State yenilə**:
   - `payment-integration.sdd`: `AN: ~` → `AN: +`
   - Hər mərhələdən sonra eyni

## Intelligent Cases

### Payment Integration
- **ID**: PAYMENT-INTEGRATION
- **Type**: feature
- **Status**: ACTIVE
- **Tech Stack**: Go (L2), PostgreSQL (L2), React (L2), BDD testing
- **Chain**: default
- **Approval**: No architectural changes

### Microservices Migration
- **ID**: MICROSERVICES-MIGRATION
- **Type**: refactor
- **Status**: DRAFT
- **Tech Stack**: Go (L3-L4), TypeScript (L3-L4), Spring Boot, Kafka, Kubernetes
- **Chain**: refactor
- **Approval**: Required (service decomposition, data migration)

### Real-Time Analytics Platform
- **ID**: REAL-TIME-ANALYTICS
- **Type**: feature
- **Status**: DRAFT
- **Tech Stack**: Rust (L4), Python (L3-L5), TypeScript (L3), Kafka, ClickHouse
- **Chain**: feature
- **Approval**: Required (analytics engine, real-time transport)

### Mobile Banking App
- **ID**: MOBILE-BANKING-APP
- **Type**: feature
- **Status**: DRAFT
- **Tech Stack**: Kotlin (L1-L2), Swift (L1-L2), TypeScript (L3), KMP
- **Chain**: feature
- **Approval**: Required (cross-platform strategy, auth method)

### E-Commerce Platform
- **ID**: E-COMMERCE-PLATFORM
- **Type**: feature
- **Status**: DRAFT
- **Tech Stack**: Go (L3-L4), Java (L3-L4), TypeScript (L3-L4), Kafka, Elasticsearch
- **Chain**: feature
- **Approval**: Required (catalog DB, frontend arch, mobile strategy)

## Initial Launch Workflow

### First Time Setup
1. `.sdd/INDEX.sdd` oxu
2. `.sdd/PROJECT.sdd` oxu
3. `.sdd/cases/`-də case-lər var?
   - Yoxsa: İlk case-i yarat
   - Bəli: Hansı active?
4. `.sdd/chains/`-də chain-lər var?
   - Yoxsa: Default chain yarat
5. `.sdd/templates/`-də template-lər var?
   - Yoxsa: Default template yarat
6. `.sdd/skills/`-də skill-lər var?
   - Yoxsa: Default skill-lər yarat
7. `project/` qovluğu var?
   - Yoxsa: `.sdd`-dən törət
   - Bəli: `.sdd` ilə sync ol

### First Case Execution
1. Case seç: `.sdd/cases/<case-id>.sdd`
2. Chain təyin et: `chain: default`
3. Template təyin et: `template: modular-feature`
4. İlk mərhələni başlat: `AN`
5. `.sdd/skills/analyzers/requirements-analysis` yüklə
6. Analiz et, output yaz
7. State yenilə: `AN: +`
8. Növbəti mərhələyə keç: `AR`

## Do NOT
- `.sdd/`-i whole scan etmə — direkt reference izlə
- Chain-i pozma
- Mərhələləri atlama
- Arxitektura dəyişikliyi təsdiqsiz etmə
- `.sdd`-ə secret daxil etmə
- `.sdd` state-siz işləmə

## When Stuck
1. `.sdd/INDEX.sdd`-i yenidən oxu
2. `.sdd/decisions/`-də oxşar qərarları tap
3. `.sdd/tasks/`-də oxşar işləri tap
4. İnsan tərəfindən təsdiq istə

## Navigation Shortcuts
```
Start:     .sdd/INDEX.sdd
Case:      .sdd/cases/<id>.sdd
Chain:     .sdd/chains/<chain>.sdd
Template:  .sdd/templates/<template>.sdd
Skills:    .sdd/skills/
Project:   project/
```
