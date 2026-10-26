"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Building2, GraduationCap, Heart, ExternalLink, Smartphone } from "lucide-react";
import { AppDownloadModal } from "@/components/mobile/AppDownloadModal";
import { APP_DOWNLOAD_CONFIG } from "@/lib/constants/app-download";
import { KampusLogo } from "@/components/brand/KampusLogo";

export function Footer() {
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  return (
    <footer className="landing-footer border-t border-slate-200 dark:border-[#22352B] bg-slate-50 dark:bg-[#08100C] text-xs text-slate-600 dark:text-[#93A89D] pt-14 pb-10 mt-16 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Regulatory Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white">
              <KampusLogo size={34} />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-[#a6afa8] font-medium uppercase tracking-[0.16em]">
                  Student living, made clearer
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 dark:text-[#93A89D] leading-relaxed max-w-sm">
              Nigeria&apos;s licensed student off-campus accommodation marketplace.
              Protecting student rent through CBN-compliant custodial escrow, zero viewing fees, and 24-hour move-in inspection guarantees.
            </p>

            {/* NDPR & Escrow Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#121E18] border border-slate-200 dark:border-[#22352B] px-3 py-1 text-[10px] text-emerald-700 dark:text-emerald-300 shadow-sm">
                <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>NDPR Data Compliant</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#121E18] border border-slate-200 dark:border-[#22352B] px-3 py-1 text-[10px] text-amber-700 dark:text-amber-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                <span>Custodial Escrow Settlement</span>
              </div>
            </div>
          </div>

          {/* Column 1: For Students */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              For Students
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Explore Lodges
                </Link>
              </li>
              <li>
                <Link href="/roommates" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Find a Roommate
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  My Bookings & Escrow
                </Link>
              </li>
              <li>
                <Link href="/#escrow" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  How Escrow Works
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Saved Lodges Wishlist
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsAppDownloadOpen(true)}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Smartphone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Download {APP_DOWNLOAD_CONFIG.appName}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-600/20 dark:border-emerald-500/30">
                    {APP_DOWNLOAD_CONFIG.versionTag}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Campus Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              FUTMINNA Zones
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore?q=Gidan+Kwano" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Gidan Kwano Gate</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </Link>
              </li>
              <li>
                <Link href="/explore?q=Bosso" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Bosso Campus Hub</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </Link>
              </li>
              <li>
                <Link href="/explore?q=Maikunkele" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Maikunkele Corridor</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </Link>
              </li>
              <li className="text-slate-400 dark:text-[#586B61] flex items-center justify-between">
                <span>UNILAG (Akoka)</span>
                <span className="text-[9px] bg-slate-200 dark:bg-[#121E18] px-1.5 py-0.5 rounded">Soon</span>
              </li>
              <li className="text-slate-400 dark:text-[#586B61] flex items-center justify-between">
                <span>FUTA (Akure)</span>
                <span className="text-[9px] bg-slate-200 dark:bg-[#121E18] px-1.5 py-0.5 rounded">Soon</span>
              </li>
            </ul>
          </div>

          {/* Column 3: For Landlords & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Landlords & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/host/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/host/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  List Accommodations
                </Link>
              </li>
              <li>
                <Link href="/disputes" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Dispute Resolution Center
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-[#586B61] cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-[#586B61] cursor-not-allowed">
                  Privacy Policy & NDPR
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-[#22352B]/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-[#93A89D]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Kampus Prop-Tech Nigeria Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
            <span>•</span>
            <span>Built for Nigerian University Campuses</span>
          </div>
        </div>
      </div>

      {/* Mobile App Download Modal */}
      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
      />
    </footer>
  );
}
