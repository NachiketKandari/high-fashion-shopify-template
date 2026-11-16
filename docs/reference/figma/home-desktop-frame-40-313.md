# Homepage layout spec — Figma `Homepage - default` (`40:313`)

The homepage frame is 1440 × 5011: a 76 px header bar (`41:324`) over a 4935 px body (`44:364`).
The body is a vertical stack of eight sections with **10 px** between them; the sections sum to 4865
and the seven gaps make up the rest.

Source: `e-Commerce Research` (`vSQNYA3NJeFRyH6HgBNCrp`), page `wireframe` (`40:312`). Duplicates at
`141:4665` and `141:4534` are both named `Homepage when on top`.

The body node is named `Frame 64`. It is the node [`home-desktop-frame-64.md`](./home-desktop-frame-64.md)
was exported from, at an earlier revision: that export measured 1440 × 5158 starting at `top: 106px`,
this one 1440 × 4935 at `top: 76px`. Where the two disagree — product-row caption height, Get the Look,
Exclusives — this file is the later drawing.

## Sections in order

| #   | Node      | Section        | Height | Layout                                                                                                                                           | Type and colour                                                                |
| --- | --------- | -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1   | `41:335`  | Hero           | 700    | `#DADADA` ground. Title 496 wide at (472, 287); bordered 140 × 43 button at (650.5, 612)                                                         | title Helvetica 36/400 54 −0.011em; label Helvetica 14/400 21                  |
| 2   | `41:358`  | Products, 4-up | 588    | 4 × 360.8 columns, −1 px gap, image 360.8 × 540 (2:3), caption 48 at 24/16 padding, space-between                                                | name DM Sans 12/600 15.6 −0.02em `#353535` left; price DM Sans 10/600 13 right |
| 3   | `44:365`  | Editorial 2-up | 700    | 2 × 720.5, −1 px gap; label at (36, 658)                                                                                                         | label DM Sans 12/400 15.6 −0.02em `#000`                                       |
| 4   | `51:961`  | Get the Look   | 528    | `#BEBEBE` band, padding 40/24, 24 gap: heading 138 × 24, then 4 × 330 × 400 tiles with 24 gap                                                    | heading Helvetica 16/400 24 −0.011em, left                                     |
| 5   | `47:467`  | Exclusives     | 700    | `#DADADA` ground. Group 167 × 121 centred, top 497 (82 from the bottom): word, 24 gap, button                                                    | word Helvetica 36/400 54; button 133 × 43, label 14/400 21                     |
| 6   | `63:1535` | Products, 4-up | 588    | As 2                                                                                                                                             | as 2                                                                           |
| 7   | `47:580`  | Editorial 2-up | 700    | As 3; labels at (36, 658) and (755.5, 658)                                                                                                       | as 3                                                                           |
| 8   | `47:546`  | Footer         | 361    | Absolute: wordmark 249 × 54 at (22, 48); four 83-wide groups at (377, 57) with 77 gap; newsletter label (1179, 57), field 234 × 39 at (1179, 81) | Helvetica 12/400 18 −0.011em; headings `#000`, links `#666`                    |

## Geometry that repeats

