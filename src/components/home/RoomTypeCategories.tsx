"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Building2, DoorClosed, Sparkles, Users2 } from "lucide-react";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/constants/accommodation-types";
import type { AccommodationType } from "@/lib/constants/accommodation-types";

const CATEGORY_ICONS: Record<AccommodationType, React.ElementType> = {
  single_room_shared: DoorClosed,
  self_contained: Building2,
  one_bedroom_flat: Users2,
  two_bedroom_flat: Sparkles,
};

export function RoomTypeCategories() {
  return (
    <section className="space-y-6" aria-labelledby="room-types-title">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              FUTMINNA accommodation
            </span>
          </div>
          <h2 id="room-types-title" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Browse by unit type
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] mt-1 max-w-xl">
            Choose the kind of room or flat you want to rent.
          </p>
        </div>

        <Link href="/explore">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5">
            Explore all listings <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ACCOMMODATION_TYPE_OPTIONS.map((type) => {
          const Icon = CATEGORY_ICONS[type.id];
          return (
            <Link
              key={type.id}
              href={`/explore?type=${encodeURIComponent(type.id)}`}
              className="group block"
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="h-full min-h-52 rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18]/80 hover:bg-slate-50 dark:hover:bg-[#15241C] p-6 flex flex-col justify-between transition-colors shadow-sm dark:shadow-xl group-hover:border-emerald-500/70"
              >
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {type.label}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Browse listings <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
