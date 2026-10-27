"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { CAMPUS_AREA_OPTIONS } from "@/lib/constants/campus-areas";

const CAMPUS_AREAS = [
  {
    id: "gidankwano-campus",
    name: "Gidankwano Campus",
    areas: ["gidankwano", "gidanpainti", "gidanmangoro", "dama"],
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "bosso",
    name: "Bosso Campus",
    areas: ["bosso_front", "bosso_back"],
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  },
];

export function MinnaNeighborhoods() {
  return (
    <section className="landing-neighborhoods space-y-6" aria-labelledby="campus-areas-title">
      <div className="landing-neighborhoods__header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="landing-eyebrow">Currently serving FUTMINNA</p>
          <h2
            id="campus-areas-title"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Browse by campus area.
          </h2>
          <p className="landing-section-heading__aside mt-2 max-w-2xl">
            Search accommodation around the Gidankwano and Bosso campuses.
          </p>
        </div>

        <Link href="/explore?campus=FUTMINNA">
          <span className="landing-text-link">
            View FUTMINNA listings <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <div className="landing-neighborhoods__grid grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CAMPUS_AREAS.map((campusArea) => (
          <motion.div
            key={campusArea.id}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="landing-neighborhoods__card relative min-h-[300px] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#22352B] bg-slate-900 dark:bg-[#121E18] flex flex-col justify-end p-5 shadow-xl"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={campusArea.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="landing-neighborhoods__shade absolute inset-0" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <MapPin className="h-4 w-4" />
                <span>FUTMINNA</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{campusArea.name}</h3>
                <p className="mt-1 text-sm text-[#C4D5CC]">
                  Areas currently covered around this campus
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {campusArea.areas.map((areaCode) => {
                  const area = CAMPUS_AREA_OPTIONS.find((option) => option.id === areaCode);
                  if (!area) return null;
                  return (
                    <Link
                      key={area.id}
                      href={`/explore?campus=FUTMINNA&area=${area.id}`}
                      aria-label={`Search accommodation in ${area.label}`}
                      className="rounded-full border border-white/25 bg-[#0B130F]/75 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-emerald-300 hover:bg-emerald-900/80"
                    >
                      {area.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
