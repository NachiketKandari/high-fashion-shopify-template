# Design I — PLP implementation

The collection and `/collections/all` pages follow `Lorem Ipsum Design I (Copy)`. Geometry comes from
the design-index frames; the storefront uses the same cached and request-time browse routes underneath.

## Frames

| State           | Desktop     | Mobile      |
| --------------- | ----------- | ----------- |
| 4-column, model | `2044:1155` | `15:5894`   |
| 4-column, image | `2044:1560` | `2059:7398` |
| 4-column, item  | `2044:1963` | `2059:7814` |
| 2-column, model | `2050:5425` | `2059:7814` |
| Active filters  | `15:4740`   | `15:4896`   |
| Zero results    | `15:5317`   | `15:5490`   |

`2044:1155` is the canonical desktop frame; `2059:7398` is the final mobile two-column frame. The
390px frames use the older 76px header and are only a layout reference.

## Composition

Measured at 1440 against `2044:1155`:

| Block                      | Frame                                       | Built                                |
| -------------------------- | ------------------------------------------- | ------------------------------------ |
| Header                     | 74px                                        | 74px                                 |
| Category row               | 24px inset, y98, 14/18, 24px gap            | same                                 |
| Toolbar                    | 24px inset, y140, 20px icons                | same, 36px targets                   |
| Grid                       | full-bleed, 4 x 360, no column gap          | same                                 |
| Card media, 4-column model | 360x447 holder, 249x446 image               | 360x450, 4:5 holder, contained image |
| Card caption               | 24px inset, 24px below media, 14/18 + 12/16 | same                                 |
| Row gap, 4-column          | 120px                                       | 120px                                |
| 2-column gallery           | 960px centred, 2 x 480, 720px media         | same                                 |
| Row gap, 2-column          | 80px                                        | 80px                                 |
| Mobile 2-column media      | 220.5x293.25 (3:4), no gutters              | 3:4, no gutters                      |
| Mobile 1-column media      | 390-wide portrait                           | 2:3                                  |

Desktop renders the four-column compact grid by default; the first toolbar icon switches to the
centred two-column gallery, and the second returns to four columns. On mobile the same control
switches one and two columns. `model` shows the featured image contained in the holder, `image` uses
the alternate image full-bleed, and `item` crops the featured image to the garment.

## Controls

- The category row is `COLLECTION_TABS`; `All` targets `womenswear` and `Pants` targets `bottoms`, the
  populated women's collections, and the current collection gets the 700-weight active role.
- The toolbar keeps the model/image/item view and adds the two-column/four-column density control.
- `Filter` opens the existing right sheet. Sort lives at the top of that sheet rather than in the
  toolbar, and a non-default sort appears as a removable chip beside the active filters.
- The first page of the default view remains cached; filtered and sorted views still use the refine
  route, and Load more still deduplicates cursor pages.

## Deliberate deviations

- The frames use AI-generated cutouts on white with 5:9 and square crops. The storefront renders
  Shopify product imagery, which is mostly 2:3 studio photography; the holder and cropping modes are
  implemented, the cutouts are not. A product with white-background or transparent assets will read
  closest to the frame.
- The frame draws a result count and a recommendations block in the zero-result state. Neither has a
  data source on the collection route, so the empty state names the filters and offers Reset filter.
- The sort control is not drawn in the frame. It is kept in the filter sheet so sorting remains
  available without adding a second toolbar row.
