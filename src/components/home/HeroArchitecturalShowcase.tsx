"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Building2, GraduationCap, MapPin, Search } from "lucide-react";
import { CAMPUSES } from "@/lib/constants/campuses";

const ROOM_TYPES = [
  { id: "all", label: "Any room type" },
  { id: "self-con", label: "Self-con" },
  { id: "single-room", label: "Single room" },
  { id: "flatshare", label: "Flatshare" },
  { id: "studio", label: "Studio" },
];

const BUDGET_RANGES = [
  { label: "Any budget", max: 10_000_000 },
  { label: "Under 300k", max: 300_000 },
  { label: "300k - 500k", max: 500_000 },
  { label: "500k+", max: 10_000_000 },
];

export function HeroArchitecturalShowcase() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [selectedCampus, setSelectedCampus] = useState("FUTMINNA");
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [selectedBudgetIdx, setSelectedBudgetIdx] = useState(0);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (selectedCampus && selectedCampus !== "ALL") params.set("q", selectedCampus);
    if (selectedRoomType !== "all") params.set("type", selectedRoomType);

    const budget = BUDGET_RANGES[selectedBudgetIdx];
    if (budget.max < 10_000_000) params.set("maxPrice", budget.max.toString());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero__intro">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="landing-eyebrow">
            <span className="landing-eyebrow__dot" />
            Student housing in Minna
          </p>
          <h1 id="landing-title">
            Find a place.
            <br />
            Feel at <span>home.</span>
          </h1>
        </motion.div>

        <motion.div
          className="landing-hero__aside"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <p>
            Room to study, space to grow, and a safer way to find your next home near FUTMINNA.
          </p>
          <Link href="#escrow" className="landing-text-link">
            See how rent stays protected <ArrowRight aria-hidden="true" />
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="landing-hero__image"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2200&q=88"
          alt="Contemporary apartment building in a leafy residential neighborhood"
          fill
          preload
          sizes="(max-width: 900px) 100vw, 90vw"
          className="landing-hero__photo"
        />
        <div className="landing-hero__image-shade" />
        <Link href="/explore?q=Gidan+Kwano" className="landing-hero__location">
          <span className="landing-hero__location-mark"><MapPin aria-hidden="true" /></span>
          <span><strong>Find your corner of Minna</strong><small>Gidan Kwano / Bosso / Maikunkele</small></span>
          <span className="landing-hero__location-arrow"><ArrowRight aria-hidden="true" /></span>
        </Link>
        <span className="landing-hero__image-caption">A better start begins with a place of your own.</span>
      </motion.div>

      <form className="landing-search" onSubmit={handleSearch}>
        <label className="landing-search__field">
          <span className="landing-search__icon"><GraduationCap aria-hidden="true" /></span>
          <span className="landing-search__copy">
            <span className="landing-search__label">Campus</span>
            <select value={selectedCampus} onChange={(event) => setSelectedCampus(event.target.value)}>
              {CAMPUSES.map((campus) => (
                <option key={campus.code} value={campus.code} disabled={!campus.isActive}>
                  {campus.fullName}{campus.isActive ? "" : " (Coming soon)"}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="landing-search__field">
          <span className="landing-search__icon"><Building2 aria-hidden="true" /></span>
          <span className="landing-search__copy">
            <span className="landing-search__label">Room type</span>
            <select value={selectedRoomType} onChange={(event) => setSelectedRoomType(event.target.value)}>
              {ROOM_TYPES.map((roomType) => <option key={roomType.id} value={roomType.id}>{roomType.label}</option>)}
            </select>
          </span>
        </label>

        <label className="landing-search__field">
          <span className="landing-search__copy">
            <span className="landing-search__label">Budget per session</span>
            <select value={selectedBudgetIdx} onChange={(event) => setSelectedBudgetIdx(Number(event.target.value))}>
              {BUDGET_RANGES.map((budget, index) => <option key={budget.label} value={index}>{budget.label}</option>)}
            </select>
          </span>
        </label>

        <button className="landing-search__submit" type="submit">
          <Search aria-hidden="true" />
          <span>Find a room</span>
          <ArrowRight aria-hidden="true" />
        </button>
      </form>

      <div className="landing-hero__footnote">
        <span>Homes around the places that matter</span>
        <span>FUTMINNA / Minna, Nigeria</span>
      </div>
    </section>
  );
}
