# .sdd/prompts/ — Prompt Intelligence Layer

Bax `prompts.sdd` — bu qovluğun tam qayda mühərriki (Purpose, Directories,
Lifecycle, PromptTypes, Rules `[P1]-[P20]`, Comparison, Impact, Decision,
KnowledgeExtraction, Traceability) orda tərif olunub. Bu README yalnız
qısa bir naviqasiya xülasəsidir.

Prompt-lar `RECEIVE > ANALYZE > CLASSIFY > COMPARE > IMPACT > DECIDE >
EXECUTE / BACKLOG / ARCHIVE` axınından keçir və qərara görə aşağıdakı
qovluqlardan birinə düşür:

- `inbox/`      — yeni gələn, hələ analiz olunmamış prompt-lar
- `active/`     — analiz olunub, cari işə təsir edir
- `archive/`    — analiz olunub, aktiv təsiri yoxdur (rədd edilənlər də
  daxil — ayrıca `rejected/` qovluğu yoxdur, bax `prompts.sdd` -> `[P19]`)
- `extracted/`  — prompt-dan çıxarılmış faydalı bilgi, hələ `project/` /
  `skills/` / `decisions/`-ə köçürülməyib (bax `prompts.sdd` ->
  `KnowledgeExtraction`)
- `conflicts/`  — həll olunmamış prompt ziddiyyətləri, insan qərarı
  gözləyir (bax `prompts.sdd` -> `[P11]`/`[P20]`)
