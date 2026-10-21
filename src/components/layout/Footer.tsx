"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MapPin, Building2, GraduationCap, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#22352B] bg-[#08100C] text-xs text-[#93A89D] pt-14 pb-10 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Regulatory Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30">
                <Image
                  src="/logo.png"
                  alt="Kampus"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-base tracking-tight">
                  KAMPUS
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest -mt-0.5">
                  PropTech & Escrow
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#93A89D] leading-relaxed max-w-sm">
              Nigeria&apos;s licensed student off-campus accommodation marketplace.
              Protecting student rent through CBN-compliant custodial escrow, zero viewing fees, and 24-hour move-in inspection guarantees.
            </p>

            {/* NDPR & Escrow Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#121E18] border border-[#22352B] px-3 py-1 text-[10px] text-emerald-300">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>NDPR Data Compliant</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#121E18] border border-[#22352B] px-3 py-1 text-[10px] text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Custodial Escrow Settlement</span>
              </div>
            </div>
          </div>

          {/* Column 1: For Students */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              For Students
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors">
                  Explore Lodges
                </Link>
              </li>
              <li>
                <Link href="/roommates" className="hover:text-emerald-400 transition-colors">
                  Find a Roommate
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-emerald-400 transition-colors">
                  My Bookings & Escrow
                </Link>
              </li>
              <li>
                <Link href="/#escrow" className="hover:text-emerald-400 transition-colors">
                  How Escrow Works
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-emerald-400 transition-colors">
                  Saved Lodges Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Campus Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              FUTMINNA Zones
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore?q=Gidan+Kwano" className="hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Gidan Kwano Gate</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                </Link>
              </li>
              <li>
                <Link href="/explore?q=Bosso" className="hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Bosso Campus Hub</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                </Link>
              </li>
              <li>
                <Link href="/explore?q=Maikunkele" className="hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>Maikunkele Corridor</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                </Link>
              </li>
              <li className="text-[#586B61] flex items-center justify-between">
                <span>UNILAG (Akoka)</span>
                <span className="text-[9px] bg-[#121E18] px-1.5 py-0.5 rounded">Soon</span>
              </li>
              <li className="text-[#586B61] flex items-center justify-between">
                <span>FUTA (Akure)</span>
                <span className="text-[9px] bg-[#121E18] px-1.5 py-0.5 rounded">Soon</span>
              </li>
            </ul>
          </div>

          {/* Column 3: For Landlords & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Landlords & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/host/dashboard" className="hover:text-emerald-400 transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/host/dashboard" className="hover:text-emerald-400 transition-colors">
                  List Accommodations
                </Link>
              </li>
              <li>
                <Link href="/disputes" className="hover:text-emerald-400 transition-colors">
                  Dispute Resolution Center
                </Link>
              </li>
              <li>
                <span className="text-[#586B61] cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-[#586B61] cursor-not-allowed">
                  Privacy Policy & NDPR
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#22352B]/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Kampus Prop-Tech Nigeria Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
            <span>•</span>
            <span>Built for Nigerian University Campuses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
