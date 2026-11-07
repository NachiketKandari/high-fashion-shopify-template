# UI/UX consistency audit

Date: 2026-11-08

Scope: the storefront at `http://localhost:3105`, measured with Playwright at 1440 × 1000 and
390 × 844. Routes: `/`, `/collections`, `/collections/all`, `/collections/corsets`,
`/products/alma-lace-corset-top`, `/cart` (empty and filled), `/search`, the nav mega menu, the
mobile menu, the footer, the logged-out account entry, `/pages/wishlist`, `/pages/about-us`,
`/pages/size-guide`, `/pages/care-guide`, `/blogs/journal-2`, and a 404.

Reference: `docs/DESIGN-SYSTEM.md`, `docs/DESIGN-SYSTEM-ENFORCEMENT.md`,
`docs/UX-RECON-2026-11-05.md`, `docs/reference/`.

## Findings

| #   | Route / viewport                                           | Expected                                                                                                            | Actual                                                                                                          | Root cause                                                                                                                                                                                                                                                                                                                                          | Severity | Fix                                                                                                     |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| 1   | `/pages/about-us` and every Shopify page, 1440 + 390       | Page title `type-display` 22/29; body `type-body` 14/21 300                                                         | H1 36/40, H2 24/32, body 16/28, tracking 0.8px                                                                  | `RichTextPage` renders the title inside `Prose`; `Prose` inherits Tailwind Typography defaults instead of storefront roles (`components/content/rich-text-page.tsx:15`, `components/ui/prose.tsx:8`)                                                                                                                                                | High     | Title moved into the shared page header; `Prose` now maps to `type-display`/`h2`–`h4`/`type-body` roles |
| 2   | `/cart` empty, 1440 + 390                                  | A page `h1` (`Shopping cart`) plus an empty state with one helper sentence and the same outlined action as wishlist | No `h1`; empty state began at `h2` 14/18 with no helper copy and no page shell                                  | Empty state returns before `CartPageLayout` (`components/cart/cart-page.tsx:18`) while wishlist keeps its page shell (`app/pages/wishlist/page.tsx:20`)                                                                                                                                                                                             | High     | Empty state now renders `Page`/`Container`, `h1` `Shopping cart`, helper copy, and the outlined action  |
| 3   | `/products/alma-lace-corset-top`, 1440                     | Six sizes on one row with `SIZE GUIDE` right-aligned                                                                | `XS S M L XL` on row one and `XXL` alone on row two; group 250.5px wide, 276px needed                           | 36px minimum targets plus 12px gaps plus a 64px label plus the 61px size-guide control overflow the 408px info column (`components/product-detail/option-picker.tsx:23-25`)                                                                                                                                                                         | Medium   | Label gap and option gap both reduced to 8px; all six sizes now share one row                           |
| 4   | `/collections/all` filter drawer, 1440 + 390               | Accordion sections disclose with a chevron; the drawer has one close X                                              | Every open section showed a `+` rotated 45° into an X, visually identical to the drawer close control           | `FilterSection` used a text plus sign with `group-open:rotate-45` (`components/collections/filters-client.tsx:264-269`)                                                                                                                                                                                                                             | Medium   | Replaced with a `ChevronDown` that rotates 180°, matching the mobile menu disclosure                    |
| 5   | Product cards, product page, 1440 + 390                    | Source copy sentence case: `Out of stock`, `Add to cart`                                                            | `Out of Stock` on `/collections/all`, `Out of stock` on rails/related; `Add to Cart` in PDP and gift-card forms | The same label is written in several callers instead of one variant (`components/collections/browse.tsx:94`, `components/collections/infinite-product-grid.tsx:92`, `components/product-detail/buy-buttons.tsx:60-64`, `components/product-detail/product-detail-section.tsx:372,419`, `components/product-detail/gift-card-purchase-form.tsx:142`) | Low      | All storefront labels normalised to sentence case; visual uppercase is unchanged                        |
| 6   | Cart drawer and cart page, 1440 + 390                      | Option line uses the documented separator: `BROWN · XS`                                                             | `BROWN / XS`                                                                                                    | `line-item.tsx` joins selected options with `" / "` (`components/cart/line-item.tsx:82`)                                                                                                                                                                                                                                                            | Low      | Separator changed to `·`                                                                                |
| 7   | Product page description tabs, 1440 + 390                  | Body copy uses the muted ink token `#4d4d4d`                                                                        | Paragraph colour `#364153` (Tailwind Typography neutral palette)                                                | Product tabs compose the prose plugin without a storefront colour override (`components/product-detail/product-tabs.tsx:72`)                                                                                                                                                                                                                        | Low      | `prose-p`/`prose-li` now use `text-ink-muted`                                                           |
| 8   | `/pages/about-us`, `/pages/size-guide`, `/blogs/journal-2` | Editorial content should share one reading measure                                                                  | Content columns measured 672px (about/policies), 768px (size guide), 896px (article)                            | Three page shells: `RichTextPage` (`max-w-2xl`), `ContentPage` (`max-w-3xl`), `ArticlePage` (`max-w-4xl`)                                                                                                                                                                                                                                           | Low      | Open decision — widths differ by content type; see below                                                |
| 9   | `/search`, 1440 + 390                                      | A search results page should let the shopper change the term; toolbar should match collection placement             | No search input; `Filter` sits left and `Featured` right, while collection puts both controls right             | Search renders `Browse` directly instead of the collection layout; result count is passed only on search (`app/search/page.tsx:82-101`, `components/collections/toolbar.tsx:46-58`)                                                                                                                                                                 | Medium   | Open — needs a search-field decision, not a styling fix                                                 |
| 10  | Footer, 1440                                               | Footer about 361px tall per the design system                                                                       | 404px                                                                                                           | Composition `pt-20` + 166px grid row + `mt-16` + 53px bottom row + `pb-10` (`components/footer/index.tsx:15-80`)                                                                                                                                                                                                                                    | Low      | Open — spacing decision pending design review                                                           |
| 11  | Announcement bar, 390                                      | One message at a time in a 35px bar (12/16)                                                                         | The long message wraps to two lines and exactly fills the 35px bar                                              | Fixed-height bar with unconstrained copy (`components/nav/announcement.tsx:44-56`)                                                                                                                                                                                                                                                                  | Low      | Open — either shorten mobile copy or allow one-line truncation                                          |
| 12  | `/` homepage hero, 390                                     | Hero height derives from header and announcement tokens                                                             | `h-[calc(100svh-91px)]` hardcodes 35px announcement + 56px header                                               | Hardcoded geometry (`app/page.tsx:59`)                                                                                                                                                                                                                                                                                                              | Low      | Open — no current visual defect; tokenising needs a component change                                    |
| 13  | Product card metadata, all browse surfaces                 | One price role and one card implementation                                                                          | Price uses `type-h4 font-light`; agent cards use a second `aspect-square` card with different skeleton          | No price role; two product-card implementations (`components/product-card/product-card.tsx:125`, `components/product-card/components.tsx:46`)                                                                                                                                                                                                       | Low      | Open — agent card belongs to the Eve surface                                                            |
| 14  | Page titles across index/commerce routes                   | One page-header primitive and role per route class                                                                  | `Collections`/`Search`/`Size guide` 22px; `Wishlist`/`Cart` 18px; collection pages 18px                         | Each route sets its own `h1` class; no shared page-header primitive                                                                                                                                                                                                                                                                                 | Low      | Open — 18px for commerce lists reads intentionally, but should be decided once                          |
| 15  | `/account` logged out                                      | Account entry reaches Shopify customer login                                                                        | Local dev redirects to `/account/login`, which returns 404/500 because Hydrogen requires an HTTPS OAuth origin  | Environment constraint, not a storefront defect (`proxy.ts:49`; Hydrogen `normalizeOrigin`)                                                                                                                                                                                                                                                         | Info     | Not changed; verify through an HTTPS tunnel                                                             |

