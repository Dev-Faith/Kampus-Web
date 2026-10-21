"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Wallet,
  Eye,
  EyeOff,
  ArrowUpRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Landmark,
  CreditCard,
  Edit2,
  X,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CampusCode, LodgeStatus, Property, RoomType } from "@/types/property";
import { landlordApi } from "@/api/landlord";
import { backendLodgeToProperty } from "@/api/lodges";
import { LandlordProfile, LandlordStats } from "@/types/api";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { HostRegistrationModal } from "@/components/auth/HostRegistrationModal";
import { toast } from "@/lib/stores/useToastStore";

export default function HostDashboardPage() {
  const { user, isAuthenticated, role, switchRole } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHostRegistrationOpen, setIsHostRegistrationOpen] = useState(false);
  const isHost = user?.role === "LANDLORD" || Boolean(user?.landlord);

  const [properties, setProperties] = useState<Property[]>([]);
  const [isPrivacyActive, setIsPrivacyActive] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "available" | "occupied">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile & stats from API
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [stats, setStats] = useState<LandlordStats | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Bank Form State (Initialized empty, populated strictly from live profile)
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bvn, setBvn] = useState("");

  // New Listing Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCampus, setNewCampus] = useState<CampusCode>("FUTMINNA");
  const [newRent, setNewRent] = useState<number | "">("");
  const [newCategory, setNewCategory] = useState<RoomType>("self-con");
  const [newAddress, setNewAddress] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    landlordApi.getProfile().then((p) => {
      if (p) {
        setProfile(p);
        if (p.bankName) setBankName(p.bankName);
        if (p.bankAccountNumber) setBankAccount(p.bankAccountNumber);
        if (p.bankAccountName) setAccountName(p.bankAccountName);
        if (p.bvn) setBvn(p.bvn);
      }
    });

    // Only fetch this specific landlord's properties, never the general marketplace
    landlordApi.getProperties().then((res) => {
      const myProps = (res.items || []).map(backendLodgeToProperty);
      setProperties(myProps);
    });

    landlordApi.getStats().then((s) => setStats(s));
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  // Dynamic financial metrics computed directly from active properties
  const totalRevenue = properties.reduce((acc, p) => acc + (p.price || 0), 0);
  const inEscrowBalance = properties
    .filter((p) => p.status === "occupied")
    .reduce((acc, p) => acc + (p.price || 0), 0);
  const clearedPayouts = Math.max(0, totalRevenue - inEscrowBalance);

  const totalLodges = properties.length;
  const occupiedCount = properties.filter((p) => p.status === "occupied").length;
  const availableCount = properties.filter((p) => p.status === "available").length;
  const occupancyRate = totalLodges > 0 ? Math.round((occupiedCount / totalLodges) * 100) : 0;

  const handleStatusChange = async (propertyId: string, newStatus: LodgeStatus) => {
    // Optimistic UI update
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
    );

    const apiStatus = newStatus === "occupied" ? "booked" : (newStatus as any);
    await landlordApi.updateStatus(propertyId, apiStatus);
    showToast(`Property status updated to "${newStatus}" on Kampus Gateway.`);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await landlordApi.updateBankDetails({
      bankName,
      bankAccountNumber: bankAccount,
      bankAccountName: accountName,
      bvn,
    });
    setProfile(updated);
    setIsBankModalOpen(false);
    showToast("BVN-verified settlement bank updated successfully.");
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const lodgeImages = uploadedUrls.length > 0
      ? uploadedUrls.map((url, i) => ({ url, isPrimary: i === 0 }))
      : [];

    const created = await landlordApi.createProperty({
      title: newTitle,
      description: newDescription || "Newly listed verified student lodge with custodial escrow.",
      category: newCategory === "self-con" ? "self_con" : "hostel",
      address: newAddress || "University Road",
      city: "Campus Environs",
      state: "Campus District",
      rent: Number(newRent),
      serviceFee: Math.round(Number(newRent) * 0.05),
      numberOfRooms: 1,
      capacity: 2,
      distanceToCampus: 0.6,
      amenities: ["Borehole Water", "Prepaid Meter", "Night Security"],
      images: lodgeImages,
    });

    const newProp = backendLodgeToProperty(created);

    setProperties([newProp, ...properties]);
    setIsCreateOpen(false);
    setNewTitle("");
    setNewAddress("");
    setNewDescription("");
    setUploadedUrls([]);
    showToast(`New lodge "${created.title}" published with 1-click availability!`);
  };

  const filteredListings = properties.filter((p) => {
    if (filterTab === "available") return p.status === "available";
    if (filterTab === "occupied") return p.status === "occupied";
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B130F] text-[#F2F9F5]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full rounded-3xl border border-[#22352B] bg-[#121E18] p-8 sm:p-10 text-center space-y-6 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <Building2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Landlord & Property Manager Portal
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Host Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-[#93A89D] leading-relaxed">
                Sign in with your verified property host account to publish lodges, manage student escrow tenancies, and configure BVN-linked bank settlements.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 shadow-lg"
              >
                Sign In as Landlord / Host
              </Button>

              <Link href="/explore" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#22352B] bg-[#0E1A14] text-[#93A89D] hover:text-white text-xs font-semibold"
                >
                  Looking for Accommodation? Explore Lodges
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultRole="LANDLORD"
        />
      </div>
    );
  }

  if (role === "STUDENT" || !isHost) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B130F] text-[#F2F9F5]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full rounded-3xl border border-[#22352B] bg-[#121E18] p-8 sm:p-10 text-center space-y-6 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Landlord Registration Required
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isHost ? "Host Mode Inactive" : "Become a Verified Host"}
              </h2>
              <p className="text-xs sm:text-sm text-[#93A89D] leading-relaxed">
                {isHost
                  ? "You are currently viewing Kampus in Student Mode. Switch your interface to Landlord Mode to manage your listings and escrow tenancies."
                  : "You are currently signed in with a Student account. To list student hostels, inspect tenant move-in codes, and withdraw escrow payouts, you must complete your landlord accreditation."}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {isHost ? (
                <Button
                  onClick={() => switchRole("LANDLORD")}
                  className="w-full rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-3 shadow-lg"
                >
                  Switch View to Host Hub
                </Button>
              ) : (
                <Button
                  onClick={() => setIsHostRegistrationOpen(true)}
                  className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 shadow-lg"
                >
                  Register as Landlord / Host
                </Button>
              )}

              <Link href="/explore" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#22352B] bg-[#0E1A14] text-[#93A89D] hover:text-white text-xs font-semibold"
                >
                  Return to Student Search
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <HostRegistrationModal
          isOpen={isHostRegistrationOpen}
          onClose={() => setIsHostRegistrationOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B130F] text-[#F2F9F5]">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#0E1A14] px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#22352B] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Landlord & Host Operations Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Host Revenue & Portfolio Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#93A89D] mt-1">
              Guaranteed student rent held in custodial escrow. Automated payouts to your BVN-linked bank.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button
                variant="outline"
                className="rounded-full border-[#22352B] bg-[#121E18] text-[#F2F9F5] text-xs font-semibold"
              >
                View Marketplace
              </Button>
            </Link>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Lodge</span>
            </Button>
          </div>
        </div>

        {/* 1. Balance & Escrow Metrics Card (With Privacy Eye Toggle) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Balance Card */}
          <div className="md:col-span-2 rounded-3xl border border-[#22352B] bg-gradient-to-br from-[#121E18] to-[#0E1A14] p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#93A89D]">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>Total Accumulated Portfolio Gross</span>
              </div>

              {/* Privacy Eye Toggle */}
              <button
                type="button"
                onClick={() => setIsPrivacyActive(!isPrivacyActive)}
                className="flex items-center gap-1.5 rounded-full border border-[#22352B] bg-[#17261F] px-3 py-1 text-xs text-[#93A89D] hover:text-white transition-colors"
              >
                {isPrivacyActive ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                    <span>Hidden</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Show Live</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                {isPrivacyActive ? "₦ •••••••••" : `₦${totalRevenue.toLocaleString()}`}
              </div>
              <p className="text-xs text-[#93A89D]">
                Collected across {properties.length} off-campus student accommodations
              </p>
            </div>

            {/* Split Escrow vs Cleared Disbursals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#22352B] pt-4">
              <div className="rounded-2xl bg-[#0B130F] p-4 border border-[#22352B] space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Held in Custodial Escrow
                </span>
                <p className="text-lg font-black text-white tabular-nums">
                  {isPrivacyActive ? "₦ ••••••" : `₦${inEscrowBalance.toLocaleString()}`}
                </p>
                <p className="text-[11px] text-[#93A89D]">
                  Awaiting student physical arrival inspection
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B130F] p-4 border border-[#22352B] space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Cleared & Disbursed
                </span>
                <p className="text-lg font-black text-emerald-400 tabular-nums">
                  {isPrivacyActive ? "₦ ••••••" : `₦${clearedPayouts.toLocaleString()}`}
                </p>
                <p className="text-[11px] text-[#93A89D]">
                  Settled directly into {bankName} account
                </p>
              </div>
            </div>

            {/* BVN-Linked Payout Bank Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#22352B] pt-3 text-xs text-[#93A89D]">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-400" />
                <span>
                  Settlement Account:{" "}
                  <strong className="text-white">
                    {bankName} • {bankAccount}
                  </strong>{" "}
                  ({accountName})
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  BVN Verified
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                <span>Change Bank</span>
              </button>
            </div>
          </div>

          {/* Occupancy Multi-Segment Bar Card */}
          <div className="rounded-3xl border border-[#22352B] bg-[#121E18] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#93A89D]">
                Hostel Portfolio Occupancy
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white tabular-nums">
                  {occupancyRate}%
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  High Season
                </span>
              </div>
            </div>

            {/* Visual Multi-Segment Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-[#17261F] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                />
                <div
                  className="h-full bg-slate-700 rounded-r-full transition-all duration-500"
                  style={{ width: `${100 - occupancyRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#93A89D]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{occupiedCount} Occupied</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                  <span>{availableCount} Available</span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0E1A14] p-3 text-[11px] text-[#93A89D] border border-[#22352B]">
              <span className="text-white font-bold block mb-0.5">
                Next Semester Student Inflow
              </span>
              FUTMINNA academic session begins next month. Expect 100% reservation capacity.
            </div>
          </div>
        </div>

        {/* 2. Properties Management Hub with 1-Click Status Dropdown */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Manage Lodge Listings & 1-Click Availability
            </h2>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-full bg-[#121E18] p-1 border border-[#22352B] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3.5 py-1 rounded-full transition-colors ${
                  filterTab === "all"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-[#93A89D] hover:text-white"
                }`}
              >
                All Lodges ({totalLodges})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("available")}
                className={`px-3.5 py-1 rounded-full transition-colors ${
                  filterTab === "available"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-[#93A89D] hover:text-white"
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("occupied")}
                className={`px-3.5 py-1 rounded-full transition-colors ${
                  filterTab === "occupied"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-[#93A89D] hover:text-white"
                }`}
              >
                Occupied ({occupiedCount})
              </button>
            </div>
          </div>

          {/* Properties Table / Card Grid or Empty State */}
          {filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-[#22352B] bg-[#121E18] p-12 text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-xl font-bold text-white">No Listings Published Yet</h3>
                <p className="text-xs sm:text-sm text-[#93A89D] leading-relaxed">
                  You have not published any student accommodations on Kampus yet. Click below to add your first verified listing and start accepting custodial escrow deposits.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-6 py-2.5 shadow-lg flex items-center gap-1.5 mx-auto"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>List New Student Accommodation</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((property) => (
                <div
                  key={property.id}
                  className="rounded-3xl border border-[#22352B] bg-[#121E18] p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Image & 1-Click Status Dropdown */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#0B130F]">
                      {property.images[0]?.url ? (
                        <Image
                          src={property.images[0].url}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#586B61]">
                          <Building2 className="h-10 w-10 opacity-40" />
                        </div>
                      )}

                    {/* 1-Click Status Dropdown (Zero Bleed, High Contrast) */}
                    <div className="absolute top-3 left-3 z-10">
                      <select
                        value={property.status}
                        onChange={(e) =>
                          handleStatusChange(
                            property.id,
                            e.target.value as LodgeStatus
                          )
                        }
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider focus:outline-none cursor-pointer shadow-xl border border-white/20 ${
                          property.status === "available"
                            ? "bg-emerald-500 text-slate-950"
                            : property.status === "occupied"
                            ? "bg-rose-500 text-white"
                            : "bg-amber-500 text-slate-950"
                        }`}
                      >
                        <option value="available" className="bg-[#121E18] text-emerald-400">
                          ● Available Now
                        </option>
                        <option value="occupied" className="bg-[#121E18] text-rose-400">
                          ● Occupied
                        </option>
                        <option value="maintenance" className="bg-[#121E18] text-amber-400">
                          ● Maintenance
                        </option>
                      </select>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      {property.campus}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-[#93A89D] mt-0.5 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{property.distanceToCampus}</span>
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#22352B] pt-3">
                    <span className="text-lg font-black text-white tabular-nums">
                      {property.currency}
                      {property.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#93A89D]">/ session</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-[#22352B] pt-3 text-xs">
                  <span className="text-[#93A89D] text-[11px]">
                    ID: {property.id}
                  </span>

                  <Link
                    href={`/explore?q=${encodeURIComponent(property.title)}`}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>

      {/* Edit Bank Payout Details Modal */}
      <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
        <DialogContent className="max-w-md bg-[#0B130F] border border-[#22352B] text-slate-100 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Landmark className="h-5 w-5 text-emerald-400" />
              Update Payout Settlement Bank
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-[#93A89D] -mt-2">
            Automated student rent disbursements are transferred to this account once student key inspection is verified.
          </p>

          <form onSubmit={handleSaveBank} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#93A89D]">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                <option value="First Bank">First Bank of Nigeria</option>
                <option value="UBA">United Bank for Africa (UBA)</option>
                <option value="Kuda Bank">Kuda Microfinance Bank</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#93A89D]">Account Number (NUBAN)</label>
              <input
                type="text"
                maxLength={10}
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#93A89D]">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#93A89D]">Bank Verification Number (BVN)</label>
              <input
                type="password"
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
              <p className="text-[10px] text-[#93A89D]">NDPR Encrypted. Used strictly for settlement verification.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBankModalOpen(false)}
                className="rounded-full border-[#22352B] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Save Bank Details
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Lodge Wizard Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#0B130F] border border-[#22352B] text-slate-100 p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              List New Student Accommodation
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-[#93A89D] -mt-2">
            Create a verified listing with automatic custodial escrow protection for students.
          </p>

          <form onSubmit={handleCreateProperty} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#93A89D]">Lodge Title</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Emerald Lodge (Flat 4B)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#93A89D]">Campus Proximity</label>
                <select
                  value={newCampus}
                  onChange={(e) => setNewCampus(e.target.value as CampusCode)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="FUTMINNA" className="text-emerald-400 font-bold">
                    FUTMINNA (Gidan Kwano & Bosso) — Active
                  </option>
                  <option value="UNILAG" disabled className="text-[#586B61]">
                    UNILAG (Akoka / Yaba) — Coming Soon
                  </option>
                  <option value="FUTA" disabled className="text-[#586B61]">
                    FUTA (South Gate / North Gate) — Coming Soon
                  </option>
                  <option value="UI" disabled className="text-[#586B61]">
                    UI (Agbowo / Bodija) — Coming Soon
                  </option>
                  <option value="UNIBEN" disabled className="text-[#586B61]">
                    UNIBEN (Ugbowo / Ekosodin) — Coming Soon
                  </option>
                  <option value="OAU" disabled className="text-[#586B61]">
                    OAU (Ife / Campus Gate) — Coming Soon
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#93A89D]">Room Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as RoomType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="self-con">Self-Contained (Private En-suite)</option>
                  <option value="single-room">Single Room (Shared Bath)</option>
                  <option value="flatshare">Flatshare (2-3 Bed Apartment)</option>
                  <option value="studio">Premium Studio</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#93A89D]">Rent per Academic Session (₦)</label>
                <input
                  type="number"
                  value={newRent}
                  onChange={(e) => setNewRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#93A89D]">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 12 St. Finbarr's Road, Akoka"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#93A89D]">Description & Features</label>
                <textarea
                  rows={2}
                  placeholder="Detail power schedule, borehole water, security, and compound rules..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14231B] border border-[#22352B] text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Photo Ingestion Pipeline with 16:10 enforcement */}
            <div className="space-y-1.5 border-t border-[#22352B] pt-3">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Lodge Photos (16:10 Aspect Ratio • WebP Auto-Compressed)
              </label>
              <ImageUploadDropzone onImagesChange={setUploadedUrls} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#22352B]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border-[#22352B] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Publish Lodge
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
