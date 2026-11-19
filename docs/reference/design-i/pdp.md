# PDP — implementation spec (extracted from Figma export)

Source: `lorem-ipsum-design-i-(copy)-export.json` · file **"Lorem Ipsum Design I (Copy)"** · page **"All desings"**.
Everything below is measured from node `absoluteBoundingBox` values (relative to the page frame) and layout props.
This copy is repo-resident for the Shopify template; the exporter and frame map are documented in
[`README.md`](./README.md). The export includes font family, size, weight, line height and letter
spacing when Figma provides them, and does **not** include effects/shadows or image bytes — see "Caveats".

## 0. Canonical frames

| Role | Frame | id | Size |
|---|---|---|---|
| **Desktop PDP (canonical)** | PDP - Default State (In Stock) | `2044:2602` | 1440 × 3742 |
| **Mobile PDP (canonical)** | Mobile PDP - Default State (In Stock) | `16:6217` | 390 × 4080 (content ends 2375.56) |
| Desktop variant | PDP - Variant Selected State | `2044:2736` | 1440 × 3742 |
| Desktop low stock | PDP - low stock alert | `2050:3697` | 1440 × 3742 |
| Desktop OOS | PDP - Out-of-Stock / Waitlist | `2050:4111` | 1440 × 3742 |
| Mobile variant | Mobile PDP - Variant Selected State) | `16:6601` | 390 × 4080 |
| Mobile low stock | Mobile PDP - Low stock alert | `16:6714` | 390 × 4080 |

Duplicates / older copies found (recommend ignoring):

- `2084:10359` "PDP - Default State (In Stock)" and `2084:10223` "PDP - Variant Selected State" on page **Journey**, `2084:10494` slide-over — **pixel-identical clones** of `2044:2602` / `2044:2736` / `2044:2869` (verified node-by-node: zero diffs).
- `1:1910` "PDP - Out-of-Stock / Waitlist" 1440×5445 — older build: same product area, but footer only 361 tall with **no auto-layout** (children absolutely placed, brand at +48) and "subscribe" text at x=1179; less complete than `2050:4111`.
- `16:6827` "Mobile PDP - Default State (In Stock)" — earlier build of the mobile default: same geometry but CTA has **no fill** and h=42 (vs `#999999`/40). Superseded by `16:6217`.
- `16:6601` name contains a stray `)`; `16:8009` is spelled "Notify Me **Modall**".
- Mobile overlay frames (`16:7270`, `16:8009`, `16:8341`) are **not** built on frame `16:6217`; they sit on an older/alternate mobile PDP background (nav at 0, content starting at y=199, stacked 390×585 image cards with "lorem ipsum / 9,000" caption bars, placeholder blocks labelled model/image/item). Treat them as sheet specs only, not as the mobile page.

---

## 1. Design-system page (`2009:2100`)

Only three frames exist — **no type scale, color or spacing token frames** were drawn.

**`grid` — `2009:2107`, 1440×1086, white, no auto-layout.**
12-column grid, all markers are 1px black `VECTOR` lines:

| Item | Value |
|---|---|
| Page margin | **24** left / right (markers `Line 1` at x=0 w=24, `Line 4` at x=1416 w=24) |
| Columns | **12 × 97.66** at x = 24, 141.66, 259.32, 376.98, 494.64, 612.3, 729.96, 847.62, 965.28, 1082.94, 1200.6, 1318.26 |
| Gutter | **20** |
| Marker rows | y=69.5 (margin label), y=97 (column lines), y=148 (gutter lines) |
| Labels | Inter 400 / **12px**, `#000000`, e.g. "24px", "20px", "97.66" |

**Icons — `2022:2981` and `2022:3749`, both "E-commerce stroke icons - Primary", 1600×2020 (x=1640 and x=3401), duplicates.**
Frame: white, radius **24**, padding **120**, gap **40**. 127 icon tiles, each **100×100**, radius **12**, white fill, **1px `#CCCFD7`** border, art ≈36–48px with **3px `#353535`** stroke (11 paths use 4px). Pitch 140 (100 + 40).
Names (Untitled-UI e-commerce set): bar-code-02, container-truck-01/02, coupon-02/03, coupon-percent, cargo-ship, customer-support, delivered-sent, delivery-box-01, delivery-view-02, delivery-tracking-02, delivery-delay-01/02, delivery-sent-01/02, delivery-truck-01/02, discount-tag-02, discount, distribution, hot-price, gift-card, invoice-01…04, loyalty-card, marketing, package, package-add/remove/moving/open/out-of-stock/process/delivered, promotion, product-loading, shipping-truck-01/02, shop-sign, shopping-cart-01/add/remove/check/favorite/check-in/check-out (-01 and -02 variants), shopping-basket-01…03 (+check-out/check-in/add/remove/favorite/secure/done), shopping-bag-01/add/remove/check/favorite/02/03, shipment-tracking, safe-delivery-01/02, shipping-loading, tags, trolley-01/02, ticket-01/02/03, ticket-star, voucher, return-request.

---

## 2. Desktop PDP `2044:2602` — 1440 × 3742

### 2.1 Section tree

