"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Simulation, TimelineImpact } from "@/lib/types";

const TIME_HORIZONS: { key: keyof TimelineImpact; label: string; sublabel: string; color: string }[] =
  [
    { key: "immediate", label: "Immediate", sublabel: "0–72 hours", color: "border-accent bg-accent/10 text-accent" },
    { key: "one_week", label: "1 Week", sublabel: "7 days", color: "border-secondary bg-secondary/10 text-secondary" },
    { key: "one_month", label: "1 Month", sublabel: "30 days", color: "border-warning bg-warning/10 text-warning" },
    { key: "six_months", label: "6 Months", sublabel: "180 days", color: "border-accent/60 bg-accent/5 text-accent/80" },
    { key: "one_year", label: "1 Year", sublabel: "365 days", color: "border-secondary/60 bg-secondary/5 text-secondary/80" },
    { key: "five_years", label: "5 Years", sublabel: "Long-term", color: "border-success bg-success/10 text-success" },
  ];

const AGENT_COLORS: Record<string, string> = {
  economist: "text-accent",
  policy: "text-secondary",
  technology: "text-accent",
  environment: "text-success",
  supply_chain: "text-warning",
};

const AGENT_LABELS: Record<string, string> = {
  economist: "📈 Economist",
  policy: "🏛️ Policy",
  technology: "⚙️ Technology",
  environment: "🌍 Environment",
  supply_chain: "🔗 Supply Chain",
};

interface Props {
  simulation: Simulation;
}

export function RippleTimeline({ simulation }: Props) {
  const { timeline, agent_outputs } = simulation;

  if (simulation.status !== "completed" || (!timeline && agent_outputs.length === 0)) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-text-muted text-sm">
          {simulation.status === "running" || simulation.status === "pending"
            ? "Timeline will appear once agents complete their analysis."
            : "No timeline data available."}
        </p>
      </div>
    );
  }

  // Build a flat table: horizon → agent → impact text
  const horizonData = TIME_HORIZONS.map((horizon) => {
    const agentImpacts = agent_outputs
      .filter((o) => o.timeline_impacts)
      .map((o) => ({
        role: o.agent_role,
        impact: o.timeline_impacts?.[horizon.key] ?? null,
      }))
      .filter((x): x is { role: typeof x.role; impact: string } => Boolean(x.impact));

    return { ...horizon, agentImpacts };
  });

  return (
    <div className="space-y-4">
      {/* Horizontal timeline bar */}
      <div className="glass rounded-2xl p-6">
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-px bg-gradient-to-r from-accent via-secondary to-success" />
          <div className="relative flex justify-between">
            {TIME_HORIZONS.map((h, i) => (
              <motion.div
                key={h.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 bg-background z-10",
                    h.color.split(" ")[0]
                  )}
                />
                <p className="text-xs font-semibold text-text-primary mt-2">{h.label}</p>
                <p className="text-xs text-text-muted">{h.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-horizon cards */}
      <div className="space-y-4">
        {horizonData.map((horizon, hi) => (
          <motion.div
            key={horizon.key}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: hi * 0.07 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Horizon header */}
            <div className={cn("px-6 py-3 border-b border-border/50 flex items-center gap-3")}>
              <div className={cn("px-3 py-1 rounded-lg border text-xs font-bold", horizon.color)}>
                {horizon.label}
              </div>
              <span className="text-xs text-text-muted">{horizon.sublabel}</span>
            </div>

            {/* Agent rows */}
            {horizon.agentImpacts.length > 0 ? (
              <div className="divide-y divide-border/30">
                {horizon.agentImpacts.map(({ role, impact }) => (
                  <div key={role} className="px-6 py-3 flex gap-4">
                    <span
                      className={cn(
                        "text-xs font-semibold w-32 flex-shrink-0 pt-0.5",
                        AGENT_COLORS[role]
                      )}
                    >
                      {AGENT_LABELS[role] ?? role}
                    </span>
                    <p className="text-sm text-text-secondary">{impact}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-xs text-text-muted">No data for this horizon.</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
