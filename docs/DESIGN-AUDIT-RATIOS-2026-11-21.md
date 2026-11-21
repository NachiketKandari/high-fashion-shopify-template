# Design audit — ratios and contracts — 21 November 2026

Focused read-only re-audit of the storefront against the documented ratios, tokens, target sizes,
semantics, and actual breakage. This report does not replace or modify
`docs/DESIGN-AUDIT-2026-11-21.md`; it applies the ratio-first lens to the same commit. No source,
test, config, dependency, or lockfile was edited. Evidence screenshots are under `.playwright-mcp/`
with the `design-audit-ratios-*` prefix.

## Environment and scope

| Item      | Value                                                                                                                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commit    | `c80b802e20e8449d795589ff48496f58a678c170`                                                                                                                                                                                               |
| Worktree  | Pre-existing untracked audit/skill/opencode files only; no source changes from this audit                                                                                                                                                |
| Runtime   | macOS (darwin), Next.js 16.4.6, React 19.3.1, Tailwind CSS 4.3.3, Playwright 1.64.1                                                                                                                                                      |
| Server    | No process was listening on `:3000` at audit start. A `pnpm dev` was started; when the background wrapper's five-minute limit ended that process, one replacement was started and reused. Only one server listened on `:3000` at a time. |
| Browser   | Playwright MCP, Chromium, headless                                                                                                                                                                                                       |
| Viewports | 1440 × 1000, 768 × 1024, 390 × 844                                                                                                                                                                                                       |
| Commands  | `git status --short`, `git rev-parse HEAD`, `pnpm lint`, `pnpm typecheck`, `pnpm test:design`                                                                                                                                            |
| Evidence  | `getComputedStyle`, `getBoundingClientRect`, DOM/ARIA inspection, screenshots                                                                                                                                                            |

Routes rendered: `/` at all three viewports; `/collections/womenswear` default, filtered sort and
density states at all three viewports; `/products/micro-pleated-shorts` and
`/products/big-collar-laced-shirt` at 1440, 768 and 390; the cart drawer at 1440 and 390; `/cart`
filled and empty; `/search` empty at 1440 and 390; `/search?q=corset` at 390; `/login` with its
validation error; `/pages/wishlist` empty; `/policies/refund-policy`; the filter sheet at 1440 and
390; the size-guide sheet at 1440; the newsletter modal at 1440; the desktop menu panel at 1440; and
the mobile menu at 390.

## Health summary

The ratio layer is largely on-contract. Browse media is 3:4 below 1100px and 4:5 at desktop; the PDP
gallery is 2:3 on the carousel, 800:1432 for the desktop hero and 3:4 for its tiles; the PDP split is
800/592 with a 432px content column; the collection grid is 4/3/2 columns with the documented 120px
desktop row gap; and the cart, filter, size-guide and newsletter overlays all match their 440/420/
592/448px tokens with `shadow-modal` and 300ms `--ease-standard`. Six Major and eight Minor findings
survive the ratio-first lens. The systemic ones are the closed wishlist loop (the nav link exists but
no rendered browse card can populate it), prose that still renders Tailwind Typography's uppercase/
300-weight/tracked palette instead of the type roles, and a 36px hit-area contract that the shell,
search, search-result cards and cart controls still break. The audit run observed one failure on the
search-result title targets (15/16), but a clean re-run of the isolated target test and the full
suite both pass 16/16, so the target sweep is data-dependent. The 18px search-result title links are
still present when results render; the gate simply does not catch them on every catalogue state.
There is no Critical finding; the shopper can still browse, choose a size, add to the cart and reach
checkout.

## Ratio matrix

Measured at 1440 × 1000, 768 × 1024 and 390 × 844.

