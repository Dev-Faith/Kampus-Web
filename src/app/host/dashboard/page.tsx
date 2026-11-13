"use client";
import Link from "next/link";
import { AccountPage } from "@/components/account/AccountPage";
import { Panel, ErrorNotice, Loading, money } from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import type { LandlordStats } from "@/types/api";
export default function Page() {
  return (
    <AccountPage
      title="Host overview"
      description="Your units, reservations and confirmed earnings."
      roles={["LANDLORD"]}
    >
      <Dashboard />
    </AccountPage>
  );
}
function Dashboard() {
  const {
    data: s,
    error,
    reload,
  } = useApiResource<LandlordStats>("/landlords/stats", 30000);
  return (
    <>
      <ErrorNotice error={error} retry={reload} />
      {!s && !error && <Loading />}
      {s && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Confirmed earnings", money(s.revenue)],
              ["Total units", s.totalProperties],
              ["Available units", s.availableProperties],
              ["Occupied units", s.occupiedProperties ?? 0],
              ["Reservations", s.reservedProperties ?? 0],
              ["Awaiting payment", s.awaitingPaymentBookings ?? 0],
              ["Ready to accept", s.readyForConfirmation ?? 0],
              ["Confirmed bookings", s.confirmedBookings],
            ].map(([label, value]) => (
              <Panel key={String(label)}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-semibold">{value}</p>
              </Panel>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Unpaid reservations do not count as occupied units or confirmed
            earnings.
          </p>
        </>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [
            "List a room or flat",
            "Add a rentable unit with photos and amenities.",
            "/host/properties/new",
          ],
          [
            "Manage bookings",
            "Review requests, contact students and verify inspection codes.",
            "/host/bookings",
          ],
          [
            "Payout details",
            "Keep your bank details up to date for landlord payouts.",
            "/host/payouts",
          ],
        ].map(([title, body, href]) => (
          <Link key={href} href={href}>
            <Panel>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-muted-foreground">{body}</p>
              <span className="text-brand-strong">Open →</span>
            </Panel>
          </Link>
        ))}
      </div>
    </>
  );
}
