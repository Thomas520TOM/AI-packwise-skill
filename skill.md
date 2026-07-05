# Package Skills Plugin — Universal Build & Packaging Orchestrator

Covers all **build and packaging** scenarios for indie developers, startups, and small-to-medium software companies: desktop, mobile, web, backend, AI/ML, CLI, plugins, embedded, security tools, containerization, cross-platform frameworks, monorepos, WebAssembly, VR/AR, wearables, smart platforms, serverless, CI/CD, and payment integration.

> **Scope**: This skill focuses on **building and packaging** source code into distributable artifacts (`.apk`, `.exe`, `.dmg`, `.vsix`, Docker images, WASM modules, etc.). Production operations and infrastructure provisioning are outside its scope.

## Trigger Words

"package", "build", "bundle", "compile", "installer", "desktop app", "generate exe", "build software", "client packaging", "develop plugin", "app packaging", "embedded", "publish to store", "containerize", "Docker", "WASM", "monorepo build", "cross-compile"

## Plugin Architecture

```
package/
├── skill.md                            ← Main orchestrator: scan → classify → guide → dispatch
├── audit.md                            ← Post-build audit (top-level, mandatory)
└── sub-skills/
    ├── desktop/                        ← Desktop apps (9)
    │   ├── electron.md                 ← Electron (security, path resolution, packaging, signing, auto-update, CI/CD, pitfalls)
    │   ├── tauri.md                    ← Tauri 2.0 (Rust backend, minimal footprint)
    │   ├── native-app.md               ← Qt/Flutter/.NET (performance-critical)
    │   ├── web-to-desktop.md           ← Web-to-desktop (Pake/Neutralinojs)
    │   ├── game-dev.md                 ← Game dev (Unity/Unreal/Godot)
    │   ├── vr-ar.md                    ← VR/AR (Meta Quest/Vision Pro/SteamVR)
    │   ├── smart-platforms.md          ← Smart TV/Car/RPi (Android TV/tvOS/webOS/Tizen)
    │   └── scenarios.md                ← Desktop scenarios (AI/ERP/trading/IoT/IM)
    ├── mobile/                         ← Mobile (7)
    │   ├── android.md                  ← Android native (Kotlin/Java)
    │   ├── ios.md                      ← iOS/iPadOS (Swift/ObjC)
    │   ├── harmonyos.md                ← HarmonyOS (ArkTS)
    │   ├── flutter-mobile.md           ← Flutter mobile
    │   ├── react-native.md             ← React Native
    │   ├── capacitor.md                ← Capacitor (Web → mobile)
    │   └── wearables.md                ← Wearables (watchOS/Wear OS/Galaxy Watch)
    ├── web/                            ← Web apps (6)
    │   ├── spa.md                      ← SPA (React/Vue/Angular/Svelte)
    │   ├── ssr.md                      ← SSR (Next.js/Nuxt/Remix)
    │   ├── pwa.md                      ← PWA (Progressive Web App)
    │   ├── serverless-edge.md          ← Serverless & Edge (Lambda/CF Workers/Vercel)
    │   ├── monorepo.md                 ← Monorepo (Turborepo/Nx/pnpm workspaces)
    │   └── wasm.md                     ← WebAssembly (Rust/Go/C → WASM)
    ├── backend/                        ← Backend services (6)
    │   ├── node-server.md              ← Node.js (Express/Nest/Fastify)
    │   ├── python-server.md            ← Python (Flask/Django/FastAPI)
    │   ├── go-server.md                ← Go (Gin/Echo/Fiber)
    │   ├── rust-backend.md             ← Rust (Axum/Actix-Web/Rocket)
    │   ├── java-spring.md              ← Java (Spring Boot/Quarkus/Micronaut)
    │   └── php-laravel.md              ← PHP (Laravel/Symfony/Slim)
    ├── ai/                             ← AI/ML (2)
    │   ├── python-ml.md                ← Python ML model packaging
    │   └── local-llm.md                ← Local LLM applications
    ├── cli/                            ← CLI tools & Libraries (2)
    │   ├── python-cli.md               ← Python CLI tools
    │   └── sdk-library.md              ← SDK/Library publishing (npm/PyPI/crates.io/Maven/NuGet/Go)
    ├── plugins/                        ← Plugins (3)
    │   ├── browser-extension.md        ← Chrome/Edge/Firefox extensions
    │   ├── vscode-extension.md         ← VS Code extensions
    │   └── jetbrains-plugin.md         ← JetBrains plugins
    ├── embedded/                       ← Embedded (4)
    │   ├── esp32.md                    ← ESP32 (Arduino/ESP-IDF)
    │   ├── stm32.md                    ← STM32 (Keil/CubeIDE)
    │   ├── ros.md                      ← ROS/ROS2 robotics
    │   └── car-infotainment.md         ← Car infotainment (HarmonyOS/Auto/QNX)
    ├── security/                       ← Security tools (1)
    │   └── security-tools.md           ← Pentest / scanners / SIEM
    ├── cloud/                          ← Cloud & Infrastructure (4)
    │   ├── docker.md                   ← Docker containerization
    │   ├── kubernetes.md               ← Kubernetes/Helm/K3s
    │   ├── ci-cd-pipelines.md          ← CI/CD (GitHub Actions/GitLab CI/Jenkins)
    │   └── payment-integration.md      ← Payment (Stripe/Alipay/WeChat Pay/IAP)
    └── cross-platform/                 ← Cross-platform frameworks (1)
        └── multiplatform.md            ← .NET MAUI / Kotlin Multiplatform / Compose Multiplatform
```

