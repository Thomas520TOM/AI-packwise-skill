#!/usr/bin/env node

/**
 * Packwise CLI — Universal installer for AI agent build skills
 *
 * Detects installed AI agents and copies skill files to the right location.
 *
 * Usage:
 *   npx @anthropic-ai/packwise          # Auto-detect and install
 *   npx @anthropic-ai/packwise install   # Same as above
 *   npx @anthropic-ai/packwise uninstall # Remove from all detected agents
 *   npx @anthropic-ai/packwise list      # Show which agents have skills installed
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_FILES = ['skill.md', 'audit.md'];
const SKILL_DIRS = ['sub-skills'];
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
];

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyRecursive(srcPath, destPath);
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

const command = process.argv[2] || 'install';
const sourceDir = path.join(__dirname, '..');

if (command === 'install' || command === undefined) {
  console.log('\n  Packwise — Universal Build & Packaging Skills\n');

  const installed = [];
  let installedAny = false;

  for (const agent of AGENTS) {
    if (!agent.detect()) continue;

    const target = agent.installTarget === 'user' && agent.userDir
      ? agent.userDir
      : agent.projectDir;

    if (!target) continue;

    console.log(`  Installing for ${agent.name}...`);
    copyRecursive(sourceDir, target);
    console.log(`  ✓ Installed to ${target}`);
    installed.push(agent.name);
    installedAny = true;
  }

  if (!installedAny) {
    // Fallback: install to project root skills/ directory
    const fallback = path.join(CWD, 'skills', 'packwise');
    console.log('  No AI agents detected. Installing to project...');
    copyRecursive(sourceDir, fallback);
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
    console.log('  No installations found. Run: npx @anthropic-ai/packwise install');
  }
  console.log('');
}

else {
  console.log(`\n  Unknown command: ${command}`);
  console.log('  Usage: npx @anthropic-ai/packwise [install|uninstall|list]\n');
  process.exit(1);
}
