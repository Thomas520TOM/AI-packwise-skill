# Packwise — Installation

One skill pack. Install once, use everywhere.

---

## Quick Start (30 seconds)

```bash
npx @anthropic-ai/packwise
```

This auto-detects your AI agent and installs to the correct location.

---

## Installation Methods

### Method 1: npm (Recommended)

Works with Claude Code, Cursor, Windsurf, OpenCode, Zed, and any Node.js-based agent.

```bash
# Auto-detect agent and install
npx @anthropic-ai/packwise

# Or install globally
npm install -g @anthropic-ai/packwise

# Verify
npx @anthropic-ai/packwise list

# Uninstall
npx @anthropic-ai/packwise uninstall
```

**What it does:**
- Detects which AI agents you have installed
- Copies `skill.md`, `audit.md`, and `sub-skills/` to the right location
- Supports: Claude Code, Cursor, Windsurf, OpenCode, Zed AI
- Falls back to `skills/packwise/` in current directory if no agent detected

### Method 2: Git Clone

```bash
# Clone to a shared location
cd ~/.ai-skills/
git clone https://github.com/Thomas520TOM/AI-packwise-skill.git packwise
```

Then reference it in your agent:
```
> Read ~/.ai-skills/packwise/skill.md and help me package this project
```

### Method 3: Project-Level Copy

For agent-specific or isolated installations:

```bash
# Copy to your project
mkdir -p skills/packwise
cp -r /path/to/AI-packwise-skill/skill.md skills/packwise/
cp -r /path/to/AI-packwise-skill/audit.md skills/packwise/
cp -r /path/to/AI-packwise-skill/sub-skills/ skills/packwise/
```

### Method 4: Claude Code Slash Command

For Claude Code specifically, copy to commands directory:

```bash
mkdir -p .claude/commands
cp skill.md .claude/commands/package.md
```

Then use: `/package` in Claude Code.

---

## Agent-Specific Details

All methods above work across agents. If you need agent-specific configuration:

| Agent | Install Location | Invoke |
|-------|-----------------|--------|
| **Claude Code** | `~/.claude/skills/packwise/` or project `.claude/skills/packwise/` | Natural language: "package my app" |
| **Cursor** | Project `.cursor/rules/` or root `skills/packwise/` | Auto-reads `.cursorrules` and skill files |
| **Windsurf** | Project root `skills/packwise/` | Auto-reads project docs |
| **OpenCode** | Project `.opencode/skills/packwise/` | `@packwise/skill.md` |
| **Hermes** | Config `skills:` section or project dir | Config + natural language |
| **WorkBuddy** | `.workbuddy/skills/packwise/` | `@packwise` prefix |
| **Codex CLI** | Project root (reads all .md) | Auto-reads context |
| **Zed AI** | Project root | Auto-reads context |
| **Any agent** | Any accessible path | "Read [path]/skill.md" |

---

## What Gets Installed

```
skill.md        ← Main orchestrator (8-step workflow)
audit.md        ← Post-build security audit (mandatory)
sub-skills/     ← 44 platform-specific build guides
  ├── desktop/  (9 files)
  ├── mobile/   (7 files)
  ├── web/      (6 files)
  ├── backend/  (6 files)
  ├── ai/       (2 files)
  ├── cli/      (2 files)
  ├── plugins/  (3 files)
  ├── embedded/ (4 files)
  ├── security/ (1 file)
  ├── cloud/    (4 files)
  └── cross-platform/ (1 file)
```

---

## Uninstall

```bash
# npm
npx @anthropic-ai/packwise uninstall

# Manual: delete the packwise directory from your skills location
rm -rf ~/.claude/skills/packwise/      # Claude Code user-level
rm -rf .claude/skills/packwise/        # Claude Code project-level
rm -rf skills/packwise/                # Generic project-level
```

---

## Troubleshooting

**"npx @anthropic-ai/packwise" not found?**
- Ensure Node.js >= 18 is installed
- Try: `npm install -g @anthropic-ai/packwise` first

**Skill not loading in agent?**
- Verify the skill file is in the correct directory (see table above)
- Check that `skill.md` is readable (not blocked by permissions)

**Agent ignoring the workflow?**
- Start your prompt with: "Follow the packaging workflow in skill.md"
- Reference the file explicitly

**Want to update?**
```bash
# npm
npm update -g @anthropic-ai/packwise

# git
cd ~/.ai-skills/packwise && git pull
```
