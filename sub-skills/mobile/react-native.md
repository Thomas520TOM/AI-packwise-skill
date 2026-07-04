# React Native Build Sub-Skill

Build mobile apps using React Native with JavaScript or TypeScript.

**Current version**: React Native 0.86.x / Expo SDK 56 (2025-2026)

> ⚠️ **Critical breaking changes since RN 0.76**:
> - **Legacy architecture fully removed (v0.84)**: Old bridge modules, `NativeModules` direct access, `requireNativeComponent` all fail. ALL native modules must have TurboModule spec files.
> - **JSC engine removed (v0.81)**: Hermes is the sole JS engine. `hermesEnabled` property no longer meaningful.
> - **iOS minimum deployment target**: 13.4 (v0.76) → **16.0** (v0.78+). Apps targeting older iOS will be rejected.
> - **Deep imports removed (v0.82)**: `require('react-native/Libraries/...')` without `.default` breaks.
> - **Node.js 22.11+ required (v0.84)**.
> - **Expo SDK 56** required for RN 0.85/0.86 (was SDK 52 for RN 0.76).
> - **Metro package exports** enabled by default (v0.79) — may break Firebase, AWS Amplify.
> - **React 19**: `propTypes` removed, `ref` is regular prop, string refs removed.
> - **Jest preset moved (v0.85)**: `preset: 'react-native'` → `preset: '@react-native/jest-preset'`.
> - See [reactnative.dev/blog](https://reactnative.dev/blog) for version-specific guides.

## When to Use

- Team has React/JavaScript/TypeScript experience
- Need cross-platform app (iOS + Android) with near-native performance
- Want to leverage the React ecosystem and component model

## Key Features

- **Hermes engine** — default JS engine since RN 0.70, optimized for mobile (faster startup, lower memory)
- **Fabric renderer** — new architecture with synchronous native calls
- **TurboModules** — lazy-loaded native modules with type-safe JSI bindings
- **Expo ecosystem** — managed workflow for rapid development without Xcode/Android Studio setup

## Prerequisites

```bash
# React Native CLI (bare workflow)
npm install -g react-native-cli

# Android
# Android Studio, JDK 17, Android SDK 34+

# iOS (macOS only)
# Xcode 15+, CocoaPods (sudo gem install cocoapods)
```

## Two Workflows: Expo vs Bare

| Feature | Expo (Managed) | Bare Workflow |
|---------|---------------|---------------|
| Setup | `npx create-expo-app` | `npx react-native init` |
| Native code | No direct access | Full control |
| Build service | EAS Cloud Build | Local + CI |
| OTA updates | Yes (EAS Update) | Manual |
| Best for | New projects, rapid prototyping | Existing native modules, full control |

## Expo Managed Workflow (Recommended for New Projects)

```bash
# Create project
npx create-expo-app@latest MyApp --template blank-typescript
cd MyApp

# Local development
npx expo start              # Start dev server
npx expo start --ios        # Run on iOS simulator
npx expo start --android    # Run on Android emulator

# Export for production
npx expo export --platform all
```

### EAS Build (Cloud Build Service)

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure build profiles
# Creates eas.json with development/preview/production profiles
eas build:configure

# Build for Android (AAB for Play Store) — requires Node 22.11+ for RN 0.84+
eas build --platform android --profile production

# Build for iOS (IPA for App Store) — minimum iOS 16.0 for RN 0.78+
eas build --platform ios --profile production

# Build for both platforms simultaneously
eas build --platform all --profile production

# Local build (no cloud credits needed)
eas build --platform android --profile production --local
```

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      }
    }
  }
}
```

### EAS Update (OTA Updates)

```bash
# Push OTA update (no app store review needed)
eas update --branch production --message "Fix login bug"

# Rollback to previous version
eas update --branch production --message "Rollback" --republish
```

## Bare Workflow (Full Native Control)

```bash
# Create project
npx @react-native-community/cli init MyApp --version 0.76
cd MyApp

# Verify setup
npx react-native doctor

# Run
npx react-native run-android
npx react-native run-ios
```

### Hermes Engine (Default)

Hermes is the default JS engine since RN 0.70. Verify it's enabled:

```javascript
// android/gradle.properties
hermesEnabled=true  // should be true by default

// ios/Podfile (auto-configured)
:hermes_enabled => true
```

```bash
# Verify Hermes is active at runtime
console.log('Hermes:', global.HermesInternal != null); // should print true
```

### Android Release Build

```bash
# Generate signing keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Set signing config in android/app/build.gradle.kts
# OR use environment variables (recommended for CI):
export MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
export MYAPP_RELEASE_KEY_ALIAS=my-key-alias
export MYAPP_RELEASE_STORE_PASSWORD=your-password
export MYAPP_RELEASE_KEY_PASSWORD=your-password

# Build AAB (Play Store)
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# Build APK (direct distribution)
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# Run release build on device
npx react-native run-android --mode=release
```

### iOS Release Build

```bash
# Install pods
cd ios && pod install && cd ..

# Build via Xcode
open ios/MyApp.xcworkspace
# Product → Archive → Distribute App

# Build via command line (requires fastlane)
sudo gem install fastlane
cd ios && fastlane release

# TestFlight upload
cd ios && fastlane beta
```

## React Native vs Flutter

| Feature | React Native | Flutter |
|---------|-------------|---------|
| Language | JavaScript/TypeScript | Dart |
| UI | Native components | Custom rendering (Skia/Impeller) |
| Hot reload | Fast Refresh | Hot reload |
| Performance | Near-native (Hermes + Fabric) | Near-native (AOT compilation) |
| Ecosystem | Huge (npm) | Growing (pub.dev) |
| Web support | Via react-native-web | First-class |
| Learning curve | Low (if you know React) | Medium (Dart is less common) |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Metro bundler cache issues | `npx react-native start --reset-cache` |
| iOS build fails after pod install | `cd ios && pod deinstall && pod install`; check Ruby version (3.1+) |
| Android SDK not found | Set `ANDROID_HOME` env variable; verify with `npx react-native doctor` |
| Hermes not enabled | Check `hermesEnabled=true` in `android/gradle.properties`; run `pod install` |
| Release build crashes but debug works | Check ProGuard rules; add keep rules for native modules |
| App size too large | Enable Hermes; use ProGuard; split APKs by ABI |
| Network request fails in release | iOS: add App Transport Security exception in Info.plist |
| `react-native-reanimated` crash | Ensure Babel plugin is in `babel.config.js` |
| EAS build timeout | Use `--local` flag for local builds; check build logs for specific errors |
| New Architecture compatibility | Check library support at reactnative.directory; many libs still on old arch |
| "Namespace not specified" error | AGP 8.x requires `namespace` in `android/app/build.gradle`; remove `package=` from AndroidManifest.xml |
| Legacy arch modules crash (0.84+) | Old bridge modules fully removed; must use TurboModule spec files |
| JSC not available (0.81+) | Hermes is sole engine; `hermesEnabled` toggle no longer meaningful |
| iOS build rejected (0.78+) | Minimum iOS deployment target is now 16.0 (was 13.4) |
| Deep import fails (0.82+) | `require('react-native/Libraries/...')` removed; use top-level exports |
| Metro package exports break (0.79+) | Add `resolver.unstable_enablePackageExports: false` to metro.config.js to opt out |
| Jest preset not found (0.85+) | Change `preset: 'react-native'` to `preset: '@react-native/jest-preset'` |
| Firebase/Amplify build fails (0.79+) | Metro exports resolution enabled by default; see Metro config fix above |
| App Store rejected: missing Privacy Manifest | Add `PrivacyInfo.xcprivacy` to iOS project (see below) |
| `ClassNotFoundException` on release | Missing ProGuard rules — see ProGuard section below |

## Critical: AGP 8.x Namespace Requirement

AGP 8.0+ removed `package` attribute from `AndroidManifest.xml`. You MUST use `namespace` in `build.gradle`:

```gradle
// android/app/build.gradle
android {
    namespace "com.yourapp"  // REQUIRED in AGP 8.x
    compileSdk 35
    defaultConfig {
        applicationId "com.yourapp"
        minSdkVersion 24
        targetSdkVersion 35
    }
}
```

```xml
<!-- AndroidManifest.xml — REMOVE package attribute -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- no package="..." attribute -->
</manifest>
```

## New Architecture (Mandatory since RN 0.84)

Fabric renderer and TurboModules are **mandatory** since React Native 0.84. Legacy architecture code has been completely removed. There is no opt-out.

```properties
# android/gradle.properties (RN 0.84+)
# newArchEnabled is no longer configurable — it's always on
hermesEnabled=true  # Hermes is the sole engine (JSC removed in 0.81)
```

**What this means:**
- ALL native modules must have TurboModule spec files
- Libraries using old `UIManager` bridge calls will NOT work
- `NativeModules` direct access deprecated — use TurboModule specs
- `requireNativeComponent` replaced by Fabric component specs
- Check library compatibility: [reactnative.directory](https://reactnative.directory)

## ProGuard Rules (Required for Release Builds)

> ⚠️ **R8 full mode is now default** for release builds (more aggressive shrinking). Without these rules, your release build WILL crash at runtime. Legacy architecture classes removed in RN 0.84+ may require updated rules.

```proguard
# android/app/proguard-rules.pro

# React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }

# Native Modules (CRITICAL — R8 strips these without keep rules)
-keepnames class * extends com.facebook.react.bridge.NativeModule
-keepnames class * extends com.facebook.react.TurboModule
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Views
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.animated.** { *; }

# Common third-party libraries
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.horcrux.svg.** { *; }

# Expo modules (if using Expo)
-keep class expo.modules.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
```

Enable in `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## iOS Privacy Manifest (Required for App Store)

Apple requires `PrivacyInfo.xcprivacy` since Spring 2024. Without it, your app will be rejected.

```xml
<!-- ios/YourApp/PrivacyInfo.xcprivacy -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array><string>CA92.1</string></array>
        </dict>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array><string>C617.1</string></array>
        </dict>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategorySystemBootTime</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array><string>35F9.1</string></array>
        </dict>
    </array>
</dict>
</plist>
```

Add to Xcode: Drag into app group → ensure "Copy Bundle Resources" includes it.

## Secure Signing Configuration

Never commit passwords to version control.

```gradle
// android/app/build.gradle — secure signing
signingConfigs {
    release {
        storeFile file(MYAPP_RELEASE_STORE_FILE ?: System.getenv("MYAPP_RELEASE_STORE_FILE") ?: "release.keystore")
        storePassword MYAPP_RELEASE_STORE_PASSWORD ?: System.getenv("MYAPP_RELEASE_STORE_PASSWORD")
        keyAlias MYAPP_RELEASE_KEY_ALIAS ?: System.getenv("MYAPP_RELEASE_KEY_ALIAS")
        keyPassword MYAPP_RELEASE_KEY_PASSWORD ?: System.getenv("MYAPP_RELEASE_KEY_PASSWORD")
    }
}
```

```yaml
# GitHub Actions — decode keystore from secrets
- name: Decode Keystore
  run: echo "${{ secrets.RELEASE_KEYSTORE_BASE64 }}" | base64 --decode > android/app/release.keystore
- name: Build Release
  env:
    MYAPP_RELEASE_STORE_FILE: release.keystore
    MYAPP_RELEASE_STORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
    MYAPP_RELEASE_KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
    MYAPP_RELEASE_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
  run: cd android && ./gradlew bundleRelease
```

## Metro Production Configuration

```javascript
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  transformer: {
    minifierConfig: {
      compress: {
        drop_console: true,  // Remove console.log in production
      },
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```
