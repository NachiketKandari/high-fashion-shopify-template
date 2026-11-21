# Design audit — 21 November 2026

Read-only audit of the storefront at `c80b802e20e8449d795589ff48496f58a678c170`. No source, test,
config, dependency or lockfile was changed. The only files written are this report and the evidence
captures under `.playwright-mcp/`.

## Environment and scope

| Item                | Value                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Commit              | `c80b802e20e8449d795589ff48496f58a678c170` (`fix: set the pdp title, price and recommend header in design i weights`)              |
| Working tree        | Clean except the untracked `.agents/skills/design-audit/`, `.agents/skills/frontend-code-audit/`, `.opencode/` and `opencode.json` |
| Runtime             | macOS (darwin), Node 26.13.0, Next 16.4.6, React 19.3.1, Tailwind CSS 4.3.3, Playwright 1.64.1                                     |
| Server              | Reused the running dev server at `http://localhost:3000`; no second server was started                                             |
| Browser             | Playwright MCP, Chromium, 1440 × 1000, 768 × 1024 and 390 × 844                                                                    |
| Commands            | `git status --short`, `git rev-parse HEAD`, `pnpm lint`, `pnpm typecheck`, `pnpm test:design`                                      |
| Accessibility probe | `axe-core@4.14.0` injected manually from unpkg in the browser; no dependency or test file added                                    |

Routes rendered: `/`, `/collections`, `/collections/womenswear`, `/collections/all`, the collection
filter and sort states, `/products/big-collar-laced-shirt` (desktop, tablet and mobile, default and
selected-size states), the size guide sheet, quick shop, `/cart` (empty, filled and drawer),
`/search`, `/search?q=corset`, a nonsense search query, `/pages/wishlist`, `/blogs/journal-2`,
`/blogs/journal-2/guide-to-bombay-after-dark`, `/pages/size-guide`, `/pages/contact-us`,
`/pages/about-us`, `/policies/refund-policy`, `/policies/privacy-policy`, `/login`, `/account`
(redirect) and a 404. The home page was audited with its product row, category tiles, Get the Look
rail, Exclusives band and footer.

## Health summary

The Design I token layer and the primary purchase geometry are largely on-system: lint, typecheck and
all 16 design contracts pass, and the home, collection, PDP, cart drawer, filter sheet, size guide,
search surface and newsletter modal all use the registered colour, type, radius, shadow and motion
tokens. However, the Design I migration has left three systemic regressions: every browse card now
suppresses the wishlist and quick-shop controls, the prose surface has reverted to Tailwind
Typography's 300-weight uppercase palette, and text-row targets in the menus and search fell below the
36px contract. Two serious accessibility failures remain (four unlabelled Get the Look links and an
unlabelled search combobox), the product-card title truncation breaks for long names at 390, and the
canonical `DESIGN-SYSTEM.md` still describes the pre-Design-I system. There is no critical failure:
the shopper can still browse, choose a variant, add to the cart and reach checkout.

## Measured findings by severity

### Critical

None. No shopper task was blocked and no supported viewport broke.

### Major

**1. Product cards expose neither wishlist nor quick shop on any browse surface.**

`components/product-card/product-card.tsx:145` renders `WishlistButton` and `QuickShop` only when
`showActions && !isBrowse`, while `components/collections/browse.tsx:54` passes
`variant="browse"`; the home row renders its own `HomeProductCard`, and search, related products and
cart recommendations all pass `showActions={false}`. Measured at 1440 on
`/collections/womenswear`, hovering the first card produced zero visible card buttons. The only
component that still renders the actions is `components/wishlist/content.tsx:28`, whose empty state
says “Save pieces with the bookmark on any product card” (`content.tsx:15`). The result is a closed
loop: the wishlist cannot be populated from any rendered card, and quick shop is only reachable after
manually seeding localStorage. The quick-shop dialog itself works (768 × 385 at 1440; 350 × 732 at
390, `shadow-modal`, 300ms, Escape returns focus), so this is an integration gap, not a broken
dialog. Fix: render the action group on the Design I browse/home cards, or remove the wishlist promise
and the header link. Regression against the “product cards … quick shop” pass in
`docs/DESIGN-SYSTEM-AUDIT.md`.

