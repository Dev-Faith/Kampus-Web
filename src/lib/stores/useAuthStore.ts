import { create } from "zustand";
import { isAxiosError } from "axios";
import { User, UserRole, AuthResponseData } from "@/types/api";
import {
  authApi,
  UpdateProfilePayload,
  UpdateLandlordProfilePayload,
} from "@/api/auth";
import { authError } from "@/lib/auth-errors";
import { toast } from "@/lib/stores/useToastStore";

interface AuthState {
  user: User | null;
  role: UserRole;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    emailOrPhone: string,
    password: string,
    role: UserRole,
  ) => Promise<boolean>;
  sendOtp: (
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{
    requestId: string;
    expiresIn: number;
    resendAfterSeconds?: number;
  } | null>;
  verifyOtp: (
    email: string,
    code: string,
    requestId: string,
  ) => Promise<boolean>;
  resendOtp: (email: string, requestId: string) => Promise<{ requestId: string; expiresIn: number; resendAfterSeconds?: number } | null>;
  completeProfile: (
    payload: UpdateProfilePayload | UpdateLandlordProfilePayload,
  ) => Promise<boolean>;
  registerAsLandlord: (
    payload: UpdateLandlordProfilePayload,
  ) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => boolean;
  isRegisteredHost: () => boolean;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

function persistUser(user: User) {
  if (typeof window !== "undefined")
    localStorage.setItem("kampus_user", JSON.stringify(user));
}
function persistSession(data: AuthResponseData) {
  if (typeof window !== "undefined") {
    localStorage.setItem("kampus_access_token", data.accessToken);
    localStorage.setItem("kampus_refresh_token", data.refreshToken);
    persistUser(data.user);
  }
  return {
    user: data.user,
    role: data.user.role,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  };
}
function clearSession() {
  if (typeof window !== "undefined")
    ["kampus_access_token", "kampus_refresh_token", "kampus_user"].forEach(
      (key) => localStorage.removeItem(key),
    );
  return {
    user: null,
    role: "STUDENT" as const,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...clearSessionOnServer(),
  clearError: () => set({ error: null }),
  login: async (emailOrPhone, password, role) => {
    set({ isLoading: true, error: null });
    try {
      set(
        persistSession(await authApi.login({ emailOrPhone, password, role })),
      );
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: authError(
          error,
          "Could not sign in. Check your connection and try again.",
        ),
      });
      return false;
    }
  },
  sendOtp: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.sendOtp({ email, password, role });
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        isLoading: false,
        error: authError(error, "Could not send your verification code."),
      });
      return null;
    }
  },
  resendOtp: async (email, requestId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.resendOtp(email, requestId);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false, error: authError(error, 'Could not resend your verification email.') });
      return null;
    }
  },
  verifyOtp: async (email, code, requestId) => {
    set({ isLoading: true, error: null });
    try {
      set(persistSession(await authApi.verifyOtp({ email, code, requestId })));
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: authError(
          error,
          "Could not verify this code. Please try again.",
        ),
      });
      return false;
    }
  },
  completeProfile: async (payload) => {
    const user = get().user;
    if (!user || !["STUDENT", "LANDLORD"].includes(user.role)) return false;
    set({ isLoading: true, error: null });
    try {
      if (user.role === "LANDLORD")
        await authApi.updateLandlordProfile(payload);
      else await authApi.updateProfile(payload);
      // Profile endpoints return partial records. Always restore the complete session shape.
      const updated = await authApi.getMe();
      persistUser(updated);
      set({ user: updated, role: updated.role, isLoading: false });
      if (updated.profileStatus !== "COMPLETED") {
        set({
          error:
            "Your details were saved. Please complete the remaining required fields.",
        });
        return false;
      }
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: authError(
          error,
          "Could not finish your profile. Your entries are still here; please try again.",
        ),
      });
      return false;
    }
  },
  registerAsLandlord: async (payload) => {
    if (get().user?.role !== "LANDLORD") {
      set({ error: "Please sign in with a separate landlord account." });
      return false;
    }
    return get().completeProfile(payload);
  },
  isRegisteredHost: () => get().user?.role === "LANDLORD",
  setUser: (user) => {
    persistUser(user);
    set({ user, role: user.role });
  },
  // A display preference must never overwrite the authenticated account role.
  switchRole: (role) => {
    if (role === "LANDLORD" && get().user?.role !== "LANDLORD") return false;
    if (role === "ADMIN" && get().user?.role !== "ADMIN") return false;
    set({ role });
    return true;
  },
  logout: () => {
    void authApi.logout();
    set(clearSession());
    toast.info("Signed out");
  },
  checkAuth: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("kampus_access_token");
    const saved = localStorage.getItem("kampus_user");
    if (!token || !saved) return;
    try {
      const user: User = JSON.parse(saved);
      set({
        user,
        role: user.role,
        accessToken: token,
        refreshToken: localStorage.getItem("kampus_refresh_token"),
        isAuthenticated: true,
      });
      const liveUser = await authApi.getMe();
      // Ignore a response from a session that has since signed out or changed.
      if (
        get().user?.id === user.id &&
        localStorage.getItem("kampus_access_token")
      )
        get().setUser(liveUser);
    } catch (error) {
      if (
        error instanceof SyntaxError ||
        (isAxiosError(error) &&
          [401, 403].includes(error.response?.status || 0))
      )
        set(clearSession());
      // A temporary connection failure must not discard an unfinished signup.
    }
  },
}));

function clearSessionOnServer() {
  return {
    user: null,
    role: "STUDENT" as UserRole,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
}
