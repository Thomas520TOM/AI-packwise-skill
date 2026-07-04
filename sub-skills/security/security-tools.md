# Security Tools Build Sub-Skill

Build and package security tools: penetration testing tools, vulnerability scanners, security monitoring, and CLI utilities.

## When to Use

- Penetration testing / offensive security tools
- Vulnerability scanners (SAST/DAST)
- Security monitoring platforms (SIEM)
- Encryption / cryptographic tools
- Compliance checking tools
- CTF (Capture The Flag) tools

## Tech Stack Overview

| Language | Strengths | Package Method | Best For |
|----------|-----------|---------------|----------|
| Python | Rapid prototyping, rich security libraries | PyInstaller / Docker / pipx | Script tools, scanners, automation |
| Go | Static binary, cross-compile, high concurrency | `go build` | Network tools, high-perf scanners |
| Rust | Memory safety, performance | `cargo build --release` | Low-level tools, cryptographic operations |
| C | Maximum control, minimal dependencies | Native compilation | Kernel modules, exploit development |

## Python Security Tools

### PyInstaller (Standalone Binary)

```bash
# Install
pip install pyinstaller

# Single-file executable
pyinstaller --onefile --name scanner scanner.py

# With hidden imports (common for security libs)
pyinstaller --onefile \
  --hidden-import=cryptography \
  --hidden-import=paramiko \
  --hidden-import=scapy \
  --name scanner scanner.py

# Console app (no GUI)
pyinstaller --onefile --console --name vuln-scanner scanner.py

# Output: dist/scanner (Linux/macOS) or dist/scanner.exe (Windows)
```

### pipx (Isolated CLI Installation)

```bash
# Install pipx
pip install pipx
pipx ensurepath

# Install security tool in isolated environment
pipx install bandit            # Python SAST linter
pipx install safety            # Dependency vulnerability scanner
pipx install semgrep           # Multi-language SAST
pipx install trivy             # Container/filesystem scanner
```

### Docker (Reproducible Environment)

```dockerfile
FROM python:3.13-slim

# Install system dependencies (common for security tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    masscan \
    net-tools \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root (important for security tools too)
RUN useradd -m scanner
USER scanner

ENTRYPOINT ["python", "scanner.py"]
```

## Go Security Tools

```bash
# Single binary, no dependencies
CGO_ENABLED=0 go build -ldflags="-s -w" -o scanner .

# Cross-compile
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o scanner-linux .
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o scanner.exe .
GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -o scanner-mac .

# With version embedding
go build -ldflags="-s -w -X main.version=$(git describe --tags)" -o scanner .
```

## Rust Security Tools

```bash
# Release build (optimized)
cargo build --release
# Output: target/release/scanner

# Cross-compile with cross
cargo install cross
cross build --release --target x86_64-unknown-linux-musl
```

## C Security Tools

```bash
# Static binary (portable)
gcc -static -O2 -o scanner scanner.c

# With hardening flags
gcc -O2 -fstack-protector-all -D_FORTIFY_SOURCE=2 \
    -Wformat -Wformat-security -o scanner scanner.c
```

## Signing & Distribution

### Signing Binaries (Trust)

```bash
# Windows: Sign with code signing certificate
signtool sign /f cert.pfx /p password /tr http://timestamp.digicert.com scanner.exe

# macOS: Sign and notarize
codesign --force --sign "Developer ID Application: Your Name" scanner
xcrun notarytool submit scanner.zip --apple-id your@email.com --password app-specific-pw

# Linux: GPG sign
gpg --detach-sign --armor scanner
```

### Distribution Channels

| Channel | Method | Best For |
|---------|--------|---------|
| GitHub Releases | `gh release create v1.0 scanner-linux scanner.exe` | Open source tools |
| PyPI / TestPyPI | `twine upload dist/*` | Python libraries/tools |
| Docker Hub | `docker build -t org/scanner . && docker push org/scanner` | Containerized tools |
| Homebrew | Create tap formula | macOS CLI tools |
| AUR | Submit PKGBUILD | Arch Linux users |
| Cargo crates.io | `cargo publish` | Rust libraries/tools |

## Compliance & Ethics

| Requirement | Implementation |
|-------------|---------------|
| Legal authorization | Add usage disclaimer; require explicit authorization flag |
| Logging | Log all operations with timestamps to file |
| Data protection | Encrypt scan results; don't hardcode credentials |
| Distribution control | Consider private distribution for offensive tools |
| Rate limiting | Implement request throttling to avoid DoS |
| Disclosure | Follow responsible disclosure for found vulnerabilities |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| PyInstaller missing modules | Use `--hidden-import` for dynamically loaded security libraries |
| Static binary too large | Use `upx --best` to compress (Go/Rust binaries) |
| Permission denied (network tools) | Use Linux capabilities: `setcap cap_net_raw+ep scanner` |
| Import errors in packaged binary | Test in a clean VM/container; PyInstaller may miss C extensions |
| Anti-virus false positive | Sign binaries; submit to AV vendors for whitelisting |
| Cross-compile fails (CGO) | Use Docker or `cross` tool; set `CGO_ENABLED=0` when possible |
| System tool dependency | Package with Docker; document required system tools |
| Hardcoded credentials in source | Use environment variables; add to `.gitignore` |
