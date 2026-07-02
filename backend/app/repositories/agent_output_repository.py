"""AgentOutput repository."""

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_output import AgentOutput, AgentRole


class AgentOutputRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_simulation(self, simulation_id: int) -> List[AgentOutput]:
        result = await self.db.execute(
            select(AgentOutput)
            .where(AgentOutput.simulation_id == simulation_id)
            .order_by(AgentOutput.created_at)
        )
        return list(result.scalars().all())

    async def get_by_simulation_and_role(
        self, simulation_id: int, role: AgentRole
    ) -> Optional[AgentOutput]:
        result = await self.db.execute(
            select(AgentOutput).where(
                AgentOutput.simulation_id == simulation_id,
                AgentOutput.agent_role == role,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, **kwargs) -> AgentOutput:
        output = AgentOutput(**kwargs)
        self.db.add(output)
        await self.db.flush()
        await self.db.refresh(output)
        return output

    async def update(self, output: AgentOutput, **kwargs) -> AgentOutput:
        for key, value in kwargs.items():
            setattr(output, key, value)
        await self.db.flush()
        await self.db.refresh(output)
        return output

    async def upsert(self, simulation_id: int, role: AgentRole, **kwargs) -> AgentOutput:
        existing = await self.get_by_simulation_and_role(simulation_id, role)
        if existing:
            return await self.update(existing, **kwargs)
        return await self.create(simulation_id=simulation_id, agent_role=role, **kwargs)