| # | id | name | type | x | y | w | h | layout | pad T/R/B/L | gap | fill | radius |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | `2044:2602` | PDP - Default State (In Stock) | FRAME | 0 | 0 | 1440 | 3742 | NONE | 0 | – | `#FFFFFF` | 0 |
| 1 | `2044:2604` | Frame 64 | FRAME | 0 | 0 | 1440 | 3742* | VERTICAL | 0/0/0/0 | 10 | none | 0 |
| 2 | `2044:2605` | Frame 120 | FRAME | 0 | 0 | 1440 | 3313.43 | VERTICAL | 0 | 24 | none | 0 |
| 3 | `2044:2606` | Frame 79 (product block) | FRAME | 0 | 0 | 1440 | 2578.43 | VERTICAL | 0 | -1 | none | 0 |
| 4 | `2044:2607` | Frame 60 | FRAME | 0 | 0 | 1440 | 2578.43 | HORIZONTAL | 0/24/0/24 | 0 | none | 0 |
| 5 | `2044:2608` | Frame 127 (gallery column) | FRAME | 24 | 0 | 800 | 2578.43 | VERTICAL | 75/0/0/0 | 0 | none | 0 |
| 6 | `2044:2609` | Frame 9 (hero tile) | FRAME | 24 | 75 | 800 | 1432 | VERTICAL | 0 | 10 | none, 1px `#000` | 0 |
| 7 | `2044:2611` | Frame 239 (tile row 2) | FRAME | 24 | 1507 | 800 | 535.71 | HORIZONTAL | 0 | 0 | none | 0 |
| 8 | `2044:2614` | Frame 240 (tile row 3) | FRAME | 24 | 2042.71 | 800 | 535.71 | HORIZONTAL | 0 | 0 | none | 0 |
| 9 | `2044:2619` | Frame 57 (buy box) | FRAME | 824 | 0 | 592 | 1033 | VERTICAL | 140/80/140/80 | 40 | `#FFFFFF` | 0 |
| 10 | `2044:2620` | Frame 128 (title block) | FRAME | 904 | 140 | 137 | 46 | VERTICAL | 0 | 12 | none | 0 |
| 11 | `2044:2623` | Frame 130 (colours) | FRAME | 904 | 226 | 34 | 44 | VERTICAL | 0 | 12 | none | 0 |
| 12 | `2044:2627` | Frame 133 (size) | FRAME | 904 | 310 | 432 | 72 | VERTICAL | 0 | 12 | none | 0 |
| 13 | `2044:2646` | Frame 142 (CTA) | FRAME | 904 | 422 | 432 | 40 | HORIZONTAL | 12/24/12/24 | 10 | `#DFDFDF` | **4** |
| 14 | `2044:2648` | Frame 240 (accordions) | FRAME | 904 | 502 | 432 | 335 | VERTICAL | 0 | 0 | none | 0 |
| 15 | `2044:2661` | Frame 125 (recommendations) | FRAME | 0 | 2602.43 | 1440 | 711 | VERTICAL | 80/0/80/0 | 20 | none | 0 |
| 16 | `2044:2662` | Frame 126 (rec heading) | FRAME | 0 | 2682.43 | 1440 | 16 | HORIZONTAL | 0/24/0/24 | 10 | none | 0 |
| 17 | `2050:3858` | Frame 235 (rec row) | FRAME | 0 | 2718.43 | 1440 | 515 | HORIZONTAL | 0 | 0 | none | 0 |
| 18 | `2044:2685` | Frame 121 (footer) | FRAME | 0 | 3323.43 | 1440 | 419 | VERTICAL | 120/22/120/22 | 10 | `#FFFFFF`, 1px `#DFDFDF` top | 0 |
| 19 | `2044:2718` | Frame 65 (nav, overlays content) | FRAME | 0 | 0 | 1440 | 74 | VERTICAL | 0/24/0/24 | 16 | none | 0 |

\* `2044:2604` has a stale bbox height of 5445; its children sum to 3742.43 and the root clips at 3742.

Vertical rhythm: product 0 → 2578.43 · **+24** → recommendations 2602.43 → 3313.43 · **+10** → footer 3323.43 → 3742.43.
Nav is a transparent overlay in the top 0–74; the gallery starts at **y=75** (75 = nav 74 + 1px hero border).

### 2.2 Gallery (5 images, 2-column grid, **gap 0**)

| Tile | id | box | image node | imageRef | scale | ratio |
|---|---|---|---|---|---|---|
| Hero (spans 2 cols) | `2044:2609` | 24,75 · 800×1432 | `2044:2610` 799×1432 | `eaba8e18…b630a2` | FILL | 0.559 (≈ 5:9) |
| Row 2 left | `2044:2611` | 24,1507 · 400×535.71 | `2044:2612` 400×535.71 | `cffca9f9…b23f9916` | FILL | 0.747 (≈ 3:4) |
| Row 2 right | `2044:2611` | 424,1507 · 400×535.71 | `2044:2613` **400×400** @424,1574.86 | `806d74d6…362e089` | FILL | 1.0 (bug, see notes) |
| Row 3 left | `2044:2614` › `2044:2615` | 24,2042.71 · 400×535.71 | `2044:2616` 1050×1050 @-154,2067 | `806d74d6…362e089` | FILL | 1.0 (clipped) |
| Row 3 right | `2044:2614` › `2044:2617` | 424,2042.71 · 400×535.71 | `2044:2618` 2225×2979 @-489,1285 | `cffca9f9…b23f9916` | FILL | 0.747 (clipped) |

Hero tile has a **1px `#000000`** border and its image is 799 wide (1px inset). No thumbnails, dots, arrows or zoom affordance are drawn.
Intended implementation: CSS grid `grid-template-columns: 1fr 1fr; gap: 0`, hero `grid-column: span 2`, tiles 3:4 crops, hero 800:1432.

