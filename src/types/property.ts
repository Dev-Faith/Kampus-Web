export type CampusCode = "FUTMINNA" | "UNILAG" | "FUTA" | "UNIBEN" | "UI" | "OAU";

export type RoomType = "self-con" | "single-room" | "flatshare" | "studio";

export type LodgeStatus = "available" | "occupied" | "maintenance" | "offline";

export interface PropertyMedia {
  id: string;
  url: string;
  title: string;
  aspectRatio?: string;
}

export interface PropertyVirtualStaging {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  roomName: string;
}

export interface PropertyFloorPlan {
  url: string;
  title: string;
  dimensions: string;
}

export interface PropertyPanorama {
  url: string;
  title: string;
  room: string;
}

export interface Property {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number; // in NGN (Nigerian Naira)
  currency: string; // "₦"
  period?: "session" | "year" | "month";
  propertyType: RoomType;
  status: LodgeStatus;
  campus: CampusCode;
  campusName: string;
  distanceToCampus: string;
  proximityMinutes: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  cautionDeposit: number;
  serviceFee: number;
  escrowProtected: boolean;
  verifiedHost: boolean;
  powerSchedule: string;
  waterSupply: string;
  roommateMatchAvailable: boolean;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  featured: boolean;
  isNew: boolean;
  images: PropertyMedia[];
  virtualStaging?: PropertyVirtualStaging;
  floorPlan?: PropertyFloorPlan;
  panorama?: PropertyPanorama;
  amenities: string[];
  host: {
    name: string;
    title: string;
    phone: string;
    email: string;
    avatar: string;
    rating: number;
    responseTime: string;
    verifiedId: boolean;
  };
}
