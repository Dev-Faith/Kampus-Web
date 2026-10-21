# Kampus Web Platform: Design Context & Implementation Blueprint

> [!IMPORTANT]
> This document serves as the master **System Context and Architecture Blueprint** for Antigravity IDE to build the complete web version of **Kampus** (Prop-Tech Student Accommodation & Custodial Escrow Platform).

---

## 1. Product Overview & Core Value Proposition

**Kampus** is Nigeria's premier university-centric Prop-Tech ecosystem designed to solve off-campus student accommodation insecurity, fraud, and housing disputes.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               KAMPUS TWO-SIDED MARKETPLACE             │
                    └────────────────────────────────────────────────────────┘
                               /                                  \
                              /                                    \
                             ▼                                      ▼
             ┌───────────────────────────────┐      ┌───────────────────────────────┐
             │       STUDENT EXPERIENCE      │      │      LANDLORD & HOST HUB      │
             ├───────────────────────────────┤      ├───────────────────────────────┤
             │ • Verified Campus Hostels     │      │ • High-occupancy Student Flow │
             │ • 100% Escrow Rent Protection │      │ • Guaranteed Rent in Escrow   │
             │ • Campus Proximity Distances  │      │ • Verified Student Matric IDs │
             │ • Roommate Compatibility      │      │ • Direct Bank Disbursals      │
             │ • Move-in Inspection Security │      │ • 1-Tap Availability Controls │
             └───────────────────────────────┘      └───────────────────────────────┘
                                             \                      /
                                              \                    /
                                               ▼                  ▼
                                     ┌──────────────────────────────────┐
                                     │    LICENSED CUSTODIAL ESCROW     │
                                     │  Funds released ONLY on physical │
                                     │    student move-in inspection    │
                                     └──────────────────────────────────┘
```

---

## 2. Design System & Brand Tokens

The web application should reflect high-end luxury prop-tech aesthetics (comparable to Airbnb Luxe, Linear, and Stripe).

### Color Palette

| Token Name | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Kampus Forest)** | `#0E4D38` | `#16A34A` / `#34D399` | Primary CTAs, branding, active states |
| **Accent (Champagne Gold)** | `#D49E35` | `#FBBF24` | Verified host badges, pending escrow indicators |
| **Emerald Accent** | `#10B981` | `#22C55E` | Available status pills, success banners |
| **Background** | `#FAF8F5` (Warm Cream) | `#0B130F` (Obsidian Pine) | Main page background |
| **Surface / Card** | `#FFFFFF` | `#121E18` | Content containers, modal cards, listings |
| **Surface Variant** | `#F3EFEA` | `#17261F` | Input backgrounds, subtle dividers |
| **Border / Stroke** | `#E5DFD7` | `#22352B` | 1px border outlines |
| **Text Primary** | `#17221C` | `#F2F9F5` | Headings, high-emphasis copy |
| **Text Secondary** | `#5F7367` | `#93A89D` | Subtitles, helper text, metadata |
| **Text Tertiary** | `#9BA9A0` | `#586B61` | Disabled states, timestamps |

### Typography & Spacing
- **Font Family**: `Plus Jakarta Sans` or `Inter` (Google Fonts).
- **Heading Scales**:
  - `Display 1`: 56px / 64px, Extra Bold (-1.5px tracking)
  - `H1`: 36px / 44px, Bold (-0.8px tracking)
  - `H2`: 28px / 36px, Bold (-0.5px tracking)
  - `H3`: 20px / 28px, SemiBold
  - `Body`: 15px / 24px, Regular & Medium
  - `Micro`: 11px / 16px, Bold (Uppercase badges)
- **Container Widths**:
  - Max Web Container: `1280px` centered (`px-6` on mobile, `px-12` on desktop).
  - Auth / Wizard Container: `480px` – `560px` centered card.

---

## 3. High-Level Site Architecture

