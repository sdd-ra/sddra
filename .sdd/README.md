# .sdd/ — Specification-Driven Development Engine

Bu qovluq `chat_history.md`-nin (`prompt/new/1.md … 89.md`) ardıcıl replay-i əsasında,
**hər "next" komandasından sonra** tikilir və yenidən dəqiqləşdirilir. Model tamamlanmış
deyil — canlı, artan bir sənəddir.

- **Mənbə:** `prompt/new/1.md` → hazırda `prompt/new/16.md`-ə qədər oxunub (89 fayldan).
- **Referans (toxunulmaz, kopyalanmır):** `old/.sdd/`, `old/sdd-system/.sdd/` — daha əvvəlki,
  yekunlaşmış bir versiyanın nümunəsidir. Bu qovluq həmin nümunəni kor-koranə köçürmür;
  öz məntiqini yalnız oxunmuş chunk-lardan çıxarır və hər "next"-də korreksiya edilir.
- **Nümunə domen:** aşağıdakı `project/` faylları izahat üçün chat-də istifadə olunan
  `EduNexus` (learning platform) + `Payment` domeni nümunəsini əsas götürür — real kod
  bu repoda olmadığı üçün bu fayllar **illüstrativ template** rolundadır, real layihəyə
  bağlananda `.sdd/project/*` real modul strukturuna görə yenidən generasiya olunmalıdır
  (bax `project/architecture.sdd` → `ProjectInstantiation` prinsipi).

## ⚠️ Kritik ayrım (prompt/new/14.md)

Mənbə chat özü bu nöqtədə öz səhvini düzəldir, və bu, bundan sonra
pozulmayacaq bir qayda kimi qəbul edilir:

```
.sdd/            — MEN (bu repo-nu quran AI) tikirəm: model + rules +
                   skills + flow + state.
                        ↓
                   PROMPT ENGINE  (.sdd-in özü yox, ayrıca mexanizm)
                        ↓
real project/    — backend/, frontend/, mobile/, tests/, infrastructure/...
                   BUNU MƏN ƏL İLƏ YARATMIRAM. Bunu prompt engine, .sdd
                   modelinə əsaslanaraq, gələcəkdə yaradır/idarə edir.
```

Deməli, `.sdd/*.sdd` fayllarında görünən `BE: ./backend/payment` kimi
sətirlər **"real `./backend/payment` qovluğunu indi yarat" demək deyil** —
sadəcə "gələcəkdə AI real kodu harada axtarmalıdır" göstəricisidir
(reference, indeks — icra əmri deyil). Bu repoda `git ls-files` yoxlanılıb:
heç bir real `backend/`, `frontend/`, `mobile/`, `qa/`, `devops/` qovluğu
kök səviyyəsində yaradılmayıb, yalnız `.sdd/backend/` və s. (skill/HOW
qatı, ayrı məna) mövcuddur. Bu ayrım bundan sonrakı hər addımda qorunacaq.

## Struktur

