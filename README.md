# Griote Platform

Plateforme panafricaine dédiée à la structuration, la transmission et la valorisation des savoirs africains — académiques et technologiques.

**Stack:** Express.js · PostgreSQL · MinIO · React · Nginx · Docker · Traefik

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Quick Start — Development](#2-quick-start--development)
3. [Quick Start — Production](#3-quick-start--production)
4. [Environment Variables](#4-environment-variables)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Docker Compose Files](#6-docker-compose-files)
7. [Server Setup (First Deployment)](#7-server-setup-first-deployment)
8. [Useful Commands](#8-useful-commands)
9. [Security](#9-security)

---

## 1. Project Structure

```
griote-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← Unified CI/CD pipeline (main)
│
├── backend/                        ← Express.js API
│   ├── .github/workflows/          ← Legacy (kept for reference)
│   ├── docker-compose.dev.yml      ← Backend services only (dev)
│   ├── docker-compose.prod.yml     ← Backend services only (prod)
│   ├── compose.yaml                ← Legacy alias
│   ├── Dockerfile
│   ├── .env                        ← Local dev config (gitignored)
│   └── .env.example                ← Template — copy and fill
│
├── frontend/                       ← React + Vite SPA
│   ├── .github/workflows/          ← Legacy (kept for reference)
│   ├── docker-compose.prod.yml     ← Frontend only (prod)
│   ├── Dockerfile                  ← Multi-stage: Node build → Nginx
│   ├── nginx.conf
│   ├── .env.development            ← Vite dev config
│   ├── .env.production             ← Vite prod config (gitignored if has secrets)
│   └── .env.example                ← Template
│
├── docker-compose.dev.yml          ← Full dev stack (recommended)
├── docker-compose.prod.yml         ← Full prod stack (recommended)
├── .env.example                    ← Production env template
└── README.md
```

---

## 2. Quick Start — Development

### Prerequisites
- Docker + Docker Compose plugin
- Node.js 22+ and pnpm (`npm i -g pnpm`)

### Start backend services

```bash
# From the project root
docker compose -f docker-compose.dev.yml up -d

# With monitoring (Loki + Prometheus + Grafana)
docker compose -f docker-compose.dev.yml --profile monitoring up -d
```

Services available:

| Service    | URL                            | Credentials             |
|------------|--------------------------------|-------------------------|
| Backend    | http://localhost:3000          | —                       |
| PostgreSQL | localhost:5432                 | griote / griote / griote|
| MinIO API  | http://localhost:9000          | minioadmin / minioadmin |
| MinIO UI   | http://localhost:9001          | minioadmin / minioadmin |
| Grafana    | http://localhost:3001          | admin / admin           |
| Prometheus | http://localhost:9090          | —                       |

### Seeder accounts (first startup)

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@griote.com     | Admin2024  |
| User  | user1@griote.com     | Griote2024 |
| User  | user2@griote.com     | Griote2024 |

### Start frontend

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:5173
```

### Configure backend .env

```bash
cp backend/.env.example backend/.env
# The default values work for Docker dev — only add SMTP if needed
```

---

## 3. Quick Start — Production

### Prerequisites on the server
- Docker + Docker Compose plugin
- Traefik running on network `traefik-proxy` (see §7)

### Deploy

```bash
# 1. Clone the repository on the server
git clone <repo-url> /root/griote
cd /root/griote

# 2. Create the Traefik network (once)
docker network create traefik-proxy

# 3. Configure environment variables
cp .env.example .env
nano .env   # Fill every CHANGE_ME value

# 4. Start the full stack
docker compose -f docker-compose.prod.yml up -d

# 5. Check status
docker compose -f docker-compose.prod.yml ps
```

---

## 4. Environment Variables

### File conventions

| File                    | Environment  | Gitignored | Purpose                           |
|-------------------------|--------------|------------|-----------------------------------|
| `backend/.env`          | Development  | Yes        | Local dev config                  |
| `backend/.env.example`  | Development  | No         | Template — commit this            |
| `.env`                  | Production   | Yes        | Production secrets (root)         |
| `.env.example`          | Production   | No         | Template — commit this            |
| `frontend/.env.development` | Dev     | No         | Vite dev config (no secrets)      |
| `frontend/.env.production`  | Prod    | No         | Vite prod config (no secrets)     |
| `frontend/.env.example` | Both         | No         | Template                          |

### Key variables

| Variable              | Description                         | Example                           |
|-----------------------|-------------------------------------|-----------------------------------|
| `DB_USER`             | PostgreSQL username                 | `griote`                          |
| `DB_PASSWORD`         | PostgreSQL password                 | *(generate strong)*               |
| `DB_NAME`             | PostgreSQL database name            | `griote`                          |
| `JWT_SECRET`          | JWT signing key (64+ bytes)         | `openssl rand -hex 64`            |
| `MINIO_ACCESS_KEY`    | MinIO access key                    | *(generate)*                      |
| `MINIO_SECRET_KEY`    | MinIO secret key (32+ chars)        | *(generate)*                      |
| `MAIL_HOST`           | SMTP host                           | `smtp.gmail.com`                  |
| `MAIL_USER`           | SMTP username                       | `you@gmail.com`                   |
| `MAIL_PASSWORD`       | SMTP password / App Password        | *(from provider)*                 |
| `VITE_API_BASE_URL`   | Backend API URL (frontend)          | `https://api.griote.org/api`      |

---

## 5. CI/CD Pipeline

**File:** `.github/workflows/deploy.yml`

The unified pipeline triggers on every push to `main` and runs 4 jobs:

```
push to main
     │
     ▼
[changes] ── detects what changed (backend / frontend)
     │
     ├──────────────────────────┐
     ▼                          ▼
[build-backend]         [build-frontend]
  (parallel)              (parallel)
     │                          │
     └──────────────┬───────────┘
                    ▼
               [deploy]
          SSH → pull images
          → start postgres + minio
          → wait for db health
          → start backend API
          → wait for API health
          → start frontend
          → prune old images
```

### Selective builds

The pipeline only rebuilds images for the changed service:
- Push touching only `frontend/**` → only frontend image rebuilt
- Push touching only `backend/**` → only backend image rebuilt
- Push touching both → both rebuilt in parallel

### Manual deployment

From GitHub → Actions → "Deploy — Griote Platform" → Run workflow:
- Choose `service`: `all`, `backend`, or `frontend`

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret               | Description                          |
|----------------------|--------------------------------------|
| `DOCKERHUB_USERNAME` | Docker Hub username                  |
| `DOCKERHUB_TOKEN`    | Docker Hub access token (not password)|
| `SERVER_HOST`        | Production server IP or hostname     |
| `SERVER_USER`        | SSH username (e.g. `root`)           |
| `SERVER_SSH_KEY`     | Private SSH key (PEM format)         |

---

## 6. Docker Compose Files

| File                          | Use                                               |
|-------------------------------|---------------------------------------------------|
| `docker-compose.dev.yml`      | **Development** — all backend services            |
| `docker-compose.prod.yml`     | **Production** — full stack (recommended)         |
| `backend/docker-compose.dev.yml`  | Backend services only (standalone)           |
| `backend/docker-compose.prod.yml` | Backend services only in production          |
| `frontend/docker-compose.prod.yml`| Frontend only (backend must run separately)  |
| `backend/compose.yaml`        | Legacy — kept for backward compatibility          |

**Naming convention:** `docker-compose.<env>.yml`

---

## 7. Server Setup (First Deployment)

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Set up Traefik

Traefik handles SSL termination (Let's Encrypt) and reverse proxying for all services.

```bash
# Create Traefik network
docker network create traefik-proxy

# Create Traefik config directory
mkdir -p /root/traefik/data
touch /root/traefik/data/acme.json
chmod 600 /root/traefik/data/acme.json
```

Create `/root/traefik/docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--certificatesresolvers.le.acme.email=admin@griote.org"
      - "--certificatesresolvers.le.acme.storage=/data/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /root/traefik/data:/data
    networks:
      - traefik-proxy

networks:
  traefik-proxy:
    external: true
    name: traefik-proxy
```

```bash
cd /root/traefik
docker compose up -d
```

### 3. Deploy Griote

```bash
mkdir -p /root/griote
cd /root/griote
cp .env.example .env
nano .env          # Fill all secrets
docker compose -f docker-compose.prod.yml up -d
```

### 4. Generate SSH key for CI/CD

```bash
# On the server
ssh-keygen -t ed25519 -C "github-actions-griote" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Add the private key to GitHub Secrets as SERVER_SSH_KEY
cat ~/.ssh/github_actions
```

---

## 8. Useful Commands

### Development

```bash
# Start dev stack
docker compose -f docker-compose.dev.yml up -d

# View backend logs (live)
docker compose -f docker-compose.dev.yml logs -f backend

# Restart backend only (after code changes without hot-reload)
docker compose -f docker-compose.dev.yml restart backend

# Stop all
docker compose -f docker-compose.dev.yml down

# Start frontend
cd frontend && pnpm dev

# Reset database (destroys all data)
docker compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Full status
docker compose -f docker-compose.prod.yml ps

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View backend logs only
docker compose -f docker-compose.prod.yml logs -f backend

# Restart a service
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend

# Pull latest images and restart (manual deploy)
docker pull brandoniscoding/backend-griote:latest
docker pull brandoniscoding/frontend-griote:latest
docker compose -f docker-compose.prod.yml up -d

# View resource usage
docker stats griote-backend griote-frontend griote-postgres griote-minio

# Clean unused images
docker image prune -f
```

---

## 9. Security

### Secrets management

- **Never commit `.env` files.** They are listed in `.gitignore`.
- Use `.env.example` files for documentation — never put real secrets in them.
- Rotate secrets regularly, especially `JWT_SECRET` and database passwords.
- Use Docker secrets or a secrets manager (Vault, AWS Secrets Manager) for enterprise deployments.

### Password policy

User registration requires:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

### Generating secure secrets

```bash
# JWT secret (64 bytes → 128 hex chars)
openssl rand -hex 64

# MinIO secret key (32+ chars)
openssl rand -base64 32

# Database password
openssl rand -base64 24
```

### Network isolation

In production, the `griote-internal` network is bridge-isolated. Only services with Traefik labels (`frontend`, `backend`, `minio`) are exposed to the internet. `postgres` is accessible only from `backend`.
