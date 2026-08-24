# .sdd/ — Specification-Driven Development Engine

Bu qovluq `chat_history.md`-nin (`prompt/new/1.md … 89.md`) ardıcıl replay-i əsasında,
**hər "next" komandasından sonra** tikilir və yenidən dəqiqləşdirilir. Model tamamlanmış
deyil — canlı, artan bir sənəddir.

- **Mənbə:** `prompt/new/1.md` → hazırda `prompt/new/36.md`-ə qədər oxunub (103 fayldan).
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
- **STEP 11 yeniləməsi (prompt/new/33.md):** `feature.chain`/`bugfix.chain`/`change.chain`
  özləri də əvəzləndi — `chains/templates/feature.sdd`/`bugfix.sdd`/`change.sdd`-ə köçürüldü,
  ortaq DB/BE/API/FE/MD/QA/DO/VR stage-ləri `chains/stages/*.sdd`-ə çıxarıldı (NoDuplication),
  ingilis dilinə tərcümə edildi, köhnə `.chain` faylları silindi (git tarixçəsində qalır).
- `PROJECT.sdd`-nin `chains:` girişinin `purpose:`/`state:` sətirləri yeniləndi;
  `architecture/architecture.sdd`-nin `CHAINS` komponentinin köhnə "feature-per-chain, STEP 8"
  rolu da düzəldildi (bax architecture/architecture.sdd -> Note).
- **STEP 12 geri qaytarma (prompt/new/34.md):** yuxarıdakı STEP 11 bölünməsi "gərəksiz
  abstraksiya" hesab edilərək ləğv edildi — `chains/templates/*.sdd` və `chains/stages/*.sdd`
  silindi (git tarixçəsində qalır), `chains.sdd` yenidən tək fayla yığcamlaşdırıldı: `Stages:`
  inline, qlobal chain-tipi dispatch yoxdur, `DefaultFlow` bir arayış ardıcıllığıdır, yeni
  `ProjectFlow`/`FlowResolution` bölmələri real axını `project/flows.sdd`/
  `project/<domain>/flows.sdd`-ə həvalə edir (hələ mövcud deyil, bilərəkdən).

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

## STEP 8 — `.sdd/tasks/` Task Execution Layer (prompt/new/25.md)

`.sdd/tasks/` əvvəllər yalnız bir `README.md`-dən ibarət idi — artıq mövcud olmayan
`system/MASTER.md`-ə istinad edən, `.sdd/project/proposals/<ID>.md` approve-gated modelinə
əsaslanan, `PAY-001.N` dot-nömrələnmiş subtask formatlı. Bu, chunk 25-in tələb etdiyi
`TaskLifecycle` + 6-qovluqlu state modeli ilə ziddiyyət təşkil etdi — istifadəçidən
**"Tam sıfırla"** təsdiqi alındı (eyni STEP 1/4/5/7 pattern-i):

- **Silindi (git tarixçəsində qalır):** köhnə `README.md` (dangling `system/MASTER.md`
  istinadı, `proposals/`-gated model, `PAY-001.N` formatı).
- **Yeni yaradıldı:** `tasks.sdd` (router — `TaskLifecycle: CREATED>ANALYZED>READY>ACTIVE>
  REVIEW>VERIFIED>DONE`, `Failure:` bərpa zəncirləri, `TaskTypes:`, `TaskContract:`,
  `Rules: [T1]-[T17]`, `Dependency:`, `Review:`, `Verification:`, `Parallel:`) + 6 boş qovluq
  (`active/backlog/blocked/review/done/failed`, `.gitkeep` ilə) + qısa `README.md`.
- **Best-practice əlavə `StateToDirectory`:** mənbə template-də 7 lifecycle state və 6 qovluq
  ayrı-ayrı verilmişdi, aralarında birbaşa xəritə yox idi — bu boşluq doldurulub. Aydınlaşdırma:
  `BLOCKED` ayrıca lifecycle state deyil, `READY`/`ACTIVE` üzərində bir overlay-vəziyyətdir —
  asılılıq açılan kimi task öz əvvəlki state-inə qayıdır.
- **Best-practice əlavə `[T16]`/`[T17]`:** `[T1]` (source vacibdir) və `[T2]` (chain-ə aid
  olmalıdır) qaydalarını konkret yoxlanıla bilən edir — `source` real `prompts/`/`decisions/`
  item-inə, `chain` isə `chains.sdd -> ChainTypes`-də tərif olunmuş dəyərə resolve olunmalıdır.
- **Failure heç vaxt birbaşa DONE-a keçmir:** `ACTIVE>FAILED>RECOVER>ACTIVE` və
  `REVIEW>FAILED>RECOVER>ACTIVE` — bərpa yalnız məsul mərhələyə qayıdır (bax `[T7]`/`[T8]`).
- Mənbədəki illüstrativ nümunələr (TASK-001 Payment Refund, BE-001/API-001/FE-001/MD-001/
  QA-001 subtask-ları, fork-join paralel nümunəsi) hərfi köçürülmədi (bax "apply, don't copy"
  qaydası) — konseptual nəticələri `Failure`/`Parallel`/`Verification` bölmələrinə köçürüldü,
  konkret task instansiyaları isə bilərəkdən indi yaradılmır — bu, yalnız skelet + qayda
  mühərriki addımıdır, eynilə STEP 5/6/7-də olduğu kimi.
- `PROJECT.sdd`-nin `tasks:` girişinin `purpose:`/`state:` sətirləri yeniləndi;
  `architecture/architecture.sdd`-nin `TASKS` komponentinin köhnə "active/planned/completed"
  rolu da düzəldildi (bax architecture/architecture.sdd -> Note).

## STEP 8 correction — `.sdd/tasks/` → `.sdd/project/tasks.sdd` (prompt/new/26.md)

Yuxarıdakı STEP 8 (root-level `.sdd/tasks/`, 6 state qovluğu) mənbə chat tərəfindən
**geri götürüldü**: task-ları qlobal/root səviyyəsində saxlamaq `.sdd`-in başqa bir
layihəyə köçürülə bilən (portable) qalması prinsipi ilə ziddiyyət təşkil edirdi — task
əslində layihə bilgisinin bir hissəsidir, ayrıca qlobal infrastruktur deyil. İstifadəçidən
yenə **"Tam sıfırla"** təsdiqi alındı (eyni STEP 1/4/5/7 pattern-i):