## Core Workflow

```
1. Project Scan         → Identify project type, language, dependencies, architecture
2. Report & Intake      → Report findings to user → Ask key questions interactively
3. Analyze & Research   → Combine scan results + user answers + online research (if needed)
4. Recommend & Guide    → Present RECOMMENDED solution + 2-3 alternatives with reasoning → discuss with user
5. Confirm Plan         → User selects final approach → generate confirmation summary
6. Prepare Project      → Detect config gaps → propose modifications → user approves each change → apply
7. Execute              → Load sub-skill → run build process (≤15% deviation without approval)
8. Audit                → Execute audit.md (mandatory, cannot be skipped)
9. Final Report         → Output structured build report
```

> **Guidance Philosophy**: The LLM acts as a **build consultant**, not a form-filler. After scanning and asking questions, the LLM MUST synthesize all information, perform targeted research if needed, and present a clear recommendation with reasoning. The user should feel guided, not interrogated.

### Step 2: Report & Intake

After scanning, the AI reports findings and asks questions **in one interactive session**. Do NOT split across multiple steps.

**Format**: Present each question as a numbered list. Mark the **⭐ Recommended** option with reasoning. Let the user reply with numbers (e.g., "1,2,4,3,1,2") or answer conversationally. If the user says "skip", use the recommended option.

---

#### Part A: Project Summary (Tell the User What You Found)

> **Scanning is the foundation of everything.** If the scan is wrong, all downstream decisions will be wrong. The LLM MUST scan thoroughly before asking any questions. If the scan reveals issues (missing dependencies, .env files, outdated configs), **flag them immediately** — don't wait until build time.

```
📋 Project Scan Results:
- Framework: [detected framework]
- Language: [detected language]
- Estimated complexity: [L1/L2/L3]
- Key dependencies: [list]
- Source files: [count]
- Notable: [any special findings — native modules, env files, game engine, etc.]
```

**Dependency Completeness Check** (auto-run during scan):

The LLM MUST verify that all required dependencies for the detected framework are present. If anything is missing, **tell the user before proceeding**:

| Framework | Required Dependencies | Check Command |
|-----------|----------------------|---------------|
| Tauri | `@tauri-apps/api` in package.json | `grep "@tauri-apps/api" package.json` |
| Electron | `electron` + `electron-builder` in devDependencies | `grep "electron" package.json` |
| React Native | `react-native` + `@react-native-community/cli` | `grep "react-native" package.json` |
| Capacitor | `@capacitor/core` + `@capacitor/cli` | `grep "@capacitor" package.json` |
| Vue + Vite | `vue` + `@vitejs/plugin-vue` + `vite` | `grep "vue\|vite" package.json` |
| Next.js | `next` + `react` + `react-dom` | `grep "next\|react" package.json` |

**Security Scan** (auto-run during scan):

| What to check | Why | Action if found |
|---------------|-----|----------------|
| `.env` / `.env.*` files | May contain API keys, tokens | ⚠️ Flag to user: "Found .env with sensitive data — will remove before packaging" |
| Hardcoded `sk-` / `api_key` / `secret` in source | Credential leak | ⚠️ Flag to user: "Found hardcoded credentials in [file]" |
| `node_modules` in git | Bloat, potential secret leak | ⚠️ Suggest adding to `.gitignore` |
| Missing `.gitignore` | May accidentally commit secrets | ⚠️ Suggest creating one |

---

#### Part B: Key Questions

**Q1. Who are the target users?**
- 1. ⭐ General consumers → One-click installer (NSIS/DMG/APK)
- 2. Enterprise internal → MSI/Group Policy/MDM
- 3. Developers → npm/pip/cargo
- 4. Government/military → Domestic platform adaptation

**Q2. Distribution channel?**
- 1. ⭐ Website download → Code signing + auto-update
- 2. App Store → Store signing + review compliance
- 3. Enterprise internal → MDM/Group Policy
- 4. Open source → GitHub Releases / npm / PyPI

**Q3. Target platform(s)?** (multi-select)
- 1. ⭐ Windows
- 2. macOS
- 3. Linux
- 4. All desktop (1+2+3)
- 5. Android
- 6. iOS/iPadOS

**Q3b. Architecture per platform?** (ask for EACH platform selected in Q3)

> Example: If user selected "Windows + macOS" in Q3, ask:
> "You selected Windows and macOS. Now choose architecture for each:"

- **Windows architecture?**
  - 1. ⭐ x64 only (most common, covers 99% of PCs)
  - 2. ARM64 only (Surface Pro X, Snapdragon laptops)
  - 3. Both x64 + ARM64 (two installers output)
- **macOS architecture?**
  - 1. ⭐ Universal Binary (x64 + ARM64 in one file, works on all Macs)
  - 2. ARM64 only (Apple Silicon M1+, no Intel Mac support)
  - 3. x64 only (Intel Macs only, not recommended)
- **Linux architecture?**
  - 1. ⭐ x64 only (most common)
  - 2. ARM64 only (Raspberry Pi 4/5, ARM servers)
  - 3. Both x64 + ARM64 (two packages output)