```
.sdd/
├── PROJECT.sdd          — ana router: domenlər, path-lər, default execution chain
├── project/             — layihə modeli (WHAT / WHY / WHERE, "source of truth")
│   ├── map.sdd          — YALNIZ routing/index ("hara getməliyəm?")
│   ├── modules.sdd      — hansı modul var, kim kimdən asılı ola bilər
│   ├── dependencies.sdd — qlobal dependency graph
│   ├── architecture.sdd — stack (P{}) + ModuleIsolation/ExtractCheck + LayerArchitecture (allowed/forbidden)
│   ├── integrations.sdd — xarici sistemlər (@PaymentGateway və s.)
│   ├── proposals/       — insan təsdiqi gözləyən dəyişiklik təklifləri
│   ├── payment/         — modul-lokal detal: payment.sdd, db.sdd, api.sdd, cases.sdd
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

## Status (prompt/new/16.md-ə qədər)

- `!` **RETRACTED (prompt/new/16.md):** chunk 15-in bütün STEP 4-ü (module-per
  `flow.sdd`, "AN>AR>DB>BE>API>FE>MD>QA>DO>VR" iş ardıcıllığı) mənbə chat-in
  özü tərəfindən ləğv edildi — architecture (nə nəyi çağıra bilər) ilə
  execution order (iş hansı sırayla görülür) qarışdırılmışdı. Nəticədə:
  - `project/payment/flow.sdd` silindi.
  - `payment.sdd`-in `Flow: @flow` sahəsi `TBD` olaraq işarələndi, `Architecture:`
    sahəsi `@architecture`-a bağlandı (bax `project/architecture.sdd`).
  - `protocol/stages.sdd`-ə əlavə olunmuş `TransitionRules [T1]-[T10]` /
    `DefaultFailureRouting` / `DefaultDependencyRules` **silinmədi** — bunlar
    hələ də doğru generic mexanikadır, sadəcə evi dəyişəcək: gələcəkdə
    module/flow.sdd yox, `.sdd/chains/*.chain` (STEP 8) onlara bağlanacaq.
  - Yeni STEP 4 = `project/architecture.sdd` — `LayerArchitecture` bölməsi
    əlavə olundu (`DefaultAllowed`/`DefaultForbidden` layer edge-ləri, `State`
    (+/!/?/~), `ViolationVsDecision` — AI özbaşına "səhv" ilə "yeni qərar"ı
    qarışdırmır, `?`-lə insan qərarına yönləndirir).
  - Qalan yol xəritəsi (mənbənin öz sıralaması): STEP 5 module architecture,
    STEP 6 DB model, STEP 7 API model, STEP 8 execution chains, STEP 9 skill
    chains — hər biri yalnız növbəti "next"-də oxunacaq.
- `+` README — chunk 14-ün kritik ayrımı (`.sdd` mən qururam / real project
  path-ləri prompt engine üçün referansdır, indi əl ilə yaradılmır) ayrıca
  bölmə kimi sənədləşdirildi. Struktur dəyişikliyi tələb olunmadı — bu repo
  artıq bu qaydaya uyğun idi (yoxlanıldı: heç bir real backend/frontend/...
  qovluğu yaradılmamışdı).

- `+` (prompt/new/13.md-ə qədər idi, hələ də doğrudur) PROJECT.sdd — chunk 12-nin verdiyi TAM, finallaşmış konstitusiya mətni ilə
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
- `+` project/payment/* — tam işlənmiş nümunə (payment.sdd, db.sdd, api.sdd, cases.sdd —
  flow.sdd chunk 16-da silindi, bax yuxarı RETRACTED bəndi)
- `~` project/course/, project/user/ — yalnız stub (course.sdd/user.sdd chunk-13
  şablonuna görə yeniləndi, amma flow/db/api/cases hələ detallandırılmayıb)
- `+` protocol/symbols.sdd, protocol/stages.sdd, protocol/rules.sdd
- `+` backend/frontend/mobile/qa/devops/ qovluqları düz `.sdd/` altında (əvvəlki `skills/` wrapper-i
  chunk 9-a görə düzəldildi — mənbə heç vaxt bu wrapper-i istifadə etmir)
- `~` system/MASTER.md — qaralama (chunk 4-də "..." ilə bitir, tam deyil)
- `!` backend/*, frontend/* və s. daxili skill fayl(lar)ı hələ boşdur — chat özü də deyir:
  "skill-lərə hələ keçmirik"
- `!` chains/*, yalnız template — real feature chain-i (məs. payment) hələ yazılmayıb;
  bu STEP 8-in işidir (prompt/new/16.md-in yol xəritəsi), hələ oxunmayıb
- `?` prompts/* intelligence-layer məntiqi hələ fayl formatına düşməyib (yalnız konsepsiya)

Hər növbəti "next" bu faylları ya təsdiqləyəcək, ya da düzəliş edəcək.
