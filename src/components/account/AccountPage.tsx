"use client";
import { Fragment, Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/api";
export function AccountPage({
  title,
  description,
  roles,
  children,
}: {
  title: string;
  description?: string;
  roles?: UserRole[];
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const [auth, setAuth] = useState(false);
  const pathname = usePathname();
  const links =
    user?.role === "LANDLORD"
      ? [
          ["Overview", "/host/dashboard"],
          ["Units", "/host/properties"],
          ["Bookings", "/host/bookings"],
          ["Payout details", "/host/payouts"],
        ]
      : user?.role === "STUDENT"
        ? [
            ["Bookings", "/bookings"],
            ["Saved units", "/saved-lodges"],
            ["Roommates", "/roommates"],
          ]
        : [["Administration", "/admin"]];
  return (
    <>
      <Navbar />
      <main className="editorial-page min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-8 sm:py-12">
          <header className="space-y-3">
            <p className="editorial-eyebrow">Your Kampus</p>
            <h1 className="editorial-title text-4xl sm:text-5xl">{title}</h1>
            {description && (
              <p className="max-w-2xl text-muted-foreground">{description}</p>
            )}
          </header>
          {user && (
            <nav
              aria-label="Account navigation"
              className="flex flex-wrap gap-2 border-b border-border pb-5"
            >
              {[
                ...links,
                ["Notifications", "/notifications"],
                ["Profile", "/settings"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm ${pathname === href ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-brand-soft"}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
          {!user ? (
            <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <p>Sign in to access your account.</p>
              <Button onClick={() => setAuth(true)}>Sign in</Button>
            </section>
          ) : roles && !roles.includes(user.role) ? (
            <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <p>
                This page is for{" "}
                {roles.map((r) => r.toLowerCase()).join(" and ")} accounts.
              </p>
              <Link
                href={
                  user.role === "LANDLORD" ? "/host/dashboard" : "/settings"
                }
                className="text-brand-strong underline"
              >
                Go to your account
              </Link>
            </section>
          ) : (
            <Fragment key={user.id}>{children}</Fragment>
          )}
        </div>
      </main>
      <Suspense fallback={null}>
        <AccountAuth
          isOpen={auth}
          onClose={() => setAuth(false)}
          role={roles?.includes("LANDLORD") ? "LANDLORD" : "STUDENT"}
        />
      </Suspense>
    </>
  );
}

function AccountAuth({
  isOpen,
  onClose,
  role,
}: {
  isOpen: boolean;
  onClose: () => void;
  role: "STUDENT" | "LANDLORD";
}) {
  const params = useSearchParams();
  const [directOpen, setDirectOpen] = useState(params.get("register") === "1");
  return (
    <AuthModal
      defaultRole={role}
      isOpen={isOpen || directOpen}
      onClose={() => {
        setDirectOpen(false);
        onClose();
      }}
    />
  );
}
