"""Executive Report model."""

import enum
from typing import Optional

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class ReportFormat(str, enum.Enum):
    JSON = "json"
    PDF = "pdf"
    MARKDOWN = "markdown"


class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    simulation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    format: Mapped[ReportFormat] = mapped_column(
        Enum(ReportFormat), default=ReportFormat.JSON, nullable=False
    )

    # Report sections
    executive_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_findings: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    recommendations: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    risk_assessment: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    confidence_overview: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # File path for PDF exports
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationship
    simulation: Mapped["Simulation"] = relationship("Simulation", back_populates="reports")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Report id={self.id} sim={self.simulation_id} format={self.format}>"
