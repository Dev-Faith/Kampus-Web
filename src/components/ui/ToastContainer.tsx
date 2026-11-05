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
      iconColor: "text-success ",
      bgColor: "bg-card/95 ",
      borderColor: "border-success/25",
      shadow: "shadow-sm",
      badge: "bg-success-soft text-success  border-success/25",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-destructive ",
      bgColor: "bg-card/95 ",
      borderColor: "border-destructive/25",
      shadow: "shadow-sm",
      badge: "bg-destructive-soft text-destructive  border-destructive/25",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-warning ",
      bgColor: "bg-card/95 ",
      borderColor: "border-warning/25",
      shadow: "shadow-sm",
      badge: "bg-warning-soft text-warning  border-warning/25",
    },
    info: {
      icon: Sparkles,
      iconColor: "text-info ",
      bgColor: "bg-card/95 ",
      borderColor: "border-info/25",
      shadow: "shadow-sm",
      badge: "bg-info-soft text-info  border-info/25",
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
      className={`pointer-events-auto relative flex w-full sm:max-w-md items-start gap-3 rounded-2xl border p-4 backdrop-blur-sm ${config.bgColor} ${config.borderColor} ${config.shadow}`}
    >
      {/* Icon */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted  border border-border  ${config.iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <h5 className="text-xs font-bold text-foreground tracking-tight leading-snug">
          {toast.title}
        </h5>
        {toast.description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
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
            className="mt-2 text-[11px] font-bold text-brand-strong hover:text-foreground underline underline-offset-2"
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
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
            ? "bg-success"
            : toast.type === "error"
            ? "bg-destructive"
            : toast.type === "warning"
            ? "bg-warning"
            : "bg-info"
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
