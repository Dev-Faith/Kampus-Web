"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Heart,
  Sparkles,
  Compass,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  Zap,
  Droplets,
} from "lucide-react";
import { Property } from "@/types/property";
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
  const { hoveredPropertyId, setHoveredPropertyId, setActiveTab } =
    usePropertyInteractionStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isHovered = hoveredPropertyId === property.id;

  const handleCardClick = () => {
    if (onSelectProperty) {
      onSelectProperty(property);
    } else {
      setIsQuickViewOpen(true);
    }
  };

  const handleMediaBadgeClick = (
    e: React.MouseEvent,
    tab: "staging" | "panorama" | "floorplan"
  ) => {
    e.stopPropagation();
    setActiveTab(tab);
    setIsQuickViewOpen(true);
  };

  const statusBadgeColor =
    property.status === "available"
      ? "bg-emerald-500 text-slate-950"
      : property.status === "occupied"
      ? "bg-rose-500 text-white"
      : "bg-amber-500 text-slate-950";

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
        className={`group relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
          isHovered
            ? "border-emerald-500/80 bg-[#121E18] shadow-[0_12px_36px_rgba(16,185,129,0.18)]"
            : "border-[#22352B] bg-[#0E1A14]/90 hover:border-[#344E40] shadow-lg"
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
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md ${statusBadgeColor}`}
            >
              {property.status}
            </span>

            <span className="rounded-full bg-[#0B130F]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-[#22352B] shadow-md">
              {property.propertyType}
            </span>

            {property.escrowProtected && (
              <span className="rounded-full bg-[#083325]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40 shadow-md flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Escrow</span>
              </span>
            )}
          </div>

          {/* Top Right Action: Favorite */}
          <button
            type="button"
            aria-label="Save to favorites"
            onClick={async (e) => {
              e.stopPropagation();
              const nextFav = !isFavorite;
              setIsFavorite(nextFav);
              if (nextFav) {
                toast.success("Saved to Wishlist", {
                  description: `${property.title} added to your campus shortlist.`,
                });
                await lodgesApi.saveLodge(property.id);
              } else {
                toast.info("Removed from Wishlist", {
                  description: `${property.title} removed from favorites.`,
                });
                await lodgesApi.unsaveLodge(property.id);
              }
            }}
            className={`absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
              isFavorite
                ? "bg-rose-500 text-white"
                : "bg-black/60 text-white/80 hover:bg-black/80 hover:text-white hover:scale-110 active:scale-95"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
          </button>

          {/* Quick Media Capability Badges (Bottom Left on Carousel) */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
            {property.virtualStaging && (
              <button
                type="button"
                onClick={(e) => handleMediaBadgeClick(e, "staging")}
                className="flex items-center gap-1 rounded-full bg-[#0B130F]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-sm"
              >
                <Sparkles className="h-3 w-3" />
                <span>Staging</span>
              </button>
            )}

            {property.panorama && (
              <button
                type="button"
                onClick={(e) => handleMediaBadgeClick(e, "panorama")}
                className="flex items-center gap-1 rounded-full bg-[#0B130F]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-colors shadow-sm"
              >
                <Compass className="h-3 w-3" />
                <span>360° Tour</span>
              </button>
            )}

            {property.floorPlan && (
              <button
                type="button"
                onClick={(e) => handleMediaBadgeClick(e, "floorplan")}
                className="flex items-center gap-1 rounded-full bg-[#0B130F]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-sm"
              >
                <Layers className="h-3 w-3" />
                <span>Layout</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Body Details */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Campus Proximity Banner */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span>{property.distanceToCampus}</span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums">
                {property.currency}
                {property.price.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#93A89D]">
                / session
              </span>
            </div>

            {/* Title & Neighborhood */}
            <h3 className="text-base font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors line-clamp-1">
              {property.title}
            </h3>

            <p className="text-xs text-[#93A89D] flex items-center gap-1 mt-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                {property.address.street}, {property.address.neighborhood}
              </span>
            </p>
          </div>

          {/* Student Amenities: Power & Water */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#93A89D] border-t border-[#22352B] pt-2.5">
            <span className="flex items-center gap-1 text-slate-300">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="truncate max-w-[130px]">{property.powerSchedule}</span>
            </span>
            <span className="text-[#344E40]">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Droplets className="h-3.5 w-3.5 text-cyan-400" />
              <span className="truncate max-w-[110px]">{property.waterSupply}</span>
            </span>
          </div>

          {/* Quick-View Action Callout & Host Badge */}
          <div className="pt-1 flex items-center justify-between text-xs text-[#93A89D]">
            <span className="text-[11px] text-[#93A89D] truncate">
              Host: {property.host.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex items-center gap-1 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
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
