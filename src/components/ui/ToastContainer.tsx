"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  X,
} from "lucide-react";
import { useToastStore, ToastItem } from "@/lib/stores/useToastStore";

function ToastNotification({ toast }: { toast: ToastItem }) {
  const { dismissToast } = useToastStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismissToast]);

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      bgColor: "bg-[#121E18]/95",
      borderColor: "border-emerald-500/40",
      glowColor: "shadow-[0_8px_30px_rgba(16,185,129,0.18)]",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-rose-400",
      bgColor: "bg-[#1A1114]/95",
      borderColor: "border-rose-500/40",
      glowColor: "shadow-[0_8px_30px_rgba(244,63,94,0.18)]",
      badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      bgColor: "bg-[#1A1610]/95",
      borderColor: "border-amber-500/40",
      glowColor: "shadow-[0_8px_30px_rgba(245,158,11,0.18)]",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    info: {
      icon: Sparkles,
      iconColor: "text-cyan-400",
      bgColor: "bg-[#10171D]/95",
      borderColor: "border-cyan-500/40",
      glowColor: "shadow-[0_8px_30px_rgba(6,182,212,0.18)]",
      badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
      }}
      className={`pointer-events-auto relative flex w-full sm:max-w-md items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl ${config.bgColor} ${config.borderColor} ${config.glowColor}`}
    >
      {/* Icon with glowing ring */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/5 ${config.iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <h5 className="text-xs font-bold text-white tracking-tight leading-snug">
          {toast.title}
        </h5>
        {toast.description && (
          <p className="mt-0.5 text-[11px] text-[#93A89D] leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              dismissToast(toast.id);
            }}
            className="mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-lg p-1 text-[#93A89D] hover:bg-white/10 hover:text-white transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Subtle Progress Bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] rounded-b-2xl opacity-60 ${
          toast.type === "success"
            ? "bg-emerald-400"
            : toast.type === "error"
            ? "bg-rose-400"
            : toast.type === "warning"
            ? "bg-amber-400"
            : "bg-cyan-400"
        }`}
      />
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <aside
      aria-label="Notifications"
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-[calc(100%-2rem)] sm:w-auto max-w-md flex-col gap-2.5"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastNotification key={item.id} toast={item} />
        ))}
      </AnimatePresence>
    </aside>
  );
}
