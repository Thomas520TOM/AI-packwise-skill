# Electron Build Sub-Skill

Package Web frontend + Node.js backend as a desktop application. Suitable for L1–L3 complexity projects.

**Current version**: Electron 43.x / electron-builder 26.x / electron-forge 7.x / electron-updater 6.x (2025-2026)

> **Breaking changes since Electron 35** (docs were written for 35.x):
> - **Node.js 22 -> 24** (Electron 40+): Native module ABI changed. `bytenode` bytecode must be recompiled. CI must use `node-version: '24'`.
> - **`electron` npm package** (Electron 42+): No longer downloads binary via `postinstall`; downloads lazily on first run. `ELECTRON_SKIP_BINARY_DOWNLOAD` removed.
> - **macOS notifications** (Electron 42+): Use `UNNotification` API, **require code signing** to display.
> - **Clipboard in renderer** (Electron 40 deprecated, v44 removed): Must use `contextBridge` preload, NOT direct renderer access.
> - **32-bit platforms** (Electron 44 removes): `win32-ia32` and `linux-armv7l` no longer published.
> - **Linux Wayland default** (Electron 38+): Runs as native Wayland app. Force X11 with `--ozone-platform=x11` if needed.
> - **ASAR Integrity stable** (Electron 39+): Runtime validation of `app.asar` tampering. Recommended for production.
> - See full list at [electron.org/docs/latest/breaking-changes](https://www.electronjs.org/docs/latest/breaking-changes).

## When to Use

- Full Node.js runtime required (Express, native modules, SQLite)
- Existing Web frontend (React/Vue/Svelte/Vanilla)
- File system read/write, database, local storage needed
- Cross-platform support required (Windows/macOS/Linux)

## Comparison with Alternatives

| Feature | Electron 43 | Tauri 2.11 | Neutralinojs |
|---------|------------|-----------|-------------|
| Size | 130–180MB | 3–10MB | ~2MB |
| Backend | Node.js (full) | Rust | C++ WebSocket |
| Native modules | Excellent | Rust crates | Limited |
| Ecosystem | Most mature | Rapidly growing | Smaller |
| Learning curve | Low | High (Rust) | Low |
| Best for | Complex full-stack | Lightweight tools | Minimal wrappers |

---

## 1. Security Requirements (Non-Negotiable)

```javascript
// electron/main.cjs
const { app, BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('path');

const win = new BrowserWindow({
  webPreferences: {
    // === MANDATORY ===
    nodeIntegration: false,          // NEVER true in production
    contextIsolation: true,          // ALWAYS true
    sandbox: true,                   // Chromium sandbox
    webSecurity: true,               // Same-origin policy
    allowRunningInsecureContent: false,
    // === HARDENING ===
    webviewTag: false,               // Use BrowserView instead
    enableWebSQL: false,             // Deprecated
    safeDialogs: true,               // Prevent dialog spoofing
    preload: path.join(__dirname, 'preload.cjs'),
  },
});
```

### Content Security Policy (CSP)

```javascript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.your-app.com; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none'"
      ],
    },
  });
});
```

### Navigation & Window Guards

```javascript
// Block navigation to external URLs
win.webContents.on('will-navigate', (event, url) => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'file:' && parsed.origin !== 'null') {
    event.preventDefault();
  }
});

// Open external links in system browser, not in app
win.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https:') || url.startsWith('http:')) {
    shell.openExternal(url);
  }
  return { action: 'deny' };
});
```

### Secure IPC (Preload)

```javascript
// preload.cjs — Whitelist specific functions, NEVER expose raw ipcRenderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  getVersion: () => ipcRenderer.invoke('get-version'),
  onProgress: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('progress-update', handler);
    return () => ipcRenderer.removeListener('progress-update', handler);
  },
  // ❌ NEVER do this:
  // ipc: ipcRenderer,
  // send: (channel, ...args) => ipcRenderer.send(channel, ...args),
});
```

### Permission Handler

```javascript
session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
  const allowedPermissions = ['clipboard-read'];
  callback(allowedPermissions.includes(permission));
});
```

### Security Checklist

| Item | Required Setting |
|------|-----------------|
| `nodeIntegration` | `false` |
| `contextIsolation` | `true` |
| `sandbox` | `true` |
| CSP header | Restrict `default-src`, `script-src` |
| IPC channels | Whitelist specific channels via `contextBridge` |
| `webviewTag` | `false` (use `BrowserView` instead) |
| `remote` module | Removed in Electron 14+ (never use `@electron/remote`) |
| Navigation | Validate all `will-navigate` / `new-window` events |
| External links | Open in system browser, not in app window |
| Clipboard (v44+) | Access only via `contextBridge` preload, NOT in renderer directly |
| Permissions | Whitelist only needed permissions via `setPermissionRequestHandler` |

---

## 2. Path Resolution (Critical)

**Problem**: After packaging, `process.cwd()` points to the install directory. `__dirname` is unavailable in ESM. Database/config must write to `userData` (`%APPDATA%`).

**Principle**: Separate writable paths (userData) from read-only paths (asar).

```typescript
// server/paths.ts
import path from 'path';
import fs from 'fs';

function resolveAppRoot(): string {
  if (process.env.APP_USER_DATA) return process.env.APP_USER_DATA;
  const appData = process.env.APPDATA || '';
  if (appData) {
    const p = path.join(appData, '<APP_NAME>', '<APP_NAME>');
    if (fs.existsSync(p)) return p;
  }
  return process.cwd();
}

const appRoot = resolveAppRoot();
const asarRoot = __dirname.includes('app.asar')
  ? path.dirname(__dirname)
  : process.cwd();

export const CONFIG_DIR = path.join(appRoot, '.<app-name>');
export const DB_PATH = path.join(CONFIG_DIR, 'data.db');
export const SAVES_DIR = path.join(CONFIG_DIR, 'saves');
export const DIST_DIR = path.join(asarRoot, 'dist');
export const PUBLIC_DIR = path.join(asarRoot, 'public');

export function ensureDirectories(): void {
  for (const dir of [CONFIG_DIR, SAVES_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
```

### Common Path Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Use `__dirname` to detect Electron | dev mode falls back to cwd, DB in project dir | Use `process.env.APP_USER_DATA` first |
| Use `import.meta.url` in paths.ts | Empty in esbuild CJS output | Use `__dirname` only |
| Use `process.cwd()` as data path | Points to install directory | Never use cwd |
| `process.cwd()` loads HTML | `file://${process.cwd()}/dist/index.html` fails | Use `app.isPackaged` + `process.resourcesPath` |

### Correct Asset Path Resolution

```javascript
// ❌ WRONG: process.cwd() points to install directory in packaged app
win.loadURL(`file://${process.cwd()}/dist/index.html`);

// ✅ CORRECT: Use app.isPackaged + process.resourcesPath
const { app } = require('electron');

function getAssetPath(...segments) {
  const basePath = app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, '..');
  return path.join(basePath, ...segments);
}

