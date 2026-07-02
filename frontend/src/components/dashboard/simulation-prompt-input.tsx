"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Tag, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { simulationsApi } from "@/lib/api";

const EXAMPLE_PROMPTS = [
  "What happens if Apple shifts 50% of manufacturing from China to India?",
  "Analyze the impact of a Federal Reserve rate cut of 100 basis points",
  "What if Tesla acquires Rivian to accelerate EV market dominance?",
  "Simulate the effects of a major US cyberattack on Chinese infrastructure",
  "What happens if the EU bans social media for users under 18?",
];

interface Props {
  onCreated: (id: number) => void;
}

export function SimulationPromptInput({ onCreated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      toast.error("Please enter a more detailed prompt (at least 10 characters)");
      return;
    }
    setIsLoading(true);
    try {
      const resp = await simulationsApi.create({ prompt: prompt.trim() });
      toast.success("Simulation launched! Agents are analyzing...");
      onCreated(resp.data.id);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Failed to start simulation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-6 border border-border hover:border-accent/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
        </div>
        <span className="text-sm font-medium text-text-primary">New Simulation</span>
        <span className="text-xs text-text-muted ml-auto">⌘+Enter to run</span>
      </div>

      {/* Textarea */}
      <div className="relative mb-4">
        <Textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setCharCount(e.target.value.length);
          }}
          onKeyDown={handleKeyDown}
          placeholder="What strategic decision do you want to simulate? Be specific — include companies, numbers, and context for the best results."
          className="min-h-[120px] text-sm bg-background/50 resize-none pr-4"
          maxLength={5000}
          disabled={isLoading}
          aria-label="Simulation prompt"
        />
        <div className="absolute bottom-3 right-3 text-xs text-text-muted">
          {charCount}/5000
        </div>
      </div>

      {/* Example prompts */}
      <div className="mb-4">
        <p className="text-xs text-text-muted mb-2">Or try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 3).map((example) => (
            <button
              key={example}
              onClick={() => {
                setPrompt(example);
                setCharCount(example.length);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-accent/30 text-text-muted hover:text-text-primary transition-all truncate max-w-[220px]"
              disabled={isLoading}
            >
              {example.slice(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Globe className="w-3.5 h-3.5" />
          <span>6 agents • Real-time streaming</span>
        </div>
        <Button
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!prompt.trim() || isLoading}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          Run Simulation
        </Button>
      </div>
    </motion.div>
  );
}
