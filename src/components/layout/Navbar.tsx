"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Building2,
  PlusCircle,
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
    <Link href="/" className="group flex items-center justify-center" aria-label="Kampus Home">
      <KampusLogo variant="mark" size={36} className="transition-transform duration-200 group-hover:scale-[1.04]" markClassName="text-slate-900 dark:text-white" />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHostRegistrationOpen, setIsHostRegistrationOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, role, isAuthenticated, logout, switchRole, checkAuth } = useAuthStore();
  const isHost = user?.role === "LANDLORD" || Boolean(user?.landlord);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isHostView = pathname.startsWith("/host");

  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Lodges", href: "/explore" },
    { label: "Roommates", href: "/roommates" },
    ...(user?.role === "ADMIN" ? [{ label: "Dispute review", href: "/admin/disputes" }] : []),
  ];

  return (
    <>
      <header className="landing-nav sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-[#22352B] bg-white/95 dark:bg-[#0B130F]/95 backdrop-blur-xl transition-colors duration-200">
        <div className="landing-nav__inner mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Column: Minimal Typographic Nav Links (Image 1 & 2 Style) */}
          <div className="flex items-center gap-6">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#121E18]"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium tracking-tight">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`transition-colors relative py-1 ${
                      isActive
                        ? "text-slate-900 dark:text-white font-bold"
                        : "text-slate-600 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-emerald-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Brand Mark */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <KampusBrandMark />
          </div>

          {/* Right Column: Clean Pill Controls (Book a call / Invest / Sign in) */}
          <div className="flex items-center gap-3">
            {/* Get Mobile App Link / Pill */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAppDownloadOpen(true)}
              className="hidden md:inline-flex text-[13px] font-medium text-slate-700 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white px-2 cursor-pointer"
            >
              Get the app
            </Button>

            {/* Theme Toggle */}
            <div className="landing-nav__theme">
              <ThemeToggle />
            </div>

            {/* Host / Student Role Switcher */}
            {isHostView ? (
              <Link href="/explore" className="hidden sm:inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] text-slate-900 dark:text-emerald-300 text-xs font-semibold px-3.5"
                >
                  Student View
                </Button>
              </Link>
            ) : (
              <Link href="/host/dashboard" className="hidden sm:inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] text-slate-800 dark:text-white text-xs font-semibold px-3.5"
                >
                  Host Hub
                </Button>
              </Link>
            )}

            {/* Solid Pill CTA ("Invest" / "Post Lodge") */}
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthOpen(true);
                  return;
                }
                if (!isHost) {
                  setIsHostRegistrationOpen(true);
                  return;
                }
                if (typeof window !== "undefined") {
                  window.location.href = "/host/dashboard";
                }
              }}
              className="landing-nav__primary rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs px-4 sm:px-5 py-2 shadow-sm transition-all cursor-pointer"
            >
              List your lodge
            </Button>

            {/* User Account Dropdown */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-[#22352B] bg-slate-100 dark:bg-[#14231B] hover:border-emerald-500/40 transition-colors cursor-pointer">
                  <div className="relative h-7 w-7 rounded-full overflow-hidden bg-emerald-600/20 border border-emerald-500/30">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.fullName || "User profile"}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4 m-1.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-500 dark:text-[#93A89D]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-[#0E1A14] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-slate-100 rounded-2xl p-1.5 shadow-2xl"
                >
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName || "Kampus Member"}</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#93A89D] truncate">{user.email || user.phone}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20">
                      <ShieldCheck className="h-3 w-3" />
                      {role === "STUDENT" ? "Student Account" : "Host Account"}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-[#22352B]" />
                  {isHost ? (
                    <DropdownMenuItem
                      onClick={() => switchRole(role === "STUDENT" ? "LANDLORD" : "STUDENT")}
                      className="text-xs hover:bg-emerald-500/10 cursor-pointer rounded-xl flex items-center justify-between"
                    >
                      <span>Switch to {role === "STUDENT" ? "Host Portal" : "Student View"}</span>
                      {role === "STUDENT" ? (
                        <Building2 className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                      ) : (
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setIsHostRegistrationOpen(true)}
                      className="text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Register as Host / Landlord</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = isHost && role === "LANDLORD" ? "/host/dashboard" : "/bookings";
                      }
                    }}
                    className="text-xs hover:bg-emerald-500/10 cursor-pointer rounded-xl flex items-center justify-between"
                  >
                    <span>{isHost && role === "LANDLORD" ? "Host Dashboard" : "My Bookings"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-[#22352B]" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setIsAuthOpen(true)}
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0B130F] p-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-[#93A89D] hover:bg-slate-100 dark:hover:bg-[#121E18]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Ingestion Pipeline Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Landlord Photo Ingestion & Retina Compression
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-[#93A89D] -mt-2">
            Interception dropzone adhering to <code>.agents/rules/image-pipeline.md</code>.
            Forces 16:10 crop framing and client-side compression below 400KB WebP before cloud storage dispatch.
          </p>

          <div className="mt-2">
            <ImageUploadDropzone />
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

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
