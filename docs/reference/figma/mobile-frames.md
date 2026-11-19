# Mobile frames — home, product, browse

390 px frames from the plugin export of `Lorem Ipsum Wireframe`, read through
`figma-cache/wireframe.json`. Every frame is a flat stack at 1×; offsets below are frame-local.

| Surface | Frame     | Name                                               | Size       |
| ------- | --------- | -------------------------------------------------- | ---------- |
| Home    | `5:874`   | iPhone 13 & 14 - 1                                 | 390 × 4825 |
| PDP     | `16:6217` | Mobile PDP - Default State (In Stock)              | 390 × 4080 |
| PDP     | `16:6827` | Mobile PDP - Default State — actually out of stock | 390 × 4080 |
| PLP     | `8:3174`  | Mobile PLP - 2 Column, Model                       | 390 × 3853 |
| PLP     | `15:4896` | Mobile PLP - 2 Column, Active Filtered             | 390 × 3853 |
| PLP     | `15:5490` | Mobile PLP - 2 Column, Zero Filter Results         | 390 × 3853 |
| Drawer  | `9:3994`  | Filter & Sort Drawer — colour                      | 390 × 844  |
| Drawer  | `13:3394` | Filter & Sort Drawer — sort by                     | 390 × 844  |

`6:1166` (`iPhone 13 & 14 - 2`) is a pixel-identical duplicate of the home frame, and `16:6827` is
mislabelled: its sizes are greyed and its button is `Notify me when available`, so it is the
out-of-stock state.

## Shared header — `Frame 5`, 390 × 76

Padding 16 / 24, one hairline under it. Inner row 342 × 43, gap 16.

| Element  | Size     | Treatment                 |
| -------- | -------- | ------------------------- |
| `Menu`   | 57 × 43  | 1 px border, 14/400 text  |
| Wordmark | 125 × 27 | 18/400, optically centred |
| `Bag`    | 47 × 43  | 1 px border, 14/400 text  |
| `Help`   | 51 × 43  | 1 px border, 14/400 text  |

No search, no account icon, no bag count, no bottom navigation anywhere in the file.

## Home — `5:874`

| y      | h     | Block                                                         |
| ------ | ----- | ------------------------------------------------------------- |
| 72     | 772   | Hero, `#DADADA`, display copy at y 359, CTA 140 × 43 at y 684 |
| 844    | 318.6 | Product row, four 180.8 × 318.6 cards, no heading             |
| 1162.6 | 700   | Two stacked 390 × 350.5 editorial tiles, label 36 px in       |
| 1862.6 | 528   | `Get the Look`, 40 / 24 padding, heading 16, 400-tall cards   |
| 2390.6 | 700   | `Exclusives`, centred block, 82 px from the bottom            |
| 3090.6 | 318.6 | Second product row                                            |
| 3409.1 | 700   | Second editorial pair                                         |
| 4109.1 | 716   | Footer                                                        |

Type: display 36/400, section heading 16/400, buttons 14/400, card name 12/600 `#353535`, price
10/600. Page gutter 24; hero copy runs at an 11 px side margin; rows and tiles are full-bleed.

## Product — `16:6217`

Gallery 390 × 585 at y 76, full-bleed 2:3, **no dots, thumbnails or counter**. Buy column at y 661,
padding 24, gap 40: name and price (41), colours (44), size (54), CTA 342 × 40, three 49 px
accordion rows (147), `need help? contact us`.

Out of stock (`16:6827`) greys every size chip and swaps the CTA for a bordered
`Notify me when available`.

## Browse — `8:3174`, `15:4896`, `15:5490`

Toolbar 111 tall at y 76: category chip rail, then a 20 px row with the view toggle, a
`model | image | item` segmented control and a right-aligned `Filter`. Filters add a 43 px third row
with the result count and `clear all`.

The grid is full-bleed: two 195.5 columns, 1 px hairline between cards, no row gap, 18 cards.
Cards are the home card at 195.5 × 292.5.

