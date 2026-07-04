# Native Application Build Sub-Skill

For Qt, Flutter, .NET Avalonia frameworks. Suitable for performance-sensitive, system-integrated small-to-medium team projects.

---

## Qt (C++/Python)

**When to use**: IoT control panel, industrial software, audio/video tools, database clients

### Build

```bash
# CMake project
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=/path/to/qt
cmake --build . --config Release -j$(nproc)
```

### Deploy

```bash
windeployqt release/MyApp.exe          # Windows
macdeployqt MyApp.app -dmg             # macOS
linuxdeployqt MyApp.AppImage           # Linux
```

### Python PyQt

```bash
pyinstaller --onefile --windowed app.py
# or Nuitka (better performance)
python -m nuitka --standalone --enable-plugin=pyqt5 --onefile app.py
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Missing DLL | windeployqt didn't copy, manually add |
| High DPI blurry | `AA_EnableHighDpiScaling` |
| LGPL compliance | Dynamic linking or buy commercial license |

---

## Flutter Desktop (3.44.x / Dart 3.12.x)

**When to use**: Existing Flutter mobile project, need unified mobile + desktop UI. Single codebase for mobile, web, and desktop. Impeller rendering engine now default on all platforms.

### Build

```bash
flutter config --enable-windows-desktop
flutter config --enable-macos-desktop
flutter config --enable-linux-desktop

flutter create --platforms=windows,macos,linux my_app
flutter build windows
flutter build macos    # Universal Binary
flutter build linux
```

### Package

```bash
# Windows MSIX
flutter pub add msix
flutter pub run msix:create

# macOS DMG
create-dmg build/macos/Build/Products/Release/MyApp.app

# Linux AppImage
appimagetool MyApp.AppDir MyApp.AppImage
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Windows missing MSVC | Install Visual Studio Build Tools |
| Linux missing deps | sudo apt install clang cmake ninja-build libgtk-3-dev |
| Font differences | Embed custom fonts |

---

## .NET Avalonia / MAUI

**When to use**: C#/.NET teams, enterprise internal tools, Windows-first

### Avalonia

```bash
dotnet new install Avalonia.Templates
dotnet new avalonia.app -n MyApp
dotnet publish -c Release -r win-x64 --self-contained
dotnet publish -c Release -r osx-arm64 --self-contained
dotnet publish -c Release -r linux-x64 --self-contained
```

### MAUI

```bash
dotnet new maui -n MyApp
dotnet build -t:Publish -f net9.0-windows10.0.19041.0
```

### Common Pitfalls

| Issue | Fix |
|-------|-----|
| Runtime missing | `--self-contained` publish |
| macOS signing | Apple Developer ID |

---

## Selection Guide

| Scenario | Recommended | Size |
|----------|------------|------|
| High performance / embedded / industrial | Qt | 30–80MB |
| Mobile + desktop unified | Flutter | 20–50MB |
| C#/.NET team | Avalonia | 30–60MB |
