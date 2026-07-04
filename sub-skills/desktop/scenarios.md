# Desktop Application Scenarios Guide

Covers the most common desktop application types for indie developers and small teams. Each scenario provides specific technology recommendations and packaging considerations.

---

## Scenario 1: AI Chatbot / Knowledge Base

**Reference Products**: Claude Desktop, ChatGPT Desktop, OpenCat

**Recommended Stack**: Electron + React + Express + SQLite

**Key Requirements**:
- LLM API calls (streaming response)
- Local conversation history persistence
- TTS voice synthesis (optional)
- Multi-model switching

**Packaging Considerations**:
- SSE streaming adaptation (ensure correct forwarding in Electron)
- Store conversation history in SQLite (more reliable than localStorage)
- Encrypt API keys (AES-256-CBC)
- TTS audio queue management (prevent concurrent playback)

**Typical Size**: 130–180MB

---

## Scenario 2: Cloud Architecture Monitor

**Reference Products**: Portainer Desktop, Lens, k9s GUI

**Recommended Stack**: Electron/Tauri + React + Go backend

**Key Requirements**:
- Connect to multiple cloud clusters (K8s, Docker)
- Real-time status refresh (WebSocket)
- Resource topology visualization
- Alert push notifications

**Packaging Considerations**:
- WebSocket connections need correct proxy in Electron
- kubeconfig file secure storage
- TLS certificate handling (self-signed certificates)
- System notification integration

**Typical Size**: 100–150MB

---

## Scenario 3: Local ERP / OA System

**Reference Products**: Kingdee Desktop, Yonyou U8 Client

**Recommended Stack**: Electron + Vue/React + Node/Java + MySQL/SQLite

**Key Requirements**:
- Complex forms and reports
- Print module (invoices, contracts)
- File export (Excel, PDF)
- Multi-role permissions

**Packaging Considerations**:
- Print: `window.print()` or system print API
- Excel export: `xlsx` library (note file save path in Electron)
- PDF generation: `pdfmake` or `puppeteer`
- Large data table virtual scrolling
- Offline-first architecture (local cache, sync on reconnect)

**Typical Size**: 150–200MB

---

## Scenario 4: Quantitative Trading Terminal

**Reference Products**: JoinQuant Terminal, QMT, TradingView Desktop

**Recommended Stack**: Electron + React + Python/C++ backend

**Key Requirements**:
- Real-time market data push (WebSocket/MQTT)
- K-line chart rendering (Canvas/WebGL)
- Backtesting engine
- Strategy editor
- Order execution

**Packaging Considerations**:
- High-frequency data: WebSocket connection pool management
- Chart performance: `lightweight-charts` or `echarts` + Canvas
- Python backend integration: subprocess or HTTP API with Python backtest engine
- Security: encrypt trading keys
- Offline cache: historical market data in SQLite

**Typical Size**: 100–200MB

---

## Scenario 5: IoT Control Panel

**Reference Products**: Tuya Smart Desktop, Home Assistant Desktop

**Recommended Stack**: Tauri/Electron + Vue + Go/MQTT

**Key Requirements**:
- MQTT device communication
- Device state real-time display
- Scene automation configuration
- Data history charts

**Packaging Considerations**:
- MQTT client: `mqtt.js` (Web) or native MQTT library
- Device discovery: UDP broadcast (requires native network permission)
- Low power: reduce refresh rate when backgrounded
- System tray: resident background, notification push

**Typical Size**: 50–100MB

---

## Scenario 6: IM Chat Client

**Reference Products**: Telegram Desktop, Feishu, WeCom

**Recommended Stack**: Electron/Tauri + React + Go/Rust

**Key Requirements**:
- Real-time messaging (WebSocket)
- File/image transfer
- Group/channel support
- Message search
- Local message cache

**Packaging Considerations**:
- Message encryption: E2E encryption (Signal Protocol or custom)
- File transfer: chunked upload/download, resume support
- Message storage: SQLite + FTS5 full-text search
- Notification: native system notifications + unread badge
- Custom protocol: `myapp://` protocol handler (for link jumps)

**Typical Size**: 100–200MB

---

## Scenario 7: SaaS Desktop Client

**Reference Products**: Notion Desktop, Linear, Slack

**Recommended Stack**: Electron/Tauri + React/Vue

**Key Requirements**:
- Feature parity with web version
- Desktop notifications
- Offline support (optional)
- File drag-and-drop upload
- Deep links (`myapp://`)

**Packaging Considerations**:
- If essentially a web wrapper: Pake or Electron both work
- Offline support: Service Worker + IndexedDB
- Auto-update: `electron-updater` (Electron) or Tauri built-in updater
- Single instance lock: prevent duplicate windows
- Window state memory: remember size and position

**Typical Size**: 100–150MB

---

## Scenario 8: Database Management Tool

**Reference Products**: Navicat, DBeaver, pgAdmin Desktop

**Recommended Stack**: Electron + React + Go/Rust

**Key Requirements**:
- Multi-database connection (MySQL/PostgreSQL/SQLite/MongoDB)
- SQL editor (syntax highlighting, autocomplete)
- Table structure management
- Data import/export
- Query history

