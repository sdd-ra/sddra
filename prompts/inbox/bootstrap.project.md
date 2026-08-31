# SpecDD project specific overrides

> Bu fayl `bootstrap.md`-in (dəyişdirilməz framework qaydaları) ÜSTÜNƏ
> gəlir. `bootstrap.md`-i heç vaxt redaktə etmə — o, upstream SpecDD
> layihəsinin bir hissəsidir və `specdd update` ilə yenilənir. Layihəyə
> xas BÜTÜN qaydalar BURADA yaşayır.

---

## 0. Bu layihənin konteksti

Bu, çoxdilli tədris platformasıdır (`BE` Go / `FE` + `MD` frontend-mobile /
`TS` test / `DO` infra). Əvvəllər prosesin qaydaları `prompts/sdd/00-12`
altında sərbəst-mətn (prose) fayllar kimi saxlanılırdı. Bu overrides
həmin qaydaları SpecDD-nin rəsmi `.sdd` dilinə və bootstrap modeلinə
KÖÇÜRÜR — məna dəyişmir, yalnız format və icra mexanizmi dəyişir.

Köhnə `prompts/sdd/00-12` faylları **arxivə** keçir (`prompts/_archive/sdd-v1/`),
silinmir — tarixi qərarların səbəbini izah edən referans kimi qalır.

---

## 1. Spec səviyyələri və adlandırma qaydası

Layihənin domen strukturu üçün SpecDD-nin ümumi `module.sdd`/`feature.sdd`
adları əvəzinə aşağıdakı layihəyə-xas adlandırma istifadə olunur (bu,
`LANGUAGE.md`-dəki "Common Spec Roles" bölməsinin icazə verdiyi layihə
konvensiyasıdır — SpecDD adları məcburi etmir, yalnız root spec basename
qaydası məcburidir):

```text
BE/internal/[modul]/module.sdd     -> MODULE_XX-in BE-dəki spec-i
FE/apps/[portal]/[modul]/module.sdd -> MODULE_XX-in FE-dəki spec-i
MD/[modul]/module.sdd              -> MODULE_XX-in MD-dəki spec-i

BE/internal/[modul]/[case].sdd     -> CASE_XX_XX-in BE-dəki spec-i
                                       (eyni qovluqda [case].go ilə
                                       eyni basename)
```

`CASE_XX_XX` SpecDD-nin `feature.sdd` roluna uyğundur: istifadəçiyə
görünən/biznes qabiliyyəti təsvir edir. `MODULE_XX` isə `module.sdd`
roludur: bağlı domen sahəsi.

Root spec, seçilmiş content root-un adına görə (SpecDD-nin məcburi
qaydası) tələb olunur — məs. layihə kökü `edtech-platform/` olarsa,
`edtech-platform/edtech-platform.sdd`.

---

## 2. CASE spec şablonu (05/06/08-in yerinə keçir)

Hər `CASE_XX_XX.sdd` bu quruluşu izləyir — bu, əvvəlki
`00_spec.md + 01_tasks.md + 02_status.md` üç-fayllı formatını
BİR `.sdd` faylına birləşdirir:

```sdd
Spec: [Case adı]

Purpose:
  [Case-in nə üçün mövcud olduğu, bir cümlə]

Owns:
  ./[fayl].go
  ./[fayl]_test.go

Must:
  [qəbul meyarları, MASTER_PROMPT-dan]

Forbids:
  [bu case-in toxunmamalı olduğu asılılıqlar]

Tasks:
  [ ] #1 [tapşırıq]
  [ ] #2 [tapşırıq]

Done when:
  BDD ssenariləri testlə əhatə olunub.
  Security-review kritik/yüksək tapıntısı qalmayıb.
  Ultra-review arxitektura pozuntusu qalmayıb.

Scenario: [BDD ssenari adı — köhnə .feature faylının yerini tutur]
  Given [şərt]
  When [hərəkət]
  Then [nəticə]
```

