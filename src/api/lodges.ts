import { apiClient } from "@/api/client";
import { ApiResponse, BackendLodge, PaginatedData } from "@/types/api";
import { Property, CampusCode, LodgeStatus, RoomType } from "@/types/property";

export interface GetLodgesParams {
  page?: number;
  pageSize?: number;
  priceMin?: number;
  priceMax?: number;
  category?: string;
  amenityIds?: string;
  university?: string;
}

/**
 * Transforms a backend API lodge entity into the frontend Property UI model
 */
export function backendLodgeToProperty(lodge: BackendLodge): Property {
  // Prioritize FUTMINNA as our primary campus, detecting Minna/Bosso/Gidan Kwano keywords
  let campus: CampusCode = "FUTMINNA";
  let campusName = "Federal University of Technology, Minna";
  const combinedText = `${lodge.title} ${lodge.address} ${lodge.city} ${lodge.state}`.toUpperCase();
  if (combinedText.includes("MINNA") || combinedText.includes("FUTMINNA") || combinedText.includes("BOSSO") || combinedText.includes("GIDAN KWANO") || combinedText.includes("NIGER")) {
    campus = "FUTMINNA";
    campusName = "Federal University of Technology, Minna";
  } else if (combinedText.includes("UNILAG") || combinedText.includes("LAGOS") || combinedText.includes("AKOKA")) {
    campus = "UNILAG";
    campusName = "University of Lagos (Akoka)";
  } else if (combinedText.includes("FUTA") || combinedText.includes("AKURE")) {
    campus = "FUTA";
    campusName = "Federal University of Technology, Akure";
  } else if (combinedText.includes("UNIBEN") || combinedText.includes("BENIN")) {
    campus = "UNIBEN";
    campusName = "University of Benin (Ugbowo)";
  } else if (combinedText.includes("UI") || combinedText.includes("IBADAN") || combinedText.includes("AGBOWO")) {
    campus = "UI";
    campusName = "University of Ibadan (Agbowo)";
  } else if (combinedText.includes("OAU") || combinedText.includes("IFE")) {
    campus = "OAU";
    campusName = "Obafemi Awolowo University (Ile-Ife)";
  }

  // Map category to frontend RoomType
  let propertyType: RoomType = "self-con";
  const catLower = (lodge.category || "").toLowerCase();
  if (catLower.includes("single") || catLower.includes("hostel")) {
    propertyType = "single-room";
  } else if (catLower.includes("flat") || catLower.includes("apartment")) {
    propertyType = "flatshare";
  } else if (catLower.includes("studio") || catLower.includes("premium")) {
    propertyType = "studio";
  }

  // Map status
  let status: LodgeStatus = "available";
  if (lodge.status === "booked" || lodge.status === "occupied") {
    status = "occupied";
  } else if (lodge.status === "maintenance") {
    status = "maintenance";
  }

  const images = (lodge.images && lodge.images.length > 0)
    ? lodge.images.map((img, idx) => ({
        id: img.id || `img_${idx}`,
        url: img.url,
        title: `${lodge.title} - View ${idx + 1}`,
      }))
    : lodge.primaryImage?.url
    ? [
        {
          id: lodge.primaryImage.id || "img_primary",
          url: lodge.primaryImage.url,
          title: lodge.title,
        },
      ]
    : [];

  const amenitiesList = (lodge.amenities && lodge.amenities.length > 0)
    ? lodge.amenities.map((a) => a.name)
    : [
        "Dedicated Water Supply",
        "Prepaid Electricity Meter",
        "Compound Security",
      ];

  // Deterministic coordinate offset if lat/lng are null from backend
  const idHash = lodge.id ? lodge.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : 42;
  const jitterLat = ((idHash % 17) - 8) * 0.0015;
  const jitterLng = ((idHash % 19) - 9) * 0.0015;

  let baseLat = 9.5836;
  let baseLng = 6.5463;
  if (campus === "UNILAG") {
    baseLat = 6.5178;
    baseLng = 3.3884;
  } else if (campus === "FUTA") {
    baseLat = 7.303;
    baseLng = 5.138;
  } else if (campus === "UI") {
    baseLat = 7.444;
    baseLng = 3.901;
  } else if (campus === "UNIBEN") {
    baseLat = 6.401;
    baseLng = 5.617;
  } else if (campus === "OAU") {
    baseLat = 7.518;
    baseLng = 4.528;
  }

  const lat = lodge.latitude && lodge.latitude !== 0 ? lodge.latitude : baseLat + jitterLat;
  const lng = lodge.longitude && lodge.longitude !== 0 ? lodge.longitude : baseLng + jitterLng;

  const rentAmount = Number(lodge.rent) || 0;
  const serviceFeeAmount = Number(lodge.serviceFee) || Math.round(rentAmount * 0.05);

  return {
    id: lodge.id,
    title: lodge.title,
    tagline: lodge.description?.slice(0, 75) || lodge.title,
    description: lodge.description || "Student accommodation verified on the Kampus platform.",
    price: rentAmount,
    currency: "₦",
    period: "session",
    propertyType,
    status,
    campus,
    campusName,
    distanceToCampus: `${lodge.distanceToCampus || 0.5} km to ${campus} Gate`,
    proximityMinutes: Math.max(3, Math.round((lodge.distanceToCampus || 0.5) * 10)),
    bedrooms: lodge.numberOfRooms || 1,
    bathrooms: 1,
    sqft: 250,
    yearBuilt: 2024,
    cautionDeposit: Math.round(rentAmount * 0.1),
    serviceFee: serviceFeeAmount,
    escrowProtected: true,
    verifiedHost: lodge.landlord?.isVerified ?? true,
    powerSchedule: "Prepaid Sub-Meter",
    waterSupply: "Borehole Water System",
    roommateMatchAvailable: true,
    address: {
      street: lodge.address || "Campus Road",
      neighborhood: lodge.city || "Campus District",
      city: lodge.city || "Lagos",
      state: lodge.state || "Lagos State",
      coordinates: {
        lat,
        lng,
      },
    },
    featured: true,
    isNew: false,
    images,
    amenities: amenitiesList,
    virtualStaging: images.length >= 2 ? {
      beforeUrl: images[0].url,
      afterUrl: images[1].url,
      roomName: "Verified Room Walkthrough",
      beforeLabel: "Angle 1",
      afterLabel: "Angle 2",
    } : undefined,
    floorPlan: undefined,
    panorama: undefined,
    host: {
      name: lodge.landlord?.fullName || "Verified Campus Host",
      title: "Accredited Landlord",
      phone: lodge.landlord?.phone || "",
      email: lodge.landlord?.email || "",
      avatar: lodge.landlord?.profilePicture || "",
      rating: lodge.landlord?.rating || 5.0,
      responseTime: "Active Host",
      verifiedId: lodge.landlord?.isVerified ?? true,
    },
  };
}

