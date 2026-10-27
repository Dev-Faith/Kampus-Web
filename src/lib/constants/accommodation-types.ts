export const ACCOMMODATION_TYPE_IDS = [
  "single_room_shared",
  "self_contained",
  "one_bedroom_flat",
  "two_bedroom_flat",
] as const;

export type AccommodationType = (typeof ACCOMMODATION_TYPE_IDS)[number];

export const ACCOMMODATION_TYPE_OPTIONS: {
  id: AccommodationType;
  label: string;
  filterLabel: string;
}[] = [
  {
    id: "single_room_shared",
    label: "Single room (toilet outside the room, no kitchen)",
    filterLabel: "Single room (toilet outside the room, no kitchen)",
  },
  {
    id: "self_contained",
    label: "Self-contained apartment",
    filterLabel: "Self-contained apartment",
  },
  {
    id: "one_bedroom_flat",
    label: "One-bedroom flat (room and parlour)",
    filterLabel: "One-bedroom flat",
  },
  {
    id: "two_bedroom_flat",
    label: "Two-bedroom flat",
    filterLabel: "Two-bedroom flat",
  },
];

const accommodationTypeLabels: Record<AccommodationType, string> =
  Object.fromEntries(ACCOMMODATION_TYPE_OPTIONS.map(({ id, label }) => [id, label])) as Record<AccommodationType, string>;

export function getAccommodationTypeLabel(category?: string | null): string {
  if (!category) return "Accommodation";
  return accommodationTypeLabels[category as AccommodationType]
    ?? category.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
