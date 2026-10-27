"use client";

import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AdminDispute, bookingsApi } from "@/api/bookings";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "@/lib/stores/useToastStore";

type Resolution = "student_refund" | "landlord_release";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

export default function AdminDisputesPage() {
  const { user, isAuthenticated, isLoading: authLoading, checkAuth, login } = useAuthStore();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>("student_refund");
  const [note, setNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [refundBookingId, setRefundBookingId] = useState("");
  const [refundAction, setRefundAction] = useState<"reconcile" | "retry" | null>(null);
  const [refundResult, setRefundResult] = useState<string | null>(null);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    bookingsApi.getAdminDisputes()
      .then((items) => { if (!cancelled) setDisputes(items); })
      .catch((error: any) => {
        if (cancelled) return;
        setLoadError(error?.response?.data?.message || "Could not load dispute cases.");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id, user?.role]);

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await login(emailOrPhone.trim(), password, "ADMIN");
    if (!success) toast.error("Admin sign-in failed", { description: useAuthStore.getState().error || "Check your credentials and try again." });
  };

  const startResolution = (disputeId: string, choice: Resolution) => {
    setActiveDisputeId(disputeId);
    setResolution(choice);
    setNote("");
  };

  const handleResolve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeDisputeId || note.trim().length < 3) return;

    setIsResolving(true);
    try {
      const result = await bookingsApi.resolveAdminDispute(activeDisputeId, resolution, note.trim());
      setDisputes((current) => current.filter((item) => item.id !== activeDisputeId));
      setActiveDisputeId(null);
      setNote("");
      toast.success(result.message || "Dispute decision recorded", {
        description: resolution === "student_refund"
          ? `Refund status: ${result.data.escrowStatus}. Provider processing may still be required.`
          : "Payout is queued for processing; this decision does not transfer funds.",
      });
    } catch (error: any) {
      toast.error("Could not resolve dispute", {
        description: error?.response?.data?.message || "Refresh the case and try again.",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleRefundFollowUp = async (action: "reconcile" | "retry") => {
    const bookingId = refundBookingId.trim();
    if (!bookingId) return;
    setRefundAction(action);
    setRefundResult(null);
    try {
      const result = action === "reconcile"
        ? await bookingsApi.reconcileAdminRefund(bookingId)
        : await bookingsApi.retryAdminRefund(bookingId);
      const status = result?.status ?? result?.data?.status ?? "unknown";
      setRefundResult(`${status}${result?.providerStatus ? ` · provider: ${result.providerStatus}` : ""}${result?.message ? ` · ${result.message}` : ""}`);
      toast.success(action === "reconcile" ? "Refund status refreshed" : "Refund retry submitted", {
        description: `Current status: ${status}`,
      });
    } catch (error: any) {
      toast.error("Refund follow-up failed", {
        description: error?.response?.data?.message || "Check the booking ID and provider status.",
      });
    } finally {
      setRefundAction(null);
    }
  };

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Kampus
        </Link>

        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Administrator tools</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Dispute review</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Review open cases and record a refund or landlord payout decision. A refund is processed by the payment provider; approving a landlord payout only queues processing and does not transfer funds.
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#26372D] dark:bg-[#101A14]">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Administrator sign-in</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use an existing administrator account. Only accounts with the ADMIN role can access dispute records.</p>
            <form onSubmit={handleAdminLogin} className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email or phone
                <input required value={emailOrPhone} onChange={(event) => setEmailOrPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 outline-none focus:border-emerald-600 dark:border-slate-700" autoComplete="username" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
                <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 outline-none focus:border-emerald-600 dark:border-slate-700" autoComplete="current-password" />
              </label>
              <button disabled={authLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-60">
                {authLoading && <LoaderCircle className="h-4 w-4 animate-spin" />} Sign in as admin
              </button>
            </form>
          </section>
        ) : !isAdmin ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            This account does not have the ADMIN role. Dispute data and resolution actions are restricted to administrators.
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-[#26372D] dark:bg-[#101A14]">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">Open cases</span>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-100">{disputes.length}</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-300"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading disputes…</div>
            ) : loadError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">{loadError}</div>
            ) : disputes.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-[#26372D] dark:bg-[#101A14]">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No open disputes</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">New cases will appear here when students submit a dispute.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {disputes.map((dispute) => {
                  const isActive = activeDisputeId === dispute.id;
                  const evidence = Array.isArray(dispute.evidence) ? dispute.evidence : [];
                  return (
                    <article key={dispute.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#26372D] dark:bg-[#101A14] sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">{dispute.status.replace(/_/g, " ")}</p>
                          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{dispute.booking.lodge.title}</h2>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Case opened {formatDate(dispute.createdAt)} · Booking {dispute.bookingId}</p>
                        </div>
                        <div className="rounded-xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Booking amount</p>
                          <p className="font-bold text-slate-900 dark:text-white">{formatMoney(dispute.booking.totalAmount)}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0B130F]">
                          <p className="font-bold text-slate-800 dark:text-slate-100">Student</p>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">{dispute.booking.student.name}</p>
                          <p className="text-slate-500 dark:text-slate-400">{dispute.booking.student.email || dispute.booking.student.phone}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0B130F]">
                          <p className="font-bold text-slate-800 dark:text-slate-100">Host & payment status</p>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">{dispute.booking.lodge.landlord}</p>
                          <p className="text-slate-500 dark:text-slate-400">{dispute.booking.escrow?.status || "No escrow record"} · Move-in {new Date(dispute.booking.moveInDate).toLocaleDateString("en-NG")}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                        <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" /><div><p className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-300">Student report</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-200">{dispute.reason}</p></div></div>
                      </div>

                      {evidence.length > 0 && (
                        <details className="mt-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">Evidence ({evidence.length})</summary>
                          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{JSON.stringify(evidence, null, 2)}</pre>
                        </details>
                      )}

                      {!isActive ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button type="button" onClick={() => startResolution(dispute.id, "student_refund")} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700">Review refund</button>
                          <button type="button" onClick={() => startResolution(dispute.id, "landlord_release")} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">Approve landlord payout</button>
                        </div>
                      ) : (
                        <form onSubmit={handleResolve} className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Record your decision</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button type="button" onClick={() => setResolution("student_refund")} className={`rounded-lg px-3 py-2 text-xs font-bold ${resolution === "student_refund" ? "bg-emerald-700 text-white" : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>Refund student</button>
                              <button type="button" onClick={() => setResolution("landlord_release")} className={`rounded-lg px-3 py-2 text-xs font-bold ${resolution === "landlord_release" ? "bg-emerald-700 text-white" : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>Queue landlord payout</button>
                            </div>
                          </div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Admin note (required for the audit record)
                            <textarea required minLength={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-[#0B130F]" />
                          </label>
                          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {resolution === "student_refund"
                              ? "This submits a refund request to the payment provider. The case records the provider's current refund status."
                              : "This marks payout processing as pending. It does not make a bank transfer."}
                          </p>
                          <div className="flex gap-2">
                            <button disabled={isResolving || note.trim().length < 3} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                              {isResolving && <LoaderCircle className="h-4 w-4 animate-spin" />} Confirm decision
                            </button>
                            <button type="button" disabled={isResolving} onClick={() => setActiveDisputeId(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                          </div>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 dark:border-[#26372D] dark:bg-[#101A14] sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Refund follow-up</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Refresh an existing provider refund by booking ID. Retry is available only when the provider has confirmed the prior refund failed.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input value={refundBookingId} onChange={(event) => setRefundBookingId(event.target.value)} placeholder="Booking ID" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-emerald-600 dark:border-slate-700" />
                <button type="button" disabled={!refundBookingId.trim() || Boolean(refundAction)} onClick={() => void handleRefundFollowUp("reconcile")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 disabled:opacity-50 dark:border-slate-600 dark:text-slate-100">
                  {refundAction === "reconcile" && <LoaderCircle className="h-4 w-4 animate-spin" />} Refresh status
                </button>
                <button type="button" disabled={!refundBookingId.trim() || Boolean(refundAction)} onClick={() => void handleRefundFollowUp("retry")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  {refundAction === "retry" && <LoaderCircle className="h-4 w-4 animate-spin" />} Retry failed refund
                </button>
              </div>
              {refundResult && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-[#0B130F] dark:text-slate-200">{refundResult}</p>}
            </section>
          </>
        )}
      </main>
    </>
  );
}