- **Silindi (git tarixçəsində qalır):** kök-səviyyəli `.sdd/tasks/` bütünlüklə —
  `README.md`, `tasks.sdd` (TaskLifecycle/StateToDirectory/Rules [T1]-[T17]) və 6 qovluq
  (`active/backlog/blocked/review/done/failed`).
- **Yeni yaradıldı:** `.sdd/project/tasks.sdd` — **TaskModel router**, storage deyil.
  `Ownership` ([T1]), `Storage` (konvensiya: `project/<domain>/tasks/*.sdd`, [T2]-[T5]),
  `TaskLifecycle` ([T6] — state artıq qovluqla deyil, hər task faylının öz `State:`
  sahəsi ilə izlənir), `Failure`, `TaskTypes`, `TaskContract` ([T7]), `Rules: [T8]-[T17]`,
  `Dependency`, `Review`, `Verification`, `Parallel`, `States` (StateMarker legend).
- **Prinsipial fərq:** köhnə model task state-ni **qovluq yerləşməsi** ilə izləyirdi
  (`active/`, `done/` və s.), yeni model **faylın öz sahəsi** ilə izləyir — bu, task-ın
  domen daxilində sərbəst yerləşə bilməsinə (Locality) imkan verir, root-a bağlı qalmır.
- **Konkret task instansiyaları hələ yaradılmayıb** — `.sdd/project/` altında hələ heç
  bir real domen qovluğu (`users/`, `payments/` və s.) yoxdur (STEP 4 yalnız sxem-yalnız
  fayllar yaratmışdı), ona görə `project/<domain>/tasks/*.sdd` konvensiyası hələ tətbiq
  oluna bilmir — domen yaranan kimi tətbiq olunacaq.
- `PROJECT.sdd`-də ayrıca `tasks:` `Directories:` girişi silindi, `project:` girişinin
  `purpose:`/`state:` sahələrinə qatıldı; `Navigation:`-də `tasks:` indi `@tasks` yox,
  `@project/tasks.sdd`-ə işarə edir.
  `architecture/architecture.sdd`-nin `TASKS` komponentinin `path:`/`role:` sahələri
  `../project/tasks.sdd`-ə uyğunlaşdırıldı; `Relationships`/`Allowed`/`Forbidden` qrafı
  DƏYİŞMƏDİ — yalnız TASKS-ın harada yaşadığı (path) dəyişdi (bax hər iki faylın öz
  Note-u).

## STEP 8 final — `.sdd/project/tasks.sdd` → `.sdd/tasks/tasks.sdd` (prompt/new/27.md)

Yuxarıdakı STEP 8 correction (26.md) öz növbəsində istifadəçi tərəfindən düzəldildi: mənbə
öz sözü ilə aydınlaşdırdı ki, task-ın **NECƏ** işlədiyi (lifecycle, creation, decomposition,
dependency, state, review, failure, recovery, relocation, completion) `.sdd` sisteminin ÖZ
davranışıdır — layihə bilgisi deyil. Bu, əslində root-da qalanda daha **portativdir**
(`.sdd` başqa layihəyə köçəndə bu fayl dəyişmədən gəlir), `project/`-ə köçəndə YOX —
26.md-in mülahizəsi tərsinə çevrildi. İstifadəçidən yenə **"Tam sıfırla"** təsdiqi alındı
(eyni STEP 1/4/5/7/8-correction pattern-i):

- **Silindi (git tarixçəsində qalır):** `.sdd/project/tasks.sdd` (26.md-in yaratdığı
  TaskModel router faylı) bütünlüklə.
- **Yeni yaradıldı:** `.sdd/tasks/tasks.sdd` (root-level, kök qovluq) — demək olar ki
  eyni `Ownership [T1]`, `Storage` (konvensiya `project/<domain>/tasks/*.sdd`, `[T2]-[T5]`),
  `TaskLifecycle [T6]`, `Failure`, `TaskTypes`, `TaskContract [T7]`, `Rules: [T8]-[T17]`,
  `Dependency`, `Review`, `Verification`, `Parallel`, `States` (StateMarker) məzmunu ilə —
  yalnız yeri və çərçivəsi dəqiqləşdi (bax "apply, don't copy" qaydası). STEP 8-dəki
  (25.md) 6 state-qovluğu (`active/backlog/blocked/review/done/failed`) BƏRPA OLUNMADI —
  bu fayl yalnız ENGINE-dir, storage deyil.
- **Prinsipial fərq belə formallaşdı (mənbənin öz sözü ilə):**
  - **TASK ENGINE** (`.sdd/tasks/tasks.sdd`) — "necə işləyir?" → root-level, sistemə xas.
  - **PROJECT MODEL** (`project/<domain>/tasks/*.sdd`) — "nəyə aiddir?" → layihəyə xas,
    dəyişmədi.
- Bu, 26.md-in portativlik prinsipini pozmur — əksinə tətbiq edir: engine root-da qalanda
  portativdir (sistemlə hər layihəyə gəlir), yalnız konkret task-domen xəritələnməsi
  layihəyə xasdır.
- `PROJECT.sdd`-də ayrıca `tasks:` `Directories:` girişi bərpa edildi (`./tasks`),
  `project:` girişinin `purpose:`/`state:` sahələrindən task-engine ifadələri çıxarıldı;
  `Navigation:`-də `tasks:` yenidən `@tasks`-a işarə edir (`@project/tasks.sdd` əvəzinə).
  `architecture/architecture.sdd`-nin `TASKS` komponentinin `path:`/`role:` sahələri
  `../tasks/tasks.sdd`-ə uyğunlaşdırıldı; `Relationships`/`Allowed`/`Forbidden` qrafı yenə
  DƏYİŞMƏDİ — yalnız path/role (bax hər iki faylın öz Note-u).
- Konkret task instansiyaları yenə bilərəkdən yaradılmadı — heç bir real domen qovluğu
  yoxdur (STEP 4 yalnız sxem-yalnız).

## STEP 8 refinement — `.sdd/tasks/tasks.sdd` daxili zənginləşdirmə (prompt/new/28.md)

Yuxarıdakı STEP 8 final (27.md) ilə qurulmuş `tasks/tasks.sdd` faylının YERİ və
ROLU (root-level TASK ENGINE, `project/<domain>/tasks/*.sdd` PROJECT MODEL-dən
ayrı) dəyişmədi — bu addım yalnız həmin faylın öz DAXİLİ strukturunu
zənginləşdirdi, əlavə/additive xarakterli idi, buna görə "Tam sıfırla" tələb
olunmadı (bax .sdd/architecture/architecture.sdd -> Note).

