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
    <div className="min-h-screen flex flex-col bg-[#0B130F] text-[#F2F9F5]">
      <Navbar />

      <main className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-5">
        {/* Filter and Query Control Bar */}
        <div className="w-full">
          <PropertyFilterBar />
        </div>

        {/* Results Counter & Live Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#93A89D]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">
              {filteredProperties.length} Student Lodges
            </span>
            <span>available with Custodial Escrow</span>
            {campus !== "all" && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 border border-emerald-500/20">
                {campus}
              </span>
            )}
            {type !== "all" && (
              <span className="rounded-full bg-[#121E18] px-2 py-0.5 font-medium text-slate-300 border border-[#22352B] capitalize">
                {type}
              </span>
            )}

            {/* Live Gateway Indicator */}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kampus Gateway Connected
            </span>

            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            )}
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">100% Move-in Inspection Guarantee</span>
          </div>
        </div>

        {/* DESKTOP VIEWPORTS (>= 768px) */}
        <div className="hidden md:block flex-1">
          {view === "split" && (
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Left Column: Scrollable Property Feed (7 cols) */}
              <div className="col-span-12 lg:col-span-7 xl:col-span-7 space-y-4">
                {filteredProperties.length === 0 ? (
                  <div className="rounded-2xl border border-[#22352B] bg-[#0E1A14] p-12 text-center">
                    <Inbox className="mx-auto h-10 w-10 text-[#586B61] mb-3" />
                    <h3 className="text-base font-bold text-white">
                      No matching student lodges found
                    </h3>
                    <p className="text-xs text-[#93A89D] mt-1">
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
              <div className="col-span-12 lg:col-span-5 xl:col-span-5 sticky top-20 h-[calc(100vh-6.5rem)]">
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
            <div className="w-full h-[calc(100vh-12rem)]">
              <PropertyMap properties={filteredProperties} />
            </div>
          )}
        </div>

        {/* MOBILE VIEWPORT (< 768px): Edge-to-Edge Map with Vaul Draggable Sheet */}
        <div className="block md:hidden relative w-full h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-[#22352B]">
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
