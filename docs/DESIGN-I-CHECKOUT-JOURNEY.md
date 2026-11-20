# Design I — checkout journey

Status: 19 November 2026. This document maps the seven surfaces that sit before Shopify checkout
against the design file the try-on product page was built from. It records what exists, what the
design asks for, what blocks an exact match, and which files own each change. It is the input to
[`PARALLEL-AGENT-PLAN.md`](./PARALLEL-AGENT-PLAN.md).

## 1. Scope and source

Source file: **“Lorem Ipsum Design I (Copy)”**, exported from Figma as
`lorem-ipsum-design-i-(copy)-export.json` (7.1 MB, three pages). The working copy lives in
`~/Downloads`; it is produced by the repo's Figma plugin at
`docs/reference/figma/export-plugin/`, not the REST API. The frame map, extraction recipes and known
defects are in [`reference/design-i/README.md`](./reference/design-i/README.md); the measured PDP
spec is [`reference/design-i/pdp.md`](./reference/design-i/pdp.md). This document supersedes the
wireframe frames for the seven surfaces below; the wireframe documents stay authoritative for
account, post-purchase, returns, wishlist, support and error screens.

The export has three pages: `design system` (grid and icon set), `All desings` (221 frames, the full
inventory) and `Journey` (7 frames, a curated pixel-identical subset for this flow). Use `All
desings`; `Journey` changes nothing.

In scope, in journey order:

| #   | Surface                   | Desktop frame                                                                                                    | Mobile frame                                                                                                           |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Home                      | `2003:263` default · `2003:177` scrolled                                                                         | `5:874` (duplicate `6:1166`, hero `2022:2955`)                                                                         |
| 2   | Menu and search           | `2022:2660` / `1:309`; search `1:461`, `1:485`, `1:517`, `7:1426`, `2044:1016`                                   | `2022:4641` / `2022:4768`; search has no mobile frame                                                                  |
| 3   | Login and register        | `1:3745`, `30:11706`, `1:3844`, `30:12263`, `30:12449`, `30:12525`, `30:11917`, `30:12098`, `1:3777`, `30:12637` | `30:11557`, `30:11731`, `30:11826`, `30:12305`, `30:12489`, `30:12565`, `30:12601`, `30:12695`, `30:11959`, `30:12220` |
| 4   | Default chrome and states | `2003:263` / `2003:177` header                                                                                   | mobile header in `5:874` and `22:8538`                                                                                 |
| 5   | Product detail            | `2044:2602` (+ `2736`, `3697`, `4111`, modals `4539`, `4689`, `2869`)                                            | `16:6217` (+ `16:6601`, `16:6714`, modals `16:7270`, `16:8009`, `16:8341`)                                             |
| 6   | Cart / bag                | `2068:8220` (+ `2075:8767`, `2075:9160`, `2075:9064`)                                                            | `22:8538` (+ `22:8976`, `30:11398`, `22:9199`, `45:13616`)                                                             |
| 7   | Address and shipping      | `39:12982`, `37:12809`, `39:13055`, `39:13165`, `45:13852`, `45:14049`, `51:14764`, `46:14396`, `45:13446`       | `37:12867`, `39:13019`, `39:13113`, `39:13223`, `45:13896`, `45:14134`, `51:14868`, `46:14500`                         |

Out of scope for this pass: payment screens (`52:*`; five frames contain zero text nodes), order
confirmation and tracking (`3:*`, `54:*`, `55:*`), returns, account hub, wishlist, support pages and
errors. They follow the same foundation once the journey above is live.

The try-on product page at `/Users/nachiket/UniPlus/tryon-product-page` is the implementation
reference for surface 5. Its `docs/figma/pdp-design-spec.md` already contains the measured PDP
geometry; this document adds the journey context and the deltas the Shopify template imposes.

## 2. What the repo has today