### 2.3 Buy box blocks (x=904 content column, 432 wide)

| Block | y | h | internal |
|---|---|---|---|
| Title | 140 | 16 | DM Sans 600 12px `#353535` |
| Price | 168 | 18 | DM Sans 600 14px `#353535`, "10,000" (no currency glyph; rec cards use "INR 10,000") |
| Colours label | 226 | 16 | "colors" DM Sans 500 12 `#000` |
| Swatches | 254 | 16 | **1 × 16×16** square, fill `#000`, 1px `#000` border, radius 0; row gap 12 |
| Size label row | 310 | 16 | "size" 12/500 `#000` … "size recommendation" 12/500 `#666`, right edge 1336 |
| Size chips | 338 | 44 | row gap **12** |
| CTA | 422 | 40 | |
| Description accordion | 502 | 173 | |
| Details accordion | 675 | 81 | |
| Shipping accordion | 756 | 81 | |
| "need help? contact us" | 877 | 16 | DM Sans 500 12 `#666` |

**Size chips** (44 h = 13 pad + 16 text + 13 pad + 2×1px border; 1px `#DCDCDC` border, radius 0, label 12/500 `#666666`, centred):

| Label | id | x | w | h |
|---|---|---|---|---|
| XXS | `2044:2632` | 904 | 56 | 44 |
| XS | `2044:2634` | 972 | 49 | 44 |
| S | `2044:2636` | 1033 | 42 | 44 |
| M | `2044:2638` | 1087 | 45 | 44 |
| L | `2044:2640` | 1144 | 41 | 44 |
| XL | `2044:2642` | 1197 | 48 | 44 |
| XXL | `2044:2644` | 1257 | 55 | 44 |

Row total 336 + 6×12 = 408 (24px slack inside 432).

**CTA:** 432×40, radius 4, fill `#DFDFDF`, label "select size" DM Sans 500 12 `#FFFFFF`, padding 12/24.
**Accordions:** 432 wide, 0 gap, each row 1px `#000000` border (bottom edge, included in height), padding 32/0, header row = 16px label (12/400 `#000`) + chevron `VECTOR` **12×7.4** at x=1324 (right-aligned), fill `#1D1B20`. Body text 12/400 `#666666` at 432 wide, 80 h (5 lines × 16).

### 2.4 Every desktop TEXT node

