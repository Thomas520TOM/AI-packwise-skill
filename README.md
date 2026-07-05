# packwise-skills

> One skill that turns your AI into a build consultant — scan, recommend, package, and audit any project.

<p align="center">
  <a href="https://github.com/Thomas520TOM/packwise-skills/commits/main">
    <img src="https://img.shields.io/github/last-commit/Thomas520TOM/packwise-skills?style=flat-square&logo=github" alt="last commit">
  </a>
  <a href="https://github.com/Thomas520TOM/packwise-skills/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&logo=github" alt="license">
  </a>
  <a href="https://github.com/Thomas520TOM/packwise-skills/tree/main/sub-skills">
    <img src="https://img.shields.io/badge/skills-44-brightgreen?style=flat-square" alt="skills">
  </a>
  <a href="#supported-platforms">
    <img src="https://img.shields.io/badge/platforms-20%2B-orange?style=flat-square" alt="platforms">
  </a>
  <a href="#supported-platforms">
    <img src="https://img.shields.io/badge/frameworks-40%2B-purple?style=flat-square" alt="frameworks">
  </a>
  <a href="#tested-framework-versions">
    <img src="https://img.shields.io/badge/tested-10-success?style=flat-square" alt="tested">
  </a>
  <a href="#installation">
    <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-yellow?style=flat-square" alt="works with">
  </a>
</p>

---

**Packwise** is a universal build & packaging skill for AI-assisted development.  Instead of your AI guessing at build commands and hoping for the best, Packwise gives it a structured, consultant-grade workflow that scans your project, asks the right questions, recommends solutions with reasoning, and executes builds with mandatory security audits — across 20+ platforms and 40+ frameworks.

---

## Why This Exists

Packaging software is where most AI coding assistants fail. They suggest outdated flags, forget platform-specific quirks, skip credential scans, and have no concept of a proper build plan. **Packwise fixes this** by turning your AI into a structured build consultant with real domain knowledge.

<div align="center">

| Without Packwise | With Packwise |
|:---:|:---:|
| `"Try running npm run build"` | Scans project → identifies framework/version → recommends with reasoning |
| No security checks | Mandatory credential scan, `.env` detection, source map cleanup |
| Guesses platform differences | Asks target platform, arch, signing, output — all upfront |
| One-shot answer | Full workflow: recommend → alternatives → confirm → execute |
| No post-build verification | Mandatory audit: credentials, integrity, file structure |

</div>

---

## How It Works

Packwise runs a **consultant-style 8-step workflow** — the same process a human build engineer would follow:

| Step | Action | Result |
|:----:|--------|--------|
| **1** | **Scan** — detect framework, language, dependencies, `.env` files | Project analysis |
| **2** | **Intake** — report findings, ask 12 structured questions | User preferences |
| **3** | **Analyze** — combine scan + answers + online research (if needed) | Strategy options |
| **4** | **Recommend** — present best approach with reasoning + alternatives | Decision support |
| **5** | **Confirm** — user selects, final build plan generated | Confirmed plan |
| **6** | **Execute** — load sub-skill, run build commands | Installers / packages |
| **7** | **Audit** — credentials, `.env`, `.map`, package integrity | Security report |
| **8** | **Report** — structured final build report | Delivery |

---

## Key Advantages

Packwise is more than a build script. It's a **complete packaging intelligence layer** that works across your entire stack.

| Capability | What It Means |
|------------|---------------|
| **44 sub-skills** | Deep, platform-specific knowledge — not generic advice |
| **20+ platforms** | Desktop, mobile, web, backend, AI/ML, CLI, plugins, embedded, cloud |
| **Mandatory security** | Every build ends with a credential and integrity audit |
| **Consultant workflow** | Recommend → confirm → execute, never auto-builds without approval |
| **Version-verified** | Build commands checked against npm, PyPI, crates.io, official registries |
| **CI/CD templates** | GitHub Actions and GitLab CI configs included in every sub-skill |
| **Cross-tool support** | Works with Claude Code, OpenCode, Cursor, Codex CLI, and more |

---

## Installation

### npx (No Install Required)

Run directly without installing globally:

