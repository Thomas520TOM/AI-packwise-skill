# HarmonyOS Build Sub-Skill

Build and publish Huawei HarmonyOS / OpenHarmony applications.

**Current version**: HarmonyOS NEXT 5.0 / DevEco Studio 5.x (2025-2026)

## When to Use

- Huawei ecosystem apps (phones, tablets, watches, smart screens, cars)
- HarmonyOS NEXT (no longer Android-compatible, uses ArkTS/ArkUI)
- OpenHarmony (open-source base for other OEMs)
- Smart home / IoT integration with HiLink

## Prerequisites

- DevEco Studio 5.x (Huawei official IDE, based on IntelliJ)
- Huawei developer account (free): developer.huawei.com
- HarmonyOS NEXT SDK (API 12+)
- Huawei device or emulator

## Key Architecture

```
HarmonyOS NEXT (API 12+)
├── ArkTS (TypeScript-like language)     ← Primary language
├── ArkUI (declarative UI framework)     ← UI framework
├── ArkCompiler                          ← AOT compilation
├── AbilityKit                           ← App lifecycle
├── ArkData                              ← Data management
└── HarmonyOS Design System              ← UI components
```

**Important**: HarmonyOS NEXT is **NOT** Android-compatible. Existing Android APKs will NOT run. Apps must be rebuilt with ArkTS/ArkUI.

## Project Structure

```
entry/
├── src/main/
│   ├── ets/                            ← ArkTS source code
│   │   ├── entryability/
│   │   │   └── EntryAbility.ets        ← App entry point
│   │   ├── pages/
│   │   │   └── Index.ets               ← Main page
│   │   └── common/
│   ├── resources/                       ← Resources (images, strings)
│   └── module.json5                     ← Module configuration
├── oh-package.json5                     ← Package configuration
└── build-profile.json5                  ← Build configuration
```

## Build

```bash
# DevEco Studio: Build → Build Hap(s)/APP(s)
# Command line:
hvigorw assembleHap --mode module -p module=entry

# Build APP (multi-module bundle)
hvigorw assembleApp --mode project

# Output:
# entry/build/default/outputs/default/entry-default-signed.hap
# build/default/outputs/default/MyApp-default-signed.app
```

## Signing

```bash
# 1. Generate signing key in DevEco Studio:
#    File → Project Structure → Signing Configs → Add
# 2. Or generate manually:
keytool -genkeypair -alias myAppKey -keyalg RSA -keysize 2048 \
  -keystore myApp.p12 -storetype PKCS12 -validity 36500

# 3. Configure in build-profile.json5
{
  "signingConfigs": [{
    "name": "default",
    "material": {
      "storeFile": "myApp.p12",
      "storePassword": "***",
      "keyAlias": "myAppKey",
      "keyPassword": "***",
      "signAlg": "SHA256withECDSA"
    }
  }]
}
```

## Publishing

| Step | Description |
|------|-------------|
| 1. Register developer | developer.huawei.com (free) |
| 2. Create application | AppGallery Connect → My Apps |
| 3. Configure app info | Name, description, category, privacy policy |
| 4. Sign APP | DevEco Studio generates signing |
| 5. Build HAP/APP | DevEco Studio or hvigorw |
| 6. Upload to AGC | AppGallery Connect console |
| 7. Submit review | Typically 1–3 days |

## HarmonyOS NEXT vs HarmonyOS 3.x/4.x

| Feature | HarmonyOS NEXT (5.0) | HarmonyOS 3.x/4.x |
|---------|---------------------|-------------------|
| Android compatibility | No (pure ArkTS) | Yes (APK support) |
| Language | ArkTS only | Java/ArkTS |
| UI Framework | ArkUI | Java UI + ArkUI |
| Min API | 12 | 7–9 |
| Distribution | HAP/APP | HAP/APP + APK |

## ArkTS Quick Start

```typescript
// pages/Index.ets
@Entry
@Component
struct Index {
  @State message: string = 'Hello HarmonyOS'

  build() {
    Column() {
      Text(this.message)
        .fontSize(30)
        .fontWeight(FontWeight.Bold)
      Button('Click Me')
        .onClick(() => {
          this.message = 'Hello World!'
        })
        .margin({ top: 20 })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| APK not working on NEXT | HarmonyOS NEXT requires ArkTS rewrite; no Android compatibility |
| Signing failure | Configure signing in DevEco Studio; check certificate validity |
| API incompatibility | Check HarmonyOS API version in module.json5 |
| Emulator slow | Use Remote Device (real Huawei devices in cloud) |
| Build error: hvigorw not found | Set DevEco Studio SDK path; run from project root |
| App rejected by store | Ensure privacy policy URL; comply with Huawei review guidelines |
| Third-party library unavailable | Check OpenHarmony registry (ohpm.openharmony.cn) |
