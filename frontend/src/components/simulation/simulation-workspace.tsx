"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { simulationsApi } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentPanel } from "./agent-panel";
import { ConsensusPanel } from "./consensus-panel";
import { RippleTimeline } from "./ripple-timeline";
import { CausalGraphView } from "./causal-graph-view";
import { ExecutiveReport } from "./executive-report";
import { SimulationHeader } from "./simulation-header";
import { useSimulationSocket } from "@/hooks/use-simulation-socket";
import type { Simulation, WsAgentUpdate } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  simulationId: number;
}

export function SimulationWorkspace({ simulationId }: Props) {
  const queryClient = useQueryClient();
  const [agentUpdates, setAgentUpdates] = useState<Record<string, WsAgentUpdate>>({});

  const { data: simulation, isLoading } = useQuery<Simulation>({
    queryKey: ["simulation", simulationId],
    queryFn: () => simulationsApi.get(simulationId).then((r) => r.data),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" || status === "pending" ? 3000 : false;
    },
  });

  const handleWsMessage = useCallback(
    (update: WsAgentUpdate) => {
      setAgentUpdates((prev) => ({ ...prev, [update.agent_role]: update }));
      if (update.agent_role === "orchestrator" && update.status === "complete") {
        queryClient.invalidateQueries({ queryKey: ["simulation", simulationId] });
      }
    },
    [simulationId, queryClient]
  );

  useSimulationSocket(simulationId, handleWsMessage);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (!simulation) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SimulationHeader simulation={simulation} />

      <Tabs defaultValue="agents">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="agents">🤖 Agent Workspace</TabsTrigger>
          <TabsTrigger value="consensus">⚖️ Consensus</TabsTrigger>
          <TabsTrigger value="timeline">⏱ Ripple Timeline</TabsTrigger>
          <TabsTrigger value="graph">🕸️ Causal Graph</TabsTrigger>
          <TabsTrigger value="report">📄 Executive Report</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <AgentPanel simulation={simulation} agentUpdates={agentUpdates} />
        </TabsContent>

        <TabsContent value="consensus">
          <ConsensusPanel simulation={simulation} />
        </TabsContent>

        <TabsContent value="timeline">
          <RippleTimeline simulation={simulation} />
        </TabsContent>

        <TabsContent value="graph">
          <CausalGraphView simulation={simulation} />
        </TabsContent>

        <TabsContent value="report">
          <ExecutiveReport simulation={simulation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
