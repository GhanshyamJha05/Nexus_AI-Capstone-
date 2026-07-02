# Nexus AI — Future Improvements & Roadmap

## Near-term (v1.1)

### Agent Enhancements
- [ ] **Financial Agent** — DCF modeling, M&A impact, equity market analysis
- [ ] **Legal Agent** — Contract risk, IP law, antitrust analysis
- [ ] **Social Impact Agent** — Community effects, DEI implications, public sentiment
- [ ] **Agent cross-communication** — Allow agents to query each other mid-simulation
- [ ] **Chain-of-thought streaming** — Stream thinking tokens in real time

### RAG Improvements
- [ ] **Live web search** — Inject current news and data into agent context
- [ ] **PDF ingestion** — Upload custom research documents for context
- [ ] **Citation verification** — Cross-check claims against source documents
- [ ] **Domain-specific corpora** — Pre-built knowledge bases per industry

### Simulation Features
- [ ] **Scenario comparison** — Run two variations side-by-side
- [ ] **Monte Carlo mode** — Run simulation N times, aggregate distributions
- [ ] **Sensitivity analysis** — "What if confidence of Economist changes by ±20%?"
- [ ] **Historical validation** — Compare predictions against known past decisions

---

## Medium-term (v1.2 – v2.0)

### Collaboration
- [ ] **Team workspaces** — Share simulations with colleagues
- [ ] **Comments & annotations** — Add notes to specific agent outputs
- [ ] **Approval workflows** — Review and approve before sharing reports
- [ ] **Version history** — Track how a simulation's understanding evolved

### Intelligence
- [ ] **Learning from feedback** — User ratings improve agent prompts over time
- [ ] **Organization memory** — Agents learn from past simulations in your org
- [ ] **Predictive modeling** — Integrate quantitative forecasting models
- [ ] **External data APIs** — Real-time Bloomberg, World Bank, IMF data feeds

### Platform
- [ ] **Zapier / Make integrations** — Trigger simulations from external workflows
- [ ] **Slack bot** — Run simulations from Slack, receive report summary
- [ ] **API SDK** — Python and JavaScript SDKs for programmatic access
- [ ] **Webhook support** — POST to your endpoint when simulation completes

---

## Long-term (v3.0+)

### Architecture
- [ ] **Agent marketplace** — Community-built domain expert agents
- [ ] **Multi-modal inputs** — Accept charts, images, PDFs as context
- [ ] **Private deployment** — Bring-your-own LLM (local models via Ollama)
- [ ] **Graph database** — Neo4j for richer causal relationship storage
- [ ] **Real-time world model** — Continuously updated global situation awareness

### Enterprise
- [ ] **SSO / SAML** — Enterprise identity provider integration
- [ ] **Audit logs** — Full compliance and data lineage tracking
- [ ] **On-premise deployment** — Full air-gapped deployment for sensitive use cases
- [ ] **Custom agent fine-tuning** — Train agents on organization-specific data
- [ ] **Multi-tenancy** — Isolated environments per enterprise customer

### Research
- [ ] **Calibration benchmarks** — Publish ground-truth validation against real outcomes
- [ ] **Academic partnerships** — Collaborate with business schools on evaluation
- [ ] **Open-source agent library** — Community-contributed domain agents
- [ ] **Simulation tournaments** — Blind prediction competitions for real-world events

---

## Technical Debt & Quality

- [ ] Migrate from polling to pure event-driven architecture (NATS/Kafka)
- [ ] Replace Celery with Temporal for more reliable task orchestration
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Implement connection pooling for ChromaDB
- [ ] Add property-based testing for agent output schemas
- [ ] Performance profiling and optimization of consensus synthesis
- [ ] GraphQL API as an alternative to REST for flexible data fetching

---

## Community Contributions Welcome

We welcome contributions in:
- New domain expert agents
- Knowledge base documents
- Evaluation datasets
- UI improvements
- Bug fixes and performance improvements

See `CONTRIBUTING.md` for guidelines.
