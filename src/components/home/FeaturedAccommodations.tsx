"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter, ShieldCheck, MapPin } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Property } from "@/types/property";
import { lodgesApi } from "@/api/lodges";
import { Button } from "@/components/ui/button";

const FILTER_PILLS = [
  { id: "all", label: "All Verified Lodges" },
  { id: "gidan-kwano", label: "📍 Gidan Kwano Gate" },
  { id: "bosso", label: "📍 Bosso Campus Hub" },
  { id: "under-250k", label: "💰 Under ₦250k" },
  { id: "self-con", label: "🏡 En-Suite Self-Con" },
  { id: "solar", label: "⚡ Solar & Inverter Backup" },
];

export function FeaturedAccommodations() {
  const [allLodges, setAllLodges] = useState<Property[]>([]);
  const [activePill, setActivePill] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    lodgesApi.getLodges({ pageSize: 12 }).then((res) => {
      setAllLodges(res.items);
      setIsLoading(false);
    });
  }, []);

  const filteredLodges = useMemo(() => {
    return allLodges.filter((lodge) => {
      if (activePill === "gidan-kwano") {
        return (
          lodge.title.toLowerCase().includes("gidan kwano") ||
          lodge.address.neighborhood.toLowerCase().includes("gidan kwano") ||
          lodge.distanceToCampus.toLowerCase().includes("main gate")
        );
      }
      if (activePill === "bosso") {
        return (
          lodge.title.toLowerCase().includes("bosso") ||
          lodge.address.neighborhood.toLowerCase().includes("bosso")
        );
      }
      if (activePill === "under-250k") {
        return lodge.price <= 250000;
      }
      if (activePill === "self-con") {
        return lodge.propertyType === "self-con";
      }
      if (activePill === "solar") {
        return (
          lodge.powerSchedule.toLowerCase().includes("solar") ||
          lodge.powerSchedule.toLowerCase().includes("inverter") ||
          lodge.amenities.some((a) => a.toLowerCase().includes("solar"))
        );
      }
      return true;
    });
  }, [allLodges, activePill]);

  return (
    <section className="space-y-6">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Verified & Inspected
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Featured FUTMINNA Accommodations
          </h2>
          <p className="text-xs sm:text-sm text-[#93A89D] mt-1 max-w-xl">
            Inspected student lodges with verified water supply, dedicated meters, and 100% escrow protection.
          </p>
        </div>

        <Link href="/explore">
          <Button
            variant="outline"
            className="rounded-full border-[#22352B] bg-[#121E18] text-emerald-300 hover:bg-[#17261F] text-xs font-bold flex items-center gap-1.5"
          >
            <span>Explore All Lodges on Map</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Filter Pills Carousel/Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTER_PILLS.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActivePill(pill.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                  : "bg-[#121E18] text-[#93A89D] border border-[#22352B] hover:border-emerald-500/50 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Lodges Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-80 rounded-3xl bg-[#121E18] animate-pulse border border-[#22352B]"
            />
          ))}
        </div>
      ) : filteredLodges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredLodges.map((lodge) => (
            <PropertyCard key={lodge.id} property={lodge} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#22352B] bg-[#0E1A14] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-white">
            No lodges match this specific filter right now.
          </p>
          <p className="text-xs text-[#93A89D]">
            Try switching to &ldquo;All Verified Lodges&rdquo; or explore all listings in the interactive map view.
          </p>
          <Button
            onClick={() => setActivePill("all")}
            variant="outline"
            className="rounded-full border-emerald-500/40 text-emerald-400 text-xs font-bold"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </section>
  );
}
