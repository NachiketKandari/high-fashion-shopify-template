# Clone storefront flows — after the catalog import

Checked against `http://localhost:3000` on 5 November 2026 with the imported 95-product catalog.

## Route results

| Surface                  | Result                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 95 product URLs          | `200` for all 95; no product route failed.                                                                          |
| 41 reference collections | `200` for all 41. `/collections/women` renders 40 cards after hydration.                                            |
| `/collections/all`       | `200`; 40 cards in the first page.                                                                                  |
| `/search?q=corset`       | `200`; 25 cards; heading `Search for "corset"`.                                                                     |
| `/`                      | `200`; campaign, category tiles and the Our Picks rail render.                                                      |
| `/cart`                  | `200`.                                                                                                              |
| `/collections/bottoms`   | `200`, but renders the not-found boundary; the stale collection is unpublished and no navigation link points to it. |

Collection card counts from the server response: `corsets` 19, `all`/`tops`/`women`/`essentials`
40, `chapter-x` 30, `evening` 24, `co-ord-sets` 23, `bottoms-women` 20, `core` 18, `unisex-1` and
`signature` 17, `work-wear` 15, `dresses-and-jumpsuits` and `weekend` 14, `shirts-and-tshirts` 11,
`festive` 10, `knits` 8, `bottoms-unisex` 5, `outerwear` 3, `accessories` 2.

All product and collection membership, variant, option, image and price checks pass against the
Storefront API: 95 of 95 products, zero missing or extra products, zero product or collection
mismatches.

## Product detail

- `ALMA LACE CORSET TOP` renders at `$158.00`, matching the reference's approximate USD display.
- Colour is shown as three flat colour boxes, not names. Selecting `BURNT ORANGE` changes the
  selected chip, the URL (`?Colour=BURNT+ORANGE&Size=XS`) and the gallery to the Burnt Orange image.
- Size is text, not image swatches: `XS S M L XL XXL` plus a size-guide control.
- Tabs, quantity, add-to-cart, related products and the wishlist control render.
- A sold-out demo product (temporarily published, then unpublished) renders an `Out of Stock`
  button and `OUT OF STOCK` overlay, so the sold-out branch works.
- The 11.6 MB Iris source PNG exceeded the local image optimizer timeout and returned `504`. Image
  URLs now request a 1920 px Shopify CDN rendition; the same transform returns `200` at 1.16 MB and
  the gallery renders. The fix applies to every Shopify image wider than 1920 px.

## Cart

- Add to cart opens the drawer with `ALMA LACE CORSET TOP / BROWN / XS / $158.00`.
- The cart survives a full reload with the same line item and subtotal.
- Remove returns the drawer to `CART (0)` and the empty state.
- Checkout leaves the storefront for the Shopify store, but the development store's Online Store
  password gate intercepts it at `https://dummy-store-f0ejfuh9.myshopify.com/password`. The cart
  handoff itself is correct; password protection is a Shopify admin setting.

## Mobile

- 390 × 844: no horizontal page overflow (`scrollWidth === innerWidth`).
- The menu drawer opens, exposes 61 navigation links, and shows the USD/INR currency selector.
- Product cards show colour dots and size text; the PDP stacks the gallery as on the reference.

## Differences from the live reference

- The live store has a client-side 56-currency selector; the clone has a display-only USD/INR
  selector. Rendered prices convert at a fixed rate, but cart totals and checkout remain USD.
- The live India checkout opens GoKwik; the clone hands off to Shopify checkout.
- The live PDP gallery is a stacked desktop column with a lightbox; the clone uses a stacked desktop
  grid, a mobile snap carousel and a lightbox with no thumbnail strip, previous/next controls or
  image counter.
- Inventory availability and per-product Fabric/Fit tab copy are not imported; all variants are
  untracked and the Fabric/Fit tabs use static copy.
- The collection filter sheet exposes Availability and Price. The live reference also exposes
  product type, colour and fabric facets because its Search & Discovery app is configured; those
  facets are store configuration, not catalog data, and must be set up in Shopify admin.
- Search/cart/wishlist interaction details are recorded in the live reports beside this file.
