#!/usr/bin/env bash
set -e

REPO="https://github.com/Thomas520TOM/packwise-skills.git"
SKILL_NAME="packwise-skills"

# Category → Framework mapping
declare -A CAT_FW=(
  [desktop]="electron tauri native-app web-to-desktop game-dev vr-ar smart-platforms scenarios"
  [mobile]="android ios harmonyos flutter-mobile react-native capacitor wearables"
  [web]="spa ssr pwa serverless-edge monorepo wasm"
  [backend]="node-server python-server go-server rust-backend java-spring php-laravel"
  [ai]="python-ml local-llm"
  [cli]="python-cli sdk-library"
  [plugins]="browser-extension vscode-extension jetbrains-plugin"
  [embedded]="esp32 stm32 ros car-infotainment"
  [security]="security-tools"
  [cloud]="docker kubernetes ci-cd-pipelines payment-integration"
  [cross-platform]="multiplatform"
)

ALL_CATEGORIES="${!CAT_FW[*]}"
ALL_FRAMEWORKS=""
for fw in "${CAT_FW[@]}"; do ALL_FRAMEWORKS="$ALL_FRAMEWORKS $fw"; done

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

# Detect AI agent
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

# Clone to temp
TMP_DIR=$(mktemp -d)
git clone --depth 1 "$REPO" "$TMP_DIR" > /dev/null 2>&1
mkdir -p "$INSTALL_PATH"

# Always copy core files
cp "$TMP_DIR/skill.md" "$INSTALL_PATH/"
cp "$TMP_DIR/audit.md" "$INSTALL_PATH/"
cp "$TMP_DIR/CLAUDE.md" "$INSTALL_PATH/"

# Copy sub-skills
if [ -n "$ONLY" ]; then
  IFS=',' read -ra ITEMS <<< "$ONLY"
  mkdir -p "$INSTALL_PATH/sub-skills"

  for item in "${ITEMS[@]}"; do
    item=$(echo "$item" | tr -d ' ')

    if [[ -n "${CAT_FW[$item]+x}" ]]; then
      # It's a category — install all frameworks in it
      echo "  ✓ Category: $item"
      for fw in ${CAT_FW[$item]}; do
        src="$TMP_DIR/sub-skills/$item/$fw.md"
        if [ -f "$src" ]; then
          mkdir -p "$INSTALL_PATH/sub-skills/$item"
          cp "$src" "$INSTALL_PATH/sub-skills/$item/"
        fi
      done
    elif echo "$ALL_FRAMEWORKS" | grep -qw "$item"; then
      # It's an individual framework — find its category and install
      for cat in "${!CAT_FW[@]}"; do
        if echo "${CAT_FW[$cat]}" | grep -qw "$item"; then
          src="$TMP_DIR/sub-skills/$cat/$item.md"
          if [ -f "$src" ]; then
            mkdir -p "$INSTALL_PATH/sub-skills/$cat"
            cp "$src" "$INSTALL_PATH/sub-skills/$cat/"
            echo "  ✓ $cat/$item"
          fi
          break
        fi
      done
    else
      echo "  ⚠ Unknown: $item"
    fi
  done
else
  cp -r "$TMP_DIR/sub-skills" "$INSTALL_PATH/"
fi

rm -rf "$TMP_DIR"

echo ""
echo -e "${GREEN}✅ packwise-skills installed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  Open your AI agent and say:"
echo "    > package my Electron app for Windows"
echo ""
