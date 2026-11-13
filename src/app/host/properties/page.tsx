"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AccountPage } from "@/components/account/AccountPage";
import {
  Panel,
  ErrorNotice,
  Loading,
  Pager,
  money,
  inputClass,
  type ApiPage,
} from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import { getUnitAvailability } from "@/lib/lodge-availability";
import type { BackendLodge } from "@/types/api";
export default function Page() {
  return (
    <AccountPage
      title="Your units"
      description="Manage the rooms and flats in your buildings."
      roles={["LANDLORD"]}
    >
      <Units />
    </AccountPage>
  );
}
function Units() {
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("");
  const { data, error, reload } = useApiResource<ApiPage<BackendLodge>>(
    `/landlords/properties?page=${page}&pageSize=12${status ? "&status=" + status : ""}`,
  );
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label>
          Filter by availability
          <select
            className={inputClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All units</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Reserved / booked</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </label>
        <Link
          href="/host/properties/new"
          className="rounded-full bg-primary px-5 py-3 text-primary-foreground"
        >
          + Add a unit
        </Link>
      </div>
      <ErrorNotice error={error} retry={reload} />
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((l) => (
              <Panel key={l.id}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                  {(l.primaryImage?.url || l.images?.[0]?.url) && (
                    <Image
                      src={l.primaryImage?.url || l.images[0].url}
                      unoptimized
                      fill
                      sizes="500px"
                      className="object-cover"
                      alt={l.title}
                    />
                  )}
                </div>
                <h2 className="text-xl font-semibold">{l.title}</h2>
                <p className="text-muted-foreground">
                  {l.building?.name}
                  {l.unitLabel && ` · ${l.unitLabel}`}
                </p>
                <p>
                  {money(l.rent)} / year ·{" "}
                  {getUnitAvailability(l) === "BOOKED"
                    ? "Reserved / booked"
                    : getUnitAvailability(l)?.toLowerCase() ?? "Check availability"}
                </p>
                <Link
                  href={`/host/properties/${l.id}`}
                  className="text-brand-strong underline"
                >
                  Edit unit →
                </Link>
              </Panel>
            ))}
          </div>
          {!data.items.length && (
            <Panel>
              <p>No units match this view.</p>
            </Panel>
          )}
          <Pager page={page} total={data.pagination.total} onChange={setPage} />
        </>
      )}
    </>
  );
}