| Surface              | Current implementation                                                                                                                                                                                                                                           | Verdict                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                 | `app/(storefront)/page.tsx` follows `2003:263` on desktop and `5:874` on mobile: 812 px hero, 50 px marquee, four-up arrival row, 2-up category tiles and campaign band; mobile adds Get the Look, Exclusives, a second product rail and a second category pair. | Matches Design I frame geometry. Desktop omits the mobile-only sections per D4; reference photography stands in for the Figma image fills.                                                                                                |
| Header               | `components/nav/header.tsx`: sticky 76 px white bar at every breakpoint; every nav item is a bordered "chip"; wordmark 125 px; mobile shows icon actions                                                                                                         | Design I desktop is a plain 74 px text bar; mobile is a 76 px bar with bordered Menu / Bag / Help pills and no search/account icons. The default-over-hero and scrolled states are missing.                                               |
| Desktop menu         | `components/nav/desktop-nav.tsx`: 592 px sheet, links only, no tiles                                                                                                                                                                                             | Design I is a 709 px two-column panel: 354 px links + 354 px image tiles.                                                                                                                                                                 |
| Mobile menu          | `components/nav/mobile-menu.tsx`: full screen, links + tiles                                                                                                                                                                                                     | Close to the frames; spacing, typography, utility links and the 440 px tile stack need alignment.                                                                                                                                         |
| Search               | `components/nav/search-modal.tsx` opens a right drawer; `app/search/page.tsx` renders the generic browse grid                                                                                                                                                    | Design I is a full-width search surface under the header with a 1,076 + 276 px input row, trending list and 4-up results. Empty, typing, results, zero-result and typo states are missing.                                                |
| Auth                 | `components/nav/account.tsx` links straight to `/account/login`; Hydrogen redirects to Shopify-hosted OAuth. No designed gate or OTP screen exists.                                                                                                              | Not built. The designed OTP screens cannot be reproduced inside a Shopify-hosted login without a separate identity project.                                                                                                               |
| Product detail       | `components/product-detail/*` is the template PDP (stacked gallery, 36 px controls, template typography)                                                                                                                                                         | Design I geometry and type are not applied; the try-on additions are not integrated.                                                                                                                                                      |
| Cart                 | `app/(storefront)/cart/page.tsx` + `components/cart/*`: full-page bag, 800 + 592 split, 123 × 191 line art, mobile fixed TOTAL / Checkout bar, empty/updating/out-of-stock line states, promo, help, 4-up / 2-up recs.                                           | Built. Cart Checkout still opens Shopify directly; the pre-checkout step at `/checkout/address` is not linked yet. Recommendations use the shared product card, whose full-column media and row caption still differ from the cart frame. |
| Address and shipping | `app/(checkout)/checkout/address/page.tsx` with `components/checkout/*` and `lib/checkout/*`: guest form, saved cards, delivery, collapsed items list, gift, promo, totals, Proceed.                                                                             | Built as the pre-checkout surface. Guest flow verified; saved-address save and credit display need an authenticated session. See 4.6 and `STUBS.md`.                                                                                      |
| Tokens               | `type-*` roles are uppercase with +0.05em tracking, weights 300/400; zero radius; `ink #000`, `rule #e1e1e1`, `surface #f2f2f2`; gate forbids `font-medium` and any radius                                                                                       | Design I is sentence case, weights 400–700, 4 px control radius, `#353535` text, `#666` muted, `#DCDCDC` borders, `#DFDFDF`/`#999` disabled. The token layer must change before page work.                                                |

## 3. Decisions that block an exact match

These are product/architecture decisions, not styling details. The recommendation is the default
the parallel plan assumes.

### D1 — Design contract vs the current gate

Design I needs DM Sans 400/500/600/700, sentence case, 4 px radius on buttons and checkboxes, and
40–57 px controls. The current contract (AGENTS.md, `design/tokens.manifest.json`,
`scripts/check-design.mjs`) forbids all three. Matching the designs by bypassing the gate would
create a second styling system.

**Recommendation:** change the contract once, in the foundation workstream: add design-I type roles,
weights and palette tokens; add a `--radius-control: 4px` token and `rounded-control` utility;
update the manifest, drift gate and Playwright contracts; keep the existing role names as aliases
until every surface migrates. Zero radius stays the default for surfaces; 4 px is only for controls.

### D2 — Login and registration

The frames show an in-storefront identity gate, six-box OTP, password fallback, Google button and
new-user verification. The repo uses Shopify Customer Accounts: `/account/login` is a Hydrogen
handler that redirects to Shopify's hosted login, which supports email codes and social sign-in but
cannot be embedded or restyled to this layout. A storefront OTP cannot mint a Shopify customer
session on a standard plan without Multipass (Plus) or a custom auth service.

