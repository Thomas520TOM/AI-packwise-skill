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
    <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%7C%20Cursor%20%7C%20OpenCode%20%7C%20Copilot-yellow?style=flat-square" alt="works with">
  </a>
</p>

---

**Packwise** is a universal build & packaging skill pack that gives your AI a structured, consultant-grade workflow — scanning, recommending, and executing builds with mandatory security audits across 20+ platforms.

---

## Why This Exists

Most AI coding assistants treat build as an afterthought — they suggest a command and hope for the best. **Packwise** gives your AI a real packaging workflow.

<div align="center">

| Without Packwise | With Packwise |
|:---:|:---:|
| `npm run build` and pray | Scans project, identifies framework/version, recommends with reasoning |
| No security checks | Mandatory credential scan, `.env` detection, source map cleanup |
| Ignores platform specifics | Asks target platform, arch, signing, output upfront |
| One-shot, no follow-up | Recommend → confirm → execute, with alternatives |

</div>

---

## Quick Demo

```
You:  > package my Electron app for Windows and macOS

AI:   Scan Results:
      - Framework: Electron 31 + React 18 + Express + SQLite
      - Language: TypeScript | Complexity: L2
      Is this correct? [Correct / Add / Exclude / Correct]

You:  Correct

AI:   [Popup] Target users? → General consumers
      [Popup] Platform? → Windows + macOS
      [Popup] Architecture? → Win x64 | macOS Universal
      ... (17 interactive questions via popups)

AI:   RECOMMENDED: Electron 31 + electron-builder
      Alternative A: Tauri (3-10MB, needs Rust rewrite)
      Which approach? [Recommended / Alt A / Alt B / Custom]

You:  1

AI:   FINAL BUILD PLAN | Reply 'yes' to start

You:  yes

AI:   [Popup] Logo? → /path/to/icon.png | Crop corners? → Yes
      [Popup] Output? → ./release/
      [Popup] Config changes: [1] Add electron-builder.yml [2] ...
      [Popup] Approve? → Approve all

AI:   Building... Done
      Audit: No credentials, no .env, no .map
      Output:
        MyApp-v1.0.0-windows-x64.exe
        MyApp-v1.0.0-macos-universal.dmg
```

---

## How It Works

A **9-step build workflow**:

| Step | Action | Result |
|:----:|--------|--------|
| **1** | **Scan** — detect framework, language, dependencies, `.env` files | Project analysis |
| **2** | **Intake** — build overview confirmation, then 18 questions (some per-platform) | User preferences |
| **3** | **Analyze** — combine scan + answers + online research (if needed) | Strategy options |
| **4** | **Recommend** — present best approach with reasoning + alternatives | Decision support |
| **5** | **Confirm** — user selects, final build plan generated | Confirmed plan |
| **6** | **Prepare** — detect config gaps, propose fixes, user approves each | Ready-to-build project |
| **7** | **Execute** — load sub-skill, run build commands | Installers / packages |
| **8** | **Audit** — credentials, `.env`, `.map`, package integrity | Security report |
| **9** | **Report** — structured final build report | Delivery |

---

## Key Advantages

What makes Packwise different from a generic build command:

| Capability | What It Means |
|------------|---------------|
| **44 sub-skills** | Platform-specific knowledge, not generic advice |
| **20+ platforms** | Desktop, mobile, web, backend, AI/ML, CLI, plugins, embedded, cloud |
| **Mandatory security** | Every build ends with a credential and integrity audit |
| **Consultant workflow** | Recommends, confirms, then executes — no auto-builds |
| **Version-verified** | Build commands checked against npm, PyPI, crates.io, official registries |
| **Selective install** | Install only the skills you need via `--only` |
| **11 agents** | Claude Code, Cursor, OpenCode, Copilot, and 7 more |
| **Interactive Q&A** | All questions via popup UI, not text dumps |

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

### Updating

```bash
npx packwise-skills update
```

This automatically detects your installation method and updates to the latest version.

If the update doesn't seem to take effect, clear the npm cache first:

```bash
npm cache clean --force
npm install -g packwise-skills@latest
```

---

### Selective Installation

Install only the sub-skills you need with `--only`. Core files (`skill.md`, `audit.md`, `CLAUDE.md`) are always installed.