**Köçürmə qeydi:** əvvəlki `TS/integration/api/bdd/*.feature` faylları
bu `Scenario:` bölmələrinə köçürülür — SpecDD-nin öz Gherkin-bənzər
`Scenario` sintaksisi bizim 05/06-dakı BDD formatını əvəz edir, ayrıca
`.feature` faylına ehtiyac qalmır.

---

## 3. Task marker-ləri = bizim state machine-in sadələşdirilmiş forması

`11_GLOBAL_STATE_MACHINE.md`-də əl ilə qurduğumuz state-lərin çoxu
artıq SpecDD-nin doğma `Tasks` marker sistemi ilə örtülür:

```text
[ ]  open              -> bizim TASK_READY / IN_PROGRESS
[x]  done               -> bizim CASE_COMPLETE
[-]  skipped            -> bizim NOT_APPLICABLE (CHAIN-018 həlli — artıq
                            pulsuz, doğma dəstəklənir)
[!]  blocked            -> bizim BLOCKED / WAITING_SECURITY_DECISION /
                            WAITING_ARCHITECTURE_DECISION
[?]  needs decision      -> bizim WAITING_FIX-in "insan qərarı lazımdır"
                            variantı
```

**Layihəyə-xas əlavə qayda (SpecDD öz-özünə buna sahib deyil):**
`[!]` və ya `[?]` işarəli hər task-ın DAVAMINDA (continuation sətri,
4 boşluqla) SƏBƏB yazılmalıdır:

```text
Tasks:
  [!] #4 Ödəniş escrow hesablaması
      Səbəb: security-review kritik tapıntı, issue #SEC-004,
      attempt_count: 2/3, insan qərarı gözlənilir.
```

**Cycle guard (CHAIN-009-un davamı):** eyni task 3-cü dəfə (`attempt_count`)
`[!]`-ə düşürsə, agent DAYANIR və Operator-a bildirir — bu, `bootstrap.md`-in
"Stop and ask the Operator" qaydasının layihəyə-xas genişlənməsidir.

---

## 4. Skil zənciri icra prosedurası (08-in yerinə keçir)

`bootstrap.md`-in "Execution Contract" (`Resolve -> Read -> Authorize ->
Change -> Verify -> Report`) bizim layihədə hər CASE üçün `Change`
addımını aşağıdakı ALT-ardıcıllıqla DOLDURUR:

```text
Change addımı bir CASE spec-i üzərində işləyəndə:

  1. FEATURE — spec-in Must/Tasks-ına uyğun kodu yaz
  2. FIX — yazılan kod əvvəlki asılılıqla uyğunlaşdırma tələb edirmi?
  3. BUG — edge-case/null-check axtarışı + RECHECK (fix-dən sonra
     yenidən bax, "fix = təmiz" fərz etmə)
  4. SECURITY-REVIEW — kritik/yüksək tapıntı = task `[!]`, Operator-a
     bildir, dayanma nöqtəsi
  5. ULTRA-REVIEW — arxitektura sərhədi (Forbids/Owns pozuntusu) yoxla;
     böyük tapıntı = task `[?]`, kiçik tapıntı = fix + RECHECK

Bu 5 addımın sırası DƏYİŞDİRİLMİR. Hər addım "Verify" mərhələsinin
bir hissəsidir (bootstrap.md-dəki Execution Contract-a görə).
```

Layer sırası (BE→FE→MD) `Depends on` vasitəsilə təbii şəkildə həll
olunur: FE-nin `.sdd` spec-i BE-nin owned symbollarına `Depends on`
elan edir, ona görə agent BE spec-i əvvəl resolve edir.

---

## 5. Test Discovery Gate (12-nin yerinə keçir)

`Done when: BDD ssenariləri testlə əhatə olunub` yazısı KİFAYƏT ETMİR
— aşağıdakı layihəyə-xas qayda əlavə olunur:

