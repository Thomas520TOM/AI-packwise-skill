# Flutter Mobile Build Sub-Skill

Build cross-platform mobile applications with Flutter (Android + iOS + Web + Desktop from single codebase).

**Current version**: Flutter 3.44.x / Dart 3.12.x (2025-2026)

## When to Use

- Single codebase for Android + iOS (+ Web + Desktop)
- Custom UI with high-performance rendering (Impeller engine)
- Team willing to learn Dart
- Apps requiring smooth animations and custom designs

## Build

```bash
# Android
flutter build apk --release                    # APK (direct install)
flutter build appbundle --release              # AAB (Google Play required)
flutter build apk --release --split-per-abi    # Separate APK per architecture (smaller)

# iOS (requires macOS)
flutter build ios --release
flutter build ipa --release                    # IPA for App Store / TestFlight

# Web
flutter build web --release

# Desktop
flutter build windows --release
flutter build macos --release
flutter build linux --release
```

## Signing

### Android

```bash
# key.properties (project root, DO NOT commit)
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=your-key-alias
storeFile=../key/my-release-key.jks
```

```groovy
// android/app/build.gradle.kts
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### iOS

```bash
# Open Xcode workspace
open ios/Runner.xcworkspace

# In Xcode:
# 1. Signing & Capabilities → Team → Select your team
# 2. Bundle Identifier → Set unique ID
# 3. Product → Archive → Distribute → App Store Connect

# Command line (requires fastlane)
cd ios && fastlane beta   # TestFlight
```

## Flavor / Build Variants

```bash
# Define flavors in android/app/build.gradle.kts
# Then build specific flavor:
flutter build apk --release --flavor production
flutter build appbundle --release --flavor production
flutter build ios --release --flavor staging
```

```dart
// lib/flavors.dart
enum Flavor { dev, staging, production }

class F {
  static Flavor? appFlavor;
  static String get apiBaseUrl => switch (appFlavor) {
    Flavor.dev => 'http://localhost:3000',
    Flavor.staging => 'https://staging.example.com',
    Flavor.production => 'https://api.example.com',
    _ => 'http://localhost:3000',
  };
}
```

## Impeller Rendering Engine (Default since Flutter 3.16)

```bash
# Impeller is default on iOS, macOS, Android (Vulkan)
# Verify: check logs for "Using Impeller rendering backend"

# Disable Impeller (if issues):
flutter run --no-enable-impeller
# AndroidManifest.xml: <meta-data android:name="io.flutter.embedding.android.EnableImpeller" android:value="false" />
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Android signing error | Check `key.properties` path; ensure keystore exists |
| iOS build failure | Requires Mac + Xcode 15+; run `cd ios && pod install` |
| Blurry icons | Provide all required icon sizes (use `flutter_launcher_icons` package) |
| Platform differences | Use `Platform.isIOS` / `Platform.isAndroid` for conditional code |
| App size too large | Use `--split-per-abi`; enable `shrinkResources`; remove unused plugins |
| Impeller rendering glitches | Disable Impeller for specific platform; file Flutter issue |
| `flutter build` hangs | Run `flutter clean && flutter pub get` |
| CocoaPods error | `cd ios && pod deinstall && pod install`; check Ruby version |
| Web build: CORS issues | Use `flutter run -d chrome --web-browser-flag=--disable-web-security` (dev only) |
