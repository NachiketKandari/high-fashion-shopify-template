# Polite Society design system

This is the canonical presentation contract for the Polite Society storefront. It defines the
tokens, layout rules, brand mark, component anatomy, motion and accessibility behaviour that every
storefront surface must share.

It is normative for presentation only. Commerce facts — prices, availability, currency, cart totals,
checkout and customer identity — always come from Shopify. The system is built from the live
reference measured on 4 November 2026 and re-measured on 5 November 2026; see
[`reference/DESIGN.md`](./reference/DESIGN.md) for the measurement log and
[`DESIGN-SYSTEM-AUDIT.md`](./DESIGN-SYSTEM-AUDIT.md) for the current implementation gap and migration
plan.

The reference photography, wordmark and brand copy are licensed for this private design study only.
Replace them with licensed assets before publishing.

## 1. Principles

1. **Photography leads; type frames.** The interface is monochrome so product and editorial imagery
   carries colour.
2. **One typographic voice.** DM Sans at 300 for body copy and 400 for headings, labels and controls.
   Uppercase and `0.05em` tracking are the only display devices.
3. **Zero radius, hairline rules.** Rectangles, 1px borders and full-bleed grids. Circles are reserved
   for quantity counts and colour dots.
4. **Full-bleed, gutter-aligned.** Content runs edge to edge. Only text, controls and grid insets use
   the 20px mobile / 30px desktop gutter.
5. **Quiet motion.** Motion explains state; it never decorates. Transform and opacity only.
6. **Accessible by construction.** Visible focus, 36px targets, keyboard models and reduced-motion
   behaviour are part of the component, not an afterthought.
7. **Tokens before values.** A component uses a named token or a scale utility; raw hex colours and
   one-off pixel values are defects.

## 2. Token architecture

Tokens live in [`app/globals.css`](../app/globals.css):

- `@theme inline` exposes tokens as Tailwind utilities (`bg-ink`, `text-h2`, `ease-polite`).
- `:root` and media queries hold values that change with viewport or runtime state.
- `lib/config/` holds brand and commerce configuration, never visual values.
- Components consume utilities and CSS variables. `components/ui/` primitives take primitive props
  only and contain no domain data.

A target registry is shown below. It normalises the current theme and the values measured from the
live reference. The audit maps the current implementation to this registry.

### 2.1 Colour

| Token                | Value     | Utility          | Use                                |
| -------------------- | --------- | ---------------- | ---------------------------------- |
| `--color-paper`      | `#ffffff` | `bg-paper`       | Page, header, drawers, cards       |
| `--color-ink`        | `#000000` | `text-ink`       | Primary text, rules, solid buttons |
| `--color-ink-muted`  | `#4d4d4d` | `text-ink-muted` | Secondary copy, prices, size lists |
| `--color-rule`       | `#e1e1e1` | `border-rule`    | Hairline dividers, card framing    |
| `--color-input`      | `#cccccc` | `border-input`   | Text, search and newsletter inputs |
| `--color-surface`    | `#f2f2f2` | `bg-surface`     | Image placeholder, skeleton        |
| `--color-inverse`    | `#f9f9f9` | `text-inverse`   | Text on solid black                |
| `--color-error`      | `#d94c4c` | `text-error`     | Validation copy                    |
| `--color-error-rule` | `#c7261b` | `border-error`   | Invalid field border               |
| `--color-error-bg`   | `#fff5f5` | `bg-error-soft`  | Invalid field background           |

The shopping surface has no accent colour. The Shopify Shop mark colour (`#5A31F4`) belongs to the
Shop Pay button and is never used as a general UI colour. Status colours are limited to form errors;
success is expressed in ink.

Keep the existing semantic aliases (`background`, `foreground`, `muted-foreground`, `border`,
`input`, `surface`, `rule`) as compatibility names for the values above. Do not add a second colour
vocabulary beside them; one token has one value and one owner.

### 2.2 Typography

DM Sans, weights 300/400/500. Body copy is 300; headings, labels and controls are 400; 500 is reserved
for tabular emphasis such as a selected filter count. All letter spacing is `0.05em` unless stated.
There is no monospace role on storefront surfaces; the wordmark is an SVG, not type.

