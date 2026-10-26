"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Property } from "@/types/property";
import { lodgesApi } from "@/api/lodges";
import { Button } from "@/components/ui/button";

const FILTER_PILLS = [
  { id: "all", label: "All homes" },
  { id: "gidan-kwano", label: "Gidan Kwano" },
  { id: "bosso", label: "Bosso" },
  { id: "under-250k", label: "Under 250k" },
  { id: "self-con", label: "Self-con" },
  { id: "solar", label: "Solar backup" },
];

export function FeaturedAccommodations() {
  const [allLodges, setAllLodges] = useState<Property[]>([]);
  const [activePill, setActivePill] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    lodgesApi.getLodges({ pageSize: 12 }).then((response) => {
      setAllLodges(response.items);
      setIsLoading(false);
    });
  }, []);

  const filteredLodges = useMemo(() => allLodges.filter((lodge) => {
    if (activePill === "gidan-kwano") {
      return lodge.title.toLowerCase().includes("gidan kwano") ||
        lodge.address.neighborhood.toLowerCase().includes("gidan kwano") ||
        lodge.distanceToCampus.toLowerCase().includes("main gate");
    }
    if (activePill === "bosso") {
      return lodge.title.toLowerCase().includes("bosso") ||
        lodge.address.neighborhood.toLowerCase().includes("bosso");
    }
    if (activePill === "under-250k") return lodge.price <= 250_000;
    if (activePill === "self-con") return lodge.propertyType === "self-con";
    if (activePill === "solar") {
      return lodge.powerSchedule.toLowerCase().includes("solar") ||
        lodge.powerSchedule.toLowerCase().includes("inverter") ||
        lodge.amenities.some((amenity) => amenity.toLowerCase().includes("solar"));
    }
    return true;
  }), [allLodges, activePill]);

  return (
    <section className="landing-listings space-y-6" aria-labelledby="listings-title">
      <div className="landing-listings__header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="landing-listings__heading">
          <p className="landing-eyebrow">Inspected around FUTMINNA</p>
          <h2 id="listings-title">Places to make your own.</h2>
          <p className="landing-section-heading__aside">
            Browse real homes, with the practical details up front and rent protection built in.
          </p>
        </div>

        <Link href="/explore" className="landing-listings__all-link">
          <Button variant="outline" className="landing-listings__all rounded-full border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] text-emerald-700 dark:text-emerald-300 hover:bg-slate-50 dark:hover:bg-[#17261F] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors">
            <span>Explore all homes</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="landing-listings__filters flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" aria-label="Filter homes">
        {FILTER_PILLS.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActivePill(pill.id)}
              aria-pressed={isActive}
              className={`landing-listings__filter rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-md"
                : "bg-white dark:bg-[#121E18] text-slate-600 dark:text-[#93A89D] border border-slate-200 dark:border-[#22352B] hover:border-emerald-500/50 hover:text-slate-900 dark:hover:text-white shadow-sm"
                }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="landing-listings__grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Loading homes">
          {[1, 2, 3, 4].map((item) => <div key={item} className="landing-listings__skeleton h-80 rounded-3xl bg-slate-100 dark:bg-[#121E18] border border-slate-200 dark:border-[#22352B]" />)}
        </div>
      ) : filteredLodges.length > 0 ? (
        <div className="landing-listings__grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredLodges.map((lodge) => <PropertyCard key={lodge.id} property={lodge} />)}
        </div>
      ) : (
        <div className="landing-listings__empty rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0E1A14] p-12 text-center space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">No homes match this filter just yet.</p>
          <p className="text-xs text-slate-500 dark:text-[#93A89D]">Try another area or browse every current listing.</p>
          <Button onClick={() => setActivePill("all")} variant="outline" className="rounded-full border-emerald-600/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            Show all homes
          </Button>
        </div>
      )}
    </section>
  );
}