- **Android architecture?**
  - 1. ⭐ ARM64 (v8a) — covers 95%+ of modern devices
  - 2. ARM64 + ARMv7 (for older devices, larger APK)
  - 3. Universal APK (all architectures, largest size)
- **iOS architecture?**
  - 1. ⭐ ARM64 (all modern Apple devices, automatic)

> All selected architecture packages will be output to the same target folder (Q11).

**Q4. App name, version, copyright holder?**

**Q5. Logo/icon ready?**
- 1. ⭐ Yes, I have icons → Ask for path, format, sizes
- 2. Need to generate → Recommend tool based on platform
- 3. Use default → Not recommended for production

**Q6. Source code protection (anti-reverse-engineering)?**

> This determines how hard it is for someone to decompile and read your source code from the packaged app.

- 1. ⭐ **Standard packaging** — Code bundled but extractable with basic tools. Fine for most apps. (Electron: ASAR; Tauri: already compiled Rust, very hard to reverse)
- 2. **Obfuscation** — JavaScript/TypeScript code is scrambled (variable names mangled, control flow flattened). Takes minutes to hours to reverse. Adds ~1 min build time.
- 3. **Bytecode compilation** — Source code compiled to V8 binary bytecode (.jsc). Cannot be read as text. Must match Electron's Node.js version. Takes ~2 min build time. (Electron only)
- 4. **Full protection scheme** — All of the above + AES-256-CBC encryption of config files + image base64 embedding. Recommended for commercial software with proprietary algorithms. Adds ~5 min build time.
- 5. **None** — Open source project, no protection needed. Anyone can read the code.

**Q7. Clear test data and hardcoded keys before packaging?**
- 1. ⭐ Yes, clean everything
- 2. No (dev build only)

**Q8. Code signing?**
- 1. ⭐ Yes, I have certificates
- 2. No signing (will show security warnings)
- 3. Help me understand what I need

**Q9. Auto-update?**
- 1. ⭐ Yes
- 2. No

**Q10. Budget / team capability?**
- 1. ⭐ Zero budget, individual developer
- 2. Has Apple Developer account ($99/year)
- 3. Has code signing certificate
- 4. Team has Rust experience
- 5. Team has only frontend experience

**Q11. Output location?**
- 1. ⭐ `./release/` (default)
- 2. Custom path

**Q12. Any special requirements?**
- (Open-ended: custom protocol, system tray, multi-window, offline-first, etc.)

---

### Step 3: Analyze & Research

After collecting the user's answers, the LLM **MUST**:

1. **Synthesize** — Combine scan results (Step 1) + user answers (Step 2) + complexity assessment
2. **Research if needed** — If the project type is niche or the user has unusual requirements, search for official documentation or community solutions (time-boxed to 2-3 minutes)
3. **Determine the best approach** — Based on ALL available information, identify the optimal packaging strategy
4. **Identify alternatives** — Find 2-3 viable alternatives with clear trade-offs

**When to research online:**
- User's framework/version is not covered by any sub-skill
- User has requirements that conflict with standard approaches
- Latest best practices may have changed (check official docs)

**When NOT to research:**
- The project clearly matches an existing sub-skill
- User's requirements are straightforward
- Research would add no value beyond what the sub-skill already covers

---

### Step 4: Recommend & Guide (THE KEY STEP)

This is where the LLM acts as a **consultant**. Present the analysis as a conversation, not a data dump.

**Output format:**

```
═══════════════════════════════════════════════
         PACKAGING RECOMMENDATION
═══════════════════════════════════════════════

Based on your project scan and requirements, here is my analysis:

[Project Analysis]
Your [framework] project has [complexity] complexity with [key characteristics].
The main challenge will be [identified challenge].

⭐ RECOMMENDED: [Solution Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Why this approach:
- [Reason 1 — e.g., "Your team has only frontend experience, so Electron is the lowest barrier"]
- [Reason 2 — e.g., "You need SQLite native module, which requires Node.js runtime"]
- [Reason 3 — e.g., "Target size ~150MB is acceptable for your use case"]

Configuration:
- Framework: [Electron 43 + React + Express + SQLite]
- Build tool: [electron-builder 26]
- Platforms: [Windows + macOS]
- Architecture: [Windows x64, macOS Universal]
- Package format: [NSIS for Windows x64, DMG for macOS Universal]
- Source protection: [ASAR + JavaScript obfuscation]
- Signing: [Windows EV cert + macOS Developer ID]
- Auto-update: [electron-updater via GitHub Releases]
- Output folder: [./release/]
- Expected size: [~150MB per platform]

Alternative A: [Tauri 2.11]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Pro: Much smaller (3-10MB), better performance
- Con: Requires Rust rewrite of backend, higher learning curve
- When to choose: If team can learn Rust and package size is critical

Alternative B: [Neutralinojs]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Pro: Minimal footprint (~2MB)
- Con: Limited native module support, smaller ecosystem
- When to choose: If app is mostly a web wrapper with no backend

═══════════════════════════════════════════════
Which approach would you like to proceed with?
  1. ⭐ Recommended ([Solution Name])
  2. Alternative A
  3. Alternative B
  4. Custom combination (tell me what you want)
═══════════════════════════════════════════════
```

