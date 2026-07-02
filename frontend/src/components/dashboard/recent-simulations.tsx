"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatRelativeTime, statusToColor, truncate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { SimulationListItem } from "@/lib/types";
import { ArrowRight, Clock } from "lucide-react";

interface Props {
  items: SimulationListItem[];
  isLoading: boolean;
}

export function RecentSimulations({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary">Recent Simulations</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">Recent Simulations</h3>
        <Link
          href="/dashboard/history"
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No simulations yet. Run your first one above!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/dashboard/simulations/${item.id}`}>
                <div className="glass rounded-xl p-4 hover:border-accent/20 transition-all duration-200 group cursor-pointer hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {truncate(item.prompt, 80)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusToColor(item.status)}`}>
                        {item.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(item.created_at)}
                    </div>
                    {item.domain && (
                      <Badge variant="ghost" className="text-xs py-0">{item.domain}</Badge>
                    )}
                    {item.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs py-0">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
