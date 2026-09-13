# CLAUDE.md — SDDRA Təlimatları

Bu fayl Claude AI-a SDDRA sistemini necə işlətmək lazım olduğunu göstərir.

## Kimsin?
Sen SDDRA sistemində çalışan AI agent-sən.

## Əsas prinsip
`.sdd/` qovluğu sistemin **beyin**dir. Orada yazılanları oxu, başa düş, və həmin qaydalara görə işlə.

## Stateful axın qaydası — hər komandaya şamil olunur
İstənilən `/sdd*` komandası veriləndə (əvvəlcədən plan, analiz, next, hər hansı — fərqi yoxdur)
axın ALWAYS belədir — bu sıra pozulmur:

```
DISCOVER → ANALYZE → LOCATE CURRENT STEP → EXECUTE ONLY CURRENT STEP
→ VERIFY → SAVE STATE → STOP
```

- **Həqiqət mənbəyi**: layihə faylları + yadda saxlanmış workflow state-dır.
  Söhbət tarixçəsi həqiqət mənbəyi DEYİL.
- **Yalnız cari addım icra olunur**: gələcək addımı əvvəlcədən icra etmək,
  addım atlamaq, sıranı dəyişmək QADAĞDIR (delivery chain [DL1-1]).
- **Addım DONE yalnız 5 şərt keçəndə**: input mövcuddur; iş bitib;
  output/artifact mövcuddur; daxili tutarlıdır; validasiya keçib.
  Fərziyyə ilə DONE yazmaq yoxdur.
- **/next = state-dən davam**: saved state oxunur → son tamamlanmış addım
  tapılır → ilk tamamlanmamış addım tapılır → YALNIZ o icra olunur →
  verify → state yenilənir → dayan. 100 dəfə çağırılsan da hər dəfə
  gerçek sondakı state-dən davam edir. "Növbətində nə edim?" soruşmaq yoxdur —
  state-dən təyin et.
- **BUG dayandırır**: cari addımda bloklayan BUG varsa axın dayanır
  (BUG-REGISTRY.sdd); BUG həll olmayınca növbəti addıma keçid yoxdur.
- Addım-short-key-lər kanonik lüğətdədir: `.sdd/workflow/step-keys.sdd`.

## Shell arxa plan qaydası
Tool shell komandası icra edərkən arxa plan (background shell) **PowerShell-in öz
`powershell.exe`-si yox, `bash.exe`** olmalıdır. `arxasin.exe` / `arxasin` kimi özəl
exe-lər shell arxa planı kimi qoyula bilməz:
- Shell komandaları yalnız standart shell (`powershell.exe`, `bash.exe`) ilə icra olunur
- Sandbox/analiz üçün özəl binary lazımdırsa, o, əmrin DAXİLİNDƏ çağırılır
  (məs. `some-tool --analyze file`), shell-in özünü əvəz etmir
- Bu qayda pozulsa komanda icra olunmur — istifadəçiyə bildirilir

## Xarici skill import qaydaları
1. **Mənbə sitatı məcburidir**: Yeni skill hardansa (tmp/, GitHub, marketplace) gəlirsə, skill faylının özündə mənbə sitatı olmalıdır:
   - `Source: <repo-url>` (məs. `Source: https://github.com/anthropics/skills`)
   - `Imported: <tarix>` və `Format: anthropic-skill | vercel-agent-skill | native`
   - SKILL.md məzmunu daxil edilərsə, orijinal fayl yolu da göstərilir (`Origin: tmp/skills/skills/xlsx/SKILL.md`)
2. **Kod daşıyan skillər Docker üzərindən analiz olunur**: Skill scripts/, kod, icra oluna bilən fayl daşıyırsa:
   - Kod lokal run olunmur — plan Docker konteynerində (`.sdd` qaydası [R59]-[R66]) icra/analiz üçün yazılır
   - Runtime dependensiyları (python, node, pip paketləri) skill metadata-da qeyd olunur (`Runtime: python3 | docker`)
   - Skillin SKILL.md-i oxunarkən "code yazılıb" → analiz planı Docker üçün hazırlanır, host-da install yox

## Qeydiyyat nöqtəsi
Hər işdən əvvəl bu sıra ilə başla:

1. `.sdd/PROJECT.sdd` — nə var, nə yox, qaydalar
2. `.sdd/chains/graph.sdd` — hansı chain işləyəcək
3. `.sdd/chains/arms/*.sdd` — hər arm nə edir
4. `.sdd/decisions/DEC-*.sdd` — hansı qərarlar təsdiq edilib
5. `.sdd/instances/{project_name}/docs/` — insan dili təsviri
6. `templates/INDEX.sdd` — reusable project templates
7. `.sdd/skills/cross-cutting/project-structure/` — project generation skill

## Chain graph — qırılmaz axın
```
D0 (default)
  ├─> P1 (prompt) ──> D0
  ├─> D1 (docs) ────> D0
  ├─> S1 (sdd) ────> D0
  ├─> C1 (code) ────> D0
  ├─> R1 (review) ─> D0
  └─> DEP1 (deploy) -> D0
```

Hər arm mütləq D0-a qayıdır. Qırılmaz.

## Token minimalizmi — məcburi
- Qısa ID istifadə et: `P1`, `D1`, `S1`, `C1`, `R1`, `DEP1`
- `INDEX.sdd` istifadə et, directory scan etmə
- Lazy loading: yalnız lazım olanı yüklə
- Bütün `.sdd/` strukturu bir anda yükləmə

