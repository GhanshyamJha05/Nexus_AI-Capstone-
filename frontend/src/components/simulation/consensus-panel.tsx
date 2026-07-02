"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, TrendingUp, Lightbulb, AlertCircle } from "lucide-react";
import { cn, confidenceToColor, riskToColor } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { Simulation } from "@/lib/types";

interface Props {
  simulation: Simulation;
}

export function ConsensusPanel({ simulation }: Props) {
  const consensus = simulation.consensus;

  if (simulation.status === "running" || simulation.status === "pending") {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="flex items-center justify-center gap-2 text-accent mb-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <p className="text-sm">Consensus agent is synthesizing expert analyses...</p>
        </div>
        <p className="text-xs text-text-muted">This appears after all expert agents complete.</p>
      </div>
    );
  }

  if (!consensus) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-text-muted text-sm">
          Consensus data not yet available. Run or retry the simulation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overall confidence + risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Overall Confidence
          </p>
          <div className="flex items-end gap-3 mb-3">
            <span
              className={cn(
                "text-4xl font-bold",
                confidenceToColor(consensus.overall_confidence)
              )}
            >
              {Math.round(consensus.overall_confidence * 100)}%
            </span>
          </div>
          <Progress
            value={consensus.overall_confidence * 100}
            className="h-2"
            indicatorClassName={
              consensus.overall_confidence >= 0.7 ? "bg-success" : "bg-warning"
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Risk Level
          </p>
          <span
            className={cn(
              "text-2xl font-bold capitalize px-4 py-2 rounded-xl",
              riskToColor(consensus.risk_level)
            )}
          >
            {consensus.risk_level}
          </span>
          <p className="text-xs text-text-muted mt-3">
            Based on cross-domain expert assessment
          </p>
        </motion.div>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold text-text-primary">Executive Summary</p>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {consensus.overall_summary}
        </p>
      </motion.div>

      {/* Final Reasoning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-secondary" />
          <p className="text-sm font-semibold text-text-primary">Final Reasoning</p>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {consensus.final_reasoning}
        </p>
      </motion.div>

      {/* Agreements */}
      {consensus.agreements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-success" />
            <p className="text-sm font-semibold text-text-primary">
              Expert Agreements ({consensus.agreements.length})
            </p>
          </div>
          <ul className="space-y-2">
            {consensus.agreements.map((agreement, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                {agreement}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Conflicts */}
      {consensus.conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-sm font-semibold text-text-primary">
              Expert Conflicts ({consensus.conflicts.length})
            </p>
          </div>
          <div className="space-y-4">
            {consensus.conflicts.map((conflict, i) => (
              <div key={i} className="bg-background/50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-warning">{conflict.topic}</p>
                <div className="space-y-1">
                  {Object.entries(conflict.positions).map(([agent, position]) => (
                    <div key={agent} className="flex gap-2 text-xs">
                      <span className="font-semibold text-text-secondary capitalize min-w-[100px]">
                        {agent}:
                      </span>
                      <span className="text-text-muted">{position}</span>
                    </div>
                  ))}
                </div>
                {conflict.resolution && (
                  <div className="border-t border-border/50 pt-2">
                    <p className="text-xs text-text-muted">
                      <span className="text-accent font-medium">Resolution: </span>
                      {conflict.resolution}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {consensus.recommended_actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-text-primary">
              Recommended Actions
            </p>
          </div>
          <ol className="space-y-2">
            {consensus.recommended_actions.map((action, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary">
                <span className="text-accent font-bold font-mono text-xs mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* Key Uncertainties */}
      {consensus.key_uncertainties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-text-muted" />
            <p className="text-sm font-semibold text-text-primary">Key Uncertainties</p>
          </div>
          <ul className="space-y-2">
            {consensus.key_uncertainties.map((u, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-text-muted mt-0.5">?</span>
                {u}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
