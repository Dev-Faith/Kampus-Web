"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarDays, Check, Loader2, MapPin, Share2, ShieldCheck, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { bookingsApi } from "@/api/bookings";
import { lodgesApi } from "@/api/lodges";
import { Property } from "@/types/property";
import { getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "@/lib/stores/useToastStore";

interface PropertyQuickViewDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

function dateAfterDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function PropertyQuickViewDialog({ property, isOpen, onClose }: PropertyQuickViewDialogProps) {
  const { isAuthenticated } = useAuthStore();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(property?.saved));
  const [moveInDate, setMoveInDate] = useState(dateAfterDays(7));
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!property) return null;

  const location = [property.building?.name, property.unitLabel, getCampusAreaLabel(property.campusArea), property.address.street, property.address.city, property.address.state]
    .filter(Boolean)
    .join(", ");

  const handleStartBooking = async () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    if (!moveInDate || new Date(`${moveInDate}T23:59:59`).getTime() < Date.now()) {
      toast.error("Choose a future move-in date");
      return;
    }

    setIsCreatingBooking(true);
    let bookingId: string | undefined;
    try {
      const result = await bookingsApi.createBooking({
        lodgeId: property.id,
        moveInDate: new Date(`${moveInDate}T12:00:00`).toISOString(),
      });
      bookingId = result.booking?.id;
      if (!bookingId) throw new Error("The booking response did not include an ID.");

      const payment = await bookingsApi.initPayment({ bookingId });
      if (!payment.paymentUrl) {
        window.location.assign("/bookings");
        return;
      }
      window.location.assign(payment.paymentUrl);
    } catch (error: any) {
      if (bookingId) {
        toast.error("Booking saved, payment not started", {
          description: error?.response?.data?.message || "Open your bookings to retry payment.",
          action: { label: "View bookings", onClick: () => window.location.assign("/bookings") },
        });
      } else {
        toast.error("Could not create booking", {
          description: error?.response?.data?.message || "Please try again.",
        });
      }
      setIsCreatingBooking(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = isSaved
        ? await lodgesApi.unsaveLodge(property.id)
        : await lodgesApi.saveLodge(property.id);
      if (!response.success) throw new Error("Could not update saved lodges.");
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Removed from saved lodges" : "Lodge saved");
    } catch (error: any) {
      toast.error("Could not update saved lodges", {
        description: error?.response?.data?.message || "Sign in and try again.",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/explore?q=${encodeURIComponent(property.title)}`);
      toast.success("Listing link copied");
    } catch {
      toast.error("Could not copy the listing link");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-slate-100 p-0 rounded-2xl">
          <DialogHeader className="sr-only"><DialogTitle>{property.title}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-64 md:min-h-[520px] bg-slate-100 dark:bg-[#121E18]">
              {property.images[0]?.url ? (
                <Image src={property.images[0].url} alt={property.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="grid h-full min-h-64 place-items-center text-slate-500">No listing photos</div>
              )}
              {property.images.length > 1 && <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{property.images.length} photos</div>}
            </div>

            <div className="flex flex-col gap-5 p-5 sm:p-7">
              <div>
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 dark:bg-[#17261F] px-3 py-1 capitalize">{property.propertyType}</span>
                  <span className="rounded-full bg-slate-100 dark:bg-[#17261F] px-3 py-1">{property.campus}</span>
                  {property.verifiedHost && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800"><Check className="h-3 w-3" /> Verified host</span>}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">{property.title}</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-slate-600 dark:text-[#93A89D]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a94c2e]" />{location || "Location not provided"}</p>
              </div>

              {property.description && <section><h3 className="mb-1 text-sm font-semibold">About this lodge</h3><p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-[#b6c5bc]">{property.description}</p></section>}

              {property.amenities.length > 0 && <section><h3 className="mb-2 text-sm font-semibold">Amenities</h3><ul className="flex flex-wrap gap-2">{property.amenities.map((amenity) => <li key={amenity} className="rounded-lg border border-slate-200 dark:border-[#22352B] px-2.5 py-1 text-xs">{amenity}</li>)}</ul></section>}

              {property.host?.name && <section className="flex items-center gap-3 border-y border-slate-200 dark:border-[#22352B] py-4"><div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 dark:bg-[#17261F]">{property.host.avatar ? <Image src={property.host.avatar} alt="" width={40} height={40} className="h-10 w-10 object-cover" /> : <UserRound className="h-5 w-5" />}</div><div><p className="text-sm font-medium">{property.host.name}</p><p className="text-xs text-slate-500">{property.host.verified ? "Verified host" : "Host"}{property.host.reviewCount > 0 ? ` · ${property.host.reviewCount} reviews` : ""}</p></div></section>}

              <section className="rounded-xl border border-slate-200 dark:border-[#22352B] bg-slate-50 dark:bg-[#121E18] p-4">
                <div className="flex items-baseline justify-between gap-3"><span className="text-2xl font-semibold tabular-nums">{property.currency}{property.price.toLocaleString()}</span><span className="text-xs text-slate-500">per session</span></div>
                {property.serviceFee != null && property.serviceFee > 0 && <p className="mt-2 flex justify-between text-xs text-slate-600 dark:text-[#93A89D]"><span>Service fee</span><span>{property.currency}{property.serviceFee.toLocaleString()}</span></p>}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#93A89D]"><ShieldCheck className="h-4 w-4 text-emerald-700" /> Payment and inspection status appear in your booking after checkout.</p>
              </section>

              <label className="space-y-1 text-sm font-medium">Move-in date<div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-[#344E40] px-3 py-2"><CalendarDays className="h-4 w-4 text-slate-500" /><input type="date" min={dateAfterDays(0)} value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} className="w-full bg-transparent text-sm outline-none" /></div></label>

              <div className="mt-auto space-y-2">
                <Button disabled={isCreatingBooking} onClick={handleStartBooking} className="w-full rounded-full bg-[#201B17] text-white hover:bg-[#352d27]">
                  {isCreatingBooking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting checkout…</> : "Reserve this lodge"}
                </Button>
                <div className="flex gap-2"><Button variant="outline" onClick={handleShare} className="flex-1 rounded-full"><Share2 className="mr-2 h-4 w-4" />Share</Button><Button variant="outline" onClick={handleSave} className="flex-1 rounded-full">{isSaved ? "Saved" : "Save lodge"}</Button></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
