# Design system audit and migration plan

**Status:** implemented. The detailed findings below are the pre-implementation record; the current
contract is verified by `pnpm lint:design` and `pnpm test:design`.
**Date:** 5 November 2026
**Scope:** presentation, motion, accessibility and design-system integration across the storefront.
**Canonical specification:** [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).
**Current verification:** [`DESIGN-SYSTEM-ENFORCEMENT.md`](./DESIGN-SYSTEM-ENFORCEMENT.md),
`tests/design/`, and [`reference/PLAYWRIGHT-COMPARISON.md`](./reference/PLAYWRIGHT-COMPARISON.md).

The codebase changed while this audit ran. Two commits landed: the storefront rebuild and the
content migration. The editorial and journal routes now render from Shopify, so findings that
depended on those local route files are flagged or removed. The audit is against the current
content-migrated HEAD; the wider content migration is out of scope.

**The short version**

- The token layer now registers colour, type roles, spacing, breakpoints, motion, focus and
  reduced-motion behaviour in `app/globals.css`; headings, nav, chips and tabs compute 400.
- The gutter, header, nav, grids and PDP split switch at the 1100px `desktop` breakpoint, and one
  `Wordmark` component owns every brand-mark instance.
- Primitives use the zero-radius, hairline, 36px-target contract; green/amber/red commerce accents
  and the Shop purple are gone.
- Drawers and dialogs use 300ms `--ease-standard`, and the global reduced-motion layer stops authored
  transition, autoplay and smooth scrolling.
- PDP tabs implement the ARIA tabs pattern, inputs keep a visible focus ring, and every checked
  interactive target is at least 36px.
- Static drift checks, computed-style contracts and the reference comparison keep the system from
  drifting again.

## 1. What was checked

Playwright MCP, desktop Chrome, against the live reference and the local storefront:

| Viewport    | Routes                                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1440 × 1000 | `/`, `/collections/corsets`, `/products/alma-lace-corset-top`, `/cart`, mobile overlays                                       |
| 390 × 844   | `/`, mobile menu, search, filters, cart, product gallery                                                                      |
| 768 × 1024  | Breakpoint rules and grid columns reviewed against the reference measurement; no separate tablet capture, matching `FLOWS.md` |

Measurements came from `getComputedStyle` and `getBoundingClientRect`, not screenshots. The same
method produced [`reference/DESIGN.md`](./reference/DESIGN.md) during the original clone. The live
site has drifted from the 4 November capture in a few places; those are called out as **live drift**
and are decisions, not assumptions. Playwright screenshots were written to `.playwright-mcp/`, which
is gitignored; the committed visual record remains `docs/reference/`.

Interactions exercised: announcement rotation, header collapse, mega menu, mobile menu, search,
contact, cart drawer plus add-to-cart, newsletter, filters, sort, PDP options/tabs/size guide, and
the empty/filled cart states.

## 2. Scorecard

| Area                  | Status | Current verification                                                                                                                        |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Token foundation      | Pass   | Colour, type roles, spacing, breakpoints, motion, focus and reduced motion are registered and asserted.                                     |
| Layout and spacing    | Pass   | Gutter 20/30 at 1100, page top 24, section gap 40/60, grid gaps 3 and 24/20.                                                                |
| Brand mark            | Pass   | One `Wordmark`, one intrinsic ratio, one priority rule; four variants, three in use, `menu` unused.                                         |
| Shell                 | Pass*  | Header, mega menu, mobile menu, search, contact, cart and footer follow the system; currency is INR-only.                                   |
| Product cards / rails | Pass   | 2:3 media, 10px swatches with names, 12/16 type, 8px inset, hover/focus reveal and quick shop.                                              |
| Collection            | Pass*  | Grid, chips, 36px toolbar and sticky filter footer; filter application remains immediate rather than draft.                                 |
| Product detail        | Pass*  | Split, gallery, sticky info, tabs key model, 36px controls and the shared find-my-size size guide.                                          |
| Cart                  | Pass   | 440px drawer, 14/18 title, 36px quantity controls, progressbar and live message.                                                            |
| Motion                | Pass   | 300ms `--ease-standard` overlays, 350ms underline, 600ms image zoom and a global reduced-motion layer.                                      |
| Accessibility         | Pass*  | Automated tab, focus, aria-modal, target and reduced-motion checks pass; screen reader remains manual.                                      |
| Performance           | Pass*  | One hero image is prioritised; `sizes="100vw"` warnings are the accepted repository policy.                                                 |
| Code-system integrity | Pass   | The static checker rejects named radius/shadow utilities, 500–700 weights, spectral colours and arbitrary type in `app/` and `components/`. |

\* The starred items retain the product decisions and content dependencies in §7. Automated checks
cover the computed contract; they do not replace a screen-reader pass.

## 3. Measured deltas

These are pre-implementation computed values from the live reference and the local clone at 1440px unless stated.