**Key principles for the recommendation:**
- **Lead with WHY** — Don't just say "use Electron". Explain WHY based on the user's specific answers.
- **Be specific** — Reference the user's actual requirements (target users, platform, budget).
- **Quantify** — Give expected package size, build time, complexity.
- **Honest trade-offs** — Don't hide downsides. "Electron is 150MB but Tauri is 3MB" is better than pretending size doesn't matter.
- **Conditional advice** — "If X changes, switch to Y" helps the user understand the decision tree.
- **Don't rush** — If the user wants to discuss, engage. Answer questions before proceeding.

---

### Step 5: Confirm Plan

After the user selects an approach, generate a final confirmation summary:

```
═══════════════════════════════════════════════
         FINAL BUILD PLAN
═══════════════════════════════════════════════

[App]           MyApp v1.0.0
[Framework]     Electron 43 + React + Express + SQLite
[Platform]      Windows + macOS
[Architecture]  Windows: x64 | macOS: Universal (x64+ARM64)
[Installer]     NSIS (.exe) for Win x64 + DMG for macOS Universal
[Logo]          icon.png (256x256, PNG with alpha, rounded corners applied)
[Output]        ./release/ (all installers in this folder)
[Protection]    ASAR + JavaScript obfuscation
[Test Data]     ✅ Cleared
[API Keys]      ✅ Cleared
[Signing]       Windows EV cert + macOS Developer ID + notarization
[Auto-update]   electron-updater via GitHub Releases

═══════════════════════════════════════════════
Reply 'yes' to start building, or tell me what to change.
═══════════════════════════════════════════════
```

Only proceed to execution after the user explicitly confirms.

---

**Dynamic Adaptation Rules:**
- Do NOT lock into rigid rules. If the user has special requirements (e.g., "I need to support both Windows XP and the latest macOS"), provide a viable approach rather than saying "not supported"
- If the standard sub-skill approach does not fit, provide a custom solution based on general engineering knowledge
- Every recommendation MUST explain **why** this approach is recommended and **under what circumstances** to switch to an alternative
- When the user asks about **deployment or hosting** (e.g., "How do I deploy this Docker image?", "Which platform should I host on?"), provide guidance on WHERE and HOW to deploy, but do NOT execute the deployment — that is outside this skill's scope. This skill handles building and packaging only.
- If the user skips a question (says "skip" or "default"), use the ⭐ recommended option and note it in the confirmation summary

---

### Step 6: Prepare Project

After the user confirms the build plan, the LLM MUST check whether the project is ready for the chosen packaging strategy. Many projects require configuration changes, dependency additions, or file modifications before they can be built successfully.

> **Core rule**: Every modification to the user's project requires explicit approval. Never auto-apply changes.

#### 6a. Detect Gaps

Based on the confirmed build plan and the selected sub-skill, scan for:

| Check | Examples |
|-------|---------|
| **Missing config files** | `electron-builder.yml`, `tauri.conf.json`, `Dockerfile`, `.github/workflows/build.yml` |
| **Missing dependencies** | `electron-builder` not in `devDependencies`, `tauri-cli` not installed |
| **Outdated or incorrect config** | Wrong `main` field in `package.json`, missing `build` scripts |
| **Missing build assets** | App icon not found or wrong format, no `entitlements.plist` for macOS |
| **Signing prerequisites** | No signing certificates configured, missing env vars |
| **Framework-specific requirements** | iOS: no `ExportOptions.plist`; Tauri: Rust toolchain not detected |

#### 6b. Ask User Preferences

Before presenting the modification plan, the LLM MUST ask the following questions:

1. **Output location** — Where should the final build artifacts be placed?
   - Default: `./release/` (or `./dist/` depending on framework)
   - Let the user specify a custom path if needed

2. **Encryption / Protection** — Does the user want to protect the build output?
   - Options may include: ASAR encryption (Electron), code obfuscation, binary stripping, upx compression
   - If the user wants protection, add the relevant tools/config to the modification plan
   - If not needed, skip and proceed

3. **Logo / Icon** — Ask the user to provide the logo file path
   - Also ask: *"Do you want me to intelligently crop and round the corners of your logo for the installer/shortcut icon?"*
   - If no logo is provided, warn that default/placeholder icons will be used

#### 6b. Present Modification Plan

Present ALL required changes to the user in a structured checklist **before making any changes**:

```
📋 Pre-Build Preparation — [Framework] [Platform]

Before proceeding, please confirm:

  Output location:  ./release/ (default) or specify a custom path?
  Encryption:       Do you need build output protection? (ASAR, obfuscation, etc.)
  App icon:         Please provide the logo file path
                    → Crop and round corners for installer icon? (yes/no)

The following config changes are also needed:

 [1] Add file: electron-builder.yml
     → Configures NSIS installer, code signing, auto-update
 [2] Add dependency: electron-builder (devDependency)
     → Required build tool for packaging
 [3] Modify: package.json → add "build" script
     → "build": "electron-builder --win --mac"

 Reply with your preferences above and numbers to approve config changes,
 or tell me which to skip.
```

#### 6c. Apply Approved Changes

- Only apply changes the user explicitly approved
- For each applied change, show a brief confirmation
- If the user skips a critical change, warn about potential build failure but respect the decision
- After all changes are applied, re-confirm readiness before proceeding to Execute

#### 6d. What This Step Does NOT Do

