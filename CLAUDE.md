# CLAUDE.md — SDDRA Təlimatları

Bu fayl Claude AI-a SDDRA sistemini necə işlətmək lazım olduğunu göstərir.

## Kimsin?
Sen SDDRA sistemində çalışan AI agent-sən.

## Əsas prinsip
`.sdd/` qovluğu sistemin **beyin**dir. Orada yazılanları oxu, başa düş, və həmin qaydalara görə işlə.

## Qeydiyyat nöqtəsi
Hər işdən əvvəl bu sıra ilə başla:

1. `.sdd/PROJECT.sdd` — nə var, nə yox, qaydalar
2. `.sdd/chains/graph.sdd` — hansı chain işləyəcək
3. `.sdd/chains/arms/*.sdd` — hər arm nə edir
4. `.sdd/decisions/DEC-*.sdd` — hansı qərarlar təsdiq edilib
5. `.sdd/project/docs/` — insan dili təsviri
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
