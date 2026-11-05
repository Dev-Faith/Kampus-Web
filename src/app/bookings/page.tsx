"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  Lock,
  Upload,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bookingsApi } from "@/api/bookings";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "@/lib/stores/useToastStore";

interface EscrowBooking {
  id: string;
  lodgeTitle: string;
  campus: string;
  roomType: string;
  hostName: string;
  hostPhone: string;
  amountHeld: number;
  currency: string;
  bookingDate: string;
  inspectionDeadline: string;
  extensionStatus: string | null;
  extensionDeadline: string | null;
  extensionFee: number;
  extensionPaidCount: number;
  extensionTotalPaid: number;
  canExtendInspection: boolean;
  canResumeInspectionExtension: boolean;
  escrowCheckoutEnabled: boolean;
  paymentMode: "test" | "flutterwave" | "disabled";
  moveInKeyCode: string;
  status: "payment_pending" | "held_in_escrow" | "payout_pending" | "inspected_released" | "disputed" | "refund_pending" | "refund_failed" | "refunded";
  imageUrl: string;
}

export default function BookingsPage() {
  const { isAuthenticated } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [bookings, setBookings] = useState<EscrowBooking[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspection Modal
  // Dispute Modal
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    bookingsApi.getBookings().then((res) => {
      const liveBookings: EscrowBooking[] = (res.items || []).map((b) => {
        const escrowStatus = String(b.escrow?.status ?? b.escrowStatus ?? "").toUpperCase();
        const isDisputed = b.escrow?.reviewRequired || escrowStatus === "DISPUTED" || ["OPEN", "UNDER_REVIEW"].includes(b.dispute?.status ?? "");
        const status: EscrowBooking["status"] = isDisputed
          ? "disputed"
          : escrowStatus === "RELEASED"
          ? "inspected_released"
          : escrowStatus === "PAYOUT_PENDING"
          ? "payout_pending"
          : escrowStatus === "REFUND_PENDING"
          ? "refund_pending"
          : escrowStatus === "REFUND_FAILED"
          ? "refund_failed"
          : escrowStatus === "REFUNDED"
          ? "refunded"
          : escrowStatus === "HELD"
          ? "held_in_escrow"
          : "payment_pending";

        const bookingDate = b.createdAt
          ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Confirmed Booking";

        const deadline = b.escrow?.inspectionDeadline
          ? new Date(b.escrow.inspectionDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "To be confirmed";

        return {
          id: b.id,
          lodgeTitle: b.lodge?.title || "Verified Student Accommodation",
          campus: [b.lodge?.building?.name, b.lodge?.unitLabel, b.lodge?.building?.address, b.lodge?.address]
            .filter(Boolean)
            .join(" · ") || "Campus Environs",
          roomType: b.lodge?.category || "Student Room",
          hostName: b.lodge?.landlord?.fullName || "Verified Campus Host",
          hostPhone: b.lodge?.landlord?.phone || "",
          amountHeld: Number(b.escrow?.amount ?? b.totalAmount ?? b.amount ?? 0),
          currency: "₦",
          bookingDate,
          inspectionDeadline: deadline,
          extensionStatus: b.inspectionExtension?.status ?? null,
          extensionDeadline: b.inspectionExtension?.extendedDeadline ?? null,
          extensionFee: Number(b.inspectionExtensionFee ?? 1000),
          extensionPaidCount: Number(b.inspectionExtension?.paidCount ?? 0),
          extensionTotalPaid: Number(b.inspectionExtension?.totalPaidAmount ?? 0),
          canExtendInspection: Boolean(b.canExtendInspection),
          canResumeInspectionExtension: Boolean(b.canResumeInspectionExtension),
          escrowCheckoutEnabled: Boolean(b.escrowCheckoutEnabled),
          paymentMode: b.paymentMode ?? "disabled",
          moveInKeyCode: b.escrow?.inspectionCode || "",
          status,
          imageUrl: b.lodge?.images?.[0]?.url || "",
        };
      });
      setBookings(liveBookings);
      setIsLoading(false);
    }).catch(() => {
      setBookings([]);
      setIsLoading(false);
    });
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  const handleExtendInspection = async (bookingId: string) => {
    try {
      const result = await bookingsApi.initInspectionExtension({ bookingId });
      if (result.paymentMode === "test") {
        const confirmed = window.confirm(
          `Simulate this ₦${result.amount.toLocaleString()} inspection deferral payment? No real money will move.`,
        );
        if (!confirmed) return;
        await bookingsApi.completeTestPayment(result.paymentReference);
        showToast("Test deferral payment simulated. No money moved.");
        window.location.reload();
        return;
      }
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
      } else {
        showToast("Your inspection extension is already active.");
        window.location.reload();
      }
    } catch (error: any) {
      setToastMessage(error?.response?.data?.message || "We couldn't start the extension payment. Refresh and try again.");
    }
  };

  const handlePayBooking = async (bookingId: string) => {
    try {
      const result = await bookingsApi.initPayment({ bookingId });
      if (result.paymentMode === "test") {
        const confirmed = window.confirm(
          `Simulate this ₦${result.amount.toLocaleString()} test payment? No real money will move.`,
        );
        if (!confirmed) return;
        await bookingsApi.completeTestPayment(result.paymentReference);
        showToast("Test payment simulated. No money moved.");
        window.location.reload();
        return;
      }
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
        return;
      }
      window.location.reload();
    } catch (error: any) {
      setToastMessage(error?.response?.data?.message || "We couldn't start payment. Refresh and try again.");
    }
  };

  const handleOpenDispute = (bookingId: string) => {
    setDisputeBookingId(bookingId);
    setDisputeReason("");
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeBookingId || !disputeReason) return;

    await bookingsApi.openDispute(disputeBookingId, {
      reason: disputeReason,
    });

    setBookings((prev) =>
      prev.map((b) =>
        b.id === disputeBookingId ? { ...b, status: "disputed" } : b
      )
    );

    setDisputeBookingId(null);
    showToast(
      "Dispute registered. Kampus recorded the case and paused the payout decision pending review."
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="editorial-page bookings-page min-h-screen flex flex-col bg-background text-foreground transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="editorial-card max-w-md w-full rounded-3xl border border-border bg-card p-8 sm:p-10 text-center space-y-6 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft text-success border border-success/25 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-success">
                Your bookings
              </span>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Sign in to view your stays
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your reservations and move-in details are saved to your student account. Sign in to pick up where you left off.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="editorial-action w-full rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-3 shadow-lg"
              >
                Sign In to View Your Bookings
              </Button>

              <Link href="/explore" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-card text-foreground hover:text-foreground text-xs font-semibold"
                >
                  Browse Verified Student Lodges
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultRole="STUDENT"
        />
      </div>
    );
  }

  return (
    <div className="editorial-page bookings-page min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultRole="STUDENT" />

      {/* Floating Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-success/25 bg-card px-5 py-3 text-xs font-semibold text-success shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="editorial-main flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="editorial-eyebrow text-[11px] font-semibold uppercase tracking-widest text-brand-strong">
                Your stays
              </span>
            </div>
            <h1 className="editorial-title text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Your bookings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track payment, move-in inspection, and any open disputes for your bookings.
            </p>
          </div>

          <Link href="/explore">
            <Button
              variant="outline"
              className="rounded-full border-border bg-card text-foreground hover:bg-muted text-xs font-bold"
            >
              Browse More Lodges
            </Button>
          </Link>
        </div>

        {/* Bookings Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl border border-border bg-muted animate-pulse p-6"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="editorial-card rounded-3xl border border-border bg-card p-12 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft text-success border border-success/25">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">No Active Bookings</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Once payment is confirmed, your booking status and inspection code appear here. Inspect the room and collect the keys before sharing the code with your host. Open a dispute if the lodge does not match what you booked.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/explore">
                <Button className="editorial-action rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs px-6 py-2.5 shadow-lg">
                  Browse Verified Student Lodges
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isHeld = booking.status === "held_in_escrow";
              const isPaymentPending = booking.status === "payment_pending";
              const isPayoutPending = booking.status === "payout_pending";
              const isReleased = booking.status === "inspected_released";
              const isDisputed = booking.status === "disputed";

              return (
                <div
                  key={booking.id}
                  className="editorial-card rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-md "
                >
                  {/* Top Row: Info & Status */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="relative h-20 w-20 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border flex items-center justify-center">
                        {booking.imageUrl ? (
                          <Image
                            src={booking.imageUrl}
                            alt={booking.lodgeTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="block break-all text-[11px] font-mono text-muted-foreground">
                          {booking.id}
                        </span>
                        <h3 className="break-words text-base sm:text-lg font-semibold text-foreground mt-0.5">
                          {booking.lodgeTitle}
                        </h3>
                        <p className="break-words text-xs leading-5 text-muted-foreground mt-1">
                          <GraduationCap className="mr-1 inline-block h-3.5 w-3.5 text-brand-strong" />
                          <span>{booking.campus}</span>
                          <span className="mx-1">·</span>
                          <span>{booking.roomType}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 text-left md:text-right">
                      <span
                        className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                          isHeld
                            ? "bg-warning-soft text-warning  border border-warning/25"
                            : isReleased
                            ? "bg-success-soft text-success  border border-success/25"
                            : "bg-destructive-soft text-destructive  border border-destructive/25"
                        }`}
                      >
                        {isHeld && <Clock className="h-3.5 w-3.5 text-warning" />}
                        {isReleased && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        )}
                        {isDisputed && (
                          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span>
                          {isHeld
                            ? "Inspection Pending"
                            : isReleased
                            ? "Settled to Landlord"
                            : isPayoutPending
                            ? "Inspection Verified · Payout Pending"
                            : booking.status === "refund_pending"
                            ? "Refund Processing"
                            : booking.status === "refund_failed"
                            ? "Refund Failed · Support Needed"
                            : booking.status === "refunded"
                            ? "Refund Confirmed"
                            : isPaymentPending
                            ? "Payment Pending"
                            : "Under Review · Payout Paused"}
                        </span>
                      </span>

                      <p className="text-lg font-semibold text-foreground mt-1 tabular-nums">
                        {booking.currency}
                        {booking.amountHeld.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Move-in Key Code Box (When in Escrow) */}
                  {isHeld && (
                    <div className="rounded-2xl border border-brand/25 bg-surface-sand p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-strong">
                          Move-in Verification Secret Code
                        </span>
                        <p className="text-xs text-muted-foreground">
                          After inspecting the room and receiving the keys, share this code with your host to record your approval:
                        </p>
                      </div>

                      <div className="rounded-xl bg-card border border-brand/35 px-5 py-2 font-mono text-base font-semibold tracking-widest text-brand-strong">
                        {booking.moveInKeyCode || "Available after payment confirmation"}
                      </div>
                    </div>
                  )}

                  {/* 3-Step Milestone Visualizer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-border pt-5">
                    <div className="rounded-xl bg-muted p-3 text-xs border border-border">
                      <span className="text-[10px] font-bold uppercase text-success block mb-1">
                        1. Payment Status
                      </span>
                      <p className="font-semibold text-foreground">
                         {isPaymentPending
                           ? "Awaiting payment"
                           : booking.paymentMode === "test"
                           ? "Test payment simulated"
                           : "Payment confirmed by Kampus"}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                         {booking.paymentMode === "test" ? "Test mode · No money moved" : `Locked on ${booking.bookingDate}`}
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted p-3 text-xs border border-border">
                      <span className="text-[10px] font-bold uppercase text-warning block mb-1">
                        2. Physical Inspection
                      </span>
                      <p className="font-semibold text-foreground">Inspect Room & Facilities</p>
                      <span className="text-[11px] text-muted-foreground">
                        Deadline: {booking.inspectionDeadline}
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted p-3 text-xs border border-border">
                      <span className="text-[10px] font-bold uppercase text-info block mb-1">
                        3. Key Acceptance
                      </span>
                      <p className="font-semibold text-foreground">Authorize Payout</p>
                      <span className="text-[11px] text-muted-foreground">
                        Direct to {booking.hostName}
                      </span>
                    </div>
                  </div>

                  {(booking.canExtendInspection || booking.canResumeInspectionExtension || ["PAID", "PENDING", "REFUND_PENDING", "REFUND_FAILED", "REFUNDED"].includes(booking.extensionStatus || "")) && (
                    <div className="rounded-2xl border border-warning/25 bg-warning-soft p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">
                          {booking.extensionStatus === "PAID" ? "Inspection deadline extended" : "Need more time to inspect?"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.extensionStatus === "PAID"
                            ? booking.paymentMode === "test"
                              ? `Test deferral ${booking.extensionPaidCount || 1} of 4 is recorded through ${booking.extensionDeadline ? new Date(booking.extensionDeadline).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", month: "short", day: "numeric", year: "numeric" }) : booking.inspectionDeadline}. No money moved.`
                              : `Deferral ${booking.extensionPaidCount || 1} of 4 is active through ${booking.extensionDeadline ? new Date(booking.extensionDeadline).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", month: "short", day: "numeric", year: "numeric" }) : booking.inspectionDeadline}. You have paid ₦${booking.extensionTotalPaid.toLocaleString()} in extension fees.`
                            : booking.extensionStatus === "REFUND_PENDING"
                            ? booking.paymentMode === "test" ? "The simulated extension refund is recorded locally. No money moved." : "Your extension fee refund is being processed by the payment provider."
                            : booking.extensionStatus === "REFUND_FAILED"
                            ? booking.paymentMode === "test" ? "The simulated extension refund could not be recorded. Please contact Kampus support." : "The provider could not complete the extension fee refund. Please contact Kampus support."
                            : booking.extensionStatus === "REFUNDED"
                            ? booking.paymentMode === "test" ? "The test extension refund was recorded locally. No money moved." : "Your extension fee has been refunded."
                            : booking.extensionStatus === "PENDING"
                            ? booking.paymentMode === "test"
                              ? `Test deferral ${booking.extensionPaidCount + 1} of 4 is awaiting your confirmation. No money will move.`
                              : `Deferral ${booking.extensionPaidCount + 1} of 4 is awaiting payment confirmation. Complete checkout today to add one calendar day.`
                            : `Each deferral adds one calendar day for ₦${booking.extensionFee.toLocaleString()}. You can defer up to four times (₦${(booking.extensionFee * 4).toLocaleString()} total), with each payment due on the day after your current deadline.`}
                        </p>
                      </div>
                      {(booking.canExtendInspection || booking.canResumeInspectionExtension) && (
                        <Button
                          variant="outline"
                          onClick={() => handleExtendInspection(booking.id)}
                          className="shrink-0 border-warning/25 bg-card text-foreground text-xs font-bold"
                        >
                          {booking.extensionStatus === "PENDING"
                            ? booking.paymentMode === "test" ? "Resume test deferral" : "Resume today’s deferral payment"
                            : booking.paymentMode === "test" ? `Simulate deferral · ₦${booking.extensionFee.toLocaleString()}` : `Defer one day · ₦${booking.extensionFee.toLocaleString()}`}
                        </Button>
                      )}
                      {booking.extensionStatus === "PENDING" && (
                        <button type="button" onClick={() => window.location.reload()} className="text-xs font-semibold text-warning underline">
                          Refresh payment status
                        </button>
                      )}
                    </div>
                  )}

                  {isPaymentPending && booking.escrowCheckoutEnabled && (
                    <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {booking.paymentMode === "test"
                          ? "Test mode is on. Completing this step records a simulated payment; no money moves."
                          : "Pay Kampus through Flutterwave. Landlord payout waits for inspection approval and settlement."}
                      </p>
                      <Button onClick={() => handlePayBooking(booking.id)} className="shrink-0 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold">
                        {booking.paymentMode === "test" ? "Simulate test payment" : "Continue to payment"}
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(isHeld || isPayoutPending) && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={() => handleOpenDispute(booking.id)}
                        className="text-xs font-bold text-destructive hover:text-destructive hover:underline flex items-center gap-1.5"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>Report Issue / Room Not as Described</span>
                      </button>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() =>
                            alert(
                              booking.hostPhone
                                ? `Calling Host ${booking.hostName} at ${booking.hostPhone}`
                                : `Host ${booking.hostName} can be messaged via your Kampus dashboard`
                            )
                          }
                          className="flex-1 sm:flex-none border-border bg-card text-foreground text-xs font-semibold"
                        >
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-success" />
                          Call Landlord
                        </Button>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Escrow Dispute Modal */}
      <Dialog open={!!disputeBookingId} onOpenChange={(open) => !open && setDisputeBookingId(null)}>
        <DialogContent className="editorial-dialog max-w-md bg-card border border-destructive/25 text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-destructive">
              <AlertCircle className="h-5 w-5" />
              Report a Booking Problem Ticket
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground -mt-2">
            Opening a dispute marks this booking as disputed so Kampus support can review it before the payout decision.
          </p>

          <form onSubmit={handleSubmitDispute} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reason for Dispute
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Property does not match photos; power meter damaged, water borehole not operational."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-destructive/25"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-destructive-soft border border-destructive/25 text-[11px] text-destructive">
              Disputed funds are protected under Nigerian Consumer Protection & Tenancy Law.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDisputeBookingId(null)}
                className="rounded-full border-border text-foreground hover:bg-muted text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-destructive-soft hover:bg-destructive/20 text-destructive font-bold text-xs"
              >
                Pause Payout & Open Ticket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
