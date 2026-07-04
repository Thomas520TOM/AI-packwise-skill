# Capacitor Mobile Build Sub-Skill

Package web applications as native mobile apps using Capacitor.

**Current version**: Capacitor 8.x / Capacitor CLI 8.x (2025-2026)

> ⚠️ **Breaking changes since Capacitor 6**:
> - **Node.js 22+ required** (was 18+). **JDK 21 required** (was 17). **iOS deployment target 15.0** (was 13.0). **Android minSdk 24** (was 22). **Android compileSdk/targetSdk 36** (was 34).
> - `android.adjustMarginsForEdgeToEdge` config removed (v8) — use System Bars plugin with CSS `env()` variables.
> - `bridge_layout_main.xml` renamed to `capacitor_bridge_layout_main.xml` (v8).
> - Gradle property syntax requires `=` (e.g., `namespace = "com.example"`).
> - iOS now defaults to SPM (Swift Package Manager) for new projects (v8).
> - Plugin type aliases removed in v7 (e.g., `AppRestoredResult` → `RestoredListenerEvent`).
> - Run `npx cap migrate` for automated migration.
> - See [capacitorjs.com/docs/updating/8-0](https://capacitorjs.com/docs/updating/8-0).

## When to Use

- Have an existing web app (React, Vue, Svelte, Angular, vanilla JS)
- Need native device access (camera, GPS, filesystem, push notifications)
- Want a single codebase for web + iOS + Android
- Don't need deep native UI customization

## Key Features

- **WebView-based** — web app runs inside a native WebView container
- **Native plugin ecosystem** — camera, geolocation, filesystem, push, biometrics, etc.
- **Live Updates** — push web content updates without app store review (via `@capacitor/live-updates`)
- **Progressive adoption** — add Capacitor to existing web projects incrementally
- **Platform APIs** — access native features via TypeScript-friendly plugin APIs

## Prerequisites

```bash
# Node.js 22+ (REQUIRED for Capacitor 8)
# For Android: Android Studio (2025.2.1+) + JDK 21
# For iOS: Xcode 26+ (macOS only), iOS deployment target 15.0+
# CocoaPods or SPM (SPM is default for new Capacitor 8 iOS projects)
```

## Project Setup

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize (interactive — sets appName, appId, webDir)
npx cap init

# Add platforms
npx cap add android
npx cap add ios

# Install common plugins
npm install @capacitor/camera @capacitor/geolocation @capacitor/push-notifications
npm install @capacitor/filesystem @capacitor/haptics @capacitor/share
npm install @capacitor/local-notifications @capacitor/biometric
```

## Configuration

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.myapp',
  appName: 'MyApp',
  webDir: 'dist', // must match your framework's build output directory
  server: {
    androidScheme: 'https', // required for modern WebView features
    // url: 'http://192.168.1.100:5173', // dev mode: live reload from dev server
    // cleartext: true,                    // dev mode: allow HTTP
  },
  android: {
    buildOptions: {
      keystorePath: undefined,  // set for release signing
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'MyApp', // Xcode scheme name
    contentInset: 'automatic',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

## Build Workflow

```bash
# 1. Build your web app first
npm run build  # outputs to dist/

# 2. Copy web assets to native projects
npx cap copy android
npx cap copy ios

# 3. Sync (copy + update native dependencies)
npx cap sync android
npx cap sync ios

# 4. Open in native IDE for final build
npx cap open android  # Android Studio
npx cap open ios      # Xcode
```

## Android Release Build

```bash
# Generate signing keystore (first time)
keytool -genkey -v -keystore android/app/my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias my-key

# build.gradle.kts signing config
signingConfigs {
    create("release") {
        storeFile = file("my-release-key.jks")
        storePassword = System.getenv("KEYSTORE_PASSWORD")
        keyAlias = "my-key"
        keyPassword = System.getenv("KEY_PASSWORD")
    }
}

# Build AAB (Play Store)
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# Build APK (direct distribution)
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## iOS Release Build

```bash
# Open Xcode project
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Product → Archive
# 3. Distribute App → App Store Connect / Ad Hoc / Enterprise

# Command line (requires fastlane)
sudo gem install fastlane
cd ios/App && fastlane beta  # TestFlight
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| White screen after build | Check `webDir` in capacitor.config.ts matches framework output dir (dist/build/www) |
| Resources not synced | Always run `npx cap copy` or `npx cap sync` AFTER `npm run build` |
| Plugin not working | Run `npx cap sync` after installing new plugins; check plugin supports your platform |
| Android build fails | Check JDK version (**21 required for v8**); invalidate caches in Android Studio |
| iOS build fails | Run `cd ios/App && pod install` after adding plugins; iOS target must be **15.0+** |
| CORS errors in dev | Set `server.url` to dev server and `server.cleartext: true` in config |
| Keyboard overlaps input | Install `@capacitor/keyboard` and configure `resize` mode |
| Status bar issues | Use `@capacitor/status-bar` to configure appearance |
| Push notifications not received | Verify Google Services (Android) / APNs (iOS) certificates configured correctly |
| `capacitor.config.ts` not found | Ensure file is in project root; Capacitor 6 requires `.ts` or `.json` |
| Native module crashes on startup | Check Android `minSdkVersion` (**24+ for v8**) / iOS deployment target (**15.0+ for v8**) |
| App rejected by Play Store | Ensure `androidScheme: 'https'`; Play Store requires HTTPS in WebView |
| `bridge_layout_main.xml` not found (v8) | Renamed to `capacitor_bridge_layout_main.xml` |
| Gradle syntax warning | Use `=` syntax: `namespace = "com.example"` not `namespace "com.example"` |
| Plugin type not found (v7+) | Type aliases removed: `AppRestoredResult` → `RestoredListenerEvent`, etc. |

## Plugin Management

```bash
# List installed plugins
npx cap ls

# Update plugins to latest
npx cap update android
npx cap update ios

# Remove a plugin
npm uninstall @capacitor/camera
npx cap sync
```

## CI/CD — GitHub Actions (Android)

```yaml
# .github/workflows/capacitor-android.yml
name: Capacitor Android
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: cd android && chmod +x gradlew && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: apk
          path: android/app/build/outputs/apk/release/*.apk
```

## Capacitor vs Cordova vs PWA

| Feature | Capacitor 6 | Cordova | PWA |
|---------|------------|---------|-----|
| Architecture | Modern WebView + native bridge | Legacy WebView bridge | Browser APIs only |
| Plugin API | TypeScript-first, Promise-based | Callback-based | Service Worker + Web APIs |
| Native UI | Yes (custom native views) | Limited | No |
| Live Updates | Yes (@capacitor/live-updates) | No (without plugin) | Yes (Service Worker) |
| Web target | Direct (same codebase) | Requires wrapper | Native |
| Maintenance | Active (Ionic team) | Community | Browser vendors |
| Learning curve | Low | Low | Lowest |
