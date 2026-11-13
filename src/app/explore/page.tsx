"use client";

import React, { Suspense } from "react";
import { ExtraFilters } from "@/components/property/ExtraFilters";
import { Pager, type ApiPage } from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import type { BackendLodge } from "@/types/api";
import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "motion/react";
import { Inbox, Loader2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyFilterBar } from "@/components/property/PropertyFilterBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyMap } from "@/components/map/PropertyMap";
import { MobileListingDrawer } from "@/components/property/MobileListingDrawer";
import { backendLodgeToProperty } from "@/api/lodges";
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
  const [view] = useQueryState("view", { defaultValue: "grid" });
  const [sort] = useQueryState("sort", { defaultValue: "featured" });

  const [pageValue, setPage] = useQueryState("page", { defaultValue: "1" });
  const page = Math.max(1, Number.parseInt(pageValue, 10) || 1);
  const [amenities] = useQueryState("amenities", { defaultValue: "" });
  const [distance] = useQueryState("distance", { defaultValue: "" });
  const params = new URLSearchParams({ page: String(page), pageSize: "12" });
  if (type !== "all") params.set("category", type);
  if (minPrice > 0) params.set("minPrice", String(minPrice));
  if (maxPrice < 10000000) params.set("maxPrice", String(maxPrice));
  if (campus !== "all") params.set("university", campus);
  if (area !== "all") params.set("area", area);
  if (q.trim()) params.set("search", q.trim());
  if (amenities) params.set("amenities", amenities);
  if (distance) params.set("distance", distance);
  params.set(
    "sortBy",
    ["price_asc", "price_desc", "rating"].includes(sort) ? sort : "new",
  );
  const { data, error, reload } = useApiResource<ApiPage<BackendLodge>>(
    "/lodges?" + params,
  );
  const filteredProperties = (data?.items || []).map(backendLodgeToProperty);
  const isFetching = !data && !error,
    hasFetchError = !!error;

  return (
    <div className="editorial-page explore-page min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />

      <main className="explore-main flex-1">
        <header className="explore-intro">
          <p className="editorial-eyebrow text-xs font-semibold uppercase tracking-widest text-brand-strong">
            FUTMINNA / Find your next home
          </p>
          <h1 className="editorial-title">A place that feels like you.</h1>
          <p>
            Explore rooms and flats around Gidankwano and Bosso. Find the space,
            neighbourhood, and budget that fit your student life.
          </p>
        </header>
        {/* Filter and Query Control Bar */}
        <div className="w-full">
          <PropertyFilterBar />
          <div className="mt-4">
            <ExtraFilters />
          </div>
        </div>

        {/* Results Counter & Live Indicator */}
        <div className="explore-summary flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground">
              {data?.pagination.total ?? 0} listings
            </span>
            <span>from the selected search</span>
            {campus !== "all" && (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 font-bold text-brand-strong border border-brand/25">
                {campus}
              </span>
            )}
            {type !== "all" && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground border border-border capitalize">
                {getAccommodationTypeLabel(type)}
              </span>
            )}
            {area !== "all" && (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-medium text-foreground capitalize">
                {CAMPUS_AREA_OPTIONS.find((option) => option.id === area)
                  ?.label ?? area}
              </span>
            )}

            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-strong" />
            )}
          </div>

          <div className="flex items-center gap-2 text-brand-strong font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Move-in Inspection Code</span>
          </div>
        </div>

        {hasFetchError ? (
          <div
            role="alert"
            className="my-8 rounded-2xl border border-destructive/25 bg-destructive-soft p-8 text-center"
          >
            <h3 className="text-base font-bold text-foreground">
              Listings couldn’t be loaded
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Please try again. This is a loading problem, not an empty search
              result.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Try again
            </button>
          </div>
        ) : isFetching ? (
          <div
            role="status"
            className="my-8 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin text-brand-strong" />
            Loading listings…
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="my-8 rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground">
              No matching student lodges found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
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
            {view === "map" ? (
              <div className="explore-mobile-map block md:hidden relative w-full h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-border">
                <PropertyMap properties={filteredProperties} />
                <MobileListingDrawer properties={filteredProperties} />
              </div>
            ) : (
              <div className="grid gap-5 md:hidden">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </>
        )}
        {data && !error && data.pagination.total > 0 && (
          <Pager
            page={page}
            total={data.pagination.total}
            onChange={(n) => void setPage(String(n))}
          />
        )}
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand-strong" />
            <span className="text-sm font-semibold tracking-wide text-foreground">
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