**Recommendation:** build the designed gate as the storefront entry at a new unauthenticated route,
submit it to the Hydrogen login handler, and let Shopify own the code/Google steps. Ship the gate
and validation states now; mark the designed OTP/password screens as gated by D2. If the client
requires the exact OTP screens, that is a separate identity project and must be scheduled
explicitly, not smuggled into a page build.

### D3 — Address and shipping

Shopify-hosted checkout owns address, shipping and payment on a non-Plus plan. A storefront page can
collect an address, and the installed Storefront API can add a delivery address to the cart for
checkout, but the pre-checkout step does not write one yet. The reference store uses GoKwik, which is
a checkout layer, and the repo's `PAYMENTS.md` already records that a custom Next.js GoKwik path
bypasses Shopify checkout and needs server routes, order creation and a gateway.

**Recommendation:** build the designed Address and Shipping page as the **pre-checkout delivery
step**: it reads the Hydrogen cart, shows the same items and totals, captures address/serviceability
intent, gift and promo state, and its primary action hands off through `prepareCheckoutAction` to
Shopify checkout, where the address is confirmed. Record the duplicate entry as a known limitation.
A real custom checkout (the designed payment screens) is a separate project and out of scope here.

### D4 — Which home frame is canonical

Design I has a desktop `default` (`2003:263`) that is 1440 × 2944: 812 px hero with two carousel
dots, a 50 px marquee, one 4-up product row, 2-up category tiles, a 369 px black image band and the
footer. The mobile `5:874` is 390 × 4825 and adds Get the Look, Exclusives, Bestsellers and a second
category pair. The older clone home is a different composition.

**Recommendation:** desktop follows `2003:263`; mobile follows `5:874`. Treat the missing desktop
Get the Look/Exclusives/Bestsellers as a mobile-only composition, not a defect to copy. Confirm the
hero copy: `2003:263` draws an image-only hero with dots, while mobile draws “CONTROL YOUR NURRATIVE”

- “Explore Collections”. The home workstream should keep the mobile title/button and the desktop
  dots unless product says otherwise.

### D5 — Chrome per route group

Auth frames use a 60 px brand-only bar on mobile and a 74 px overlay header on desktop; the checkout
frames use a 60 px brand-only bar on both. The storefront header and footer are not drawn on either.
The root layout currently renders Nav and Footer for every route.

**Recommendation:** move Nav/Footer into a `(storefront)` route group and give `(auth)` and
`(checkout)` their own layouts. URLs do not change. This is foundation work and must land before the
auth and checkout branches start.

### D6 — Search typo correction

`7:1426` and `2044:1016` show “No results found for ‘lor’, closest results -” with a product grid.
Shopify predictive search returns query suggestions, not a did-you-mean result set. The storefront
can approximate it by falling back to a product-title search, but it will not be a true spelling
correction.

**Recommendation:** ship zero-result + closest-title results from the existing `fetchSearchResults`
path; do not claim typo correction. If true correction is required, it needs a search service or a
synonym dictionary.

## 4. Gap by surface

### 4.0 Foundation — tokens, chrome, shared primitives

**Target.** 74 px desktop header (transparent over the home hero, white when scrolled); 56 px mobile
header with the wordmark left and search / bag / account / menu icons right; 60 px brand-only bar for
auth and checkout; design-I footer; design-I product card and product row; design-I type, palette and
control radius.

**Current.** 76 px white header everywhere, bordered chips, icon actions on mobile, template footer
with address block, payment marks and currency, template cards with 12 px uppercase captions and
quick-shop overlay, zero radius.

**Work.**

1. Token layer: palette, type roles, weights, `--radius-control`, DM Sans 600/700, gutter and page
   rhythm. Update `design/tokens.manifest.json`, `scripts/check-design.mjs`, `docs/DESIGN-SYSTEM.md`
   and `tests/design/*`.
2. Route groups: `app/(storefront)/layout.tsx` with Nav + Footer + Newsletter + ActionBar;
   `app/(auth)/layout.tsx` and `app/(checkout)/layout.tsx` with the brand bar. Move existing page
   routes without changing URLs.
3. `components/nav/header.tsx`: scroll-aware solid/transparent state, desktop plain text nav, 56 px
   mobile wordmark-left icon bar, and action slots that work in both bars.
4. `components/footer/index.tsx`: 419 px design footer: LOREM IPSUM 36 px, four link columns,
   newsletter; drop the address block, payment marks, currency and legal row from this surface.