Screens: `.playwright-mcp/design-audit-product-card-hover-1440.png`,
`.playwright-mcp/design-audit-wishlist-1440.png`, `.playwright-mcp/design-audit-quick-shop-1440.png`.
Owner: Product presentation (`components/product-card/`, `components/collections/browse.tsx`,
`components/home/product-row.tsx`).

**2. Prose has reverted to Tailwind Typography defaults on the prose content surfaces.**

`components/ui/prose.tsx:8` still applies `prose-sm prose-neutral`, `prose-headings:uppercase`,
`prose-headings:tracking-[0.05em]`, `prose-p:font-light` and `prose-li:font-light`. Measured on
`/policies/refund-policy` at 1440: H2 is 18/23 weight 400, uppercase, tracking **0.9px**, colour
`lab(7.782 0 0)` (the plugin’s neutral heading colour, not `--ink`); body paragraphs are 14/21
weight **300** with **0.7px** tracking and `#666` text. Design I is sentence case, 400 body weight,
zero tracking. The same regression affects `/pages/about-us`, every Shopify
page rendered through `RichTextPage`, `/policies/privacy-policy` and Journal articles. The dedicated
contact and size-guide pages use `ContentPage`/`ContentSection`, not `Prose`, and are unaffected. This was fixed on 8 November and is now
regressed; `docs/UI-UX-CONSISTENCY-AUDIT.md` #1/#7 records the previous fix. Fix: map the prose
surface to `type-body`, `type-h2`/`type-h3`/`type-h4`, `text-ink` and zero tracking, and keep a
contract test for it.

Screens: `.playwright-mcp/design-audit-policy-1440.png`,
`.playwright-mcp/design-audit-article-1440.png`, `.playwright-mcp/design-audit-about-page-1440.png`.
Owner: `components/ui/prose.tsx`.

**3. Menu and search text rows are 18–21px high, below the 36px target contract.**

`components/nav/mobile-menu.tsx:22` and `components/nav/desktop-nav.tsx:20` define the panel link as
`type-h4 … flex` with no `min-h`. Measured at 390: the 11 collection links and four utility links
are **342 × 18px** each; at 1440 the mega-menu links are **306.5 × 18px**. `components/search/search-explorer.tsx:198` renders each
trending query as `type-h3 … flex`; measured **1360 × 21px** at 1440 and **310 × 21px** at 390, and
the predictive “see all results” option is also 21px high. The 8 November pass recorded “no
interactive target under 36px” and “mobile menu … 38px rows”; the menu rows are a regression, and
the search rows were not covered by that pass. The design test sweep misses these rows because it
does not open the menus or the empty search state. Fix: give the
row primitive `min-h-9` (or 44px on touch) and preserve the visual text height with padding.

Screens: `.playwright-mcp/design-audit-mobile-menu-390.png`,
`.playwright-mcp/design-audit-mega-menu-1440.png`,
`.playwright-mcp/design-audit-search-empty-1440.png`. Owner: Shell/search presentation; a shared
36px text-row primitive belongs in `components/ui/`.

**4. The search combobox has no accessible name on either search surface.**

`components/search/search-explorer.tsx:114-134`: `#search-input` and `#search-drawer-input` are
`role="combobox"` inputs with `placeholder="Search"` and no `<label>`, `aria-label` or
`aria-labelledby`. Measured: `aria-label=null`, `aria-labelledby=null` on both the header search
surface and `/search`. The visible submit button does not name the field. Axe with its
placeholder-tolerant label check does not fail this, but the Web Interface Guidelines require a
programmatic label on every form control. Fix: add a visually hidden `<label>` or
`aria-label="Search products"`.