**Packaging Considerations**:
- Multi-database drivers: Go/Rust backend wraps native drivers, communicates via IPC
- SQL editor: Monaco Editor or CodeMirror
- Large dataset handling: virtual scrolling + pagination
- Connection config encrypted storage

**Typical Size**: 100–200MB

---

## Scenario 9: Indie Game

**Reference Products**: Stardew Valley, Hollow Knight, Hades

**Recommended Engine**:
- **Unity**: 2D/3D universal, C#, most mature cross-platform
- **Godot**: Free and open-source, GDScript/C#, lightweight

**Key Requirements**:
- Game loop and rendering
- Input handling (keyboard/mouse/gamepad)
- Audio engine
- Save system
- Steam/itch.io integration

**Packaging Considerations**:
- Unity: IL2CPP build + Asset Bundles
- Godot: export templates + resource packaging
- Steam integration: Steamworks SDK (achievements, leaderboard, cloud saves)
- Performance: shader compilation, texture compression, LOD system

**Typical Size**: 200–500MB

---

## Scenario 10: Online Education Client

**Reference Products**: Youdao Dictionary, Tencent Classroom, Zoom

**Recommended Stack**: Electron + React + WebRTC

**Key Requirements**:
- Video live/recorded playback
- Screen sharing
- Whiteboard functionality
- Chat/danmaku
- Courseware display (PPT/PDF)

**Packaging Considerations**:
- WebRTC: `simple-peer` or `mediasoup-client`
- Screen sharing: Electron `desktopCapturer` API
- Video playback: HLS/DASH streaming (`hls.js`, `dash.js`)
- Whiteboard: Canvas drawing + real-time sync
- Audio: echo cancellation (AEC), noise suppression (ANS)

**Typical Size**: 150–250MB

---

## Scenario 11: Note-Taking / Knowledge Base

**Reference Products**: Obsidian, Logseq, Notion Desktop

**Recommended Stack**: Electron/Tauri + React + SQLite

**Key Requirements**:
- Markdown editor
- Bidirectional linking
- Full-text search
- Local file sync
- Plugin system (optional)

**Packaging Considerations**:
- Markdown editor: `@codemirror/view` or `tiptap`
- Full-text search: SQLite FTS5 or `minisearch`
- File watching: `chokidar` for local file changes
- Image paste: `clipboard.readImage()` + save locally
- Performance: virtual scrolling + lazy rendering for large note sets

**Typical Size**: 100–150MB

---

## Universal Packaging Checklist

Regardless of scenario, confirm before packaging:

1. Data persistence path correct (userData directory)
2. API keys encrypted storage
3. Static resource paths adapted (image embedding or public/)
4. Native modules correctly packaged (asarUnpack)
5. Package logo and copyright info correct
6. Intermediate artifacts cleaned
7. First install launches successfully
8. Data clear leaves no residue

---

## Scenario 12: SaaS Desktop Client with Payment System

**Reference Products**: Notion, Linear, Figma Desktop, Slack

**Recommended Stack**: Electron/Tauri + React/Vue + Stripe/Alipay

**Key Requirements**:
- Feature parity with web version
- Subscription management (monthly/yearly plans)
- Payment integration (Stripe for global, Alipay/WeChat Pay for China)
- License verification (prevent piracy)
- Trial period management

**Packaging Considerations**:
- Payment: Use Stripe Checkout (redirect to Stripe-hosted page, PCI-compliant)
- License verification: Server-side validation on startup; cache license locally with expiration
- Anti-piracy: Bind license to machine ID (`os.hostname()` + hardware fingerprint)
- Auto-update: electron-updater with differential updates (reduce bandwidth for paying users)
- Offline grace period: Allow 7-30 days offline before requiring re-validation

**Real Problem & Solution**:
- **Problem**: Users share license keys. Each key works on unlimited machines.
- **Solution**: Generate machine-specific activation tokens. Allow 3-5 activations per license. Server-side deactivation API.

**Typical Size**: 100–150MB

---

## Scenario 13: Offline-First Field Service Application

**Reference Products**: Fulcrum, ProntoForms, custom industrial inspection tools

**Recommended Stack**: Electron + React + SQLite + Sync Engine

**Key Requirements**:
- Must work completely offline (factory floor, remote areas)
- Data sync when connectivity returns (conflict resolution)
- Photo/video capture with annotation
- Form builder for custom inspection templates
- GPS/location tagging

**Packaging Considerations**:
- Database: SQLite with WAL mode (better concurrent read/write)
- Sync engine: CRDT (Conflict-free Replicated Data Types) or last-write-wins with conflict UI
- Media storage: Store photos/videos in userData directory; compress before sync
- Network detection: `navigator.onLine` + actual connectivity check (ping server)
- Large data: Paginated sync; don't try to sync 10GB of photos at once

**Real Problem & Solution**:
- **Problem**: User collects 500 inspection records offline. When reconnecting, sync takes 20 minutes and fails midway.
- **Solution**: Incremental sync with checkpoint. Each record synced individually. Resume from last successful record on failure. Show progress bar.

