"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Users,
  Moon,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Inbox,
  User as UserIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "@/lib/stores/useToastStore";
import { apiClient } from "@/api/client";

interface RoommateProfile {
  id: string;
  name: string;
  campus: string;
  university: string;
  department: string;
  level: string;
  budgetMax: number;
  sleepSchedule: string;
  cleanliness: string;
  cookingHabits: string;
  bio: string;
  avatar?: string | null;
  createdAt: string;
}

const CAMPUSES = [
  { value: "FUTMINNA", label: "FUTMINNA", comingSoon: false },
  { value: "UNILAG", label: "UNILAG", comingSoon: true },
  { value: "FUTA", label: "FUTA", comingSoon: true },
  { value: "UI", label: "UI", comingSoon: true },
  { value: "UNIBEN", label: "UNIBEN", comingSoon: true },
  { value: "OAU", label: "OAU", comingSoon: true },
];
const UNIVERSITIES = [
  { value: "Federal University of Technology, Minna", label: "FUTMINNA", comingSoon: false },
  { value: "University of Lagos", label: "UNILAG", comingSoon: true },
  { value: "Federal University of Technology, Akure", label: "FUTA", comingSoon: true },
  { value: "University of Ibadan", label: "UI", comingSoon: true },
  { value: "University of Benin", label: "UNIBEN", comingSoon: true },
  { value: "Obafemi Awolowo University", label: "OAU", comingSoon: true },
];

const getErrorMessage = (error: any) => error?.response?.data?.message || "Please try again.";

