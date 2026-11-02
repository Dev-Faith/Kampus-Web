"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Navbar } from "@/components/layout/Navbar";

type Queue = {
  bookings: {
    bookingId: string;
    status: string;
    reviewReason: string | null;
    settledAt: string | null;
    settlementRequestedAt: string | null;
    paymentProvider: string;
  }[];
  attempts: {
    id: string;
    bookingId: string;
    reference: string;
    status: string;
    failureReason: string | null;
  }[];
  events: {
    id: string;
    event: string;
    attempts: number;
    lastError: string | null;
  }[];
  extensions: {
    id: string;
    bookingId: string;
    extensionNumber: number;
    status: string;
  }[];
};

function message(error: unknown) {
  const e = error as { response?: { data?: { message?: string } } };
  return (
    e.response?.data?.message ||
    "Could not complete this action. Refresh the queue before trying again."
  );
}

export default function PaymentOperationsPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [settlementId, setSettlementId] = useState("");
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const refresh = useCallback(async () => {
    try {
      setQueue((await apiClient.get("/payments/admin/queue")).data.data);
    } catch (error) {
      setNotice(message(error));
    }
  }, []);
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    if (isAdmin) void refresh();
  }, [isAdmin, refresh]);

  async function act(path: string) {
    setBusy(true);
    setNotice("");
    try {
      const response = await apiClient.post(
        `/payments/admin/${path}`,
        {},
        { timeout: 90000 },
      );
      const result = response.data.data ?? response.data;
      setNotice(
        result.message ||
          (result.failures?.length
            ? `${result.failures.length} items still need attention. Review the queue.`
            : `Updated: ${result.status || "reconciliation complete"}`),
      );
      await refresh();
    } catch (error) {
      setNotice(message(error));
    } finally {
      setBusy(false);
    }
  }

  const button =
    "rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800";
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <Link href="/admin/disputes" className="text-sm underline">
          Dispute and inspection reviews
        </Link>
        <h1 className="text-2xl font-bold">Booking payments</h1>
        {!isAdmin ? (
          <p>
            Sign in as an administrator on the{" "}
            <Link className="underline" href="/admin/disputes">
              review page
            </Link>{" "}
            to manage payments.
          </p>
        ) : (
          <>
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Kampus manages booking funds. Flutterwave processes collections,
              refunds and landlord transfers. An approved inspection can still
              be waiting for settlement. Unknown transfers must be checked
              before any further payment.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className={button}
                disabled={busy}
                onClick={() => void refresh()}
              >
                Refresh queue
              </button>
              <button
                className={button}
                disabled={busy}
                onClick={() => void act("reconcile")}
              >
                Check payments & process approved payouts
              </button>
            </div>
            {notice && (
              <p
                role="status"
                className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950"
              >
                {notice}
              </p>
            )}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                Bookings needing attention
              </h2>
              {!queue ? (
                <p>Loading payments…</p>
              ) : !queue.bookings.length ? (
                <p>No bookings need attention.</p>
              ) : (
                queue.bookings.map((item) => (
                  <article
                    key={item.bookingId}
                    className="space-y-2 rounded-xl border p-4"
                  >
                    <p className="break-all font-mono text-xs">
                      {item.bookingId}
                    </p>
                    <p className="font-medium">
                      {item.status.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm">
                      {item.reviewReason ||
                        (item.settledAt
                          ? "Settlement confirmed"
                          : "Awaiting settlement confirmation")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.status === "PAYOUT_PENDING" && (
                        <button
                          disabled={busy || Boolean(item.reviewReason)}
                          className={button}
                          onClick={() =>
                            void act(
                              `bookings/${item.bookingId}/payout/reconcile`,
                            )
                          }
                        >
                          {item.settlementRequestedAt
                            ? "Check transfer"
                            : "Process approved payout"}
                        </button>
                      )}
                      {["REFUND_PENDING", "REFUND_FAILED"].includes(
                        item.status,
                      ) && (
                        <button
                          disabled={busy}
                          className={button}
                          onClick={() =>
                            void act(
                              `bookings/${item.bookingId}/refund/reconcile`,
                            )
                          }
                        >
                          Check refund
                        </button>
                      )}
                      {item.status === "REFUND_FAILED" && (
                        <button
                          disabled={busy}
                          className={button}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Retry this provider-confirmed failed refund?",
                              )
                            )
                              void act(
                                `bookings/${item.bookingId}/refund/retry`,
                              );
                          }}
                        >
                          Retry failed refund
                        </button>
                      )}
                      {item.status === "DISPUTED" && (
                        <Link href="/admin/disputes" className={button}>
                          Review case
                        </Link>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                Transfers awaiting completion
              </h2>
              {queue?.attempts.length === 0 && (
                <p>No outstanding transfer attempts.</p>
              )}
              {queue?.attempts.map((attempt) => (
                <article
                  key={attempt.id}
                  className="space-y-2 rounded-xl border p-4"
                >
                  <p className="break-all text-sm">
                    {attempt.reference} · {attempt.status}
                  </p>
                  <p className="text-sm">
                    {attempt.failureReason || "Awaiting provider confirmation"}
                  </p>
                  {attempt.status === "FAILED" ? (
                    <button
                      disabled={busy}
                      className={button}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Flutterwave confirmed this attempt failed. Submit a new landlord payout after checking this booking?",
                          )
                        )
                          void act(
                            `bookings/${attempt.bookingId}/payout/retry`,
                          );
                      }}
                    >
                      Retry confirmed failed transfer
                    </button>
                  ) : (
                    <button
                      disabled={busy}
                      className={button}
                      onClick={() =>
                        void act(
                          `bookings/${attempt.bookingId}/payout/reconcile`,
                        )
                      }
                    >
                      Check existing transfer
                    </button>
                  )}
                </article>
              ))}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                Inspection extension refunds
              </h2>
              {queue?.extensions.length === 0 && (
                <p>No extension refunds need attention.</p>
              )}
              {queue?.extensions.map((extension) => (
                <article
                  key={extension.id}
                  className="space-y-2 rounded-xl border p-4"
                >
                  <p className="break-all text-sm">
                    {extension.bookingId} · Extension{" "}
                    {extension.extensionNumber} · {extension.status}
                  </p>
                  <button
                    disabled={busy}
                    className={button}
                    onClick={() =>
                      void act(
                        `bookings/${extension.bookingId}/inspection-extension/${extension.id}/refund/reconcile`,
                      )
                    }
                  >
                    Check extension refund
                  </button>
                  {extension.status === "REFUND_FAILED" && (
                    <button
                      disabled={busy}
                      className={button}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Retry this provider-confirmed failed extension refund?",
                          )
                        )
                          void act(
                            `bookings/${extension.bookingId}/inspection-extension/${extension.id}/refund/retry`,
                          );
                      }}
                    >
                      Retry failed extension refund
                    </button>
                  )}
                </article>
              ))}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                Provider events awaiting processing
              </h2>
              {queue?.events.length === 0 && <p>No pending provider events.</p>}
              {queue?.events.map((event) => (
                <p key={event.id} className="rounded-xl border p-3 text-sm">
                  {event.event} · {event.attempts} attempts
                  {event.lastError ? ` · ${event.lastError}` : ""}
                </p>
              ))}
            </section>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void act(
                  `settlements/${encodeURIComponent(settlementId.trim())}/reconcile`,
                );
              }}
            >
              <label className="text-sm">
                Settlement ID from Flutterwave
                <input
                  className="mt-1 block rounded-lg border bg-transparent p-2"
                  value={settlementId}
                  onChange={(event) => setSettlementId(event.target.value)}
                  required
                  pattern="[0-9]+"
                />
              </label>
              <button className={button} disabled={busy}>
                Check settlement
              </button>
            </form>
          </>
        )}
      </main>
    </>
  );
}
