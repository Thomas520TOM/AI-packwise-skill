# Car Infotainment Build Sub-Skill

Build applications for automotive infotainment systems: Android Automotive OS, QNX, AGL (Automotive Grade Linux), and HarmonyOS Car.

**Current versions**: Android Automotive 14 / QNX 8.0 / AGL UCB 16 (2025-2026)

## When to Use

- In-vehicle infotainment (IVI) systems
- Digital instrument clusters
- Heads-up display (HUD) applications
- Rear-seat entertainment
- Telematics and fleet management
- EV charging station UI

## Platform Comparison

| Platform | Base OS | Language | Market Share | Best For |
|----------|---------|----------|-------------|---------|
| Android Automotive OS (AAOS) | Android 14 | Kotlin/Java | Growing fast | Mass-market vehicles (Volvo, GM, Ford, Honda) |
| QNX | QNX Neutrino RTOS | C/C++ | Largest (safety-critical) | Instrument clusters, safety systems |
| AGL | Linux | C/C++, HTML5/JS | Growing (open-source) | Custom IVI, fleet vehicles |
| HarmonyOS Car | HarmonyOS | ArkTS | China market | Huawei ecosystem vehicles |
| webOS Auto | Linux | JavaScript | Niche | LG-based IVI systems |
| Custom Linux (Yocto) | Linux | C/C++/Qt/QML | Many | Full control, custom hardware |

---

## Android Automotive OS (AAOS)

### Key Differences from Android Mobile

| Feature | Android Mobile | Android Automotive |
|---------|---------------|-------------------|
| Display | Single screen | Multiple displays (IVI, cluster, HUD) |
| Input | Touch, voice | Touch, rotary controller, steering wheel, voice |
| Audio | Single zone | Multi-zone (driver, passenger, rear) |
| Lifecycle | Phone lifecycle | Vehicle lifecycle (10+ years) |

### Build

```kotlin
// build.gradle.kts
android {
    defaultConfig {
        minSdk = 28
        targetSdk = 34
    }
}

dependencies {
    implementation("androidx.car.app:app:1.7.0")
    implementation("androidx.media3:media3-session:1.5.0")
}
```

```xml
<manifest>
    <uses-feature android:name="android.hardware.type.automotive" android:required="true" />
    <application>
        <service android:name=".MyCarService" android:exported="true">
            <intent-filter>
                <action android:name="android.car.app.CarAppService" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

```bash
./gradlew assembleRelease
# Test with Android Automotive emulator in Android Studio
```

---

## QNX (Safety-Critical)

- **Microkernel RTOS** — deterministic real-time behavior
- **Safety certified** — ISO 26262 ASIL-D, IEC 61508 SIL-3
- **Used by**: BlackBerry QNX, deployed in 200M+ vehicles

```bash
# Cross-compile from Linux/macOS host
qcc -Vgcc_ntoaarch64le -o myapp myapp.c -lGL -lEGL

# Build with CMake
cmake -DCMAKE_TOOLCHAIN_FILE=qnx-aarch64.cmake ..
make
```

---

## AGL (Automotive Grade Linux)

```bash
# AGL uses Yocto/BitBake build system
repo init -u https://gerrit.automotivelinux.org/gerrit/AGL/AGL-repo
repo sync

source meta-agl/scripts/aglsetup.sh -m qemux86-64 -b build agl-demo agl-appfw-smack
bitbake agl-demo-platform
```

---

## Selection Guide

| Project Type | Recommended Platform |
|-------------|---------------------|
| Consumer car IVI | Android Automotive |
| Instrument cluster | QNX |
| Fleet management | AGL or custom Linux |
| Chinese market vehicle | HarmonyOS Car |
| Research/prototype | AGL or Raspberry Pi + custom |
| Motorcycle/scooter IVI | Custom Linux (Yocto/Buildroot) |

## Universal Car Software Packaging Checklist

1. **Driver distraction** — no interactive content while vehicle is moving
2. **Startup time** — must be < 2 seconds
3. **Temperature range** — test at -40°C to +85°C
4. **Long lifecycle** — support for 10+ years
5. **OTA updates** — must support over-the-air updates
6. **Multi-display** — support IVI + instrument cluster + HUD
7. **Audio zones** — separate audio for driver vs passenger
8. **Safety compliance** — ASIL rating if interacting with vehicle systems
9. **Power management** — handle ignition on/off, sleep/wake gracefully
10. **CAN bus integration** — vehicle data via CAN
