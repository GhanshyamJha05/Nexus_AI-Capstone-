"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Brain,
  Network,
  Clock,
  FileText,
  GitBranch,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "6 Expert AI Agents",
    description:
      "Economist, Policy Analyst, Technology Strategist, Environmental Scientist, Supply Chain Expert, and Consensus Agent — each with deep domain expertise.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: GitBranch,
    title: "Causal Graph",
    description:
      "Interactive visualization of cause-and-effect relationships. See how your decision ripples through interconnected systems.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Clock,
    title: "Ripple Timeline",
    description:
      "Impacts mapped across 6 time horizons: Immediate, 1 Week, 1 Month, 6 Months, 1 Year, and 5 Years.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Consensus Engine",
    description:
      "Automatically identifies where expert agents agree and disagree, then synthesizes a unified strategic picture with confidence scores.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: FileText,
    title: "Executive Reports",
    description:
      "Professional PDF reports with executive summary, key findings, risk assessment, and concrete recommendations.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Network,
    title: "RAG + Memory",
    description:
      "Agents retrieve relevant knowledge from a curated vector database and maintain long-term memory across simulations.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    description:
      "Watch agents think in real time via WebSocket streaming. See confidence scores, reasoning, and citations as they emerge.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "JWT authentication, rate limiting, input validation, encrypted API keys, and full audit logging.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <span className="text-accent text-sm font-medium uppercase tracking-wider">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-text-primary">
            Intelligence at every layer
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Built for executives, strategists, and analysts who need more than answers — they need foresight.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6 hover:border-accent/20 transition-all duration-300 group hover:-translate-y-1 hover:shadow-glow cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
