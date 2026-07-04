# Packwise

> **Turn any LLM session into a professional build consultant.**
> Scan → Intake → Analyze → Recommend → Confirm → Execute → Audit → Report.

![License](https://img.shields.io/badge/license-MIT-blue)
![Skills](https://img.shields.io/badge/skills-44-brightgreen)
![Platforms](https://img.shields.io/badge/platforms-20+-orange)
![Frameworks](https://img.shields.io/badge/frameworks-40+-purple)
![Tested](https://img.shields.io/badge/tested-10-success)
![Claude Code](https://img.shields.io/badge/Claude%20Code-ready-yellow)
![OpenCode](https://img.shields.io/badge/OpenCode-ready-yellow)
![npm](https://img.shields.io/badge/npm-install_--g%20@anthropic--ai%2Fpackwise-lightgrey)

---

**Packwise** is a universal build & packaging skill pack for AI-assisted development. Instead of one general-purpose assistant guessing at build commands, Packwise gives your AI a complete consultancy workflow — scanning projects, asking the right questions, recommending solutions with reasoning, and executing builds with mandatory security audits.

Works with **Claude Code, OpenCode, Hermes, WorkBuddy, Codex CLI, and other LLM-powered tools**.

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [How It Works](#how-it-works)
- [Supported Platforms](#supported-platforms)
- [Architecture](#architecture)
- [Security Model](#security-model)
- [What's Inside](#whats-inside)
- [Contributing](#contributing)
- [License](#license)

---

## Why This Exists

Building and packaging software is tedious, error-prone, and full of version-specific traps. A generic LLM might suggest outdated commands or miss critical security steps.

**Packwise** solves this by giving your AI a structured build workflow:

| Without Packwise | With Packwise |
|-----------------|---------------|
| "Try running `npm run build`" | Scans project → identifies framework/version → recommends approach with reasoning |
| No security checks | Mandatory credential scan, .env detection, source map cleanup |
| Guesses at platform differences | Asks about target platform, architecture, signing, output location |
| One-shot answer | Consultant-style: recommend → alternatives → user confirms → execute |
| No post-build verification | Mandatory audit: credentials, package integrity, file structure |

---

## Quick Install

### Option A: npm (Recommended)

```bash
npm install -g @anthropic-ai/packwise
```

Then tell your AI agent:
```
> package my Electron app for Windows
```

### Option B: Git Clone

```bash
cd ~/.claude/skills/ && git clone https://github.com/Thomas520TOM/AI-packwise-skill.git packwise
```

### Option C: One-liner (curl)

```bash
curl -fsSL https://raw.githubusercontent.com/Thomas520TOM/AI-packwise-skill/main/install.sh | bash
```

See [INSTALL.md](INSTALL.md) for full instructions per AI agent (Claude Code, OpenCode, Hermes, Cursor, Codex CLI, etc.).

---

## Installation

### Claude Code (Recommended)

Packwise works natively with Claude Code's skill system.

**Option A: User-level (all projects)**
```bash
cd ~/.claude/
git clone https://github.com/Thomas520TOM/AI-packwise-skill.git skills/packwise
```

**Option B: Project-level (this project only)**
```bash
cd your-project/
mkdir -p .claude/skills/
git clone https://github.com/Thomas520TOM/AI-packwise-skill.git .claude/skills/packwise
```

**Option C: Manual file copy**
```bash
# Copy skill.md and sub-skills/ to your project
cp skill.md /path/to/your-project/.claude/skills/packwise-skill.md
cp -r sub-skills/ /path/to/your-project/.claude/skills/packwise-sub-skills/
```

After installation, invoke the skill in Claude Code:
```
> package my Electron app
> build my Tauri project for Windows and macOS
> help me package this Python CLI tool
```

---

### OpenCode

OpenCode uses a `.opencode/` directory for skills.

```bash
# Create skill directory
mkdir -p .opencode/skills/packwise/

# Copy skill files
cp skill.md audit.md .opencode/skills/packwise/
cp -r sub-skills/ .opencode/skills/packwise/
```

In OpenCode, reference the skill in your prompt:
```
@packwise/package-skill.md help me package this project
```

---

### Hermes (LlamaIndex / LangChain Agents)

Hermes loads skills from a configured skills directory.

```bash
# Option 1: Add to Hermes config
# In hermes.config.yaml, add:
skills:
  - path: /path/to/packwise/
    name: packwise

# Option 2: Copy to project
cp skill.md /path/to/your-project/skills/packwise.md
cp -r sub-skills/ /path/to/your-project/skills/packwise-sub-skills/
```

---

### WorkBuddy

WorkBuddy supports skills via its plugin/skill configuration.

```bash
# Copy to WorkBuddy skills directory
cp skill.md ~/.workbuddy/skills/packwise.md
cp -r sub-skills/ ~/.workbuddy/skills/packwise-sub-skills/
```

Or reference in your project:
```
/project:packwise package this Node.js app
```

---

### Codex CLI

Codex CLI uses project-level documentation as context.

```bash
# Add to project root
cp skill.md PACKWISE.md
cp -r sub-skills/ ./skills/

# Codex reads PACKWISE.md as context automatically
```

---

### Other LLM Agents

For any LLM-based tool that reads project files:

```bash
# 1. Copy skill.md to your project root (or a skills/ directory)
cp skill.md /your/project/skills/package-skill.md

# 2. Copy the sub-skills directory
cp -r sub-skills/ /your/project/skills/package-sub-skills/

# 3. Reference it in your prompt
"Read skills/package-skill.md and help me package this project"
```

---

## How It Works

Packwise follows a **consultant-style 8-step workflow**:

| Step | What Happens | Output |
|------|-------------|--------|
| 1. **Scan** | Detect framework, language, dependencies, env files | Project analysis |
| 2. **Intake** | Report findings → ask 12 structured questions | User preferences |
| 3. **Analyze** | Combine scan + answers + online research (if needed) | Strategy options |
| 4. **Recommend** ⭐ | Present BEST approach with reasoning + 2-3 alternatives | Decision support |
| 5. **Confirm** | User selects → generate final build plan | Confirmed plan |
| 6. **Execute** | Load sub-skill → run build commands | Installers/packages |
| 7. **Audit** | Credentials, .env, .map files, package integrity check | Security report |
| 8. **Report** | Structured final build report | Delivery |

---

## Supported Platforms

| Category | Frameworks | Build Verified |
|----------|-----------|----------------|
| **Desktop** | Electron 43, Tauri 2.11, Qt, Flutter Desktop, Pake, Neutralinojs | Electron ✅, Tauri ✅ |
| **Mobile** | Android (Kotlin), iOS/iPadOS, HarmonyOS NEXT, Flutter 3.44, React Native 0.86, Capacitor 8 | — |
| **Web** | Vite 8, Next.js 16, PWA, Serverless/Edge, Monorepo, WebAssembly | Vite ✅, Next.js ✅ |
| **Backend** | Node.js 26, Python 3.12, Go 1.26, Rust, Java/Spring Boot 3.5, PHP/Laravel | Node ✅, Python ✅, Rust ✅, Java ✅ |
| **AI/ML** | PyTorch, TensorFlow, ONNX Runtime, Ollama, llama.cpp, vLLM | — |
| **CLI/SDK** | PyInstaller, Nuitka, npm/PyPI/crates.io publishing | PyInstaller ✅ |
| **Plugins** | Chrome/Firefox Extensions, VS Code, JetBrains | — |
| **Embedded** | ESP32, STM32, ROS/ROS2, Car Infotainment | — |
| **Cloud** | Docker, Kubernetes, CI/CD (GitHub Actions) | — |
| **Wearables** | watchOS, Wear OS, Galaxy Watch | — |

> ✅ = Build tested on real projects. — = Documentation based on official sources (not build-tested in current env).

---

## Architecture

```
skill.md (Main Orchestrator)
│
├─ Step 1: Project Scan ─────── Detect framework, language, deps, env
│
├─ Step 2: Intake ───────────── Ask 12 questions (users, platform, arch...)
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

Packwise enforces security at every stage:

| Stage | Check |
|-------|-------|
| **Pre-build scan** | Detect `.env` files, hardcoded API keys, secrets in source |
| **Build execution** | Delete source maps, exclude `.env` from package, clean test data |
| **Post-build audit** | Verify no credentials, `.map` files, or `.env` in final package |
| **Network check** | Optional: verify no unexpected outbound connections |

---

## What's Inside

### 44 Sub-Skills Covering Every Major Platform

Each sub-skill contains:
- **Version-verified** build commands (checked against official registries)
- **Step-by-step** packaging workflows with copy-paste examples
- **Common pitfalls** with solutions (from real build testing)
- **CI/CD** configuration templates (GitHub Actions, GitLab CI)
- **Security** best practices specific to the platform

### Tested Framework Versions (July 2026)

| Framework | Version | Verified |
|-----------|---------|----------|
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

```bash
# Fork and clone
git clone https://github.com/YOUR_USER/packwise.git
cd packwise

# Make changes to skill.md or sub-skills/
# Test by installing in your AI agent and running a packaging workflow

# Submit PR
git checkout -b feat/my-improvement
git commit -m "feat: add [framework] support"
git push origin feat/my-improvement
```

**Rules:**
1. All instructions in **English** only
2. Verify versions against **official registries** (npm, PyPI, GitHub)
3. Include **Common Pitfalls** table for each new sub-skill
4. Test build commands when possible
5. Never commit secrets, API keys, or credentials

---

## License

MIT — use it, fork it, improve it.

---

<p align="center">
  Built with care for the AI-assisted development community.
  <br>
  <a href="https://github.com/Thomas520TOM/AI-packwise-skill">GitHub</a> · <a href="https://github.com/Thomas520TOM/AI-packwise-skill/issues">Issues</a> · <a href="https://github.com/Thomas520TOM/AI-packwise-skill/blob/main/INSTALL.md">Install Guide</a>
</p>
