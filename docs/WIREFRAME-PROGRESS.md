# Wireframe progress ledger

Resume brief for `docs/WIREFRAME-EXECUTION-PLAN.md`. Rewrite this file at every checkpoint; do not
append to it indefinitely. No narration, no screenshots, no reasoning — decisions, evidence and the
next action only.

## Current phase

**P0 — Decisions and capability gates.** Status: in progress. Blocked on D1 and D3.

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

## Decisions

| ID  | Question                                                                  | Answer                                          | Date |
| --- | ------------------------------------------------------------------------- | ----------------------------------------------- | ---- |
| D1  | Identity gate before checkout, or guest checkout with phone verification? | Open                                            | —    |
| D2  | Is the shipped home page (`home-desktop-frame-64.md`) still the target?   | Open; default is keep                           | —    |
| D3  | Which post-purchase features ship at launch?                              | Open; default is track order only               | —    |
| D4  | Keep the 2/4-column and model/image/item selectors, or fix one layout?    | Open; default is keep content mode, fix density | —    |
| D5  | Where does pincode serviceability data come from?                         | Open; default is Shiprocket                     | —    |
| D6  | Does the wireframe's negative tracking replace the template's roles?      | Open; default is display and headings only      | —    |

## Open questions blocking the next phase

1. D1 and D3 — both needed before P0's capability table can be completed.
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
| Frame classification                              | 93 Build, 62 Shopify-hosted, 35 Gated, 31 Skip                                      |
| Payment frames text nodes                         | 0 across all five `Payment Screen` frames                                           |
| `pnpm lint`, `pnpm typecheck`, build              | Not run this session                                                                |

## Next action

Get D1 and D3 answered, then run P0's capability checks against the dev store and append the
capability table here. Then pause at checkpoint C0.

## Credentials

No credential belongs in this repository. The Figma token used for the export lived in a mode-600
file outside the tree and is regenerated per working session as needed.
