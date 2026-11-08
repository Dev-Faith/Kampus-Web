export type HousingIntent = "HAS_ROOM" | "SEARCH_TOGETHER";
export const INTENTS: Record<HousingIntent, string> = {
  HAS_ROOM: "I have a room to share",
  SEARCH_TOGETHER: "I want to find a place together",
};
export const postLabel = (intent?: HousingIntent | null) =>
  intent === "HAS_ROOM"
    ? "Has a room to share"
    : intent === "SEARCH_TOGETHER"
      ? "Looking for a place together"
      : "Roommate wanted";
export interface RoommateListing {
  id: string;
  studentId: string;
  name: string;
  avatar?: string | null;
  university: string;
  campus: string;
  department: string;
  level: string;
  budgetMax: number;
  annualShare?: number | null;
  housingIntent?: HousingIntent | null;
  area?: string | null;
  sleepSchedule: string;
  cleanliness: string;
  cookingHabits: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  isHidden?: boolean;
}
export interface RoommateListingInput {
  university: string;
  housingIntent: HousingIntent;
  area: string;
  annualShare: number;
  department?: string;
  level?: string;
  bio?: string;
  sleepSchedule?: string;
  cleanliness?: string;
  cookingHabits?: string;
}
export interface Introduction {
  id: string;
  listingId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CLOSED";
  direction: "SENT" | "RECEIVED";
  otherName: string;
  message: string | null;
  listingActive: boolean;
}
export interface RoommateChatLine {
  id: string;
  body: string;
  mine: boolean;
  createdAt: string;
}
export const rentShare = (p: RoommateListing) =>
  p.annualShare != null
    ? "₦" + Number(p.annualShare).toLocaleString("en-NG") + " / year"
    : "₦" + Number(p.budgetMax).toLocaleString("en-NG") + " / month";
export const requestLabel = (s: Introduction["status"]) =>
  ({
    PENDING: "Awaiting reply",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    CLOSED: "Closed",
  })[s];
