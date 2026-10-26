"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  MapRef,
} from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import Image from "next/image";
import { Bed, Bath, Maximize, ArrowUpRight, Sparkles } from "lucide-react";
import { Property } from "@/types/property";
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
    e.originalEvent?.stopPropagation();
    setActivePopupProperty(property);
    setSelectedPropertyId(property.id);

    // Pan map smoothly to the selected property
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [
          property.address.coordinates.lng,
          property.address.coordinates.lat,
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
        className={`relative h-full w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 ${className}`}
      >
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{
            longitude: properties[0]?.address.coordinates.lng ?? 6.5463,
            latitude: properties[0]?.address.coordinates.lat ?? 9.5836,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          onMoveEnd={handleMapMoveEnd}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* Interactive Property Markers */}
          {properties.map((property) => {
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
                      ? "scale-105 -translate-y-1 z-40 bg-[#c45b37] text-white border border-white/40"
                      : "bg-slate-900/95 text-white hover:bg-slate-800 hover:scale-105 border border-slate-700/80"
                  }`}
                >
                  <span className="tabular-nums">
                    {formatShortPrice(property.price)}
                  </span>

                  {/* Marker Pin Tail */}
                  <span
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-r border-b ${
                      isHovered || isSelected
                        ? "bg-[#c45b37] border-[#c45b37]"
                        : "bg-slate-900 border-slate-700/80"
                    }`}
                  />
                </button>
              </Marker>
            );
          })}

          {/* Active Property Popup Preview */}
          {activePopupProperty && (
            <Popup
              longitude={activePopupProperty.address.coordinates.lng}
              latitude={activePopupProperty.address.coordinates.lat}
              anchor="top"
              closeButton={true}
              closeOnClick={false}
              onClose={() => setActivePopupProperty(null)}
              className="z-50 [&_.maplibregl-popup-content]:rounded-2xl [&_.maplibregl-popup-content]:bg-slate-900 [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-content]:border [&_.maplibregl-popup-content]:border-slate-800 [&_.maplibregl-popup-content]:shadow-2xl [&_.maplibregl-popup-close-button]:text-white [&_.maplibregl-popup-close-button]:p-2 [&_.maplibregl-popup-tip]:border-b-slate-900"
            >
              <div className="w-64 overflow-hidden rounded-2xl bg-slate-900 text-slate-100">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={activePopupProperty.images[0]?.url || ""}
                    alt={activePopupProperty.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase">
                    {activePopupProperty.propertyType}
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-white tabular-nums">
                      {activePopupProperty.currency}
                      {activePopupProperty.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {activePopupProperty.sqft.toLocaleString()} sqft
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-1">
                    {activePopupProperty.title}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {activePopupProperty.address.neighborhood},{" "}
                    {activePopupProperty.address.city}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-300">
                    <span>{activePopupProperty.bedrooms} Beds</span>
                    <span>•</span>
                    <span>{activePopupProperty.bathrooms} Baths</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickViewProperty(activePopupProperty);
                      }}
                      className="flex items-center gap-0.5 text-emerald-400 font-bold hover:underline"
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
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 border border-white/10 text-xs font-medium text-slate-300 shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>
            {properties.length} Vector Pins Live • Hover card to highlight
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
