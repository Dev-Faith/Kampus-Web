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
import { useAuthStore } from "@/lib/stores/useAuthStore";

export function Navbar() {
  const pathname = usePathname();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHostRegistrationOpen, setIsHostRegistrationOpen] = useState(false);

  const { user, role, isAuthenticated, logout, switchRole, checkAuth } = useAuthStore();
  const isHost = user?.role === "LANDLORD" || Boolean(user?.landlord);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isHostView = pathname.startsWith("/host");

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#22352B] bg-[#0B130F]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0E4D38] to-[#10B981] text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-transform group-hover:scale-105">
                <Building2 className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                  KAMPUS
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    NG
                  </span>
                </span>
                <span className="text-[10px] text-[#93A89D] font-medium tracking-tight">
                  Student Escrow Living
                </span>
              </div>
            </Link>

            {/* Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-[#22352B] text-xs font-semibold">
              <Link
                href="/explore"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === "/explore"
                    ? "bg-[#17261F] text-emerald-400 font-bold"
                    : "text-[#93A89D] hover:text-white"
                }`}
              >
                Find Lodges
              </Link>
              <Link
                href="/bookings"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === "/bookings"
                    ? "bg-[#17261F] text-emerald-400 font-bold"
                    : "text-[#93A89D] hover:text-white"
                }`}
              >
                My Escrow Bookings
              </Link>
              <Link
                href="/roommates"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === "/roommates"
                    ? "bg-[#17261F] text-emerald-400 font-bold"
                    : "text-[#93A89D] hover:text-white"
                }`}
              >
                Roommate Match
              </Link>
            </nav>
          </div>

          {/* Right Header Navigation & Role Switching Action */}
          <div className="flex items-center gap-2.5">
            {/* Role Switcher Pill */}
            {isHostView ? (
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-emerald-500/40 bg-[#0E1A14] text-emerald-300 hover:bg-[#121E18] text-xs font-semibold flex items-center gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Switch to Student View</span>
                  <span className="sm:hidden">Student</span>
                </Button>
              </Link>
            ) : (
              <Link href="/host/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#D49E35]/40 bg-[#1A160E] text-amber-300 hover:bg-[#241F14] text-xs font-semibold flex items-center gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Host & Landlord Hub</span>
                  <span className="sm:hidden">Host Hub</span>
                </Button>
              </Link>
            )}

            {/* Ingest Listing Dropzone Trigger */}
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
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-full px-3.5 py-1.5 shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Post Lodge</span>
            </Button>

            {/* User Account / Sign In */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-[#22352B] bg-[#14231B] hover:border-emerald-500/40 transition-colors cursor-pointer">
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
                      <UserIcon className="h-4 w-4 m-1.5 text-emerald-400" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[90px] truncate hidden sm:inline">
                    {(user.fullName || user.phone || "User").split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#93A89D]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#0E1A14] border border-[#22352B] text-slate-100 rounded-2xl p-1.5 shadow-2xl"
                >
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="text-xs font-bold text-white">{user.fullName || "Kampus Member"}</div>
                    <div className="text-[10px] text-[#93A89D] truncate">{user.email || user.phone}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="h-3 w-3" />
                      {role === "STUDENT" ? "Student Account" : "Host Account"}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#22352B]" />
                  {isHost ? (
                    <DropdownMenuItem
                      onClick={() => switchRole(role === "STUDENT" ? "LANDLORD" : "STUDENT")}
                      className="text-xs hover:bg-emerald-500/10 cursor-pointer rounded-xl flex items-center justify-between"
                    >
                      <span>Switch to {role === "STUDENT" ? "Host Portal" : "Student View"}</span>
                      {role === "STUDENT" ? (
                        <Building2 className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setIsHostRegistrationOpen(true)}
                      className="text-xs text-amber-300 hover:bg-amber-500/10 cursor-pointer rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>Register as Host / Landlord</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Join
                      </span>
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
                    <span>{isHost && role === "LANDLORD" ? "Host Dashboard" : "My Bookings & Escrow"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#22352B]" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setIsAuthOpen(true)}
                variant="outline"
                size="sm"
                className="rounded-full border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold px-3.5"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Ingestion Pipeline Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl bg-[#0B130F] border border-[#22352B] text-slate-100 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
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
    </>
  );
}
