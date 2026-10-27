"use client";

import React, { useState } from "react";
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
import { KampusLogo } from "@/components/brand/KampusLogo";

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
    <div className="kampus-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kampus-auth-title"
        className="kampus-modal relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close sign in"
          className="kampus-modal-close absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <KampusLogo variant="mark" size={44} className="mx-auto mb-2" markClassName="text-slate-900 dark:text-[#f4f1ea]" />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-[#eeece6] px-3 py-1 text-xs font-medium text-slate-700 dark:border-[#303832] dark:bg-[#202722] dark:text-[#c1c8c2]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#c45b37]" />
              <span>Kampus Secure ID</span>
            </div>
            <h2 id="kampus-auth-title" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Sign In to Kampus
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#93A89D]">
              Find verified university accommodation and manage your booking in Kampus.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B]">
            <button
              type="button"
              onClick={() => {
                setRole("STUDENT");
                clearError();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === "STUDENT"
                  ? "bg-[#c45b37] text-white shadow-none"
                  : "text-slate-600 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white"
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
                  ? "bg-[#c45b37] text-white shadow-none"
                  : "text-slate-600 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Host / Landlord</span>
            </button>
          </div>

          {/* Method Switcher (OTP vs Password) */}
          <div className="flex border-b border-slate-200 dark:border-[#22352B] text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("otp");
                clearError();
              }}
              className={`flex-1 pb-2.5 border-b-2 transition-all ${
                authMethod === "otp"
                  ? "border-[#c45b37] text-[#a94c2e] dark:text-[#e58a69] font-semibold"
                  : "border-transparent text-slate-500 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white"
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
                  ? "border-[#c45b37] text-[#a94c2e] dark:text-[#e58a69] font-semibold"
                  : "border-transparent text-slate-500 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Password Login
            </button>
          </div>

          {/* Real Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Form Content */}
          {authMethod === "otp" ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">
                    Nigerian Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#93A89D]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 812 345 6789"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#93A89D]/50 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isLoading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full" />
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
                    <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Change number
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#93A89D]" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-center tracking-widest text-lg font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 4}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isLoading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full" />
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">
                  Email or Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#93A89D]" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="student@university.edu.ng"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#93A89D]/50 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#93A89D]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-[#93A89D]/50 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailOrPhone || !password}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full" />
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
