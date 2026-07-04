# WebAssembly Build Sub-Skill

Compile Rust, Go, C/C++, or AssemblyScript to WebAssembly (.wasm) for browser and edge runtime use.

**Current version**: WASM 2.0 / wasm-pack 0.13 / Emscripten 3.1 (2025-2026)

## When to Use

- Performance-critical code in the browser (image processing, crypto, physics, codecs)
- Reuse existing Rust/Go/C libraries in web frontends
- Edge computing (Cloudflare Workers, Fastly Compute)
- Plugin systems (WASM sandboxed execution)
- Game engines in the browser

## Rust → WASM (Recommended Path)

### Prerequisites

```bash
# Rust toolchain with WASM target
rustup target add wasm32-unknown-unknown

# wasm-pack (build tool + npm package generator)
cargo install wasm-pack

# wasm-bindgen (JS ↔ Rust interop)
# (automatically used by wasm-pack)
```

### Project Setup

```bash
# Create library crate
cargo new --lib my-wasm-lib
cd my-wasm-lib
```

```toml
# Cargo.toml
[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1", features = ["derive"] }
serde-wasm-bindgen = "0.6"
js-sys = "0.3"
web-sys = { version = "0.3", features = ["console"] }
```

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[wasm_bindgen]
pub fn process_image(data: &[u8], width: u32, height: u32) -> Vec<u8> {
    // Heavy computation that would be slow in JS
    data.iter().map(|&pixel| 255 - pixel).collect()
}

// Access browser APIs via web-sys
#[wasm_bindgen]
pub fn log_to_console(msg: &str) {
    web_sys::console::log_1(&msg.into());
}
```

### Build

```bash
# Build for bundler (webpack/vite/rollup)
wasm-pack build --target web
# Output: pkg/my_wasm_lib_bg.wasm + pkg/my_wasm_lib.js

# Build for Node.js
wasm-pack build --target nodejs

# Build for direct browser (no bundler)
wasm-pack build --target no-modules

# Release optimized
wasm-pack build --target web --release
```

### Use in JavaScript

```javascript
// With bundler (Vite/Webpack)
import init, { fibonacci, process_image } from './pkg/my_wasm_lib.js';

await init(); // Initialize WASM module
console.log(fibonacci(40)); // Fast!

// With vanilla HTML (no-modules target)
// <script src="./pkg/my_wasm_lib.js"></script>
// my_wasm_lib().then(module => { module.fibonacci(40); });
```

### Vite Integration

```bash
# vite-plugin-wasm 3.6+ and vite-plugin-top-level-await 1.6+ both support Vite 2-8
npm install vite-plugin-wasm vite-plugin-top-level-await
```

```javascript
// vite.config.js
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default {
  plugins: [wasm(), topLevelAwait()],
};
```

## Go → WASM

```bash
# Go has built-in WASM support (GOOS=js GOARCH=wasm)
GOOS=js GOARCH=wasm go build -o main.wasm .

# Copy the WASM exec helper
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

# The wasm_exec.js file is required to load the WASM module in browsers
```

```go
// main.go
package main

import (
    "fmt"
    "syscall/js"
)

func fibonacci(this js.Value, args []js.Value) interface{} {
    n := args[0].Int()
    if n <= 1 { return n }
    a, b := 0, 1
    for i := 2; i <= n; i++ { a, b = b, a+b }
    return b
}

func main() {
    c := make(chan struct{})
    js.Global().Set("fibonacci", js.FuncOf(fibonacci))
    fmt.Println("Go WASM initialized")
    <-c // Keep running
}
```

```html
<!-- Load in browser -->
<script src="wasm_exec.js"></script>
<script>
const go = new Go();
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
  .then(result => {
    go.run(result.instance);
    console.log(fibonacci(40));
  });
</script>
```

## C/C++ → WASM (Emscripten)

```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install latest && ./emsdk activate latest
source ./emsdk_env.sh

# Compile C to WASM
emcc myfile.c -o myfile.js -s WASM=1 -s EXPORTED_FUNCTIONS='["_process_data"]' -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

# Compile with optimization
emcc myfile.c -o myfile.js -O3 -s WASM=1 --closure 1
```

## AssemblyScript → WASM

```bash
# AssemblyScript: TypeScript-like syntax compiled to WASM
npm install -g assemblyscript
npx asc myModule.ts --outFile myModule.wasm --optimize
```

```typescript
// myModule.ts (AssemblyScript — NOT regular TypeScript)
export function fibonacci(n: i32): i32 {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = b;
    b = a + b;
    a = temp;
  }
  return b;
}
```

## Size Optimization

| Technique | Tool | Typical Savings |
|-----------|------|----------------|
| `wasm-opt` | `wasm-pack` runs automatically | 10–30% |
| `--release` flag | All toolchains | 40–60% vs debug |
| `wee_alloc` | Rust: `#[global_allocator]` | 10–20KB |
| Feature gates | Cargo: `default-features = false` | Varies |
| `twiggy` profiler | `cargo install twiggy` | Identify bloat |
| Brotli compression | Server-side | 70–80% transfer size |

```rust
// Use wee_alloc to reduce WASM binary size
extern crate wee_alloc;
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| WASM binary too large | Use `--release`; enable `wee_alloc`; check features with `twiggy` |
| `wasm-pack build` fails | Ensure `wasm-bindgen` version matches `wasm-pack` version |
| Vite doesn't load WASM | Add `vite-plugin-wasm` and `vite-plugin-top-level-await` |
| Go WASM not loading | Must include `wasm_exec.js` from Go installation |
| CORS error when loading .wasm | Serve from same origin; add MIME type `application/wasm` |
| Can't use `console.log` from Rust | Use `web_sys::console::log_1` via `web-sys` crate |
| Memory grows unbounded | Use `#[wasm_bindgen]` memory management; call `drop()` explicitly |
| Debugging is hard | Use `console_error_panic_hook` crate for Rust; `console.log` for Go |
| Thread support | WASM threads require `SharedArrayBuffer` + COOP/COEP headers |
| SIMD support | Use `wasm32-unknown-unknown` target with nightly or stable 1.72+ |