| section | id | characters | font | px | color | x | y | w | h |
|---|---|---|---|---|---|---|---|---|---|
| nav | 2044:2721 | WOMAN | DM Sans 700 | 14 | #353535 | 24 | 27 | 57 | 21 |
| nav | 2044:2722 | MAN | DM Sans 700 | 14 | #353535 | 105 | 27 | 33 | 21 |
| nav | 2044:2723 | SEARCH | DM Sans 700 | 14 | #353535 | 162 | 27 | 55 | 21 |
| nav | 2044:2728 | Lorem Ipsum | Mea Culpa 400 | 54 | #353535 | 597 | -103 | 247 | 76 |
| nav | 2044:2730 | Wishlist | DM Sans 700 | 14 | #353535 | 1147 | 27 | 64 | 21 |
| nav | 2044:2731 | Bag | DM Sans 700 | 14 | #353535 | 1235 | 27 | 29 | 21 |
| nav | 2044:2732 | Help | DM Sans 700 | 14 | #353535 | 1288 | 27 | 35 | 21 |
| nav | 2044:2733 | Account | DM Sans 700 | 14 | #353535 | 1347 | 27 | 69 | 21 |
| buy box | 2044:2621 | Racer back mini dress | DM Sans 600 | 12 | #353535 | 904 | 140 | 137 | 16 |
| buy box | 2044:2622 | 10,000 | DM Sans 600 | 14 | #353535 | 904 | 168 | 46 | 18 |
| buy box | 2044:2624 | colors | DM Sans 500 | 12 | #000000 | 904 | 226 | 34 | 16 |
| buy box | 2044:2629 | size | DM Sans 500 | 12 | #000000 | 904 | 310 | 21 | 16 |
| buy box | 2044:2630 | size recommendation | DM Sans 500 | 12 | #666666 | 1217 | 310 | 119 | 16 |
| buy box | 2044:2633 | XXS | DM Sans 500 | 12 | #666666 | 921 | 352 | 22 | 16 |
| buy box | 2044:2635 | XS | DM Sans 500 | 12 | #666666 | 989 | 352 | 15 | 16 |
| buy box | 2044:2637 | S | DM Sans 500 | 12 | #666666 | 1050 | 352 | 8 | 16 |
| buy box | 2044:2639 | M | DM Sans 500 | 12 | #666666 | 1104 | 352 | 11 | 16 |
| buy box | 2044:2641 | L | DM Sans 500 | 12 | #666666 | 1161 | 352 | 7 | 16 |
| buy box | 2044:2643 | XL | DM Sans 500 | 12 | #666666 | 1214 | 352 | 14 | 16 |
| buy box | 2044:2645 | XXL | DM Sans 500 | 12 | #666666 | 1274 | 352 | 21 | 16 |
| buy box | 2044:2647 | select size | DM Sans 500 | 12 | #ffffff | 1091.5 | 434 | 57 | 16 |
| buy box | 2044:2651 | description | DM Sans 400 | 12 | #000000 | 904 | 534 | 64 | 16 |
| buy box | 2044:2653 | Minimalist in the front, unforgettable from the back. This sleek black mini dress combines an effortless A-line shift silhouette with a bold, deeply scooped racerback cut. Designed to drape smoothly with a subtle satin-matte sheen, it's the ultimate statement piece for warm nights out, cocktail parties, and modern minimalist wardrobes. | DM Sans 400 | 12 | #666666 | 904 | 562 | 432 | 80 |
| buy box | 2044:2655 | details | DM Sans 400 | 12 | #000000 | 904 | 707 | 37 | 16 |
| buy box | 2044:2658 | shipping | DM Sans 400 | 12 | #000000 | 904 | 788 | 48 | 16 |
| buy box | 2044:2660 | need help? contact us | DM Sans 500 | 12 | #666666 | 904 | 877 | 122 | 16 |
| recs | 2044:2663 | you may also like | DM Sans 600 | 12 | #353535 | 24 | 2682.43 | 94 | 16 |
| recs | 2050:3863 | Racer back mini dress | DM Sans 400 | 14 | #353535 | 24 | 3189.43 | 312 | 18 |
| recs | 2050:3864 | INR 10,000 | DM Sans 400 | 14 | #353535 | 24 | 3215.43 | 312 | 18 |
| recs | 2050:3869 | Racer back mini dress | DM Sans 400 | 14 | #353535 | 384 | 3189.43 | 312 | 18 |
| recs | 2050:3870 | INR 10,000 | DM Sans 400 | 14 | #353535 | 384 | 3215.43 | 312 | 18 |
| recs | 2050:3875 | Racer back mini dress | DM Sans 400 | 14 | #353535 | 744 | 3189.43 | 312 | 18 |
| recs | 2050:3876 | INR 10,000 | DM Sans 400 | 14 | #353535 | 744 | 3215.43 | 312 | 18 |
| recs | 2050:3881 | Racer back mini dress | DM Sans 400 | 14 | #353535 | 1104 | 3189.43 | 312 | 18 |
| recs | 2050:3882 | INR 10,000 | DM Sans 400 | 14 | #353535 | 1104 | 3215.43 | 312 | 18 |
| footer | 2044:2687 | LOREM IPSUM | Helvetica 400 | 36 | #000000 | 22 | 3444.43 | 249 | 54 |
| footer | 2044:2690 | HELP | Helvetica 400 | 12 | #000000 | 444 | 3444.43 | 83 | 18 |
| footer | 2044:2692 | Size Guide | Helvetica 400 | 12 | #666666 | 444 | 3478.43 | 83 | 18 |
| footer | 2044:2693 | Care Instruction | Helvetica 400 | 12 | #666666 | 444 | 3520.43 | 83 | 18 |
| footer | 2044:2694 | FAQ | Helvetica 400 | 12 | #666666 | 444 | 3562.43 | 83 | 18 |
| footer | 2044:2695 | Contact Us | Helvetica 400 | 12 | #666666 | 444 | 3604.43 | 83 | 18 |
| footer | 2044:2697 | Policies | Helvetica 400 | 12 | #000000 | 604 | 3444.43 | 83 | 18 |
| footer | 2044:2699 | Terms & Condition | Helvetica 400 | 12 | #666666 | 604 | 3478.43 | 97 | 18 |
| footer | 2044:2700 | Privacy | Helvetica 400 | 12 | #666666 | 604 | 3520.43 | 83 | 18 |
| footer | 2044:2701 | Shipping | Helvetica 400 | 12 | #666666 | 604 | 3562.43 | 83 | 18 |
| footer | 2044:2702 | Returns & Exchange | Helvetica 400 | 12 | #666666 | 604 | 3604.43 | 108 | 18 |
| footer | 2044:2704 | The Brand | Helvetica 400 | 12 | #000000 | 764 | 3444.43 | 83 | 18 |
| footer | 2044:2706 | About Us | Helvetica 400 | 12 | #666666 | 764 | 3478.43 | 49 | 18 |
| footer | 2044:2708 | Socials | Helvetica 400 | 12 | #000000 | 924 | 3444.43 | 83 | 18 |
| footer | 2044:2710 | Instagram | Helvetica 400 | 12 | #666666 | 924 | 3478.43 | 53 | 18 |
| footer | 2044:2711 | Facebook | Helvetica 400 | 12 | #666666 | 924 | 3520.43 | 83 | 18 |
| footer | 2044:2712 | Pinterest | Helvetica 400 | 12 | #666666 | 924 | 3562.43 | 83 | 18 |
| footer | 2044:2714 | Subscribe to Our Newsletters | Helvetica 400 | 12 | #000000 | 1180 | 3444.43 | 234 | 18 |
| footer | 2044:2716 | your e-mail | Helvetica 400 | 12 | #666666 | 1180 | 3478.43 | 59 | 18 |
| footer | 2044:2717 | SUBSCRIBE | Helvetica 400 | 12 | #666666 | 1335 | 3478.43 | 69 | 18 |

### 2.5 Recommendation row

Section 1440×711, pad 80 top/bottom; heading 16 h at 24 left; **20** gap; 4 cards **360×515**, no horizontal gap (360×4 = 1440).

Per card: image holder **250×447** centred (x offset **55**), then **24** gap, caption block **360×44** (pad 0/24, gap 8) with name (14/400 `#353535`) and price "INR 10,000" (14/400) — 8px line gap, 18px line boxes.
Photo boxes in the file are inconsistent (246×440, 258×461, 254×455, 234×419) and overflow their holder → implement as 250×447, `object-fit: cover`, ratio **0.559 (5:9)**.

