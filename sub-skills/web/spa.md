# SPA (Single Page Application) Build Sub-Skill

Build and package pure frontend projects (React/Vue/Angular/Svelte/Solid).

**Current versions**: Vite 8.x / Webpack 5 / Angular 19 / Svelte 5 (2025-2026)

> ⚠️ **Vite 8.x**: If upgrading from Vite 6, check the [Vite migration guide](https://vitejs.dev/guide/migration) for breaking changes in plugin API and configuration format. Verify `vite-plugin-pwa`, `vite-plugin-wasm`, and other plugins are compatible with v8.

## When to Use

- Pure frontend project (no backend in the same repo)
- Data from external API or localStorage
- University course work, graduation project, portfolio
- Enterprise website, showcase application
- Admin dashboards, internal tools

## Build Tools Comparison

| Tool | Speed | Config | HMR | Best For |
|------|-------|--------|-----|---------|
| **Vite 8** | Fastest | Minimal | Instant | New projects (default for Vue/React/Svelte) |
| **Webpack 5** | Moderate | Complex | Good | Legacy projects, complex builds |
| **esbuild** | Ultra fast | Minimal | N/A | Libraries, simple apps |
| **Turbopack** | Very fast | Next.js only | Fast | Next.js projects |

## Framework Builds

### Vite (React / Vue / Svelte / Solid)

```bash
# Create project
npm create vite@latest my-app -- --template react-ts   # React + TypeScript
npm create vite@latest my-app -- --template vue-ts     # Vue + TypeScript
npm create vite@latest my-app -- --template svelte-ts  # Svelte + TypeScript

# Build
npm run build
# Output: dist/ directory

# Preview production build locally
npm run preview
```

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                    // Set for sub-directory deployment
  build: {
    outDir: 'dist',
    sourcemap: false,           // Disable for production
    rolldownOptions: {           // ⚠️ Vite 8: renamed from rollupOptions
      output: {
        // Vite 8: manualChunks object form removed. Use function form or codeSplitting.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {                     // Dev proxy to avoid CORS
      '/api': 'http://localhost:3000',
    },
  },
});
```

### Angular

```bash
# Build
ng build --configuration=production
# Output: dist/my-app/

# With SSR
ng build --configuration=production
ng run my-app:server:production
```

### React (Create React App — Legacy)

```bash
# CRA is no longer recommended for new projects; use Vite instead
npx create-react-app my-app  # Legacy
npm run build
# Output: build/ directory
```

## Production Optimization Checklist

```javascript
// vite.config.ts — production optimizations (Vite 8)
export default defineConfig({
  build: {
    // Vite 8: esbuild minification replaced by Oxc minifier
    // To use terser for advanced control, install terser and set:
    // minify: 'terser',
    // terserOptions: { ... },
    chunkSizeWarningLimit: 500,          // Warn if chunk > 500KB
    rolldownOptions: {                   // ⚠️ Vite 8: was rollupOptions
      output: {
        manualChunks(id) {               // ⚠️ Vite 8: object form removed, use function
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  // Vite 8: esbuild option deprecated, use oxc for JSX/define transforms
  // esbuild: { drop: ['console', 'debugger'] },  // deprecated
  // Use rolldownOptions.output.minify.compress.drop instead
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
```

| Optimization | How | Impact |
|-------------|-----|--------|
| Tree shaking | Rolldown does this automatically (Vite 8) | Remove unused code |
| Code splitting | `manualChunks` function in Vite 8; `codeSplitting` in Rolldown | Smaller initial load |
| Lazy loading | `React.lazy()` / `defineAsyncComponent()` | On-demand loading |
| Asset compression | Brotli (`.br`) or Gzip (`.gz`) | 70-80% transfer size reduction |
| Image optimization | Use WebP/AVIF; `vite-plugin-imagemin` | 30-50% image size reduction |
| CSS purging | `purgecss` or built into Tailwind | Remove unused CSS |
| Preload/prefetch | `<link rel="preload">` for critical assets | Faster initial paint |

## Deployment Targets

| Platform | Method | Cost | Best For |
|----------|--------|------|----------|
| Vercel | Git push auto-deploy | Free tier | Personal/small team |
| Netlify | Git push auto-deploy | Free tier | Personal/small team |
| GitHub Pages | Git Actions auto-deploy | Free | Open source projects |
| Cloudflare Pages | Git push auto-deploy | Free tier | Global CDN, fast |
| Aliyun OSS + CDN | Upload dist/ | Pay-per-use | China access |
| Tencent COS + CDN | Upload dist/ | Pay-per-use | China access |
| AWS S3 + CloudFront | Upload dist/ | Pay-per-use | AWS ecosystem |
| Nginx | Manual deploy | Server cost | Self-hosted |
| Docker (nginx) | Containerize | Server cost | Containerized infrastructure |

### Vercel

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/myapp/dist;
    index index.html;

    # SPA routing (all routes → index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
```

### Docker

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /usr/share/nginx/html
USER appuser
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1
```

## Environment Variables

```bash
# Vite: only VITE_ prefixed vars are exposed to client
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

# In code:
const apiUrl = import.meta.env.VITE_API_URL;
```

```bash
# Angular: use environment.ts files
# Webpack: use process.env.REACT_APP_* (CRA) or DefinePlugin
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Refresh 404 on deploy | Nginx: `try_files $uri /index.html`; all hosting: configure SPA fallback |
| Path error after deploy | `vite.config.ts` set `base: '/subpath/'` for non-root deployment |
| CORS error in dev | Vite: `server.proxy`; Angular: `proxy.conf.json` |
| Env var not working | Vite: only `VITE_` prefix vars are bundled; Angular: use `environment.ts` |
| Large bundle (> 1MB) | Enable code splitting; lazy load routes; analyze with `rollup-plugin-visualizer` |
| White screen on deploy | Check browser console for errors; verify `base` path in config |
| CSS not loading | Check if CSS import path is correct; verify build output structure |
| Images not showing | Use `import` for images (Vite/Webpack process them); don't use string paths |
| Vite 8: `rollupOptions` not working | Renamed to `rolldownOptions` in Vite 8; see migration guide |
| Vite 8: esbuild options ignored | esbuild deprecated; use `oxc` for transforms, `rolldownOptions` for minification |
| Vite 8: `manualChunks` object form error | Object form removed; use function form or Rolldown `codeSplitting` |
| Vite 8: ES5 output fails | ES5 transformation no longer supported; target modern browsers only |
