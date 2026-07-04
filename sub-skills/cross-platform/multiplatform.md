# Cross-Platform Multiplatform Build Sub-Skill

Build apps targeting multiple platforms from a single codebase using .NET MAUI, Kotlin Multiplatform, or similar frameworks.

**Current version**: .NET 9 / MAUI 9 / Kotlin 2.0 / KMP (2025-2026)

## When to Use

- Need iOS + Android + Desktop + Web from one codebase
- Team has C#/.NET or Kotlin experience
- Want to share business logic across platforms while keeping native UI
- Enterprise/internal apps where development speed matters more than pixel-perfect native UI

## Framework Comparison

| Feature | .NET MAUI 9 | Kotlin Multiplatform (KMP) | Compose Multiplatform |
|---------|------------|---------------------------|----------------------|
| Language | C# | Kotlin | Kotlin |
| UI approach | Single UI (native controls) | Shared logic, native UI | Shared UI (Compose) |
| Platforms | iOS, Android, Windows, macOS | iOS, Android, Web, Desktop | iOS, Android, Desktop, Web |
| Maturity | Stable (since .NET 7) | Stable (since KMP 1.9) | Beta (iOS) / Stable (Desktop) |
| Shared code | 100% (including UI) | 60–80% (logic only) | 80–95% (including UI) |
| Performance | Near-native | Native (compiled per platform) | Near-native |
| Best for | .NET teams, enterprise | Max native feel + shared logic | Kotlin teams, cross-platform UI |

## .NET MAUI

### Prerequisites

```bash
# Install .NET 9 SDK
# https://dotnet.microsoft.com/download

# Install MAUI workload
dotnet workload install maui

# Verify
dotnet --list-sdks
dotnet workload list
```

### Build

```bash
# Create project
dotnet new maui -n MyApp
cd MyApp

# Build for Android
dotnet build -f net9.0-android -c Release
# Output: bin/Release/net9.0-android/com.companyname.myapp-Signed.apk

# Build for iOS (macOS only)
dotnet build -f net9.0-ios -c Release
# Output: bin/Release/net9.0-ios/MyApp.ipa

# Build for Windows
dotnet build -f net9.0-windows10.0.19041.0 -c Release
# Output: bin/Release/net9.0-windows10.0.19041.0/win-x64/

# Build for macOS (macOS only)
dotnet build -f net9.0-maccatalyst -c Release
```

### Publish

```bash
# Android AAB (for Play Store)
dotnet publish -f net9.0-android -c Release /p:AndroidPackageFormat=aab

# Android APK
dotnet publish -f net9.0-android -c Release

# iOS (requires Apple Developer account + signing)
dotnet publish -f net9.0-ios -c Release /p:CodesignKey="Apple Distribution: ..." /p:CodesignProvision="MyApp Provisioning"

# Windows (MSIX for Store or sideloading)
dotnet publish -f net9.0-windows10.0.19041.0 -c Release /p:GenerateAppxPackageOnBuild=true
```

### Project Structure

```xml
<!-- MyApp.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFrameworks>net9.0-android;net9.0-ios;net9.0-windows10.0.19041.0;net9.0-maccatalyst</TargetFrameworks>
    <OutputType>Exe</OutputType>
    <ApplicationTitle>MyApp</ApplicationTitle>
    <ApplicationId>com.companyname.myapp</ApplicationId>
    <ApplicationDisplayVersion>1.0</ApplicationDisplayVersion>
    <ApplicationVersion>1</ApplicationVersion>
  </PropertyGroup>
</Project>
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Android build fails | Ensure Android SDK 34+ and JDK 17 installed; set `JAVA_HOME` |
| iOS signing error | Set up provisioning profile; use `dotnet build -p:CodesignKey=...` |
| Windows MSIX won't install | Enable Developer Mode; sign with trusted certificate |
| Hot Reload not working | Use Visual Studio 2022 17.8+; ensure `net9.0` target |
| Memory leaks | Dispose `IDisposable` resources; avoid circular event subscriptions |
| Platform-specific code | Use `#if ANDROID` / `#if IOS` / `#if WINDOWS` conditional compilation |

## Kotlin Multiplatform (KMP)

### Prerequisites

```bash
# Android Studio with KMP plugin
# Kotlin 2.0+ (included in Android Studio 2024.2+)

# For iOS: Xcode 15+, CocoaPods
```

### Project Structure

```
my-kmp-app/
├── shared/                    # Shared Kotlin code
│   ├── src/
│   │   ├── commonMain/        # Shared code (all platforms)
│   │   ├── androidMain/       # Android-specific
│   │   ├── iosMain/           # iOS-specific
│   │   └── commonTest/        # Shared tests
│   └── build.gradle.kts
├── androidApp/                # Android app (thin shell)
│   └── build.gradle.kts
├── iosApp/                    # iOS app (Xcode project)
│   └── iosApp.xcodeproj
└── build.gradle.kts
```

### Build Configuration

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    id("com.android.library")
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = "17"
            }
        }
    }

    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        it.binaries.framework {
            baseName = "shared"
            isStatic = true
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
            implementation("io.ktor:ktor-client-core:2.3.12")
            implementation("io.ktor:ktor-client-content-negotiation:2.3.12")
            implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.12")
        }
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-okhttp:2.3.12")
        }
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:2.3.12")
        }
    }
}
```

### Build

```bash
# Build shared framework for iOS
./gradlew :shared:linkDebugFrameworkIosArm64
./gradlew :shared:linkReleaseFrameworkIosArm64

# Build Android
./gradlew :androidApp:assembleDebug
./gradlew :androidApp:assembleRelease

# Run all tests
./gradlew :shared:allTests
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| iOS framework not found in Xcode | Ensure framework path is set in Xcode Build Settings |
| Coroutine crash on iOS | Use `Dispatchers.Main` on iOS; wrap suspend calls in `@MainActor` |
| Serialization fails on iOS | Ensure `kotlinx-serialization` plugin is applied in shared module |
| Slow iOS builds | Use Simulator for development; `linkDebugFramework` caches better |
| Platform-specific API access | Use `expect`/`actual` declarations |

## expect/actual Pattern (KMP)

```kotlin
// commonMain: declare expected API
expect class PlatformContext
expect fun getPlatformName(): String

// androidMain: implement
actual class PlatformContext(val context: android.content.Context)
actual fun getPlatformName(): String = "Android ${android.os.Build.VERSION.SDK_INT}"

// iosMain: implement
actual class PlatformContext
actual fun getPlatformName(): String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
```

## CI/CD — GitHub Actions (KMP)

```yaml
name: KMP Build
on:
  push:
    branches: [main]

jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: ./gradlew :androidApp:assembleRelease

  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./gradlew :shared:linkReleaseFrameworkIosArm64
      - run: |
          cd iosApp
          xcodebuild -scheme iosApp -configuration Release -sdk iphoneos -archivePath build/MyApp.xcarchive archive
```