| Token          | Size / line | Weight | Case      | Use                                        |
| -------------- | ----------- | ------ | --------- | ------------------------------------------ |
| `text-display` | 22 / 29     | 400    | uppercase | PDP title, price, large editorial heading  |
| `text-h2`      | 18 / 23     | 400    | uppercase | Collection title, rail title, modal title  |
| `text-h3`      | 14 / 18     | 400    | uppercase | Section labels, cart drawer title          |
| `text-h4`      | 12 / 16     | 400    | uppercase | Mega-menu links, option labels, card title |
| `text-label`   | 9 / 14      | 400    | uppercase | Micro labels, payment marks                |
| `text-body`    | 14 / 21     | 300    | sentence  | Default copy, descriptions                 |
| `text-body-sm` | 12 / 18     | 300    | sentence  | Secondary copy, footer links               |
| `text-control` | 11 / 14     | 400    | uppercase | Buttons, small links, helper labels        |
| `text-chip`    | 12 / 18     | 400    | uppercase | Chips, sort, toolbar                       |
| `text-tab`     | 11 / 16     | 400    | uppercase | PDP tabs                                   |
| `text-nav`     | 13 / 18     | 400    | uppercase | Desktop nav, utility links                 |

Rules:

- Headings and controls must set `font-weight: 400`. The body's 300 must never leak into a heading,
  nav item, button, chip or tab.
- Do not rely on Tailwind's default negative heading tracking. The theme must not attach negative
  letter spacing to `text-lg`/`text-xl`; Polite Society tracks positively.
- Type utilities should include their line height in the token (`--text-h2--line-height`) so a
  component does not repeat `leading-[23px]`.
- Use rem values in the registry. The current 14px body is 0.875rem.

### 2.3 Spacing and layout

The base unit is 4px. The working steps are 5, 10, 20, 24, 30, 40, 60, 64, 80, 110.

| Token                 | Mobile | Desktop ≥1100 | Use                                     |
| --------------------- | ------ | ------------- | --------------------------------------- |
| `--gutter`            | 20px   | 30px          | Header, footer, page and section insets |
| `--page-top`          | 24px   | 24px          | First content row below the header      |
| `--section-gap`       | 40px   | 60px          | Space between content-page sections     |
| `--grid-gap`          | 3px    | 3px           | Product grid and rail column gap        |
| `--grid-row-gap`      | 24px   | 20px          | Product grid row gap                    |
| `--card-inset`        | 8px    | 8px           | Product-card text inset                 |
| `--announcement-h`    | 35px   | 30px          | Announcement bar                        |
| `--header-bar-h`      | 56px   | 76px          | Compact header bar                      |
| `--header-masthead-h` | —      | 110px         | Homepage wordmark row                   |
| `--header-total-h`    | 91px   | 186px         | Announcement + large header on home     |
| `--drawer-search`     | 100%   | 440px         | Search and cart drawers                 |
| `--drawer-filter`     | 100%   | 420px         | Filter drawer                           |
| `--drawer-size`       | 100%   | 720px         | Size guide                              |
| `--modal-narrow`      | 100%   | 448px         | Newsletter                              |

Rules:

- `Container` owns horizontal padding only. It never sets vertical padding.
- `Page` owns top padding and no bottom padding; the footer supplies the final gap.
- `Sections` owns the gap between sibling sections. Children carry no outer margins or `space-y-*`.
- Editorial mosaics are full-bleed and butt together with no gap. Product grids and rails use 3px
  column gaps so the photography reads as a contact sheet.
- The gutter changes at 1100px, not at Tailwind's 768px `md`. Add a `desktop` breakpoint at 68.75rem
  and use it for the gutter, desktop nav and mega menu.

### 2.4 Borders, radii and elevation

| Token            | Value                                | Use                                    |
| ---------------- | ------------------------------------ | -------------------------------------- |
| `--radius-*`     | `0`                                  | All rectangular surfaces and controls  |
| `--border-hair`  | `1px`                                | Rules, cards, inputs, outlined buttons |
| `--shadow-modal` | soft 1px border + low-opacity shadow | Newsletter and quick-shop only         |

No card, button, input, sheet or dialog has a rounded corner. `rounded-full` survives only for the
cart count, quantity badges, colour dots and avatars. `shadow-*` on storefront primitives is a
template leftover and should be removed unless it is the single modal elevation.

