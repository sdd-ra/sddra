# .sdd/ — Specification-Driven Development Engine

Bu qovluq `chat_history.md`-nin (`prompt/new/1.md … 89.md`) ardıcıl replay-i əsasında,
**hər "next" komandasından sonra** tikilir və yenidən dəqiqləşdirilir. Model tamamlanmış
deyil — canlı, artan bir sənəddir.

- **Mənbə:** `prompt/new/1.md` → hazırda `prompt/new/19.md`-ə qədər oxunub (89 fayldan).
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

**Aşkarlanmış, hələ düzəldilməmiş qalıq (qabaqlanmır):** `project/architecture.sdd` və
`project/map.sdd` hələ köhnə `protocol/*.sdd`, `module/flow.sdd` ifadələrinə istinad edir —
bu, `PROJECT.sdd`-də bir Note kimi qeyd olunub, lakin fayllar özləri toxunulmayıb; yalnız
uyğun bir gələcək "next" bunu həll edəcək.

## Struktur (prompt/new/17.md → 18.md ilə təsdiqlənib, STEP 1 skeleton)

```
.sdd/
├── PROJECT.sdd     — .sdd sisteminin ana entry point-i
├── project/        — real project-in .sdd modelini saxlayır (WHAT/WHY/WHERE)
├── architecture/   — .sdd sisteminin və project architecture qaydalarının modeli (boş, STEP 1)
├── chains/         — işlərin mərhələ-mərhələ keçidlərini saxlayır (feature-per-chain şablonu)
├── skills/         — AI-nin işi necə görəcəyini müəyyən edən skill-lər (boş, STEP 1)
├── prompts/        — daxil olan və saxlanılan prompt intelligence
├── tasks/          — aktiv / planlanmış / tamamlanmış işlərin vəziyyəti
├── decisions/       — human decision və architecture qərarları
└── state/          — .sdd sisteminin ümumi vəziyyət məlumatları (boş, STEP 1)
```

Çox vacib ayrım (chunk 17-nin öz sözü ilə): `.sdd/project/` **real project deyil** —
bu, PROJECT MODEL-dir. `.sdd/project/payment/` real `payment/` kod qovluğu deyil,
sadəcə "Payment project-də haradadır, hansı komponentləri var, hansı DB/API ilə
əlaqəlidir?" sualına AI üçün model verir (bax həmçinin `sddra-sdd-only-no-real-scaffold`).

## Status (prompt/new/19.md-ə qədər)

- `~` **STEP 1 skeleton reset (prompt/new/17.md) + təsdiq (prompt/new/18.md):** kök quruluş
  yuxarıdakı 9 elementə endirildi və chunk 18-də eyni siyahı ilə təsdiqləndi. `architecture/`,
  `skills/`, `state/` boş yaradıldı. Əvvəlki `protocol/`, `system/`,
  `backend/frontend/mobile/qa/devops/` silindi (git tarixçəsində qalır).
- `+` "Engineering Intelligence Layer" prinsipi (prompt/new/18.md) — `.sdd`-in ümumi rolunun
  qısa tərifi olaraq README-yə əlavə olundu, real qayda faylı deyil.
- `+` **`PROJECT.sdd` STEP-2 rewrite (prompt/new/19.md):** router/constitution roluna
  uyğunlaşdırıldı — `Directories:`/`Navigation:`/`NavigationFlow:`/`Rules: [R1]-[R11]` əlavə
  olundu, köhnə `Reference:/Disciplines:/SkillModel:/Flow:/FlowRules:` bloku silindi.
- `?` `project/architecture.sdd` və `project/map.sdd`-də `protocol/*.sdd`, `module/flow.sdd`-ə
  dangling istinadlar qalır — bilinən, təxirə salınmış qalıq (bax yuxarıda).
- `+` `project/` alt-ağacı — toxunulmadı, əvvəlki bütün iş (map.sdd, modules.sdd,
  dependencies.sdd, architecture.sdd + LayerArchitecture, integrations.sdd,
  payment/{payment,db,api,cases}.sdd, course/course.sdd stub, user/user.sdd stub) qüvvədədir.
- `+` `chains/_TEMPLATE.feature.sdd`, `prompts/README.md`, `tasks/README.md`,
  `decisions/README.md` — toxunulmadı.
- `!` `architecture/`, `skills/`, `state/` — boş (yalnız `.gitkeep`), məzmun növbəti
  "next"-lərdə müəyyənləşəcək.
- `?` Əvvəlki `protocol/` (symbols/stages/rules) və silinmiş skill-HOW qovluqlarının
  yeni skeletdə hara "köçəcəyi" hələ mənbə tərəfindən deyilməyib — qabaqlanmır.

Hər növbəti "next" bu faylları ya təsdiqləyəcək, ya da düzəliş edəcək.
