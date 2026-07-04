# Browser Extension Build Sub-Skill

Build and publish browser extensions for Chrome, Edge, Firefox, and Safari.

**Current version**: Manifest V3 (MV3) / Chrome 130+ / Firefox 130+ / Safari 18+ (2025-2026)

## When to Use

- Browser productivity tools (ad blockers, password managers, note-taking)
- Developer tools (API inspectors, debug panels)
- Content enhancement (readers, translators, UI overlays)
- Web scraping / data extraction tools
- AI-powered browser assistants

## Manifest V3 (Required for Chrome/Edge)

### Project Structure

```
my-extension/
├── manifest.json           ← Core configuration (MV3)
├── background.js           ← Service Worker (replaces background page)
├── content.js              ← Content script (injected into pages)
├── popup/
│   ├── popup.html          ← Popup page
│   └── popup.js
├── options/
│   ├── options.html        ← Settings page
│   └── options.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── sidepanel/              ← Chrome Side Panel (optional)
    ├── panel.html
    └── panel.js
```

### manifest.json Template (MV3)

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Extension description",
  "permissions": [
    "activeTab",
    "storage",
    "scripting",
    "sidePanel"
  ],
  "host_permissions": ["https://*/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["https://*/*"],
    "js": ["content.js"],
    "css": ["content.css"],
    "run_at": "document_idle"
  }],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "side_panel": {
    "default_path": "sidepanel/panel.html"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "minimum_chrome_version": "116"
}
```

### Background Service Worker (MV3)

```javascript
// background.js — runs as Service Worker (NOT persistent)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getData') {
    chrome.storage.local.get(['data'], (result) => {
      sendResponse(result.data);
    });
    return true; // Keep message channel open for async response
  }
});

// Side Panel API
chrome.sidePanel.setOptions({ path: 'sidepanel/panel.html', enabled: true });
```

### Content Script

```javascript
// content.js — runs in the context of web pages
// Can access DOM but NOT Chrome APIs directly
// Communicate with background via chrome.runtime.sendMessage

const data = document.title;
chrome.runtime.sendMessage({ action: 'pageTitle', data });
```

### Build Tools (Bundling with Vite/Webpack)

```bash
npm install -D @crxjs/vite-plugin  # For Vite projects
```

```javascript
// vite.config.js
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default {
  plugins: [crx({ manifest })],
  build: {
    rollupOptions: {
      input: { background: 'background.js' },
    },
  },
};
```

---

## Firefox Extension (Manifest V3 Support)

Firefox now supports MV3. Add `browser_specific_settings` to manifest.json:

```json
{
  "manifest_version": 3,
  "browser_specific_settings": {
    "gecko": {
      "id": "my-extension@example.com",
      "strict_min_version": "109.0"
    }
  }
}
```

### Firefox-Specific Differences

| Feature | Chrome MV3 | Firefox MV3 |
|---------|-----------|-------------|
| Background | Service Worker (ephemeral) | Event pages (can be persistent) |
| `browser` API | `chrome.*` | `browser.*` (promise-based) + `chrome.*` (compat) |
| Storage | `chrome.storage` | `browser.storage` |
| Side Panel | Supported | Not supported |
| `webRequest` blocking | Removed (use `declarativeNetRequest`) | Still supported |

### Cross-Browser Build (WXT Framework)

```bash
npm install -D wxt
```

```bash
# Development
npx wxt dev

# Build for Chrome
npx wxt build --browser chrome
# Output: .output/chrome-mv3/

# Build for Firefox
npx wxt build --browser firefox
# Output: .output/firefox-mv2/

# Build for all browsers
npx wxt zip        # Creates .zip for store upload
```

---

## Safari Extension

### Option 1: Web Extension (Recommended — share code with Chrome/Firefox)

```bash
# In Xcode:
# File → New → Target → Safari Web Extension
# Import your Chrome MV3 extension
# Xcode converts it to Safari format

# Build
xcodebuild -scheme MyApp-Extension -configuration Release archive
```

### Option 2: Safari App Extension (Native Swift)

```swift
import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
    override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String: Any]?) {
        page.dispatchMessageToScript(withName: "response", userInfo: ["data": "Hello from native!"])
    }
}
```

### Safari-Specific Notes

- Safari uses Web Extension format (similar to MV3 but with limitations)
- Requires macOS + Xcode
- Distributed via App Store ($99/year developer account)
- Some Chrome APIs not available in Safari

---

## Packaging & Publishing

### Chrome Web Store

```bash
# 1. Build production version
npm run build

# 2. Zip the extension
zip -r my-extension.zip manifest.json *.js *.css popup/ options/ icons/

# 3. Upload to Chrome Web Store
# chrome.google.com/webstore/devconsole
# - Pay $5 one-time registration fee
# - Upload .zip
# - Fill: description, screenshots (1280x800), privacy policy URL
# - Submit for review (1–7 days)

# Or: automated with GitHub Action
# wxtjs/wxt-builder-action
```

### Edge Add-ons

```bash
# Same .zip works for Edge
# partner.microsoft.com/dashboard
# Upload .zip → Submit for review (1–3 days)
```

### Firefox Add-ons

```bash
# addons.mozilla.org/developers/
# Upload .zip → Submit for review (1–7 days, sometimes longer)
# No registration fee
```

### Safari Extensions

```bash
# App Store Connect → New App → macOS
# Upload .xcarchive via Xcode
# Requires Apple Developer account ($99/year)
# Review: 1–3 days
```

---

## Store Comparison

| Store | Fee | Review Time | User Base | Auto-Update |
|-------|-----|-------------|-----------|-------------|
| Chrome Web Store | $5 one-time | 1–7 days | 3B+ users | Yes |
| Edge Add-ons | Free | 1–3 days | 300M+ users | Yes |
| Firefox Add-ons | Free | 1–7 days | 200M+ users | Yes |
| Safari Extensions | $99/year | 1–3 days | 1B+ devices | Yes (via App Store) |

---

## MV3 Migration Checklist (from MV2)

| MV2 Feature | MV3 Replacement |
|-------------|----------------|
| Background page | Service Worker |
| `chrome.browserAction` | `chrome.action` |
| `webRequest` blocking | `declarativeNetRequest` |
| Remote code execution | Bundled code only |
| `eval()` | Not allowed |
| Persistent background | Event-driven (non-persistent) |
| `chrome.extension.getURL` | `chrome.runtime.getURL` |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| V2 deprecated | Migrate to V3 (Service Worker replaces Background Page) |
| CSP restriction in MV3 | No remote code; bundle all dependencies |
| Too many permissions rejected | Minimize permissions; use `activeTab` instead of `<all_urls>` |
| Review rejected | Ensure privacy policy URL is valid; minimize data collection |
| Service Worker dies | MV3 Service Workers are ephemeral; use `chrome.alarms` for periodic tasks |
| Content script not injecting | Check `matches` pattern; verify `run_at` setting |
| `chrome.storage` not persisting | Use `chrome.storage.sync` for cross-device; `local` for device-only |
| Cross-browser compatibility | Use WXT or webextension-polyfill for unified API |
| Popup not showing | Check popup.html exists; verify `default_popup` in manifest |