5. `components/product-card/*` and `components/home/product-row.tsx`: 250 × 447 image, 14 px
   sentence-case caption, 4-up desktop / 2-up overflow mobile, hover alternate image, wishlist as a
   genuinely secondary control.
6. Shared primitives: quantity stepper (16 px text, no 36 px box), checkbox (16 px, 4 px radius),
   OTP input (45 × 49 desktop, 30 × 49 mobile), design accordion, stepper, empty state, search field.
7. 404/500 and loading skeletons inherit the new shell but are not rebuilt here.

**Exit.** Every route still renders; the static drift gate and design tests pass; the shared card and
footer are used by at least one surface; `pnpm build` is clean.

### 4.1 Home

**Target.** Desktop (`2003:263`): 812 px hero with two 24 px carousel dots, 50 px marquee sentence
(Helvetica 700 20 px in the file; normalise to DM Sans), 4-up product row at 250 × 447 with 102 px
row gap, 2-up 684 × 700 category tiles with 12 px bottom-left labels, 1,392 × 369 black image band,
418 px footer. Mobile (`5:874`): 76 px header, 772 px hero with 36 px three-line title and 43 px
button, 4-up overflow product row, 2-up 350 px category tiles, Get the Look 400 px tiles on
`#BEBEBE`, 700 px Exclusives, Bestsellers, 2-up “Beach Collection / Party Night”, 716 px footer.

**Current.** The existing home is the clone composition. Section order and geometry differ; the
header is opaque; product rails use the template card; no marquee or black band; stories section
does not exist in design I.

**Work.** Re-compose `app/page.tsx`; add hero carousel (static first image is acceptable; the dots
must be real controls), marquee, category tile and black band; keep `ProductRow` handles; add the
mobile-only sections; wire links to real collections. Use design-I imagery in
`public/reference/design-i/home/` when assets are exported; the current clone photography is a
placeholder until then.

**Data.** `getCollectionResults` for new-in/bestsellers; collection handles for categories. No new
commerce facts. Verify a cached first page stays cached.

### 4.2 Menu and search

**Target.** Desktop menu `2022:2660` / `1:309`: 20% black scrim over the page, 709 px white panel,
74 px header with WOMAN / MAN / SEARCH and close, 354 px link column (14/500, 16 px gap), utility
links in `#666`, 354 px tile column of three 442 px images with 14/700 labels. Mobile menu
`2022:4641` / `2022:4768`: full-screen 440 × 905, 74 px header with WOMAN / MAN / SEARCH plus
search/bag/account/close icons, 16/500 links, utility links, three tiles.

Search (`1:461`, `1:485`, `1:517`, `7:1426`, `2044:1016`): full-width surface under the header;
1,392 × 57 input row with a 24 px icon, 16 px term, close, and a 276 × 57 black SEARCH button;
trending list (16 px); results heading + 4-up 348 × 509 cards; zero-result with closest results;
typo copy. There is no mobile search frame; produce a 390 px stack with the same controls.

**Current.** Desktop menu is 592 px with no tiles; mobile menu is close; search is a drawer; the
results page uses the generic browse toolbar and grid.

**Work.** Rebuild the desktop panel and align the mobile panel; replace the search drawer with a
full-page surface (keep `⌘K`); add trending terms as content; add the five search states; reuse the
foundation `ProductCard`; keep predictive search and analytics. The `/search` page remains the
landing surface for a submitted term, so a deep link works without JavaScript.

**Gated.** True typo correction (D6). Search result facets/sort are out of scope for this pass but
must not be removed from the existing page.

### 4.3 Login and register

**Target.** Desktop: 592 px form panel on the left, 848 px image on the right, 74 px overlay header;
form width 431 px, top offset 129 px, title 14/400, field 431 × 40, Proceed 431 × 40 black, guest
link, Google button 431 × 42 outline, help 12/500 `#666`. OTP: six 45 × 49 boxes, Proceed, resend
`00:30`, password alternative. Mobile: 390 × 844, 60 px brand bar, 341 px form, 40 px controls,
30 × 49 OTP boxes.

**Current.** No designed gate. `/account/login` is a redirect.

**Work.** Add the unauthenticated group and the gate at `/account/login` (or a new gate route that
posts to the Hydrogen handler; the implementation must decide without breaking the OAuth lifecycle).
Build validation, guest continuation, Google affordance (hand to Shopify or hide if unavailable),
password and OTP presentation components, wrong-code and retry states, and the sign-in-failed page.
Link the header Account entry to the gate.

