"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CAMPUSES } from "@/lib/constants/campuses";
import { toast } from "@/lib/stores/useToastStore";

const ROOM_TYPES = [
  { id: "all", label: "Any Accommodation Type" },
  { id: "single_room_shared", label: "Single room (toilet outside the room, no kitchen)" },
  { id: "self_contained", label: "Self-Contained Apartment" },
  { id: "one_bedroom_flat", label: "One-Bedroom Flat (Room and Parlour)" },
  { id: "two_bedroom_flat", label: "Two-Bedroom Flat" },
];

const BUDGET_RANGES = [
  { label: "Any Budget", min: 0, max: 10000000 },
  { label: "Under ₦300k / session", min: 0, max: 300000 },
  { label: "₦300k - ₦500k / session", min: 300000, max: 500000 },
  { label: "₦500k+ / session", min: 500000, max: 10000000 },
];

export function HeroCampusSearch() {
  const router = useRouter();
  const [selectedCampus, setSelectedCampus] = useState("FUTMINNA");
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [selectedBudgetIdx, setSelectedBudgetIdx] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCampus && selectedCampus !== "ALL") {
      params.set("campus", selectedCampus);
    }
    if (selectedRoomType && selectedRoomType !== "all") {
      params.set("type", selectedRoomType);
    }
    const budget = BUDGET_RANGES[selectedBudgetIdx];
    if (budget.max < 10000000) {
      params.set("maxPrice", budget.max.toString());
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="relative w-full rounded-3xl border border-slate-200/80 dark:border-[#22352B] bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-[#121E18] dark:via-[#0E1A14] dark:to-[#0B130F] p-6 sm:p-12 shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-200">
      {/* Visual Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[100px]" />
      <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-[#083325] border border-emerald-600/20 dark:border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm dark:shadow-lg">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Student Accommodation Near Your Campus</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Off-Campus Living, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 dark:from-emerald-400 dark:via-emerald-200 dark:to-amber-300">
            Find your next room with confidence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#93A89D] max-w-xl mx-auto leading-relaxed">
          Discover verified student lodges near your university campus. Track payment and
          move-in inspection status from your booking.
        </p>

        {/* Dynamic Campus Search Form */}
        <form
          onSubmit={handleSearch}
          className="mt-8 rounded-2xl sm:rounded-full bg-white dark:bg-[#0B130F]/95 border-2 border-slate-200 dark:border-[#22352B] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:shadow-2xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
        >
          {/* Campus Selector (5 cols) */}
          <div className="sm:col-span-5 flex items-center gap-2.5 px-3 py-2 rounded-xl sm:rounded-full bg-slate-50 dark:bg-[#121E18]/80 border border-slate-200 dark:border-[#22352B]/60 text-left">
            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#93A89D]">
                Select University
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer truncate"
              >
                {CAMPUSES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    disabled={!c.isActive}
                    className={`bg-white dark:bg-[#121E18] ${c.isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400 dark:text-[#586B61]"}`}
                  >
                    {c.fullName} {c.isActive ? "— Live Campus" : "— Coming Soon"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Type Selector (3 cols) */}
          <div className="sm:col-span-3 flex items-center gap-2.5 px-3 py-2 rounded-xl sm:rounded-full bg-slate-50 dark:bg-[#121E18]/80 border border-slate-200 dark:border-[#22352B]/60 text-left">
            <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#93A89D]">
                Room Type
              </label>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer truncate"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white dark:bg-[#121E18] text-slate-900 dark:text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Range Selector (2 cols) */}
          <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-xl sm:rounded-full bg-slate-50 dark:bg-[#121E18]/80 border border-slate-200 dark:border-[#22352B]/60 text-left">
            <div className="min-w-0 flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#93A89D]">
                Budget
              </label>
              <select
                value={selectedBudgetIdx}
                onChange={(e) => setSelectedBudgetIdx(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer truncate"
              >
                {BUDGET_RANGES.map((b, i) => (
                  <option key={i} value={i} className="bg-white dark:bg-[#121E18] text-slate-900 dark:text-white">
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action (2 cols) */}
          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4 stroke-[2.5]" />
              <span>Search</span>
            </Button>
          </div>
        </form>

        {/* Quick Campus Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-[#93A89D]">
          <span className="text-[11px] font-medium">Campuses:</span>
          {CAMPUSES.map((campus) => {
            if (campus.isActive) {
              return (
                <button
                  key={campus.code}
                  type="button"
                  onClick={() => router.push(`/explore?campus=${campus.code}`)}
                  className="rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-600/30 dark:border-emerald-500/50 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>{campus.shortName} (Active)</span>
                </button>
              );
            }
            return (
              <button
                key={campus.code}
                type="button"
                onClick={() => {
                  toast.info(`${campus.name} (Coming Soon)`, {
                    description: "Kampus is actively prioritizing FUTMINNA. Onboarding verified hosts for this campus soon!",
                  });
                }}
                className="rounded-full bg-slate-100 dark:bg-[#121E18]/50 border border-slate-200 dark:border-[#22352B]/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-[#586B61] hover:text-slate-900 dark:hover:text-[#93A89D] hover:border-slate-300 dark:hover:border-[#22352B] transition-colors flex items-center gap-1 cursor-default"
              >
                <span>{campus.shortName}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-[#17261F] text-amber-700 dark:text-amber-400/80 border border-amber-500/20">Soon</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
