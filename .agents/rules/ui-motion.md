# UI & Motion Engineering Rules

## 1. Tactile Micro-Interactions (`motion/react`)
- All interactive controls (pills, price markers, cards, modal triggers) must utilize spring physics (`stiffness: 350, damping: 25`) for organic responsiveness.
- Avoid linear transitions; use natural bezier curves or bouncy springs for hover scale (`whileHover={{ scale: 1.02 }}`) and active presses (`whileTap={{ scale: 0.98 }}`).

## 2. Animated Grid & Layout Transitions (`layoutId`)
- When applying filters (price, bedrooms, property types), list updates must animate fluidly using Framer Motion's `layout` and `layoutId` prop on container and card items.
- Cards must enter with staggered motion variants to prevent abrupt content jumps and maintain visual continuity.
- Retain DOM stability during filtering with `<AnimatePresence mode="popLayout">`.

## 3. Property Card Embedded Carousel (`embla-carousel-react`)
- Every listing card must feature an integrated, lightweight `embla-carousel-react` multi-image slider:
  - Touch-swipeable on mobile and tablet devices.
  - Pagination dot indicators at the bottom edge.
  - Left/right arrow buttons that reveal gracefully only on desktop card hover (`group-hover:opacity-100 opacity-0 transition-opacity`).
  - Propagation stopper on carousel navigation so clicking arrows does not inadvertently trigger the card's page navigation or quick-view.

## 4. MorphingDialog Quick-View Pattern
- Provide a `MorphingDialog` component that expands a card or card media into a rich quick-view modal.
- The user must never lose their scroll position or current map viewport when opening, inspecting, or closing the quick-view dialog.
