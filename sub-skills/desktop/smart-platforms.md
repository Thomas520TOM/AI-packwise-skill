# Smart Platform Build Sub-Skill

Build apps for smart TVs, automotive infotainment, and other non-phone/tablet platforms.

**Current versions**: Android TV 14 / tvOS 18 / webOS 24 / Tizen 8.0 / CarPlay / Android Auto (2025-2026)

---

## Android TV / Google TV

### When to Use

- Smart TV applications (streaming, gaming, information display)
- Google TV launcher integration
- Large-screen optimized UI

### Prerequisites

- Android Studio + Android TV SDK
- JDK 17
- Android TV emulator or Fire TV device

### Build

```kotlin
// build.gradle.kts
android {
    defaultConfig {
        minSdk = 21  // Android TV minimum
        targetSdk = 34
    }
}

dependencies {
    // Leanback UI library (TV-optimized)
    implementation("androidx.leanback:leanback:1.2.0")
    // Media playback
    implementation("androidx.media3:media3-exoplayer:1.5.0")
}
```

```xml
<!-- AndroidManifest.xml — TV-specific -->
<application>
    <activity
        android:name=".MainActivity"
        android:banner="@drawable/tv_banner"
        android:icon="@drawable/tv_icon"
        android:logo="@drawable/tv_logo">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        </intent-filter>
    </activity>

    <!-- Required: declare as TV app -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="true" />
    <!-- Touchscreen NOT required for TV -->
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
</application>
```

```bash
# Build
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

# Distribute: Google Play (TV section) or Amazon Appstore (Fire TV)
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| App not showing on TV | Add `LEANBACK_LAUNCHER` intent filter; declare `android.software.leanback` |
| D-pad navigation broken | Use `Leanback` library; implement focus handling |
| No touchscreen on TV | All interactions must work with D-pad/remote |
| Banner image required | Provide 320x180 banner for TV launcher |

---

## Apple tvOS

### When to Use

- Apple TV apps (streaming, gaming, fitness)
- Integration with Apple ecosystem (AirPlay, HomeKit)
- SwiftUI-based large-screen apps

### Prerequisites

- macOS + Xcode 15+
- Apple Developer account ($99/year)
- Apple TV device or simulator

### Build

```swift
// tvOS app with SwiftUI
import SwiftUI

@main
struct MyTVApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .focusable() // D-pad navigation
        }
    }
}
```

```bash
# Build
xcodebuild -scheme MyApp-tvOS -configuration Release -sdk appletvos archive -archivePath build/MyApp.xcarchive

# Or: Product → Archive → Distribute → App Store Connect
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Focus navigation issues | Use `@FocusState` in SwiftUI; test with Siri Remote |
| No keyboard input | Design for on-screen keyboard; use dictation |
| App size limit | 4GB maximum for tvOS apps |
| Top Shelf extension | Implement for rich content when app is in top row |

---

## Samsung Tizen (Smart TV / Wearable)

### When to Use

- Samsung Smart TV apps (market leader in TVs)
- Samsung wearable apps (Galaxy Watch 3 and earlier)
- Legacy platform support

### Build

```bash
# Tizen Studio
tizen build -t mobile -c llvm -C Debug  # Wearable
tizen build -t tv -c llvm -C Debug      # Smart TV

# Package
tizen package -t wgt -s certificate-profile
# Output: .wgt file for Samsung Galaxy Store
```

### Web Apps on Tizen

```html
<!-- Tizen supports web-based TV apps -->
<!-- config.xml -->
<widget xmlns="http://www.w3.org/ns/widgets" id="http://example.com/myapp" version="1.0.0">
    <name>My TV App</name>
    <content src="index.html" />
    <tizen:application id="your-app-id" package="your-package" required_version="8.0"/>
</widget>
```

---

## LG webOS (Smart TV)

### When to Use

- LG Smart TV applications
- Second largest smart TV platform globally

### Build

