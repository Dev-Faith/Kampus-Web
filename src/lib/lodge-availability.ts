export type UnitAvailability =
  | "AVAILABLE"
  | "BOOKED"
  | "OCCUPIED"
  | "MAINTENANCE"
  | "OFFLINE";

// Public detail responses use occupancyStatus; landlord responses use status.
// Missing or unrecognised values must not make a unit appear bookable.
export function getUnitAvailability(unit: {
  occupancyStatus?: unknown;
  status?: unknown;
}): UnitAvailability | null {
  const value = unit.occupancyStatus ?? unit.status;
  if (typeof value !== "string") return null;
  switch (value.trim().toUpperCase()) {
    case "AVAILABLE":
      return "AVAILABLE";
    case "BOOKED":
      return "BOOKED";
    case "OCCUPIED":
      return "OCCUPIED";
    case "MAINTENANCE":
      return "MAINTENANCE";
    case "OFFLINE":
      return "OFFLINE";
    default:
      return null;
  }
}
