# Homepage layout spec — Figma `Frame 64`

Layout source for the homepage below the header. Exported from Figma Dev Mode as CSS; the raw
export is [`home-desktop-frame-64.css`](./home-desktop-frame-64.css) and this file is the readable version.

Frame 64 is 1440 × 5158 and starts at `top: 106px`, so the header is 106 px tall and is not part of
this frame. Section heights sum to 5158 exactly: 700 + 609 + 700 + 800 + 700 + 588 + 700 + 361,
plus a 50 px announcement bar that is `display: none`.

## Sections in order

| #   | Section            | Height | Layout                                                                                           | Type and colour                                                                         |
| --- | ------------------ | ------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | Hero               | 700    | White ground, one portrait image 400 × 718 at left 546, top 0                                    | none                                                                                    |
| –   | Announcement (off) | 50     | `display: none`                                                                                  | —                                                                                       |
| 2   | Product row, 4-up  | 609    | 4 × 360 × (540 image + 69 caption), caption padding 16/24, gap 8                                 | name 12/16 600 −0.02em `#353535`; price 10/13 600                                       |
| 3   | Editorial, 2-up    | 700    | 2 × 718 with 4 px gap, images overflow their frame                                               | overlay word 96/125 700 `rgba(255,255,255,0.52)`; "Woman" at left 10, "Man" at left 0   |
| 4   | Get the Look       | 800    | White, padding 80/0, gap 40: heading row 60, then 3 × 464 × 540 (image 380 wide inside)          | heading 40/150% 800, letter-spacing **2.29em**, centred                                 |
| 5   | Exclusives banner  | 700    | `#DADADA` ground, one 1518 × 1012 image at left −39, top −262; centred group 739.58 wide, gap 40 | word 128/167 700 `rgba(255,255,255,0.52)`; 69.58 px circle, 19.5 px border, same colour |
| 6   | Product row, 4-up  | 588    | 4 × 360 × (540 image + 48 caption, space-between), padding 16/24                                 | name left, price right                                                                  |
| 7   | Editorial, 2-up    | 700    | 2 × 720.5, images overflow                                                                       | label 12/16 400 at left 36, top 658; one white, one black                               |
| 8   | Footer             | 361    | Wordmark at 22/48; 4 link groups at 377/57, gap 77, 83 px columns; newsletter at 1179            | Helvetica 12/150% −0.011em; headings `#000`, links `#666`; wordmark 36/150%             |

Every section is full-bleed: **four 360 px columns fill 1440 px exactly**, with no gutter. The only
inner spacing is the 24 px caption padding. This conflicts with `Container`'s `--gutter`, so it is a
design decision, not an implementation detail.

Footer groups: HELP (Size Guide, Care Instruction, FAQ, Contact Us), POLICIES (Terms & Condition,
Privacy, Shipping, Returns & Exchange), THE BRAND (About Us), SOCIALS (Instagram, Facebook,
Pinterest). Newsletter is a 234 × 39 row with a 1 px black bottom border, placeholder `your e-mail`
and a `SUBSCRIBE` label.

## Against the current homepage

| Spec section         | Today (`app/page.tsx`)                                             | Change                                                                        |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 1. Hero              | Full-bleed `hero-desktop.jpg` 1440 × 784 with mobile art direction | Unchanged: full-bleed kept; the frame's contained portrait is not implemented |
| 2. Product row 4-up  | `HomeProductRail`, horizontal carousel                             | Replace rail with a grid                                                      |
| 3. Editorial 2-up    | `EDITORIAL_TILES`, 2-up with bottom-left labels                    | Add the 96 px overlay word                                                    |
| 4. Get the Look      | `COLLECTION_TILES`, 3-up with labels, no heading                   | Add heading and 3-up geometry                                                 |
| 5. Exclusives banner | —                                                                  | New section                                                                   |
| 6. Product row 4-up  | —                                                                  | New caption layout                                                            |
| 7. Editorial 2-up    | `EDITORIAL_TILES`/`LINK_TILES` pattern                             | Matches, keep labels                                                          |
| 8. Footer            | `components/footer` with its own grouping                          | Regroup to these four columns                                                 |

## Assets the spec names but does not contain

