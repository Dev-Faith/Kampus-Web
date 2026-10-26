"use client";

import React from "react";
import Image from "next/image";
import { Star, ShieldCheck, GraduationCap, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  department: string;
  level: string;
  lodge: string;
  avatar: string;
  quote: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    name: "Adebayo Olawale",
    department: "Mechanical Engineering (SEET)",
    level: "400 Level",
    lodge: "Apex Royal En-Suite, Gidan Kwano",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    quote:
      "Saved me ₦10,000 I would have wasted paying roadside agents at Gidan Kwano gate. Found a clean self-con with steady borehole in 20 minutes, and the landlord was verified.",
    rating: 5,
  },
  {
    id: "rev-2",
    name: "Fatima Mohammed",
    department: "Cyber Security Science (SICT)",
    level: "300 Level",
    lodge: "Cedar Court Solar Studio, Gidan Kwano",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    quote:
      "The escrow held my rent until I physically travelled down from Abuja, tested the light and running water, and collected keys. Total peace of mind for both me and my parents.",
    rating: 5,
  },
  {
    id: "rev-3",
    name: "Chinedu Eze",
    department: "Architecture (SAAT)",
    level: "200 Level",
    lodge: "Bosso Horizon Flatshare, Bosso Campus",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    quote:
      "Roommate matching paired me with another architecture coursemate who has the same studio study routine. We split a neat flat off Bosso campus and halved our living costs.",
    rating: 5,
  },
];

export function StudentTestimonials() {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GraduationCap className="h-4 w-4 text-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            FUTMINNA Student Experiences
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Trusted by Students Across Campus
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D]">
          Read how fellow FUTMINNA students secured safe housing without exploitation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl border border-slate-200/90 dark:border-[#22352B] bg-white dark:bg-[#121E18]/80 hover:bg-slate-50 dark:hover:bg-[#15241C] p-6 flex flex-col justify-between transition-all duration-300 shadow-md dark:shadow-xl relative overflow-hidden group"
          >
            <div className="space-y-4">
              {/* Stars & Quote Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-emerald-500/30 group-hover:text-emerald-500/60 transition-colors" />
              </div>

              {/* Quote text */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-[#C4D5CC] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            {/* Author info */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#22352B] flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-full overflow-hidden border border-emerald-500/40 shrink-0">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {t.name}
                  </h4>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  {t.department} • {t.level}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-[#93A89D] truncate">
                  📍 {t.lodge}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