win.loadFile(getAssetPath('dist', 'index.html'));
```

---

## 3. Frontend Image Paths

**Problem**: Vite does not process string literals like `/src/assets/images/...`. Images disappear after build.

**Recommended: base64 embedding** (anti-theft + guaranteed availability)

```typescript
// vite.config.ts
export default defineConfig({
  build: { assetsInlineLimit: 1024 * 1024 * 2 },
});

// Component
const imgs = import.meta.glob<{ default: string }>('/src/assets/*.jpg', { eager: true });
const bg = imgs['/src/assets/bg.jpg']?.default || '';

// Requires: src/vite-env.d.ts → /// <reference types="vite/client" />
```

---

## 4. Server Startup

**Problem**: `fork()` extracts server.cjs to a temp directory. Native modules (better-sqlite3) live in `app.asar.unpacked/`, not in the temp dir → module resolution fails. **This is the #1 cause of black screen after packaging.**

**Solution**: `require()` in main process (no fork).

```javascript
// electron/main.cjs
const { app } = require('electron');

function startServer(port, userDataDir) {
  return new Promise((resolve, reject) => {
    process.env.PORT = String(port);
    process.env.NODE_ENV = 'production';
    process.env.APP_USER_DATA = userDataDir;

    const serverPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar', 'dist', 'server.cjs')
      : path.join(__dirname, '..', 'dist', 'server.cjs');

    try {
      const server = require(serverPath);
      // Poll until server is ready
      const http = require('http');
      let attempts = 0;
      const check = () => {
        attempts++;
        const req = http.get(`http://127.0.0.1:${port}`, (res) => {
          res.resume();
          resolve(server);
        });
        req.on('error', () => {
          if (attempts > 30) reject(new Error('Server failed to start'));
          else setTimeout(check, 100);
        });
        req.end();
      };
      setTimeout(check, 200);
    } catch (err) {
      reject(err);
    }
  });
}
```

### Preload Script Path (Must Be Absolute)

```javascript
// ❌ WRONG: relative path breaks in packaged app
const win = new BrowserWindow({
  webPreferences: { preload: 'preload.js' }
});

