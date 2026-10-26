"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Wallet,
  Users,
  KeyRound,
  Banknote,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DualAudienceSection() {
  const [activeTab, setActiveTab] = useState<"students" | "hosts">("students");

  return (
    <div className="w-full rounded-3xl border border-slate-200/90 dark:border-[#22352B] bg-white dark:bg-[#121E18]/80 p-6 sm:p-10 shadow-md dark:shadow-xl">
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Engineered for Both Sides of Campus Housing
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D]">
          Eliminating agency fraud and middlemen for students while guaranteeing
          reliable, high-occupancy rent flow for verified property owners.
        </p>

        {/* Audience Toggle Pills */}
        <div className="inline-flex rounded-full bg-slate-100 dark:bg-[#0B130F] p-1.5 border border-slate-200 dark:border-[#22352B] mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeTab === "students"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-600 hover:text-slate-900 dark:text-[#93A89D] dark:hover:text-white"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>For Students</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hosts")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeTab === "hosts"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-600 hover:text-slate-900 dark:text-[#93A89D] dark:hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>For Landlords & Hosts</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Students */}
      {activeTab === "students" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-slate-50/70 dark:bg-[#0E1A14] p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Zero Fake Agents & Extortion
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed">
              No more &ldquo;inspection fee&rdquo; scams. Every lodge on Kampus is
              verified with registered physical owners. Transparent one-off pricing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-slate-50/70 dark:bg-[#0E1A14] p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              24-Hour Move-in Protection
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed">
              Funds are held in custodial trust. Inspect light, water, security, and
              room state before authorizing final payout to the landlord.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-slate-50/70 dark:bg-[#0E1A14] p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Roommate Matching & Flatshares
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed">
              Connect with fellow course-mates by department, sleeping habits, and
              budget to split 2-bedroom flats affordably.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Landlords & Hosts */}
      {activeTab === "hosts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-slate-50/70 dark:bg-[#0E1A14] p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Banknote className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Guaranteed Rent Payouts
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed">
              Eliminate defaulted payments and tenant chasing. Students prepay their
              entire academic session directly into custodial escrow prior to move-in.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-slate-50/70 dark:bg-[#0E1A14] p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Verified Matric Student Profiles
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed">
              Know exactly who lives in your properties. Every student must verify
              their University Matric ID and faculty credentials before booking.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-slate-50/70 dark:bg-[#0E1A14] p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              1-Tap Availability & Status Hub
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed">
              Manage your hostel portfolio with 1-click status dropdowns (Available,
              Booked, Maintenance). Direct automated bank payouts to your BVN-linked account.
            </p>
          </div>
        </div>
      )}

      {/* CTA Footer Row */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-[#22352B] pt-6 gap-4">
        <p className="text-xs text-slate-600 dark:text-[#93A89D] text-center sm:text-left">
          Are you a property manager or landlord with student hostels in Akoka, Akure, Ibadan, or Benin?
        </p>

        <Link href="/host/dashboard">
          <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-[#0E4D38] dark:hover:bg-[#16A34A] text-white font-bold text-xs rounded-full px-5 py-2.5 flex items-center gap-2 border border-emerald-500/30 shadow-lg">
            <span>Enter Host & Landlord Hub</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
