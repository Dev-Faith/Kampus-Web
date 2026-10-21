"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does the Kampus Escrow guarantee protect my accommodation rent?",
    answer:
      "When you book an accommodation on Kampus, your rent payment is held securely in a licensed custodial escrow bank trust. The landlord does not receive payout until you physically arrive on campus, inspect the room (light, running water, room condition), and confirm key collection.",
  },
  {
    question: "What happens if the room does not match the photos or has broken amenities?",
    answer:
      "You have a 24-hour Move-In Inspection Window upon physical arrival. If the room is defective, lacks running water, or doesn't match the listing, you can submit a 1-tap dispute through your dashboard. Our Minna inspection team will verify the claim, and if unresolved, your rent is refunded in full.",
  },
  {
    question: "How does the 6-digit move-in inspection code work?",
    answer:
      "When your booking is confirmed, Kampus issues a unique 6-digit verification code to your student portal. You only give this code to the landlord after you have inspected the room and received physical keys. Once the landlord submits your code, the escrow system processes the payment.",
  },
  {
    question: "Do I have to pay any agent or inspection fee before seeing a lodge?",
    answer:
      "Never. Kampus strictly bans viewing/inspection fees. All listings feature high-resolution photos, 360° virtual tours, and verified physical details for free. You can view as many lodges as you want without paying a single kobo.",
  },
  {
    question: "How does roommate matching work for flatshares in Minna?",
    answer:
      "You can filter potential roommates by FUTMINNA department, academic level, sleeping habits, study preferences, and budget. Once you connect and both agree on a 2-bedroom flat, you can split rent payments equally through our escrow split-billing system.",
  },
  {
    question: "Can parents pay directly on behalf of their children?",
    answer:
      "Yes. Parents or guardians can complete the reservation payment using direct bank transfer, USSD, debit card, or mobile banking via our secure Paystack/Flutterwave gateway while the student manages the physical key inspection.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <HelpCircle className="h-4 w-4 text-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Frequently Asked Questions
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-sm text-[#93A89D]">
          Clear answers about escrow protection, move-in codes, and booking student housing in Minna.
        </p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-[#22352B] rounded-3xl border border-[#22352B] bg-[#121E18]/80 overflow-hidden shadow-xl">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#15241C]"
              >
                <span className="text-sm font-bold text-white flex-1 leading-snug">
                  {faq.question}
                </span>
                <div
                  className={`h-7 w-7 rounded-full bg-[#0B130F] border border-[#22352B] text-emerald-400 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-emerald-500 text-slate-950" : ""
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs text-[#93A89D] leading-relaxed border-t border-[#22352B]/40 pt-3">
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
