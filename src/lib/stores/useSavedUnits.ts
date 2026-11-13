"use client";
import { create } from "zustand";
import { apiClient } from "@/api/client";
import { useAuthStore } from "./useAuthStore";
import { authError } from "@/lib/auth-errors";
type SavedState = {
  owner: string | null;
  ids: string[] | null;
  loading: boolean;
  error: string;
  busy: Record<string, boolean>;
  load: (refresh?: boolean) => Promise<void>;
  toggle: (id: string) => Promise<boolean>;
  removed: (id: string) => void;
};
export const useSavedUnits = create<SavedState>((set, get) => ({
  owner: null,
  ids: null,
  loading: false,
  error: "",
  busy: {},
  async load(refresh = false) {
    const user = useAuthStore.getState().user;
    if (user?.role !== "STUDENT") {
      set({ owner: null, ids: null, loading: false, error: "", busy: {} });
      return;
    }
    const owner = user.id;
    if (get().owner === owner && (get().loading || (get().ids && !refresh)))
      return;
    set({
      owner,
      loading: true,
      error: "",
      ...(get().owner !== owner ? { ids: null, busy: {} } : {}),
    });
    try {
      const r = await apiClient.get("/lodges/saved/ids");
      if (!Array.isArray(r.data.data))
        throw new Error("Couldn’t load saved units.");
      if (useAuthStore.getState().user?.id === owner && get().owner === owner)
        set({ ids: r.data.data, loading: false });
    } catch (e) {
      if (useAuthStore.getState().user?.id === owner && get().owner === owner)
        set({
          loading: false,
          error: authError(e, "Couldn’t load saved units."),
        });
    }
  },
  async toggle(id) {
    const user = useAuthStore.getState().user;
    if (user?.role !== "STUDENT")
      throw new Error("Sign in with a student account to save units.");
    if (get().owner !== user.id || !get().ids) await get().load();
    if (get().owner !== user.id || !get().ids)
      throw new Error(get().error || "Couldn’t load saved units.");
    if (get().busy[id]) throw new Error("This unit is already being updated.");
    const owner = user.id,
      next = !get().ids!.includes(id);
    set((s) => ({ busy: { ...s.busy, [id]: true } }));
    try {
      if (next) await apiClient.post(`/lodges/${id}/save`);
      else await apiClient.delete(`/lodges/${id}/save`);
      if (useAuthStore.getState().user?.id === owner && get().owner === owner)
        set((s) => ({
          ids: next
            ? [...new Set([...(s.ids || []), id])]
            : (s.ids || []).filter((v) => v !== id),
        }));
      return next;
    } finally {
      if (get().owner === owner)
        set((s) => ({ busy: { ...s.busy, [id]: false } }));
    }
  },
  removed(id) {
    if (get().owner === useAuthStore.getState().user?.id)
      set((s) => ({ ids: s.ids?.filter((v) => v !== id) || null }));
  },
}));
