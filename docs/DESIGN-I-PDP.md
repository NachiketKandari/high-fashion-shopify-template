# Design I — PDP implementation

The product detail page at `/products/[handle]` follows `Lorem Ipsum Design I (Copy)`. Geometry comes from
the export-derived spec in [`reference/design-i/pdp.md`](./reference/design-i/pdp.md); resolved type
metrics, rendering and assets come from the Figma MCP when the file URL is available.

## Frames

| Role                      | Desktop                               | Mobile                          |
| ------------------------- | ------------------------------------- | ------------------------------- |
| Default                   | `2044:2602`                           | `16:6217`                       |
| Variant selected          | `2044:2736`                           | `16:6601`                       |
| Low stock                 | `2050:3697`                           | `16:6714`                       |
| Out of stock              | `2050:4111`                           | none                            |
| Size guide / notify / bag | `2050:4539`, `2050:4689`, `2044:2869` | `16:7270`, `16:8009`, `16:8341` |

## Composition

Desktop splits 800 / 592 inside the 24px gutter. The gallery is a 800x1432 hero with a 1px black
border over two 2-up 400-wide rows; the buy column is 592 wide with 80px horizontal padding and a
432px content column. Mobile is a 2:3 swipe gallery, then the buy column at the 24px gutter.

Measured at 1440 against the frame:

| Block                   | Frame                                | Built                             |
| ----------------------- | ------------------------------------ | --------------------------------- |
| Hero                    | 24,75 · 800x1432                     | 24,75 · 800x1432                  |
| Tile row                | 400x535.71, gap 0                    | 400x533 (3:4), gap 0              |
| Buy content             | x904 · 432 wide                      | x904 · 432                        |
| Title / price           | y140 / y168                          | y140 / y168                       |
| Colour label / swatches | y226 / y254                          | y226 / y254                       |
| Size label / chips      | y310 / y338 · 44 h                   | y310 / y338 · 44 h                |
| CTA                     | 432x40 (default) / 432x48 (selected) | 432x40 disabled / 432x48 selected |
| Accordions              | y502, description open               | y502, description open            |
| Recommendations         | 4 x 360x515, 80/20 section           | 4 x 360, media 250x447            |

Mobile: 390x585 hero, 26px chip visuals on 36px targets, 342x40 CTA, no page overflow.

## States

- **No selection** — CTA reads "Select size", disabled surface fill; size chips unselected.
- **Selected** — 48px filled CTA, selected chip `#353535` fill with white label.
- **Sold out size** — chip on `surface` with muted strikethrough label; CTA disabled.
- **Out of stock** — disabled "Out of stock"; the waitlist control is absent (no sink).
- **Low stock** — omitted; `quantityAvailable` is null on this store (see `STUBS.md`).
- **Size guide** — right sheet on desktop, bottom sheet on mobile; the frame's chart body is empty.

The try-on image studio from the reference repo is intentionally not part of this page.

## Deliberate deviations

- Desktop tiles use the spec's 3:4 ratio (533 high) instead of the frame's 535.71.
- Desktop shows the frame's five gallery slots; the mobile carousel keeps every image.
- Typography uses the nearest roles: `type-control` is 12/500 where the frame asks 12/600, and
  `type-h4` is 14/400 where it asks 14/600. A 600 role would close this.
- Body roles carry zero tracking; the design CSS carries `-0.02em` on 12px commerce text.
- "size recommendation" is rendered as the Size guide link because there is no fit data.
- The disabled CTA uses `surface` + `ink-muted` instead of `#DFDFDF` + white for contrast.
- The buy column is sticky (not drawn) so the CTA stays reachable beside the tall gallery.
- Quantity is not rendered: Design I draws no quantity control in the buy box.

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.
- `pnpm test:design` passes against this page at 1440 and 390.
- Checked with the live catalogue on `/products/alma-lace-corset-top`.

## Chrome follow-ups landed with this surface

- `type-nav` carries uppercase and `-0.011em` tracking (WOMAN / MAN / SEARCH / WISHLIST / BAG / HELP / ACCOUNT).
- Header nav links are spaced at 24px; the menswear entry reads "Man".
- The footer brand mark uses the shared `/brand/wordmark.png` wordmark instead of typed text.
