# Tauri 2.x Build Sub-Skill

Rust backend + system WebView. Minimal footprint (2–6MB). Suitable for L1–L3 complexity projects.

**Current version**: Tauri 2.11.x / Tauri CLI 2.11.x (2025-2026)

> ⚠️ **Breaking changes since Tauri 2.2**: v2.10 renamed signer env vars (`TAURI_PRIVATE_KEY` → `TAURI_SIGNING_PRIVATE_KEY`). v2.8 raised iOS deployment target to 14.0. v2.5 removed `WebviewAttributes` re-export. v2.3 deprecated `Manager::unmanage`. Auto-updater plugin v2.5 removed `UpdaterBuilder::new` (use `UpdaterExt::updater_builder`). See [tauri.app/start/migrate/from-tauri-2-0](https://v2.tauri.app/start/migrate/from-tauri-2-0/).

## When to Use

- Frontend uses React/Vue/Svelte/Solid/Vanilla JS
- Backend can be rewritten in Rust
- Minimal package size required (2–6MB vs Electron's 80–120MB)
- Mobile support needed (iOS/Android — stable since Tauri 2.0)
- Strong sandboxing required (default permission model)

## Key Features

- **Mobile support** (iOS/Android) — stable and production-ready since Tauri 2.0
- **Capabilities/Permissions system** — fine-grained, JSON-based permission model (CRITICAL for security)
- **Plugin ecosystem**: tauri-plugin-shell, tauri-plugin-fs, tauri-plugin-http, tauri-plugin-notification, tauri-plugin-store, tauri-plugin-sql, tauri-plugin-log
- **Type-safe IPC** — auto-generated TypeScript bindings from Rust (`invoke` API)
- **Built-in auto-updater** — differential updates, GitHub/custom server support
- **NSIS installer** on Windows, AppImage/DEB/RPM on Linux, DMG on macOS

## Comparison with Electron

| Feature | Electron 43.x | Tauri 2.11.x |
|---------|--------------|-------------|
| Size | 80–120MB | 2–6MB |
| Backend | Node.js | Rust |
| Browser engine | Bundled Chromium | System WebView |
| Native modules | Full support | Rust crates |
| Learning curve | Low | Medium-High (Rust) |
| Mobile | No | Yes (iOS/Android) |
| Security | Manual config | Sandboxed by default (capabilities) |
| WebView2 (Windows) | Bundled | Required (pre-installed Win10 21H2+, Win11) |

## Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv11.2 -sSf https://sh.rustup.rs | sh

# Tauri CLI
cargo install tauri-cli

# Platform dependencies
# Windows: WebView2 (pre-installed on Win10 21H2+), Visual Studio Build Tools
# macOS: Xcode Command Line Tools
# Linux: libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev

# Node.js 20+ (for frontend)
```

## Project Creation

```bash
# Recommended: create with frontend framework
npm create tauri-app@latest my-app -- --template react-ts
# Templates available: react-ts, vue-ts, svelte-ts, solid-ts, vanilla-ts

cd my-app
npm install
```

## Core Configuration (tauri.conf.json)

```json
{
  "productName": "MyApp",
  "version": "1.0.0",
  "identifier": "com.example.myapp",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "MyApp",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.ico",
      "icons/icon.icns"
    ],
    "windows": {
      "nsis": {
        "installMode": "both"
      }
    },
    "macOS": {
      "minimumSystemVersion": "10.15"
    },
    "linux": {
      "deb": {
        "depends": ["libwebkit2gtk-4.1-0"]
      }
    }
  },
  "plugins": {
    "shell": {
      "open": true
    }
  }
}
```

## Capabilities & Permissions (CRITICAL — Tauri 2.x Security Model)

Tauri 2.x uses a **capabilities/permissions** system. Without proper configuration, your app cannot access ANY native functionality.

```text
src-tauri/
├── capabilities/
│   └── default.json    ← Permission declarations
├── tauri.conf.json
├── Cargo.toml
├── build.rs            ← REQUIRED: `fn main() { tauri_build::build() }`
└── src/
    ├── main.rs         ← Desktop entry point
    └── lib.rs          ← Shared logic (mobile + desktop)