### 2.6 Nav (overlay)

1440×74, no background, pad 0/24. Inner row 1392×74 with fixed **gap 157** between three groups → left group 362.5 (x24), logo group 353 (x543.5), right group 362.5 (x1053.5, contents right-aligned and ending at 1416).

- Left: `WOMAN` `MAN` `SEARCH` — DM Sans **700 14px** `#353535`, gap 24, 21px line boxes, vertically centred at y=26.5.
- Centre: **logo is a VECTOR** `2044:2726` named "LOREM IPSUM", **303×24** at (568.5, 25), fill `#353535` (outlined wordmark, no font/tracking recoverable). A second, unused lockup sits off-canvas: `TEXT "Lorem Ipsum"` **Mea Culpa 400 54px** at (596.5, −103), 247×76 — ignore/delete.
- Right: `Wishlist` `Bag` `Help` `Account` — DM Sans 700 14 `#353535`, gap 24, ends flush at 1416.

### 2.7 Footer

1440×419, pad **120/22**, 1px `#DFDFDF` **top** border, white. Single row 1392×178 with gap **173**:

- Brand: TEXT **"LOREM IPSUM"**, **Helvetica 400 36px**, `#000000`, 249×54 at (22, 3444.43) — i.e. 36/54 line box; tracking ≈ +1px (not in export).
- 4 link columns (83 wide, gap 77 at x = 444 / 604 / 764 / 924): heading 12/400 `#000` (18 h), 16 gap, links 12/400 `#666`, 24 gap, 18 h each.
  - HELP: Size Guide · Care Instruction · FAQ · Contact Us
  - Policies: Terms & Condition · Privacy · Shipping · Returns & Exchange
  - The Brand: About Us
  - Socials: Instagram · Facebook · Pinterest
- Newsletter 234 wide at x=1180: heading 12/400 `#000`; 6 gap; field 234×38 (pad 10/10/10/0, gap 10) with `your e-mail` and `SUBSCRIBE` (12/400 `#666`). **No border/stroke is drawn on the desktop field** (design gap).

---

## 3. Mobile PDP `16:6217` — 390 × 4080 (content 0 → 2375.56)

### 3.1 Section tree

| # | id | name | type | x | y | w | h | layout | pad T/R/B/L | gap | fill |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | `16:6217` | Mobile PDP - Default State | FRAME | 0 | 0 | 390 | 4080 | NONE | 0 | – | `#FFFFFF` |
| 1 | `16:6218` | Frame 5 (header) | FRAME | 0 | 0 | 390 | 76 | VERTICAL | 16/24/16/24 | 16 | `#FFFFFF`, 1px `#000` bottom |
| 2 | `16:6229` | Frame 197 (page) | FRAME | 0 | 76 | 390 | 2299.56 | VERTICAL | 0 | 0 | none |
| 3 | `16:6230` | Frame 216 (product) | FRAME | 0 | 76 | 390 | 1159 | VERTICAL | 0 | 40 | none |
| 4 | `16:6575` | Frame 230 | FRAME | 0 | 76 | 390 | 1159 | VERTICAL | 0 | 0 | none |
| 5 | `16:6231` | Frame 62 (gallery) | FRAME | 0 | 76 | 390 | 585 | HORIZONTAL | 0 | -1 | none |
| 6 | `16:6233` | Frame 9 (hero) | FRAME | 0 | 76 | 390 | 585 | NONE | 0 | – | `#DFDFDF`, 1px `#000` |
| 7 | `16:6508` | Frame 57 (buy box) | FRAME | 0 | 661 | 390 | 574 | VERTICAL | 24 | 40 | `#FFFFFF` |
| 8 | `16:6576` | Frame 199 (recommendations) | FRAME | 0 | 1235 | 390 | 424.56 | VERTICAL | 40/0/40/0 | 10 | none |
| 9 | `16:6265` | Frame 67 (footer) | FRAME | 0 | 1659.56 | 390 | 716 | NONE | 0 | – | `#FFFFFF`, 1px `#000` |

Order: header → hero → buy box → "you may also like" → footer. Total content 2375.56; the frame is padded out to 4080 with **1704 of empty white** (artifact — build to content height).

### 3.2 Gallery behaviour

**Single 390×585 image (2:3), no thumbnails, no dots, no swipe carousel drawn, no sticky add-to-bag.**
`16:6233` is an empty `#DFDFDF` rectangle with a 1px black border — the mobile hero has **no image fill** in this frame (placeholder). Implement one 2:3 hero (`object-fit: cover`) and reuse asset `eaba8e18…b630a2` (same photo as desktop hero) until an export exists.

### 3.3 Buy box (390 wide, pad 24 → 342 content, gap 40)

