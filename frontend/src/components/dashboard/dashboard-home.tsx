"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { simulationsApi } from "@/lib/api";
import { SimulationPromptInput } from "./simulation-prompt-input";
import { RecentSimulations } from "./recent-simulations";
import { QuickStats } from "./quick-stats";
import type { SimulationListResponse } from "@/lib/types";

export function DashboardHome() {
  const router = useRouter();

  const { data, isLoading } = useQuery<SimulationListResponse>({
    queryKey: ["simulations", { limit: 5 }],
    queryFn: () => simulationsApi.list({ limit: 5 }).then((r) => r.data),
  });

  const handleSimulationCreated = (id: number) => {
    router.push(`/dashboard/simulations/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-text-primary mb-1">
          What decision will you simulate today?
        </h2>
        <p className="text-text-secondary">
          Enter any strategic decision and watch 6 expert agents analyze its consequences.
        </p>
      </motion.div>

      {/* Prompt Input */}
      <SimulationPromptInput onCreated={handleSimulationCreated} />

      {/* Quick Stats */}
      <QuickStats
        total={data?.total || 0}
        completed={data?.items.filter((s) => s.status === "completed").length || 0}
        running={data?.items.filter((s) => s.status === "running").length || 0}
      />

      {/* Recent Simulations */}
      <RecentSimulations items={data?.items || []} isLoading={isLoading} />
    </div>
  );
}
