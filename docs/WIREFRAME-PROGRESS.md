# Wireframe progress ledger

Resume brief for `docs/WIREFRAME-EXECUTION-PLAN.md`. Rewrite this file at every checkpoint; do not
append to it indefinitely. No narration, no screenshots, no reasoning — decisions, evidence and the
next action only.

## Current phase

**P6 remainder.** Product detail matches its default frame and selects variant inventory. The stock
states are specified from the exported file: low stock renders from `quantityAvailable`, which the
storefront token returns null for, so it is dormant and registered as a stub; the waitlist frame
cannot ship until something stores an email.

Mobile is now built for the three surfaces that already exist on desktop — home, product and browse —
from `mobile-frames.md`. The 24 px gutter, the 36 px hero, the 4-up overflow rows, the full-bleed
2-up browse grid and the 24/40 product column all come from the 390 frames.

## Phase status

| Phase                                | Status                                               |
| ------------------------------------ | ---------------------------------------------------- |
| P0 Decisions and capability gates    | In progress                                          |
| P1 Specification inventory           | Done — inventory written; design delta still open    |
| P2 Shopify connectivity verification | Not started                                          |
| P3 Design contract in code           | Not started                                          |
| P4 Shell and navigation              | Done — bar, panel and mobile header match the frames |
| P5 Browse                            | Not started                                          |
| P6 Product page                      | Not started                                          |
| P7 Cart and checkout handoff         | Not started                                          |
| P8 Search                            | Not started                                          |
| P9 Account                           | Not started                                          |
| P10 Private wishlist                 | Not started                                          |
| P11 Post-purchase                    | Not started                                          |
| P12 Content and agent surface        | Not started                                          |
| P13 Hardening and launch             | Not started                                          |

## Home build

Built from `home-desktop-frame-40-313.md`. Section order, full-bleed 1440 rows, 10 px rhythm, the
4-up 330 × 400 Get the Look band and the centred Exclusives group all follow the frame.

Deviations, each a decision rather than an oversight:

- **Hero and Exclusives keep their photography.** The frame draws flat grounds; the owner chose an
  image behind the type, so both carry a 30 % paper scrim and the frame's title and button on top.
- **Type.** Hero title is `type-display-lg` 36/54 at desktop and `type-display` 22/29 below it; the
  Get the Look heading is `type-h2` 18/23 against the frame's 16/24. Product captions stay
  `type-h4` 12/16 uppercase rather than the frame's 12/600 lowercase, and the price stays 12/16
  rather than 10/13, because the card is shared with browse and DM Sans ships 300/400/500.
- **Get the Look ground** is `--surface` `#f2f2f2`, not the frame's `#BEBEBE`; the palette has one
  grey. The fourth tile is Corsets, since the frame repeats one placeholder four times.
- **Copy.** `NURRATIVE` is corrected to `NARRATIVE` and `Shop for Man` becomes `Shop for Men`. The
  second editorial pair keeps `Flagship Store` and `Journal`; the frame's `Outdoor Bodysuit` and
  `streetwear` are placeholders, not destinations.
- **Header and footer are untouched.** The frame's 76 px bar without the masthead, and its 361 px
  footer, are separate surfaces. Both remain as shipped.

## Product page

Built from `product-desktop-frame-16-7053.md`: the column split, the 20:27 gallery with 10 px gaps,
the 432 px buy column and the full-bleed recommendation row with 48 px captions.

Not changed, because the frame's value is a decision rather than a detail:

- **Name and price** stay `type-display` 22/29 against the frame's 12/600 and 10/600.
- **Add to bag** stays a 36 px ink control beside the quantity picker; the frame draws 432 × 40 in
  `#666666` with a 4 px radius, which the zero-radius rule rejects.
- **Page padding** stays `--gutter` 30 against the frame's 24.

The frame draws four images; catalogue products carry up to fifteen, so the stacked gallery runs to
about 16,000 px and the recommendation row sits far below the fold. A gallery pattern for long
galleries is an open decision, not a styling fix.