- Does NOT modify business logic or application source code
- Does NOT change framework version or architecture decisions (those were finalized in Step 5)
- Does NOT install system-level tools (e.g., Xcode, Android SDK) — those are user's responsibility
- Does NOT create signing certificates or provisioning profiles

> **Why this step exists**: Skipping project preparation is the #1 cause of build failures. A missing config file or wrong dependency version can waste hours of debugging. This step catches those issues early and fixes them with user approval.

---

When the user's project does NOT match any existing sub-skill (e.g., a niche framework, emerging technology, or proprietary platform):

1. **Search for official documentation** — Find the framework/platform's official build guide
2. **Search for community solutions** — Look for GitHub repos, blog posts, or Stack Overflow answers from experienced developers
3. **Adapt a similar sub-skill** — Find the closest matching sub-skill and adapt its patterns
4. **Time-box the research** — Spend no more than 2-3 minutes on research. If no clear guide is found, tell the user honestly and suggest they consult the platform's official documentation
5. **Document the approach** — Present the found approach to the user for confirmation before proceeding

**Priority for research sources:**
1. Official documentation (docs.xxx.com)
2. Official GitHub repository (README, wiki, examples)
3. Well-known tech blogs (with verifiable code examples)
4. Stack Overflow answers with high vote counts
5. **Never** use unverified random blog posts or outdated tutorials

---

# Phase 1: Project Scan

Execute the following scan commands before any decision-making:

```bash
# ── Project structure detection ──
find . -maxdepth 2 -name "package.json" -o -name "Cargo.toml" -o -name "pubspec.yaml" \
  -o -name "*.csproj" -o -name "go.mod" -o -name "CMakeLists.txt" \
  -o -name "build.gradle" -o -name "pom.xml" -o -name "pyproject.toml" \
  -o -name "requirements.txt" -o -name "Gemfile" -o -name "setup.py" 2>/dev/null

# ── Backend presence ──
ls server/ src/server/ backend/ api/ api-rs/ src-tauri/ app/ cmd/ internal/ 2>/dev/null

# ── Language detection ──
ls *.py *.go *.rs *.java *.cs *.dart *.swift *.c *.cpp *.h *.hpp *.kt *.ets 2>/dev/null

# ── Node.js dependency analysis ──
if [ -f package.json ]; then
  echo "=== Frontend ==="
  cat package.json | grep -oE '"(react|vue|svelte|angular|tailwindcss|vite|webpack|esbuild)[^"]*"' 2>/dev/null
  echo "=== Native Modules ==="
  cat package.json | grep -oE '"(better-sqlite3|sharp|bcrypt|canvas|node-gyp|serialport|usb)[^"]*"' 2>/dev/null
  echo "=== Database ==="
  cat package.json | grep -oE '"(sqlite|mysql|postgres|mongo|prisma|drizzle|redis|better-sqlite3)[^"]*"' 2>/dev/null
  echo "=== Cloud Services ==="
  cat package.json | grep -oE '"(openai|anthropic|google.*ai|deepseek|azure|aws|firebase)[^"]*"' 2>/dev/null
  echo "=== Realtime ==="
  cat package.json | grep -oE '"(socket\.io|ws:|websocket|mqtt|nats|sse)[^"]*"' 2>/dev/null
  echo "=== Mobile ==="
  cat package.json | grep -oE '"(react-native|expo|@capacitor|ionic|nativescript)[^"]*"' 2>/dev/null
  echo "=== Scripts ==="
  cat package.json | grep -oE '"(dev|build|start|electron|tauri|package|release|deploy)[^"]*"' 2>/dev/null
fi

# ── Game engine detection ──
find . -maxdepth 2 -name "*.uproject" -o -name "ProjectSettings" -o -name "*.godot" 2>/dev/null

# ── C/C++ detection ──
find . -maxdepth 2 -name "CMakeLists.txt" -o -name "*.sln" -o -name "*.vcxproj" 2>/dev/null

# ── Embedded detection ──
ls platformio.ini sdkconfig prj.conf 2>/dev/null
find . -maxdepth 3 -name "*.ino" -o -name "sdkconfig" 2>/dev/null

# ── Plugin detection ──
ls manifest.json content.js background.js popup.html 2>/dev/null

# ── HarmonyOS detection ──
ls oh-package.json5 module.json5 2>/dev/null

# ── Environment variables ──
ls .env .env.* .env.example 2>/dev/null

# ── Code volume estimate ──
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.py" -o -name "*.go" \
  -o -name "*.rs" -o -name "*.java" -o -name "*.kt" -o -name "*.swift" -o -name "*.dart" \
  -o -name "*.cpp" -o -name "*.c" -o -name "*.cs" -o -name "*.ets" 2>/dev/null \
  | grep -v node_modules | grep -v .git | wc -l
```

---

# Phase 2: Platform Classification

After scanning, classify the project into one or more categories:

| Category | Detection Signals | Sub-skill |
|----------|-------------------|-----------|
| **Desktop App** | Electron/Tauri/Qt/Flutter desktop | `desktop/*.md` |
| **Mobile App** | React Native/Flutter/Kotlin/Swift/HarmonyOS | `mobile/*.md` |
| **Web App** | React/Vue/Angular/Next.js/Nuxt | `web/*.md` |
| **Backend Service** | Express/Django/FastAPI/Gin/Spring/Axum/Laravel | `backend/*.md` |
| **AI/ML App** | PyTorch/TensorFlow/Transformers/Ollama | `ai/*.md` |
| **CLI Tool** | Command-line tool, script | `cli/python-cli.md` |
| **SDK/Library** | npm package, PyPI, crates.io, Maven, NuGet, Go module | `cli/sdk-library.md` |
| **Browser Plugin** | manifest.json + content.js | `plugins/browser-extension.md` |
| **IDE Plugin** | VS Code/JetBrains/WebStorm extension | `plugins/*.md` |
| **Embedded** | ESP32/STM32/RTOS/Linux embedded | `embedded/*.md` |
| **Car Software** | HarmonyOS Car/QNX/Android Automotive | `embedded/car-infotainment.md` |
| **Robotics** | ROS/ROS2/SLAM/navigation | `embedded/ros.md` |
| **Security Tool** | Pentest/vulnerability scanner/SIEM | `security/*.md` |
| **Docker/Container** | Dockerfile, docker-compose | `cloud/docker.md` |
| **Kubernetes** | K8s manifests, Helm charts | `cloud/kubernetes.md` |
| **CI/CD Pipeline** | GitHub Actions, GitLab CI, Jenkins | `cloud/ci-cd-pipelines.md` |
| **Payment System** | Stripe/Alipay/WeChat Pay/IAP | `cloud/payment-integration.md` |
| **Monorepo** | Multiple packages in one repo | `web/monorepo.md` |
| **WebAssembly** | Rust/Go/C compiled to WASM | `web/wasm.md` |
| **PWA** | Service Worker + Web Manifest | `web/pwa.md` |
| **Serverless/Edge** | Lambda/CF Workers/Vercel Functions | `web/serverless-edge.md` |
| **VR/AR** | Meta Quest/Vision Pro/SteamVR | `desktop/vr-ar.md` |
| **Wearable** | watchOS/Wear OS/Galaxy Watch | `mobile/wearables.md` |
| **Smart Platform** | Android TV/tvOS/webOS/Tizen/CarPlay | `desktop/smart-platforms.md` |
| **Cross-Platform** | .NET MAUI / Kotlin Multiplatform | `cross-platform/multiplatform.md` |

If the project spans multiple categories (e.g., desktop + mobile + backend), dispatch to each corresponding sub-skill separately.

---

# Phase 3: Complexity Assessment

## L1 — Simple Tool (1–2 hours)
- Pure frontend or simple full-stack
- No native modules
- < 50 source files
- No database or localStorage only
- **Typical**: Calculator, Markdown editor, Pomodoro timer, simple notes, bookmark tool
- **Strategy**: Standard template, no customization needed

## L2 — Standard Application (4–8 hours)
- Full-stack (frontend + backend + database)
- Native modules or external APIs present
- 50–500 source files
- Complex state management
- **Typical**: AI chatbot, project manager, data dashboard, local ERP, API debugger, IoT panel, IM client, SaaS desktop, DB manager
- **Strategy**: Path adaptation, image embedding, source encryption

## L3 — Complex Application (1–5 days)
- Multi-module architecture (plugin system, extension system)
- Realtime communication (WebSocket, MQTT, WebRTC)
- Multiple databases
- GPU acceleration or audio/video processing
- 500+ source files
- **Typical**: IDE, video editor, design tool, full ERP, quantitative trading platform, indie game, HarmonyOS app, car infotainment
- **Strategy**: Deep architecture adaptation, process isolation, performance optimization

---

# Phase 4: Competitive Benchmarking

Present similar products and their packaging approaches to help the user decide.

| Scenario | Recommended Stack | Package Method | Reference Products | Typical Size |
|----------|------------------|---------------|-------------------|-------------|
| AI Chatbot | React + Express + SQLite | Electron | Claude Desktop, ChatGPT Desktop | 130-180MB |
| Cloud Monitor | Vue/React + Go/Rust | Electron/Tauri | AWS Console, Portainer | 100-150MB |
| ERP/OA | Vue/React + Java/Go/Node | Electron | Kingdee, Yonyou | 150-200MB |
| Quantitative Trading | React + Python/C++ | Electron | JoinQuant, QMT | 100-200MB |
| IoT Panel | Vue + Go/MQTT | Tauri/Electron | Tuya Smart, Home Assistant | 50-100MB |
| IM Client | React + Go/Rust | Electron/Tauri | Feishu, Telegram Desktop | 100-200MB |
| SaaS Desktop | React/Vue + Backend API | Electron/Tauri | Notion, Linear | 100-150MB |
| Database Tool | React + Go/Rust | Electron/Tauri | Navicat, DBeaver | 100-200MB |
| Note App | React + SQLite | Electron/Tauri | Obsidian, Logseq | 100-150MB |
| Indie Game | Unity/Godot | Engine Built-in | Stardew Valley, Hollow Knight | 200-500MB |

---

# Phase 5: Recommendation & Confirmation

> **Note**: Platform decision (Q5), info collection (Q6-Q14), and all user-facing questions are now handled in **Step 2: Unified User Intake** above. This phase focuses ONLY on presenting recommendations after the intake is complete.

Based on the user's answers in Step 2, present:

1. **Primary recommendation** — the best approach with clear reasoning
2. **2-3 alternatives** — with trade-offs explained
3. **Size estimate** — expected package size for the chosen approach
4. **Reference products** — similar apps that use the same approach