Əlavə olunanlar:
- Fayl başlığının altına açıq `Owns:`/`Scope:`/`DoesNotOwn:` blokları — TASKS
  komponentinin nəyə sahib olduğu və olmadığı indi bir baxışda görünür.
- Yeni `TaskCreation:` axını — task necə yaranır (mənbə: chain stage, decision,
  və ya manual).
- `TaskContract` zənginləşdi: `title`, `scope` sahələri əlavə olundu; yeni
  `Source:` bloku (task-ın haradan yarandığını izləyir) və task-səviyyəli
  `TaskScope:` bloku (sistem-səviyyəli `Scope:` ilə adı toqquşmasın deyə
  fərqli adlandırıldı).
- `Lifecycle` bir neçə fokuslu bloka bölündü: `BlockedFlow`, `FailureFlow`,
  `ReviewFailure`, `VerificationFailure` — hər biri öz uğursuzluq/bərpa
  ssenarisini ayrıca izah edir (əvvəlki tək-blok Lifecycle əvəzinə).
- Qaydalar yenidən nömrələndi: `Rules [T1]-[T20]` (əvvəlki [T1]-[T17]-dən
  böyüdü). Köhnə relocation qaydaları yeni `Portability:` blokuna köçürüldü;
  yeni `[T19]`/`[T20]` ENGINE-vs-MODEL ayrılığını formal qaydaya çevirir.
- Yeni `Decomposition:` bloku (böyük task-ların alt-task-lara necə
  bölünəcəyi).
- `Verification:` bloku `Completion:` adlandırıldı (daha dəqiq ad).
- Yeni `Portability:` bloku (köhnə relocation qaydalarının yeni evi).
- `@ = reference` işarəsi PROJECT.sdd-nin kanonik `State:` legend-i ilə
  sinxronlaşdırıldı.
- Yeni `Traceability:` bloku (hər task-ın layihə elementi/chain
  stage/decision-a necə izlənildiyi — bax architecture.sdd -> Principles ->
  `Traceability`).
- Yeni `Navigation:` bloku (fayl daxilində sürətli keçid).

Dəyişməyənlər: fayl başlığı `TaskEngine: SDD` olaraq saxlanıldı (28.md-nin
təklif etdiyi `Spec: TaskSystem` əvəzinə) — `.sdd`-in digər bacı fayllarının
(`architecture.sdd`, `chains.sdd`, `skills.sdd`, `prompts.sdd`) hamısında
`<Ad>: SDD` konvensiyası işlədilir, bu konvensiyaya uyğunluq üstün tutuldu.
`PROJECT.sdd` (`Directories: tasks: state:`) və
`architecture/architecture.sdd` (bu Note-un sonuncu bəndi) uyğun olaraq
referans yeniləndi; `path:`/`role:` və Relationships/Allowed/Forbidden qrafı
DƏYİŞMƏDİ.

## STEP 13 — `.sdd/architecture/principles.sdd` Global Architecture Principles (prompt/new/35.md)

`.sdd/architecture/` qovluğu STEP 3-dən bəri `architecture.sdd` (`.sdd`-in öz meta
komponent qrafı) saxlayırdı. Mənbə chunk 35 eyni qovluğa fərqli bir konsept
gətirdi — real layihə koduna baxarkən AI-nin tətbiq etməli olduğu **qlobal
mühəndislik-arxitektura prinsipləri** (modularity, coupling, dependency
direction, layering, service-extraction readiness). Mənbə bunu yenə
`architecture/architecture.sdd` adlandırırdı — bu adı overwrite etmək STEP 3-ün
komponent qrafını itirər/dublikat edərdi, ona görə "Tam sıfırla" tələb
olunmadı, sırf əlavə (sibling-file) tikinti oldu:

- **Yeni yaradıldı:** `architecture/principles.sdd` — `CorePrinciple`,
  `ArchitectureGoals`, `Rules: [AP1]-[AP18]` (mənbənin `[A1]-[A18]`-dən bu
  repo-nun digər prefiks konvensiyasına — `[C]`/`[T]`/`[D]`/`[S]`/`[R]` —
  uyğun yenidən nömrələndi), `DependencyDirection`, `DomainInteraction`,
  `Forbidden`, `ModuleBoundary`, `ServiceExtraction`, `ArchitectureValidation`,
  `ArchitectureFailure` (öz paralel failure modeli əvəzinə `chains.sdd ->
  Failure/ReviewFailure`-a istinad edir), `ProjectArchitecture`,
  `Resolution` (qlobal prinsiplər > `project/architecture.sdd` >
  `project/<domain>/architecture.sdd` > feature > implementation — eyni
  ENGINE-vs-MODEL pattern-i `chains.sdd`/`tasks.sdd`-də olduğu kimi),
  `Portability`, `Navigation`.
- **Üçlü ayrım** (`principles.sdd -> Purpose`-də tərif olunub):
  `architecture/architecture.sdd` = `.sdd`-in öz komponent qrafı (meta),
  `architecture/principles.sdd` = AI-nin İSTƏNİLƏN layihənin koduna necə
  baxmalı olduğu (qlobal, bu fayl), `project/architecture.sdd` = BU layihə
  konkret necə qurulub (konkret).
- **Ripple-update:** `architecture/architecture.sdd`-nin Purpose/`ARCHITECTURE`
  komponent rolu/Note-u yeni faylı cross-reference edəcək şəkildə redaktə
  olundu (komponent qrafının özü — Relationships/Allowed/Forbidden —
  DƏYİŞMƏDİ); `project/architecture.sdd`-nin Purpose-u üçüncü fərqi
  aydınlaşdıran bir cümlə ilə genişləndi; `PROJECT.sdd`-nin
  `Directories -> architecture` girişinin `purpose:`/`state:` sahələri
  yeniləndi və STEP 13-ü tam izah edən yeni bir Note bəndi əlavə olundu
  (bax hər üç faylın öz Note-u).
- Real layihə domenlərinə bu qaydaların konkret tətbiqi (məs. hansı domen
  hansı boundary-ni pozur) **bilərəkdən indi edilmir** — heç bir real domen
  qovluğu yoxdur (STEP 4-dən bəri sxem-yalnız), qaydalar domen yaranan kimi
  ona qarşı yoxlanılacaq.

## STEP 14 — `.sdd/project/project.sdd` + `.sdd/project/flows.sdd` (prompt/new/36.md)

