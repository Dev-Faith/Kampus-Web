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
import { CampusCode, LodgeStatus, Property } from "@/types/property";
import { ACCOMMODATION_TYPE_OPTIONS, AccommodationType } from "@/lib/constants/accommodation-types";
import { CAMPUS_AREA_OPTIONS, getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { landlordApi } from "@/api/landlord";
import { backendLodgeToProperty } from "@/api/lodges";
import { LandlordProfile, LandlordStats, LodgeBuildingSummary } from "@/types/api";
import { ImageUploadDropzone } from "@/components/media/ImageUploadDropzone";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { HostRegistrationModal } from "@/components/auth/HostRegistrationModal";
import { toast } from "@/lib/stores/useToastStore";

export default function HostDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHostRegistrationOpen, setIsHostRegistrationOpen] = useState(false);
  useEffect(() => { if (new URLSearchParams(window.location.search).has("register")) setIsAuthOpen(true); }, []);
  const isHost = user?.role === "LANDLORD";

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
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [buildingProperty, setBuildingProperty] = useState<Property | null>(null);
  const [targetBuildingId, setTargetBuildingId] = useState("");
  const [targetBuildingName, setTargetBuildingName] = useState("");
  const [isSavingBuilding, setIsSavingBuilding] = useState(false);

  // Bank Form State (Initialized empty, populated strictly from live profile)
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bvn, setBvn] = useState("");

  // New Listing Form State
  const [newTitle, setNewTitle] = useState("");
  const [newBuildingId, setNewBuildingId] = useState("");
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newUnitLabel, setNewUnitLabel] = useState("");
  const [buildings, setBuildings] = useState<LodgeBuildingSummary[]>([]);
  const [newCampus, setNewCampus] = useState<CampusCode>("FUTMINNA");
  const [newRent, setNewRent] = useState<number | "">("");
  const [newCategory, setNewCategory] = useState<AccommodationType>("self_contained");
  const [newArea, setNewArea] = useState("");
  const [newNumberOfRooms, setNewNumberOfRooms] = useState<number | "">("");
  const [newAddress, setNewAddress] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const selectedBuilding = buildings.find((building) => building.id === newBuildingId);

  useEffect(() => {
    if (!isAuthenticated || !isHost) return;

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

    landlordApi.getBuildings().then(setBuildings).catch(() => setBuildings([]));

    landlordApi.getStats().then((s) => setStats(s));
  }, [isAuthenticated, isHost]);

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  // Listing values are estimates from property prices, not payment balances.
  const totalListedRent = properties.reduce((acc, p) => acc + (p.price || 0), 0);
  const occupiedListingRent = properties
    .filter((p) => p.status === "occupied")
    .reduce((acc, p) => acc + (p.price || 0), 0);
  const otherListingRent = Math.max(0, totalListedRent - occupiedListingRent);

  const totalLodges = properties.length;
  const bookedCount = properties.filter((p) => p.status === "occupied").length;
  const occupiedCount = stats?.occupiedProperties ?? 0;
  const reservedCount = stats?.reservedProperties ?? 0;
  const availableCount = properties.filter((p) => p.status === "available").length;
  const occupancyRate = totalLodges > 0 ? Math.round((occupiedCount / totalLodges) * 100) : 0;

  const handleStatusChange = async (propertyId: string, newStatus: LodgeStatus) => {
    const apiStatus = newStatus === "occupied" ? "booked" : (newStatus as any);
    try {
      await landlordApi.updateStatus(propertyId, apiStatus);
      setProperties((prev) => prev.map((p) => p.id === propertyId ? { ...p, status: newStatus } : p));
      showToast("Unit availability updated.");
      landlordApi.getStats().then(setStats).catch(() => {});
    } catch {
      toast.error("Availability could not be updated. Please try again.");
    }
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
    const buildingAddress = selectedBuilding?.address ?? newAddress.trim();
    const buildingArea = selectedBuilding?.campusArea ?? newArea;
    if (!newTitle.trim() || !buildingAddress || !buildingArea || !newRent || newNumberOfRooms === "") return;

    const lodgeImages = uploadedUrls.length > 0
      ? uploadedUrls.map((url, i) => ({ url, isPrimary: i === 0 }))
      : [];

    const created = await landlordApi.createProperty({
      ...(selectedBuilding ? { buildingId: selectedBuilding.id } : { buildingName: newBuildingName.trim() || undefined }),
      title: newTitle,
      unitLabel: newUnitLabel.trim() || undefined,
      description: newDescription,
      category: newCategory,
      university: selectedBuilding?.university || newCampus,
      address: buildingAddress,
      area: buildingArea,
      city: selectedBuilding?.city || "Minna",
      state: selectedBuilding?.state || "Niger State",
      rent: Number(newRent),
      serviceFee: Math.round(Number(newRent) * 0.05),
      numberOfRooms: Number(newNumberOfRooms),
      images: lodgeImages,
    });

    const newProp = backendLodgeToProperty(created);

    setProperties([newProp, ...properties]);
    const createdBuilding = created.building;
    if (createdBuilding) {
      setBuildings((current) => {
        const existingIndex = current.findIndex((building) => building.id === created.buildingId);
        if (existingIndex >= 0) {
          return current.map((building) => building.id === created.buildingId
            ? { ...building, unitCount: (building.unitCount ?? 0) + 1 }
            : building);
        }
        return [{ ...createdBuilding, unitCount: 1 }, ...current];
      });
    }
    setIsCreateOpen(false);
    setNewTitle("");
    setNewBuildingId("");
    setNewBuildingName("");
    setNewUnitLabel("");
    setNewAddress("");
    setNewArea("");
    setNewNumberOfRooms("");
    setNewDescription("");
    setUploadedUrls([]);
    showToast(`New lodge "${created.title}" published with 1-click availability!`);
  };

  const openBuildingManager = (property: Property) => {
    setBuildingProperty(property);
    setTargetBuildingId(property.buildingId ?? "");
    setTargetBuildingName(property.building?.name ?? "");
    setIsBuildingModalOpen(true);
  };

  const handleSaveBuildingAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingProperty || (!targetBuildingId && buildingProperty.buildingId)) return;

    setIsSavingBuilding(true);
    try {
      const updated = await landlordApi.updateProperty(
        buildingProperty.id,
        targetBuildingId
          ? {
              buildingId: targetBuildingId,
              city: buildingProperty.address.city,
              ...(buildingProperty.address.state ? { state: buildingProperty.address.state } : {}),
              ...(buildingProperty.university ? { university: buildingProperty.university } : {}),
              ...(buildingProperty.campusArea ? { area: buildingProperty.campusArea } : {}),
              ...(buildingProperty.address.street ? { address: buildingProperty.address.street } : {}),
              ...(buildingProperty.address.coordinates
                ? {
                    latitude: buildingProperty.address.coordinates.lat,
                    longitude: buildingProperty.address.coordinates.lng,
                  }
                : {}),
            }
          : { createBuilding: true, buildingName: targetBuildingName.trim() || undefined },
      );
      const mapped = backendLodgeToProperty(updated);
      setProperties((current) => current.map((item) => item.id === mapped.id ? mapped : item));
      landlordApi.getBuildings().then(setBuildings).catch(() => undefined);
      setIsBuildingModalOpen(false);
      showToast(targetBuildingId ? "Listing attached to the selected building." : "Parent building created from this listing.");
    } catch {
      toast.error("Could not update the parent building", { description: "Please try again. Your listing has not been changed." });
    } finally {
      setIsSavingBuilding(false);
    }
  };

  const filteredListings = properties.filter((p) => {
    if (filterTab === "available") return p.status === "available";
    if (filterTab === "occupied") return p.status === "occupied";
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="editorial-page host-dashboard-page min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="editorial-card max-w-md w-full rounded-3xl border border-border bg-card p-8 sm:p-10 text-center space-y-6 shadow-xl ">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-soft text-warning border border-warning/25 shadow-inner">
              <Building2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-warning">
                For campus hosts
              </span>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Sign in to manage your lodges
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Use your host account to manage listings, reservations and payouts.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="editorial-action w-full rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-3 shadow-lg"
              >
                Sign In as Landlord / Host
              </Button>

              <Link href="/explore" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-muted text-foreground hover:text-foreground text-xs font-semibold"
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

  if (!isHost || user?.profileStatus !== "COMPLETED") {
    return (
      <div className="editorial-page host-dashboard-page min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="editorial-card max-w-md w-full rounded-3xl border border-border bg-card p-8 sm:p-10 text-center space-y-6 shadow-xl ">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-soft text-warning border border-warning/25">
              <Building2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-warning">
                Landlord Registration Required
              </span>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                {isHost ? "Complete your profile" : "Use a landlord account"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isHost
                  ? "Finish setting up your landlord profile to manage listings and bookings."
                  : "You are signed in with a student account. Landlords need a separate account with a different phone number and email."}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {isHost ? (
                <Button
                  onClick={() => setIsHostRegistrationOpen(true)}
                  className="editorial-action w-full rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-3 shadow-lg"
                >
                  Complete landlord profile
                </Button>
              ) : (
                <Button
                  onClick={() => setIsHostRegistrationOpen(true)}
                  className="editorial-action w-full rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs py-3 shadow-lg"
                >
                  Use a landlord account
                </Button>
              )}

              <Link href="/explore" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-muted text-foreground hover:text-foreground text-xs font-semibold"
                >
                  Return to Student Search
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultRole="LANDLORD" />
        <HostRegistrationModal
          isOpen={isHostRegistrationOpen}
          onClose={() => setIsHostRegistrationOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="editorial-page host-dashboard-page min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-success/25 bg-card px-4 py-3 text-xs font-semibold text-success shadow-xl  animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="editorial-main flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className="editorial-eyebrow text-[11px] font-bold uppercase tracking-widest text-warning">
                For campus hosts
              </span>
            </div>
            <h1 className="editorial-title text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Your lodges, at a glance.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track occupancy, booking payment status and inspection decisions from one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button
                variant="outline"
                className="rounded-full border-border bg-card text-foreground hover:bg-muted text-xs font-semibold"
              >
                View Marketplace
              </Button>
            </Link>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="editorial-action bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Lodge</span>
            </Button>
          </div>
        </div>

        {/* 1. Listing Value Summary (With Privacy Eye Toggle) */}
        <div className="host-summary grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Balance Card */}
          <div className="editorial-card md:col-span-2 rounded-3xl border border-border bg-card  p-6 sm:p-8 space-y-5 shadow-sm  relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Wallet className="h-4 w-4 text-success" />
                <span>Total Accumulated Portfolio Gross</span>
              </div>

              {/* Privacy Eye Toggle */}
              <button
                type="button"
                onClick={() => setIsPrivacyActive(!isPrivacyActive)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground hover:text-foreground transition-colors"
              >
                {isPrivacyActive ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-warning" />
                    <span>Hidden</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-success" />
                    <span>Show Live</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight tabular-nums">
                {isPrivacyActive ? "₦ •••••••••" : `₦${totalListedRent.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Listed rent value across {properties.length} off-campus student accommodations
              </p>
            </div>

            {/* Booking payment status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="rounded-2xl bg-muted p-4 border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase text-warning flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Reserved / occupied listing rent
                </span>
                <p className="text-lg font-semibold text-foreground tabular-nums">
                  {isPrivacyActive ? "₦ ••••••" : `₦${occupiedListingRent.toLocaleString()}`}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Estimated from rent on unavailable listings; this is not paid earnings
                </p>
              </div>

              <div className="rounded-2xl bg-muted p-4 border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Other Listing Rent Value
                </span>
                <p className="text-lg font-semibold text-success tabular-nums">
                  {isPrivacyActive ? "₦ ••••••" : `₦${otherListingRent.toLocaleString()}`}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Estimated value for available or other listings; no transfer is recorded here
                </p>
              </div>
            </div>

            {/* BVN-Linked Payout Bank Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-success" />
                <span>
                  Settlement Account:{" "}
                  <strong className="text-foreground">
                    {bankName} • {bankAccount}
                  </strong>{" "}
                  ({accountName})
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/25">
                  <ShieldCheck className="h-3 w-3" />
                  BVN Verified
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="text-success hover:text-success font-semibold flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                <span>Change Bank</span>
              </button>
            </div>
          </div>

          {/* Occupancy Multi-Segment Bar Card */}
          <div className="editorial-card rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm ">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Verified unit occupancy
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-semibold text-foreground tabular-nums">
                  {occupancyRate}%
                </span>
                <span className="text-xs text-success font-bold">
                  Verified move-ins
                </span>
              </div>
            </div>

            {/* Visual Multi-Segment Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                <div
                  className="h-full bg-success rounded-l-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                />
                <div
                  className="h-full bg-muted rounded-r-full transition-all duration-500"
                  style={{ width: `${totalLodges ? availableCount / totalLodges * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span>{occupiedCount} Occupied</span>
                </span>
                <span>{reservedCount} Reserved</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted" />
                  <span>{availableCount} Available</span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-muted p-3 text-[11px] text-muted-foreground border border-border">
              <span className="text-foreground font-bold block mb-0.5">
                Reservations and move-ins
              </span>
              Reserved units remain unavailable while payment or inspection is pending. Occupancy is recorded after move-in verification.
            </div>
          </div>
        </div>

        {/* 2. Properties Management Hub with 1-Click Status Dropdown */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Manage Lodge Listings & 1-Click Availability
            </h2>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-full bg-muted p-1 border border-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3.5 py-1 rounded-full transition-colors ${
                  filterTab === "all"
                    ? "bg-card  text-foreground  shadow-sm font-bold"
                    : "text-muted-foreground  hover:text-foreground "
                }`}
              >
                All Lodges ({totalLodges})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("available")}
                className={`px-3.5 py-1 rounded-full transition-colors ${
                  filterTab === "available"
                    ? "bg-card  text-foreground  shadow-sm font-bold"
                    : "text-muted-foreground  hover:text-foreground "
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("occupied")}
                className={`px-3.5 py-1 rounded-full transition-colors ${
                  filterTab === "occupied"
                    ? "bg-card  text-foreground  shadow-sm font-bold"
                    : "text-muted-foreground  hover:text-foreground "
                }`}
              >
                Reserved / occupied ({bookedCount})
              </button>
            </div>
          </div>

          {/* Properties Table / Card Grid or Empty State */}
          {filteredListings.length === 0 ? (
            <div className="editorial-card rounded-3xl border border-border bg-card p-12 text-center space-y-4 shadow-sm ">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-soft text-warning border border-warning/25">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-xl font-bold text-foreground">No Listings Published Yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  You have not published any student accommodations on Kampus yet. Click below to add your first verified listing and accept booking requests.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="editorial-action rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs px-6 py-2.5 shadow-lg flex items-center gap-1.5 mx-auto"
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
                  className="editorial-card rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md  transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Image & 1-Click Status Dropdown */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-muted">
                      {property.images[0]?.url ? (
                        <Image
                          src={property.images[0].url}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
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
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider focus:outline-none cursor-pointer shadow-xl border border-white/20 ${
                          property.status === "available"
                            ? "bg-success-soft text-success"
                            : property.status === "occupied"
                            ? "bg-muted text-foreground"
                            : "bg-warning-soft text-warning"
                        }`}
                      >
                        <option value="available" className="bg-card text-success">
                          ● Available Now
                        </option>
                        <option value="occupied" className="bg-card text-destructive">
                          ● Occupied
                        </option>
                        <option value="maintenance" className="bg-card text-warning">
                          ● Maintenance
                        </option>
                      </select>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      {property.campus}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-success" />
                      <span>{[property.building?.name, property.unitLabel, getCampusAreaLabel(property.campusArea) ?? "Area not provided"].filter(Boolean).join(" · ")}</span>
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-border pt-3">
                    <span className="text-lg font-semibold text-foreground tabular-nums">
                      {property.currency}
                      {property.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">/ session</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    ID: {property.id}
                  </span>

                  <Link
                    href={`/explore?q=${encodeURIComponent(property.title)}`}
                    className="text-success hover:text-success font-bold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openBuildingManager(property)}
                    className="text-muted-foreground hover:text-success font-bold"
                  >
                    {property.buildingId ? "Change building" : "Group under building"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>

      {/* Edit Bank Payout Details Modal */}
      <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
        <DialogContent className="editorial-dialog max-w-md bg-card border border-border text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Landmark className="h-5 w-5 text-success" />
              Update Payout Settlement Bank
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground -mt-2">
            These details are saved for payout setup. Transfer eligibility and timing depend on the configured payment provider.
          </p>

          <form onSubmit={handleSaveBank} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
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
              <label className="text-xs font-semibold text-foreground">Account Number (NUBAN)</label>
              <input
                type="text"
                maxLength={10}
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Bank Verification Number (BVN)</label>
              <input
                type="password"
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                required
              />
              <p className="text-[10px] text-muted-foreground">NDPR Encrypted. Used strictly for settlement verification.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBankModalOpen(false)}
                className="rounded-full border-border text-foreground hover:bg-muted text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="editorial-action rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs"
              >
                Save Bank Details
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Lodge Wizard Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="editorial-dialog max-w-2xl bg-card border border-border text-foreground p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <PlusCircle className="h-5 w-5 text-success" />
              List New Student Accommodation
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground -mt-2">
            Create one listing for each room or flat a student can book. Add other rentable units as separate listings.
          </p>

          <form onSubmit={handleCreateProperty} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Parent building</label>
                <select
                  value={newBuildingId}
                  onChange={(event) => {
                    const id = event.target.value;
                    setNewBuildingId(id);
                    const building = buildings.find((item) => item.id === id);
                    if (building) {
                      setNewArea(building.campusArea ?? "");
                      setNewAddress(building.address ?? "");
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs"
                >
                  <option value="">Create a new building</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {[building.name, building.address, getCampusAreaLabel(building.campusArea)].filter(Boolean).join(" · ")} ({building.unitCount ?? 0} units)
                    </option>
                  ))}
                </select>
                {newBuildingId ? (
                  <p className="text-[11px] text-muted-foreground">This unit will share its building’s address and campus area.</p>
                ) : (
                  <input
                    value={newBuildingName}
                    onChange={(event) => setNewBuildingName(event.target.value)}
                    placeholder="Building name (optional)"
                    className="mt-2 w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs"
                  />
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Accommodation Unit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Emerald Lodge — Room 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25 placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Campus</label>
                <select
                  value={newCampus}
                  onChange={(e) => setNewCampus(e.target.value as CampusCode)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                >
                  <option value="FUTMINNA" className="text-success font-bold">
                    FUTMINNA (Gidankwano & Bosso) — Active
                  </option>
                  <option value="UNILAG" disabled className="text-muted-foreground">
                    UNILAG — Coming Soon
                  </option>
                  <option value="FUTA" disabled className="text-muted-foreground">
                    FUTA — Coming Soon
                  </option>
                  <option value="UI" disabled className="text-muted-foreground">
                    UI — Coming Soon
                  </option>
                  <option value="UNIBEN" disabled className="text-muted-foreground">
                    UNIBEN — Coming Soon
                  </option>
                  <option value="OAU" disabled className="text-muted-foreground">
                    OAU — Coming Soon
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bookable Unit Type</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AccommodationType)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                >
                  {ACCOMMODATION_TYPE_OPTIONS.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Campus Area</label>
                <select
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  disabled={Boolean(selectedBuilding?.campusArea)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                  required
                >
                  <option value="">Select a FUTMINNA area</option>
                  {CAMPUS_AREA_OPTIONS.filter((area) => area.id !== "all").map((area) => (
                    <option key={area.id} value={area.id}>{area.campus} · {area.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Total rooms in this unit</label>
                <input
                  type="number"
                  min={1}
                  value={newNumberOfRooms}
                  onChange={(event) => setNewNumberOfRooms(event.target.value === "" ? "" : Number(event.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Rent per Academic Session (₦)</label>
                <input
                  type="number"
                  value={newRent}
                  onChange={(e) => setNewRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25 placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Building Street Address</label>
                <input
                  type="text"
                  placeholder="Street or compound address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  readOnly={Boolean(selectedBuilding?.address)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25 placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Unit label (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Room 4 or Flat B"
                  value={newUnitLabel}
                  onChange={(e) => setNewUnitLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Description & Features</label>
                <textarea
                  rows={2}
                  placeholder="Detail power schedule, borehole water, security, and compound rules..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-success/25 placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Photo Ingestion Pipeline with 16:10 enforcement */}
            <div className="space-y-1.5 border-t border-border pt-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-success" />
                Lodge Photos (16:10 Aspect Ratio • WebP Auto-Compressed)
              </label>
              <ImageUploadDropzone onImagesChange={setUploadedUrls} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border-border text-foreground hover:bg-muted text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="editorial-action rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs"
              >
                Publish Lodge
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBuildingModalOpen} onOpenChange={setIsBuildingModalOpen}>
        <DialogContent className="editorial-dialog max-w-lg bg-card border border-border text-foreground p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Building2 className="h-5 w-5 text-success" />
              Parent building
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {buildingProperty?.title} remains a separately bookable room or flat. This only groups it under a building.
          </p>
          <form onSubmit={handleSaveBuildingAssignment} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-foreground">Building</span>
              <select
                value={targetBuildingId}
                onChange={(event) => setTargetBuildingId(event.target.value)}
                required={Boolean(buildingProperty?.buildingId)}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs"
              >
                {!buildingProperty?.buildingId && <option value="">Create a new building from this listing</option>}
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {[building.name, building.address, getCampusAreaLabel(building.campusArea)].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </select>
            </label>
            {buildingProperty && !targetBuildingId && !buildingProperty.buildingId && (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-foreground">Building name (optional)</span>
                <input
                  value={targetBuildingName}
                  onChange={(event) => setTargetBuildingName(event.target.value)}
                  placeholder="e.g. Royal Emerald Lodge"
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs"
                />
                <span className="text-[11px] text-muted-foreground">The building will inherit this listing’s current address and campus area.</span>
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsBuildingModalOpen(false)} className="rounded-full text-xs">Cancel</Button>
              <Button type="submit" disabled={isSavingBuilding || (!targetBuildingId && Boolean(buildingProperty?.buildingId))} className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs">
                {isSavingBuilding ? "Saving…" : "Save building"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
