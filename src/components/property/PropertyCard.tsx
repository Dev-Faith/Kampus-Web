"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { Property } from "@/types/property";
import { getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { usePropertyInteractionStore } from "@/lib/stores/usePropertyInteractionStore";
import { PropertyCardCarousel } from "@/components/property/PropertyCardCarousel";
import { PropertyQuickViewDialog } from "@/components/property/PropertyQuickViewDialog";
import { lodgesApi } from "@/api/lodges";
import { toast } from "@/lib/stores/useToastStore";

interface PropertyCardProps {
  property: Property;
  onSelectProperty?: (property: Property) => void;
}

export function PropertyCard({
  property,
  onSelectProperty,
}: PropertyCardProps) {
  const { hoveredPropertyId, setHoveredPropertyId } =
    usePropertyInteractionStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(Boolean(property.saved));

  const isHovered = hoveredPropertyId === property.id;

  const handleCardClick = () => {
    if (onSelectProperty) {
      onSelectProperty(property);
    } else {
      setIsQuickViewOpen(true);
    }
  };

  const statusBadgeColor =
    property.status === "available"
      ? "bg-[#536c5c] text-white"
      : property.status === "occupied"
      ? "bg-[#8c5448] text-white"
      : "bg-[#9a7743] text-white";

  return (
    <>
      <motion.div
        layout
        layoutId={`property-card-${property.id}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
        whileHover={{ y: -4 }}
        onMouseEnter={() => setHoveredPropertyId(property.id)}
        onMouseLeave={() => setHoveredPropertyId(null)}
        onClick={handleCardClick}
        className={`explore-property-card group relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
          isHovered
            ? "border-[#c45b37] bg-white dark:bg-[#121E18] shadow-none"
            : "border-slate-200/90 dark:border-[#22352B] bg-white dark:bg-[#0E1A14]/90 hover:border-[#c45b37]/60 dark:hover:border-[#c45b37]/60 shadow-none"
        }`}
      >
        {/* Carousel & Media Header */}
        <div className="relative w-full">
          <PropertyCardCarousel
            images={property.images}
            title={property.title}
          />

          {/* Floating Badges (Top Left) */}
          <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-none">
            {/* Opaque Status Pill */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusBadgeColor}`}
            >
              {property.status}
            </span>

            <span className="rounded-full bg-slate-900/80 dark:bg-[#0B130F]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-white/20 dark:border-[#22352B]">
              {property.propertyType}
            </span>
          </div>

          {/* Top Right Action: Favorite */}
          <button
            type="button"
            aria-label="Save to favorites"
            onClick={async (e) => {
              e.stopPropagation();
              const nextFav = !isFavorite;
              const result = nextFav
                ? await lodgesApi.saveLodge(property.id)
                : await lodgesApi.unsaveLodge(property.id);
              if (!result.success) {
                toast.error("Could not update saved lodges", {
                  description: "Please sign in and try again.",
                });
                return;
              }
              setIsFavorite(nextFav);
              toast.success(nextFav ? "Lodge saved" : "Lodge removed", {
                description: nextFav
                  ? `${property.title} was added to your saved lodges.`
                  : `${property.title} was removed from your saved lodges.`,
              });
            }}
            className={`absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
              isFavorite
                ? "bg-rose-500 text-white"
                : "bg-black/60 text-white/80 hover:bg-black/80 hover:text-white hover:scale-110 active:scale-95"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
          </button>

        </div>

        {/* Card Body Details */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Price Row */}
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                {property.currency}
                {property.price.toLocaleString()}
              </span>
              {property.period && <span className="text-xs font-semibold text-slate-500 dark:text-[#93A89D]">/ {property.period}</span>}
            </div>

            {/* Title & Neighborhood */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-[#a94c2e] dark:group-hover:text-[#e08b6a] transition-colors line-clamp-1">
              {property.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-[#93A89D] flex items-center gap-1 mt-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-[#a94c2e] dark:text-[#e08b6a] shrink-0" />
              <span>{[property.building?.name, property.unitLabel, getCampusAreaLabel(property.campusArea), property.address.street, property.address.city, property.address.state].filter(Boolean).join(", ") || "Location not provided"}</span>
            </p>
          </div>

          {/* Quick-View Action Callout */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-[#93A89D]">
            <span className="text-[11px] text-slate-500 dark:text-[#93A89D] truncate">
              {property.host?.name ? `Listed by ${property.host.name}` : property.campus}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex items-center gap-1 text-[#a94c2e] dark:text-[#e08b6a] font-bold hover:text-[#863b25] dark:hover:text-[#f0a181] transition-colors cursor-pointer"
            >
              <span>View Lodge</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Embedded MorphingDialog Quick View */}
      <PropertyQuickViewDialog
        property={property}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