Mənbə chunk 36 özünü yenə "STEP 13" adlandırdı — 34.md və 35.md-nin öz chunk-ından
sonra artıq **üçüncü ardıcıl** nömrə toqquşması. Bu repo-nun öz ardıcıl sayğacı bunu
STEP 14 kimi qəbul edir (bax `PROJECT.sdd -> Note`). Mənbə beş fayl təklif etdi:
`project.sdd`, üstəlik `map.sdd`/`dependencies.sdd`/`indexes.sdd`-in tam yenidən
yazılması. Bu üçü artıq STEP 4-dən qalma fərqli məzmunla mövcuddur və öz məqsədini
tam ödəyir — üzərinə yazmaq STEP 4-ün reset tarixçəsini itirər və
NoDuplication/SingleSourceOfTruth-u boş yerə pozardı, ona görə toxunulmadı:

- **Yeni yaradıldı:** `project/project.sdd` — mövcud Domain/Module modelinin üstünə
  **Feature** və **Component** qatlarını əlavə edir (`ProjectStructure: Project >
  Domain > Module > Feature > Component`), `Rules: [PM1]-[PM8]` (mənbənin
  `[P1]-[P10]`-dan bu repo-nun öz `[P#]` prefiksi — artıq `prompts.sdd`-ə aid —
  ilə toqquşmaması üçün yenidən nömrələndi), `CodeMapping`, `Portability`,
  `ResolutionOrder`, `NavigationFiles` (bax `project/project.sdd -> Note`).
- **Yeni yaradıldı:** `project/flows.sdd` — bu layihənin default stage ardıcıllığı
  (`AN > AR > DB > BE > API > FE > MD > QA > DO > VR`), `Rules: [F1]-[F6]`,
  `FlowResolution` (`chains.sdd` > bu fayl > domen flow > feature override) —
  `chains/chains.sdd -> ProjectFlow`-un işarə etdiyi, əvvəllər mövcud olmayan fayl
  (bax `project/flows.sdd -> Note`).
- **Ripple-edit:** `chains/chains.sdd -> ProjectFlow` yeniləndi — "Neither file
  exists yet" ifadəsi silindi, indi yalnız domen-səviyyəli referans həqiqi
  forward-reference olaraq qeyd olunur (bax `chains/chains.sdd -> Note`, STEP 14
  addendum). `project/map.sdd -> Navigation` yoxlanıldı, dəyişiklik lazım olmadı —
  artıq `chains.sdd -> ProjectFlow` üzərindən yönləndirir.
- `PROJECT.sdd`-nin `Directories -> project -> state:` sahəsi bu STEP-in
  əlavələrini qeyd etmək üçün genişləndirildi, yeni STEP 14 Note bəndi əlavə
  olundu (bax `PROJECT.sdd -> Note`).
- Konkret domen/feature/component instansiyaları bilərəkdən indi yaradılmadı —
  heç bir real domen qovluğu yoxdur (STEP 4-dən bəri sxem-yalnız), bu, yalnız
  sxem qatını genişləndirən bir addımdır.

## STEP 15 — `.sdd/project/instantiation.sdd` (prompt/new/37.md)

Mənbə chunk 37 özünü "Yeni STEP 13" adlandırdı — 34.md, 35.md və 36.md-nin öz
chunk-ından sonra artıq **dördüncü ardıcıl** nömrə toqquşması. Bu repo-nun öz
ardıcıl sayğacı bunu STEP 15 kimi qəbul edir (bax `PROJECT.sdd -> Note`). Mənbə
"Project Instantiation" adlı bir pipeline təsvir etdi: RAW PROMPT -> Prompt
Analysis -> Skill Discovery -> Architecture Analysis -> Scale Analysis ->
Complexity Analysis -> Dependency Analysis -> Project Decision -> Project
Instance, üstəlik bir `ProjectScale` (XS/S/M/L/XL) təsnifatı, skill-filtrasiya
axını (Relevant -> Applicable -> Required) və insan-təsdiqli architecture
seçim axını, "The SDD system defines how a project is understood; it does not
define what every project must look like" prinsipi ilə bağlanaraq:

- **Yeni yaradıldı:** `project/instantiation.sdd` — bu, SHAPE deyil, PROCESS-
  dir (`project/project.sdd` artıq hierarchy SHAPE-ni sahiblənir), ona görə
  `project.sdd`-nin üzərinə yazılmadı, bacı fayl kimi əlavə olundu (STEP 13-də
  `architecture/principles.sdd`-in `architecture/architecture.sdd`-ə bacı fayl
  kimi əlavə olunması ilə eyni naxış). `Purpose` (`CorePrinciple: PROJECT IS
  GENERATED, NOT PREDEFINED`), `Owns`, `DoesNotOwn`, `Pipeline` (mənbənin quyruq
  hissəsi — REQUIREMENTS-dən sonrakı BE/API/FE/MD/QA/DO/VR axını —
  `chains.sdd`/`flows.sdd`-in artıq sahiblədiyi məzmunu təkrarladığı üçün
  saxlanılmadı, yalnız RAW PROMPT -> PROJECT INSTANCE hissəsi qaldı),
  `ProjectScale` (XS-XL, mücərrəd tərif kimi — mənbənin konkret todo-app/SaaS
  nümunələri ümumiləşdirildi), `SkillFiltering`, `ArchitectureSelection`,
  `Rules: [PI1]-[PI6]` (yeni `[PI]` prefiksi — bütün mövcud prefikslərə qarşı
  toqquşmasız təsdiqləndi) yaradıldı.
- **Ripple-edit:** `project/project.sdd` yeniləndi (üzərinə yazılmadı) —
  `Purpose`, `DoesNotOwn`, yeni `[PM9]` qaydası (spekulyativ hierarchy
  doldurmağı qadağan edir), `Portability`, `NavigationFiles` yeni faylı
  cross-reference edir (bax `project/project.sdd -> Note`, "STEP 15 addendum").
- **Ripple-edit:** `PROJECT.sdd`-yə mənbənin bağlanış prinsipi yeni `[R12]`
  qaydası kimi əlavə olundu (instantiation.sdd deyil, PROJECT.sdd özü — bu,
  repo-nun constitution-səviyyəli faylıdır və `[R1]-[R11]` artıq eyni tipli
  fundamental prinsipləri saxlayır); `Directories -> project -> state:` sahəsi
  genişləndirildi, yeni STEP 15 Note bəndi əlavə olundu (bax `PROJECT.sdd ->
  Note`).
