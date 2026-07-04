# Game Development Build Sub-Skill

For indie games and small game studios. Covers Unity, Unreal Engine, and Godot across desktop, mobile, web, and console platforms.

**Current versions**: Unity 6 (6000.x) / Unreal Engine 5.5 / Godot 4.4 (2025-2026)

---

## Unity Build

### When to Use

2D/3D indie games, cross-platform (desktop + mobile + web + console), small-to-medium teams, AR/VR applications

### Build Flow

```
File → Build Settings → Select Platform → Player Settings → Build
```

### Player Settings

| Setting | Windows | macOS | Linux | Android | iOS | WebGL |
|---------|---------|-------|-------|---------|-----|-------|
| Scripting Backend | IL2CPP | IL2CPP | IL2CPP | IL2CPP | IL2CPP | IL2CPP |
| Architecture | x64 + ARM64 | Universal | x64 + ARM64 | ARM64 | ARM64 | N/A |
| Compression | LZ4HC | LZ4HC | LZ4HC | LZ4HC | LZ4HC | Brotli |
| API Compat. | .NET Standard 2.1 | .NET Standard 2.1 | .NET Standard 2.1 | .NET Standard 2.1 | .NET Standard 2.1 | .NET Standard 2.1 |

### IL2CPP vs Mono

| Feature | IL2CPP | Mono |
|---------|--------|------|
| Performance | Better (AOT compilation) | Standard (JIT) |
| Build speed | Slow | Fast |
| Package size | Larger | Smaller |
| Debugging | Limited | Full |
| Platform support | All | Limited (no iOS JIT) |
| **Recommendation** | Release builds | Development/debug |

### Command Line Build

```bash
# Windows
Unity -batchmode -nographics -projectPath . -buildTarget StandaloneWindows64 -executeMethod BuildScript.BuildWindows -quit

# macOS
Unity -batchmode -nographics -projectPath . -buildTarget StandaloneOSX -executeMethod BuildScript.BuildMac -quit

# Linux
Unity -batchmode -nographics -projectPath . -buildTarget StandaloneLinux64 -executeMethod BuildScript.BuildLinux -quit

# Android (APK)
Unity -batchmode -nographics -projectPath . -buildTarget Android -executeMethod BuildScript.BuildAndroid -quit

# Android (AAB for Play Store)
Unity -batchmode -nographics -projectPath . -buildTarget Android -executeMethod BuildScript.BuildAndroidAAB -quit

# iOS (generates Xcode project, requires Mac to finalize)
Unity -batchmode -nographics -projectPath . -buildTarget iOS -executeMethod BuildScript.BuildiOS -quit

# WebGL
Unity -batchmode -nographics -projectPath . -buildTarget WebGL -executeMethod BuildScript.BuildWebGL -quit
```

```csharp
// Editor/BuildScript.cs
using UnityEditor;
using UnityEditor.Build.Reporting;
using System.Linq;

public static class BuildScript
{
    static string[] GetScenes() =>
        EditorBuildSettings.scenes.Where(s => s.enabled).Select(s => s.path).ToArray();

    public static void BuildWindows()
    {
        var report = BuildPipeline.BuildPlayer(GetScenes(), "build/Windows/MyGame.exe",
            BuildTarget.StandaloneWindows64, BuildOptions.None);
        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception("Build failed");
    }

    public static void BuildAndroid()
    {
        EditorUserBuildSettings.buildAppBundle = false;
        var report = BuildPipeline.BuildPlayer(GetScenes(), "build/Android/MyGame.apk",
            BuildTarget.Android, BuildOptions.None);
        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception("Build failed");
    }

    public static void BuildAndroidAAB()
    {
        EditorUserBuildSettings.buildAppBundle = true;
        var report = BuildPipeline.BuildPlayer(GetScenes(), "build/Android/MyGame.aab",
            BuildTarget.Android, BuildOptions.None);
        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception("Build failed");
    }

    public static void BuildiOS()
    {
        var report = BuildPipeline.BuildPlayer(GetScenes(), "build/iOS",
            BuildTarget.iOS, BuildOptions.None);
        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception("Build failed");
    }
}
```

### Addressables (Asset Management)