| Scenario | Recommended Stack | Package Method | Reference Products | Typical Size |
|----------|------------------|---------------|-------------------|-------------|
| AI Chatbot | React + Express + SQLite | Electron | Claude Desktop, ChatGPT Desktop | 130-180MB |
| Cloud Monitor | Vue/React + Go/Rust | Electron/Tauri | AWS Console, Portainer | 100-150MB |
| ERP/OA | Vue/React + Java/Go/Node | Electron | Kingdee, Yonyou | 150-200MB |
| Quantitative Trading | React + Python/C++ | Electron | JoinQuant, QMT | 100-200MB |
| IoT Panel | Vue + Go/MQTT | Tauri/Electron | Tuya Smart, Home Assistant | 50-100MB |
| IM Client | React + Go/Rust | Electron/Tauri | Feishu, Telegram Desktop | 100-200MB |
| SaaS Desktop | React/Vue + Backend API | Electron/Tauri | Notion, Linear | 100-150MB |
| Database Tool | React + Go/Rust | Electron/Tauri | Navicat, DBeaver | 100-200MB |
| Note App | React + SQLite | Electron/Tauri | Obsidian, Logseq | 100-150MB |
| Indie Game | Unity/Godot | Engine Built-in | Stardew Valley, Hollow Knight | 200-500MB |

Present the confirmation summary (from Step 2 Part D) and wait for user approval before proceeding.

---

# Phase 6: Dispatch to Sub-skill

| User Choice | Sub-skill to Dispatch |
|------------|----------------------|
| Electron | `desktop/electron.md` |
| Tauri 2.0 | `desktop/tauri.md` |
| Game (Unity/Godot/Unreal) | `desktop/game-dev.md` |
| VR/AR (Meta Quest/Vision Pro) | `desktop/vr-ar.md` |
| Smart TV/Car/RPi | `desktop/smart-platforms.md` |
| Qt / Flutter / .NET | `desktop/native-app.md` |
| Pake / Neutralinojs | `desktop/web-to-desktop.md` |
| Android | `mobile/android.md` |
| iOS/iPadOS | `mobile/ios.md` |
| HarmonyOS | `mobile/harmonyos.md` |
| Flutter Mobile | `mobile/flutter-mobile.md` |
| React Native | `mobile/react-native.md` |
| Capacitor | `mobile/capacitor.md` |
| Wearable (watchOS/Wear OS) | `mobile/wearables.md` |
| SPA (React/Vue) | `web/spa.md` |
| SSR (Next.js/Nuxt) | `web/ssr.md` |
| PWA | `web/pwa.md` |
| Serverless / Edge | `web/serverless-edge.md` |
| Monorepo (Turborepo/Nx) | `web/monorepo.md` |
| WebAssembly (WASM) | `web/wasm.md` |
| Node.js Backend | `backend/node-server.md` |
| Python Backend | `backend/python-server.md` |
| Go Backend | `backend/go-server.md` |
| Rust Backend (Axum/Actix) | `backend/rust-backend.md` |
| Java/Spring Boot | `backend/java-spring.md` |
| PHP/Laravel | `backend/php-laravel.md` |
| Python ML | `ai/python-ml.md` |
| Local LLM | `ai/local-llm.md` |
| Python CLI | `cli/python-cli.md` |
| SDK / Library (npm/PyPI/crates.io/Maven/NuGet) | `cli/sdk-library.md` |
| Browser Extension | `plugins/browser-extension.md` |
| VS Code Extension | `plugins/vscode-extension.md` |
| JetBrains Plugin | `plugins/jetbrains-plugin.md` |
| ESP32 | `embedded/esp32.md` |
| STM32 | `embedded/stm32.md` |
| ROS/ROS2 | `embedded/ros.md` |
| Car Infotainment | `embedded/car-infotainment.md` |
| Security Tools | `security/security-tools.md` |
| Docker | `cloud/docker.md` |
| Kubernetes / Helm | `cloud/kubernetes.md` |
| CI/CD Pipeline | `cloud/ci-cd-pipelines.md` |
| Payment Integration | `cloud/payment-integration.md` |
| .NET MAUI | `cross-platform/multiplatform.md` |
| Kotlin Multiplatform | `cross-platform/multiplatform.md` |
| Compose Multiplatform | `cross-platform/multiplatform.md` |

## Deviation Threshold

The AI may deviate from the sub-skill document by **≤15%** during execution. Deviations exceeding 15% must be explained to the user and require explicit approval.

---

# Phase 7: Mandatory Audit

After packaging is complete, the AI **MUST** load and execute `audit.md`. The audit cannot be skipped under any circumstances.

---

# Phase 8: Final Output

```
═══════════════════════════════════════════════
              BUILD REPORT
═══════════════════════════════════════════════

[TECH STACK]
  Framework: [Electron / Tauri / ...]
  Frontend:  [React + Vite / ...]
  Backend:   [Express + SQLite / ...]
  Build:     [esbuild / cargo / ...]

[PACKAGE INFO]
  Filename: [AppName-Setup-1.0.0.exe]
  Size:     [XXX MB]
  Platform: [Windows x64 / ...]

[FILE ARCHITECTURE]
  [key directory structure]

[SECURITY]
  Encryption: [AES-256-CBC + obfuscation + image embedding]
  Decryption: [server-side automatic]

[AUDIT RESULTS]
  ✅ Package valid and installable
  ✅ App launches without errors
  ✅ Data persistence works
  ✅ No credential leaks
  ✅ No residual build artifacts
  ✅ All user requirements met

[PACKAGE LOCATION]
  [absolute path]
═══════════════════════════════════════════════
```

