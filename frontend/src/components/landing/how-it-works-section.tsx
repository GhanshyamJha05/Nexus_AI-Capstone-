"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const steps = [
  {
    number: "01",
    title: "Enter Your Decision",
    description:
      'Type any strategic decision or scenario. Example: "What happens if we acquire our largest competitor?"',
    detail: "Natural language input, no special syntax required.",
  },
  {
    number: "02",
    title: "Planner Agent Decomposes",
    description:
      "The Planner Agent breaks the decision into domain-specific sub-problems and routes them to the right experts.",
    detail: "Identifies the decision domain, key dimensions, and expert guidance.",
  },
  {
    number: "03",
    title: "6 Agents Analyze in Parallel",
    description:
      "All expert agents work simultaneously using RAG retrieval and long-term memory to generate independent analyses.",
    detail: "Each agent returns structured JSON: summary, reasoning, confidence, citations, timeline.",
  },
  {
    number: "04",
    title: "Consensus Synthesis",
    description:
      "The Consensus Agent reads every expert result, identifies agreements and conflicts, and produces a unified strategic picture.",
    detail: "Weighted confidence scores, conflict resolution, and final recommendations.",
  },
  {
    number: "05",
    title: "Causal Graph + Timeline",
    description:
      "An interactive causal graph and 6-horizon timeline are generated, visualizing how effects ripple through time.",
    detail: "Powered by React Flow — zoom, pan, click nodes to explore.",
  },
  {
    number: "06",
    title: "Executive Report",
    description:
      "A professional report is generated with executive summary, key findings, risk assessment, and PDF export.",
    detail: "Ready to share with your board, investors, or strategic team.",
  },
];

export function HowItWorksSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent to-card/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-wider">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-text-primary">
            From prompt to intelligence in seconds
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-secondary to-transparent" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 pl-16 relative"
              >
                {/* Step number bubble */}
                <div className="absolute left-0 w-12 h-12 rounded-full bg-background border-2 border-accent/40 flex items-center justify-center text-accent font-mono text-sm font-bold z-10">
                  {step.number}
                </div>

                <div className="flex-1 glass rounded-2xl p-6 hover:border-accent/20 transition-colors">
                  <h3 className="font-semibold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm mb-2">{step.description}</p>
                  <p className="text-text-muted text-xs font-mono">{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
