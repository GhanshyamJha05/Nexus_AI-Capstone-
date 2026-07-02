# Nexus AI — Agent System

## Overview

Nexus AI uses a **multi-agent pipeline** powered by LangGraph and Gemini 2.5 Pro.
Each agent is independent, runs concurrently, and returns structured JSON.

---

## Agent Pipeline

```
User Prompt
     │
     ▼
[1] Planner Agent
     │  Decomposes prompt, routes guidance
     ▼
[2] Expert Agents (parallel)
     ├── Economist Agent
     ├── Policy Analyst Agent
     ├── Technology Strategist Agent
     ├── Environmental Scientist Agent
     └── Supply Chain Expert Agent
     │
     ▼
[3] Consensus Agent
     │  Synthesizes, finds agreements/conflicts
     ▼
[4] Graph Agent
     │  Builds causal graph
     ▼
Final State → Persist to DB → Notify via WebSocket
```

---

## Agent Specifications

### 🧭 Planner Agent

**Persona:** Master strategic analyst  
**Model temperature:** 0.2 (precise)  
**Purpose:** Decompose the user prompt into domain-specific sub-problems

**Output:**
```json
{
  "decision_title": "...",
  "domain": "supply_chain",
  "core_decision": "...",
  "key_dimensions": [...],
  "expert_guidance": {
    "economist": "Focus on labor cost differentials and FDI flows",
    "policy": "Analyze India's PLI scheme and US-India trade dynamics",
    ...
  },
  "context_notes": "..."
}
```

---

### 📈 Economist Agent

**Persona:** Dr. Elena Voss — IMF/World Bank macroeconomist  
**Model temperature:** 0.3  
**Expertise:** Trade flows, GDP impact, monetary policy, labor economics, emerging markets

**Frameworks applied:**
- CGE (Computable General Equilibrium) models
- Gravity model for trade
- Input-output analysis
- Labor market economics

---

### 🏛️ Policy Analyst Agent

**Persona:** Ambassador Sarah Chen — former US Deputy Trade Representative  
**Model temperature:** 0.3  
**Expertise:** WTO rules, trade agreements, geopolitical risk, regulatory environments

**Frameworks applied:**
- Geopolitical risk matrix
- Regulatory compliance mapping
- Treaty and tariff analysis
- Government relations strategy

---

### ⚙️ Technology Strategist Agent

**Persona:** Dr. Marcus Webb — former CTO and MIT professor  
**Model temperature:** 0.3  
**Expertise:** Semiconductor supply chains, Industry 4.0, R&D economics, IP strategy

**Frameworks applied:**
- Technology Readiness Level (TRL) assessment
- Innovation diffusion curves
- Ecosystem dependency mapping
- IP and technology transfer risk

---

### 🌍 Environmental Scientist Agent

**Persona:** Dr. Priya Nair — UN Environment Programme  
**Model temperature:** 0.3  
**Expertise:** Carbon accounting, climate risk, sustainability regulations, ESG

**Frameworks applied:**
- Lifecycle Assessment (LCA)
- Scope 1/2/3 emissions analysis
- TCFD climate risk framework
- GRI/SASB reporting standards

---

### 🔗 Supply Chain Expert Agent

**Persona:** James Okafor — McKinsey supply chain director  
**Model temperature:** 0.3  
**Expertise:** Network design, supplier qualification, logistics infrastructure, resilience

**Frameworks applied:**
- Total Landed Cost (TLC) model
- Network design optimization
- Resilience scoring matrix
- Supplier qualification timelines

---

### ⚖️ Consensus Agent

**Persona:** Chief Strategic Synthesis Officer  
**Model temperature:** 0.2  
**Purpose:** Read all expert results, identify agreements/conflicts, produce unified picture

**Output:**
```json
{
  "overall_summary": "...",
  "agreements": [...],
  "conflicts": [
    {
      "topic": "Carbon emissions",
      "positions": {"environment": "...", "supply_chain": "..."},
      "resolution": "..."
    }
  ],
  "overall_confidence": 0.73,
  "final_reasoning": "...",
  "key_uncertainties": [...],
  "recommended_actions": [...],
  "risk_level": "high"
}
```

---

### 🕸️ Graph Agent

**Persona:** Causal inference specialist  
**Model temperature:** 0.1 (deterministic)  
**Purpose:** Build a causal graph with typed nodes and directional edges

**Node types:** trigger, effect, stakeholder, factor  
**Edge directions:** positive, negative, uncertain

---

## Structured Output Format

Every expert agent returns this JSON schema:

```json
{
  "summary": "2-3 sentence executive summary",
  "reasoning": "Detailed step-by-step reasoning",
  "assumptions": ["assumption 1", "assumption 2"],
  "confidence": 0.78,
  "evidence": [
    {"point": "...", "strength": "strong|moderate|weak", "source": "..."}
  ],
  "citations": [
    {"title": "...", "source": "...", "relevance": 0.9, "excerpt": "..."}
  ],
  "timeline_impacts": {
    "immediate": "...",
    "one_week": "...",
    "one_month": "...",
    "six_months": "...",
    "one_year": "...",
    "five_years": "..."
  },
  "affected_stakeholders": ["..."],
  "thinking_steps": ["..."]
}
```

---

## Memory System

| Type | Implementation | Purpose |
|---|---|---|
| Working memory | LangGraph state dict | Pass data between agents in same run |
| Short-term | Redis (session) | Cache recent results |
| Long-term | PostgreSQL | Simulation history, agent outputs |
| Semantic | ChromaDB | RAG knowledge retrieval |

---

## RAG Integration

Each agent can retrieve relevant context from ChromaDB:

1. Query is embedded using Google's `embedding-001` model
2. Top-5 most relevant chunks are retrieved (similarity search)
3. Retrieved context is injected into the agent's user prompt
4. Agent cites retrieved sources in its output

The knowledge base is seeded with:
- Global trade statistics
- Geopolitical risk reports
- Technology adoption data
- Environmental regulations
- Supply chain benchmarks

---

## Extending the Agent System

To add a new expert agent:

1. Create a new class in `backend/app/agents/expert_agents.py`:
```python
class FinanceAgent(BaseExpertAgent):
    role = "finance"
    display_name = "Financial Analyst"
    emoji = "💰"

    @property
    def system_prompt(self) -> str:
        return "You are a senior financial analyst..."
```

2. Add to `EXPERT_ROLES` in `orchestrator.py`
3. Add to `role_attr_map` in `tasks.py`
4. Add display metadata in `frontend/src/components/simulation/agent-panel.tsx`
