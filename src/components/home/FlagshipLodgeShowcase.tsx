"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ShieldCheck, CheckCircle2, MapPin, Sparkles, Calendar, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlagshipProperty {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  neighborhood: string;
  badgeTag: string;
  certification: string;
  priceDisplay: string;
  completionDate: string;
  status: string;
  image: string;
  amenities: string[];
}

const FLAGSHIP_PROPERTIES: FlagshipProperty[] = [
  {
    id: "horizon-towers",
    name: "HORIZON TOWERS",
    subtitle: "Commercial / Premium / Urban",
    category: "Executive En-Suite / Lofts",
    neighborhood: "Bosso Campus Hub",
    badgeTag: "BOSSO GATEWAY",
    certification: "Platinum Certified",
    priceDisplay: "₦280,000 — ₦450,000",
    completionDate: "Immediate Move-in (Q3 2026)",
    status: "Verified & Move-in Ready",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
    amenities: ["24/7 Solar Inverter", "Biometric Access", "Dedicated Sub-Meter", "Borehole Filtration"],
  },
  {
    id: "cedar-court",
    name: "CEDAR COURT SUITES",
    subtitle: "Executive / Studio / Solar",
    category: "Hybrid Solar Studio",
    neighborhood: "Gidan Kwano Main Gate",
    badgeTag: "GIDAN KWANO",
    certification: "Escrow Gold Verified",
    priceDisplay: "₦250,000 — ₦380,000",
    completionDate: "Session 2026/2027",
    status: "Inspected & Available",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
    amenities: ["Rooftop Solar Array", "Granite Kitchen", "Fenced Security", "Walking Distance to SEET"],
  },
  {
    id: "apex-pavilion",
    name: "APEX ROYAL PAVILION",
    subtitle: "En-Suite / Self-Con / Quiet",
    category: "Premium Self-Con Lofts",
    neighborhood: "Campus Gate Avenue",
    badgeTag: "SEET COMPLEX",
    certification: "Move-In Guaranteed",
    priceDisplay: "₦220,000 — ₦320,000",
    completionDate: "Immediate Handover",
    status: "Pre-sales Open",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    amenities: ["Overhead 5,000L Tank", "Ceramic Tile Floors", "Night Security Patrol", "Prepaid Meter"],
  },
];

export function FlagshipLodgeShowcase() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = FLAGSHIP_PROPERTIES[selectedIdx];

  return (
    <section className="relative w-full space-y-8 sm:space-y-12">
      {/* 1. Header with Massive Architectural Title (Image 4 Signature) */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-4 border-b border-slate-200/80 dark:border-[#22352B]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">
            03 / FLAGSHIP ACCOMMODATIONS
          </span>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-[-0.03em] uppercase leading-none">
            {current.name}
          </h2>
          <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-[#93A89D] mt-2 uppercase tracking-widest">
            {current.subtitle}
          </p>
        </div>

        {/* Interactive Property Switcher Pills with Framer Motion layoutId */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-[#121E18] border border-slate-200 dark:border-[#22352B] overflow-x-auto">
          {FLAGSHIP_PROPERTIES.map((prop, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer shrink-0 ${
                  isSelected ? "text-white dark:text-slate-950 font-bold" : "text-slate-600 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="flagship-tab-indicator"
                    className="absolute inset-0 rounded-full bg-slate-900 dark:bg-emerald-400 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className="opacity-60 text-[10px]">0{idx + 1}</span>
                  <span>{prop.name.split(" ")[0]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Split Card Showcase (Image 4 Architectural Frame + Spec Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Column: Crisp Architectural Render / Photo with Rounded Aesthetic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-200/60 dark:border-[#22352B] shadow-xl group"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={current.image}
                alt={current.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Floating Location Badge on the image */}
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-lg">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span>{current.neighborhood}</span>
          </div>
        </motion.div>

        {/* Right Column: Floating Modern Spec Card (Image 4 Signature Right Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white dark:bg-[#121E18] border border-slate-200/80 dark:border-[#22352B] shadow-xl space-y-6"
        >
          {/* Top Tags & Subhead */}
          <div className="space-y-4">
            {/* Pill Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-[#17261F] text-slate-800 dark:text-[#93A89D] text-[11px] font-mono uppercase font-bold tracking-wider border border-slate-200 dark:border-[#22352B]">
                {current.badgeTag}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono uppercase font-bold tracking-wider border border-emerald-600/30">
                {current.certification}
              </span>
            </div>

            {/* Spec Subhead */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {current.name}™
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#93A89D] font-mono mt-0.5">
                {current.category}
              </p>
            </div>
          </div>

          {/* Stat Cards Stack (Image 4 Replica) */}
          <div className="space-y-3">
            {/* 1. Vibrant Orange/Terracotta Price Card (Image 4 Signature) */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl sm:rounded-3xl bg-[#EA580C] dark:bg-[#C2410C] text-white p-5 shadow-lg flex flex-col justify-between min-h-[90px]"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/90">
                Session Price Range
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {current.priceDisplay}
              </div>
            </motion.div>

            {/* 2. Completion / Move-in Date Box */}
            <div className="rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-[#17261F] border border-slate-200/80 dark:border-[#22352B] p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#586B61]">
                Completion / Move-in Handover
              </span>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{current.completionDate}</span>
              </div>
            </div>

            {/* 3. Inspection Status Box */}
            <div className="rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-[#17261F] border border-slate-200/80 dark:border-[#22352B] p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#586B61]">
                Kampus Inspection Status
              </span>
              <div className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{current.status}</span>
              </div>
            </div>
          </div>

          {/* Action Pill / Link */}
          <div className="pt-2">
            <Link href="/explore">
              <Button className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                <span>View Full Architectural Specs & Tour</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
