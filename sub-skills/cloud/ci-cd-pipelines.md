# CI/CD Pipeline Build Sub-Skill

Set up continuous integration and continuous deployment pipelines for building, testing, and publishing software packages.

**Current versions**: GitHub Actions / GitLab CI / Jenkins (2025-2026)

## When to Use

- Automated build on every push/tag
- Automated testing before merge
- Automated publishing to package registries
- Multi-platform build (build on Linux/macOS/Windows)
- Release automation (tag → build → publish → notify)

---

## GitHub Actions (Recommended for GitHub-hosted projects)

### Basic Build + Test

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Multi-Platform Build

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npm run package  # electron-builder, tauri, etc.
      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.os }}
          path: release/

  publish:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: artifacts/
      - uses: softprops/action-gh-release@v2
        with:
          files: artifacts/**/*
          generate_release_notes: true
```

### Container Build + Push

```yaml
# .github/workflows/docker.yml
name: Docker
on:
  push:
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Release to Package Registries

```yaml
# npm publish
- run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

# PyPI publish
- uses: pypa/gh-action-pypi-publish@release/v1
  with:
    password: ${{ secrets.PYPI_API_TOKEN }}

# crates.io publish
- run: cargo publish
  env:
    CARGO_REGISTRY_TOKEN: ${{ secrets.CRATES_TOKEN }}

# Docker Hub
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_TOKEN }}
```

---

## GitLab CI

### Basic Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - package
  - publish

variables:
  NODE_VERSION: "22"

build:
  stage: build
  image: node:${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'

package:
  stage: package
  image: node:${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm run package
  artifacts:
    paths:
      - release/
  only:
    - tags

publish:
  stage: publish
  image: node:${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm publish
  only:
    - tags
  environment: production
```

### Multi-Platform (GitLab)

```yaml
# Using GitLab CI with Docker-in-Docker for multi-arch
build-multiarch:
  stage: package
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker buildx create --use
    - docker buildx build --platform linux/amd64,linux/arm64 -t $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG --push .
  only:
    - tags
```

---

## Jenkins

### Jenkinsfile (Declarative Pipeline)

```groovy
// Jenkinsfile
pipeline {
    agent any
    environment {
        NODE_VERSION = '22'
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Package') {
            when { tag pattern: "v\\d+\\.\\d+\\.\\d+", comparator: "REGEXP" }
            steps {
                sh 'npm run package'
            }
        }
        stage('Publish') {
            when { tag pattern: "v\\d+\\.\\d+\\.\\d+", comparator: "REGEXP" }
            steps {
                withCredentials([string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')]) {
                    sh 'npm publish'
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(channel: '#builds', message: "Build succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}")
        }
        failure {
            slackSend(channel: '#builds', message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}")
        }
    }
}
```

---

## Common CI/CD Patterns

### Pattern: Tag-Based Release

```bash
# Developer workflow:
git tag v1.2.3
git push origin v1.2.3
# CI automatically: build → test → package → publish → create release
```

### Pattern: Monorepo CI

```yaml
# Only run jobs for changed packages
on:
  push:
    paths:
      - 'packages/web/**'
      - 'packages/shared/**'
```

### Pattern: Matrix Build

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node: [20, 22]
    exclude:
      - os: macos-latest
        node: 20  # Save macOS runner minutes
```

### Pattern: Caching

```yaml
# npm
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('package-lock.json') }}

# Gradle
- uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: gradle-${{ hashFiles('**/*.gradle*') }}

# Docker layers
cache-from: type=gha
cache-to: type=gha,mode=max
```

---

## Platform Comparison

| Feature | GitHub Actions | GitLab CI | Jenkins |
|---------|---------------|-----------|---------|
| Hosting | GitHub Cloud | GitLab Cloud / Self-hosted | Self-hosted |
| Free tier | 2000 min/month | 400 min/month | Unlimited (self-hosted) |
| Config format | YAML | YAML | Groovy (Jenkinsfile) |
| Marketplace | Large (actions) | Smaller | Huge (plugins) |
| Matrix builds | Yes | Yes | Yes |
| Best for | GitHub repos | GitLab repos | On-premise, complex workflows |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Secrets not available in PRs | PRs from forks don't have secrets; use `pull_request_target` carefully |
| Build timeout | Increase timeout; optimize build (caching, parallel jobs) |
| macOS runner expensive | Use Linux for testing; macOS only for packaging |
| Artifact size limit | GitHub: 500MB per artifact; use release assets for large files |
| Tag triggers not working | Ensure tag pattern matches: `tags: ['v*']` |
| Docker build slow | Use BuildKit caching; multi-stage builds; smaller base images |
| Node_modules cache not working | Check `cache` option in `setup-node`; verify lockfile hash |
