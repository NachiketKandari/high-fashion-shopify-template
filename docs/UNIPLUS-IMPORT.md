# UniPlus draft import

The UniPlus catalog is a separate client catalog imported from
`UniPlus_Product_Catalog.xlsx` and the labelled `Lorum Ipsum resources` photoshoot folder. The
normalized source is `scripts/data/uniplus-catalog.json`; the importer is
`scripts/import-uniplus-catalog.mjs`. It never modifies the existing Polite Society or demo
products and never publishes UniPlus products.

## What was imported

| Metric      | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Products    | 39, all `DRAFT`                                                          |
| Variants    | 354                                                                      |
| Colourways  | 59                                                                       |
| Images      | 86 product image slots from 70 unique local photos                       |
| Collections | 13 named in the sheet; existing `bottoms`, `tops` and `bodysuits` reused |
| Prices      | Source was blank (`0.00`); on 10 November 2026 prices were derived from active category medians (₹4,000–₹20,900) so no draft is ₹0 |
| SKUs        | Generated `UNI-<HANDLE>-<COLOUR>-<SIZE>`; flagged as generated           |
| Inventory   | Untracked; `continue_selling` is `No`                                    |
| Publication | None                                                                     |

Admin verification passed at import: 39/39 products, 354/354 variants, 86/86 images, expected
`Colour`/`Size` options, DRAFT status, generated SKUs and all expected collection memberships. The
`0.00` prices were later replaced by category-derived values; the source fixture still has blank
prices, so a future importer run will reset them until the fixture or importer is updated.

The audit and client-input list is [`CATALOG-AUDIT-UNIPLUS.md`](./CATALOG-AUDIT-UNIPLUS.md).

## Commands

The default image folder is `~/UniPlus/Lorum Ipsum resources`. Override it with `--image-dir`.

```bash
# Regenerate the committed fixture from the workbook and local photos
node scripts/build-uniplus-fixture.mjs \
  --workbook="$HOME/workspace/UniPlus_Product_Catalog.xlsx" \
  --image-dir="$HOME/UniPlus/Lorum Ipsum resources"

# Inspect the plan without calling Shopify
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --dry-run --limit=1

# Upsert all 39 products, upload local images, keep every product DRAFT
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --upload

# Import in small batches if the full run is slow
node --env-file=.env.local scripts/import-uniplus-catalog.mjs \
  --only=tucked-jacket,dawg-t-shirt,armani-t-shirt --upload

# Add missing collection memberships without touching products or media
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --collections-only

# Verify existing products and collections, write the report, change nothing
node --env-file=.env.local scripts/import-uniplus-catalog.mjs --verify-only
```

The report is `.catalog-import/uniplus-report.json`. Use `--report=<path>` for another location.
`--limit` and `--only` apply to both import and verification. `--publish` is implemented but is a
no-op while any launch blocker remains; every product in this workbook is blocked by missing price,
composition, care, fit, colour hex, inventory policy or confirmed SKU.

## Import behaviour

- Upserts by handle with `productSet`; options are always `Colour` and `Size`.
- Replaces media on an updated product, then uploads local files through
  `stagedUploadsCreate` and `productSet` file inputs.
- Writes `productType`, vendor, tags, SEO, description HTML and `custom.origin`,
  `custom.composition`, `custom.care` and `custom.fit` metafields where present.
- Assigns each colourway's first image to its variants.
- Creates or ensures only the collections named in the sheet; it never removes other products from
  an existing collection.
- Requires the same Admin app credentials and scopes as `scripts/import-live-catalog.mjs`
  (`read_products`, `write_products`, `read_files`, `write_files`, `read_publications`,
  `write_publications`). No new dependency is used.