| Block | y | h | notes |
|---|---|---|---|
| Title | 685 | 16 | DM Sans 600 **12** `#353535` — copy is lowercase "lorem ipsum" here |
| Price | 713 | 13 | DM Sans 600 **10** `#353535` — "10,000" (desktop is 14px) |
| colors label | 766 | 16 | 12/500 `#000` |
| Swatches | 794 | 16 | **2 × 16×16** `#D9D9D9`, gap 12, **no border**, radius 0 (desktop: 1 black bordered swatch) |
| size label row | 850 | 16 | "size" + "size recommendation" (12/500 `#666`, x 247) |
| Size chips | 878 | 26 | pad 4, **1px `#000`** border, radius 0, label 12/500 `#000`, gap 12 |
| CTA | 944 | 40 | 342×40, radius 4, `#999999`, "Add to bag" 12/500 `#FFF`, pad 12/24 |
| Accordions | 1024 | 147 | 3 rows 342×49 (pad 16/0), 1px `#000`, chevrons at x=354, 12×7.4 |
| need help? contact us | 1195 | 16 | 12/500 `#666` |

Chip widths: XXS 32, XS 25, S 18, M 21, L 17, XL 24, XXL 31 (26 h). Content total 168 + 72 = 240.

### 3.4 Mobile header (76 h)

pad 16/24, 342×43 row, gap 16, `SPACE_BETWEEN`:
Menu 57×43 (pad 10, 1px `#000`), wordmark **TEXT "LOREM IPSUM" Helvetica 400 18px**, 125×27 at (104, 24), then Bag 47×43 and Help 51×43 (gap 16, pad 10, 1px `#000`). All labels Helvetica 400 14 `#000`, 21px line box.
Note the **mobile wordmark is live text in Helvetica**, the desktop one is a vector — two different logo treatments.

### 3.5 Recommendation row (mobile)

