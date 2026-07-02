"""Simulation repository."""

from typing import List, Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.simulation import Simulation, SimulationStatus


class SimulationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, simulation_id: int) -> Optional[Simulation]:
        result = await self.db.execute(
            select(Simulation)
            .where(Simulation.id == simulation_id)
            .options(
                selectinload(Simulation.agent_outputs),
                selectinload(Simulation.reports),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_and_user(
        self, simulation_id: int, user_id: int
    ) -> Optional[Simulation]:
        result = await self.db.execute(
            select(Simulation)
            .where(Simulation.id == simulation_id, Simulation.user_id == user_id)
            .options(
                selectinload(Simulation.agent_outputs),
                selectinload(Simulation.reports),
            )
        )
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[SimulationStatus] = None,
        search: Optional[str] = None,
    ) -> List[Simulation]:
        query = select(Simulation).where(Simulation.user_id == user_id)
        if status:
            query = query.where(Simulation.status == status)
        if search:
            query = query.where(Simulation.title.ilike(f"%{search}%"))
        query = query.order_by(desc(Simulation.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_user(
        self,
        user_id: int,
        status: Optional[SimulationStatus] = None,
    ) -> int:
        from sqlalchemy import func
        query = select(func.count()).select_from(Simulation).where(Simulation.user_id == user_id)
        if status:
            query = query.where(Simulation.status == status)
        result = await self.db.execute(query)
        return result.scalar_one()

    async def create(self, **kwargs) -> Simulation:
        sim = Simulation(**kwargs)
        self.db.add(sim)
        await self.db.flush()
        await self.db.refresh(sim)
        return sim

    async def update(self, simulation: Simulation, **kwargs) -> Simulation:
        for key, value in kwargs.items():
            setattr(simulation, key, value)
        await self.db.flush()
        await self.db.refresh(simulation)
        return simulation

    async def delete(self, simulation: Simulation) -> None:
        await self.db.delete(simulation)
        await self.db.flush()

    async def get_by_celery_task_id(self, task_id: str) -> Optional[Simulation]:
        result = await self.db.execute(
            select(Simulation).where(Simulation.celery_task_id == task_id)
        )
        return result.scalar_one_or_none()
