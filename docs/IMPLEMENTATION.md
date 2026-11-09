# Storefront implementation notes

The storefront in this repository now reproduces the design system and page anatomy captured in
[`docs/reference/DESIGN.md`](./reference/DESIGN.md). For the full frontend map — routes, components,
data flow, caching and pending work — read
[`docs/FRONTEND-ARCHITECTURE.md`](./FRONTEND-ARCHITECTURE.md). For the stack map — which Shopify API
owns what, and where Hydrogen, Next.js and Vercel fit — read
[`docs/SHOPIFY-WALKTHROUGH.md`](./SHOPIFY-WALKTHROUGH.md). For a broader Shopify tutorial with
merchant and developer tracks, labs and curated resources, read
[`docs/SHOPIFY-TUTORIAL.md`](./SHOPIFY-TUTORIAL.md). This file records what is implemented, how it
was verified, and what still depends on Shopify credentials or production decisions.

## Implemented

| Surface       | What changed                                                                                                                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global system | DM Sans, 300/400/500; 14px/21px body; 0.05em tracking; black, white, `#4d4d4d` and `#e1e1e1`; zero radii; 20px mobile / 30px desktop gutters.                                                                                       |
| Announcement  | Two rotating messages, pause on hover, 30px desktop / 35px mobile.                                                                                                                                                                  |
| Header        | Large homepage masthead (`1016 × 82` at 1440), compact header elsewhere, sticky collapse on scroll, desktop nav with hover/focus mega menus, mobile menu drawer.                                                                    |
| Utilities     | Currency selector, search drawer, help/contact drawer, cart count, mobile icon row.                                                                                                                                                 |
| Search        | 440px right drawer with predictive products, recent products when empty, clear and view-all actions.                                                                                                                                |
| Homepage      | Full-bleed campaign hero, two-up editorial tiles, “Our Picks” scroll rail, 3-up collection edits, 4 link tiles.                                                                                                                     |
| Collection    | 18px uppercase title, chips row, inline desktop toolbar, 2/3/4-column responsive grid, 2:3 product images, 3px column gap, colour swatches, size list, wishlist toggle, hover image, filter drawer, sort, infinite loading.         |
| Product       | 50/50 split, stacked 2:3 gallery, mobile snap gallery, 408px centred info column, inline colour and size selectors, size-guide drawer, quantity, outlined add-to-cart, black buy-now, four description tabs, related-products grid. |
| Cart          | 440px drawer with free-shipping progress, compact line items, subtotal, checkout and view-cart; two-column cart page with order summary.                                                                                            |
| Footer        | Address, wordmark, help/policy/brand/social columns, newsletter, copyright, payment marks.                                                                                                                                          |
| Newsletter    | Modal after five seconds with 30-day local dismissal; footer form.                                                                                                                                                                  |
| Our World     | About Us page with studio, brand philosophy, flagship store, atelier and archive sections; Press grid; Journal index and three articles.                                                                                            |
| Help          | Shopify care guide, size guide with a find-my-size form and measurement tables, Shopify FAQ with native details/summary, contact channels and message form, shipping and returns pages.                                             |
| Policies      | Terms, privacy, shipping and returns pages that mirror the live footer destinations.                                                                                                                                                |

## Flows and screenshots

Reference screenshots and the flow index are in [`docs/reference/FLOWS.md`](./reference/FLOWS.md).
The locally rebuilt flows were checked in a browser at 1440 × 1000, 768 × 1024 and 390 × 844:

- Homepage: hero → 2-up → rail → 3-up → tiles → footer.
- Header large/compact, sticky collapse, mega menu (hover and keyboard focus), mobile menu.
- Search drawer empty and populated, with predictive results.
- Help drawer, newsletter modal, footer newsletter.
- Collection grid, chips, filter drawer, sort, infinite loading.
- Product gallery (desktop stacked, mobile snap), tabs, quantity, add-to-cart, buy-now.
- Cart drawer empty/filled, cart page, checkout hand-off.
- GA4 page views.