```bash
# Install Addressables package
# Window → Package Manager → Addressables

# Build addressable content
AddressableAssetSettings.BuildPlayerContent()

# Use for: DLC, on-demand loading, reduce initial download
```

### Unity Mobile Builds

#### Android

```bash
# Prerequisites: JDK 17, Android SDK 34+, NDK r23b+
# Edit → Preferences → External Tools → set JDK/SDK/NDK paths

# Build settings:
# - Minimum API Level: 24 (Android 7.0)
# - Target API Level: 34
# - Scripting Backend: IL2CPP
# - Target Architectures: ARM64 (check ARMv7 for older devices)
```

#### iOS

```bash
# Requires macOS + Xcode
# Build generates Xcode project in build/iOS/

cd build/iOS
xcodebuild -scheme Unity-iPhone -configuration Release -sdk iphoneos archive -archivePath build/MyGame.xcarchive

# TestFlight:
# Xcode → Archive → Distribute App → App Store Connect → Upload
```

### Steam Integration

```csharp
using Steamworks;

void Start() {
    if (!SteamAPI.Init()) {
        Debug.LogError("Steam init failed");
        return;
    }
    // Achievements, leaderboards, cloud saves, workshop
}
```

```bash
# Steamworks SDK setup:
# 1. Download Steamworks SDK from partner.steamgames.com
# 2. Place steam_appid.txt in project root (contains your App ID)
# 3. Upload via Steamworks Depot or steamcmd
```

### Steam / itch.io / Epic Games Store

| Platform | Upload Method | Fee | Revenue Share |
|----------|--------------|-----|---------------|
| Steam | Steamworks SDK / SteamPipe | $100 per game | 70% (30% to Valve, drops to 75/25 after $10M) |
| itch.io | Web upload | Free / pay what you want | You set the share (default 0%) |
| Epic Games Store | Epic Dev Portal | Free | 88% (12% to Epic) |
| GOG | GOG Galaxy partner | Free | 70% |

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| IL2CPP build failure | Install Visual Studio Build Tools; check C++ compiler path |
| Too many shader variants | Use Shader Stripping (Project Settings → Graphics) |
| Large package | Addressables for on-demand loading; strip unused engines |
| Black screen on start | Check Graphics API priority (Vulkan/OpenGL/Metal) |
| Android build: "Unable to find unity activity" | Check Player Settings → Minimum API Level ≥ 24 |
| iOS build: "Signing requires a development team" | Set Team ID in Xcode; requires Apple Developer account |
| WebGL memory crash | Reduce texture sizes; use `WebGLMemorySize` setting |
| Steam overlay not working | Ensure `steam_appid.txt` in build directory; test outside Unity Editor |

---

## Unreal Engine Build

### When to Use

AAA-quality 3D graphics, realistic rendering (Lumen/Nanite), multiplayer (dedicated servers), small-to-medium teams with 3D experience

### Build Flow

```
Platforms → [Target Platform] → Package Project
```

### Command Line Build

```bash
# Build editor and game
UnrealBuildTool.exe MyGame Win64 Development -Project="C:/MyGame/MyGame.uproject" -WaitMutex -FromMsBuild

# Package for Windows
RunUAT.bat BuildCookRun -project="C:/MyGame/MyGame.uproject" -noP4 -platform=Win64 -configuration=Shipping -cook -build -stage -pak -archive -archivedirectory="C:/MyGame/build"

# Package for Linux
RunUAT.bat BuildCookRun -project="C:/MyGame/MyGame.uproject" -noP4 -platform=Linux -configuration=Shipping -cook -build -stage -pak -archive -archivedirectory="C:/MyGame/build"

# Package for Android
RunUAT.bat BuildCookRun -project="C:/MyGame/MyGame.uproject" -noP4 -platform=Android -configuration=Shipping -cook -build -stage -pak -archive -archivedirectory="C:/MyGame/build"

# Package for iOS
RunUAT.bat BuildCookRun -project="C:/MyGame/MyGame.uproject" -noP4 -platform=IOS -configuration=Shipping -cook -build -stage -pak -archive -archivedirectory="C:/MyGame/build"
```

### Platform Configuration

