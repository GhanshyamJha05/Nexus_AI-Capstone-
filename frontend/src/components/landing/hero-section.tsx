"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_PROMPTS = [
  "What happens if Apple shifts 50% of manufacturing from China to India?",
  "Analyze the impact of a Federal Reserve rate cut of 100 basis points",
  "What are the second-order effects of OpenAI releasing GPT-5 for free?",
  "Simulate the geopolitical fallout if Taiwan halts semiconductor exports",
];

const stats = [
  { value: "6", label: "Expert AI Agents" },
  { value: "5+", label: "Timeline Horizons" },
  { value: "< 60s", label: "Per Simulation" },
  { value: "99.9%", label: "Uptime SLA" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm mb-8"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Powered by Gemini 2.5 Pro + LangGraph</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
        >
          <span className="text-text-primary">Simulate Decisions</span>
          <br />
          <span className="gradient-text">Before Reality Does.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Nexus AI deploys 6 expert AI agents in parallel to analyze the chain reactions
          of your strategic decisions — from immediate effects to 5-year consequences.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/auth/register">
            <Button size="xl" className="group">
              Start Simulating Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="xl">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Example prompt ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-16"
        >
          <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">Example simulations</p>
          <div className="space-y-2">
            {EXAMPLE_PROMPTS.slice(0, 2).map((prompt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="glass rounded-xl px-5 py-3 text-sm text-text-secondary max-w-2xl mx-auto text-left hover:border-accent/30 transition-colors cursor-default group"
              >
                <span className="text-accent mr-2 group-hover:mr-3 transition-all">&quot;</span>
                {prompt}
                <span className="text-accent">&quot;</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
