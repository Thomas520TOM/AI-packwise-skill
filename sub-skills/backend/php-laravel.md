# PHP Backend Build Sub-Skill

Build and package PHP backend services (Laravel / Symfony / Slim).

**Current version**: PHP 8.3 / 8.4 / Laravel 11.x / Symfony 7.x (2025-2026)

## When to Use

- Content management systems (WordPress plugins, custom CMS)
- REST APIs / GraphQL APIs
- Web applications with server-side rendering
- Team has PHP experience
- Shared hosting deployment

## Laravel Build

### Build & Package

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader

# Cache configuration (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Build frontend assets
npm ci && npm run build

# Create distributable archive
tar -czf myapp.tar.gz \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='tests' \
    --exclude='.git' \
    .
```

### Docker

```dockerfile
FROM php:8.3-fpm AS builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    composer install --no-dev --optimize-autoloader --no-scripts
COPY . .
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

FROM php:8.3-fpm
WORKDIR /app
COPY --from=builder /app /app
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app/storage /app/bootstrap/cache
USER appuser
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=3s CMD php artisan --version || exit 1
CMD ["php-fpm"]
```

### Nginx + PHP-FPM

```nginx
server {
    listen 80;
    server_name example.com;
    root /app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Shared Hosting Deployment

```bash
# 1. Run `composer install --no-dev` locally
# 2. Upload via FTP/SFTP:
#    - All files EXCEPT: .env.example, .git, node_modules, tests
# 3. Set document root to `public/` directory
# 4. Copy .env.example → .env and configure
# 5. Run: php artisan key:generate
# 6. Set permissions: chmod -R 775 storage bootstrap/cache
```

### Laravel Forge / Vapor / Ploi

| Platform | Type | Best For |
|----------|------|---------|
| Laravel Forge | VPS management | Full control, traditional hosting |
| Laravel Vapor | Serverless (AWS Lambda) | Auto-scaling, pay-per-request |
| Ploi | VPS management | Alternative to Forge |

## Symfony Build

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader

# Warm up cache
php bin/console cache:warmup --env=prod

# Build frontend (if using Encore)
npm ci && npm run build

# Docker
docker build -t myapp .
```

```dockerfile
FROM php:8.3-fpm AS builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader
COPY . .
RUN php bin/console cache:warmup --env=prod

FROM php:8.3-fpm
WORKDIR /app
COPY --from=builder /app /app
USER www-data
EXPOSE 9000
```

## Slim / Lumen (Micro-frameworks)

```php
// Slim 4 — minimal API
use Slim\Factory\AppFactory;

$app = AppFactory::create();
$app->get('/health', function ($request, $response) {
    $response->getBody()->write('OK');
    return $response;
});
$app->run();
```

```bash
# Build
composer install --no-dev
php -S 0.0.0.0:8080 -t public public/index.php
```

## PHP Distribution Channels

| Channel | Method | Best For |
|---------|--------|---------|
| Composer Packagist | `composer publish` | Libraries / packages |
| Docker Hub | `docker push` | Containerized apps |
| Shared hosting | FTP/SFTP upload | WordPress, small sites |
| VPS | `git pull` + `composer install` | Full control |
| Serverless (Bref) | `vendor/bin/bref deploy` | AWS Lambda |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| `composer install` fails in prod | Use `--no-dev`; check PHP version compatibility |
| 500 error after deploy | Check `.env` config; run `php artisan config:clear` |
| Storage permissions | `chmod -R 775 storage bootstrap/cache`; set correct owner |
| OPcache not working | Enable `opcache.enable=1` in php.ini; restart PHP-FPM |
| Memory limit exceeded | Increase `memory_limit` in php.ini (default 128M, use 256M+) |
| Asset mix not compiling | Run `npm ci && npm run build`; check `webpack.mix.js` / `vite.config.js` |
| Shared hosting: `artisan` not available | Use `php artisan` with full path; some hosts restrict CLI |
