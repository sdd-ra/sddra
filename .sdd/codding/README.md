# Working Area — Not Product Surface

Everything under `.sdd/codding/` lives here so the repo root stays
product-only. Two kinds of content share the directory:

- `sdd-adapter/` — the SDDRA runtime (TypeScript CommandRunner, engines,
  tests). It IS product code; it lives here for root hygiene, not because
  it is disposable.
- `{be,fe,mobile}-builder/` + `Dockerfile.*-builder` — build simulation
  and template scaffolding (R91 local images, R92 var/ mounts, R102
  resource limits). Disposable; kept as the reference for a builder
  stage in a new project.

Location, ownership and the runtime layer split: `.sdd/projects/sddra/
STRUCTURE.md` (§ sdd-adapter) and `.sdd/projects/sddra/architecture/
INDEX.sdd`. Builder rules: `.sdd/workflow/deployment.sdd`,
`.sdd/workflow/mobile-build.sdd`.

Temp means disposable for the builder scaffolding: build output,
`node_modules/`, `dist/`, `output/` and logs are gitignored and must
never be committed ([R103]). The adapter's own artifacts are ignored the
same way.
