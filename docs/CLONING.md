# Rebuilding the Polite Society storefront

This document records how the Polite Society replica in this repository was built. It is for a
developer who needs to reproduce the build, extend it, or audit it against the live reference at
<https://politesocietyshop.com>.

## Purpose and scope

This is a private design study. The reference photography, wordmark, product copy and brand assets
belong to Polite Society. They are here only to reproduce layout and interaction during
development. Replace them with licensed or original assets before public distribution. The same
restriction appears in `docs/reference/DESIGN.md` and `docs/reference/ASSETS.md`.

The replica uses a Shopify development store and the Headless sales channel. Shopify checkout,
customer authentication and order management are not cloned; those remain Shopify-hosted.

## Evidence gathering

The reference was measured before components were written.

| Input                          | Detail                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Browser automation             | Playwright, desktop Chrome. Sessions ran at 1440×1000, 768×1024 and 390×844.                                                       |
| Layout measurements            | `getComputedStyle` and element rectangles from the live DOM; values were not estimated from screenshots.                           |
| Screenshots                    | 26 JPGs in `docs/reference/`; `docs/reference/FLOWS.md` indexes the desktop and mobile flows.                                      |
| Design tokens                  | Typography, colour, spacing, breakpoints and motion are recorded in `docs/reference/DESIGN.md`.                                    |
| Page/blog/collection inventory | The live sitemap index and its product, page, collection, blog and article children were read before scoping routes and seed data. |
| Asset inventory                | `docs/reference/ASSETS.md` lists reference images and the files that must be replaced before launch.                               |

`docs/reference/FLOWS.md` covers 19 desktop flows and 5 mobile flows. Tablet has no separate
screenshot: the 768×1024 pass produced the breakpoint rules in `DESIGN.md`, and FLOWS says so
explicitly rather than storing a duplicate image.

The live sitemap (`https://politesocietyshop.com/sitemap.xml`) was used to choose the page list.
On the checked snapshot, it listed 29 page URLs (including duplicate size charts, a test page and an
account page), 41 collection URLs, one blog (`journal-2`) and three articles. The clone rebuilt the
pages below, not every URL. The raw sitemap XML is not committed; that is an evidence gap, not a
runtime dependency.

## Architecture

| Owner    | Responsibility                                                                                                                             | Location                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Shopify  | Catalog, variants, prices, availability, collections, cart, checkout, policies and customer accounts                                       | Storefront and Customer Account APIs, reached through Hydrogen                                |
| Next.js  | App Router routes, Server Components, caching, metadata, sitemap, robots, Markdown representations and the request boundary                | `app/`, `components/`, `lib/`                                                                 |
| Hydrogen | Framework-agnostic Shopify SDK: Storefront client, cart handlers, product/cart form bindings, predictive search and Shopify response types | `@shopify/hydrogen` imports; handlers registered in `proxy.ts`                                |
| Eve      | Optional shopping agent: sessions, tools and `/eve/v1/*`                                                                                   | `agent/`, `lib/agent/`, `components/agent/`; disabled by `shopConfig.agent.isEnabled = false` |

The app runs Next.js 16 App Router with React 19 and Tailwind CSS 4. The installed Shopify SDK is
`@shopify/hydrogen` 2026.10.2, the framework-independent SDK rather than the Hydrogen React Router
framework. There are no React Router loaders, actions or Oxygen setup here.

`lib/config/index.ts` sets US/EN commerce context, enables search, and disables customer auth,
Shopify analytics and the Eve agent. The Storefront token in `.env.local` is the public Headless
channel token, not an Admin token.

### Request boundary

`proxy.ts` is the Next.js request adapter:

- `handleShopifyRoutes` serves the Hydrogen cart handler at `/api/cart` and predictive search.
  Customer-account auth handlers are added only when `shopConfig.auth.isEnabled` is true.
- Collection URLs with filters or a sort are rewritten to the request-time
  `/collections/<handle>/refine` route. A direct `refine` request returns 404.
- Markdown negotiation rewrites pass through the same proxy before the marketing pages.

Caching follows `AGENTS.md`: Shopify fetch operations are uncached, `lib/<domain>/server.ts` owns
the cache directives and tags, and the default first page of a collection and `/collections/all` is
cached. Filtered and sorted browse, Load more and search stay request-time. Cart data is per-request
and never publicly cached.

