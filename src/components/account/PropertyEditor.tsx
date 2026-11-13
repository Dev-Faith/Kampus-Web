"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApiResource } from "@/lib/use-api-resource";
import { apiClient } from "@/api/client";
import { authError } from "@/lib/auth-errors";
import { toast } from "@/lib/stores/useToastStore";
import { Button } from "@/components/ui/button";
import {
  ListingPhotos,
  type ListingPhoto,
} from "@/components/media/ListingPhotos";
import { Panel, ErrorNotice, Loading, inputClass } from "./ui";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/constants/accommodation-types";
import { CAMPUS_AREA_OPTIONS } from "@/lib/constants/campus-areas";
import type {
  BackendLodge,
  LodgeAmenity,
  LodgeBuildingSummary,
} from "@/types/api";
type EditableUnit = Omit<BackendLodge, "amenities"> & {
  status: NonNullable<BackendLodge["status"]>;
  amenities: (LodgeAmenity | string)[];
};
export function PropertyEditor({ id }: { id?: string }) {
  const unit = useApiResource<EditableUnit>(
    id ? `/landlords/properties/${encodeURIComponent(id)}` : null,
  );
  const amenities = useApiResource<LodgeAmenity[]>("/amenities"),
    buildings = useApiResource<LodgeBuildingSummary[]>("/landlords/buildings");
  const error = unit.error || amenities.error || buildings.error;
  if (error)
    return (
      <ErrorNotice
        error={error}
        retry={() => {
          unit.reload();
          amenities.reload();
          buildings.reload();
        }}
      />
    );
  if ((id && !unit.data) || !amenities.data || !buildings.data)
    return <Loading />;
  return (
    <Editor
      key={id || "new"}
      unit={unit.data}
      amenities={amenities.data}
      buildings={buildings.data}
    />
  );
}
function Editor({
  unit,
  amenities,
  buildings,
}: {
  unit?: EditableUnit;
  amenities: LodgeAmenity[];
  buildings: LodgeBuildingSummary[];
}) {
  const router = useRouter(),
    [building, setBuilding] = useState(unit?.buildingId || "new"),
    [photos, setPhotos] = useState<ListingPhoto[]>(
      (unit?.images || []).map((p, i) => ({
        url: p.url,
        isPrimary:
          p.isPrimary || (i === 0 && !unit?.images.some((p) => p.isPrimary)),
      })),
    ),
    [uploading, setUploading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const selected = buildings.find((b) => b.id === building),
    location = selected || unit,
    amenityIds = (unit?.amenities || []).map((a) =>
      typeof a === "string" ? a : a.id,
    );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!photos.length) {
      setError("Add at least one photo before publishing.");
      return;
    }
    const f = new FormData(e.currentTarget),
      str = (name: string) => String(f.get(name) || "").trim(),
      num = (name: string) =>
        str(name) === "" ? undefined : Number(str(name));
    const rules = str("rules")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (rules.length > 20) {
      setError("Use no more than 20 house rules.");
      return;
    }
    const payload = {
      ...(building !== "new"
        ? { buildingId: building }
        : {
            buildingName: str("buildingName"),
            ...(unit ? { createBuilding: true } : {}),
          }),
      ...(unit && str("status") !== unit.status.toUpperCase()
        ? { status: str("status") }
        : {}),
      title: str("title"),
      unitLabel: str("unitLabel"),
      description: str("description"),
      category: str("category"),
      city: "Minna",
      state: "Niger",
      university: "FUTMINNA",
      area: str("area"),
      address: str("address"),
      latitude: num("latitude"),
      longitude: num("longitude"),
      distanceToCampus: num("distanceToCampus"),
      numberOfRooms: num("numberOfRooms"),
      capacity: num("capacity"),
      rent: num("rent"),
      serviceFee: num("serviceFee"),
      amenities: f.getAll("amenities").map(String),
      rules,
      availableFrom: str("availableFrom") || undefined,
      images: photos,
    };
    setBusy(true);
    try {
      if (unit)
        await apiClient.patch(`/landlords/properties/${unit.id}`, payload);
      else await apiClient.post("/landlords/properties", payload);
      toast.success(unit ? "Unit updated" : "Unit published");
      router.push("/host/properties");
    } catch (e) {
      setError(
        authError(
          e,
          "Couldn’t save this listing. Your entries and uploaded photos have been kept.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !unit ||
      !window.confirm(
        `Delete “${unit.title}”? This permanently removes the unit and its listing photos. Units with booking history cannot be deleted.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await apiClient.delete(`/landlords/properties/${unit.id}`);
      toast.success("Unit deleted");
      router.push("/host/properties");
    } catch (e) {
      setError(authError(e, "Couldn’t delete this unit."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <Link href="/host/properties" className="text-brand-strong">
        ← All units
      </Link>
      <p className="max-w-3xl text-muted-foreground">
        List one rentable room or flat at a time. The lodge is its parent
        building; students reserve this unit, not the whole building.
      </p>
      <ErrorNotice error={error} />
      <form onSubmit={submit} className="space-y-6">
        <fieldset disabled={busy || uploading} className="space-y-6">
          <Panel>
            <h2 className="text-xl font-semibold">1. Building & location</h2>
            <label className="block">
              Which building is this unit in?
              <select
                className={inputClass}
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              >
                {!unit?.buildingId && (
                  <option value="new">Add a new building</option>
                )}
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || "Unnamed building"} · {b.address || b.city}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand-strong">
                This unit shares its address with{" "}
                {selected.name || "this building"}. Updating the building
                location also updates its other units.
              </p>
            )}
            <div key={building} className="grid gap-4 sm:grid-cols-2">
              {building === "new" && (
                <label className="block sm:col-span-2">
                  Building / lodge name
                  <input
                    name="buildingName"
                    required
                    maxLength={255}
                    defaultValue={unit?.building?.name || ""}
                    className={inputClass}
                  />
                </label>
              )}
              <label className="block">
                Campus area
                <select
                  name="area"
                  required
                  defaultValue={location?.campusArea || ""}
                  className={inputClass}
                >
                  <option value="">Choose area</option>
                  {CAMPUS_AREA_OPTIONS.filter((a) => a.id !== "all").map(
                    (a) => (
                      <option value={a.id} key={a.id}>
                        {a.campus} · {a.label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="block">
                Street address / landmark
                <input
                  name="address"
                  required
                  maxLength={500}
                  defaultValue={location?.address || ""}
                  className={inputClass}
                />
              </label>
              <p className="text-sm text-muted-foreground sm:col-span-2">
                FUTMINNA · Minna, Niger State. Coordinates are optional; add
                them to help students find the entrance.
              </p>
              <label>
                Latitude
                <input
                  name="latitude"
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                  defaultValue={location?.latitude ?? ""}
                  className={inputClass}
                />
              </label>
              <label>
                Longitude
                <input
                  name="longitude"
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  defaultValue={location?.longitude ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
          </Panel>
          <Panel>
            <h2 className="text-xl font-semibold">2. The room or flat</h2>
            {unit && (
              <label className="block">
                Availability
                <select
                  name="status"
                  defaultValue={unit.status.toUpperCase()}
                  className={inputClass}
                >
                  <option value="AVAILABLE">Available for booking</option>
                  <option value="BOOKED">Occupied / unavailable</option>
                  <option value="MAINTENANCE">Under maintenance</option>
                </select>
                <span className="mt-2 block text-sm text-muted-foreground">
                  Availability changes do not create bookings or payments.
                  Active reservations and unsettled payments must be resolved
                  first.
                </span>
              </label>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                Listing title
                <input
                  name="title"
                  required
                  maxLength={255}
                  defaultValue={unit?.title || ""}
                  className={inputClass}
                  placeholder="Bright self-contained apartment"
                />
              </label>
              <label>
                Unit / room number
                <input
                  name="unitLabel"
                  maxLength={120}
                  defaultValue={unit?.unitLabel || ""}
                  className={inputClass}
                  placeholder="Room 4"
                />
              </label>
              <label>
                Accommodation type
                <select
                  name="category"
                  required
                  defaultValue={unit?.category || ""}
                  className={inputClass}
                >
                  <option value="">Choose type</option>
                  {ACCOMMODATION_TYPE_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                Description
                <textarea
                  name="description"
                  required
                  maxLength={2000}
                  rows={5}
                  defaultValue={unit?.description || ""}
                  className={inputClass}
                />
              </label>
              <label>
                Number of rooms
                <input
                  name="numberOfRooms"
                  required
                  type="number"
                  min={1}
                  max={1000}
                  defaultValue={unit?.numberOfRooms ?? 1}
                  className={inputClass}
                />
              </label>
              <label>
                Maximum occupants
                <input
                  name="capacity"
                  required
                  type="number"
                  min={1}
                  max={1000}
                  defaultValue={unit?.capacity ?? 1}
                  className={inputClass}
                />
              </label>
              <label>
                Distance to campus (km, optional)
                <input
                  name="distanceToCampus"
                  type="number"
                  min={0}
                  max={999.99}
                  step="0.01"
                  defaultValue={unit?.distanceToCampus ?? ""}
                  className={inputClass}
                />
              </label>
              <label>
                Available from (optional)
                <input
                  name="availableFrom"
                  type="date"
                  defaultValue={unit?.availableFrom?.slice(0, 10) || ""}
                  className={inputClass}
                />
              </label>
            </div>
          </Panel>
          <Panel>
            <h2 className="text-xl font-semibold">
              3. Rent, amenities & house rules
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                Annual rent (₦)
                <input
                  name="rent"
                  required
                  type="number"
                  min={0}
                  max={9999999999999.99}
                  step="0.01"
                  defaultValue={unit?.rent ?? ""}
                  className={inputClass}
                />
              </label>
              <label>
                Service fee (₦)
                <input
                  name="serviceFee"
                  required
                  type="number"
                  min={0}
                  max={9999999999999.99}
                  step="0.01"
                  defaultValue={unit?.serviceFee ?? 0}
                  className={inputClass}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Select only the amenities provided with this unit.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {amenities.map((a) => (
                <label
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm"
                >
                  <input
                    className="mt-1 accent-current"
                    name="amenities"
                    type="checkbox"
                    value={a.id}
                    defaultChecked={amenityIds.includes(a.id)}
                  />
                  {a.name}
                </label>
              ))}
            </div>
            <label className="block">
              House rules (one per line, up to 20)
              <textarea
                name="rules"
                rows={4}
                defaultValue={(unit?.rules || []).join("\n")}
                className={inputClass}
              />
            </label>
          </Panel>
        </fieldset>
        <Panel>
          <h2 className="text-xl font-semibold">4. Photos</h2>
          <ListingPhotos
            value={photos}
            onChange={setPhotos}
            onBusyChange={setUploading}
            disabled={busy}
          />
        </Panel>
        <ErrorNotice error={error} />
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={busy || uploading}>
            {uploading
              ? "Uploading photos…"
              : busy
                ? "Saving…"
                : unit
                  ? "Save changes"
                  : "Publish unit"}
          </Button>
          <Link
            className="text-muted-foreground underline"
            href="/host/properties"
          >
            Back to units
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Listings publish immediately. Kampus can hide listings that need
          review.
        </p>
      </form>
      {unit && (
        <Panel>
          <h2 className="text-xl font-semibold">Delete listing</h2>
          <p className="text-sm text-muted-foreground">
            Only units without booking history can be deleted. To hide a unit
            with past reservations, contact Kampus support.
          </p>
          <Button
            variant="outline"
            disabled={busy || uploading}
            onClick={() => void remove()}
          >
            Delete unit
          </Button>
        </Panel>
      )}
    </div>
  );
}
