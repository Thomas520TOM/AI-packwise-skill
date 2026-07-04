# Web-to-Desktop Build Sub-Skill

Quickly wrap existing web applications as desktop clients. For scenarios not requiring complex backends, pursuing minimal footprint.

---

## Solution Comparison

| Framework | Language | Size | Engine | Platform | Best For |
|-----------|---------|------|--------|----------|---------|
| Pake/PakePlus | Rust (Tauri) | ~3-10MB | System WebView | Win/Mac/Linux/Android | Website → desktop minimal wrapper |
| Neutralinojs | JS + C++ | ~1-3MB | System WebView | Win/Mac/Linux | Lightweight Electron alternative |
| Capacitor | JS/TS | ~20MB | Chromium (Electron) | Win/Mac/Linux/iOS/Android | Web → all platforms |
| Carlo | JS | ~0MB | System Chrome | Win/Mac/Linux | Users with Chrome installed |

---

## Pake / PakePlus (Recommended: Minimal Wrapper)

**Version**: PakePlus 2.7.x (2025-2026) — the actively maintained successor to the original Pake project.

### When to Use
- Any website wrapped as desktop app
- No backend logic needed
- Minimal size (~3MB)
- Custom window styling

### Usage

```bash
npm install -g pake-cli

# Basic
pake https://example.com --name MyApp

# Custom window
pake https://example.com \
  --name MyApp \
  --icon ./icon.png \
  --width 1200 --height 800 \
  --hide-title-bar \
  --fullscreen false \
  --resizable true

# Multi-platform
pake https://example.com --name MyApp --platform all
```

### Limitations
- No Node.js backend support
- No native module support
- Features limited to WebView capabilities

---

## Neutralinojs (5.6.x)

**Version**: Neutralinojs 5.6.x (2025-2026)

### When to Use
- Need lightweight backend (file system, network)
- Don't need full Node.js
- Minimal footprint (~2MB)

### Setup

```bash
npm install -g @nicepkg/neutralino
neu create myapp
```

### Frontend API

```javascript
// File system
await Neutralino.filesystem.writeFile('data.txt', 'Hello');
const data = await Neutralino.filesystem.readFile('data.txt');

// Window control
await Neutralino.window.setTitle('New Title');

// System
await Neutralino.os.open('https://example.com');
```

### Build

```bash
neu run    # Development
neu build  # Production
# Output: dist/myapp-win_x64/, dist/myapp-mac_x64/, dist/myapp-linux_x64/
```

---

## Capacitor (Web → All Platforms)

### When to Use
- Existing web application
- Need desktop + mobile support simultaneously
- Need native API access (camera, filesystem, notifications)

### Setup

```bash
npm install @capacitor/core @capacitor/cli
npx cap init MyApp com.example.myapp
npm install @capacitor/electron
npx cap add electron
npx cap copy electron
npx cap open electron
```

### Native API Usage

```typescript
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';

await Filesystem.writeFile({
  path: 'data.txt',
  data: 'Hello World',
  directory: Directory.Documents,
});

await LocalNotifications.schedule({
  notifications: [{ title: 'Alert', body: 'New message', id: 1 }],
});
```

---

## Selection Guide

| Your Situation | Recommended |
|---------------|------------|
| Pure website wrap, minimal size | Pake |
| Need filesystem/network backend | Neutralinojs |
| Need desktop + mobile unified | Capacitor |
| Need full Node.js backend | Electron (see electron.md) |
| Need Rust backend + minimal size | Tauri (see tauri.md) |

---

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| WebView display differences | Use standard CSS, avoid experimental features |
| CORS cross-origin | Configure WebView to allow cross-origin or use proxy |
| WebView missing (Linux) | Install libwebkit2gtk-4.1-dev |
| Local storage lost | Use filesystem API instead of localStorage |
| Keyboard shortcut conflicts | Configure WebView to ignore system shortcuts |
