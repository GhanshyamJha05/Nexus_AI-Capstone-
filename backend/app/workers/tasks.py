"""Celery tasks for running simulations asynchronously."""

import asyncio
import time
from typing import Optional

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger(__name__)


def _run_async(coro):
    """Run a coroutine in a new event loop (for Celery worker context)."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(
    bind=True,
    name="app.workers.tasks.run_simulation_task",
    max_retries=2,
    default_retry_delay=30,
    soft_time_limit=600,
    time_limit=660,
)
def run_simulation_task(self, simulation_id: int, api_key: Optional[str] = None) -> dict:
    """Main Celery task: runs the full multi-agent simulation pipeline."""

    async def _execute():
        from app.core.database import AsyncSessionLocal
        from app.models.simulation import SimulationStatus
        from app.repositories.agent_output_repository import AgentOutputRepository
        from app.repositories.simulation_repository import SimulationRepository
        from app.agents.orchestrator import SimulationOrchestrator
        from app.models.agent_output import AgentStatus

        logger.info("Simulation task started", simulation_id=simulation_id, task_id=self.request.id)
        start = time.perf_counter()

        async with AsyncSessionLocal() as db:
            sim_repo = SimulationRepository(db)
            agent_repo = AgentOutputRepository(db)

            sim = await sim_repo.get_by_id(simulation_id)
            if not sim:
                logger.error("Simulation not found", simulation_id=simulation_id)
                return {"error": "Simulation not found"}

            await sim_repo.update(sim, status=SimulationStatus.RUNNING)

            try:
                orchestrator = SimulationOrchestrator(api_key=api_key)
                state = await orchestrator.run(simulation_id=simulation_id, prompt=sim.prompt)

                # Persist each agent output
                role_attr_map = {
                    "economist": "economist_output",
                    "policy": "policy_output",
                    "technology": "technology_output",
                    "environment": "environment_output",
                    "supply_chain": "supply_chain_output",
                }

                for role, attr in role_attr_map.items():
                    result = getattr(state, attr, None)
                    if result:
                        await agent_repo.upsert(
                            simulation_id=simulation_id,
                            role=role,
                            status=AgentStatus.COMPLETE,
                            summary=result.summary,
                            reasoning=result.reasoning,
                            assumptions=result.assumptions,
                            confidence=result.confidence,
                            evidence=result.evidence,
                            citations=[c.model_dump() for c in result.citations],
                            timeline_impacts=result.timeline_impacts.model_dump(),
                            affected_stakeholders=result.affected_stakeholders,
                            thinking_steps=result.thinking_steps,
                        )

                consensus_dict = None
                if state.consensus_output:
                    consensus_dict = state.consensus_output.model_dump()

                graph_dict = None
                if state.causal_graph:
                    graph_dict = state.causal_graph.model_dump()

                # Build timeline from consensus
                timeline_dict = None
                if state.consensus_output:
                    all_timelines = {}
                    for role, attr in role_attr_map.items():
                        result = getattr(state, attr, None)
                        if result and result.timeline_impacts:
                            all_timelines[role] = result.timeline_impacts.model_dump()
                    timeline_dict = all_timelines

                execution_time = time.perf_counter() - start
                await sim_repo.update(
                    sim,
                    status=SimulationStatus.COMPLETED,
                    consensus=consensus_dict,
                    causal_graph=graph_dict,
                    timeline=timeline_dict,
                    execution_time_seconds=round(execution_time, 2),
                )

                logger.info("Simulation completed", simulation_id=simulation_id, time_s=round(execution_time, 2))
                return {"status": "completed", "simulation_id": simulation_id}

            except Exception as exc:
                logger.error("Simulation failed", simulation_id=simulation_id, error=str(exc))
                await sim_repo.update(
                    sim,
                    status=SimulationStatus.FAILED,
                    error_message=str(exc),
                )
                raise self.retry(exc=exc)

    return _run_async(_execute())


@celery_app.task(name="app.workers.tasks.cleanup_old_simulations")
def cleanup_old_simulations() -> dict:
    """Remove failed simulations older than 30 days."""

    async def _cleanup():
        from datetime import datetime, timedelta, timezone
        from sqlalchemy import delete
        from app.core.database import AsyncSessionLocal
        from app.models.simulation import Simulation, SimulationStatus

        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                delete(Simulation).where(
                    Simulation.status == SimulationStatus.FAILED,
                    Simulation.created_at < cutoff,
                )
            )
            await db.commit()
            count = result.rowcount
            logger.info("Cleaned up old simulations", count=count)
            return {"deleted": count}

    return _run_async(_cleanup())