Positive checks from the same pass:

- No horizontal overflow at 390px on any audited route (`scrollWidth === innerWidth`), including
  `/collections/all`; the mobile collection containment fix is effective.
- No interactive target under 36px was found in the header, main content, or footer on the audited
  routes.
- Collection grid is 4 columns with 3px column gap / 20px row gap at 1440 and 2 columns / 3px /
  24px at 390.
- Product cards are 2:3 media, title 12/16 400, price 12/16 300 muted on home, collection, search,
  wishlist, and related rails.
- Mobile menu is 753px tall below the 56px bar, keeps the header visible, locks body scroll, and
  uses 38px rows.

## Root-cause themes

1. **Typography roles are composed at the component edge, not enforced by a page shell.**
   The token layer defines good roles, but `Prose` relied on Tailwind Typography defaults, and route
   files select `type-display`, `type-h2`, or prose headings independently. That is why the same
   content page rendered 36/40 at one URL and 22/29 at another, and why body copy was 16/28 on
   Shopify pages but 14/21 on the product page. The fix was to make the prose surface consume the
   roles, but the deeper cause is the missing shared header/prose-page primitive.

2. **Duplicated implementations drift in different directions.**
   Cart empty and wishlist empty are near-identical states built in two places; one kept the page
   shell and one did not. Product cards have a storefront implementation and an agent implementation
   with different ratios and skeletons. Page bodies have three shells with three widths. The
   inconsistencies are not random: each duplicate was maintained against a different local need.

3. **Hardcoded geometry and target sizes collide at the narrowest column.**
   PDP options are 36px targets, which is correct, but the 408px info column also carries a 64px
   label and a right-aligned size-guide control. The remaining 250.5px cannot hold six 36px targets
   with 12px gaps. This is a layout-math defect, not a token defect; the smallest fix was reducing
   the gaps, not shrinking targets.

4. **The typography plugin is a second styling system.**
   `prose` neutral brings its own sizes (`h1` 2.25em, `h2` 1.5em), line heights (1.75) and palette
   (`#364153`, `#404040`). Every prose surface silently inherited those values until a component
   overrode them ad hoc. The same root cause produced the About page type drift and the product-tab
   colour mismatch.

