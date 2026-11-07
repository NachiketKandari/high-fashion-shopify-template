# Media and merchandising

How product and collection imagery is selected and ordered, which parts the merchant controls in
Shopify, and which parts are still code-owned. This describes the repository as it exists on
8 November 2026.

Shopify is the merchandising source of truth. The app fetches media, collection metadata and
collection membership from the Storefront API, transforms them into domain models, and chooses a
presentation order per surface. It does not upload, crop or reorder assets; it only decides which
fetched image appears first and what the storefront shows around it.

## 1. Pipeline

1. **Shopify admin** holds product media order, alt text, the product featured image, variant
   images, collection images, collection membership and each collection's sort order. Navigation
   and the home-page tiles are not Shopify-managed today.
2. **Fragments** request the fields: `featuredImage` and `media(first: 50)` in
   `lib/shopify/fragments/product/index.ts:21` and `:28`, the variant `image` in
   `lib/shopify/fragments/variant/index.ts:25`, the collection `image` in
   `lib/shopify/fragments/collection/index.ts:10`, and `images(first: 2)` on cards in
   `lib/shopify/fragments/product/index.ts:187`.
3. **Transforms** map Shopify responses to domain types. Product media is flattened into
   `images` (images only) and the interleaved `media` list (images and videos) in
   `lib/shopify/transforms/product/index.ts:58`; variants become `ProductVariant.image` at `:142`;
   option values expose the first selectable variant's image at `:178`; cards choose their featured
   and hover images at `:197`.
4. **Caching** wraps reads, not writes. `getProduct`, `getCollectionResults`,
   `getCollectionsListing` and `getAllProductsResults` use `"use cache: remote"` and
   `cacheLife("max")` in `lib/product/server.ts:22` and `lib/collections/server.ts:64`, `:103`,
   `:126`. Product and collection webhooks invalidate those tags in
   `app/api/webhooks/shopify/route.ts:36` and `:68`.
5. **Surfaces** decide the visible order: the PDP colour slot, card featured/hover pair, collection
   grid sort, home rail slice, and the hardcoded home and navigation tiles.

## 2. Surface control table

"Shopify" means the merchant can change it in Shopify admin without a deploy. "Code" means a
repository change and redeploy.