- Konkret domen/module/feature instansiyaları bilərəkdən indi yaradılmadı —
  bu, yalnız "necə qərar veriləcək?" pipeline-ını əlavə edən bir addımdır,
  "nə qərar verildi?" sualının cavabı deyil.

## STEP 16 — düzəliş paketi: architecture, chains, instantiation, skills (prompt/new/38.md)

Mənbə chunk 38 dörd ayrı düzəliş təklif etdi, yeni fayl yaratmadan, mövcud STEP
13/14/15 fayllarına əlavə/yumşaltma şəklində:

- **`architecture/principles.sdd`:** `[AP18]` — əvvəlki "modular monolith is
  the default architecture" ifadəsi qeydsiz-şərtsiz default kimi oxuna
  bilərdi; yumşaldıldı — proporsionallıq qaydası (scope/complexity/growth/
  operational constraints-ə uyğun, heç bir stil default təyin olunmur) + yeni
  `ArchitectureSelection:` bölməsi (Criteria/Principle/Examples), Rules-dan
  dərhal sonra. Mənbənin ayrıca `ExtractionReadiness:` bəndi TƏKRAR
  OLUNMADI — mövcud `ServiceExtraction:`/`Important:` (STEP 13) artıq eyni
  qeydi saxlayır (bax `architecture/principles.sdd -> Note`).
- **`chains/chains.sdd`:** `[C22]` və `DefaultFlow` addendum əlavə olundu
  (bax `chains/chains.sdd -> Note`, STEP 16 bəndi).
