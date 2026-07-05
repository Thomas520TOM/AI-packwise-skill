#!/usr/bin/env bash
set -e

REPO="https://github.com/Thomas520TOM/packwise-skills.git"
SKILL_NAME="packwise-skills"

# Parse --only flag
ONLY=""
for arg in "$@"; do
  if [ "$prev" = "--only" ]; then
    ONLY="$arg"
  fi
  prev="$arg"
done

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 Installing packwise-skills..."
echo ""

# Detect AI agent and set install path
INSTALL_PATH=""

if [ -d "$HOME/.claude" ]; then
  INSTALL_PATH="$HOME/.claude/skills/$SKILL_NAME"
  AGENT="Claude Code (user-level)"
elif [ -d ".claude" ]; then
  INSTALL_PATH=".claude/skills/$SKILL_NAME"
  AGENT="Claude Code (project-level)"
elif [ -d ".cursor" ]; then
  INSTALL_PATH=".cursor/skills/$SKILL_NAME"
  AGENT="Cursor"
elif [ -d ".opencode" ]; then
  INSTALL_PATH=".opencode/skills/$SKILL_NAME"
  AGENT="OpenCode"
else
  INSTALL_PATH="skills/$SKILL_NAME"
  AGENT="Generic (skills/ directory)"
fi

echo -e "📦 Detected agent: ${YELLOW}${AGENT}${NC}"
echo -e "📁 Install path:   ${INSTALL_PATH}"
echo ""

# Create directory and clone to temp location
TMP_DIR=$(mktemp -d)
git clone --depth 1 "$REPO" "$TMP_DIR" > /dev/null 2>&1

# Create target directory
mkdir -p "$INSTALL_PATH"

# Always copy core files
cp "$TMP_DIR/skill.md" "$INSTALL_PATH/"
cp "$TMP_DIR/audit.md" "$INSTALL_PATH/"
cp "$TMP_DIR/CLAUDE.md" "$INSTALL_PATH/"

# Copy sub-skills (selective or full)
if [ -n "$ONLY" ]; then
  echo "  Selective install: $ONLY"
  echo "  (skill.md, audit.md, CLAUDE.md are always included)"
  echo ""
  IFS=',' read -ra CATEGORIES <<< "$ONLY"
  mkdir -p "$INSTALL_PATH/sub-skills"
  for cat in "${CATEGORIES[@]}"; do
    cat=$(echo "$cat" | tr -d ' ')
    if [ -d "$TMP_DIR/sub-skills/$cat" ]; then
      cp -r "$TMP_DIR/sub-skills/$cat" "$INSTALL_PATH/sub-skills/"
      echo "  ✓ Installed sub-skills/$cat"
    else
      echo "  ⚠ Category not found: $cat"
    fi
  done
else
  cp -r "$TMP_DIR/sub-skills" "$INSTALL_PATH/"
fi

# Cleanup
rm -rf "$TMP_DIR"

echo ""
echo -e "${GREEN}✅ packwise-skills installed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  Open your AI agent and say:"
echo "    > package my Electron app for Windows"
echo ""
