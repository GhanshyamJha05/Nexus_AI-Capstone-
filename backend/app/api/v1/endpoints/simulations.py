"""Simulation CRUD and execution endpoints."""

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, rate_limit
from app.models.simulation import SimulationStatus
from app.models.user import User
from app.repositories.simulation_repository import SimulationRepository
from app.schemas.simulation import (
    CreateSimulationRequest,
    DuplicateSimulationRequest,
    SimulationDetail,
    SimulationListResponse,
)
from app.workers.tasks import run_simulation_task

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.post("", response_model=SimulationDetail, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    payload: CreateSimulationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
) -> SimulationDetail:
    repo = SimulationRepository(db)

    title = payload.title or payload.prompt[:80] + ("..." if len(payload.prompt) > 80 else "")
    sim = await repo.create(
        user_id=current_user.id,
        prompt=payload.prompt,
        title=title,
        tags=payload.tags or [],
        domain=payload.domain,
        status=SimulationStatus.PENDING,
    )
    logger.info("Simulation created", simulation_id=sim.id, user_id=current_user.id)

    # Use user's personal API key if available, else system key
    api_key = current_user.gemini_api_key or None

    # Launch async task via Celery
    task = run_simulation_task.delay(sim.id, api_key)
    await repo.update(sim, celery_task_id=task.id, status=SimulationStatus.RUNNING)

    await db.refresh(sim)
    return SimulationDetail.model_validate(sim)


@router.get("", response_model=SimulationListResponse)
async def list_simulations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: SimulationStatus | None = Query(None),
    search: str | None = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> SimulationListResponse:
    repo = SimulationRepository(db)
    items = await repo.list_by_user(current_user.id, skip=skip, limit=limit, status=status, search=search)
    total = await repo.count_by_user(current_user.id, status=status)
    from app.schemas.simulation import SimulationListItem
    return SimulationListResponse(
        items=[SimulationListItem.model_validate(s) for s in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{simulation_id}", response_model=SimulationDetail)
async def get_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> SimulationDetail:
    repo = SimulationRepository(db)
    sim = await repo.get_by_id_and_user(simulation_id, current_user.id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return SimulationDetail.model_validate(sim)


@router.delete("/{simulation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = SimulationRepository(db)
    sim = await repo.get_by_id_and_user(simulation_id, current_user.id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    await repo.delete(sim)
    logger.info("Simulation deleted", simulation_id=simulation_id, user_id=current_user.id)


@router.post("/{simulation_id}/duplicate", response_model=SimulationDetail, status_code=status.HTTP_201_CREATED)
async def duplicate_simulation(
    simulation_id: int,
    payload: DuplicateSimulationRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
) -> SimulationDetail:
    repo = SimulationRepository(db)
    original = await repo.get_by_id_and_user(simulation_id, current_user.id)
    if not original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    title = payload.title or f"{original.title} (copy)"
    new_sim = await repo.create(
        user_id=current_user.id,
        prompt=original.prompt,
        title=title,
        tags=original.tags or [],
        domain=original.domain,
        status=SimulationStatus.PENDING,
    )

    api_key = current_user.gemini_api_key or None
    task = run_simulation_task.delay(new_sim.id, api_key)
    await repo.update(new_sim, celery_task_id=task.id, status=SimulationStatus.RUNNING)
    await db.refresh(new_sim)
    return SimulationDetail.model_validate(new_sim)


@router.post("/{simulation_id}/retry", response_model=SimulationDetail)
async def retry_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
) -> SimulationDetail:
    repo = SimulationRepository(db)
    sim = await repo.get_by_id_and_user(simulation_id, current_user.id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    if sim.status == SimulationStatus.RUNNING:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Simulation already running")

    api_key = current_user.gemini_api_key or None
    task = run_simulation_task.delay(sim.id, api_key)
    await repo.update(sim, celery_task_id=task.id, status=SimulationStatus.RUNNING, error_message=None)
    await db.refresh(sim)
    return SimulationDetail.model_validate(sim)
