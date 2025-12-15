# VPS Deployment Guide

Deploy earn-auto-reviewer to VPS using Docker Compose with GitHub Actions CI/CD.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       VPS (176.222.53.185)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nginx (80/443)                                             │
│       │                                                     │
│       ↓                                                     │
│  earn-auto-review.rectorspace.com                           │
│       │                                                     │
│       ↓                                                     │
│  Docker: earn-auto-reviewer-web (port 4002)                 │
│       │                                                     │
│       ↓                                                     │
│  Next.js App (port 3000 internal)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. VPS with Docker and Docker Compose installed
2. Nginx installed as reverse proxy
3. SSH access configured
4. Domain DNS pointing to VPS IP

## Step 1: Create VPS User

SSH to VPS as core user and create dedicated user:

```bash
ssh core

# Create user for this project
sudo adduser earnauto --disabled-password --gecos ""

# Add to docker group
sudo usermod -aG docker earnauto

# Setup SSH key
sudo mkdir -p /home/earnauto/.ssh
sudo cp ~/.ssh/authorized_keys /home/earnauto/.ssh/
sudo chown -R earnauto:earnauto /home/earnauto/.ssh
sudo chmod 700 /home/earnauto/.ssh
sudo chmod 600 /home/earnauto/.ssh/authorized_keys

# Create app directory
sudo mkdir -p /home/earnauto/app
sudo chown earnauto:earnauto /home/earnauto/app
```

## Step 2: Add SSH Config (Local Machine)

Add to `~/.ssh/config`:

```
Host earnauto
  HostName 176.222.53.185
  User earnauto
```

Test connection:
```bash
ssh earnauto
```

## Step 3: Setup GitHub Secrets

In GitHub repo settings, add these secrets:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | `176.222.53.185` |
| `VPS_USER` | `earnauto` |
| `VPS_SSH_KEY` | Contents of `~/.ssh/id_ed25519` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `GH_TOKEN_API` | GitHub token for API access |

## Step 4: Initial VPS Setup

SSH to the new user and setup docker-compose:

```bash
ssh earnauto
cd ~/app

# Create docker-compose.yml (copy from repo)
cat > docker-compose.yml << 'EOF'
name: earn-auto-reviewer

services:
  web:
    container_name: earn-auto-reviewer-web
    image: ghcr.io/rector-labs/earn-auto-reviewer:latest
    restart: unless-stopped
    ports:
      - "4002:3000"
    environment:
      - NODE_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  default:
    name: earn-auto-reviewer-network
EOF

# Create .env file
cat > .env << 'EOF'
OPENROUTER_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
EOF

# Login to GHCR (first time only)
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

## Step 5: Setup Nginx

SSH as core user (or user with sudo):

```bash
ssh core

# Create nginx config
sudo nano /etc/nginx/sites-available/earn-auto-review.rectorspace.com
# (paste content from nginx.conf.example)

# Enable site
sudo ln -s /etc/nginx/sites-available/earn-auto-review.rectorspace.com /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Setup SSL with Certbot
sudo certbot --nginx -d earn-auto-review.rectorspace.com
```

## Step 6: Deploy

### Manual Deploy

```bash
ssh earnauto
cd ~/app
docker compose pull
docker compose up -d
docker compose ps
```

### Automatic Deploy (CI/CD)

Push to `main` branch - GitHub Actions will:
1. Build Docker image
2. Push to GHCR
3. SSH to VPS
4. Pull and restart container

## Useful Commands

```bash
# View logs
docker compose logs -f

# Restart service
docker compose restart

# Check status
docker compose ps

# Stop service
docker compose down

# Update and restart
docker compose pull && docker compose up -d
```

## Port Registry

| Port | Service |
|------|---------|
| 4002 | earn-auto-reviewer-web |

Registered in `~/.ssh/vps-port-registry.md`

## Troubleshooting

### Container won't start
```bash
docker compose logs web
docker compose down && docker compose up -d
```

### Nginx 502 Bad Gateway
```bash
# Check if container is running
docker compose ps

# Check if port is accessible
curl http://localhost:4002
```

### SSL Certificate Issues
```bash
sudo certbot renew --dry-run
sudo systemctl reload nginx
```

## Cache Behavior

Unlike Vercel (serverless), VPS deployment keeps the in-memory cache **persistent** as long as the container runs. This means:

- First review: ~10-15 seconds (AI generation)
- Cached review: ~100ms (instant)
- Cache survives container restarts (if not recreated)
- Cache invalidates when code commits change

For true persistence across deployments, consider adding Redis:

```yaml
services:
  web:
    # ... existing config
    depends_on:
      - redis

  redis:
    container_name: earn-auto-reviewer-redis
    image: redis:alpine
    restart: unless-stopped
    ports:
      - "6382:6379"  # Use next available Redis port
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```
