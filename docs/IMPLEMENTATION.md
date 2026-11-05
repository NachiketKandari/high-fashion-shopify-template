# Polite Society replica — implementation notes

The storefront in this repository now reproduces the design system and page anatomy captured in
[`docs/reference/DESIGN.md`](./reference/DESIGN.md). For the stack map — which Shopify API owns
what, and where Hydrogen, Next.js and Vercel fit — read
[`docs/SHOPIFY-WALKTHROUGH.md`](./SHOPIFY-WALKTHROUGH.md). For a broader Shopify tutorial with
merchant and developer tracks, labs and curated resources, read
[`docs/SHOPIFY-TUTORIAL.md`](./SHOPIFY-TUTORIAL.md). This file records what is implemented, how it
was verified, and what still depends on Shopify credentials or production decisions.

## Implemented

| Surface       | What changed                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global system | DM Sans, 300/400/500; 14px/21px body; 0.05em tracking; black, white, `#4d4d4d` and `#e1e1e1`; zero radii; 20px mobile / 30px desktop gutters.                                                                               |
| Announcement  | Two rotating messages, pause on hover, 30px desktop / 35px mobile.                                                                                                                                                          |
| Header        | Large homepage masthead (`1016 × 82` at 1440), compact header elsewhere, sticky collapse on scroll, desktop nav with hover/focus mega menus, two-up editorial tiles, mobile menu drawer.                                    |
| Utilities     | Currency label, search drawer, help/contact drawer, cart count, mobile icon row.                                                                                                                                            |
| Search        | 440px right drawer with predictive products, recent products when empty, clear and view-all actions.                                                                                                                        |
| Homepage      | Full-bleed campaign hero, 2-up editorial, “Our Picks” scroll rail, 3-up collection edits, 4 link tiles.                                                                                                                     |
| Collection    | 18px uppercase title, chips row, inline desktop toolbar, 2/3/4-column responsive grid, 2:3 product images, 3px column gap, colour swatches, size list, wishlist toggle, hover image, filter drawer, sort, infinite loading. |
| Product       | 50/50 split, stacked 2:3 gallery, mobile snap gallery, 408px centred info column, inline colour and size selectors, size-guide drawer, quantity, outlined add-to-cart, black buy-now, four description tabs, related rail.  |
| Cart          | 440px drawer with free-shipping progress, compact line items, subtotal, checkout and view-cart; two-column cart page with order summary.                                                                                    |
| Footer        | Address, wordmark, help/policy/brand/social columns, newsletter, copyright, payment marks.                                                                                                                                  |
| Newsletter    | Modal after five seconds with 30-day local dismissal; footer form.                                                                                                                                                          |
| Our World     | About Us page with founder, brand philosophy, flagship store, atelier and archive sections; Press grid; Journal index and three articles.                                                                                   |
| Help          | Shopify care guide, size guide with a find-my-size form and measurement tables, Shopify FAQ with native details/summary, contact channels and message form, shipping and returns pages.                                     |
| Policies      | Terms, privacy, shipping and returns pages that mirror the live footer destinations.                                                                                                                                        |

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

Seeded on 5 November 2026 through the Shopify Admin API. The storefront now shows the fashion
catalog the design was built for instead of the Hydrogen demo catalog:

- 12 products across corsets, dresses and jumpsuits, tops, bottoms, outerwear and accessories.
- 23 collections: the eight editorial collections (`corsets`, `dresses-and-jumpsuits`, `tops`,
  `bottoms`, `new-in`, `core`, `essentials`, `signature`) plus the live-site navigation handles
  (`chapter-x`, `women`, `unisex-1`, `bestsellers`, `co-ord-sets`, `knits`, `bottoms-women`,
  `bottoms-unisex`, `accessories`, `work-wear`, `evening`, `weekend`, `festive`,
  `shirts-and-tshirts`, `outerwear`).
- 12–18 variants per product (colour × XS–XXL), priced in USD.
- Product photography imported from the reference CDN into Shopify Files.
- Demo snowboards unpublished from the **Dummy Store Headless** publication. They remain in the
  Shopify admin and on the Online Store; the gift card stays published.
- Navigation, editorial tiles and the “Our Picks” rail now point at the seeded collection handles.

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