| Surface                           | Data source                                                                                                                                                   | Ordering rule today                                                                                                                                               | Controller                                                                           | Current gap                                                                                                                                                        | Exact way to change it                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Home hero                         | `/reference/hero-desktop.jpg`, `/reference/hero-mobile.jpg` (`app/page.tsx:66`, `:74`)                                                                        | Fixed two-image art direction; links to `/collections/chapter-x` (`:58`)                                                                                          | Code                                                                                 | Not Shopify-managed; campaign swaps need a deploy                                                                                                                  | Replace the two files and the `href` in `app/page.tsx`. Future: a `home` metaobject.                                                    |
| Home editorial tiles (2)          | `EDITORIAL_TILES` (`app/page.tsx:10`)                                                                                                                         | Array order                                                                                                                                                       | Code                                                                                 | Hardcoded images, labels, links                                                                                                                                    | Edit `EDITORIAL_TILES`.                                                                                                                 |
| Home collection edits (3)         | `COLLECTION_TILES` (`app/page.tsx:19`)                                                                                                                        | Array order                                                                                                                                                       | Code                                                                                 | Hardcoded images, labels, links                                                                                                                                    | Edit `COLLECTION_TILES`.                                                                                                                |
| Home link tiles (4)               | `LINK_TILES` (`app/page.tsx:29`)                                                                                                                              | Array order                                                                                                                                                       | Code                                                                                 | Hardcoded images, labels, links                                                                                                                                    | Edit `LINK_TILES`.                                                                                                                      |
| Home product rail                 | `getCollectionResults({ handle: "bestsellers" })` (`components/product/home-product-rail.tsx:18`)                                                             | First 8 of the collection's default sort (`:22`); heading "Our Picks" and handle are fixed (`:21`)                                                                | Shopify for membership and default sort; code for collection handle, title and limit | The rail can only ever show `bestsellers`; changing the collection requires a deploy                                                                               | Set the `BESTSELLERS` collection sort order in admin (see §6). Change the handle/title/limit in `home-product-rail.tsx`.                |
| Collection cards (`/collections`) | `fetchCollectionsListing` (`lib/shopify/operations/collections/server.ts:102`)                                                                                | `collection.image`, else the first product's `featuredImage` (`:118`); collections come back in the API's default order, which is ID/creation order               | Shopify for image and membership; code for order                                     | All 41 collections have no image today, so every card shows a product image; the grid is creation order, not title or curated                                      | Upload a collection image; create collections in the desired display order (or sort in code).                                           |
| Collection page header            | `getCollection` (`lib/collections/server.ts:51`)                                                                                                              | Title and description only; the collection image is not rendered                                                                                                  | Code                                                                                 | Collection art directed in admin has no effect on the collection page                                                                                              | Add the image to `CollectionHeader` (`components/collections/collection-page.tsx:149`).                                                 |
| Collection product grid           | `fetchCollectionProducts` (`lib/shopify/operations/products/server.ts:481`)                                                                                   | Default is `COLLECTION_DEFAULT`; `manual` is also mapped to `COLLECTION_DEFAULT` (`:444`–`:451`)                                                                  | Shopify                                                                              | "Featured" means the admin sort order, not necessarily drag order; smart collections cannot use manual order                                                       | Collections > collection > **Sort order**. "Manual" makes drag order the default; "Best selling" etc. makes that the default.           |
| All-products grid                 | `fetchSearchIndexProducts` with query `*` (`lib/shopify/operations/products/server.ts:354`)                                                                   | `RELEVANCE` unless the shopper picks price (`:302`–`:306`)                                                                                                        | Shopify search relevance; code for the sort map                                      | Wildcard relevance is effectively product creation order; not merchant-curated                                                                                     | Use collection pages or Search & Discovery for curated order.                                                                           |
| Product card, featured image      | `ProductCard.featuredImage` (`components/product-card/product-card.tsx:58`)                                                                                   | Product `featuredImage`; when a colour filter is active, the matched variant image (`lib/shopify/transforms/product/index.ts:199`)                                | Shopify                                                                              | Colour filtering is not configured in this store, so the matched-variant branch is dormant                                                                         | Set the product image order and variant images; configure colour facets in Search & Discovery to activate the branch.                   |
| Product card, hover image         | `ProductCard.hoverImage` (`components/product-card/product-card.tsx:70`)                                                                                      | First image that differs from the featured image (`lib/shopify/transforms/product/index.ts:202`–`:211`)                                                           | Shopify                                                                              | Related-product cards have no hover image because that fragment requests no images (`lib/shopify/fragments/product/index.ts:141`); wishlist snapshots can be stale | Put the desired second image at position 2. Add `images(first: 2)` to the recommendation fragment if hover is wanted there.             |
| Quick shop                        | `product.featuredImage.url` (`components/product-card/product-card.tsx:107`)                                                                                  | Featured image only                                                                                                                                               | Shopify                                                                              | None                                                                                                                                                               | Change the featured image.                                                                                                              |
| PDP desktop gallery               | `ProductDetails.media` (`components/product-detail/product-detail-section.tsx:92`, `:97`)                                                                     | Selected colour image first when more than one colour has an image; then shared media in Shopify order (`components/product-detail/product-media.tsx:300`–`:315`) | Shopify for media order and variant images; code for the colour slot                 | Shared images are every image not assigned to a colour, so a colour-specific detail shot not assigned to a variant appears for all colours                         | Assign every colour-specific image as that colour's variant image, or accept the shared gallery.                                        |
| PDP mobile carousel               | Same media list (`components/product-detail/product-media.tsx:105`)                                                                                           | Same as desktop; one snap slide per media item                                                                                                                    | Same as desktop                                                                      | Same as desktop                                                                                                                                                    | Same as desktop.                                                                                                                        |
| PDP lightbox                      | The rendered gallery (`components/product-detail/lightbox.tsx`)                                                                                               | DOM order of the gallery                                                                                                                                          | Same as gallery                                                                      | No thumbnails or counter in this template                                                                                                                          | Same as gallery.                                                                                                                        |
| PDP colour picker                 | Option values (`lib/shopify/fragments/product/index.ts:86`); swatch image or first-selectable-variant image (`components/product-detail/color-picker.tsx:28`) | Shopify option-value order; swatch image beats colour beats variant image                                                                                         | Shopify; code for the name→hex fallback (`lib/product/color-swatches.ts:2`)          | Colours without a Shopify swatch and without a hardcoded name render no swatch                                                                                     | Set the swatch colour or image on the option value in admin; add a fallback name in `color-swatches.ts` only for the reference palette. |
| Cart drawer / cart page           | `line.merchandise.image` (`components/cart/line-item.tsx:86`)                                                                                                 | Variant image when the cart returns one; otherwise placeholder                                                                                                    | Shopify                                                                              | No product featured-image fallback in the component                                                                                                                | Assign the variant image (all imported variants already have one).                                                                      |
| Predictive search                 | Product `featuredImage` (`lib/search/request.ts:5`); collection image (`lib/search/client.ts:41`)                                                             | Product and collection order returned by Shopify predictive search                                                                                                | Shopify                                                                              | Collections have no image, so collection rows are text-only                                                                                                        | Set collection images.                                                                                                                  |
| Search results                    | `fetchSearchIndexProducts`                                                                                                                                    | Shopify relevance, or price when selected                                                                                                                         | Shopify                                                                              | Not curated                                                                                                                                                        | Use collection pages for curated grids.                                                                                                 |
| Wishlist                          | `localStorage["wishlist"]` snapshot (`lib/wishlist/client.ts:49`)                                                                                             | Save order, newest first; the stored `ProductCard` keeps its image and hover image                                                                                | Browser                                                                              | Images do not refresh when Shopify media changes                                                                                                                   | Re-save the item; a future Customer Account sync would refresh from Shopify.                                                            |
| Related products                  | `fetchProductRecommendations` (`lib/shopify/operations/products/server.ts:539`)                                                                               | Shopify recommendations order; featured image only                                                                                                                | Shopify                                                                              | No hover image                                                                                                                                                     | Add `images(first: 2)` to `PRODUCT_CARD_FRAGMENT` if the hover treatment is wanted.                                                     |
| PDP OG image                      | `product.featuredImage` (`app/products/[handle]/page.tsx:28`)                                                                                                 | One image, or `/og-default.png` (`:37`)                                                                                                                           | Shopify                                                                              | Only the featured image can be shared; no per-surface override                                                                                                     | Move the desired image to position 1.                                                                                                   |
| Schema.org Product                | `product.images` (`components/product-detail/schema.tsx:40`)                                                                                                  | Shopify image order; videos omitted                                                                                                                               | Shopify                                                                              | Capped by the fragment (50 today)                                                                                                                                  | Same as gallery.                                                                                                                        |
| Schema.org CollectionPage         | Title, description, dates (`components/schema/collection-schema.tsx:11`)                                                                                      | No image                                                                                                                                                          | Code                                                                                 | `image` is not emitted                                                                                                                                             | Add `collection.image` to the schema if rich results need it.                                                                           |
| Product Markdown                  | `product.images` (`lib/markdown/product/index.ts:96`)                                                                                                         | Shopify image order                                                                                                                                               | Shopify                                                                              | Capped by the fragment; videos omitted                                                                                                                             | Same as gallery.                                                                                                                        |
| Collection Markdown               | `collection.image` (`lib/markdown/collection/index.ts:23`)                                                                                                    | Single image when set                                                                                                                                             | Shopify                                                                              | All collections are unset today                                                                                                                                    | Set the collection image.                                                                                                               |
| Eve agent                         | `featuredImage` and `images` (`lib/agent/products/index.ts:34`, `:63`)                                                                                        | Featured first; images in Shopify order                                                                                                                           | Shopify                                                                              | Same cap as the PDP                                                                                                                                                | Same as gallery.                                                                                                                        |
| Navigation and footer             | `MAIN_NAV`, `FOOTER_COLUMNS` (`lib/nav/index.ts:30`, `:154`)                                                                                                  | Array order; images are local `/reference` files                                                                                                                  | Code                                                                                 | Not Shopify-managed; every link, label and tile image is a deploy                                                                                                  | Edit `lib/nav/index.ts`. Future: Shopify menus.                                                                                         |
| Collection chips                  | Seven hardcoded handles (`components/collections/collection-page.tsx:111`) filtered from `getCollections()` (`:120`)                                          | API/creation order among the included handles                                                                                                                     | Code for the set; Shopify for existence                                              | Set and order are not merchant-managed                                                                                                                             | Edit `chipHandles`; move to a Shopify menu for merchant control.                                                                        |

