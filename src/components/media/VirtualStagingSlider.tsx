"use client";

import React from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider";
import { Sparkles, Layers } from "lucide-react";
import { PropertyVirtualStaging } from "@/types/property";

interface VirtualStagingSliderProps {
  staging: PropertyVirtualStaging;
  className?: string;
}

export function VirtualStagingSlider({
  staging,
  className = "",
}: VirtualStagingSliderProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 ${className}`}>
      {/* Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 border border-white/10 text-xs font-medium text-slate-200 shadow-xl">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        <span>Virtual Staging & Renovation</span>
      </div>

      <div className="relative aspect-[16/10] w-full select-none">
        <ReactCompareSlider
          itemOne={
            <div className="relative h-full w-full">
              <ReactCompareSliderImage
                src={staging.beforeUrl}
                alt={staging.beforeLabel || "Before Staging"}
                style={{ objectFit: "cover" }}
              />
              <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-black/75 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-300 border border-white/10">
                {staging.beforeLabel || "Before (Original Space)"}
              </div>
            </div>
          }
          itemTwo={
            <div className="relative h-full w-full">
              <ReactCompareSliderImage
                src={staging.afterUrl}
                alt={staging.afterLabel || "After Staging"}
                style={{ objectFit: "cover" }}
              />
              <div className="absolute bottom-4 right-4 z-10 rounded-lg bg-emerald-950/80 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                {staging.afterLabel || "After (Virtually Staged)"}
              </div>
            </div>
          }
          handle={
            <ReactCompareSliderHandle
              buttonStyle={{
                backgroundColor: "#0f172a",
                backdropFilter: "blur(8px)",
                border: "2px solid #10b981",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                width: 44,
                height: 44,
              }}
              linesStyle={{
                width: 2,
                backgroundColor: "#10b981",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
              }}
            />
          }
          className="h-full w-full"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-5 py-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-slate-200">{staging.roomName}</span>
        </div>
        <p className="hidden sm:inline">Drag the center slider left and right to compare raw vs styled interior</p>
      </div>
    </div>
  );
}
