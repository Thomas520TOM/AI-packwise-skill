# Android Native Build Sub-Skill

Build and publish Kotlin/Java native Android applications.

**Current version**: Android 15 (API 35) / AGP 8.7.x / Gradle 8.10+ / JDK 17 (2025-2026)

## When to Use

- Native Android applications (Kotlin recommended, Java supported)
- Apps requiring deep Android platform integration
- Apps published to Google Play, Huawei AppGallery, or Xiaomi GetApps

## Prerequisites

```bash
# JDK 17 (REQUIRED for AGP 8.x)
# Android Studio (includes JDK 17 bundled as JBR)
# OR: standalone JDK 17

# Android SDK 35 (via Android Studio SDK Manager)
# NDK (if using native code)

# Verify
java -version    # Should show 17.x
```

## Build

```bash
./gradlew assembleDebug       # Debug APK
./gradlew assembleRelease     # Release APK
./gradlew bundleRelease       # AAB (required by Google Play)
```

## Required Build Configuration (AGP 8.x)

```kotlin
// build.gradle.kts (app-level)
android {
    namespace = "com.example.myapp"    // REQUIRED since AGP 8.0 (replaces package in AndroidManifest)
    compileSdk = 35                     // Should match latest API level

    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 24                     // Android 7.0
        targetSdk = 35                  // REQUIRED: Google Play mandates API 35 as of 2025
        versionCode = 1
        versionName = "1.0.0"
    }
}
```

```xml
<!-- AndroidManifest.xml — REMOVE package attribute (AGP 8.x) -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- NO package="..." attribute here -->
</manifest>
```

### gradle.properties (Modern Defaults)

```properties
# gradle.properties
android.useAndroidX=true
android.nonTransitiveRClass=true
org.gradle.jvmargs=-Xmx4g -XX:+UseG1GC
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
```

## Signing (Secure Approach)

### Generate Upload Key

```bash
keytool -genkey -v -keystore upload-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

### Secure Signing Configuration

```kotlin
// build.gradle.kts — NEVER hardcode passwords
signingConfigs {
    create("release") {
        storeFile = file(System.getenv("KEYSTORE_PATH") ?: "../keystore/upload-key.jks")
        storePassword = System.getenv("KEYSTORE_PASSWORD") ?: ""
        keyAlias = System.getenv("KEY_ALIAS") ?: ""
        keyPassword = System.getenv("KEY_PASSWORD") ?: ""
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

### Play App Signing (Recommended)

Google Play App Signing separates the **upload key** (you hold) from the **signing key** (Google holds):

- **Upload key**: Signs your AAB before uploading. If lost, can be reset in Play Console.
- **Signing key**: Signs the final APK delivered to users. Google manages this securely.
- Enroll in Google Play Console → Release → Setup → App signing

## 16KB Page Alignment (Android 15 Requirement)

Android 15 devices may use 16KB memory pages. All native libraries (.so files) must be 16KB aligned.

```kotlin
// build.gradle.kts
android {
    packaging {
        jniLibs {
            pageAlignSharedLibs = true    // AGP 8.5+
        }
    }
}
```

```bash
# Check alignment
unzip -l app.apk | grep "\.so$"
```

**Apps without native code are NOT affected.**

## Network Security Config

```xml
<!-- res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

```xml
<!-- AndroidManifest.xml -->
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
```

## Android Keystore (Runtime Key Storage)

For storing sensitive data at runtime (tokens, credentials), use Android Keystore — NOT JKS files:

```kotlin
// EncryptedSharedPreferences (recommended for key-value storage)
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context, "secret_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

## Foreground Service Types (Android 14+)

Starting with Android 14 (API 34), every foreground service MUST declare a type:

```xml
<service
    android:name=".MyService"
    android:foregroundServiceType="dataSync" />
```

Valid types: `camera`, `connectedDevice`, `dataSync`, `health`, `location`, `mediaPlayback`, `microphone`, `phoneCall`, `shortService`, `specialUse`.

## Permissions Policy

```xml
<!-- Android 13+ notification permission -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Android 13+ granular media permissions (replaces READ_EXTERNAL_STORAGE) -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

<!-- Use system photo picker instead of READ_MEDIA_IMAGES when possible -->
<!-- No permission needed: ActivityResultContracts.PickVisualMedia() -->
```

## Store Publishing Checklist

| Step | Description |
|------|-------------|
| 1. Register developer | Google Play ($25 one-time), Huawei (free), Xiaomi (free) |
| 2. Generate signed AAB | `./gradlew bundleRelease` |
| 3. Privacy policy | Required URL — must be accessible without login |
| 4. Data Safety section | Declare all data collection in Play Console (Mandatory) |
| 5. Data deletion | Apps with account creation MUST provide data deletion option |
| 6. App icon | 512x512 PNG |
| 7. Screenshots | Phone + tablet |
| 8. Description | App name, short description, full description |
| 9. Content rating | IARC rating questionnaire |
| 10. Target SDK | Must be API 35 (as of 2025/2026) |
| 11. Submit review | Google Play typically 1–3 days |

## Build Optimization

### ABI Splits (Reduce APK Size)

```kotlin
// build.gradle.kts
android {
    splits {
        abi {
            isEnable = true
            reset()
            include("arm64-v8a", "armeabi-v7a", "x86_64")
            isUniversalApk = false
        }
    }
}
```

### R8 Code Shrinking

```kotlin
// build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

### Build Variant Management

```kotlin
// build.gradle.kts
android {
    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"
            versionNameSuffix = "-dev"
        }
        create("staging") {
            dimension = "env"
            applicationIdSuffix = ".staging"
        }
        create("prod") {
            dimension = "env"
        }
    }
}
```

## CI/CD — GitHub Actions

```yaml
name: Android Build
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Decode Keystore
        run: echo "${{ secrets.RELEASE_KEYSTORE_BASE64 }}" | base64 --decode > app/release.jks
      - name: Build AAB
        env:
          KEYSTORE_PATH: release.jks
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: ./gradlew bundleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: aab
          path: app/build/outputs/bundle/release/*.aab
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| "Namespace not specified" | Add `namespace = "com.example.app"` in build.gradle (AGP 8.x requires it) |
| Signing error | Check environment variables; never hardcode passwords |
| ProGuard crash | Add `-keep` rules for models, native modules, serialization |
| Target SDK rejected | Google Play requires `targetSdk = 35` as of 2025 |
| 16KB alignment error | Add `pageAlignSharedLibs = true` in build.gradle |
| Foreground service crash | Declare `foregroundServiceType` in AndroidManifest (API 34+) |
| Data Safety rejection | Complete Data Safety section in Play Console |
| Privacy policy rejected | URL must be live, accessible without login, match Data Safety declaration |
| Cleartext traffic blocked | Android 9+ blocks HTTP by default; use HTTPS or configure network_security_config |
| `READ_EXTERNAL_STORAGE` not working | Android 13+ uses `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO` instead |
| Play App Signing key lost | Upload key can be reset in Play Console; signing key is managed by Google |
