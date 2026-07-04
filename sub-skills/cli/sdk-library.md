# SDK & Library Build Sub-Skill

Build, package, and distribute software development kits (SDKs) and reusable libraries for other developers to consume.

**Current versions**: npm 10 / PyPI / Maven Central / crates.io / Go modules / NuGet (2025-2026)

## When to Use

- Building a library/SDK for other developers to use
- Publishing to package registries (npm, PyPI, crates.io, Maven, NuGet)
- Creating developer toolkits, client libraries, utility packages
- Open-source library distribution
- Internal enterprise library sharing

---

## JavaScript/TypeScript (npm)

### Project Setup

```json
{
  "name": "@myorg/sdk",
  "version": "1.0.0",
  "description": "My awesome SDK",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs",
      "types": "./dist/utils.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts src/utils.ts --format cjs,esm --dts",
    "test": "vitest",
    "lint": "eslint src/",
    "prepublishOnly": "npm run build && npm run test"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.0.0"
  },
  "peerDependencies": {
    "react": ">=18"
  },
  "engines": {
    "node": ">=20"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/myorg/sdk"
  }
}
```

### Build

```bash
# Build CJS + ESM + TypeScript declarations
npx tsup src/index.ts --format cjs,esm --dts
# Output:
# dist/index.js   (ESM)
# dist/index.cjs  (CJS)
# dist/index.d.ts (TypeScript declarations)

# OR with Rollup
npx rollup -c rollup.config.js

# OR with plain TypeScript
npx tsc -p tsconfig.build.json
```

### Publish

```bash
# Login
npm login

# Publish public package
npm publish --access public

# Publish scoped package
npm publish --access public  # @myorg/sdk

# Publish pre-release
npm publish --tag beta

# Dry run (see what would be published)
npm pack --dry-run
```

### Versioning

```bash
npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
npm version minor   # 1.0.0 → 1.1.0 (new features, backward compatible)
npm version major   # 1.0.0 → 2.0.0 (breaking changes)
npm publish
git push --tags
```

### Common Pitfalls (npm)

| Issue | Fix |
|-------|-----|
| `files` too large | Use `"files": ["dist"]` to whitelist; check with `npm pack --dry-run` |
| Types not found | Ensure `"types": "./dist/index.d.ts"` in package.json |
| CJS/ESM dual package hazard | Use `exports` field with separate `import`/`require` paths |
| `peerDependencies` not installed | Document required peer deps; don't bundle them |
| Scoped package publish fails | Use `--access public` for public scoped packages |
| Version bump not triggering CI | Push tags: `git push --tags`; use `release-please` or `changesets` |

---

## Python (PyPI)

### Project Setup

```toml
# pyproject.toml
[build-system]
requires = ["setuptools>=75.0", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "my-sdk"
version = "1.0.0"
description = "My awesome SDK"
readme = "README.md"
license = "MIT"
requires-python = ">=3.10"
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "ruff>=0.8"]

[project.urls]
Homepage = "https://github.com/myorg/my-sdk"
Documentation = "https://my-sdk.readthedocs.io"
Repository = "https://github.com/myorg/my-sdk"

[project.scripts]
my-sdk = "my_sdk.cli:main"  # CLI entry point

[tool.setuptools.packages.find]
where = ["src"]
```

### Project Structure

```
my-sdk/
├── src/
│   └── my_sdk/
│       ├── __init__.py       ← Public API exports
│       ├── client.py         ← Main SDK client
│       ├── models.py         ← Data models
│       └── utils.py
├── tests/
├── pyproject.toml
├── README.md
└── LICENSE
```

### Build

```bash
# Build
python -m build
# Output:
# dist/my_sdk-1.0.0-py3-none-any.whl  (wheel, preferred)
# dist/my_sdk-1.0.0.tar.gz            (source distribution)

# Verify package
twine check dist/*

# Test install locally
pip install dist/my_sdk-1.0.0-py3-none-any.whl
```

### Publish to PyPI

```bash
# Install tools
pip install build twine

# Publish to TestPyPI first
twine upload --repository testpypi dist/*

# Publish to PyPI
twine upload dist/*

# OR: Trusted publishing (recommended, no API token needed)
# Configure on pypi.org → project → publishing → add GitHub Actions
```

### GitHub Actions (Trusted Publishing)

```yaml
name: Publish to PyPI
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for trusted publishing
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - run: pip install build
      - run: python -m build
      - uses: pypa/gh-action-pypi-publish@release/v1
```

### Common Pitfalls (PyPI)

| Issue | Fix |
|-------|-----|
| `name already taken` | Choose unique name; check PyPI first |
| `twine upload` auth error | Use trusted publishing or API token |
| Wheel missing files | Check `[tool.setuptools.packages.find]` config |
| Import errors after install | Use `src/` layout; check `__init__.py` exports |
| Dependencies not installed | List all in `[project.dependencies]`; not just `requirements.txt` |

---

## Rust (crates.io)

### Cargo.toml

```toml
[package]
name = "my-sdk"
version = "0.1.0"
edition = "2021"
description = "My awesome Rust SDK"
license = "MIT OR Apache-2.0"
repository = "https://github.com/myorg/my-sdk"
documentation = "https://docs.rs/my-sdk"
readme = "README.md"
keywords = ["sdk", "api", "client"]
categories = ["api-bindings", "web-programming"]

[dependencies]
reqwest = { version = "0.12", features = ["json"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
thiserror = "2"
```

### Build & Publish

