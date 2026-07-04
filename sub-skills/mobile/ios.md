# iOS / iPadOS Build Sub-Skill

Build and publish Swift/ObjC native iOS and iPadOS applications. **Must build on macOS.**

**Current version**: iOS 18 / iPadOS 18 / Xcode 16 / Swift 6.0 (2025-2026)

## When to Use

- Native iOS/iPadOS applications (SwiftUI or UIKit)
- Apps requiring deep Apple ecosystem integration (HealthKit, CoreML, ARKit)
- Apps published to the App Store
- iPad-optimized applications (split view, pencil support, Stage Manager)

## Prerequisites

- macOS 14+ with Xcode 16 (free from App Store)
- Apple Developer Program ($99/year, required for App Store distribution)
- Apple Developer Certificate + Provisioning Profile
- Physical iOS device for testing (recommended; Simulator available)

## Build

### Command Line Build

```bash
# Archive (production build)
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \
  -archivePath build/MyApp.xcarchive \
  -destination "generic/platform=iOS" \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/MyApp.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/
```

```xml
<!-- ExportOptions.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

### Build Targets

| Target | Command | Output |
|--------|---------|--------|
| Simulator | `xcodebuild -sdk iphonesimulator` | .app (for testing) |
| Device | `xcodebuild -sdk iphoneos` | .app (unsigned) |
| Archive | `xcodebuild archive` | .xcarchive |
| IPA | `xcodebuild -exportArchive` | .ipa (for distribution) |
| TestFlight | Upload .ipa via Xcode Organizer or `altool` | On App Store Connect |
| App Store | Submit via App Store Connect | Public release |

## Signing & Provisioning

### Automatic Signing (Xcode-managed, recommended for small teams)

```
Xcode → Target → Signing & Capabilities:
✅ Automatically manage signing
Team: [Select your team]
Bundle Identifier: com.yourcompany.yourapp
```

### Manual Signing (CI/CD, enterprise)

```bash
# Install certificate
security import certificate.p12 -P password -k ~/Library/Keychains/login.keychain-db

# Install provisioning profile
cp profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

# Verify
security find-identity -v -p codesigning
```

### fastlane (Automated Signing + Build + Upload)

```bash
# Install
gem install fastlane

# Initialize
cd ios && fastlane init
```

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Push to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "MyApp.xcodeproj")
    build_app(
      workspace: "MyApp.xcworkspace",
      scheme: "MyApp",
      export_method: "app-store"
    )
    upload_to_testflight
  end

  desc "Push to App Store"
  lane :release do
    build_app(
      workspace: "MyApp.xcworkspace",
      scheme: "MyApp",
      export_method: "app-store"
    )
    upload_to_app_store(force: true)
  end
end
```

```bash
# Run
cd ios && fastlane beta      # Upload to TestFlight
cd ios && fastlane release   # Upload to App Store
```

## App Store Upload

```bash
# Method 1: Xcode Organizer (GUI)
# Product → Archive → Distribute App → App Store Connect → Upload

# Method 2: altool (CLI)
xcrun altool --upload-app \
  -f build/MyApp.ipa \
  --type ios \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID

# Method 3: Transporter app (Apple's upload tool from App Store)

# Method 4: fastlane (automated)
fastlane deliver --ipa build/MyApp.ipa
```

## Publishing Checklist

| Step | Description |
|------|-------------|
| 1. Apple Developer Program | $99/year at developer.apple.com |
| 2. Create App ID | Apple Developer Portal → Identifiers |
| 3. Create Provisioning Profile | Development + Distribution |
| 4. Build Archive | Xcode → Product → Archive |
| 5. Upload to App Store Connect | Xcode Organizer or Transporter |
| 6. Fill app info | Description, screenshots (6.7", 6.5", 5.5"), keywords, privacy policy URL |
| 7. Set pricing | Free or paid; tier selection |
| 8. Submit review | Typically 24–48 hours; can be expedited |
| 9. Release | Automatic after approval, or manual release |

## iPadOS Adaptation

```swift
// Info.plist — Universal app (iPhone + iPad)
<key>UIDeviceFamily</key>
<array>
    <integer>1</integer>  <!-- iPhone -->
    <integer>2</integer>  <!-- iPad -->
</array>
```

### iPadOS-Specific Considerations

| Feature | Implementation |
|---------|---------------|
| Split View / Slide Over | Auto Layout with size classes; handle `traitCollectionDidChange` |
| Stage Manager (M1+ iPad) | Support multiple window sizes; `UIWindowScene` API |
| Apple Pencil | `UIPencilInteraction` for double-tap; `UIHoverGestureRecognizer` for hover |
| Keyboard & Trackpad | `UIKeyCommand` for keyboard shortcuts; pointer interaction |
| External Display | `UIScreen.screens` for multi-display; `UIWindowScene` per display |
| Drag & Drop | `UIDragInteraction` / `UIDropInteraction` |
| Multitasking | Design for any width (compact/regular); test in Simulator |

## TestFlight (Beta Distribution)

```
1. Upload build via Xcode or fastlane
2. App Store Connect → TestFlight → Builds
3. Internal testing: up to 100 testers (instant, no review)
4. External testing: up to 10,000 testers (requires Beta App Review, ~24h)
5. Public link: share TestFlight link for anyone to join
```

## CI/CD — GitHub Actions

```yaml
name: iOS Build
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
      - run: gem install fastlane
      - uses: apple-actions/import-codesign-certs@v3
        with:
          p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
          p12-password: ${{ secrets.CERTIFICATES_PASSWORD }}
      - run: cd ios && fastlane beta
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.API_KEY_ID }}
          APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.API_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.API_KEY }}
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Certificate expired | Renew via Apple Developer Portal; re-download provisioning profile |
| Profile mismatch | Regenerate profile; ensure Bundle ID matches exactly |
| App Store rejection | Read App Review Guidelines; ensure privacy policy URL is live |
| Test device limit | Development Profile: max 100 devices per type; Enterprise: unlimited |
| iPadOS layout broken | Test with all iPad sizes in Simulator; use size classes |
| "Missing push notification entitlement" | Add Push Notification capability in Xcode; or remove if not needed |
| "Unsupported Architecture" | Ensure only arm64 in Build Settings (no armv7) |
| Bitcode warning | Bitcode is deprecated since Xcode 14; disable in build settings |
| Swift version mismatch | Set Swift Language Version in Build Settings to match your code |
| Simulator builds failing | Ensure Xcode Command Line Tools installed: `xcode-select --install` |
| Screenshot requirements | Must include 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 11), 5.5" (iPhone 8 Plus) |
