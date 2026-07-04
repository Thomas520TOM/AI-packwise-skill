# Kubernetes Build Sub-Skill

Package and deploy applications to Kubernetes clusters (K8s, K3s, EKS, GKE, AKS).

**Current version**: Kubernetes 1.31 / Helm 3.x / Kustomize 5.x (2025-2026)

## When to Use

- Multi-container applications (Web + DB + Cache + Worker)
- Microservices architecture
- Auto-scaling requirements
- Multi-cloud or hybrid-cloud deployment
- Need rolling updates and zero-downtime deployments

## Core Concepts

| Concept | What It Does |
|---------|-------------|
| **Pod** | Smallest unit — runs one or more containers |
| **Deployment** | Manages pod replicas, rolling updates |
| **Service** | Network endpoint — stable IP/DNS for pods |
| **Ingress** | HTTP routing — domain → service mapping |
| **ConfigMap** | Non-secret configuration data |
| **Secret** | Sensitive data (passwords, tokens) |
| **PersistentVolume** | Durable storage (databases, uploads) |
| **Namespace** | Virtual cluster isolation |

## K8s Manifests

### Deployment + Service

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero downtime
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: registry.example.com/myapp:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: myapp-secrets
                  key: database-url
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts: [myapp.example.com]
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp
                port:
                  number: 80
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
```

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
type: Opaque
stringData:
  database-url: "postgres://user:pass@db:5432/myapp"
```

## K3s (Lightweight Kubernetes)

```bash
# Install K3s (single-node, production-ready)
curl -sfL https://get.k3s.io | sh -

# Verify
kubectl get nodes

# Deploy
kubectl apply -f k8s/

# K3s is ideal for:
# - Edge computing
# - IoT
# - Development/staging
# - Small production clusters
```

## Helm (Package Manager for K8s)

```bash
# Install
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Create chart
helm create myapp-chart
```

```
myapp-chart/
├── Chart.yaml          ← Chart metadata
├── values.yaml         ← Default values
├── templates/
│   ├── deployment.yaml ← Template with {{ .Values.xxx }}
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl    ← Template helpers
└── charts/             ← Sub-charts (dependencies)
```

```yaml
# values.yaml
replicaCount: 3
image:
  repository: registry.example.com/myapp
  tag: "1.0.0"
  pullPolicy: IfNotPresent
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: true
  host: myapp.example.com
  tls: true
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

```bash
# Install
helm install myapp ./myapp-chart -f values.yaml

# Upgrade
helm upgrade myapp ./myapp-chart --set image.tag=1.1.0

# Rollback
helm rollback myapp 1

# Uninstall
helm uninstall myapp
```

## Kustomize (Template-Free Config)

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
  - ingress.yaml
commonLabels:
  app: myapp
images:
  - name: registry.example.com/myapp
    newTag: "1.0.0"
patches:
  - path: patches/replicas.yaml
```

```bash
# Apply
kubectl apply -k .

# Different overlays for environments
# overlays/production/kustomization.yaml
# overlays/staging/kustomization.yaml
```

## Helm vs Kustomize

| Feature | Helm | Kustomize |
|---------|------|-----------|
| Approach | Template-based (Go templates) | Overlay/patch based |
| Complexity | Higher (chart structure) | Lower (plain YAML) |
| Package registry | ArtifactHub (thousands of charts) | No registry |
| Best for | Distributable packages | Environment overlays |
| Secret management | External (Vault, Sealed Secrets) | External |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Pod CrashLoopBackOff | Check logs: `kubectl logs pod-name`; verify health endpoint |
| ImagePullBackOff | Check image name/tag; verify registry credentials (`imagePullSecrets`) |
| Service not reachable | Check selector labels match; verify port mapping |
| ConfigMap/Secret not updating | K8s caches them; restart pods or use `--force` |
| Out of memory | Increase `resources.limits.memory`; check for memory leaks |
| PersistentVolume not mounting | Check PVC status; verify storage class exists |
| DNS not resolving | Check CoreDNS pods running; use fully qualified names |
| Ingress 404 | Verify Ingress controller installed; check host and path rules |