## Shell rebuild

| Surface      | Implementation                                                                                | Behaviour                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Announcement | `components/nav/announcement.tsx`                                                             | Two messages rotate every 3s, pause on hover and while the tab is hidden; 35px mobile / 30px desktop.                             |
| Header       | `components/nav/header.tsx`, `components/nav/index.tsx`                                       | Sticky header; homepage masthead with the 1016×82 wordmark, compact bar elsewhere. Scroll past 24px collapses the masthead.       |
| Desktop nav  | `components/nav/desktop-nav.tsx`                                                              | Visible at `xl`; hover, click and keyboard focus open the mega menu; Escape closes it.                                            |
| Mega menus   | Data in `lib/nav/index.ts`                                                                    | `Woman`, `Unisex`, `Edit` and `Our World` combine link columns with two portrait tiles; `New In` is a direct link.                |
| Mobile menu  | `components/nav/mobile-menu.tsx`                                                              | Right-side sheet; nested sections use native `<details>`; wishlist is appended; USD and optional account row at the bottom.       |
| Search       | `components/nav/search-modal.tsx`                                                             | 440px right drawer; Cmd/Ctrl+K toggles it; predictive product results, recently viewed products when empty, and View all results. |
| Contact      | `components/nav/contact-drawer.tsx`                                                           | 440px drawer with WhatsApp, call, email and flagship-store rows.                                                                  |
| Cart         | `components/cart/overlay.tsx`, `components/cart/context.tsx`, `components/cart/cart-page.tsx` | 440px drawer with $500 free-shipping progress; two-column cart page with line items, summary and checkout.                        |
| Footer       | `components/footer/index.tsx`                                                                 | Address and wordmark, Help, Policies, The Brand, Socials, newsletter, copyright and typographic payment marks.                    |
| Newsletter   | `components/newsletter/popup.tsx`, `components/newsletter/form.tsx`                           | Modal after 5s with a 30-day `localStorage` dismissal; footer form reuses the same form component.                                |

## Page rebuild

### Home

`app/page.tsx` composes the static homepage:

- A full-bleed hero linking to `/collections/chapter-x`: `/reference/hero-desktop.jpg` at
  `1440/784` on desktop, `/reference/hero-mobile.jpg` filling the mobile viewport under the header.
  Both use `priority` and `sizes="100vw"`.
- Two-up editorial tiles linking to `/collections/corsets` and
  `/collections/dresses-and-jumpsuits`.
- `HomeProductRail` from `components/product/home-product-rail.tsx`: async `bestsellers` results,
  first eight products, rendered with `ProductRail` arrows and `View all`.
- Three collection tiles linking to `/collections/core`, `/collections/essentials` and
  `/collections/signature`.
- Four square link tiles: Flagship Store (`/pages/about-us#store`), Journal
  (`/blogs/journal-2`), Polite Careguide (`/pages/care-guide`) and Our World (`/pages/about-us`).

### Collection pages

`app/collections/[handle]/page.tsx` and its layout render the collection route; `/collections/all`
has equivalent files under `app/collections/all/`. `CollectionLayout` in
`components/collections/collection-page.tsx` owns the title, category chips, filter/sort toolbar and
results frame.

- The chip row uses the fixed set in `CollectionChips`: All products, Bottoms, Co-ord Sets, Corsets,
  Dresses & Jumpsuits, Knitwear, New In and Tops. Every chip handle exists in the seed.
- `components/collections/toolbar.tsx` supplies the mobile and desktop toolbar. The filter trigger
  opens `components/collections/filters-client.tsx` as a 420px sheet with price, checkbox and swatch
  filters; active filters render as removable badges.
- `components/collections/sort-select.tsx` maps Hydrogen sort keys to labels such as `Best Selling`,
  `Price: Low to High` and `Name: A-Z`. `/collections/all` excludes sort keys Storefront search
  cannot use.
- `components/collections/infinite-product-grid.tsx` observes a sentinel with a 400px root margin
  and calls `loadMoreBrowseProductsAction`; product ids are de-duplicated against the initial page
  and prior loads.
