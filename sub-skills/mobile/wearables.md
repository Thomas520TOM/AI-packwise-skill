# Wearable App Build Sub-Skill

Build apps for smartwatches and wearable devices: Apple watchOS, Google Wear OS, Samsung Galaxy Watch, Xiaomi Band/Vela OS.

**Current versions**: watchOS 11 / Xcode 16 / Wear OS 5 / Galaxy Watch (One UI Watch 6) (2025-2026)

## When to Use

- Health/fitness tracking apps
- Companion apps for phone/desktop applications
- Smartwatch face customization
- Quick interaction widgets (notifications, payments, messaging)
- Industrial wearables (factory, logistics, medical)

---

## Apple watchOS

### When to Use

- iPhone companion apps (WatchKit)
- Standalone Apple Watch apps (watchOS 7+)
- Health/fitness with HealthKit integration

### Prerequisites

- macOS 14+ with Xcode 16 (free from App Store)
- Apple Developer account ($99/year)
- Apple Watch Series 4+ (for testing; Simulator available for basic testing)

### Build & Package

```bash
# Create watchOS target in existing Xcode project
# File → New → Target → watchOS → Watch App

# Standalone watchOS app (no iPhone required):
# In Watch App target → General → Deployment Info → check "Supports Running Without iPhone App to Companion App"

# Build
xcodebuild -scheme MyApp-Watch -configuration Release -sdk watchos -archivePath build/MyApp.xcarchive archive

# Archive → Distribute → App Store Connect → Upload
```

### watchOS Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   iPhone App        │ ←──→│   Watch App         │
│   (iOS)             │     │   (watchOS)         │
│                     │     │                     │
│ - Full features     │ WCSession / WatchConnectivity
│ - Heavy processing  │     │ - Quick interactions │
│ - Data storage      │     │ - HealthKit         │
└─────────────────────┘     │ - Complications     │
                            │ - Watch faces       │
                            └─────────────────────┘
```

### Key Frameworks

| Framework | Purpose |
|-----------|---------|
| SwiftUI | UI framework (required for new watchOS apps) |
| HealthKit | Health data (heart rate, steps, workouts) |
| WatchConnectivity | iPhone ↔ Watch communication |
| ClockKit/WidgetKit | Complications and watch face widgets |
| CoreML | On-device ML inference |
| PassKit | Apple Pay on Watch |

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Watch app won't install | Check deployment target ≥ watchOS 7; verify provisioning profile |
| HealthKit permission denied | Add `com.apple.developer.healthkit` entitlement; request permission at runtime |
| Complication not updating | Implement `getTimelineEndDate` and `getCurrentTimelineEntry` in WidgetKit |
| Communication fails | Check `WCSession.isSupported()` and `activationState == .activated` |
| App crashes on background | watchOS aggressively suspends; use `WKApplication.shared().scheduleBackgroundRefresh` |

---

## Google Wear OS

### When to Use

- Android companion apps
- Standalone Wear OS apps
- Samsung Galaxy Watch (Wear OS 4+)

### Prerequisites

- Android Studio with Wear OS SDK
- JDK 17
- Wear OS emulator or physical device

### Build & Package

```bash
# Create Wear OS module in existing Android project
# File → New → New Module → Wear OS → Wear OS App

# Build
cd wearos && ./gradlew assembleRelease
# Output: build/outputs/apk/release/wearos-release.apk

# For Play Store: Build App Bundle
./gradlew bundleRelease
# Output: build/outputs/bundle/release/wearos-release.aab
```

### Wear OS Architecture

```kotlin
// build.gradle.kts (Wear OS module)
android {
    defaultConfig {
        minSdk = 30  // Wear OS 3+
        targetSdk = 34
    }
}

