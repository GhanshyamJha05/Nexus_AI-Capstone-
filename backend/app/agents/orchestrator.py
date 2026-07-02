"""LangGraph-based orchestrator that runs all agents in parallel then synthesizes."""

import asyncio
import time
from typing import Any, Callable, Dict, List, Optional

import structlog

from app.agents.consensus_agent import ConsensusAgent
from app.agents.expert_agents import (
    EconomistAgent,
    EnvironmentAgent,
    PlannerAgent,
    PolicyAgent,
    SupplyChainAgent,
    TechnologyAgent,
)
from app.agents.graph_agent import GraphAgent
from app.agents.schemas import AgentResult, CausalGraph, ConsensusResult, SimulationState
from app.core.redis_client import get_redis_client

logger = structlog.get_logger(__name__)


class SimulationOrchestrator:
    """Orchestrates the full multi-agent simulation pipeline."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key
        self.planner = PlannerAgent(api_key=api_key)
        self.expert_agents = [
            EconomistAgent(api_key=api_key),
            PolicyAgent(api_key=api_key),
            TechnologyAgent(api_key=api_key),
            EnvironmentAgent(api_key=api_key),
            SupplyChainAgent(api_key=api_key),
        ]
        self.consensus_agent = ConsensusAgent(api_key=api_key)
        self.graph_agent = GraphAgent(api_key=api_key)

    async def _publish_status(
        self, simulation_id: int, agent_role: str, status: str, data: Optional[dict] = None
    ) -> None:
        """Publish agent status update to Redis pub/sub for WebSocket delivery."""
        try:
            redis = await get_redis_client()
            import json
            payload = json.dumps({
                "simulation_id": simulation_id,
                "agent_role": agent_role,
                "status": status,
                "data": data or {},
            })
            await redis.publish(f"simulation:{simulation_id}", payload)
        except Exception as e:
            logger.warning("Failed to publish status", error=str(e))

    async def _run_expert(
        self,
        agent,
        simulation_id: int,
        prompt: str,
        guidance: str = "",
        rag_context: str = "",
    ) -> Optional[AgentResult]:
        await self._publish_status(simulation_id, agent.role, "thinking")
        try:
            result = await agent.run(prompt, context=guidance, rag_context=rag_context)
            await self._publish_status(
                simulation_id,
                agent.role,
                "complete",
                {"confidence": result.confidence, "summary": result.summary[:200]},
            )
            return result
        except Exception as exc:
            logger.error("Expert agent failed", role=agent.role, error=str(exc))
            await self._publish_status(simulation_id, agent.role, "failed", {"error": str(exc)})
            return None

    async def run(
        self,
        simulation_id: int,
        prompt: str,
        on_progress: Optional[Callable[[str, str, dict], Any]] = None,
    ) -> SimulationState:
        """Run the full simulation pipeline and return the final state."""
        start = time.perf_counter()
        state = SimulationState(simulation_id=simulation_id, prompt=prompt)

        # ── Step 1: Planner ──────────────────────────────────
        logger.info("Running planner agent", simulation_id=simulation_id)
        await self._publish_status(simulation_id, "planner", "thinking")
        try:
            plan = await self.planner.plan(prompt)
            state.planner_output = plan
            state.domain = plan.get("domain")
            await self._publish_status(simulation_id, "planner", "complete", plan)
            logger.info("Planner complete", domain=state.domain)
        except Exception as exc:
            logger.error("Planner failed", error=str(exc))
            state.errors.append(f"planner: {exc}")
            plan = {}

        expert_guidance = plan.get("expert_guidance", {})

        # ── Step 2: Run expert agents in parallel ─────────────
        logger.info("Running expert agents in parallel", simulation_id=simulation_id)
        tasks = [
            self._run_expert(
                agent=agent,
                simulation_id=simulation_id,
                prompt=prompt,
                guidance=expert_guidance.get(agent.role, ""),
            )
            for agent in self.expert_agents
        ]

        expert_results_raw = await asyncio.gather(*tasks, return_exceptions=False)
        expert_results: List[AgentResult] = [r for r in expert_results_raw if r is not None]

        # Store results in state
        role_map = {
            "economist": "economist_output",
            "policy": "policy_output",
            "technology": "technology_output",
            "environment": "environment_output",
            "supply_chain": "supply_chain_output",
        }
        for result in expert_results:
            attr = role_map.get(result.agent_role)
            if attr:
                setattr(state, attr, result)
                state.completed_agents.append(result.agent_role)

        if not expert_results:
            state.errors.append("All expert agents failed")
            return state

        # ── Step 3: Consensus Agent ───────────────────────────
        logger.info("Running consensus agent", simulation_id=simulation_id)
        await self._publish_status(simulation_id, "consensus", "thinking")
        try:
            consensus = await self.consensus_agent.synthesize(prompt, expert_results)
            state.consensus_output = consensus
            state.completed_agents.append("consensus")
            await self._publish_status(
                simulation_id,
                "consensus",
                "complete",
                {"overall_confidence": consensus.overall_confidence, "risk_level": consensus.risk_level},
            )
        except Exception as exc:
            logger.error("Consensus agent failed", error=str(exc))
            state.errors.append(f"consensus: {exc}")
            consensus = None

        # ── Step 4: Causal Graph ──────────────────────────────
        logger.info("Building causal graph", simulation_id=simulation_id)
        try:
            graph = await self.graph_agent.build_graph(prompt, expert_results, consensus)
            state.causal_graph = graph
        except Exception as exc:
            logger.error("Graph agent failed", error=str(exc))
            state.errors.append(f"graph: {exc}")

        total_time = time.perf_counter() - start
        logger.info(
            "Simulation complete",
            simulation_id=simulation_id,
            time_s=round(total_time, 2),
            agents_completed=len(state.completed_agents),
            errors=len(state.errors),
        )
        await self._publish_status(simulation_id, "orchestrator", "complete", {"total_seconds": round(total_time, 2)})
        return state
