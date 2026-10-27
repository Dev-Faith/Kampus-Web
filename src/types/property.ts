export type CampusCode = string;

export type RoomType = string;

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
  buildingId?: string | null;
  building?: {
    id: string;
    name: string | null;
    address: string | null;
    campusArea: string | null;
  } | null;
  title: string;
  unitLabel?: string | null;
  description: string;
  price: number; // in NGN (Nigerian Naira)
  currency: string; // "₦"
  period?: "session" | "year" | "month";
  propertyType: RoomType;
  status: LodgeStatus;
  campus: string;
  university?: string | null;
  campusArea?: string | null;
  distanceToCampus: number | null;
  numberOfRooms: number | null;
  serviceFee: number | null;
  verifiedHost: boolean | null;
  address: {
    street: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    } | null;
  };
  saved?: boolean;
  images: PropertyMedia[];
  amenities: string[];
  host?: {
    name: string;
    phone: string;
    email: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
}
