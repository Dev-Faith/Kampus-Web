import { apiClient } from "@/api/client";
import {
  ApiResponse,
  BackendLodge,
  LandlordProfile,
  LandlordStats,
  PaginatedData,
} from "@/types/api";

export interface UpdateLandlordBankPayload {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bvn: string;
}

export interface CreateLodgeListingPayload {
  title: string;
  description: string;
  category: "single" | "self_con" | "flat" | "hostel" | "premium" | "lodge";
  address: string;
  city: string;
  state: string;
  rent: number;
  serviceFee: number;
  numberOfRooms: number;
  capacity: number;
  distanceToCampus: number;
  amenities: string[];
  images: { url: string; isPrimary: boolean }[];
}

export const landlordApi = {
  /**
   * Get host profile & settlement bank details
   */
  async getProfile(): Promise<LandlordProfile | null> {
    try {
      const response = await apiClient.get<ApiResponse<LandlordProfile>>(
        "/landlords/profile"
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Unauthenticated or profile not created yet
    }
    return null;
  },

  /**
   * Update host payout bank & business details (PUT /api/landlords/profile)
   */
  async updateBankDetails(payload: Partial<UpdateLandlordBankPayload & { businessName?: string; businessRegistration?: string }>): Promise<LandlordProfile> {
    const response = await apiClient.put<ApiResponse<LandlordProfile>>(
      "/landlords/profile",
      payload
    );
    return response.data.data;
  },

  /**
   * Get host portfolio metrics and escrow revenue
   */
  async getStats(): Promise<LandlordStats | null> {
    try {
      const response = await apiClient.get<ApiResponse<LandlordStats>>(
        "/landlords/stats"
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Return null when unauthenticated or endpoint is empty
    }
    return null;
  },

  /**
   * Fetch landlord's properties
   */
  async getProperties(params: { page?: number; pageSize?: number; status?: string } = {}): Promise<{
    items: BackendLodge[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        "/landlords/properties",
        { params }
      );
      const rawItems = response.data?.data?.items || response.data?.data?.lodges || [];
      return {
        items: rawItems,
        total: response.data?.data?.total || rawItems.length,
        page: response.data?.data?.page || params.page || 1,
        pageSize: response.data?.data?.pageSize || params.pageSize || 20,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      };
    }
  },

  /**
   * Get single landlord property details
   * GET /api/landlords/properties/:id
   */
  async getPropertyById(id: string): Promise<BackendLodge | null> {
    try {
      const response = await apiClient.get<ApiResponse<BackendLodge>>(
        `/landlords/properties/${id}`
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Create a new student lodge listing
   */
  async createProperty(payload: CreateLodgeListingPayload): Promise<BackendLodge> {
    const response = await apiClient.post<ApiResponse<BackendLodge>>(
      "/landlords/properties",
      payload
    );
    return response.data.data;
  },

  /**
   * Update property information (PATCH /api/landlords/properties/:id)
   */
  async updateProperty(
    id: string,
    payload: Partial<CreateLodgeListingPayload & { status?: string }>
  ): Promise<BackendLodge> {
    const response = await apiClient.patch<ApiResponse<BackendLodge>>(
      `/landlords/properties/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Delete landlord property (DELETE /api/landlords/properties/:id)
   */
  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete(`/landlords/properties/${id}`);
  },

  /**
   * 1-Click live status update (available | booked | maintenance)
   */
  async updateStatus(
    id: string,
    status: "available" | "booked" | "maintenance" | "occupied" | "AVAILABLE" | "BOOKED" | "MAINTENANCE"
  ): Promise<{ success: boolean; status: string }> {
    const response = await apiClient.patch<ApiResponse<BackendLodge>>(
      `/landlords/properties/${id}`,
      { status }
    );
    return { success: response.data.success, status: response.data?.data?.status || (status as string) };
  },

  /**
   * Fetch landlord's booking requests (GET /api/landlords/bookings)
   */
  async getBookings(params: { page?: number; pageSize?: number; status?: string } = {}): Promise<{
    items: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        "/landlords/bookings",
        { params }
      );
      const rawItems = response.data?.data?.items || response.data?.data?.bookings || [];
      return {
        items: rawItems,
        total: response.data?.data?.pagination?.total || response.data?.data?.total || rawItems.length,
        page: response.data?.data?.pagination?.page || params.page || 1,
        pageSize: response.data?.data?.pagination?.pageSize || params.pageSize || 20,
      };
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Fetch landlord's booking summary counts (GET /api/landlords/bookings/summary)
   */
  async getBookingsSummary(): Promise<{ pending: number; confirmed: number; rejected: number }> {
    try {
      const response = await apiClient.get<ApiResponse<{ pending: number; confirmed: number; rejected: number }>>(
        "/landlords/bookings/summary"
      );
      return response.data?.data || { pending: 0, confirmed: 0, rejected: 0 };
    } catch {
      return { pending: 0, confirmed: 0, rejected: 0 };
    }
  },

  /**
   * Confirm pending student reservation
   */
  async confirmBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/landlords/bookings/${bookingId}/confirm`,
      { action: "confirm" }
    );
    return { success: response.data.success, message: response.data?.message || "Booking confirmed successfully" };
  },

  /**
   * Reject pending reservation
   */
  async rejectBooking(
    bookingId: string,
    message?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/landlords/bookings/${bookingId}/reject`,
      { action: "reject", message }
    );
    return { success: response.data.success, message: response.data?.message || "Booking rejected" };
  },
};
