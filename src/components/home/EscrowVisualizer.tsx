"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Key,
  CheckCircle2,
  Lock,
  Eye,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Building,
} from "lucide-react";

interface EscrowStep {
  step: number;
  title: string;
  subtitle: string;
  headline: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  accentColor: string;
}

const ESCROW_STEPS: EscrowStep[] = [
  {
    step: 1,
    title: "1. Book & Confirm Payment",
    subtitle: "Payment Status Tracking",
    headline: "See Your Booking Payment Status in Kampus",
    description:
      "After the payment provider confirms a charge, Kampus records the payment against your booking. How funds are held and settled depends on the provider's arrangement.",
    badge: "Payment Recorded",
    icon: Lock,
    accentColor: "emerald",
  },
  {
    step: 2,
    title: "2. Physical Move-in Inspection",
    subtitle: "Verify Room on Arrival",
    headline: "Inspect Before Sharing Your Code",
    description:
      "Check the room, utilities, and keys before sharing your inspection code with the host. Your booking shows its inspection deadline. If something is wrong, open a dispute for Kampus support to review before the payout decision.",
    badge: "Student Inspection Protection",
    icon: Eye,
    accentColor: "gold",
  },
  {
    step: 3,
    title: "3. Confirmed Key Handover",
    subtitle: "Inspection Approval",
    headline: "Inspection Approval Queues Payout Processing",
    description:
      "After you receive your keys, share the code with the host. Their verification records the inspection and marks the booking ready for payout processing. The booking page shows its current payment and dispute status.",
    badge: "Inspection Status Recorded",
    icon: Key,
    accentColor: "emerald",
  },
];

export function EscrowVisualizer() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = ESCROW_STEPS[activeStepIndex];
  const IconComponent = activeStep.icon;

  return (
    <div className="w-full rounded-3xl border border-slate-200 dark:border-emerald-950/60 bg-gradient-to-b from-white to-slate-50 dark:from-[#121E18] dark:to-[#0B130F] p-6 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
      {/* Background Subtle Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-[#22352B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Payment & Inspection Tracking
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            How Kampus Tracks Your Booking
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] mt-1 max-w-xl">
            Review payment, inspection, and dispute status for your student accommodation in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-[#083325]/80 border border-emerald-600/20 dark:border-emerald-500/30 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300 shrink-0 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">Payment Status Tracking</span>
        </div>
      </div>

      {/* 3 Step Selector Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
        {ESCROW_STEPS.map((s, idx) => {
          const isSelected = activeStepIndex === idx;
          const StepIcon = s.icon;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStepIndex(idx)}
              className={`relative flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-emerald-50/70 dark:bg-[#17261F] border-2 border-emerald-600 dark:border-emerald-500 shadow-sm dark:shadow-[0_0_24px_rgba(16,185,129,0.18)]"
                  : "bg-white dark:bg-[#0B130F]/60 border border-slate-200 dark:border-[#22352B] hover:border-slate-300 dark:hover:border-[#344E40] opacity-80 hover:opacity-100"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold"
                    : "bg-slate-100 dark:bg-[#121E18] text-slate-500 dark:text-[#93A89D] border border-slate-200 dark:border-[#22352B]"
                }`}
              >
                <StepIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Step 0{s.step}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {s.subtitle}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Explainer Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0E1A14]/90 p-6 sm:p-8 shadow-sm dark:shadow-none"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 dark:border-emerald-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{activeStep.badge}</span>
              </div>

              <h4 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeStep.headline}
              </h4>

              <p className="text-sm leading-relaxed text-slate-600 dark:text-[#93A89D] max-w-2xl">
                {activeStep.description}
              </p>
            </div>

            {/* Visual Security Box */}
            <div className="w-full lg:w-72 shrink-0 rounded-2xl bg-slate-50 dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] p-5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#93A89D]">
                <span>Booking Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>

              <div className="space-y-2 border-t border-slate-200 dark:border-[#17261F] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-[#93A89D]">Inspection Window</span>
                  <span className="font-bold text-slate-900 dark:text-white">Your booking deadline</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-[#93A89D]">Fraud Protection</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Support Review</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-[#93A89D]">Payout Method</span>
                  <span className="font-bold text-slate-900 dark:text-white">Provider dependent</span>
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-[#121E18] p-3 text-[11px] text-slate-600 dark:text-[#93A89D] flex items-start gap-2 border border-slate-200 dark:border-[#22352B]">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Regulated under NDPR Data Privacy & Nigerian Banking Security Standards.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