// ✅ CORRECT: absolute path using __dirname (works in main process CJS)
const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.cjs'),
  }
});
```

---

## 5. electron-builder Configuration

```yaml
appId: com.<author>.<appname>
productName: <App Name>
copyright: "Copyright (c) <YEAR> <AUTHOR>"

directories:
  output: release
  buildResources: build

asar: true
asarUnpack:
  - "node_modules/better-sqlite3/**/*"
  - "node_modules/sharp/**/*"
  - "node_modules/@img/**/*"          # sharp's dependencies
  - "**/*.node"                        # Catch-all for any native addon

files:
  - electron/**/*.cjs
  - dist/**/*
  - package.json
  - "!**/node_modules/*/{CHANGELOG.md,README.md,LICENSE,test,tests,example,examples}"
  - "!**/node_modules/.cache/**"
  - "!**/*.map"
  - "!**/*.tsbuildinfo"

extraResources:
  - from: data-encrypted
    to: data
  - from: public
    to: public

win:
  target: [{ target: nsis, arch: [x64] }]  # ⚠️ ia32 (32-bit) removed in Electron 44
  icon: build/icon.ico
  signingHashAlgorithms: [sha256]
  artifactName: "<App>-Setup-${version}.${ext}"

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  shortcutName: "<App Name>"
  license: build/license.txt

mac:
  target: [{ target: dmg, arch: [x64, arm64] }]
  icon: build/icon.icns
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
afterSign: build/notarize.js

linux:
  target: [AppImage, deb]
  icon: build/icon.png
```

### Windows Packaging Formats

| Format | Description | Best For |
|--------|-------------|---------|
| **NSIS** (.exe) | Custom installer wizard | Most universal |
| **MSI** (.msi) | Windows Installer | Enterprise, Group Policy |
| **MSIX** (.msix) | Modern format, containerized | Windows Store, enterprise, clean install/uninstall |
| **Portable** (.zip) | No install needed | Portable apps |
| **Squirrel** | Auto-update framework | Electron native support |

### Linux Packaging Formats

| Format | Description | Limitations |
|--------|-------------|------------|
| **AppImage** | Single-file, no install | Requires FUSE (issues on newer distros without FUSE2) |
| **.deb** | Debian/Ubuntu | Distribution-specific |
| **.rpm** | Fedora/RHEL | Distribution-specific |
| **Flatpak** | Sandboxed, cross-distro | Better for Flathub distribution |
| **Snap** | Ubuntu/Canonical | Centralized Snap Store |

---

## 6. Source Code Protection (Layered Strategy)

| Layer | Protection Level | Tool | What It Protects |
|-------|-----------------|------|-----------------|
| ASAR packaging | Low | electron-builder `asar: true` | Casual browsing (trivially extractable) |
| ASAR integrity | Medium | Electron 39+ built-in | Detects tampering |
| JavaScript obfuscation | Medium-High | javascript-obfuscator | Understanding server logic |
| V8 bytecode compilation | High | bytenode | Full source code exposure |
| Config encryption | High (for data at rest) | AES-256-CBC | API keys, secrets |
| Native addon (C/C++) | Very High | Move critical code to .node | Algorithm protection |

### Content Encryption (AES-256-CBC)

```javascript
// encrypt-content.cjs
const crypto = require('crypto');
const fs = require('fs');

