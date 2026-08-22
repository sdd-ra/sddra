# .sdd/ — Specification-Driven Development Engine

Bu qovluq `chat_history.md`-nin (`prompt/new/1.md … 89.md`) ardıcıl replay-i əsasında,
**hər "next" komandasından sonra** tikilir və yenidən dəqiqləşdirilir. Model tamamlanmış
deyil — canlı, artan bir sənəddir.

- **Mənbə:** `prompt/new/1.md` → hazırda `prompt/new/24.md`-ə qədər oxunub (93 fayldan).
- **Referans (toxunulmaz, kopyalanmır):** `old/.sdd/`, `old/sdd-system/.sdd/` — daha əvvəlki,
  yekunlaşmış bir versiyanın nümunəsidir. Bu qovluq həmin nümunəni kor-koranə köçürmür;
  öz məntiqini yalnız oxunmuş chunk-lardan çıxarır və hər "next"-də korreksiya edilir.
- **Nümunə domen:** `project/` altındakı fayllar izahat üçün chat-də istifadə olunan
  `EduNexus` (learning platform) + `Payment` domeni nümunəsini əsas götürür — real kod
  bu repoda olmadığı üçün bu fayllar **illüstrativ template** rolundadır.

## ⚠️ STEP 1 reset (prompt/new/17.md)

Mənbə chat bu nöqtədə **`.sdd`-in öz kök arxitekturasını "ilk formada" yenidən qurmağa**
başlayır — feature/Payment/Backend məzmunundan ayrı, yalnız `.sdd`-in özünün skeleti.
İstifadəçinin öz seçimi ilə (görüş: "Tam sıfırla, literal skeletə keç") bu addım
**tam sıfırlama** kimi tətbiq olundu:

- **Silindi (git tarixçəsində qalır, itmir):** `protocol/` (symbols.sdd, stages.sdd,
  rules.sdd), `system/` (MASTER.md qaralaması), `backend/`, `frontend/`, `mobile/`,
  `qa/`, `devops/` — yeni STEP 1 kök siyahısında bunlar yoxdur. Bu, əvvəlki chunk-ların
  (9, 15) işini "səhv idi" demək deyil — sadəcə mənbə chat kök modelini təmizdən
  qurmağı seçib; həmin məzmun lazım olsa git tarixçəsindən bərpa oluna bilər.
- **Saxlanıldı (toxunulmadı):** `PROJECT.sdd`, `project/` (bütün alt-məzmunu ilə:
  map.sdd, modules.sdd, dependencies.sdd, architecture.sdd, integrations.sdd,
  proposals/, payment/, course/, user/), `chains/`, `prompts/`, `tasks/`, `decisions/`
  — bunlar yeni STEP 1 siyahısında da var, dəyişməz qalıb.
- **Yeni yaradıldı (boş skelet, `.gitkeep` ilə):** `architecture/`, `skills/`, `state/`.
  Chunk 17 açıq deyir: *"hələ bu qovluqların içinə heç nə qoymuruq"* — ona görə bu üç
  qovluq hazırda tamamilə boşdur, yalnız git-in izləməsi üçün `.gitkeep` var.

**Gözlənilən uzlaşdırma (hələ edilməyib, gələcək "next"-lərin işi):** `project/architecture.sdd`
faylının məzmunu gec-tez `architecture/` qovluğuna keçə bilər; silinmiş `backend/frontend/
mobile/qa/devops/` skill-HOW qatı gec-tez `skills/` altında yenidən doğula bilər; hər
`.sdd` faylının öz `State:` sətri gec-tez `state/`-ə mərkəzləşə bilər. Bunların heç biri
indi qabaqlanmır (R2/R3, next-gated qayda) — yalnız chunk özü bunu deyəndə ediləcək.

## STEP 1 təsdiqi (prompt/new/18.md)

