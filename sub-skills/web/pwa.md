# Progressive Web App (PWA) Build Sub-Skill

Build installable web applications that work offline and feel like native apps.

**Current version**: PWA standards (2025-2026) — Service Workers, Web App Manifest, Web Push

## When to Use

- Need cross-platform app from single web codebase
- Offline support required
- Push notifications needed
- App-like experience without app store submission
- Budget-constrained projects (one codebase for all platforms)

## Key Features

| Feature | Browser Support | Notes |
|---------|---------------|-------|
| Service Worker | All modern browsers | Offline caching, background sync |
| Web App Manifest | All modern browsers | Home screen install, splash screen |
| Web Push | Chrome/Firefox/Edge/Safari 16.4+ | Push notifications on all platforms |
| Background Sync | Chrome/Edge | Sync data when connection restored |
| Periodic Background Sync | Chrome/Edge only | Fetch updates in background |
| File System Access | Chrome/Edge | Read/write local files |
| Web Share API | Chrome/Edge/Safari | Native share dialog |

## PWA Essentials

### 1. Web App Manifest

```json
{
  "name": "My PWA App",
  "short_name": "MyApp",
  "description": "My Progressive Web App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/desktop.png", "sizes": "1280x720", "form_factor": "wide" },
    { "src": "/screenshots/mobile.png", "sizes": "390x844", "form_factor": "narrow" }
  ],
  "categories": ["productivity"],
  "shortcuts": [
    { "name": "Settings", "url": "/settings", "icons": [{ "src": "/icons/settings-96.png", "sizes": "96x96" }] }
  ]
}
```

```html
<!-- index.html -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

### 2. Service Worker

```javascript
// sw.js — Cache-first strategy for static assets
const CACHE_NAME = 'my-app-v1';
const STATIC_ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
      return cached || fetched;
    })
  );
});
```

```javascript
// Register in main app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 3. Web Push Notifications

```javascript
// Request permission and subscribe
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
// Send subscription to your backend
await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
```

## Build & Test

```bash
# Vite PWA plugin (vite-plugin-pwa 1.3+ supports Vite 3-8)
npm install vite-plugin-pwa -D
```

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 3600 } },
          },
        ],
      },
      manifest: { /* manifest.json content */ },
    }),
  ],
};
```

```bash
# Build
npm run build
# Output: dist/ directory with PWA-ready files

# Test locally
npx serve dist  # Serve over HTTP for testing
# For full PWA testing: deploy to HTTPS server

# Lighthouse audit
npx lighthouse https://myapp.com --only-categories=pwa
```

## Framework-Specific PWA

### Next.js (App Router)

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});
module.exports = withPWA({ /* next config */ });
```

### Vue (Vite)

```javascript
// Same as Vite config above — use vite-plugin-pwa
```

### React (Create React App / Vite)

```bash
# CRA: use `cra-template-pwa`
npx create-react-app my-app --template pwa

# Vite: use vite-plugin-pwa (recommended)
```

## PWA vs Native App

| Feature | PWA | Native App |
|---------|-----|-----------|
| Distribution | URL (no store) | App Store / Play Store |
| Install | Browser prompt | Store download |
| Offline | Yes (Service Worker) | Yes |
| Push notifications | Yes (web push) | Yes |
| Device access | Limited (camera, GPS, file) | Full |
| Performance | Good (WASM, Web Workers) | Best |
| Size | No install footprint | 20MB+ |
| Updates | Instant (on next visit) | Store review |
| iOS support | Limited (no full PWA on Safari < 16.4) | Full |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| PWA not installable | Ensure manifest.json is correct; serve over HTTPS; check Lighthouse PWA audit |
| Service Worker not updating | Use `skipWaiting()` + `clients.claim()`; change cache version |
| iOS push notifications not working | Requires Safari 16.4+; use web push with VAPID keys |
| Cache serving stale content | Use NetworkFirst for API; CacheFirst for static assets |
| Offline page not showing | Add fallback page in service worker `fetch` handler |
| Maskable icon looks wrong | Test with maskable.app; ensure safe zone is respected |
| Background sync not working | Only supported in Chrome/Edge; use IndexedDB for queued operations |