function encryptFile(inputPath, outputPath, password) {
  const data = fs.readFileSync(inputPath, 'utf-8');
  const key = crypto.scryptSync(password, 'fixed-salt-v1', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  fs.writeFileSync(outputPath, iv.toString('hex') + ':' + encrypted.toString('hex'));
}

function decryptFile(encryptedPath, password) {
  const data = fs.readFileSync(encryptedPath, 'utf-8');
  const [ivHex, encryptedHex] = data.split(':');
  const key = crypto.scryptSync(password, 'fixed-salt-v1', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
}
```

### Server Obfuscation

```javascript
// obfuscate-server.cjs
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let cleaned = code.replace(/\/\/# sourceMappingURL=.+$/gm, '');

  const obfuscated = JavaScriptObfuscator.obfuscate(cleaned, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    // Do NOT enable selfDefending or debugProtection for server code
  }).getObfuscatedCode();

  fs.writeFileSync(filePath, obfuscated, 'utf-8');
}
```

### V8 Bytecode Compilation (Strongest JS Protection)

```javascript
// compile-bytecode.cjs
const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');

// Compile to .jsc (V8 bytecode) — must match Electron's Node.js version
bytenode.compileFile({
  filename: path.resolve('dist/server.cjs'),
  output: path.resolve('dist/server.jsc'),
  compileAsModule: true,
});

// Replace original with tiny loader
fs.writeFileSync('dist/server.cjs', `
const bytenode = require('bytenode');
const path = require('path');
module.exports = bytenode.require(path.join(__dirname, 'server.jsc'));
`);
```

---

## 7. Code Signing

### Windows

| Certificate Type | Cost | SmartScreen Trust | Best For |
|-----------------|------|-------------------|---------|
| EV (Extended Validation) | $200-500/year | Instant trust | Production apps |
| OV (Organization Validation) | $60-200/year | Gradual trust (after many installs) | Small teams |
| Self-signed | Free | Big red warning | Development only |

### macOS (Mandatory for Gatekeeper)

```javascript
// build/notarize.js
const { notarize } = require('@electron/notarize');

exports.default = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appName = context.packager.appInfo.productFilename;
  await notarize({
    appBundleId: 'com.yourcompany.yourapp',
    appPath: `${context.appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
    tool: 'notarytool',
  });
};
```

```xml
<!-- build/entitlements.mac.plist -->
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
</dict>
</plist>
```

### Linux

```bash
# GPG signing for AppImage
export GPG_KEY_NAME="your-key-id"
npx electron-builder --linux AppImage
```

---

## 8. Auto-Update

```javascript
// electron/auto-update.cjs
const { autoUpdater } = require('electron-updater');
const { app, dialog, BrowserWindow } = require('electron');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.autoDownload = false;        // Prompt user first
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdate() {
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Download now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.downloadUpdate();
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.setProgressBar(progress.percent / 100);
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} downloaded. Restart to apply?`,
      buttons: ['Restart', 'Later'],
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall(false, true);
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('Auto-update error:', err);
    // Don't show error dialogs — update failure is not critical
  });

  if (app.isPackaged) {
    setTimeout(() => autoUpdater.checkForUpdates(), 5000);
    setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);
  }
}

module.exports = { setupAutoUpdate };
```

```yaml
# electron-builder.yml
publish:
  provider: github
  owner: your-org
  repo: your-app
```

**Code signing requirements for auto-update:**

| Platform | Requirement | Why |
|----------|------------|-----|
| macOS | **Mandatory** — Developer ID + notarization | autoUpdater throws without valid signature |
| Windows | OV/EV certificate (recommended) | Without: SmartScreen warning |
| Linux | GPG signing (optional) | AppImage updates work with GPG |

---

## 9. Native Module Packaging

```yaml
# electron-builder.yml
asar: true
asarUnpack:
  - "node_modules/better-sqlite3/**/*"
  - "node_modules/sharp/**/*"
  - "node_modules/@img/**/*"
  - "**/*.node"
```

```bash
# ALWAYS rebuild native modules against Electron's Node.js version
npx electron-rebuild -f -w better-sqlite3,sharp
# Or use postinstall hook:
# "postinstall": "electron-rebuild" in package.json
```

```javascript
// Native module path resolution in packaged app
const Database = require(
  app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'better-sqlite3')
    : path.join(__dirname, '..', 'node_modules', 'better-sqlite3')
);
```

---

## 10. Memory Optimization

### Use utilityProcess Instead of Hidden BrowserWindow

```javascript
// ❌ WRONG: Hidden BrowserWindow for background work (~30-60MB per window)
const bgWin = new BrowserWindow({ show: false });

