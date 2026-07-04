# VS Code Extension Build Sub-Skill

Develop and publish Visual Studio Code extensions.

**Current version**: VS Code 1.96+ / @vscode/vsce 2.x (2025-2026)

## When to Use

- Editor enhancements (themes, snippets, keybindings)
- Language support (syntax highlighting, IntelliSense, debugging)
- Developer tools (linters, formatters, test runners)
- AI coding assistants
- Workflow automation

## Prerequisites

```bash
# Node.js 20+
# Install VS Code Extension Manager
npm install -g @vscode/vsce

# Install Yeoman generator for scaffolding
npm install -g yo generator-code
```

## Project Setup

```bash
# Generate extension scaffold
yo code
# Select: New Extension (TypeScript)
# Name: my-extension
# Description: My awesome extension
# Package manager: npm

# Project structure:
my-extension/
├── src/
│   └── extension.ts        ← Main entry point
├── package.json            ← Extension manifest
├── tsconfig.json           ← TypeScript config
├── .vscodeignore           ← Files to exclude from .vsix
└── README.md
```

## package.json (Extension Manifest)

```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "My awesome VS Code extension",
  "version": "1.0.0",
  "engines": { "vscode": "^1.96.0" },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "myExtension.helloWorld",
        "title": "Hello World"
      }
    ],
    "keybindings": [
      {
        "command": "myExtension.helloWorld",
        "key": "ctrl+shift+h",
        "mac": "cmd+shift+h"
      }
    ],
    "configuration": {
      "title": "My Extension",
      "properties": {
        "myExtension.enableFeature": {
          "type": "boolean",
          "default": true,
          "description": "Enable the awesome feature"
        }
      }
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "devDependencies": {
    "@types/vscode": "^1.96.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0"
  }
}
```

## Build & Test

```bash
# Compile TypeScript
npm run compile

# Run in Extension Development Host (VS Code launches with your extension)
# Press F5 in VS Code, or:
code --extensionDevelopmentPath=.

# Run tests
npm test

# Lint
npm run lint
```

## Package (.vsix)

```bash
# Package as .vsix file
vsce package
# Output: my-extension-1.0.0.vsix

# Install locally for testing
code --install-extension my-extension-1.0.0.vsix

# Package with specific version
vsce package --pre-release  # Pre-release version
```

## Publish to Marketplace

```bash
# 1. Create Personal Access Token (PAT)
#    dev.azure.com → User Settings → Personal Access Tokens
#    Scope: Marketplace → Manage

# 2. Create publisher (one-time)
#    marketplace.visualstudio.com → Create Publisher

# 3. Login
vsce login YOUR_PUBLISHER_NAME
# Enter PAT when prompted

# 4. Publish
vsce publish                  # Publish current version
vsce publish minor            # Bump minor version + publish
vsce publish patch            # Bump patch version + publish
vsce publish 2.0.0            # Set specific version + publish

# 5. Pre-release
vsce publish --pre-release
```

## Testing

```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Command should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('myExtension.helloWorld'));
    });

    test('Configuration should have default value', () => {
        const config = vscode.workspace.getConfiguration('myExtension');
        assert.strictEqual(config.get('enableFeature'), true);
    });
});
```

```bash
# Run tests
npm test
# Or with coverage
npm run test:coverage
```

## Extension Types

| Type | Use Case | Key APIs |
|------|----------|---------|
| Commands | Custom actions | `vscode.commands.registerCommand` |
| Webview | Custom UI panels | `vscode.window.createWebviewPanel` |
| Language Server | Language support | `vscode-languageclient` / `vscode-languageserver` |
| Tree View | Custom sidebars | `TreeDataProvider` |
| Debug Adapter | Custom debuggers | `DebugAdapterDescriptorFactory` |
| Notebook | Jupyter-like notebooks | `NotebookSerializer` |
| Chat Participant | AI chat integration | `vscode.chat.createChatParticipant` |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Build failure | Confirm `tsconfig.json` `outDir` matches `main` field in package.json |
| Publish rejected | Ensure all required fields: `name`, `displayName`, `description`, `version`, `engines` |
| Size limit | .vsix max 100MB; use `.vscodeignore` to exclude node_modules source |
| Icon requirement | At least 128x128 PNG; set in `package.json` → `icon` |
| Extension not activating | Check `activationEvents`; use `"*"` for testing (slow), be specific in production |
| Webview not showing | Check CSP headers; set `enableScripts: true` |
| Tests failing in CI | Use `@vscode/test-electron` for integration tests |
| API version mismatch | Check `engines.vscode` in package.json matches your target version |
| `@types/vscode` version | Should match `engines.vscode` version |
| Extension size too large | Use esbuild/webpack bundler; exclude devDependencies |
