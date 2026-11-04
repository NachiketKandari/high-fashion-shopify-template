# Flow reference index

Every screenshot is a full-resolution capture from the live reference at the viewport named in
the file. Screenshots use real data and the reference's own newsletter timing, cart contents and
search results. Use them with [DESIGN.md](./DESIGN.md).

## Desktop — 1440 × 1000

| #   | Flow                     | Screenshot                                                   | What it covers                                                |
| --- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------- |
| 01  | Homepage, first viewport | [01-home-desktop.jpg](./01-home-desktop.jpg)                 | Announcement, large masthead, nav, utilities, full-bleed hero |
| 02  | Homepage, full page      | [home-desktop-full.jpg](./home-desktop-full.jpg)             | Hero → 2-up → Our Picks rail → 3-up → link tiles → footer     |
| 03  | Hero                     | [home-hero.jpg](./home-hero.jpg)                             | 1440 × 784 crop, image treatment                              |
| 04  | Two-up editorial         | [home-media-2up.jpg](./home-media-2up.jpg)                   | 2 × 720 × 893 tiles, bottom-left labels                       |
| 05  | Our Picks rail           | [home-bestsellers.jpg](./home-bestsellers.jpg)               | Rail header, arrows, 5 cards, swatches, sizes, wishlist       |
| 06  | Three-up editorial       | [home-media-3up.jpg](./home-media-3up.jpg)                   | 3 × 480 × 557 tiles, labels                                   |
| 07  | Link tiles               | [home-link-tiles.jpg](./home-link-tiles.jpg)                 | 4 square tiles with labels                                    |
| 08  | Footer                   | [footer.jpg](./footer.jpg)                                   | Address, wordmark, 4 link groups, newsletter, payments        |
| 09  | Mega menu — Woman        | [flow-mega-menu-woman.jpg](./flow-mega-menu-woman.jpg)       | 3 link columns + 2 portrait tiles, open state                 |
| 10  | Newsletter popup         | [flow-newsletter-modal.jpg](./flow-newsletter-modal.jpg)     | Modal, input, subscribe, dismissal                            |
| 11  | Search drawer, empty     | [flow-search-overlay.jpg](./flow-search-overlay.jpg)         | 440px drawer, close, search input                             |
| 12  | Search drawer, “corset”  | [flow-search-results.jpg](./flow-search-results.jpg)         | Suggestions, product thumbnails, collections                  |
| 13  | Contact drawer           | [flow-contact-modal.jpg](./flow-contact-modal.jpg)           | WhatsApp, call, email, flagship store rows                    |
| 14  | Collection page          | [collection-desktop.jpg](./collection-desktop.jpg)           | Compact header, title, chips, toolbar, 4-col grid             |
| 15  | Filter drawer            | [flow-filter-drawer.jpg](./flow-filter-drawer.jpg)           | Price, product type, colour, fabric, apply                    |
| 16  | Product detail           | [product-desktop.jpg](./product-desktop.jpg)                 | 50/50 split, stacked gallery, swatches, sizes, tabs           |
| 17  | Cart drawer, empty       | [flow-cart-drawer-empty.jpg](./flow-cart-drawer-empty.jpg)   | Empty state, explore collections                              |
| 18  | Cart drawer, filled      | [flow-cart-drawer-filled.jpg](./flow-cart-drawer-filled.jpg) | Free shipping, line item, quantity, subtotal, checkout        |
| 19  | Cart page                | [cart-page-desktop.jpg](./cart-page-desktop.jpg)             | Two-column cart, order summary, footer                        |

`flow-cart-drawer-added.jpg` is the transition frame after add-to-cart; it is useful for the
drawer enter animation and the optimistic line-item state.

## Mobile — 390 × 844

| #   | Flow                     | Screenshot                                       | What it covers                                       |
| --- | ------------------------ | ------------------------------------------------ | ---------------------------------------------------- |
| 20  | Homepage, first viewport | [mobile-home.jpg](./mobile-home.jpg)             | Announcement, icon header, portrait hero             |
| 21  | Homepage, full page      | [mobile-home-full.jpg](./mobile-home-full.jpg)   | Stacked editorial sections and rail                  |
| 22  | Menu drawer              | [flow-mobile-menu.jpg](./flow-mobile-menu.jpg)   | Primary links, chevrons, currency/account footer     |
| 23  | Collection               | [mobile-collection.jpg](./mobile-collection.jpg) | Title, scrollable chips, filter/sort row, 2-col grid |
| 24  | Product detail           | [mobile-product.jpg](./mobile-product.jpg)       | Full-width gallery with dots, title/price/options    |

## Tablet — 768 × 1024

The tablet layout is the compact header plus 3-column PLP grid. It shares the mobile header and
desktop card anatomy; no separate screenshot is stored because the breakpoint rules are captured
in DESIGN.md.

## Flows intentionally not screenshotted

| Flow                 | Why                                       | Reference behaviour                                 |
| -------------------- | ----------------------------------------- | --------------------------------------------------- |
| Checkout             | Shopify-hosted, account/address dependent | Redirects to Shopify checkout with the cart         |
| Account sign-in      | Shopify Customer Account OAuth            | Redirects to hosted account login                   |
| Wishlist | Requires a saved session on the reference | `/pages/wishlist` with empty state and product grid; the prototype keeps saved products in local storage at `/wishlist` |
| Order status         | Tokenised Shopify URL                     | Hosted order status page                            |
| Payment failure      | Requires a live checkout                  | Shopify-hosted error UI                             |
| Sold-out add to cart | State depends on live inventory           | Button disables; sold-out label remains             |
| Size guide           | Same drawer anatomy as filter/search      | 720px drawer with “Find my size” form and tables    |

## How this was captured

Playwright, 1440 × 1000 / 390 × 844, desktop Chrome. Computed styles were read from
`getComputedStyle` and element rectangles, not inferred. The newsletter popup appears after five
seconds; it was dismissed before section captures and captured separately. The cart drawer was
filled by adding `ALMA LACE CORSET TOP` (BROWN / XS) from the product page. The collection and
product pages were captured after the announcement/header settled.
