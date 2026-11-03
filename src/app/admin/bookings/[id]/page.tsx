"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";
import {
  adminApi,
  adminError,
  calendarDate,
  date,
  money,
  type AdminRow,
} from "@/api/admin";

interface Booking extends AdminRow {
  specialRequests?: string;
  paymentReference?: string;
  gatewayTransactionId?: string;
  inspectionExtensions: {
    id: string;
    extensionNumber: number;
    status: string;
    amount: string;
    extendedDeadline: string;
  }[];
  payoutAttempts: {
    id: string;
    reference: string;
    status: string;
    amount: string;
    failureReason?: string;
  }[];
  paymentLedger: {
    id: string;
    kind: string;
    amount: string;
    createdAt: string;
  }[];
  chargebackCases: { providerId: string; status: string; active: boolean }[];
  notes: { id: string; action: string; reason?: string; createdAt: string }[];
}
export default function BookingSupportPage() {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState("notes");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setRow(null);
    setError("");
    apiClient
      .get("/admin/bookings/" + id)
      .then((res) => {
        if (!cancelled) setRow(res.data.data);
      })
      .catch((e) => {
        if (!cancelled) setError(adminError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id, revision]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await adminApi.action("bookings/" + id + "/" + mode, {
        reason: reason.trim(),
      });
      setNotice(result.message);
      setReason("");
      setRevision((v) => v + 1);
    } catch (e) {
      setError(adminError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <Link className="admin-button mb-6" href="/admin/bookings">
        ← Booking support
      </Link>
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Booking {id}</p>
          <h1>{row?.lodge?.title || "Booking details"}</h1>
          <p>
            Review the record before deciding on a refund or landlord payout.
          </p>
        </div>
        <button
          className="admin-button"
          disabled={busy}
          onClick={() => setRevision((v) => v + 1)}
        >
          Refresh
        </button>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}
      {!row && !error ? (
        <p role="status">Loading booking…</p>
      ) : (
        row && (
          <>
            <article className="admin-card">
              <div className="admin-card-head">
                <h2>Reservation & payment</h2>
                <span className="admin-badge">{row.status}</span>
              </div>
              {row.escrow?.paymentProvider === "KAMPUS_TEST" && (
                <p className="admin-notice">
                  Test payment — no real money moved.
                </p>
              )}
              <dl className="admin-details">
                <div>
                  <dt>Student</dt>
                  <dd>
                    {row.student?.user.fullName}
                    <br />
                    {row.student?.user.email}
                    <br />
                    {row.student?.user.phone}
                  </dd>
                </div>
                <div>
                  <dt>Landlord</dt>
                  <dd>
                    {row.lodge?.landlord?.user.fullName}
                    <br />
                    {row.lodge?.landlord?.user.email}
                    <br />
                    {row.lodge?.landlord?.user.phone}
                  </dd>
                </div>
                <div>
                  <dt>Total paid / payable</dt>
                  <dd>{money(row.totalAmount)}</dd>
                </div>
                <div>
                  <dt>Payment status</dt>
                  <dd>{row.escrow?.status || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Move-in date</dt>
                  <dd>{calendarDate(row.moveInDate)}</dd>
                </div>
                <div>
                  <dt>Inspection deadline (end of day, Lagos)</dt>
                  <dd>{calendarDate(row.escrow?.inspectionDeadline)}</dd>
                </div>
                <div>
                  <dt>Inspection approval</dt>
                  <dd>{row.escrow?.isInspected ? "Recorded" : "Pending"}</dd>
                </div>
                <div>
                  <dt>Settlement</dt>
                  <dd>
                    {row.escrow?.settledAt
                      ? date(row.escrow.settledAt)
                      : "Not confirmed"}
                  </dd>
                </div>
              </dl>
              {row.escrow?.reviewReason && (
                <p className="admin-notice">{row.escrow.reviewReason}</p>
              )}
              <p className="admin-meta">
                Payment reference: {row.paymentReference || "Not created"}
              </p>
              {row.specialRequests && (
                <p>Student request: {row.specialRequests}</p>
              )}
              <div className="admin-actions">
                <Link className="admin-button" href="/admin/payments">
                  Payment follow-up
                </Link>
                <Link className="admin-button" href="/admin/refunds">
                  Refund follow-up
                </Link>
                <Link className="admin-button" href="/admin/disputes">
                  Review disputes
                </Link>
              </div>
            </article>
            <div className="admin-grid mt-5">
              <article className="admin-card">
                <h2>Disputes & chargebacks</h2>
                {!row.disputes?.length && !row.chargebackCases.length && (
                  <p>No cases recorded.</p>
                )}
                {row.disputes?.map((d) => (
                  <div key={d.id} className="mt-3">
                    <span className="admin-badge">{d.status}</span>
                    <p>{d.reason}</p>
                    {d.resolution && <p>{d.resolution}</p>}
                  </div>
                ))}
                {row.chargebackCases.map((c) => (
                  <p key={c.providerId}>
                    Chargeback {c.providerId}: {c.status} ·{" "}
                    {c.active ? "Hold active" : "Closed"}
                  </p>
                ))}
              </article>
              <article className="admin-card">
                <h2>Inspection extensions</h2>
                {!row.inspectionExtensions.length && (
                  <p>No paid extensions requested.</p>
                )}
                {row.inspectionExtensions.map((x) => (
                  <p key={x.id}>
                    Day +{x.extensionNumber}: {money(x.amount)} · {x.status} ·
                    Deadline {calendarDate(x.extendedDeadline)}
                  </p>
                ))}
              </article>
            </div>
            <article className="admin-card mt-5">
              <h2>Money movement history</h2>
              <p className="admin-meta">
                Only provider-confirmed events establish final payment status.
              </p>
              {!row.paymentLedger.length && <p>No ledger events yet.</p>}
              <ul className="admin-timeline">
                {row.paymentLedger.map((l) => (
                  <li key={l.id}>
                    <strong>
                      {l.kind.replaceAll("_", " ")} · {money(l.amount)}
                    </strong>
                    <p className="admin-meta">{date(l.createdAt)}</p>
                  </li>
                ))}
              </ul>
              {row.payoutAttempts.map((a) => (
                <p key={a.id}>
                  Transfer {a.reference}: {a.status} · {money(a.amount)}{" "}
                  {a.failureReason ? "· " + a.failureReason : ""}
                </p>
              ))}
            </article>
            <article className="admin-card mt-5">
              <h2>Support notes & review</h2>
              <p>
                Notes are internal. Opening a review pauses an eligible payout
                and creates a dispute case; it does not cancel the booking or
                send money.
              </p>
              <form className="admin-form" onSubmit={submit}>
                <label>
                  Action
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="notes">Save an internal note</option>
                    <option
                      value="review"
                      disabled={
                        !!row.disputes?.length ||
                        !["HELD", "PAYOUT_PENDING"].includes(
                          row.escrow?.status || "",
                        )
                      }
                    >
                      Open a review case
                    </option>
                  </select>
                </label>
                <label>
                  Note / reason
                  <textarea
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <button
                  className="admin-button primary"
                  disabled={busy || reason.trim().length < 5}
                >
                  {busy
                    ? "Saving…"
                    : mode === "review"
                      ? "Pause payout and open review"
                      : "Save note"}
                </button>
              </form>
              <ul className="admin-timeline">
                {row.notes.map((n) => (
                  <li key={n.id}>
                    <p>{n.reason || n.action}</p>
                    <p className="admin-meta">
                      {date(n.createdAt)} · {n.action.replaceAll("_", " ")}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          </>
        )
      )}
    </section>
  );
}
