"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Property } from "@/types/property";
import { lodgesApi } from "@/api/lodges";
import { Button } from "@/components/ui/button";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/constants/accommodation-types";

type FeaturedFilter = {
  id: string;
  label: string;
  search?: string;
  area?: string;
  category?: string;
  maxPrice?: number;
};

const FILTER_PILLS: FeaturedFilter[] = [
  { id: "all", label: "All homes" },
  { id: "area-gidankwano", label: "Gidankwano", area: "gidankwano" },
  { id: "area-gidanpainti", label: "Gidanpainti", area: "gidanpainti" },
  { id: "area-gidanmangoro", label: "Gidanmangoro", area: "gidanmangoro" },
  { id: "area-dama", label: "Dama", area: "dama" },
  { id: "area-bosso-front", label: "Bosso · Front of school", area: "bosso_front" },
  { id: "area-bosso-back", label: "Bosso · Back of school", area: "bosso_back" },
  { id: "under-250k", label: "Under ₦250k", maxPrice: 250_000 },
  ...ACCOMMODATION_TYPE_OPTIONS.map((type) => ({
    id: type.id,
    label: type.filterLabel,
    category: type.id,
  })),
];

export function FeaturedAccommodations() {
  const [allLodges, setAllLodges] = useState<Property[]>([]);
  const [activePill, setActivePill] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const activeFilter = useMemo(
    () => FILTER_PILLS.find((pill) => pill.id === activePill) ?? FILTER_PILLS[0],
    [activePill],
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasLoadError(false);

    lodgesApi.getLodges({
      pageSize: 12,
      university: "FUTMINNA",
      search: activeFilter.search,
      area: activeFilter.area,
      category: activeFilter.category,
      maxPrice: activeFilter.maxPrice,
    })
      .then((response) => {
        if (!isMounted) return;
        setAllLodges(response.items);
      })
      .catch(() => {
        if (!isMounted) return;
        setAllLodges([]);
        setHasLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeFilter, retryCount]);

  return (
    <section className="landing-listings space-y-6" aria-labelledby="listings-title">
      <div className="landing-listings__header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="landing-listings__heading">
          <p className="landing-eyebrow">Accommodation around FUTMINNA</p>
          <h2 id="listings-title">Find a room or flat.</h2>
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
      ) : hasLoadError ? (
        <div role="alert" className="landing-listings__empty rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Homes couldn’t be loaded.</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Please try again.</p>
          <Button onClick={() => setRetryCount((count) => count + 1)} variant="outline" className="mt-4 rounded-full border-emerald-600/30 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Try again
          </Button>
        </div>
      ) : allLodges.length > 0 ? (
        <div className="landing-listings__grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {allLodges.map((lodge) => <PropertyCard key={lodge.id} property={lodge} />)}
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
