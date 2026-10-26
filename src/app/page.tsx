"use client";

import React, { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroArchitecturalShowcase } from "@/components/home/HeroArchitecturalShowcase";
import { ArchitecturalBentoPurpose } from "@/components/home/ArchitecturalBentoPurpose";
import { FeaturedAccommodations } from "@/components/home/FeaturedAccommodations";
import { MinnaNeighborhoods } from "@/components/home/MinnaNeighborhoods";
import { EscrowVisualizer } from "@/components/home/EscrowVisualizer";
import { HostCtaBanner } from "@/components/home/HostCtaBanner";
import { LandingFaq } from "@/components/home/LandingFaq";
import { ScrollReveal } from "@/components/home/ScrollReveal";

function LandingPageContent() {
  return (
    <div className="landing-page min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="landing-main flex-1">
        <HeroArchitecturalShowcase />

        <ScrollReveal className="landing-block">
          <ArchitecturalBentoPurpose />
        </ScrollReveal>

        <ScrollReveal className="landing-block" delay={0.04}>
          <FeaturedAccommodations />
        </ScrollReveal>

        <ScrollReveal className="landing-block" delay={0.04}>
          <MinnaNeighborhoods />
        </ScrollReveal>

        <ScrollReveal className="landing-block landing-escrow" delay={0.04}>
          <section id="escrow" aria-label="How rent protection works">
            <EscrowVisualizer />
          </section>
        </ScrollReveal>

        <ScrollReveal className="landing-block">
          <HostCtaBanner />
        </ScrollReveal>

        <ScrollReveal className="landing-block">
          <LandingFaq />
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          Loading Kampus...
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}