```text
"Verify" addımında test faylının mövcudluğu YETƏRLİ SÜBUT DEYİL.
Aşağıdakılar TƏSDİQLƏNMƏLİDİR:
  - Test paketi `go test` tərəfindən DISCOVER olunur
  - Gözlənilən test sayı > 0-dır
  - Test HƏQİQƏTƏN execute olunub, nəticə mövcuddur

Bunlardan biri əskikdirsə, "Verify" mərhələsi UĞURSUZ sayılır və
"Report" bunu açıq yazır — "testlər keçdi" demək, "test faylı yazıldı"
demək DEYİL.
```

Go-ya xas qayda (dəyişmir): unit test `[fayl]_test.go`, MƏNBƏ KODLA
EYNİ qovluqda (`Owns` daxilində) — Go paket modeli bunu tələb edir.

---

## 6. Legacy audit (09-un yerinə keçir)

Yeni `.sdd` spec-lər qurulmazdan ƏVVƏL yazılmış (vibe-coding) kod üçün
bir dəfəlik keçid tapşırığı:

```text
Hər mövcud BE/FE/MD qovluğu üçün, .sdd spec YARADILANDA:
  1. Real kodu oxu
  2. Yuxarıdakı 5-addımlı zəncirlə (bölmə 4) REVIEW rejimində qiymətləndir
  3. Tapıntı yoxdursa -> spec-in Tasks-ı bütünlüklə [x]-lə başlayır
  4. Tapıntı varsa -> həmin tapıntılar spec-in Tasks-ına [ ] kimi əlavə
     olunur, "origin: legacy-audit" qeydi ilə (continuation sətrində)
```

Bu, əvvəlki `🆕/🕰️` proses-statusu ideyasının SpecDD-dəki qarşılığıdır —
ayrıca state sahəsi lazım deyil, sadəcə spec-in Tasks siyahısının
ilkin vəziyyəti bunu əks etdirir.

---

## 7. Asılılıq/toolchain yenilənməsi (10-un yerinə keçir)

```text
DO/toolchain.sdd adlı xüsusi spec yaradılır:

Spec: Toolchain

Purpose:
  Node/pnpm/Go versiyalarının cari, dəstəklənən vəziyyətdə saxlanması.

Owns:
  /.nvmrc
  /DO/Dockerfile
  /DO/ci-cd/*.yml

Must:
  CI-də istifadə olunan Node/pnpm versiyası EOL-a çatmayıb.

Tasks:
  [ ] #1 Node versiyasını yoxla, köhnəlibsə tapşırıq aç

CI/CD hər run-da bu spec-in `Must` şərtini yoxlayır; pozulma aşkar
olunsa, avtomatik olaraq bu spec-ə YENİ `[ ]` task əlavə edilir (əl
ilə deyil, CI script-i tərəfindən) — DEPENDENCY-XXX case-lərinin
`MODULE_INFRA` altında ayrıca sahib olması artıq lazım deyil, çünki
`Toolchain` spec-in ÖZÜ bu sahibdir.
```

---

## 8. Nəyi SAXLADIQ, nəyi SPECDD-YƏ VERDİK

```text
SAXLANAN (SpecDD əhatə etmir, layihəyə-xasdır):
  - Bölmə 4: 5-addımlı skil zənciri (feature/fix/bug/security/ultra)
  - Bölmə 5: Test Discovery Gate-in Go-ya-xas sərtliyi
  - Bölmə 6: Legacy audit prosedurası
  - Bölmə 7: Toolchain avtomatik yenilənməsi

SPECDD-YƏ VERİLƏN (əvvəllər əl ilə qurulmuşdu, indi doğma):
  - Ownership/authority modeli (Owns/Can modify/Can read) —
    əvvəlki CHAIN-021/022 münaqişələrini artıq SpecDD həll edir
  - Path-based spec resolution (inheritance) — 11-dəki state-lərin
    çoxu artıq lazım deyil
  - Task marker-ləri ([-] üçün ayrıca NOT_APPLICABLE state lazım deyildi)
  - Planning Mode (bizim "TƏSDİQ GÖZLƏ" nümunələrimizin doğma qarşılığı)
  - Conflict Handling (bizim CHAIN-004 kimi ziddiyyətləri indi framework
    özü aşkarlayır: "Treat competing ownership claims as an authority
    conflict")
```