`Gemini_Generated_Image_go9r17go9r17go9r (4).png`, `WhatsApp Image 2026-11-02 at 7.32.16 PM (1).jpg`,
`…7.32.52 PM.jpg`, `…7.32.54 PM (1).jpg`, `…7.32.56 PM (1).jpg`, `image.png` (×3), `SBS00276.jpg`.
Three of the product images are the 380 × 540 WhatsApp files already catalogued in
[`UNIPLUS-ASSET-PLAN.md`](../../UNIPLUS-ASSET-PLAN.md) §6, so they are far below the 1320 px the
gallery needs. `#E5E5E5` and `#DADADA` are placeholder grounds standing in for missing photography.

## Open questions

1. **2.29em tracking** on a 40 px heading is about 92 px between letters — it is how the file fills
   1392 px, not a type style. Decide whether the heading is tracked-out type or justified flex, since
   `check-design.mjs` rejects arbitrary values.
2. **96 px and 128 px watermark words** at 52 % white are larger than any `type-*` role. They need a
   named component and a token exception, or a smaller scale.
3. **Footer type is Helvetica**, the only place a second face appears, and the repo has no Helvetica
   token. Map to the nearest role or the footer will fail the drift gate.
4. **Header is not in the frame** (106 px is reserved), so no nav, search, account or cart spec exists.
5. **No mobile frame.** Every breakpoint would be invented, and the template's are `tablet:` 750 and
   `desktop:` 1100.
6. **No states**: no hover, focus, empty, or loading frames for any section.

## What shipped

`app/page.tsx` composes the frame in order, using two new components and real catalog data.

| Frame section        | Implementation                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Hero              | Full-bleed `<picture>`: `hero-desktop.jpg` above 1100 px, `hero-mobile.jpg` below; `aspect-[1440/784]` at desktop, header-height viewport below it |
| 2. Product row 4-up  | `ProductRow handle="new-in"`, four `ProductCard`s, 2-up below `desktop:`                                                                           |
| 3. Editorial 2-up    | `MediaTile` with `watermark="Women"` / `"Unisex"`, linking `/collections/women` and `/collections/unisex-1`                                        |
| 4. Get the Look      | `type-h2` heading plus three `MediaTile`s                                                                                                          |
| 5. Exclusives banner | Full-bleed `/reference/hero-desktop.jpg`, watermark and 68 px ring                                                                                 |
| 6. Product row 4-up  | `ProductRow handle="bestsellers"`                                                                                                                  |
| 7. Editorial 2-up    | Two `MediaTile`s with bottom labels                                                                                                                |
| 8. Footer            | Unchanged: `FOOTER_COLUMNS` already ships the same four groups                                                                                     |

Deliberate deviations from the export:

- **Hero.** The frame draws a 400 px portrait centred on a 1440 px white band; the storefront ships a
  full-bleed campaign hero instead, so the page opens with the photograph rather than with white
  space. This is the one section that does not follow the frame's geometry.

- **Type scale.** The 40 px heading is `type-h2` (18 px); the 96/128 px watermarks are new
  `type-watermark` and `type-watermark-lg` roles at weight 400 and `0.05em` tracking, because the
  system allows uppercase and `0.05em` as its only display devices and no role above 22 px existed.
  Both are registered in `app/globals.css`, `design/tokens.manifest.json` and `DESIGN-SYSTEM.md`.
- **Gutters.** Product rows keep `px-(--gutter)`, so four cards do not fill 1440 px edge to edge.
  Media sections stay full-bleed as the frame draws them.
- **Captions.** Both product rows reuse `ProductCard`, so each card carries title, price, swatches
  and sizes rather than the frame's two-line price caption; the frame's space-between variant has no
  separate implementation.
- **Imagery.** The frame's files do not exist, so sections use the licensed-for-study reference
  assets: lookbook crops for editorial, `hero-mobile.jpg` for the hero, `hero-desktop.jpg` for the
  banner. All of them still need the replacements catalogued in
  [`../ASSETS.md`](../ASSETS.md).
- **Watermark placement.** The words sit fully inside the media at `bottom-4`, not clipped by the
  frame edge, and drop to `type-display` below `desktop:` so they cannot overflow a phone.
