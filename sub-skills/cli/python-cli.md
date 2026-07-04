# Python CLI Tool Packaging Sub-Skill

Package and distribute Python command-line tools as standalone executables or pip packages.

**Current version**: Python 3.12+ / PyInstaller 6.x / Nuitka 2.x / uv (2025-2026)

## When to Use

- Automation scripts for distribution to non-Python users
- DevOps/infrastructure tools
- Data processing pipelines
- Security tools, scanners
- Research tools for academic distribution

## Packaging Options Comparison

| Method | Size | Startup | Cross-compile | Best For |
|--------|------|---------|--------------|----------|
| PyInstaller | 15–80MB | 1–3s | No (build per platform) | Universal distribution |
| Nuitka | 10–50MB | < 1s | No | Performance, AV false positive avoidance |
| pip/PyPI | 0 (source) | Instant | N/A | Developer tools |
| pipx | 0 (isolated) | Instant | N/A | CLI tools for developers |
| Docker | 50–200MB | 1–2s | Yes | Server/container environments |
| uv | 0 (source) | Instant | N/A | Fast Python package management |

---

## PyInstaller (Most Universal)

```bash
pip install pyinstaller

# Single file mode (self-extracting)
pyinstaller --onefile --name mytool mytool.py

# Directory mode (faster startup, recommended for production)
pyinstaller --name mytool mytool.py

# With hidden imports (common for dynamic imports)
pyinstaller --onefile \
  --hidden-import=cryptography \
  --hidden-import=paramiko \
  --hidden-import=click \
  --name mytool mytool.py

# Console app (default) vs GUI app
pyinstaller --onefile --console mytool.py    # Console
pyinstaller --onefile --windowed mytool.py   # GUI (no console window)

# Output: dist/mytool (Linux/macOS) or dist/mytool.exe (Windows)
```

### Cross-Platform Build (GitHub Actions)

```yaml
name: Build CLI
on:
  push:
    tags: ['v*']
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - run: pip install pyinstaller
      - run: pyinstaller --onefile --name mytool mytool.py
      - uses: actions/upload-artifact@v4
        with:
          name: mytool-${{ matrix.os }}
          path: dist/
```

---

## Nuitka (Better Performance)

```bash
pip install nuitka

# Standalone binary
python -m nuitka \
  --standalone \
  --onefile \
  --output-filename=mytool \
  --enable-plugin=anti-bloat \
  mytool.py

# With module support
python -m nuitka \
  --standalone \
  --onefile \
  --include-module=cryptography \
  --include-package=click \
  mytool.py
```

---

## pip Distribution (PyPI)

```toml
# pyproject.toml
[build-system]
requires = ["setuptools>=75.0", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "mytool"
version = "1.0.0"
description = "My awesome CLI tool"
readme = "README.md"
license = "MIT"
requires-python = ">=3.10"
dependencies = [
    "click>=8.0",
    "requests>=2.28",
    "rich>=13.0",
]

[project.scripts]
mytool = "mytool.cli:main"

[project.urls]
Homepage = "https://github.com/user/mytool"
```

```bash
# Build
python -m build
# Output: dist/mytool-1.0.0-py3-none-any.whl + dist/mytool-1.0.0.tar.gz

# Publish to PyPI
pip install twine
twine upload dist/*

# Or: use trusted publishing (recommended)
# Configure on pypi.org → Your project → Publishing → Add GitHub Actions
```

---

## pipx (Isolated Installation)

```bash
# Install pipx
pip install pipx
pipx ensurepath

# Install CLI tool in isolated environment
pipx install mytool

# Install from local wheel
pipx install dist/mytool-1.0.0-py3-none-any.whl

# Install from Git
pipx install git+https://github.com/user/mytool.git
```

---

## Docker Distribution

```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN pip install .
RUN groupadd -r tooluser && useradd -r -g tooluser tooluser
USER tooluser
ENTRYPOINT ["mytool"]
```

---

## Rich CLI Framework (Recommended for Beautiful CLIs)

```python
# mytool/cli.py
import click
from rich.console import Console
from rich.table import Table

console = Console()

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """My awesome CLI tool."""
    pass

@cli.command()
@click.argument("name")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def greet(name: str, verbose: bool):
    """Greet someone."""
    if verbose:
        console.print(f"[dim]Processing request...[/dim]")
    console.print(f"[bold green]Hello, {name}![/bold green]")

@cli.command()
def table():
    """Show a beautiful table."""
    t = Table(title="Data")
    t.add_column("Name", style="cyan")
    t.add_column("Value", style="green")
    t.add_row("Python", "3.13")
    t.add_row("CLI", "mytool 1.0.0")
    console.print(t)

if __name__ == "__main__":
    cli()
```

---

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| PyInstaller missing hidden imports | Use `--hidden-import`; check with `pyi-archive_viewer` |
| Antivirus false positive (PyInstaller) | Switch to Nuitka; sign binaries; submit to AV vendors |
| Cross-platform build fails | Build on each platform separately; use CI matrix builds |
| Large binary size | Use Nuitka (smaller); exclude unused packages; use `--exclude-module` |
| Slow startup (PyInstaller) | Use directory mode instead of `--onefile` |
| `pkg_resources` deprecation | Migrate to `importlib.metadata`; use `setuptools>=70` |
| pip install fails on Windows | Use `python -m pip install`; check PATH |
| Permission denied on Linux/macOS | `chmod +x dist/mytool` |
| Entry point not found | Check `[project.scripts]` in `pyproject.toml`; verify module path |