The stock states are specified in `product-desktop-stock-states.md`, read from the plugin export now
in the cache. Low stock adds one line under the size chips, 12 px below them, and pushes the button
down 28; out of stock greys the chips and swaps the button for a waitlist trigger; notify-me is a
592 px right-side sheet, not a centred dialog.

Only the first line is wired. `quantityAvailable` is selected by the variant fragment, but this
store's token returns null for it, so `getLowStockLabel` renders nothing and the row is dormant until
the token carries inventory scope. The waitlist control is absent by the stub rule: nothing here can
store an email yet.

## Browse states

Applied filters render as removable chips under the toolbar (`CollectionActiveFilters`), so a
zero-result view names the filter that emptied it. The empty state offers `Clear filters` when one is
applied and `Browse all products` otherwise, and a settled grid ends with the rendered product count.

The frames for these states — `15:4740`, `15:5317`, `15:4896`, `15:5490` in the first file — could not
be read: the nodes endpoint answered HTTP 429 for the whole file. The states follow the existing
toolbar, chip and button patterns instead of measured geometry, and need a comparison pass when the
API allows.

## Notes on closed phases

P4 leaves two things deliberately unbuilt. The cookie consent banner is not rendered because
`shopConfig.analytics` disables every analytics integration, so there is nothing to consent to; it
returns with the analytics work in P13. The mobile menu has no frame in the source file, so it keeps
the template's behaviour rather than an invented one.

## Decisions taken

**D1 — guest checkout with phone verification.** Accounts are required only for wallet, invoices,
private wishlist and cancellation. The file's own `Public Track Order — Initial Form (No Login)`
frame is the argument: a file that designs a no-login post-purchase path does not intend a hard gate
before purchase.

**D3 — full post-purchase suite.** Tracking, pincode, cancellation, wallet, invoices and returns
05-10. This makes P0's capability table the critical path: wallet depends on store-credit visibility,
and cancellation and returns depend on write paths that are Admin-side or Shiprocket-side.

## Open interpretation

The three browse modes differ in caption density, not in imagery: `model` hides the caption, `image`
keeps title and price, `item` adds the available sizes. The frames draw all three identically because
a wireframe has no photography, and distinguishing a model shot from a flat shot needs per-media
tagging that the catalogue does not carry. Until it does, both modes feature the same image.

## Decisions

| ID  | Question                                                                  | Answer                                                                                  | Date       |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| D1  | Identity gate before checkout, or guest checkout with phone verification? | Guest checkout; accounts required only for wallet, invoices, wishlist and cancellation  | 2026-11-16 |
| D2  | Is the shipped home page (`home-desktop-frame-64.md`) still the target?   | Rebuild to `Homepage - default` (40:313); specified in `home-desktop-frame-40-313.md`   | 2026-11-16 |
| D3  | Which post-purchase features ship at launch?                              | Full suite: tracking, pincode, cancellation, wallet, invoices, returns 05-10            | 2026-11-16 |
| D4  | Keep the 2/4-column and model/image/item selectors, or fix one layout?    | Open; default is keep content mode, fix density                                         | —          |
| D5  | Where does pincode serviceability data come from?                         | Open; default is Shiprocket                                                             | —          |
| D6  | Does the wireframe's negative tracking replace the template's roles?      | Display only: `type-display-lg` carries −0.011em, every other role stays 0.05em         | 2026-11-16 |
| D7  | What sits behind the home hero's title and button?                        | Photography with a 30 % paper scrim; the frame's flat ground is a wireframe placeholder | 2026-11-16 |
| D8  | Full-bleed rows, or keep the `--gutter` inset?                            | Full-bleed: 4 × 360 columns edge to edge, no column gap                                 | 2026-11-16 |
| D9  | Rebuild the global footer to the home frame's 361 px version?             | Not yet; the footer is every route's surface and keeps its shipped composition          | 2026-11-16 |
| D10 | Bare numerals on cards and `INR` in the cart, or `₹` everywhere?          | `₹` from Shopify's formatted amount everywhere                                          | 2026-11-16 |

## Open questions blocking the next phase

1. Store password (`GAP-CLOSURE-PLAN.md` G5) — blocks P7 verification, and therefore P0's checkout row.
2. INR price formatting: prices render `₹50,000.00` because Hydrogen formats at the currency's ISO
   exponent, while the frame writes `9,000`. Dropping the zeros for whole-rupee amounts is a
   formatting change to `lib/money` and touches every surface.

