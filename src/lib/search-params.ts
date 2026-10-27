import {
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";
import { ACCOMMODATION_TYPE_IDS } from "@/lib/constants/accommodation-types";
import { CAMPUS_AREA_CODES } from "@/lib/constants/campus-areas";

export const propertyTypes = [
  "all",
  ...ACCOMMODATION_TYPE_IDS,
] as const;

export const campusCodes = [
  "FUTMINNA",
  "UNILAG",
  "FUTA",
  "UI",
  "UNIBEN",
  "OAU",
] as const;

export const campusAreaCodes = CAMPUS_AREA_CODES;

export const viewModes = ["split", "map", "grid"] as const;

export const sortOptions = [
  "featured",
  "price_asc",
  "price_desc",
] as const;

export const searchParams = {
  q: parseAsString.withDefault(""),
  campus: parseAsStringLiteral(campusCodes).withDefault("FUTMINNA"),
  area: parseAsStringLiteral(campusAreaCodes).withDefault("all"),
  type: parseAsStringLiteral(propertyTypes).withDefault("all"),
  minPrice: parseAsInteger.withDefault(0),
  maxPrice: parseAsInteger.withDefault(10000000),
  view: parseAsStringLiteral(viewModes).withDefault("split"),
  sort: parseAsStringLiteral(sortOptions).withDefault("featured"),
};
