"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { adminError, date } from "@/api/admin";
type Overview = Record<string, number | boolean>;
const tiles = [
  ["pendingLandlords", "Landlords awaiting verification", "/admin/landlords"],
  ["openDisputes", "Disputes to review", "/admin/disputes"],
  ["overdueInspections", "Inspections past seven days", "/admin/bookings"],
  ["paymentIssues", "Payments needing attention", "/admin/payments"],
  ["refundIssues", "Booking refunds in progress", "/admin/refunds"],
  ["chargebacks", "Active chargebacks", "/admin/provider"],
  ["failedEvents", "Provider events waiting", "/admin/provider"],
  ["hiddenListings", "Hidden unit listings", "/admin/listings"],
  ["suspendedUsers", "Suspended accounts", "/admin/users"],
  ["hiddenRoommates", "Hidden roommate adverts", "/admin/roommates"],
] as const;
export default function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData((await apiClient.get("/admin/overview")).data.data);
      setUpdated(new Date().toISOString());
    } catch (e) {
      setError(adminError(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  return (
    <section>
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Kampus operations</p>
          <h1>A clear view of what needs attention.</h1>
          <p>
            Review the queues below, keep students informed, and record the
            reason behind each decision.
          </p>
        </div>
        <button
          className="admin-button"
          disabled={loading}
          onClick={() => void refresh()}
        >
          Refresh overview
        </button>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading your overview…</p>
      ) : (
        data && (
          <>
            <div className="admin-notice">
              <strong>
                {data.testPayments
                  ? "Test payments enabled"
                  : "Payment environment"}
              </strong>
              <p>
                {data.testPayments
                  ? "Dummy payments do not move real money."
                  : "Collections: " +
                    (data.collectionsEnabled ? "enabled" : "disabled") +
                    ". Landlord transfers: " +
                    (data.transfersEnabled ? "enabled." : "disabled.")}
              </p>
            </div>
            <div className="admin-grid">
              {tiles.map(([key, title, href]) => (
                <article className="admin-card admin-stat" key={key}>
                  <p className="admin-meta">{title}</p>
                  <strong>{Number(data[key] || 0)}</strong>
                  <Link href={href}>Open queue →</Link>
                </article>
              ))}
            </div>
            <div className="admin-card mt-6">
              <h2>Platform at a glance</h2>
              <p>
                {Number(data.users)} accounts · {Number(data.visibleListings)}{" "}
                published units
              </p>
              <p className="admin-meta">
                Last refreshed {date(updated)} · Africa/Lagos
              </p>
            </div>
          </>
        )
      )}
    </section>
  );
}