---

## 9. Task Scheduling — Çəkiyə Görə Sıra, Paralel/Ardıcıl Qərarı

```text
Bütün tapşırıqlar eyni anda İCRA OLUNMUR. Sıra ÇƏKİYƏ görə qurulur:

  1. Bütün tapşırıqları YÜNGÜLDƏN AĞIRA sırala (çəki meyarı: toxunulan
     fayl sayı, layer sayı, geri dönməz əməliyyat olub-olmaması —
     DB migration/pul əməliyyatı = həmişə "ağır")
  2. YÜNGÜL tapşırıqlar: aralarında Owns/Depends-on ziddiyyəti
     yoxdursa, PARALEL icra oluna bilər
  3. AĞIR tapşırıqlar: BİR-BİR icra olunur. Hər ağır tapşırıq
     bitəndə DAYAN, Operatorun "davam et" təsdiqini gözlə —
     avtomatik növbətiyə keçmə

Tapşırıq siyahısında məlumat/kontekst BİTƏRSƏ (növbəti addımı
müəyyən etmək üçün kifayət qədər spesifikasiya yoxdursa), Operatorun
"davam et" DEMƏSİNİ GÖZLƏMƏDƏN belə İRƏLİ GETMƏ — uydurma addım
YARATMA, DAYAN və nəyin çatışmadığını soruş.
```

---

## 10. Davamlı Security/Dependency Monitorinqi (Bölmə 7-nin genişlənməsi)

```text
Hər git push-dan SONRA avtomatik yoxlama işə düşür (Toolchain spec-in
Must şərtinə əlavə):

  1. Dependency/security scan (npm audit, go list -u, Dependabot
     bildirişi) işə düşür
  2. YENİ problem tapılıbsa:
       → CARİ İŞ NƏ OLURSA OLSUN, DAYANDIRILIR
       → Fokus tam bu problemin fix-inə keçir
       → Fix tətbiq olunandan sonra REGRESSION TEST dəsti icra olunur
       → Yalnız regression yaşıl olandan sonra əvvəlki işə QAYIDILIR
  3. Fix edilmiş problem `.specdd/dependency-ledger.md`-ə YAZILIR
     (problem adı/CVE-ID, tarix, "RESOLVED" statusu) — bu, YADDAŞ
     rolunu oynayır
  4. NÖVBƏTİ push-larda: skan eyni problemi YENİDƏN taparsa, əvvəlcə
     `dependency-ledger.md`-ə bax — RESOLVED kimi qeydə alınıbsa,
     bu, artıq fokus tələb etmir, sadəcə "bilinir, keçdi" kimi
     qeyd olunur, YENİDƏN dayanmağa səbəb olmur
  5. YALNIZ YENİ (ledger-də olmayan) problem aşkarlanarsa addım 2-dən
     təkrarlanır — köhnə problem "unudulur" (fokusdan çıxır),
     yalnız yeni tapıntı diqqət tələb edir
```

**Format (`dependency-ledger.md`):**
```
| Tarix | Problem/CVE | Status | Fix commit |
|---|---|---|---|
| 2026-08-18 | lodash CVE-2026-XXXX | RESOLVED | a1b2c3d |
```

---

## 11. Branch-per-Task + Down-Up Keçid Qaydası