| Platform | Min Specs | Key Settings |
|----------|-----------|-------------|
| Windows | Win10 x64, DX12 GPU | RHI: DirectX 12; Ray Tracing (optional) |
| Linux | Ubuntu 22.04+ | Vulkan RHI; install `libc++1` |
| Android | API 29+, Vulkan GPU | Android SDK 34, NDK r25b; Vulkan ES 3.1 |
| iOS | iOS 16+, A12+ chip | Metal RHI; Xcode 15+ |
| macOS | macOS 13+, M1+ | Metal RHI; Xcode 15+ |

### Key Build Concepts

| Concept | Description |
|---------|-------------|
| **Cook** | Process assets into platform-specific formats |
| **Stage** | Copy cooked content + binaries to staging directory |
| **Package** | Create distributable build (.exe/.apk/.ipa) |
| **Pak** | Pack content into `.pak` files for distribution |
| **Shipping** | Final build config: no debug, fully optimized, no console |

### Optimization

| Technique | Description |
|-----------|-------------|
| **Nanite** | Virtualized geometry (millions of polygons, auto-LOD) |
| **Lumen** | Global illumination + reflections (software or hardware ray tracing) |
| **World Partition** | Stream large worlds in cells |
| **Level Streaming** | Load/unload levels dynamically |
| **Texture Streaming** | Load textures on demand |
| **Shader Permutation Reduction** | Reduce shader compile time and package size |

### Steam Integration (UE5)

```cpp
// DefaultEngine.ini
[OnlineSubsystem]
DefaultPlatformService=Steam

[OnlineSubsystemSteam]
bEnabled=true
SteamDevAppId=480  // Replace with your App ID

[/Script/Engine.GameEngine]
+NetDriverDefinitions=(DefName="GameNetDriver",DriverClassName="OnlineSubsystemSteam.SteamNetDriver",DriverClassNameFallback="OnlineSubsystemUtils.IpNetDriver")
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Build takes hours | Enable `Editor → Cook on the Fly`; use SSD; increase `MaxParallelActions` |
| Package too large (10GB+) | Use Pak file compression; remove unused plugins; reduce texture quality levels |
| Android Vulkan crash | Test on target device; set minimum GPU feature level |
| iOS provisioning error | Set Team ID in Project Settings → Platforms → iOS → Signing |
| Shader compilation takes forever | Enable Shader Pipeline Caching; pre-compile shaders |
| Linux missing .so files | Include Vulkan validation layers; install system dependencies |
| Memory crash on mobile | Reduce texture resolution; disable Lumen on mobile; use software ray tracing |

---

## Godot Build

### When to Use

2D indie games, lightweight 3D, free and open source, low learning curve, rapid prototyping

### Export Flow

```
Project → Export → Select Platform → Configure → Export Project
```

### Command Line Export

```bash
# Desktop
godot --headless --export-release "Windows Desktop" build/Windows/MyGame.exe
godot --headless --export-release "macOS" build/macOS/MyGame.dmg
godot --headless --export-release "Linux/X11" build/Linux/MyGame.x86_64

# Mobile
godot --headless --export-release "Android" build/Android/MyGame.apk
godot --headless --export-release "iOS" build/iOS/MyGame.ipa

# Web
godot --headless --export-release "Web" build/Web/

# Debug builds (with remote debugging)
godot --headless --export-debug "Windows Desktop" build/MyGame-debug.exe
```

### Platform Export Configuration

| Platform | Export Preset | Key Settings |
|----------|--------------|-------------|
| Windows | Windows Desktop | Architecture: x86_64; Embed PCK: on |
| macOS | macOS | Code signing identity; Bundle identifier |
| Linux | Linux/X11 | Architecture: x86_64 or arm64 |
| Android | Android | Min SDK 24, Target SDK 34; Keystore; Gradle build |
| iOS | iOS | Team ID; Bundle identifier; Provisioning profile |
| Web | Web | Export type: Regular (WASM); Headless: off |

### Android Export Setup

```bash
# Prerequisites: JDK 17, Android SDK 34+, Gradle 8.x