Screens: `.playwright-mcp/design-audit-search-empty-1440.png`,
`.playwright-mcp/design-audit-search-page-390.png`. Owner: Search primitive
(`components/search/search-explorer.tsx`).

**5. Four Get the Look image links have no accessible name.**

`app/(storefront)/page.tsx:64-69` defines four `LOOK_TILES`, and
`components/home/media-tile.tsx:26-35` renders each as a link with an empty-alt image and no visible
label. At 390 the four links measure **267.5 × 401px** each with `alt=""` and no text. axe-core
reports `link-name` (serious) for all four on the home page. Fix: give the tiles a collection label,
either visually or with `aria-label`, or remove the link wrapper. Owner: Home presentation
(`components/home/media-tile.tsx` / `app/(storefront)/page.tsx`).

Screen: `.playwright-mcp/design-audit-home-390.png`.

**6. Long product names are clipped inside the card and the title link overflows the grid.**

The browse/compact/row/stack captions put `truncate` on the `<h3>` but the actual link inside is
`inline-flex` (`components/product-card/product-card.tsx:180, 208, 223, 238`). At 390 the second
PLP card has a 147px-wide `<h3>` with `overflow: hidden`, while its link measures **189.7 × 36px** at
x=219 and ends at **408.7px** on a 390px viewport. The visible title is cut mid-word with no ellipsis
(“Rouched Baby Tee Sle…”), and the link’s hit area extends past the card. The same pattern appears
in search results, wishlist and related rails. Fix: make the title link `block w-full` (or let the
h3 clip the text) so `text-overflow: ellipsis` applies to the link itself. Owner: Product card.

Screens: `.playwright-mcp/design-audit-collection-card2-390.png`,
`.playwright-mcp/design-audit-collection-390.png`.

**7. `DESIGN-SYSTEM.md` contradicts the current Design I token source.**

`docs/DESIGN-SYSTEM.md` still specifies: ink `#000`, muted `#4d4d4d`, rule `#e1e1e1` (§2.1);
300/400 weights with 9px labels (§2.2); 20px/30px gutters (§2.3); zero radius for every surface and
control (§2.4); a 110px masthead and 76px desktop bar with an announcement (§5.1); 3px column gaps
and 20/24px row gaps; 5s newsletter; and a 50/50 PDP with a 408px info column. The actual contract in
`app/globals.css:145-212` and `design/tokens.manifest.json` is ink `#353535`, muted `#666`, a 24px
gutter at both breakpoints, 400–700 weights with 12px meta/label roles, a 4px `--radius-control` and
zero-radius surfaces, 74/56px headers with no announcement, 120px desktop product row gaps, and a
20s newsletter. `docs/reference/design-i/README.md:26` declares Design I canonical and
`docs/DESIGN-I-CHECKOUT-JOURNEY.md:63-73,153-155` explicitly assigns the `DESIGN-SYSTEM.md` update
to the foundation work; it was not done. This is governance drift: an agent or designer following
the canonical document will implement the wrong system. Fix: rewrite `DESIGN-SYSTEM.md` against the
Design I manifest in one pass, or mark it historical and name the Design I docs as the contract.

Owner: Design-system documentation (`docs/DESIGN-SYSTEM.md`, `design/tokens.manifest.json`).

### Minor

1. **`/search` has no H1.** `app/(storefront)/search/page.tsx:68-80,98-108` renders the search
   explorer and trending list with no heading when `q` is empty. axe reports
   `page-has-heading-one` (moderate). Add a page H1 (“Search”) and keep the query results H1.
   Screen: `.playwright-mcp/design-audit-search-page-390.png`. Owner: Search route.

2. **Home heading order skips H2.** On desktop the only H1 is the sr-only hero title, then the first
   headings are H3 product titles; there is no H2 before the New arrivals grid. axe reports
   `heading-order` (moderate) at 1440. The collection grid already solves this with a sr-only
   “Products” H2. Add section H2s (visually hidden if needed) to New arrivals, category and
   Get the Look sections. Screen: `.playwright-mcp/design-audit-home-arrivals-1440.png`.
   Owner: Home presentation.

