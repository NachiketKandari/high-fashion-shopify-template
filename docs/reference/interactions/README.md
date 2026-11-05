# Interaction reference

Evidence-first audits of the live Polite Society storefront and the local clone, recorded from
computed styles, ARIA snapshots, network logs and screenshots.

| Report                                                 | Scope                                                                                   |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [`global-nav.md`](./global-nav.md)                     | Announcement, header, mega menus, currency, search drawer, contact drawer, cart, footer |
| [`collection-browse.md`](./collection-browse.md)       | Collection grid, product cards, filters, sort, load more, quick view, mobile quick add  |
| [`product-detail.md`](./product-detail.md)             | Gallery, colour swatches, size availability, quantity, add to cart, tabs, sold-out      |
| [`cart-search-wishlist.md`](./cart-search-wishlist.md) | Search results, cart drawer/page, wishlist, account gate, contact, newsletter           |
| [`clone-flows.md`](./clone-flows.md)                   | The same shopper journeys against the local clone after the catalog import              |

## Colour display

The live PDP and product cards use flat colour swatches, not colour names. The PDP chips are
13.5 × 13.5 px with a selected underline; product cards use 14 × 14 px chips; collection filters
show a 16 × 16 chip next to the colour name and count. The current colour name is visually hidden.
The reference palette is mirrored in `lib/product/color-swatches.ts` because Shopify exposes no
swatch value for these products.

## Method

Each audit used a fresh headless Chromium context from a standalone `@playwright/test` script at
1440 × 900 and 390 × 844. The live site was not modified, no order was placed, and fake form data
was used only for the newsletter validation check. Screenshots live in `.playwright-mcp/`.