### 2.5 Motion

| Token                | Value                         | Use                                    |
| -------------------- | ----------------------------- | -------------------------------------- |
| `--ease-polite`      | `cubic-bezier(.2, .6, .2, 1)` | All authored motion                    |
| `--motion-fast`      | 100ms                         | Press feedback, colour tweaks          |
| `--motion-base`      | 300ms                         | Header, mega menu, drawers, dialogs    |
| `--motion-long`      | 500ms                         | Announcement swap, image crossfade     |
| `--motion-image`     | 600ms                         | Editorial and product-card image scale |
| `--motion-underline` | 350ms                         | Nav and utility underline              |

Component mapping is in §6. Any duration outside this scale needs a written exception in the
component contract. Do not use Tailwind's default 150ms timing function for authored motion.

### 2.6 Breakpoints

| Name      | Width  | Behaviour                                                            |
| --------- | ------ | -------------------------------------------------------------------- |
| `mobile`  | <750px | 56px header, hamburger, 2-column grid, snap gallery                  |
| `tablet`  | 750px  | 3-column grid, compact header, mobile-style drawers                  |
| `desktop` | 1100px | 30px gutter, large home masthead, full nav, mega menu, 4-column grid |
| `wide`    | 1440px | Reference capture width; no separate layout                          |

Tailwind's `xl` (1280px) is not the desktop breakpoint. Register `desktop: 68.75rem` and migrate the
header, nav, gutter and grid rules to it.

### 2.7 Z-index

| Layer              | Value | Owner                              |
| ------------------ | ----- | ---------------------------------- |
| Page               | 0     | Content                            |
| Mega menu          | 40    | Inside the header stacking context |
| Header             | 50    | Sticky header                      |
| Overlay/drawer     | 60    | Sheet and dialog portal            |
| Toast/notification | 70    | Cart errors, wishlist confirmation |
| Skip link          | 100   | Accessibility escape               |

### 2.8 Icons

Lucide icons, 1.25 stroke, sizes 12/14/16/20. Icons inherit current colour. Icon-only controls keep a
36px hit area even when the glyph is 16px. Decorative icons are `aria-hidden="true"`.

## 3. Brand mark

The wordmark is the only logo lockup. It is a single SVG, `public/reference/ps-wordmark.svg`, with an
intrinsic viewBox of `149.354 × 12.054` (ratio 12.39:1). It is black, has no clear-space padding in
the file, and must never be recreated as text.

| Variant          | Rendered size | Where                                     |
| ---------------- | ------------- | ----------------------------------------- |
| `masthead`       | 1016 × 82     | Homepage large header at 1440             |
| `compact`        | 342 × 27.6    | Desktop header on every other route/state |
| `compact-mobile` | 170 × 13.7    | Mobile header                             |
| `menu`           | 210 × 16.9    | Mobile menu panel                         |
| `footer`         | 315 × 25.4    | Footer                                    |

Rules:

- One `Wordmark` component owns every variant. Header, mobile menu, footer and nav fallback must not
  instantiate `next/image` with the wordmark path directly.
- The masthead width is `min(1016px, calc(100vw - 2 * var(--gutter)))`; it scales below 1440.
- Derive height from the 12.39:1 ratio. Do not declare 342 × 28, 315 × 25 or another rounded pair;
  those introduce a 1–2% squash.
- The current SVG contains a white background rect. Remove it, or render the mark only on paper.
- The mark links to `/` with `aria-label="Polite Society"`; the image alt is `Polite Society`.
- Load the above-the-fold header mark with `priority`. Footer and menu marks are lazy.
- Keep the measured reference at 342px on desktop and 170px on mobile. The current live mobile header
  uses 210px, but 170px is the right choice when utility icons meet the 36px target; record that as a
  deliberate accessibility decision.
- Clear space is at least the gutter on the outside and 14px from adjacent controls.
- Replace the asset with the production mark before launch. The reference mark is unlicensed.

## 4. Layout primitives

| Primitive   | Contract                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| `Container` | `mx-auto w-full px-(--gutter)`. Horizontal padding only.                     |
| `Page`      | `pt-(--page-top)` by default; no bottom padding. Full-height pages add flex. |
| `Sections`  | `grid gap-(--section-gap)`. Parent owns spacing; children own none.          |
| `Link`      | Always the storefront `Link`, never `next/link`. Underline/opacity states.   |

