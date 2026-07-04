# Rust Backend Build Sub-Skill

Build and package Rust backend services (Axum/Actix-Web/Rocket/Warp).

**Current version**: Rust 1.82+ / Axum 0.7 / Actix-Web 4.x (2025-2026)

## When to Use

- High-performance API services
- Microservices requiring low latency and minimal memory
- WebSocket servers
- System-level services (CLI backends, daemons)
- Security-sensitive backends (memory safety guaranteed by compiler)

## Build

```bash
# Standard build
cargo build --release
# Output: target/release/myapp

# With version embedding
cargo build --release
# In build.rs:
# println!("cargo:rustc-env=APP_VERSION={}", env!("CARGO_PKG_VERSION"));

# Static binary (no system dependencies)
RUSTFLAGS='-C target-feature=+crt-static' cargo build --release --target x86_64-unknown-linux-gnu

# Cross-compile
cargo install cross
cross build --release --target x86_64-unknown-linux-gnu
cross build --release --target aarch64-unknown-linux-gnu
cross build --release --target x86_64-pc-windows-gnu
cross build --release --target x86_64-apple-darwin
```

## Framework Quick Start

### Axum (Recommended — Tokio team)

```rust
use axum::{routing::get, Router};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/health", get(|| async { "OK" }));

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
        .await
        .unwrap();
}
```

### Actix-Web (Highest raw performance)

```rust
use actix_web::{web, App, HttpServer, HttpResponse};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(|| async { HttpResponse::Ok().body("Hello!") }))
            .route("/health", web::get().to(|| async { HttpResponse::Ok().body("OK") }))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
```

## Docker

```dockerfile
FROM rust:1.82-slim AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
# Cache dependencies (create dummy src)
RUN mkdir src && echo 'fn main(){}' > src/main.rs && cargo build --release && rm -rf src
COPY src/ src/
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=builder /app/target/release/myapp /myapp
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8080/health || exit 1
CMD ["/myapp"]
```

## Selection Guide

| Framework | Async Runtime | Performance | Ecosystem | Best For |
|-----------|--------------|-------------|-----------|----------|
| Axum | Tokio | High | Growing fast | New projects, middleware-heavy |
| Actix-Web | Tokio | Highest | Mature | Maximum throughput |
| Rocket | Tokio | High | Good | Rapid prototyping, ergonomic API |
| Warp | Tokio | High | Smaller | Filter-based routing |
| Poem | Tokio | High | Growing | OpenAPI integration |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Binary too large | Use `strip = true` in Cargo.toml `[profile.release]`; use `upx --best` |
| Slow compile | Use `sccache`; enable incremental compilation; reduce dependencies |
| Cross-compile fails | Use `cross` tool; or Docker-based cross-compilation |
| `openssl` build fails | Use `rustls` (pure Rust TLS) instead of native OpenSSL |
| Missing system libs in Docker | Use `debian:bookworm-slim` (not `alpine`) for glibc compatibility |
| Static linking issues | Use `x86_64-unknown-linux-musl` target for fully static binary |
