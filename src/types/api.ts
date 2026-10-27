export type UserRole = "STUDENT" | "LANDLORD" | "ADMIN";
export type ProfileStatus = "UNCOMPLETED" | "COMPLETED" | "PENDING";
export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EscrowStatus = "PENDING" | "HELD" | "DISPUTED" | "PAYOUT_PENDING" | "RELEASED" | "REFUND_PENDING" | "REFUND_FAILED" | "REFUNDED";
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore?: boolean;
  totalPages?: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  matricNumber: string | null;
  department: string | null;
  university: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LandlordProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string | null;
  phone: string;
  isVerified: boolean;
  kycStatus: KycStatus;
  rating: number;
  reviewCount: number;
  profilePicture?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  bvn?: string | null;
  businessName?: string | null;
  businessRegistration?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  profileStatus: ProfileStatus;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: StudentProfile | null;
  landlord?: LandlordProfile | null;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresProfileSetup?: boolean;
}

export interface LodgeImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface LodgeAmenity {
  id: string;
  name: string;
  icon: string | null;
  category?: string | null;
}

export interface LodgeBuildingSummary {
  id: string;
  name: string | null;
  city: string;
  state: string | null;
  university: string | null;
  campusArea: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  unitCount?: number;
}

export interface BackendLodge {
  id: string;
  buildingId?: string | null;
  building?: LodgeBuildingSummary | null;
  title: string;
  unitLabel?: string | null;
  description: string;
  address: string;
  city: string;
  state: string;
  university?: string | null;
  campusArea?: string | null;
  latitude: number | null;
  longitude: number | null;
  rent: number | null;
  serviceFee: number | null;
  numberOfRooms: number | null;
  capacity: number | null;
  category: string | null;
  status: "available" | "booked" | "maintenance" | "occupied" | "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  distanceToCampus: number | null;
  saved?: boolean;
  primaryImage?: LodgeImage | null;
  images: LodgeImage[];
  amenities: LodgeAmenity[];
  landlord?: {
    id: string;
    fullName?: string | null;
    isVerified?: boolean;
    rating?: number;
    reviewCount?: number;
    profilePicture?: string | null;
    phone?: string;
    email?: string;
  };
  rules?: string[];
  availableFrom?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EscrowTransaction {
  id: string;
  bookingId?: string;
  amount: number;
  status: EscrowStatus | "pending" | "held" | "released" | "disputed" | "refunded";
  inspectionCode?: string;
  inspectionDeadline?: string;
  isInspected?: boolean;
  heldAt?: string;
  releasedAt?: string;
}

export interface Booking {
  id: string;
  lodgeId: string;
  studentId: string;
  moveInDate: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED"
    | "pending"
    | "confirmed"
    | "active"
    | "inspection_pending"
    | "completed"
    | "disputed"
    | "cancelled";
  specialRequests?: string;
  inspectionCode?: string;
  rent?: number;
  serviceFee?: number;
  totalAmount?: number;
  amount: number;
  escrowStatus?: EscrowStatus | "pending" | "held" | "released" | "disputed" | "refunded";
  escrow?: EscrowTransaction;
  inspectionExtension?: {
    status: "PENDING" | "PAID" | "FAILED" | "REFUND_PENDING" | "REFUND_FAILED" | "REFUNDED" | null;
    amount: number | null;
    extensionNumber: number | null;
    extendedDeadline: string | null;
    paidCount: number;
    totalPaidAmount: number;
  };
  inspectionExtensionFee?: number | null;
  escrowCheckoutEnabled?: boolean;
  canExtendInspection?: boolean;
  canResumeInspectionExtension?: boolean;
  dispute?: {
    id?: string;
    status?: DisputeStatus | "open" | "under_review";
    reason?: string;
  } | null;
  lodge?: BackendLodge;
  createdAt: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  escrow: EscrowTransaction;
  paymentUrl: string | null;
}

export interface LandlordStats {
  totalProperties: number;
  availableProperties: number;
  bookedProperties: number;
  maintenanceProperties: number;
  totalBookings: number;
  pendingConfirmations: number;
  confirmedBookings: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
}
