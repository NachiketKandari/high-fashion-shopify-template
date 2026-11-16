# Wireframe progress ledger

Resume brief for `docs/WIREFRAME-EXECUTION-PLAN.md`. Rewrite this file at every checkpoint; do not
append to it indefinitely. No narration, no screenshots, no reasoning — decisions, evidence and the
next action only.

## Current phase

**P0 — Decisions and capability gates.** Status: in progress. D1 and D3 answered 2026-11-16; the
capability table for the full post-purchase suite is next. D2 is answered in intent but blocked on a
home frame that does not exist in the source file.

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
| D2  | Is the shipped home page (`home-desktop-frame-64.md`) still the target?   | Rebuild to the wireframe — blocked, no home frame in the file                          | 2026-11-16 |
| D3  | Which post-purchase features ship at launch?                              | Full suite: tracking, pincode, cancellation, wallet, invoices, returns 05-10           | 2026-11-16 |
| D4  | Keep the 2/4-column and model/image/item selectors, or fix one layout?    | Open; default is keep content mode, fix density                                        | —          |
| D5  | Where does pincode serviceability data come from?                         | Open; default is Shiprocket                                                            | —          |
| D6  | Does the wireframe's negative tracking replace the template's roles?      | Open; default is display and headings only                                             | —          |

## Open questions blocking the next phase

1. A home frame. The source file has none; the only home-like artifact is the backdrop inside
   `Region / Currency Switcher Drawer` (3:716), which shows a `CONTROL YOUR NURRATIVE` hero and the
   consent banner but no sections. Rebuilding home needs a frame id or a URL.
2. Store password (`GAP-CLOSURE-PLAN.md` G5) — blocks P7 verification, and therefore P0's checkout row.
3. Whether the Customer Account API exposes a store credit balance to a storefront, or whether it is
   checkout-only. Determines whether the wallet is `Build` or `Gated` in P11.

## Artifacts on disk

| Artifact                                        | State                                                 |
| ----------------------------------------------- | ----------------------------------------------------- |
| `docs/WIREFRAME-EXECUTION-PLAN.md`              | Written; 14 phases, checkpoint table, risk register   |
| `docs/reference/figma/wireframe-inventory.md`   | Written; 221 frames classified                        |
| `docs/reference/figma/home-desktop-frame-64.md` | Existing, uncommitted; home spec, already implemented |

## Verification evidence

| Check                                             | Result                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Figma REST `?depth=2` on `TzeMmJHUVWuiuknAcm1hq4` | 200; 221 top-level frames on one page (`Wireframe`)                                 |
| File metadata                                     | Version `2421747092237574279`, last modified `2026-11-14T17:37:18Z`, `role: viewer` |
| Components, component sets, published styles      | 0, 0, 0                                                                             |
| Frame classification                              | 93 Build, 60 Shopify-hosted, 37 Gated, 31 Skip                                      |
| Payment frames text nodes                         | 0 across all five `Payment Screen` frames                                           |
| `pnpm lint`, `pnpm typecheck`, build              | Not run this session                                                                |

## Next action

P0: build the capability table for the full post-purchase suite, starting with the store-credit
question, since it decides whether the wallet frames are buildable at all. Then C0.

## Credentials

No credential belongs in this repository. The Figma token used for the export lived in a mode-600
file outside the tree and is regenerated per working session as needed.
