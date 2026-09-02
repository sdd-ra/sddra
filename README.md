# SDDRA — Specification-Driven Development Engine

**Specification-Driven Development framework for AI-assisted software engineering.**

Bu səhifə layihənin əsas giriş nöqtəsidir. Aşağıda sistemin necə işlədiyini, hansı faylların nə olduğunu və "sabah işə başla" deyəndə haradan davam etmək lazım olduğunu izah edirik.

---

## 1. Bu Layihə Nədir?

SDDRA (Spec-Driven Development & Engineering) AI-assisted software engineering üçün bir əməliyyat sistemidir. Layihənin bütün qaydaları, qərarları və icrası `.sdd/` fayllarında saxlanılır.

Sadə cümlə ilə: **.sdd/ faylları sistemin beynidir. AI ilk olaraq `.sdd/` oxuyur, sonra `sdd-adapter/` ilə icra edir.**

---

## 2. Fayl Strukturu (Növbəli Oxu)

Aşağıdakı sıra ilə oxuyun — hər biri bir-birinin üzərində qurulur:

```
sddra.ai/
├── README.md                 ← Sən bu səhifədəsən. Layihənin ümumi baxışı.
├── AGENT_README.md           ← AI agent-lər üçün xüsusi təlimatlar.
├── CLAUDE.md                 ← Claude Code üçün qaydalar.
│
├── .sdd/                     ← MAKİNA DİLİ — Bütün qaydalar burada
│   ├── INDEX.sdd             ← Başlanğıc nöqtəsi, bütün faylların siyahısı
│   ├── PROJECT.sdd           ← Layihə konstitusiyası, əsas qaydalar
│   ├── protocol/ROOT.sdd     ← Hər şeydən yuxarı olan universal qaydalar
│   ├── chains/               ← İcra mexanizmi (6 kol, 16 addım)
│   ├── decisions/            ← Qərarlar qeydləri (DEC-XXX)
│   ├── skills/               ← Bacarıq kitabxanası (design, testing, security)
│   ├── commands/             ← 17 əmr tərifi (/sdd, /sdd-plan, və s.)
│   ├── agent/                ← Agent müqaviləsi, rollar, icazələr
│   ├── gates/                ← Keyfiyyət qapıları (build, test, security)
│   ├── runtime/              ← İsletim vaxti vəziyyəti, yaddaş modeli
│   ├── evolution/            │ Təkmilləşmə mexanizmi
│   ├── projects/sddra/       ← BU LAYİHƏ — sddra.ai-nin öz məlumatları
│   │   ├── MAP.md            ← Real fayl xəritəsi
│   │   ├── STRUCTURE.md      │ Kod strukturu
│   │   ├── decisions/        │ Layihə qərarları
│   │   ├── tasks/            │ Tapşırıqlar
│   │   └── context/          │ Aktiv kontekst
│   └── docs/                 ← İnsan oxuyan sənədlər (təşkil olunmuş)
│       ├── INDEX.md          ← Sənədlərin ümumi siyahısı
│       ├── overview/         ← Sistemə geniş baxış
│       ├── commands/         ← Əmrlər, workflow, AUTO engine
│       ├── analysis/         │ Dərin sistem analizi
│       └── appendices/       │ Lüğət və əlavələr
│
├── sdd-adapter/              ← İCRA DİLİ — TypeScript kodu
│   ├── src/                  ← Mənbə kodları
│   │   ├── commands.ts       ← Əmrlərin icrası
│   │   ├── design-analyzer.ts← Dizayn təhlili
│   │   ├── skill-auto-invoker.ts← Bacarıq avtomatik çağırma
│   │   └── provenance-client.ts← Təhlükəsizlik yoxlaması
│   └── tests/                ← Yoxlama testləri
│
├── .claude/                  ← Claude Code konfiqurasiyası
│   ├── commands/             ← /sdd əmrləri (slash commands)
│   ├── sdd/                  ← AUTO workflow engine
│   │   ├── workflow.yaml     ← 6 addımlı pipeline
│   │   ├── state.json        ← Davametmə vəziyyəti
│   │   └── orchestrator.md   ← AUTO icra protokolu
│   └── docs/                 ← İnsan oxuyan sənədlər (insan dostu)
│       ├── INDEX.md          ← Baş sənəd siyahısı
│       ├── overview/         ← ECC inteqrasiyası, arxitektura müqayisəsi
│       ├── agents/           ← Agent rolları, bacarıqları, siyasətlər
│       ├── api/              ← API token və təhlükəsizlik
│       └── data/             ← Siyahılar (TSV)
│
├── prompts/                  ← İstəklər qutusu (gələn və gedən)
├── tmp/                      ← Təhlil və araşdırma qutusu
│   ├── agent-skills/         ← Vercel agent bacarıqları
│   ├── skills/               ← Anthropic bacarıqları
│   ├── taste-skill/          ← Vercel dizayn bacarığı
│   ├── heretic/              ← Təhlil edilmiş (sddra tərəfindən bloklanır)
│   ├── watermarks-remover/   ← Təhlil edilmiş (Layer A icazə verilir)
│   ├── playwright-cli/       ← Brauzer avtomatlaşdırması
│   └── html/                 ← Yüklənmiş şablonlar
│
└── package.json              ← Node.js konfiqurasiyası
```