### 3.1 Foundations

| Metric              | Reference            | Clone                                          | Impact                              |
| ------------------- | -------------------- | ---------------------------------------------- | ----------------------------------- |
| Body                | 14/21, 300, 0.7px    | 14/21, 300, 0.7px                              | Pass                                |
| H1 collection       | 18/23, 400, 0.9px    | 18/23, 300, 0.9px                              | Heading weight fails                |
| H2 rail             | 18/23, 400           | 16/24, 300                                     | Size and weight fail                |
| PDP title           | 22/29, 400           | 22/29, 300                                     | Weight fails                        |
| Product card title  | 12/16, 400           | 13/17, 300                                     | Size, weight and line height fail   |
| Product card price  | 12/16, 300 muted     | 13/17, 300                                     | Size fails                          |
| Nav link            | 13/18, 400, gap 25px | 13/21, 300, gap 32px                           | Line height, weight and rhythm fail |
| Chips               | 12/18, 400           | 12/16, 300                                     | Line height and weight fail         |
| PDP tabs            | 11/16, 400           | 11/21, 300                                     | Line height and weight fail         |
| Cart drawer title   | 14/18, 400           | 12/16, 600                                     | Size and weight fail                |
| Sheet title default | 400                  | 600                                            | Template `font-semibold` leaks      |
| Input border        | `#cccccc`            | `#ececec`                                      | Token mismatch                      |
| Heading tracking    | positive `0.05em`    | theme attaches negative tracking to `text-lg`+ | Utilities can override the system   |

### 3.2 Layout

| Metric               | Reference                      | Clone                           |
| -------------------- | ------------------------------ | ------------------------------- |
| Gutter               | 20px <1100, 30px ≥1100         | 20px <768, 30px ≥768            |
| Desktop nav          | ≥1100                          | ≥1280 (`xl`)                    |
| Home large header    | 186px (110 + 76)               | 186px                           |
| Compact header       | 76px desktop / 56px mobile     | 76px / 56px                     |
| Collection title top | 24px below header              | 32px below header               |
| Page top (default)   | 24px                           | 40px (`Page`)                   |
| Section gap          | 40 mobile / 60 desktop         | 40 default; callers use 20      |
| Collection grid      | 4-col, 3px / 20px              | 4-col, 3px / 20px               |
| Product grid row gap | 24 mobile / 20 desktop         | 20 mobile / 24 desktop          |
| Cart drawer inset    | 30px                           | 20px                            |
| Collection cards     | 342.75 × 514.1 (2:3)           | 342.8 × 514.1 (2:3)             |
| Home 2-up            | 720 × 892.8, 0 gap             | 718.5 × 898.1, 3px gap          |
| Home 2-up label      | 18/23, 400, 30/20 inset        | 11/21, 300, 16/12 inset         |
| Home 3-up            | 480 × 556.8, 0 gap             | 478 × 554.7, 3px gap            |
| Home 3-up label      | 13/17, 400, 30/20 inset        | 11/21, 300, 16/12 inset         |
| Home rail heading    | 18/23 at +30px                 | 16/24 at +44px                  |
| Home rail card       | 265.9 wide, 3px gap            | 266 wide, 10px gap              |
| Home rail info       | 8px inset, title/price stacked | 8px inset, title/price inline   |
| Home link tiles      | 360 square, 0 gap              | 357.8 square, 3px gap           |
| Home link tile label | 11/11, 400, 30px inset         | 11/21, 300, 16px inset          |
| Footer               | 361px tall                     | 354px tall                      |
| Mobile 2-up          | 390 × 585 (2:3)                | 390 × 487.5 (4:5)               |
| Mobile rail card     | 226 wide, 3px gap              | 226 wide, 10px gap              |
| Mobile menu          | Below header, 14/18, 38px rows | Full viewport, 13/21, 45px rows |

### 3.3 Component details

| Component            | Reference                                                  | Clone                                                           |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| Mega menu            | 1440 × 496, 300ms cubic-bezier(.2,.6,.2,1)                 | 300ms default ease; 4px translate                               |
| Search drawer        | 440px, 300ms                                               | 440px, 500ms open / 300ms close                                 |
| Filter drawer        | 420px, 400ms, sticky footer                                | 420px, 500/300ms, no footer                                     |
| Cart drawer          | 440px, 600ms, title 14/18 400                              | 440px, 500/300ms, title 12/16 600                               |
| Newsletter           | 448px, 5s, 30-day dismissal, 300ms                         | 448px, 5s, 30-day dismissal, 200ms                              |
| Product card hover   | Crossfade + 1.03 zoom; wishlist/quick shop on hover        | Crossfade + zoom; wishlist always visible, quick shop not wired |
| PDP add to cart      | 296 × 36 outlined                                          | 302 × 36 outlined                                               |
| PDP buy now          | 408 × 36 solid                                             | 302 × 36 solid (span measured)                                  |
| PDP tabs             | Full tab keyboard model                                    | Roving tabindex without arrow keys                              |
| Cart progress        | 1px track + message                                        | Same visually, no progressbar/live semantics                    |
| Cart quantity        | 36px controls                                              | 24px controls                                                   |
| Mobile utility icons | 12–14px glyphs in the reference; target rule requires 36px | 16px glyphs with 16px hit area                                  |

