# Catalog import report

Imported on 5 November 2026 from the published Polite Society storefront into the Shopify store
identified by `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`. This file is the durable record; the raw import
cache and verification JSON live in the git-ignored `.catalog-import/` directory.

## Result

| Metric             | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Source             | `https://politesocietyshop.com` published catalog                  |
| Target publication | Dummy Store Headless                                               |
| Products           | 95 of 95 published reference products                              |
| Variants           | 880                                                                |
| Images             | 709                                                                |
| Collections        | 41                                                                 |
| Memberships        | 709                                                                |
| Created / updated  | 89 created, 5 updated, 1 test-skip, 0 failed                       |
| Storefront check   | 0 missing, 0 extra, 0 variant/image/option/price/collection issues |
| Removed from store | 7 stale/demo products and 2 non-catalog collections unpublished    |

The live storefront's larger collection counts, such as `women` at 341, include unpublished or
archived products. The published catalog is the 95 products returned by the public product feed
and listed in the product sitemap.

Prices are INR in the reference. This store is USD, so prices use the live site's approximate USD
display: **₹94.83 per USD**, rounded to whole dollars. Example: Alma Lace Corset Top is **$158.00**
in both the reference's USD display and this store.

## Verification

The Storefront API was queried by handle and checked for:

- every expected product handle, with no extra product;
- every option and option-value set;
- every variant combination;
- variant images where the reference has them;
- every image count;
- every converted price;
- every collection membership set.

Result: **95/95 products, 0 product issues, 0 collection issues**. Re-run with:

```bash
pnpm import:catalog
node --env-file=.env.local .catalog-import/verify-catalog.mjs
```

The local verification artifacts are `.catalog-import/live-catalog.json`,
`.catalog-import/import-report.json`, `.catalog-import/verify-report.json`, and
`.catalog-import/verify-final.log`. They are git-ignored by design because they contain the full
scraped catalog.

## Commands

```bash
pnpm import:catalog                         # upsert from the cached catalog
pnpm import:catalog -- --refresh            # refetch the live catalog first
pnpm import:catalog -- --skip-imported      # skip products whose counts already match
pnpm import:catalog -- --collections-only   # resync collection membership only
pnpm import:catalog -- --resume             # continue after a partial run
pnpm import:catalog -- --no-media           # skip media uploads
pnpm import:catalog -- --location-id=123    # mirror inventory for a location
pnpm import:catalog -- --dry-run --limit=1  # print one transformed product
UNPUBLISH_OTHERS=1 pnpm import:catalog       # unpublish products/collections outside the catalog
```

`--ref` and `--rate` override the reference URL and INR→USD rate. Each run deletes and re-uploads
product media for products it updates, so a full refresh is slower than a collections-only pass.

The script is `scripts/import-live-catalog.mjs`; the original twelve-product design-study seeder
`scripts/seed-catalog.mjs` remains available but is no longer the catalog source.

## Remaining gaps

These are known and deliberate, not silent omissions. The ordered closure plan, with dependencies
and acceptance checks, is in [`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md):

1. **Inventory availability is not mirrored.** The Dev Dashboard app has `read_products`,
   `write_products`, `read_publications`, `write_publications`, `read_files`, and `write_files`, but
   not `read_locations` or `write_inventory`. All 880 variants are untracked and available. Add the
   two scopes, approve them on the store, and pass `--location-id` to mirror sold-out variants.
   The sold-out branch itself renders correctly when tested with an out-of-stock demo product.
2. **Fabric and Fit tab copy is static.** Per-product values were not imported. The PDP uses
   `components/product-detail/product-tabs.tsx` static copy for those two tabs.
3. **Collection facets are only partially configured.** The target store exposes Availability and
   Price. Product type, colour, and fabric facets need the Search & Discovery app configured in
   Shopify admin; the Storefront API returns only configured filters. The clone renders colour
   swatches for any configured facet via `lib/product/color-swatches.ts`.
4. **Checkout stops at the store password.** The cart handoff reaches
   `https://dummy-store-f0ejfuh9.myshopify.com`, but the development store's Online Store password
   gate redirects to `/password`. Disable password protection in Shopify admin to complete the
   checkout test.
5. **Currency UI differs in scope.** The reference has a client-side 56-currency selector; the clone
   has a two-currency display selector (USD/INR at a fixed rate). Prices convert in the browser;
   Shopify cart totals and checkout remain in the store currency, USD.
6. **Gallery presentation differs.** The reference stacks the desktop gallery and opens a lightbox;
   the clone uses a stacked desktop grid, a mobile snap carousel and a lightbox with no thumbnail
   strip, previous/next controls or image counter. Image URLs now request a 1920 px Shopify CDN
   rendition so oversized source images do not time out the image optimizer.
7. **Checkout provider differs.** The reference's India traffic uses a GoKwik overlay; the clone
   hands off to Shopify checkout.

## Interaction reports

The live-site and clone interaction audits are in
[`docs/reference/interactions/`](./reference/interactions/README.md):

- `global-nav.md`
- `collection-browse.md`
- `product-detail.md`
- `cart-search-wishlist.md`
- `clone-flows.md`

The ready-to-read design-specific findings and open questions are in those reports; the catalog
gaps above are the only catalog-level follow-ups.

## UniPlus draft catalog

The client UniPlus workbook has a separate normalized source and importer. It creates 39 products
and 354 variants as DRAFT, uploads 86 local image slots, and never publishes or modifies the
Polite Society catalog. See [`UNIPLUS-IMPORT.md`](./UNIPLUS-IMPORT.md) for commands and
[`CATALOG-AUDIT-UNIPLUS.md`](./CATALOG-AUDIT-UNIPLUS.md) for the client-input list.
