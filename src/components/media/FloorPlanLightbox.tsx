"use client";

import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Image from "next/image";
import { Maximize2, Layers } from "lucide-react";
import { PropertyFloorPlan, PropertyMedia } from "@/types/property";

interface FloorPlanLightboxProps {
  floorPlan: PropertyFloorPlan;
  galleryImages?: PropertyMedia[];
  className?: string;
}

export function FloorPlanLightbox({
  floorPlan,
  galleryImages = [],
  className = "",
}: FloorPlanLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Combine floor plan as first slide, then property photos
  const slides = [
    {
      src: floorPlan.url,
      title: floorPlan.title,
      description: floorPlan.dimensions,
    },
    ...galleryImages.map((img) => ({
      src: img.url,
      title: img.title,
    })),
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 ${className}`}>
      {/* Interactive Trigger Surface */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setIndex(0);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIndex(0);
            setIsOpen(true);
          }
        }}
        className="group relative aspect-[16/10] w-full cursor-zoom-in overflow-hidden"
      >
        <Image
          src={floorPlan.url}
          alt={floorPlan.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Floating Zoom Callout */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 rounded-full bg-slate-950/90 backdrop-blur-md px-4 py-2 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl">
            <Maximize2 className="h-4 w-4" />
            <span>Click to Zoom Architectural Blueprint</span>
          </div>
        </div>

        {/* Top Blueprint Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 border border-white/10 text-xs font-medium text-slate-200 shadow-xl">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          <span>Architectural Blueprint</span>
        </div>

        {/* Bottom Details */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">{floorPlan.title}</h4>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {floorPlan.dimensions}
            </p>
          </div>
          <span className="rounded-md bg-white/10 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-slate-200 border border-white/10">
            {slides.length} Assets
          </span>
        </div>
      </div>

      {/* Lightbox Modal with Zoom & Thumbnails */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom, Thumbnails, Fullscreen]}
        zoom={{
          maxZoomPixelRatio: 4,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
        }}
        thumbnails={{
          position: "bottom",
          width: 80,
          height: 50,
          gap: 12,
        }}
      />
    </div>
  );
}