- **`project/instantiation.sdd`:** yeni `Evolution:` bölməsi (Rules-dan
  əvvəl, `ArchitectureSelection` ilə eyni yerləşdirmə naxışı) + `[PI7]`
  (dəyişikliyə görə pipeline-a yenidən giriş), `[PI8]` (artıq təsdiqlənmiş
  bilginin sükutla ləğvi qadağandır), `[PI9]` (gate-lərdəki insan qərarları
  gələcək generasiyaya bağlayıcı geri-bildirim kimi qayıdır). `State: STEP 15`
  → `STEP 16`. Mənbənin "kiçik layihə üçün lazımsız distributed complexity-dən
  qaçın" bəndi TƏKRAR OLUNMADI — `architecture/principles.sdd ->
  ArchitectureSelection` və bu faylın öz `[PI2]`-si artıq eyni qaydanı
  saxlayır.
- **`skills/skills.sdd`:** yeni `[S17]` — kataloqda mövcud olmaq hər layihəyə
  tətbiq olunmaq demək deyil; tətbiqolunanlıq `project/instantiation.sdd ->
  SkillFiltering/[PI5]`-in Relevant → Applicable → Required daraltmasına
  həvalə edilir (cross-reference, təkrar deyil), `[S16]`-dan dərhal sonra.

Dördü də NoDuplication prinsipinə (bax `architecture/architecture.sdd ->
Principles`) əsaslanır: hər düzəliş ya mövcud qaydanı yumşaldır, ya da mövcud
başqa fayla istinad əlavə edir — heç biri yeni fayl yaratmadı və heç bir
mövcud məzmunu təkrarlamadı.

## STEP 17 — `.sdd/prompts/prompts.sdd` genişlənməsi (prompt/new/39.md)

Mənbə chunk 39 yeni fayl deyil, mövcud `prompts/prompts.sdd`-in (STEP 7)
scope-una düşən bir genişlənmə təklif etdi — prompt-un HANSI FORMADA gələ
biləcəyi və gəldikdən sonra necə müqayisə/ziddiyyət-yoxlanılacağı barədə.
Bu, STEP 16-dakı düzəliş paketi ilə eyni naxış idi (mövcud fayla additive
əlavə, yeni fayl yox, "Tam sıfırla" tələb olunmadı):

- **`prompts/prompts.sdd`-ə əlavə olundu:** `InputForms:` (prompt-un gələ
  biləcəyi 7 forma — bir cümlə, bir istifadəçi hekayəsi, bir bug report,
  bir texniki tələb, bir sərbəst mətn, bir səs/transkript, bir mövcud
  sənəd parçası), `Rules: [P21]-[P24]` (forma ≠ mürəkkəblik, tələb ≠
  fərziyyə, qeyri-müəyyənlik heç vaxt sükutla həll olunmur, NoBlindExecution),
  `ConflictResolution:` (`[P11]`-in "necə?" sualına sabit ardıcıllıqla
  cavab: detect -> compare -> impact -> resolve-or-escalate),
  `Branches:` (ExistingProject vs NewProject fərqli axınları), `ImpactAreas:`
  (mövcud `Impact:` bölməsini tamamlayan bir checklist), `Navigation:`
  (`project/instantiation.sdd -> Navigation`-un eyni naxışı ilə).
- Qayda nömrələnməsi `[P20]`-dən davam etdi, yeni prefiks açılmadı.
- **Təkrarlanmadı (bax NoDuplication, `architecture/architecture.sdd ->
  Principles`):** insan qərarı tələb edən sərhədlər artıq
  `project/instantiation.sdd` və `PROJECT.sdd -> HumanDecision`-da mövcuddur
  — burada yalnız cross-reference edildi.
- **Bilərəkdən təxirə salındı:** mənbənin öz "Prompt Registry" özü-özünü
  zənginləşdirmə ideyası — mənbənin özünün də dediyi kimi, gələcək bir
  STEP-in işidir.
- `PROJECT.sdd`-nin `Directories -> prompts -> state:` sahəsi bu STEP-in
  əlavələrini qeyd etmək üçün genişləndirildi, yeni STEP 17 Note bəndi
  əlavə olundu (bax `PROJECT.sdd -> Note`).
- Heç bir yeni `[R]` qaydası lazım olmadı — bu STEP yalnız mövcud bir
  qayda dəstini genişləndirdi, yeni konstitusiya-səviyyəli məsələ açmadı.

## STEP 18 — `.sdd/skills/skills.sdd` genişlənməsi (prompt/new/40.md)

Mənbə chunk 40 tam yeni bir `Spec: SkillSystem` sənədi (öz `[SK1]-[SK14]`
nömrələnməsi ilə) təklif etdi, amma bu mövcud `skills/skills.sdd`-in
(STEP 6, STEP 16) scope-una düşür — eyni STEP 16/17 naxışı: additive
genişləndirmə, yeni fayl/prefiks yox:

- **`skills/skills.sdd`-ə əlavə olundu:** 4 yeni SkillDomain
  (`architecture`, `security`, `performance`, `engineering` — hər biri
  üçün fiziki qovluq + `.gitkeep`, STEP 6-nın 8-domain presedentinə
  uyğun, indi cəmi 12 domain), `Rules: [S18]-[S24]` (seçim faktorları,
  architecture-domain-in digər domenləri məhdudlaşdıra bilməsi, conflict
  detection vs resolution ayrımı, dependency-lərin tam həll olunması,
  icra izlənilə bilənliyi, output-un yarada biləcəyi artefakt növləri),
  `Applicability:` (`applicable/optional/unnecessary/blocked/
  conflicting`), `SkillContract`-a `Scope`/`ConflictsWith`/`Severity`
  sahələri, `SkillPriority:`, `SkillConflict:`, `SkillOutput:` (+
  `SkillToTask`/`SkillToChain`), `Evolution:`, `SkillDiscovery:`,
  `ComplexityControl:`, və genişləndirilmiş `Execution:` axını (discover
  ilə başlayır, record ilə bitir).
- Qayda nömrələnməsi `[S17]`-dən davam etdi, yeni prefiks açılmadı.
- **Təkrarlanmadı (bax NoDuplication):** mənbənin `Reuse:`/`Portability:`
  bölmələri (artıq `[S3]`/`[S10]`-da var), tam `SkillSelection:` funnel-i
  (artıq `project/instantiation.sdd -> SkillFiltering`/`[PI5]`-in
  işidir), `SkillDependency:` relation tipləri (`requires`/`supports`/
  `conflicts`/`enhances` — artıq `[S7]`/`[S8]`/`[S14]`/`[S15]`/`[S21]`/
  `[S22]`-də əhatə olunub), və mənbənin sonundakı top-level `.sdd`
  mexanizm diaqramı (artıq `architecture/architecture.sdd`-in işidir,
  STEP 3/13).
- **Bilərəkdən təxirə salındı:** konkret skill fayllarının (məsələn
  `architecture/ddd/skill.md`) real yazılması — STEP 6-nın "yalnız
  skelet + qayda mühərriki" qərarı hələ qüvvədədir; mənbənin
  `SkillChain:` illüstrativ nümunəsi bu bölmədə sənədləşdirildi, spec
  məzmunu kimi əlavə olunmadı (bax yuxarı, misal üçün nümunə).
- `PROJECT.sdd`-nin `Directories -> skills -> state:` sahəsi bu STEP-in
  əlavələrini qeyd etmək üçün genişləndirildi, yeni STEP 18 Note bəndi
  əlavə olundu (bax `PROJECT.sdd -> Note`).
- Heç bir yeni `[R]` qaydası lazım olmadı — bu STEP yalnız mövcud bir
  qayda dəstini genişləndirdi, yeni konstitusiya-səviyyəli məsələ açmadı.

## STEP 19 — `.sdd/tasks/tasks.sdd` genişlənməsi (prompt/new/41.md)

Mənbə chunk 41 yenidən tam yeni bir `Spec: TaskSystem` sənədi təklif etdi
(öz fayl-split və alternativ state-cədvəli ideyaları ilə), amma bu mövcud
`tasks/tasks.sdd`-in (STEP 8 final, STEP 8 refinement) scope-una düşür —
eyni STEP 16/17/18 naxışı: additive genişləndirmə, yeni fayl/prefiks yox:

- **`tasks/tasks.sdd`-ə əlavə olundu:** `TaskResolution:` (Task > Project
  Context > Applicable Skills > Dependencies > Chain > Implementation —
  artıq YARANMIŞ bir task-ın icraya başlamazdan ƏVVƏL öz kontekstini necə
  HƏLL etdiyi, TaskCreation-dan fərqli mərhələ), `TaskKnowledge:` (`skills`
  sahəsinin referans-only olduğunu izah edir, `[T18]` NoDuplication-ı
  gücləndirir), `NoLoop:`/`Escalation:` (yeni `attempts` sahəsi sayır,
  layihəyə xas retry-limit aşılanda kanonik `?` DECISION_REQUIRED
  state-inə keçid — YENİ simvol deyil, bax `state/state.sdd -> [S2]`),
  `TaskContract`-a iki yeni `Optional` sahə (`skills`, `attempts`),
  `Portability:`-ə bir körpü cümləsi ("dependencies MUST be re-resolved"
  mexanizmi indi `TaskResolution`-da formallaşıb).
- Qayda nömrələnməsi `[T20]`-dən davam etdi (`[T21]`, `[T22]`), yeni
  prefiks açılmadı.
- **Rədd edildi:** fayl-split təklifi (`tasks.sdd`+`lifecycle.sdd`+
  `states.sdd`+`templates/task.sdd`) — STEP 11 -> STEP 12-dəki eyni
  "chains split, sonra tək fayla geri qayıtdı" presedentini təkrarlayardı
  (bax `chains/chains.sdd -> Note`); alternativ 8 simvollu task-state
  cədvəli — kanonik `state/state.sdd` simvollarını yenidən tərif edərdi
  (`[S2]` pozulardı); konkret nümunə task faylı (`#PAY-042.sdd`) —
  "skelet + qayda mühərriki, konkret instansiya yox" prinsipi qorunur,
  hələ heç bir real domen qovluğu yoxdur.
- `PROJECT.sdd`-nin `Directories -> tasks -> state:` sahəsi bu STEP-in
  əlavələrini qeyd etmək üçün genişləndirildi, yeni STEP 19 Note bəndi
  əlavə olundu (bax `PROJECT.sdd -> Note`).
- Heç bir yeni `[R]` qaydası lazım olmadı — bu STEP yalnız mövcud bir
  qayda dəstini genişləndirdi, yeni konstitusiya-səviyyəli məsələ açmadı.

## Struktur (prompt/new/17.md → 18.md ilə təsdiqlənib, STEP 1 skeleton)

