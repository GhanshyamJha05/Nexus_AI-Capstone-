# Nexus AI — Simulate Decisions Before Reality Does

<div align="center">
  <h3>Multi-Agent Decision Intelligence Platform</h3>
  <p>Launch expert AI agents to simulate the chain reactions of your strategic decisions.</p>

  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Python](https://img.shields.io/badge/python-3.12-blue.svg)
  ![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)
  ![Docker](https://img.shields.io/badge/docker-compose-blue.svg)
</div>

---

## What Is Nexus AI?

Nexus AI is a **Multi-Agent Decision Intelligence Platform**. Instead of answering questions, it simulates the **chain reactions** caused by strategic decisions.

**Example prompt:**
> "What happens if Apple shifts 50% of manufacturing from China to India?"

The system:
1. Launches 6 specialized expert AI agents
2. Each agent analyzes the decision from its domain perspective
3. A consensus agent synthesizes agreements and conflicts
4. A causal graph maps cause-and-effect relationships
5. A ripple timeline shows impacts at 1 week, 1 month, 6 months, 1 year, 5 years
6. An executive report is generated and exportable as PDF

---

## Quick Start

```bash
# Clone and configure
git clone https://github.com/your-org/nexus-ai.git
cd nexus-ai
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System design and component overview |
| [Installation](docs/INSTALLATION.md) | Detailed setup instructions |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [API Reference](docs/API.md) | Full REST API documentation |
| [Agent System](docs/AGENTS.md) | Multi-agent architecture explanation |
| [Evaluation](docs/EVALUATION.md) | Quality metrics and methodology |
| [Future Improvements](docs/FUTURE.md) | Roadmap and planned features |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion |
| Backend | FastAPI, Python 3.12, LangGraph, LangChain, Pydantic |
| Database | PostgreSQL, ChromaDB (vector), Redis |
| AI | Gemini 2.5 Pro, RAG, Tool Calling, Memory |
| Infra | Docker, Docker Compose, GitHub Actions |

---

## License

MIT © Nexus AI Team