3. **Raw palette and a tuned `sizes` bypass the token and image contracts.**
   `components/ui/sheet.tsx:28` (`bg-black/30`), `components/ui/dialog.tsx:25` (`bg-black/50`),
   `components/nav/desktop-nav.tsx:90` (`bg-black/20`), `app/(storefront)/page.tsx:91`
   (`bg-neutral-200`) and `:209` (`bg-black/25`) use the default Tailwind palette; the remaining
   gradients use `from-black/*`/`from-paper/*`. `components/nav/desktop-nav.tsx:175` sets
   `sizes="(min-width: 1100px) 355px, 100vw"` while every other image follows the repository’s
   `sizes="100vw"` rule. The out-of-stock `bg-black/55` overlay is documented in the system and is
   not part of this finding. Fix: add a scrim token (or use `bg-ink-strong/50`) and keep `sizes`
   at `100vw`. Screens: `.playwright-mcp/design-audit-home-1440.png`,
   `.playwright-mcp/design-audit-mega-menu-1440.png`. Owner: UI primitives / nav.

4. **Role and motion utilities drift from the token layer.** `text-xs` appears in
   `components/collections/collection-browse-provider.tsx:89` and
   `components/collections/filters-client.tsx:320`; `leading-6` in
   `components/account/page-header.tsx:6`; `duration-200` in
   `components/collections/filters-client.tsx:266`. Header/footer/account links use bare
   `transition-colors`, which computes to **0.15s cubic-bezier(0.4, 0, 0.2, 1)** instead of a
   `--motion-*` duration with `--ease-standard` (`components/nav/nav-chip.ts:2,5`,
   `components/footer/index.tsx:22`, `components/account/sidebar-client.tsx:23`). Fix: use the role
   utilities and the motion tokens. Owner: Next.js presentation.

5. **Focus indicators are inconsistent.** Header/nav/filter/product title links compute a 2px solid
   ink outline with a 2px offset. The wordmark links (`components/brand/wordmark.tsx:23-31,35`) and
   the custom cart close (`components/cart/overlay.tsx:45-51`) fall back to the browser’s 1px
   `auto` outline; the
   mega/mobile panel containers receive programmatic focus with `outline-none`
   (`components/nav/desktop-nav.tsx:96`, `components/nav/mobile-menu.tsx:83`) and measure
   `outline: none` on open. Fix: apply `focus-ring` to the wordmark and cart close, and move focus
   to the first link or close control rather than the outline-less panel. Screen:
   `.playwright-mcp/design-audit-focus-1440.png`. Owner: Shell primitives.

6. **Search result changes are not announced.** `components/search/search-explorer.tsx` has no
   `aria-live` region for the result count or the “see all results” list; the measured live regions
   in the search dialog were none. The design-system search contract asks for a polite result
   announcement. Fix: add a polite status node updated with the suggestions count. Owner: Search.

7. **Cart quantity and sign-in controls are below 36px.** `components/cart/line-item.tsx:208` renders
   the quantity input at **32 × 36px** on cart and drawer, and `components/cart/sign-in.tsx:9`
   renders “SIGN IN” at **34.8 × 13px** in the cart summary. The design test exempts number inputs
   down to 20px wide, so the quantity input passes the gate. Fix: widen the quantity field to 36px
   and give the sign-in link a 36px hit area. Screens:
   `.playwright-mcp/design-audit-cart-filled-390.png`,
   `.playwright-mcp/design-audit-cart-drawer-390.png`. Owner: Cart presentation.

8. **The login error overlays the email field and does not receive focus.** On invalid submit,
   `components/auth/login-gate.tsx:77-90` renders the error absolutely at `top-4 right-0` inside the
   field, while focus stays on Proceed. The error uses ink instead of the error token
   (`aria-invalid` is set on the input but the border stays `ink-strong`). A long email would sit
   under the message. Fix: place the message under the field, move focus to the invalid input, and
   use `text-error`/`border-error-rule`. Screen:
   `.playwright-mcp/design-audit-login-error-1440.png`. Owner: Auth form.

