"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, ArrowRight, ShieldCheck, Banknote, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HostRegistrationModal } from "@/components/auth/HostRegistrationModal";

export function HostCtaBanner() {
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  return (
    <>
      <section className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#083325] via-[#0E261C] to-[#0B130F] p-8 sm:p-12 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-400/10 blur-[120px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline and Value Props */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#121E18]/80 border border-emerald-500/40 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>For Minna Landlords & Hostel Managers</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Fill Your Student Lodge at 100% Occupancy. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-amber-200">
                Receive Guaranteed Session Rent Upfront.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#93A89D] max-w-xl leading-relaxed">
              Stop dealing with unreliable street agents who misrepresent your property and collect unauthorized fees. Kampus connects you directly to matriculated FUTMINNA students with full upfront escrow deposits.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero Listing or Onboarding Fees</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Upfront Full-Academic-Session Rent</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Verified University Matric Students</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Direct BVN-Settled Bank Payouts</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setIsHostModalOpen(true)}
                className="h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 shadow-xl flex items-center gap-2"
              >
                <span>List Your Lodge Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Link href="/host/dashboard">
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-[#22352B] bg-[#121E18] text-white hover:bg-[#17261F] text-xs font-bold px-5"
                >
                  <span>Open Host Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Trust Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[#22352B] bg-[#0E1A14]/90 p-6 space-y-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-[#22352B] pb-3">
                <span className="text-xs font-bold text-white">Host Payout Summary</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Escrow Protected
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-[#93A89D]">
                  <span>Average Self-Con Annual Rent</span>
                  <span className="font-bold text-white">₦240,000</span>
                </div>
                <div className="flex justify-between items-center text-[#93A89D]">
                  <span>Average Lodge Capacity</span>
                  <span className="font-bold text-white">12 Rooms</span>
                </div>
                <div className="flex justify-between items-center text-[#93A89D]">
                  <span>Street Agent Loss/Delays</span>
                  <span className="line-through text-rose-400">₦288,000</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#22352B] pt-3 text-sm font-extrabold text-white">
                  <span>Guaranteed Annual Revenue</span>
                  <span className="text-emerald-400">₦2,880,000</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#121E18] border border-[#22352B] flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-[#93A89D] leading-tight">
                  Automated disbursement within 24 hours of verified student physical check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Host Registration Modal Trigger */}
      <HostRegistrationModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
      />
    </>
  );
}