**Typical Size**: 150–250MB

---

## Scenario 14: AI-Powered Desktop Application with Local Model

**Reference Products**: Ollama Desktop, LM Studio, Cursor, Continue.dev

**Recommended Stack**: Electron + React + Ollama/llama.cpp + SQLite

**Key Requirements**:
- Local LLM inference (no cloud API dependency)
- Model management (download, switch, delete models)
- Chat interface with streaming response
- Document RAG (Retrieval-Augmented Generation)
- GPU detection and optimization

**Packaging Considerations**:
- Model storage: Large files (4-70GB); store outside app directory; allow user to choose location
- GPU detection: Check CUDA/Metal/Vulkan availability at startup; fallback to CPU
- Memory management: Monitor RAM/VRAM usage; warn before loading models that exceed available memory
- Streaming: Use Server-Sent Events (SSE) between main process and renderer
- Binary distribution: Ship llama.cpp binary as extraResource; detect platform at runtime

**Real Problem & Solution**:
- **Problem**: App ships with llama.cpp binary compiled for AVX2. User's CPU only supports AVX. App crashes silently.
- **Solution**: Detect CPU features at startup. Ship multiple binaries (AVX, AVX2, ARM NEON). Select the best one dynamically. Show clear error if none compatible.

**Typical Size**: 150–200MB (without models)

---

## Scenario 15: Hardware Integration Application (Serial Port / USB / BLE)

**Reference Products**: Arduino IDE, PlatformIO, PuTTY, serial terminal tools

**Recommended Stack**: Electron + React + serialport/noble/usb + native modules

**Key Requirements**:
- Serial port communication (RS-232, RS-485, USB-to-serial)
- USB device access (HID, custom protocols)
- Bluetooth Low Energy (BLE) communication
- Real-time data visualization (oscilloscope-style charts)
- Firmware flashing / OTA update for connected devices

**Packaging Considerations**:
- Native modules: `serialport`, `usb`, `@abandonware/noble` — ALL require `asarUnpack`
- Permissions: macOS requires entitlements for USB/BLE access; Windows may need driver installation
- Platform differences: Serial port paths differ (`/dev/ttyUSB0` vs `COM3`)
- Real-time data: Use `requestAnimationFrame` for chart rendering; don't block main process
- Firmware flashing: Binary protocol over serial; implement retry + verification

**Real Problem & Solution**:
- **Problem**: `serialport` module works in dev but fails in packaged app with "Cannot find module".
- **Solution**: `asarUnpack` + `electron-rebuild`. The `.node` binary must be rebuilt for Electron's ABI and placed in unpacked directory.

**Typical Size**: 130–180MB

---

## Scenario 16: Multi-Tenant Enterprise Application

**Reference Products**: Odoo Desktop, SAP Business One, custom ERP clients

**Recommended Stack**: Electron + React/Vue + Go/Rust backend + PostgreSQL

**Key Requirements**:
- Multi-tenant data isolation (separate databases or schemas per tenant)
- Role-based access control (RBAC)
- Audit logging (who did what when)
- Single Sign-On (SSO) via SAML/OIDC
- Data export (Excel, PDF, CSV)

**Packaging Considerations**:
- Database: Don't bundle PostgreSQL; connect to external server. SQLite only for local cache.
- SSO: Open external browser for OAuth flow; handle callback via custom protocol (`myapp://callback`)
- Audit log: Write to separate SQLite database; don't mix with business data
- Multi-tenant switching: Store tenant token in keychain (not localStorage)
- Large datasets: Virtual scrolling for tables with 10,000+ rows

**Real Problem & Solution**:
- **Problem**: User switches between 5 tenants. Each tenant has different permissions. App shows stale permissions from previous tenant.
- **Solution**: Clear all cached permissions on tenant switch. Re-fetch user role from server. Show loading state during transition.

**Typical Size**: 150–200MB

---

## Scenario 17: Real-Time Collaboration Application

**Reference Products**: Figma, Excalidraw, Miro, Notion (collaborative editing)

**Recommended Stack**: Electron/Tauri + React + Yjs/CRDT + WebSocket

**Key Requirements**:
- Real-time collaborative editing (multiple cursors, live changes)
- Conflict resolution (CRDT or OT)
- Presence awareness (who's online, where they're editing)
- Offline editing with sync on reconnect
- Large document handling

**Packaging Considerations**:
- CRDT library: Yjs (recommended) or Automerge for conflict-free merging
- WebSocket: Reconnect with exponential backoff; queue changes while offline
- Cursor sync: Throttle cursor position updates to 10/second max
- Performance: Use Web Workers for CRDT operations on large documents
- Memory: Yjs documents can grow large; implement garbage collection for old operations

**Real Problem & Solution**:
- **Problem**: 10 users editing a 500-page document simultaneously. Memory usage grows to 2GB+. App becomes unresponsive.
- **Solution**: Implement document chunking (load only visible pages). Use Yjs sub-documents for lazy loading. Compress old CRDT operations periodically.

**Typical Size**: 100–150MB
