import { apiClient } from "@/api/client";
import { ApiResponse, BackendLodge } from "@/types/api";
import { Property } from "@/types/property";
import { getAccommodationTypeLabel } from "@/lib/constants/accommodation-types";

export interface GetLodgesParams {
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  amenities?: string;
  university?: string;
  area?: string;
  search?: string;
  sortBy?: string;
}

export function backendLodgeToProperty(lodge: BackendLodge): Property {
  const images = lodge.images?.length
    ? lodge.images.map((image) => ({
        id: image.id,
        url: image.url,
        title: lodge.title,
      }))
    : lodge.primaryImage
      ? [{ id: lodge.primaryImage.id, url: lodge.primaryImage.url, title: lodge.title }]
      : [];
  const status = String(lodge.status).toLowerCase();
  const host = lodge.landlord
    ? {
        name: lodge.landlord.fullName || "",
        avatar: lodge.landlord.profilePicture || "",
        rating: Number(lodge.landlord.rating ?? 0),
        verified: Boolean(lodge.landlord.isVerified),
        reviewCount: Number(lodge.landlord.reviewCount ?? 0),
        phone: lodge.landlord.phone || "",
        email: lodge.landlord.email || "",
      }
    : undefined;

  return {
    id: lodge.id,
    buildingId: lodge.buildingId ?? null,
    building: lodge.building ?? null,
    title: lodge.title,
    unitLabel: lodge.unitLabel ?? null,
    description: lodge.description || "",
    price: Number(lodge.rent ?? 0),
    currency: "₦",
    period: "session",
    propertyType: getAccommodationTypeLabel(lodge.category),
    status: status === "booked" || status === "occupied" ? "occupied" : status === "maintenance" ? "maintenance" : "available",
    campus: lodge.university || [lodge.city, lodge.state].filter(Boolean).join(", ") || "Campus not specified",
    university: lodge.university ?? null,
    campusArea: lodge.campusArea ?? null,
    address: {
      street: lodge.address || "",
      city: lodge.city || "",
      state: lodge.state || "",
      coordinates:
        lodge.latitude != null && lodge.longitude != null
          ? { lat: Number(lodge.latitude), lng: Number(lodge.longitude) }
          : null,
    },
    distanceToCampus: lodge.distanceToCampus == null ? null : Number(lodge.distanceToCampus),
    numberOfRooms: lodge.numberOfRooms == null ? null : Number(lodge.numberOfRooms),
    serviceFee: lodge.serviceFee == null ? null : Number(lodge.serviceFee),
    verifiedHost: lodge.landlord ? Boolean(lodge.landlord.isVerified) : null,
    saved: Boolean(lodge.saved),
    images,
    amenities: (lodge.amenities || []).map((amenity) => amenity.name),
    host,
  };
}

type LodgeListResponse = {
  items: BackendLodge[];
  pagination?: { page?: number; pageSize?: number; total?: number };
};

async function getLodgeList(path: string, params: GetLodgesParams = {}) {
  const response = await apiClient.get<ApiResponse<LodgeListResponse>>(path, { params });
  const data = response.data.data;
  const items = (data?.items || []).map(backendLodgeToProperty);
  return {
    items,
    total: data?.pagination?.total ?? items.length,
    page: data?.pagination?.page ?? params.page ?? 1,
    pageSize: data?.pagination?.pageSize ?? params.pageSize ?? 20,
  };
}

export const lodgesApi = {
  getLodges: (params: GetLodgesParams = {}) => getLodgeList("/lodges", params),

  async getLodgeById(id: string): Promise<Property | null> {
    const response = await apiClient.get<ApiResponse<BackendLodge>>(`/lodges/${id}`);
    return response.data?.data ? backendLodgeToProperty(response.data.data) : null;
  },

  async saveLodge(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post<ApiResponse<{ message?: string }>>(`/lodges/${id}/save`);
    return { success: response.data?.success ?? true, message: response.data?.message };
  },

  async unsaveLodge(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<ApiResponse<unknown>>(`/lodges/${id}/save`);
    return { success: response.data?.success ?? true };
  },

  async getAmenities() {
    const response = await apiClient.get<ApiResponse<Array<{ id: string; name: string; icon: string | null; category?: string | null }>>>("/amenities");
    return response.data?.data || [];
  },

  async getSavedLodges(page = 1, pageSize = 20) {
    return getLodgeList("/lodges/saved", { page, pageSize });
  },
};
