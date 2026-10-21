"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  MapPin,
  Lock,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroCampusSearch } from "@/components/home/HeroCampusSearch";
import { EscrowVisualizer } from "@/components/home/EscrowVisualizer";
import { DualAudienceSection } from "@/components/home/DualAudienceSection";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Property } from "@/types/property";
import { lodgesApi } from "@/api/lodges";
import { Button } from "@/components/ui/button";

function LandingPageContent() {
  const [featuredLodges, setFeaturedLodges] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    lodgesApi.getLodges({ pageSize: 4 }).then((res) => {
      setFeaturedLodges(res.items.slice(0, 4));
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B130F] text-[#F2F9F5]">
      <Navbar />

      <main className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-12 sm:space-y-16">
        {/* 1. Hero with Live Campus Search */}
        <section>
          <HeroCampusSearch />
        </section>

        {/* 2. Interactive Custodial Escrow Visualizer */}
        <section id="escrow">
          <EscrowVisualizer />
        </section>

        {/* 3. Verified Campus Lodges Spotlight */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Inspected & Verified
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Featured Campus Accommodations
              </h2>
              <p className="text-xs sm:text-sm text-[#93A89D] mt-1">
                Hand-inspected student lodges steps from FUTMINNA (Gidan Kwano & Bosso campuses). Expanding soon to UNILAG, FUTA, and UI.
              </p>
            </div>

            <Link href="/explore">
              <Button
                variant="outline"
                className="rounded-full border-[#22352B] bg-[#121E18] text-emerald-300 hover:bg-[#17261F] text-xs font-bold flex items-center gap-1.5"
              >
                <span>Explore All Lodges in Map View</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 rounded-3xl bg-[#121E18] animate-pulse border border-[#22352B]" />
              ))}
            </div>
          ) : featuredLodges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredLodges.map((lodge) => (
                <PropertyCard key={lodge.id} property={lodge} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#22352B] bg-[#0E1A14] p-10 text-center text-[#93A89D] text-sm">
              No featured accommodations published yet. Check back shortly.
            </div>
          )}
        </section>

        {/* 4. Dual Audience Value Proposition (Students vs Hosts) */}
        <section>
          <DualAudienceSection />
        </section>

        {/* 5. Trust, Compliance & Regulatory Badges */}
        <section className="rounded-2xl border border-[#22352B] bg-[#0E1A14] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Nigeria Data Protection Regulation (NDPR) Compliant
              </h4>
              <p className="text-xs text-[#93A89D] mt-0.5 max-w-lg">
                Your BVN, payment transactions, and student credentials are encrypted using bank-grade
                256-bit SSL protocols in partnership with licensed Nigerian trust institutions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-[#121E18] border border-[#22352B] px-3.5 py-2 text-xs text-[#93A89D]">
              <span className="block font-bold text-white">CBN Licensed</span>
              <span>Custodial Settlement</span>
            </div>
            <div className="rounded-xl bg-[#121E18] border border-[#22352B] px-3.5 py-2 text-xs text-[#93A89D]">
              <span className="block font-bold text-emerald-400">24/7 Hotline</span>
              <span>Dispute Arbitrators</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#22352B] bg-[#08100C] py-8 text-xs text-[#93A89D] mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-white">KAMPUS NG</span>
            <span>• Off-Campus Student Accommodation & Escrow</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/explore" className="hover:text-white transition-colors">
              Explore Lodges
            </Link>
            <Link href="/host/dashboard" className="hover:text-white transition-colors">
              Host Portal
            </Link>
            <Link href="/bookings" className="hover:text-white transition-colors">
              Escrow Protection
            </Link>
            <span>&copy; {new Date().getFullYear()} Kampus Prop-Tech</span>
          </div>
        </div>
      </footer>
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