```bash
npx packwise-skills
```

### npm (Recommended)

```bash
npm install -g packwise-skills
```

### Curl One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/Thomas520TOM/packwise-skills/main/install.sh | bash
```

### Git Clone

```bash
# User-level (all projects)
cd ~/.claude/
git clone https://github.com/Thomas520TOM/packwise-skills.git skills/packwise

# Project-level (this project only)
cd your-project/
mkdir -p .claude/skills/
git clone https://github.com/Thomas520TOM/packwise-skills.git .claude/skills/packwise
```

Then invoke in your AI agent:

```
> package my Electron app for Windows
```

---

### Selective Installation

Only need certain platforms? Use `--only` to install specific sub-skills. Core files (`skill.md`, `audit.md`, `CLAUDE.md`) are always installed.

```bash
# Desktop + Mobile only
npx packwise-skills --only desktop,mobile

# Backend + Cloud only
npx packwise-skills --only backend,cloud

# AI/ML + CLI only
npx packwise-skills --only ai,cli
```

Works with curl too:

```bash
curl -fsSL https://raw.githubusercontent.com/Thomas520TOM/packwise-skills/main/install.sh | bash -s -- --only desktop,mobile
```

**Available categories:**
`desktop` `mobile` `web` `backend` `ai` `cli` `plugins` `embedded` `security` `cloud` `cross-platform`

---

<details>
<summary><strong>Other AI tools</strong> — OpenCode, Cursor, Hermes, Codex CLI, WorkBuddy</summary>

**OpenCode** — copy to `.opencode/skills/packwise/` and reference in prompts:
```bash
mkdir -p .opencode/skills/packwise/
cp skill.md audit.md .opencode/skills/packwise/
cp -r sub-skills/ .opencode/skills/packwise/
```

**Cursor** — add to `.cursor/skills/` or reference via `@packwise` in prompts.

**Hermes / LangChain Agents** — add to `hermes.config.yaml`:
```yaml
skills:
  - path: /path/to/packwise/
    name: packwise
