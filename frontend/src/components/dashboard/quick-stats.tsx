"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle, Zap } from "lucide-react";

interface Props {
  total: number;
  completed: number;
  running: number;
}

export function QuickStats({ total, completed, running }: Props) {
  const stats = [
    {
      label: "Total Simulations",
      value: total,
      icon: Activity,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Running Now",
      value: running,
      icon: Zap,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass rounded-xl p-4 flex items-center gap-3"
        >
          <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