| Contract                   | Documented value                                     | Measured                                                                                | Verdict                   |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| Browse card media          | 3:4 mobile, 4:5 desktop (PLP spec)                   | 390: 195 × 260 (3:4); 768: 256 × 341.33 (3:4); 1440: 360 × 450 (4:5)                    | Pass                      |
| Browse grid columns        | 4 desktop / 3 tablet / 2 mobile                      | 1440: 4 × 360; 768: 3 × 256; 390: 2 × 195                                               | Pass                      |
| Browse grid gaps           | no column gap; 120px row gap desktop (Design I PLP)  | 1440: column 0, row 120; 768: column 0, row 0; 390: column 0, row 0                     | Pass                      |
| PDP gallery, desktop       | 800 × 1432 hero, 3:4 tiles                           | Hero 800 × 1432 at x24; tiles 400 × 533.33                                              | Pass                      |
| PDP gallery, mobile/tablet | 2:3 carousel                                         | 390: 390 × 585; 768: 768 × 1152                                                         | Pass                      |
| PDP split                  | 800 / 592 inside the 24px gutter                     | 800 / 592; info column 432 at x904; title y140; CTA y422                                | Pass                      |
| Type scale / line height   | `design/tokens.manifest.json` roles                  | All sampled `type-*` roles match size/line/weight/tracking; prose is the exception      | Pass except Major 2       |
| Card / button proportions  | browse card 360 wide at 1440; CTA 432 × 48 selected  | Card 360 × 530 (media 360 × 450, caption 80); CTA 432 × 48; 390 CTA 342 × 48            | Pass                      |
| Drawer / modal geometry    | cart 440, filter 420, size guide 592, newsletter 448 | 1440: 440, 420, 592, 448 × 246; 390: cart/filter full width                             | Pass                      |
| Modal elevation / motion   | `shadow-modal`, 300ms `--ease-standard`              | All four overlays: `shadow-modal`, 0.3s `cubic-bezier(0.2, 0.6, 0.2, 1)`                | Pass                      |
| Control hit areas          | 36px minimum                                         | Header/nav/footer/tabs/filter/size guide meet it; menu/search/cart rows do not          | Fail in Major 3 / Minor 7 |
| Header and gutter          | 74px desktop, 56px mobile/tablet, 24px gutter        | 74 at 1440; 56 at 768/390; 24px inset on collection, PDP and footer                     | Pass                      |
| Page overflow              | `scrollWidth === innerWidth`                         | Equal on every rendered route/viewport; only the clipped title link overflows (Major 6) | Pass except Major 6       |

## Measured findings by severity

### Critical

None. No shopper task is blocked and no supported viewport breaks at page level.

### Major

**1. The wishlist loop is closed: the nav link exists, but no rendered browse card can add to it.**

`components/product-card/product-card.tsx:145` renders `WishlistButton` and `QuickShop` only when
`showActions && !isBrowse`; `components/collections/browse.tsx:54-59` passes `variant="browse"`,
`components/home/product-row.tsx:76-127` renders its own action-free `HomeProductCard`,
`app/(storefront)/search/page.tsx:133-137,165-171` passes `showActions={false}`, and
`components/product/related-products-section.tsx:39-46` does the same. Rendered results: the desktop
Wishlist link is present at 1440 (63.69 × 36), and the mobile header correctly hides it
(`display: none` at 390); browse cards contain **0 buttons** before and after hover; home cards
contain **0**; search-result cards contain **0**. The only component that would render the action
group is `components/wishlist/content.tsx:30`, and its empty state says “Save pieces with the
bookmark on any product card” (`content.tsx:15`) — a promise no reachable card fulfils. Quick shop is
therefore also only reachable through an unpopulatable wishlist. This is a behaviour/integration gap,
not a pixel issue. Fix: render the action group on the Design I browse/home/search/related cards, or
remove the wishlist promise and the header link. Owner: Product presentation
(`components/product-card/`, `components/collections/browse.tsx`, `components/home/product-row.tsx`).

Screens: `design-audit-ratios-product-card-hover-1440.png`,
`design-audit-ratios-wishlist-390.png`, `design-audit-ratios-search-results-390.png`.

**2. Prose still renders Tailwind Typography's palette instead of the type roles.**

`components/ui/prose.tsx:8` applies `prose-sm prose-neutral`, `prose-headings:uppercase`,
`prose-headings:tracking-[0.05em]`, `prose-p:font-light`, `prose-li:font-light`,
`prose-p:tracking-[0.05em]` and `prose-li:tracking-[0.05em]`. Measured on
`/policies/refund-policy` at 1440: H2 is **18/23, weight 400, uppercase, tracking 0.9px**, colour
`lab(7.782 0 0)` (not `--ink` `#353535` and not `--ink-muted` `#666666`); body paragraphs are
**14/21, weight 300, tracking 0.7px**, colour `#666`. The contract is `type-h2` 18/23 400 with zero
tracking and sentence case, and `type-body` 14/21 **400** with zero tracking. This is the same
regression recorded on 8 November and re-reported in the full audit; it is still present. Fix: map
prose headings to `type-h2`/`type-h3`/`type-h4`, body to `type-body`, use `text-ink`/`text-ink-muted`
and zero tracking, and add a regression contract. Owner: `components/ui/prose.tsx`.