Mənbə chat `.sdd`-in öz arxitekturasını **yenidən, sıfırdan** izah etməyə başlayır və STEP 1
üçün eyni 9-item kök siyahısını verir — bu, chunk 17-də artıq tətbiq etdiyimiz reset ilə
**tam üst-üstə düşür**, deməli struktur dəyişmir, yalnız təsdiqlənir. Əlavə olaraq hər
qovluğun məsuliyyəti bir cümləylə dəqiqləşdirilir (aşağıdakı struktur diaqramındakı
şərhlər bu cədvələ uyğunlaşdırılıb) və `.sdd`-in ümumi rolunu təyin edən bir prinsip verilir:

```text
.sdd = Engineering Intelligence Layer

.sdd
 ├── understands the project
 ├── understands architecture
 ├── knows how work must be done
 ├── knows where work belongs
 ├── knows what depends on what
 ├── tracks state
 └── preserves the execution chain
```

Bu, `.sdd`-in nəyə xidmət etdiyinin qısa tərifidir: sadəcə sənədləşmə deyil, layihəni,
arxitekturanı, iş qaydalarını və vəziyyəti birlikdə "anlayan" bir qat. Chunk özü aydın
şəkildə deyir ki, STEP 1 yalnız struktur ayırmaqdır — heç bir qovluğun içinə hələ real
qayda yazılmır (`architecture/`, `skills/`, `state/` boş qalmağa davam edir).

## STEP 2 — `PROJECT.sdd` root router (prompt/new/19.md)

`PROJECT.sdd` bu addımda **router/constitution** kimi yenidən yazıldı — detallı layihə
bilgisi saxlayan bir fayl deyil (misal: "Payment PostgreSQL istifadə edir" → `project/`-ə
aiddir, bura yox; "DDD necə tətbiq olunur?" → `skills/`-ə aiddir, bura yox). Yeni fayl:

- **`Directories:`** — 8 alt-qovluğun hər biri üçün path + bir cümləlik purpose.
- **`Navigation:`** + **`NavigationFlow:`** — `@`-referanslar və "request → resolve → read"
  axını (əvvəlcə responsible directory tapılır, sonra oxunur — bütün `.sdd` skan edilmir).
- **`Rules: [R1]–[R9]`** — mənbə template-dən (router rolu, detallı bilgi saxlamamaq,
  oxumadan əvvəl resolve, qlobal qaydaları səssizcə dəyişməmək, architecture dəyişikliyi
  üçün insan təsdiqi) + **`[R10]/[R11]`** best-practice əlavəsi (hər mərhələdən sonra
  `state:` yenilənməlidir; destructive/ziddiyyətli tələblər üçün də insan qərarı lazımdır).
- Köhnə (chunk-17 reset-dən əvvəlki nəsil) `Reference: system:/protocol:`,
  `Disciplines:`/`SkillModel:`, `Flow: AN>AR>DB>BE>API>FE>MD>QA>DO>VR`/`FlowRules:` blokları
  silindi — bunlar artıq mövcud olmayan qovluqlara işarə edirdi və chunk 16-nın flow
  qərarı ilə ziddiyyət təşkil edirdi.

