"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { ArrowUpRight, LogOut } from "lucide-react";
import { KampusLogo } from "@/components/brand/KampusLogo";

export const adminLinks = [
  ["/admin", "Overview"],
  ["/admin/users", "Accounts"],
  ["/admin/landlords", "Landlord verification"],
  ["/admin/listings", "Unit listings"],
  ["/admin/bookings", "Booking support"],
  ["/admin/disputes", "Disputes"],
  ["/admin/payments", "Payments & payouts"],
  ["/admin/refunds", "Refunds"],
  ["/admin/provider", "Provider issues"],
  ["/admin/roommates", "Roommate listings"],
  ["/admin/amenities", "Amenities"],
  ["/admin/audit", "Activity history"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, isAuthenticated, isLoading, error, checkAuth, login, logout } =
    useAuthStore();
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    void checkAuth().finally(() => setChecked(true));
  }, [checkAuth]);
  const allowed = checked && isAuthenticated && user?.role === "ADMIN";
  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (await login(email.trim(), password, "ADMIN")) setPassword("");
  }
  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <Link href="/admin" className="admin-brand">
          <KampusLogo size={34} />
          <small>Administration</small>
        </Link>
        <div className="admin-top-actions">
          <Link href="/">
            View website <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {allowed && (
            <button className="admin-button" onClick={logout}>
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          )}
        </div>
      </header>
      {!checked ? (
        <p role="status" className="admin-login">
          Checking your access…
        </p>
      ) : !allowed ? (
        <main className="admin-login admin-card">
          <p className="admin-eyebrow">Operations workspace</p>
          <h1>Admin sign in</h1>
          <p>
            Use the email and password of an account with administrator access.
            Your student or landlord profile stays separate.
          </p>
          {isAuthenticated && (
            <p className="admin-notice">
              You are signed in as {user?.fullName || user?.email}. Sign in
              below to start an admin session.
            </p>
          )}
          <form onSubmit={signIn} className="admin-form">
            <label>
              Email or phone
              <input
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="admin-error">
                {error}
              </p>
            )}
            <button className="admin-button primary" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in to administration"}
            </button>
          </form>
        </main>
      ) : (
        <div className="admin-workspace">
          <aside className="admin-sidebar">
            <p className="admin-eyebrow">Workspace</p>
            <nav aria-label="Administration">
              {adminLinks.map(([href, name]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={
                    path === href ||
                    (href !== "/admin" && path.startsWith(href + "/"))
                      ? "page"
                      : undefined
                  }
                >
                  {name}
                </Link>
              ))}
            </nav>
            <div className="admin-identity">
              <strong>{user?.fullName || "Administrator"}</strong>
              <span>{user?.email}</span>
            </div>
          </aside>
          <main
            className={`admin-content${path === "/admin/payments" ? " admin-payments" : ""}`}
            id="admin-content"
          >
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