## 3. Ordering rules implemented today

- **Shopify media position.** `media` is read without a `sortKey`; Shopify returns it in
  merchandising position. The transform preserves that order in `media` and in `images`
  (`lib/shopify/transforms/product/index.ts:65`–`:78`).
- **Videos interleave with images.** Before this change the transform split videos into a
  separate array and `ProductMedia` concatenated videos first. `media` now keeps the admin order;
  `ProductMedia` renders it directly (`components/product-detail/product-media.tsx:315`).
- **Gallery cap.** The fragment requests 50 of Shopify's 250 allowed media
  (`lib/shopify/fragments/product/index.ts:28`). Products beyond 50 lose media silently.
- **Selected colour image first.** `hasColorImagePartitioning` requires more than one colour value
  with an image (`lib/product/index.ts:201`). When true, the selected colour image is rendered
  before shared media on both layouts (`components/product-detail/product-detail-section.tsx:92`).
  The colour image comes from the selected colour's first selectable variant image
  (`lib/product/index.ts:218`).
- **Shared-image filter.** Images whose URL equals any colour's variant image are removed from the
  shared gallery (`lib/product/index.ts:207`). The filter falls back to all media when nothing is
  left, so a product with only colour images repeats the selected image rather than showing an
  empty gallery.
- **Card featured/hover pair.** Featured is the product featured image (or colour-matched variant
  image); hover is the first image that differs from it (`lib/shopify/transforms/product/index.ts:197`).
