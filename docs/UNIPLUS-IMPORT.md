# UniPlus catalog import and publication

The UniPlus catalog is a separate client catalog imported from
`UniPlus_Product_Catalog.xlsx` and the labelled `Lorum Ipsum resources` photoshoot folder. The
normalized source is `scripts/data/uniplus-catalog.json`; the importer is
`scripts/import-uniplus-catalog.mjs`; the storefront publisher is
`scripts/publish-uniplus-catalog.mjs`.

## Current state

| Metric        | Value                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Products      | 39 total: 27 `ACTIVE` and published, 12 `DRAFT`                                                             |
| Variants      | 354                                                                                                         |
| Colourways    | 59                                                                                                          |
| Images        | 86 product image slots from 70 unique local photos                                                          |
| Collections   | 13; all published to the storefront channel                                                                 |
| Prices        | Final category-based INR values (₹4,000–₹20,900); no reprice is pending                                     |
| Sales channel | `Lorem Ipsum` (`gid://shopify/Publication/228076519522`), the channel the Next.js storefront reads          |
| New In        | `/collections/new-in` contains the 27 published products; the header `New In` link and home hero point here |

The publisher replaced the 12 reference products that were previously in New In; those products
remain in their other collections. The 27 published UniPlus products have at least one image for
every colourway. Ten drafts are held back for missing imagery:

| Product (`handle`)                 | Missing imagery   |
| ---------------------------------- | ----------------- |
| `cover-belted-slit-pants`          | No product images |
| `pinstriped-bralette`              | No product images |
| `crush-linen-bralette`             | No product images |
| `corset-back-hide-t-shirt`         | No product images |
| `slit-racer-back-shirt`            | No product images |
| `mini-chipped-skirt`               | Brown, Black      |
| `double-mesh-skirt`                | Black             |
| `animal-poplin-bralette`           | Brown, Black      |
| `rolled-twisted-racer-back`        | Brown             |
| `big-collar-slit-racer-back-shirt` | Brown             |

Two more are held back because the available photo shows the wrong garment. Their reasons live in
`scripts/data/uniplus-holds.json`, and both the importer and publisher read that file:

| Product (`handle`) | Problem                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `armani-t-shirt`   | The only wine photo is a camp-collar shirt, not a t-shirt.            |
| `rouched-baby-tee` | The White colourway uses a white bralette photo, not the rouched tee. |

A product with a missing colour image is not published: the product page partitions the gallery by
colour, so the shopper would see another colour's photo under the selected colour. Add the missing
photos, then run the publisher again. `--allow-partial-colours` overrides this guard, but the
product page will be misleading. Remove a handle from `uniplus-holds.json` when its photo is fixed.

## What makes a UniPlus product visible

Product visibility needs the first three conditions; collection pages also need the fourth; every
surface needs the fifth:

1. **Status is `ACTIVE`.** A draft is invisible to the Storefront API even if it has media.
2. **Published to the `Lorem Ipsum` sales channel.** `ACTIVE` alone is not enough; the product must
   be on the publication the storefront's Storefront API token belongs to. Existing Polite Society
   products use the same channel.
3. **At least one `READY` image, and one image for every colourway.** The storefront selects the
   variant image when a colour is chosen.
4. **The collection is published** if shoppers should reach it at `/collections/<handle>`.
   `/collections/all` returns every product published to the channel, regardless of manual
   collection membership.
5. **The Next.js cache is refreshed.** Default collection and product reads use `cacheLife("max")`
   with Shopify tags. Product and collection webhooks invalidate those tags; without webhooks, a
   deploy or a manual `/api/revalidate` call is required.

A draft or unpublished product returns `null` from the Storefront API, and `/products/<handle>`
renders the 404 page.

## Image reuse

The photoshoot is outfit-based, so one frame often shows a top and a bottom. Nine image UIDs are
shared by two published products: `U79` on Tucked Jacket and Cover Belted Pants, `U58` on Dawg T-Shirt
and Pinstriped Pants, `U60` on Tucked Shirt and Rouched Black Pants, and six more pairs. The product
page uses the selected colour's variant image, so the duplicated frame is not shown twice within one
product; the repetition is across product cards. No product contains the same media URL or file hash
twice. Dedicated garment shots are required to remove the remaining cross-product repetition.

## Automated import and publishing

The default image folder is `~/UniPlus/Lorum Ipsum resources`. Override it with `--image-dir`.

