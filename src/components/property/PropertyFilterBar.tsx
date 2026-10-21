"use client";

import React from "react";
import { useQueryState } from "nuqs";
import { motion } from "motion/react";
import {
  Search,
  X,
  LayoutGrid,
  Columns2,
  Map as MapIcon,
  Home,
  Building,
  GraduationCap,
  Users,
  Sparkles,
} from "lucide-react";
import {
  propertyTypes,
  campusCodes,
} from "@/lib/search-params";
import { CAMPUSES } from "@/lib/constants/campuses";
import { toast } from "@/lib/stores/useToastStore";

const ROOM_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  all: { label: "All Lodges", icon: Home },
  "self-con": { label: "Self-Con", icon: Building },
  "single-room": { label: "Single Room", icon: Home },
  flatshare: { label: "Flatshares", icon: Users },
  studio: { label: "Executive Studio", icon: Sparkles },
};

export function PropertyFilterBar() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [campus, setCampus] = useQueryState("campus", { defaultValue: "FUTMINNA" });
  const [type, setType] = useQueryState("type", { defaultValue: "all" });
  const [view, setView] = useQueryState("view", { defaultValue: "split" });
  const [sort, setSort] = useQueryState("sort", { defaultValue: "featured" });

  const hasActiveFilters =
    q || campus !== "FUTMINNA" || type !== "all" || sort !== "featured";

  const resetFilters = () => {
    setQ("");
    setCampus("FUTMINNA");
    setType("all");
    setSort("featured");
  };

  return (
    <div className="w-full space-y-3">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#93A89D]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value || null)}
            placeholder="Search lodge name, area, or campus (e.g. FUTMINNA, Gidan Kwano, Bosso)..."
            className="w-full rounded-full border border-[#22352B] bg-[#0E1A14] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-[#586B61] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ(null)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#93A89D] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Desktop View Switcher */}
          <div className="hidden lg:flex items-center rounded-full border border-[#22352B] bg-[#0E1A14] p-1">
            <button
              type="button"
              onClick={() => setView("split")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "split"
                  ? "bg-[#17261F] text-emerald-400 font-bold shadow-sm"
                  : "text-[#93A89D] hover:text-white"
              }`}
              title="Split Feed & Map View"
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>

            <button
              type="button"
              onClick={() => setView("grid")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "grid"
                  ? "bg-[#17261F] text-emerald-400 font-bold shadow-sm"
                  : "text-[#93A89D] hover:text-white"
              }`}
              title="Full Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setView("map")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "map"
                  ? "bg-[#17261F] text-emerald-400 font-bold shadow-sm"
                  : "text-[#93A89D] hover:text-white"
              }`}
              title="Full Map View"
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </button>
          </div>

          {/* Reset Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Campus Selector Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#93A89D] shrink-0 pl-1">
          Campus:
        </span>
        {campusCodes.map((campusCode) => {
          const isSelected = campus === campusCode;
          const isFutminna = campusCode === "FUTMINNA";
          const isAll = campusCode === "all";
          const isDisabled = !isFutminna && !isAll;

          if (isDisabled) {
            return (
              <button
                key={campusCode}
                type="button"
                onClick={() => {
                  toast.info(`${campusCode} Coming Soon`, {
                    description: "Kampus is currently active in FUTMINNA. Onboarding verified student lodges here soon!",
                  });
                }}
                className="relative flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all bg-[#0E1A14]/50 border border-[#22352B]/60 text-[#586B61] opacity-60 cursor-default hover:text-[#93A89D]"
              >
                <GraduationCap className="h-3.5 w-3.5 text-[#586B61]" />
                <span>{campusCode}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#17261F] text-amber-400/80 border border-amber-500/20">
                  Soon
                </span>
              </button>
            );
          }

          return (
            <button
              key={campusCode}
              type="button"
              onClick={() => setCampus(campusCode)}
              className={`relative flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                  : "bg-[#0E1A14] border border-[#22352B] text-[#93A89D] hover:text-white hover:border-[#344E40]"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{isAll ? "All Universities" : `${campusCode} (Active)`}</span>
              {isFutminna && !isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Room Type Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#93A89D] shrink-0 pl-1">
          Room:
        </span>
        {propertyTypes.map((typeKey) => {
          const config = ROOM_TYPE_CONFIG[typeKey] || {
            label: typeKey,
            icon: Home,
          };
          const IconComponent = config.icon;
          const isSelected = type === typeKey;

          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => setType(typeKey)}
              className={`group relative flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 select-none ${
                isSelected
                  ? "text-slate-950 font-bold"
                  : "border border-[#22352B] bg-[#0E1A14]/70 text-[#93A89D] hover:border-[#344E40] hover:text-white"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-room-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <IconComponent
                className={`relative z-10 h-3.5 w-3.5 transition-colors ${
                  isSelected
                    ? "text-slate-950"
                    : "text-[#93A89D] group-hover:text-emerald-400"
                }`}
              />
              <span className="relative z-10">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
