"use client";

import React from "react";

interface ArchitecturalNotchProps {
  position?: "top" | "bottom";
  className?: string;
  width?: number;
  height?: number;
}

/**
 * ArchitecturalNotch provides the iconic concave/convex cutout notches
 * seen in haute-couture architectural agency branding (Vertex / Basik / Pentagram).
 * Rendered as an ultra-crisp resolution-independent SVG that matches the page background.
 */
export function ArchitecturalNotch({
  position = "top",
  className = "",
  width = 110,
  height = 42,
}: ArchitecturalNotchProps) {
  const isTop = position === "top";

  return (
    <div
      className={`pointer-events-none select-none z-20 ${
        isTop ? "top-0 -translate-y-px" : "bottom-0 translate-y-px rotate-180"
      } ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 110 42"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full text-background fill-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        {/*
          Smooth curve dipping down from y=0:
          Starts at (0,0), curves down to (14, 14),
          Descends to (14, 28), curves to horizontal bottom at (28, 42),
          Runs horizontally across to (82, 42),
          Curves up to (96, 28), ascends to (96, 14),
          Curves back out to top edge at (110, 0),
          Closes along y=0.
        */}
        <path d="M0,0 C10,0 14,6 14,14 L14,28 C14,36 20,42 28,42 L82,42 C90,42 96,36 96,28 L96,14 C96,6 100,0 110,0 Z" />
      </svg>
    </div>
  );
}

/**
 * Corner cutout fillet for organic asymmetrical architectural frames
 */
export function ArchitecturalCornerNotch({
  corner = "top-left",
  className = "",
  size = 56,
}: {
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  size?: number;
}) {
  const rotations = {
    "top-left": "",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  };

  return (
    <div
      className={`pointer-events-none select-none z-20 ${rotations[corner]} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 56 56"
        fill="none"
        className="w-full h-full text-background fill-current"
      >
        <path d="M0,0 L56,0 C32,0 16,16 16,40 L16,56 L0,56 Z" />
      </svg>
    </div>
  );
}
