"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Key,
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
  moveInKeyCode: string;
  status: "held_in_escrow" | "inspected_released" | "disputed";
  imageUrl: string;
}

export default function BookingsPage() {
  const { isAuthenticated } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [bookings, setBookings] = useState<EscrowBooking[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspection Modal
  const [inspectingBookingId, setInspectingBookingId] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");

  // Dispute Modal
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    bookingsApi.getBookings().then((res) => {
      const liveBookings: EscrowBooking[] = (res.items || []).map((b) => {
        const isDisputed = b.escrowStatus === "disputed";
        const isReleased = b.escrowStatus === "released" || b.status === "completed";
        const status: "held_in_escrow" | "inspected_released" | "disputed" = isDisputed
          ? "disputed"
          : isReleased
          ? "inspected_released"
          : "held_in_escrow";

        const bookingDate = b.createdAt
          ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Confirmed Booking";

        const deadline = b.moveInDate
          ? new Date(b.moveInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "24h arrival window";

        return {
          id: b.id,
          lodgeTitle: b.lodge?.title || "Verified Student Accommodation",
          campus: b.lodge?.address || "Campus Environs",
          roomType: b.lodge?.category || "Student Room",
          hostName: b.lodge?.landlord?.fullName || "Verified Campus Host",
          hostPhone: b.lodge?.landlord?.phone || "",
          amountHeld: b.amount || 0,
          currency: "₦",
          bookingDate,
          inspectionDeadline: `${deadline} (24h arrival window)`,
          moveInKeyCode: `KMP-${b.id.slice(0, 6).toUpperCase()}-KEY`,
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
  }, []);

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  const handleOpenInspection = (booking: EscrowBooking) => {
    setInspectingBookingId(booking.id);
    setInputCode(booking.moveInKeyCode);
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingBookingId) return;

    await bookingsApi.approveInspection(inspectingBookingId, inputCode);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === inspectingBookingId ? { ...b, status: "inspected_released" } : b
      )
    );

    setInspectingBookingId(null);
    showToast(
      "Physical inspection confirmed! Escrow funds have been authorized for release to the host."
    );
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
      "Dispute registered. Escrow payout is strictly frozen in custodial trust pending arbitration."
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="editorial-page bookings-page min-h-screen flex flex-col bg-background text-foreground transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="editorial-card max-w-md w-full rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] p-8 sm:p-10 text-center space-y-6 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Your bookings
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Sign in to view your stays
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] leading-relaxed">
                Your reservations and move-in details are saved to your student account. Sign in to pick up where you left off.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="editorial-action w-full rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 shadow-lg"
              >
                Sign In to Access Escrow Vault
              </Button>

              <Link href="/explore" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-slate-300 dark:border-[#22352B] bg-white dark:bg-[#0E1A14] text-slate-700 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white text-xs font-semibold"
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

      {/* Floating Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-white dark:bg-[#0E1A14] px-5 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="editorial-main flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-[#22352B] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="editorial-eyebrow text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Your stays
              </span>
            </div>
            <h1 className="editorial-title text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Your bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] mt-1">
              Your rent stays protected while you inspect the room and get ready to move in.
            </p>
          </div>

          <Link href="/explore">
            <Button
              variant="outline"
              className="rounded-full border-slate-300 dark:border-[#22352B] bg-white dark:bg-[#121E18] text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#17261F] text-xs font-bold"
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
                className="h-64 rounded-3xl border border-slate-200 dark:border-[#22352B] bg-slate-100 dark:bg-[#121E18] animate-pulse p-6"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="editorial-card rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] p-12 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Active Escrow Bookings</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] leading-relaxed">
                When you reserve a student lodge on Kampus, your rent is safely held in our licensed custodial escrow trust until you physically inspect your room and confirm move-in.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/explore">
                <Button className="editorial-action rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 shadow-lg">
                  Browse Verified Student Lodges
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isHeld = booking.status === "held_in_escrow";
              const isReleased = booking.status === "inspected_released";
              const isDisputed = booking.status === "disputed";

              return (
                <div
                  key={booking.id}
                  className="editorial-card rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] p-6 sm:p-8 space-y-6 shadow-md dark:shadow-xl"
                >
                  {/* Top Row: Info & Status */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] flex items-center justify-center">
                        {booking.imageUrl ? (
                          <Image
                            src={booking.imageUrl}
                            alt={booking.lodgeTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-[#586B61]" />
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-[#93A89D]">
                          {booking.id}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {booking.lodgeTitle}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-[#93A89D] flex items-center gap-1 mt-1">
                          <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{booking.campus}</span>
                          <span>•</span>
                          <span>{booking.roomType}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 text-left md:text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          isHeld
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : isReleased
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {isHeld && <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />}
                        {isReleased && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {isDisputed && (
                          <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        )}
                        <span>
                          {isHeld
                            ? "Funds in Escrow (Inspection Pending)"
                            : isReleased
                            ? "Settled to Landlord"
                            : "Funds Frozen (Dispute Active)"}
                        </span>
                      </span>

                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                        {booking.currency}
                        {booking.amountHeld.toLocaleString()} Held
                      </p>
                    </div>
                  </div>

                  {/* Move-in Key Code Box (When in Escrow) */}
                  {isHeld && (
                    <div className="rounded-2xl border border-[#c45b37]/25 bg-[#f7f1ed] dark:bg-[#1b1715] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#a94c2e] dark:text-[#e08b6a]">
                          Move-in Verification Secret Code
                        </span>
                        <p className="text-xs text-slate-600 dark:text-[#93A89D]">
                          Show this to the caretaker upon arrival to access your room for inspection:
                        </p>
                      </div>

                      <div className="rounded-xl bg-white dark:bg-[#0B130F] border border-[#c45b37]/35 px-5 py-2 font-mono text-base font-black tracking-widest text-[#a94c2e] dark:text-[#e08b6a]">
                        {booking.moveInKeyCode}
                      </div>
                    </div>
                  )}

                  {/* 3-Step Milestone Visualizer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-200 dark:border-[#22352B] pt-5">
                    <div className="rounded-xl bg-slate-50 dark:bg-[#0E1A14] p-3 text-xs border border-slate-200 dark:border-[#22352B]">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                        1. Payment Secured
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">Funds in Custodial Trust</p>
                      <span className="text-[11px] text-slate-500 dark:text-[#93A89D]">
                        Locked on {booking.bookingDate}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-[#0E1A14] p-3 text-xs border border-slate-200 dark:border-[#22352B]">
                      <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block mb-1">
                        2. Physical Inspection
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">Inspect Room & Facilities</p>
                      <span className="text-[11px] text-slate-500 dark:text-[#93A89D]">
                        Deadline: {booking.inspectionDeadline}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-[#0E1A14] p-3 text-xs border border-slate-200 dark:border-[#22352B]">
                      <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block mb-1">
                        3. Key Acceptance
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">Authorize Payout</p>
                      <span className="text-[11px] text-slate-500 dark:text-[#93A89D]">
                        Direct to {booking.hostName}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isHeld && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-[#22352B] pt-4">
                      <button
                        type="button"
                        onClick={() => handleOpenDispute(booking.id)}
                        className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:underline flex items-center gap-1.5"
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
                          className="flex-1 sm:flex-none border-slate-300 dark:border-[#22352B] bg-white dark:bg-[#17261F] text-slate-800 dark:text-[#F2F9F5] text-xs font-semibold"
                        >
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                          Call Landlord
                        </Button>

                        <Button
                          onClick={() => handleOpenInspection(booking)}
                          className="editorial-action flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Confirm Room & Release Escrow
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

      {/* Physical Inspection Confirmation Dialog */}
      <Dialog open={!!inspectingBookingId} onOpenChange={(open) => !open && setInspectingBookingId(null)}>
        <DialogContent className="editorial-dialog max-w-md bg-white dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-slate-100 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Confirm Inspection & Release Escrow
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-slate-600 dark:text-[#93A89D] -mt-2">
            Confirming that you have physically visited the room, tested electricity, water, and verified keys. Once authorized, the custodial trust will disburse funds to the host.
          </p>

          <form onSubmit={handleSubmitInspection} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">
                Enter Move-in Verification Code
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-center font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 text-base focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Student Escrow Guarantee:
              </p>
              <p>
                By clicking Confirm, you acknowledge receipt of key handover and satisfactory room conditions.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInspectingBookingId(null)}
                className="rounded-full border-slate-200 dark:border-[#22352B] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14231B] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="editorial-action rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Release Payout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Escrow Dispute Modal */}
      <Dialog open={!!disputeBookingId} onOpenChange={(open) => !open && setDisputeBookingId(null)}>
        <DialogContent className="editorial-dialog max-w-md bg-white dark:bg-[#0B130F] border border-rose-200 dark:border-rose-500/30 text-slate-900 dark:text-slate-100 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
              Open Escrow Dispute Ticket
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-slate-600 dark:text-[#93A89D] -mt-2">
            Disputing immediately freezes funds in licensed custodial trust. The landlord cannot withdraw funds until a Kampus field officer investigates.
          </p>

          <form onSubmit={handleSubmitDispute} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">
                Reason for Dispute
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Property does not match photos; power meter damaged, water borehole not operational."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-[11px] text-rose-800 dark:text-rose-300">
              Disputed funds are protected under Nigerian Consumer Protection & Tenancy Law.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDisputeBookingId(null)}
                className="rounded-full border-slate-200 dark:border-[#22352B] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14231B] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Freeze Escrow & Open Ticket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