// ✅ CORRECT: Utility process (no renderer, no GPU, minimal memory)
const { utilityProcess } = require('electron');
const worker = utilityProcess.fork(path.join(__dirname, 'workers/processor.cjs'));
```

### Singleton Pattern for Windows

```javascript
let settingsWindow = null;
function openSettings() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }
  settingsWindow = new BrowserWindow({ /* ... */ });
  settingsWindow.loadFile('settings.html');
  settingsWindow.on('closed', () => { settingsWindow = null; });
}
```

### Chromium Memory Flags

```javascript
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');
app.commandLine.appendSwitch('disk-cache-size', String(50 * 1024 * 1024));  // 50MB
app.commandLine.appendSwitch('max-active-webgl-contexts', '2');
app.commandLine.appendSwitch('renderer-process-limit', '4');
```

---

## 11. Cross-Platform CI/CD

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
        include:
          - os: windows-latest
            platform: win
          - os: macos-latest
            platform: mac
          - os: ubuntu-latest
            platform: linux
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run build
      - name: macOS signing
        if: matrix.platform == 'mac'
        uses: apple-actions/import-codesign-certs@v3
        with:
          p12-file-base64: ${{ secrets.MAC_CERTIFICATE_P12 }}
          p12-password: ${{ secrets.MAC_CERTIFICATE_PASSWORD }}
      - name: Build & Publish
        run: npx electron-builder --${{ matrix.platform }} --publish always
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_LINK: ${{ secrets.WIN_CERTIFICATE }}
          CSC_KEY_PASSWORD: ${{ secrets.WIN_CERTIFICATE_PASSWORD }}
```

---

## 12. Complete Build Pipeline

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Encrypt sensitive content (if user chose encryption)
node encrypt-content.cjs

# 3. Build frontend
npx vite build

# 4. Bundle server
npx esbuild server/index.ts \
  --bundle --platform=node --format=cjs \
  --packages=external --sourcemap --outfile=dist/server.cjs

# 5. Obfuscate server code (if user chose obfuscation)
node obfuscate-server.cjs

# 5b. Delete source maps (SECURITY: prevents unobfuscated source leak)
rm -f dist/*.map

# 6. Compile to bytecode (if user chose bytecode protection)
node compile-bytecode.cjs

# 7. Validate syntax
node -c dist/server.cjs

# 8. Credential leak check
grep -c "sk-\|token\|secret\|password" dist/server.cjs dist/assets/*.js

# 9. Rebuild native modules for Electron
npx electron-rebuild

# 10. Build Electron
npx electron-builder --win --publish never

# 11. Test the packaged app (CRITICAL — always test on clean machine)
```

---

## 13. Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| **Black screen** | Wrong path resolution or fork() + ASAR | Use `app.isPackaged` + `process.resourcesPath`; use `require()` not `fork()` |
| `NODE_MODULE_VERSION` mismatch | Native modules built for system Node, not Electron | Run `electron-rebuild` |
| SmartScreen warning | No code signing or self-signed | Use EV certificate |
| macOS "damaged" error | Not notarized | Add `afterSign: build/notarize.js` |
| Auto-update not working (macOS) | No code signing | macOS requires Developer ID + notarization |
| Memory usage too high | Hidden BrowserWindows | Use `utilityProcess` |
| ASAR integrity error | Modified ASAR after signing | Don't modify ASAR after build |
| Source map leak | .map files in package | `rm -f dist/*.map` after obfuscation |
| `Unexpected token ','` | Obfuscator regex breaks template literals | Don't regex-remove console.log |
| `selfDefending` infinite loop | javascript-obfuscator feature breaks on file move | Never enable `selfDefending` for server code |
| Database "not created" | paths.ts falls back to cwd | Use `process.env.APP_USER_DATA` |
| `__dirname not defined` | ESM module | Use `resolveAppRoot()` with env vars |
| `import.meta` CJS warning | esbuild CJS output | Don't use import.meta in paths.ts |
| Images not displaying | Vite doesn't process string literal paths | Use `import.meta.glob` + embed |
| Windows EPERM | win-unpacked locked | Build to temp directory |
| Clipboard not working (v44+) | clipboard module removed from renderer | Use `contextBridge` in preload |
| macOS notifications missing (v42+) | UNNotification API requires code signing | Sign app with Developer ID + notarize |
| `electron` not installing (v42+) | No longer auto-downloads via postinstall | Run `npx electron install` manually |
