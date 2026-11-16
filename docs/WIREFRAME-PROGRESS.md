# Wireframe progress ledger

Resume brief for `docs/WIREFRAME-EXECUTION-PLAN.md`. Rewrite this file at every checkpoint; do not
append to it indefinitely. No narration, no screenshots, no reasoning — decisions, evidence and the
next action only.

## Current phase

**P0 — Decisions and capability gates.** Status: in progress. D1, D2 and D3 answered 2026-11-16 and
the post-purchase capability table is done. The home frame is specified at
`docs/reference/figma/home-desktop-frame-40-313.md`; building it is blocked on four presentation
decisions listed under Open questions.

## Phase status

| Phase                                | Status                                            |
| ------------------------------------ | ------------------------------------------------- |
| P0 Decisions and capability gates    | In progress                                       |
| P1 Specification inventory           | Done — inventory written; design delta still open |
| P2 Shopify connectivity verification | Not started                                       |
| P3 Design contract in code           | Not started                                       |
| P4 Shell and navigation              | Not started                                       |
| P5 Browse                            | Not started                                       |
| P6 Product page                      | Not started                                       |
| P7 Cart and checkout handoff         | Not started                                       |
| P8 Search                            | Not started                                       |
| P9 Account                           | Not started                                       |
| P10 Private wishlist                 | Not started                                       |
| P11 Post-purchase                    | Not started                                       |
| P12 Content and agent surface        | Not started                                       |
| P13 Hardening and launch             | Not started                                       |

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

| ID  | Question                                                                  | Answer                                                                                 | Date       |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| D1  | Identity gate before checkout, or guest checkout with phone verification? | Guest checkout; accounts required only for wallet, invoices, wishlist and cancellation | 2026-11-16 |
| D2  | Is the shipped home page (`home-desktop-frame-64.md`) still the target?   | Rebuild to `Homepage - default` (40:313); specified in `home-desktop-frame-40-313.md`  | 2026-11-16 |
| D3  | Which post-purchase features ship at launch?                              | Full suite: tracking, pincode, cancellation, wallet, invoices, returns 05-10           | 2026-11-16 |
| D4  | Keep the 2/4-column and model/image/item selectors, or fix one layout?    | Open; default is keep content mode, fix density                                        | —          |
| D5  | Where does pincode serviceability data come from?                         | Open; default is Shiprocket                                                            | —          |
| D6  | Does the wireframe's negative tracking replace the template's roles?      | Open; default is display and headings only                                             | —          |

## Open questions blocking the next phase

1. **Home type scale.** The frame sets every non-product string in Helvetica at 36, 16, 14 and 12.
   The storefront ships DM Sans as `--font-sans` and its largest role is `--text-display` at 22.
   Default: add `type-display-lg` 36/54 and `type-h2` stays for 16, keep DM Sans.
2. **Home grid.** The frame is full-bleed: 4 × 360.8 columns and 4 × 330 tiles edge to edge, with
   −1 px gaps. `Container`/`--gutter` inset by 30 px at 1440. Default: full-bleed rows, no column
   gap, keep `--grid-row-gap` when columns stack.
3. **Footer scope.** The frame's 361 px footer drops the flagship address, payment marks and currency
   selector from every route. Default: keep the shipped footer until the footer frame itself is
   specified, and treat footer parity as its own phase.
4. **Price format.** The frame writes `9,000` bare and the cart copy writes `INR`; the storefront
   renders `₹9,000` from Shopify's INR amount. Default: keep shopify-formatted ₹ on cards and `INR`
   in the cart summary's total line.
5. Store password (`GAP-CLOSURE-PLAN.md` G5) — blocks P7 verification, and therefore P0's checkout row.

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

| Check                                             | Result                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Figma REST `?depth=2` on `TzeMmJHUVWuiuknAcm1hq4` | 200; 221 top-level frames on one page (`Wireframe`)                                 |
| File metadata                                     | Version `2421747092237574279`, last modified `2026-11-14T17:37:18Z`, `role: viewer` |
| Components, component sets, published styles      | 0, 0, 0                                                                             |
| Frame classification                              | 93 Build, 60 Shopify-hosted, 37 Gated, 31 Skip                                      |
| Payment frames text nodes                         | 0 across all five `Payment Screen` frames                                           |
| `pnpm lint`, `pnpm typecheck`                     | Pass; design gate 167 files                                                         |
| Design suite (`tests/design`)                     | 16/16 headless after the wordmark contract change                                   |
| INR across home, collection, PDP                  | 6/6 headless: rupee prices on all three, no dollar amounts                          |
| New wordmark in the shell                         | 5/5 headless: loads at 342x30, 950/82 aspect, masthead renders                      |

## Next action

Build the home from `home-desktop-frame-40-313.md` once the four presentation defaults above are
confirmed, starting with the two product rows and the two editorial pairs, which need no new tokens.
Then P9 (account hub, wallet, orders) against the Customer Account API. Cancellation and returns stay
gated until an Admin-side write path is agreed.

## Credentials

No credential belongs in this repository. The Figma token used for the export lived in a mode-600
file outside the tree and is regenerated per working session as needed.