## 4. Findings

> Historical record. These findings describe the pre-implementation HEAD and are retained as
> evidence for the migration. They are not a current gap list; use the verification commands above.

### P0 — release blockers

**P0.1 Heading and control weights leak 300.**
`body` sets 300 in `app/globals.css:89-96`; headings, nav, chips, tabs and card titles inherit it
unless a component sets a weight. Evidence: rail H2 300 (`components/product/product-rail.tsx:45`),
collection H1 300 (`components/collections/collection-page.tsx:170`), PDP H1 300
(`components/product-detail/product-detail-section.tsx:182`), cards 300
(`components/product-card/product-card.tsx:99-108`), tabs 300
(`components/product-detail/product-tabs.tsx:29`).

Fix direction: define type utilities that include weight 400, or set `font-normal` in the heading
components. Add a Playwright assertion that every heading/control computes 400.

**P0.2 The type scale is ad hoc and mostly px.**
`app/globals.css:14-26` defines `text-3xs`, `text-2xs`, `text-13` and a duplicate `text-xxs`, while
components use `text-[22px]`, `text-[13px]`, `leading-[29px]`, `leading-[23px]`, `text-lg`, `text-sm`.
The theme also adds negative letter spacing to `text-lg`–`text-7xl` (`app/globals.css:18-26`), which
fights the positive tracking used everywhere in the reference.

Fix direction: register the eight type tokens from `DESIGN-SYSTEM.md` §2.2 with size, line height and
weight; remove the negative tracking overrides; replace arbitrary px text with the tokens.

**P0.3 Desktop breakpoint and gutter are wrong.**
`Container` switches at `md` (`components/ui/container.tsx:6`); the header and nav switch at `xl`
(`components/nav/header.tsx:39,48,53,70,79`; `components/nav/desktop-nav.tsx:28`; `mobile-menu.tsx:21`).
The reference switches at 1100px. This changes the header, nav, grid and gutter for every viewport
between 768 and 1279.

Fix direction: add a `desktop` breakpoint at 68.75rem, migrate `xl` header/nav rules and the container
gutter.

**P0.4 The logo is five inline copies with distorted ratios and duplicate priority loading.**
`components/nav/header.tsx:54-86` (masthead and compact), `components/nav/mobile-menu.tsx:35-43`,
`components/nav/fallback.tsx:15-23` and `components/footer/index.tsx:25-32` each instantiate the SVG.
The asset is 149.354 × 12.054 (12.390:1), but the compact declares 342 × 28, the footer 315 × 25 and
the mobile menu 342 × 28 rendered at 22px high — each is slightly distorted. The mobile menu renders
about 269 × 22 instead of the 210 × 16.9 target. Two header images request priority even though only
one is LCP. The SVG also carries a white background rect; it will show as a white box on any
non-white surface.

Fix direction: one `Wordmark` component with `masthead | compact | compact-mobile | menu | footer`
variants from `DESIGN-SYSTEM.md` §3, one intrinsic geometry, one link rule and one priority rule.
Remove the background rect or render the mark on paper only.

**P0.5 Drawer/dialog motion is inconsistent and not reduced.**
`components/ui/sheet.tsx:29,59` opens at 500ms and closes at 300ms with `ease-in-out`; dialogs are
200ms (`components/ui/dialog.tsx:25,47`). The reference design token is 300ms with
`cubic-bezier(.2,.6,.2,1)`.

Fix direction: use `--motion-base` and `--ease-standard` on the overlay and popup; keep a documented
exception if the cart's longer reference duration is preferred.

**P0.6 Sheet/Dialog titles inherit `font-semibold`.**
`components/ui/sheet.tsx:88` and `components/ui/dialog.tsx:49` set the template heading weight. The
cart title computes 600 (`components/cart/overlay.tsx:42`), filter 600
(`components/collections/filters-client.tsx:44`). The reference is 400.

Fix direction: remove the default weight from the primitive and let the domain component supply the
type token.

**P0.7 PDP tabs are not keyboard-operable.**
`components/product-detail/product-tabs.tsx:25-41` puts only the active tab in the tab order and has
no Arrow/Home/End handling. Inactive panels are not rendered even though `aria-controls` points at
them.

Fix direction: implement the ARIA tabs pattern with roving tabindex and arrow keys, or use a tested
primitive. Add a keyboard Playwright check.

