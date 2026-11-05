# Kampus web design system

The live landing page hero and opening purpose cards are the visual reference for the entire website. This guide supersedes the older forest/emerald and gold palette in `kampus_web_design_context.md`.

## Shared colours

Use the semantic Tailwind utilities defined in `src/app/globals.css`. Their values adapt to light and dark mode; do not add a separate palette per page.

| Purpose | Utilities | Light reference |
| --- | --- | --- |
| Page and main text | `bg-background text-foreground` | Warm ivory #f8f8f5 / ink #201b17 |
| Cards, menus and dialogs | `bg-card text-card-foreground border-border` | White / warm neutral border |
| Main action | Shared `Button` default, `bg-primary text-primary-foreground` | Ink / white |
| Brand detail and links | `text-brand-strong`, `bg-brand-soft` | Terracotta / soft peach |
| Supporting panels | `bg-surface-sand`, `bg-surface-blue`, `bg-surface-peach` | Sand, pale blue, peach |
| Secondary text | `text-muted-foreground` | Warm grey #6f6b65 |
| Confirmed/success state | `text-success bg-success-soft` | Muted green |
| Pending/warning state | `text-warning bg-warning-soft` | Muted amber |
| Error/destructive state | `text-destructive bg-destructive-soft` | Muted red |
| Information | `text-info bg-info-soft` | Muted blue |

Use `brand-strong` for small coloured text, rather than the lighter decorative accent. Always pair a primary background with `primary-foreground`. Photo overlays are the exception: keep white text on a dark scrim in both themes. Status colour accompanies a written label or icon; it never carries the meaning alone.

## Composition and components

- Use Geist throughout. Page headlines use regular weight, tight tracking and generous line spacing; use medium/semibold weights for functional labels.
- Use `editorial-page`, `editorial-main`, `editorial-title` and `editorial-card` for application pages. The shared page gutter, maximum width and panel radius keep them aligned with the landing page.
- Prefer white cards with fine borders and restrained shadows. Use pastel panels to distinguish groups such as host summary cards, rather than gradients or bright green panels.
- Use the shared `Button` variants. Primary actions are pill-shaped, have a minimum 44px height and a visible keyboard focus outline. Secondary actions use an outline or ghost treatment.
- Dialogs and menus must use the global surface tokens because their portals are outside the page wrapper. Inputs, errors and focus states must work in both themes.
- Let headings, action rows and status labels wrap on narrow screens. Keep data tables horizontally scrollable inside their own container.
- Maps follow the selected theme; photo and panorama content retain their natural colours.

## Review checklist

The landing page uses room-plan lines, dotted textures and slow accent trails for atmosphere. Decorative layers stay behind the content and ignore pointer input. Keep a visible motion toggle, honour reduced-motion preferences, and avoid automatically advancing explanatory content. The booking journey uses original room illustrations and reader-controlled, keyboard-accessible chapters; sample payment states must be labelled as illustrations. Navigation uses the terracotta active underline. FAQ controls use contrasting plus/minus icons and expose their expanded state.

Compare the hero, explore results, roommates, bookings, host dashboard, admin portal and payment outcome page at mobile and desktop widths in both themes. Open registration, listing and property-detail dialogs. Check small text contrast, long labels, keyboard focus, loading/error states and page overflow. Use fixture accounts and mocked payment responses for visual checks.
