"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "motion/react";
import {
  Sparkles,
  SlidersHorizontal,
  Building,
  MapPin,
  TrendingUp,
  Inbox,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyFilterBar } from "@/components/property/PropertyFilterBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyMap } from "@/components/map/PropertyMap";
import { MobileListingDrawer } from "@/components/property/MobileListingDrawer";
import { Property } from "@/types/property";
import { lodgesApi } from "@/api/lodges";

function ExplorePlatform() {
  const [q] = useQueryState("q", { defaultValue: "" });
  const [campus] = useQueryState("campus", { defaultValue: "FUTMINNA" });
  const [type] = useQueryState("type", { defaultValue: "all" });
  const [maxPrice] = useQueryState("maxPrice", {
    parse: (v) => parseInt(v, 10) || 10000000,
    defaultValue: 10000000,
  });
  const [view] = useQueryState("view", { defaultValue: "split" });
  const [sort] = useQueryState("sort", { defaultValue: "featured" });

  const [properties, setProperties] = useState<Property[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsFetching(true);

    lodgesApi
      .getLodges({
        category: type !== "all" ? type : undefined,
        priceMax: maxPrice < 10000000 ? maxPrice : undefined,
      })
      .then((res) => {
        if (!isMounted) return;
        setProperties(res.items);
        setIsLiveApi(!res.isFallback);
        setIsFetching(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [type, maxPrice]);

  // Client-side filtering & sorting for search keywords and sort options
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        if (campus && campus !== "all" && prop.campus !== campus) {
          return false;
        }
        if (q) {
          const query = q.toLowerCase();
          const matchesQuery =
            prop.title.toLowerCase().includes(query) ||
            prop.campus.toLowerCase().includes(query) ||
            prop.campusName.toLowerCase().includes(query) ||
            prop.address.neighborhood.toLowerCase().includes(query) ||
            prop.address.street.toLowerCase().includes(query) ||
            prop.description.toLowerCase().includes(query);
          if (!matchesQuery) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "price_asc") return a.price - b.price;
        if (sort === "price_desc") return b.price - a.price;
        if (sort === "distance") return a.proximityMinutes - b.proximityMinutes;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [properties, q, sort]);

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
              {filteredProperties.length} Student Lodges
            </span>
            <span>available with Custodial Escrow</span>
            {campus !== "all" && (
              <span className="rounded-full bg-[#f4e8e2] dark:bg-[#2a201b] px-2 py-0.5 font-bold text-[#a94c2e] dark:text-[#e08b6a] border border-[#c45b37]/25">
                {campus}
              </span>
            )}
            {type !== "all" && (
              <span className="rounded-full bg-slate-100 dark:bg-[#121E18] px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#22352B] capitalize">
                {type}
              </span>
            )}

            {/* Live Gateway Indicator */}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#f4e8e2] dark:bg-[#2a201b] border-[#c45b37]/25 text-[#a94c2e] dark:text-[#e08b6a]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#c45b37]" />
              Kampus Gateway Connected
            </span>

            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
            )}
          </div>

          <div className="flex items-center gap-2 text-[#a94c2e] dark:text-[#e08b6a] font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">100% Move-in Inspection Guarantee</span>
          </div>
        </div>

        {/* DESKTOP VIEWPORTS (>= 768px) */}
        <div className="explore-viewports hidden md:block flex-1">
          {view === "split" && (
            <div className="explore-split-grid grid grid-cols-12 gap-6 items-start">
              {/* Left Column: Scrollable Property Feed (7 cols) */}
              <div className="col-span-12 lg:col-span-7 xl:col-span-7 space-y-4">
                {filteredProperties.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0E1A14] p-12 text-center shadow-sm">
                    <Inbox className="mx-auto h-10 w-10 text-slate-400 dark:text-[#586B61] mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      No matching student lodges found
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#93A89D] mt-1">
                      Try switching campuses or resetting room filters.
                    </p>
                  </div>
                ) : (
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
                )}
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
