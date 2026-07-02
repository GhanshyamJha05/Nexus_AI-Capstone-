// ── API Types ─────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  preferences: string | null;
}

export type SimulationStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type AgentRole =
  | "planner"
  | "economist"
  | "policy"
  | "technology"
  | "environment"
  | "supply_chain"
  | "consensus";

export type AgentStatus = "pending" | "thinking" | "complete" | "failed";

export interface TimelineImpact {
  immediate: string;
  one_week: string;
  one_month: string;
  six_months: string;
  one_year: string;
  five_years: string;
}

export interface Citation {
  title: string;
  source: string;
  relevance: number;
  excerpt?: string;
}

export interface AgentOutput {
  id: number;
  agent_role: AgentRole;
  status: AgentStatus;
  summary: string | null;
  reasoning: string | null;
  assumptions: string[] | null;
  confidence: number | null;
  evidence: Array<{ point: string; strength: string; source: string }> | null;
  citations: Citation[] | null;
  timeline_impacts: TimelineImpact | null;
  affected_stakeholders: string[] | null;
  thinking_steps: string[] | null;
  execution_time_seconds: number | null;
}

export interface Report {
  id: number;
  title: string;
  format: "json" | "pdf" | "markdown";
  executive_summary: string | null;
  key_findings: Array<{ domain: string; finding: string; confidence: number }> | null;
  recommendations: Array<{ action: string; priority: string }> | null;
  risk_assessment: {
    level: string;
    key_uncertainties: string[];
    conflicts: unknown[];
  } | null;
  confidence_overview: {
    overall: number;
    by_agent: Record<string, number>;
  } | null;
  methodology: string | null;
  file_path: string | null;
  created_at: string;
}

export interface ConsensusData {
  overall_summary: string;
  agreements: string[];
  conflicts: Array<{
    topic: string;
    positions: Record<string, string>;
    resolution: string;
  }>;
  overall_confidence: number;
  final_reasoning: string;
  key_uncertainties: string[];
  recommended_actions: string[];
  risk_level: string;
}

export interface CausalNode {
  id: string;
  label: string;
  type: "trigger" | "effect" | "stakeholder" | "factor";
  description: string;
  confidence: number;
  domain?: string;
}

export interface CausalEdge {
  source: string;
  target: string;
  label: string;
  strength: number;
  direction: "positive" | "negative" | "uncertain";
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

export interface Simulation {
  id: number;
  title: string;
  prompt: string;
  status: SimulationStatus;
  domain?: string;
  tags?: string[];
  causal_graph?: CausalGraph;
  timeline?: Record<string, TimelineImpact>;
  consensus?: ConsensusData;
  error_message?: string;
  execution_time_seconds?: number;
  created_at: string;
  updated_at: string;
  agent_outputs: AgentOutput[];
  reports: Report[];
}

export interface SimulationListItem {
  id: number;
  title: string;
  prompt: string;
  status: SimulationStatus;
  domain?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  execution_time_seconds?: number;
}

export interface SimulationListResponse {
  items: SimulationListItem[];
  total: number;
  skip: number;
  limit: number;
}

// ── WebSocket Types ───────────────────────────────────────────
export interface WsAgentUpdate {
  simulation_id: number;
  agent_role: AgentRole | "orchestrator";
  status: "thinking" | "complete" | "failed";
  data: {
    confidence?: number;
    summary?: string;
    error?: string;
    overall_confidence?: number;
    risk_level?: string;
    total_seconds?: number;
  };
}

// ── UI State ─────────────────────────────────────────────────
export interface AgentUIState {
  role: AgentRole;
  displayName: string;
  emoji: string;
  status: AgentStatus;
  confidence?: number;
  summary?: string;
}
