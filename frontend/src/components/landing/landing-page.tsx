"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { ArchitectureSection } from "./architecture-section";
import { PricingSection } from "./pricing-section";
import { LandingNav } from "./landing-nav";
import { LandingFooter } from "./landing-footer";
import { ParticleBackground } from "./particle-background";

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      {/* Gradient overlay at top */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none z-0" />

      <div className="relative z-10">
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
