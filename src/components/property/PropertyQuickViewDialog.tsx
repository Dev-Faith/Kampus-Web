"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bed,
  Bath,
  Maximize,
  Calendar,
  MapPin,
  Sparkles,
  Compass,
  Layers,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap,
  Zap,
  Droplets,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  Loader2,
  User,
  X,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { Property } from "@/types/property";
import { usePropertyInteractionStore } from "@/lib/stores/usePropertyInteractionStore";
import { VirtualStagingSlider } from "@/components/media/VirtualStagingSlider";
import { PanoramaViewer } from "@/components/media/PanoramaViewer";
import { FloorPlanLightbox } from "@/components/media/FloorPlanLightbox";
import { PropertyCardCarousel } from "@/components/property/PropertyCardCarousel";
import { Button } from "@/components/ui/button";
import { bookingsApi } from "@/api/bookings";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "@/lib/stores/useToastStore";

interface PropertyQuickViewDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyQuickViewDialog({
  property,
  isOpen,
  onClose,
}: PropertyQuickViewDialogProps) {
  const { activeTab, setActiveTab } = usePropertyInteractionStore();
  const { user, isAuthenticated } = useAuthStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payRef, setPayRef] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!property) return null;

  const totalMoveIn =
    property.price + property.cautionDeposit + property.serviceFee;

  const handleStartBooking = async () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    setIsCheckingOut(true);
    const result = await bookingsApi.createBooking({
      lodgeId: property.id,
      moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const bookingId = (result as any)?.booking?.id || (result as any)?.id;

    const payment = await bookingsApi.initPayment({
      bookingId,
      amount: totalMoveIn,
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setPayRef(payment.paymentReference);
    toast.info("Escrow Checkout Ready", {
      description: "Review fee breakdown and authorize custodial deposit.",
    });
  };

  const handleCompletePayment = async () => {
    if (!payRef) return;
    setIsProcessingPay(true);

    await bookingsApi.verifyPayment({
      reference: payRef,
      amount: totalMoveIn,
    });

    setIsProcessingPay(false);
    setPaySuccess(true);
    toast.success("Payment Secured in Escrow!", {
      description: "Funds held safely in trust. Move-in verification code generated.",
    });
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        description: `Direct link for ${property.title} ready to share.`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[96vw] sm:w-[94vw] max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-hidden bg-[#0B130F] border border-[#22352B] text-slate-100 p-0 sm:rounded-3xl shadow-2xl relative flex flex-col"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{property.title}</DialogTitle>
        </DialogHeader>

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-40 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/75 hover:bg-black/95 text-slate-300 hover:text-white border border-[#22352B] flex items-center justify-center backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable Modal Content (2-Column Desktop Grid) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
            {/* Left Column: Media Showcase, Description, Amenities, Host (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-[#22352B]">
              {/* Media Mode Tabs */}
              <div className="flex items-center gap-1.5 p-3 sm:p-3.5 bg-[#0e1813] border-b border-[#22352B] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-14">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    activeTab === "overview"
                      ? "bg-white text-slate-950 shadow-md font-bold"
                      : "text-[#93A89D] hover:text-white hover:bg-[#17261F]"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Photo Gallery</span>
                </button>

                {property.virtualStaging && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("staging")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                      activeTab === "staging"
                        ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                        : "text-[#93A89D] hover:text-white hover:bg-[#17261F]"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-950 sm:text-emerald-950" />
                    <span>Furnished Staging</span>
                  </button>
                )}

                {property.panorama && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("panorama")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                      activeTab === "panorama"
                        ? "bg-indigo-500 text-white shadow-md font-bold"
                        : "text-[#93A89D] hover:text-white hover:bg-[#17261F]"
                    }`}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>360° Spherical Tour</span>
                  </button>
                )}

                {property.floorPlan && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("floorplan")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                      activeTab === "floorplan"
                        ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                        : "text-[#93A89D] hover:text-white hover:bg-[#17261F]"
                    }`}
                  >
                    <Maximize className="h-3.5 w-3.5" />
                    <span>Floor Plan</span>
                  </button>
                )}
              </div>

              {/* Active Media Container */}
              <div className="p-3 sm:p-5 bg-[#080E0B]">
                {activeTab === "overview" && (
                  <PropertyCardCarousel
                    images={property.images}
                    title={property.title}
                    aspectRatio="aspect-[16/10]"
                    className="rounded-2xl border border-[#22352B] shadow-xl overflow-hidden"
                  />
                )}

                {activeTab === "staging" && property.virtualStaging && (
                  <VirtualStagingSlider
                    staging={property.virtualStaging}
                    className="rounded-2xl shadow-xl overflow-hidden"
                  />
                )}

                {activeTab === "panorama" && property.panorama && (
                  <PanoramaViewer
                    panorama={property.panorama}
                    className="rounded-2xl shadow-xl overflow-hidden"
                  />
                )}

                {activeTab === "floorplan" && property.floorPlan && (
                  <FloorPlanLightbox
                    floorPlan={property.floorPlan}
                    galleryImages={property.images}
                    className="rounded-2xl shadow-xl overflow-hidden"
                  />
                )}
              </div>

              {/* Narrative & Specifications */}
              <div className="p-5 sm:p-6 space-y-6 bg-[#0B130F]">
                {/* Verified Amenities */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#93A89D] mb-3">
                    Verified Lodge Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-[#121E18] border border-[#22352B] px-3 py-1.5 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#93A89D] mb-2">
                    Lodge Details & Living Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-[#D2E0D8]">
                    {property.description}
                  </p>
                </div>

                {/* Host Verification Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#121E18] border border-[#22352B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-[#17261F] flex items-center justify-center shrink-0">
                      {property.host.avatar ? (
                        <Image
                          src={property.host.avatar}
                          alt={property.host.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {property.host.name}
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          ★ {property.host.rating} Verified Host
                        </span>
                      </h4>
                      <p className="text-xs text-[#93A89D] mt-0.5">
                        {property.host.title} • Typical response: &lt; 15 mins
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#22352B] bg-[#17261F] text-[#F2F9F5] hover:bg-[#22352B] text-xs font-semibold"
                    onClick={() => {
                      toast.info(`Direct Channel to ${property.host.name}`, {
                        description: `Host phone: ${property.host.phone || "Available on Escrow booking"}`,
                      });
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2 text-emerald-400" />
                    Message Host
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing, Specs & Escrow Reservation (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-7 bg-[#0E1A14] space-y-6">
              <div className="space-y-6">
                {/* Badges & Title */}
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      {property.propertyType}
                    </span>

                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>{property.distanceToCampus}</span>
                    </span>

                    <span className="rounded-full bg-[#083325] border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>100% Escrow Protected</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {property.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#93A89D] mt-1.5 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {property.address.street}, {property.address.neighborhood},{" "}
                      {property.address.city}, {property.address.state}
                    </span>
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-[#121E18] border border-[#22352B]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                      {property.currency}
                      {property.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#93A89D] font-medium">
                      / academic session
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Direct student price • 0% agency commission</span>
                  </p>
                </div>

                {/* Key Student Living Specs (4-box grid) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#121E18] border border-[#22352B]">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                      <Zap className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Power Supply
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-tight break-words">
                      {property.powerSchedule}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121E18] border border-[#22352B]">
                    <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                      <Droplets className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Water Supply
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-tight break-words">
                      {property.waterSupply}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121E18] border border-[#22352B]">
                    <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                      <Bed className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Room Setup
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {property.bedrooms} Bed • {property.bathrooms} Bath
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121E18] border border-[#22352B]">
                    <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Duration
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-tight">
                      Full Session (1 Yr)
                    </p>
                  </div>
                </div>

                {/* Custodial Escrow Breakdown Card */}
                <div className="rounded-2xl border border-emerald-500/30 bg-[#083325]/40 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4" />
                      Custodial Escrow Breakdown
                    </span>
                    <span className="text-[11px] text-[#93A89D]">
                      Held in trust
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#93A89D]">
                    <div className="flex justify-between">
                      <span>Base Lodge Rent (1 Academic Session)</span>
                      <span className="text-white font-semibold tabular-nums">
                        {property.currency}{property.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refundable Caution Deposit</span>
                      <span className="text-white font-semibold tabular-nums">
                        {property.currency}{property.cautionDeposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kampus Escrow Protection & Legal Fee</span>
                      <span className="text-white font-semibold tabular-nums">
                        {property.currency}{property.serviceFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#22352B] pt-2 text-sm font-bold text-white">
                      <span>Total Escrow Deposit</span>
                      <span className="text-emerald-400 font-extrabold tabular-nums">
                        {property.currency}{totalMoveIn.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-[#93A89D] leading-relaxed border-t border-[#22352B]/60">
                    🔒 <strong className="text-emerald-300">Protected by Kampus Trust:</strong> Your money is held securely and only released to the host after you inspect the lodge and enter your Move-in Verification Code.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  className="w-full py-4 h-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  onClick={handleStartBooking}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Reserve via Escrow • {property.currency}{totalMoveIn.toLocaleString()}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#22352B] bg-[#121E18] text-[#F2F9F5] hover:bg-[#17261F] text-xs font-semibold py-2.5"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                    Share Listing
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#22352B] bg-[#121E18] text-[#F2F9F5] hover:bg-[#17261F] text-xs font-semibold py-2.5"
                    onClick={() => {
                      toast.success("Added to Shortlist", {
                        description: `${property.title} saved to your favorites.`,
                      });
                    }}
                  >
                    ♥ Save to Shortlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Paystack Custodial Escrow Checkout Modal */}
      <Dialog open={isCheckingOut} onOpenChange={(open) => !open && setIsCheckingOut(false)}>
        <DialogContent className="max-w-md bg-[#0B130F] border border-[#22352B] text-slate-100 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Kampus Custodial Escrow Checkout
            </DialogTitle>
          </DialogHeader>

          {!paySuccess ? (
            <div className="space-y-5 mt-2">
              <div className="p-4 rounded-2xl bg-[#121E18] border border-[#22352B] space-y-2">
                <div className="text-xs text-[#93A89D]">Accommodation:</div>
                <div className="text-sm font-bold text-white">{property.title}</div>
                <div className="text-[11px] text-emerald-400 font-semibold">{property.campusName}</div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-2 text-xs border-y border-[#22352B] py-3">
                <div className="flex justify-between text-[#93A89D]">
                  <span>Rent (1 Academic Session):</span>
                  <span className="text-white font-medium">₦{property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#93A89D]">
                  <span>Refundable Caution Deposit:</span>
                  <span className="text-white font-medium">₦{property.cautionDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#93A89D]">
                  <span>Kampus Custodial Escrow & Trust Fee:</span>
                  <span className="text-white font-medium">₦{property.serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#22352B]">
                  <span>Total Escrow Amount:</span>
                  <span className="text-emerald-400">₦{totalMoveIn.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Licensed Trustee Guarantee:</span>
                </div>
                <p>
                  Funds will NOT be given to the host until you arrive on campus, inspect the room, and submit your Move-in Verification Code.
                </p>
              </div>

              {payRef && (
                <div className="text-[10px] font-mono text-[#93A89D] text-center">
                  Gateway Reference: <span className="text-white">{payRef}</span>
                </div>
              )}

              <Button
                disabled={isProcessingPay}
                onClick={handleCompletePayment}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl"
              >
                {isProcessingPay ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authorizing with Paystack Escrow...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay ₦{totalMoveIn.toLocaleString()} into Escrow</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Payment Held in Escrow!</h3>
                <p className="text-xs text-[#93A89D]">
                  Your reservation is secured. Your Move-in Verification Code is ready on your bookings dashboard.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/bookings">
                  <Button
                    onClick={() => {
                      setIsCheckingOut(false);
                      onClose();
                    }}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-6 py-2"
                  >
                    <span>View My Escrow Booking</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRole="STUDENT"
      />
    </Dialog>
  );
}
