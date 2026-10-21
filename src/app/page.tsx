"use client";

import React, { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroCampusSearch } from "@/components/home/HeroCampusSearch";
import { FeaturedAccommodations } from "@/components/home/FeaturedAccommodations";
import { StreetAgentComparison } from "@/components/home/StreetAgentComparison";
import { EscrowVisualizer } from "@/components/home/EscrowVisualizer";
import { DualAudienceSection } from "@/components/home/DualAudienceSection";
import { StudentTestimonials } from "@/components/home/StudentTestimonials";
import { HostCtaBanner } from "@/components/home/HostCtaBanner";
import { LandingFaq } from "@/components/home/LandingFaq";

function LandingPageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B130F] text-[#F2F9F5]">
      {/* 1. Global Sticky Navigation */}
      <Navbar />

      <main className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-16 sm:space-y-24">
        {/* 2. Hero Search with Campus Selector & Escrow Trust */}
        <section>
          <HeroCampusSearch />
        </section>

        {/* 3. Featured Verified Accommodations with Filter Pills */}
        <section>
          <FeaturedAccommodations />
        </section>

        {/* 6. Street Agent Trap vs The Kampus Standard (Comparison Table) */}
        <section>
          <StreetAgentComparison />
        </section>

        {/* 7. Interactive Custodial Escrow Visualizer */}
        <section id="escrow">
          <EscrowVisualizer />
        </section>

        {/* 8. Verified FUTMINNA Student Testimonials */}
        <section>
          <StudentTestimonials />
        </section>

        {/* 9. Dual Audience Value Proposition (Students vs Hosts) */}
        <section>
          <DualAudienceSection />
        </section>

        {/* 10. Landlord & Hostel Owner Conversion Banner */}
        <section>
          <HostCtaBanner />
        </section>

        {/* 11. Frequently Asked Questions Accordion */}
        <section>
          <LandingFaq />
        </section>
      </main>

      {/* 12. Industry Standard Multi-Column PropTech Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0B130F] text-emerald-400">
          Loading Kampus Platform...
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}