9. **Source copy is not consistently sentence case.** The accordion labels are `description`,
   `details`, `shipping`; the PDP helper is `need help? contact us`; the related-products heading is
   `you may also like`; the discounts and totals labels include `remove`, `quantity` and `TOTAL`.
   The design system says source copy is sentence case even when the type role renders uppercase or
   the design uses lowercase display copy. Fix: normalise the source strings and let the role
   decide case. Screens: `.playwright-mcp/design-audit-pdp-1440.png`,
   `.playwright-mcp/design-audit-home-arrivals-1440.png`. Owner: Next.js presentation.

### Nit

1. **Hero copy typo.** `app/(storefront)/page.tsx:102` renders “Control Your Nurrative” at 390.
   `docs/reference/design-i/README.md:80` lists `CONTROL YOUR NURRATIVE` as a defect in the Figma
   file and says to correct typos in code unless the owner says otherwise. Screen:
   `.playwright-mcp/design-audit-home-390.png`. Owner: Home copy.

2. **Bag vs cart terminology.** The empty cart page says “Your bag is empty”
   (`components/cart/cart-page.tsx:71`) while the drawer says “Your shopping cart is empty”
   (`components/cart/overlay.tsx:80`); the header label is “Bag”. Pick one noun. Screens:
   `.playwright-mcp/design-audit-cart-empty-1440.png`,
   `.playwright-mcp/design-audit-cart-drawer-1440.png`. Owner: Cart copy.

3. **[Judged] Footer columns are fixed at 80px.** `components/footer/index.tsx:16` sets `w-20` on
   each footer column. At 1440 the four 80px columns wrap “Care Instructions”, “Terms & Conditions”
   and “Returns & Exchange” onto two lines with uneven row rhythm. The design system does not give a
   footer column width; this is a judgment call, not a measured contract violation. Widening the
   columns to the space between the wordmark and newsletter would remove the wraps. Screen:
   `.playwright-mcp/design-audit-footer-1440.png`. Owner: Footer.

## Verified passes

- `pnpm lint` passed (`oxlint`, `oxfmt --check`, and the design drift gate across 195 files).
- `pnpm typecheck` passed (`next typegen && tsc --noEmit`).
- `pnpm test:design` passed: **16/16 tests in 45.0s**, including the 36px target sweep, collection
  containment, PDP gallery/targets, reduced motion, search-dialog focus, mega/mobile menu Escape,
  add-to-cart drawer geometry, filter drawer and newsletter dismissal. The sweep's blind spots are
  noted under the target finding.
- No page-level horizontal overflow (`scrollWidth === innerWidth`) at 390, 768 or 1440 on home,
  collection, collections index, PDP, cart, search, login, blog, article, CMS pages and policies.
  The only clipped overflow is the product-card title link in finding 6; the other >viewport
  elements are inside intentional scroll regions (size-guide tables and the Get the Look rail).
- Header geometry: **74px** at 1440 and **56px** at 390/768; 24px gutter; wordmark type
  **18/27 400 uppercase 0.36px**; nav/utility type **14/21 700 uppercase −0.154px**; every header
  button measures 36px high.
- Home: hero **1440 × 812**; four New arrivals cards at **243.5 × 498px** with 102px gaps; category
  pair at the 24px inset; footer **417px** at 1440 and **680px** at 390.
- Collection grid: **4 × 360px** at 1440 with 120px row gap; **3 × 256px** at 768; **2 × 195px** at
  390; media **360 × 450** (4:5) desktop and **195 × 260** (3:4) mobile; title 14/18 400 and price
  12/16 400. Sort writes `?sort_by=price-ascending`, renders a 134 × 36 clear-sort chip, and keeps
  the result grid mounted.
- Filter sheet: **420px** at 1440, `shadow-modal`, 300ms `cubic-bezier(.2,.6,.2,1)`, sticky
  header/footer, body scroll locked, every visible control ≥36px, no small targets, axe clean.