---

## 3. Sistem Necə İşləyir?

### 3-addımda başlanğıc:

1. **İstək gəlir** — Siz və ya AI `prompts/inbox/`-a yazılış qoyursunuz
2. **Chain icra olunur** — Sistem 6 kol əmələ gətirir:
   - **P1** → Prompt analizi
   - **D1** → Sənədləşdirmə
   - **S1** → .sdd spesifikasiyası
   - **C1** → Kod yazma
   - **R1** → Yoxlama (security, test, quality)
   - **DEP1** → Deploy
3. **Dönüş olur** — Hər kol `D0`-a (mərkəz) qayıdır, növbəti iterasiya üçün hazır olur

### AUTO rejimi:

`/sdd-plan auto` yazaraq bütün chain avtomatik işləsin deyə bilərsiniz. Sistem özü qərarlar qəbul edir, irəli gedir və yalnız vacib məsələlərdə sizdən kömək istəyir.

---

## 4. Hansı Fəsil Nə Üçün?

| Fəsil | Məqsəd | Kim üçün |
|--------|--------|----------|
| `.sdd/` | Sistemin beyni — qaydalar, qərarlar, workflow | Hər kəs — oxunmalı |
| `sdd-adapter/` | Kod — TypeScript icrası | Tərtibatçılar |
| `.claude/commands/` | /sdd əmrləri | İstifadəçilər |
| `.claude/sdd/` | AUTO workflow engine | Sistem |
| `.sdd/projects/sddra/` | Bu layihənin öz məlumatları | AI + İnsan |
| `.sdd/docs/` | Makine sənədləri | Tərtibatçılar |
| `.claude/docs/` | İnsan sənədləri | Hər kəs |
| `tmp/` | Təhlil, araşdırma, klonlanmış repo-lar | Təhlil zamanı |

---

## 5. Sabah İşə Başlamaq Üçün

Siz "sabah işə başla" deyəndə AI bunları bilir:

1. **Hədəf:** `.sdd/projects/sddra/` — burada layihənin qərarları, tapşırıqları və konteksti var
2. **Qaydalar:** `.sdd/PROJECT.sdd` və `.sdd/protocol/ROOT.sdd` — əsas qaydalar
3. **Workflow:** `.claude/sdd/workflow.yaml` — AUTO pipeline növbəsi
4. **Sənədlər:** `.sdd/docs/` və `.claude/docs/` — tam indeks və izahlar
5. **Kod:** `sdd-adapter/src/` — icra mərkəzi
6. **Təhlil:** `.sdd/projects/sddra/tmp-analysis.sdd` — tmp/ qutusunun analizi

AI bunları oxuyur, sistemin vəziyyətini başa düşür və işə davam edir.

---

## 6. Əmrlər (Tez Keçid)

| Əmr | Nə edir? |
|-----|----------|
| `/sdd` | Chain graph-u prompt-dan icra edir |
| `/sdd-plan auto` | Avtomatik plan yaradır və icra edir |
| `/sdd-analyze` | `.sdd/` sistemini dərinləndirə analiz edir |
| `/sdd-status` | Hal-görünüşü göstərir |
| `/sdd-decisions` | Qərarları siyahılar |
| `/sdd-health` | Sistem sağlamlığını yoxlayır |
| `/sdd-next` | Qərar zəncirlərini irəlilədir |
| `/sdd-resume` | Dayanan AUTO işini davam etdirir |

---

## 7. Təhlükəsizlik və Qaydalar

- **.sdd/ immutabledir** — əsas qaydalar dəyişdirilə bilməz
- **Bütün icra Docker-də gedir** — yerli quraşdırma yoxdur
- **İnsan qapıları** — hər vacib mərhələdə insan təsdiqi tələb olunur
- **Dəyişən fayllar yoxlanılır** — dəyişməmiş kod yenidən test edilmir

---

## 8. Əlaqə və Daha Çox

- `.sdd/docs/overview/sdd-overview.md` — Sistemə geniş baxış
- `.sdd/docs/commands/reference.md` — Bütün əmrlərin təsviri
- `.sdd/docs/appendices/glossary.md` — Terminlər lüğəti
- `.claude/docs/INDEX.md` — İnsan üçün sənədlər
- `.sdd/projects/sddra/MAP.md` — Fayl xəritəsi
- `.sdd/projects/sddra/STRUCTURE.md` — Kod strukturu

---

*Layihə aktiv inkişaf mərhələsindədir. Bütün `.sdd/` faylları istifadəçiyə məxsusdur və dəyişdirilə bilməz.*