- **Collection sort.** Missing sort and `MANUAL` both request `COLLECTION_DEFAULT`
  (`lib/shopify/operations/products/server.ts:444`). "Featured" therefore means whatever sort
  order the collection has in admin.
- **Collections index.** The reads default to 250 collections (`lib/shopify/operations/collections/server.ts:87`,
  `:103`) and the query has no `sortKey` (`:43`), so Shopify returns creation order. Observed order
  matched ascending collection IDs.
- **Home rail.** First 8 of `bestsellers` in `COLLECTION_DEFAULT`
  (`components/product/home-product-rail.tsx:18`–`:22`).
- **Search.** `*` with `RELEVANCE` for `/collections/all`
  (`lib/shopify/operations/products/server.ts:302`).
- **Navigation.** Code array order (`lib/nav/index.ts:30`).

## 4. Current control matrix

| Area                           | Shopify-managed today              | Code-owned today                                                                  |
| ------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------- |
| Product gallery order          | Media position, including videos   | 50-item cap; colour slot; shared filter                                           |
| Product first image / OG image | `featuredImage`                    | Metadata picks it                                                                 |
| Product alt text               | Media alt text                     | Fallback `"<title> image <n>"` (`components/product-detail/product-media.tsx:64`) |
| Product variant swatch/image   | Variant image, option-value swatch | Name→hex fallback table                                                           |
| Collection thumbnail           | `collection.image`                 | Index card, fallback to first product                                             |
| Collection product order       | Admin sort order                   | Default and "manual" both map to it                                               |
| Collections index order        | Creation order only                | Grid renders API order                                                            |
| Collection page hero           | Collection image is fetched        | Not rendered                                                                      |
| Home hero / tiles              | Not used                           | Images, labels, links, order                                                      |
| Home rail                      | `bestsellers` membership and sort  | Handle, title, limit 8                                                            |
| Navigation / footer            | Not used                           | Every item and tile                                                               |
| Search and predictive order    | Search & Discovery                 | Sort map                                                                          |
| Cart line image                | Variant image from cart            | Placeholder fallback                                                              |
| Wishlist                       | Nothing after save                 | Browser snapshot                                                                  |
| Markdown / Schema / agent      | Media order                        | Which fields are emitted                                                          |

## 5. Future control model

Keep Shopify as the merchandising source of truth and avoid adding a second CMS.

1. **Product media stays in Shopify.** Use media position for the gallery, variant images for
   colour, alt text for accessibility, and `featuredImage` for cards/OG. Do not add an app-owned
   image list or a second image table.