- PDP at 1440: gallery **800 × 1433** at 24px gutter, hero **800 × 1432**; buy content **432px** at
  x904; title **12/16 600** at y140; price **14/18 600** `tabular-nums`; size chips **44px** high;
  CTA **432 × 48**; no small targets. At 390: carousel **390 × 585** with `role="region"` and
  `tabIndex=0`, CTA **342 × 48**, size chips 36px, size-guide sheet full width with focusable
  scroll regions.
- Quick shop: dialog **768 × 385** at 1440 and **350 × 732** at 390, radius 0, `shadow-modal`, 300ms
  standard easing, close button 36px, Escape returns focus to the trigger, no small targets.
- Cart: drawer **440px** at 1440 and full width at 390, `shadow-modal`, 300ms; title 16/21 500;
  line item 123 × 191 image; free-shipping progress is `role="progressbar"` with a polite message
  and 1px track; checkout **40px**; empty cart H2 **22/29 400**; mobile summary bar **131px**;
  no overflow. The shipping threshold and copy are the documented hardcoded ₹50,000 exception.
- Search surface: 1440 × 926 below the 74px header; input 984 × 55 with a 2px focus underline;
  submit 276 × 57; combobox exposes `aria-expanded`, `aria-controls` and arrow-key selection;
  Escape returns focus to the Search button. Results at 390 are a 2-column grid with no page
  overflow.
- Newsletter: **448 × 246** modal, radius 0, `shadow-modal`, 300ms; label-associated email field and
  Subscribe button both 36px; close 36px; Escape closes, dismissal persists 30 days, and the popup
  opens only after 20s and `all` consent.
- Consent bar: **1440 × 174** at 1440 and **390 × 302** at 390, sticky to the viewport bottom;
  stacks to full-width buttons at 390.
- Login: H1 14/18 400, field 431 × 49, Proceed 431 × 40, guest link 48px, Google outline 42px;
  `aria-invalid` and `role="alert"` are wired; `/account` redirects to
  `/login?return_to=%2Faccount`.
- Reduced motion: `prefers-reduced-motion: reduce` sets the marquee to `animation-name: none`, all
  authored transitions to `1e-05s` and `scroll-behavior: auto`; the product-card image also carries
  `motion-reduce:transform-none`.
- Focus: Tab traversal of the collection page shows a 2px solid ink outline with 2px offset on the
  header triggers, utilities, collection tabs and product links; Escape returns focus to the mega
  menu trigger, mobile menu trigger, search trigger and quick-shop trigger.
- Axe: collection, PDP, cart, login, search results, collections index, blog index, article,
  size-guide page, contact page, about page and policy page are clean. Home is clean at 1440 except
  for heading order; at 390 the only violations are the four Get the Look link names.
