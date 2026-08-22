# .sdd/ — Specification-Driven Development Engine

Bu qovluq `chat_history.md`-nin (`prompt/new/1.md … 89.md`) ardıcıl replay-i əsasında,
**hər "next" komandasından sonra** tikilir və yenidən dəqiqləşdirilir. Model tamamlanmış
deyil — canlı, artan bir sənəddir.

- **Mənbə:** `prompt/new/1.md` → hazırda `prompt/new/13.md`-ə qədər oxunub (89 fayldan).
- **Referans (toxunulmaz, kopyalanmır):** `old/.sdd/`, `old/sdd-system/.sdd/` — daha əvvəlki,
  yekunlaşmış bir versiyanın nümunəsidir. Bu qovluq həmin nümunəni kor-koranə köçürmür;
  öz məntiqini yalnız oxunmuş chunk-lardan çıxarır və hər "next"-də korreksiya edilir.
- **Nümunə domen:** aşağıdakı `project/` faylları izahat üçün chat-də istifadə olunan
  `EduNexus` (learning platform) + `Payment` domeni nümunəsini əsas götürür — real kod
  bu repoda olmadığı üçün bu fayllar **illüstrativ template** rolundadır, real layihəyə
  bağlananda `.sdd/project/*` real modul strukturuna görə yenidən generasiya olunmalıdır
  (bax `project/architecture.sdd` → `ProjectInstantiation` prinsipi).

## Struktur

```
.sdd/
├── PROJECT.sdd          — ana router: domenlər, path-lər, default execution chain
├── project/             — layihə modeli (WHAT / WHY / WHERE, "source of truth")
│   ├── map.sdd          — YALNIZ routing/index ("hara getməliyəm?")
│   ├── modules.sdd      — hansı modul var, kim kimdən asılı ola bilər
│   ├── dependencies.sdd — qlobal dependency graph
│   ├── architecture.sdd — stack (P{}) + ModuleIsolation/ExtractCheck
│   ├── integrations.sdd — xarici sistemlər (@PaymentGateway və s.)
│   ├── proposals/       — insan təsdiqi gözləyən dəyişiklik təklifləri
│   ├── payment/         — modul-lokal detal: payment.sdd, flow.sdd, db.sdd, api.sdd, cases.sdd
│   ├── course/          — stub, eyni pattern (bax status)
│   └── user/            — stub, eyni pattern (bax status)
├── protocol/            — .sdd-in öz "dili"
│   ├── symbols.sdd      — +/-/~/!/?/>/@/# status vokabulyarı
│   ├── stages.sdd        — AN/AR/DB/BE/API/FE/MD/QA/DO/VR + optional-stage qaydası
│   └── rules.sdd         — RULE: CHAIN_INTEGRITY + failure routing
├── system/               — mühərrikin özünü idarə edən master prompt
├── chains/               — feature-per-chain şablonu (stage kontraktları)
├── backend/frontend/mobile/qa/devops/  — HOW qatı, birbaşa .sdd/ altında (skills/ wrapper YOXDUR)
├── prompts/{inbox,active,archive,rejected}/ — daxil olan yeni prompt-ların analiz zənciri
├── tasks/                — generasiya olunmuş task/subtask-lar
└── decisions/            — qəbul olunmuş arxitektura qərarları (ADR-bənzər)
```

## Status (prompt/new/13.md-ə qədər)

- `+` PROJECT.sdd — chunk 12-nin verdiyi TAM, finallaşmış konstitusiya mətni ilə
  əvəz olundu (Purpose/Model/Disciplines/ProjectMap/ModuleModel/SkillModel/Flow/
  State/R1-R15 Rules/Navigation/FlowRules/Failure/Completion/PromptProcessing/
  HumanDecision). Real disk path-lər (BE/FE/MD/QA/DO) artıq yalnız map.sdd-də
  saxlanılır (R2-ə görə təkrarlanmır). Chunk 10-un aralıq versiyası bununla
  üstələnib.
- `+` project/map.sdd — router contract-ı tamamlandı: Rules + Resolve bölmələri (chunk 11)
- `+` project/<module>/<module>.sdd — chunk 13-ün universal STEP-3 şablonuna
  görə üç faylın hamısı (payment/course/user) yenidən yazıldı: Purpose/Owns
  (BE/FE/MD/QA/DO)/Architecture/Flow/Database/API/Cases/DependsOn/UsedBy/
  Produces/ConsumedBy/State/Rules. Köhnə `Path:`/`Dependencies:` sərbəst
  formatı bu kanonik quruluşla əvəz olundu.
- `+` project/payment/* — tam işlənmiş nümunə (payment.sdd, flow.sdd, db.sdd, api.sdd, cases.sdd)
- `~` project/course/, project/user/ — yalnız stub (course.sdd/user.sdd chunk-13
  şablonuna görə yeniləndi, amma flow/db/api/cases hələ detallandırılmayıb)
- `+` protocol/symbols.sdd, protocol/stages.sdd, protocol/rules.sdd
- `+` backend/frontend/mobile/qa/devops/ qovluqları düz `.sdd/` altında (əvvəlki `skills/` wrapper-i
  chunk 9-a görə düzəldildi — mənbə heç vaxt bu wrapper-i istifadə etmir)
- `~` system/MASTER.md — qaralama (chunk 4-də "..." ilə bitir, tam deyil)
- `!` backend/*, frontend/* və s. daxili skill fayl(lar)ı hələ boşdur — chat özü də deyir:
  "skill-lərə hələ keçmirik"
- `!` chains/*, yalnız template — real feature chain-i (məs. payment) hələ ayrıca yazılmayıb,
  onun yerinə həmin məlumat indi project/payment/flow.sdd-də saxlanılır
- `?` prompts/* intelligence-layer məntiqi hələ fayl formatına düşməyib (yalnız konsepsiya)

Hər növbəti "next" bu faylları ya təsdiqləyəcək, ya da düzəliş edəcək.
