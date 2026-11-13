"use client";
import { useState } from "react";
import Link from "next/link";
import { useApiResource } from "@/lib/use-api-resource";
import { bookingLabel } from "@/lib/booking-state";
import { Button } from "@/components/ui/button";
import {
  Panel,
  ErrorNotice,
  Loading,
  Pager,
  money,
  date,
  type ApiPage,
} from "./ui";
import type { Booking } from "@/types/api";
export function StudentBookings() {
  const [view, setView] = useState("active"),
    [page, setPage] = useState(1);
  const { data, error, reload } = useApiResource<ApiPage<Booking>>(
    `/bookings?view=${view}&page=${page}&pageSize=12`,
    30000,
  );
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {["active", "history"].map((v) => (
          <Button
            key={v}
            variant={view === v ? "default" : "outline"}
            onClick={() => {
              setView(v);
              setPage(1);
            }}
          >
            {v === "active" ? "Active" : "History"}
          </Button>
        ))}
        <Button variant="ghost" onClick={reload}>
          Refresh
        </Button>
      </div>
      <ErrorNotice error={error} retry={reload} />
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="grid gap-4">
            {data.items.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Panel>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold">
                        {b.lodge?.title || "Your accommodation"}
                      </h2>
                      <p className="text-muted-foreground">
                        {b.lodge?.building?.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-sm text-brand-strong">
                      {bookingLabel(b)}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-3 text-muted-foreground">
                    <p>
                      Move-in: {date(b.moveInDate)} ·{" "}
                      {money(b.totalAmount ?? b.amount)}
                    </p>
                    <span className="text-brand-strong">View booking →</span>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
          {!data.items.length && (
            <Panel>
              <h2 className="text-xl font-semibold">
                No {view === "active" ? "active" : "past"} bookings
              </h2>
              <p className="text-muted-foreground">
                Your reservations and their payment status will appear here.
              </p>
              <Link href="/explore" className="text-brand-strong underline">
                Find a room
              </Link>
            </Panel>
          )}
          <Pager page={page} onChange={setPage} total={data.pagination.total} />
        </>
      )}
    </>
  );
}