Page anatomy:

- Header (announcement + bar + optional masthead) is outside the page content and sticky.
- `main` is a flex column that grows; footer follows.
- Each route starts with a synchronous page shell and Suspense boundaries for runtime data.
- `Page` top padding is 24px on collection, product, cart and content routes.

## 5. Component contracts

The system is integrated through these owners:

| Surface               | Files                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Tokens and primitives | `app/globals.css`, `components/ui/`                                      |
| Shell                 | `components/nav/`, `components/footer/`, `components/newsletter/`        |
| Product presentation  | `components/product-card/`, `components/product/`                        |
| Collection            | `components/collections/`                                                |
| Product detail        | `components/product-detail/`                                             |
| Cart                  | `components/cart/`, `app/cart/`                                          |
| Content layout        | Shopify page content, `components/content/` where a local layout remains |

A surface owns its labels and data wrapping; `components/ui/` owns only the primitive behaviour and
tokens. Do not move domain types into `components/ui/`.

### 5.1 Shell

**Announcement**

- Height 35px mobile / 30px desktop; black bar, white 12/16 400 centered copy.
- Two messages rotate every 3s with a 500ms opacity + 4px translate swap.
- Pauses on hover/focus and when the document is hidden; `aria-live="polite"`, `aria-atomic="true"`.
- Reduced motion stops rotation and shows the first message.

**Header**

- Sticky white header. Home: 110px masthead + 76px bar at ≥1100. Other routes: 56px mobile /
  76px desktop bar. The home header reserves 186px in flow so content does not jump on collapse.
- Collapses after 24px of scroll over 300ms with `--ease-polite`; the compact wordmark fades in as
  the masthead leaves. The compact bar stays 76px.
- Nav: 13/18 400 uppercase, 25px gap, 12px vertical padding. Active/hover underline is a 1px scaleX
  line that grows from the left over 350ms.
- Utilities: 13/18 400 uppercase, 16px gap, same underline treatment. Order is currency, search,
  wishlist, help, account when enabled, cart.
- Every utility control has a 36px hit area.

**Mega menu**

- Full-width white panel directly below the bar, 1440 × 496 at the reference. 36px top / 30px side /
  40px bottom padding; link columns + two 260 × 418 portrait tiles at 60px gap.
- Opens on hover and `:focus-visible`, closes on leave, focus-out, Escape and route change.
- 300ms opacity + 4px translate with `--ease-polite`; trigger underline stays active.
- Escape returns focus to the trigger. The trigger is a disclosure button (`aria-expanded`,
  `aria-controls`), not a menu item unless the panel adopts a menu keyboard model.
- Disabled at <1100px; the mobile menu owns that range.

**Mobile menu**

- Right-side full-height panel below the announcement + header, full width. The header, search and
  cart stay visible; the panel does not duplicate the wordmark.
- 14/18 400 uppercase rows, 38px row height, 20px gutter. Nested groups use native `<details>` with
  a rotating chevron.
- Bottom row pinned to the viewport: currency left, account right when enabled.
- 300ms translate with `--ease-polite`; overlay fades in at the same duration.

**Search**

- 440px right drawer on desktop; full width on mobile. 300ms slide.
- Opens with focus in the input; Cmd/Ctrl+K toggles. Escape closes and returns focus.
- Header row: close on the right, `SEARCH` label beneath.
- Input: borderless line with a 35px height, 12px uppercase submit label, clear control when typed.
- Results: Suggestions, then 40 × 60 thumbnails with 11px uppercase names; collections group when
  available; empty state uses recent/popular searches.
- Result changes are announced politely; arrow keys move through results.

**Contact**

- 440px drawer with WhatsApp, call, email and flagship-store rows.
- 16px line icon, 11px uppercase label, chevron, 1px bottom rule.

**Footer**

- White, top rule, 361px tall at 1440. Six zones: flagship/address/wordmark, Help, Policies, The
  Brand, Socials, newsletter. Bottom row: copyright + credit left, payment marks right.
- Headings 11px uppercase 400; links 12/18 300 `#4d4d4d`; 22px row rhythm; underline on hover.
- Wordmark 315 × 25.4. Stack columns with 32px gaps under 750px.