```text
Hər yeni TASK/MODUL işə başlayanda:

  1. `main`-dən yeni branch açılır (clone deyil, `git checkout -b`)
  2. Bütün iş bu branch-də aparılır, `main`-ə birbaşa toxunulmur

Tapşırıqlar zəncirvari (chain) olduqda İKİ İSTİQAMƏTLİ keçid tələb
olunur:

  DOWN (yuxarıdan aşağı) — İCRA ZAMANI:
    MODUL → CASE → TASK → SUBTASK sırası ilə aşağı doğru İCRA olunur
    (bax: SpecDD-nin path-based resolution-u, spec-lər yuxarıdan
    aşağı "Resolve" olunur)

  UP (aşağıdan yuxarı) — YOXLAMA ZAMANI:
    SUBTASK → TASK → CASE → MODUL sırası ilə aşağıdan yuxarı
    YOXLANILIR (hər səviyyə bağlanmazdan əvvəl, bir aşağı səviyyənin
    HAMISI bağlı olmalıdır — bu, əvvəlki CHAIN-004 düzəlişinin
    ümumiləşdirilmiş formasıdır)

Qısaca: TİKİNTİ yuxarıdan-aşağı gedir, TƏSDİQ aşağıdan-yuxarı qayıdır.
```

---

## 12. Manual QA Gate — Hash-Referanslı Test Case-lər, L0/L1 Səviyyələri

```text
Bir LAYER üzərindəki iş bitəndə, AI KODU "bitdi" elan ETMİR — əvəzinə
Operatora MANUAL TEST TƏLİMATI verir:

  - UI-də HARA girilməli (konkret ekran/route)
  - NƏ formada test edilməli (addım-addım)
  - NƏ GÖZLƏNİLİR (nəticə)

Hər manual test case-inə UNİKAL, QISA HASH kod verilir (məs. `#a3f9`),
test adının qarşısında paraqraf kimi göstərilir:

  #a3f9 — Profilə giriş: istifadəçi profil səhifəsinə keçəndə
          "Story" komponenti görünməlidir.
  #b71c — Abunəlik bitmiş istifadəçi 5-ci videoya giriş cəhdi edəndə
          rədd mesajı görünməlidir.

OPERATOR CAVAB VERƏNDƏ, hash-ə görə QISA formada cavab verir (token
qənaəti üçün tam mətn təkrarlamır):

  #a3f9: OK
  #b71c: FAIL — rədd mesajı görünmür, video sadəcə buferlənir

AI bu hash-lərə görə öz reyestrini saxlayır — hansı hash-in hansı
nəticəni aldığını, "kim nəyi düzəltdi" tarixçəsini bilir.

L0 → L1 KEÇİD QAYDASI (SƏRT):
  - AI ÖZÜ-ÖZÜNƏ "L0 bitdi, L1-ə keçirəm" DEYƏ BİLMƏZ
  - Yalnız Operatorun BÜTÜN hash-lərə AÇIQ VERDİKT verdiyi (OK/FAIL,
    "işlədi" DEYİL — konkret hash-ə görə cavab) andan sonra L0
    "məhsul" (product) kimi tamamlanmış sayılır
  - "Bir adam sınadı, işlədi" formatında ÜMUMİ TƏSDİQ QƏBUL EDİLMİR —
    hər hash öz ayrı verdiktini almalıdır
  - Yalnız BUNDAN SONRA L1-ə keçid başlayır
```

---

## 13. Hər Layer üçün Git Tag

```text
Bir LAYER (BE/FE/MD) üzrə iş bir mərhələni tamamlayanda, avtomatik
git tag qoyulur:

  Format: [layer]-[modul]-[case]-L[səviyyə]-[tarix]
  Nümunə: be-payment-escrow-L0-20260818

Bu, Operatora sabah/sonra:
  - Manual olaraq həmin nöqtəyə checkout edib sınamaq
  - Yaxud o nöqtədən "mini-development" aparmaq

imkanı verir — kod tarixçəsində sabit, geri qayıdıla bilən nöqtələr
yaradır.
```

---

## 14. Flow İndeksi — "Next" Vizual Ağacı

```text
Hər flow (CASE zənciri) üçün `.specdd/flow-index.md` saxlanılır —
bu, Depends-on/Related-on ticket-lərin bir-birinə bağlı AĞAC
strukturunu göstərir:

  CASE_02_03 (Escrow hesablama)
    ├── depends-on: CASE_02_01 (Payment Gateway) [✅]
    ├── depends-on: CASE_06_02 (Completion Tracker) [🔄]
    └── related: CASE_02_04 (Refund axını) [⏳]

