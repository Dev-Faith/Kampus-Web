"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, KeyRound, MapPinned, ShieldCheck } from "lucide-react";

const BENEFITS = [
  {
    number: "01",
    title: "Know what you're walking into",
    copy: "Every home is checked in person, with the details that make day-to-day student life work.",
    points: ["Water and power", "Real room photos"],
    icon: MapPinned,
    tone: "sand",
  },
  {
    number: "02",
    title: "Inspect before sharing your code",
    copy: "Your booking tracks payment and inspection status. Share your code only after you have the keys.",
    points: ["No viewing fees", "Inspection deadline shown in booking"],
    icon: KeyRound,
    tone: "blue",
  },
  {
    number: "03",
    title: "A home that fits your routine",
    copy: "Choose a quiet study spot, a shared flat, or a room close to your lecture theatres and campus friends.",
    points: ["Near your campus", "Roommate options"],
    icon: ShieldCheck,
    tone: "peach",
  },
];

export function ArchitecturalBentoPurpose() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="about" className="landing-purpose" aria-labelledby="purpose-title">
      <div className="landing-section-heading">
        <div>
          <p className="landing-eyebrow">A more considered way to rent</p>
          <h2 id="purpose-title">Student living, with the details taken care of.</h2>
        </div>
        <p className="landing-section-heading__aside">
          Find the right room with clear information, local support, and a little more peace of mind.
        </p>
      </div>

      <div className="landing-purpose__grid">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.article
              key={benefit.number}
              className={`landing-purpose__card landing-purpose__card--${benefit.tone}`}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="landing-purpose__topline">
                <span>{benefit.number}</span>
                <Icon aria-hidden="true" />
              </div>
              <div className="landing-purpose__content">
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
                <ul>
                  {benefit.points.map((point) => (
                    <li key={point}><Check aria-hidden="true" />{point}</li>
                  ))}
                </ul>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
