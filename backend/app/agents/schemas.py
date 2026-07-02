"""Shared Pydantic schemas for agent inputs/outputs."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Citation(BaseModel):
    title: str
    source: str
    relevance: float = Field(ge=0.0, le=1.0)
    excerpt: Optional[str] = None


class TimelineImpact(BaseModel):
    immediate: str
    one_week: str
    one_month: str
    six_months: str
    one_year: str
    five_years: str


class AgentResult(BaseModel):
    agent_role: str
    summary: str
    reasoning: str
    assumptions: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    timeline_impacts: TimelineImpact
    affected_stakeholders: List[str] = Field(default_factory=list)
    thinking_steps: List[str] = Field(default_factory=list)
    raw_response: Optional[str] = None


class ConsensusResult(BaseModel):
    overall_summary: str
    agreements: List[str] = Field(default_factory=list)
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)
    overall_confidence: float = Field(ge=0.0, le=1.0)
    final_reasoning: str
    key_uncertainties: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    risk_level: str = "medium"  # low / medium / high / critical


class CausalNode(BaseModel):
    id: str
    label: str
    type: str  # trigger / effect / stakeholder / factor
    description: str
    confidence: float = Field(ge=0.0, le=1.0)
    domain: Optional[str] = None


class CausalEdge(BaseModel):
    source: str
    target: str
    label: str
    strength: float = Field(ge=0.0, le=1.0)
    direction: str = "positive"  # positive / negative / uncertain


class CausalGraph(BaseModel):
    nodes: List[CausalNode] = Field(default_factory=list)
    edges: List[CausalEdge] = Field(default_factory=list)


class SimulationState(BaseModel):
    """LangGraph state object passed between agents."""
    simulation_id: int
    prompt: str
    domain: Optional[str] = None

    # Agent results keyed by role
    planner_output: Optional[Dict[str, Any]] = None
    economist_output: Optional[AgentResult] = None
    policy_output: Optional[AgentResult] = None
    technology_output: Optional[AgentResult] = None
    environment_output: Optional[AgentResult] = None
    supply_chain_output: Optional[AgentResult] = None

    consensus_output: Optional[ConsensusResult] = None
    causal_graph: Optional[CausalGraph] = None

    errors: List[str] = Field(default_factory=list)
    completed_agents: List[str] = Field(default_factory=list)