## Capability results

| Capability             | Result               | Evidence                                                                                                  |
| ---------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| Store credit balance   | Buildable            | `StoreCreditAccount.balance`, `expirableBalance`, `transactions` in the installed Customer Account schema |
| Order tracking         | Buildable, signed in | `Fulfillment.status`, `latestShipmentStatus`, `events`, `estimatedDeliveryAt`, `trackingInformation`      |
| Cancellation write     | Admin-side           | No `orderCancel` in the Customer Account or Storefront schemas                                            |
| Returns write          | Admin-side or app    | No return mutation in either schema                                                                       |
| Tax invoices           | App                  | Not a Shopify storefront concern                                                                          |
| Pincode serviceability | External             | Shiprocket, per D5 default                                                                                |

Three of six are settled and the wallet and stepper move from Gated to Build: 105 Build, 25 Gated.

## Figma access

The token is on a `starter` plan and every REST endpoint shares one bucket, so a 429 means the whole
token is spent until its `retry-after`, not that one request was too fast. Frames are exported once
and read from disk through `docs/reference/figma/export-plugin`, which runs on the plugin API and
needs no quota; both files are now in the local cache with all 221 frames and 5 pages, node ids
intact. REST remains available for later re-checks once the bucket refills.

## Source files

Two Figma files, both readable with the same token.

| File                  | Key                      | Contents                                                                                                        |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Lorem Ipsum Wireframe | `TzeMmJHUVWuiuknAcm1hq4` | One page, 221 frames: every storefront and post-purchase state                                                  |
| e-Commerce Research   | `vSQNYA3NJeFRyH6HgBNCrp` | Pages `Reserach` (competitor captures), `zara checkout journey`, `wireframe`, `Lorem Ipsum Branding`, `Archive` |

The home page lives in the second file, page `wireframe` (`40:312`):

- `Homepage - default` — `40:313`, 1440x5011, and duplicates `141:4665` and `141:4534`
  (`Homepage when on top`). The body node `44:364` is still named `Frame 64`.
- `home-desktop-frame-64.md` was exported from that body node at an earlier revision (5158 tall,
  starting at 106). `home-desktop-frame-40-313.md` is the current drawing of the same page and
  supersedes it where they disagree.
- All imagery is missing from the frame: zero image fills, every picture a solid ground.
- Same page carries `menu-woman` / `menu-man`, `Product Detail page`, `Cart` and `Payment page`
  duplicates of the first file.

Fonts used across the home frame and the branding page: **Helvetica** (wordmark 36/400 at
-0.011em, labels 12/14, captions), **DM Sans** (product name 12/600 at -0.02em, prices 10/600),
and **Gothic A1** in two places, which looks like a spec sheet rather than a design choice. The repo
already ships DM Sans as `--font-sans` and has no Helvetica token.

The branding page (`172:24`) holds 321 frames of neck labels, care tags and hangtags, plus two
script-font wordmark studies. Rendering stopped on an HTTP 429 from the image endpoint.

**Logo.** `IMG_0923` is the wordmark: 17 frames, all the same raster, `imageRef`
`0730f03ab1f718d4c34f446141e74383add383ce`, a 1200x1800 PNG whose ink is 946x82. Cropped to
`public/brand/wordmark.png` (950x82) and wired through `components/brand/wordmark.tsx`.

The typeface cannot be read from the file because the mark is a bitmap, and no font in either file
matches it: at matched width it is wider than Archivo 700/width 100, Gothic A1 Black and Poppins
ExtraBold, so it reads as an extended geometric sans, probably custom or a commercial extended cut.
A vector master is still needed — at the 1016px masthead the 950px raster is upscaled about 7%.

## Artifacts on disk

| Artifact                                            | State                                                      |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `docs/WIREFRAME-EXECUTION-PLAN.md`                  | Written; 14 phases, checkpoint table, risk register        |
| `docs/reference/figma/wireframe-inventory.md`       | Written; 221 frames classified                             |
| `docs/reference/figma/home-desktop-frame-40-313.md` | Written; current home spec, sections 1-8, decisions needed |
| `docs/reference/figma/home-desktop-frame-64.md`     | Uncommitted; earlier revision of the same page, superseded |

