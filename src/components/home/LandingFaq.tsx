"use client";

import React, { useState } from "react";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How long do I have to inspect?",
    answer: "You have 3 calendar days from your move-in date. After that deadline, you can buy a one-day extension for ₦1,000, up to four times (₦4,000 total). The maximum is 7 calendar days. If you have not inspected by then, Kampus reviews the booking and keeps landlord payout paused.",
  },
  {
    question: "How do payment and move-in inspection work on Kampus?",
    answer:
      "After the payment provider confirms your charge, Kampus records it against your booking and shows an inspection code and deadline. Inspect the room and collect your keys before sharing the code with the host. Code verification records inspection approval and queues payout processing. Kampus manages the payment and landlord payout. Flutterwave is the payment processor, not an escrow agent.",
  },
  {
    question: "What happens if the room does not match the photos or has broken amenities?",
    answer:
      "Your booking shows its inspection deadline. If the room has a problem, open a dispute from your dashboard so Kampus can review it before payout processing. Any approved refund is sent to the payment provider for processing; completion time depends on the provider.",
  },
  {
    question: "How does the move-in inspection code work?",
    answer:
      "Kampus displays a unique inspection code in your booking after payment is confirmed. Share it with the host only after inspecting the room and receiving the keys. The host enters the code to record inspection approval and queue payout processing.",
  },
  {
    question: "Do I have to pay any agent or inspection fee before seeing a lodge?",
    answer:
      "Never. Kampus strictly bans viewing/inspection fees. All listings feature high-resolution photos, 360° virtual tours, and verified physical details for free. You can view as many lodges as you want without paying a single kobo.",
  },
  {
    question: "How does roommate matching work for flatshares in Minna?",
    answer:
      "You can filter potential roommates by FUTMINNA department, academic level, sleeping habits, study preferences, and budget. Once you connect and both agree on a 2-bedroom flat, you can coordinate rent payments between yourselves.",
  },
  {
    question: "Can parents pay directly on behalf of their children?",
    answer:
      "Yes. Parents or guardians can complete the reservation payment using direct bank transfer, USSD, debit card, or mobile banking via our secure Flutterwave gateway while the student manages the physical key inspection.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reducedMotion = useReducedMotion();

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="landing-faq" className="landing-faq" aria-labelledby="landing-faq-title">
      <div className="landing-faq__heading">
        <p className="landing-eyebrow"><HelpCircle aria-hidden="true" /> A few things worth knowing</p>
        <h2 id="landing-faq-title">Good questions. Clear answers.</h2>
        <p>
          Clear answers about payment status, move-in codes, and booking student housing in Minna.
        </p>
      </div>

      <div className="landing-faq__list">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={faq.question} className="landing-faq__item" data-open={isOpen}>
              <h3>
              <button
                type="button"
                id={`faq-question-${idx}`}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                onClick={() => toggleFaq(idx)}
                className="landing-faq__question"
              >
                <span>{faq.question}</span>
                <span className="landing-faq__toggle" aria-hidden="true">{isOpen ? <Minus /> : <Plus />}</span>
              </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="landing-faq__answer">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
