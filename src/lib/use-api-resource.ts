"use client";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { authError } from "@/lib/auth-errors";
export function useApiResource<T>(path: string | null, pollMs = 0) {
  const identity = useAuthStore((s) => s.user?.id || "guest");
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data?: T;
    error?: string;
  }>();
  const key = identity + ":" + path;
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    apiClient
      .get(path, { signal: controller.signal })
      .then((r) => {
        if (!controller.signal.aborted) setState({ key, data: r.data.data });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setState({
            key,
            error: authError(e, "Couldn’t load this page. Please try again."),
          });
      });
    return () => controller.abort();
  }, [path, key, revision]);
  useEffect(() => {
    const update = (e: Event) => {
      if ((e as CustomEvent).detail === path) reload();
    };
    window.addEventListener("kampus:refresh", update);
    return () => window.removeEventListener("kampus:refresh", update);
  }, [path, reload]);
  useEffect(() => {
    if (!pollMs || !path) return;
    const update = () => {
      if (document.visibilityState === "visible") reload();
    };
    const timer = setInterval(update, pollMs);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [pollMs, path, reload]);
  return {
    data: state?.key === key ? state.data : undefined,
    error: state?.key === key ? state.error : undefined,
    reload,
  };
}