## Verification evidence

| Check                                              | Result                                                                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Figma REST `?depth=2` on `TzeMmJHUVWuiuknAcm1hq4`  | 200; 221 top-level frames on one page (`Wireframe`)                                                                                           |
| File metadata                                      | Version `2421747092237574279`, last modified `2026-11-14T17:37:18Z`, `role: viewer`                                                           |
| Components, component sets, published styles       | 0, 0, 0                                                                                                                                       |
| Frame classification                               | 93 Build, 60 Shopify-hosted, 37 Gated, 31 Skip                                                                                                |
| Payment frames text nodes                          | 0 across all five `Payment Screen` frames                                                                                                     |
| `pnpm lint`, `pnpm typecheck`                      | Pass; design gate 167 files                                                                                                                   |
| Design suite (`tests/design`)                      | 16/16 headless after the wordmark contract change                                                                                             |
| INR across home, collection, PDP                   | 6/6 headless: rupee prices on all three, no dollar amounts                                                                                    |
| New wordmark in the shell                          | 5/5 headless: loads at 342x30, 950/82 aspect, masthead renders                                                                                |
| Home against frame 40:313                          | 16/16 headless: section heights 700/588/700/527/700/588/700, 4 x 360 columns, 48 px captions, 36/54 hero title, no horizontal overflow at 390 |
| Browse states                                      | 7/7 headless: chips render and remove, zero results name the filter, end-of-list count                                                        |
| Load more under a filter                           | 5/5 headless: 40 to 122 products, every price inside the filter, boundary reached                                                             |
| Design suite after the home rebuild                | 16/16 headless                                                                                                                                |
| Mobile home, product and browse against 390 frames | 10/10 headless: 24 px gutter, 36/108 hero, 180.8 px row cards, 195.5 px browse columns, 390×585 gallery, no document overflow at 390          |
| Dead-code and stub audit                           | Two unrendered components and one unused export removed; newsletter and contact forms registered after claiming success with no sink          |

## Shell and navigation

Built from `nav-desktop-frame-1-152.md` (`menu-woman` 1:152, `menu-man` 1:309). The bar is one 76 px
three-zone row: bordered 43 px chips, a 125 px centred wordmark, and the scrimmed 592 px left panel
with the category's links. The announcement bar is gone because the frame's header is the first
element on the page.

`New In` and `Edit` left the header to match the frame's `Woman / Man / Search`; both remain in the
mobile panel and the home page. Mobile uses the frame's closed bar (`Menu`, wordmark, `Bag`, `Help`);
no 390 frame shows the menu open, so the open state follows the desktop panel with two columns and
one image.

## Mobile

Built from `docs/reference/figma/mobile-frames.md`, which records the 390 frames, their defects and
the deferrals. Home, product and browse render frame geometry at 390 with no horizontal document
overflow. Deferred: the frame's bordered `Menu` / `Bag` / `Help` header is a chrome decision against
the shipped icon header, the gallery keeps its dot rail because the frame draws none and products
carry up to 15 images, and the footer stays until the footer phase.

`6:1166` duplicates the home frame, `16:6827` is the out-of-stock state under a default-state name,
and every 390 frame reuses the 1440 footer with the newsletter label off-canvas at x 1179.

## Next action

Decide the browse states to their frames — both `15:4740`
and `15:5317` draw one line under the toolbar, `showing 14 results for applied filter` and
`0 results for applied filter` at Inter 16/400 on the gutter, with no heading, button or chip row,
where the shipped build is a superset. Then the product page's title scale and gallery pattern, then
P9 against the Customer Account API.

Two formatting questions are open for the owner: cards render `₹50,000.00` because Hydrogen formats
INR at its ISO exponent, while the frame writes `9,000`, and the footer's price line has the same
shape.

## Credentials

No credential belongs in this repository. The Figma token used for the export lived in a mode-600
file outside the tree and is regenerated per working session as needed.
