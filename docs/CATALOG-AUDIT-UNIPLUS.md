# UniPlus catalog audit

Audit status: 7 November 2026. Publication update: 10 November 2026.

Source: `UniPlus_Product_Catalog.xlsx` (`Catalog` and `Notes`), the labelled photoshoot folder
`Lorum Ipsum resources`, and its `labels_mapping.csv`. Reference standard:
[`PRODUCT-DATA-REQUIREMENTS.md`](./PRODUCT-DATA-REQUIREMENTS.md) §1–§14. Target:
`dummy-store-f0ejfuh9.myshopify.com` (USD at audit time; now INR). Existing Polite Society and demo
products are out of
scope and are not modified.

## Publication update

**27 of 39 products are `ACTIVE` and published to the `Lorem Ipsum` storefront channel; 12 remain
`DRAFT`.** The 27 published products have a photo for every colourway and are the membership of
`/collections/new-in`. Prices are final INR values. Composition, care and fit remain blank, but the
PDP renders those tabs from static storefront copy, so they are not launch blockers for this
catalogue.

Ten drafts are held back for missing imagery:

- No product photos: `cover-belted-slit-pants`, `pinstriped-bralette`, `crush-linen-bralette`,
  `corset-back-hide-t-shirt`, `slit-racer-back-shirt`.
- Missing one or more colour photos: `mini-chipped-skirt`, `double-mesh-skirt`,
  `animal-poplin-bralette`, `rolled-twisted-racer-back`, `big-collar-slit-racer-back-shirt`.

Two more are held back because the available photo shows the wrong garment:

- `armani-t-shirt`: the only wine photo is a camp-collar shirt, not a t-shirt.
- `rouched-baby-tee`: the White colourway uses a white bralette photo, not the rouched tee.