export default function RoommatesPage() {
  const { isAuthenticated } = useAuthStore();
  const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
  const [myListing, setMyListing] = useState<RoommateProfile | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState("FUTMINNA");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const [university, setUniversity] = useState(UNIVERSITIES[0].value);
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("200 Level");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [sleepSchedule, setSleepSchedule] = useState("Night Owl (1am+)");
  const [cleanliness, setCleanliness] = useState("Very Meticulous");
  const [cookingHabits, setCookingHabits] = useState("Cooks Daily");
  const [bio, setBio] = useState("");

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/roommates", {
        params: { university: selectedCampus, page: 1, pageSize: 50 },
      });
      setRoommates(response.data?.data?.items ?? []);
    } catch (error) {
      toast.error("Couldn’t load roommate listings", { description: getErrorMessage(error) });
      setRoommates([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampus]);

  useEffect(() => { void loadListings(); }, [loadListings]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyListing(null);
      return;
    }
    apiClient.get("/roommates/me")
      .then((response) => {
        const listing = response.data?.data ?? null;
        setMyListing(listing);
        if (listing) {
          setUniversity(listing.university);
          setDepartment(listing.department);
          setLevel(listing.level);
          setBudgetMax(Number(listing.budgetMax));
          setSleepSchedule(listing.sleepSchedule);
          setCleanliness(listing.cleanliness);
          setCookingHabits(listing.cookingHabits);
          setBio(listing.bio || "");
        }
      })
      .catch(() => setMyListing(null));
  }, [isAuthenticated]);

  const openCreateForm = () => {
    if (isAuthenticated) setIsCreateOpen(true);
    else setIsAuthOpen(true);
  };

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!department.trim() || !budgetMax || Number(budgetMax) <= 0) {
      setFormError("Add your department and a valid budget to publish your listing.");
      return;
    }
    setFormError("");
    setIsSaving(true);
    try {
      const response = await apiClient.put("/roommates/me", {
        university,
        department: department.trim(),
        level,
        budgetMax: Number(budgetMax),
        sleepSchedule,
        cleanliness,
        cookingHabits,
        bio: bio.trim(),
      });
      setMyListing(response.data?.data ?? null);
      setIsCreateOpen(false);
      await loadListings();
      toast.success("Roommate listing published", { description: "Students at your campus can now find your listing." });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = async (student: RoommateProfile) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setIsConnecting(student.id);
    try {
      await apiClient.post(`/roommates/${student.id}/connect`, {});
      toast.success("Interest sent", { description: `${student.name} has been notified.` });
    } catch (error) {
      toast.error("Couldn’t send your request", { description: getErrorMessage(error) });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleHideListing = async () => {
    try {
      await apiClient.delete("/roommates/me");
      setMyListing(null);
      await loadListings();
      toast.success("Listing hidden");
    } catch (error) {
      toast.error("Couldn’t hide listing", { description: getErrorMessage(error) });
    }
  };

  return (
    <div className="editorial-page roommates-page min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="editorial-main flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-[#22352B] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5"><Users className="h-4 w-4 text-[#c45b37]" /><span className="editorial-eyebrow text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Kampus community</span></div>
            <h1 className="editorial-title text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Find your people.</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] mt-1">Meet students who share your campus, budget and day-to-day habits.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => void loadListings()} variant="outline" aria-label="Refresh roommate listings" className="rounded-full h-9 w-9 p-0 border-slate-200 dark:border-[#22352B]"><RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /></Button>
            <Button onClick={openCreateForm} className="editorial-action bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs rounded-full px-4 py-2 flex items-center gap-1.5"><PlusCircle className="h-4 w-4" /><span>{myListing ? "Edit Listing" : "Post Roommate Request"}</span></Button>
          </div>
        </div>

        {myListing && <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-[#22352B] bg-emerald-50 dark:bg-[#121E18] px-4 py-3 text-xs"><span>Your listing is visible to other students.</span><Button type="button" variant="link" onClick={() => void handleHideListing()} className="h-auto p-0 text-emerald-700 dark:text-emerald-400">Hide listing</Button></div>}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {CAMPUSES.map((campus) => <button key={campus.value} type="button" onClick={() => { if (!campus.comingSoon) setSelectedCampus(campus.value); }} disabled={campus.comingSoon} aria-pressed={selectedCampus === campus.value} className={`editorial-filter px-3.5 py-1.5 rounded-full font-bold transition-all ${selectedCampus === campus.value ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950" : "bg-white dark:bg-[#121E18] text-slate-700 dark:text-[#93A89D] border border-slate-200 dark:border-[#22352B]"} ${campus.comingSoon ? "cursor-not-allowed opacity-60" : ""}`}>{campus.label}{campus.comingSoon ? " · Coming Soon" : ""}</button>)}
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0E1A14] p-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-emerald-600" /><p className="mt-3 text-sm text-slate-500">Loading roommate listings…</p></div>
        ) : roommates.length === 0 ? (
          <div className="editorial-card rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0E1A14] p-12 text-center space-y-3 shadow-sm"><Inbox className="mx-auto h-12 w-12 text-slate-400 dark:text-[#586B61]" /><h3 className="text-base font-bold text-slate-900 dark:text-white">No roommate requests yet</h3><p className="text-xs text-slate-600 dark:text-[#93A89D] max-w-md mx-auto">Post your preferences to connect with students looking to share near your campus.</p><Button onClick={openCreateForm} className="editorial-action rounded-full bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs px-5 py-2">Post a listing</Button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roommates.filter((student) => student.id !== myListing?.id).map((student) => (
              <div key={student.id} className="editorial-card rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#22352B] bg-slate-100 dark:bg-[#0E1A14] flex items-center justify-center">{student.avatar ? <Image src={student.avatar} alt={student.name} fill className="object-cover" /> : <UserIcon className="h-6 w-6 text-[#c45b37]" />}</div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f4e8e2] dark:bg-[#2a201b] text-[#a94c2e] dark:text-[#e08b6a] border border-[#c45b37]/25"><ShieldCheck className="h-3 w-3" />Kampus student</span>
                  </div>
                  <div><h3 className="text-lg font-bold text-slate-900 dark:text-white">{student.name}</h3><p className="text-xs text-slate-500 dark:text-[#93A89D] mt-0.5">{student.department} · {student.level}</p><p className="text-[11px] text-[#a94c2e] dark:text-[#e08b6a] font-semibold mt-0.5">{student.university}</p></div>
                  {!!student.bio && <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{student.bio}</p>}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-[#22352B] pt-3 text-[11px]"><div className="flex items-center gap-1.5 text-slate-600 dark:text-[#93A89D]"><Moon className="h-3 w-3 text-amber-500 shrink-0" /><span className="truncate">{student.sleepSchedule}</span></div><div className="flex items-center gap-1.5 text-slate-600 dark:text-[#93A89D]"><span className="truncate">Cleanliness · {student.cleanliness}</span></div><div className="col-span-2 text-slate-600 dark:text-[#93A89D]">Cooking · {student.cookingHabits}</div></div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#22352B] pt-4"><div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#93A89D] block">Monthly budget</span><span className="text-sm font-black text-slate-900 dark:text-white">Up to ₦{Number(student.budgetMax).toLocaleString()}</span></div><Button onClick={() => void handleConnect(student)} disabled={isConnecting === student.id} className="editorial-action bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs rounded-full px-3.5 py-1.5"><MessageSquare className="h-3.5 w-3.5 mr-1" />{isConnecting === student.id ? "Sending…" : "Connect"}</Button></div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="editorial-dialog max-w-md bg-white dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-slate-100 p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"><Users className="h-5 w-5 text-emerald-600" />{myListing ? "Edit your roommate listing" : "Post your roommate listing"}</DialogTitle></DialogHeader>
          <p className="text-xs text-slate-600 dark:text-[#93A89D]">Your name and profile photo come from your Kampus account.</p>
          <form onSubmit={handleCreatePost} className="space-y-4 mt-2">
            <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Campus / University</label><select value={university} onChange={(e) => setUniversity(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs">{!UNIVERSITIES.some((item) => item.value === university) && <option value={university} disabled>{university} · Coming Soon</option>}{UNIVERSITIES.map((item) => <option key={item.value} value={item.value} disabled={item.comingSoon}>{item.label}{item.comingSoon ? " · Coming Soon" : ""}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Department</label><input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs" required /></div><div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Study level</label><select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs">{[100, 200, 300, 400, 500, 600].map((item) => <option key={item} value={`${item} Level`}>{item} Level</option>)}</select></div></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Max monthly budget (₦)</label><input type="number" min="1" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : "")} placeholder="e.g. 250000" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs" required /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Sleep schedule</label><select value={sleepSchedule} onChange={(e) => setSleepSchedule(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs"><option>Night Owl (1am+)</option><option>Early Bird (10pm)</option><option>Flexible</option></select></div><div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Cleanliness</label><select value={cleanliness} onChange={(e) => setCleanliness(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs"><option>Very Meticulous</option><option>Moderate / Tidy</option><option>Relaxed</option></select></div></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Cooking habits</label><select value={cookingHabits} onChange={(e) => setCookingHabits(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs"><option>Cooks Daily</option><option>Occasionally</option><option>Rarely</option></select></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">About your preferences</label><textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe what matters in a shared home" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs" /></div>
            {formError && <p className="text-xs text-red-600" role="alert">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#22352B]"><Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-full text-xs">Cancel</Button><Button type="submit" disabled={isSaving} className="editorial-action rounded-full bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs">{isSaving ? "Saving…" : "Publish Listing"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
