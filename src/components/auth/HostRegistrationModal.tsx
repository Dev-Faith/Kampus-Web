"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Building2,
  ShieldCheck,
  Landmark,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { KampusLogo } from "@/components/brand/KampusLogo";

interface HostRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NIGERIAN_BANKS = [
  "Access Bank",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Kuda Bank",
  "OPay",
  "Palmpay",
  "Moniepoint MFB",
  "Stanbic IBTC Bank",
  "Fidelity Bank",
  "FCMB",
  "Sterling Bank",
  "Wema Bank",
];

export function HostRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: HostRegistrationModalProps) {
  const { user, registerAsLandlord, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [businessName, setBusinessName] = useState("");
  const [bankName, setBankName] = useState("Access Bank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bvn, setBvn] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !bankAccountNumber || !bankAccountName || !bvn) return;

    const success = await registerAsLandlord({
      fullName,
      email: email || undefined,
      businessName: businessName || undefined,
      bankName,
      bankAccountNumber,
      bankAccountName,
      bvn,
    });

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="kampus-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kampus-host-title"
        className="kampus-modal relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close host registration"
          className="kampus-modal-close absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Header */}
          <div className="text-center space-y-2">
            <KampusLogo variant="mark" size={44} className="mx-auto mb-2" markClassName="text-slate-900 dark:text-[#f4f1ea]" />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-[#eeece6] px-3 py-1 text-xs font-medium text-slate-700 dark:border-[#303832] dark:bg-[#202722] dark:text-[#c1c8c2]">
              <Building2 className="h-3.5 w-3.5 text-[#c45b37]" />
              <span>Landlord & Host Accreditation</span>
            </div>
            <h2 id="kampus-host-title" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Register as Property Host
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] max-w-sm mx-auto">
              Set up your payout bank details and business profile to list lodges. Transfers depend on the configured payment provider.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Host Full Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-[#93A89D]">Full Legal Name / Landlord</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Chief John Doe"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-[#586B61] focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Email & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-[#93A89D]">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="host@properties.ng"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-[#586B61] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-[#93A89D]">Business Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Royal Accommodations Ltd"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-[#586B61] focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payout Bank Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-[#93A89D] flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-[#c45b37]" />
                <span>Settlement Bank</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b} className="bg-white dark:bg-[#0E1A14] text-slate-900 dark:text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number & Account Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-[#93A89D]">10-Digit Account Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="0123456789"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-[#586B61] focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-[#93A89D]">Bank Account Name</label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Exact name on bank"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-[#586B61] focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* BVN */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-[#93A89D]">11-Digit BVN (Identity Verification)</label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Bank details
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                placeholder="22345678901"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-[#586B61] focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Payout account details:</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              These details are saved for payout setup. Payment custody, eligibility, and settlement timing depend on the configured payment provider.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              disabled={isLoading || !fullName || !bankAccountNumber || !bvn}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Activating Landlord Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Host Registration & Enter Hub</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-500 dark:text-[#93A89D] hover:text-slate-800 dark:hover:text-white transition-colors text-center"
            >
              Cancel and Return to Student View
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
