"""Simulation schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.models.simulation import SimulationStatus


class CreateSimulationRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=5000)
    title: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = Field(default_factory=list)
    domain: Optional[str] = Field(None, max_length=100)


class SimulationListItem(BaseModel):
    id: int
    title: str
    prompt: str
    status: SimulationStatus
    domain: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    execution_time_seconds: Optional[float]

    model_config = {"from_attributes": True}


class AgentOutputSchema(BaseModel):
    id: int
    agent_role: str
    status: str
    summary: Optional[str]
    reasoning: Optional[str]
    assumptions: Optional[List[str]]
    confidence: Optional[float]
    evidence: Optional[List[Dict[str, Any]]]
    citations: Optional[List[Dict[str, Any]]]
    timeline_impacts: Optional[Dict[str, Any]]
    affected_stakeholders: Optional[List[str]]
    thinking_steps: Optional[List[str]]
    execution_time_seconds: Optional[float]

    model_config = {"from_attributes": True}


class ReportSchema(BaseModel):
    id: int
    title: str
    format: str
    executive_summary: Optional[str]
    key_findings: Optional[List[Dict[str, Any]]]
    recommendations: Optional[List[Dict[str, Any]]]
    risk_assessment: Optional[Dict[str, Any]]
    confidence_overview: Optional[Dict[str, Any]]
    methodology: Optional[str]
    file_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SimulationDetail(BaseModel):
    id: int
    title: str
    prompt: str
    status: SimulationStatus
    domain: Optional[str]
    tags: Optional[List[str]]
    causal_graph: Optional[Dict[str, Any]]
    timeline: Optional[Dict[str, Any]]
    consensus: Optional[Dict[str, Any]]
    error_message: Optional[str]
    execution_time_seconds: Optional[float]
    created_at: datetime
    updated_at: datetime
    agent_outputs: List[AgentOutputSchema]
    reports: List[ReportSchema]

    model_config = {"from_attributes": True}


class SimulationListResponse(BaseModel):
    items: List[SimulationListItem]
    total: int
    skip: int
    limit: int


class DuplicateSimulationRequest(BaseModel):
    title: Optional[str] = None
