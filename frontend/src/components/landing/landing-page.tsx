"use client";

import { useEffect, useRef, useState } from "react";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { ArchitectureSection } from "./architecture-section";
import { PricingSection } from "./pricing-section";
import { LandingNav } from "./landing-nav";
import { LandingFooter } from "./landing-footer";
import { ParticleBackground } from "./particle-background";
import { pingHealthCheck } from "@/lib/health";
import { useBackendHealth } from "@/hooks/use-backend-health";

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { status: backendReady } = useBackendHealth(process.env.NEXT_PUBLIC_API_URL, 30000);
  const backendStatus = backendReady === "checking" ? "checking" : backendReady === "ready" ? "online" : "offline";

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      {/* Gradient overlay at top */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none z-0" />

      <div className="relative z-10">
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm">
            <span className="font-medium">Nexus AI</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                backendStatus === "online"
                  ? "bg-emerald-500/15 text-emerald-600"
                  : backendStatus === "offline"
                    ? "bg-rose-500/15 text-rose-600"
                    : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {backendStatus === "checking"
                ? "Checking backend..."
                : backendStatus === "online"
                  ? "Backend healthy"
                  : "Backend unavailable"}
            </span>
          </div>
        </div>
        <LandingNav />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <ArchitectureSection />
          <PricingSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
