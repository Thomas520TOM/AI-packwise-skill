#!/usr/bin/env node

/**
 * Packwise CLI — Universal installer for AI agent build skills
 *
 * Usage:
 *   npx packwise-skills                              # Install all skills
 *   npx packwise-skills --only desktop,mobile        # By category
 *   npx packwise-skills --only electron,react-native # By specific framework
 *   npx packwise-skills --only electron,mobile       # Mix both
 *   npx packwise-skills uninstall                    # Remove
 *   npx packwise-skills list                         # Show installed
 *   npx packwise-skills update                       # Update to latest version
 *
 * Categories: desktop, mobile, web, backend, ai, cli, plugins, embedded, security, cloud, cross-platform
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CORE_FILES = ['skill.md', 'audit.md', 'CLAUDE.md'];

const CATEGORY_MAP = {
  desktop:       ['electron', 'tauri', 'native-app', 'web-to-desktop', 'game-dev', 'vr-ar', 'smart-platforms', 'scenarios'],
  mobile:        ['android', 'ios', 'harmonyos', 'flutter-mobile', 'react-native', 'capacitor', 'wearables'],
  web:           ['spa', 'ssr', 'pwa', 'serverless-edge', 'monorepo', 'wasm'],
  backend:       ['node-server', 'python-server', 'go-server', 'rust-backend', 'java-spring', 'php-laravel'],
  ai:            ['python-ml', 'local-llm'],
  cli:           ['python-cli', 'sdk-library'],
  plugins:       ['browser-extension', 'vscode-extension', 'jetbrains-plugin'],
  embedded:      ['esp32', 'stm32', 'ros', 'car-infotainment'],
  security:      ['security-tools'],
  cloud:         ['docker', 'kubernetes', 'ci-cd-pipelines', 'payment-integration'],
  'cross-platform': ['multiplatform'],
};

const ALL_CATEGORIES = Object.keys(CATEGORY_MAP);
const ALL_FRAMEWORKS = Object.values(CATEGORY_MAP).flat();
const HOME = os.homedir();
const CWD = process.cwd();

// Agent detection and installation paths
const AGENTS = [
  {
    name: 'Claude Code',
    detect: () => fs.existsSync(path.join(HOME, '.claude')) || fs.existsSync(path.join(CWD, '.claude')),
    userDir: path.join(HOME, '.claude', 'skills', 'packwise'),
    projectDir: path.join(CWD, '.claude', 'skills', 'packwise'),
    installTarget: 'user', // user-level by default
  },
  {
    name: 'Cursor',
    detect: () => fs.existsSync(path.join(CWD, '.cursorrules')) || fs.existsSync(path.join(HOME, '.cursor')),
    projectDir: path.join(CWD, '.cursor', 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'Windsurf',
    detect: () => fs.existsSync(path.join(HOME, '.windsurf')) || fs.existsSync(path.join(CWD, '.windsurfrules')),
    projectDir: path.join(CWD, 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'OpenCode',
    detect: () => fs.existsSync(path.join(HOME, '.opencode')) || fs.existsSync(path.join(CWD, '.opencode')),
    projectDir: path.join(CWD, '.opencode', 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'Zed AI',
    detect: () => fs.existsSync(path.join(HOME, '.zed')),
    projectDir: path.join(CWD, 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'OpenClaw',
    detect: () => fs.existsSync(path.join(HOME, '.openclaw')) || fs.existsSync(path.join(CWD, '.openclaw')),
    projectDir: path.join(CWD, '.openclaw', 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'WorkBuddy',
    detect: () => fs.existsSync(path.join(HOME, '.workbuddy')) || fs.existsSync(path.join(CWD, '.workbuddy')),
    userDir: path.join(HOME, '.workbuddy', 'skills', 'packwise'),
    projectDir: path.join(CWD, '.workbuddy', 'skills', 'packwise'),
    installTarget: 'user',
  },
  {
    name: 'Trae',
    detect: () => fs.existsSync(path.join(HOME, '.trae')) || fs.existsSync(path.join(CWD, '.trae')),
    projectDir: path.join(CWD, '.trae', 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'Codex CLI',
    detect: () => false, // No directory marker; user must manually place PACKWISE.md
    projectDir: path.join(CWD, 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'Hermes',
    detect: () => fs.existsSync(path.join(CWD, 'hermes.config.yaml')) || fs.existsSync(path.join(CWD, 'hermes.config.yml')),
    projectDir: path.join(CWD, 'skills', 'packwise'),
    installTarget: 'project',
  },
  {
    name: 'GitHub Copilot',
    detect: () => fs.existsSync(path.join(CWD, '.copilot')) || fs.existsSync(path.join(HOME, '.copilot')),
    projectDir: path.join(CWD, '.copilot', 'skills', 'packwise'),
    installTarget: 'project',
  },
];

// Parse --only flag (supports categories and individual frameworks)
const onlyIndex = process.argv.indexOf('--only');
const onlyRaw = onlyIndex !== -1
  ? process.argv[onlyIndex + 1]?.split(',').map(c => c.trim().toLowerCase())
  : null;

// Resolve to list of frameworks to install
let onlyFrameworks = null;
let onlyLabels = [];

if (onlyRaw) {
  const invalid = onlyRaw.filter(c => !ALL_CATEGORIES.includes(c) && !ALL_FRAMEWORKS.includes(c));
  if (invalid.length) {
    console.log(`\n  Unknown: ${invalid.join(', ')}`);
    console.log(`\n  Categories:  ${ALL_CATEGORIES.join(', ')}`);
    console.log(`  Frameworks:  ${ALL_FRAMEWORKS.join(', ')}\n`);
    process.exit(1);
  }

  onlyFrameworks = new Set();
  for (const item of onlyRaw) {
    if (ALL_CATEGORIES.includes(item)) {
      // Expand category to all its frameworks
      CATEGORY_MAP[item].forEach(f => onlyFrameworks.add(f));
      onlyLabels.push(item);
    } else {
      // Individual framework
      onlyFrameworks.add(item);
      onlyLabels.push(item);
    }
  }
}

// Parse command (skip --only and its value)
const args = process.argv.filter((a, i) => {
  if (i <= 1) return false; // skip node and script path
  if (a === '--only') return false;
  if (onlyIndex !== -1 && i === onlyIndex + 1) return false;
  return true;
});
const command = args[0] || 'install';

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function installTo(target) {
  const sourceDir = path.join(__dirname, '..');

  // Always copy core files
  for (const file of CORE_FILES) {
    const src = path.join(sourceDir, file);
    if (fs.existsSync(src)) copyFile(src, path.join(target, file));
  }

  // Copy sub-skills
  const subSkillsSrc = path.join(sourceDir, 'sub-skills');
  if (fs.existsSync(subSkillsSrc)) {
    if (onlyFrameworks) {
      // Selective install by individual framework
      for (const cat of ALL_CATEGORIES) {
        for (const fw of CATEGORY_MAP[cat]) {
          if (onlyFrameworks.has(fw)) {
            const fwSrc = path.join(subSkillsSrc, cat, fw + '.md');
            if (fs.existsSync(fwSrc)) {
              const destDir = path.join(target, 'sub-skills', cat);
              fs.mkdirSync(destDir, { recursive: true });
              fs.copyFileSync(fwSrc, path.join(destDir, fw + '.md'));
            }
          }
        }
      }
    } else {
      // Install all
      copyDir(subSkillsSrc, path.join(target, 'sub-skills'));
    }
  }
}


if (command === 'install' || command === undefined) {
  console.log('\n  Packwise — Universal Build & Packaging Skills\n');

  if (onlyFrameworks) {
    console.log(`  Selective install: ${onlyLabels.join(', ')}`);
    console.log(`  (skill.md, audit.md, CLAUDE.md are always included)\n`);
  }

  const installed = [];
  let installedAny = false;

  for (const agent of AGENTS) {
    if (!agent.detect()) continue;

    const target = agent.installTarget === 'user' && agent.userDir
      ? agent.userDir
      : agent.projectDir;

    if (!target) continue;

    console.log(`  Installing for ${agent.name}...`);
    installTo(target);
    console.log(`  ✓ Installed to ${target}`);
    installed.push(agent.name);
    installedAny = true;
  }

  if (!installedAny) {
    const fallback = path.join(CWD, 'skills', 'packwise');
    console.log('  No AI agents detected. Installing to project...');
    installTo(fallback);
    console.log(`  ✓ Installed to ${fallback}`);
    console.log(`\n  Reference in your AI agent:`);
    console.log(`    "Read ${path.relative(CWD, fallback)}/skill.md and help me package this project"`);
  } else {
    console.log(`\n  ✓ Packwise installed for: ${installed.join(', ')}`);
    console.log(`\n  Usage: ask your AI agent to package your project`);
  }
  console.log('');
}

else if (command === 'uninstall') {
  console.log('\n  Packwise — Uninstall\n');
  for (const agent of AGENTS) {
    const targets = [agent.userDir, agent.projectDir].filter(Boolean);
    for (const target of targets) {
      if (fs.existsSync(target)) {
        removeRecursive(target);
        console.log(`  ✓ Removed from ${agent.name}: ${target}`);
      }
    }
  }
  console.log('');
}

else if (command === 'list') {
  console.log('\n  Packwise — Installed Agents\n');
  let found = false;
  for (const agent of AGENTS) {
    const targets = [agent.userDir, agent.projectDir].filter(Boolean);
    for (const target of targets) {
      if (fs.existsSync(target)) {
        console.log(`  ✓ ${agent.name}: ${target}`);
        found = true;
      }
    }
  }
  if (!found) {
    console.log('  No installations found. Run: npx packwise-skills install');
  }
  console.log('');
}

else if (command === 'update') {
  console.log('\n  Packwise — Update\n');

  const { execSync } = require('child_process');
  let updated = false;

  for (const agent of AGENTS) {
    const targets = [agent.userDir, agent.projectDir].filter(Boolean);
    for (const target of targets) {
      if (fs.existsSync(target) && fs.existsSync(path.join(target, '.git'))) {
        console.log(`  Updating ${agent.name}: ${target}`);
        try {
          execSync('git pull', { cwd: target, stdio: 'pipe' });
          console.log(`  ✓ Updated ${agent.name}`);
          updated = true;
        } catch (e) {
          console.log(`  ✗ Failed to update ${agent.name}: ${e.message}`);
        }
      }
    }
  }

  if (!updated) {
    console.log('  No git-based installations found.');
    console.log('  If installed via npm, run: npm update -g packwise-skills');
    console.log('  If installed via curl, re-run the install script.');
  }
  console.log('');
}

else {
  console.log(`\n  Unknown command: ${command}`);
  console.log('  Usage: npx packwise-skills [install|uninstall|list|update] [--only desktop,mobile]\n');
  process.exit(1);
}
