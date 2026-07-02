"""Base class for all Nexus AI expert agents."""

import time
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

import structlog
from langchain.schema import HumanMessage, SystemMessage
from tenacity import retry, stop_after_attempt, wait_exponential

from app.agents.llm_client import extract_json_from_response, get_llm
from app.agents.schemas import AgentResult, Citation, TimelineImpact

logger = structlog.get_logger(__name__)


class BaseExpertAgent(ABC):
    """Base class providing common LLM invocation and result parsing logic."""

    role: str = "base"
    display_name: str = "Base Agent"
    emoji: str = "🤖"

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.llm = get_llm(api_key=api_key, temperature=0.3)
        self.logger = structlog.get_logger(self.__class__.__name__)

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """The system prompt that defines this agent's persona and task."""
        ...

    def build_user_prompt(self, decision_prompt: str, context: str = "") -> str:
        return f"""
Strategic Decision to Analyze:
{decision_prompt}

{"Additional Context:\n" + context if context else ""}

Respond with a valid JSON object matching exactly this schema:
{{
  "summary": "<2-3 sentence executive summary from your domain perspective>",
  "reasoning": "<detailed step-by-step reasoning, 4-8 sentences>",
  "assumptions": ["<assumption 1>", "<assumption 2>", "..."],
  "confidence": <float between 0.0 and 1.0>,
  "evidence": [
    {{"point": "<evidence point>", "strength": "<strong|moderate|weak>", "source": "<domain/source>"}}
  ],
  "citations": [
    {{"title": "<source title>", "source": "<domain or URL>", "relevance": <0.0-1.0>, "excerpt": "<relevant quote or fact>"}}
  ],
  "timeline_impacts": {{
    "immediate": "<impact in first 24-72 hours>",
    "one_week": "<impact after 1 week>",
    "one_month": "<impact after 1 month>",
    "six_months": "<impact after 6 months>",
    "one_year": "<impact after 1 year>",
    "five_years": "<impact after 5 years>"
  }},
  "affected_stakeholders": ["<stakeholder 1>", "<stakeholder 2>", "..."],
  "thinking_steps": ["<step 1>", "<step 2>", "..."]
}}
""".strip()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _invoke_llm(self, user_prompt: str) -> str:
        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=user_prompt),
        ]
        response = await self.llm.ainvoke(messages)
        return response.content

    async def run(
        self,
        decision_prompt: str,
        context: str = "",
        rag_context: str = "",
    ) -> AgentResult:
        """Execute this agent and return a structured AgentResult."""
        start = time.perf_counter()
        self.logger.info("Agent starting", role=self.role, prompt_preview=decision_prompt[:80])

        full_context = "\n\n".join(filter(None, [context, rag_context]))
        user_prompt = self.build_user_prompt(decision_prompt, full_context)

        try:
            raw_response = await self._invoke_llm(user_prompt)
            parsed = extract_json_from_response(raw_response)

            timeline_data = parsed.get("timeline_impacts", {})
            timeline = TimelineImpact(
                immediate=timeline_data.get("immediate", "No data"),
                one_week=timeline_data.get("one_week", "No data"),
                one_month=timeline_data.get("one_month", "No data"),
                six_months=timeline_data.get("six_months", "No data"),
                one_year=timeline_data.get("one_year", "No data"),
                five_years=timeline_data.get("five_years", "No data"),
            )

            citations = [
                Citation(**c)
                for c in parsed.get("citations", [])
                if isinstance(c, dict)
            ]

            execution_time = time.perf_counter() - start
            self.logger.info("Agent complete", role=self.role, time_s=round(execution_time, 2))

            return AgentResult(
                agent_role=self.role,
                summary=parsed.get("summary", "No summary provided"),
                reasoning=parsed.get("reasoning", "No reasoning provided"),
                assumptions=parsed.get("assumptions", []),
                confidence=float(parsed.get("confidence", 0.5)),
                evidence=parsed.get("evidence", []),
                citations=citations,
                timeline_impacts=timeline,
                affected_stakeholders=parsed.get("affected_stakeholders", []),
                thinking_steps=parsed.get("thinking_steps", []),
                raw_response=raw_response,
            )
        except Exception as exc:
            execution_time = time.perf_counter() - start
            self.logger.error("Agent failed", role=self.role, error=str(exc))
            raise