Screens: `design-audit-ratios-prose-1440.png`, `design-audit-ratios-policy-1440.png`.

**3. The 36px hit-area contract fails in the menus, search rows and search-result card titles; the
target sweep is data-dependent.**

`components/nav/mobile-menu.tsx:22` and `components/nav/desktop-nav.tsx:20` define panel links as
`type-h4 focus-ring flex` with no minimum height. Measured at 390: **342 × 18px** for each of the 11
collection links and four utility links; at 1440 the panel links are **306.5 × 18px**.
`components/search/search-explorer.tsx:123,165,180,199` renders trending, suggestion and “see all”
rows as `type-h3 … flex` with no minimum height: **310 × 21px at 390**, **1360 × 21px at 1440**;
live suggestions measured **310 × 21px**. `components/product-card/product-card.tsx:207-208` renders
the compact/search caption link as `inline-flex` with no `min-h-9`; search-result titles measure
**176.19 × 18px** and **186.16 × 18px** at 390. This is the failure mode the target sweep can hit:
the audit run failed `tests/design/contracts.spec.ts:165` on `/search?q=corset` at 390 with two 18px
links, while a clean re-run of the isolated test and the full suite both passed 16/16. The 18px
links are still measured directly, so the gate is data-dependent. The fix is a row/link primitive
with `min-h-9` (or 44px on touch) and padding, keeping the type roles unchanged — not a type-size
change. Owner: Shell/search presentation, with the primitive in `components/ui/`.

Screens: `design-audit-ratios-mobile-menu-390.png`,
`design-audit-ratios-desktop-menu-1440.png`, `design-audit-ratios-search-empty-390.png`,
`design-audit-ratios-search-results-390.png`.

**4. The search combobox has no accessible name on either search surface.**

`components/search/search-explorer.tsx:114-134` renders `#search-input` and the drawer input as
`role="combobox"` with `placeholder="Search"` and no `<label>`, `aria-label`, or
`aria-labelledby`. Measured on the header dialog and on `/search`: `aria-label=null`,
`aria-labelledby=null`; `aria-expanded` and `aria-controls` are wired correctly. The visible submit
button does not name the field. Fix: add a visually hidden `<label>` or `aria-label="Search
products"`. Owner: Search primitive (`components/search/search-explorer.tsx`).

Screens: `design-audit-ratios-search-1440.png`,
`design-audit-ratios-search-empty-390.png`.

**5. Four Get the Look image links have no accessible name.**

`app/(storefront)/page.tsx:186-192` renders four `LOOK_TILES` through `MediaTile`, and
`components/home/media-tile.tsx:26-36` emits an empty-alt image and no visible label. At 390 each
link measures **267.53 × 401.3px** with `aria-label`, text content and image alt all empty. The
links are real, focusable navigation targets with no name. Fix: give each tile a collection label,
visually or via `aria-label`, or remove the link wrapper. Owner: Home presentation
(`components/home/media-tile.tsx` / `app/(storefront)/page.tsx`).

Screen: `design-audit-ratios-home-390.png`.

**6. Long product titles still clip and overflow at 390.**

The browse/compact/row/stack captions put `truncate` on the `<h3>`, but the actual link is
`inline-flex` (`components/product-card/product-card.tsx:180, 208, 223, 238`). At 390 the second
womenswear card has a **147px-wide** `<h3>` with `scrollWidth 198` and `overflow: hidden`, while its
link measures **189.7 × 36px**, ending at **408.7px** on a 390px viewport. The visible title is cut
without a real ellipsis (“Rouched Baby Tee Sle…”), and the link hit area extends past the card.
Search results reproduce it: the second result has an `<h3>` with `clientWidth 171` and
`scrollWidth 194`, and its link ends at **393.66px** on 390. At 768 the same title fits (h3 208px,
link 189.7px), so this is a 390 break, not a preferred width. Fix: make the title link `block w-full
min-w-0` (or let the `<h3>` clip the link), so `text-overflow: ellipsis` applies to the link itself.
Owner: Product card.