Operator "next" deyəndə, AI bu ağacı oxuyub NÖVBƏTİ addımın NƏ
olacağını (hansı depends-on hələ bağlanmayıb, ona görə hansı CASE
işə düşəcək) ƏVVƏLCƏDƏN bildirir — sürprizsiz, aydın gedişat.
```

---

## 15. Fayl Axtarışında Token Qənaəti

```text
AI hər dəfə TAM faylı oxumaqla (`view` bütün fayl) axtarış aparmır —
bu, lazımsız token xərcləyir. Bunun əvəzinə:

  1. Əvvəlcə KONKRET axtarılan mətni/nümunəni MÜƏYYƏNLƏŞDİR
     (funksiya adı, dəyişən adı, error mesajı və s.)
  2. `grep`/`rg` ilə YALNIZ uyğun sətirləri (və ətraf kontekstini,
     məs. -A5 -B5) tap
  3. YALNIZ tapılan konkret sətirlərin ətrafını `view` et (tam faylı
     yox, `view_range` ilə məhdud sahəni)
  4. Fayl artıq TAM oxunubsa (cari sessiyada), YENİDƏN tam oxumaqdan
     çəkin — yalnız DƏYİŞMİŞ hissəni yoxla
```

---

## 16. DB→BE→API Zənciri üçün Manual API Test Təlimatı

```text
Əgər task ZƏNCİRİ məhz bu sıra ilədirsə: DB → BE → BE_TS → API → API_TS
(yəni UI qatına hələ çatmayıb, təmiz backend zənciridir), AI Operatora
UI təlimatı ƏVƏZİNƏ KONKRET `curl` sorğusu formatında manual test verir:

  #c4d1 — Escrow hesablama endpoint-i:

  curl -X POST https://api.edunexusaz.local/v1/payment/escrow \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TEST_TOKEN>" \
    -d '{"completion_pct": 60, "course_price": 100}'

  Gözlənilən cavab:
    {"teacher_payout": 50, "platform_fee": 15, "status": "escrowed"}

Bu, Bölmə 12-dəki hash-referans sistemi ilə EYNİ qaydada işləyir —
hər curl-test öz hash-ini alır, Operator hash-ə görə OK/FAIL verir.
```

---

## 17. Yerli Fix-Lookup İndeksi (`.specdd/fix-index.sdd`)

```text
Bölmə 15-in (token qənaəti) əlavə gücləndirilməsi: tez-tez rast
gəlinən, artıq HƏLL OLUNMUŞ problemlər üçün AI ümumi axtarış
sistemlərinə (google, stackoverflow və s.) GETMİR — əvəzinə layihəyə
xas bir lookup indeksinə baxır:

Spec: FixIndex

Purpose:
  Tez-tez təkrarlanan, artıq həll olunmuş problem→həll cütlərinin
  sürətli axtarış cədvəli.

Tasks:
  [x] #1 "pnpm ERR_PNPM_..." → "pnpm store prune && pnpm install"
  [x] #2 "Go module checksum mismatch" → "GOFLAGS=-mod=mod go mod tidy"

Bu fayl AXTARIŞ ƏVƏZİ deyil — YALNIZ artıq öz layihənizdə bir dəfə
həll olunmuş, TƏKRARLANAN problemlər üçündür. AI bir xəta ilə
qarşılaşanda:

  1. ƏVVƏLCƏ `.specdd/fix-index.sdd`-ə bax (sürətli, ucuz)
  2. Uyğun tapılırsa → orada göstərilən əmri birbaşa icra et
  3. Tapılmırsa → normal axtarış/debug prosesinə keç
  4. Yeni, təkrarlana biləcək bir problem həll olunanda → BURAYA
     əlavə et ki, növbəti dəfə axtarış lazım olmasın
```

