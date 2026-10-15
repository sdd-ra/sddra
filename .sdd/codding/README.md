# Temp Area — Not Product

Build simulation and template scaffolding for the SDDRA Docker chain
(R91 local images, R92 var/ mounts, R102 resource limits). Nothing here
is product code.

- `Dockerfile.{be,fe,mobile}-builder` — canonical builder images
  (pinned node:26 / nginx:1.31, wired through `docker-compose.yml`).
- `{be,fe,mobile}-builder/` — builder payloads. `mobile-builder` is a
  mock build simulator (R102): it emits fake APK/IPA artifacts to
  validate chain execution, never real binaries.

These files are kept because their setup is the reference for a new
project's builder stage: when a project starts, copy the relevant
builder, do not import it. Best practices are harvested from here.

Temp means disposable: build output, `node_modules/`, `dist/`, `output/`
and logs under this area are ignored and must never be committed
([R103]). Layout and rules: `.sdd/workflow/deployment.sdd`,
`.sdd/workflow/mobile-build.sdd`.
