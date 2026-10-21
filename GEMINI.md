# Kampus Real Estate & PropTech Platform - Workspace Rules & Architecture

## Core Stack
- **Framework & Language:** Next.js (App Router, TypeScript strict mode)
- **Styling:** Tailwind CSS with modern design tokens and utility functions
- **UI Component System:** `shadcn/ui` (Radix UI primitives)
- **Animation & Motion:** `motion/react` (Framer Motion), `Motion Primitives`, `Magic UI`
- **URL & Search State:** `nuqs` (Type-safe URL query parameters)
- **Geospatial & Mapping:** `react-map-gl` + `maplibre-gl` (Vector tiles, high-performance webgl rendering)
- **Mobile Gestures & Drawers:** `vaul` (Drawer / bottom sheet for mobile viewport)
- **Carousels & Swipers:** `embla-carousel-react`

## Media & Visualization Stack
- **Image Cloud Storage:** `next-cloudinary` (or ImageKit)
- **Client-Side Image Processing:** `react-easy-crop` + `browser-image-compression`
- **Interactive Lightbox:** `yet-another-react-lightbox` (Zoom, thumbnails, full-screen)
- **Before/After Staging:** `react-compare-slider` (Renovation & virtual staging comparison)
- **360° Spherical Panoramas:** `react-photo-sphere-viewer` / `@photo-sphere-viewer/core`

## Global Guardrails & Architectural Standards
1. **URL-First Query State:** Never store search filters, price ranges, bed/bath counts, or map bounding boxes in isolated component `useState`. Always synchronize with URL query params using `nuqs`. Every search state must be shareable and browser-history compliant.
2. **Synchronized Grid & Map State:** Maintain a lightweight shared store (Zustand: `hoveredPropertyId`, `selectedPropertyId`) between the property feed and the MapLibre canvas so that hovering or focusing a card highlights its price pin on the map instantaneously.
3. **Responsive Split-Screen Behavior:**
   - Desktop (`>= 768px`): Dual-column split layout (scrollable property listing feed alongside sticky map canvas).
   - Mobile (`< 768px`): Collapse split view into a full-screen interactive MapLibre map with a draggable `vaul` bottom sheet drawer containing the listings.
4. **Code Quality & Verification:** Always validate code after finishing a feature slice by executing `npx tsc --noEmit` and testing build validity with `npm run build`.

## Modular Rules
- @[UI & Motion Rules](.agents/rules/ui-motion.md)
- @[Image & Media Rules](.agents/rules/image-pipeline.md)
