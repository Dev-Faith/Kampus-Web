"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Heart, ArrowUpRight } from "lucide-react";
import { Property } from "@/types/property";
import { getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { usePropertyInteractionStore } from "@/lib/stores/usePropertyInteractionStore";
import { PropertyCardCarousel } from "@/components/property/PropertyCardCarousel";
import { PropertyQuickViewDialog } from "@/components/property/PropertyQuickViewDialog";
import { useSavedUnits } from "@/lib/stores/useSavedUnits";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { authError } from "@/lib/auth-errors";
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
  const user = useAuthStore((s) => s.user);
  const [auth, setAuth] = useState(false);
  const saved = useSavedUnits();
  const isFavorite =
    user?.id === saved.owner && Boolean(saved.ids?.includes(property.id));

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
      ? "bg-success text-white dark:bg-success-soft"
      : property.status === "occupied"
        ? "bg-destructive text-white dark:bg-destructive-soft"
        : "bg-warning text-white dark:bg-warning-soft";

  return (
    <>
      <motion.div
        // Responsive copies must animate independently; a shared layoutId lets
        // the hidden mobile card take over and fade out the visible desktop card.
        layout
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
        className={`explore-property-card group relative flex flex-col rounded-[1.35rem] border transition-all duration-300 cursor-pointer overflow-hidden ${
          isHovered
            ? "border-brand bg-card shadow-none"
            : "border-border bg-card hover:border-brand/60 shadow-none"
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
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusBadgeColor}`}
            >
              {property.status === "unknown" ? "Check availability" : property.status}
            </span>

            <span className="rounded-full bg-ink-solid/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white border border-white/20">
              {property.propertyType}
            </span>
          </div>

          {/* Top Right Action: Favorite */}
          <button
            type="button"
            aria-label={isFavorite ? "Remove from saved units" : "Save unit"}
            aria-pressed={isFavorite}
            disabled={Boolean(saved.busy[property.id]) || (user?.role==="STUDENT" && saved.loading)}
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) {
                setAuth(true);
                return;
              }
              try {
                const value = await saved.toggle(property.id);
                toast.success(value ? "Unit saved" : "Unit removed from saved");
              } catch (e) {
                toast.error(authError(e, "Couldn’t update saved units."));
              }
            }}
            className={`absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
              isFavorite
                ? "bg-ink-solid text-white ring-2 ring-brand"
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
              <span className="text-xl sm:text-2xl font-[450] text-foreground tracking-tight tabular-nums">
                {property.currency}
                {property.price.toLocaleString()}
              </span>
              {property.period && (
                <span className="text-xs font-medium text-muted-foreground">
                  / {property.period}
                </span>
              )}
            </div>

            {/* Title & Neighborhood */}
            <h3 className="text-base font-medium text-foreground mt-1 group-hover:text-brand-strong transition-colors line-clamp-1">
              {property.title}
            </h3>

            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-brand-strong shrink-0" />
              <span>
                {[
                  property.building?.name,
                  property.unitLabel,
                  getCampusAreaLabel(property.campusArea),
                  property.address.street,
                  property.address.city,
                  property.address.state,
                ]
                  .filter(Boolean)
                  .join(", ") || "Location not provided"}
              </span>
            </p>
          </div>

          {/* Quick-View Action Callout */}
          <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] text-muted-foreground truncate">
              {property.host?.name
                ? `Listed by ${property.host.name}`
                : property.campus}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex items-center gap-1 text-brand-strong font-medium hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              <span>View Lodge</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Embedded MorphingDialog Quick View */}
      <AuthModal isOpen={auth} onClose={() => setAuth(false)} />
      <PropertyQuickViewDialog
        property={property}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
