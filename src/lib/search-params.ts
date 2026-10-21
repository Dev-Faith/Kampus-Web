import {
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";

export const propertyTypes = [
  "all",
  "self-con",
  "single-room",
  "flatshare",
  "studio",
] as const;

export const campusCodes = [
  "all",
  "FUTMINNA",
  "UNILAG",
  "FUTA",
  "UI",
  "UNIBEN",
  "OAU",
] as const;

export const viewModes = ["split", "map", "grid"] as const;

export const sortOptions = [
  "featured",
  "price_asc",
  "price_desc",
  "distance",
] as const;

export const searchParams = {
  q: parseAsString.withDefault(""),
  campus: parseAsStringLiteral(campusCodes).withDefault("FUTMINNA"),
  type: parseAsStringLiteral(propertyTypes).withDefault("all"),
  minPrice: parseAsInteger.withDefault(0),
  maxPrice: parseAsInteger.withDefault(10000000),
  beds: parseAsInteger.withDefault(0),
  baths: parseAsInteger.withDefault(0),
  view: parseAsStringLiteral(viewModes).withDefault("split"),
  sort: parseAsStringLiteral(sortOptions).withDefault("featured"),
};
