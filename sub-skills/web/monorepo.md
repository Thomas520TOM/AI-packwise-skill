# Monorepo Build Sub-Skill

Manage and build multi-package projects using monorepo tools.

**Current version**: Turborepo 2.x / pnpm 9.x / Nx 20.x (2025-2026)

## When to Use

- Multiple related packages/apps in one repository
- Shared code (UI components, utilities, types) across projects
- Need coordinated builds with dependency-aware caching
- Want atomic commits across packages

## Tool Comparison

| Feature | Turborepo 2.x | Nx 20.x | pnpm Workspaces |
|---------|--------------|---------|-----------------|
| Approach | Build orchestrator | Full dev platform | Package manager feature |
| Caching | Local + Remote | Local + Remote (Nx Cloud) | Not built-in |
| Language support | Any | JS/TS, Go, Java, .NET | JS/TS only |
| Learning curve | Low | Medium | Lowest |
| Task runner | Built-in (turbo.json) | Built-in (project.json) | Use with Turborepo/Nx |
| Affected detection | Yes | Yes (more granular) | No |
| Plugin ecosystem | Smaller | Large (generators, executors) | N/A |
| Best for | JS/TS monorepos, simplicity | Large teams, polyglot monorepos | Package management only |

## pnpm Workspaces (Foundation)

Most JS/TS monorepos use pnpm as the package manager regardless of build tool.

```bash
# Install pnpm
npm install -g pnpm@latest
```

```yaml
# pnpm-workspace.yaml (project root)
packages:
  - "apps/*"
  - "packages/*"
```

```
my-monorepo/
├── apps/
│   ├── web/              # Frontend app
│   ├── admin/            # Admin dashboard
│   └── api/              # Backend API
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   ├── tsconfig/         # Shared TypeScript configs
│   └── eslint-config/    # Shared ESLint configs
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── package.json
```

```json
// Root package.json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.3.0"
  }
}
```

```json
// apps/web/package.json — use workspace: protocol for internal deps
{
  "name": "@myrepo/web",
  "dependencies": {
    "@myrepo/ui": "workspace:*",
    "@myrepo/utils": "workspace:*"
  }
}
```

## Turborepo

### Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Build Commands

```bash
# Build all packages in dependency order
turbo run build

# Build only packages affected by changes
turbo run build --filter=...[HEAD^1]

# Build specific package and its dependencies
turbo run build --filter=@myrepo/web...

# Build with remote caching (Vercel)
turbo run build --team=myteam --token=$TURBO_TOKEN

# Dry run (show execution plan without building)
turbo run build --dry-run

# Run multiple tasks
turbo run build lint test

# Clear cache
turbo run clean
turbo prune  # Remove unused cache entries
```

### Remote Caching

```bash
# Link to Vercel remote cache
npx turbo login
npx turbo link

# Or self-hosted: set TURBO_API and TURBO_TOKEN
export TURBO_API=https://my-cache-server.com
export TURBO_TOKEN=my-token
```

## Nx

### Setup

```bash
# Add Nx to existing monorepo
npx nx init

# Or create new Nx workspace
npx create-nx-workspace my-monorepo --preset=ts
```

### Configuration

```json
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

```json
// apps/web/project.json
{
  "name": "web",
  "sourceRoot": "apps/web/src",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/web"
      }
    },
    "dev": {
      "executor": "@nx/vite:dev-server"
    },
    "test": {
      "executor": "@nx/vite:test"
    }
  }
}
```

### Build Commands

```bash
# Build all
npx nx run-many -t build

# Build affected only (compares with main branch)
npx nx affected -t build

# Build specific project
npx nx build web

# Graph visualization
npx nx graph

# Remote cache (Nx Cloud)
npx nx connect-to-nx-cloud
```

## CI/CD — GitHub Actions (Turborepo)

```yaml
name: Monorepo Build
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Needed for affected detection
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install -g pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build lint test
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| `workspace:*` dependency not resolved | Ensure `pnpm-workspace.yaml` includes the package's directory |
| Circular dependency between packages | Restructure; extract shared code to a third package |
| Cache hit but stale output | `turbo run build --force` to bypass cache |
| `turbo` not found | Add to root `devDependencies` or install globally |
| Nx graph shows wrong dependencies | Check `import` paths; ensure `tsconfig.json` paths are correct |
| Phantom dependencies | pnpm prevents this by default; don't use `shamefully-hoist` |
| Type errors across packages | Use `workspace:*` + TypeScript project references |
| `pnpm install` fails with lockfile conflicts | Use `--frozen-lockfile` in CI; regenerate with `pnpm install --lockfile-only` |