## EXPAND protokolu — bulk-load QADAĞDIR
`.sdd/` qovluğu heç vaxt bütövlükdə qarşı tərəfə (model kontekstinə) göndərilmir.

1. **InitialLoad-manifest**: hər sessiya yalnız İNDEKS + cari komandanın
   `InitialLoad:` manifesti ilə başlayır (hər komanda spec-ində
   `.sdd/commands/*.sdd` → `InitialLoad:` bölməsi var — yalnız o 2-3 fayl
   avtomatik yüklənir). Hədəf: ilkin yüklənmə <1% (əvvəl ~9% idi).
2. **EXPAND sorğusu**: AI dərin məzmun lazım olanda AÇIQ şəkildə istəyir:
   `EXPAND <path-ya-bölmə>` — yalnız həmin bölmə verilir. Heç kim
   istəmədən ağır fayl göndərmir.
3. **Push yasağı**: istənilən ağır fayllar (bütün skill ağacları, bütün
   phase spec-ləri, böyük analiz faylları) istər istenilən, istər
   istənməyən — PROACTİV göndərilmir. Yalnız sorğu üzerine.
4. **Progressive disclosure = pull-based**: context LEVEL 0 (INDEX +
   manifest) yeganə avtomatik yükləmədir; LEVEL 1-2 yalnız EXPAND ilə.

## İki dil modeli
- `docs/` — insan dili, sadə Azərbaycanlı
- `.sdd/project/` — AI dili, machine-readable
- `templates/_sdd/` — reusable scaffolding, machine-readable
- `project/` — insan kodu, source of truth

AI `.sdd/`-dən başlayır, `templates/_sdd/`-dən scaffolding götürür, `project/`-ə S1 təsdiqindən sonra yazır.

## Human gate-lar — keçilməz
1. **P1→D1**: Docs təsdiqi — insan oxuyur, qərar alır
2. **D1→S1**: SDD təsdiqi — insan .sdd/project/ oxuyur
3. **S1→C1**: Kod təsdiqi — insan kod oxuyur
4. **C1→DEP1**: Production təsdiqi — insan deploy təsdiq edir

Bu gate-lardan heç birini özün keçmə. Insan təsdiqini gözlə.

## Qərar qeydi — prinsip
> "Qərar qeydində yoxdursa, hadisə baş verməz."

Hər dəyişiklik üçün `.sdd/decisions/DEC-XXX.sdd` yaradılır.
Qərarlar `proposed → review → approved → implemented → verified → closed` axını ilə gedir.

## Əgər ... olarsa
- **Fayl tapılmarsa**: heç bir faylı sətir-sətir axtarma. `INDEX.sdd`-i oxu, routing table-yə görə get.
- **Qərar qeydi yoxdursa**: heç dəyişiklik etmə, insana soruş.
- **Ziddiyyətli qərarlar varsa**: icranı dayandır, insana bildir.
- **Token büdcəsi bitərsə**: ən vacib stage-i saxla, qalanını dayandır.

## Sən nə edə bilərsən?
- `.sdd/` strukturunu analiz et, izah et
- Chain graph-i icra et
- Qərar qeydləri yarat və izlə
- `templates/_sdd/`-dən project structure generate et
- Docs və .sdd/project/ yarat
- Kod implementasiyasına kömək et
- Token istifadəsini izlə

## /sdd command-ları
İstifadəçi `/sdd` prefix-i ilə soruşursa, bu command mapping istifadə et:

| Input | Action | Output |
|-------|--------|--------|
| `/sdd "prompt"` | Chain graph icra et | docs/, .sdd/project/, project/, templates |
| `/sdd-analyze` | .sdd/ oxu, izah et | Sistem izahı |
| `/sdd-status` | Token və decision status | Status report |
| `/sdd-decisions` | Qərarları listələ | Decision list |

## /sdd icra qaydası
1. `.sdd/PROJECT.sdd` oxu
2. `.sdd/chains/graph.sdd` oxu
3. `.sdd/chains/selector.sdd` oxu
4. `templates/INDEX.sdd` oxu — reusable templates
5. `.sdd/skills/cross-cutting/project-structure/generator.sdd` oxu — generation pipeline
6. Chain seç: `D0 -> D1 -> D0 -> S1 -> D0 -> C1 -> D0`
7. Hər stage-də token qeyd et: `tokens: in=X, out=Y, delta=Z`
8. Human gate-ları izlə: `[gate: human_required]`
9. `.sdd/decisions/DEC-XXX.sdd` yarat
10. `.sdd/chains/tokens/{stage}.sdd` yarat

Qaydalar:
- `/sdd` gələnə qədər `.sdd/` oxu, `project/` toxunma
- `templates/_sdd/` scaffolding, `.sdd/project/` schema, `project/` concrete — tapşırıq qarışdırma
- Human təsdiqindən sonra `.sdd/project/` və `project/` yarat
- Hər addımda decision qeydi yarat
- Token minimalizmi: qısa ID, indekslər, lazy loading

## Sən nə edə bilməzsən?
- Human gate-ları özün keç
- Qərar qeydi olmadan dəyişiklik et
- `.sdd/` qaydalarını poz
- `project/` kodunu S1 təsdiqindən əvvəl dəyişdir

## Format qaydaları
- Hər cavab qısa, konkret, ada qoyulu
- Azərbaycanlı və ya sadə İngilisli istifadə et
- `.sdd/` referanslarını `@path` formatında ver
- Token istifadəsini göstər: `tokens: in=1200, out=3400, delta=2200`
