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
  amount: number;
  email: string;
  phone: string;
}

export interface InitPaymentResponse {
  paymentReference: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentPayload {
  reference: string;
  amount: number;
}

export interface SubmitInspectionPayload {
  inspectionCode: string;
  evidence?: { imageUri: string }[];
}

export interface OpenDisputePayload {
  bookingId: string;
  reason: string;
  evidence?: { type: string; url: string }[];
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
   * Initialize Paystack or Flutterwave payment session
   */
  async initPayment(payload: InitPaymentPayload): Promise<InitPaymentResponse> {
    const response = await apiClient.post<ApiResponse<InitPaymentResponse>>(
      "/payments/init",
      payload
    );
    return response.data.data;
  },

  /**
   * Verify completed payment
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<{ success: boolean; status: string }> {
    const response = await apiClient.post<ApiResponse<Booking>>(
      "/payments/verify",
      payload
    );
    return { success: response.data.success, status: response.data.data.status };
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
          total: response.data.data.total || rawItems.length,
          page: response.data.data.page || page,
          pageSize: response.data.data.pageSize || pageSize,
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
   * Submit inspection code to release escrow to landlord
   * POST /api/bookings/:id/approve-inspection
   */
  async approveInspection(
    bookingId: string,
    inspectionCode: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ message?: string }>>(
      `/bookings/${bookingId}/approve-inspection`,
      { inspectionCode }
    );
    return {
      success: response.data?.success ?? true,
      message: response.data?.message || "Inspection verified and escrow released to landlord.",
    };
  },

  /**
   * Backward-compatible alias for approveInspection
   */
  async submitInspection(
    bookingId: string,
    payload: SubmitInspectionPayload
  ): Promise<{ success: boolean; message: string }> {
    return this.approveInspection(bookingId, payload.inspectionCode);
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
};

