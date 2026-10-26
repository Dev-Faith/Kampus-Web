"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { PropertyMedia } from "@/types/property";

interface PropertyCardCarouselProps {
  images: PropertyMedia[];
  title: string;
  className?: string;
  aspectRatio?: string;
}

export function PropertyCardCarousel({
  images = [],
  title,
  className = "",
  aspectRatio = "aspect-[16/10]",
}: PropertyCardCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-[#93A89D] ${aspectRatio} ${className}`}
      >
        <Building2 className="h-10 w-10 text-slate-400 dark:text-[#586B61] mb-2 opacity-50" />
        <span className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Photos Coming Soon</span>
        <span className="text-[10px] text-slate-400 dark:text-[#586B61]">Kampus Verified Lodge</span>
      </div>
    );
  }
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 20,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (emblaApi) emblaApi.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (emblaApi) emblaApi.scrollNext();
    },
    [emblaApi]
  );

  const scrollTo = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div
      className={`group/carousel relative w-full overflow-hidden rounded-xl bg-slate-900 ${aspectRatio} ${className}`}
    >
      {/* Embla Viewport */}
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full touch-pan-y">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative h-full min-w-0 flex-[0_0_100%] select-none overflow-hidden"
            >
              <Image
                src={image.url}
                alt={`${title} - ${image.title || index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={index === 0}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Desktop Hover-only) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={scrollPrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 hover:scale-110 active:scale-95 z-20 shadow-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={scrollNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 hover:scale-110 active:scale-95 z-20 shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center items-center gap-1.5 pointer-events-none">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={(e) => scrollTo(idx, e)}
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                selectedIndex === idx
                  ? "w-5 bg-white shadow-white/40"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