**Newsletter**

- 448px centered white modal, 1px rule, no radius. Opens after 5s; dismissal persists for 30 days.
- Heading 14px uppercase; body 12/18; underlined email field; `SUBSCRIBE`; unsubscribe note 12px
  muted. Close control has a 36px hit area. Dialog uses the 300ms motion token.

### 5.2 Commerce presentation

**Product card**

- Media 2:3, `bg-surface` placeholder, second image crossfades on hover/focus over 500ms.
- Featured image scales 1.03 over 600ms with `--ease-polite`; reduced motion disables the scale.
- Colour dots 10px, 8px gap, 14px top/right inset, each with a visually hidden colour name.
- Info inset 8px. Title 12/16 400 uppercase truncates on one line; price 12/16 300 muted on its own
  line for the rail and on the title baseline for the grid when space allows. Sizes 12/18 300 muted.
- Wishlist and quick-shop controls reveal on hover/focus; on touch they are always visible. Both
  keep a 36px hit area. Wishlist reports `aria-pressed`.
- Out-of-stock keeps the image visible with a black 55% overlay and 11px uppercase label.
- Sold-out sizes remain visible and disabled, never removed.

**Product rail**

- Title 18/23 400 at the gutter; `VIEW ALL` 11px uppercase right; arrows 36px.
- Track: 3px gap, 266px cards desktop / 226px mobile; five cards are visible at 1440 and the home
  rail renders the first eight. Arrows scroll by 70% of the viewport; pointer drag uses the same
  physics; reduced motion uses instant scrolling. Edge states disable the corresponding arrow.

**Collection**

- Compact header. Title 18/23 400 at 24px below the header.
- Chips 12/18 400, 20px gap, active 1px underline; horizontal scroll with edge fades on mobile.
- Toolbar 12/18 400: density, filter, sort. Sort trigger 36px high.
- Grid 4/3/2 columns; column gap 3px; row gap 20px desktop / 24px mobile.
- Filter drawer 420px: sticky header with close, accordion groups, sticky footer with Clear all and
  Apply. Price inputs use the input token. Active filters render as removable badges.
- Infinite loading keeps a manual Load more fallback and announces new items.

**Product detail**

- 50/50 split at desktop. Gallery 720px wide, stacked 2:3 images; mobile is a full-width
  scroll-snap strip with 6px dots and 36px hit areas.
- Info column 408px, centered in the right panel, 64px top padding, sticky below the 76px header.
- Title 22/29 400; price 22/29 400 with 0.05em tracking; wishlist 25.5px glyph in a 36px target.
- Labels 12/16 400. Swatches 10px with a 1px active ring. Sizes 12/21, active underline, sold-out
  disabled. `SIZE GUIDE` right-aligned.
- Quantity 96 × 36 with 36px buttons. Add to cart 296 × 36 outlined; Buy it now 408 × 36 solid.
- Tabs 11/16 400 with a complete tab keyboard model. Body copy 13–14/21 300. Size guide drawer 720px
  with the find-my-size form and measurement tables. `NEED HELP?` pinned bottom-right.

**Cart**

- Drawer 440px, 30px inset, 300ms slide. Title 14/18 400 `CART (n)`.
- Free-shipping track 1px, message 11/14, `role="progressbar"` and live text.
- Line item 60 × 75 image, 12/16 400 title, 11/14 muted options, price 12/16, 36px quantity controls,
  underlined Remove.
- Footer: subtotal, tax note, outlined Checkout, underlined View shopping cart.
- Cart page: 30px gutter, two columns ~560 / ~310 with a rule; order summary 11px uppercase;
  checkout 36px outlined.

## 6. Motion and interaction

