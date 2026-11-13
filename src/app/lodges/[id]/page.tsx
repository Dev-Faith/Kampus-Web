"use client";
import { useSavedUnits } from "@/lib/stores/useSavedUnits";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import {
  Panel,
  ErrorNotice,
  Loading,
  inputClass,
  money,
  copyText,
  type ApiPage,
} from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { authError } from "@/lib/auth-errors";
import { apiClient } from "@/api/client";
import { bookingsApi } from "@/api/bookings";
import { toast } from "@/lib/stores/useToastStore";
import { getAccommodationTypeLabel } from "@/lib/constants/accommodation-types";
import { getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { listingUrl } from "@/lib/constants/site";
import type { BackendLodge, Booking } from "@/types/api";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  return (
    <>
      <Navbar />
      <main className="editorial-page min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Unit key={id + ":" + user?.id} id={id} />
        </div>
      </main>
    </>
  );
}
function Unit({ id }: { id: string }) {
  const router = useRouter(),
    user = useAuthStore((s) => s.user),
    [auth, setAuth] = useState(false),
    [index, setIndex] = useState(-1),
    [busy, setBusy] = useState(false),
    [actionError, setError] = useState("");
  const {
    data: l,
    error,
    reload,
  } = useApiResource<BackendLodge>(`/lodges/${encodeURIComponent(id)}`);
  const reservation = useApiResource<ApiPage<Booking>>(
    user?.role === "STUDENT"
      ? `/bookings?view=active&lodgeId=${encodeURIComponent(id)}&pageSize=1`
      : null,
  );
  const saved = useApiResource<{ saved: boolean }>(
    user?.role === "STUDENT" ? `/lodges/${encodeURIComponent(id)}/save` : null,
  );
  async function reserve(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      setAuth(true);
      return;
    }
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await bookingsApi.createBooking({
        lodgeId: id,
        moveInDate: new Date(
          String(data.get("moveInDate")) + "T12:00:00+01:00",
        ).toISOString(),
        specialRequests: String(data.get("requests")).trim() || undefined,
      });
      if (!r.booking?.id)
        throw new Error(
          "Reservation response is incomplete. Refresh your bookings before retrying.",
        );
      router.push(`/bookings/${r.booking.id}`);
    } catch (e) {
      setError(authError(e, "Couldn’t reserve this unit."));
      reservation.reload();
      reload();
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!user) {
      setAuth(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (saved.data?.saved) await apiClient.delete(`/lodges/${id}/save`);
      else await apiClient.post(`/lodges/${id}/save`);
      saved.reload();
      void useSavedUnits.getState().load(true);
    } catch (e) {
      setError(authError(e, "Couldn’t update saved units."));
    } finally {
      setBusy(false);
    }
  }
  if (!l)
    return (
      <>
        <Link href="/explore" className="text-brand-strong">
          ← Explore units
        </Link>
        <ErrorNotice error={error} retry={reload} />
        {!error && <Loading />}
      </>
    );
  const photos = [...(l.images || [])].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
  const map =
    l.latitude != null && l.longitude != null
      ? `${l.latitude},${l.longitude}`
      : [l.address, l.city, l.state].filter(Boolean).join(", ");
  const existing = reservation.data?.items[0];
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const minDate =
    l.availableFrom && l.availableFrom.slice(0, 10) > today
      ? l.availableFrom.slice(0, 10)
      : today;
  return (
    <div className="space-y-7">
      <Link href="/explore" className="text-brand-strong">
        ← Explore units
      </Link>
      <header className="space-y-3">
        <p className="editorial-eyebrow">
          {getCampusAreaLabel(l.campusArea)} · {l.university || "FUTMINNA"}
        </p>
        <h1 className="editorial-title text-4xl sm:text-5xl">{l.title}</h1>
        <p className="text-muted-foreground">
          {l.building?.name}
          {l.unitLabel && ` · ${l.unitLabel}`} ·{" "}
          {getAccommodationTypeLabel(l.category)}
        </p>
      </header>
      <ErrorNotice error={actionError} />
      <div className="flex flex-wrap gap-3">
        {(!user || user.role === "STUDENT") && (
          <Button
            variant="outline"
            disabled={busy || (!!user && (!saved.data || !!saved.error))}
            onClick={() => void save()}
          >
            {saved.data?.saved ? "Remove from saved" : "Save unit"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() =>
            void copyText(listingUrl(l.id)).then(
              (ok) => ok && toast.success("Listing link copied"),
            )
          }
        >
          Share unit
        </Button>
        <a
          target="_blank"
          rel="noreferrer"
          className="self-center text-brand-strong underline"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(map)}`}
        >
          View location on map
        </a>
      </div>
      <ErrorNotice error={saved.error} retry={saved.reload} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id || p.url}
            onClick={() => setIndex(i)}
            className={`relative overflow-hidden rounded-2xl bg-muted ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}
            aria-label={`Open photo ${i + 1}`}
          >
            <Image
              src={p.url}
              unoptimized
              alt={`${l.title} photo ${i + 1}`}
              fill
              sizes="(max-width:640px) 90vw, 50vw"
              className="object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>
      {!photos.length && (
        <Panel>
          <p>No photos provided.</p>
        </Panel>
      )}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={photos.map((p) => ({ src: p.url }))}
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Panel>
            <h2 className="text-2xl font-semibold">About this unit</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {l.description || "No description provided."}
            </p>
            <p>
              {l.numberOfRooms || 1} room(s) · Maximum {l.capacity || 1}{" "}
              occupant(s)
              {l.distanceToCampus != null &&
                ` · ${l.distanceToCampus} km from campus`}
            </p>
            <p>{[l.address, l.city, l.state].filter(Boolean).join(", ")}</p>
            <h3 className="font-semibold">Amenities</h3>
            <ul className="flex flex-wrap gap-2">
              {l.amenities?.map((a) => (
                <li
                  key={a.id}
                  className="rounded-full bg-muted px-3 py-2 text-sm"
                >
                  {a.name}
                </li>
              ))}
            </ul>
            {l.rules?.length ? (
              <>
                <h3 className="font-semibold">House rules</h3>
                <ul className="list-disc space-y-2 pl-5">
                  {l.rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </Panel>
          <Panel>
            <h2 className="text-xl font-semibold">Your landlord</h2>
            <p>
              {l.landlord?.fullName || "Landlord"}
              {l.landlord?.isVerified ? " · Verified" : ""}
            </p>
            {l.landlord?.phone && (
              <div className="flex flex-wrap gap-4">
                <a
                  className="text-brand-strong underline"
                  href={`tel:${l.landlord.phone}`}
                >
                  Call landlord
                </a>
                <a
                  className="text-brand-strong underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${l.landlord.phone.replace(/\D/g, "")}`}
                >
                  WhatsApp landlord
                </a>
              </div>
            )}
          </Panel>
        </div>
        <div>
          <Panel>
            <h2 className="text-2xl font-semibold">
              {money(l.rent)}{" "}
              <span className="text-base font-normal text-muted-foreground">
                / year
              </span>
            </h2>
            <p className="text-muted-foreground">
              Service fee: {money(l.serviceFee)}
            </p>
            <p className="border-t border-border pt-4 font-semibold">
              Booking total: {money(Number(l.rent) + Number(l.serviceFee))}
            </p>
            <ErrorNotice error={reservation.error} retry={reservation.reload} />
            {existing ? (
              <>
                <p>You already have a reservation for this unit.</p>
                <Link
                  className="block rounded-full bg-primary px-5 py-3 text-center text-primary-foreground"
                  href={`/bookings/${existing.id}`}
                >
                  Continue your booking
                </Link>
              </>
            ) : user && user.role !== "STUDENT" ? (
              <p>
                Reservations require a separate student account. You are signed
                in as a {user.role.toLowerCase()}.
              </p>
            ) : user?.profileStatus === "UNCOMPLETED" ||
              user?.profileStatus === "PENDING" ? (
              <Link className="text-brand-strong underline" href="/settings">
                Complete your profile before booking
              </Link>
            ) : l.status.toUpperCase() !== "AVAILABLE" ? (
              <p>This unit is currently unavailable.</p>
            ) : (
              <form className="space-y-4" onSubmit={reserve}>
                <label className="block">
                  Move-in date
                  <input
                    required
                    type="date"
                    name="moveInDate"
                    min={minDate}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  Special requests{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <textarea
                    name="requests"
                    maxLength={500}
                    rows={3}
                    className={inputClass}
                    placeholder="Anything the landlord should know?"
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  Review the room, rent and date before reserving. You’ll
                  complete payment on the next page. Inspect the room and
                  receive your keys before sharing your inspection code.
                </p>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={busy || (!!user && !reservation.data)}
                >
                  {busy
                    ? "Reserving…"
                    : user
                      ? "Reserve this unit"
                      : "Sign in to reserve"}
                </Button>
              </form>
            )}
          </Panel>
        </div>
      </div>
      <AuthModal isOpen={auth} onClose={() => setAuth(false)} />
    </div>
  );
}
