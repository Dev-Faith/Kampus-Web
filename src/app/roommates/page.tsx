"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Moon,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Inbox,
  User as UserIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "@/lib/stores/useToastStore";

export interface RoommateProfile {
  id: string;
  name: string;
  campus: string;
  department: string;
  level: string;
  budgetMax: number;
  sleepSchedule: string;
  cleanliness: string;
  cookingHabits: string;
  bio: string;
  avatar?: string;
  verifiedMatric: boolean;
  createdAt: string;
}

export default function RoommatesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState("ALL");

  // Form states
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("FUTMINNA (Bosso & Gidan Kwano)");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("200 Level");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [sleepSchedule, setSleepSchedule] = useState("Night Owl (1am+)");
  const [cleanliness, setCleanliness] = useState("Very Meticulous");
  const [cookingHabits, setCookingHabits] = useState("Cooks Daily");
  const [bio, setBio] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department || !budgetMax) return;

    const newPost: RoommateProfile = {
      id: `rm_${Date.now()}`,
      name,
      campus,
      department,
      level,
      budgetMax: Number(budgetMax),
      sleepSchedule,
      cleanliness,
      cookingHabits,
      bio,
      avatar: user?.profilePicture || undefined,
      verifiedMatric: true,
      createdAt: "Just now",
    };

    setRoommates([newPost, ...roommates]);
    setIsCreateOpen(false);
    setName("");
    setDepartment("");
    setBudgetMax("");
    setBio("");

    toast.success("Roommate Request Live!", {
      description: `Your accommodation request for ${campus} has been published to the student network.`,
    });
  };

  const filteredRoommates = roommates.filter((rm) => {
    if (selectedCampus === "ALL") return true;
    return rm.campus.toUpperCase().includes(selectedCampus);
  });

  return (
    <div className="editorial-page roommates-page min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="editorial-main flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-[#22352B] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="h-4 w-4 text-[#c45b37]" />
              <span className="editorial-eyebrow text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Roommates near FUTMINNA
              </span>
            </div>
            <h1 className="editorial-title text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Find your people.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#93A89D] mt-1">
              Meet verified students who share your campus, budget and day-to-day habits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => (isAuthenticated ? setIsCreateOpen(true) : setIsAuthOpen(true))}
              className="editorial-action bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Roommate Request</span>
            </Button>
          </div>
        </div>

        {/* Campus Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {["ALL", "FUTMINNA", "UNILAG", "FUTA", "UI", "UNIBEN", "OAU"].map((camp) => {
            const isFutminna = camp === "FUTMINNA";
            const isAll = camp === "ALL";
            const isDisabled = !isFutminna && !isAll;

            if (isDisabled) {
              return (
                <button
                  key={camp}
                  type="button"
                  onClick={() =>
                    toast.info(`${camp} Coming Soon`, {
                      description: "Roommate matching is active in FUTMINNA. Expanding here soon!",
                    })
                  }
                  className="px-3 py-1.5 rounded-full font-medium transition-all bg-slate-100 dark:bg-[#121E18]/50 text-slate-400 dark:text-[#586B61] hover:text-slate-600 dark:hover:text-[#93A89D] border border-slate-200 dark:border-[#22352B]/60 opacity-70 flex items-center gap-1 cursor-default"
                >
                  <span>{camp}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 dark:bg-[#17261F] text-amber-700 dark:text-amber-400/80 border border-amber-500/20">
                    Soon
                  </span>
                </button>
              );
            }

            return (
              <button
                key={camp}
                type="button"
                onClick={() => setSelectedCampus(camp)}
                aria-pressed={selectedCampus === camp}
                className={`editorial-filter px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                  selectedCampus === camp
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md"
                    : "bg-white dark:bg-[#121E18] text-slate-700 dark:text-[#93A89D] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#22352B] shadow-sm"
                }`}
              >
                <span>{camp === "ALL" ? "All Campuses" : `${camp} (Active)`}</span>
                {isFutminna && selectedCampus !== camp && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c45b37]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Roommates Grid / Empty State */}
        {filteredRoommates.length === 0 ? (
          <div className="editorial-card rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#0E1A14] p-12 text-center space-y-3 shadow-sm">
            <Inbox className="mx-auto h-12 w-12 text-slate-400 dark:text-[#586B61]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Roommate Requests Posted Yet
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#93A89D] max-w-md mx-auto">
              Be the first verified student to post a request for {selectedCampus === "ALL" ? "your campus" : selectedCampus}.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => (isAuthenticated ? setIsCreateOpen(true) : setIsAuthOpen(true))}
                className="editorial-action rounded-full bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs px-5 py-2 shadow-md"
              >
                Create Roommate Request
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRoommates.map((student) => (
              <div
                key={student.id}
                className="editorial-card rounded-3xl border border-slate-200 dark:border-[#22352B] bg-white dark:bg-[#121E18] p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Avatar & Verification Badge */}
                  <div className="flex items-start justify-between">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-100 dark:bg-[#0E1A14] flex items-center justify-center">
                      {student.avatar ? (
                        <Image
                          src={student.avatar}
                          alt={student.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-[#c45b37]" />
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f4e8e2] dark:bg-[#2a201b] text-[#a94c2e] dark:text-[#e08b6a] border border-[#c45b37]/25">
                      <ShieldCheck className="h-3 w-3" />
                      Matric Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{student.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-[#93A89D] mt-0.5">
                      {student.department} • {student.level}
                    </p>
                    <p className="text-[11px] text-[#a94c2e] dark:text-[#e08b6a] font-semibold mt-0.5">
                      {student.campus}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    &ldquo;{student.bio}&rdquo;
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-[#22352B] pt-3 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#93A89D]">
                      <Moon className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{student.sleepSchedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#93A89D]">
                      <CheckCircle2 className="h-3 w-3 text-[#a94c2e] dark:text-[#e08b6a] shrink-0" />
                      <span className="truncate">{student.cleanliness}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#22352B] pt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#93A89D] block">
                      Target Budget
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Up to ₦{student.budgetMax.toLocaleString()}
                    </span>
                  </div>

                  <Button
                    onClick={() => alert(`Connect request initiated for ${student.name}.`)}
                    className="editorial-action bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs rounded-full px-3.5 py-1.5 shadow-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    <span>Connect</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Post Roommate Listing Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="editorial-dialog max-w-md bg-white dark:bg-[#0B130F] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-slate-100 p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Post Roommate Search Profile
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-slate-600 dark:text-[#93A89D] -mt-2">
            Publish your roommate preference card to find fellow students to co-rent flats.
          </p>

          <form onSubmit={handleCreatePost} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Chioma Adeleke"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">University Campus</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="FUTMINNA (Bosso & Gidan Kwano)" className="text-emerald-600 dark:text-emerald-400 font-bold">
                    FUTMINNA (Bosso & Gidan Kwano) — Active
                  </option>
                  <option value="UNILAG (Akoka)" disabled className="text-slate-400 dark:text-[#586B61]">
                    UNILAG (Akoka) — Coming Soon
                  </option>
                  <option value="FUTA (Akure)" disabled className="text-slate-400 dark:text-[#586B61]">
                    FUTA (Akure) — Coming Soon
                  </option>
                  <option value="UI (Ibadan)" disabled className="text-slate-400 dark:text-[#586B61]">
                    UI (Ibadan) — Coming Soon
                  </option>
                  <option value="UNIBEN (Benin)" disabled className="text-slate-400 dark:text-[#586B61]">
                    UNIBEN (Benin) — Coming Soon
                  </option>
                  <option value="OAU (Ife)" disabled className="text-slate-400 dark:text-[#586B61]">
                    OAU (Ife) — Coming Soon
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Academic Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="100 Level">100 Level (Freshman)</option>
                  <option value="200 Level">200 Level</option>
                  <option value="300 Level">300 Level</option>
                  <option value="400 Level">400 Level</option>
                  <option value="500 Level">500 Level / Finalist</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Department / Course</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Max Budget per Session (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Study / Sleep Habit</label>
                <select
                  value={sleepSchedule}
                  onChange={(e) => setSleepSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Night Owl (1am+)">Night Owl (1am+)</option>
                  <option value="Early Bird (10pm)">Early Bird (10pm)</option>
                  <option value="Flexible">Flexible Schedule</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Cleanliness Preference</label>
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Very Meticulous">Very Meticulous</option>
                  <option value="Moderate / Tidy">Moderate / Tidy</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#93A89D]">Bio & Preferences</label>
              <textarea
                rows={2}
                placeholder="Describe your ideal shared accommodation location and living habits..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#14231B] border border-slate-200 dark:border-[#22352B] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#22352B]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border-slate-200 dark:border-[#22352B] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14231B] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="editorial-action rounded-full bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs"
              >
                Publish Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRole="STUDENT"
      />
    </div>
  );
}
