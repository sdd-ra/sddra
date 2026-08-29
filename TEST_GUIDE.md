# SDDRA — Test və Deploy Guide

## Məqsəd
SDDRA sistemini test etmək və Claude AI kimi başqa agent sistemləri ilə inteqrasiya etmək üçün praktik təlimat.

---

## 1. Sistem Arxitekturası

```
.sdd/
├── PROJECT.sdd              # Root giriş nöqtəsi
├── chains/                  # Chain graph
│   ├── graph.sdd           # D0 root + 6 arm
│   ├── arms/               # P1, D1, S1, C1, R1, DEP1
│   ├── rules/              # CR1-CR14 qanunlar
│   ├── tokens/             # Token izləmə
│   └── {chain}.sdd         # Feature, bugfix, hotfix, etc.
├── decisions/               # Qərar qeydi
│   ├── schema.sdd
│   ├── workflow.sdd
│   ├── rules.sdd
│   └── project/
│       ├── DEC-001.sdd ... DEC-007.sdd
│       └── task-map.sdd
├── project/                 # Layihə kontektı
│   ├── docs/                # İnsan dili (Azerbaijani)
│   │   ├── 00-about/
│   │   ├── 20-architecture/
│   │   ├── 30-backend/
│   │   ├── 40-frontend/
│   │   ├── 60-database/
│   │   ├── 70-api/
│   │   ├── 100-devops/
│   │   └── 110-infrastructure/
│   ├── sdd/                 # AI dili (machine-readable)
│   │   ├── PROJECT.sdd
│   │   ├── domains.sdd
│   │   ├── stack/*.sdd
│   │   └── tasks/*.sdd
│   ├── decisions/           # Təsdiq edilmiş qərarlar
│   ├── architecture/
│   └── INDEX.sdd
├── skills/                  # 158 texnologiya faylı
├── prompts/                 # Prompt engine
├── workflows/               # Task execution, recovery
└── state/                   # State symbols

project/                      # İnsan kodu (source of truth)
├── backend/
├── frontend/
├── database/
└── tests/
```

---

## 2. Chain Graph Test Scenario

### Test: Məktəblər platforması

**Input (sənin prompt-un):**
```
Məktəblər üçün təhsil platforması qur.
Video konfrans, ödəniş, AI axtarış olsun.
20K istifadəçi ilk 10 ay, 1M 2 il.
```

**Expected Flow:**
```
D0 (default)
  ├─> P1 (prompt) ──> D0
  ├─> D1 (docs) ────> D0
  ├─> S1 (sdd) ────> D0
  ├─> C1 (code) ────> D0
  ├─> R1 (review) ─> D0
  └─> DEP1 (deploy) -> D0
```

**Token Budget:**
```
P1:  5,000  (prompt analysis)
D1: 10,000  (docs generation)
S1: 15,000  (sdd generation)
C1: 40,000  (code execution)
R1:  5,000  (review)
DEP1: 5,000  (deploy)
Total: 70,000
```

**Human Gates:**
1. **Gate P1→D1**: Docs review — sən oxu, qərar al
2. **Gate D1→S1**: SDD review — sən .sdd/project/ oxu, təsdiq et
3. **Gate S1→C1**: Code review — sən kod oxu, təsdiq et
4. **Gate C1→DEP1**: Deploy approval — sən production təsdiq et

---

## 3. Claude AI ilə İnteqrasiya Test

### Test Proseduru

**Addım 1:** SDDRA strukturunu Claude-a təqdim et

```
Claude-a verilən kontekst:

.sdd/PROJECT.sdd — root giriş
.sdd/chains/graph.sdd — D0 root + 6 arm
.sdd/chains/arms/*.sdd — hər armın tərifi
.sdd/decisions/schema.sdd — qərar strukturu
.sdd/instances/{project_name}/docs/00-about/project.md — insan dili təsvir
```

**Addım 2:** Claude-dan chain graph-i icra etməyi tələb et

```
Prompt:
"Sen .sdd/ strukturundan başla.
1. .sdd/PROJECT.sdd oxu
2. .sdd/chains/graph.sdd oxu
3. .sdd/chains/arms/prompt.sdd (P1) oxu
4. .sdd/instances/{project_name}/docs/00-about/project.md oxu
5. .sdd/decisions/DEC-001.sdd oxu
6.Chain graph-i izah et: D0-dan hansı arm-a gedəcəyik, nə üçün, token izah et"
```

**Addım 3:** Token istifadəsini ölç

```
Claude cavabında göstərməlidir:
- Hər fayl nə qədər token yeyir
- Hansı fayllar lazımdır, hansılar yox
- Qısa ID-lərdən istifadə edilibmi (P1, D1, S1)
- İndexlər istifadə edilibmi
```

**Addım 4:** Decision ledger-i test et

```
Prompt:
"Qərar qeydi sistemini izah et:
1. .sdd/decisions/DEC-001.sdd oxu
2. .sdd/decisions/workflow.sdd oxu
3. .sdd/instances/{project_name}/decisions/task-map.sdd oxu
4. DEC-001 → hansı tasklara bağlı?
5. Qərar həyat dövrü necə işləyir?"
```

**Addım 5:** Tam workflow test

