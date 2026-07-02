# Vercel environment variables — Nexus AI

Use Vercel project Environment Variables / Secrets to store server-side configuration. Do NOT expose secrets via `NEXT_PUBLIC_` variables.

Recommended variables (server / secret):

- `DATABASE_URL` — Full SQLAlchemy/asyncpg URL (recommended) eg. `postgresql+asyncpg://user:pass@host:5432/db`
- `REDIS_URL` — redis://host:6379/0
- `CELERY_BROKER_URL` — e.g. `redis://redis:6379/1`
- `CELERY_RESULT_BACKEND` — e.g. `redis://redis:6379/2`
- `JWT_SECRET_KEY` — long random secret (server-side only)
- `APP_SECRET_KEY` — long random secret (server-side only)
- `GEMINI_API_KEY` — Google AI Studio / Gemini API key (secret)
- `SENTRY_DSN` — optional error-tracking (secret)
- `UPLOAD_DIR` — optional path or S3/remote upload configuration (if applicable)

Recommended variables (server / non-secret or hostnames):

- `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_COLLECTION`
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (only if not using `DATABASE_URL`)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (only if not using `REDIS_URL`)
- `LOG_LEVEL`, `LOG_FORMAT`, `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW`

Frontend (public; client-side, visible in browser):

- `NEXT_PUBLIC_API_URL` — production API base URL (e.g. `https://api.example.com`)
- `NEXT_PUBLIC_WS_URL` — production WebSocket URL
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION`

Notes & best practices:

- Any variable prefixed with `NEXT_PUBLIC_` will be embedded into client bundles — never store secrets there.
- Prefer a single `DATABASE_URL` secret rather than exposing individual DB connection parts.
- Mark secrets in Vercel for the appropriate Environment: `Production`, `Preview`, and `Development` as needed.
- For third-party secrets (Gemini API key, Sentry), set them as masked environment variables and restrict access to collaborators.
- If you need uploads to persist, configure `UPLOAD_DIR` to point to external storage (S3, etc.) rather than ephemeral container storage.

Quick Vercel CLI examples:

```
vercel env add DATABASE_URL production
vercel env add GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_API_URL production
```

If you'd like, I can create a `.vercel.env` template or set these via the Vercel API/CLI for you.
