import { apiClient } from "@/api/client";
import {
  ApiResponse,
  Booking,
  CreateBookingResponse,
  EscrowTransaction,
  PaginatedData,
} from "@/types/api";

export interface CreateBookingPayload {
  lodgeId: string;
  moveInDate: string;
  specialRequests?: string;
}

export interface InitPaymentPayload {
  bookingId: string;
}

export interface InitPaymentResponse {
  paymentReference: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentPayload {
  transactionId: string;
  reference: string;
}

export interface OpenDisputePayload {
  bookingId: string;
  reason: string;
  evidence?: { type: string; url: string }[];
}

export interface AdminDispute {
  id: string;
  bookingId: string;
  reason: string;
  evidence: unknown[];
  status: "OPEN" | "UNDER_REVIEW";
  createdAt: string;
  booking: {
    id: string;
    moveInDate: string;
    totalAmount: number;
    student: { name: string; email: string | null; phone: string };
    lodge: { id: string; title: string; landlord: string };
    escrow: { status: string; amount: number } | null;
  };
}

export const bookingsApi = {
  /**
   * Create a new booking reservation (auto initializes Escrow transaction)
   * POST /api/bookings
   */
  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    const response = await apiClient.post<ApiResponse<CreateBookingResponse>>(
      "/bookings",
      payload
    );
    return response.data.data;
  },

  /**
   * Initialize a provider checkout using the booking amount and student identity from the server.
   */
  async initPayment(payload: InitPaymentPayload): Promise<InitPaymentResponse> {
    const response = await apiClient.post<ApiResponse<InitPaymentResponse>>(
      "/payments/init",
      payload
    );
    return response.data.data;
  },

  async initInspectionExtension(payload: InitPaymentPayload): Promise<InitPaymentResponse & { status?: string; extendedDeadline?: string }> {
    const response = await apiClient.post<ApiResponse<InitPaymentResponse & { status?: string; extendedDeadline?: string }>>(
      "/payments/inspection-extension/init",
      payload
    );
    return response.data.data;
  },

  /**
   * Verify completed payment
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<{ success: boolean; message?: string; bookingId?: string; escrowStatus?: string; status?: string }> {
    const response = await apiClient.post<ApiResponse<{ bookingId?: string; escrowStatus?: string; status?: string; message?: string }>>(
      "/payments/verify",
      payload
    );
    return { success: response.data.success, message: response.data.message, ...response.data.data };
  },

  /**
   * Fetch current authenticated student's bookings with escrow states
   * GET /api/bookings
   */
  async getBookings(page = 1, pageSize = 20): Promise<{
    items: Booking[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedData<Booking>>>(
        "/bookings",
        { params: { page, pageSize } }
      );
      if (response.data?.success && response.data?.data) {
        const rawItems = response.data.data.items || (response.data.data as any).bookings || [];
        return {
          items: rawItems,
          total: response.data.data.total ?? rawItems.length,
          page: response.data.data.page ?? page,
          pageSize: response.data.data.pageSize ?? pageSize,
        };
      }
    } catch {
      // Return empty if unauthenticated or no bookings exist
    }

    return {
      items: [],
      total: 0,
      page,
      pageSize,
    };
  },

  /**
   * Get single booking details and escrow state
   * GET /api/bookings/:id
   */
  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Cancel booking
   * POST /api/bookings/:id/cancel
   */
  async cancelBooking(
    bookingId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/bookings/${bookingId}/cancel`,
      { reason }
    );
    return {
      success: response.data?.success ?? true,
      message: response.data?.message || "Booking cancelled successfully",
    };
  },

  /**
   * Open a dispute on booking (POST /api/bookings/:id/dispute)
   */
  async openDispute(
    bookingIdOrPayload: string | OpenDisputePayload,
    maybePayload?: { reason: string; evidence?: Array<{ type: string; url: string }> }
  ): Promise<{ success: boolean; disputeId?: string }> {
    let bookingId: string;
    let body: { reason: string; evidence?: Array<{ type: string; url: string }> };

    if (typeof bookingIdOrPayload === "string") {
      bookingId = bookingIdOrPayload;
      body = maybePayload || { reason: "" };
    } else {
      bookingId = bookingIdOrPayload.bookingId;
      body = {
        reason: bookingIdOrPayload.reason,
        evidence: bookingIdOrPayload.evidence,
      };
    }

    const response = await apiClient.post<ApiResponse<any>>(
      `/bookings/${bookingId}/dispute`,
      body
    );
    return {
      success: response.data?.success ?? true,
      disputeId: response.data?.data?.id || response.data?.data?.disputeId,
    };
  },

  /**
   * Get escrow status & inspection deadline
   * GET /api/escrow/:id
   */
  async getEscrowStatus(escrowId: string): Promise<EscrowTransaction | null> {
    try {
      const response = await apiClient.get<ApiResponse<EscrowTransaction>>(`/escrow/${escrowId}`);
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  async getDisputeById(id: string) {
    const response = await apiClient.get<ApiResponse<any>>(`/disputes/${id}`);
    return response.data?.data ?? null;
  },

  async getAdminDisputes(): Promise<AdminDispute[]> {
    const response = await apiClient.get<ApiResponse<AdminDispute[]>>("/admin/disputes");
    return response.data?.data ?? [];
  },

  async resolveAdminDispute(
    disputeId: string,
    resolution: "student_refund" | "landlord_release",
    note: string,
  ): Promise<ApiResponse<{ disputeId: string; status: string; escrowStatus: string; resolution: string }>> {
    const response = await apiClient.post<ApiResponse<{
      disputeId: string;
      status: string;
      escrowStatus: string;
      resolution: string;
    }>>(`/admin/disputes/${disputeId}/resolve`, { resolution, note });
    return response.data;
  },

  async reconcileAdminRefund(bookingId: string) {
    const response = await apiClient.post<any>(`/payments/admin/bookings/${bookingId}/refund/reconcile`);
    return response.data;
  },

  async retryAdminRefund(bookingId: string) {
    const response = await apiClient.post<any>(`/payments/admin/bookings/${bookingId}/refund/retry`);
    return response.data;
  },
};

