"use client";

import React, { useState, useRef, useCallback } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  MapRef,
} from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ArrowUpRight } from "lucide-react";
import { Property } from "@/types/property";
import { getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { usePropertyInteractionStore } from "@/lib/stores/usePropertyInteractionStore";
import { PropertyQuickViewDialog } from "@/components/property/PropertyQuickViewDialog";

if (typeof window !== "undefined") {
  try {
    maplibregl.setWorkerUrl(
      `${window.location.origin}/workers/maplibre-gl-worker.mjs`
    );
  } catch {
    maplibregl.setWorkerUrl("/workers/maplibre-gl-worker.mjs");
  }
}

function hasCoordinates(property: Property): property is Property & {
  address: Property["address"] & { coordinates: { lat: number; lng: number } };
} {
  return property.address.coordinates !== null;
}

interface PropertyMapProps {
  properties: Property[];
  className?: string;
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
}

export function PropertyMap({
  properties,
  className = "",
  onBoundsChange,
}: PropertyMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const { resolvedTheme } = useTheme();
  const {
    hoveredPropertyId,
    setHoveredPropertyId,
    selectedPropertyId,
    setSelectedPropertyId,
  } = usePropertyInteractionStore();

  const [activePopupProperty, setActivePopupProperty] =
    useState<Property | null>(null);
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(
    null
  );
  const mappedProperties = properties.filter(hasCoordinates);

  const formatShortPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
    }
    if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    }
    return `₦${price}`;
  };

  const handleMarkerClick = (property: Property, e: any) => {
    const coordinates = property.address.coordinates;
    if (!coordinates) return;
    e.originalEvent?.stopPropagation();
    setActivePopupProperty(property);
    setSelectedPropertyId(property.id);

    // Pan map smoothly to the selected property
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [
          coordinates.lng,
          coordinates.lat,
        ],
        zoom: 13.5,
        duration: 900,
        essential: true,
      });
    }
  };

  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;
    try {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        onBoundsChange([
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ]);
      }
    } catch {
      // Map instance unmounted or not ready
    }
  }, [onBoundsChange]);

  return (
    <>
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl bg-muted border border-border ${className}`}
      >
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{
            longitude: mappedProperties[0]?.address.coordinates.lng ?? 8.6753,
            latitude: mappedProperties[0]?.address.coordinates.lat ?? 9.082,
            zoom: mappedProperties.length ? 13 : 5,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={resolvedTheme === "dark"
            ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
          onMoveEnd={handleMapMoveEnd}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* Interactive Property Markers */}
          {mappedProperties.map((property) => {
            const isHovered = hoveredPropertyId === property.id;
            const isSelected =
              selectedPropertyId === property.id ||
              activePopupProperty?.id === property.id;

            return (
              <Marker
                key={property.id}
                longitude={property.address.coordinates.lng}
                latitude={property.address.coordinates.lat}
                anchor="bottom"
                onClick={(e) => handleMarkerClick(property, e)}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                  className={`group relative flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                    isHovered || isSelected
                      ? "scale-105 -translate-y-1 z-40 bg-brand-strong text-primary-foreground border border-brand-strong"
                      : "bg-card text-foreground hover:bg-muted hover:scale-105 border border-border shadow-sm"
                  }`}
                >
                  <span className="tabular-nums">
                    {formatShortPrice(property.price)}
                  </span>

                  {/* Marker Pin Tail */}
                  <span
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-r border-b ${
                      isHovered || isSelected
                        ? "bg-brand-strong border-brand-strong"
                        : "bg-card border-border"
                    }`}
                  />
                </button>
              </Marker>
            );
          })}

          {/* Active Property Popup Preview */}
          {activePopupProperty?.address.coordinates && (
            <Popup
              longitude={activePopupProperty.address.coordinates.lng}
              latitude={activePopupProperty.address.coordinates.lat}
              anchor="top"
              maxWidth="280px"
              closeButton={true}
              closeOnClick={false}
              onClose={() => setActivePopupProperty(null)}
              className="property-map-popup z-50 [&_.maplibregl-popup-content]:rounded-2xl [&_.maplibregl-popup-content]:bg-card [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-content]:border [&_.maplibregl-popup-content]:border-border [&_.maplibregl-popup-content]:shadow-2xl [&_.maplibregl-popup-close-button]:text-foreground [&_.maplibregl-popup-close-button]:p-2 [&_.maplibregl-popup-tip]:border-b-card"
            >
              <div className="w-64 overflow-hidden rounded-2xl bg-card text-foreground">
                <div className="relative aspect-[16/10] w-full">
                  {activePopupProperty.images[0]?.url ? (
                    <Image src={activePopupProperty.images[0].url} alt={activePopupProperty.title} fill className="object-cover" />
                  ) : <div className="grid h-full place-items-center text-xs text-muted-foreground">No photos</div>}
                  <div className="absolute top-2 left-2 rounded-md bg-card/95 px-2 py-0.5 text-[10px] font-bold text-foreground uppercase">
                    {activePopupProperty.propertyType}
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-semibold text-foreground tabular-nums">
                      {activePopupProperty.currency}
                      {activePopupProperty.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {activePopupProperty.propertyType}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                    {activePopupProperty.title}
                  </h4>

                  <p className="text-[11px] text-muted-foreground line-clamp-1">{[activePopupProperty.building?.name, activePopupProperty.unitLabel, getCampusAreaLabel(activePopupProperty.campusArea), activePopupProperty.address.city, activePopupProperty.address.state].filter(Boolean).join(", ")}</p>

                  <div className="flex items-center justify-between border-t border-border/80 pt-2 text-[11px] text-muted-foreground">
                    <span>{activePopupProperty.numberOfRooms == null ? "Rooms not specified" : `${activePopupProperty.numberOfRooms} rooms`}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickViewProperty(activePopupProperty);
                      }}
                      className="flex items-center gap-0.5 text-brand-strong font-bold hover:underline"
                    >
                      View
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Floating Map Legend / Status Pill */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-card/95 backdrop-blur-md px-3.5 py-1.5 border border-border text-xs font-medium text-muted-foreground shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <span>
            {mappedProperties.length} listings with map coordinates
          </span>
        </div>
      </div>

      {/* Quick View Dialog for Popup clicks */}
      {quickViewProperty && (
        <PropertyQuickViewDialog
          property={quickViewProperty}
          isOpen={!!quickViewProperty}
          onClose={() => setQuickViewProperty(null)}
        />
      )}
    </>
  );
}