```

**Codex CLI** — copy to project root as `PACKWISE.md` (auto-read as context).

**WorkBuddy** — copy to `~/.workbuddy/skills/` or use `/project:packwise`.

**Any LLM agent** — copy `skill.md` + `sub-skills/` to your project and prompt:
```
Read skills/skill.md and help me package this project
```

Full instructions: [INSTALL.md](INSTALL.md)
</details>

---

## Supported Platforms

| Category | Frameworks | Build Verified |
|----------|-----------|:--------------:|
| **Desktop** | Electron 43, Tauri 2.11, Qt, Flutter Desktop, Pake, Neutralinojs | Electron, Tauri |
| **Mobile** | Android (Kotlin), iOS/iPadOS, HarmonyOS NEXT, Flutter 3.44, React Native 0.86, Capacitor 8 | — |
| **Web** | Vite 8, Next.js 16, PWA, Serverless/Edge, Monorepo, WebAssembly | Vite, Next.js |
| **Backend** | Node.js 26, Python 3.12, Go 1.26, Rust, Java/Spring Boot 3.5, PHP/Laravel | Node, Python, Rust, Java |
| **AI/ML** | PyTorch, TensorFlow, ONNX Runtime, Ollama, llama.cpp, vLLM | — |
| **CLI/SDK** | PyInstaller, Nuitka, npm/PyPI/crates.io publishing | PyInstaller |
| **Plugins** | Chrome/Firefox Extensions, VS Code, JetBrains | — |
| **Embedded** | ESP32, STM32, ROS/ROS2, Car Infotainment | — |
| **Cloud** | Docker, Kubernetes, CI/CD (GitHub Actions) | — |
| **Wearables** | watchOS, Wear OS, Galaxy Watch | — |

> Checked = build tested on real projects. — = documentation verified against official sources.

---

## Architecture

```
skill.md (Main Orchestrator)
│
├─ Step 1: Project Scan ─────── Detect framework, language, deps, env
│
├─ Step 2: Intake ───────────── Ask 12 questions (platform, arch, signing...)
│  ├─ Part A: Project Summary    ← scan results displayed
│  ├─ Part B: Questions          ← interactive options with defaults
│  └─ Part C: Confirmation       ← summary table for user approval
│
├─ Step 3: Analyze & Research ── Combine data + online research if needed
│
├─ Step 4: Recommend ⭐ ──────── Best solution + alternatives + reasoning
│
├─ Step 5: Confirm ───────────── User selects → final build plan
│
├─ Step 6: Execute ───────────── Load sub-skill → run build commands
│  ├─ sub-skills/desktop/       Electron, Tauri, Qt, games, VR...
│  ├─ sub-skills/mobile/        Android, iOS, Flutter, RN, watchOS...
│  ├─ sub-skills/web/           Vite, Next.js, PWA, WASM...
│  ├─ sub-skills/backend/       Node, Python, Go, Rust, Java, PHP
│  ├─ sub-skills/ai/            PyTorch, Ollama, llama.cpp
│  ├─ sub-skills/cli/           PyInstaller, npm/PyPI publishing
│  ├─ sub-skills/plugins/       Chrome, VS Code, JetBrains
│  ├─ sub-skills/embedded/      ESP32, STM32, ROS, car
│  ├─ sub-skills/security/      Pentest tools, scanners
│  ├─ sub-skills/cloud/         Docker, K8s, CI/CD
│  └─ sub-skills/cross-platform/ .NET MAUI, KMP
│
├─ Step 7: Audit (mandatory) ── Credentials, .env, .map, package check
│
└─ Step 8: Final Report ─────── Build report with all results
```

---

## Security Model

Packwise enforces security at every stage — no build completes without a clean audit.

| Stage | Check |
|-------|-------|
| **Pre-build scan** | Detect `.env` files, hardcoded API keys, secrets in source |
| **Build execution** | Delete source maps, exclude `.env` from package, clean test data |
| **Post-build audit** | Verify no credentials, `.map` files, or `.env` in final package |
| **Network check** | Optional: verify no unexpected outbound connections |

---

## What's Inside

### 44 Sub-Skills — Every Major Platform Covered

Each sub-skill contains:
- **Version-verified** build commands (checked against official registries)
- **Step-by-step** packaging workflows with copy-paste examples
- **Common pitfalls** table with solutions (from real build testing)
- **CI/CD** configuration templates (GitHub Actions, GitLab CI)
- **Security** best practices specific to the platform

### Tested Framework Versions

| Framework | Version | Verified |
|-----------|:-------:|:--------:|
| Electron | 43.x | ✅ |
| Tauri | 2.11.x | ✅ |
| Vite | 8.1.3 | ✅ |
| Next.js | 16.2.10 | ✅ |
| Node.js | 26 LTS | ✅ |
| Python | 3.12 | ✅ |
| Rust | 1.96 | ✅ |
| Java | 21 LTS | ✅ |
| React Native | 0.86.x | — |
| Flutter | 3.44.x | — |
| Capacitor | 8.x | — |
| Go | 1.26 | — |

---

## Contributing

Contributions are welcome. Before submitting, please:

1. Write all instructions in **English** only
2. Verify framework versions against **official registries** (npm, PyPI, GitHub Releases)
3. Include a **Common Pitfalls** table in every new sub-skill
4. Test build commands when possible
5. Never commit secrets, API keys, or credentials

```bash
git clone https://github.com/YOUR_USER/packwise-skills.git
cd packwise-skills
git checkout -b feat/my-improvement
# edit skill.md or sub-skills/
git commit -m "feat: add [framework] support"
git push origin feat/my-improvement
# open a PR against main
```

---

## License

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square&logo=github)](https://opensource.org/licenses/MIT)

This project is licensed under the [MIT License](LICENSE).

</div>

---

<div align="center">
  Built with care for the AI-assisted development community.
  <br><br>
  <a href="https://github.com/Thomas520TOM/packwise-skills">GitHub</a> · <a href="https://github.com/Thomas520TOM/packwise-skills/issues">Issues</a> · <a href="https://github.com/Thomas520TOM/packwise-skills/blob/main/INSTALL.md">Install Guide</a>
  <br>
</div>
