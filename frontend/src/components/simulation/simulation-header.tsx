"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Copy, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { simulationsApi } from "@/lib/api";
import { formatRelativeTime, formatDuration, statusToColor } from "@/lib/utils";
import type { Simulation } from "@/lib/types";

interface Props {
  simulation: Simulation;
}

export function SimulationHeader({ simulation }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: () => simulationsApi.retry(simulation.id),
    onSuccess: () => {
      toast.success("Simulation re-launched");
      queryClient.invalidateQueries({ queryKey: ["simulation", simulation.id] });
    },
    onError: () => toast.error("Failed to retry simulation"),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => simulationsApi.duplicate(simulation.id),
    onSuccess: (resp) => {
      toast.success("Simulation duplicated");
      router.push(`/dashboard/simulations/${resp.data.id}`);
    },
    onError: () => toast.error("Failed to duplicate"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => simulationsApi.delete(simulation.id),
    onSuccess: () => {
      toast.success("Simulation deleted");
      router.push("/dashboard/history");
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.back()}
            className="mt-0.5 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-text-primary">{simulation.title}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusToColor(simulation.status)}`}>
                {simulation.status}
                {simulation.status === "running" && (
                  <span className="ml-1.5 inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-current animate-[thinking_1.4s_0.2s_ease-in-out_infinite] inline-block" />
                    <span className="w-1 h-1 rounded-full bg-current animate-[thinking_1.4s_0.4s_ease-in-out_infinite] inline-block" />
                    <span className="w-1 h-1 rounded-full bg-current animate-[thinking_1.4s_0.6s_ease-in-out_infinite] inline-block" />
                  </span>
                )}
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-2xl">{simulation.prompt}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(simulation.created_at)}
              </span>
              {simulation.execution_time_seconds && (
                <span>⏱ {formatDuration(simulation.execution_time_seconds)}</span>
              )}
              {simulation.domain && (
                <span className="px-2 py-0.5 rounded-full border border-border">{simulation.domain}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {simulation.status === "failed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => retryMutation.mutate()}
              loading={retryMutation.isPending}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateMutation.mutate()}
            loading={duplicateMutation.isPending}
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => { if (confirm("Delete this simulation?")) deleteMutation.mutate(); }}
            loading={deleteMutation.isPending}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