2. **Collections stay in Shopify.** Use `collection.image` for cards and (if the header is
   rebuilt) the collection page, and the admin sort order for the default product order. A curated
   collections-index order can come from one Shopify menu or a single ordered metafield list; do
   not add a custom collection table.
3. **Navigation should move to Shopify menus.** The Storefront API exposes menus and menu items,
   including typed links and images on menu items. That gives the merchant control of labels,
   order and mega-menu tiles without deploys, and removes the hardcoded tile images.
4. **Home merchandising should be one Shopify metaobject, not a page builder.** Define one
   `homepage` metaobject with ordered sections (hero, tiles, rail handle, collection edits, link
   tiles). The app keeps layout and design tokens; the merchant controls content, order and
   targets. This is still Shopify content, cached under Shopify tags, not a second CMS.
5. **Colour galleries need richer Shopify data.** The current model can only know one image per
   variant. If per-colour detail galleries are required, assign every colour-specific image to a
   variant (one image per variant is the current ceiling) or introduce a documented media-to-colour
   metafield. Do not infer colour from filenames.
6. **Invalidation stays as it is.** Product and collection webhooks already invalidate the relevant
   tags (`app/api/webhooks/shopify/route.ts:36`, `:68`). Menu and metaobject reads need their own
   tags if added; Search & Discovery edits still have no webhook, so filtered browse stays
   request-time.
7. **Do not add a second styling or content system.** Section copy stays inline; only merchant-
   variable content moves to Shopify.

Suggested sequence: (a) set media discipline and collection images now; (b) move navigation to
Shopify menus; (c) add the single `homepage` metaobject; (d) only then consider per-colour gallery
metadata. Each step is independently shippable and keeps the existing cache and auth boundaries.

## 6. Merchant instructions

### Set the first image

Products > select the product > **Media**. Drag the image to the first position. The first image
becomes `featuredImage`, so it is the product card, quick-shop, OG and default PDP image. If the
first media item is a video, Shopify may return a later image as `featuredImage`; keep the desired
still image first if the card must show it.

### Order the gallery

In the same **Media** list, drag images and videos into the order the PDP should show. The app
renders that order after the selected colour image. Videos stay in place; they are no longer moved
to the front. The app reads up to 50 media items per product.

### Assign a colour image

Products > product > **Variants**. For each colour, open a size variant and set its **Image** to
the colour's lead photo. The PDP uses the first selectable variant's image for the colour slot, and
the collection card uses the matched variant image when a colour filter is active. Assign the same
image to every size in that colour, or the first size wins. Images not assigned to any variant are
treated as shared and appear for every colour.

### Choose a collection thumbnail

Products > **Collections** > select the collection > **Edit** > collection **Image**. This image is
used on `/collections`; if unset, the first product image in the collection's default order is used.
Changing the collection's sort order can therefore change an unset thumbnail. Today all 41
collections are unset.

### Reorder a collection

Products > **Collections** > select the collection > **Sort order**. Choose **Manual** and drag
products to set the order, or choose **Best selling**, **Price**, **A–Z**, etc. The storefront's
"Featured" option requests the collection's default order, so "Manual" is what makes drag order
visible. Smart collections cannot use manual order; change the collection rules instead.

### Order the homepage rail

The rail always reads the `bestsellers` collection and shows its first 8 products. Set that
collection's **Sort order** to **Manual** and drag the products; or set it to best-selling to keep
it automatic. To use a different collection, change the handle, title and limit in
`components/product/home-product-rail.tsx:18`–`:22`.

### Change navigation

Today: edit `MAIN_NAV` and `FOOTER_COLUMNS` in `lib/nav/index.ts:30` and the local images under
`public/reference/`. Future: publish a Shopify menu with the desired items and images and switch
the nav components to the menu read; the app-side order then follows the menu order.

## 7. Known gaps and bugs

