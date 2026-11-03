"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  adminApi,
  adminError,
  calendarDate,
  date,
  money,
  type AdminPage,
  type AdminRow,
  type Resource,
} from "@/api/admin";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const config: Record<
  Resource,
  { title: string; description: string; filters: [string, string][] }
> = {
  users: {
    title: "Accounts",
    description:
      "Resolve account access problems. Suspension blocks sign-in and new activity while preserving existing booking records.",
    filters: [
      ["", "All accounts"],
      ["suspended", "Suspended"],
      ["admins", "Administrators"],
    ],
  },
  landlords: {
    title: "Landlord verification",
    description:
      "Review identity and ownership evidence through your support process before approving. A saved BVN is not proof of verification. Bank details are masked here.",
    filters: [
      ["PENDING", "Awaiting review"],
      ["APPROVED", "Approved"],
      ["REJECTED", "Rejected"],
      ["", "All landlords"],
    ],
  },
  listings: {
    title: "Unit listings",
    description:
      "Listings publish immediately. Hide inaccurate, unsafe, or misleading units from discovery and new bookings. Existing reservations remain accessible.",
    filters: [
      ["", "All listings"],
      ["visible", "Visible"],
      ["hidden", "Hidden"],
    ],
  },
  bookings: {
    title: "Booking support",
    description:
      "Find a reservation, inspect its payment history, add internal notes, or open a case for review. Deadlines use Africa/Lagos calendar days.",
    filters: [
      ["", "All bookings"],
      ["overdue", "Past the 7-day limit"],
      ["unpaid", "Awaiting payment"],
      ["review", "Under review"],
    ],
  },
  roommates: {
    title: "Roommate listings",
    description:
      "Hide inappropriate or misleading roommate adverts. Students cannot undo an admin moderation decision by editing their listing.",
    filters: [
      ["", "All roommate listings"],
      ["hidden", "Hidden"],
    ],
  },
  amenities: {
    title: "Amenities",
    description:
      "Maintain the amenities offered on web and mobile. Archive retired options while keeping them on existing listings.",
    filters: [
      ["", "All amenities"],
      ["archived", "Archived"],
    ],
  },
  chargebacks: {
    title: "Chargebacks",
    description:
      "Investigate and submit evidence in the Flutterwave dashboard. Refresh the provider decision here; an admin cannot manually clear a chargeback hold.",
    filters: [
      ["", "Active cases"],
      ["all", "All cases"],
    ],
  },
  events: {
    title: "Payment events",
    description:
      "Investigate provider verification failures and retry a due event. Retries check the provider and preserve the existing transaction reference.",
    filters: [
      ["", "Waiting for processing"],
      ["all", "All events"],
    ],
  },
  audit: {
    title: "Activity history",
    description:
      "A permanent record of admin decisions and financial requests. Check the booking payment history and provider status to confirm whether money moved.",
    filters: [["", "All activity"]],
  },
};
type Action = {
  row: AdminRow;
  label: string;
  path: string;
  method?: "post" | "patch";
  body?: Record<string, unknown>;
  note?: boolean;
  amenity?: boolean;
};
const categories = [
  "utilities",
  "connectivity",
  "comfort",
  "facilities",
  "furnishings",
  "security",
];
const icons = [
  "bolt",
  "water",
  "wifi",
  "ac-unit",
  "air",
  "local-dining",
  "wc",
  "storage",
  "checkroom",
  "parking",
  "security",
  "fence",
  "power",
  "pool",
  "fitness-center",
];