- `lib/collections/index.ts` detects filtered or sorted URLs and `proxy.ts` rewrites them to
  `app/collections/[handle]/refine/page.tsx` or the `/collections/all/refine` equivalent. The static
  default page keeps `SearchParamsProbe`, which forces the server to read the query string so the
  rewrite runs.

The grid is two columns on mobile, three at `md` and four at `lg`. `ProductCard` in
`components/product-card/product-card.tsx` renders 2:3 media, a hover image, color swatches, title,
price, size list and wishlist button.

### Product pages

`app/products/[handle]/page.tsx` loads the product, resolves selected options from the query string
and streams the detail section inside Suspense. `components/product-detail/` contains:

- A 50/50 desktop split with stacked media and a centered 408px information column; mobile uses a
  scroll-snap gallery.
- `product-form.tsx` keeps selection in the URL while the static shell stays coherent;
  `buy-buttons.tsx` uses Hydrogen's product form, quantity picker, Add to Cart and Buy it now.
- `product-tabs.tsx` provides Description, Shipping/Exchange/Returns, Fabric and Fit tabs.
- `size-guide.tsx` opens a 720px right drawer with the tops table. The content-page
  `components/content/size-guide.tsx` adds category tabs, a find-my-size form, conversion table and
  measurement notes.
- Related products render from `components/product/related-products-section.tsx` when
  `shopConfig.pdp.relatedProducts.isEnabled` is true.

### Cart and checkout

Add-to-cart submits through Hydrogen's product form and opens the cart drawer; `proxy.ts` serves
`/api/cart` with the Hydrogen handlers. The cart page at `app/cart/page.tsx` uses the same cart
state. `components/cart/summary.tsx` calls `useCheckout` from `lib/cart/client.ts`, which invokes
`prepareCheckoutAction` in `lib/cart/action.ts`. That action reads the existing `checkoutUrl` and
does not mutate the cart; the browser then navigates to Shopify-hosted checkout.

### Content pages

The trial Shopify store originally had only a `contact` page and an empty `news` blog. The Dev
Dashboard seeding app now holds `write_online_store_pages`, `write_online_store_navigation` and
`write_legal_policies`, and `scripts/seed-content.mjs` has created nine pages, the `journal-2` blog
and three articles. Thirty-eight content images were uploaded to Shopify Files. The local React
route directories were deleted after the Shopify routes returned `200`; the dynamic
`app/pages/[handle]` route is now the only handler for those URLs.

| Route                                                 | Source                         |
| ----------------------------------------------------- | ------------------------------ |
| `/pages/about-us`, `/pages/lookbooks`                 | Shopify pages                  |
| `/pages/care-guide`, `/pages/press-v2`                | Shopify pages                  |
| `/pages/faqs`, `/pages/shipping-returns`              | Shopify pages                  |
| `/pages/returns-exchanges`, `/pages/terms-of-service` | Shopify pages                  |
| `/pages/privacy-policies`                             | Shopify page                   |
| `/pages/contact-us`                                   | Next.js contact form           |
| `/pages/size-guide`                                   | Next.js size finder and tables |
| `/pages/wishlist`                                     | Next.js browser-local wishlist |

`app/wishlist/page.tsx` is a compatibility redirect to `/pages/wishlist`. `STATIC_CONTENT_PATHS` in
`app/sitemap/[shard]/route.ts` now lists only the two app-owned indexable pages; Shopify's page and
article sitemap shards cover the migrated content. The seeder is create-only by default so a rerun
cannot overwrite merchant edits; `UPDATE=1` replaces bodies from `scripts/content/`. See
[`CONTENT.md`](./CONTENT.md) for the ownership and invalidation rules.

### Journal

The live blog sitemap contained only `journal-2`, and the article sitemap contained exactly the three
articles rebuilt here. All three now live in the Shopify blog `journal-2` and render through the
generic `app/blogs/[blogHandle]` and `app/blogs/[blogHandle]/[articleHandle]` routes.

| Article                                     | Handle                         |
| ------------------------------------------- | ------------------------------ |
| A Polite Society Guide to Bombay After Dark | `guide-to-bombay-after-dark`   |
| In Conversation with Neetta                 | `in-conversation-with-neetta`  |
| The Polite Society Watchlist                | `the-polite-society-watchlist` |