---
---

# Appendix: Best Practices & Common Mistakes

## Common Mistakes (from Industry Survey)

1. **Not code-signing binaries** — macOS Gatekeeper and Windows SmartScreen will block unsigned apps. Always sign with a valid certificate.
2. **Hardcoding paths** — Use platform APIs (`app.getPath()`, `XDG_*` env vars) instead of absolute paths.
3. **Bundling node_modules wholesale** — Use ASAR, tree-shaking, and exclude dev dependencies.
4. **Ignoring platform-specific behavior** — Line endings, path separators, case sensitivity, default shell differences.
5. **Not testing the packaged build** — Always test on a clean VM without dev tools installed.
6. **Missing/broken auto-update** — Implement from day one using `electron-updater` or equivalent.
7. **ASAR integrity issue** — Native modules (better-sqlite3, sharp) must be in `asarUnpack`.
8. **Not handling first-run** — Create default config/data directories, handle missing files gracefully.
9. **Over-bundling** — Include only target-platform binaries, not all platforms.
10. **Insufficient production logging** — Use crash reporter (Sentry, electron-log) for debugging.

## Best Practices (2025-2026)

| Practice | Description |
|----------|-------------|
| **Code signing** | macOS: Developer ID + notarization. Windows: EV/OV certificate. Linux: GPG signing. |
| **ASAR bundling** | Protect source code, simplify file layout. Configure `asarUnpack` for native modules. |
| **Auto-update from day one** | `electron-updater` (electron-builder) or `autoUpdater` (electron-forge). Use GitHub Releases or custom server. |
| **Test on clean machines** | Fresh VM without dev tools catches missing runtime dependencies. |
| **Separate main/renderer processes** | Heavy computation in main or utility process. Keep renderer free for UI. |
| **Minimize bundle size** | Tree-shaking, exclude dev deps, compress assets, minimize native modules. |
| **Handle permissions/sandboxing** | macOS: entitlements. Windows: UAC. Linux: Flatpak portals. |
| **Provide uninstallers** | NSIS: configure `deleteAppDataOnUninstall`. MSIX: auto-uninstall. AppImage: document removal. |
| **Use CI/CD** | GitHub Actions/Azure Pipelines. Build on each platform natively. |
| **Version lock packaging tools** | Pin electron-builder/forge/tauri-cli versions to avoid surprise breakage. |
| **Include crash reporter** | `@sentry/electron` or `electron-log` for production error tracking. |

## Framework Version Reference (2025-2026)

| Framework | Version | Key Features |
|-----------|---------|-------------|
| Electron | 43.x | Chromium 150, Node.js 24, clipboard removed from renderer (v44), 32-bit dropped (v44) |
| electron-builder | 26.x | YAML/JSON config, NSIS/MSI/AppImage/DMG (compatible with Electron 43) |
| electron-forge | 7.x | Official Electron team recommendation, plugin architecture |
| electron-updater | 6.x | Auto-update with differential downloads |
| Tauri | 2.11.x | Mobile (iOS/Android) stable, Rust backend, 2-6MB bundles |
| Node.js | 26.x LTS / 22.x LTS | require(esm) default (v23+), Temporal API (v26), Undici 8 |
| Vite | 8.x | Latest build tool (verify plugin compatibility for v7/v8 migrations) |
| Next.js | 16.x | App Router, RSC, standalone output |
| React Native | 0.86.x | New Architecture default, Hermes engine |
| Flutter | 3.44.x / Dart 3.12 | Impeller renderer default, desktop GA, WebAssembly support |
| Go | 1.26.x | Latest stable (check stdlib breaking changes) |
| Spring Boot | 3.5.x | GraalVM native image improvements |
| Capacitor | 8.x | Web → mobile bridge (verify config format changes from v6) |
| Wails | 2.10.x | Go backend, v3 beta available |
| Neutralinojs | 5.6.x | 1-3MB binaries, minimal footprint |
| Dioxus | 0.6.x | React-like Rust UI, pre-1.0 |
| Pake/PakePlus | 2.7.x | Rust+Tauri wrapper, 3-10MB |

## electron-builder vs electron-forge

| Aspect | electron-builder (26.x) | electron-forge (7.x) |
|--------|------------------------|---------------------|
| Config | YAML/JSON/JS | forge.config.js (JS/TS) |
| Output | NSIS, MSI, AppImage, DMG, DEB, RPM, Snap, Flatpak | DMG, ZIP, Squirrel, DEB, RPM, Snap, Flatpak, MSI, AppX, MSIX |
| Plugin system | Limited (custom afterPack) | Rich plugin architecture |
| Community | Very mature, widely used | Official Electron team recommendation |
| Code signing | Good, manual macOS notarization tweaks | Tight integration with osxSign/osxNotarize |
| Auto-update | electron-updater (built-in) | @electron/update-electron-app |
| **When to prefer** | Complex packaging rules, existing projects | New projects, first-party support |