```bash
# Regenerate the committed fixture from the workbook and local photos
node scripts/build-uniplus-fixture.mjs \
  --workbook="$HOME/workspace/UniPlus_Product_Catalog.xlsx" \
  --image-dir="$HOME/UniPlus/Lorum Ipsum resources"

# Inspect the import plan without calling Shopify
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --dry-run --limit=1

# Upsert products and upload local images
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --upload

# Verify products, options, media, SKUs and collection membership
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --verify-only

# Plan the storefront publication
node --env-file=.env.local scripts/publish-uniplus-catalog.mjs \
  --dry-run --replace-new-in --demote-blocked

# Publish products and collections, then make New In contain only publishable UniPlus products
node --env-file=.env.local scripts/publish-uniplus-catalog.mjs \
  --replace-new-in --demote-blocked

# Re-check the publication state without writing
node --env-file=.env.local scripts/publish-uniplus-catalog.mjs --verify-only
```

`import-uniplus-catalog.mjs` preserves the existing Shopify price by SKU when the fixture price is
blank, and it leaves an existing product's status unchanged unless `--publish` is passed. A
re-import therefore does not reset final prices or unpublish live products. `--publish` publishes
products that have media and non-zero prices; it does not update the New In collection, so use the
publisher for the launch flow.

`publish-uniplus-catalog.mjs` defaults to strict imagery: a product is blocked when any colourway
has no image. Use `--allow-partial-colours` to publish those products anyway. `--demote-blocked`
sets previously published products back to `DRAFT` and unpublishes them from the storefront
channel.

Reports are written to `.catalog-import/uniplus-report.json` and
`.catalog-import/uniplus-publish-report.json`.

## Manual Shopify admin steps

### Publish one product

1. In Shopify admin, open **Products** and search for the product handle or title.
2. Open **Media** and upload the missing photos. Add alt text that names the product, colour and
   view. Drag to set the front image first.
3. Under **Variants**, select each colour variant and assign its front image.
4. Set **Status** to **Active**.
5. In **Sales channels**, choose **Manage** and tick **Lorem Ipsum**. Save.
6. Open the live product page and check the price, the default colour image and every colour's
   image.

### Publish products in bulk

1. In **Products**, filter by **Draft** or by vendor `UniPlus`.
2. Select the products that have complete imagery.
3. Use **More actions → Set as active**.
4. Use **More actions → Add to sales channel** (or open each product's **Sales channels → Manage**)
   and select **Lorem Ipsum**.
5. Confirm the products appear at `/collections/new-in` and `/collections/all`.

Bulk actions vary slightly by admin version; the per-product **Sales channels → Manage** path is
always available.

### Add products to New In

1. Open **Products → Collections → New In**.
2. Use **Add products** and select the published UniPlus products.
3. Remove products that should no longer be in New In.
4. Under **Sales channels**, ensure **Lorem Ipsum** is ticked.
5. Save, then check `/collections/new-in`.

The automated equivalent is `publish-uniplus-catalog.mjs --replace-new-in`; it replaces the
collection membership with the publishable UniPlus set instead of appending.

### Publish a collection

1. Open **Products → Collections** and select the collection.
2. Under **Sales channels**, choose **Manage** and tick **Lorem Ipsum**.
3. Save. The collection handle is now readable at `/collections/<handle>`.

### Add or correct images

- Use a 2:3 portrait crop; 1600 px on the long edge is enough for the storefront's image sizes.
- Keep one clean front image per colour and three images per colour where possible.
- Set the variant image for every colour; the PDP uses it when the shopper changes colour.
- Alt text should follow `Product title in Colour, view`, for example
  `Tucked Jacket in Brown, front view`.
- If a colour has no photo, leave the product in draft rather than reusing another colour's image.

### Refresh the storefront cache

Shopify product and collection webhooks post to `/api/webhooks/shopify` and invalidate the product,
collection and index tags. If webhooks are not configured, either redeploy or, when
`REVALIDATE_SECRET` is set, call:

```bash
curl -X POST \
  -H "Authorization: Bearer $REVALIDATE_SECRET" \
  "https://your-store.example/api/revalidate?tag=products-index&tag=collections&tag=collections-index&tag=collection-new-in"
```

Add `tag=product-<handle>` when only one product page is stale. `cacheLife("max")` means waiting for
the cache to expire is not a reliable verification step.

## Verification checklist

- Admin: product is `ACTIVE`, `Lorem Ipsum` is listed under sales channels, media status is
  `READY`, and every colour has a variant image.
- Storefront API: `collection(handle: "new-in")` returns the expected product handles and images.
- Browser: `/collections/new-in` renders the expected cards with loaded images; `/products/<handle>`
  renders the price in INR, the default colour image and each colour's image.
- Draft: `/products/<held-back-handle>` returns the 404 page.
- Cache: after a publish, re-check the live URL rather than relying on the admin state alone.