**P0.8 Focus is removed from primary inputs.**
`components/nav/search-modal.tsx:100`, `components/newsletter/form.tsx:34`,
`components/content/contact-form.tsx:11,67`, `components/cart/discount-form.tsx:67` and
`components/collections/filters-client.tsx:340` use `outline-none` / `ring-0` without a replacement.

Fix direction: one `focus-ring` utility (2px ink, 2px offset) and apply it to every input, link and
custom control.

**P0.9 Touch targets fall below the 36px contract.**
High-impact examples: gallery dots 4px (`components/product-detail/product-media.tsx:185-195`),
filter and PDP swatches 10px (`components/collections/filters-client.tsx:170-190`,
`components/product-detail/color-picker.tsx:51-68`), cart quantity 24px
(`components/cart/line-item.tsx:181-213`), sort trigger 20px (`components/collections/sort-select.tsx:34`),
header utilities 16px (`components/nav/index.tsx:33`, `nav/search-modal.tsx:35`,
`nav/contact-drawer.tsx:37`, `nav/cart-client.tsx:24`), rail arrows 32px
(`components/product/product-rail.tsx:55,64`), wishlist 32px
(`components/product-card/wishlist-button.tsx:16`).

Fix direction: enlarge hit areas with padding or pseudo-elements; do not enlarge the glyph.

**P0.10 Reduced-motion support is limited to shimmer and video.**
Only `app/globals.css:171-177` and `components/ui/auto-play-video.tsx:22-49` honour the preference.
The 3s announcement, smooth rail/gallery scrolling, hover zooms, drawers, dialogs and loading
animations continue.

Fix direction: a global reduced-motion layer that removes authored transitions/animations and a
component-level check for autoplay and smooth scrolling.

**P0.11 Commerce surfaces break the monochrome rule.**
The discount badge is a green pill (`components/product/discount-badge.tsx:12`), cart warnings use
amber and dark-mode variants (`components/cart/warnings.tsx:40,48,58`), the agent errors use
`text-red-500` (`components/agent/agent-panel.tsx:299`,
`components/agent/shopping-results.tsx:380`), and the unused Shop purple remains
(`app/globals.css:9`). The reference has no shopping-surface accent; errors use the form-error tokens
and success is expressed in ink.

Fix direction: remove green/amber/red accents from storefront surfaces; use `--color-error*` for
invalid states and ink for confirmation.

**P0.12 Layout contracts are not followed.**
`Page` defaults to 40px top instead of 24px (`components/ui/page.tsx:6`); `Sections` defaults to 40px
but callers override it to 20px (`components/ui/sections.tsx:6`); the product grid row gap is 20px
mobile / 24px desktop, the reverse of the reference (`components/product/products-grid.tsx:17,68`);
the cart drawer uses 20px inset instead of 30px (`components/cart/overlay.tsx:41,77,103,107,127`);
the footer puts vertical padding on `Container` (`components/footer/index.tsx:15`); and content pages
add 96px bottom padding before the footer's 80px (`components/content/content-page.tsx:14`).

Fix direction: page top 24, section gap 40/60, grid row gap 24/20, drawer inset 30, container
horizontal only, footer bottom spacing from the page not both.

**P0.13 Primitives are still shadcn/base defaults.**
`Button` is 14px/500 with `rounded-lg` and `shadow-xs` (`components/ui/button.tsx:7,14,20-25`);
`Badge` is a 12px pill (`components/ui/badge.tsx:7`); `Dialog` and `Sheet` carry `shadow-lg` and
600-weight titles (`components/ui/dialog.tsx:25,47,91,101`, `components/ui/sheet.tsx:59,67,74,88`);
`Input`, `Textarea`, `Select`, `Label` and `InputGroup` keep template radii, shadows, `ring-3` and
500/600 weights (`components/ui/input.tsx:10-12`, `textarea.tsx:9`, `select.tsx:23,59,78`,
`label.tsx:9`, `input-group.tsx:15-35`); `ImagePlaceholder` uses `bg-white text-accent`
(`components/ui/image-placeholder.tsx:13`); and `Prose` forces 500 headings
(`components/ui/prose.tsx:8`).

Fix direction: rebuild the primitives from the registry in Phase 1. Remove per-page
`rounded-none`/`shadow-none` patches; fix the primitive instead.

### P1 — visual and interaction fidelity

**P1.1 Collection and content typography.**
Titles and chips are 300 instead of 400; line heights differ. See §3.1. Product card titles are 13px
instead of 12px and prices are not muted.

**P1.2 Home editorial layout.**
The 2-up/3-up mosaics use 3px gaps, 4:5 ratios and 11px labels. The reference uses 0 gaps, larger
captions (18px on 2-up, 13px on 3-up) and 30px/20px insets. On mobile the 2-up is 2:3, not 4:5.
`app/page.tsx:80-121`.

**P1.3 Home rail rhythm.**
`components/product/product-rail.tsx:43-81` uses 40px top padding, 16px heading, 10px gap and 28px
heading-to-track gap. Reference: 30px top, 18px heading, 3px gap.

