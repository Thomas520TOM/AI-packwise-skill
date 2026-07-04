# Go Backend Build Sub-Skill

Build Go backend services (Gin/Echo/Fiber/Axum-like stdlib).

**Current version**: Go 1.24+ / 1.25 / 1.26 (2025-2026)

## When to Use

- High-performance REST/gRPC API services
- CLI tools with embedded server
- Microservices requiring low memory footprint
- Network services (proxy, gateway, load balancer)
- Concurrent/parallel processing services

## Framework Quick Start

### Gin (Most Popular)

```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
    r.GET("/api/users", getUsers)
    r.Run(":8080")
}
```

### Echo (Lightweight)

```go
package main

import "github.com/labstack/echo/v4"

func main() {
    e := echo.New()
    e.GET("/health", func(c echo.Context) error { return c.JSON(200, map[string]string{"status": "ok"}) })
    e.Logger.Fatal(e.Start(":8080"))
}
```

### Fiber (Express-like, fastest)

```go
package main

import "github.com/gofiber/fiber/v3"

func main() {
    app := fiber.New()
    app.Get("/health", func(c fiber.Ctx) error { return c.JSON(map[string]string{"status": "ok"}) })
    app.Listen(":8080")
}
```

### net/http (Standard Library, Zero Dependencies)

```go
package main

import (
    "encoding/json"
    "net/http"
)

func main() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
    })
    http.ListenAndServe(":8080", nil)
}
```

### Framework Comparison

| Framework | Performance | Middleware | Ecosystem | Best For |
|-----------|------------|-----------|-----------|----------|
| Gin | High | Rich | Largest | General-purpose APIs |
| Echo | High | Rich | Large | Clean API design |
| Fiber | Highest | Rich | Growing | Express-style, max performance |
| net/http | High | Manual | Stdlib | Zero-dependency, simple APIs |
| Chi | High | Composable | Moderate | RESTful APIs, middleware chains |

## Build

```bash
# Standard build
go build -o myapp .

# Optimized release build
CGO_ENABLED=0 go build -ldflags="-s -w" -o myapp .

# With version embedding
go build -ldflags="-s -w \
  -X main.version=$(git describe --tags --always) \
  -X main.buildDate=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -o myapp .

# Cross-compile
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o myapp-linux .
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o myapp.exe .
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o myapp-mac .
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o myapp-mac-intel .
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o myapp-linux-arm64 .

# Build all platforms at once
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o dist/myapp-linux-amd64 .
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o dist/myapp-linux-arm64 .
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o dist/myapp-darwin-arm64 .
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o dist/myapp-darwin-amd64 .
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o dist/myapp-windows-amd64.exe .
```

## Docker

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o myapp .

FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata && \
    addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/myapp /myapp
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["/myapp"]
```

## Embed Static Files

```go
package main

import "embed"

//go:embed static/*
var staticFiles embed.FS

func main() {
    http.Handle("/", http.FileServer(http.FS(staticFiles)))
}
```

## gRPC Build

```protobuf
// proto/service.proto
syntax = "proto3";
package myservice;
service MyService {
    rpc GetUser(GetUserRequest) returns (User);
}
```

```bash
# Generate Go code
protoc --go_out=. --go-grpc_out=. proto/service.proto

# Build server and client
go build -o server ./cmd/server
go build -o client ./cmd/client
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| CGO dependency fails cross-compile | Use `CGO_ENABLED=0`; or use `cross` Docker image |
| Timezone issues in container | Install `tzdata` package in Alpine image |
| Static files not included | Use `//go:embed` directive (Go 1.16+) |
| Binary too large | Use `ldflags="-s -w"`; strip debug symbols |
| `go.sum` mismatch in CI | Run `go mod tidy`; commit both `go.mod` and `go.sum` |
| Import cycle | Restructure packages; use interfaces to break cycles |
| Race condition | Run with `-race` flag during testing |
| Memory leak in long-running | Use `pprof` for profiling; check goroutine leaks |