Bodies, excerpts, images and SEO fields were seeded from `scripts/content/journal.mjs`; the runtime
reads them from Shopify. `app/blogs/journal-2` and `lib/content/journal.ts` were deleted after the
Shopify routes were verified. The generic blog route sanitizes `contentHtml` with
`sanitizeShopifyHtml` and wraps the `params` read in `Suspense` with `ArticlePageSkeleton`.

The trial store's `news` blog remains empty and renders its empty state.

## Catalog seeding

`scripts/seed-catalog.mjs` performs one-off catalog provisioning through the Admin API. The
Storefront API cannot create products, so this work does not belong in the runtime app.

### Authentication and publication

The preferred path is a Dev Dashboard app:

1. Create the app and grant `write_products`, `write_publications` and `write_files`; the write
   scopes include their read counterparts.
2. Add `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` to `.env.local`.
3. On every run the script exchanges them for an Admin API token with the client credentials grant.
   The token expires after 24 hours and is never written to disk.

`SHOPIFY_ADMIN_ACCESS_TOKEN` is accepted as an alternative for an existing token. The script also
accepts `SHOPIFY_PUBLICATION_ID`; otherwise it resolves the first publication whose name matches
`headless`, `hydrogen` or `storefront`. Publishing is mandatory: products and collections not on the
Headless channel do not appear through the Storefront API.

The script uses Shopify's Admin GraphQL API (`2026-10` by default, overridable with
`SHOPIFY_API_VERSION`):

- `productSet` creates products with options, variants and file inputs. Image inputs point at the
  reference CDN (`https://politesocietyshop.com/cdn/shop/files/...`); Shopify downloads them into
  Shopify Files.
- `collectionCreate` creates collections; `collectionAddProducts` adds members.
- `publishablePublish` publishes every created or existing product and collection to the Headless
  publication.
- `UNPUBLISH_OTHERS=1` unpublishes products and collections that are not in the seed set from the
  Headless channel; the gift card is explicitly kept.

The script is idempotent: it looks up each handle, skips creation when the resource exists,
re-publishes it, and re-applies collection membership. It does not delete or rewrite existing
product content.

### Seeded catalog

The catalog contains 12 products. Each has two or three colours, six sizes (XS–XXL) and 12–18
variants; all variants are priced in USD, use `inventoryPolicy: "CONTINUE"` and are not
inventory-tracked.

| Product              | Type                |    USD |
| -------------------- | ------------------- | -----: |
| Alma Lace Corset Top | Corsets             | 185.00 |
| Rosa Corset Top      | Corsets             | 165.00 |
| Mexi Corset Playsuit | Dresses & Jumpsuits | 175.00 |
| Rati Corset          | Corsets             | 130.00 |
| Solapur Corset       | Corsets             | 110.00 |
| Lolita Slip Dress    | Dresses & Jumpsuits | 180.00 |
| Gulnar Corset Top    | Corsets             | 155.00 |
| Lilith Corset        | Corsets             | 165.00 |
| Naked Polite Top     | Tops                |  95.00 |
| Draped Trousers      | Bottoms             | 140.00 |
| Poli-Morph Overshirt | Outerwear           | 210.00 |
| Bustier Belt         | Accessories         |  95.00 |

The script creates 23 collections:

| Group           | Handles                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editorial       | `corsets`, `dresses-and-jumpsuits`, `tops`, `bottoms`, `new-in`, `core`, `essentials`, `signature`                                                                                                         |
| Live navigation | `chapter-x`, `women`, `unisex-1`, `bestsellers`, `co-ord-sets`, `knits`, `bottoms-women`, `bottoms-unisex`, `accessories`, `work-wear`, `evening`, `weekend`, `festive`, `shirts-and-tshirts`, `outerwear` |

`chapter-x`, `women` and `unisex-1` contain all 12 products. `bestsellers` contains all 12 and feeds
the home rail. The remaining navigation collections use the membership map in the script so every
menu destination has at least one product.

### Commands

```bash
DRY_RUN=1 corepack pnpm seed:catalog   # print one product input; no API calls
corepack pnpm seed:catalog             # create missing products and collections
UNPUBLISH_OTHERS=1 corepack pnpm seed:catalog

DRY_RUN=1 corepack pnpm seed:content   # list pages, articles and images
corepack pnpm seed:content             # create missing Shopify content
UPDATE=1 corepack pnpm seed:content    # replace existing page and article bodies
```

