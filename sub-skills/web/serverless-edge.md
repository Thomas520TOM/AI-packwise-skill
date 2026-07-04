# Serverless & Edge Build Sub-Skill

Build and package applications for serverless platforms and edge runtimes.

**Current versions**: AWS Lambda / Cloudflare Workers / Vercel Functions / Deno Deploy (2025-2026)

## When to Use

- Pay-per-request pricing model
- Auto-scaling without infrastructure management
- API backends with variable traffic
- Edge computing (low latency globally)
- Cron jobs / scheduled tasks
- Webhook handlers

## Platform Comparison

| Platform | Language Support | Cold Start | Max Duration | Best For |
|----------|-----------------|-----------|-------------|---------|
| AWS Lambda | Node/Python/Go/Rust/Java/.NET | 100–500ms | 15 min | Enterprise, complex workflows |
| Cloudflare Workers | JS/TS/WASM | < 1ms | 30s (CPU) / unlimited (I/O) | Edge compute, APIs |
| Vercel Functions | Node/Python/Go/Ruby | 100–300ms | 60s (free) / 900s (pro) | Next.js apps, frontend APIs |
| Deno Deploy | JS/TS | < 10ms | 50ms–60s | Lightweight APIs, edge |
| Netlify Functions | Node/Go | 100–500ms | 10s (free) / 26s (pro) | JAMstack apps |
| Azure Functions | Node/Python/C#/Java/PowerShell | 100–500ms | 10 min (consumption) | .NET ecosystem |
| Google Cloud Functions | Node/Python/Go/Java/.NET/Ruby | 100–500ms | 60 min (gen2) | GCP ecosystem |

---

## AWS Lambda

### Node.js Function

```javascript
// handler.js (Lambda Function URL or API Gateway)
exports.handler = async (event) => {
  const name = event.queryStringParameters?.name || 'World';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Hello, ${name}!` }),
  };
};
```

```bash
# Package
zip -r function.zip handler.js node_modules/

# Deploy with AWS CLI
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs22.x \
  --handler handler.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::ACCOUNT:role/lambda-role

# Or with SAM (Serverless Application Model)
sam build && sam deploy --guided
```

### Python Function

```python
# lambda_function.py
import json

def handler(event, context):
    name = event.get('queryStringParameters', {}).get('name', 'World')
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'message': f'Hello, {name}!'})
    }
```

### Go Function

```go
package main

import (
    "context"
    "github.com/aws/aws-lambda-go/events"
    "github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    name := request.QueryStringParameters["name"]
    if name == "" { name = "World" }
    return events.APIGatewayProxyResponse{
        StatusCode: 200,
        Headers:    map[string]string{"Content-Type": "application/json"},
        Body:       fmt.Sprintf(`{"message":"Hello, %s!"}`, name),
    }, nil
}

func main() { lambda.Start(handler) }
```

```bash
# Build and deploy
GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
zip function.zip bootstrap
aws lambda create-function --function-name my-go-func --runtime provided.al2023 --handler bootstrap --zip-file fileb://function.zip
```

### Rust Function (Custom Runtime)

```toml
# Cargo.toml
[dependencies]
lambda_runtime = "0.13"
tokio = { version = "1", features = ["macros"] }
serde = { version = "1", features = ["derive"] }
```

```rust
use lambda_runtime::{service_fn, LambdaEvent, Error};
use serde_json::{json, Value};

async fn handler(event: LambdaEvent<Value>) -> Result<Value, Error> {
    let name = event.payload.get("name").and_then(|v| v.as_str()).unwrap_or("World");
    Ok(json!({ "statusCode": 200, "body": format!("Hello, {}!", name) }))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(handler)).await
}
```

---

## Cloudflare Workers

```bash
# Create project
npm create cloudflare@latest my-worker
cd my-worker
```

```javascript
// src/index.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }
    return new Response('Hello from the Edge!', { status: 200 });
  },
  // Scheduled handler (cron)
  async scheduled(event, env, ctx) {
    // Runs on cron schedule defined in wrangler.toml
  },
};
```

```toml
# wrangler.toml
name = "my-worker"
main = "src/index.js"
compatibility_date = "2025-01-01"

[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes

# KV Storage
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "your-d1-database-id"

# R2 Storage (S3-compatible)
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "my-bucket"
```

```bash
# Deploy
npx wrangler deploy

# Test locally
npx wrangler dev
```

---

## Vercel Functions

```javascript
// app/api/hello/route.js (Next.js App Router)
export async function GET(request) {
  return Response.json({ message: 'Hello from Vercel!' });
}

export async function POST(request) {
  const body = await request.json();
  return Response.json({ received: body });
}
```

```bash
# Deploy
vercel deploy

# Or: git push to connected repository (auto-deploy)
```

---

## Deno Deploy

```typescript
// main.ts
Deno.serve((req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === "/health") {
    return new Response("OK");
  }
  return new Response("Hello from Deno Deploy!");
});
```

```bash
# Deploy
deployctl deploy --project=my-project main.ts
```

---

## Serverless Framework (Multi-Cloud)

```yaml
# serverless.yml
service: my-service
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs22.x
  region: us-east-1

functions:
  api:
    handler: handler.handler
    events:
      - httpApi:
          path: /{proxy+}
          method: '*'
      - schedule:
          rate: rate(1 hour)
```

```bash
npm install -g serverless
serverless deploy
serverless info  # Get endpoint URLs
serverless logs -f api  # View logs
```

---

## Selection Guide

| Scenario | Recommended Platform | Why |
|----------|---------------------|-----|
| Next.js app | Vercel | First-class Next.js support |
| Global API with low latency | Cloudflare Workers | Edge-first, < 1ms cold start |
| Enterprise backend | AWS Lambda + API Gateway | Full AWS ecosystem |
| .NET backend | Azure Functions | Native .NET support |
| Cron jobs / scheduled tasks | Any (all support cron) | Pick based on existing infra |
| AI inference at edge | Cloudflare Workers AI | GPU at the edge |
| Simple webhook handler | Vercel/Netlify Functions | Easiest setup |
| High-memory workloads | AWS Lambda (10GB) | Highest memory allocation |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Cold start too slow | Use provisioned concurrency (AWS); keep functions small |
| Function timeout | Break into smaller functions; use async queues (SQS/Queues) |
| Package too large | Use tree-shaking; exclude dev deps; use Lambda layers |
| Environment variables not available | Set in platform dashboard; use secrets manager |
| Database connection exhaustion | Use connection pooling (RDS Proxy, Neon, PlanetScale) |
| CORS errors | Add CORS headers in function response |
| Webhook replay attacks | Verify webhook signatures (Stripe, GitHub) |
| Edge runtime limitations | No filesystem access; limited Node.js APIs; no native modules |
