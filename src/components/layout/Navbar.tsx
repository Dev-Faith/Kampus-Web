"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Building2,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Smartphone,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { AuthModal } from "@/components/auth/AuthModal";
import { HostRegistrationModal } from "@/components/auth/HostRegistrationModal";
import { AppDownloadModal } from "@/components/mobile/AppDownloadModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { KampusLogo } from "@/components/brand/KampusLogo";

function KampusBrandMark() {
  return (
    <Link href="/" className="group flex h-11 w-11 shrink-0 items-center justify-center" aria-label="Kampus Home">
      <KampusLogo variant="mark" size={36} className="transition-transform duration-200 group-hover:scale-[1.04]" markClassName="text-foreground" />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"STUDENT" | "LANDLORD">("STUDENT");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isHostRegistrationOpen, setIsHostRegistrationOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuTrigger = useRef<HTMLButtonElement>(null);

  const { user, role, isAuthenticated, logout, checkAuth } = useAuthStore();
  const isHost = user?.role === "LANDLORD";

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        mobileMenuTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  const handleListLodge = () => {
    setIsMobileMenuOpen(false);
    if (!isAuthenticated) {
      setAuthRole("LANDLORD");
      setAuthMode("signup");
      setIsAuthOpen(true);
    } else if (!isHost || user?.profileStatus !== "COMPLETED") {
      setIsHostRegistrationOpen(true);
    } else {
      window.location.href = "/host/dashboard";
    }
  };

  const isHostView = pathname.startsWith("/host");

  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Lodges", href: "/explore" },
    { label: "Roommates", href: "/roommates" },
    ...(user?.role === "ADMIN" || user?.adminAccess ? [{ label: "Administration", href: "/admin" }] : []),
  ];

  return (
    <>
      <header className="landing-nav sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xl transition-colors duration-200">
        <div className="landing-nav__inner mx-auto items-center px-4 sm:px-6 lg:px-8">
          <div className="min-w-0 flex items-center">
            {/* Mobile menu trigger */}
            <button
              type="button"
              ref={mobileMenuTrigger}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="xl:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted"
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="kampus-mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Navigation Links */}
            <nav aria-label="Primary navigation" className="hidden xl:flex items-center gap-7 text-[13px] font-medium tracking-tight whitespace-nowrap">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`transition-colors relative py-1 ${
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Brand Mark */}
          <div className="landing-nav__brand flex items-center justify-center">
            <KampusBrandMark />
          </div>

          <div className="landing-nav__actions flex min-w-0 items-center justify-end">
            {/* Get Mobile App Link / Pill */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAppDownloadOpen(true)}
              className="landing-nav__app hidden xl:inline-flex shrink-0 text-[13px] font-medium text-muted-foreground hover:text-foreground px-2 cursor-pointer"
            >
              Get the app
            </Button>

            {/* Theme Toggle */}
            <div className="landing-nav__theme hidden sm:block shrink-0">
              <ThemeToggle />
            </div>

            {/* Host / Student Role Switcher */}
            {isHostView ? (
              <Link href="/explore" className="hidden xl:inline-block shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-border text-foreground text-xs font-medium px-3.5"
                >
                  Student View
                </Button>
              </Link>
            ) : (
              <Link href="/host/dashboard" className="hidden xl:inline-block shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-border text-foreground text-xs font-medium px-3.5"
                >
                  Host Hub
                </Button>
              </Link>
            )}

            {/* Solid Pill CTA ("Invest" / "Post Lodge") */}
            <Button
              onClick={handleListLodge}
              className="landing-nav__primary hidden lg:inline-flex shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover font-medium text-xs px-4 sm:px-5 py-2 shadow-none transition-colors cursor-pointer"
            >
              List your lodge
            </Button>

            {/* User Account Dropdown */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Open account menu" className="flex min-h-11 shrink-0 items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-border bg-card hover:border-brand/40 transition-colors cursor-pointer">
                  <div className="relative h-7 w-7 rounded-full overflow-hidden bg-brand-soft border border-brand/30">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.fullName || "User profile"}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4 m-1.5 text-brand-strong" />
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-card border border-border text-foreground rounded-[1.35rem] p-1.5 shadow-md"
                >
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="text-xs font-semibold text-foreground">{user.fullName || "Kampus Member"}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{user.email || user.phone}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-brand-soft text-brand-strong border border-brand/25">
                      <ShieldCheck className="h-3 w-3" />
                      {user.role === "ADMIN" ? "Administrator" : user.role === "STUDENT" ? "Student Account" : "Landlord Account"}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {isHost ? (
                    <DropdownMenuItem
                      onClick={() => { window.location.href = isHostView ? "/explore" : "/host/dashboard"; }}
                      className="text-xs hover:bg-brand-soft cursor-pointer rounded-xl flex items-center justify-between"
                    >
                      <span>{isHostView ? "Browse accommodation" : "Open host dashboard"}</span>
                      {role === "STUDENT" ? (
                        <Building2 className="h-3.5 w-3.5 text-brand-strong" />
                      ) : (
                        <GraduationCap className="h-3.5 w-3.5 text-brand-strong" />
                      )}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setIsHostRegistrationOpen(true)}
                      className="text-xs text-brand-strong hover:bg-brand-soft cursor-pointer rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-brand-strong" />
                        <span>Use a landlord account</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = isHost && role === "LANDLORD" ? "/host/dashboard" : "/bookings";
                      }
                    }}
                    className="text-xs hover:bg-brand-soft cursor-pointer rounded-xl flex items-center justify-between"
                  >
                    <span>{isHost && role === "LANDLORD" ? "Host Dashboard" : "My Bookings"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-destructive hover:bg-destructive-soft cursor-pointer rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => { setIsMobileMenuOpen(false); setAuthRole("STUDENT"); setAuthMode("signin"); setIsAuthOpen(true); }}
                variant="ghost"
                size="sm"
                className="landing-nav__signin shrink-0 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover px-3"
              >
                Join / Sign in
              </Button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div id="kampus-mobile-navigation" className="landing-nav__mobile xl:hidden overflow-y-auto border-t border-border bg-background p-4 space-y-4">
            <nav aria-label="Mobile navigation" className="space-y-1">
              {!isAuthenticated && <Button variant="outline" className="w-full min-h-11" onClick={() => { setIsMobileMenuOpen(false); setAuthRole("STUDENT"); setAuthMode("signup"); setIsAuthOpen(true); }}>Create account</Button>}
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-h-11 items-center px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="space-y-2 border-t border-border pt-4">
              <Link href={isHostView ? "/explore" : "/host/dashboard"} onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                {isHostView ? "Student View" : "Host Hub"}
              </Link>
              <Button variant="ghost" onClick={() => { setIsMobileMenuOpen(false); setIsAppDownloadOpen(true); }} className="min-h-11 w-full justify-start px-3 text-sm">
                <Smartphone className="h-4 w-4" />
                Get the app
              </Button>
              <div className="flex sm:hidden items-center justify-between gap-3 px-3 py-1">
                <span className="text-sm font-medium">Appearance</span>
                <div className="landing-nav__theme shrink-0"><ThemeToggle /></div>
              </div>
              <Button onClick={handleListLodge} className="landing-nav__primary lg:hidden w-full">
                List your lodge
              </Button>
            </div>
          </div>
        )}
      </header>
      {isAuthenticated && user && user.role !== "ADMIN" && (user.profileStatus !== "COMPLETED" || user.hasPassword === false) && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-border bg-muted px-4 py-3 text-sm">
          <span>Finish setting up your {user.role === "LANDLORD" ? "landlord" : "student"} account.</span>
          <Button size="sm" onClick={() => { setAuthRole(user.role === "LANDLORD" ? "LANDLORD" : "STUDENT"); setIsAuthOpen(true); }}>Complete profile</Button>
        </div>
      )}

      {/* Ingestion Pipeline Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
              <Sparkles className="h-5 w-5 text-brand-strong" />
              Landlord Photo Ingestion & Retina Compression
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground -mt-2">
            Interception dropzone adhering to <code>.agents/rules/image-pipeline.md</code>.
            Forces 16:10 crop framing and client-side compression below 400KB WebP before cloud storage dispatch.
          </p>

          <div className="mt-2">
            <ImageUploadDropzone />
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultRole={authRole} defaultMode={authMode} />

      {/* Host Registration Modal for Students */}
      <HostRegistrationModal
        isOpen={isHostRegistrationOpen}
        onClose={() => setIsHostRegistrationOpen(false)}
        onSuccess={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/host/dashboard";
          }
        }}
      />

      {/* Mobile App Download Modal */}
      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
      />
    </>
  );
}