## GA4

`@next/third-parties` renders GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. The local environment
uses `G-SQVPB589E7`. Verified in the browser network panel: `googletagmanager.com/gtag/js` loads
and `google-analytics.com/g/collect` receives `en=page_view` for `/`, `/pages/about-us`,
`/collections/all`, `/collections/*`, `/products/*`, `/cart` and `/pages/wishlist`. GTM takes
precedence when `NEXT_PUBLIC_GTM_ID` is also set, matching `components/analytics/index.tsx`.

The integration is present and active, not just installed. The only production step is to set
`NEXT_PUBLIC_GA_MEASUREMENT_ID` (or `NEXT_PUBLIC_GTM_ID`) in the Vercel project; see
[`VERCEL-DEPLOYMENT.md`](./VERCEL-DEPLOYMENT.md#9-analytics). `shopConfig.analytics.vercel` and
`shopConfig.analytics.speedInsights` are separate opt-in switches and do not control GA4.

## Shopify catalog

Imported on 5 November 2026 through the Shopify Admin API from the live reference storefront
with `scripts/import-live-catalog.mjs` (`pnpm import:catalog`). The storefront now mirrors the
published reference catalog:

- 95 products, 880 variants and 709 images across 41 collections.
- Every published product, option value, variant combination, image count and price was checked
  against the Storefront API; the import and verification report is written under
  `.catalog-import/`.
- Reference prices are INR. The store was USD at import time, so early prices used the live
  storefront's approximate USD display (₹94.83 per USD, rounded to whole dollars). The store is now
  INR; current prices are interim ×100 values until the source INR catalog is re-applied.
- Product photography is imported from the reference CDN into Shopify Files, including variant
  images so colour selection changes the gallery.
- Colour option values use the reference theme's flat swatch palette in
  `lib/product/color-swatches.ts`; Shopify exposes no swatch value for these products.
- Demo products, the gift card, stale curated products and non-catalog collections are unpublished
  from **Dummy Store Headless**. They remain in the Shopify admin.
- Inventory quantities are not mirrored: the seeding app lacks `read_locations` and
  `write_inventory`, so variants are untracked and available. Add those scopes and pass
  `--location-id` to mirror sold-out variants.
- Product descriptions come from the reference `body_html`. Per-product Fabric and Fit tab copy is
  not imported yet; the PDP renders its current static copy for those tabs.

### Credentials: source and storage

The seeder authenticates with a **Dev Dashboard app**, not a legacy admin custom app:

1. Dev Dashboard → **Apps** → `Catalog Seeder` → **Settings** → **Credentials**.
2. Copy **Client ID** and **Client secret**.
3. Store them in `.env.local` at the repository root. `.gitignore` excludes `.env*` and allows only
   `.env.example`, so the file never enters git:

   ```bash
   SHOPIFY_CLIENT_ID=...
   SHOPIFY_CLIENT_SECRET=...
   ```

4. `scripts/seed-catalog.mjs` exchanges them at run time with the client credentials grant. The
   resulting Admin API token expires after 24 hours and is never written to disk.

The two variables are read by all three offline scripts (`seed-catalog.mjs`,
`import-live-catalog.mjs` and `seed-content.mjs`). They are not bundled into the storefront, must
never use the `NEXT_PUBLIC_` prefix, and must never be committed. `.env.example` and
`docs/SHOPIFY-WALKTHROUGH.md` hold placeholders and instructions, never values. If the secret is
ever exposed — a screenshot, a chat, a log — rotate it under **Settings → Credentials**, update
`.env.local`, and re-run the seed. The product, publication and file scopes are `write_products`,
`write_publications` and `write_files` (write includes read), and the target publication is
**Dummy Store Headless**. The full granted scope list is in
[`SHOPIFY-APP-SCOPES.md`](./SHOPIFY-APP-SCOPES.md).

### Commands

```bash
corepack pnpm import:catalog                         # upsert the cached live catalog and collections
corepack pnpm import:catalog -- --refresh            # refetch the reference catalog first
corepack pnpm import:catalog -- --skip-imported      # skip products whose counts already match
corepack pnpm import:catalog -- --collections-only   # resync collection membership only
corepack pnpm import:catalog -- --dry-run --limit=1  # print one transformed product
UNPUBLISH_OTHERS=1 corepack pnpm import:catalog       # unpublish non-catalog products and collections
```

`import:catalog` upserts by handle, replaces product media, attaches variant images, and resyncs
collection membership. Re-running without `--skip-imported` refreshes changed products;
`--skip-imported` is the fast path when only collections changed. The older
`pnpm seed:catalog` still seeds the original twelve-product design-study subset and is not the
source of the full catalog.

## Verification

- `corepack pnpm lint` — passes.
- `corepack pnpm typecheck` — passes.
- `corepack pnpm build` — passes; all storefront routes prerender.
- Browser checks with Playwright MCP at desktop and mobile sizes, including header collapse,
  mega menu, search, contact, filter, PDP tabs, cart drawer and cart page.
- Imported catalog: the Storefront API returns 95 of 95 published products with no missing handles,
  no extra products, and no variant, image, option, price or collection-membership mismatches
  against the reference catalog.
- `/collections/corsets` renders 19 corsets, `/collections/all` lists all 95 published products,
  the home rail renders the first eight products of the 24-product `bestsellers` collection, and
  add-to-cart puts `Alma Lace Corset Top` (Brown / XS, $158) in the drawer.
- Navigation collections: every collection handle in `MAIN_NAV` returns `200` and includes at
  least one product; `accessories` has 2 live products and `outerwear` has 3.
- Content routes: `/pages/about-us`, `/pages/lookbooks`, `/pages/care-guide`, `/pages/press-v2`,
  `/pages/faqs`, `/pages/shipping-returns`, `/pages/returns-exchanges`,
  `/pages/terms-of-service`, `/pages/privacy-policies`, `/blogs/journal-2` and all three articles
  return `200` from Shopify content. `/pages/contact-us`, `/pages/size-guide` and `/pages/wishlist`
  remain Next.js routes.
- Seeded content: 9 Shopify pages, the `journal-2` blog, 3 articles and 38 images in Shopify Files.
  The store currently serves 11 published page resources because Shopify's pre-existing `contact`
  and `data-sharing-opt-out` pages also render through `/pages/[handle]`.
- Interactive checks: size finder returns a size, FAQ `<details>` panels expand, contact form shows
  its local success state, and the journal links resolve.
- GA4 network verification as above.

## Reference content routes

The reference content now lives in Shopify. `scripts/seed-content.mjs` created the pages, the
`journal-2` blog and its three articles, and uploaded 38 images to Shopify Files. The local route
directories were deleted after the Shopify routes returned `200`. The dynamic
`app/pages/[handle]`, `app/blogs/[blogHandle]` and `app/blogs/[blogHandle]/[articleHandle]` routes
are the only handlers for these URLs, and `getPage` / `getBlog` / `getBlogArticle` cache the
Storefront API reads.

| Route                      | Source                                 |
| -------------------------- | -------------------------------------- |
| `/pages/about-us`          | Shopify page                           |
| `/pages/lookbooks`         | Shopify page                           |
| `/pages/care-guide`        | Shopify page                           |
| `/pages/press-v2`          | Shopify page                           |
| `/pages/faqs`              | Shopify page with `<details>` elements |
| `/pages/shipping-returns`  | Shopify page                           |
| `/pages/returns-exchanges` | Shopify page                           |
| `/pages/terms-of-service`  | Shopify page                           |
| `/pages/privacy-policies`  | Shopify page                           |
| `/blogs/journal-2`         | Shopify blog                           |
| `/blogs/journal-2/*`       | Shopify articles                       |
| `/pages/contact-us`        | Next.js contact form                   |
| `/pages/size-guide`        | Next.js size finder and tables         |
| `/pages/wishlist`          | Next.js browser-local wishlist         |
| `/pages/[handle]`          | Shopify page fallback                  |

The granted content scopes are:

| Scope                                           | Unlocks                                                     |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `write_online_store_pages` (or `write_content`) | Page, blog, article and comment mutations                   |
| `write_online_store_navigation`                 | Menus, link lists and URL redirects                         |
| `write_legal_policies`                          | `shopPolicyUpdate` for Terms, Privacy, Shipping and Returns |

`write_files` is also granted, so page and article images are uploaded to Shopify Files. The
Storefront API token used by the app is read-only and cannot create content.

`scripts/seed-content.mjs` is create-only by default so it cannot overwrite merchant edits. Use
`UPDATE=1` only when intentionally replacing page or article bodies from `scripts/content/`.

```bash
DRY_RUN=1 corepack pnpm seed:content
corepack pnpm seed:content
UPDATE=1 corepack pnpm seed:content
```

Classic Shopify webhooks do not expose `pages/*`, `blogs/*` or `articles/*` topics, so content
edits need an explicit `/api/revalidate` call or a shorter content `cacheLife`. See
[`CONTENT.md`](./CONTENT.md) for the ownership rules, invalidation options and verification
checklist.

The collection handles in the live menu are imported by `scripts/import-live-catalog.mjs`:
`chapter-x`, `women`, `unisex-1`, `bestsellers`, `co-ord-sets`, `knits`, `bottoms-women`,
`bottoms-unisex`, `accessories`, `work-wear`, `evening`, `weekend`, `festive`,
`shirts-and-tshirts` and `outerwear`. Each handle contains at least one published reference
product so the navigation has no empty destinations. Accessories and outerwear use the reference
product photography imported into Shopify Files.

## Known gaps

The ordered closure plan, with dependencies and acceptance checks, is in
[`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md).

- **Catalog**: 95 published products imported from the reference; the design-system assets in
  `public/reference/` are licensed for this private prototype only and must be replaced before
  distribution. Inventory availability and per-product Fabric/Fit copy are not imported yet; the
  PDP renders static copy for those tabs and all variants are untracked.
- **Collection facets**: Availability and Price are configured in this store. Product type, colour
  and fabric facets need the Search & Discovery app configured in Shopify admin; the Storefront API
  exposes only configured filters.
- **Content ownership**: the editorial and policy pages plus the journal now live in Shopify.
  Contact, size guide and wishlist remain Next.js because they need forms, local state or a
  client-side size finder. Do not add a local static route for a Shopify handle; see
  [`CONTENT.md`](./CONTENT.md). Navigation remains code-owned in `lib/nav/index.ts`.
- **Wishlist and account**: wishlist saves products in local storage and renders at
  `/pages/wishlist`; it is per-browser and not synced to a customer account. Account utilities
  render through Shopify's Customer Account API, and `/account` requires a signed-in session.
- **Checkout, order status and payment failure** are Shopify-hosted.
- **Newsletter and contact submissions** show a local success state; the contact form does not
  send mail yet, and the newsletter does not post to Shopify or a marketing provider.
- **Currency**: the store and storefront are INR-only. The former display-only USD selector was
  removed; Shopify cart totals and checkout are INR. Presentment-currency support would be a Shopify
  Markets decision, not a styling change. Prices are interim ×100 values until the source INR
  catalog is re-applied.
- **Shipping**: no Shiprocket code ships in this repository. See
  [`SHIPROCKET.md`](./SHIPROCKET.md) for the two integration paths.
- **Payment marks** are inline SVG brand marks in `components/footer/payment-marks.tsx` (American
  Express, Diners Club, Maestro, Mastercard, RuPay and Visa), not typographic labels.
- **Editorial photography** is reference imagery. Replace it before a public launch. The placeholder
  wordmark in `public/brand/wordmark.svg` is the template mark.
