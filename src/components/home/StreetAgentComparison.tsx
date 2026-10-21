"use client";

import React from "react";
import { Check, X, ShieldAlert, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComparisonRow {
  feature: string;
  streetAgent: string;
  kampusWay: string;
  isImportant?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Inspection / Viewing Fee",
    streetAgent: "₦5,000 – ₦10,000 non-refundable charge per day just to look at rooms",
    kampusWay: "₦0. Unlimited free 360° virtual tours & zero-cost physical check",
    isImportant: true,
  },
  {
    feature: "Rent Payment Safety",
    streetAgent: "Direct bank transfer to roadside agent's personal account (Extreme scam risk)",
    kampusWay: "100% Custodial Escrow held in licensed bank trust until you move in",
    isImportant: true,
  },
  {
    feature: "Utility Verification",
    streetAgent: "Verbal claims ('Light and water dey rush') with no verification",
    kampusWay: "On-site tested borehole pumps, water storage, & dedicated sub-meters",
  },
  {
    feature: "Dispute & Refund Rights",
    streetAgent: "Zero refund policy. Agent switches phone off if room is defective",
    kampusWay: "24-Hour Move-In Inspection Window with 1-tap instant refund dispute",
    isImportant: true,
  },
  {
    feature: "Key Handover Guarantee",
    streetAgent: "Tenants often find rooms already occupied by someone else",
    kampusWay: "Unique 6-digit move-in PIN. Landlord gets paid only after PIN confirmation",
  },
  {
    feature: "Roommate Matching",
    streetAgent: "Zero support. You bear full cost alone if you have no partner",
    kampusWay: "Faculty & lifestyle matching to split 2-bed flats safely",
  },
];

export function StreetAgentComparison() {
  return (
    <section className="rounded-3xl border border-[#22352B] bg-gradient-to-b from-[#121E18] to-[#0B130F] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-rose-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A1215] border border-rose-500/30 px-3.5 py-1 text-xs font-semibold text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Avoid Off-Campus Housing Scams</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            The Roadside Agent Trap vs. The Kampus Standard
          </h2>
          <p className="text-xs sm:text-sm text-[#93A89D]">
            Thousands of Nigerian university students lose their hard-earned school fees to fake agents and substandard hostels every semester. Here is how Kampus fixes it permanently.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="overflow-hidden rounded-2xl border border-[#22352B] bg-[#0E1A14]">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-[#08100C] border-b border-[#22352B] p-4 text-xs font-black uppercase tracking-wider">
            <div className="col-span-4 text-[#93A89D]">Housing Feature</div>
            <div className="col-span-4 text-rose-400 flex items-center gap-1.5">
              <X className="h-4 w-4" />
              <span>Street Agent Hustle</span>
            </div>
            <div className="col-span-4 text-emerald-400 flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              <span>The Kampus Escrow Way</span>
            </div>
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-[#22352B]/60">
            {COMPARISON_ROWS.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-4 text-xs transition-colors items-center ${
                  row.isImportant ? "bg-[#121E18]/40" : "hover:bg-[#121E18]/20"
                }`}
              >
                <div className="col-span-4 font-bold text-white pr-2">
                  {row.feature}
                </div>

                <div className="col-span-4 text-rose-300/80 pr-3 flex items-start gap-2">
                  <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{row.streetAgent}</span>
                </div>

                <div className="col-span-4 text-emerald-300 font-semibold flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{row.kampusWay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[#083325]/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Never hand cash to unregistered agents in Minna
              </p>
              <p className="text-xs text-[#93A89D]">
                Search, book, and move in safely with certified custodial protection.
              </p>
            </div>
          </div>

          <Link href="/explore">
            <Button className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 shadow-lg flex items-center gap-1.5">
              <span>Find Safe Accommodation</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
