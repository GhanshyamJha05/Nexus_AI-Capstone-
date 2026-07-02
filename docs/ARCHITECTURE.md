# Nexus AI — Architecture

## System Overview

Nexus AI is a multi-tier application with a clear separation between the presentation layer,
API layer, AI orchestration layer, and persistence layer.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│   Next.js 15 + React 19 + TailwindCSS + Framer Motion + ReactFlow   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────▼───────────────────────────────────────────┐
│                          NGINX REVERSE PROXY                        │
│         Rate limiting • SSL termination • WebSocket passthrough     │
└────────────┬────────────────────────────────┬───────────────────────┘
             │ /api/*                          │ /*
┌────────────▼──────────────┐     ┌───────────▼──────────────────────┐
│     FastAPI Backend       │     │       Next.js Frontend            │
│  JWT Auth • REST API      │     │  Pages • Components • Hooks       │
│  WebSocket streaming      │     │  TanStack Query • Jotai           │
└──────┬──────────┬─────────┘     └──────────────────────────────────┘
       │          │
┌──────▼──┐ ┌────▼────────────────────────────────────────────────────┐
│  Redis  │ │                  CELERY WORKERS                          │
│  Cache  │ │        run_simulation_task • cleanup tasks               │
│  PubSub │ └─────────────────────┬───────────────────────────────────┘
│  Queue  │                       │
└─────────┘ ┌─────────────────────▼───────────────────────────────────┐
            │              SIMULATION ORCHESTRATOR                     │
            │                                                          │
            │   ┌──────────┐   ┌─────────────────────────────────┐    │
            │   │ Planner  │──▶│  Expert Agents (parallel)       │    │
            │   │  Agent   │   │  ┌──────────┐ ┌──────────────┐  │    │
            │   └──────────┘   │  │Economist │ │Policy Analyst│  │    │
            │                  │  └──────────┘ └──────────────┘  │    │
            │                  │  ┌──────────┐ ┌──────────────┐  │    │
            │                  │  │ Tech     │ │ Environment  │  │    │
            │                  │  └──────────┘ └──────────────┘  │    │
            │                  │  ┌──────────────────────────┐   │    │
            │                  │  │    Supply Chain Expert   │   │    │
            │                  │  └──────────────────────────┘   │    │
            │                  └─────────────────────────────────┘    │
            │                            │                             │
            │                  ┌─────────▼──────────┐                 │
            │                  │  Consensus Agent   │                 │
            │                  └─────────┬──────────┘                 │
            │                  ┌─────────▼──────────┐                 │
            │                  │   Graph Agent      │                 │
            │                  └────────────────────┘                 │
            └─────────────────────────────────────────────────────────┘
                    │ RAG                    │ LLM
            ┌───────▼──────┐       ┌────────▼────────┐
            │  ChromaDB    │       │  Gemini 3.5 Pro  │
            │  Vector DB   │       │  (Google AI)     │
            └──────────────┘       └─────────────────┘
            ┌──────────────────────────────────────────┐
            │           PostgreSQL (Primary DB)         │
            │  Users • Simulations • AgentOutputs       │
            │  Reports • Messages • KnowledgeSources    │
            └──────────────────────────────────────────┘
```

## Component Descriptions

### Frontend (Next.js 15)
- **App Router** with server and client components
- **TanStack Query** for server state management with automatic refetching
- **Jotai** for lightweight client state (auth, UI)
- **Framer Motion** for all animations (landing page, agent cards)
- **React Flow** for the interactive causal graph
- **WebSocket hook** for real-time agent streaming

### Backend (FastAPI)
- **Async-first** with `asyncpg` and `asyncio` throughout
- **Dependency injection** via FastAPI's `Depends()` pattern
- **Repository pattern** separating data access from business logic
- **Structured logging** with `structlog` in JSON format

### AI Orchestration (LangGraph + LangChain)
- **SimulationOrchestrator**: coordinates the full pipeline
- **PlannerAgent**: decomposes the prompt into domain sub-problems
- **5 Expert Agents**: run in parallel using `asyncio.gather()`
- **ConsensusAgent**: synthesizes all expert results
- **GraphAgent**: builds causal graph from analysis
- All agents use **structured JSON output** for reliability

### RAG Pipeline (ChromaDB)
- **Google Embedding API** (`models/embedding-001`) for semantic search
- **ChromaDB** as the vector store (HTTP client mode)
- Context injected into agent prompts at inference time
- Domain-filtered retrieval for relevance

### Task Queue (Celery + Redis)
- Long-running simulations run in **Celery workers** (not blocking the API)
- **Redis pub/sub** for streaming agent status updates to WebSocket clients
- Celery Beat for scheduled maintenance tasks

### Database (PostgreSQL)
- **Async SQLAlchemy 2.0** with `asyncpg` driver
- **Alembic** for version-controlled migrations
- **JSONB columns** for flexible structured data (causal_graph, timeline, consensus)

## Data Flow

1. User submits a prompt → `POST /api/v1/simulations`
2. FastAPI creates a Simulation row (status=PENDING)
3. Celery task is dispatched → simulation status = RUNNING
4. Orchestrator runs Planner, then Expert Agents in parallel
5. Each agent publishes status to Redis channel `simulation:{id}`
6. WebSocket handler subscribes and forwards to browser in real-time
7. Consensus + Graph agents run after all experts complete
8. Results persisted to PostgreSQL
9. TanStack Query polls and updates the UI
10. User can generate PDF report on demand

## Security Architecture

- **JWT** (HS256) for stateless authentication
- **Bcrypt** password hashing
- **Rate limiting** at both Nginx and application level
- **Input validation** via Pydantic schemas on all endpoints
- **CORS** restricted to configured origins
- **Environment variables** for all secrets (never hardcoded)
- User-provided API keys encrypted at rest
