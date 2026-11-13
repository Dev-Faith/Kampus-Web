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
  campusAreaCodes,
} from "@/lib/search-params";
import { CAMPUS_AREA_OPTIONS } from "@/lib/constants/campus-areas";
import { toast } from "@/lib/stores/useToastStore";

const ROOM_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  all: { label: "All accommodation", icon: Home },
  single_room_shared: {
    label: "Single room (toilet outside the room, no kitchen)",
    icon: Home,
  },
  self_contained: { label: "Self-contained apartment", icon: Building },
  one_bedroom_flat: {
    label: "One-bedroom flat (room and parlour)",
    icon: Users,
  },
  two_bedroom_flat: { label: "Two-bedroom flat", icon: Sparkles },
};

export function PropertyFilterBar() {
  const [q, updateQ] = useQueryState("q", { defaultValue: "" });
  const [campus, updateCampus] = useQueryState("campus", {
    defaultValue: "FUTMINNA",
  });
  const [area, updateArea] = useQueryState("area", { defaultValue: "all" });
  const [type, updateType] = useQueryState("type", { defaultValue: "all" });
  const [view, setView] = useQueryState("view", { defaultValue: "grid" });
  const [sort, updateSort] = useQueryState("sort", {
    defaultValue: "featured",
  });

  const [, setPage] = useQueryState("page");
  const [minPrice, setMinPrice] = useQueryState("minPrice");
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice");
  const [amenities, setAmenities] = useQueryState("amenities");
  const [distance, setDistance] = useQueryState("distance");
  const change = (fn: () => unknown) => {
    void setPage(null);
    return fn();
  };
  const setQ = (v: string | null) => change(() => updateQ(v));
  const setCampus = (v: string) => change(() => updateCampus(v));
  const setArea = (v: string) => change(() => updateArea(v));
  const setType = (v: string) => change(() => updateType(v));
  const setSort = (v: string) => change(() => updateSort(v));
  const hasActiveFilters =
    minPrice ||
    maxPrice ||
    amenities ||
    distance ||
    q ||
    campus !== "FUTMINNA" ||
    area !== "all" ||
    type !== "all" ||
    sort !== "featured";

  const resetFilters = () => {
    setQ("");
    setCampus("FUTMINNA");
    setArea("all");
    setType("all");
    setSort("featured");
    void setMinPrice(null);
    void setMaxPrice(null);
    void setAmenities(null);
    void setDistance(null);
  };

  return (
    <div className="explore-filter-bar flex w-full flex-col gap-4">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            aria-label="Search lodges by name, area, or campus"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value || null)}
            placeholder="Search lodge name, area, or campus (e.g. FUTMINNA, Gidankwano, Bosso)..."
            className="explore-filter-search w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/30 transition-colors"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ(null)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Desktop View Switcher */}
          <div className="explore-view-toggle flex items-center rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setView("split")}
              aria-pressed={view === "split"}
              className={`hidden md:flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "split"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Split Feed & Map View"
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>

            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Full Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "map"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
              className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Campus Selector Pills Row */}
      <div className="explore-filter-row explore-campus-row flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0 pl-1">
          Campus:
        </span>
        {campusCodes.map((campusCode) => {
          const isSelected = campus === campusCode;
          const isFutminna = campusCode === "FUTMINNA";
          const isDisabled = !isFutminna;

          if (isDisabled) {
            return (
              <button
                key={campusCode}
                type="button"
                onClick={() => {
                  toast.info(`${campusCode} Coming Soon`, {
                    description:
                      "Kampus is currently active in FUTMINNA. Onboarding verified student lodges here soon!",
                  });
                }}
                className="relative flex items-center gap-1.5 shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground cursor-default"
              >
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{campusCode}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-warning-soft text-warning border border-warning/20">
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
              aria-pressed={isSelected}
              className={`relative flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-brand/40"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{`${campusCode} (Active)`}</span>
              {isFutminna && !isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              )}
            </button>
          );
        })}
      </div>

      <div className="explore-filter-row explore-area-row flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 pl-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Area:
        </span>
        {campusAreaCodes.map((areaCode) => {
          const option = CAMPUS_AREA_OPTIONS.find(
            (item) => item.id === areaCode,
          );
          const isSelected = area === areaCode;
          return (
            <button
              key={areaCode}
              type="button"
              onClick={() => setArea(areaCode)}
              aria-pressed={isSelected}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-brand/35 bg-brand-soft text-brand-strong"
                  : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
              }`}
            >
              {option?.label ?? areaCode}
            </button>
          );
        })}
      </div>

      {/* Room Type Filter Pills Row */}
      <div className="explore-filter-row explore-room-row flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0 pl-1">
          Type:
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
              aria-pressed={isSelected}
              className={`group relative flex items-center gap-1.5 shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium transition-colors duration-200 select-none ${
                isSelected
                  ? "border-transparent"
                  : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-room-pill"
                  className="absolute inset-0 rounded-full bg-brand-soft border border-brand/35"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <IconComponent
                className={`relative z-10 h-3.5 w-3.5 transition-colors ${
                  isSelected
                    ? "text-brand-strong"
                    : "text-muted-foreground group-hover:text-brand-strong"
                }`}
              />
              <span
                className={`relative z-10 ${isSelected ? "text-brand-strong" : ""}`}
              >
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