```
/ (Root)
│
├── (Marketing Landing Page) ────────────── "The Home of Student Accommodation"
│   ├── Hero Section with Live Campus Search Bar
│   ├── Trust & Escrow Guarantee Interactive Visualizer
│   ├── Campus Spotlight & Verified Lodges Grid
│   ├── Dual Portal Features (Students vs Hosts)
│   ├── Testimonials & University Trust Partners
│   └── Footer & Regulatory Compliance Badges
│
├── /explore ────────────────────────────── Student Accommodation Search Engine
│   ├── Filters Panel (Campus, Max Rent, Distance in KM, Room Type, Amenities)
│   ├── Interactive Map vs Grid Split View
│   └── Lodge Cards with Opaque Status & Verified Badges
│
├── /lodges/[id] ────────────────────────── Comprehensive Lodge Detail View
│   ├── High-res Photo Gallery & Virtual Tour
│   ├── Host Credibility Profile & Escrow Protection Notice
│   ├── Proximity Breakdown (e.g. "0.8 km to UNILAG Main Gate")
│   ├── Roommate Match Recommendation Widget
│   └── Sticky Booking / Escrow Reservation Card
│
├── /checkout/[id] ──────────────────────── Secure Escrow Checkout Flow
│   ├── Rent Breakdown (Base Rent + Caution Deposit + Service Fee)
│   ├── Inspection Guarantee Checkbox
│   └── Payment Gateway (Paystack / Flutterwave) Integration
│
├── /bookings ───────────────────────────── Student Bookings & Escrow Dashboard
│   ├── Active Bookings & Move-in Key Code
│   ├── Inspection Confirmation (Trigger to release escrow)
│   └── Dispute Filing & Refund Requests
│
├── /roommates ──────────────────────────── Student Roommate Finder
│   ├── Department, Habits, Sleep Schedule & Budget Matcher
│   └── Direct Student In-App Messaging
│
└── /host ───────────────────────────────── Landlord & Host Portal Hub
    ├── /host/dashboard ────────────────── Revenue, Escrow Balances, Occupancy Bar
    ├── /host/properties ───────────────── Property Management & 1-Tap Status Selector
    ├── /host/properties/create ────────── 5-Step Non-Linear Lodge Creation Wizard
    ├── /host/properties/[id]/edit ─────── Lodge Editor & Photo Management Hub
    ├── /host/bookings ─────────────────── Tenant Approvals, Inspection Milestones
    └── /host/settings ─────────────────── Bank Settlement Account (BVN, Bank Masking)
```

---

## 4. Key Page Specifications

### A. Marketing Landing Page (`/`)
1. **Hero Section**:
   - Headline: *"Off-Campus Living, Zero Fraud. Guaranteed."*
   - Subtitle: *"Discover verified student lodges near your campus. Your rent is safely held in licensed escrow until you inspect and accept your keys."*
   - Dynamic Campus Search Bar:
     - Select Campus (e.g., UNILAG, UNIBEN, FUTA, UI, OAU)
     - Select Budget Range (`₦150k - ₦800k / session`)
     - Room Type (`Single Room`, `Self-Con`, `Flatshare`)
     - CTA: *"Find Verified Lodges"*
2. **Escrow Visualizer (Interactive 3-Step Component)**:
   - Step 1: *Student Books Lodge* (Rent held securely in Custodial Trust).
   - Step 2: *Physical Inspection* (Student inspects lodge on arrival).
   - Step 3: *Escrow Release* (Satisfied student releases rent to host).
3. **Dual Audience Conversion Section**:
   - Tab 1: *For Students* (No agent extortion, transparent fees, roommates).
   - Tab 2: *For Landlords & Hosts* (100% occupancy, pre-vetted students, guaranteed payouts).
4. **Social Proof & Safety**:
   - Badges: NDPR Compliant, CBN-Licensed Payment Partners, 24/7 Security Hotline.

---

