"""Consensus Agent — synthesizes all expert results into a unified view."""

import json
from typing import List, Optional

import structlog
from langchain.schema import HumanMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

from app.agents.llm_client import extract_json_from_response, get_llm
from app.agents.schemas import AgentResult, ConsensusResult

logger = structlog.get_logger(__name__)

SYSTEM_PROMPT = """You are the Chief Strategic Synthesis Officer at Nexus AI.
Your role is to read the analyses from 5 independent expert agents and synthesize them into
a single coherent strategic picture.

You excel at:
- Identifying where experts agree and disagree
- Resolving conflicts through higher-order reasoning
- Computing aggregate confidence from expert confidences
- Surfacing the most critical risks and opportunities
- Formulating actionable recommendations

You are objective, balanced, and never ignore dissenting expert views.
Always respond with a valid JSON object as instructed."""


class ConsensusAgent:
    role = "consensus"
    display_name = "Consensus Agent"
    emoji = "⚖️"

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.llm = get_llm(api_key=api_key, temperature=0.2)

    def _format_expert_results(self, results: List[AgentResult]) -> str:
        parts = []
        for r in results:
            parts.append(f"""
=== {r.agent_role.upper()} AGENT ===
Summary: {r.summary}
Confidence: {r.confidence:.0%}
Reasoning: {r.reasoning}
Key Assumptions: {json.dumps(r.assumptions, indent=2)}
Timeline:
  - Immediate: {r.timeline_impacts.immediate}
  - 1 Week: {r.timeline_impacts.one_week}
  - 1 Month: {r.timeline_impacts.one_month}
  - 6 Months: {r.timeline_impacts.six_months}
  - 1 Year: {r.timeline_impacts.one_year}
  - 5 Years: {r.timeline_impacts.five_years}
Affected Stakeholders: {', '.join(r.affected_stakeholders)}
""")
        return "\n".join(parts)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def synthesize(
        self,
        decision_prompt: str,
        expert_results: List[AgentResult],
    ) -> ConsensusResult:
        logger.info("Consensus agent starting", n_experts=len(expert_results))

        expert_text = self._format_expert_results(expert_results)

        user_prompt = f"""
Strategic Decision:
{decision_prompt}

Expert Agent Analyses:
{expert_text}

Synthesize all expert analyses and respond with a valid JSON object:
{{
  "overall_summary": "<3-5 sentence executive summary synthesizing all expert views>",
  "agreements": [
    "<point where multiple experts agree>",
    "..."
  ],
  "conflicts": [
    {{
      "topic": "<area of disagreement>",
      "positions": {{"economist": "<their view>", "policy": "<their view>", ...}},
      "resolution": "<your resolution of this conflict>"
    }}
  ],
  "overall_confidence": <float 0.0-1.0, weighted average>,
  "final_reasoning": "<your synthesized reasoning connecting all domains>",
  "key_uncertainties": ["<uncertainty 1>", "..."],
  "recommended_actions": [
    "<concrete action recommendation 1>",
    "..."
  ],
  "risk_level": "<low|medium|high|critical>"
}}
""".strip()

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

        response = await self.llm.ainvoke(messages)
        parsed = extract_json_from_response(response.content)

        return ConsensusResult(
            overall_summary=parsed.get("overall_summary", ""),
            agreements=parsed.get("agreements", []),
            conflicts=parsed.get("conflicts", []),
            overall_confidence=float(parsed.get("overall_confidence", 0.5)),
            final_reasoning=parsed.get("final_reasoning", ""),
            key_uncertainties=parsed.get("key_uncertainties", []),
            recommended_actions=parsed.get("recommended_actions", []),
            risk_level=parsed.get("risk_level", "medium"),
        )
