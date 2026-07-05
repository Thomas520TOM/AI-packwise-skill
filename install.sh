#!/usr/bin/env bash
set -e

REPO="https://github.com/Thomas520TOM/packwise-skills.git"
SKILL_NAME="packwise-skills"

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

# Create directory and clone
mkdir -p "$(dirname "$INSTALL_PATH")"

if [ -d "$INSTALL_PATH" ]; then
  echo "⚠️  Directory already exists, pulling latest..."
  cd "$INSTALL_PATH" && git pull
else
  git clone "$REPO" "$INSTALL_PATH"
fi

echo ""
echo -e "${GREEN}✅ packwise-skills installed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  Open your AI agent and say:"
echo "    > package my Electron app for Windows"
echo ""