dependencies {
    // Wear Compose (UI)
    implementation("androidx.wear.compose:compose-material:1.4.0")
    implementation("androidx.wear.compose:compose-foundation:1.4.0")
    // Tiles (persistent glanceable UI)
    implementation("androidx.wear.tiles:tiles:1.4.0")
    // Complications
    implementation("androidx.wear.watchface:watchface-complications-rendering:1.2.1")
    // Data sync with phone
    implementation("com.google.android.gms:play-services-wearable:18.2.0")
}
```

### Key Components

| Component | Purpose |
|-----------|---------|
| Compose for Wear OS | UI toolkit (Material Design for round screens) |
| Tiles | Persistent glanceable surfaces (like watch face complications) |
| Watch Face API | Custom watch face development |
| Data Layer API | Phone ↔ Watch data sync via Google Play Services |
| Health Services | Heart rate, step counter, exercise tracking |
| Ambient Mode | Low-power always-on display |

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| App rejected by Play Store | Ensure `android:hardware.type.watch` in manifest |
| Round screen layout issues | Use `Box` with `clipToCircle` modifier in Compose |
| Data sync not working | Check Google Play Services version on both devices |
| Battery drain | Use `AmbientMode` for always-on; minimize sensor polling |
| No physical device | Use Wear OS emulator in Android Studio (API 30+) |

---

## Samsung Galaxy Watch (One UI Watch)

### When to Use

- Galaxy Watch-specific features (Samsung Health, Bixby)
- Tizen legacy support (Watch 3 and earlier)
- Wear OS 4+ development (Watch 4+)

### Key Notes

- **Watch 4+**: Uses Wear OS (standard Android development)
- **Watch 3 and earlier**: Uses Tizen (Samsung's own OS)
- Samsung Health SDK for deep health integration
- Galaxy Watch Studio for watch face design (no code)

### Build for Tizen (Legacy)

```bash
# Tizen Studio
tizen build -t wearable -c llvm -C Debug
tizen package -t wgt -s certificate-profile
# Output: .wgt file for Samsung Galaxy Store
```

### Build for Wear OS (Watch 4+)

Same as Wear OS section above. Distribute via Google Play Store or Samsung Galaxy Store.

---

## Xiaomi Wearables (Mi Band / Xiaomi Watch / Vela OS)

### Key Notes

- **Mi Band**: Runs proprietary RTOS, uses Xiaomi Wear app
- **Xiaomi Watch**: Runs HyperOS (based on Android/Wear OS)
- **Vela OS**: Xiaomi's RTOS for IoT/wearable, based on NuttX
- **Development**: Limited SDK access; companion apps developed as Android/iOS apps
- **Xiaomi IoT SDK**: For smart home device integration

### Companion App Build

```bash
# Build as standard Android/iOS app
# Use Xiaomi Health SDK for health data
# Use Xiaomi IoT SDK for smart home control
```

---

## Selection Guide

| Target Device | Platform | Language | Distribution |
|--------------|----------|----------|-------------|
| Apple Watch | watchOS | Swift | App Store (iPhone companion or standalone) |
| Galaxy Watch 4+ | Wear OS | Kotlin | Google Play / Samsung Galaxy Store |
| Galaxy Watch 3- | Tizen | C# / web (Tizen .NET) | Samsung Galaxy Store |
| Pixel Watch | Wear OS | Kotlin | Google Play |
| Xiaomi Watch (HyperOS) | Android/Wear OS | Kotlin | GetApps / Google Play |
| Mi Band | Proprietary | N/A (companion app only) | Companion app on Android/iOS |

## Universal Wearable Packaging Checklist

1. **Test on physical device** — emulators don't replicate sensor behavior, battery, or screen shape
2. **Battery optimization** — minimize background processing; use ambient mode
3. **Screen shape** — support both round and rectangular displays
4. **Font size** — wearable screens are small; use dynamic type
5. **Touch targets** — minimum 48dp for finger tap
6. **Offline support** — watches frequently lose phone connection
7. **Complications/Tiles** — implement for quick glance access
8. **Accessibility** — VoiceOver (watchOS) / TalkBack (Wear OS)
