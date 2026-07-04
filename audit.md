# Post-Build Audit — Mandatory Verification

Top-level document. Must be executed after every build. Cannot be skipped.

---

## Audit Procedure

After packaging, the AI **must** load this document and execute all checks below. Any failure blocks delivery.

### 1. Build Artifact Integrity

```bash
# TypeScript compilation (if applicable)
npx tsc --noEmit 2>&1 | head -5

# Syntax check (if CJS bundle exists)
node -c dist/server.cjs 2>/dev/null && echo "Syntax OK" || echo "Syntax ERROR"

# Encryption files (if applicable)
ls data-encrypted/*.enc 2>/dev/null | head -5
head -c 50 data-encrypted/*.enc 2>/dev/null  # Should be hex format

# Package exists and reasonable size
ls -lh release/*.exe release/*.dmg release/*.AppImage release/*.apk 2>/dev/null
```

### 2. Package Validation

| Check | Method | Pass Criteria |
|-------|--------|--------------|
| Package executable | Double-click to run installer | No errors, wizard displays correctly |
| Logo correct | Check desktop shortcut and installer | Shows user-provided logo |
| License correct | View license in installer | Version, email, copyright correct |
| Install path | Confirm installation directory | Default or user-selected path |

### 3. Application Launch

| Check | Method | Pass Criteria |
|-------|--------|--------------|
| No startup errors | Double-click to open app | No black/white screen, no Error dialog |
| Server ready | Check console logs | Server listening on port |
| Frontend loads | UI displays correctly | No blank page, no 404 |
| Database created | Check userData directory | Database file exists at expected path |
| First launch | Fresh install and open | Welcome screen or normal initial state |

### 4. Data Persistence

| Check | Method | Pass Criteria |
|-------|--------|--------------|
| Data saves | Create data → close → reopen | Data persists correctly |
| Database writes | Perform multiple operations | Database file size increases |
| Config saves | Modify settings → save → reopen | Settings restored correctly |
| Data clear | Clear data → reopen | No residual data, clean initial state |

### 5. Encryption & Decryption

| Check | Method | Pass Criteria |
|-------|--------|--------------|
| Encrypted files correct | Check .enc file content | Hex format (`iv:encrypted_data`) |
| Decryption functional | App uses encrypted data at runtime | Data loads and processes correctly |
| No functional regression | Compare with/without encryption | Core functionality identical |
| Keys not in artifacts | Search build output | 0 matches for key seed/salt |

### 6. Credential Security

```bash
# Search build artifacts for sensitive information
grep -r "sk-\|apiKey\|secret\|token\|password\|appKey\|accessKey\|SecretKey" dist/ release/ 2>/dev/null

# Check for source map files (SECURITY: these contain full unobfuscated source)
find dist/ release/ -name '*.map' -type f 2>/dev/null
# Expected: 0 results

# Check for .env files in build output (SECURITY: may contain secrets)
find dist/ release/ -name '.env*' -type f 2>/dev/null
# Expected: 0 results

# Check app-specific config files are clean (replace <APP_CONFIG_DIR> with actual path)
cat <APP_CONFIG_DIR>/config.json 2>/dev/null  # Should be empty if cleared
cat <APP_CONFIG_DIR>/tts.json 2>/dev/null     # Should be empty if cleared
```

| Check | Pass Criteria |
|-------|--------------|
| No real keys in build artifacts | Only placeholder text (e.g., `sk-...`) |
| Config files cleared | apiKey/secretKey/appId all empty |
| No source map files in build | `find dist/ release/ -name '*.map'` returns 0 results |
| No .env files in package | `find dist/ release/ -name '.env*'` returns 0 results |
| .gitignore covers sensitive dirs | App config dir, `dist/`, `data-encrypted/`, `.env` all ignored |

### 7. File Architecture Validation

**Electron projects**:
```
resources/
├── app.asar (read-only: code + frontend)
├── app.asar.unpacked/ (native modules)
├── data/ (encrypted data)
└── public/ (static resources)

%APPDATA%/<APP_NAME>/<APP_NAME>/.<app-name>/
├── config.json
├── tts.json
├── database.db (SQLite)
├── saves/
└── memory/
```

**Other frameworks**: Check against the architecture defined in the corresponding sub-skill.

### 8. Build Artifact Cleanup

```bash
# release/ directory should only contain the installer
ls release/
# Expected: only *.exe / *.dmg / *.AppImage / *.apk
# Should NOT contain: win-unpacked/, *.blockmap, builder-debug.yml, latest.yml

# dist/ should not contain standalone images (if embedded)
ls dist/images/ dist/*.png 2>/dev/null && echo "WARNING: standalone images" || echo "PASS"
```

### 9. Network Verification (Desktop Apps)

Launch the application with a network monitoring tool active (Wireshark, Fiddler, Charles Proxy, or `netstat`).

| Check | Method | Pass Criteria |
|-------|--------|--------------|
| No unexpected outbound connections | Monitor network traffic for 60 seconds after launch | Only expected connections (user-configured API, license server, update server) |
| No telemetry without consent | Check for analytics/telemetry endpoints | User explicitly opted in, or none present |
| DNS requests match expected domains | Filter DNS queries | Only configured domains appear |

### 10. Performance Assessment

| Metric | Method | Reference |
|--------|--------|-----------|
| Package size | `ls -lh` | Electron: 130-180MB / Tauri: 3-10MB |
| Startup time | Double-click to UI display | < 5 seconds |
| Memory usage | Task Manager | Electron: 200-500MB |

### 10. User Requirements Completeness

Review all requirements collected before packaging:

| Requirement Category | Check Item |
|---------------------|------------|
| Platform | Target platforms correct? |
| Architecture | Target architectures correct? |
| Info | App name/version correct? |
| Logo | Logo displays correctly? |
| Output | Package at correct location? |
| Encryption | Encryption functional? |
| Cleanup | Test data cleared? |
| Security | API keys cleared? |
| Corners | Logo corners handled correctly? |
| Signing | Platform signing correct? (macOS mandatory) |

### 11. Platform-Specific Checks

**Windows**:
- NSIS installer wizard works
- Desktop shortcut created
- Start menu entry exists
- Uninstall works correctly

**macOS**:
- DMG opens correctly
- Drag-to-install works
- Code signature valid (`codesign -v App.app`)
- Gatekeeper does not block

**Linux**:
- AppImage is executable (`chmod +x *.AppImage && ./AppImage`)
- deb installs correctly (`dpkg -i *.deb`)

---

## Audit Report Template

```
═══════════════════════════════════════
          POST-BUILD AUDIT
═══════════════════════════════════════

[BUILD ARTIFACTS]
✅ TypeScript compilation 0 errors
✅ Syntax check passed
✅ Encryption files format correct
✅ No credential leaks

[PACKAGE]
✅ Package valid (XXX MB)
✅ Logo displays correctly
✅ License info correct

[APPLICATION]
✅ Launches normally
✅ Database created correctly
✅ Data persistence works
✅ Data clear leaves no residue

[SECURITY]
✅ Credentials cleared
✅ No source map files in package
✅ No .env files in package
✅ Source code obfuscated
✅ Content encrypted
✅ Images embedded (anti-theft)
✅ No unexpected network connections

[CLEANUP]
✅ No residual build artifacts

[USER REQUIREMENTS]
✅ All requirements met

[CONCLUSION]
All checks passed. Ready for delivery.

[PACKAGE LOCATION]
release/<filename> (<size>MB)
═══════════════════════════════════════
```