Zero results adds a 390 × 414 block, padding 160 / 40: `No clothing matching your filters` and a
black `Reset Filter` 120 × 51.

## Drawer — `9:3994`, `13:3394`

Bottom sheet, 390 × 744 at y 100, square corners, 20 % scrim, padding 24, gap 40. Title
`FILTER AND ORDER`, collapsible colour / size / price / sort sections, then `SHOW ITEMS` filled and
`CLEAR FILTER` outlined, 10 px apart.

## Defects in the source frames

Do not copy these:

- Every 390 frame reuses the 1440 footer: the newsletter label sits at x 1179, so it is off-canvas,
  and the wordmark falls below the email field.
- Product rows are 720 wide and `Get the Look` runs to 1136 with no scroll affordance; they are
  intended to overflow but the artboard cannot show it.
- `16:6217` ends at y 2375 with 1704 px of empty frame below, and `8:3174` overruns its own height
  by 126 px, so the frame heights are stale — trust the section offsets.
- `15:5490` renders 18 ghost cards under the empty state.
- The drawer's scrim covers a 1-column listing while every other browse frame is 2-column.

## What the storefront renders

| Frame expectation        | Shipped                                                     |
| ------------------------ | ----------------------------------------------------------- |
| 24 px gutter             | `--gutter: 24px` at mobile                                  |
| Hero display 36/400      | `type-display-lg` at both widths                            |
| Hero 772 tall            | `calc(100svh - header)` so it fits the device               |
| 4-up product row         | Horizontal snap rail, 46.4 vw cards, 4-up grid at desktop   |
| Editorial tile 390 × 350 | `aspect-[10/9]`                                             |
| `Get the Look` 400-tall  | `aspect-[2/3]` rail, 268 px max, 4-up grid at desktop       |
| `Exclusives` 390 × 700   | `aspect-[39/70]`                                            |
| Gallery 390 × 585        | `aspect-[2/3]`, full-bleed                                  |
| Buy column 24 / 40       | `py-6`, `gap-10`                                            |
| Full-bleed 2-up grid     | `-mx-(--gutter)`, `gap-px`, 3-up at tablet, 4-up at desktop |

## Mobile menu — `Lorem Ipsum Design I` `2022:4641`, `2022:4768`

The design file adds the open state at 440 × 956. A full-height white panel replaces the page:

| Part    | Geometry                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------- |
| Header  | 74 tall, padding 24; `WOMAN MAN SEARCH` 14 px at the left, then search, bag, account and close icons    |
| Links   | one column at the 24 px gutter, 21 px rows with 24 px rhythm                                            |
| Utility | `My Account`, `Delivery`, `Return`, `Contact Us`, muted, 12 px apart                                    |
| Tiles   | full-bleed square images with an uppercase white label at the bottom left; three for Woman, two for Men |

Typography throughout is DM Sans, which the storefront already loads (`--font-dm-sans`, weights 300/400/500)
and applies to the body, so every text surface inherits it. The wordmark stays a bitmap asset rather than
type.

## Open decisions

1. **Header chrome.** The 390 wireframe draws bordered `Menu` / `Bag` / `Help` text buttons at 76 px;
   the design file draws a 56 px wordmark-left bar with search, bag, account and menu icons. Resolved
   for the Design I build: the 56 px bar is the storefront header, and the 74 px design-file panel is
   the open menu. The 76 px bar in the 390 frames is stale.
2. **Menu tiles.** The design file uses generated placeholder images; the storefront uses one
   editorial image per tile (Core, Elevated, Core; Jacket, Shirt).
3. **Gallery affordance.** The frame shows no indicator, but products here carry up to 15 images; the
   shipped carousel draws one dot per image. A counter or a capped dot rail needs a choice.
4. **Product title scale.** The frame uses 12/600 for the name and 10/600 for the price; the
   storefront uses `type-display`. The same question is open on desktop.
5. **Footer.** The frames' footer is a broken desktop copy, so the shipped global footer stays until
   the footer phase.
