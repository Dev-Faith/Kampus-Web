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
    question: "How do payment and move-in inspection work on Kampus?",
    answer:
      "After the payment provider confirms your charge, Kampus records it against your booking and shows an inspection code and deadline. Inspect the room and collect your keys before sharing the code with the host. Code verification records inspection approval and queues payout processing. Fund custody and settlement follow the payment provider's arrangement.",
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
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D]">
          Clear answers about payment status, move-in codes, and booking student housing in Minna.
        </p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-slate-200 dark:divide-[#22352B] rounded-3xl border border-slate-200/90 dark:border-[#22352B] bg-white dark:bg-[#121E18]/80 overflow-hidden shadow-md dark:shadow-xl">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#15241C]"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 leading-snug">
                  {faq.question}
                </span>
                <div
                  className={`h-7 w-7 rounded-full bg-slate-100 dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-emerald-500 text-slate-950 dark:bg-emerald-500 dark:text-slate-950" : ""
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
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed border-t border-slate-200/80 dark:border-[#22352B]/40 pt-3">
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
