"use client";

import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { Eye, RotateCw, ZoomIn, ZoomOut, Maximize2, Compass } from "lucide-react";
import { PropertyPanorama } from "@/types/property";

interface PanoramaViewerProps {
  panorama: PropertyPanorama;
  className?: string;
}

export function PanoramaViewer({
  panorama,
  className = "",
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let viewer: Viewer | null = null;
    try {
      viewer = new Viewer({
        container: containerRef.current,
        panorama: panorama.url,
        caption: `${panorama.title} • ${panorama.room}`,
        loadingTxt: "Loading 360° Spherical Environment...",
        defaultYaw: 0,
        defaultPitch: 0,
        defaultZoomLvl: 50,
        touchmoveTwoFingers: false,
        mousewheelCtrlKey: false,
        navbar: false, // We supply custom luxury HUD controls
      });

      viewerRef.current = viewer;

      viewer.addEventListener("ready", () => {
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Failed to initialize 360 viewer:", err);
      setIsLoading(false);
    }

    return () => {
      if (viewer) {
        try {
          viewer.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
      viewerRef.current = null;
    };
  }, [panorama.url, panorama.title, panorama.room]);

  const toggleAutoRotate = () => {
    if (!viewerRef.current) return;
    // Animate yaw rotation
    const currentPos = viewerRef.current.getPosition();
    if (isRotating) {
      setIsRotating(false);
      viewerRef.current.stopAnimation();
    } else {
      setIsRotating(true);
      viewerRef.current.animate({
        yaw: currentPos.yaw + Math.PI * 2,
        pitch: currentPos.pitch,
        speed: "1rpm",
      });
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    if (!viewerRef.current) return;
    const currentZoom = viewerRef.current.getZoomLevel();
    viewerRef.current.zoom(direction === "in" ? currentZoom + 15 : currentZoom - 15);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 ${className}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-slate-300">
            Rendering 360° Spherical Environment...
          </p>
          <span className="text-xs text-slate-500 mt-1">{panorama.room}</span>
        </div>
      )}

      {/* Top HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 border border-white/10 text-xs font-medium text-slate-200 shadow-xl pointer-events-none">
        <Compass className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
        <span>360° Spherical Tour</span>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400">{panorama.room}</span>
      </div>

      {/* Bottom Floating Control HUD */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md p-1.5 border border-white/10 shadow-2xl">
        <button
          type="button"
          onClick={() => handleZoom("in")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom("out")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleAutoRotate}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            isRotating
              ? "bg-emerald-500 text-slate-950 font-bold"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          title="Auto Rotate 360°"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          title="Fullscreen Mode"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Instruction Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-slate-400 pointer-events-none">
        <Eye className="h-3.5 w-3.5 text-slate-300" />
        <span>Click and drag mouse or touch to look around</span>
      </div>
    </div>
  );
}
