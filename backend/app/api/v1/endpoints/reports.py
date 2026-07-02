"""Report generation and export endpoints."""

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.simulation import SimulationStatus
from app.models.user import User
from app.repositories.simulation_repository import SimulationRepository
from app.schemas.simulation import ReportSchema
from app.services.report_service import ReportService

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.post("/simulations/{simulation_id}/reports", response_model=ReportSchema, status_code=status.HTTP_201_CREATED)
async def generate_report(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ReportSchema:
    repo = SimulationRepository(db)
    sim = await repo.get_by_id_and_user(simulation_id, current_user.id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    if sim.status != SimulationStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Simulation not yet completed")

    service = ReportService(db)
    report = await service.generate_json_report(sim)
    return ReportSchema.model_validate(report)


@router.get("/simulations/{simulation_id}/reports/{report_id}/pdf")
async def export_pdf(
    simulation_id: int,
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    from sqlalchemy import select
    from app.models.report import Report

    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.simulation_id == simulation_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    service = ReportService(db)
    pdf_path = await service.export_pdf(report)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"nexus-report-{simulation_id}.pdf",
    )
