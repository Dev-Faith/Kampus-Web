"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AccountPage } from "@/components/account/AccountPage";
import {
  Panel,
  ErrorNotice,
  Loading,
  Pager,
  money,
  date,
  inputClass,
  type ApiPage,
} from "@/components/account/ui";
import { Button } from "@/components/ui/button";
import { useApiResource } from "@/lib/use-api-resource";
import { bookingLabel } from "@/lib/booking-state";
import { apiClient } from "@/api/client";
import { authError } from "@/lib/auth-errors";
import { toast } from "@/lib/stores/useToastStore";
import type { Booking } from "@/types/api";
type HostBooking = {
  id: string;
  lodgeId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  status: Booking["status"];
  moveInDate: string;
  estimatedRent: number;
  specialRequests?: string;
  escrow: Booking["escrow"];
};
type Detail = Booking & {
  tenant?: { name: string; email?: string; phone?: string };
};
export default function Page() {
  return (
    <AccountPage
      title="Student bookings"
      description="Review reservations, speak with students, and verify inspection after key handover."
      roles={["LANDLORD"]}
    >
      <Suspense fallback={<Loading />}>
        <Bookings />
      </Suspense>
    </AccountPage>
  );
}
function Bookings() {
  const params = useSearchParams(),
    router = useRouter(),
    selected = params.get("bookingId");
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("PENDING");
  const { data, error, reload } = useApiResource<ApiPage<HostBooking>>(
    `/landlords/bookings?page=${page}&pageSize=12${status ? "&status=" + status : ""}`,
    30000,
  );
  return (
    <>
      {selected && (
        <HostDetail
          key={selected}
          id={selected}
          onChange={reload}
          onClose={() => router.push("/host/bookings")}
        />
      )}
      <div className="flex flex-wrap items-end gap-3">
        <label>
          Booking status
          <select
            className={inputClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {[
              ["PENDING", "Pending"],
              ["CONFIRMED", "Confirmed"],
              ["ACTIVE", "Active"],
              ["COMPLETED", "Completed"],
              ["CANCELLED", "Cancelled"],
              ["REJECTED", "Declined"],
              ["", "All bookings"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" onClick={reload}>
          Refresh
        </Button>
      </div>
      <ErrorNotice error={error} retry={reload} />
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((b) => (
              <Panel key={b.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">
                    {b.tenantName || "Student"}
                  </h2>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-sm text-brand-strong">
                    {bookingLabel(b)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Move-in: {date(b.moveInDate)} · Rent: {money(b.estimatedRent)}
                </p>
                {b.specialRequests && (
                  <p className="whitespace-pre-wrap">{b.specialRequests}</p>
                )}
                <Contact phone={b.tenantPhone} email={b.tenantEmail} />
                <Link
                  href={`/host/bookings?bookingId=${b.id}`}
                  className="text-brand-strong underline"
                >
                  Review booking →
                </Link>
              </Panel>
            ))}
          </div>
          {!data.items.length && (
            <Panel>
              <p>No bookings in this view.</p>
            </Panel>
          )}
          <Pager page={page} total={data.pagination.total} onChange={setPage} />
        </>
      )}
    </>
  );
}
function Contact({ phone, email }: { phone?: string; email?: string }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-brand-strong">
      {phone && (
        <>
          <a className="underline" href={`tel:${phone}`}>
            Call student
          </a>
          <a
            className="underline"
            href={`https://wa.me/${phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp student
          </a>
        </>
      )}
      {email && (
        <a className="underline" href={`mailto:${email}`}>
          Email student
        </a>
      )}
    </div>
  );
}
function HostDetail({
  id,
  onChange,
  onClose,
}: {
  id: string;
  onChange: () => void;
  onClose: () => void;
}) {
  const {
    data: b,
    error,
    reload,
  } = useApiResource<Detail>(`/bookings/${encodeURIComponent(id)}`, 30000);
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(""),
    [code, setCode] = useState("");
  async function act(action: string, body: object = {}) {
    setBusy(true);
    setFailure("");
    try {
      await apiClient.post(`/landlords/bookings/${id}/${action}`, body);
      toast.success(
        action === "verify-inspection"
          ? "Inspection approved; payout status will update after processing"
          : action === "confirm"
            ? "Booking accepted"
            : "Booking declined",
      );
      setCode("");
      reload();
      onChange();
    } catch (e) {
      setFailure(
        authError(
          e,
          "Couldn’t complete this action. No success has been recorded.",
        ),
      );
      reload();
    } finally {
      setBusy(false);
    }
  }
  if (!b)
    return (
      <Panel>
        <ErrorNotice error={error} retry={reload} />
        {!error && <Loading />}
        <Button variant="outline" onClick={onClose}>
          Close details
        </Button>
      </Panel>
    );
  const pending = b.status.toUpperCase() === "PENDING",
    held =
      b.escrow?.status.toUpperCase() === "HELD" && !b.escrow.reviewRequired;
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold">
          {b.lodge?.title || "Booking details"}
        </h2>
        <Button variant="outline" onClick={onClose}>
          Close details
        </Button>
      </div>
      <p>
        {bookingLabel(b)} · Move-in {date(b.moveInDate)}
      </p>
      <p className="break-all text-sm text-muted-foreground">
        Reference: {b.id}
      </p>
      {b.tenant && (
        <>
          <p className="font-medium">{b.tenant.name}</p>
          <Contact phone={b.tenant.phone} email={b.tenant.email} />
        </>
      )}
      {b.specialRequests && (
        <p className="whitespace-pre-wrap">
          Student’s request: {b.specialRequests}
        </p>
      )}
      <p>
        Annual rent: {money(b.rent)} · Payment:{" "}
        {b.escrow?.status.replaceAll("_", " ") || "PENDING"}
      </p>
      <ErrorNotice error={failure} />
      <ErrorNotice error={error} retry={reload} />
      {pending && (
        <>
          <p className="text-muted-foreground">
            {held
              ? "Payment is confirmed. Review this request before accepting."
              : "Payment must be confirmed and free of review holds before you can accept."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy || !held}
              onClick={() => void act("confirm")}
            >
              Accept booking
            </Button>
            <Button
              variant="outline"
              disabled={
                busy ||
                b.escrow?.reviewRequired ||
                !["PENDING", "HELD"].includes(
                  b.escrow?.status.toUpperCase() || "PENDING",
                )
              }
              onClick={() => {
                if (
                  window.confirm(
                    "Decline this reservation? The unit will be released; any paid booking must complete the refund process.",
                  )
                )
                  void act("reject");
              }}
            >
              Decline booking
            </Button>
          </div>
        </>
      )}
      {b.status.toUpperCase() === "CONFIRMED" &&
        held &&
        !b.escrow?.isInspected && (
          <form
            className="space-y-4 border-t border-border pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              void act("verify-inspection", { inspectionCode: code.trim() });
            }}
          >
            <h3 className="text-xl font-semibold">
              Confirm inspection & key handover
            </h3>
            <p className="text-muted-foreground">
              Ask for the student’s private code only after they inspect the
              room and receive the keys. Verification approves the payout; the
              booking updates after settlement and provider confirmation.
            </p>
            <label className="block">
              Inspection code
              <input
                autoComplete="off"
                required
                maxLength={50}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputClass}
                placeholder="INSP-…"
              />
            </label>
            <Button type="submit" disabled={busy || !code.trim()}>
              {busy ? "Verifying…" : "Verify inspection code"}
            </Button>
          </form>
        )}
      {b.escrow?.reviewRequired ||
      b.escrow?.status.toUpperCase() === "DISPUTED" ? (
        <p className="rounded-xl bg-brand-soft p-4">
          This booking is under review. Payout decisions are paused.
        </p>
      ) : null}
      {b.escrow?.isInspected && (
        <p>
          Inspection approved. Current payment status:{" "}
          {b.escrow.status.replaceAll("_", " ")}.
        </p>
      )}
      {b.dispute && (
        <p>
          Reported problem: {b.dispute.reason} ·{" "}
          {b.dispute.status?.replaceAll("_", " ")}
        </p>
      )}
      <Link
        href={`/host/properties/${b.lodgeId}`}
        className="inline-block text-brand-strong underline"
      >
        View unit details
      </Link>
    </Panel>
  );
}