The full publication and manual Shopify steps are in
[`UNIPLUS-IMPORT.md`](./UNIPLUS-IMPORT.md#manual-shopify-admin-steps).

## Verdict at audit time

- **39 products, 59 colourways, 354 variant rows, 6 assumed sizes.**
- **0 ready for launch, 34 partial, 5 blocked.** “Partial” means product identity and variants were
  complete enough to upload as DRAFT; it did not mean launch-ready. “Blocked” meant no usable local
  image existed for the product.
- **All 39 products were launch-blocked at audit time** by missing price, composition, care and fit,
  plus missing colour hex, inventory policy and confirmed SKUs. Prices were supplied later; the
  publication decision above accepts the remaining content gaps because the PDP does not render
  them.
- **All 39 were uploaded as DRAFT** with generated SKUs and untracked inventory. Publication now
  requires complete imagery, not a full product-data record.

## Counts

| Metric                                 | Value                                               |
| -------------------------------------- | --------------------------------------------------- |
| Products                               | 39                                                  |
| Published / draft                      | 27 / 12                                             |
| Variant rows                           | 354                                                 |
| Colourways                             | 59                                                  |
| Sizes                                  | XS, S, M, L, XL, XXL (assumed, no source size data) |
| Products with at least one local image | 34                                                  |
| Products with no image                 | 5                                                   |
| Colourways with at least one image     | 47                                                  |
| Colourways with no image               | 12                                                  |
| Colourways with at least 3 images      | 9                                                   |
| Product image slots                    | 86                                                  |
| Unique local photos used               | 70                                                  |
| Collections named in the sheet         | 13                                                  |
| Source rows with a per-colour quantity | 13                                                  |
| Complete-the-look references           | 108 across 17 products; all handles resolve         |

## Field coverage

Severity uses the reference standard: **Required** is launch-blocking, **Recommended** is strongly
advised, **Optional** can follow launch. “Partial” means present but not usable without review.

### Product level (39 products)

| Field                     | Filled | Blank | Severity                | Finding                                       |
| ------------------------- | -----: | ----: | ----------------------- | --------------------------------------------- |
| `handle`                  |     39 |     0 | Required                | Complete                                      |
| `title`                   |     39 |     0 | Required                | Complete                                      |
| `product_type`            |     39 |     0 | Required                | Complete                                      |
| `vendor`                  |     39 |     0 | Required                | `UniPlus`; confirm brand name                 |
| `collections`             |     39 |     0 | Required                | Complete; 13 handles                          |
| `tags`                    |     39 |     0 | Recommended             | Complete                                      |
| `seo_title`               |     39 |     0 | Recommended             | Present but templated                         |
| `seo_description`         |     39 |     0 | Recommended             | Present but templated                         |
| `country_of_origin`       |     39 |     0 | Required                | `India` assumed; confirm                      |
| `composition`             |      0 |    39 | Required                | **Launch-blocking**                           |
| `lining`                  |      0 |    39 | Required when lined     | Unknown; **launch-blocking if applicable**    |
| `trims`                   |      0 |    39 | Required                | Unknown                                       |
| `care`                    |      0 |    39 | Required                | **Launch-blocking**                           |
| `care_warnings`           |      0 |    39 | Recommended             | Blank                                         |
| `fit`                     |      0 |    39 | Required                | **Launch-blocking**                           |
| `model_height`            |      0 |    39 | Recommended             | Blank                                         |
| `model_size`              |      0 |    39 | Recommended             | Blank                                         |
| `garment_measurements`    |      0 |    39 | Required per size chart | **Launch-blocking at category level**         |
| `size_chart_category`     |     39 |     0 | Required                | Complete                                      |
| `short_description`       |     39 |     0 | Required                | One boilerplate sentence                      |
| `long_description`        |     39 |     0 | Required                | Identical to the short description on all 39  |
| `styling_notes`           |      0 |    39 | Optional                | Blank                                         |
| `complete_the_look`       |     17 |    22 | Recommended             | 108 references; mutual pairings need approval |
| `badges`                  |      0 |    39 | Optional                | Blank                                         |
| `preorder_date`           |      0 |    39 | Optional                | Blank                                         |
| `manufacturer`/`importer` |      0 |    39 | Recommended (EU legal)  | Not represented in the sheet                  |

### Colour level (59 colourways)

| Field              | Filled | Blank | Severity    | Finding                                                          |
| ------------------ | -----: | ----: | ----------- | ---------------------------------------------------------------- |
| `colour_name`      |     59 |     0 | Required    | Complete; includes combined and reversible names                 |
| `colour_family`    |     59 |     0 | Required    | 10 `MULTICOLOUR`, 3 YELLOW aliases; vocabulary needs approval    |
| `colour_hex`       |      0 |    59 | Required    | **Launch-blocking**; no swatches                                 |
| `source_quantity`  |     13 |    46 | Audit only  | Per-colour source quantity, not per-size inventory               |
| `image_front`      |     38 |    21 | Required    | **Launch-blocking**; 9 colourways have another view but no front |
| `image_back`       |     33 |    26 | Required    | **Launch-blocking**; 26 colourways have no back                  |
| `image_detail`     |      2 |    57 | Recommended | Only two detail shots                                            |
| `image_styled`     |     13 |    46 | Recommended | 13 styled shots                                                  |
| Any image          |     47 |    12 | Required    | **Launch-blocking** for 12 colourways                            |
| At least 3 images  |      9 |    50 | Required    | **Launch-blocking**; image minimum is 3 per colour               |
| `image_alt`        |     47 |    12 | Required    | One alt per colourway; 86 image slots reuse 47 generic strings   |
| `match_confidence` |     59 |     0 | Audit only  | 6 high, 28 medium, 13 low, 12 unmatched                          |

### Variant level (354 variants)

| Field              | Filled | Blank | Severity    | Finding                                         |
| ------------------ | -----: | ----: | ----------- | ----------------------------------------------- |
| `size`             |    354 |     0 | Required    | XS–XXL assumed for every colourway              |
| `other_option`     |      0 |   354 | Recommended | No second option                                |
| `sku`              |      0 |   354 | Required    | **Launch-blocking**; 354 generated `UNI-…` SKUs |
| `barcode`          |      0 |   354 | Optional    | Blank                                           |
| `price`            |      0 |   354 | Required    | **Launch-blocking**; importer writes `0.00`     |
| `compare_at_price` |      0 |   354 | Optional    | Blank                                           |
| `inventory`        |      0 |   354 | Required    | **Launch-blocking**; imported untracked         |
| `continue_selling` |    354 |     0 | Required    | `No` on every row; imported as `DENY`           |
| `weight`           |      0 |   354 | Recommended | Blank                                           |
| `dimensions`       |      0 |   354 | Recommended | Blank                                           |
| `hs_code`          |      0 |   354 | Recommended | Blank                                           |

## Per-product readiness

Common to all 39 rows: missing **price**, **composition**, **care**, **fit**, **colour hex**,
**inventory policy**, **confirmed SKU** and **confirmed size run**. The “Additional blockers” column
lists only product-specific launch blockers.

| Product (`handle`)                 | Title                            | Colours | Variants | Images | Colours with image | Zero-image colours | Additional blockers                                     | Verdict |
| ---------------------------------- | -------------------------------- | ------: | -------: | -----: | -----------------: | ------------------ | ------------------------------------------------------- | ------- |
| `tucked-jacket`                    | Tucked Jacket                    |       3 |       18 |      3 |                3/3 | —                  | below 3 per colour; no front on Grey                    | partial |
| `dawg-t-shirt`                     | Dawg T-Shirt                     |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `armani-t-shirt`                   | Armani T-Shirt                   |       1 |        6 |      1 |                1/1 | —                  | below 3; no front                                       | partial |
| `tucked-shirt`                     | Tucked Shirt                     |       2 |       12 |      7 |                2/2 | —                  | —                                                       | partial |
| `shoulder-padded-shirt`            | Shoulder Padded Shirt            |       2 |       12 |      4 |                2/2 | —                  | below 3 per colour                                      | partial |
| `pinstriped-pants`                 | Pinstriped Pants                 |       1 |        6 |      1 |                1/1 | —                  | below 3 per colour                                      | partial |
| `formal-joggers`                   | Formal Joggers                   |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `box-pleated-pants`                | Box Pleated Pants                |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `rouched-black-pants`              | Rouched Black Pants              |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `cover-belted-pants`               | Cover Belted Pants               |       1 |        6 |      1 |                1/1 | —                  | below 3 per colour                                      | partial |
| `velvet-denims`                    | Velvet Denims                    |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `pinstriped-boxers`                | Pinstriped Boxers                |       1 |        6 |      1 |                1/1 | —                  | below 3 per colour                                      | partial |
| `black-checkered-boxers`           | Black Checkered Boxers           |       1 |        6 |      1 |                1/1 | —                  | below 3 per colour                                      | partial |
| `box-pleated-denims`               | Box Pleated Denims               |       1 |        6 |      3 |                1/1 | —                  | —                                                       | partial |
| `cover-belted-slit-pants`          | Cover Belted Slit Pants          |       1 |        6 |      0 |                0/1 | Oat                | no image; unmatched colour                              | blocked |
| `knotted-back-maxi-skirt`          | Knotted Back Maxi Skirt          |       1 |        6 |      3 |                1/1 | —                  | —                                                       | partial |
| `mini-chipped-skirt`               | Mini Chipped Skirt               |       3 |       18 |      3 |                1/3 | Brown, Black       | no image on 2 colours; unmatched colours                | partial |
| `double-mesh-skirt`                | Double Mesh Skirt                |       2 |       12 |      3 |                1/2 | Black              | no image; unmatched colour                              | partial |
| `micro-pleated-shorts`             | Micro Pleated Shorts             |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour; YELLOW family absent                | partial |
| `macro-box-pleated-shorts`         | Macro Box Pleated Shorts         |       1 |        6 |      3 |                1/1 | —                  | —                                                       | partial |
| `racer-back-mini-dress`            | Racer Back Mini Dress            |       1 |        6 |      2 |                1/1 | —                  | below 3; no front                                       | partial |
| `racer-back-maxi-dress`            | Racer Back Maxi Dress            |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `pinstriped-bralette`              | Pinstriped Bralette              |       1 |        6 |      0 |                0/1 | Blue & White       | no image; unmatched colour; MULTICOLOUR family          | blocked |
| `crush-linen-bralette`             | Crush Linen Bralette             |       1 |        6 |      0 |                0/1 | Creme              | no image; unmatched colour                              | blocked |
| `shimmered-linen-bralette`         | Shimmered Linen Bralette         |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `animal-poplin-bralette`           | Animal Poplin Bralette           |       3 |       18 |      2 |                1/3 | Brown, Black       | no image on 2 colours; unmatched colours                | partial |
| `two-way-bodysuit`                 | Two Way Bodysuit                 |       3 |       18 |      7 |                3/3 | —                  | below 3 per colour; reversible colourways need approval | partial |
| `corset-back-elevated-t-shirt`     | Corset Back Elevated T-Shirt     |       2 |       12 |      3 |                2/2 | —                  | below 3; no front on White                              | partial |
| `corset-back-hide-t-shirt`         | Corset Back Hide T-Shirt         |       1 |        6 |      0 |                0/1 | Cowhide & Black    | no image; unmatched colour; MULTICOLOUR family          | blocked |
| `rolled-twisted-racer-back`        | Rolled & Twisted Racer Back      |       2 |       12 |      2 |                1/2 | Brown              | no image; below 3; unmatched colour                     | partial |
| `ribbed-racer-back`                | Ribbed Racer Back                |       3 |       18 |      3 |                3/3 | —                  | below 3; no front on all three colours                  | partial |
| `formal-racer-back`                | Formal Racer Back                |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `delicate-satin-racer-back`        | Delicate Satin Racer Back        |       2 |       12 |      2 |                2/2 | —                  | below 3; no front on both colours                       | partial |
| `slit-back-polo-top`               | Slit Back Polo Top               |       2 |       12 |      4 |                2/2 | —                  | below 3 per colour                                      | partial |
| `rouched-baby-tee`                 | Rouched Baby Tee                 |       2 |       12 |      3 |                2/2 | —                  | below 3 per colour                                      | partial |
| `rouched-baby-tee-sleeveless`      | Rouched Baby Tee Sleeveless      |       1 |        6 |      2 |                1/1 | —                  | below 3 per colour                                      | partial |
| `slit-racer-back-shirt`            | Slit Racer Back Shirt            |       1 |        6 |      0 |                0/1 | Lemon Yellow       | no image; unmatched colour; YELLOW family absent        | blocked |
| `big-collar-laced-shirt`           | Big Collar Laced Shirt           |       1 |        6 |      1 |                1/1 | —                  | below 3 per colour                                      | partial |
| `big-collar-slit-racer-back-shirt` | Big Collar Slit Racer Back Shirt |       3 |       18 |      3 |                2/3 | Brown              | no image; below 3; unmatched colour                     | partial |

## Data-quality issues

1. **Duplicate UID references.** `labels_mapping.csv` has 92 rows for 79 UIDs; 13 UIDs have a
   `_copy` duplicate. The import uses the first non-copy file. In the workbook, 70 unique photos
   fill 86 product image slots; 16 UIDs are shared by two products, for example U79 (Tucked Jacket
   and Cover Belted Pants), U58 (Dawg T-Shirt and Pinstriped Pants), U25 (Shoulder Padded Shirt and
   Box Pleated Denims), U11/U15 (Velvet Denims and Shimmered Linen Bralette) and U20/U23 (Macro Box
   Pleated Shorts and Rouched Baby Tee). A shared photo cannot prove both products.
2. **Unmatched colours (12 colourways).** Cover Belted Slit Pants/Oat, Mini Chipped Skirt/Brown,
   Mini Chipped Skirt/Black, Double Mesh Skirt/Black, Pinstriped Bralette/Blue & White, Crush Linen
   Bralette/Creme, Animal Poplin Bralette/Brown, Animal Poplin Bralette/Black, Corset Back Hide
   T-Shirt/Cowhide & Black, Rolled & Twisted Racer Back/Brown, Slit Racer Back Shirt/Lemon Yellow,
   Big Collar Slit Racer Back Shirt/Brown. These have no matching photo in the shoot.
3. **Assumed size run.** Every product is expanded to XS–XXL with no source size data. Bralettes,
   boxers and some relaxed styles are likely One Size or a shorter run; confirm per product. The
   source quantity column is a per-colour total, not per-size inventory (13 colourways populated).
4. **Colour families without a vocabulary entry.** YELLOW is absent, so Lemon Yellow and Butter
   Yellow (3 colourways) are mapped to ORANGE. MULTICOLOUR is also absent from the allowed list but
   is used on 10 colourways (combined prints and reversible two-tone styles). Aliases Wine→RED,
   Oat/Creme/Beige Gold→BEIGE, Ink Blue→DENIM, Onion Pink→PINK, Jet Black→BLACK and Off White→WHITE
   also need client approval.
5. **Unisex merges (4 products).** Dawg T-Shirt, Shoulder Padded Shirt, Formal Joggers and Velvet
   Denims combine menswear and womenswear rows into one product. Confirm whether they are one
   unisex product or separate gendered products with separate handles.
6. **Combined-colour splitting.** Three products (Mini Chipped Skirt, Animal Poplin Bralette, Big
   Collar Slit Racer Back Shirt) split the source value `Brown,black&white` into Brown, Black and
   Black & White. Only Black & White has a photo; Brown and Black are unmatched. Pinstriped
   Blue & White is deliberately kept as one colourway, and the three reversible Two Way Bodysuit
   colourways are kept as one colourway each; both decisions need confirmation.
7. **Zero-image products (5) and colourways (12).** Five products have no usable image at all; 12 of
   59 colourways have none. They cannot be merchandised as-is.
8. **Image minimum.** 50 of 59 colourways have fewer than three images: 18 have one, 20 have two and
   the remaining 12 have none. Nine colourways have an image but no front view. Front images are
   missing on 21 colourways, back images on 26.
9. **Alt text is generic.** 86 image slots reuse 47 alt strings, all of the form
   `<title> in <colour>, front view`, including back, detail and styled shots. Alt text needs to
   describe the actual view and garment.
10. **Descriptions and SEO are boilerplate.** All 39 short descriptions equal their long
    descriptions; SEO titles and descriptions are templated from the title and colour. They are
    placeholders, not launch copy.
11. **Complete-the-look is a first pass.** 108 references across 17 products, all resolving to
    catalog handles, but some are mutual (for example Tucked Jacket ↔ Cover Belted Pants) and need
    merchandising approval.
12. **Image rights are undocumented.** The local folder is client-supplied; usage rights,
    photographer credits and paid-media permissions are not recorded.

## Image resolution

- All 70 Google Drive file links in the workbook were matched to the labelled local folder by the
  UIDs in `match_notes` and the descriptive filenames. The Drive URLs are not downloadable and are
  not stored in the fixture.
- 70 unique UIDs resolve to existing local files. No UID is unresolved.
- Four UID assignments are inferred from context rather than an explicit UID in the workbook:
  U27 (Box Pleated Denims styled), U29 (Shoulder Padded Shirt styled), U31 (Box Pleated Denims
  back) and U67 (Tucked Shirt styled). They are flagged as `uidInferred` in the fixture.
- Nine local UIDs are unused: U01–U03 (flowcharts), U41 (mint racerback outfit), U44/U45 (extra
  black-tee skirt shots), U69 (black shirt + cream trousers), U72 (white open shirt) and U74 (white
  shirt + grey trousers back).

## Launch blockers and exact client inputs

| Field / decision              | Missing                                         | Client input needed                                                            |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Price                         | 354 variants                                    | Price per variant in USD, or a confirmed price per product/colour              |
| Composition                   | 39 products                                     | Fibre percentages, lining and trims                                            |
| Care                          | 39 products                                     | Wash, dry, iron, bleach and dry-clean instructions                             |
| Fit                           | 39 products                                     | Fit type (for example true to size, relaxed, bodycon)                          |
| Colour hex / swatch           | 59 colourways                                   | Hex value or swatch image per colour                                           |
| Inventory / do-not-track      | 354 variants                                    | Quantity per variant or explicit “do not track”                                |
| SKU                           | 354 variants                                    | Confirm the generated `UNI-<HANDLE>-<COLOUR>-<SIZE>` codes or supply real SKUs |
| Size run                      | 39 products                                     | Confirm XS–XXL or per-product sizes, including One Size                        |
| Images                        | 12 colourways none; 50 below 3; 9 without front | Front and back per colour, plus one detail or styled image                     |
| Alt text / view mapping       | 86 image slots                                  | View-specific alt text, or approve generated descriptions                      |
| Colour-family vocabulary      | 3 YELLOW + 10 MULTICOLOUR + aliases             | Approve YELLOW, MULTICOLOUR and the alias mapping                              |
| Unmatched colours             | 12 colourways                                   | Supply photos or remove the colourways                                         |
| Unisex merges                 | 4 products                                      | Confirm one unisex product or split by gender                                  |
| Combined / reversible colours | 3 split products + 3 reversible colourways      | Confirm the split and the two-tone naming                                      |
| Manufacturer / importer       | 39 products                                     | Legal name and address for EU GPSR and similar rules                           |
| Image rights                  | 39 products                                     | Usage rights, territory, duration and photographer credit                      |
| Long description              | 39 products                                     | Product story and construction bullets                                         |
| SEO title / description       | 39 products                                     | Unique 50–60 character titles and 150–160 character descriptions               |
| Weight / dimensions / HS code | 354 variants                                    | Shipping weight, packed dimensions and HS code                                 |
| Size chart measurements       | 39 products                                     | Body and garment measurements by category                                      |

## Import readiness

The normalized source is `scripts/data/uniplus-catalog.json`; it carries one row per variant,
product-level fields, ordered images per product and per colour, source UIDs, generated SKUs and
readiness flags. The import, publication and verification commands are in
[`UNIPLUS-IMPORT.md`](./UNIPLUS-IMPORT.md). All 39 products are in Shopify with 354 variants and 86
image slots; Admin verification passed for products, variants, options, images, SKUs, prices and
collection memberships. 27 are `ACTIVE` and published to the `Lorem Ipsum` channel; 12 remain
`DRAFT`: ten for missing imagery and two for a wrong garment photo.
