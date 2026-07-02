"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const layers = [
  {
    label: "Frontend",
    color: "from-accent/20 to-accent/5 border-accent/30",
    items: ["Next.js 15", "React 19", "TypeScript", "TailwindCSS", "Framer Motion", "React Flow"],
  },
  {
    label: "Backend API",
    color: "from-secondary/20 to-secondary/5 border-secondary/30",
    items: ["FastAPI", "Python 3.12", "WebSockets", "JWT Auth", "Rate Limiting"],
  },
  {
    label: "AI / Agent Layer",
    color: "from-accent/20 to-secondary/10 border-accent/20",
    items: ["LangGraph", "LangChain", "Gemini 2.5 Pro", "RAG Pipeline", "ChromaDB"],
  },
  {
    label: "Infrastructure",
    color: "from-card to-card/50 border-border",
    items: ["PostgreSQL", "Redis", "Celery Workers", "Docker", "GitHub Actions"],
  },
];

export function ArchitectureSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="architecture" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-wider">Architecture</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-text-primary">
            Production-grade from day one
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Every layer is built for scale, reliability, and extensibility.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className={`rounded-2xl border bg-gradient-to-br p-6 ${layer.color}`}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                {layer.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-lg bg-background/50 border border-border/50 text-sm text-text-primary font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agent diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 glass rounded-2xl p-8"
        >
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-text-muted mb-8">
            Multi-Agent Pipeline
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
            {[
              { name: "Prompt", emoji: "💬", color: "border-border" },
              { name: "Planner", emoji: "🧭", color: "border-accent/30" },
              { name: "Experts ×5", emoji: "⚡", color: "border-secondary/30" },
              { name: "Consensus", emoji: "⚖️", color: "border-accent/30" },
              { name: "Graph + Report", emoji: "📊", color: "border-success/30" },
            ].map((node, i) => (
              <div key={node.name} className="flex items-center gap-4">
                <div className={`glass border ${node.color} rounded-xl px-4 py-3 text-center min-w-[100px]`}>
                  <div className="text-xl mb-1">{node.emoji}</div>
                  <div className="text-xs font-medium text-text-primary">{node.name}</div>
                </div>
                {i < 4 && (
                  <div className="text-accent/60 text-lg hidden md:block">→</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
