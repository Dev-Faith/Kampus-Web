"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, ShieldCheck } from "lucide-react";
import { HostRegistrationModal } from "@/components/auth/HostRegistrationModal";

export function HostCtaBanner() {
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  return (
    <>
      <section className="landing-host-cta" aria-labelledby="host-title">
        <div className="landing-host-cta__copy">
          <p className="landing-eyebrow">For local hosts</p>
          <h2 id="host-title">A good home can change a student's year.</h2>
          <p>
            List your accommodation for students near FUTMINNA. Share clear details, meet the right tenants, and manage everything from your host dashboard.
          </p>
          <div className="landing-host-cta__actions">
            <button type="button" onClick={() => setIsHostModalOpen(true)}>
              List your lodge <ArrowRight aria-hidden="true" />
            </button>
            <Link href="/host/dashboard">Visit host dashboard</Link>
          </div>
        </div>

        <aside className="landing-host-cta__visual" aria-label="What students look for in a home">
          <div className="landing-host-cta__visual-top">
            <span className="landing-host-cta__building"><Building2 aria-hidden="true" /></span>
            <span><strong>Made for campus life</strong><small>Clear details help everyone settle in.</small></span>
          </div>
          <div className="landing-host-cta__checklist">
            <span><Check aria-hidden="true" /> Accurate room details</span>
            <span><Check aria-hidden="true" /> Photos that show the space</span>
            <span><ShieldCheck aria-hidden="true" /> Protected move-in process</span>
          </div>
          <span className="landing-host-cta__note">A little more clarity goes a long way.</span>
        </aside>
      </section>

      <HostRegistrationModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
      />
    </>
  );
}