**By category:**
```bash
npx packwise-skills --only desktop,mobile
npx packwise-skills --only backend,cloud
```

**By specific framework:**
```bash
npx packwise-skills --only electron,tauri,react-native
npx packwise-skills --only docker,kubernetes
```

**Mix both:**
```bash
npx packwise-skills --only electron,mobile
```

Works with curl too:
```bash
curl -fsSL https://raw.githubusercontent.com/Thomas520TOM/packwise-skills/main/install.sh | bash -s -- --only electron,mobile
```

**Categories:** `desktop` `mobile` `web` `backend` `ai` `cli` `plugins` `embedded` `security` `cloud` `cross-platform`

**Frameworks:** `electron` `tauri` `android` `ios` `react-native` `flutter-mobile` `docker` `kubernetes` `spa` `ssr` and [more](bin/packwise.js)

---

<details>
<summary><strong>Other AI tools</strong> — OpenCode, Cursor, Codex CLI, OpenClaw, WorkBuddy, Trae, Hermes, GitHub Copilot</summary>

**OpenCode** — copy to `.opencode/skills/packwise/` and reference in prompts:
```bash
mkdir -p .opencode/skills/packwise/
cp skill.md audit.md .opencode/skills/packwise/
cp -r sub-skills/ .opencode/skills/packwise/
```

**Cursor** — add to `.cursor/skills/` or reference via `@packwise` in prompts.

**Codex CLI** — copy to project root as `PACKWISE.md` (auto-read as context).

**OpenClaw** — copy to `.openclaw/skills/packwise/` and reference in prompts:
```bash
mkdir -p .openclaw/skills/packwise/
cp skill.md audit.md .openclaw/skills/packwise/
cp -r sub-skills/ .openclaw/skills/packwise/
```

**WorkBuddy** — copy to `~/.workbuddy/skills/` or use `/project:packwise`.

**Trae** — copy to `.trae/skills/packwise/` and reference in prompts:
```bash
mkdir -p .trae/skills/packwise/
cp skill.md audit.md .trae/skills/packwise/
cp -r sub-skills/ .trae/skills/packwise/
```

**Hermes / LangChain Agents** — add to `hermes.config.yaml`:
```yaml
skills:
  - path: /path/to/packwise/
    name: packwise
```

**GitHub Copilot** — copy to `.copilot/skills/packwise/` and reference in prompts:
```bash
mkdir -p .copilot/skills/packwise/
cp skill.md audit.md .copilot/skills/packwise/
cp -r sub-skills/ .copilot/skills/packwise/
```

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
├─ 1. Scan ─────────── Detect framework, language, deps, env
│
├─ 2. Intake ────────── Build overview → confirm scope → ask 18 questions
│
├─ 3. Analyze ───────── Combine scan + answers + online research
│
├─ 4. Recommend ⭐ ──── Best approach + alternatives + reasoning
│
├─ 5. Confirm ───────── User selects → final build plan
│
├─ 6. Prepare ───────── Logo + output location → detect config gaps → user approves
│
├─ 7. Execute ───────── Load sub-skill → run platform-specific build
│  │
│  ├─ desktop/ ──────── Electron, Tauri, Qt, Flutter Desktop, games, VR
│  ├─ mobile/ ───────── Android, iOS, HarmonyOS, Flutter, React Native
│  ├─ web/ ──────────── Vite, Next.js, PWA, Serverless, WASM
│  ├─ backend/ ──────── Node.js, Python, Go, Rust, Java, PHP
│  ├─ ai/ ───────────── PyTorch, Ollama, llama.cpp, vLLM
│  ├─ cli/ ──────────── PyInstaller, npm/PyPI publishing
│  ├─ plugins/ ──────── Chrome, VS Code, JetBrains
│  ├─ embedded/ ─────── ESP32, STM32, ROS, car infotainment
│  ├─ cloud/ ────────── Docker, Kubernetes, CI/CD
│  ├─ security/ ─────── Pentest tools, scanners
│  └─ cross-platform/ ─ .NET MAUI, Kotlin Multiplatform
│
├─ 8. Audit 🔒 ──────── Credentials, .env, .map, package integrity
│
└─ 9. Report ────────── Structured final build report
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
