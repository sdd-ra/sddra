# .sdd/tasks/ — Task/Subtask Execution Layer

Bax `tasks.sdd` — bu qovluğun tam qayda mühərriki (Purpose, Directories,
TaskLifecycle, StateToDirectory, Failure, TaskTypes, TaskContract, Rules
`[T1]-[T17]`, Dependency, Review, Verification, Parallel) orda tərif
olunub. Bu README yalnız qısa bir naviqasiya xülasəsidir.

Task-lar `CREATED > ANALYZED > READY > ACTIVE > REVIEW > VERIFIED > DONE`
axınından keçir və hazırkı vəziyyətlərinə görə aşağıdakı qovluqlardan
birinə düşür (bax `tasks.sdd` -> `StateToDirectory`):

- `backlog/` — yaradılıb, analiz olunub və ya hazırdır, hələ başlanmayıb
  (CREATED / ANALYZED / READY)
- `active/`  — hazırda icra olunur (ACTIVE)
- `blocked/` — açılmamış asılılığa görə gözləyir (bax `tasks.sdd` ->
  `Dependency` -> `blocks`)
- `review/`  — nəzərdən keçirilir (REVIEW, bax `tasks.sdd` -> `Review`)
- `done/`    — doğrulanıb bağlanıb (VERIFIED / DONE)
- `failed/`  — uğursuzluq/bərpa dövründədir, hələ ACTIVE-ə qayıtmayıb
  (bax `tasks.sdd` -> `Failure`)

Uğursuzluq heç vaxt birbaşa `done/`-a keçmir — bərpa yalnız məsul mərhələyə
(ACTIVE və ya REVIEW) qayıda bilər (bax `tasks.sdd` -> `[T7]`/`[T8]`).
