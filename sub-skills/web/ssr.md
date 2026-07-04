# SSR (Server-Side Rendering) Build Sub-Skill

Build and package SSR frameworks (Next.js / Nuxt / Remix / SvelteKit / Astro).

**Current versions**: Next.js 16 / Nuxt 3.x / Remix 2.x / SvelteKit 2.x / Astro 5.x (2025-2026)

> ⚠️ **Next.js 16 Breaking Changes** (released Oct 2025):
> - **Turbopack is default bundler** — custom `webpack` configs will fail. Use `next build --webpack` to opt out.
> - `params` and `searchParams` must be `await`ed (synchronous access removed).
> - `cookies()` and `headers()` must be `await`ed.
> - **`middleware.ts` deprecated** → rename to `proxy.ts`, export `proxy` function (runs on Node.js, not Edge).
> - AMP support fully removed. `next lint` command removed.
> - `serverRuntimeConfig`/`publicRuntimeConfig` removed (use env vars).
> - `experimental.ppr` removed → use `cacheComponents: true`.
> - `next/image`: `minimumCacheTTL` default 60s→14400s, `qualities` default changed to `[75]` only.
> - Node.js 20.9+ required (Node 18 dropped). React 19.2.
> - Run `npx @next/codemod@canary upgrade latest` for automated migration.

## When to Use

- SEO-required websites (blogs, e-commerce, news, marketing)
- Dynamic pages needing server-side rendering
- Full-stack applications with API Routes
- Content-heavy sites with fast initial load
- Hybrid rendering (SSR + SSG + ISR)

## Framework Comparison

| Feature | Next.js 16 | Nuxt 3.x | Remix 2.x | SvelteKit 2.x | Astro 5.x |
|---------|-----------|---------|----------|--------------|----------|
| Base | React | Vue | React | Svelte | Any (React/Vue/Svelte/Solid) |
| Rendering | SSR/SSG/ISR/RSC | SSR/SSG/ISR | SSR | SSR/SSG | SSG + Islands |
| API Routes | App Router | Nitro server | Loaders/Actions | Server routes | Endpoints |
| Edge support | Yes (Vercel/CF) | Yes (Nitro) | Yes | Yes | Yes |
| Best for | Full-stack React | Full-stack Vue | Data-heavy apps | Lightweight full-stack | Content sites |

## Build

### Next.js

```bash
# Build
npm run build
# Output: .next/ directory

# Start production server
npm run start

# Static export (no server needed)
# next.config.js: output: 'export'
npm run build
# Output: out/ directory (can be deployed to any static host)
```

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',          // Self-contained build with Node.js server
  // output: 'export',           // Static HTML export (no server)
  images: {
    unoptimized: true,           // Required for static export
  },
};
module.exports = nextConfig;
```

### Nuxt

```bash
# Build
npm run build
# Output: .output/ directory (includes server)

# Static generation
npm run generate
# Output: .output/public/ directory

# Start production
node .output/server/index.mjs
```

### Remix

```bash
# Build
npm run build
# Output: build/ directory

# Start production
npm run start
```

### SvelteKit

```bash
# Build (requires adapter)
npm run build
# Output depends on adapter (node/static/cloudflare/vercel)
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';    // For Node.js server
// import adapter from '@sveltejs/adapter-static'; // For static export
// import adapter from '@sveltejs/adapter-vercel'; // For Vercel
```

### Astro

```bash
# Build (SSG by default)
npm run build
# Output: dist/ directory

# Build with SSR
# astro.config.mjs: output: 'server'
npm run build
# Output: dist/server/ + dist/client/
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',              // 'static' (default) or 'server'
  adapter: node({ mode: 'standalone' }),
});
```

## Deployment Targets

| Platform | Next.js | Nuxt | Remix | SvelteKit | Astro |
|----------|---------|------|-------|----------|-------|
| Vercel | Native | Adapter | Native | Adapter | Adapter |
| Netlify | Adapter | Adapter | Adapter | Adapter | Adapter |
| Cloudflare Workers | Adapter | Nitro | Adapter | Adapter | Adapter |
| Docker (Node.js) | Standalone | Standard | Standard | Node adapter | Node adapter |
| Static hosting | `output: 'export'` | `generate` | N/A | Static adapter | Default |
| AWS Lambda | OpenNext | Nitro | Remix adapter | Adapter | Adapter |

## Docker (Next.js Standalone)

> ⚠️ **Next.js 16**: Turbopack is now the default bundler. If your project has custom `webpack` config, pass `--webpack` flag to `next build`. `serverRuntimeConfig`/`publicRuntimeConfig` removed — use env variables instead.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
# Standalone output includes minimal node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/ || exit 1
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

## Docker (Nuxt / Generic Node SSR)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["node", ".output/server/index.mjs"]
```

## PM2 (Process Manager)

```bash
npm run build
pm2 start npm --name "myapp" -- start
pm2 save && pm2 startup
# Cluster mode:
pm2 start npm --name "myapp" -i max -- start
```

## Rendering Modes

| Mode | Description | Use Case |
|------|-------------|---------|
| **SSR** | Render on every request | Dynamic content, user-specific pages |
| **SSG** | Pre-render at build time | Static content, documentation |
| **ISR** | Re-render on interval (e.g., every 60s) | Blog posts, product pages |
| **Streaming SSR** | Stream HTML as it renders | Large pages, slow data sources |
| **Partial Prerender** | Static shell + dynamic holes | Mixed content (Next.js 14+) |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Static resource 404 | Next.js: check `assetPrefix`; Nuxt: check `app.baseURL` |
| API Routes not working | Ensure Node.js >= 20.9; check runtime config for serverless |
| Env var leakage | Server vars should NOT have `NEXT_PUBLIC_` prefix (Next.js) |
| Memory leak in long-running | PM2: set `--max-memory-restart 500M`; check for event listener leaks |
| SSR hydration mismatch | Ensure server and client render identical HTML; avoid `Date.now()` in SSR |
| `getServerSideProps` slow | Add caching headers; use ISR; optimize database queries |
| Build fails with "out of memory" | Increase Node.js heap: `NODE_OPTIONS=--max-old-space-size=4096` |
| CSS flash on load (FOUC) | Extract CSS to files (default in most frameworks); avoid inline styles |
| Images not optimized | Next.js: use `<Image>` component; Nuxt: use `<NuxtImg>` |
| Next.js 16: Turbopack breaks build | Custom webpack config fails with Turbopack default; use `next build --webpack` |
| Next.js 16: params not awaited | `params`/`searchParams`/`cookies()`/`headers()` must be `await`ed |
| Next.js 16: middleware not found | Renamed to `proxy.ts`; export `proxy` function instead of `middleware` |
| Next.js 16: parallel route error | All parallel route slots now require explicit `default.js` files |
