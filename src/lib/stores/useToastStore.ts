import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id" | "createdAt">) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      createdAt: Date.now(),
    };
    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, 5),
    }));
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({
      type: "success",
      title,
      description: options?.description,
      duration: options?.duration ?? 4500,
      action: options?.action,
    }),
  error: (title: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({
      type: "error",
      title,
      description: options?.description,
      duration: options?.duration ?? 5500,
      action: options?.action,
    }),
  info: (title: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({
      type: "info",
      title,
      description: options?.description,
      duration: options?.duration ?? 4500,
      action: options?.action,
    }),
  warning: (title: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({
      type: "warning",
      title,
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action,
    }),
  dismiss: (id: string) => useToastStore.getState().dismissToast(id),
};
