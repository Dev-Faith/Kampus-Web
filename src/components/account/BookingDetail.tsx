"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/stores/useToastStore";
import { useApiResource } from "@/lib/use-api-resource";
import { bookingActions, bookingLabel } from "@/lib/booking-state";
import { authError } from "@/lib/auth-errors";
import { bookingsApi, type InitPaymentResponse } from "@/api/bookings";
import { Button } from "@/components/ui/button";
import {
  Panel,
  ErrorNotice,
  Loading,
  money,
  date,
  copyText,
  inputClass,
} from "./ui";
import type { Booking } from "@/types/api";
export function BookingDetail({ id }: { id: string }) {
  const {
    data: b,
    error,
    reload,
  } = useApiResource<Booking>(`/bookings/${encodeURIComponent(id)}`, 30000);
  const [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState(""),
    [form, setForm] = useState<"cancel" | "dispute" | null>(null),
    [reason, setReason] = useState(""),
    [checkout, setCheckout] = useState<InitPaymentResponse | null>(null);
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError("");
    try {
      await action();
      reload();
    } catch (e) {
      setActionError(
        authError(e, "Couldn’t complete this action. Please retry."),
      );
    } finally {
      setBusy(false);
    }
  }
  async function pay(extension = false) {
    await run(async () => {
      const r = extension
        ? await bookingsApi.initInspectionExtension({ bookingId: id })
        : await bookingsApi.initPayment({ bookingId: id });
      if (r.paymentMode === "test") {
        setCheckout(r);
      } else if (r.paymentUrl) {
        const url = new URL(r.paymentUrl);
        if (url.protocol !== "https:")
          throw new Error("Checkout returned an invalid link.");
        window.location.assign(url.href);
      } else {
        toast.info("Payment status refreshed.");
      }
    });
  }
  if (!b)
    return (
      <>
        <ErrorNotice error={error} retry={reload} />
        {!error && <Loading />}
      </>
    );
  const actions = bookingActions(b),
    payment = b.escrow?.status.toUpperCase();
  return (
    <div className="space-y-6">
      <Link href="/bookings" className="text-brand-strong">
        ← All bookings
      </Link>
      <ErrorNotice error={error} retry={reload} />
      <ErrorNotice error={actionError} />
      <Panel>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">
              {b.lodge?.title || "Accommodation"}
            </h2>
            <p className="text-muted-foreground">
              {b.lodge?.building?.name} · {b.lodge?.city}
            </p>
          </div>
          <span className="self-start rounded-full bg-brand-soft px-4 py-2 text-brand-strong">
            {bookingLabel(b)}
          </span>
        </div>
        <p className="break-all text-sm text-muted-foreground">
          Booking reference: {b.id}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              void copyText(b.id).then(
                (ok) => ok && toast.success("Reference copied"),
              )
            }
          >
            Copy reference
          </Button>
          <Button variant="outline" onClick={reload}>
            Refresh status
          </Button>
          <Link
            className="self-center text-brand-strong underline"
            href={`/lodges/${b.lodgeId}`}
          >
            View unit
          </Link>
        </div>
        <p>
          Move-in date: <strong>{date(b.moveInDate)}</strong>
        </p>
        {b.specialRequests && (
          <p className="whitespace-pre-wrap">
            Your request: {b.specialRequests}
          </p>
        )}
        {b.lodge?.landlord?.phone && (
          <div className="flex flex-wrap gap-4">
            <a
              className="text-brand-strong underline"
              href={`tel:${b.lodge.landlord.phone}`}
            >
              Call landlord
            </a>
            <a
              className="text-brand-strong underline"
              href={`https://wa.me/${b.lodge.landlord.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp landlord
            </a>
          </div>
        )}
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-xl font-semibold">Payment summary</h2>
          <dl className="space-y-3">
            <div className="flex justify-between gap-4">
              <dt>Annual rent</dt>
              <dd>{money(b.rent ?? b.lodge?.rent)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Service fee</dt>
              <dd>{money(b.serviceFee)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
              <dt>Booking total</dt>
              <dd>{money(b.totalAmount ?? b.amount)}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            Payment status: {payment?.replaceAll("_", " ") || "PENDING"}
          </p>
          {b.paymentMode === "test" && (
            <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand-strong">
              Test booking: simulated payments do not move real money.
            </p>
          )}
          {actions.pay && (
            <Button disabled={busy} onClick={() => void pay()}>
              Continue to{" "}
              {b.paymentMode === "test" ? "test payment" : "payment"}
            </Button>
          )}
          {b.status.toUpperCase() === "PENDING" &&
            payment === "PENDING" &&
            !actions.pay && (
              <p>
                Checkout is currently unavailable. Your unpaid reservation
                remains visible here.
              </p>
            )}
          {["REFUND_PENDING", "REFUND_FAILED", "REFUNDED"].includes(
            payment || "",
          ) && (
            <p className="text-sm text-muted-foreground">
              {payment === "REFUNDED"
                ? "The provider has confirmed the refund."
                : "Your refund status will update after provider confirmation. A failed refund needs support review."}
            </p>
          )}
        </Panel>
        <Panel>
          <h2 className="text-xl font-semibold">Inspection & move-in</h2>
          <p className="text-muted-foreground">
            Inspect the room and receive the keys before sharing your private
            inspection code with the landlord.
          </p>
          <p>
            Inspection deadline:{" "}
            <strong>{date(b.escrow?.inspectionDeadline)}</strong>
          </p>
          {b.escrow?.inspectionCode &&
            payment === "HELD" &&
            !b.escrow.isInspected && (
              <div className="space-y-3 rounded-2xl bg-brand-soft p-4">
                <p className="text-sm font-semibold text-brand-strong">
                  Your private inspection code
                </p>
                <code className="block break-all text-xl font-semibold">
                  {b.escrow.inspectionCode}
                </code>
                <Button
                  variant="outline"
                  onClick={() =>
                    void copyText(b.escrow!.inspectionCode!).then(
                      (ok) => ok && toast.success("Inspection code copied"),
                    )
                  }
                >
                  Copy inspection code
                </Button>
              </div>
            )}
          <p className="text-sm text-muted-foreground">
            You have 3 calendar days from your move-in date. After the deadline,
            you can buy up to four one-day extensions at ₦1,000 each, with a
            maximum of 7 calendar days. Unresolved inspections go to review; the
            deadline does not approve a payout.
          </p>
          {b.inspectionExtension && (
            <p className="text-sm">
              Extensions used: {b.inspectionExtension.paidCount}/4 · Paid{" "}
              {money(b.inspectionExtension.totalPaidAmount)}
            </p>
          )}
          {(b.canExtendInspection || b.canResumeInspectionExtension) && (
            <Button disabled={busy} onClick={() => void pay(true)}>
              {b.canResumeInspectionExtension
                ? "Resume extension payment"
                : `Extend by 1 day · ${money(b.inspectionExtensionFee ?? 1000)}`}
            </Button>
          )}
          {b.escrow?.isInspected && (
            <p className="font-medium">
              Inspection approved. Payout follows settlement and provider
              confirmation.
            </p>
          )}
        </Panel>
      </div>
      {checkout && (
        <Panel>
          <h2 className="text-xl font-semibold">Confirm simulated payment</h2>
          <p>
            This test will record {money(checkout.amount)} against this booking.
            No real money will be charged.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await bookingsApi.completeTestPayment(
                    checkout.paymentReference,
                  );
                  setCheckout(null);
                  toast.success("Test payment recorded");
                })
              }
            >
              {busy ? "Processing…" : "Complete test payment"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setCheckout(null)}
            >
              Not now
            </Button>
          </div>
        </Panel>
      )}
      {b.dispute && (
        <DisputeDetail id={b.dispute.id} reason={b.dispute.reason} />
      )}
      {(actions.cancel || actions.dispute) && (
        <Panel>
          <h2 className="text-xl font-semibold">Need to change something?</h2>
          <div className="flex flex-wrap gap-3">
            {actions.cancel && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setForm("cancel");
                  setReason("");
                }}
              >
                Cancel reservation
              </Button>
            )}
            {actions.dispute && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setForm("dispute");
                  setReason("");
                }}
              >
                Report a problem
              </Button>
            )}
          </div>
          {form && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  if (form === "cancel") {
                    await bookingsApi.cancelBooking(id, reason.trim());
                    toast.success("Cancellation submitted");
                  } else {
                    await bookingsApi.openDispute(id, {
                      reason: reason.trim(),
                    });
                    toast.success("Problem submitted for review");
                  }
                  setForm(null);
                });
              }}
            >
              <p>
                {form === "cancel"
                  ? "Cancelling releases this reservation. Any refund is tracked separately until confirmed by the payment provider."
                  : "Describe what went wrong. An open dispute pauses landlord payout while the booking is reviewed."}
              </p>
              <label className="block">
                Reason
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  className={inputClass}
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={busy}>
                  {busy
                    ? "Submitting…"
                    : form === "cancel"
                      ? "Confirm cancellation"
                      : "Submit problem"}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setForm(null)}
                >
                  Keep booking unchanged
                </Button>
              </div>
            </form>
          )}
        </Panel>
      )}
    </div>
  );
}
function DisputeDetail({ id, reason }: { id?: string; reason?: string }) {
  const { data, error, reload } = useApiResource<{
    status: string;
    reason: string;
    resolution?: string;
    resolutionNote?: string;
  }>(id ? `/disputes/${id}` : null, 30000);
  return (
    <Panel>
      <h2 className="text-xl font-semibold">Reported problem</h2>
      <ErrorNotice error={error} retry={reload} />
      <p className="whitespace-pre-wrap">{data?.reason || reason}</p>
      <p>Status: {data?.status.replaceAll("_", " ") || "Awaiting review"}</p>
      {data?.resolution && (
        <p>Resolution: {data.resolution.replaceAll("_", " ")}</p>
      )}
      {data?.resolutionNote && <p>{data.resolutionNote}</p>}
    </Panel>
  );
}