5. **Copy is repeated beside each caller rather than owned by a variant.**
   `Out of Stock` / `Out of stock` and `Add to Cart` / `Add to cart` came from separate callers. The
   visual result is identical because of CSS uppercase, which is why the drift survived review; only
   source and screen-reader text expose it.

6. **Data-dependent rendering explains several apparent “inconsistencies.”**
   `/collections` repeats thumbnails because multiple collections point at the same product image in
   the catalog. `/cart` empty and `/account` looked different because of session and environment
   state. These should not be “fixed” in presentation without checking the data or auth contract.

## Fixes applied

- `components/content/rich-text-page.tsx` — title moved into a page header using `type-display`;
  content wrapped in the shared `Prose` surface.
- `components/ui/prose.tsx` — prose headings map to `type-h2`/`type-h3`/`type-h4`, paragraphs and
  list items to `type-body` at 300 weight and muted ink.
- `components/cart/cart-page.tsx` — empty cart now has the `Shopping cart` `h1`, helper copy, and
  the same outlined explore action as the wishlist empty state.
- `components/product-detail/option-picker.tsx` — label-to-options and option gaps reduced to 8px
  so all six sizes fit one 408px row at desktop.
- `components/collections/filters-client.tsx` — filter accordion now uses a rotating chevron instead
  of a plus that looked like a close control when open.
- `components/product-detail/buy-buttons.tsx`, `components/product-detail/product-detail-section.tsx`,
  `components/product-detail/gift-card-purchase-form.tsx`,
  `components/collections/browse.tsx`, `components/collections/infinite-product-grid.tsx` — copy
  normalised to `Add to cart` / `Out of stock`.
- `components/cart/line-item.tsx` — cart option separator is now `·`.
- `components/product-detail/product-tabs.tsx` — product description body uses `text-ink-muted`.
- `components/product-detail/size-guide.tsx`, `components/product-detail/lightbox.tsx` — custom close
  and image triggers now carry the shared `focus-ring`.
- `app/not-found.tsx` — source copy `Page not found` / `Continue shopping`.

## Remaining open decisions

1. **Editorial measure.** Should Shopify pages, utility pages, and journal articles share one column
   width? They currently measure 672 / 768 / 896px. The type now matches; only the measure differs.
2. **Search results affordance.** `/search` has no field for changing the query, and its filter
   control sits on the left while collection filter controls sit on the right. Adding a field or
   moving controls changes the browse layout, so it was left to product design.
3. **Footer height.** 404px versus the 361px contract. Reducing it means choosing which gap to
   remove (`pt-20`, `mt-16`, or the newsletter row).
4. **Mobile announcement copy.** The long message wraps to two lines inside the fixed 35px bar. The
   choice between shorter mobile copy and one-line truncation is editorial.
5. **Page title hierarchy.** Commerce list pages (`Wishlist`, `Cart`, collection pages) use 18px;
   index pages (`Collections`, `Search`, `Size guide`) use 22px. Decide whether that split is
   intentional before adding a shared page-header primitive.
6. **Agent product cards.** The agent surface uses the legacy square product card. Aligning it to
   2:3 is an Eve-owned presentation decision, not a storefront fix.
7. **Hero tokenisation.** The mobile hero uses `100svh - 91px`; replacing 91 with the announcement
   and header tokens is safe but changes a hardcoded layout dependency.

## Follow-up pass — 8 November 2026

The PDP, size guide and cart were compared again against the live reference after the first pass.
The remaining differences were implementation defects, not open decisions, and are now fixed:

- **PDP content type.** Description and static tab copy were 14/21; the reference uses 12/18 at 300
  weight. The tabs now inherit `type-body-sm`, and the PDP title uses the reference's normal
  tracking instead of `type-display`'s 0.05em.
- **Colour chips.** PDP swatches were 10 × 10 px and could render transparent when Shopify had no
  swatch value. They are now 14 × 14 px boxes with the reference hairline, and
  `getColorSwatch()` supplies the fallback for named colours and combined/reversible colourways.
- **Size guide.** The drawer always opened Tops and used label-sized headings. It now opens the
  product's category (Tops, Dresses, Bottoms, Outerwear), uses the reference heading hierarchy and
  table density, and adds the CM/IN toggle and swipe hint.
- **PDP image loading.** The first two gallery images are prefetched during idle, and non-LCP
  images are low-priority/async, so the first swipe no longer waits for a cold image optimizer.
- **Add to cart and subtotal.** The optimistic cart line already had a price, but the global
  pending flag replaced both the line price and subtotal with `Updating…` until Shopify responded.
  The line price now renders immediately, the subtotal is summed optimistically from line costs,
  and the checkout spinner only appears while a cart mutation is actually in flight.
- **Quantity subtotal.** When a line quantity is greater than one, the cart shows the unit price
  and the line total, matching the reference and making the subtotal change legible.
