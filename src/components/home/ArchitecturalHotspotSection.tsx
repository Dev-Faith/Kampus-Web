"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ShieldCheck, Zap, Sun, Lock, Droplets } from "lucide-react";
import { ArchitecturalNotch } from "@/components/architectural/ArchitecturalNotch";

interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  xPercent: number; // Percentage from left
  yPercent: number; // Percentage from top
  cardPosition: "left" | "right";
  badge: string;
  icon: React.ElementType;
  lodgeId: string;
}

const ARCHITECTURAL_HOTSPOTS: Hotspot[] = [
  {
    id: "orange-tower",
    title: "Orange Crest Tower",
    subtitle: "Bosso Campus Gateway",
    description:
      "The Orange Crest stands as a vibrant architectural landmark with uninterrupted hybrid solar backup, private en-suite study desks, and biometric perimeter access.",
    xPercent: 38,
    yPercent: 62,
    cardPosition: "left",
    badge: "Solar & Inverter",
    icon: Sun,
    lodgeId: "lodge-bosso-01",
  },
  {
    id: "solar-array",
    title: "Hybrid Solar Grid",
    subtitle: "Rooftop 5kVA Solar Inverter",
    description:
      "Zero blackout study nights. High-efficiency monocrystalline solar panels paired with lithium iron phosphate batteries guarantee uninterrupted desk power during exams.",
    xPercent: 68,
    yPercent: 32,
    cardPosition: "right",
    badge: "24/7 Power",
    icon: Zap,
    lodgeId: "lodge-gk-02",
  },
  {
    id: "biometric-security",
    title: "Biometric Access Gate",
    subtitle: "Verified Student Security Post",
    description:
      "24/7 uniformed security wardens, high-definition CCTV coverage of common hallways, and biometric keyless gate controls keeping student communities safe.",
    xPercent: 24,
    yPercent: 78,
    cardPosition: "right",
    badge: "Escrow Inspected",
    icon: Lock,
    lodgeId: "lodge-gk-01",
  },
];

export function ArchitecturalHotspotSection() {
  const [activeHotspotId, setActiveHotspotId] = useState<string>("orange-tower");
  const activeHotspot =
    ARCHITECTURAL_HOTSPOTS.find((h) => h.id === activeHotspotId) ||
    ARCHITECTURAL_HOTSPOTS[0];

  return (
    <section className="relative w-full space-y-8 sm:space-y-12">
      {/* 1. Massive Editorial Headline & Mission Split (Directly from Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
        {/* Left Column: Bold Monumental Typography */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 font-semibold mb-2 block">
            01 / ARCHITECTURAL VERIFICATION
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-[-0.03em] uppercase leading-[0.95]">
            WE BUILD TOMORROW&apos;S <br />
            LIVING TODAY
          </h2>
        </motion.div>

        {/* Right Column: Refined Editorial Mission Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <p className="text-slate-600 dark:text-[#93A89D] text-sm sm:text-base leading-relaxed">
            Kampus transforms university student accommodation with precision, physical inspection,
            and licensed escrow security. We curate sustainable developments that connect student
            communities and protect your rent until move-in day.
          </p>
        </motion.div>
      </div>

      {/* 2. Sculptural Architectural Frame with Interactive Hotspots (Image 2 Signature Frame) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-[460px] sm:h-[560px] lg:h-[640px] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden bg-slate-900 border border-slate-200/50 dark:border-[#22352B] shadow-2xl"
      >
        {/* Architectural Facade Image with dynamic sculpted angles */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=2200&q=85"
            alt="Kampus Sculptural Architecture"
            fill
            sizes="100vw"
            className="object-cover object-center scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />
        </div>

        {/* --- BESPOKE ASYMMETRIC NOTCH CUTOUTS (IMAGE 2 SIGNATURE) --- */}
        {/* Top Notch at ~35% */}
        <ArchitecturalNotch
          position="top"
          className="absolute left-[30%] sm:left-[35%]"
          width={110}
          height={40}
        />
        {/* Bottom Notch at ~14% */}
        <ArchitecturalNotch
          position="bottom"
          className="absolute left-[10%] sm:left-[14%]"
          width={100}
          height={38}
        />

        {/* Interactive Hotspot Selection Pills (Top-Right Micro-Switcher) */}
        <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20">
          {ARCHITECTURAL_HOTSPOTS.map((hotspot) => {
            const isActive = hotspot.id === activeHotspotId;
            return (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => setActiveHotspotId(hotspot.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md font-bold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <hotspot.icon className={`h-3 w-3 ${isActive ? "text-emerald-700" : "text-white/70"}`} />
                <span>{hotspot.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* --- PULSING HOTSPOT BEACONS --- */}
        {ARCHITECTURAL_HOTSPOTS.map((hotspot) => {
          const isActive = hotspot.id === activeHotspotId;
          return (
            <div
              key={hotspot.id}
              style={{
                left: `${hotspot.xPercent}%`,
                top: `${hotspot.yPercent}%`,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={() => setActiveHotspotId(hotspot.id)}
            >
              {/* Beacon Ring 1 */}
              <div
                className={`relative flex items-center justify-center transition-transform duration-300 ${
                  isActive ? "scale-125" : "scale-100 group-hover:scale-110"
                }`}
              >
                {/* Ping wave */}
                <span className="absolute h-9 w-9 rounded-full bg-white/40 animate-ping opacity-75" />

                {/* Outer Glass Ring */}
                <span className="relative h-7 w-7 rounded-full bg-white/30 backdrop-blur-md border border-white flex items-center justify-center shadow-lg">
                  {/* Center Dot */}
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      isActive ? "bg-emerald-400" : "bg-white"
                    }`}
                  />
                </span>
              </div>
            </div>
          );
        })}

        {/* --- DYNAMIC CONNECTED FLOATING GLASS CARD (IMAGE 2 REPLICA) --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              left:
                activeHotspot.cardPosition === "left"
                  ? `${Math.max(8, activeHotspot.xPercent - 16)}%`
                  : `${Math.min(65, activeHotspot.xPercent + 4)}%`,
              top: `${Math.max(30, activeHotspot.yPercent - 8)}%`,
            }}
            className="absolute z-30 w-72 sm:w-84 max-w-[85vw] p-4 sm:p-5 rounded-2xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/25 shadow-2xl text-white select-none pointer-events-auto"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-semibold flex items-center gap-1">
                <activeHotspot.icon className="h-3 w-3 text-emerald-400" />
                {activeHotspot.badge}
              </span>
              <span className="text-[10px] text-white/60 font-mono">
                {activeHotspot.subtitle}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {activeHotspot.title}
            </h4>

            {/* Narrative Description */}
            <p className="mt-1 text-xs text-white/80 leading-relaxed font-normal line-clamp-3">
              {activeHotspot.description}
            </p>

            {/* View More Action Button (Image 2 Signature Pill) */}
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
              <Link href="/explore">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer group"
                >
                  <span>View more</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </Link>
              <span className="text-[10px] text-white/50 font-mono">Verified Infrastructure</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
