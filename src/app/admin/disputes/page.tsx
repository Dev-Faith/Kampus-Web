"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { adminError, date, money, type AdminRow } from "@/api/admin";
type Case = {
  id: string;
  bookingId: string;
  status: string;
  reason: string;
  evidence: unknown;
  resolution?: string;
  createdAt: string;
  booking: AdminRow;
};
export default function DisputesPage() {
  const [rows, setRows] = useState<Case[]>([]);
  const [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [total, setTotal] = useState(0);
  const [filter, setFilter] = useState(""),
    [searchText, setSearchText] = useState(""),
    [search, setSearch] = useState("");
  const [revision, setRevision] = useState(0),
    [loading, setLoading] = useState(true);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Case | null>(null);
  const [resolution, setResolution] = useState("student_refund"),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false);
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);
  useEffect(() => {
    setHandoverConfirmed(false);
  }, [selected?.id]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    apiClient
      .get("/admin/cases", {
        params: { page, pageSize: 20, filter, search },
        signal: abort.signal,
      })
      .then((res) => {
        setRows(res.data.data.items);
        setPages(res.data.data.pagination.totalPages);
        setTotal(res.data.data.pagination.total);
      })
      .catch((e) => {
        if (!abort.signal.aborted) {
          setRows([]);
          setError(adminError(e));
        }
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [page, filter, search, revision]);
  async function resolve(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiClient.post(
        "/admin/disputes/" + selected.id + "/resolve",
        {
          resolution,
          note: note.trim(),
          handoverConfirmed:
            resolution === "landlord_release" && handoverConfirmed,
        },
        { timeout: 90000 },
      );
      setNotice(
        result.data.message ||
          "Decision recorded. Check the payment queue for the final provider status.",
      );
      setSelected(null);
      setNote("");
      setRevision((v) => v + 1);
    } catch (e) {
      setError(adminError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Student & landlord support</p>
          <h1>Disputes & inspection reviews</h1>
          <p>
            Review both parties’ evidence before deciding. Refunds and payouts
            remain subject to provider confirmation.
          </p>
        </div>
        <button
          className="admin-button"
          disabled={busy || loading}
          onClick={() => setRevision((v) => v + 1)}
        >
          Refresh
        </button>
      </div>
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchText.trim());
          setPage(1);
          setSelected(null);
        }}
      >
        <label>
          Search cases
          <input
            value={searchText}
            placeholder="Booking ID, unit title or reason"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
              setSelected(null);
            }}
          >
            <option value="">Open / under review</option>
            <option value="resolved">Resolved / closed</option>
          </select>
        </label>
        <button className="admin-button">Search</button>
      </form>
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
      {selected && (
        <form className="admin-dialog admin-form mb-5" onSubmit={resolve}>
          <h2>Decide case: {selected.booking.lodge?.title}</h2>
          <p>
            Booking {selected.bookingId} · {money(selected.booking.totalAmount)}
          </p>
          <label>
            Decision
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              <option value="student_refund">Approve student refund</option>
              <option value="landlord_release">Approve landlord payout</option>
            </select>
          </label>
          <p>
            {resolution === "student_refund"
              ? "Confirmation requests a refund through the payment provider. Processing may remain pending."
              : "Confirmation authorizes a landlord transfer and may send money immediately if settlement, verification, and balance checks pass."}
          </p>
          <label>
            Decision and evidence reviewed
            <textarea
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          {resolution === "landlord_release" &&
            !selected.booking.escrow?.isInspected && (
              <label className="flex! items-start! gap-3!">
                <input
                  type="checkbox"
                  checked={handoverConfirmed}
                  required
                  onChange={(e) => setHandoverConfirmed(e.target.checked)}
                />
                <span>
                  I have verified that the student inspected the room and
                  received the keys.
                </span>
              </label>
            )}
          <div className="admin-actions">
            <button
              className="admin-button primary"
              disabled={
                busy ||
                note.trim().length < 5 ||
                (resolution === "landlord_release" &&
                  !selected.booking.escrow?.isInspected &&
                  !handoverConfirmed)
              }
            >
              {busy ? "Recording decision…" : "Confirm decision"}
            </button>
            <button
              type="button"
              className="admin-button"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p role="status">Loading cases…</p>
      ) : !error && !rows.length ? (
        <div className="admin-card">
          <h2>No matching cases</h2>
          <p>Student disputes and overdue inspection reviews appear here.</p>
        </div>
      ) : (
        <div className="admin-cards">
          {rows.map((c) => (
            <article className="admin-card" key={c.id}>
              <div className="admin-card-head">
                <div>
                  <h2>{c.booking.lodge?.title}</h2>
                  <p className="admin-meta">
                    Opened {date(c.createdAt)} · {c.bookingId}
                  </p>
                </div>
                <span className="admin-badge warn">
                  {c.status.replaceAll("_", " ")}
                </span>
              </div>
              <p>{c.reason}</p>
              <dl className="admin-details">
                <div>
                  <dt>Student</dt>
                  <dd>
                    {c.booking.student?.user.fullName}
                    <br />
                    {c.booking.student?.user.email}
                  </dd>
                </div>
                <div>
                  <dt>Landlord</dt>
                  <dd>{c.booking.lodge?.landlord?.user.fullName}</dd>
                </div>
                <div>
                  <dt>Booking amount</dt>
                  <dd>{money(c.booking.totalAmount)}</dd>
                </div>
                <div>
                  <dt>Payment state</dt>
                  <dd>
                    {c.booking.escrow?.status}{" "}
                    {c.booking.escrow?.paymentProvider === "KAMPUS_TEST"
                      ? "· Test"
                      : ""}
                  </dd>
                </div>
              </dl>
              {!!c.evidence && (
                <details>
                  <summary>Evidence supplied</summary>
                  <pre className="whitespace-pre-wrap break-all text-xs mt-3">
                    {JSON.stringify(c.evidence, null, 2)}
                  </pre>
                </details>
              )}
              {c.resolution && <p className="admin-notice">{c.resolution}</p>}
              <div className="admin-actions">
                <Link
                  className="admin-button"
                  href={"/admin/bookings/" + c.bookingId}
                >
                  Full booking record
                </Link>
                {["OPEN", "UNDER_REVIEW"].includes(c.status) && (
                  <button
                    className="admin-button primary"
                    disabled={busy}
                    onClick={() => {
                      setSelected(c);
                      setNote("");
                      setError("");
                    }}
                  >
                    Review decision
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="admin-pagination">
        <span>
          {total} cases · Page {page} of {pages}
        </span>
        <div className="admin-actions">
          <button
            className="admin-button"
            disabled={busy || loading || page <= 1}
            onClick={() => {
              setPage((v) => v - 1);
              setSelected(null);
            }}
          >
            Previous
          </button>
          <button
            className="admin-button"
            disabled={busy || loading || page >= pages}
            onClick={() => {
              setPage((v) => v + 1);
              setSelected(null);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