```bash
# Install webOS SDK (webOS TV SDK)
# webOS TV apps are web-based (HTML/CSS/JS)

# Create project
ares-generate -t basic my-tv-app

# Package
ares-package my-tv-app
# Output: .ipk file

# Install on TV (developer mode must be enabled)
ares-install --device tv my-tv-app_1.0.0_all.ipk

# Launch
ares-launch --device tv com.example.mytvapp
```

### webOS Architecture

```
webOS TV App = Web Application (HTML5 + CSS3 + JavaScript)
├── index.html
├── appinfo.json          ← App metadata
├── assets/
└── lib/
    └── webOSTV.js        ← webOS TV API library
```

```json
// appinfo.json
{
    "id": "com.example.mytvapp",
    "version": "1.0.0",
    "vendor": "My Company",
    "type": "web",
    "main": "index.html",
    "icon": "icon.png",
    "largeIcon": "largeIcon.png"
}
```

---

## CarPlay / Android Auto

### When to Use

- Navigation apps
- Music/podcast/audio apps
- Messaging apps (voice-driven)
- EV charging apps

### CarPlay (Apple)

```swift
// Requires Apple CarPlay entitlement (apply at developer.apple.com)
// Only for: Navigation, Audio, Messaging, EV Charging, Fueling, Driving Task, Quick Ordering
// UI provided by CarPlay framework — limited customization

import CarPlay

class AppDelegate: NSObject, UIApplicationDelegate, CPApplicationDelegate {
    func application(_ application: UIApplication,
                     didConnect carInterfaceController: CPInterfaceController,
                     to window: CPWindow) {
        // Set up CarPlay scene
    }
}
```

### Android Auto

```xml
<!-- AndroidManifest.xml -->
<meta-data
    android:name="com.google.android.gms.car.application"
    android:resource="@xml/automotive_app_desc" />

<!-- res/xml/automotive_app_desc.xml -->
<automotiveApp>
    <uses name="media" />          <!-- Audio apps -->
    <uses name="template" />       <!-- Navigation, messaging -->
</automotiveApp>
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| CarPlay entitlement rejected | Only approved app categories are accepted; apply early |
| Android Auto distraction guidelines | No video; no text input while driving; voice-only interaction |
| Simulator testing | Use Xcode CarPlay Simulator (CarPlay) / Desktop Head Unit (Android Auto) |
| Limited UI customization | Both platforms use template-based UI; no custom layouts |

---

## Raspberry Pi / Linux SBC

### When to Use

- Digital signage
- IoT dashboards
- Kiosk applications
- Home automation displays

### Build

```bash
# Cross-compile for ARM
# Electron:
npx electron-builder --linux --arm64  # Raspberry Pi 4/5 (64-bit)
npx electron-builder --linux --armv7l # Raspberry Pi 3 (32-bit)

# Tauri:
cargo tauri build --target aarch64-unknown-linux-gnu

# .NET:
dotnet publish -r linux-arm64 --self-contained

# Flutter:
flutter build linux --target-arch arm64
```

### Packaging for Raspberry Pi OS

```bash
# .deb package (native to Raspberry Pi OS/Debian)
dpkg-deb --build myapp-deb myapp_1.0.0_arm64.deb

# Install on Pi
sudo dpkg -i myapp_1.0.0_arm64.deb
```

---

## Selection Guide

| Platform | App Type | Language | Distribution |
|----------|----------|----------|-------------|
| Android TV / Google TV | Streaming, gaming, info | Kotlin/Java | Google Play |
| Apple TV | Streaming, fitness, gaming | Swift | App Store |
| Samsung Tizen TV | Streaming, gaming | C# / Web (JS) | Samsung Apps |
| LG webOS TV | Streaming, gaming | JavaScript (Web) | LG Content Store |
| CarPlay | Navigation, audio, messaging | Swift | App Store (entitlement required) |
| Android Auto | Navigation, audio, messaging | Kotlin/Java | Google Play |
| Raspberry Pi | Kiosk, signage, IoT | Any | .deb / direct install |