Screens: `design-audit-ratios-collection-390.png`,
`design-audit-ratios-search-results-390.png`.

### Minor

**1. `/search` has no H1.** `app/(storefront)/search/page.tsx:68-80,98-108` renders the explorer and
trending list with zero headings when `q` is empty; measured `h1s: []` at 1440 and 390. Add a page H1
(“Search”) and keep the query-results H1. Owner: Search route. Screen:
`design-audit-ratios-search-empty-390.png`.

**2. Home heading order skips H2 on desktop.** At 1440 the only H1 is the sr-only hero title, then
the next visible headings are four H3 product titles; the “Get the Look” and “Exclusives” H2s are in
mobile-only sections and measure 0 × 0. Add section H2s (visually hidden if needed) to New arrivals,
category and Get the Look sections. Owner: Home presentation. Screen:
`design-audit-ratios-home-1440.png`.

**3. Raw palette and a tuned `sizes` bypass the token and image contracts.**
`components/ui/sheet.tsx:28` (`bg-black/30`), `components/ui/dialog.tsx:25` (`bg-black/50`),
`components/nav/desktop-nav.tsx:90` (`bg-black/20`), `app/(storefront)/page.tsx:91`
(`bg-neutral-200`) and `:209` (`bg-black/25`) use the default Tailwind palette;
`components/nav/desktop-nav.tsx:175` sets `sizes="(min-width: 1100px) 355px, 100vw"` while the
repository requires `sizes="100vw"`. The out-of-stock `bg-black/55` overlay is a documented exception
and is excluded. Fix: add a scrim token (or use `bg-ink-strong/50`) and restore `sizes="100vw"`.
Owner: UI primitives / nav. Screens: `design-audit-ratios-home-1440.png`,
`design-audit-ratios-desktop-menu-1440.png`.

**4. Role and motion utilities drift from the token layer.** `text-xs` appears in
`components/collections/collection-browse-provider.tsx:89` and `components/collections/filters-client.tsx:320`;
`leading-6` in `components/account/page-header.tsx:6`; `duration-200` in
`components/collections/filters-client.tsx:266`. Header/footer/panel links use bare
`transition-colors` (`components/nav/nav-chip.ts:2,5`, `components/footer/index.tsx:22`,
`components/account/sidebar-client.tsx:23`); measured on the rendered header utilities and footer
links: **0.15s `cubic-bezier(0.4, 0, 0.2, 1)`**, the Tailwind default, instead of `--motion-base`
300ms with `--ease-standard`. Fix: use the role utilities and the motion tokens. Owner: Next.js
presentation.

**5. Focus indicators are inconsistent.** Header/nav/filter/product links compute a 2px solid ink
outline with 2px offset. The wordmark (`components/brand/wordmark.tsx:19,23-31,35`) and the custom
cart close (`components/cart/overlay.tsx:45-51`) fall back to the browser’s **1px `auto` blue**
outline; the desktop/mobile panel containers receive programmatic focus with `outline-none`
(`components/nav/desktop-nav.tsx:96`, `components/nav/mobile-menu.tsx:83`) and measure
`outline: none 3px` while focused. Fix: apply `focus-ring` to the wordmark and cart close, and move
focus to the first link or close control rather than the outline-less panel. Owner: Shell primitives.
Screen: `design-audit-ratios-desktop-menu-1440.png`.

**6. Search result changes are not announced.** `components/search/search-explorer.tsx` has no
`aria-live` region for the result count, suggestions or “see all results”; measured live regions in
the header search dialog and on `/search` were **none**. Add a polite status node updated with the
suggestion/result count. Owner: Search.

**7. Cart controls fall below the 36px target.** `components/cart/line-item.tsx:208` renders the
quantity input at **32 × 36px** on the cart and drawer; `components/cart/sign-in.tsx:9` renders
“SIGN IN” at **34.84 × 13px**; `components/product-card/product-card.tsx:163` explicitly removes
the 36px minimum at desktop for cart recommendation titles, measured at **138.11 × 18px**; and
`components/cart/summary.tsx:51-55` renders the standalone “need help? contact us” link at
**125.92 × 16px**. Fix: widen/pad the quantity field and give the text links a 36px hit area via a row
primitive; keep the type roles unchanged. Owner: Cart presentation. Screens:
`design-audit-ratios-cart-1440.png`, `design-audit-ratios-cart-drawer-1440.png`.