**Gated.** Exact in-storefront OTP/password entry (D2). The gate must not pretend to send a code it
cannot verify. If the session is already valid, redirect to `/account`.

**Data.** Customer Account OAuth via `lib/auth`; no new commerce data.

### 4.4 Product detail

**Target.** Desktop `2044:2602`: gallery at x24, 800 px wide, 75 px top offset; 800 × 1,432 hero with
a 1 px black border; two 2-up rows of 400 × 535.71 tiles with no gap; buy column 592 px at x824,
80 px side padding, 432 px content, 40 px gap; title 12/600 `#353535`, price 14/600; colours 12/500,
16 px swatch; size row 12/500 + recommendation; chips 42–56 × 44 with 1 px `#DCDCDC`; CTA 432 × 40,
4 px radius, `#DFDFDF`; accordions; help. Recommendation row 4 × 360 × 515. Mobile `16:6217`: 76 px
header, 390 × 585 2:3 hero, 342 px buy column with 24 px padding, 12/600 title, 10/600 price, 26 px
chips, 342 × 40 `#999` CTA, 49 px accordions, 2-up 180.75 × 318.5 recommendations.

**Current.** Template PDP. The try-on page has the measured layout plus the additions: multi-image
upload, studio sheet, mobile swipe carousel, out-of-stock/low-stock demo states, size guide modal,
slide-over add confirmation.

**Work.** Apply the design geometry and type to `product-detail-section`, `product-media`,
`buy-buttons`, option pickers, accordions and related products; port the try-on studio as client
components using `blob:` URLs; keep Shopify `useProductForm` and cart handlers; add the low-stock
line from `quantityAvailable` where present; add the slide-over confirmation; keep size-guide route
and modal. Use real Shopify media; do not hard-code the single try-on product.

**Gated.** Waitlist/notify-me (no email sink), size recommendation (no fit data), live low stock (the
token returns null today), true stock demo states (the demo bar is a try-on-only device and must not
ship to production).

**Exit.** Default, selected-variant, low-stock (if data), and out-of-stock states verified at 1440
and 390; add-to-bag still writes only through Hydrogen; recommendations and metadata unchanged.

### 4.5 Cart / bag

**Target.** Desktop `2068:8220`: 800 px line list + 592 px summary; line art 123 × 191, title
12/600, size 12/400, price with INR, remove 12/700; summary 431 px: sign-in, subtotal, delivery,
TOTAL, 431 × 40 black Checkout, promo disclosure, help; 4-up recommendations; footer. Mobile
`22:8538`: 76 px header with Menu / wordmark / Bag + Help; “Cart” title 16/400 Inter with close;
342 px lines with 123 × 191 art and 195 px details; summary; promo; 2-up recommendations; fixed
bottom TOTAL + 342 × 40 Checkout bar.

**Current.** `app/(storefront)/cart/page.tsx` + `components/cart/*`: full-page bag at `/cart`.
Desktop renders the 800 + 592 split, 123 × 191 line art, title/size/price, quantity and remove, the
431 px summary with sign-in, subtotal, delivery, TOTAL, 40 px Checkout, promo disclosure and help,
then 4-up recommendations. Mobile renders 342 px lines with 123 × 191 art and 195 px details, the
body summary and promo, 2-up recommendations, and a fixed TOTAL + 40 px Checkout bar with safe-area
padding. Empty, optimistic-updating (`Recalculating`, disabled Checkout) and inline out-of-stock
(`instructions.canUpdateQuantity`, contact link) states are built. The header Bag links to `/cart`.
Cart writes stay on `/api/cart`; totals and prices come from Shopify. Recommendations use `new-in`
because `bestsellers` is empty, and the cart rec row hides the shared card's swatches and actions.

**Remaining work.** Point the cart Checkout at `/checkout/address`; the pre-checkout step is built
but the cart still opens Shopify directly. The PDP add-to-bag drawer still opens because
`components/product-detail/buy-buttons.tsx` is PDP-owned; its slide-over confirmation is that
workstream's change. The shared foundation product card still renders full-column 2/3 media and a
24 px row caption, so the cart's 250 × 447 art and narrower mobile caption need a foundation card
variant. Verify the out-of-stock line with real sold-out inventory; the storefront token has no
`unauthenticated_read_product_inventory` scope today.