- Image policy: every image uses `next/image` with reserved aspect geometry and `sizes="100vw"`
  except the single mega-menu tile (finding #3); the home hero and the PDP gallery’s first image are
  eager/preloaded, and product grids stay lazy below the first row.
- Radius, shadow and colour: surfaces are 0 radius, buttons/inputs/checkboxes are 4px, the only
  authored shadow is `shadow-modal`, and prices use Intl INR formatting with `tabular-nums`.

## Design-system drift vs product decisions vs defects

**Deliberate product decisions (not defects).** Design I supersedes the old wireframe system for the
home, PLP, menu, search, auth, PDP and cart surfaces (`docs/reference/design-i/README.md:26`). That
means the 24px gutter, 74/56px headers, 4px control radius with zero-radius surfaces, 400–700 type
weights, sentence-case display copy, no announcement bar, Design I imagery, INR-only pricing,
`sizes="100vw"`, no dark mode, no next-intl, no PDP quantity control, local-only notify/newsletter
and placeholder photography are accepted. The out-of-stock 55% scrim and hardcoded free-shipping
copy are documented exceptions. The local `/account/login` HTTPS limitation is an environment
constraint.

**Defects.** The seven Major and nine Minor findings are implementation or integration defects, not
Design I decisions. The product-card action drop is an integration regression, the prose and target
regressions contradict previously recorded fixes, and the unlabelled links/combobox are
accessibility failures.

**Governance drift.** `docs/DESIGN-SYSTEM.md` is the largest systemic risk: it is still the
“canonical presentation contract” but describes the retired system. `DESIGN-SYSTEM-ENFORCEMENT.md`
also claims a six-route 36px sweep and broader contract coverage than the current tests provide:
the tests do not open the menus, do not visit `/cart`, `/login` or empty `/search`, and the
“mega menu opens on hover” test actually clicks the trigger. The target test also exempts number
inputs at 20px wide and skips elements inside `p`, which hides the cart sign-in and quantity cases.
The design gate correctly enforces the new token values, but the documents and contracts have not
caught up with Design I.

## Three highest-leverage next fixes

1. **Restore the product-card action surface and fix its truncation model.**
   Owner: Product presentation (`components/product-card/product-card.tsx`,
   `components/collections/browse.tsx`, `components/home/product-row.tsx`). Render the wishlist and
   quick-shop group on the Design I browse/home cards (or remove the wishlist promise), and make the
   title link fill the caption so `truncate` produces a real ellipsis. This fixes the closed
   wishlist loop and the only measured long-content layout break in one owner.

2. **Replace the legacy prose surface and reconcile the canonical document.**
   Owner: `components/ui/prose.tsx` plus the design-system docs. Map prose to `type-body`,
   `type-h2`/`type-h3`/`type-h4`, `text-ink` and zero tracking, add a regression contract, and rewrite
   `docs/DESIGN-SYSTEM.md` against the Design I manifest. This removes the largest visual drift on
   content pages and stops the next agent implementing the retired system.

3. **Introduce a shared 36px text-row / labelled-field primitive for shell and search.**
   Owner: Shell/search presentation, with the primitive in `components/ui/`. Move the mobile and
   desktop menu links, search trending/suggestion rows and cart sign-in onto a 36px row primitive,
   and label the search combobox (plus the Get the Look links). This closes the target regression
   and both serious axe failures without touching commerce data.

## Not verified

- Authenticated `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses` and
  `/account/profile`. Customer Account OAuth requires HTTPS and credentials; `/account` only
  redirected to `/login?return_to=%2Faccount` locally. The account layout, sidebar and order display
  were code-reviewed but not rendered.
- PDP sold-out, low-stock and Notify me states. The live catalog returned no “Out of stock” product
  on `/collections/all` and `big-collar-laced-shirt` had no sold-out sizes; the local Notify me
  confirmation is a documented stub.
- Quick-shop loading, failure and unavailable states. I rendered the success dialog by seeding one
  product into the audit browser’s localStorage; no source was changed. The failure branches were
  not forced.
- The global error boundary and `global-error` (no route was made to throw after render). Only the
  login validation error and a 404 were verified.
- The search zero-result state. `/search?q=zzzzzzzzzzzzzzzzzzzzzzzzz` returned a populated
  “showing all results” page rather than “No results found”, so the zero/closest-result branch was
  not reachable with the current data.
- Gift cards, bundles, selling plans, the discount-code form, checkout address, the agent panel,
  contact drawer and blog article body interactions were not exercised beyond the page render.
- Real touch hardware and `pointer: coarse` state; Chromium emulation was used for viewport and
  hover, and the CSS `pointer-coarse:` rules were inspected but not device-tested.
- Loading skeletons were inspected in source, not frozen during a slow render.
- Cross-browser behavior (Chromium only).
- The console contained 138 warnings, overwhelmingly the expected Next.js “`sizes='100vw'` but
  image not rendered at full viewport width” warning produced by the repository’s deliberate
  image rule. No product-origin console error or failed request was observed; the only 4xx was the
  intentional 404 route, and the only logged error came from the audit’s localStorage quick-shop
  probe using an already-optimised image URL.