| Issue                                                | Effect                                                                                                                                       | Status                                                                                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Videos were grouped before images                    | A video at position 3 rendered first                                                                                                         | **Fixed**: media order is preserved (`lib/shopify/transforms/product/index.ts:65`; `components/product-detail/product-media.tsx:315`). |
| Gallery capped at 10 media                           | 15 of 95 products have 11–17 media; images after 10 never rendered, and a selected colour image beyond 10 fell back to `width: 0, height: 0` | **Fixed**: cap raised to 50 (`lib/shopify/fragments/product/index.ts:28`).                                                             |
| Hover image could repeat the featured image          | Two products whose colour variant image is media position 2 showed the same image twice when filtered                                        | **Fixed**: hover picks the first different image (`lib/shopify/transforms/product/index.ts:202`).                                      |
| Sort menu said "Best Matches" for manual             | The trigger said "Featured" but the open menu said "Best Matches"                                                                            | **Fixed**: both say "Featured" (`components/collections/sort-select.tsx:14`).                                                          |
| Collections index is creation order                  | Merchant cannot reorder `/collections`                                                                                                       | Not fixed; needs a curated menu/metafield or title sort.                                                                               |
| Collection image not rendered on the collection page | Art-directed collection image appears only on the index card and Markdown                                                                    | Not fixed; add it to `CollectionHeader` (`components/collections/collection-page.tsx:149`).                                            |
| Home hero, tiles, nav are hardcoded                  | Content changes need a deploy                                                                                                                | Not fixed; see future control model.                                                                                                   |
| Colour gallery is approximate                        | Only one image per variant is known; other colour shots are shared across all colours                                                        | Not fixed; needs richer Shopify data or a documented metafield.                                                                        |
| Related-product cards have no hover image            | Inconsistent with collection/search cards                                                                                                    | Not fixed; add `images(first: 2)` to the recommendation fragment.                                                                      |
| Cart line has no product-image fallback              | A variant with no image shows a placeholder even when the product has images                                                                 | Not fixed; all current variants have images.                                                                                           |
| OG image is featured-only                            | Cannot art-direct a separate social image                                                                                                    | Not fixed; move the image to position 1 or add an override.                                                                            |
| Search collection rows are text-only                 | All collection images are unset                                                                                                              | Fix by setting collection images.                                                                                                      |
| Wishlist images are snapshots                        | Shopify media changes do not update saved items                                                                                              | Not fixed; re-save or sync to Customer Account.                                                                                        |
| Shared filter can repeat the selected image          | A product whose only images are colour images falls back to all media                                                                        | Not fixed; the fallback avoids an empty gallery.                                                                                       |

## 8. Verification

Checked against the live Storefront API and the running storefront on 8 November 2026.

| Check                                 | Observed                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alma-lace-corset-top` (multi-colour) | 17 media. Lead images: `BROWN` = `alma-lace-corset-top-01.jpg`, `BURNT ORANGE` = `-08.png`, `BLACK` = `-13.png`. After the fix the PDP renders 15 items per layout: the selected colour image plus 14 shared images (`02`–`07`, `09`–`12`, `14`–`17`); the other two colour images are excluded. Selecting `BLACK` now returns `-13.png` at 1822×2733 instead of the previous `width="0" height="0"` fallback. |
| `naked-polite-top` (single colour)    | 9 media. The PDP renders all 9 in Shopify order `01`→`09` on both mobile and desktop; no colour slot is used.                                                                                                                                                                                                                                                                                                  |
| `corsets` collection                  | 19 products. Default order begins `mexi-playsuit-black`, `cora-corset-dress-green`, `cora-corset-dress-creme`; that matches `BEST_SELLING`/default, while `sortKey: MANUAL` begins `alma-lace-corset-top`, `rosa-corset-top`, `rati-corset`. Each card shows `-01` then `-02` for the hover image.                                                                                                             |
| `/collections`                        | 41 cards in collection-ID (creation) order; every collection `image` is null, so each thumbnail is the first product's featured image.                                                                                                                                                                                                                                                                         |
| Home rail                             | First 8 products of `bestsellers` in default (currently best-selling) order: `a-very-polite-tee`, `amrita-draped-top`, `amrita-draped-top-leheriya`, `amrita-sheer-skirt`, `draped-satin-skirt-black`, `draped-sheer-pants`, `draped-trousers-all`, `hera-applique-corset`.                                                                                                                                    |
| Videos                                | The current 95-product catalog has no product video, so the video-order path is code-verified only, not observable in the catalog.                                                                                                                                                                                                                                                                             |

`pnpm lint` and `pnpm typecheck` pass.