**8. The login error overlaps the email field and does not receive focus.** On invalid submit,
`components/auth/login-gate.tsx:63-89` keeps `aria-invalid="true"` but the border stays ink, renders
the message at `absolute top-4 right-0` inside the field, and leaves focus on Proceed. Measured:
input **431 × 49** at x80–511; alert **154.13 × 16** at x356.88–511, y277–293 — inside the input
bounds (`overlap: true`); focus remains `BUTTON` “Proceed”; alert colour is `rgb(53, 53, 53)` and
the invalid border is `rgb(0, 0, 0)` instead of `text-error` / `border-error-rule`. Fix: place the
message below the field, move focus to the invalid input, and use the error tokens. Owner: Auth form.
Screen: `design-audit-ratios-login-error-1440.png`.

### Reframed, not counted: canonical document drift

`docs/DESIGN-SYSTEM.md` still specifies ink `#000`, muted `#4d4d4d`, rule `#e1e1e1`, 9px labels,
300/400 weights, 20/30px gutters, 110/76px headers, 3px column gaps, 20/24px row gaps, a 5s
newsletter and a 50/50 PDP with a 408px info column. The current manifest and `app/globals.css` use
ink `#353535`, muted `#666`, rule `#dcdcdc`, 12px labels, 400–700 weights, a 24px gutter at both
breakpoints, 74/56px headers, 120px desktop row gaps, a 20s newsletter and an 800/592/432 PDP. This
is a contract-source governance problem, not a rendered ratio violation; it is reframed here and not
counted in the 6/8 totals. Owner: design-system documentation.

## Keep / Reframe / Drop

The 19 findings from `docs/DESIGN-AUDIT-2026-11-21.md` under the ratio-first lens.

| #   | Original finding (short)                                    | Decision | Ratio-first treatment                                                                                                                                  |
| --- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M1  | Product cards expose no wishlist or quick shop              | Keep     | Behaviour/integration gap; Major 1. Desktop nav link and mobile hiding pass; the card action contract fails.                                           |
| M2  | Prose reverted to Tailwind Typography defaults              | Keep     | Type-system drift: case, weight, tracking and colour; Major 2.                                                                                         |
| M3  | Menu/search rows 18–21px below 36px                         | Keep     | Hit-area contract, not type size; Major 3. Now also covers search-result card titles; the target sweep catches them only when the live results render. |
| M4  | Search combobox has no accessible name                      | Keep     | Accessible-name semantics; Major 4.                                                                                                                    |
| M5  | Four Get the Look links have no accessible name             | Keep     | Accessible-name semantics; Major 5.                                                                                                                    |
| M6  | Long product names clip and the title link overflows        | Keep     | Actual clipping/overflow at 390; Major 6.                                                                                                              |
| M7  | `DESIGN-SYSTEM.md` contradicts the Design I token source    | Reframe  | Contract-source documentation drift, not a rendered ratio finding; recorded as a reframe, not counted.                                                 |
| m1  | `/search` has no H1                                         | Keep     | Heading semantics; Minor 1.                                                                                                                            |
| m2  | Home heading order skips H2                                 | Keep     | Heading semantics; Minor 2.                                                                                                                            |
| m3  | Raw palette and tuned `sizes`                               | Keep     | Token/image contract; Minor 3. Excludes the documented `bg-black/55` out-of-stock scrim.                                                               |
| m4  | Role and motion utilities drift                             | Keep     | Token/motion contract; Minor 4; measured 0.15s default easing.                                                                                         |
| m5  | Focus indicators are inconsistent                           | Keep     | Focus-visible contract; Minor 5.                                                                                                                       |
| m6  | Search result changes are not announced                     | Keep     | Live-region semantics; Minor 6.                                                                                                                        |
| m7  | Cart quantity and sign-in controls below 36px               | Keep     | Hit-area contract; Minor 7; extended with cart recommendation title and help link.                                                                     |
| m8  | Login error overlays the email field and does not get focus | Keep     | Overlap plus focus/error-token semantics; Minor 8.                                                                                                     |
| m9  | Source copy is not consistently sentence case               | Drop     | Copy casing is a product-copy decision; the rendered case/weight/tracking/colour issue is already Major 2.                                             |
| n1  | Hero copy typo                                              | Drop     | Copy typo, not a ratio/token/target/semantics/breakage finding.                                                                                        |
| n2  | Bag vs cart terminology                                     | Drop     | Copy consistency preference; not a ratio or accessibility contract.                                                                                    |
| n3  | Footer columns fixed at 80px                                | Drop     | Explicitly judged preference; the wraps are not a documented ratio break. Footer links themselves measure 36px high.                                   |

