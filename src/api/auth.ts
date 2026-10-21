import { apiClient } from "@/api/client";
import { ApiResponse, AuthResponseData, User, UserRole } from "@/types/api";

export interface LoginPayload {
  emailOrPhone: string;
  password?: string;
  role: UserRole;
}

export interface SendOtpPayload {
  phone: string;
  userType?: UserRole;
  role?: UserRole;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  email?: string;
  matricNumber?: string;
  department?: string;
  university?: string;
  profilePicture?: string;
  password?: string;
}

export interface UpdateLandlordProfilePayload {
  fullName: string;
  email?: string;
  businessName?: string;
  businessRegistration?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bvn?: string;
  profilePicture?: string;
  password?: string;
}

export const authApi = {
  /**
   * Log in user with password & role
   */
  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload
    );
    return response.data.data;
  },

  /**
   * Request OTP code to phone number (supports userType per backend spec)
   */
  async sendOtp(
    payload: SendOtpPayload
  ): Promise<{ requestId: string; expiresIn: number }> {
    const userType = payload.userType || payload.role || "STUDENT";
    const response = await apiClient.post<
      ApiResponse<{ requestId: string; expiresIn: number }>
    >("/auth/send-otp", {
      phone: payload.phone,
      userType,
    });
    return response.data.data;
  },

  /**
   * Verify OTP code and receive tokens
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/verify-otp",
      payload
    );
    return response.data.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },

  /**
   * Update student user profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/profile",
      payload
    );
    return response.data.data;
  },

  /**
   * Complete/Update Landlord profile
   */
  async updateLandlordProfile(payload: UpdateLandlordProfilePayload): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/landlord/profile",
      payload
    );
    return response.data.data;
  },

  /**
   * Invalidate access token on server
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors during logout
    }
  },
};