**P1.4 Product card composition.**
The card puts title and price on one line (`components/product-card/product-card.tsx:96-126`). The
rail reference stacks title then muted price. Swatches are 14px with 12px inset; reference 10px with
14px inset. Wishlist is always visible; reference reveals it on hover/focus. Quick shop exists in
`components/product-card/quick-shop.tsx` but is not wired into `ProductCard`.

**P1.5 Mobile menu layout.**
`components/nav/mobile-menu.tsx:28-118` is a full-viewport sheet with its own wordmark. The reference
is a panel below the 56px header, keeps the header utilities visible and uses 14/18 type with 38px
rows. Decide before implementation: reference fidelity (under header) or current full-screen
treatment. Recommendation: under-header, because it keeps search/cart reachable.

**P1.6 Mega menu click/focus contract.**
`components/nav/desktop-nav.tsx:44-46` opens on `onFocus` and then toggles on click, so a pointer click
can open and immediately close. Escape clears state without returning focus. Use
`:focus-visible` gating, separate focus-open from click-toggle, and restore focus on Escape.

**P1.7 Search completeness.**
The drawer requests `PRODUCT`, `COLLECTION` and `QUERY` in `components/nav/index.tsx:24-28`, but the
UI renders only products (`components/nav/search-modal.tsx:140-176`). The hook exposes
`activeIndex`/`setActiveIndex` but the drawer does not use it. Empty state is recently viewed, not
recent searches. Add result groups, listbox semantics, arrow-key navigation and a polite result
count.

**P1.8 Filter drawer actions.**
`components/collections/filters-client.tsx:38-49` makes the whole sheet the scroller, so the header
and close button scroll away. Filters apply immediately; there is no sticky `CLEAR ALL` / `APPLY`
footer and no full clear-all action. Reference wants the footer and sticky header.

**P1.9 Infinite loading accessibility.**
`components/collections/infinite-product-grid.tsx:76-92` has no `aria-busy`, no status text for the
spinner, no live announcement and no manual “Load more” fallback.

**P1.10 Card swatches have no accessible names.**
`components/product-card/product-card.tsx:82-93` uses `title` on spans inside an `aria-hidden` image
link. Add visually hidden names and expose them outside the hidden link.

**P1.11 Cart free-shipping semantics.**
`components/cart/overlay.tsx:126-139` is visual only. Add `role="progressbar"`, `aria-valuemin/max/now`
and a polite message; announce cart-count changes.

**P1.12 Size guide content.**
The PDP size-guide drawer (`components/product-detail/size-guide.tsx:29-71`) has the tops table but
not the “Find my size” form, category tabs or measurement sections. The local size-guide page was
moved to Shopify in the content migration; confirm the final Shopify content before porting the form into the
drawer. Content migration is out of scope for this audit.

**P1.13 Product detail tab content and sold-out sizes.**
Sold-out variants remain links marked with a line-through; the reference keeps a disabled state.
`components/product-detail/option-picker.tsx:46-63`.

**P1.14 Product rail drag.**
`components/product/product-rail.tsx:74-81` relies on native overflow. The reference supports
pointer drag. Add drag with keyboard/arrow fallback and reduced-motion instant scrolling.

**P1.15 Currency and grid density.**
At audit time, the header currency was a static `USD` label (`components/nav/index.tsx:19-22`) and
the mobile bottom row was a static span (`components/nav/mobile-menu.tsx:114-116`). The currency is
now a static `INR` label; the earlier display-only USD/INR selector was removed after the store
moved to INR. The grid density buttons remain non-interactive
(`components/collections/toolbar.tsx:86-92`); grid density is still a reference-only control that
needs a product decision, not a styling patch.

**P1.16 Several surfaces use type outside the scale.**
Blog and listing headings use 20–48px with template tracking (`components/blog/article-card.tsx:33-42`,
`components/blog/article-page.tsx:53-54`, `components/blog/blog-index.tsx:17`,
`app/collections/page.tsx:41`, `app/search/page.tsx:74`); error pages use 24–36px
(`app/not-found.tsx:23`, `components/error/error-boundary-content.tsx:16`, `app/global-error.tsx:22`);
the footer newsletter heading is 12px non-uppercase (`components/footer/index.tsx:57`); payment marks
are 8px (`:73`); the newsletter modal uses 14/20 for its heading and 11/18 for body
(`components/newsletter/popup.tsx:37,38,44`); and `Price` uses 0.04em tracking
(`components/product/price.tsx:14`).

Fix direction: map every storefront heading to `text-display`/`text-h2`/`text-h3`/`text-h4`; keep
editorial long-form at 14/21 or a documented 22/29 maximum, not 48px. Current `PaymentMarks` renders
six SVG brand marks (Amex, Diners, Maestro, Mastercard, RuPay, Visa), not type.

