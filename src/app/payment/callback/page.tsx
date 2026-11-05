"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { bookingsApi } from "@/api/bookings";

function PaymentCallbackContent() {
  const params = useSearchParams();
  const attempted = useRef(false);
  const [state, setState] = useState<"checking" | "confirmed" | "pending" | "failed" | "refund" | "refunded">("checking");

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const providerStatus = params.get("status")?.toLowerCase();
    const reference = params.get("tx_ref");
    const transactionId = params.get("transaction_id");
    if (providerStatus !== "successful" || !reference || !transactionId) {
      setState(providerStatus === "cancelled" || providerStatus === "failed" ? "failed" : "pending");
      return;
    }

    bookingsApi.verifyPayment({ reference, transactionId })
      .then((result) => {
        const status = String(result.status || result.escrowStatus || "").toUpperCase();
        if (status === "REFUNDED") setState("refunded");
        else if (status.startsWith("REFUND_")) setState("refund");
        else if (status === "PAID" || ["HELD", "DISPUTED", "PAYOUT_PENDING", "RELEASED"].includes(status)) setState("confirmed");
        else setState(result.success ? "pending" : "failed");
      })
      .catch(() => setState("pending"));
  }, [params]);

  const content = {
    checking: {
      icon: <Clock3 className="h-8 w-8 text-warning" />,
      title: "Confirming your payment",
      body: "We are checking the transaction directly with Flutterwave.",
    },
    confirmed: {
      icon: <CheckCircle2 className="h-8 w-8 text-success" />,
      title: "Payment confirmed",
      body: "Your booking or inspection extension has been updated.",
    },
    pending: {
      icon: <Clock3 className="h-8 w-8 text-warning" />,
      title: "Confirmation is still pending",
      body: "The provider has not confirmed the payment yet. Check your booking again shortly; a successful provider verification will update it automatically.",
    },
    failed: {
      icon: <XCircle className="h-8 w-8 text-destructive" />,
      title: "Payment was not completed",
      body: "No inspection extension has been applied. You can return to your booking and try again while the extension window is open.",
    },
    refund: {
      icon: <Clock3 className="h-8 w-8 text-warning" />,
      title: "Payment received; refund review in progress",
      body: "The payment could not be applied to your booking or inspection extension. A refund is processing or needs support review. Check your booking for the latest status.",
    },
    refunded: {
      icon: <CheckCircle2 className="h-8 w-8 text-success" />,
      title: "Payment refunded",
      body: "The refund has been confirmed. Check your booking for details and your bank or payment provider for when it will appear.",
    },
  }[state];

  return (
    <div className="editorial-page min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 grid place-items-center px-4 py-12">
        <section className="payment-result w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            {state === "checking" ? <ShieldCheck className="h-8 w-8 text-success" /> : content.icon}
          </div>
          <h1 className="text-3xl font-normal tracking-tight">{content.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.body}</p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/bookings">
              <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover">View my bookings</Button>
            </Link>
            {state === "pending" && (
              <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full">Check again</Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Checking payment…</div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
