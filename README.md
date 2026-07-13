# Nexus AI

A multi-agent decision intelligence platform for simulating how strategic choices can ripple across business, policy, technology, and supply chain domains.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)

## Why Nexus AI

Nexus AI helps teams explore complex decisions before acting on them. Instead of giving a single answer, it launches specialized AI agents that evaluate a scenario from different perspectives, then combines their findings into a shared consensus, causal graph, and executive-style report.

Example prompts include:
- "What happens if a company shifts 50% of manufacturing from China to India?"
- "How would a new carbon policy affect supply chains and consumer pricing?"
- "What are the likely downstream effects of a major product launch?"

## Key Features

- Multi-agent reasoning with domain-focused expert agents
- Real-time simulation streaming and status updates
- Interactive causal graph and ripple timeline visualization
- Executive report generation for decision support
- Authentication, vector search, task queue processing, and containerized deployment

## Architecture at a Glance

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, async SQLAlchemy, Pydantic
- AI orchestration: LangGraph, LangChain, Gemini-based agents
- Data layer: PostgreSQL, Redis, ChromaDB
- Infrastructure: Docker Compose, Nginx, GitHub Actions

## Quick Start

### Prerequisites

- Docker 24+
- Docker Compose v2+
- Git
- A Google Gemini API key

### Run with Docker

```bash
git clone https://github.com/GhanshyamJha05/Nexus_AI-Capstone-.git
cd Nexus_AI-Capstone-
cp .env.example .env
# Edit .env and set GEMINI_API_KEY before starting the stack
docker compose up --build
```

Once running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Seed demo data

```bash
docker compose exec backend python scripts/seed_data.py
```

Demo credentials are included in the setup docs and seed script.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## Project Structure

- backend/: FastAPI application, agents, repositories, workers, and database models
- frontend/: Next.js app with dashboard, simulation UI, and shared components
- docker/: Container and reverse-proxy configuration
- docs/: Architecture, deployment, installation, and evaluation guides
- evaluation/: Automated evaluation scripts for agent outputs

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Installation](docs/INSTALLATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [API Reference](docs/API.md)
- [Agent System](docs/AGENTS.md)
- [Evaluation](docs/EVALUATION.md)
- [Future Improvements](docs/FUTURE.md)

## Contributing

Contributions are welcome. Please open an issue or submit a pull request with a clear summary of the changes you’d like to make.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
