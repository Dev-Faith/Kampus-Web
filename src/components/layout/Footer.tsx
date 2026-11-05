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
    <footer className="landing-footer border-t border-border bg-background text-xs text-muted-foreground pt-14 pb-10 mt-16 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Regulatory Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-foreground">
              <KampusLogo size={34} />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.16em]">
                  Student living, made clearer
                </span>
              </div>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Student off-campus accommodation marketplace with verified listings,
              zero viewing fees, and payment and inspection tracking.
            </p>

            {/* NDPR & Escrow Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-[10px] text-success">
                <ShieldCheck className="h-3 w-3 text-success" />
                <span>NDPR Data Compliant</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-[10px] text-brand-strong">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span>Payment Status Tracking</span>
              </div>
            </div>
          </div>

          {/* Column 1: For Students */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-foreground">
              For Students
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="hover:text-brand-strong transition-colors">
                  Explore Lodges
                </Link>
              </li>
              <li>
                <Link href="/roommates" className="hover:text-brand-strong transition-colors">
                  Find a Roommate
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-brand-strong transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/#escrow" className="hover:text-brand-strong transition-colors">
                  Payment & Inspection Workflow
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-brand-strong transition-colors">
                  Saved Lodges Wishlist
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsAppDownloadOpen(true)}
                  className="hover:text-brand-strong transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Smartphone className="h-3 w-3 text-brand-strong" />
                  <span>Download {APP_DOWNLOAD_CONFIG.appName}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-soft text-brand-strong font-medium border border-brand/25">
                    {APP_DOWNLOAD_CONFIG.versionTag}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Campus Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-foreground">
              FUTMINNA Areas
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore?campus=FUTMINNA&area=gidankwano" className="hover:text-brand-strong transition-colors">
                  Gidankwano
                </Link>
              </li>
              <li>
                <Link href="/explore?campus=FUTMINNA&area=gidanpainti" className="hover:text-brand-strong transition-colors">
                  Gidanpainti
                </Link>
              </li>
              <li>
                <Link href="/explore?campus=FUTMINNA&area=gidanmangoro" className="hover:text-brand-strong transition-colors">
                  Gidanmangoro
                </Link>
              </li>
              <li className="text-muted-foreground flex items-center justify-between">
                <Link href="/explore?campus=FUTMINNA&area=dama" className="hover:text-brand-strong transition-colors">
                  Dama
                </Link>
              </li>
              <li className="pt-1 text-muted-foreground">Bosso Campus</li>
              <li>
                <Link href="/explore?campus=FUTMINNA&area=bosso_front" className="hover:text-brand-strong transition-colors">
                  Front of school
                </Link>
              </li>
              <li>
                <Link href="/explore?campus=FUTMINNA&area=bosso_back" className="hover:text-brand-strong transition-colors">
                  Back of school
                </Link>
              </li>
              <li className="flex items-center justify-between pt-1 text-muted-foreground">
                <span>Other campuses</span>
                <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded">Coming soon</span>
              </li>
            </ul>
          </div>

          {/* Column 3: For Landlords & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-foreground">
              Landlords & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/host/dashboard" className="hover:text-brand-strong transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/host/dashboard" className="hover:text-brand-strong transition-colors">
                  List Accommodations
                </Link>
              </li>
              <li>
                <Link href="/disputes" className="hover:text-brand-strong transition-colors">
                  Dispute Resolution Center
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed">
                  Privacy Policy & NDPR
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Kampus Prop-Tech Nigeria Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
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