### B. Student Search & Detail Flow (`/explore` & `/lodges/[id]`)
1. **Explore Interface**:
   - Split Layout: Left side scrollable cards, right side Google/Mapbox view (toggleable on mobile).
   - Filter Bar: Sticky top bar with quick pills (`Available Now`, `< 1km to Campus`, `Self-Con`, `Under ₦300k`).
   - Cards: 100% opaque badges for listing availability (`Available`, `Occupied`, `Offline`), photo count badge, and distance to campus.
2. **Detail Page**:
   - Gallery: Grid layout with lightbox preview.
   - Verified Landlord Card: Host rating, response time, verified badge.
   - Sticky Escrow Checkout Box: Price per session, annual breakdown, "Reserve via Escrow" CTA.

---

### C. Landlord & Host Portal (`/host/*`)
1. **Host Dashboard (`/host/dashboard`)**:
   - Balance Card with Privacy Eye toggle:
     - Total Revenue Earned (₦)
     - Split: *In Escrow (Awaiting student move-in)* vs *Cleared Payouts (Disbursed to Bank)*.
   - Occupancy Bar: Visual multi-segment progress bar showing % occupied vs available.
   - Quick Actions: `Add Lodge`, `Manage Bookings`, `Edit Payout Account`.
2. **Properties Hub (`/host/properties`)**:
   - Filter Tabs: `All Lodges`, `Available`, `Occupied`, `Offline`.
   - Card Action: 1-Click Status Dropdown (`Available ▾`, `Booked ▾`, `Maintenance ▾`) with high-contrast, zero-bleed pills.
   - Action Bar: `Edit Lodge`, `Preview Live Page`, `Delete Listing`.
3. **Property Editor (`/host/properties/[id]/edit`)**:
   - 5 Segmented Hub Tabs: `1. Overview`, `2. Location`, `3. Pricing`, `4. Amenities`, `5. Photos`.
   - Drag-and-drop photo uploader with primary thumbnail designation.

---

## 5. Ready-to-Use Antigravity IDE Master Prompt

Copy and paste the prompt below into the Antigravity IDE session for your web project (`c:\Users\USER\Desktop\codeProjects\Kampus\Web`):

```markdown
You are pair programming on the web version of "Kampus", a premier Nigerian Prop-Tech platform for university student accommodation and custodial escrow protection.

### Tech Stack & Conventions
- Framework: Next.js (App Router) or Vite + React with TypeScript.
- Styling: Vanilla CSS / CSS Modules or Tailwind CSS (check active config).
- Icons: Lucide React or Material Icons.
- Design System: Luxury Prop-Tech aesthetics (Kampus Forest Green #0E4D38, Emerald #10B981, Champagne Gold #D49E35, Warm Cream #FAF8F5, Dark Obsidian #0B130F).

### Core Requirements
1. Marketing Landing Page (/):
   - World-class hero with campus search selector, interactive 3-step Escrow Protection diagram, dual student/host tabbed value props, and social proof.
2. Student Portal:
   - /explore: Split map/grid lodge search with proximity and budget filters.
   - /lodges/[id]: High-res lodge detail with sticky escrow checkout card.
   - /bookings: Escrow milestone tracking (pending, inspected, confirmed, disputed).
3. Landlord & Host Portal (/host):
   - /host/dashboard: Escrow balance cards with privacy toggle, occupancy progress bar, and booking notifications.
   - /host/properties: Filterable listings with 1-click status dropdown (Available, Occupied, Maintenance) with 100% opaque, high-contrast badges.
   - /host/properties/create & edit: Non-linear segmented lodge wizard.
   - /host/settings: Bank settlement and BVN masking.
4. Role Switching:
   - Seamless bi-directional toggle between Student View and Landlord View with persistence.

Ensure all components have strict TypeScript typing, WCAG AAA contrast, responsive mobile/desktop layouts, and smooth animations.
```
