# Product detail layout spec — Figma `PDP - Default State (In Stock)` (`16:7053`)

The product page frame is 1440 × 5445: a 76 px header bar over a 5043 px body, then the 361 px footer.
The body is a vertical stack with **24 px** between the product area and the recommendation row.

Source: `Lorem Ipsum Wireframe` (`TzeMmJHUVWuiuknAcm1hq4`). The frame is one of four states; the
stock states — `1:1090` low stock, `1:1910` out of stock / waitlist, `16:7696` notify-me modal, with
mobile `16:6714` and `16:8009` — could not be read because the nodes endpoint answered HTTP 429. This
spec covers the default state only.

## Sections in order

| #   | Node      | Section        | Height | Layout                                                                                  |
| --- | --------- | -------------- | ------ | --------------------------------------------------------------------------------------- |
| 1   | `16:7057` | Product area   | 4395   | Page padding 24. Gallery 800 wide at top 75; buy column 592 wide, inset 80, content 432 |
| 2   | `16:7103` | Recommendation | 624    | Label at 24, then 20 gap, then a 4-up row of 360.8 × 588 cards edge to edge             |
| 3   | `16:7127` | Footer         | 361    | As the home frame                                                                       |

### Gallery (`16:7059`)

Four images stacked in one column, 800 × 1080 each (20:27), 10 px between them. No thumbnails, no
arrows, no dots. The gallery starts 75 px below the top of the body.

### Buy column (`16:7064`)

592 wide, padding 140 top and bottom, 80 left and right, 40 between blocks. Content column 432.

| Block       | Node      | Geometry                                                                         | Type and colour                                                               |
| ----------- | --------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Name, price | `16:7065` | 70 × 41, 12 between                                                              | name DM Sans 12/600 15.6 −0.02em `#353535`; price 10/600 13 `#353535`         |
| Colours     | `16:7068` | label 34 × 16, 12 gap, 16 × 16 swatches 12 apart                                 | label DM Sans 12/500 15.6 `#000`                                              |
| Disclosures | `16:7073` | three 432 × 49 rows, 16 vertical padding, 1 px rule, chevron 12 × 7 at the right | DM Sans 12/400 15.6 `#000`: `description`, `details`, `shipping`              |
| Size        | `16:7083` | label row 432 × 16, 12 gap, chips 26 tall with 4 inset and 1 px border           | label 12/500; `size recommendation` right-aligned 12/500 `#666`; chips 12/500 |
| Add to bag  | `16:7100` | 432 × 40, padding 12/24, fill `#666666`, radius 4                                | label 12/500 `#FFFFFF`                                                        |
| Help        | `16:7102` | 122 × 16                                                                         | DM Sans 12/500 `#666`: `need help? contact us`                                |

### Recommendation (`16:7103`)

Label `you may also like` at x 24, 94 × 16, DM Sans 12/600 `#353535`. Twenty px below it, four cards
of 360.8 × 588 — the same row as the home product rows, with a 540 image and a 48 px caption holding
the name left and the price right.

## Type

Every string is DM Sans. The label and product copy are 12; the price is 10. No Helvetica appears on
this page, unlike the home frame, which sets its headings in Helvetica.

## Against the current route

| Frame element  | Today                                                     | Change                                                                  |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Page padding   | `--gutter` 30 at 1440                                     | Frame draws 24; the token stays and the split absorbs the difference    |
| Column split   | `desktop:grid-cols-2` 720/720                             | `800fr / 592fr`, so 793/587 inside the gutter                           |
| Gallery tiles  | 2:3, no gap                                               | 20:27 with a 10 px gap; four images become 793 × 1071                   |
| Buy content    | 408 wide, centred                                         | 432 wide, which leaves the frame's 80 px inset inside 592               |
| Name and price | `type-display` 22 / 29                                    | Frame draws 12/600 and 10/600 — **not changed**, see open questions     |
| Add to bag     | 36 tall, ink fill, beside the quantity picker             | Frame draws 432 × 40, `#666`, radius 4 — **not changed**, see below     |
| Disclosures    | 48 px rows                                                | Frame draws 49; the 1 px difference is the row rule                     |
| Recommendation | `Container`, `type-h2` heading, 4-col grid with grid gaps | Label on the gutter, `type-h4`, full-bleed 4-up row with 48 px captions |
| Help           | `Need help?` underlined link to mail                      | Frame draws `need help? contact us` in `#666` — **not changed**         |

## Assets the frame names but does not contain

None. Every image is a `#DFDFDF` rectangle with a 1 px outline, so the gallery needs no named asset.

## Omitted by the frame

Mobile is not drawn (the mobile frames `16:6217` and `16:6827` are separate). Nothing shows hover,
focus, sticky behaviour, a variant with no image, a gift card, a bundle, or a sold-out combination.
The stock states are separate frames and are listed above with their ids.

## Open questions

1. **Name and price scale.** The frame sets the product title at 12/600 and the price at 10/600, the
   same size as a product card's caption. The route sets the title in `type-display` 22/29. A 12 px
   title is a deliberate editorial choice, not a small-screen fallback, and it needs a decision.
2. **Add to bag.** The frame's button is 432 × 40 with a `#666666` fill and a 4 px radius. The
   storefront's control is 36 tall, ink-filled and zero-radius, and sits beside a quantity picker.
   Recommend keeping the control and the zero radius; confirm the full-width treatment.
3. **Page padding 24.** The home frame is full-bleed, this one insets 24, and the token is 30. Either
   the token changes or the frame is 6 px out.
4. **Gallery length.** The frame draws four images. The current catalogue's products carry up to
   fifteen, so the stacked gallery runs about 16,000 px and the recommendation row falls far below
   the fold. The frame does not say how a long gallery should behave — a two-column grid or a
   carousel for long galleries is a separate decision.
5. **Stock states.** `1:1090`, `1:1910`, `16:7696`, `16:6714` and `16:8009` are unread, so the
   low-stock alert, the out-of-stock block and the notify-me modal have no spec yet. The notify-me
   modal also needs a waitlist destination, which no Shopify surface in this project provides.