```
.sdd/
├── PROJECT.sdd     — .sdd sisteminin ana entry point-i
├── project/        — real project-in .sdd modelini saxlayır (WHAT/WHY/WHERE; project.sdd — Feature/Component qatları (STEP 14), flows.sdd — bu layihənin default stage axını (STEP 14), instantiation.sdd — prompt-dan project instansiyasına gedən qərar pipeline-ı (STEP 15))
├── architecture/   — architecture.sdd (.sdd-in öz meta komponent qrafı, STEP 3) + principles.sdd (qlobal engineering-arxitektura prinsipləri, STEP 13)
├── chains/         — işlərin mərhələ-mərhələ keçidlərini saxlayır (chain-tipi modeli — feature/bugfix/change)
├── skills/         — AI-nin işi necə görəcəyini müəyyən edən skill-lər (skills.sdd router + 8 boş domain, STEP 6)
├── prompts/        — daxil olan və saxlanılan prompt intelligence (prompts.sdd router + 5 qovluq, STEP 7)
├── tasks/          — task engine: necə yaranır/icra olunur/tamamlanır (tasks.sdd, root-level, STEP 8 final)
├── decisions/       — human decision və architecture qərarları
└── state/          — .sdd sisteminin ümumi vəziyyət məlumatları (boş, STEP 1)
```

Çox vacib ayrım (chunk 17-nin öz sözü ilə): `.sdd/project/` **real project deyil** —
bu, PROJECT MODEL-dir. `.sdd/project/payment/` real `payment/` kod qovluğu deyil,
sadəcə "Payment project-də haradadır, hansı komponentləri var, hansı DB/API ilə
əlaqəlidir?" sualına AI üçün model verir (bax həmçinin `sddra-sdd-only-no-real-scaffold`).

## Status (prompt/new/41.md-ə qədər)

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
- `+` **`chains/` STEP-11 genişlənmə (prompt/new/33.md):** `feature.chain`/`bugfix.chain`/
  `change.chain` `chains/templates/*.sdd`-ə köçürüldü, ortaq stage-lər `chains/stages/*.sdd`-ə
  çıxarıldı (NoDuplication), ingiliscəyə tərcümə edildi; köhnə `.chain` faylları silindi
  (git tarixçəsində qalır).
- `+` **`chains/` STEP-12 geri qaytarma (prompt/new/34.md):** STEP-11-in `templates/`/`stages/`
  bölünməsi ləğv edildi (silindi, git tarixçəsində qalır); `chains.sdd` tək fayla
  qaytarıldı — `Stages:` inline, qlobal chain-tipi dispatch yox, `DefaultFlow` arayış
  ardıcıllığı, yeni `ProjectFlow`/`FlowResolution` real axını `project/flows.sdd`-ə həvalə edir.
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
- `+` **`tasks/` STEP-8 "Tam sıfırla" (prompt/new/25.md) — sonra geri götürülüb:** köhnə
  `README.md` (dangling `system/MASTER.md` istinadı, `proposals/`-gated model, `PAY-001.N`
  formatı) sıfırlanıb; `tasks.sdd` router (`TaskLifecycle`, `StateToDirectory`, `Failure`,
  `TaskTypes`, `TaskContract`, `Rules: [T1]-[T17]`, `Dependency`, `Review`, `Verification`,
  `Parallel`) + 6 qovluq (`active/backlog/blocked/review/done/failed`) + qısa `README.md`
  yaradıldı. Bu struktur özü aşağıdakı STEP 8 correction ilə tamamilə silindi — tarixi qeyd
  kimi saxlanılır.
- `+` **`project/tasks.sdd` STEP-8 correction "Tam sıfırla" (prompt/new/26.md):** yuxarıdakı
  root-level `.sdd/tasks/` (6 qovluq + router + README) istifadəçi təsdiqi ilə tamamilə
  silindi (git tarixçəsində qalır) — task-ları qlobal saxlamaq `.sdd`-nin portativlik
  prinsipi ilə ziddiyyət təşkil edirdi. Yerinə `project/tasks.sdd` yaradıldı — TaskModel
  router (storage deyil): `Ownership [T1]`, `Storage` (konvensiya `project/<domain>/tasks/
  *.sdd`, `[T2]-[T5]`), `TaskLifecycle [T6]` (state artıq qovluqla deyil, faylın öz `State:`
  sahəsi ilə izlənir), `Failure`, `TaskTypes`, `TaskContract [T7]`, `Rules: [T8]-[T17]`,
  `Dependency`, `Review`, `Verification`, `Parallel`, `States` (StateMarker). `PROJECT.sdd`
  və `architecture/architecture.sdd` uyğun olaraq yeniləndi (bax hər ikisinin öz Note-u).
  Konkret task instansiyaları bilərəkdən hələ edilmədi (heç bir real domen qovluğu yoxdur).
