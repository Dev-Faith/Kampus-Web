"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "motion/react";
import { Inbox, Loader2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyFilterBar } from "@/components/property/PropertyFilterBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyMap } from "@/components/map/PropertyMap";
import { MobileListingDrawer } from "@/components/property/MobileListingDrawer";
import { Property } from "@/types/property";
import { lodgesApi } from "@/api/lodges";
import { CAMPUS_AREA_OPTIONS } from "@/lib/constants/campus-areas";
import { getAccommodationTypeLabel } from "@/lib/constants/accommodation-types";

function ExplorePlatform() {
  const [q] = useQueryState("q", { defaultValue: "" });
  const [campus] = useQueryState("campus", { defaultValue: "FUTMINNA" });
  const [area] = useQueryState("area", { defaultValue: "all" });
  const [type] = useQueryState("type", { defaultValue: "all" });
  const [minPrice] = useQueryState("minPrice", {
    parse: (value) => parseInt(value, 10) || 0,
    defaultValue: 0,
  });
  const [maxPrice] = useQueryState("maxPrice", {
    parse: (v) => parseInt(v, 10) || 10000000,
    defaultValue: 10000000,
  });
  const [view] = useQueryState("view", { defaultValue: "split" });
  const [sort] = useQueryState("sort", { defaultValue: "featured" });

  const [properties, setProperties] = useState<Property[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [hasFetchError, setHasFetchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsFetching(true);
    setHasFetchError(false);
    setProperties([]);

    lodgesApi
      .getLodges({
        category: type === "all" ? undefined : type,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 10000000 ? maxPrice : undefined,
        university: campus !== "all" ? campus : undefined,
        area: area !== "all" ? area : undefined,
        search: q.trim() || undefined,
        sortBy: sort === "price_asc" || sort === "price_desc" ? sort : undefined,
      })
      .then((res) => {
        if (!isMounted) return;
        setProperties(res.items);
        setHasFetchError(false);
        setIsFetching(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setProperties([]);
        setHasFetchError(true);
        setIsFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [type, minPrice, maxPrice, campus, area, q, sort, retryCount]);

  const filteredProperties = useMemo(() => properties, [properties]);

  return (
    <div className="editorial-page explore-page min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />

      <main className="explore-main flex-1">
        {/* Filter and Query Control Bar */}
        <div className="w-full">
          <PropertyFilterBar />
        </div>

        {/* Results Counter & Live Indicator */}
        <div className="explore-summary flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-[#93A89D]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredProperties.length} listings
            </span>
            <span>from the selected search</span>
            {campus !== "all" && (
              <span className="rounded-full bg-[#f4e8e2] dark:bg-[#2a201b] px-2 py-0.5 font-bold text-[#a94c2e] dark:text-[#e08b6a] border border-[#c45b37]/25">
                {campus}
              </span>
            )}
            {type !== "all" && (
              <span className="rounded-full bg-slate-100 dark:bg-[#121E18] px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#22352B] capitalize">
                {getAccommodationTypeLabel(type)}
              </span>
            )}
            {area !== "all" && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-medium text-slate-700 capitalize dark:border-[#22352B] dark:bg-[#121E18] dark:text-slate-300">
                {CAMPUS_AREA_OPTIONS.find((option) => option.id === area)?.label ?? area}
              </span>
            )}

            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
            )}
          </div>

          <div className="flex items-center gap-2 text-[#a94c2e] dark:text-[#e08b6a] font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Move-in Inspection Code</span>
          </div>
        </div>

        {hasFetchError ? (
          <div role="alert" className="my-8 rounded-2xl border border-rose-300 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/30">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Listings couldn’t be loaded
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Please try again. This is a loading problem, not an empty search result.
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Try again
            </button>
          </div>
        ) : isFetching ? (
          <div role="status" className="my-8 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 dark:border-[#22352B] dark:bg-[#0E1A14] dark:text-[#93A89D]">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            Loading listings…
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="my-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-[#22352B] dark:bg-[#0E1A14]">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-slate-400 dark:text-[#586B61]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching student lodges found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#93A89D]">
              Try changing your search filters.
            </p>
          </div>
        ) : (
          <>
        {/* DESKTOP VIEWPORTS (>= 768px) */}
        <div className="explore-viewports hidden md:block flex-1">
          {view === "split" && (
            <div className="explore-split-grid grid grid-cols-12 gap-6 items-start">
              {/* Left Column: Scrollable Property Feed (7 cols) */}
              <div className="col-span-12 lg:col-span-7 xl:col-span-7 space-y-4">
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Right Column: Sticky Vector Map (5 cols) */}
              <div className="explore-map-frame col-span-12 lg:col-span-5 xl:col-span-5 sticky top-20 h-[calc(100vh-6.5rem)]">
                <PropertyMap properties={filteredProperties} />
              </div>
            </div>
          )}

          {view === "grid" && (
            <div className="w-full">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {view === "map" && (
            <div className="explore-map-only w-full h-[calc(100vh-12rem)]">
              <PropertyMap properties={filteredProperties} />
            </div>
          )}
        </div>

        {/* MOBILE VIEWPORT (< 768px): Edge-to-Edge Map with Vaul Draggable Sheet */}
        <div className="explore-mobile-map block md:hidden relative w-full h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-[#22352B]">
          <PropertyMap properties={filteredProperties} />
          <MobileListingDrawer properties={filteredProperties} />
        </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B130F] text-[#93A89D]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            <span className="text-sm font-semibold tracking-wide text-white">
              Loading Kampus Accommodation Map...
            </span>
          </div>
        </div>
      }
    >
      <ExplorePlatform />
    </Suspense>
  );
}
