import { atom } from "jotai";
import type { User, WsAgentUpdate, AgentRole } from "./types";

// ── Auth ─────────────────────────────────────────────────────
export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// ── Simulation ────────────────────────────────────────────────
export const activeSimulationIdAtom = atom<number | null>(null);

export const agentStatusAtom = atom<Record<AgentRole | string, WsAgentUpdate>>({});

export const simulationProgressAtom = atom<{
  isRunning: boolean;
  completedAgents: string[];
  totalAgents: number;
}>({
  isRunning: false,
  completedAgents: [],
  totalAgents: 5,
});

// ── UI ────────────────────────────────────────────────────────
export const sidebarCollapsedAtom = atom<boolean>(false);
export const activeTabAtom = atom<string>("workspace");
