# Linux Production Deployment Guide

## Roaya Lead Management Backend

> **Target stack:** Ubuntu 22.04 LTS, Node.js 20+, PostgreSQL 15+, Redis 7+, Nginx, PM2, Let's Encrypt

---

## Table of Contents

1. [Server Prerequisites](#1-server-prerequisites)
2. [PostgreSQL Setup](#2-postgresql-setup)
3. [Redis Setup](#3-redis-setup)
4. [Application Deployment](#4-application-deployment)
5. [Nginx Configuration](#5-nginx-configuration)
6. [PM2 Configuration](#6-pm2-configuration)
7. [Firewall & Security](#7-firewall--security)
8. [Monitoring & Health Checks](#8-monitoring--health-checks)
9. [Backup Strategy](#9-backup-strategy)
10. [Maintenance Commands](#10-maintenance-commands)

---

## 1. Server Prerequisites

### Minimum Hardware

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 80 GB SSD |

### Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git unzip wget software-properties-common
```

### Install Node.js 20 (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # must be >= 20.0.0
npm --version
```

### Install PostgreSQL 15

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Install Redis 7

```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt update
sudo apt install -y redis-server
sudo systemctl enable redis-server
```

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

### Install PM2

```bash
sudo npm install -g pm2
```

### Install Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. PostgreSQL Setup

### Create Database and User

```bash
sudo -u postgres psql
```

```sql
-- Create production user (use a strong random password)
CREATE USER roaya_prod WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';

-- Create database
CREATE DATABASE roaya_leads OWNER roaya_prod;

-- Connect to the database
\c roaya_leads

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- used by gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram text search

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE roaya_leads TO roaya_prod;
GRANT ALL PRIVILEGES ON SCHEMA public TO roaya_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO roaya_prod;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO roaya_prod;

\q
```

### Restrict Access (pg_hba.conf)

Edit `/etc/postgresql/15/main/pg_hba.conf` to allow only local connections:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   roaya_leads     roaya_prod                              scram-sha-256
host    roaya_leads     roaya_prod      127.0.0.1/32            scram-sha-256
host    roaya_leads     roaya_prod      ::1/128                 scram-sha-256

# Block all other remote connections to roaya_leads
host    roaya_leads     all             0.0.0.0/0               reject
```

### Performance Tuning (postgresql.conf)

Edit `/etc/postgresql/15/main/postgresql.conf`:

```ini
# Connection Settings
listen_addresses = 'localhost'       # local only
max_connections = 100
superuser_reserved_connections = 3

# Memory (adjust for 8 GB server RAM)
shared_buffers = 2GB                 # ~25% of RAM
effective_cache_size = 6GB           # ~75% of RAM
work_mem = 16MB
maintenance_work_mem = 512MB

# WAL
wal_buffers = 64MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1               # SSD storage
effective_io_concurrency = 200        # SSD storage
default_statistics_target = 100

# Logging
log_min_duration_statement = 500      # log slow queries (>500ms)
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_statement = 'ddl'
log_temp_files = 0

# Locale
lc_messages = 'en_US.UTF-8'
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

---

## 3. Redis Setup

### Secure Redis

Edit `/etc/redis/redis.conf`:

```ini
# Bind to localhost only
bind 127.0.0.1 -::1

# Require authentication
requirepass CHANGE_ME_REDIS_PASSWORD

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "ROAYA_CONFIG_b9f2a1"

# Memory limit (adjust for server RAM)
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence - RDB snapshots
save 900 1       # save if 1 key changed in 15 min
save 300 10      # save if 10 keys changed in 5 min
save 60 10000    # save if 10000 keys changed in 1 min
dbfilename dump.rdb
dir /var/lib/redis

# Persistence - AOF (append only file)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# Security
protected-mode yes
```

Restart Redis:

```bash
sudo systemctl restart redis-server

# Verify
redis-cli -a CHANGE_ME_REDIS_PASSWORD ping
# Expected: PONG
```

---

## 4. Application Deployment

### Create Application User

```bash
sudo useradd -m -s /bin/bash roaya
sudo mkdir -p /opt/roaya
sudo chown roaya:roaya /opt/roaya
```

### Clone and Install

```bash
sudo -u roaya -i
cd /opt/roaya

git clone <REPOSITORY_URL> app
cd app/backend

# Install production dependencies only
npm ci --omit=dev
```

### Environment Variables

Create `/opt/roaya/app/backend/.env`:

```bash
sudo -u roaya nano /opt/roaya/app/backend/.env
```

All environment variables are validated at startup via Zod. The application will exit immediately if required variables are missing or malformed.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | | `development` | **Set to `production`** |
| `PORT` | | `3001` | HTTP listen port |
| `API_VERSION` | | `v1` | API path prefix |
| `DATABASE_URL` | **Yes** | *none* | PostgreSQL connection string |
| `REDIS_HOST` | | `localhost` | Redis host |
| `REDIS_PORT` | | `6379` | Redis port |
| `REDIS_PASSWORD` | | *none* | Redis `requirepass` value |
| `JWT_SECRET` | **Yes** | *none* | Min 32 chars, used for signing tokens |
| `JWT_ACCESS_EXPIRY` | | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | | `7d` | Refresh token TTL |
| `CSRF_SECRET` | | `JWT_SECRET` | Min 32 chars; falls back to JWT_SECRET |
| `SENDGRID_API_KEY` | | *none* | SendGrid API key for emails |
| `SENDGRID_FROM_EMAIL` | | `noreply@roaya.ai` | Sender email address |
| `SENDGRID_FROM_NAME` | | `Roaya AI` | Sender display name |
| `ADMIN_NOTIFICATION_EMAIL` | | `admin@roaya.ai` | Where admin alerts go |
| `RATE_LIMIT_WINDOW_MS` | | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | | `100` | Max requests per window |
| `FORM_RATE_LIMIT_MAX` | | `5` | Max form submissions per window |
| `LOGIN_RATE_LIMIT_MAX` | | `5` | Max login attempts per window |
| `CORS_ORIGIN` | **Yes** | `http://localhost:3000` | **Set to production domain** |
| `LOG_LEVEL` | | `info` | `error`, `warn`, `info`, `http`, `debug` |
| `LOG_FORMAT` | | `dev` | Morgan format: `combined` for production |
| `RECORDING_RETENTION_DAYS` | | `30` | Session recording retention |
| `DATA_RETENTION_DAYS` | | `90` | Page views / heatmap retention |
| `SESSION_RETENTION_DAYS` | | `180` | Analytics session retention |

Example production `.env`:

```env
NODE_ENV=production
PORT=3001
API_VERSION=v1

DATABASE_URL="postgresql://roaya_prod:CHANGE_ME_STRONG_PASSWORD@localhost:5432/roaya_leads?schema=public"

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD

JWT_SECRET=GENERATE_WITH_openssl_rand_-base64_48
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CSRF_SECRET=GENERATE_WITH_openssl_rand_-base64_48

SENDGRID_API_KEY=SG.your-api-key
SENDGRID_FROM_EMAIL=noreply@roaya.ai
SENDGRID_FROM_NAME=Roaya AI
ADMIN_NOTIFICATION_EMAIL=admin@roaya.ai

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FORM_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_MAX=5

CORS_ORIGIN=https://roaya.co

LOG_LEVEL=info
LOG_FORMAT=combined

RECORDING_RETENTION_DAYS=30
DATA_RETENTION_DAYS=90
SESSION_RETENTION_DAYS=180
```

Lock down the file:

```bash
chmod 600 /opt/roaya/app/backend/.env
chown roaya:roaya /opt/roaya/app/backend/.env
```

Generate secrets:

```bash
openssl rand -base64 48   # use output for JWT_SECRET
openssl rand -base64 48   # use output for CSRF_SECRET
```

### Build

```bash
cd /opt/roaya/app/backend
npm run build
# Runs: prisma generate && tsc
# Output goes to dist/
```

### Database Migrations

Migrations must be applied in two phases:

**Phase 1 -- Manual SQL migrations (run these first, in order)**

These standalone SQL files set up the base schema, seed data, extensions, and tables that Prisma later manages:

```bash
sudo -u postgres psql -d roaya_leads -f prisma/migrations/001_initial_schema.sql
sudo -u postgres psql -d roaya_leads -f prisma/migrations/002_seed_data.sql
sudo -u postgres psql -d roaya_leads -f prisma/migrations/003_add_logos_and_email_templates.sql
sudo -u postgres psql -d roaya_leads -f prisma/migrations/004_add_documentation_and_analytics.sql
```

**Phase 2 -- Prisma managed migrations**

```bash
cd /opt/roaya/app/backend
npx prisma migrate deploy
```

This applies all timestamped Prisma migrations under `prisma/migrations/` (e.g. `20260121145856_init`, `20260126065503_add_account_lockout_and_token_rotation`, etc.) and records them in the `_prisma_migrations` table.

### Seed Data

```bash
# Required -- creates initial admin user and system settings
npm run prisma:seed

# Optional -- populates blog posts, case studies, testimonials
npm run prisma:seed-content

# Optional -- populates client/partner logos
npm run prisma:seed-logos
```

### Create Logs Directory

```bash
mkdir -p /opt/roaya/app/backend/logs
chown roaya:roaya /opt/roaya/app/backend/logs
```

### Verify Startup

```bash
cd /opt/roaya/app/backend
node dist/index.js
# Expected output:
#   Database connection established
#   Redis connection established
#   Email worker started
#   Analytics cleanup scheduler started
#   Server running on port 3001
#   WebSocket server initialized for analytics
```

Press `Ctrl+C` to stop once verified.

---

## 5. Nginx Configuration

### Create Site Config

```bash
sudo nano /etc/nginx/sites-available/roaya-api
```

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api_auth:10m rate=3r/s;

# Upstream
upstream roaya_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name api.roaya.co;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.roaya.co;

    # SSL (managed by Certbot -- placeholders replaced after certbot runs)
    ssl_certificate /etc/letsencrypt/live/api.roaya.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.roaya.co/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain application/json application/javascript text/css;

    # Request size limit
    client_max_body_size 10m;

    # Proxy buffer tuning
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    # General API routes
    location /api/ {
        limit_req zone=api_general burst=20 nodelay;

        proxy_pass http://roaya_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Auth routes (stricter rate limit)
    location /api/v1/auth/ {
        limit_req zone=api_auth burst=5 nodelay;

        proxy_pass http://roaya_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }

    # WebSocket endpoint for real-time analytics
    location /ws/analytics/active-visitors {
        proxy_pass http://roaya_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400s;   # keep WS alive for 24h
        proxy_send_timeout 86400s;
    }

    # Block access to dotfiles
    location ~ /\. {
        deny all;
        return 404;
    }
}
```

### Enable Site and Obtain SSL Certificate

```bash
sudo ln -s /etc/nginx/sites-available/roaya-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test config (will warn about missing SSL cert -- expected before certbot)
sudo nginx -t

# Temporarily comment out the 443 server block, enable only port 80:
# Then run certbot to obtain the certificate:
sudo certbot --nginx -d api.roaya.co

# Certbot will modify the config to include the real certificate paths.
# Verify and reload:
sudo nginx -t && sudo systemctl reload nginx
```

### Auto-renew SSL

Certbot installs a systemd timer automatically. Verify:

```bash
sudo systemctl status certbot.timer
# Should show "active (waiting)"

# Test renewal
sudo certbot renew --dry-run
```

---

## 6. PM2 Configuration

The `ecosystem.config.js` file is already present at `backend/ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: 'roaya-api',
      script: 'dist/index.js',
      instances: 1,           // fork mode -- required for WebSocket
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
```

> **Fork mode is required.** The WebSocket server (`ws`) binds directly to the HTTP server instance. Cluster mode would create multiple listeners without sticky sessions, breaking real-time analytics connections.

### Start Application

```bash
cd /opt/roaya/app/backend
pm2 start ecosystem.config.js --env production
pm2 save
```

### Auto-start on Boot

```bash
# Generate startup script (run as roaya user)
pm2 startup systemd -u roaya --hp /home/roaya

# The command above prints a sudo command -- run it:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u roaya --hp /home/roaya

pm2 save
```

### Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD
pm2 set pm2-logrotate:workerInterval 3600
```

### Monitoring Commands

```bash
pm2 status            # process list
pm2 monit             # live dashboard (CPU, memory, logs)
pm2 logs roaya-api    # tail logs
pm2 logs roaya-api --lines 200   # last 200 lines
pm2 describe roaya-api           # full process details
```

---

## 7. Firewall & Security

### UFW (Uncomplicated Firewall)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
```

### fail2ban (SSH brute-force protection)

```bash
sudo apt install -y fail2ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
findtime = 600
bantime = 3600
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Service Binding Summary

| Service | Bind Address | External Access |
|---------|-------------|-----------------|
| PostgreSQL | `localhost` | Blocked |
| Redis | `127.0.0.1` | Blocked |
| Node.js (PM2) | `0.0.0.0:3001` | Via Nginx only (UFW blocks 3001) |
| Nginx | `0.0.0.0:80,443` | Public |

### Application-level Security

The Express app already includes these security layers (configured in `src/app.ts`):

- **Helmet** -- sets security headers (CSP, X-Frame-Options, etc.)
- **CORS** -- whitelist via `CORS_ORIGIN` env var
- **CSRF** -- double-submit cookie pattern via `csurf`
- **Rate limiting** -- `express-rate-limit` with configurable windows
- **Body size limit** -- 10 MB max (`express.json({ limit: '10mb' })`)
- **Trust proxy** -- `app.set('trust proxy', 1)` for correct IP behind Nginx
- **Cookie parser** -- secure cookie handling before CSRF checks

### Secure the .env File

```bash
chmod 600 /opt/roaya/app/backend/.env
chown roaya:roaya /opt/roaya/app/backend/.env
```

### Disable Root SSH Login

Edit `/etc/ssh/sshd_config`:

```
PermitRootLogin no
PasswordAuthentication no     # use SSH keys only
MaxAuthTries 3
```

```bash
sudo systemctl restart sshd
```

---

## 8. Monitoring & Health Checks

### Health Endpoint

```
GET https://api.roaya.co/api/v1/health
```

Response (`200` healthy, `503` unhealthy):

```json
{
  "status": "healthy",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

### Analytics Health Endpoint

```
GET https://api.roaya.co/api/v1/website-analytics/health
```

Returns uptime, active sessions, page views today, cache hit rate, and average response time.

### Prometheus Metrics Endpoint

```
GET https://api.roaya.co/api/v1/website-analytics/metrics
```

Returns Prometheus text format:

```
# HELP analytics_active_sessions Current active sessions
# TYPE analytics_active_sessions gauge
analytics_active_sessions 42

# HELP analytics_total_page_views_today Total page views today
# TYPE analytics_total_page_views_today counter
analytics_total_page_views_today 1523

# HELP analytics_cache_hit_rate Cache hit rate percentage
# TYPE analytics_cache_hit_rate gauge
analytics_cache_hit_rate 87.5

# HELP analytics_avg_response_time_ms Average response time in ms
# TYPE analytics_avg_response_time_ms gauge
analytics_avg_response_time_ms 45.2
```

### External Monitoring (cron health check)

Add to crontab (`crontab -e` as root or monitoring user):

```bash
# Check health every 5 minutes, alert on failure
*/5 * * * * curl -sf https://api.roaya.co/api/v1/health -o /dev/null || echo "Roaya API unhealthy at $(date)" >> /var/log/roaya-health.log
```

### PM2 Monitoring

```bash
pm2 monit                   # live TUI dashboard
pm2 status                  # quick status table
pm2 describe roaya-api      # detailed process info
```

### Log Locations

| Log | Path |
|-----|------|
| Application stdout | `/opt/roaya/app/backend/logs/pm2-out.log` |
| Application stderr | `/opt/roaya/app/backend/logs/pm2-error.log` |
| Winston logs | `/opt/roaya/app/backend/logs/` (if file transport configured) |
| Nginx access | `/var/log/nginx/access.log` |
| Nginx error | `/var/log/nginx/error.log` |
| PostgreSQL | `/var/log/postgresql/postgresql-15-main.log` |
| Redis | `/var/log/redis/redis-server.log` |

---

## 9. Backup Strategy

### PostgreSQL Backups

Create backup script at `/opt/roaya/scripts/backup-db.sh`:

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/roaya/backups/postgres"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="roaya_leads_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump and compress
sudo -u postgres pg_dump roaya_leads | gzip > "${BACKUP_DIR}/${FILENAME}"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup completed: ${FILENAME}" >> /var/log/roaya-backup.log
```

```bash
chmod +x /opt/roaya/scripts/backup-db.sh
```

Schedule via cron (`sudo crontab -e`):

```bash
# Daily database backup at 02:00
0 2 * * * /opt/roaya/scripts/backup-db.sh

# Weekly full backup on Sunday at 01:00
0 1 * * 0 /opt/roaya/scripts/backup-db.sh
```

### Redis Backups

Redis RDB snapshots are saved to `/var/lib/redis/dump.rdb` automatically per the `save` directives. For additional backup:

```bash
#!/bin/bash
# /opt/roaya/scripts/backup-redis.sh
set -euo pipefail

BACKUP_DIR="/opt/roaya/backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Trigger a save and copy
redis-cli -a CHANGE_ME_REDIS_PASSWORD BGSAVE
sleep 5
cp /var/lib/redis/dump.rdb "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"

# Retain 14 days
find "$BACKUP_DIR" -name "*.rdb" -mtime +14 -delete
```

### Offsite Storage

Sync backups to an offsite location (e.g., S3, B2, rsync to another server):

```bash
# Example: sync to S3
aws s3 sync /opt/roaya/backups/ s3://roaya-backups/ --delete

# Example: rsync to remote
rsync -avz /opt/roaya/backups/ backup-user@remote-server:/backups/roaya/
```

### Restore from Backup

```bash
# Restore PostgreSQL
gunzip -c /opt/roaya/backups/postgres/roaya_leads_20260201_020000.sql.gz | sudo -u postgres psql roaya_leads

# Restore Redis
sudo systemctl stop redis-server
sudo cp /opt/roaya/backups/redis/dump_20260201.rdb /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb
sudo systemctl start redis-server
```

---

## 10. Maintenance Commands

### Deploy Updates

```bash
# SSH into server as roaya user
sudo -u roaya -i
cd /opt/roaya/app

# Pull latest code
git pull origin main

cd backend

# Install deps (production only)
npm ci --omit=dev

# Build
npm run build

# Run any new Prisma migrations
npx prisma migrate deploy

# Restart with zero-downtime reload
pm2 reload roaya-api
```

### Rollback Application

```bash
cd /opt/roaya/app

# Revert to previous commit
git log --oneline -5       # find the target commit
git checkout <COMMIT_SHA>

cd backend
npm ci --omit=dev
npm run build
pm2 reload roaya-api
```

### Database Migration Rollback

There is no automatic rollback. Use the rollback migration file for full reset (**destroys all data**):

```bash
# WARNING: This drops all application tables.
# Only use after restoring from a pg_dump backup.
sudo -u postgres psql -d roaya_leads -f prisma/migrations/000_rollback.sql
```

For partial rollbacks, write a reverse migration SQL manually and apply it:

```bash
sudo -u postgres psql -d roaya_leads -f /path/to/reverse_migration.sql
```

### Log Inspection

```bash
# Application logs (live)
pm2 logs roaya-api

# Application logs (last N lines)
pm2 logs roaya-api --lines 500

# Filter error logs
pm2 logs roaya-api --err --lines 200

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL slow queries
sudo tail -f /var/log/postgresql/postgresql-15-main.log | grep duration

# Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Common Operations

```bash
# Check all services
systemctl status postgresql redis-server nginx
pm2 status

# Restart individual services
sudo systemctl restart postgresql
sudo systemctl restart redis-server
sudo systemctl restart nginx
pm2 restart roaya-api

# Check disk usage
df -h
du -sh /opt/roaya/backups/*

# Check database size
sudo -u postgres psql -d roaya_leads -c "SELECT pg_size_pretty(pg_database_size('roaya_leads'));"

# Check active database connections
sudo -u postgres psql -d roaya_leads -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'roaya_leads';"

# Flush Redis cache (if needed)
redis-cli -a CHANGE_ME_REDIS_PASSWORD FLUSHDB
# Note: FLUSHDB is disabled by default in our config.
# Rename it back temporarily or restart Redis to clear.

# Run Prisma Studio (debugging, not for production use)
cd /opt/roaya/app/backend
npx prisma studio
```

---

## Quick Reference -- Deployment Checklist

- [ ] Server provisioned with Ubuntu 22.04 LTS
- [ ] Node.js 20+ installed
- [ ] PostgreSQL 15 installed, database and user created, extensions enabled
- [ ] `pg_hba.conf` restricted to local access
- [ ] Redis 7 installed, password set, bound to localhost
- [ ] Repository cloned, `npm ci --omit=dev` completed
- [ ] `.env` created with all required vars, `chmod 600`
- [ ] `npm run build` successful
- [ ] Manual SQL migrations 001-004 applied
- [ ] `npx prisma migrate deploy` completed
- [ ] `npm run prisma:seed` completed
- [ ] PM2 started with `--env production`
- [ ] `pm2 startup` and `pm2 save` executed
- [ ] Nginx config in place with reverse proxy and WebSocket upgrade
- [ ] SSL certificate obtained via Certbot
- [ ] UFW enabled (22, 80, 443 only)
- [ ] fail2ban configured for SSH
- [ ] Backup cron jobs scheduled
- [ ] Health check returns `200` at `/api/v1/health`
- [ ] WebSocket connects at `/ws/analytics/active-visitors`
