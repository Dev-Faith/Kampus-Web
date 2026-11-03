import { apiClient } from "./client";
export interface Person {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string;
  isActive: boolean;
}
export interface AdminRow {
  id: string;
  updatedAt: string;
  createdAt: string;
  status?: string;
  isActive?: boolean;
  isHidden?: boolean;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  adminAccess?: boolean;
  suspensionReason?: string;
  user?: Person;
  businessName?: string;
  businessRegistration?: string;
  kycStatus?: string;
  isVerified?: boolean;
  bankName?: string;
  bankAccountName?: string;
  bankAccountLast4?: string;
  bvnProvided?: boolean;
  title?: string;
  unitLabel?: string;
  category?: string;
  rent?: string | number;
  address?: string;
  campusArea?: string;
  university?: string;
  description?: string;
  moderationReason?: string;
  building?: { name: string };
  landlord?: { user: Person };
  images?: { url: string }[];
  _count?: { lodges?: number; bookings?: number };
  student?: { user: Person };
  bio?: string;
  department?: string;
  budgetMax?: string | number;
  moveInDate?: string;
  totalAmount?: string | number;
  lodge?: {
    title: string;
    building?: { name: string };
    landlord?: { user: Person };
  };
  escrow?: {
    status: string;
    paymentProvider: string;
    isInspected: boolean;
    inspectionDeadline?: string;
    reviewReason?: string;
    settledAt?: string;
  };
  disputes?: {
    id: string;
    status: string;
    reason?: string;
    resolution?: string;
  }[];
  icon?: string;
  providerId?: string;
  bookingId?: string;
  active?: boolean;
  amount?: string | number;
  event?: string;
  state?: string;
  attempts?: number;
  nextRunAt?: string;
  lastError?: string;
  reference?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  actor?: { fullName?: string; email?: string };
  actorUserId?: string;
  details?: Record<string, unknown>;
}
export interface AdminPage {
  items: AdminRow[];
  pagination: { page: number; total: number; totalPages: number };
}
export type Resource =
  | "users"
  | "landlords"
  | "listings"
  | "bookings"
  | "roommates"
  | "amenities"
  | "chargebacks"
  | "events"
  | "audit";
export function adminError(error: unknown) {
  const e = error as {
    response?: { data?: { message?: string | string[] }; status?: number };
  };
  const message = e.response?.data?.message;
  if (message) return Array.isArray(message) ? message.join(". ") : message;
  return "The request could not be completed. Check your connection and refresh before retrying.";
}
export const adminApi = {
  async list(
    resource: Resource,
    params: Record<string, string | number>,
    signal?: AbortSignal,
  ): Promise<AdminPage> {
    return (await apiClient.get("/admin/" + resource, { params, signal })).data
      .data;
  },
  async action(
    path: string,
    body: unknown = {},
    method: "post" | "patch" = "post",
  ) {
    return (await apiClient[method]("/admin/" + path, body, { timeout: 90000 }))
      .data;
  },
};
export const money = (value?: number | string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
export const date = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      })
    : "—";
// Database DATE fields represent calendar days, not midnight appointments.
export const calendarDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-NG", {
        dateStyle: "medium",
        timeZone: "UTC",
      })
    : "—";
