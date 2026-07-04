# Docker Containerization Sub-Skill

Containerize any project for deployment using Docker.

## When to Use

- Backend service containerization
- Frontend static resource containerization
- Full-stack application containerization
- Microservice architecture
- Development environment standardization

## Dockerfile Templates

### Node.js Application

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
RUN apk add --no-cache tini && \
    addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

### Python Application

```dockerfile
FROM python:3.13-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

### Go Application

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

### Static Frontend

```dockerfile
FROM nginx:alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /usr/share/nginx/html
USER appuser
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1
```

## Docker Compose

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
volumes:
  pgdata:
```

> **Security**: Never hardcode passwords in docker-compose.yml. Use `.env` file (add to `.gitignore`) or Docker secrets.

> **Best practice**: Commit a `.env.example` file (without real values) to version control so other developers know which environment variables are required. The actual `.env` file must remain in `.gitignore`.
>
> ```text
> # .env.example (commit this — no real values)
> POSTGRES_USER=your_user
> POSTGRES_PASSWORD=
> POSTGRES_DB=your_db
> ```

## .dockerignore (Required)

```text
# .dockerignore — must be in the same directory as Dockerfile
node_modules
.git
.gitignore
.env
.env.*
*.md
.dockerignore
Dockerfile
docker-compose*.yml
.vscode
.idea
coverage
test
tests
*.log
dist
build
```

## Image Security Scanning

```bash
# Scan for vulnerabilities before pushing
docker scout cves myapp:latest           # Docker Scout (built-in)
trivy image myapp:latest                 # Trivy (open-source)
grype myapp:latest                       # Anchore Grype

# Scan in CI
docker scout cves --only-severity critical,high myapp:latest
```

## Best Practices

| Practice | Description |
|----------|-------------|
| Multi-stage build | Reduce image size by separating build and runtime |
| Alpine base image | Smaller images (5MB vs 100MB+ for Debian) |
| .dockerignore | Exclude node_modules, .git, .env, tests |
| Non-root user | Run as non-root in production (`USER appuser`) |
| Health check | `HEALTHCHECK` instruction for container orchestration |
| Pinned versions | Avoid `latest` tag; use specific versions (`node:22.3.1-alpine`) |
| No secrets in image | Use env vars, Docker secrets, or mounted volumes |
| Image scanning | Scan for CVEs before pushing (`docker scout cves`) |
| Read-only filesystem | `--read-only` flag prevents runtime file modifications |
| No `ADD` when `COPY` suffices | `ADD` can fetch URLs and extract archives (security risk) |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Large image | Multi-stage build + Alpine |
| Slow build | Leverage Docker layer caching |
| Permission issues | Use non-root user |
| Timezone | Set `TZ` environment variable |