**Gated.** Notify-me/waitlist (no email sink); non-serviceable pincode (checkout/D3).

**Data.** Hydrogen cart only. No arithmetic in the storefront. Discount codes and gift/attributes
must be reflected from Shopify responses.

### 4.6 Address and shipping

**Target.** Desktop `39:12982` (member), `39:13055` (guest), `46:14396` (full balance) and
`45:14400`: 60 px brand bar; 800 px left column (choose address cards or guest form, delivery date,
gift checkbox, items accordion) + 592 px summary (items, gift, promo, subtotal, delivery, credits,
TOTAL, Proceed to Payment 431 × 40 black, help). Mobile: 390 × 844/1,177/1,272, 60 px brand bar,
341 px content, 40 px controls, summary and inline CTA (the frames place it at the end of the
column). States: saved address, new address, gift, invalid promo, non-serviceable pincode,
account-credit coverage.

**Current.** `app/(checkout)/checkout/address/page.tsx` with `components/checkout/*` and
`lib/checkout/*`; the shared `(checkout)` layout supplies the 60 px brand bar. The page renders the
800 + 592 split, the guest form with `+91` phone and pincode validation, saved-address cards for
members, the delivery block, an ITEMS accordion that starts collapsed, gift attributes and note,
promo apply/remove/invalid, totals and the Proceed handoff. Signed-in customers can save a new
address as default.

**Remaining work.** Point the cart page's Checkout action at `/checkout/address` (cart-owned);
verify the saved-address and store-credit paths with an authenticated HTTPS session; add Shiprocket
serviceability and ETA when credentials exist.

**Gated.** Account-credit application (the balance is read-only from
`customer.storeCreditAccounts`; Shopify applies it at checkout), address prefill in Shopify
checkout (D3), payment entry (payment project).

## 5. Shared primitives and tokens the designs introduce

| Primitive           | Used by                                    | Notes                                                        |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Scroll-aware header | all storefront                             | transparent over the home hero; white after scroll; 74/76 px |
| Quantity stepper    | PDP, cart, checkout summary                | 16 px text, no 36 px box                                     |
| Checkbox            | checkout                                   | 16 px, 4 px radius, black check                              |
| OTP input           | auth                                       | 6 boxes, 45 × 49 / 30 × 49                                   |
| Accordion           | PDP, cart/checkout items                   | 1 px black border, 49/81 px rows                             |
| Stepper / progress  | checkout                                   | not drawn in the in-scope frames; defer                      |
| Sheet / slide-over  | search, menu, size guide, add confirmation | existing `Sheet`; sizes 592/440                              |
| Empty state         | cart, search                               | icon-free, sentence copy, one primary action                 |
| Product card        | home, search, PDP recs, cart recs          | 250 × 447 image, 14/400 caption                              |
| Marquee             | home                                       | 50 px sentence band                                          |
| Text-only brand bar | auth, checkout                             | 60 px, 18 px wordmark                                        |

## 6. Stubs and unavailable data

Follows [`STUBS.md`](./STUBS.md). A stub never fabricates a commerce value.

| Need                              | Status                                | Behaviour                                            |
| --------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| In-storefront OTP / Google auth   | Blocked (D2)                          | gate hands off to Shopify; OTP screens not built     |
| Address prefill / custom checkout | Blocked (D3)                          | address step is pre-checkout; Shopify collects again |
| Pincode serviceability            | Unverified                            | render nothing until Shiprocket is live              |
| Delivery ETA                      | Unverified                            | no promise, no invented date                         |
| Account credits / balance         | Not exposed                           | hide the control                                     |
| Low stock                         | Unverified (`quantityAvailable` null) | omit the line                                        |
| Waitlist / notify me              | Blocked (no sink)                     | omit the control                                     |
| Size recommendation               | No data                               | omit or present as a link to the size guide          |
| Search typo correction            | No data (D6)                          | zero-result + closest-title results, honest copy     |
| Newsletter / contact transport    | Blocked                               | existing unavailable status                          |

## 7. Verification

Per surface: 1440 and 390 screenshots against the frames; keyboard-only pass; reduced-motion pass;
`pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:design`. Real Shopify data for catalogue,
cart and customer paths. No claim of order completion until D3 is resolved and checkout is reachable
past the store password (`GAP-CLOSURE-PLAN.md` G5).