```

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "fs:allow-read",
    "fs:allow-write",
    "fs:allow-exists",
    "dialog:allow-open",
    "dialog:allow-save",
    "notification:default",
    "store:default",
    "http:default",
    "clipboard-manager:allow-read-text",
    "clipboard-manager:allow-write-text"
  ]
}
```

**Common Mistake**: Forgetting to declare permissions. The app builds and runs in dev but crashes in production with "permission denied" errors.

**Common Mistake**: Using `"core:default"` without understanding what it includes. Check `src-tauri/gen/schemas/` for the full permission list.

## Rust Backend Example (Correct Data Path)

**Required: `src-tauri/build.rs`** — Tauri will NOT compile without this file:

```rust
// src-tauri/build.rs
fn main() {
    tauri_build::build()
}
```

**Required: `[build-dependencies]` in `Cargo.toml`:**

```toml
[build-dependencies]
tauri-build = { version = "2", features = [] }
```

```rust
use rusqlite::Connection;
use tauri::Manager;
use std::sync::Mutex;

struct AppState {
    db: Mutex<Connection>,
}

#[tauri::command]
fn get_messages(state: tauri::State<AppState>) -> Result<Vec<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // Query database...
    Ok(vec![])
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // CORRECT: Use app_data_dir for persistent data (NOT relative path)
            let app_data = app.path().app_data_dir()
                .expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_data).ok();
            let db_path = app_data.join("data.db");
            let conn = Connection::open(&db_path)
                .expect("Failed to open database");

            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_messages])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Frontend call:**
```typescript
import { invoke } from '@tauri-apps/api/core';
const messages = await invoke<string[]>('get_messages');
```

## Build Commands

```bash
# Desktop
cargo tauri build                                    # Default platform
cargo tauri build --target x86_64-pc-windows-msvc    # Windows x64
cargo tauri build --target aarch64-pc-windows-msvc   # Windows ARM64
cargo tauri build --target aarch64-apple-darwin       # macOS ARM64 (Apple Silicon)
cargo tauri build --target x86_64-apple-darwin        # macOS x64 (Intel)
cargo tauri build --target universal-apple-darwin     # macOS Universal Binary
cargo tauri build --target x86_64-unknown-linux-gnu   # Linux x64
cargo tauri build --target aarch64-unknown-linux-gnu  # Linux ARM64

# Mobile
cargo tauri android init    # Initialize Android project (first time)
cargo tauri android build   # Build Android APK/AAB
cargo tauri ios init        # Initialize iOS project (first time, macOS only)
cargo tauri ios build       # Build iOS IPA (macOS only)
```

## Mobile Build (iOS/Android)

### Android

```bash
# Prerequisites: Android Studio, JDK 17, Android SDK 34+
cargo tauri android init
cargo tauri android build --target aarch64    # ARM64
cargo tauri android build --target arm        # ARMv7
cargo tauri android build --target x86_64     # x86_64 (emulator)

# Output: src-tauri/gen/android/app/build/outputs/
```

### iOS

```bash
# Prerequisites: macOS + Xcode 15+ + Apple Developer account
cargo tauri ios init
cargo tauri ios build

# Output: src-tauri/gen/apple/build/
# Open in Xcode for signing and distribution
```

### Google Play Distribution

```bash
# Build AAB (Android App Bundle — required by Play Store)
cargo tauri android build --aab
# Output: gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab

# Build APK (for direct distribution/testing)
cargo tauri android build --apk

# Per-architecture APKs (smaller, for testing outside Play Store)
cargo tauri android build --apk --split-per-abi
```

### iOS App Store Distribution

```bash
# Build and open Xcode for archiving
cargo tauri ios build --open

