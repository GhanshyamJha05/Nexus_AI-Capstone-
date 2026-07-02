"""Simulation model."""

import enum
from typing import List, Optional

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class SimulationStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Simulation(Base, TimestampMixin):
    __tablename__ = "simulations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[SimulationStatus] = mapped_column(
        Enum(SimulationStatus), default=SimulationStatus.PENDING, nullable=False, index=True
    )
    celery_task_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)

    # Structured outputs
    causal_graph: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    timeline: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    consensus: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Metadata
    tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)
    domain: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    execution_time_seconds: Mapped[Optional[float]] = mapped_column(nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="simulations")  # noqa: F821
    agent_outputs: Mapped[List["AgentOutput"]] = relationship(  # noqa: F821
        "AgentOutput", back_populates="simulation", cascade="all, delete-orphan"
    )
    reports: Mapped[List["Report"]] = relationship(  # noqa: F821
        "Report", back_populates="simulation", cascade="all, delete-orphan"
    )
    messages: Mapped[List["Message"]] = relationship(  # noqa: F821
        "Message", back_populates="simulation", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Simulation id={self.id} status={self.status} title={self.title[:40]}>"