Every row fills 1440 with no outer gutter: 4 × 360.8 − 1 = 1440, 2 × 720.5 − 1 = 1440, and
24 + 4 × 330 + 3 × 24 + 24 = 1440. The −1 gap overlaps neighbouring 1 px rules so a shared edge is
drawn once. Insets are 24 (product captions, Get the Look band) and 36 (editorial labels, measured
from the tile's left edge, 26 from its bottom).

Captions right-align the price: a 29 px price ends at 336.8, which is the column width less the 24 px
padding.

## Type

| Family    | Size/weight | Line height | Tracking | Used for                                           |
| --------- | ----------- | ----------- | -------- | -------------------------------------------------- |
| Helvetica | 36/400      | 54          | −0.011em | Hero title, Exclusives word, footer wordmark       |
| Helvetica | 18/400      | 27          | −0.011em | Header wordmark (`41:323`, 125 × 27)               |
| Helvetica | 16/400      | 24          | −0.011em | Get the Look heading                               |
| Helvetica | 14/400      | 21          | −0.011em | Header labels, button labels                       |
| Helvetica | 12/400      | 18          | −0.011em | Footer headings, links, newsletter label and field |
| DM Sans   | 12/600      | 15.6        | −0.02em  | Product name, `#353535`                            |
| DM Sans   | 10/600      | 13          | −0.02em  | Product price, `#353535`                           |
| DM Sans   | 12/400      | 15.6        | −0.02em  | Editorial label, `#000`                            |

## Copy in the frame

Every string is placeholder, and two are worth reading twice.

- Hero: `CONTROL YOUR NURRATIVE` — the word is spelled with two R's — and `Explore Collections`.
- Products: `lorem ipsum` and `9,000` on all eight cards, with no currency mark.
- Editorial: `Shop for Women`, `Shop for Man`, then `Outdoor Bodysuit`, `streetwear`.
- Get the Look: `Get the Look`.
- Exclusives: `Exclusives`, `Explore Collection`.
- Footer: `LOREM IPSUM`; HELP (Size Guide, Care Instruction, FAQ, Contact Us); Policies (Terms &
  Condition, Privacy, Shipping, Returns & Exchange); The Brand (About Us); Socials (Instagram,
  Facebook, Pinterest); `Subscribe to Our Newsletters`; field placeholder `your e-mail`; `SUBSCRIBE`.
- Header: `Woman`, `Man`, `Search`, `Wishlist`, `Bag`, `Help`, `Account`.

## Against the current route

| Frame section    | Today (`app/page.tsx`)                                                                     | Change                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1. Hero          | Full-bleed campaign image, link to `/collections/new-in`, no copy                          | Add the title and the bordered button; the frame has no imagery to say what sits behind |
| 2. Products 4-up | `ProductRow` on `new-in`, inside `px-(--gutter)` with a 3 px grid gap                      | Full-bleed 360.8 columns, −1 px gap, 48 px caption, price right                         |
| 3. Editorial     | 2-up `MediaTile` with a 96 px watermark word                                               | Replace the watermark with a 12 px label at (36, 658)                                   |
| 4. Get the Look  | 3-up at 480/557 with a centred `type-h2`                                                   | `#BEBEBE` band, 16 px left heading, 4-up 330 × 400                                      |
| 5. Exclusives    | Full-bleed photo with a 128 px watermark and a ring                                        | `#DADADA` band, 36 px word and bordered button, bottom-anchored centre                  |
| 6. Products 4-up | `ProductRow` on `bestsellers`                                                              | As 2                                                                                    |
| 7. Stories       | 2-up `MediaTile`, labels `Flagship Store` and `Journal`                                    | Copy becomes `Outdoor Bodysuit` and `streetwear`; geometry as 3                         |
| 8. Footer        | Global `components/footer`, with a flagship address, payment marks and a currency selector | The frame draws four link columns, a wordmark and a field, and nothing else             |

Also in the way: the shipped home header is a 110 px masthead above a 76 px bar; the frame draws the
76 px bar alone.

## Assets the frame names but does not contain

None. The frame has **zero image fills** — every picture is an empty frame with a solid ground:

| Ground    | Where                            |
| --------- | -------------------------------- |
| `#DADADA` | Hero, Exclusives band            |
| `#FFFFFF` | Product tiles and their captions |
| `#E5E5E5` | Editorial tiles                  |
| `#BEBEBE` | Get the Look band                |

So the frame specifies geometry and type and leaves all photography to the design owner. The route's
current `/reference/*` placeholders are not referenced by it.

## Omitted by the frame

Mobile and tablet are not drawn. No hover, focus, sticky, empty or error state appears. Motion is not
specified. The header's nav is a flat row of six labels with no mega menu, no search field and no
currency control.

## Open questions

1. **Header.** The frame's single 76 px bar sets the wordmark as 18 px type (`41:323`), 125 wide. The
   shipped home adds a 110 px masthead above the bar and renders the 1016 px artwork mark, collapsing
   on scroll. The duplicate frames named `Homepage when on top` (`141:4534`, `141:4665`) may be that
   expanded state; they could not be read (HTTP 429). Decide whether home follows this frame or keeps
   the masthead.
2. **The footer is global.** Adopting the frame's 361 px footer removes the flagship address, the
   payment marks and the currency selector from **every** route, not just home. That is a site-wide
   decision and needs one.
3. **Helvetica has no token.** Every non-product string is Helvetica at 36/16/14/12. The storefront
   ships DM Sans as `--font-sans` and has no Helvetica role, and Helvetica cannot be shipped as a
   webfont. Map those sizes onto existing `type-*` roles, license a substitute, or accept DM Sans.
4. **Full-bleed rows.** The frame's 360.8 px columns and 330 px tiles run edge to edge. `Container`
   and `--gutter` inset content by 30 px at 1440, and the current product row is 337 px columns with
   a 3 px gap. The frame is a different grid, not a container tweak.
5. **10 px section rhythm.** The body's `itemSpacing` is 10. The design system spaces sections with
   `--section-gap`, and the current route uses `py-10`/`py-20` inside sections. Confirm 10 px is
   intended between full-bleed blocks.
6. **Hero composition.** Title at 287 and button at 612 inside 700 are not a centred group and not a
   bottom-aligned one. Is the band a fixed crop of a taller hero, or the intended composition?
7. **Copy defects.** `NURRATIVE` and `Shop for Man` (against `Shop for Women`). Fix, keep, or treat as
   placeholder? Navigation already ships `Men`.
8. **Price formatting.** The frame writes `9,000` with no currency mark and the cart copy writes
   `INR`; the storefront renders `₹9,000` from Shopify's INR amount. Unresolved and recorded in
   [`WIREFRAME-PROGRESS.md`](../../WIREFRAME-PROGRESS.md).
9. **Footer heading case.** `HELP` is uppercase, the other three are title case. The shipped footer
   uppercases all four through `type-label`. Normalise?
10. **Empty overlay.** `41:336` (`Frame 8`, 325 × 400 at (40, 785)) has no fill, no children and no
    render, and sits over the first product tile. Treated as leftover and excluded.