import { CURATED_FUTMINNA_LODGES } from "@/lib/constants/futminna-lodges";

export const lodgesApi = {
  /**
   * Fetch paginated lodges from live backend API with fallback to verified FUTMINNA listings
   */
  async getLodges(params: GetLodgesParams = {}): Promise<{
    items: Property[];
    total: number;
    page: number;
    pageSize: number;
    isFallback: boolean;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/lodges",
        { params }
      );

      const rawLodges: BackendLodge[] =
        response.data?.data?.lodges || response.data?.data?.items || [];

      if (Array.isArray(rawLodges) && rawLodges.length > 0) {
        return {
          items: rawLodges.map(backendLodgeToProperty),
          total: response.data?.data?.pagination?.total || response.data?.data?.total || rawLodges.length,
          page: response.data?.data?.pagination?.page || response.data?.data?.page || 1,
          pageSize: response.data?.data?.pagination?.pageSize || response.data?.data?.pageSize || 20,
          isFallback: false,
        };
      }
    } catch {
      // Backend not running or error, proceed to verified fallback
    }

    // Graceful fallback to verified curated FUTMINNA lodges so students never see a broken empty screen
    let filtered = [...CURATED_FUTMINNA_LODGES];
    if (params.category && params.category !== "all") {
      filtered = filtered.filter((l) => l.propertyType === params.category);
    }
    if (params.priceMax) {
      filtered = filtered.filter((l) => l.price <= (params.priceMax ?? 10000000));
    }
    if (params.priceMin) {
      filtered = filtered.filter((l) => l.price >= (params.priceMin ?? 0));
    }

    return {
      items: filtered,
      total: filtered.length,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      isFallback: true,
    };
  },

  /**
   * Fetch a single lodge by ID
   */
  async getLodgeById(id: string): Promise<Property | null> {
    try {
      const response = await apiClient.get<ApiResponse<BackendLodge>>(`/lodges/${id}`);
      if (response.data?.success && response.data?.data) {
        return backendLodgeToProperty(response.data.data);
      }
    } catch {
      // Lodge not found on backend, check curated collection
    }

    const fallbackMatch = CURATED_FUTMINNA_LODGES.find((l) => l.id === id);
    if (fallbackMatch) {
      return fallbackMatch;
    }

    return null;
  },

  /**
   * Save a lodge to user's saved wishlist
   */
  async saveLodge(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        `/lodges/${id}/save`
      );
      return {
        success: true,
        message: response.data?.message || "Lodge saved to wishlist",
      };
    } catch {
      return { success: false, message: "Could not save lodge to wishlist" };
    }
  },

  /**
   * Remove a lodge from saved wishlist (DELETE /api/lodges/:id/save)
   */
  async unsaveLodge(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/lodges/${id}/save`);
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  /**
   * Get all available lodge amenities from backend (GET /api/amenities)
   */
  async getAmenities(): Promise<Array<{ id: string; name: string; icon: string | null; category?: string | null }>> {
    try {
      const response = await apiClient.get<ApiResponse<Array<{ id: string; name: string; icon: string | null; category?: string | null }>>>(
        "/amenities"
      );
      return response.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Get user's saved wishlist lodges
   */
  async getSavedLodges(page = 1, pageSize = 20): Promise<{
    items: Property[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        "/lodges/saved",
        { params: { page, pageSize } }
      );
      const rawItems = response.data?.data?.items || response.data?.data?.lodges || [];
      return {
        items: rawItems.map(backendLodgeToProperty),
        total: response.data?.data?.total || rawItems.length,
        page: response.data?.data?.page || page,
        pageSize: response.data?.data?.pageSize || pageSize,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    }
  },
};