**Aşkarlanmış qalıq — HƏLL OLUNUB (STEP 4, bax aşağıda):** o zaman `project/architecture.sdd`
və `project/map.sdd` hələ köhnə `protocol/*.sdd`, `module/flow.sdd` ifadələrinə istinad
edirdi. STEP 4-ün "Tam sıfırla" reset-i bu qalığı silib, hər iki fayl sxem-yalnız formada
yenidən yazılıb (bax .sdd/project/*.sdd -> hər faylın öz Note-u).

## STEP 3 — `.sdd/architecture/architecture.sdd` (prompt/new/20.md)

`.sdd`-in **öz komponentlərinin** arxitekturası yaradıldı — bu, layihənin texniki
arxitekturasından (`project/architecture.sdd`: stack, ModuleIsolation, LayerArchitecture)
**tamamilə ayrıdır**, yalnız adı bənzəyir. Yeni fayl:

- **`Components:`** — 9 SDD komponenti (PROJECT, PROJECT_MODEL, ARCHITECTURE, CHAINS,
  SKILLS, PROMPTS, TASKS, DECISIONS, STATE), hər biri üçün path + rol.
- **`Relationships:`** — komponentlər arası əsas axın (PROJECT → PROJECT_MODEL/ARCHITECTURE,
  PROJECT_MODEL → CHAINS → SKILLS, PROMPTS → TASKS → STATE, DECISIONS → ARCHITECTURE/
  PROJECT_MODEL/CHAINS).
- **`Allowed:`** / **`Forbidden:`** — hansı komponent hansına referans verə bilər, hansı
  komponent nəyi "redefine" etməməlidir (məs. `SKILLS` PROJECT architecture-ı redefine edə
  bilməz, `PROJECT_MODEL` skill təlimatı saxlaya bilməz).
- **`Principles:`** — SeparationOfConcerns, SingleSourceOfTruth, ExplicitReference, Locality,
  NoDuplication, Traceability, HumanControl.
- Mənbə template demək olar ki, olduğu kimi saxlanıldı (strukturu artıq tam idi); əlavə
  edilən best-practice hissələr: `HumanControl` prinsipinin `PROJECT.sdd`-in `[R9]/[R11]`-inə
  açıq istinadı (təkrar tərif deyil), fayl sonunda `State: +` sətri (`[R10]`-a uyğun) və
  adların toqquşmasını (`architecture/architecture.sdd` vs `project/architecture.sdd`)
  aydınlaşdıran bir `Note`.
- `architecture/.gitkeep` silindi (artıq real fayl var); `PROJECT.sdd`-də `architecture:`
  girişinin `state:` sətri "boş (STEP 1)"-dən "STEP 3 tamamlandı"-ya yeniləndi.

## STEP 4 — `.sdd/project/` sxem qatı (prompt/new/21.md)

`project/` alt-ağacında qalan köhnə, konkret EduNexus/Payment məzmunu (map.sdd,
architecture.sdd, dependencies.sdd) ilə chunk 21-in tələb etdiyi sxem-yalnız model arasında
ziddiyyət aşkarlandı — istifadəçidən **"Tam sıfırla"** təsdiqi alındı (eyni STEP 1 pattern-i):

- **Silindi (git tarixçəsində qalır):** köhnə `map.sdd`/`architecture.sdd`/
  `dependencies.sdd`-in konkret EduNexus/Payment/Course/User məzmunu, `payment/`, `course/`,
  `user/`, `proposals/`, `integrations.sdd` — hamısı köhnə `protocol/*.sdd`, `module/flow.sdd`
  ifadələrinə istinad edirdi.
- **Sxem-yalnız yenidən yazıldı:** `map.sdd`, `architecture.sdd`, `dependencies.sdd`.
- **Yeni yaradıldı (sxem-yalnız):** `domains.sdd`, `indexes.sdd`, hər ikisi chunk 21-in
  adlandırdığı 5 fayldan olmasa da `map.sdd`-nin `Resolution:`-unda istinad edildiyi üçün
  zəruri idi (bax `modules.sdd` -> Note).
- Heç bir köhnə `protocol/`-a istinad qalmadı (bax hər faylın öz Note-u, `PROJECT.sdd` -> Note).

## STEP 5 — `.sdd/chains/` chain-tipi modeli (prompt/new/22.md)

Əvvəllər mövcud olan `chains/_TEMPLATE.feature.sdd` (hər feature üçün ayrıca fayl
instansiasiya edən model, retired `protocol/stages.sdd`/`protocol/rules.sdd`-a istinad edən,
discipline-bazlı `.sdd/backend/...` skill yolları olan) chunk 22-nin daha sadə chain-tipi
modeli ilə ziddiyyət təşkil etdi — istifadəçidən **"Tam sıfırla"** təsdiqi alındı:

- **Silindi (git tarixçəsində qalır):** `chains/_TEMPLATE.feature.sdd`.
- **Yeni yaradıldı:** `chains.sdd` (router — `ChainTypes: feature/bugfix/change`,
  `Rules: [C1]-[C11]`, `Resolution:` hər tipi öz `.chain` faylına yönləndirir),
  `feature.chain` (`Sequence: AN>AR>DB>BE>API>FE>MD>QA>DO>VR`, tam `Stages:` siyahısı),
  `bugfix.chain` (`Sequence: AN>IMPACT>FIX>QA>VR`, yalnız IMPACT/FIX-i tərif edir, AN/QA/VR-i
  `feature.chain`-ə istinad edir — NoDuplication), `change.chain` (`Sequence:
  AN>IMPACT>AR>DB>BE>API>FE>MD>QA>DO>VR`, feature.chain + IMPACT-ı təkrar istifadə edir).
- **Prinsipial ayrım (chunk 22-nin öz sözü ilə):** Architecture = "sistem necə qurulub?",
  Chain = "iş hansı ardıcıllıqla görülür?" — ikisi fərqli suallara cavab verir.
- Skill-lərin chain stage-lərinə bağlanması **bilərəkdən indi edilmir** (`chains.sdd -> [C9]`)
  — `.sdd/skills/` qurulanda görüləcək iş (növbəti "next").
- `PROJECT.sdd`-nin `chains:` girişinin `purpose:`/`state:` sətirləri yeniləndi;
  `architecture/architecture.sdd`-nin `CHAINS` komponentinin köhnə "feature-per-chain, STEP 8"
  rolu da düzəldildi (bax architecture/architecture.sdd -> Note).

## STEP 6 — `.sdd/skills/` Skill Architecture (prompt/new/23.md)

`.sdd/skills/` əvvəllər tam boş idi (yalnız `.gitkeep`) — heç bir ziddiyyət olmadığı üçün
bu addım "Tam sıfırla" tələb etmədi, sırf əlavə (additive) tikinti oldu:

- **Yeni yaradıldı:** `skills.sdd` (router — `SkillDomains: global/backend/api/frontend/
  mobile/database/qa/devops`, `Rules: [S1]-[S16]`, `SkillContract` şablonu, `Execution:`
  axını) + 8 boş `SkillDomain` qovluğu (yuxarıdakı domenlərin hər biri, hələ heç bir
  konkret skill faylı olmadan). Kök səviyyəli `skills/.gitkeep` artıq lazımsız olduğu
  üçün silindi (qovluqda real fayl — `skills.sdd` — var).
- **Dörd qatlı bilgi modeli** (`skills.sdd -> Purpose`-də tərif olunub): `project/` =
  WHAT/WHERE, `architecture/` = RULES, `chains/` = WHEN/ORDER, `skills/` = HOW.
- **Ən vacib sərhəd ([S3]):** skill faylları heç vaxt project-specific bilgi (məsələn
  "Payment table", "PaymentService", "./backend/payment") saxlamayacaq — bu yalnız
  `.sdd/project/`-də yaşayır. Skill yalnız "Repository Pattern necə tətbiq olunur?"
  səviyyəsində ümumi mühəndislik qaydası saxlayır.
- **Best-practice əlavə [S16]:** boş domain qovluğu elan olunmuş placeholder-dir, unudulmuş
  qovluqdan fərqlidir; elan olunmamış domendə skill yaratmaq qadağandır (bax `chains.sdd
  -> [C1]` ilə eyni orphan-qadağası prinsipi).
- Skill-lərin real yazılması (`backend/ddd/skill.md`, `backend/security/skill.md` və s.)
  və onların `requires:` zənciri ilə bağlanması **bilərəkdən indi edilmir** — mənbə özü
  "Hələ bunların içində konkret skill yaratmırıq" deyir.
- Chain stage-lərinə skill bağlanması (`chains.sdd -> [C9]`) də hələ edilmir — konkret
  skill-lər olmadan mənasız olardı (bax `skills.sdd -> Execution -> Qeyd`).
- `PROJECT.sdd`-nin `skills:` girişinin `purpose:`/`state:` sətirləri yeniləndi;
  `architecture/architecture.sdd`-nin `SKILLS` komponentinin köhnə/yanlış "STEP 9" işarəsi
  "STEP 6"-ya düzəldildi (bax architecture/architecture.sdd -> Note).

## STEP 7 — `.sdd/prompts/` Prompt Intelligence Layer (prompt/new/24.md)

`.sdd/prompts/` əvvəllər köhnə (STEP 1-dən qabaqkı nəsildən qalma) dörd qovluqlu bir
struktur idi — `inbox/active/archive/rejected` + artıq mövcud olmayan `system/MASTER.md`-ə
istinad edən köhnəlmiş `README.md`. Bu, chunk 24-ün tələb etdiyi 5-qovluqlu modellə
(`inbox/active/archive/extracted/conflicts`) ziddiyyət təşkil etdi — istifadəçidən
**"Tam sıfırla"** təsdiqi alındı (eyni STEP 1/4/5 pattern-i):

- **Silindi (git tarixçəsində qalır):** `rejected/` qovluğu və köhnə `README.md`-dəki
  dangling `system/MASTER.md` istinadı.
- **Yeni yaradıldı:** `prompts.sdd` (router — `Lifecycle: RECEIVE>ANALYZE>CLASSIFY>
  COMPARE>IMPACT>DECIDE>EXECUTE/BACKLOG/ARCHIVE`, `PromptTypes:`, `Rules: [P1]-[P20]`,
  `Comparison:`, `Impact:`, `Decision:`, `KnowledgeExtraction:`, `Traceability:`) +
  `extracted/`, `conflicts/` qovluqları (`.gitkeep` ilə).
- **Prinsipial reframe ([P19]):** "rejected" ayrıca qovluq deyil, **ARCHIVE** nəticəsinin
  bir alt-halı kimi formallaşdırıldı — rədd səbəbi faylın öz `Traceability.final_action`
  sahəsində saxlanılır, fayl `archive/`-ə köçür.
  `ESCALATE` nəticəsi (`[P20]`) `decisions/`-də açıq item yaratmalıdır — bax
  `PROJECT.sdd -> HumanDecision`/`[R9]`/`[R11]`, təkrar tərif deyil, tətbiqdir.
- **Best-practice əlavə `KnowledgeExtraction`:** `[P5]`-in mənbədə yalnız bir cümləlik
  qadağa olan "necə" sualına cavab — sabit zəncir: `prompt (inbox/) > extracted knowledge
  (extracted/) > skill proposal > human approval > skill (skills/<domain>/)`. Bu, xam
  prompt mətninin birbaşa `skills/`-ə düşməsinin (`.sdd/prompts/`-un "bilgi zibilliyinə"
  çevrilməsinin) qarşısını alır.
- Konkret prompt instansiyaları (real `inbox/*.md` faylları, real `extracted/*.sdd`
  bilgiləri) **bilərəkdən indi edilmir** — bu, yalnız skelet + qayda mühərriki addımıdır,
  eynilə STEP 5/STEP 6-da olduğu kimi.
- `PROJECT.sdd`-nin `prompts:` girişinin `state:` sətri yeniləndi;
  `architecture/architecture.sdd`-nin `PROMPTS` komponentinin `role:` sahəsinə "STEP 7"
  işarəsi əlavə olundu (bax architecture/architecture.sdd -> Note).

## Struktur (prompt/new/17.md → 18.md ilə təsdiqlənib, STEP 1 skeleton)

```
.sdd/
├── PROJECT.sdd     — .sdd sisteminin ana entry point-i
├── project/        — real project-in .sdd modelini saxlayır (WHAT/WHY/WHERE)
├── architecture/   — .sdd sisteminin və project architecture qaydalarının modeli (boş, STEP 1)
├── chains/         — işlərin mərhələ-mərhələ keçidlərini saxlayır (chain-tipi modeli — feature/bugfix/change)
├── skills/         — AI-nin işi necə görəcəyini müəyyən edən skill-lər (skills.sdd router + 8 boş domain, STEP 6)
├── prompts/        — daxil olan və saxlanılan prompt intelligence (prompts.sdd router + 5 qovluq, STEP 7)
├── tasks/          — aktiv / planlanmış / tamamlanmış işlərin vəziyyəti
├── decisions/       — human decision və architecture qərarları
└── state/          — .sdd sisteminin ümumi vəziyyət məlumatları (boş, STEP 1)
```

Çox vacib ayrım (chunk 17-nin öz sözü ilə): `.sdd/project/` **real project deyil** —
bu, PROJECT MODEL-dir. `.sdd/project/payment/` real `payment/` kod qovluğu deyil,
sadəcə "Payment project-də haradadır, hansı komponentləri var, hansı DB/API ilə
əlaqəlidir?" sualına AI üçün model verir (bax həmçinin `sddra-sdd-only-no-real-scaffold`).

## Status (prompt/new/24.md-ə qədər)

- `~` **STEP 1 skeleton reset (prompt/new/17.md) + təsdiq (prompt/new/18.md):** kök quruluş
  yuxarıdakı 9 elementə endirildi və chunk 18-də eyni siyahı ilə təsdiqləndi. `architecture/`,
  `skills/`, `state/` boş yaradıldı. Əvvəlki `protocol/`, `system/`,
  `backend/frontend/mobile/qa/devops/` silindi (git tarixçəsində qalır).
- `+` "Engineering Intelligence Layer" prinsipi (prompt/new/18.md) — `.sdd`-in ümumi rolunun
  qısa tərifi olaraq README-yə əlavə olundu, real qayda faylı deyil.
- `+` **`PROJECT.sdd` STEP-2 rewrite (prompt/new/19.md):** router/constitution roluna
  uyğunlaşdırıldı — `Directories:`/`Navigation:`/`NavigationFlow:`/`Rules: [R1]-[R11]` əlavə
  olundu, köhnə `Reference:/Disciplines:/SkillModel:/Flow:/FlowRules:` bloku silindi.
- `+` **`architecture/architecture.sdd` (prompt/new/20.md):** `.sdd`-in öz komponent
  qrafı (Components/Relationships/Allowed/Forbidden/Principles) yaradıldı; `.gitkeep`
  silindi.
- `+` **`project/` STEP-4 "Tam sıfırla" (prompt/new/21.md):** köhnə konkret EduNexus/
  Payment/Course/User məzmunu (`payment/`, `course/`, `user/`, `proposals/`,
  `integrations.sdd`) silindi (git tarixçəsində qalır); `map.sdd`/`architecture.sdd`/
  `dependencies.sdd` sxem-yalnız yenidən yazıldı, `domains.sdd`/`indexes.sdd` yeni yaradıldı.
  Əvvəlki `protocol/*.sdd`, `module/flow.sdd` dangling istinadları HƏLL OLUNUB.
- `+` **`chains/` STEP-5 "Tam sıfırla" (prompt/new/22.md):** köhnə `_TEMPLATE.feature.sdd`
  (per-feature instansiasiya modeli) silindi (git tarixçəsində qalır); `chains.sdd` router +
  `feature.chain`/`bugfix.chain`/`change.chain` yaradıldı (chain-tipi modeli). Skill-bağlama
  bilərəkdən indi edilmir.
- `+` **`skills/` STEP-6 additive tikinti (prompt/new/23.md):** `.sdd/skills/` tam boş idi,
  ziddiyyət yox idi — `skills.sdd` router (`SkillDomains` ×8, `Rules: [S1]-[S16]`,
  `SkillContract`, `Execution:`) + 8 boş `SkillDomain` qovluğu yaradıldı. Kök `.gitkeep`
  silindi. Konkret skill-lər və `requires:` zənciri, eləcə də chain-skill bağlanması
  (`chains.sdd -> [C9]`) bilərəkdən hələ edilmədi.
- `+` **`prompts/` STEP-7 "Tam sıfırla" (prompt/new/24.md):** köhnə `rejected/` qovluğu və
  `system/MASTER.md`-ə istinad edən köhnəlmiş `README.md` sıfırlanıb; `prompts.sdd` router
  (`Lifecycle`, `PromptTypes`, `Rules: [P1]-[P20]`, `Comparison`, `Impact`, `Decision`,
  `KnowledgeExtraction`, `Traceability`) + `extracted/`/`conflicts/` yeni yaradıldı.
  "Rejected" `[P19]` ilə ARCHIVE-in alt-halına çevrildi. Konkret prompt instansiyaları
  bilərəkdən hələ edilmədi.
- `+` `tasks/README.md`, `decisions/README.md` — toxunulmadı.
- `!` `state/` — hələ boş (yalnız `.gitkeep`), məzmun növbəti "next"-lərdə müəyyənləşəcək.

Hər növbəti "next" bu faylları ya təsdiqləyəcək, ya da düzəliş edəcək.
