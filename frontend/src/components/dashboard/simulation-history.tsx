"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Copy, RefreshCw, Filter, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { simulationsApi } from "@/lib/api";
import { formatRelativeTime, statusToColor, truncate, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { SimulationListResponse } from "@/lib/types";

export function SimulationHistory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 15;

  const { data, isLoading } = useQuery<SimulationListResponse>({
    queryKey: ["simulations", { skip: page * LIMIT, limit: LIMIT, search }],
    queryFn: () =>
      simulationsApi.list({ skip: page * LIMIT, limit: LIMIT, search: search || undefined }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => simulationsApi.delete(id),
    onSuccess: () => {
      toast.success("Simulation deleted");
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
    onError: () => toast.error("Failed to delete simulation"),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => simulationsApi.duplicate(id),
    onSuccess: (resp) => {
      toast.success("Simulation duplicated");
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
      router.push(`/dashboard/simulations/${resp.data.id}`);
    },
    onError: () => toast.error("Failed to duplicate simulation"),
  });

  const totalPages = Math.ceil((data?.total || 0) / LIMIT);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Simulation History</h2>
          <p className="text-text-secondary text-sm mt-0.5">
            {data?.total || 0} simulations total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search simulations..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-text-muted">
            {search ? "No simulations found matching your search." : "No simulations yet. Start one from the Dashboard!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {data?.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-5 hover:border-accent/20 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(`/dashboard/simulations/${item.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/dashboard/simulations/${item.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                        {item.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusToColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {truncate(item.prompt, 100)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-text-muted">{formatRelativeTime(item.created_at)}</span>
                      {item.execution_time_seconds && (
                        <span className="text-xs text-text-muted">
                          ⏱ {formatDuration(item.execution_time_seconds)}
                        </span>
                      )}
                      {item.domain && <Badge variant="ghost" className="text-xs py-0">{item.domain}</Badge>}
                      {item.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => router.push(`/dashboard/simulations/${item.id}`)}
                      title="Open"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => duplicateMutation.mutate(item.id)}
                      title="Duplicate"
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        if (confirm("Delete this simulation?")) deleteMutation.mutate(item.id);
                      }}
                      title="Delete"
                      className="hover:text-error hover:bg-error/10"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
