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
    title: "1. Student Reserves & Locks Funds",
    subtitle: "Rent in Custodial Trust",
    headline: "Your Rent Never Goes Directly to Unknown Agents",
    description:
      "When you book a verified lodge, your payment is held in a licensed custodial escrow account. The landlord cannot touch a single kobo until you travel to campus, inspect the room, and confirm that the lodge matches the listing.",
    badge: "100% Funds Protected",
    icon: Lock,
    accentColor: "emerald",
  },
  {
    step: 2,
    title: "2. Physical Move-in Inspection",
    subtitle: "Verify Room on Arrival",
    headline: "24-Hour Inspection Guarantee Window",
    description:
      "Arrive at your campus hostel with complete peace of mind. Check the running water, verify the solar inverter or power schedule, test the bathroom fittings, and inspect the room security. If anything is amiss, file a 1-tap dispute for an immediate refund.",
    badge: "Student Inspection Protection",
    icon: Eye,
    accentColor: "gold",
  },
  {
    step: 3,
    title: "3. Confirmed Key Handover & Release",
    subtitle: "You Authorize Payout",
    headline: "Funds Released Only After Satisfied Inspection",
    description:
      "Once you receive your keys and confirm satisfaction via the Kampus web portal, the custodial escrow releases the rent to the verified landlord's verified Nigerian bank account. Zero extortion, zero fake agents, zero disputes.",
    badge: "Secure Settlement",
    icon: Key,
    accentColor: "emerald",
  },
];

export function EscrowVisualizer() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = ESCROW_STEPS[activeStepIndex];
  const IconComponent = activeStep.icon;

  return (
    <div className="w-full rounded-3xl border border-emerald-950/60 bg-gradient-to-b from-[#121E18] to-[#0B130F] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#22352B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Licensed Custodial Escrow Protection
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            How Kampus Protects Your Accommodation Funds
          </h3>
          <p className="text-xs sm:text-sm text-[#93A89D] mt-1 max-w-xl">
            Never pay rent directly into personal accounts. Experience Nigeria&apos;s
            only student housing platform with physical inspection guarantees.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-[#083325]/80 border border-emerald-500/30 px-3.5 py-2 text-xs text-emerald-300 shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">CBN-Licensed Escrow Flow</span>
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
                  ? "bg-[#17261F] border-2 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
                  : "bg-[#0B130F]/60 border border-[#22352B] hover:border-[#344E40] opacity-80 hover:opacity-100"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-[#121E18] text-[#93A89D] border border-[#22352B]"
                }`}
              >
                <StepIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Step 0{s.step}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
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
          className="rounded-2xl border border-[#22352B] bg-[#0E1A14]/90 p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{activeStep.badge}</span>
              </div>

              <h4 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                {activeStep.headline}
              </h4>

              <p className="text-sm leading-relaxed text-[#93A89D] max-w-2xl">
                {activeStep.description}
              </p>
            </div>

            {/* Visual Security Box */}
            <div className="w-full lg:w-72 shrink-0 rounded-2xl bg-[#0B130F] border border-[#22352B] p-5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs text-[#93A89D]">
                <span>Escrow Trust Status</span>
                <span className="font-bold text-emerald-400">Active</span>
              </div>

              <div className="space-y-2 border-t border-[#17261F] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#93A89D]">Inspection Window</span>
                  <span className="font-bold text-white">24 Hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#93A89D]">Fraud Protection</span>
                  <span className="font-bold text-emerald-400">100% Guaranteed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#93A89D]">Payout Method</span>
                  <span className="font-bold text-white">Direct Bank (BVN)</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#121E18] p-3 text-[11px] text-[#93A89D] flex items-start gap-2 border border-[#22352B]">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
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
