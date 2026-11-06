import { apiClient } from "@/api/client";
import { ApiResponse, AuthResponseData, User, UserRole } from "@/types/api";

export interface LoginPayload {
  emailOrPhone: string;
  password?: string;
  role: UserRole;
}

export interface SendOtpPayload {
  email: string;
  password: string;
  userType?: UserRole;
  role?: UserRole;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  requestId: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string;
  email?: string;
  matricNumber?: string;
  department?: string;
  university?: string;
  profilePicture?: string;
  password?: string;
}

export interface UpdateLandlordProfilePayload {
  fullName: string;
  phone?: string;
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
  async registrationStatus(): Promise<{
    emailVerificationAvailable: boolean;
    verificationMethod: 'email';
    expiresIn: number;
    resendAfterSeconds: number;
    message: string;
  }> {
    const response = await apiClient.get("/auth/registration-status");
    return response.data.data;
  },
  /**
   * Log in user with password & role
   */
  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      payload,
    );
    return response.data.data;
  },

  /**
   * Begin email registration; the backend stores only a hash of the password.
   */
  async sendOtp(payload: SendOtpPayload): Promise<{
    requestId: string;
    expiresIn: number;
    resendAfterSeconds?: number;
  }> {
    const userType = payload.userType || payload.role || "STUDENT";
    const response = await apiClient.post<
      ApiResponse<{
        requestId: string;
        expiresIn: number;
        resendAfterSeconds?: number;
      }>
    >("/auth/email/send-otp", {
      email: payload.email,
      password: payload.password,
      userType,
    });
    return response.data.data;
  },

  async resendOtp(email: string, requestId: string): Promise<{ requestId: string; expiresIn: number; resendAfterSeconds: number }> {
    const response = await apiClient.post('/auth/email/resend-otp', { email, requestId });
    return response.data.data;
  },

  /**
   * Verify OTP code and receive tokens
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/email/verify-otp",
      payload,
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
  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<Pick<User, "id" | "profileStatus">> {
    const response = await apiClient.put<
      ApiResponse<Pick<User, "id" | "profileStatus">>
    >("/auth/profile", payload);
    return response.data.data;
  },

  /**
   * Complete/Update Landlord profile
   */
  async updateLandlordProfile(
    payload: UpdateLandlordProfilePayload,
  ): Promise<Pick<User, "id" | "profileStatus">> {
    const response = await apiClient.put<
      ApiResponse<Pick<User, "id" | "profileStatus">>
    >("/auth/landlord/profile", payload);
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
