import { create } from "zustand";
import { User, UserRole } from "@/types/api";
import { authApi } from "@/api/auth";
import { toast } from "@/lib/stores/useToastStore";

interface AuthState {
  user: User | null;
  role: UserRole;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (emailOrPhone: string, password: string, role: UserRole) => Promise<boolean>;
  sendOtp: (phone: string, role: UserRole) => Promise<{ requestId: string; expiresIn: number } | null>;
  verifyOtp: (phone: string, code: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => boolean;
  isRegisteredHost: () => boolean;
  registerAsLandlord: (payload: any) => Promise<boolean>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: "STUDENT",
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (emailOrPhone, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login({ emailOrPhone, password, role });
      if (typeof window !== "undefined") {
        localStorage.setItem("kampus_access_token", data.accessToken);
        localStorage.setItem("kampus_refresh_token", data.refreshToken);
        localStorage.setItem("kampus_user", JSON.stringify(data.user));
      }
      set({
        user: data.user,
        role: data.user.role,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please verify your phone/email and password.";
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  sendOtp: async (phone, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.sendOtp({ phone, role });
      set({ isLoading: false, error: null });
      return res;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not send SMS verification code. Please check your phone number.";
      set({ isLoading: false, error: errorMsg });
      return null;
    }
  },

  verifyOtp: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.verifyOtp({ phone, code });
      if (typeof window !== "undefined") {
        localStorage.setItem("kampus_access_token", data.accessToken);
        localStorage.setItem("kampus_refresh_token", data.refreshToken);
        localStorage.setItem("kampus_user", JSON.stringify(data.user));
      }
      set({
        user: data.user,
        role: data.user.role,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid OTP verification code. Please try again.";
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  isRegisteredHost: () => {
    const user = get().user;
    if (!user) return false;
    return user.role === "LANDLORD" || Boolean(user.landlord);
  },

  registerAsLandlord: async (payload: any) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authApi.updateLandlordProfile(payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("kampus_user", JSON.stringify(updatedUser));
      }
      set({
        user: updatedUser,
        role: "LANDLORD",
        isLoading: false,
        error: null,
      });
      toast.success("Host Profile Activated!", {
        description: "You are now registered as an accredited Landlord on Kampus.",
      });
      return true;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not complete host registration. Please try again.";
      set({ isLoading: false, error: errorMsg });
      toast.error("Registration Incomplete", { description: errorMsg });
      return false;
    }
  },

  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kampus_user", JSON.stringify(user));
    }
    set({ user, role: user.role });
  },

  switchRole: (role: UserRole) => {
    const currentUser = get().user;
    if (!currentUser) {
      set({ role });
      return true;
    }

    // STRICT GUARD: If switching to LANDLORD, verify landlord registration
    if (role === "LANDLORD") {
      const isHost = currentUser.role === "LANDLORD" || Boolean(currentUser.landlord);
      if (!isHost) {
        toast.error("Host Account Required", {
          description: "You are not registered as a host. Please complete landlord verification first.",
        });
        return false;
      }
    }

    const updatedUser: User = {
      ...currentUser,
      role,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("kampus_user", JSON.stringify(updatedUser));
    }
    set({ role, user: updatedUser });
    toast.info("Active Role Switched", {
      description: `Now viewing as ${role === "STUDENT" ? "Student" : "Landlord & Property Host"}.`,
    });
    return true;
  },

  logout: () => {
    authApi.logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("kampus_access_token");
      localStorage.removeItem("kampus_refresh_token");
      localStorage.removeItem("kampus_user");
    }
    set({
      user: null,
      role: "STUDENT",
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    toast.info("Signed Out", {
      description: "You have been securely signed out of your Kampus session.",
    });
  },

  checkAuth: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("kampus_access_token");
    const userStr = localStorage.getItem("kampus_user");

    if (token && userStr) {
      try {
        const parsedUser: User = JSON.parse(userStr);
        set({
          user: parsedUser,
          role: parsedUser.role,
          accessToken: token,
          isAuthenticated: true,
        });

        // Silently revalidate against live /auth/me
        const liveUser = await authApi.getMe();
        if (liveUser) {
          localStorage.setItem("kampus_user", JSON.stringify(liveUser));
          set({ user: liveUser, role: liveUser.role });
        }
      } catch {
        // If token expired/invalid, clear session
        localStorage.removeItem("kampus_access_token");
        localStorage.removeItem("kampus_refresh_token");
        localStorage.removeItem("kampus_user");
        set({
          user: null,
          role: "STUDENT",
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      }
    }
  },
}));
