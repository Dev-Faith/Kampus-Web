"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  X,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { UserRole } from "@/types/api";

import { toast } from "@/lib/stores/useToastStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export function AuthModal({ isOpen, onClose, defaultRole = "STUDENT" }: AuthModalProps) {
  const { login, sendOtp, verifyOtp, isLoading, error, clearError } = useAuthStore();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");

  // Form states (clean, non-dummy)
  const [phone, setPhone] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFeedbackMsg(null);
    if (!phone) return;

    const res = await sendOtp(phone, role);
    if (res) {
      setOtpSent(true);
      toast.info("Verification Code Dispatched", {
        description: `6-digit SMS OTP sent to ${phone}. Valid for 10 minutes.`,
      });
    } else {
      toast.error("Could Not Send OTP", {
        description: "Please check your phone number and network connectivity.",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFeedbackMsg(null);
    if (!otpCode) return;

    const success = await verifyOtp(phone, otpCode);
    if (success) {
      toast.success("Welcome to Kampus!", {
        description: `Successfully signed in as ${role === "STUDENT" ? "Student" : "Landlord"}.`,
      });
      onClose();
    } else {
      toast.error("Verification Failed", {
        description: "Invalid or expired OTP code. Please check and retry.",
      });
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFeedbackMsg(null);
    if (!emailOrPhone || !password) return;

    const success = await login(emailOrPhone, password, role);
    if (success) {
      toast.success("Welcome Back!", {
        description: `Successfully signed in as ${role === "STUDENT" ? "Student" : "Landlord"}.`,
      });
      onClose();
    } else {
      toast.error("Authentication Failed", {
        description: "Invalid credentials. Please verify your email/phone and password.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#22352B] bg-[#0E1A14] text-[#F2F9F5] shadow-2xl"
      >
        {/* Glow ambient header */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto relative h-12 w-12 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] mb-2">
              <Image
                src="/logo.png"
                alt="Kampus"
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Kampus Secure ID & Escrow</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Sign In to Kampus
            </h2>
            <p className="text-xs text-[#93A89D]">
              Verified university accommodation backed by licensed custodial escrow.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#14231B] border border-[#22352B]">
            <button
              type="button"
              onClick={() => {
                setRole("STUDENT");
                clearError();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "STUDENT"
                  ? "bg-emerald-600 text-slate-950 shadow-md"
                  : "text-[#93A89D] hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("LANDLORD");
                clearError();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "LANDLORD"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-[#93A89D] hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Host / Landlord</span>
            </button>
          </div>

          {/* Method Switcher (OTP vs Password) */}
          <div className="flex border-b border-[#22352B] text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("otp");
                clearError();
              }}
              className={`flex-1 pb-2.5 border-b-2 transition-all ${
                authMethod === "otp"
                  ? "border-emerald-400 text-emerald-400 font-bold"
                  : "border-transparent text-[#93A89D] hover:text-white"
              }`}
            >
              Phone SMS Verification
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("password");
                clearError();
              }}
              className={`flex-1 pb-2.5 border-b-2 transition-all ${
                authMethod === "password"
                  ? "border-emerald-400 text-emerald-400 font-bold"
                  : "border-transparent text-[#93A89D] hover:text-white"
              }`}
            >
              Password Login
            </button>
          </div>

          {/* Real Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Form Content */}
          {authMethod === "otp" ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#93A89D]">
                    Nigerian Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#93A89D]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 812 345 6789"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs placeholder:text-[#93A89D]/50 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#93A89D]">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Change number
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#93A89D]" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-center tracking-widest text-lg font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 4}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#93A89D]">
                  Email or Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#93A89D]" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="student@university.edu.ng"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs placeholder:text-[#93A89D]/50 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#93A89D]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#93A89D]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs placeholder:text-[#93A89D]/50 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailOrPhone || !password}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Sign In to {role === "STUDENT" ? "Student" : "Host"} Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