| Surface               | Trigger             | Motion                                         |
| --------------------- | ------------------- | ---------------------------------------------- |
| Announcement          | 3s timer            | 500ms opacity + 4px translate                  |
| Header collapse       | scroll > 24px       | 300ms height/opacity with `--ease-polite`      |
| Nav/utility underline | hover/focus/open    | 350ms scaleX from the left                     |
| Mega menu             | hover/focus-visible | 300ms opacity + 4px translate                  |
| Drawers and dialogs   | open/close          | 300ms transform/opacity; overlay 300ms opacity |
| Newsletter            | open/close          | 300ms fade + 4px/2% scale                      |
| Product image         | card hover/focus    | 600ms scale 1.03; second image 500ms crossfade |
| Editorial image       | tile hover/focus    | 600ms scale 1.03                               |
| Button colour         | hover/active        | 300ms colour; 100ms press feedback             |
| Free-shipping bar     | subtotal change     | 500ms width                                    |
| Accordion/chevron     | open/close          | 200ms rotation; panel height 300ms             |
| Tabs                  | selection           | 300ms underline/opacity; no content slide      |
| Rail scroll           | arrow/drag          | smooth scroll; instant under reduced motion    |

Interaction rules:

- Hover is never the only way to reveal an action. Every hover-revealed control appears on
  `:focus-visible` and is always visible on touch.
- Disabled controls use `cursor-not-allowed` and 50% opacity; they remain in the accessibility tree.
- Loading uses a status role, a spinner plus text, and `aria-busy` on the affected region.
- Reduced motion: a global media query shortens authored transitions to 1ms, stops autoplay and
  smooth scrolling, and leaves loading indicators as static text where possible.

## 7. Accessibility

- **Focus.** 2px ink ring with 2px offset on every interactive element, using `:focus-visible` only.
  Never remove the UA outline without replacing it.
- **Targets.** 36px minimum; 44px preferred on touch. Enlarge hit areas with padding, not glyph size.
- **Dialogs.** `role="dialog"`, `aria-modal="true"`, labelled title, described body, focus trap,
  Escape, body scroll lock and focus return.
- **Tabs.** One tab stop; ArrowLeft/ArrowRight/Home/End move selection; every tab has an associated
  rendered panel via `aria-controls`/`aria-labelledby`.
- **Combobox search.** Input role combobox, listbox popup, `aria-activedescendant`, polite result
  count, clear announcement.
- **Live regions.** Announcement, search results, filter results, infinite-load additions, cart count
  and free-shipping progress.
- **Swatches.** Each dot has a visually hidden colour name; active state is not colour alone.
- **Images.** Meaningful alt text for product/editorial images; empty alt for decorative hover images.
- **Contrast.** Ink on white and `#4d4d4d` on white pass AA for body copy. Do not place white labels
  on light imagery without a scrim.
- **Motion.** Respect `prefers-reduced-motion`; provide no autoplay that cannot be paused.

## 8. Performance

- Every image uses `next/image` with reserved dimensions or a reserved aspect ratio. `sizes="100vw"`
  is the repository rule; do not tune it per surface.
- `deviceSizes: [1320, 1920]` and `imageSizes: []` are intentional; every surface reuses the same two
  asset widths.
- Preload only the LCP image. On the homepage that is the hero; the wordmark is an SVG and should not
  be preloaded twice.
- Product grids load the first row eagerly and the rest lazily. Hover images load lazily.
- Animate transform and opacity only. Do not animate width, height, top or left in authored motion.
- Keep `"use client"` at the smallest leaf. Pages and data wrappers stay server components.
- Use the storefront `Link` so per-link prefetch is intent-based, not grid-wide.

## 9. Content

- Copy is inline beside the component that renders it. Labels are primitive props for client leaves.
- Uppercase is a CSS transform; source copy stays sentence case except acronyms and proper nouns.
- Buttons use verbs: `Add to cart`, `Buy it now`, `View all`, `Apply`, `Clear all`.
- Empty states say what happened and what to do next in one short sentence.
- Prices, currency and availability are formatted from Shopify responses, never from local maps.
- The wordmark, reference photography and copied brand copy are placeholders for this study.

## 10. Governance

A change is on-system only when:

- it uses a named colour, type, spacing, radius or motion token;
- it uses a primitive from `components/ui/` or a domain wrapper that composes one;
- it has hover, focus-visible, active, disabled and loading states;
- it has a keyboard path and a reduced-motion path;
- it preserves the 36px target and the reserved image geometry;
- it passes the Playwright verification protocol in the audit document.

Exceptions are recorded in the component contract with the reason and the owner. One-off values in a
feature file are not exceptions; they are drift.

Design system owner: Next.js presentation. Shopify owns commerce data and mutations; Eve owns the
agent surface.