export function AdminDataPage({ resource }: { resource: Resource }) {
  const c = config[resource];
  const currentId = useAuthStore((s) => s.user?.id);
  const [filter, setFilter] = useState(c.filters[0][0]);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<AdminPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("facilities");
  const [icon, setIcon] = useState("security");
  const [active, setActive] = useState(true);
  const actionPanel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (action) {
      actionPanel.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      actionPanel.current
        ?.querySelector<HTMLElement>("input,select,textarea,button")
        ?.focus({ preventScroll: true });
    }
  }, [action]);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setLoadError("");
    adminApi
      .list(resource, { page, pageSize: 20, search, filter }, abort.signal)
      .then(setData)
      .catch((e) => {
        if (!abort.signal.aborted) {
          setData(null);
          setLoadError(adminError(e));
        }
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [resource, page, search, filter, revision]);

  function choose(next: Action) {
    setAction(next);
    setReason("");
    setActionError("");
    setNotice("");
    setName(next.row.name || "");
    setCategory(next.row.category || "facilities");
    setIcon(next.row.icon || "security");
    setActive(next.row.isActive ?? true);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!action || busy) return;
    setBusy(true);
    setActionError("");
    setNotice("");
    const body = {
      ...action.body,
      ...(action.note ? { reason: reason.trim() } : {}),
      ...(action.amenity
        ? { name: name.trim(), category, icon, isActive: active }
        : {}),
      ...(action.method === "patch"
        ? { expectedUpdatedAt: action.row.updatedAt }
        : {}),
    };
    try {
      const response = await adminApi.action(action.path, body, action.method);
      setNotice(response.message || "Action recorded.");
      setAction(null);
      setRevision((v) => v + 1);
    } catch (e) {
      setActionError(adminError(e));
    } finally {
      setBusy(false);
    }
  }

  function actions(row: AdminRow): Action[] {
    if (resource === "users")
      return row.id === currentId || row.role === "ADMIN" || row.adminAccess
        ? []
        : [
            {
              row,
              label: row.isActive ? "Suspend account" : "Reactivate account",
              path: "users/" + row.id + "/status",
              method: "patch",
              body: { isActive: !row.isActive },
              note: true,
            },
          ];
    if (resource === "landlords")
      return ["APPROVED", "REJECTED", "PENDING"]
        .filter((s) => s !== row.kycStatus)
        .map((status) => ({
          row,
          label:
            status === "APPROVED"
              ? "Approve verification"
              : status === "REJECTED"
                ? "Reject verification"
                : "Return to review",
          path: "landlords/" + row.id + "/verification",
          method: "patch",
          body: { kycStatus: status },
          note: true,
        }));
    if (resource === "listings" || resource === "roommates")
      return [
        {
          row,
          label: row.isHidden ? "Restore listing" : "Hide listing",
          path: resource + "/" + row.id + "/visibility",
          method: "patch",
          body: { isHidden: !row.isHidden },
          note: true,
        },
      ];
    if (resource === "amenities")
      return [
        {
          row,
          label: "Edit amenity",
          path: "amenities/" + row.id,
          method: "patch",
          amenity: true,
          note: true,
        },
      ];
    if (resource === "chargebacks")
      return [
        {
          row,
          label: "Check provider status",
          path: "chargebacks/reconcile",
          body: { providerId: row.providerId },
        },
      ];
    if (resource === "events" && row.state !== "PROCESSED")
      return [
        {
          row,
          label: "Retry provider check",
          path: "events/" + row.id + "/retry",
        },
      ];
    return [];
  }
  function heading(row: AdminRow) {
    return (
      row.fullName ||
      row.businessName ||
      row.title ||
      row.name ||
      row.user?.fullName ||
      row.student?.user.fullName ||
      row.event ||
      row.action?.replaceAll("_", " ") ||
      "Chargeback " + row.providerId
    );
  }
  return (
    <section>
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Operations / {c.title}</p>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
        </div>
        <button
          className="admin-button"
          disabled={loading || busy}
          onClick={() => setRevision((v) => v + 1)}
        >
          Refresh
        </button>
      </div>
      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchText.trim());
          setAction(null);
        }}
      >
        <label>
          Search
          <input
            type="search"
            placeholder={
              resource === "audit"
                ? "Action, record ID, admin ID or note"
                : "Search records…"
            }
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>
        {c.filters.length > 1 && (
          <label>
            Show
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
                setAction(null);
              }}
            >
              {c.filters.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="admin-button" disabled={busy}>
          Search
        </button>
        {resource === "amenities" && (
          <button
            type="button"
            className="admin-button primary"
            disabled={busy}
            onClick={() =>
              choose({
                row: { id: "new", updatedAt: "", createdAt: "" },
                label: "Add amenity",
                path: "amenities",
                amenity: true,
                note: true,
              })
            }
          >
            Add amenity
          </button>
        )}
        {resource === "bookings" && (
          <button
            type="button"
            className="admin-button"
            disabled={busy}
            onClick={() =>
              choose({
                row: { id: "scan", updatedAt: "", createdAt: "" },
                label: "Review expired inspections",
                path: "inspections/review-expired",
              })
            }
          >
            Check expired inspections
          </button>
        )}
      </form>
      {action && (
        <section
          ref={actionPanel}
          className="admin-dialog"
          aria-label="Confirm admin action"
        >
          <h2>{action.label}</h2>
          <p className="admin-meta">
            {action.row.title ||
              action.row.name ||
              action.row.fullName ||
              action.row.user?.fullName ||
              action.row.id}
          </p>
          {action.label === "Approve verification" && (
            <p>
              Confirm that you have reviewed identity and ownership evidence.
              Record where it was checked and the result below; do not paste
              BVNs or bank details.
            </p>
          )}
          {action.path === "inspections/review-expired" && (
            <p>
              This opens review cases for paid, uninspected bookings past the
              seven-day limit. It does not authorize a payout.
            </p>
          )}
          {resource === "events" && (
            <p>
              Retry is available only after the event’s next attempt time. An
              in-progress check cannot be duplicated.
            </p>
          )}
          <form className="admin-form" onSubmit={submit}>
            {action.amenity && (
              <div className="admin-grid">
                <label>
                  Name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Category
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Icon
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    {icons.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Availability
                  <select
                    value={String(active)}
                    onChange={(e) => setActive(e.target.value === "true")}
                  >
                    <option value="true">Active</option>
                    <option value="false">Archived</option>
                  </select>
                </label>
              </div>
            )}
            {action.note && (
              <label>
                Reason or evidence review note
                <textarea
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this action is needed. This becomes part of the admin history."
                />
              </label>
            )}
            {actionError && (
              <p className="admin-error" role="alert">
                {actionError}
              </p>
            )}
            <div className="admin-actions">
              <button
                className="admin-button primary"
                disabled={busy || (!!action.note && reason.trim().length < 5)}
              >
                {busy ? "Processing…" : "Confirm " + action.label.toLowerCase()}
              </button>
              <button
                type="button"
                className="admin-button"
                disabled={busy}
                onClick={() => setAction(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      {loading ? (
        <p role="status" className="admin-card">
          Loading {c.title.toLowerCase()}…
        </p>
      ) : loadError ? (
        <p role="alert" className="admin-error">
          {loadError}
        </p>
      ) : !data?.items.length ? (
        <div className="admin-card">
          <h2>No matching records</h2>
          <p>
            There are no records for these filters. Try another search or
            refresh the queue.
          </p>
        </div>
      ) : (
        <div className="admin-cards">
          {data.items.map((row) => (
            <article className="admin-card" key={row.id || row.providerId}>
              <div className="admin-card-head">
                <div>
                  <h2>
                    {resource === "bookings"
                      ? row.lodge?.title || "Booking"
                      : heading(row)}
                  </h2>
                  <p className="admin-meta">{row.id || row.providerId}</p>
                </div>
                <span
                  className={
                    "admin-badge " +
                    (row.isHidden ||
                    row.isActive === false ||
                    row.kycStatus === "PENDING" ||
                    row.active
                      ? "warn"
                      : "")
                  }
                >
                  {resource === "users"
                    ? (row.isActive ? "Active · " : "Suspended · ") + row.role
                    : resource === "amenities"
                      ? row.isActive
                        ? "Active"
                        : "Archived"
                      : resource === "landlords"
                        ? row.kycStatus
                        : resource === "listings" || resource === "roommates"
                          ? row.isHidden
                            ? "Hidden by admin"
                            : "Published"
                          : row.status || row.state || row.targetType}
                </span>
              </div>
              {resource === "users" && (
                <>
                  <p>
                    {row.email || "No email"} · {row.phone}
                  </p>
                  {row.adminAccess && <p>Administrator access enabled</p>}
                  {row.suspensionReason && <p>{row.suspensionReason}</p>}
                </>
              )}
              {resource === "landlords" && (
                <>
                  <p>
                    {row.user?.fullName} · {row.user?.email || row.user?.phone}
                  </p>
                  <dl className="admin-details">
                    <div>
                      <dt>Business registration</dt>
                      <dd>{row.businessRegistration || "Not provided"}</dd>
                    </div>
                    <div>
                      <dt>Bank details</dt>
                      <dd>
                        {row.bankName || "Not provided"}{" "}
                        {row.bankAccountLast4
                          ? "•••• " + row.bankAccountLast4
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Account name</dt>
                      <dd>{row.bankAccountName || "Not provided"}</dd>
                    </div>
                    <div>
                      <dt>BVN on file</dt>
                      <dd>
                        {row.bvnProvided
                          ? "Provided; verify through your approved process"
                          : "Not provided"}
                      </dd>
                    </div>
                  </dl>
                </>
              )}
              {resource === "listings" && (
                <>
                  <p>
                    {row.building?.name}{" "}
                    {row.unitLabel ? "· Unit " + row.unitLabel : ""}
                  </p>
                  <p>
                    {row.category} · {money(row.rent)}/year · {row.status}
                  </p>
                  <p>
                    {row.address} · {row.campusArea}
                  </p>
                  <p className="admin-meta">
                    Landlord: {row.landlord?.user.fullName} ·{" "}
                    {row.landlord?.user.email}
                  </p>
                  <details>
                    <summary>View description and photos</summary>
                    <p>{row.description}</p>
                    <div className="admin-photos">
                      {row.images
                        ?.filter((im) => /^https?:\/\//i.test(im.url))
                        .map((im, i) => (
                          <a
                            href={im.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                          >
                            <img
                              src={im.url}
                              alt={"Listing photo " + (i + 1)}
                              loading="lazy"
                            />
                          </a>
                        ))}
                    </div>
                  </details>
                </>
              )}
              {resource === "bookings" && (
                <>
                  <p>
                    {row.student?.user.fullName} · {row.student?.user.email}
                  </p>
                  <p>
                    {money(row.totalAmount)} · Move-in{" "}
                    {calendarDate(row.moveInDate)}
                  </p>
                  <p>
                    Payment: {row.escrow?.status || "No payment record"}{" "}
                    {row.escrow?.paymentProvider === "KAMPUS_TEST"
                      ? "· Test payment"
                      : ""}
                  </p>
                  {row.escrow?.reviewReason && <p>{row.escrow.reviewReason}</p>}
                  <Link
                    className="admin-button"
                    href={"/admin/bookings/" + row.id}
                  >
                    Open booking
                  </Link>
                </>
              )}
              {resource === "roommates" && (
                <>
                  <p>
                    {row.student?.user.email} · {row.university} ·{" "}
                    {row.department}
                  </p>
                  <p>{row.bio}</p>
                  <p>
                    Budget: {money(row.budgetMax)} ·{" "}
                    {row.isActive
                      ? "Owner has enabled this advert"
                      : "Owner has paused this advert"}
                  </p>
                </>
              )}
              {row.moderationReason && (
                <p>Moderation reason: {row.moderationReason}</p>
              )}
              {resource === "amenities" && (
                <p>
                  {row.category} · {row.icon} · Used on{" "}
                  {row._count?.lodges || 0} listings
                </p>
              )}
              {resource === "chargebacks" && (
                <>
                  <p>
                    {money(row.amount)} ·{" "}
                    {row.active ? "Payout hold active" : "Provider closed hold"}
                  </p>
                  <p>Updated {date(row.updatedAt)}</p>
                  <Link
                    className="admin-button"
                    href={"/admin/bookings/" + row.bookingId}
                  >
                    Open booking
                  </Link>
                </>
              )}
              {resource === "events" && (
                <>
                  <p>
                    {row.attempts} attempts · Next attempt {date(row.nextRunAt)}
                  </p>
                  <p>{row.lastError || "No error recorded"}</p>
                  <p className="admin-meta">
                    Provider ID: {row.providerId} · Reference:{" "}
                    {row.reference || "—"}
                  </p>
                </>
              )}
              {resource === "audit" && (
                <>
                  <p>
                    {date(row.createdAt)} ·{" "}
                    {row.actor?.fullName ||
                      row.actor?.email ||
                      row.actorUserId ||
                      "System / authorized setup"}
                  </p>
                  <p>
                    {row.targetType}: {row.targetId}
                  </p>
                  {row.reason && <p>{row.reason}</p>}
                  {row.details && (
                    <details>
                      <summary>Operation details</summary>
                      <pre className="whitespace-pre-wrap break-all text-xs mt-2">
                        {JSON.stringify(row.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </>
              )}
              {actions(row).length > 0 && (
                <div className="admin-actions">
                  {actions(row).map((a) => (
                    <button
                      className="admin-button"
                      key={a.label}
                      disabled={busy}
                      onClick={() => choose(a)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {data && !loading && (
        <div className="admin-pagination">
          <span>
            {data.pagination.total} records · Page {page} of{" "}
            {data.pagination.totalPages}
          </span>
          <div className="admin-actions">
            <button
              className="admin-button"
              disabled={page <= 1 || busy}
              onClick={() => {
                setPage((p) => p - 1);
                setAction(null);
              }}
            >
              Previous
            </button>
            <button
              className="admin-button"
              disabled={page >= data.pagination.totalPages || busy}
              onClick={() => {
                setPage((p) => p + 1);
                setAction(null);
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