**P1.17 The type system is still utility string driven.**
Compiled usage shows 76 `text-2xs`, 6 `text-13`, 114 `tracking-wider`, 7 `tracking-wide`,
109 `uppercase`, 17 `rounded-full`, 14 `shadow-*`, 38 `font-medium`/`font-semibold`, 9 `ring-3`,
24 `xl:` and 44 `lg:` occurrences. These counts are the migration backlog, not a style choice.

Fix direction: replace them role by role; do not add more size aliases.

### P2 — system hygiene

- `app/globals.css:9` defines an unused Shop accent; `:14-17` duplicates `text-2xs`/`text-xxs`.
- `app/globals.css:47-50` zeroes radii, but `rounded-lg`, `rounded-md`, `rounded-full`, `shadow-xs`
  and `shadow-lg` remain across primitives and feature files. Most render as zero radius but
  communicate the wrong intent.
- `components/ui/button.tsx:7` uses `text-sm font-medium` and `rounded-lg`; the storefront button
  is 11px/14 400 uppercase with no radius.
- `components/ui/sheet.tsx:67` uses `rounded-t-3xl` on the bottom sheet, which conflicts with the
  zero-radius system.
- `components/ui/swatch.tsx:26` uses `size-2.5` (10px) without a target wrapper; it is correct as a
  visual but needs a 36px interactive wrapper.
- `components/nav/quick-links.tsx` has no consumer and duplicates the mega-menu idea.
- `components/product-card/components.tsx` is a second, template-flavoured card implementation used
  only by the agent surface; its `rounded`, `bg-destructive`, square media and `text-sm font-medium`
  do not follow the storefront card.
- `components/product-detail/option-picker.tsx:15` forwards `compact` to a DOM `div`, producing the
  React warning `Received false for a non-boolean attribute compact`. Destructure it.
- `app/layout.tsx:60-69` uses two hero images, both with `priority`; only one is visible per
  breakpoint. Preload only the active LCP image.
- `next/image` warns about `sizes="100vw"` on non-full-width images. This is the repository rule in
  `AGENTS.md`; keep it and record the warning as accepted rather than tuning per surface.
- `pnpm lint` and `pnpm typecheck` pass on the current content-migrated HEAD.

## 5. Migration plan

> Historical record. This is the plan that was executed; current work is gated by
> `scripts/check-design.mjs` and `tests/design/`.

The plan is ordered so each phase reduces the next phase's work. Do not start with page-by-page
polish; the token and primitive layers are the root causes.

### Phase 0 — Foundations (`app/globals.css`, `components/ui/`)

1. Register the colour, type, spacing, motion and breakpoint tokens from `DESIGN-SYSTEM.md`.
2. Remove the negative `--text-*--letter-spacing` overrides and the duplicate `xxs`.
3. Set the input border to `#cccccc`; keep `#e1e1e1` for rules; set error tokens and remove
   `--positive` and `--color-shop` from storefront surfaces.
4. Add `--gutter`, `--page-top`, `--section-gap`, `--grid-gap`, `--grid-row-gap`, `--card-inset`.
5. Add `--ease-standard`, `--motion-*`, `desktop` and `tablet` breakpoints.
6. Add one focus-ring utility and one reduced-motion layer.
7. Zero every rectangular radius, remove template shadows, and remove the unearned `ring-3`
   focus treatment.
8. Delete unused radius/shadow utilities and the duplicate `xxs` alias.

**Exit:** computed styles on a token probe page match the registry; `text-h2` etc. include weight and
line height; no negative tracking on headings.

### Phase 1 — Primitives

1. `Button`: variants `solid`, `outline`, `link`; sizes 36/40; 11/14 400 uppercase; zero radius.
2. `Input`, `Textarea`, `Select`: one border token, one focus ring, 35/36px height.
3. `Sheet`, `Dialog`: 300ms `--ease-standard`, `aria-modal`, title weight from the caller, 36px close,
   sticky-header support for long sheets.
4. `Swatch`: visual 10px, interactive wrapper 36px, visible selected ring and hidden name.
5. `Badge`, `Tabs`, `Skeleton` and any retained `Accordion`: remove template radii/shadows; add
   status/aria rules.

**Exit:** no primitive contains a raw hex, arbitrary px type, `rounded-lg` or `font-medium` default
outside a documented exception; keyboard and reduced-motion smoke tests pass.

### Phase 2 — Brand and shell

1. Add `Wordmark` with the five variants and priority rules; remove the four inline copies.
2. Migrate header, nav, mega menu and mobile menu to the `desktop` breakpoint and 20/30px gutter.
3. Apply the header bar heights, nav 13/18 400, utility gap and underline motion.
4. Fix mega menu focus/click/Escape and mobile menu placement.
5. Apply announcement 4px swap and reduced-motion pause.
6. Apply footer type, column rhythm and wordmark size.
7. Apply newsletter 300ms modal and 36px close.