The two variables are read only by the seeder. They are not bundled into the storefront, must never
use the `NEXT_PUBLIC_` prefix, and must never be committed. `.env.example` and
`docs/SHOPIFY-WALKTHROUGH.md` hold placeholders and instructions, never values. If the secret is
ever exposed — a screenshot, a chat, a log — rotate it under **Settings → Credentials**, update
`.env.local`, and re-run the seed. The product, publication and file scopes are `write_products`,
`write_publications` and `write_files` (write includes read), and the target publication is
**Dummy Store Headless**. The full granted scope list is in
[`SHOPIFY-APP-SCOPES.md`](./SHOPIFY-APP-SCOPES.md).

### Commands

```bash
DRY_RUN=1 corepack pnpm seed:catalog                 # print one product input, no API calls
corepack pnpm seed:catalog                           # create missing products and collections
UNPUBLISH_OTHERS=1 corepack pnpm seed:catalog        # also unpublish demo catalog from the Headless channel
```

The script is idempotent: it looks up each handle, skips what exists, and re-publishes to the
Headless channel on every run.

## Verification

- `corepack pnpm lint` — passes.
- `corepack pnpm typecheck` — passes.
- `corepack pnpm build` — passes; all storefront routes prerender.
- Browser checks with Playwright MCP at desktop and mobile sizes, including header collapse,
  mega menu, search, contact, filter, PDP tabs, cart drawer and cart page.
- Seeded catalog: `/collections/corsets` renders six corsets, `/collections/all` renders the twelve
  fashion products plus the gift card, the home rail renders `bestsellers`, Shopify CDN imagery
  loads at full resolution, and add-to-cart puts `Alma Lace Corset Top` (Brown / XS, $185) in the
  drawer.
- Seeded navigation collections: every collection handle in `MAIN_NAV` returns `200` and includes
  at least one product. `accessories` uses the Bustier Belt and `outerwear` uses the Poli-Morph
  Overshirt, both seeded from reference editorial imagery.
- Content routes: `/pages/about-us`, `/pages/lookbooks`, `/pages/care-guide`, `/pages/press-v2`,
  `/pages/faqs`, `/pages/shipping-returns`, `/pages/returns-exchanges`,
  `/pages/terms-of-service`, `/pages/privacy-policies`, `/blogs/journal-2` and all three articles
  return `200` from Shopify content. `/pages/contact-us`, `/pages/size-guide` and `/pages/wishlist`
  remain Next.js routes.
- Seeded content: 9 Shopify pages, the `journal-2` blog, 3 articles and 38 images in Shopify Files.
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

The collection handles in the live menu are seeded by `scripts/seed-catalog.mjs`:
`chapter-x`, `women`, `unisex-1`, `bestsellers`, `co-ord-sets`, `knits`, `bottoms-women`,
`bottoms-unisex`, `accessories`, `work-wear`, `evening`, `weekend`, `festive`,
`shirts-and-tshirts` and `outerwear`. Each handle contains at least one of the seeded products so
the navigation has no empty destinations. The accessories and outerwear entries use editorial and
press imagery because the trial catalog has no dedicated shots for those categories.

## Known gaps

- **Catalog**: seeded; the design-system assets in `public/reference/` are licensed for this
  private prototype only and must be replaced before distribution. The accessories and outerwear
  products use editorial and press imagery rather than dedicated product photography.
- **Content ownership**: the editorial and policy pages plus the journal now live in Shopify.
  Contact, size guide and wishlist remain Next.js because they need forms, local state or a
  client-side size finder. Do not add a local static route for a Shopify handle; see
  [`CONTENT.md`](./CONTENT.md). Navigation remains code-owned in `lib/nav/index.ts`.
- **Wishlist and account**: wishlist saves products in local storage and renders at
  `/pages/wishlist`; it is per-browser and not synced to a customer account. Account utilities
  render only when `shopConfig.auth.isEnabled` is turned on, matching the template's account gate.
- **Checkout, order status and payment failure** are Shopify-hosted.
- **Newsletter and contact submissions** show a local success state; the contact form does not
  send mail yet, and the newsletter does not post to Shopify or a marketing provider.
- **Currency**: the store is priced in USD, so the header shows USD. The reference defaults to INR.
  Changing this is a Shopify store-currency and market decision, not a styling change.
- **Shipping**: no Shiprocket code ships in this repository. See
  [`SHIPROCKET.md`](./SHIPROCKET.md) for the two integration paths.
- **Payment marks** are typographic, not brand logo assets.
- **Header wordmark and editorial photography** are the reference brand's assets. Replace them
  before a public launch.