- `+` **`tasks/tasks.sdd` STEP-8 final "Tam sıfırla" (prompt/new/27.md):** yuxarıdakı
  `project/tasks.sdd` (26.md) istifadəçi mənbə sözü ilə düzəldildi — task-ın NECƏ işlədiyi
  (lifecycle/creation/decomposition/dependency/state/review/failure/recovery/relocation/
  completion) `.sdd`-nin öz sistem davranışıdır, layihə bilgisi deyil, root-da qalanda daha
  portativdir. `.sdd/project/tasks.sdd` tamamilə silindi (git tarixçəsində qalır); yerinə
  `.sdd/tasks/tasks.sdd` yaradıldı — demək olar ki eyni Ownership/Storage/TaskLifecycle/
  Failure/TaskTypes/TaskContract/Rules `[T1]-[T17]`/Dependency/Review/Verification/Parallel/
  States məzmunu ilə, yalnız yeri və çərçivəsi dəqiqləşdi: TASK ENGINE (bu fayl, "necə
  işləyir?") vs PROJECT MODEL (`project/<domain>/tasks/*.sdd`, "nəyə aiddir?", dəyişmədi).
  `PROJECT.sdd` (`Directories: tasks:` bərpa, `Navigation: @tasks`) və
  `architecture/architecture.sdd` (`TASKS` komponentinin `path:`/`role:`) uyğun olaraq
  yeniləndi (bax hər ikisinin öz Note-u); `Relationships`/`Allowed`/`Forbidden` qrafı yenə
  DƏYİŞMƏDİ. Konkret task instansiyaları yenə bilərəkdən yaradılmadı.
- `+` **`tasks/tasks.sdd` STEP-8 refinement (prompt/new/28.md):** yuxarıdakı STEP-8
  final faylı əlavə/additive şəkildə zənginləşdirildi ("Tam sıfırla" tələb olunmadı)
  — yeni `Owns`/`Scope`/`DoesNotOwn` top-level blokları, `TaskCreation` axını, daha
  zəngin `TaskContract` (title/scope), `Source`, task-səviyyəli `TaskScope`,
  `Lifecycle`-ın `BlockedFlow`/`FailureFlow`/`ReviewFailure`/`VerificationFailure`-a
  bölünməsi, yenidən nömrələnmiş `Rules [T1]-[T20]` (köhnə relocation qaydaları yeni
  `Portability` blokuna keçdi, yeni `[T19]`/`[T20]` ENGINE-vs-MODEL ayrılığını
  formallaşdırır), yeni `Decomposition`, `Verification` → `Completion` adı, yeni
  `Traceability` və `Navigation` blokları. Fayl başlığı `TaskEngine: SDD` olaraq
  saxlanıldı (bacı fayllarla konvensiyaya uyğun). `path:`/`role:` və
  Relationships/Allowed/Forbidden qrafı DƏYİŞMƏDİ (bax .sdd/architecture/architecture.sdd
  -> Note); `PROJECT.sdd` uyğun referans ilə yeniləndi.
- `+` **`architecture/principles.sdd` STEP-13 yaradılma (prompt/new/35.md):** qlobal
  mühəndislik prinsipləri (`AP1`-`AP18`) yeni fayl olaraq yaradıldı — ENGINE
  (`architecture/architecture.sdd` — `.sdd`-in öz komponent qrafı) ilə MODEL
  (`project/architecture.sdd` — bu layihənin konkret arxitekturası) arasındakı
  fərqi formallaşdırır, `Resolution` bloku ilə. Heç bir mövcud fayl silinmədi/
  üzərinə yazılmadı — sırf əlavə edici addım idi.
- `+` **`project/project.sdd` + `project/flows.sdd` STEP-14 (prompt/new/36.md):**
  `map.sdd`/`dependencies.sdd`/`indexes.sdd` (STEP-4-dən qalma) toxunulmadı;
  `project.sdd` yeni yaradıldı — `Project > Domain > Module > Feature > Component`
  modelinə Feature/Component qatları əlavə edir, `Rules: [PM1]-[PM8]`; `flows.sdd`
  yeni yaradıldı — bu layihənin default stage axını (`AN > AR > DB > BE > API >
  FE > MD > QA > DO > VR`), `Rules: [F1]-[F6]`. `chains/chains.sdd -> ProjectFlow`
  yeniləndi — `../project/flows.sdd` artıq mövcuddur, yalnız domen-səviyyəli
  referans hələ də həqiqi forward-reference olaraq qalır. Ətraflı bax hər üç
  faylın öz Note bölməsinə və yuxarıdakı "STEP 14" bölməsinə.
- `+` `decisions/README.md` — toxunulmadı.
- `+` **`project/instantiation.sdd` STEP-15 yaradılma (prompt/new/37.md):** prompt-dan
  project instansiyasına gedən qərar pipeline-ı (`CorePrinciple: PROJECT IS GENERATED,
  NOT PREDEFINED`), `ProjectScale` (XS-XL), `SkillFiltering`, `ArchitectureSelection`,
  `Rules: [PI1]-[PI6]` yeni fayl olaraq yaradıldı. `project/project.sdd` (yeni `[PM9]`)
  və `PROJECT.sdd` (yeni `[R12]`) ripple-edit ilə yeniləndi. Heç bir mövcud fayl
  silinmədi/üzərinə yazılmadı. Ətraflı bax `project/instantiation.sdd -> Note` və
  yuxarıdakı "STEP 15" bölməsinə.
- `+` **STEP 16 düzəliş paketi (prompt/new/38.md):** `architecture/principles.sdd`
  (`[AP18]` yumşaldıldı + yeni `ArchitectureSelection:` bölməsi), `chains/chains.sdd`
  (`[C22]` + `DefaultFlow` addendum), `project/instantiation.sdd` (yeni `Evolution:`
  bölməsi + `[PI7]-[PI9]`, `State: STEP 16`), `skills/skills.sdd` (yeni `[S17]`) —
  dördü də mövcud fayllara additive düzəliş, heç bir yeni fayl yaradılmadı. Ətraflı
  bax hər faylın öz Note bölməsinə və yuxarıdakı "STEP 16" bölməsinə.
- `+` **STEP 17 — `prompts/prompts.sdd` genişlənməsi (prompt/new/39.md):** yeni
  `InputForms:` bölməsi (7 giriş forması), `Rules: [P21]-[P24]`,
  `ConflictResolution:`, `Branches:`, `ImpactAreas:`, `Navigation:` — hamısı
  mövcud `prompts.sdd`-ə additive düzəliş, yeni fayl/prefiks yaradılmadı.
  Ətraflı bax `prompts/prompts.sdd -> Note` və yuxarıdakı "STEP 17" bölməsinə.
- `+` **STEP 18 — `skills/skills.sdd` genişlənməsi (prompt/new/40.md):** 4 yeni
  SkillDomain (`architecture`/`security`/`performance`/`engineering`, hər biri
  fiziki qovluq + `.gitkeep`, indi cəmi 12 domain), `Rules: [S18]-[S24]`,
  `Applicability:`, `SkillContract`-a `Scope`/`ConflictsWith`/`Severity`,
  `SkillPriority:`, `SkillConflict:`, `SkillOutput:`, `Evolution:`,
  `SkillDiscovery:`, `ComplexityControl:`, genişləndirilmiş `Execution:` axını —
  mövcud `[S1]-[S17]` nömrələnməsinin davamı, yeni prefiks açılmadı.
  `PROJECT.sdd -> Directories -> skills -> state` və `Note` bölməsi də
  uyğun yeniləndi. Ətraflı bax `skills/skills.sdd -> Note` və yuxarıdakı
  "STEP 18" bölməsinə.
- `+` **STEP 19 — `tasks/tasks.sdd` genişlənməsi (prompt/new/41.md):** yeni
  `TaskResolution:` bölməsi (`[T21]`), `TaskKnowledge:` bölməsi,
  `NoLoop:`/`Escalation:` bölmələri (`[T22]`, kanonik `?` state-inə
  istinad), `TaskContract`-a `skills`/`attempts` Optional sahələri,
  `Portability:`-ə körpü cümləsi — hamısı mövcud `tasks.sdd`-ə additive
  düzəliş, yeni fayl/prefiks yaradılmadı. Ətraflı bax `tasks/tasks.sdd ->
  Note` və yuxarıdakı "STEP 19" bölməsinə.
- `!` `state/` — hələ boş (yalnız `.gitkeep`), məzmun növbəti "next"-lərdə müəyyənləşəcək.

Hər növbəti "next" bu faylları ya təsdiqləyəcək, ya da düzəliş edəcək.
