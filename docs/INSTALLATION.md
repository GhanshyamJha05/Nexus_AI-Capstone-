# Nexus AI — Installation Guide

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker | 24+ | Container runtime |
| Docker Compose | v2+ | Multi-container orchestration |
| Git | 2.x | Source control |
| Node.js | 22+ | Frontend development |
| Python | 3.12+ | Backend development |
| Google AI Studio account | — | Gemini API key |

---

## Quick Start (Docker)

The fastest way to run the full stack:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nexus-ai.git
cd nexus-ai

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set GEMINI_API_KEY

# 3. Start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### First-time setup (seed data)

```bash
# Wait for containers to start, then run:
docker-compose exec backend python scripts/seed_data.py

# Demo credentials:
# Email: demo@nexus-ai.com
# Password: Demo@12345
```

---

## Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL and Redis (using Docker for these only)
docker run -d --name nexus-postgres \
  -e POSTGRES_DB=nexus_ai \
  -e POSTGRES_USER=nexus \
  -e POSTGRES_PASSWORD=nexus_password \
  -p 5432:5432 postgres:16-alpine

docker run -d --name nexus-redis \
  -p 6379:6379 redis:7-alpine

docker run -d --name nexus-chroma \
  -p 8001:8000 chromadb/chroma:0.5.0

# Configure environment
cp ../.env.example .env
# Edit .env with local connection strings

# Run migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000

# In a separate terminal, start Celery worker
celery -A app.workers.celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000" >> .env.local

# Start development server
npm run dev

# Frontend available at: http://localhost:3000
```

---

## Environment Variables

See `.env.example` for all variables with descriptions.

**Required:**
- `GEMINI_API_KEY` — Your Google AI Studio API key
- `POSTGRES_PASSWORD` — Database password
- `APP_SECRET_KEY` — Random 64+ character secret
- `JWT_SECRET_KEY` — Random 64+ character JWT secret

**Optional:**
- `SENTRY_DSN` — Error tracking
- `SMTP_*` — Email configuration

---

## Running Tests

### Backend
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend
```bash
cd frontend
npm test
npm run type-check
npm run lint
```

### Evaluation
```bash
cd evaluation
python evaluate.py --all
```

---

## Troubleshooting

**"Cannot connect to database"**
- Ensure PostgreSQL container is running: `docker-compose ps`
- Verify `DATABASE_URL` in `.env` matches your Postgres config

**"Redis connection refused"**
- Ensure Redis is running: `docker-compose ps`
- Check `REDIS_URL` in `.env`

**"Gemini API error"**
- Verify `GEMINI_API_KEY` is set and valid
- Check quota at [Google AI Studio](https://aistudio.google.com)

**"ChromaDB not reachable"**
- ChromaDB starts slower; wait 15–20 seconds after `docker-compose up`
- Check `CHROMA_HOST` and `CHROMA_PORT` in `.env`

**Celery tasks not running**
- Ensure the Celery worker container is running
- Check worker logs: `docker-compose logs celery_worker`