# In Godot Editor:
# Editor → Manage Export Templates → Download
# Export → Android → Set:
#   - Min SDK: 24
#   - Target SDK: 34
#   - Keystore: path to debug.keystore or release keystore
#   - Gradle Build: Use Gradle Build (recommended)
```

### iOS Export Setup

```bash
# Requires macOS + Xcode 15+
# In Godot Editor → Export → iOS:
#   - Team ID: your Apple Developer Team ID
#   - Bundle Identifier: com.yourcompany.mygame
#   - Provisioning Profile: automatic

# After export, open .xcodeproj in Xcode:
# Product → Archive → Distribute to TestFlight/App Store
```

### Web Export Notes

```bash
# Web export generates:
# - index.html
# - MyGame.wasm
# - MyGame.pck (game data)
# - MyGame.js (loader)

# Hosting requirements:
# - Server must send correct MIME type: application/wasm
# - CORS headers: Cross-Origin-Opener-Policy: same-origin
# - Cross-Origin-Embedder-Policy: require-corp
# (Required for SharedArrayBuffer / threads)

# nginx config:
location ~* \.wasm$ { types { application/wasm wasm; } }
add_header Cross-Origin-Opener-Policy "same-origin";
add_header Cross-Origin-Embedder-Policy "require-corp";
```

### GDScript vs C#

| Feature | GDScript | C# |
|---------|---------|-----|
| Performance | Standard | Better (for complex logic) |
| Package size | Smaller | Larger (needs .NET runtime) |
| Learning curve | Low | Medium |
| Ecosystem | Godot native | .NET ecosystem |
| Web export | Full support | Limited (.NET WASM overhead) |
| **Recommendation** | 2D games, rapid prototyping | 3D games, C#-experienced teams |

### itch.io Publishing

```bash
# 1. Export as HTML5 (Web) or Windows/macOS/Linux
# 2. Zip the build output
# 3. Upload to itch.io project page
# 4. Set "This file will be played in the browser" for HTML5
# 5. Set viewport size to match your game resolution
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Export template missing | Editor → Manage Export Templates → Download |
| macOS signing | Configure signing identity + entitlements in Export settings |
| C# build failure | Install correct .NET SDK version (8.0+); `dotnet build` first |
| Android build: Gradle error | Check JDK 17; Android SDK path in Editor Settings |
| Web export: blank screen | Check browser console; ensure .wasm MIME type is set |
| Web export: SharedArrayBuffer error | Set COOP/COEP headers on web server |
| Large .pck file | Compress textures; use OGG Vorbis for audio; remove unused resources |
| Touch input not working (mobile) | Enable Touch input in Project Settings → Input Devices |

---

## Engine Selection Guide

| Scenario | Recommended Engine | Why |
|----------|-------------------|-----|
| 2D indie game | Godot | Free, lightweight, fast iteration |
| 2D/3D cross-platform | Unity | Most mature cross-platform pipeline |
| AAA-quality 3D | Unreal Engine | Nanite, Lumen, best-in-class rendering |
| Mobile-first game | Unity | Best mobile tooling and performance |
| Web game | Godot or Unity | Both have good WASM support |
| AR/VR application | Unity or Unreal | Unity: mobile VR; Unreal: PC VR |
| Multiplayer game | Unreal Engine | Built-in dedicated server, replication |
| Game jam / prototype | Godot | Zero cost, fastest setup |
| Learning game dev | Godot or Unity | GDScript/C# easier than C++ |
| Console publishing | Unity or Unreal | Both have official console SDK support |

---

## Universal Game Packaging Checklist

1. **Test on target hardware** — not just the development machine
2. **Strip debug symbols** — reduces package size 30–50%
3. **Compress textures** — ASTC (mobile), BC7 (desktop), BPTC (VR)
4. **Audio format** — OGG Vorbis (small), WAV (quality-critical SFX)
5. **Shader compilation** — pre-compile for target platform to avoid runtime stutters
6. **Save system** — test save/load across app updates
7. **Input handling** — support keyboard+mouse, gamepad, and touch where applicable
8. **Localization** — use engine's i18n system; test text overflow
9. **Platform-specific** — achievements, leaderboards, cloud saves per platform
10. **Legal** — EULA, privacy policy, age rating (IARC for stores)