**Exit:** header, mobile menu, mega menu and footer match the reference measurements; only one
wordmark is prioritised; keyboard traversal and focus return pass.

### Phase 3 — Commerce surfaces

1. Product card: 2:3 media, 10px swatches with names, 8px info, 12/16 title 400, 12/16 muted price,
   hover/focus reveal for wishlist and quick shop, second-image crossfade.
2. Product rail: 18/23 heading, 30px top, 3px gap, 266/226 cards, 36px arrows, pointer drag.
3. Collection: title/chips 400, 24px top, 3/20 grid, sticky filter footer with clear/apply, 36px
   sort/filter targets.
4. PDP: 22/29 400 title, full tab keyboard model, 36px controls, 720px size guide with find-my-size,
   disabled sold-out sizes, pinned help link.
5. Cart: 14/18 400 title, 36px quantity/removal targets, progressbar semantics, 440px drawer and
   two-column page.

**Exit:** the Playwright flow suite in §6 passes at 1440/768/390; no component uses 300 for a heading
or control; no interactive target is below 36px.

### Phase 4 — Motion and completeness

1. Replace 150/200/500ms defaults with the motion tokens; use `--ease-standard` on authored motion.
2. Add reduced-motion handling to announcement, rails, gallery, drawers, dialogs and loading.
3. Implement the missing interactions: search groups + keyboard, filter footer, infinite-load status,
   quick shop, rail drag, wishlist feedback, recently viewed.
4. Add live regions for search, filter results, infinite load, cart count and free shipping.

**Exit:** the interaction checklist in §7 is complete; reduced-motion emulation shows no auto-rotating
or smooth-scrolling content; keyboard-only traversal works.

### Phase 5 — Verification and handoff

1. Run the Playwright protocol in §6 against a preview deployment and the live reference.
2. Run `pnpm lint`, `pnpm typecheck`, `pnpm build`. Lint and typecheck pass on the current HEAD; the build
   is still to be run after the first implementation phase.
3. Record screenshots for home, collection, PDP, cart, mobile menu, search, filter and cart drawer.
4. Update `docs/reference/DESIGN.md` only if a measured value changes; keep this audit as the
   implementation record.

## 6. Playwright verification protocol

Use the same method as the original clone: measure computed styles and rectangles, then exercise the
flows.

**Viewports:** 1440 × 1000, 768 × 1024, 390 × 844. **Browser:** desktop Chrome. **Auth:** none;
commerce uses the local Shopify store.

**Token probe.** Evaluate on each route:

```js
const root = getComputedStyle(document.documentElement);
const probe = {
  body: getComputedStyle(document.body).font,
  h2: getComputedStyle(document.querySelector("main h2")).font,
  gutter: root.getPropertyValue("--gutter"),
  ease: root.getPropertyValue("--ease-standard"),
};
```

**Geometry probe.** For every page, capture `getBoundingClientRect()` for the header, masthead,
wordmark, section rows, grid, cards and overlays. Assert:

- header large 186px on home at ≥1100, compact 76px elsewhere, 56px mobile;
- wordmark 1016 × 82 masthead, 342 × 27.6 compact, 170 × 13.7 mobile, 315 × 25.4 footer;
- collection grid 4/3/2 columns with 3px/20px gaps;
- PDP gallery 720px, info column 408px, buttons 36px;
- cart drawer 440px, filter 420px, search 440px, size guide 720px;
- no interactive target below 36px (query all `a`, `button`, `input`, `select` and measure the
  clickable box).

**Interaction checklist.**

| Flow          | Checks                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| Announcement  | rotates after 3s, pauses on hover/focus, pauses on hidden tab, 4px swap             |
| Header        | sticks, collapses after 24px, no layout jump, compact wordmark fades                |
| Mega menu     | hover, focus-visible, click, Escape, focus return, no click-toggle bug              |
| Mobile menu   | below header, nested open/close, bottom row, focus trap, Escape                     |
| Search        | Cmd/Ctrl+K, focus input, predictive results, groups, clear, arrows, no results      |
| Contact       | rows/links, close, focus return                                                     |
| Cart          | add, optimistic line, quantity, remove, progress, checkout URL, empty               |
| Filters       | open, facets, price, apply, clear all, sticky footer, URL state                     |
| Sort          | open, select, URL state, back/forward                                               |
| Infinite load | sentinel, spinner/status, manual fallback, dedupe                                   |
| PDP           | swatches, sizes, sold-out disabled, quantity, add, buy now, tabs arrows, size guide |
| Newsletter    | 5s, submit state, close, 30-day dismissal                                           |
| Wishlist      | save/remove, persisted, hover/focus reveal                                          |

**Motion and accessibility.** Use `browser_emulate_media({ reducedMotion: "reduce" })` and repeat
announcement, header, drawers, rail and gallery. Use keyboard-only traversal for every overlay and
tab set. Check `aria-modal`, `role="progressbar"`, live regions and visible focus. Check the console
for React warnings; the `compact` warning must disappear.

