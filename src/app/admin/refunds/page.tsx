"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { adminError, money } from "@/api/admin";
type Refund = {
  id: string;
  bookingId: string;
  status: string;
  amount: string;
  paymentProvider?: string;
  extensionNumber?: number;
  reviewReason?: string;
};
export default function RefundsPage() {
  const [kind, setKind] = useState("bookings"),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1);
  const [search, setSearch] = useState(""),
    [input, setInput] = useState(""),
    [revision, setRevision] = useState(0);
  const [rows, setRows] = useState<Refund[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState<Refund | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    apiClient
      .get("/admin/refunds", {
        params: { filter: kind, page, search },
        signal: abort.signal,
      })
      .then((res) => {
        setRows(res.data.data.items);
        setPages(res.data.data.pagination.totalPages);
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
  }, [kind, page, search, revision]);
  async function act(row: Refund, action: "reconcile" | "retry") {
    setBusy(true);
    setError("");
    setNotice("");
    const suffix =
      row.extensionNumber !== undefined
        ? "/inspection-extension/" + row.id
        : "";
    try {
      const response = await apiClient.post(
        "/payments/admin/bookings/" +
          row.bookingId +
          suffix +
          "/refund/" +
          action,
        {},
        { timeout: 90000 },
      );
      const result = response.data.data ?? response.data;
      setNotice(
        result.message ||
          "Provider status: " + (result.status || "Check the booking record"),
      );
      setConfirm(null);
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
          <p className="admin-eyebrow">Payment follow-up</p>
          <h1>Refunds</h1>
          <p>
            Track student booking refunds and inspection-extension refunds.
            Retry only a provider-confirmed failure; a pending request must be
            checked first.
          </p>
        </div>
        <button
          className="admin-button"
          disabled={loading || busy}
          onClick={() => setRevision((v) => v + 1)}
        >
          Refresh
        </button>
      </div>
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(input.trim());
          setPage(1);
          setConfirm(null);
        }}
      >
        <label>
          Booking ID
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by booking reference"
          />
        </label>
        <label>
          Refund type
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
              setConfirm(null);
            }}
          >
            <option value="bookings">Booking refunds</option>
            <option value="extensions">Inspection-extension refunds</option>
          </select>
        </label>
        <button className="admin-button">Search</button>
      </form>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="admin-notice">
          {notice}
        </p>
      )}
      {confirm && (
        <div className="admin-dialog mb-5">
          <h2>Retry failed refund?</h2>
          <p>
            Booking {confirm.bookingId} · {money(confirm.amount)}
            {confirm.extensionNumber !== undefined
              ? " · Extension " + confirm.extensionNumber
              : ""}
            . Kampus checks refund eligibility before submitting another
            request.
          </p>
          <div className="admin-actions">
            <button
              className="admin-button primary"
              disabled={busy}
              onClick={() => void act(confirm, "retry")}
            >
              Confirm retry
            </button>
            <button
              className="admin-button"
              disabled={busy}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <p role="status">Loading refunds…</p>
      ) : !error && !rows.length ? (
        <div className="admin-card">
          <h2>No refunds need follow-up</h2>
          <p>
            Completed refunds remain available in the booking’s money movement
            history.
          </p>
        </div>
      ) : (
        <div className="admin-cards">
          {rows.map((row) => (
            <article className="admin-card" key={row.id}>
              <div className="admin-card-head">
                <h2>{money(row.amount)}</h2>
                <span className="admin-badge warn">
                  {row.status.replaceAll("_", " ")}
                </span>
              </div>
              <p>{row.bookingId}</p>
              {row.extensionNumber !== undefined && (
                <p>Inspection extension {row.extensionNumber}</p>
              )}
              {row.paymentProvider === "KAMPUS_TEST" && (
                <p>Test payment — no real money moved.</p>
              )}
              {row.reviewReason && <p>{row.reviewReason}</p>}
              <div className="admin-actions">
                <Link
                  className="admin-button"
                  href={"/admin/bookings/" + row.bookingId}
                >
                  Booking record
                </Link>
                <button
                  className="admin-button"
                  disabled={busy}
                  onClick={() => void act(row, "reconcile")}
                >
                  Check refund status
                </button>
                {row.status === "REFUND_FAILED" && (
                  <button
                    className="admin-button"
                    disabled={busy}
                    onClick={() => setConfirm(row)}
                  >
                    Retry failed refund
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="admin-pagination">
        <span>
          Page {page} of {pages}
        </span>
        <div className="admin-actions">
          <button
            className="admin-button"
            disabled={page <= 1 || loading || busy}
            onClick={() => setPage((v) => v - 1)}
          >
            Previous
          </button>
          <button
            className="admin-button"
            disabled={page >= pages || loading || busy}
            onClick={() => setPage((v) => v + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
