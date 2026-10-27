"use client";

import React, { useState } from "react";
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Bell,
  MapPin,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppDownloadModal } from "@/components/mobile/AppDownloadModal";
import { APP_DOWNLOAD_CONFIG } from "@/lib/constants/app-download";
import { KampusLogo } from "@/components/brand/KampusLogo";

export function MobileAppShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#0B130F] via-[#122A1E] to-[#0E1A14] p-8 sm:p-12 lg:p-14 shadow-2xl overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Download Options */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#083325] border border-emerald-500/40 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span>React Native Mobile App for Students & Hosts</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Kampus in Your Pocket. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300">
                Inspect, Book & Unlock Keys On-the-Go.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#93A89D] max-w-xl leading-relaxed">
              Download our mobile app for booking updates, move-in inspection details, and turn-by-turn navigation to verified lodges in Minna.
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <KeyRound className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Move-In Inspection Code</h4>
                  <p className="text-[11px] text-[#93A89D]">Accessible offline when you arrive at Gidan Kwano or Bosso.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Push Notifications</h4>
                  <p className="text-[11px] text-[#93A89D]">Booking and inspection updates with roommate chats.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">GPS Campus Directions</h4>
                  <p className="text-[11px] text-[#93A89D]">Walking routes from campus lecture theatres to lodges.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Inspection Code Verification</h4>
                  <p className="text-[11px] text-[#93A89D]">The host verifies your code to queue payout processing.</p>
                </div>
              </div>
            </div>

            {/* Download Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href={APP_DOWNLOAD_CONFIG.apkDownloadUrl}
                download={APP_DOWNLOAD_CONFIG.apkFileName}
              >
                <Button className="h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 shadow-[0_0_24px_rgba(16,185,129,0.35)] flex items-center gap-2">
                  <Download className="h-4 w-4 stroke-[2.5]" />
                  <span>Download {APP_DOWNLOAD_CONFIG.appName} {APP_DOWNLOAD_CONFIG.versionTag} ({APP_DOWNLOAD_CONFIG.fileSize})</span>
                </Button>
              </a>

              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-12 rounded-full border-emerald-500/30 bg-emerald-950/40 text-white hover:bg-emerald-900/50 text-xs font-bold px-5 flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>How to Install</span>
              </Button>
            </div>

            {/* Platform Badges */}
            <div className="pt-2 flex items-center gap-3 text-[11px] text-[#93A89D]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{APP_DOWNLOAD_CONFIG.appName} {APP_DOWNLOAD_CONFIG.versionTag}</span>
              </span>
              <span>•</span>
              <span>{APP_DOWNLOAD_CONFIG.fileSize}</span>
              <span>•</span>
              <span>{APP_DOWNLOAD_CONFIG.platform}</span>
            </div>
          </div>

          {/* Right Column: Visual Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 sm:w-80 rounded-[40px] border-4 border-[#22352B] bg-[#08100C] p-3 shadow-2xl shadow-emerald-950/40">
              {/* Dynamic Island / Speaker Notch */}
              <div className="mx-auto h-4 w-24 rounded-full bg-[#121E18] mb-3 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#08100C]" />
              </div>

              {/* Mobile Screen Surface */}
              <div className="rounded-[30px] bg-[#0E1A14] border border-[#22352B] p-4 space-y-3.5 overflow-hidden">
                {/* Mobile App Header */}
                <div className="flex items-center justify-between border-b border-[#22352B] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#111a14] p-0.5">
                      <KampusLogo variant="mark" size={20} markClassName="text-[#f4f1ea]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white block leading-tight">
                        FUTMINNA CAMPUS
                      </span>
                      <span className="text-[9px] text-emerald-400 font-semibold">
                        Gidan Kwano Gate
                      </span>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Booking Status Card */}
                <div className="rounded-2xl border border-emerald-500/40 bg-[#121E18] p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white uppercase tracking-wider">
                      Active Reservation
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Payment Confirmed
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white leading-tight">
                    Apex Royal En-Suite Villa
                  </p>
                  <p className="text-[10px] text-[#93A89D]">
                    3 min walk to Main Campus Gate • ₦220,000 / yr
                  </p>

                  {/* Inspection code highlight */}
                  <div className="mt-2 rounded-xl bg-[#08100C] border border-[#22352B] p-2 text-center">
                    <span className="text-[9px] uppercase tracking-widest text-[#93A89D] block">
                      Physical Move-in Code
                    </span>
                    <span className="text-lg font-black tracking-widest text-emerald-400 font-mono">
                      839 - 204
                    </span>
                    <span className="text-[8px] text-[#586B61] block mt-0.5">
                      Show to landlord only after key collection
                    </span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="rounded-xl bg-emerald-500 text-slate-950 font-black text-center text-[11px] py-2 shadow-md">
                  Confirm Inspection & Collect Keys
                </div>

                {/* Mini Features List */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] text-[#93A89D] pt-1">
                  <div className="rounded-lg bg-[#121E18] p-1.5 border border-[#22352B]">
                    <span className="text-white font-bold block">1-Tap</span>
                    <span>Dispute</span>
                  </div>
                  <div className="rounded-lg bg-[#121E18] p-1.5 border border-[#22352B]">
                    <span className="text-white font-bold block">GPS</span>
                    <span>Off-Campus</span>
                  </div>
                  <div className="rounded-lg bg-[#121E18] p-1.5 border border-[#22352B]">
                    <span className="text-white font-bold block">Offline</span>
                    <span>Mode</span>
                  </div>
                </div>
              </div>

              {/* Home Indicator Bar */}
              <div className="mx-auto h-1 w-20 rounded-full bg-[#22352B] mt-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Download Modal Trigger */}
      <AppDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
