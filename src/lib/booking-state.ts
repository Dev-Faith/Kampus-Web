import type { Booking } from "@/types/api";
export function bookingLabel(b: Pick<Booking, "status" | "escrow">) {
  const status = b.status.toUpperCase(),
    payment = b.escrow?.status.toUpperCase();
  if (b.escrow?.reviewRequired || payment === "DISPUTED") return "Under review";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "REJECTED") return "Declined";
  if (payment === "REFUND_PENDING") return "Refund processing";
  if (payment === "REFUND_FAILED") return "Refund needs attention";
  if (payment === "REFUNDED") return "Refunded";
  if (payment === "PAYOUT_PENDING") return "Payout processing";
  if (status === "PENDING")
    return payment === "HELD"
      ? "Awaiting landlord"
      : !payment || payment === "PENDING"
        ? "Awaiting payment"
        : "Payment needs review";
  return (
    (
      {
        CONFIRMED: "Inspection pending",
        ACTIVE: "Active",
        COMPLETED: "Move-in verified",
      } as Record<string, string>
    )[status] || status
  );
}
export function bookingActions(b: Booking) {
  const status = b.status.toUpperCase(),
    payment = b.escrow?.status.toUpperCase();
  return {
    pay:
      status === "PENDING" &&
      (!payment || payment === "PENDING") &&
      b.escrowCheckoutEnabled === true,
    cancel:
      ["PENDING", "CONFIRMED", "ACTIVE"].includes(status) &&
      !b.escrow?.isInspected &&
      ["PENDING", "HELD"].includes(payment || "PENDING") &&
      !b.escrow?.reviewRequired,
    dispute:
      ["PENDING", "CONFIRMED", "ACTIVE"].includes(status) &&
      payment === "HELD" &&
      !b.escrow?.isInspected &&
      !b.dispute,
  };
}
