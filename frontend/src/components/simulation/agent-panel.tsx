"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn, confidenceToColor, confidenceToLabel } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Quote, Brain } from "lucide-react";
import { useState } from "react";
import type { Simulation, WsAgentUpdate, AgentOutput } from "@/lib/types";

const AGENT_META: Record<
  string,
  { displayName: string; emoji: string; color: string; bg: string }
> = {
  planner: {
    displayName: "Strategic Planner",
    emoji: "🧭",
    color: "text-text-secondary",
    bg: "bg-card-hover",
  },
  economist: {
    displayName: "Economist",
    emoji: "📈",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  policy: {
    displayName: "Policy Analyst",
    emoji: "🏛️",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  technology: {
    displayName: "Technology Strategist",
    emoji: "⚙️",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  environment: {
    displayName: "Environmental Scientist",
    emoji: "🌍",
    color: "text-success",
    bg: "bg-success/10",
  },
  supply_chain: {
    displayName: "Supply Chain Expert",
    emoji: "🔗",
    color: "text-warning",
    bg: "bg-warning/10",
  },
};

const EXPERT_ROLES = ["economist", "policy", "technology", "environment", "supply_chain"];

interface Props {
  simulation: Simulation;
  agentUpdates: Record<string, WsAgentUpdate>;
}

export function AgentPanel({ simulation, agentUpdates }: Props) {
  const isRunning =
    simulation.status === "running" || simulation.status === "pending";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {EXPERT_ROLES.map((role) => {
        const output = simulation.agent_outputs.find((o) => o.agent_role === role);
        const wsUpdate = agentUpdates[role];
        const liveStatus = wsUpdate?.status || output?.status || (isRunning ? "pending" : "pending");

        return (
          <AgentCard
            key={role}
            role={role}
            output={output}
            liveStatus={liveStatus}
            wsUpdate={wsUpdate}
          />
        );
      })}
    </div>
  );
}

interface AgentCardProps {
  role: string;
  output?: AgentOutput;
  liveStatus: string;
  wsUpdate?: WsAgentUpdate;
}

function AgentCard({ role, output, liveStatus, wsUpdate }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = AGENT_META[role] ?? {
    displayName: role,
    emoji: "🤖",
    color: "text-text-secondary",
    bg: "bg-card",
  };

  const isThinking = liveStatus === "thinking";
  const isComplete = liveStatus === "complete" || output?.status === "complete";
  const isFailed = liveStatus === "failed" || output?.status === "failed";

  const confidence = output?.confidence ?? wsUpdate?.data?.confidence;
  const summary = output?.summary ?? wsUpdate?.data?.summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass rounded-2xl overflow-hidden border transition-all duration-300",
        isThinking && "border-accent/40 shadow-glow",
        isComplete && "border-success/20",
        isFailed && "border-error/20"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0",
            meta.bg
          )}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", meta.color)}>{meta.displayName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusDot status={liveStatus} />
            <span className="text-xs text-text-muted capitalize">{liveStatus}</span>
          </div>
        </div>
        {confidence !== undefined && (
          <div className="text-right flex-shrink-0">
            <p className={cn("text-sm font-bold", confidenceToColor(confidence))}>
              {Math.round(confidence * 100)}%
            </p>
            <p className="text-xs text-text-muted">{confidenceToLabel(confidence)}</p>
          </div>
        )}
      </div>

      {/* Thinking animation */}
      {isThinking && (
        <div className="px-4 py-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-accent">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            <span>Analyzing decision...</span>
            <ThinkingDots />
          </div>
        </div>
      )}

      {/* Confidence bar */}
      {confidence !== undefined && (
        <div className="px-4 pb-2">
          <Progress
            value={confidence * 100}
            className="h-1"
            indicatorClassName={cn(
              confidence >= 0.7 ? "bg-success" : confidence >= 0.5 ? "bg-accent" : "bg-warning"
            )}
          />
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="px-4 pb-3">
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{summary}</p>
        </div>
      )}

      {/* Expandable details */}
      {output && isComplete && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-border/50 text-xs text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            {expanded ? "Hide details" : "Show reasoning & citations"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4 border-t border-border/30">
                  {/* Reasoning */}
                  {output.reasoning && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                        Reasoning
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {output.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Assumptions */}
                  {output.assumptions && output.assumptions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                        Assumptions
                      </p>
                      <ul className="space-y-1">
                        {output.assumptions.map((a, i) => (
                          <li key={i} className="flex gap-2 text-xs text-text-muted">
                            <span className="text-accent mt-0.5">•</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Affected Stakeholders */}
                  {output.affected_stakeholders && output.affected_stakeholders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                        Affected Stakeholders
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {output.affected_stakeholders.map((s, i) => (
                          <Badge key={i} variant="ghost" className="text-xs py-0.5">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Citations */}
                  {output.citations && output.citations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                        Citations
                      </p>
                      <div className="space-y-2">
                        {output.citations.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
                          >
                            <Quote className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-text-primary">{c.title}</p>
                              <p className="text-xs text-text-muted">{c.source}</p>
                              {c.excerpt && (
                                <p className="text-xs text-text-secondary mt-0.5 italic">
                                  &quot;{c.excerpt}&quot;
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-text-muted ml-auto flex-shrink-0">
                              {Math.round(c.relevance * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Thinking steps */}
                  {output.thinking_steps && output.thinking_steps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                        Thinking Steps
                      </p>
                      <ol className="space-y-1">
                        {output.thinking_steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-xs text-text-muted">
                            <span className="text-secondary font-mono">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="px-4 pb-3 border-t border-error/20 pt-2">
          <p className="text-xs text-error">Agent failed to complete analysis</p>
        </div>
      )}
    </motion.div>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "w-1.5 h-1.5 rounded-full inline-block",
        status === "thinking" && "bg-accent animate-pulse",
        status === "complete" && "bg-success",
        status === "failed" && "bg-error",
        status === "pending" && "bg-text-muted"
      )}
    />
  );
}

function ThinkingDots() {
  return (
    <span className="flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-accent"
          style={{ animation: `thinking 1.4s ${i * 0.2}s ease-in-out infinite` }}
        />
      ))}
    </span>
  );
}