## Navigation and merchandising fidelity

`lib/nav/index.ts` is the single source for the menu and footer. It mirrors the live structure:

- `New In` → `/collections/chapter-x`.
- `Woman` → `/collections/women`, with Shop Woman, Shop by Occasion and Shop by Category columns
  plus two editorial tiles.
- `Unisex` → `/collections/unisex-1`, with Shirts & T-shirts, Bottoms and Outerwear.
- `Edit` → `/pages/lookbooks`, with Lookbooks and Journal.
- `Our World` → `/pages/about-us`, with About Us and Press.
- Footer columns: Help, Policies, The Brand and Socials.

Home links and collection chips were rewired to seeded handles: `chapter-x`, `corsets`,
`dresses-and-jumpsuits`, `core`, `essentials`, `signature` and `bestsellers` are all created by the
seeder. The collection chips add `bottoms-women`, `co-ord-sets`, `knits`, `new-in` and `tops`; the
seed includes each one.

Known differences from the reference are deliberate or environmental:

| Area          | Reference                               | This replica                                                             |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| Currency      | INR default with a 55-currency selector | USD from the trial store; static `USD` label, no selector                |
| Product rail  | Five cards in the measured design       | Up to eight `bestsellers` cards in `HomeProductRail`                     |
| Product image | 3:4 card media in `DESIGN.md`           | 2:3 media in `components/product-card/product-card.tsx`                  |
| Desktop nav   | Desktop starts at 1100px                | Nav uses Tailwind `xl` (1280px); 768–1279px uses the compact header/menu |
| Account       | Visible account utility                 | Hidden while `shopConfig.auth.isEnabled` is false                        |
| Shipping copy | INR-denominated shipping thresholds     | Same INR copy retained while the store and cart are priced in USD        |
| Payment marks | Brand logo assets                       | Typographic labels in `components/footer/index.tsx`                      |

## Assets

| Location                  | Contents                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `docs/reference/`         | 26 live-site JPG captures, plus `DESIGN.md`, `FLOWS.md` and `ASSETS.md`.                                                          |
| `public/reference/`       | 12 original design-study assets used by the shell and homepage: wordmark, hero, editorial images and link tiles.                  |
| `public/reference/clone/` | 40 reference images used as seed input for Shopify content: about, press, lookbook/archive, journal, care guide and size diagram. |
| Shopify Files / CDN       | Seeded product and content photography, served through `cdn.shopify.com`; `next.config.ts` allows that remote host.               |

The `public/reference/` files are the reference brand's assets. `public/reference/clone/` has the
same restriction: it exists for the private study and must be replaced before launch. Product and
content photography is uploaded to Shopify Files by the seeders; the `public/` copies are seed input
and app-owned design assets, not the runtime source for migrated content.

Every `next/image` usage in the rebuilt surfaces passes `sizes="100vw"`, including thumbnails, as
required by `AGENTS.md`. `next.config.ts` sets `deviceSizes: [1320, 1920]` and `imageSizes: []`, so
the same two generated widths serve all surfaces.

## Analytics

`components/analytics/index.tsx` renders `GoogleAnalytics` and `GoogleTagManager` from
`@next/third-parties/google`. Vercel Analytics and Speed Insights are separate opt-in switches in
`shopConfig.analytics` and are disabled in the current config.

| Variable                        | Effect                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Loads the direct GA4 tag, for example `G-SQVPB589E7` in the local environment.              |
| `NEXT_PUBLIC_GTM_ID`            | Loads Google Tag Manager and takes precedence; the direct GA4 tag is not rendered when set. |

The GTM branch avoids double-counting page views: when a container is configured, GA4 comes from the
container. The component renders under a Suspense boundary in `app/layout.tsx`.

Recorded Playwright verification in `docs/IMPLEMENTATION.md` shows
`https://googletagmanager.com/gtag/js?id=G-SQVPB589E7` returning 200 and
`google-analytics.com/g/collect` receiving `en=page_view` for the storefront routes. A local build
with the current `.env.local` emits the direct `G-SQVPB589E7` script tag; production reads the
measurement ID from the Vercel environment.

## Verification

Checks run against the repository on 5 November 2026:

| Command                   | Result                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| `corepack pnpm lint`      | Passes: oxlint completed without errors; oxfmt found no formatting differences. |
| `corepack pnpm typecheck` | Passes: `next typegen` then `tsc --noEmit` with no errors.                      |
| `corepack pnpm build`     | Passes: Next.js 16.4.3, all static pages generated.                             |

The latest build reported `Generating static pages (106/106)`. Use the output of a later build rather
than treating 106 as a permanent target.

Route checks against the running storefront returned 200 for:

- Every Shopify content route: `/pages/about-us`, `/pages/lookbooks`, `/pages/care-guide`,
  `/pages/press-v2`, `/pages/faqs`, `/pages/shipping-returns`, `/pages/returns-exchanges`,
  `/pages/terms-of-service` and `/pages/privacy-policies`.
- The app-owned routes: `/pages/contact-us`, `/pages/size-guide` and `/pages/wishlist`.
- The Shopify journal index and all three articles under `/blogs/journal-2/`.
- All 23 seeded collection handles, plus `/collections/all`, `/products/alma-lace-corset-top`,
  `/cart`, `/search`, `/` and the Shopify `contact` page.
- `/wishlist` returns a 307 redirect to `/pages/wishlist`, which returns 200.

Interactive checks recorded in `docs/IMPLEMENTATION.md`: the size finder returns a size result, FAQ
panels expand, the contact form shows its local success state, and add-to-cart opens the cart drawer
with the expected line item. Checkout is wired to the cart's Shopify `checkoutUrl`; GA4 was checked
in the browser network panel as described above.

## Reproduction checklist

1. Install Node 26 and pnpm 12.16.1. The repository pins both in `package.json` and `.nvmrc`;
   `corepack enable` gets the pinned pnpm.
2. Run `corepack pnpm install`.
3. Copy the environment template with `cp .env.example .env.local` and fill the Shopify values:
   `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` and
   `NEXT_PUBLIC_SHOPIFY_SHOP_ID`. Set `NEXT_PUBLIC_SITE_URL` for correct canonical URLs outside
   Vercel. Keep `.env.local` out of git.
4. Add seed credentials: `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` from the Dev Dashboard app,
   or `SHOPIFY_ADMIN_ACCESS_TOKEN` as an alternative. Set `SHOPIFY_PUBLICATION_ID` when the Headless
   publication name is not detected automatically.
5. Start the storefront with `corepack pnpm dev`.
6. After the Headless channel exists, run `DRY_RUN=1 corepack pnpm seed:catalog`, then
   `corepack pnpm seed:catalog`. Use `UNPUBLISH_OTHERS=1` only when the demo catalog should be
   removed from the Headless channel.
7. Verify the home page, a collection with products, a product page, add-to-cart, cart and checkout
   redirect. Run `corepack pnpm lint`, `corepack pnpm typecheck` and `corepack pnpm build` before
   handing the project on.

For next operational steps, see `docs/SHIPROCKET.md` for shipping and fulfilment options and
`docs/VERCEL-DEPLOYMENT.md` for environment variables, Shopify webhooks, deployment and production
verification.

## Known gaps

- **Content ownership:** the editorial and policy pages plus the journal now live in Shopify and
  render through the dynamic page, blog and article routes. Contact, size guide and wishlist remain
  Next.js because they need forms, local state or a client-side size finder. Navigation remains
  code-owned in `lib/nav/index.ts`. Do not add local static routes for Shopify handles; see
  [`CONTENT.md`](./CONTENT.md).
- **Forms:** the contact form and both newsletter forms only show a local success state. They do not
  send mail, create a Shopify customer or post to a marketing provider.
- **Hosted commerce surfaces:** checkout, payment failure, order status and customer account sign-in
  are Shopify-hosted. Customer accounts are disabled by default.
- **Wishlist:** saves products in `localStorage` under `ps-wishlist`; it is per-browser and is not
  synced to a customer account.
- **Currency:** the trial store is priced in USD, so the storefront shows USD. The reference defaults
  to INR and exposes a currency selector; this replica has only a static USD label.
- **Catalog imagery:** accessories and outerwear use editorial or press imagery from the reference
  rather than dedicated product photography. The seeder does not add new photography.
- **Brand assets:** the wordmark, reference photography and copied brand copy must be replaced before public distribution. The current assets are licensed for this private study only.