Counts: **14 Keep (6 Major, 8 Minor), 1 Reframe, 4 Drop.**

## Verified passes

- `pnpm lint` passed: oxlint 0 warnings/0 errors, formatting clean, design drift gate across 195
  files.
- `pnpm typecheck` passed (`next typegen && tsc --noEmit`).
- `pnpm test:design` ran 16 tests: the audit run passed 15 and failed 1 on the 36px target sweep at
  `/search?q=corset` 390, reporting two search-result title links at 18px. A clean re-run of the
  isolated test and the full suite both passed 16/16, so the target sweep is data-dependent. The
  18px links remain measured directly. All other contracts passed, including search-dialog focus,
  reduced motion, collection containment, PDP gallery/targets, mega/mobile menu Escape, the 440px
  cart drawer, the filter drawer and the newsletter dismissal.
- No page-level horizontal overflow (`scrollWidth === innerWidth`) on every rendered route at 1440,
  768 and 390. The only overflow is the title link inside the clipped `<h3>` (Major 6).
- Header geometry: **74px** at 1440, **56px** at 768/390; **24px** gutter at every viewport.
- Type roles match the manifest: nav **14/21 700** uppercase `-0.154px`; tab-active **14/18 700**;
  caption **14/18 400**; body-sm/label **12/16 400**; h2 **18/23 400**; meta-semibold **12/16 600**;
  control **12/16 500**; price **14/18 600** tabular; display-lg **36/54 400**. Prose is the
  documented exception (Major 2).
- Collection: 4 × 360 at 1440 with a 120px row gap; 3 × 256 at 768; 2 × 195 at 390; media 360 × 450
  (4:5), 256 × 341.33 (3:4), 195 × 260 (3:4); title 14/18 400; price 12/16 400; title link 36px high
  on browse cards. Sort writes `?sort_by=price-ascending`, renders 36px sort/clear chips and keeps
  the grid mounted.
- PDP at 1440: split 800/592, gallery 800 × 1433 at x24, hero 800 × 1432, tiles 400 × 533.33 (3:4),
  buy content 432 at x904/y140, title 12/16 600, price 14/18 600 tabular, size chips 44px, CTA
  432 × 48 radius 4, help link 36px. At 390: carousel 390 × 585 (2:3), CTA 342 × 48, chips 36px,
  size guide 36px, no page overflow. At 768: carousel 768 × 1152 (2:3), CTA 432 × 48.
- Cart drawer: 440px at 1440 and full width at 390, radius 0, `shadow-modal`, 300ms
  `cubic-bezier(0.2, 0.6, 0.2, 1)`, title 16/21 500, line image 123 × 191, checkout 341 × 40 at 390.
- Filter sheet: 420px at 1440, full width at 390, `shadow-modal`, 300ms; every visible control ≥36px;
  no small targets. Size-guide sheet: 592px at 1440, `shadow-modal`, 300ms, no small targets, two
  labelled focusable table regions. Newsletter: 448 × 246, radius 0, `shadow-modal`, 300ms, email
  306 × 36, Subscribe 63.89 × 36, no small targets.
- Footer: 417px at 1440 and 680px at 390; links 80 × 36 with 24px inset; no small targets.
- Wishlist nav contract: desktop Wishlist link 63.69 × 36 at 1440; mobile link `display: none` at 390.
- Empty cart: H2 **22/29 400**; no page overflow. Empty wishlist renders its H2 and empty-state copy
  once the previous audit's localStorage fixture is cleared.
- Reduced motion: `prefers-reduced-motion: reduce` sets the marquee to `animation-name: none`, the
  product-card image transition to `1e-05s`, and `scroll-behavior: auto`.
- Focus: header nav/utility, collection tabs, product links and footer links measure a **2px solid
  ink outline with 2px offset**. Escape returns focus in the tested overlays.
