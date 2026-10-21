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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-[#22352B] bg-[#0E1A14] text-[#F2F9F5] shadow-2xl p-6 sm:p-8"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5" />
              <span>Landlord & Host Accreditation</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Register as Property Host
            </h2>
            <p className="text-xs text-[#93A89D] max-w-sm mx-auto">
              Set up your settlement bank details and business profile to list lodges and receive automated escrow disbursements.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Host Full Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#93A89D]">Full Legal Name / Landlord</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Chief John Doe"
                className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white placeholder-[#586B61] focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Email & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[#93A89D]">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="host@properties.ng"
                  className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white placeholder-[#586B61] focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#93A89D]">Business Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Royal Accommodations Ltd"
                  className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white placeholder-[#586B61] focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Payout Bank Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#93A89D] flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-amber-400" />
                <span>Settlement Bank</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white focus:border-amber-400 focus:outline-none"
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b} className="bg-[#0E1A14] text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number & Account Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[#93A89D]">10-Digit Account Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="0123456789"
                  className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white placeholder-[#586B61] focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#93A89D]">Bank Account Name</label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Exact name on bank"
                  className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white placeholder-[#586B61] focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* BVN */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#93A89D]">11-Digit BVN (Identity Verification)</label>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  CBN Encrypted
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                placeholder="22345678901"
                className="w-full rounded-xl bg-[#14231B] border border-[#22352B] px-3.5 py-2.5 text-white placeholder-[#586B61] focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Escrow Payout Guarantee:</span>
            </div>
            <p className="text-slate-300">
              Student rent is held in licensed custodial trust and released directly into this bank account upon room inspection.
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
              className="w-full py-2 text-xs text-[#93A89D] hover:text-white transition-colors text-center"
            >
              Cancel and Return to Student View
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
