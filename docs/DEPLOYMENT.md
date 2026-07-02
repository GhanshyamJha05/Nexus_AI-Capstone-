# Nexus AI — Deployment Guide

## Production Checklist

Before deploying to production, verify:

- [ ] All secrets rotated from defaults in `.env`
- [ ] `APP_ENV=production` set
- [ ] `APP_SECRET_KEY` is 64+ random characters
- [ ] `JWT_SECRET_KEY` is 64+ random characters
- [ ] `POSTGRES_PASSWORD` is strong and unique
- [ ] API docs disabled (set in `main.py` for production)
- [ ] HTTPS configured (SSL certificate)
- [ ] `APP_CORS_ORIGINS` restricted to your domain

---

## Docker Compose (Production)

```bash
# On your production server:
git clone https://github.com/your-org/nexus-ai.git /opt/nexus-ai
cd /opt/nexus-ai

# Create production .env
cp .env.example .env
# Edit with production values

# Pull and start
docker-compose pull
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed initial data (first deploy only)
docker-compose exec backend python scripts/seed_data.py
```

---

## Scaling Celery Workers

```yaml
# In docker-compose.yml, add replicas:
celery_worker:
  deploy:
    replicas: 4
```

Or run additional workers:
```bash
docker-compose up -d --scale celery_worker=4
```

---

## SSL / HTTPS (Nginx)

For production, update `docker/nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # ... rest of config
}
```

Use [Certbot](https://certbot.eff.org/) for Let's Encrypt certificates.

---

## Database Backups

```bash
# Automated daily backup
docker-compose exec postgres pg_dump -U nexus nexus_ai | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c backup_20250101.sql.gz | docker-compose exec -T postgres psql -U nexus nexus_ai
```

Add to cron for automated backups:
```cron
0 2 * * * cd /opt/nexus-ai && docker-compose exec postgres pg_dump -U nexus nexus_ai | gzip > /backups/nexus_$(date +\%Y\%m\%d).sql.gz
```

---

## Monitoring

### Health endpoints
- `GET /health` — Application health
- `GET /health/ready` — Readiness check (DB + Redis)

### Recommended stack
- **Prometheus** + **Grafana** for metrics
- **Sentry** for error tracking (set `SENTRY_DSN`)
- **Datadog** or **New Relic** for APM

---

## Environment-Specific Configuration

| Setting | Development | Production |
|---|---|---|
| `APP_ENV` | `development` | `production` |
| `debug` | `true` | `false` |
| API docs (`/docs`) | Enabled | Disabled |
| Log format | Console | JSON |
| Log level | `DEBUG` | `INFO` |
| CORS origins | `*` or localhost | Your domain only |

---

## CI/CD with GitHub Actions

The `.github/workflows/deploy.yml` workflow:
1. Triggers on push to `main` branch
2. Builds Docker images for backend and frontend
3. Pushes to Docker Hub with `latest` and SHA tags
4. Deploys to server via SSH (if `DEPLOY_HOST` secret is set)

Required GitHub Secrets:
- `DOCKER_USERNAME` — Docker Hub username
- `DOCKER_PASSWORD` — Docker Hub password/token
- `DEPLOY_HOST` — Production server IP/hostname
- `DEPLOY_USER` — SSH username
- `DEPLOY_SSH_KEY` — Private SSH key
- `NEXT_PUBLIC_API_URL` — Production API URL
- `NEXT_PUBLIC_WS_URL` — Production WebSocket URL
