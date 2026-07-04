# Node.js Backend Build Sub-Skill

Build Node.js backend services (Express/NestJS/Fastify/Koa/Hono).

**Current version**: Node.js 26 LTS / 22 LTS (2025-2026)

> ⚠️ **Breaking changes since Node 22**: v23 enables `require(esm)` by default. v26 removes `http.writeHeader()` (use `writeHead()`), removes legacy `_stream_*` modules, enables Temporal API, upgrades V8 to 14.6 and Undici to 8.0. Native modules compiled for Node 22 need recompilation for Node 26.

## When to Use

- REST API / GraphQL API service
- WebSocket service
- Microservice / API gateway
- Full-stack application backend
- Serverless functions

## Framework Quick Start

### Express (Most Popular)

```javascript
const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000);
```

### Fastify (High Performance)

```javascript
import Fastify from 'fastify';
const app = Fastify({ logger: true });
app.get('/health', async () => ({ status: 'ok' }));
await app.listen({ port: 3000 });
```

### NestJS (Enterprise, TypeScript-first)

```bash
npm i -g @nestjs/cli
nest new my-app
npm run build    # outputs to dist/
npm run start:prod
```

### Hono (Edge-first, ultra-lightweight)

```javascript
import { Hono } from 'hono';
const app = new Hono();
app.get('/health', (c) => c.json({ status: 'ok' }));
export default app;
```

### Framework Comparison

| Framework | Performance | TypeScript | Ecosystem | Best For |
|-----------|------------|-----------|-----------|----------|
| Express | Good | Optional | Largest | General purpose, tutorials |
| Fastify | High | First-class | Large | Performance-critical APIs |
| NestJS | Good | Required (default) | Large | Enterprise, complex architecture |
| Koa | Good | Optional | Moderate | Minimalist Express alternative |
| Hono | Highest | First-class | Growing | Edge runtime, serverless |

## Build

```bash
# Express/Fastify/Koa/Hono: run directly (no build step for JS)
node dist/server.js

# TypeScript projects
npx tsc                    # Compile TypeScript to JS
# or esbuild (faster)
npx esbuild src/index.ts --bundle --platform=node --format=cjs --outfile=dist/server.cjs
# or tsx (run TypeScript directly, development)
npx tsx src/index.ts

# NestJS: requires compilation
npm run build  # outputs to dist/

# Bun runtime (alternative to Node.js, faster)
bun run src/index.ts
```

## Docker

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

## PM2 Process Manager

```bash
npm install -g pm2
pm2 start dist/server.js --name myapp -i max   # Cluster mode (all CPU cores)
pm2 start dist/server.js --name myapp -i 4     # 4 instances
pm2 save && pm2 startup                         # Auto-start on reboot
pm2 logs myapp                                  # View logs
pm2 monit                                       # Monitoring dashboard
pm2 reload myapp                                # Zero-downtime restart
```

## Environment Variables

```javascript
// Use dotenv for development
require('dotenv').config();

// Access: process.env.DATABASE_URL, process.env.PORT, etc.
// NEVER commit .env files to git
```

```bash
# Local: .env file (add to .gitignore)
# Production: platform env vars or secrets manager
# Type-safe env: use @t3-oss/env-nextjs or zod
```

## Cloud Platforms

| Platform | Method | Cost | Best For |
|----------|--------|------|---------|
| Railway | Git push auto-deploy | Free/pay-as-you-go | Quick deploy |
| Render | Git push auto-deploy | Free/pay-as-you-go | Quick deploy |
| Fly.io | Docker deploy | Free/pay-as-you-go | Global edge |
| Vercel | Serverless Functions | Free/pay-as-you-go | Next.js, API routes |
| AWS EC2 | PM2/Docker | Per instance | Full control |
| Aliyun ECS | PM2/Docker | Per instance | China access |
| Deno Deploy | Git push | Free tier | Hono, edge functions |
| Bun.sh | `bun run` | Free tier | Ultra-fast startup |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Port in use | `lsof -i :3000` to check; use `kill -9 <PID>` |
| Memory leak | PM2: `--max-memory-restart 500M`; check for event listener leaks |
| Process crash loop | Check logs: `pm2 logs`; add error handling middleware |
| CORS error | `app.use(cors())` with Express; configure allowed origins |
| HTTPS in production | Nginx reverse proxy + Let's Encrypt (see cloud/docker.md) |
| `MODULE_NOT_FOUND` | Check `node_modules`; run `npm ci` (not `npm install` in production) |
| TypeScript path aliases not working | Use `tsc-alias` or `tsconfig-paths` after build |
| Async error not caught | Use `express-async-errors` or wrap in try/catch |
| Bun compatibility | Some npm packages don't support Bun; test thoroughly |
