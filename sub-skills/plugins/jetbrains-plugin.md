# JetBrains Plugin Build Sub-Skill

Develop and publish plugins for IntelliJ-based IDEs (IntelliJ IDEA, PyCharm, WebStorm, Android Studio, etc.).

**Current version**: Gradle IntelliJ Plugin 2.x / IntelliJ Platform 2024.3+ (2025-2026)

## When to Use

- Building plugins for IntelliJ IDEA, PyCharm, WebStorm, CLion, Android Studio, etc.
- Need deep IDE integration (refactoring, code analysis, tool windows)
- Want to distribute via JetBrains Marketplace

## Key Features

- **Gradle IntelliJ Plugin** — standard build tooling (replaced legacy Plugin DevKit)
- **Kotlin/Java** — both supported; Kotlin recommended for new plugins
- **Plugin Verifier** — automated compatibility checking across IDE versions
- **Dynamic plugins** — hot-reload without restarting IDE (since Platform 2020.1)

## Prerequisites

```bash
# JDK 17+ (JBR — JetBrains Runtime recommended)
# Gradle 8.x (wrapper included in template)
# IntelliJ IDEA (for development and testing)
```

## Project Setup

```bash
# Option 1: IntelliJ Plugin Template (recommended)
# File → New → Project → IntelliJ Platform Plugin
# Or clone from GitHub:
git clone https://github.com/JetBrains/intellij-platform-plugin-template.git my-plugin
cd my-plugin

# Option 2: Gradle init
# Use IntelliJ Plugin Generator: https://plugins.jetbrains.com/docs/intellij/generating-plugin.html
```

## Build Configuration

```kotlin
// build.gradle.kts
plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.0.21"
    id("org.jetbrains.intellij.platform") version "2.2.1"
}

intellijPlatform {
    pluginConfiguration {
        id = "com.example.myplugin"
        name = "My Plugin"
        version = "1.0.0"
        description = "Plugin description"
        ideaVersion {
            sinceBuild = "243"
            untilBuild = "253.*"
        }
    }

    // Target IDE(s)
    intellijIdeaCommunity = "2024.3"

    // Plugin dependencies
    plugins = listOf(
        "com.intellij.java",       // Java support
        "org.intellij.plugins.markdown:243.22562.64" // Markdown plugin
    )

    // Plugin Verifier
    pluginVerifier {
        ides = listOf(
            intellijIdeaCommunity("2024.3"),
            intellijIdeaCommunity("2025.1"),
        )
    }
}

// Required dependencies for IntelliJ Platform development
dependencies {
    intellijPlatform {
        intellijIdeaCommunity("2024.3")
        instrumentationTools()
        pluginVerifier()
        zipSigner()
    }
}
```

## Build & Test

```bash
# Build plugin ZIP
./gradlew buildPlugin
# Output: build/distributions/my-plugin-1.0.0.zip

# Run IDE with plugin installed (for testing)
./gradlew runIde

# Run unit tests
./gradlew test

# Run Plugin Verifier (compatibility check)
./gradlew runPluginVerifier

# Check for IntelliJ-specific lint issues
./gradlew verifyPlugin
```

## Publishing

```bash
# 1. Get token from JetBrains Marketplace
#    https://plugins.jetbrains.com/author/me → Upload Token

# 2. Publish
./gradlew publishPlugin
# Requires plugin signing (automatic with zipSigner)

# With token via environment variable:
export PUBLISH_TOKEN=your-token-here
./gradlew publishPlugin

# Or specify channel (beta/alpha):
./gradlew publishPlugin -Pchannel=beta
```

## Plugin Structure

```
my-plugin/
├── src/main/kotlin/com/example/myplugin/
│   ├── MyToolWindowFactory.kt    # Tool window
│   ├── MyAction.kt               # Menu/toolbar action
│   └── services/
│       └── MyService.kt          # Application-level service
├── src/main/resources/
│   └── META-INF/
│       └── plugin.xml            # Plugin descriptor (required)
├── build.gradle.kts
└── gradle.properties
```

```xml
<!-- src/main/resources/META-INF/plugin.xml -->
<idea-plugin>
    <id>com.example.myplugin</id>
    <name>My Plugin</name>
    <vendor email="me@example.com">My Company</vendor>

    <description><![CDATA[
        Plugin description with <b>HTML</b> support.
    ]]></description>

    <depends>com.intellij.modules.platform</depends>
    <depends optional="true" config-file="my-java-ext.xml">com.intellij.java</depends>

    <extensions defaultExtensionNs="com.intellij">
        <toolWindow id="My Tool" factoryClass="com.example.myplugin.MyToolWindowFactory"/>
    </extensions>

    <actions>
        <action id="MyPlugin.MyAction"
                class="com.example.myplugin.MyAction"
                text="My Action"
                description="Does something useful">
            <add-to-group group-id="ToolsMenu" anchor="last"/>
        </action>
    </actions>
</idea-plugin>
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Plugin rejected on Marketplace | Ensure `plugin.xml` has all required fields (id, name, vendor, description, depends) |
| IDE version mismatch | Set `sinceBuild`/`untilBuild` carefully; test with Plugin Verifier |
| Build fails with SDK error | Clear Gradle cache (`~/.gradle/caches/modules-2`); verify JDK 17+ |
| Plugin not loaded in dev IDE | Check `plugin.xml` for syntax errors; check IDE log (`Help → Diagnostic Tools → Debug Log Settings`) |
| Tests fail with `NoClassDefFoundError` | Add required platform dependencies to `testImplementation` |
| Slow `runIde` startup | Use `buildSearchableOptions = false` for faster iteration |
| API deprecation warnings | Check IntelliJ Platform SDK changelog; migrate to new APIs |
| Memory issues in large projects | Use `ReadAction.runReadAction()` for thread-safe file access |

## CI/CD — GitHub Actions

```yaml
name: Build Plugin
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: ./gradlew buildPlugin
      - run: ./gradlew runPluginVerifier
      - uses: actions/upload-artifact@v4
        with:
          name: plugin
          path: build/distributions/*.zip

  publish:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: ./gradlew publishPlugin
        env:
          PUBLISH_TOKEN: ${{ secrets.JETBRAINS_TOKEN }}
```
