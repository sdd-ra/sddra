# Docker Template

Purpose: Scaffold a new project's Docker configuration following
SDDRA conventions ([R91] local images, [R92] var/ mounts,
[R102] resource limits).

## Scaffold Command

```bash
docker compose run --rm sdd-sandbox \
  node /workspace/sdd-adapter/dist/commands.js /sdd "docker init"
```

## Template Structure

```
project/
├── docker-compose.yml         (from docker-compose.template.yml)
├── Dockerfile                 (from Dockerfile.template)
├── Dockerfile.fe-builder      (if FE stack)
├── Dockerfile.be-builder      (if BE stack)
├── Dockerfile.mobile-builder  (if MD stack)
├── .dockerignore
└── var/                       (gitignored, dockerignored)
    ├── fe/
    ├── be/
    └── mobile-build/
```

## docker-compose.template.yml

```yaml
services:
  sandbox:
    build:
      context: .
      dockerfile: Dockerfile
    image: ${PROJECT_NAME}-sandbox:local
    read_only: true
    user: "1000:1000"
    volumes:
      - ./var/sandbox:/workspace
    networks:
      - ${PROJECT_NAME}-internal
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2g
          pids: 512

  fe-builder:
    build:
      context: .
      dockerfile: Dockerfile.fe-builder
      args:
        FRAMEWORK: react
    image: ${PROJECT_NAME}-fe-builder:local
    volumes:
      - ./var/fe:/workspace/dist
    networks:
      - ${PROJECT_NAME}-internal

  be-builder:
    build:
      context: .
      dockerfile: Dockerfile.be-builder
      args:
        RUNTIME: node
    image: ${PROJECT_NAME}-be-builder:local
    volumes:
      - ./var/be:/workspace
    ports:
      - "${BE_PORT:-3000}:3000"
    networks:
      - ${PROJECT_NAME}-internal

networks:
  ${PROJECT_NAME}-internal:
    internal: true
```

## Dockerfile.template

```dockerfile
syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:20-bookworm-slim
FROM ${NODE_IMAGE} AS deps
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

FROM ${NODE_IMAGE} AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npx tsc --outDir dist

FROM ${NODE_IMAGE} AS runner
WORKDIR /workspace
COPY --from=builder /workspace/dist ./dist
USER node
HEALTHCHECK --interval=60s --timeout=5s CMD node -e "process.exit(0)"
CMD ["node", "dist/index.js"]
```
