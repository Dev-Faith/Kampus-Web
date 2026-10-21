"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Compass, Sparkles, Building, Footprints } from "lucide-react";

interface NeighborhoodCard {
  id: string;
  name: string;
  subTitle: string;
  badge: string;
  walkTime: string;
  startPrice: string;
  queryParam: string;
  bgImage: string;
  description: string;
  highlights: string[];
}

const NEIGHBORHOODS: NeighborhoodCard[] = [
  {
    id: "gidan-kwano",
    name: "Gidan Kwano (Main Campus Gate)",
    subTitle: "Engineering, Agriculture & Sciences Hub",
    badge: "Top Student Pick",
    walkTime: "3 – 8 mins walk",
    startPrice: "₦180k",
    queryParam: "Gidan Kwano",
    bgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    description: "Closest off-campus zone to SEET, SAAT, and SICT lecture theatres. Abundant food markets and campus shuttles.",
    highlights: ["SEET & SAAT Walkable", "24/7 Campus Shuttles", "Student Cafes & Markets"],
  },
  {
    id: "bosso-campus",
    name: "Bosso Town Campus",
    subTitle: "Historic Campus & Commercial Heart",
    badge: "Vibrant Town Life",
    walkTime: "4 – 10 mins walk",
    startPrice: "₦150k",
    queryParam: "Bosso",
    bgImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    description: "Central Minna location. Immediate access to commercial banks, Bosso Market, sports complex, and PG school.",
    highlights: ["Close to Commercial Banks", "Bosso Market Access", "Sports Arena & Gyms"],
  },
  {
    id: "campus-road",
    name: "Campus Road / Maikunkele",
    subTitle: "Quiet Residential Compounds",
    badge: "Spacious & Budget-Friendly",
    walkTime: "5 – 10 mins ride",
    startPrice: "₦135k",
    queryParam: "Maikunkele",
    bgImage: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=800&q=80",
    description: "Serene compounds with larger floor plans, private balconies, and perimeter fencing. Ideal for focused study.",
    highlights: ["Larger Room Sizes", "Quiet Study Atmosphere", "Fenced Compounds"],
  },
  {
    id: "chanchaga",
    name: "Chanchaga Corridor",
    subTitle: "Executive Serviced Accommodations",
    badge: "Premium Living",
    walkTime: "12 mins transit",
    startPrice: "₦250k",
    queryParam: "Chanchaga",
    bgImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    description: "Gated luxury apartments equipped with hybrid solar inverters, dedicated borehole treatment, and security.",
    highlights: ["24/7 Solar Inverter Power", "Treated Water Supply", "Private Security Patrols"],
  },
];

export function MinnaNeighborhoods() {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              FUTMINNA Campus Zones
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore Minna Campus Neighborhoods
          </h2>
          <p className="text-xs sm:text-sm text-[#93A89D] mt-1 max-w-2xl">
            Choose accommodations by proximity to your faculty, lecture theaters, and lifestyle preferences.
          </p>
        </div>

        <Link href="/explore">
          <span className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer">
            View All Minna Zones on Map <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Grid of Neighborhood Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {NEIGHBORHOODS.map((hood, index) => (
          <Link
            key={hood.id}
            href={`/explore?q=${encodeURIComponent(hood.queryParam)}`}
            className="group block"
          >
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative h-[380px] rounded-3xl overflow-hidden border border-[#22352B] bg-[#121E18] flex flex-col justify-end p-5 shadow-xl transition-all duration-300 group-hover:border-emerald-500/70 group-hover:shadow-[0_16px_40px_rgba(16,185,129,0.18)]"
            >
              {/* Image & Gradient Backdrop */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={hood.bgImage}
                  alt={hood.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B130F] via-[#0B130F]/75 to-transparent" />
                <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
              </div>

              {/* Floating Top Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                <span className="rounded-full bg-[#0E4D38]/90 border border-emerald-400/40 px-3 py-1 text-[10px] font-bold text-emerald-300 backdrop-blur-md shadow-md">
                  {hood.badge}
                </span>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                  <Footprints className="h-3.5 w-3.5" />
                  <span>{hood.walkTime}</span>
                </div>

                <h3 className="text-lg font-black text-white leading-tight group-hover:text-emerald-300 transition-colors">
                  {hood.name}
                </h3>

                <p className="text-[11px] text-[#C4D5CC] line-clamp-2 leading-relaxed">
                  {hood.description}
                </p>

                {/* Highlights Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hood.highlights.slice(0, 2).map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-[#0B130F]/80 border border-[#22352B] px-2 py-0.5 text-[9px] font-medium text-[#93A89D]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Price and CTA Footer */}
                <div className="flex items-center justify-between border-t border-[#22352B]/80 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#93A89D] block">Starting from</span>
                    <span className="font-extrabold text-white text-sm">
                      {hood.startPrice}
                      <span className="text-[10px] font-normal text-[#93A89D]"> / session</span>
                    </span>
                  </div>

                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
