#!/usr/bin/env node

/**
 * Packwise CLI — Universal installer for AI agent build skills
 *
 * Detects installed AI agents and copies skill files to the right location.
 *
 * Usage:
 *   npx packwise-skills                        # Auto-detect and install all skills
 *   npx packwise-skills install                # Same as above
 *   npx packwise-skills --only desktop,mobile  # Install only specific sub-skills
 *   npx packwise-skills uninstall              # Remove from all detected agents
 *   npx packwise-skills list                   # Show which agents have skills installed
 *
 * Available sub-skill categories:
 *   desktop, mobile, web, backend, ai, cli, plugins, embedded, security, cloud, cross-platform
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CORE_FILES = ['skill.md', 'audit.md', 'CLAUDE.md'];
const ALL_CATEGORIES = ['desktop', 'mobile', 'web', 'backend', 'ai', 'cli', 'plugins', 'embedded', 'security', 'cloud', 'cross-platform'];
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

// Parse --only flag
const onlyIndex = process.argv.indexOf('--only');
const onlyCategories = onlyIndex !== -1
  ? process.argv[onlyIndex + 1]?.split(',').map(c => c.trim().toLowerCase())
  : null;

if (onlyCategories) {
  const invalid = onlyCategories.filter(c => !ALL_CATEGORIES.includes(c));
  if (invalid.length) {
    console.log(`\n  Unknown categories: ${invalid.join(', ')}`);
    console.log(`  Available: ${ALL_CATEGORIES.join(', ')}\n`);
    process.exit(1);
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
    if (onlyCategories) {
      // Selective install
      for (const cat of onlyCategories) {
        const catSrc = path.join(subSkillsSrc, cat);
        if (fs.existsSync(catSrc)) {
          copyDir(catSrc, path.join(target, 'sub-skills', cat));
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

  if (onlyCategories) {
    console.log(`  Selective install: ${onlyCategories.join(', ')}`);
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

else {
  console.log(`\n  Unknown command: ${command}`);
  console.log('  Usage: npx packwise-skills [install|uninstall|list] [--only desktop,mobile]\n');
  process.exit(1);
}
