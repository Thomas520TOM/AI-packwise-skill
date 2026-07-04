# Python Backend Build Sub-Skill

Build Python backend services (FastAPI/Django/Flask/Litestar).

**Current version**: Python 3.12+ / 3.13 (2025-2026)

## When to Use

- REST API / GraphQL API
- Web application backend
- AI/ML model serving
- Data processing service
- Research/academic projects
- Admin panels / internal tools

## Framework Quick Start

### FastAPI (Recommended for new projects)

```python
from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
```

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Django (Full-featured, batteries-included)

```bash
django-admin startproject myproject
cd myproject
python manage.py migrate
python manage.py collectstatic
python manage.py runserver
```

### Flask (Lightweight, minimal)

```python
from flask import Flask
app = Flask(__name__)

@app.route("/health")
def health():
    return {"status": "ok"}
```

### Framework Comparison

| Framework | Performance | Async | ORM | Admin | Best For |
|-----------|------------|-------|-----|-------|---------|
| FastAPI | Highest | Native | SQLAlchemy | Via admin | APIs, microservices, ML serving |
| Django | Good | ASGI (since 4.1) | Built-in | Built-in | Full-stack web apps, CMS |
| Flask | Moderate | Via extensions | SQLAlchemy | Via extensions | Simple APIs, microservices |
| Litestar | High | Native | SQLAlchemy | Built-in | FastAPI alternative |

## Build & Package

```bash
# FastAPI/Flask: run directly, no compilation needed
# Django:
python manage.py collectstatic       # Collect static files
python manage.py migrate              # Database migration

# Production WSGI/ASGI server
# FastAPI/ASGI:
pip install uvicorn[standard]
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4

# Django/Flask/WSGI:
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 myapp.wsgi:application

# Gunicorn + Uvicorn workers (async WSGI)
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## Docker

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
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "app:app"]
```

## Dependency Management

```bash
# pip + requirements.txt (traditional)
pip freeze > requirements.txt
pip install -r requirements.txt

# Poetry (recommended for new projects)
poetry init
poetry add fastapi uvicorn sqlalchemy
poetry export -f requirements.txt --output requirements.txt

# uv (fastest, Rust-based, pip-compatible)
pip install uv
uv pip install fastapi uvicorn
uv pip compile requirements.in -o requirements.txt
```

## Gunicorn + Nginx

```bash
# Gunicorn (production WSGI server)
gunicorn -w 4 -b 127.0.0.1:8000 myapp.wsgi:application

# Nginx reverse proxy
# upstream backend { server 127.0.0.1:8000; }
# server {
#     listen 80;
#     server_name example.com;
#     location / { proxy_pass http://backend; proxy_set_header Host $host; }
# }
```

## Cloud Platforms

| Platform | Method | Best For |
|----------|--------|---------|
| Railway | Git push | Quick deploy |
| Render | Git push | Quick deploy |
| Fly.io | Docker | Global deploy |
| AWS Lambda | Mangum (ASGI adapter) | Serverless |
| Vercel | Serverless Functions | FastAPI (limited) |
| Aliyun FC | Serverless | China market |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Dependency install failure | Pin exact versions; use `pip-compile` for locked deps |
| Database migration | Run `alembic upgrade head` or `python manage.py migrate` in production |
| Static files 404 | Nginx serves static files directly; Django: `collectstatic` |
| Async not working | FastAPI: use `async def`; Django: enable ASGI; Flask: use Quart for async |
| Python version mismatch | Specify `python:3.13-slim` in Dockerfile; match local and production |
| `ModuleNotFoundError` | Ensure virtualenv activated; check `sys.path` |
| WSGI vs ASGI confusion | FastAPI = ASGI (uvicorn); Django = WSGI (gunicorn) or ASGI (uvicorn) |
| CORS error | FastAPI: `CORSMiddleware`; Django: `django-cors-headers`; Flask: `flask-cors` |
| Memory leak in workers | Gunicorn: `--max-requests 1000` to restart workers periodically |