390×424.56, pad 40 top/bottom; heading "you may also like" 12/**500** `#000` (desktop: 600 `#353535`) at 24 left; 10 gap; **horizontal scroller 720 wide** (overflows 390) of 4 cards **180.75×318.56**, gap −1 (cards butt together, 1px shared border).
Card: image 180.75×270.56 (**2:3**, white with 1px `#000` border — no image fills), caption bar 180.75×48 (pad 16/8, `SPACE_BETWEEN`) — name 12/600 `#353535` at left+8, price 10/600 right-aligned. Visible ≈ 2.15 cards → scroll affordance implied but not drawn.

### 3.6 Mobile footer (broken absolute layout — read carefully)

390×716, no auto-layout, all children absolutely placed (values relative to page):

| Element | id | x | y | w×h |
|---|---|---|---|---|
| Brand "LOREM IPSUM" Helvetica 400 36 `#000` | 16:6266 | 22 | 2257.56 | 249×54 |
| Columns wrapper | 16:6267 | 28 | 1690.44 | 348×391 |
| HELP col | 16:6268 | 28 | 1690.44 | 83×178 |
| Policies col | 16:6275 | 188 | 1690.44 | 83×178 |
| The Brand col | 16:6282 | 28 | 1945.44 | 83×52 |
| Socials col | 16:6286 | 188 | 1945.44 | 83×136 |
| "Subscribe to Our Newsletters" | 16:6292 | **1179** (off-canvas) | 1716.56 | 153×18 |
| Email field | 16:6293 | 28 | 2157.56 | 334×39 |

Same link lists/typography as desktop (Helvetica 12, headings `#000`, links `#666`, 24 gap). The newsletter heading is positioned off-canvas at x=1179 and the brand sits below the columns → **rebuild** as: 2×2 link columns (gap 16/77), newsletter block full width, brand last; all inside 390 with 24 side padding. Mobile email field *does* have a 1px `#000` border (pad 10/10/10/0).

---

## 4. Interaction states

### Desktop (all 1440×3742; everything above the CTA is identical unless listed)

| Element | Default | Variant selected (`2044:2736`) | Low stock (`2050:3697`) | Out of stock (`2050:4111`) |
|---|---|---|---|---|
| Buy box height | 1033 | 1041 | 1081 | 1043 |
| CTA | 432×40 `#DFDFDF` r4, "select size" white | 432×48 `#353535` r4, "Add to cart" white, pad 16/24 | 432×48 `#353535` r4, "Add to cart" | 432×50 transparent, **1px `#353535`** border, r4, "Notify me when available" `#353535` |
| CTA y | 422 | 422 | 462 | 422 |
| Accordion block y | 502 | 510 | 550 | 512 |
| Extra row | – | – | `only 1 left in stock` 432×16 @ y406, DM Sans 500 12 **`#A66100`** (chips → 24 → alert → 40 → CTA) | – |
| Size chips | 1px `#DCDCDC`, label `#666` | same, **but "M" label is `#FFFFFF` while its chip has no fill** (bug) | same as variant | fill `#F2F2F2`, label & border `#DCDCDC` (all 7 disabled) |
| Colour swatch | black 16×16 | unchanged | unchanged | unchanged (still black) |
| Gallery / recs / nav / footer | – | unchanged | unchanged | re-created ids (`2050:4248…`) but identical geometry + same imageRefs |

### Mobile (390×4080)

| Element | Default (`16:6217`) | Variant (`16:6601`) | Low stock (`16:6714`) |
|---|---|---|---|
| CTA | `#999999`, "Add to bag" | `#000000` | `#000000` |
| Selected chip | none | **S** chip `#000`, label `#FFF` | **S** chip `#000`, label `#FFF` |
| Sold-out chips | – | – | XL & XXL labels `#BBBBBB` (borders stay `#000`) |
| Extra row | – | – | `only 1 left in stock` 96×16 @ y916, DM Sans 500 12 **`#000000`** (desktop uses amber — inconsistency) |
| Downstream shift | – | none (CTA same y) | everything below shifts +28 |

No mobile out-of-stock frame exists. Desktop selects **M**, mobile selects **S** — align per real data.

---

## 5. Overlays (1440×743 desktop / 390×844 mobile)

Scrim: full-frame `#000000` at **20% opacity** in every overlay.
Desktop sheet: **592 wide, right-aligned at x=848, full 743 h**, white, radius 0, `VERTICAL` gap 40.

| Overlay | id | Header | Body | Footer |
|---|---|---|---|---|
| Size guide | `2050:4539` | 544×24, title "Size Guide & Fit Modal" **Inter 400 16**, close 24×24 (icon 14×14 `#1D1B20`) | **empty** — no chart was drawn | `Close` 544×53, 1px `#000` border, Inter 600 16 (no fill) |
| Notify me | `2050:4689` | 592×72 (pad 24), "Notify Me" Inter 400 16 | pad 24 gap 32: product row 544×191 (image 123×191, name 12/600, size "S" 12/400, price INR/10,000 12/400, delete 16×16); "select size (optional)" 12/500 + "size recommendation" 12/500 `#666`; chips 544×44 (M selected `#353535`/white); email label 12/500 + field 544×49 1px `#000` (pad 16/0) | `Notify Me` 544×53 `#353535` r4, Inter 600 16 white |
| Slide-over bag | `2044:2869` | 592×72, "YOUR BAG" DM 14/400 `#666`, "VIEW CART" DM 14/700 `#000`, close | item 544×191 (image 123×191, name 12/600, "size S" 12/400, qty `- 1 +` 12/400 gap 16, price INR 10,000 right); note scrim is mis-sized 1440×4731 | 592×147 (pad 24, gap 24, 1px `#DCDCDC` top): subtotal/inr row 14/400; `CHECKOUT` 544×53 1px `#000`, Inter 600 16 |

Mobile sheets: `16:7270` (size guide, title **"Size chart"**), `16:8009` (notify), `16:8341` (bag) — all **390×744 bottom sheets at y=100**, white, no radius, header 72 (title Inter 16 + close), body pad 24 gap 32, sticky footer 101 (pad 24) with 342×53 outlined (`1px #000`) button, Inter 600 16. Mobile bag adds "continue shopping" (DM 16/400) and "applicable taxes & Duties calculated at checkout" / "Return/exchange policy" (DM 16/400 `#666`). Mobile size-guide body is also **empty**.
Mobile sheet product rows use title "LOREM IPSUM BLACK" and a **grey placeholder** 123×191 image (no asset).
All mobile overlays are built on the wrong/older mobile background (see §0) — take type/sizes only.

---

## 6. Tokens

**Colours (12, usage counts across desktop+mobile defaults & states)**

| Hex | Representative nodes | Usage |
|---|---|---|
| `#000000` | `2044:2609` (1px hero border), `2044:2626` (swatch), `2044:2649/2654/2657` (accordion rules), `2044:2687` (footer wordmark), `16:6218` (mobile header border), modal borders | Body labels, mobile chips, rules/borders, scrim base |
| `#666666` | `2044:2630` "size recommendation", `2044:2633–2645` chip labels, `2044:2653` description, `2044:2692–2712` footer links, `2044:2660` help link | Secondary text |
| `#353535` | `2044:2621/2622` name + price, `2044:2647` CTA label, `2044:2721–2733` nav links, `2044:2726` logo vector, `2050:3863/3864` rec text | Primary commerce text + CTA fills |
| `#FFFFFF` | `2044:2602` page, `2044:2619` buy box, `2044:2685` footer, `2044:2647` CTA label | Surfaces and CTA labels |
| `#DCDCDC` | `2044:2632–2644` chip borders, `2044:3029` bag footer divider, OOS labels `2050:4142–4154` | Chip borders, dividers, disabled labels |
| `#DFDFDF` | `2044:2646` disabled CTA, `2044:2685` footer top border, mobile hero `16:6233` placeholder | Disabled CTA, hairlines, placeholders |
| `#D9D9D9` | `16:6515`, `16:6516` mobile swatches | Mobile colour swatches |
| `#999999` | `16:6544` mobile CTA | Mobile enabled CTA fill |
| `#F2F2F2` | `2050:4141–4153` OOS chips | OOS disabled chip fill |
| `#BBBBBB` | `16:7241`, `16:7243` sold-out labels | Sold-out chip labels |
| `#A66100` | `2050:3856` low-stock alert | Low-stock alert text (desktop only) |
| `#1D1B20` | `2044:2652/2656/2659` chevrons, `2050:4682` modal close | Icon fills |

**Fonts** — *not* DM Sans everywhere:

| Family | Weights / sizes used | Where |
|---|---|---|
| **DM Sans** | 700/14, 600/14, 600/12, 600/10, 500/12, 400/14, 400/12, 400/16 (mobile bag copy) | Nav, buy box, recommendations, bag sheet |
| **Helvetica** (system fallback, not the brand font) | 400/36, 400/18, 400/14, 400/12 | Entire footer, mobile header |
| **Inter** | 400/16, 600/16 | Modal titles + modal buttons |
| **Mea Culpa** | 400/54 | Unused script logo lockup at y=−113 |

Implied line-heights (height ÷ lines, export has none): 10→13, 12→16, 14→18, 14 bold→21, 16→19, 18→27, 36→54.
Brand wordmark: **desktop = vector 303×24**, **mobile = Helvetica 400 18px text 125×27**, **footer = Helvetica 400 36px text 249×54** (approx. +1px tracking at 36px; not stored in the file).

---

## 7. Assets — unique `imageRef`s (bytes not in export)

| # | imageRef | Node(s) (PDP default / desktop) | Box | scale | Use |
|---|---|---|---|---|---|
| 1 | `eaba8e1866cdabda314acbada3f77569cfb630a2` | `2044:2610` (rect 799×1432) | hero tile 800×1432 | FILL | Gallery hero (front) |
| 2 | `cffca9f9a4bccf05dca7910c68b9505ba23f9916` | `2044:2612` 400×535.71; `2044:2618` 2225×2979 (clipped) | tile 400×535.71 ×2 | FILL | Gallery back/side view |
| 3 | `806d74d6f6afa7e2cc43db2c0e94d5808362e089` | `2044:2613` 400×400; `2044:2616` 1050×1050 (clipped) | tile 400×535.71 ×2 | FILL | Gallery detail |
| 4 | `b3be5f824ffbd5d878672332f0b9d7717a13830f` | `2050:3861` 246×440 | rec card 1 | FILL | Recommendation |
| 5 | `deb3786ec1290b199837084ca4721acbf897161f` | `2050:3867` 258×461 | rec card 2 | FILL | Recommendation |
| 6 | `adcf33025724bc3f409e5e3c95eeec1a5ca537c7` | `2050:3873` 254×455 | rec card 3 | FILL | Recommendation |
| 7 | `1210631e7aa3e2a55c7b62779c619d81aacd4c86` | `2050:3879` 234×419 | rec card 4 | FILL | Recommendation |

Only **3 product photos** are used in the gallery (5 slots), and **4** rec images. Bag/notify thumbnails reuse #3 at 194×194 (`2050:4886`, `2044:3012`); mobile bag/notify use a grey `#DFDFDF` placeholder with no ref.
Export each ref at ≥2× its largest box: hero ≥1600×2864, gallery ≥800×1072, recs ≥500×900.

---

## 8. Implementation notes

1. **Build the desktop at 1440 with a 12-col/24-margin/20-gutter grid, but the PDP itself uses a 2-pane split: 800 gallery + 592 buy box, zero gutter, page padding 24.** The buy box's own 80px horizontal padding creates the visual gutter (text starts at 904).
2. **Five gallery slots, no gap**, hero spanning 2 columns: use `grid-template-columns: 1fr 1fr; gap: 0`, hero `grid-column: 1 / -1` with `aspect-ratio: 800 / 1432`; tiles `aspect-ratio: 3 / 4` and `object-fit: cover`. Wire the carousel later if needed — the file shows a static grid (desktop) and a single hero (mobile).
3. **Type is 12px-heavy and deliberate**: product name 12/600, price 14/600 desktop but **10/600 mobile** — respect the mobile downscale rather than normalising, or confirm with design. Nav 14/700. Footer/Helvetica is a system fallback, not a brand choice — either accept Helvetica/Arial or map footer to DM Sans after sign-off.
4. **Buttons:** one component with 3 variants — `disabled` (`#DFDFDF`, white label, 12/24 pad), `primary` (`#353535`, white label, pad 16/24, h48), `outline` (`#353535` 1px border, `#353535` label, h50, transparent). All radius **4**. Mobile CTA is 40 h with pad 12/24, and mobile "primary" is `#000000` (desktop `#353535`) — unify or keep per breakpoint.
5. **Chips:** desktop 44 h / 13×16 pad / 1px `#DCDCDC` / label `#666`; mobile 26 h / 4 pad / 1px `#000` / label `#000`. Selected = filled (mobile `#000` + white label); disabled = `#F2F2F2` + `#DCDCDC`. Fix the desktop selected state (chip fill is missing while "M" label is white).
6. **Accordions:** 1px bottom border only, 0 gap, padding 32px top/bottom, 12px gap to body, 12×7.4 chevron `#1D1B20` at right. First row has no top border (container edge). Body copy 12/16 `#666`, 5 lines at 432 wide.
7. **Sticky add-to-bag is not designed** for mobile — the CTA scrolls. If added, follow the button spec (40 h) and keep it out of the 585px hero.
8. **Overlay pattern:** 20% black scrim + right sheet desktop (592 wide) / bottom sheet mobile (744 tall at y=100). Both size-guide bodies are empty in Figma — the size chart (rows/columns, units, fit notes) must be supplied. Modal type is **Inter 16** while page type is DM Sans — decide one.
9. **Fix before build:** mobile footer absolute positions (newsletter at x=1179, brand below links); mobile hero has no image; desktop rec photo boxes overflow their 250×447 holders; desktop newsletter field has no border; overlay scrim in the bag frame is 1440×4731.
10. **Caveats on the data:** the plugin export omits `lineHeight`, `letterSpacing`, `fontStyle`, effects, individual stroke weights and image bytes. Line heights above are derived from text bounding boxes (e.g. 12px → 16px box). Frames with strokes but no `strokeWeight` were treated as **1px** (consistent with height arithmetic: footer 419 = 120+178+120+1; mobile header 76 = 16+43+16+1; accordion 173 = 32+16+12+80+32+1).
11. Trimmed machine-readable tree: `docs/figma/pdp-frames.json` — `frames.desktop` (`2044:2602`) + `frames.mobile` (`16:6217`) with full geometry/layout/fills/text/styles, `states` deltas for the 5 interaction frames, plus `imageRefs`, `colors`, `fonts`.