```bash
# Build library
cargo build --release

# Run tests
cargo test

# Publish to crates.io
cargo login
cargo publish

# Dry run
cargo publish --dry-run

# Yank (unpublish) a version
cargo yank --vers 0.1.0
```

### Common Pitfalls (crates.io)

| Issue | Fix |
|-------|-----|
| `crate name taken` | Search crates.io first; use unique name |
| Docs.rs build fails | Ensure docs build locally: `cargo doc --no-deps` |
| Feature flags not documented | Document all features in README |
| MSRV (minimum Rust version) | Set `rust-version` in Cargo.toml |

---

## Go (Go Modules)

### Module Setup

```go
// go.mod
module github.com/myorg/my-sdk

go 1.23

require (
    github.com/some/dependency v1.2.3
)
```

### Project Structure

```
my-sdk/
├── client.go           ← Main SDK client
├── client_test.go      ← Tests
├── models.go           ← Data types
├── errors.go           ← Error types
├── go.mod
├── go.sum
├── README.md
└── LICENSE
```

### Publish (Git-based)

Go modules are published via Git tags — no registry needed.

```bash
# Tag and push
git tag v1.0.0
git push origin v1.0.0

# Users install with:
# go get github.com/myorg/my-sdk@v1.0.0

# Update to latest:
# go get github.com/myorg/my-sdk@latest
```

### Common Pitfalls (Go)

| Issue | Fix |
|-------|-----|
| `go.sum` mismatch | Run `go mod tidy`; commit both files |
| Breaking change without major version | Use `/v2` import path for major versions |
| pkg.go.dev not showing | Push tag; `go get` triggers indexing |
| API surface too large | Export only what users need; keep internals in `internal/` |

---

## Java/Kotlin (Maven Central)

### Gradle Setup

```kotlin
// build.gradle.kts
plugins {
    `java-library`
    `maven-publish`
    signing
}

group = "com.example"
version = "1.0.0"

java {
    withSourcesJar()
    withJavadocJar()
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])
            pom {
                name.set("My SDK")
                description.set("My awesome Java SDK")
                url.set("https://github.com/myorg/my-sdk")
                licenses {
                    license {
                        name.set("The MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }
            }
        }
    }
    repositories {
        maven {
            url = uri("https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/")
            credentials {
                username = System.getenv("OSSRH_USERNAME")
                password = System.getenv("OSSRH_PASSWORD")
            }
        }
    }
}

signing {
    sign(publishing.publications["mavenJava"])
}
```

### Publish

```bash
./gradlew publishToMavenLocal    # Local testing
./gradlew publish                # Publish to Maven Central

# Requirements for Maven Central:
# 1. Sonatype OSSRH account (central.sonatype.com)
# 2. GPG signing key
# 3. POM with name, description, URL, license, developers, SCM
```

---

## .NET (NuGet)

### Project Setup

```xml
<!-- MySdk.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <PackageId>MyOrg.MySdk</PackageId>
    <Version>1.0.0</Version>
    <Description>My awesome .NET SDK</Description>
    <Authors>My Name</Authors>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <RepositoryUrl>https://github.com/myorg/my-sdk</RepositoryUrl>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
  </PropertyGroup>
</Project>
```

### Build & Publish

```bash
# Build
dotnet build -c Release

# Pack as .nupkg
dotnet pack -c Release
# Output: bin/Release/MyOrg.MySdk.1.0.0.nupkg

# Publish to NuGet.org
dotnet nuget push bin/Release/*.nupkg --api-key $NUGET_API_KEY --source https://api.nuget.org/v3/index.json
```

---

## SDK Publishing Checklist

| Item | Why |
|------|-----|
| **Semantic Versioning** | Users need to understand the impact of upgrading |
| **CHANGELOG** | Document what changed in each version |
| **README with examples** | Users need quick-start code snippets |
| **Type definitions** | TypeScript (.d.ts), Python (py.typed), Rust (docs.rs) |
| **License** | MIT/Apache-2.0 for permissive; must be present |
| **Tests** | > 80% coverage; CI must pass before publish |
| **Documentation** | API reference + usage guide |
| **Min version pinning** | Set `engines` (npm), `requires-python` (PyPI), `rust-version` (Cargo) |
| **CI/CD publish pipeline** | Tag → build → test → publish (automated) |
| **Deprecation notices** | Use `@deprecated` / `warnings.warn` before removing APIs |
| **Security policy** | SECURITY.md for vulnerability reporting |

## Versioning Strategy

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Bug fix | Patch (1.0.0 → 1.0.1) | Fix null pointer in client |
| New feature (backward compatible) | Minor (1.0.0 → 1.1.0) | Add `listUsers()` method |
| Breaking change | Major (1.0.0 → 2.0.0) | Rename `fetch()` to `get()` |
| Pre-release | Tag (1.0.0-beta.1) | Testing before stable |

## Common Pitfalls (All Languages)

| Issue | Fix |
|-------|-----|
| Breaking change in minor version | Follow SemVer strictly; use deprecation warnings first |
| No changelog | Use `conventional-commits` + automated changelog tools |
| Missing type definitions | TypeScript: emit .d.ts; Python: add py.typed marker |
| API surface too large | Export only what users need; keep internals private |
| Version not bumping in CI | Use `changesets`, `semantic-release`, or `release-please` |
| Dependencies too heavy | Minimize dependencies; use optional/peer dependencies |
| No migration guide | Write MIGRATION.md for major version changes |
| Published test/dev code | Use `.npmignore`, `MANIFEST.in`, `.gitignore` properly |