- Console: no product-origin error or failed request on the rendered routes; the expected Next.js
  `sizes="100vw"` warnings dominate. The wishlist route error seen at the start was caused by a
  previous audit's localStorage fixture (`gid://shopify/Product/999999` with an already-optimised
  image URL) and disappeared after clearing `wishlist`; it is not a storefront defect.

## Design-system drift vs product decisions vs defects

**Deliberate product decisions (not defects).** Design I is the current system: 24px gutter, 74/56px
headers, 4px control radius with zero-radius surfaces, 400–700 type weights, 3:4/4:5 browse media,
5:9 home media, 2:3 gallery, 120px desktop browse row gap with no column gap and no mobile/tablet
gutter, full-screen search, the 709px left menu panel, 440/420/592/448 overlays, INR-only prices,
`sizes="100vw"` on every image, no dark mode, no next-intl, and the documented out-of-stock 55%
scrim. The stale `DESIGN-SYSTEM.md` values (20/30px gutter, 3px column gap, 20/24px row gap, 50/50
PDP) are not used as the source of truth.

**Defects.** The wishlist loop, prose overrides, under-sized text rows and cart controls, unlabelled
search and Get the Look links, long-title clipping, the login overlap, the default-palette scrims,
the 150ms default easing and the inconsistent focus treatment are implementation/integration defects,
not Design I decisions.

**Governance.** `docs/DESIGN-SYSTEM.md` remains the nominal canonical document but describes the
retired system. The ratio-first report records this as a reframe, not a visual defect. The audit
run's target-sweep failure also shows the gate is data-dependent: it catches search-result card
titles only when the live results render them, and still does not open the menus or cover the
empty-search rows.

## Three highest-leverage next fixes

1. **Restore the product-card action surface and its title truncation model.**
   Owner: Product presentation (`components/product-card/product-card.tsx`,
   `components/collections/browse.tsx`, `components/home/product-row.tsx`). Render the wishlist and
   quick-shop group on the Design I browse/home/search/related cards (or remove the wishlist promise
   and header link), and make the title link fill the caption (`block w-full min-w-0`) so `truncate`
   produces a real ellipsis. This closes the wishlist loop and the only measured long-content layout
   break in one owner.

2. **Replace the prose overrides with the type roles.**
   Owner: `components/ui/prose.tsx`. Map prose headings to `type-h2`/`type-h3`/`type-h4`, body to
   `type-body`, use `text-ink`/`text-ink-muted`, and remove the `0.05em` tracking and
   `font-light`. This removes the largest type-system drift on every policy, CMS page and Journal
   article without touching commerce data.

3. **Introduce a shared 36px text-row / compact-card link primitive.**
   Owner: Shell/search/cart presentation, with the primitive in `components/ui/`. Move the mobile and
   desktop menu links, search trending/suggestion rows, search-result card titles, cart quantity/
   sign-in/recommendation/help links onto the row primitive, using `min-h-9` (44px on touch) and
   padding while keeping the type roles. This closes the target regression, the data-dependent
   target-sweep failure and the cart control findings without enlarging type.

## Not verified

- Authenticated `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses` and
  `/account/profile`; Customer Account OAuth requires HTTPS and credentials. `/account` was only
  checked as a redirect to `/login` in the previous audit.
- The quick-shop dialog. The action is unreachable from every rendered card; the dialog's 768 × 385
  geometry from the previous audit was not re-rendered after the action surface changed.
- The related-products rail. `showActions={false}` is present in
  `components/product/related-products-section.tsx`, but none of the four PDPs tested rendered a
  related rail in the current catalogue, so the rendered suppression is code-verified only.
- PDP sold-out, low-stock and Notify me states; the live catalogue returned no sold-out sizes on the
  tested products.
- Checkout, payment, order placement, discount validation, gift cards, bundles and selling plans.
- The global error boundary and `global-error`; the only error state exercised was login validation.
- Disabled and loading states were source-inspected; a slow render was not frozen to measure a
  skeleton, and no live disabled CTA was available on the tested PDP.
- Real touch hardware and `pointer: coarse`; Chromium viewport emulation was used.
- Cross-browser behavior (Chromium only).
- axe was not rerun in this focused pass. Accessible-name and heading findings are DOM-measured, not
  axe-derived.
