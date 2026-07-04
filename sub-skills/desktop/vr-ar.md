# VR/AR Application Build Sub-Skill

Build applications for virtual reality and augmented reality headsets.

**Current versions**: Meta Quest SDK v69+ / Apple visionOS 2 / SteamVR 2.x (2025-2026)

## When to Use

- VR games and experiences
- AR applications (mixed reality, passthrough)
- Enterprise VR training / simulation
- 3D visualization tools
- Spatial computing applications

---

## Meta Quest (Quest 3 / Quest Pro)

### When to Use

- Standalone VR (no PC required)
- Mixed reality / passthrough AR
- Most accessible VR platform (largest user base)
- Unity or Unreal Engine development

### Prerequisites

- Unity 6000+ with Android Build Support, OR Unreal Engine 5.4+
- Meta Quest Developer account (free): developer.oculus.com
- Meta Quest device or Meta Quest Developer Hub (emulator)

### Unity Build

```bash
# Install Meta XR SDK via Unity Package Manager:
# Window → Package Manager → + → Add package by name:
# com.meta.xr.sdk.all

# Player Settings:
# - XR Plug-in Management → Oculus (Android)
# - Minimum API Level: 29 (Android 10)
# - Target Architectures: ARM64
# - Scripting Backend: IL2CPP
# - Rendering: Vulkan

# Build
File → Build Settings → Android → Build
# Output: .apk file

# Sideload for testing
adb install MyGame.apk
```

```csharp
// Unity: Basic Quest setup
using UnityEngine;
using UnityEngine.XR;

public class QuestSetup : MonoBehaviour
{
    void Start()
    {
        // Check passthrough support (Quest 3/Pro)
        var passthrough = GetComponent<OVRPassthroughLayer>();
        if (passthrough != null)
        {
            passthrough.enabled = true; // Enable mixed reality
        }
    }
}
```

### Unreal Engine Build

```bash
# Install MetaXR plugin from Fab (Epic Games Marketplace)
# Project Settings → Platforms → Android:
# - Minimum SDK: 29
# - Target SDK: 34
# - Vulkan as default RHI

# Package
Platforms → Android → Package Project
```

### App Lab / Meta Quest Store

| Platform | Review Process | Time |
|----------|---------------|------|
| App Lab | Automated + light review | 2–7 days |
| Meta Quest Store | Manual curation | Weeks to months |
| Sideload (dev) | None (developer mode) | Instant |

---

## Apple Vision Pro (visionOS)

### When to Use

- Spatial computing applications
- Enterprise/professional AR tools
- Immersive media experiences
- SwiftUI-based 3D UI

### Prerequisites

- macOS 14+ with Xcode 15.2+
- Apple Developer account ($99/year)
- visionOS simulator (included in Xcode) or Vision Pro device

### Build

```swift
// SwiftUI app for visionOS
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .defaultSize(width: 400, height: 300) // Window dimensions in points

        // For immersive experiences:
        // ImmersiveSpace(id: "immersiveSpace") {
        //     ImmersiveView()
        // }
    }
}
```

```bash
# Build in Xcode
xcodebuild -scheme MyApp -destination "generic/platform=visionOS" -configuration Release archive -archivePath build/MyApp.xcarchive

# Or: Product → Archive → Distribute → App Store Connect
```

### visionOS App Types

| Type | Description | Framework |
|------|-------------|-----------|
| **Window** | 2D app in a floating window | SwiftUI |
| **Volume** | 3D content in a bounded space | RealityKit + SwiftUI |
| **Full Space** | Immersive experience, full environment takeover | RealityKit + ARKit |
| **Shared Space** | Multiple apps coexist | Default behavior |

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| No physical device for testing | Use visionOS Simulator in Xcode (M1+ Mac required) |
| App rejected for visionOS | Ensure UI adapts to spatial layout; test all window sizes |
| RealityKit model not loading | Use .usdz or .reality format; test with Reality Composer Pro |
| Performance issues | Use Level of Detail (LOD); limit draw calls to < 100 |
| Immersive space won't open | Request `com.apple.developer.developer-services.access` entitlement |

---

## SteamVR / PC VR

### When to Use

- High-fidelity PC VR games
- HTC Vive, Valve Index, Pimax headsets
- PC-tethered Meta Quest (Link/Air Link)

### Prerequisites

- Unity 6000+ with OpenXR plugin, OR Unreal Engine 5.4+
- SteamVR installed on target PC
- OpenXR-compatible headset

### Unity Build

```bash
# Install OpenXR Plugin:
# Window → Package Manager → OpenXR Plugin

# Player Settings:
# - XR Plug-in Management → OpenXR
# - Add interaction profiles: HTC Vive, Valve Index, Oculus Touch
# - Build Target: Windows x64

# Build as standard Windows build
File → Build Settings → PC → Build
```

### Unreal Engine Build

```bash
# Project Settings → Plugins → enable OpenXR
# Project Settings → Platforms → Windows → default to DirectX 12

# Package as standard Windows build
```

---

## AR (Mobile Augmented Reality)

### When to Use

- Phone/tablet AR applications
- AR filters and effects
- Indoor navigation
- Product visualization

### Platforms

| Platform | SDK | Supported Devices |
|----------|-----|-------------------|
| ARKit | Apple | iPhone 6s+, iPad (2017+) |
| ARCore | Google | Android 7.0+ with ARCore support |
| Vuforia | Cross-platform | Wide device support |
| 8th Wall | Web AR | Any smartphone browser |

### Unity AR Build

```bash
# Install AR Foundation:
# Window → Package Manager → AR Foundation + ARKit + ARCore

# Build for iOS (ARKit) and Android (ARCore) as standard mobile builds
```

---

## Selection Guide

| Scenario | Recommended Platform | Engine |
|----------|---------------------|--------|
| VR game (standalone) | Meta Quest | Unity |
| VR game (high-fidelity) | SteamVR (PC) | Unreal Engine |
| Mixed reality app | Meta Quest 3 / Vision Pro | Unity |
| Enterprise spatial app | Apple Vision Pro | Swift/RealityKit |
| Mobile AR | ARKit + ARCore | Unity AR Foundation |
| Web AR | 8th Wall | JavaScript |
| VR training simulation | Meta Quest or SteamVR | Unity |
| 3D product viewer | Web or mobile AR | Three.js / Unity |

## Universal VR/AR Packaging Checklist

1. **Frame rate** — maintain 90fps minimum (72fps Quest minimum); frame drops cause motion sickness
2. **Input handling** — support hand tracking AND controllers
3. **Comfort settings** — teleport locomotion option; vignette during movement
4. **Spatial audio** — 3D positional audio is essential for immersion
5. **Passthrough** — test mixed reality mode on Quest 3 / Vision Pro
6. **App Lab first** — launch on App Lab before pursuing Quest Store
7. **App Review guidelines** — Apple and Meta have strict VR/AR review requirements
8. **Performance profiling** — use OVR Metrics Tool (Quest) / Instruments (visionOS)