# In Xcode: Product → Archive → Distribute → App Store Connect
```

### Physical iOS Device Development

```bash
# Physical device requires dev server on local network
# 1. Connect device via Xcode → Window → Devices and Simulators
# 2. Run with forced IP prompt
cargo tauri ios dev --force-ip-prompt

# 3. Configure Vite to use TAURI_DEV_HOST:
# vite.config.js:
# const host = process.env.TAURI_DEV_HOST;
# server: { host: host || false, port: 1420 }
```

### Android Environment Variables (Required)

```bash
# JAVA_HOME — Android Studio's bundled JBR
# Linux: /opt/android-studio/jbr
# macOS: /Applications/Android Studio.app/Contents/jbr/Contents/Home
# Windows: C:\Program Files\Android\Android Studio\jbr

# ANDROID_HOME
# Linux/macOS: $HOME/Android/Sdk
# Windows: %LocalAppData%\Android\Sdk

# Rust targets for Android
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# Rust targets for iOS
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
```

## Auto-Update

```json
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIH...",
      "endpoints": [
        "https://releases.myapp.com/{{target}}/{{arch}}/{{current_version}}"
      ]
    }
  }
}
```

```rust
// src-tauri/src/lib.rs
// ⚠️ Tauri 2.5+: UpdaterBuilder::new removed, use UpdaterExt::updater_builder
use tauri_plugin_updater::UpdaterExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let update = handle.updater().check().await;
                // Handle update notification
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error");
}
```

## Code Signing

### Windows

```bash
# Sign the .msi or .exe after build
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com /td sha256 src-tauri/target/release/bundle/msi/*.msi
```

### Auto-Update Signing (Tauri 2.10+)

```bash
# ⚠️ Environment variables RENAMED in Tauri 2.10:
# OLD: TAURI_PRIVATE_KEY, TAURI_PRIVATE_KEY_PATH, TAURI_PRIVATE_KEY_PASSWORD
# NEW: TAURI_SIGNING_PRIVATE_KEY, TAURI_SIGNING_PRIVATE_KEY_PATH, TAURI_SIGNING_PRIVATE_KEY_PASSWORD
export TAURI_SIGNING_PRIVATE_KEY="dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIH..."
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""
```

### macOS

```json
// tauri.conf.json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": "entitlements.plist"
    }
  }
}
```

```bash
# Notarize after build
xcrun notarytool submit src-tauri/target/release/bundle/dmg/*.dmg \
  --apple-id your@email.com \
  --password app-specific-password \
  --team-id TEAM_ID \
  --wait
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Windows missing WebView2 | Pre-installed on Win10 21H2+. For older: download from developer.microsoft.com |
| Linux compile failure | `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev` |
| macOS notarization | Requires Apple Developer ID ($99/year) + notarytool |
| Slow Rust compilation | First build 5–15 min; use `cargo tauri build --debug` for faster dev builds |
| SPA route 404 on reload | Configure `app.security.csp` in tauri.conf.json; use hash-based routing |
| Permission denied in production | Declare capabilities in `src-tauri/capabilities/default.json` |
| Database path wrong | Use `app.path().app_data_dir()` not relative paths |
| Mobile build fails | Run `cargo tauri android/ios init` first; check SDK/NDK paths |
| Auto-update not working | Ensure `pubkey` matches signing key; check endpoint URL format; env vars renamed in v2.10 (see above) |
| `invoke` returns undefined | Check Rust command name matches `tauri::generate_handler![]` |
| WebView2 crash on old Windows | Set `"windows": {"webviewInstallMode": {"type": "embedBootstrapper"}}` in tauri.conf.json |
| Signer env vars not working | Tauri 2.10+ renamed: `TAURI_SIGNING_PRIVATE_KEY` (was `TAURI_PRIVATE_KEY`) |
| `WebviewAttributes` import fails | Removed from `tauri` crate in v2.5; import from `tauri::webview::WebviewAttributes` instead |
