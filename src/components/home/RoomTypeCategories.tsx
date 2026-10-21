"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2,
  DoorClosed,
  Users2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface RoomCategory {
  id: string;
  typeQuery: string;
  title: string;
  tagline: string;
  avgPrice: string;
  badge: string;
  icon: React.ElementType;
  amenities: string[];
}

const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "self-con",
    typeQuery: "self-con",
    title: "Self-Con (En-Suite)",
    tagline: "Private bathroom, private kitchenette & dedicated meter",
    avgPrice: "₦200,000 – ₦350,000",
    badge: "Most Popular",
    icon: DoorClosed,
    amenities: [
      "100% Personal Privacy",
      "Private Kitchenette & Sink",
      "En-Suite Toilet & Shower",
      "Dedicated Prepaid Sub-Meter",
    ],
  },
  {
    id: "single-room",
    typeQuery: "single-room",
    title: "Single Room",
    tagline: "Economical private room in a gated student compound",
    avgPrice: "₦120,000 – ₦180,000",
    badge: "Budget Friendly",
    icon: Building2,
    amenities: [
      "Low Annual Cost",
      "Shared Kitchen Facility",
      "Running Borehole Water",
      "Gated Security Perimeter",
    ],
  },
  {
    id: "flatshare",
    typeQuery: "flatshare",
    title: "2-Bed Flatshare",
    tagline: "Share a spacious 2-bedroom flat with a verified roommate",
    avgPrice: "₦150,000 – ₦220,000 / student",
    badge: "Cost Saver",
    icon: Users2,
    amenities: [
      "Separate Private Bedrooms",
      "Shared Parlour & Balcony",
      "Split Utility Bills & Rent",
      "Roommate Match Integrated",
    ],
  },
  {
    id: "studio",
    typeQuery: "studio",
    title: "Executive Studio",
    tagline: "Serviced luxury unit with 24/7 solar inverter backup",
    avgPrice: "₦280,000 – ₦450,000",
    badge: "High Comfort",
    icon: Sparkles,
    amenities: [
      "24/7 Solar Inverter Power",
      "Modern POP Finishing & Tile",
      "Water Heater & Filter",
      "Compound Night Guard",
    ],
  },
];

export function RoomTypeCategories() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Curated Layouts
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Browse by Accommodation Type
          </h2>
          <p className="text-xs sm:text-sm text-[#93A89D] mt-1 max-w-xl">
            Whether you prioritize total privacy, luxury inverter backup, or splitting costs with a coursemate.
          </p>
        </div>

        <Link href="/explore">
          <span className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer">
            Explore All Formats <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ROOM_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/explore?type=${encodeURIComponent(cat.typeQuery)}`}
              className="group block"
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="h-full rounded-3xl border border-[#22352B] bg-[#121E18]/80 hover:bg-[#15241C] p-6 flex flex-col justify-between transition-all duration-300 group-hover:border-emerald-500/70 group-hover:shadow-[0_12px_32px_rgba(16,185,129,0.15)]"
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-[#0B130F] border border-[#22352B] px-3 py-1 text-[10px] font-bold text-emerald-300">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-[#93A89D] mt-1 leading-relaxed">
                    {cat.tagline}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="mt-4 space-y-2 border-t border-[#22352B]/60 pt-4">
                    {cat.amenities.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] text-[#C4D5CC]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and CTA */}
                <div className="mt-6 pt-4 border-t border-[#22352B] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#93A89D] block">Typical range</span>
                    <span className="font-extrabold text-white text-xs sm:text-sm">
                      {cat.avgPrice}
                    </span>
                  </div>

                  <div className="h-7 w-7 rounded-full bg-[#0B130F] border border-[#22352B] text-emerald-400 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
