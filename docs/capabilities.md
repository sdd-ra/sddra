# Agent Capabilities

**Capability** = what an agent *can* do technically. **Permission** = whether it *may* do it under current policy.

## Risk Classification

| Capability | Risk Level | Description |
|------------|------------|-------------|
| READ | R0 | Read files, list files, search |
| WRITE | R1 | Create/update files |
| DELETE | R2 | Delete files |
| MOVE | R1 | Move/rename files |
| EXECUTE | R1 | Run commands |
| TEST | R1 | Run tests |
| BUILD | R1 | Build artifacts |
| DOCKER | R2 | Docker operations |
| GIT | R1 | Git operations |
| DATABASE | R2 | Database operations |
| NETWORK | R2 | Network operations |
| DEPLOY | R4 | Deployment operations |

## Capability Rules

1. **CAP1**: Capability is technical ability, not permission.
2. **CAP2**: Permission policy determines whether capability may be used.
3. **CAP3**: Risk level is inherent to capability, not context.

## Risk Levels

| Level | Label | Examples |
|-------|-------|----------|
| R0 | Safe | Read file, list files, search |
| R1 | Low | Create temp file, run formatter, run unit test |
| R2 | Moderate | Modify source, install dependency, change config |
| R3 | High | DB migration, change security config, infra change |
| R4 | Critical | Production deployment, secret rotation, data migration |
| R5 | Destructive | Delete production data, drop database, destroy infra |