**Performance.** Confirm one LCP preload per breakpoint, lazy images below the fold, no layout shift,
and no new `sizes` warnings beyond the accepted `100vw` policy.

## 7. Decisions and open questions

1. **Live drift.** The current live site uses 18px 2-up labels, 13px 3-up labels, 0 editorial gaps,
   2:3 mobile editorial images, 2:3 product cards (not 3:4), an 18/23 rail heading (not 16px) and a
   64px PDP info top (not 24px); the 4 November capture recorded the older values. Adopt the current
   live values for those specifics, because the user asked to follow the reference storefront system, and
   record the change in `reference/DESIGN.md`.
2. **Desktop breakpoint.** Adopt 1100px, not Tailwind `xl`. This changes the 768–1279px experience and
   is the largest visible layout correction.
3. **Mobile wordmark.** Adopt 170px rather than the live 210px so four 36px utility targets fit at
   390px. Record as an accessibility decision.
4. **Mobile menu placement.** Adopt the reference under-header panel. If the full-screen treatment is
   preferred, keep it but document the deviation and provide a close control that does not duplicate
   the wordmark.
5. **Drawer duration.** Adopt 300ms for all drawers/dialogs. If cart fidelity matters more, use a
   named `--motion-drawer-slow: 500ms` exception for the cart only; do not mix anonymous durations.
6. **Quick shop.** Wire the existing `QuickShop` component into the card hover/focus action rather
   than writing a second implementation.
7. **Currency and grid density.** The store is INR and the storefront shows INR only; the earlier
   display-only USD/INR selector was removed. The reference exposes 55 currencies and notes that a
   non-INR display is approximate and charged in INR at checkout; revisit that pattern only if a
   second display currency becomes a requirement. Grid density is a reference control with no
   storefront behaviour yet. Do not present display conversion as Shopify Markets.
8. **Content migration.** The content migration commit moved the editorial pages and journal to Shopify. Remaining
   content may still move; do not couple the design system to local route files. The shell and
   commerce components are the priority.

## 8. Current exceptions and residual risks

1. **Newsletter width.** The system specifies a 448px modal; the live reference now renders 720px on
   desktop. The clone keeps 448px so the modal stays a narrow interruption.
2. **Immediate filters.** The filter drawer has the sticky header and Clear all/Apply footer, but
   facets still apply immediately rather than as a draft. A draft needs a separate browse-state
   model; styling does not fix it.
3. **Rail drag.** The product rail supports arrows, keyboard arrows and smooth scrolling, not pointer
   drag. Native overflow remains the fallback.
4. **Size-guide content.** The drawer now reuses the shared size-guide component: category tabs,
   find-my-size, conversion table and measurement diagram. Keep it aligned with the Shopify
   size-guide page when that copy changes.
5. **Reference drift.** The live PDP uses normal title tracking and a 16px mobile collection title;
   the clone keeps the system's 0.05em tracking and 18/23 collection title.
6. **Runtime surfaces.** Home, collection, PDP, the search dialog's focus/ARIA, mega menu, mobile
   menu, cart drawer, filter drawer and newsletter are covered by Playwright. Search results and
   empty state, the contact drawer, lightbox, quick shop, gift card, bundles, selling plans, the
   discount form, wishlist, account, Shop Agent, blog, policies, error pages, currency conversion
   and free-shipping copy are on-system but not part of the automated flow suite. Tablet widths,
   visual screenshots, focus traps and computed radius/shadow are also unasserted.
7. **Screen reader.** Automated ARIA, focus, tab-key, target and reduced-motion checks pass; a
   screen-reader pass remains manual.
8. **Checkout.** Shopify-hosted and out of scope.
9. **Currency.** The store and storefront are INR-only; the former display-only USD selector and
   fixed-rate conversion were removed. Checkout and Shopify's recorded totals are INR. Catalog
   prices are interim ×100 values until the source INR catalog is re-applied.

## 9. Verification status

| Check                         | Result                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Live reference measurements   | Complete at 1440 and 390; written by `pnpm audit:reference`                               |
| Local clone measurements      | Complete at 1440 and 390; written by `pnpm audit:reference`                               |
| Interactive Playwright checks | Home, mega menu, mobile menu, search-dialog focus/ARIA, cart add, filter, newsletter, PDP |
| `pnpm typecheck`              | Passes                                                                                    |
| `pnpm lint`                   | Passes, including the static design check                                                 |
| `pnpm test:design`            | 16 tests pass                                                                             |
| `pnpm build`                  | Passes                                                                                    |
| Reduced-motion pass           | Playwright assertion for announcement and authored transitions                            |
| Screen-reader pass            | Not run; findings are static and Playwright-derived                                       |
| Checkout completion           | Not exercised; Shopify-hosted and out of scope                                            |
