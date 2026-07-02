"""Graph Agent — generates the causal graph from expert results."""

import json
from typing import List, Optional

import structlog
from langchain.schema import HumanMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

from app.agents.llm_client import extract_json_from_response, get_llm
from app.agents.schemas import AgentResult, CausalEdge, CausalGraph, CausalNode, ConsensusResult

logger = structlog.get_logger(__name__)


class GraphAgent:
    role = "graph"
    display_name = "Graph Constructor"
    emoji = "🕸️"

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.llm = get_llm(api_key=api_key, temperature=0.1)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def build_graph(
        self,
        decision_prompt: str,
        expert_results: List[AgentResult],
        consensus: Optional[ConsensusResult] = None,
    ) -> CausalGraph:
        logger.info("Graph agent building causal graph")

        context_parts = [f"Decision: {decision_prompt}\n"]
        for r in expert_results:
            context_parts.append(f"{r.agent_role}: {r.summary}")
        if consensus:
            context_parts.append(f"\nConsensus: {consensus.overall_summary}")

        context = "\n".join(context_parts)

        user_prompt = f"""
Based on this strategic decision analysis, construct a causal graph showing how causes lead to effects.

Context:
{context}

Create a causal graph with 10-20 nodes and 12-25 edges.

Node types:
- "trigger": The initial decision or action
- "effect": A downstream consequence
- "stakeholder": An affected party (company, government, population)
- "factor": An enabling or constraining factor

Edge direction:
- "positive": Source causes an increase/benefit in target
- "negative": Source causes a decrease/harm in target
- "uncertain": Direction unclear

Respond with valid JSON:
{{
  "nodes": [
    {{
      "id": "n1",
      "label": "<short label>",
      "type": "trigger|effect|stakeholder|factor",
      "description": "<1-2 sentence description>",
      "confidence": <0.0-1.0>,
      "domain": "economics|policy|technology|environment|supply_chain|general"
    }}
  ],
  "edges": [
    {{
      "source": "n1",
      "target": "n2",
      "label": "<relationship label>",
      "strength": <0.0-1.0>,
      "direction": "positive|negative|uncertain"
    }}
  ]
}}
""".strip()

        messages = [
            SystemMessage(content="You are a causal inference specialist who builds knowledge graphs from strategic analyses. Always produce valid JSON."),
            HumanMessage(content=user_prompt),
        ]

        response = await self.llm.ainvoke(messages)
        parsed = extract_json_from_response(response.content)

        nodes = [
            CausalNode(
                id=n.get("id", f"n{i}"),
                label=n.get("label", "Unknown"),
                type=n.get("type", "effect"),
                description=n.get("description", ""),
                confidence=float(n.get("confidence", 0.7)),
                domain=n.get("domain"),
            )
            for i, n in enumerate(parsed.get("nodes", []))
            if isinstance(n, dict)
        ]

        edges = [
            CausalEdge(
                source=e.get("source", ""),
                target=e.get("target", ""),
                label=e.get("label", "causes"),
                strength=float(e.get("strength", 0.5)),
                direction=e.get("direction", "positive"),
            )
            for e in parsed.get("edges", [])
            if isinstance(e, dict) and e.get("source") and e.get("target")
        ]

        return CausalGraph(nodes=nodes, edges=edges)
