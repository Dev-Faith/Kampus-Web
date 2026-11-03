"use client";
import { useState } from "react";
import { AdminDataPage } from "@/components/admin/AdminDataPage";
export default function ProviderPage() {
  const [view, setView] = useState<"chargebacks" | "events">("chargebacks");
  return (
    <>
      <div className="admin-actions mb-6" aria-label="Provider queues">
        <button
          className={
            "admin-button " + (view === "chargebacks" ? "primary" : "")
          }
          aria-pressed={view === "chargebacks"}
          onClick={() => setView("chargebacks")}
        >
          Chargebacks
        </button>
        <button
          className={"admin-button " + (view === "events" ? "primary" : "")}
          aria-pressed={view === "events"}
          onClick={() => setView("events")}
        >
          Payment events
        </button>
        <a
          className="admin-button"
          href="https://dashboard.flutterwave.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Flutterwave dashboard ↗
        </a>
      </div>
      <AdminDataPage key={view} resource={view} />
    </>
  );
}
