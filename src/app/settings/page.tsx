"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileSetup } from "@/components/auth/ProfileSetup";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [auth, setAuth] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Navbar />
      <main className="editorial-page min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl space-y-8 px-5 py-10 sm:px-8 sm:py-14">
          <header className="space-y-3 border-b border-border pb-8">
            <p className="editorial-eyebrow">Your Kampus account</p>
            <h1 className="editorial-title text-4xl sm:text-5xl">
              Profile settings.
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Keep your details up to date, add a familiar face, and make Kampus
              feel like you.
            </p>
          </header>
          {!user ? (
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                Sign in to manage your profile
              </h2>
              <Button onClick={() => setAuth(true)}>Sign in</Button>
            </div>
          ) : (
            <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <section className="min-w-0 rounded-3xl border border-border bg-card p-5 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-xl bg-brand-soft p-3 text-brand-strong">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-semibold">Your profile</h2>
                </div>
                {user.role === "ADMIN" ? (
                  <p className="text-muted-foreground">
                    Sign in with your student or landlord account to edit its
                    profile.
                  </p>
                ) : (
                  <>
                    {saved && (
                      <p
                        role="status"
                        className="mb-5 rounded-xl bg-success-soft p-3 text-success"
                      >
                        Your profile has been saved.
                      </p>
                    )}
                    <ProfileSetup
                      key={user.id}
                      mode="settings"
                      onComplete={() => setSaved(true)}
                      onEdit={() => setSaved(false)}
                    />
                  </>
                )}
              </section>
              <aside className="space-y-5">
                <section className="rounded-3xl border border-border bg-card p-5 space-y-3">
                  <h2 className="font-semibold">Appearance</h2>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Light, dark or system
                    </p>
                    <ThemeToggle />
                  </div>
                </section>
                <section className="rounded-3xl border border-border bg-card p-5 space-y-3">
                  <h2 className="font-semibold">Account</h2>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "LANDLORD"
                      ? "Landlord"
                      : user.role === "ADMIN"
                        ? "Administrator"
                        : "Student"}{" "}
                    account
                  </p>
                  <p className="break-all text-sm">
                    {user.email || user.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.emailVerifiedAt
                      ? "Email verified"
                      : "Email not verified"}
                  </p>
                  {user.role === "LANDLORD" && (
                    <Link
                      href="/host/payouts"
                      className="inline-flex items-center gap-1 text-sm text-brand-strong"
                    >
                      Manage payout details <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>
      <AuthModal isOpen={auth} onClose={() => setAuth(false)} />
    </>
  );
}