```
Prompt:
"Məktəblər platforması üçün tam workflow-u izah et:
1. D0-dan başla
2. P1 arm: prompt-u docs/ya çevir
3. D1 arm: docs yarad, decision qeydləri yarad
4. S1 arm: docs-dən .sdd/project/ yarad, tasklar yarad
5. C1 arm: .sdd/project/-dən kod yarad
6. R1 arm: review
7. DEP1 arm: deploy
8. Hər addımda token istifadəsini göstər
9. Human gate-ları bildir"
```

---

## 4. Token Minimalizmi Testləri

### Test 1: Qısa ID-lər
```
Yoxla:
- Node ID-lər 2-6 simvol? (P1, D1, S1, C1, R1, DEP1)
- Uzun adlar yoxdur? ("prompt_arm" yox, "P1" bəli)
```

### Test 2: İndexlər
```
Yoxla:
- INDEX.sdd faylları var?
- Directory scan edilir? (yox, INDEX istifadə olunur)
- Hər INDEX routing table eyni formada?
```

### Test 3: Lazy Loading
```
Yoxla:
- Hər arm yalnız öz fayllarını yükləyir?
- Bütün chain-i yükləmir?
- Skills yalnız lazım olan stage üçün?
```

### Test 4: Cache
```
Yoxla:
- Eyni fayl iki dəfə oxunur?
- Resolved referanslar yadda saxlanır?
```

---

## 5. Decision Ledger Testləri

### Test 1: Qərar qeydi var?
```
Yoxla:
- .sdd/decisions/ DEC-001.sdd ... DEC-007.sdd var?
- Hər qərar ID, type, status, options, rationale, impact Sahibdir?
- Hər qərar tasklara bağlı?
```

### Test 2: Qərar workflow-i işləyir?
```
Yoxla:
- proposed → review → approved → implemented → verified → closed
- rejected → archived
- Superseded → archived
```

### Test 3: Chain graph ilə inteqrasiya
```
Yoxla:
- CR11: Hər dəyişiklik üçün qərar qeydi?
- CR12: AI decisions/-i yoxlayır?
- CR13: Ziddiyyətli qərarlar bloklayır?
- D1 arm: qərarlar yaradır?
- S1 arm: qərarları istinad edir?
- C1 arm: qərarları implement edir?
```

---

## 6. Tam System Test Checklist

### Pre-flight
- [ ] `.sdd/PROJECT.sdd` oxunur, struktur başa düşülür
- [ ] `.sdd/chains/graph.sdd` oxunur, D0 root başa düşülür
- [ ] `.sdd/chains/arms/*.sdd` oxunur, 6 arm müəyyənləşdir
- [ ] `.sdd/decisions/DEC-001..DEC-007.sdd` oxunur
- [ ] `.sdd/instances/{project_name}/docs/` insan dili sənədləri oxunur

### Token Budget
- [ ] P1: <= 5,000
- [ ] D1: <= 10,000
- [ ] S1: <= 15,000
- [ ] C1: <= 40,000
- [ ] R1: <= 5,000
- [ ] DEP1: <= 5,000
- [ ] Total: <= 70,000

### Human Gates
- [ ] P1→D1: docs təsdiqi
- [ ] D1→S1: .sdd/project/ təsdiqi
- [ ] S1→C1: kod təsdiqi
- [ ] C1→DEP1: production təsdiqi

### Decision Ledger
- [ ] 7 qərar qeydi var
- [ ] Hər qərar ID, type, status Sahibdir
- [ ] Hər qərar tasklara bağlı
- [ ] Qərar workflow-i izlənir

### Chain Rules
- [ ] CR1: Hər arm D0-a qayıdır
- [ ] CR2: D1→S1 insan təsdiqi
- [ ] CR3: S1→C1 insan təsdiqi
- [ ] CR4: Token delta qeyd edilir
- [ ] CR5: AI project/ə S1-dən sonra baxır
- [ ] CR6: Output validation
- [ ] CR7: Retry max 3
- [ ] CR8: project/ code truth, .sdd intent truth
- [ ] CR9: docs/ human, .sdd/project/ AI
- [ ] CR10: Idempotent
- [ ] CR11: Decision record required
- [ ] CR12: AI checks decisions/
- [ ] CR13: Conflicts block execution
- [ ] CR14: Implementation references decisions

### Context Separation
- [ ] AI .sdd/-dən başlayır
- [ ] AI project/ə S1 təsdiqindən sonra baxır
- [ ] docs/ insan dili
- [ ] .sdd/project/ AI dili
- [ ] project/ insan kodu

---

## 7. Növbəti Addımlar

1. **Test et**: Yukarıdaki checklist-i Claude AI ilə yoxla
2. **Token ölç**: Hər arm üçün real token istifadəsini qeyd et
3. **Təkmil et**: Əgər hansısa boşluq varsa, .sdd/-ə əlavə et
4. **Avtomatlaşdır**: `scripts/test_chain.py` genişlət
5. **İstehsalat**: real layihə üzərində tətbiq et

---

## 8. Qısa Təlimat: "Mən bunu necə test edirəm?"

```
1. Claude AI-a bu sənədi ver
2. "SDDRA sistemini .sdd/-dan başlayaraq izah et" de
3. Token istifadəsini soruş
4. Decision ledger-i test et
5. Chain graph-i test et
6. Nəticəni bura qaytar
```

**Uğur meyarı:**
- Claude .sdd strukturunu düzgün başa düşür
- Token minimalizmi prinsiplərini izah edir
- Decision ledger-i düzgün istifadə edir
- Chain graph qırılmaz axını izah edir
- Human gate-ları müəyyənləşdirir
