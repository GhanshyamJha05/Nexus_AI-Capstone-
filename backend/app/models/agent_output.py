"""Agent output model — one row per agent per simulation."""

import enum
from typing import Optional

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class AgentRole(str, enum.Enum):
    PLANNER = "planner"
    ECONOMIST = "economist"
    POLICY = "policy"
    TECHNOLOGY = "technology"
    ENVIRONMENT = "environment"
    SUPPLY_CHAIN = "supply_chain"
    CONSENSUS = "consensus"


class AgentStatus(str, enum.Enum):
    PENDING = "pending"
    THINKING = "thinking"
    COMPLETE = "complete"
    FAILED = "failed"


class AgentOutput(Base, TimestampMixin):
    __tablename__ = "agent_outputs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    simulation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    agent_role: Mapped[AgentRole] = mapped_column(Enum(AgentRole), nullable=False, index=True)
    status: Mapped[AgentStatus] = mapped_column(
        Enum(AgentStatus), default=AgentStatus.PENDING, nullable=False
    )

    # Core output
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assumptions: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Structured output
    evidence: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    citations: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    timeline_impacts: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    affected_stakeholders: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    thinking_steps: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)

    execution_time_seconds: Mapped[Optional[float]] = mapped_column(nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship
    simulation: Mapped["Simulation"] = relationship("Simulation", back_populates="agent_outputs")  # noqa: F821

    def __repr__(self) -> str:
        return f"<AgentOutput id={self.id} role={self.agent_role} sim={self.simulation_id}>"
