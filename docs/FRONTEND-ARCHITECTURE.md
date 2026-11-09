# Frontend architecture

This is the entry point for the storefront frontend: what runs where, why each layer exists,
which file owns which concern, and what is still open. It describes the repository as it exists on
7 November 2026.

Read this first. The deeper references are:

- [`FRONTEND-GLOSSARY.md`](./FRONTEND-GLOSSARY.md) — every UI/frontend term used here, defined in
  plain English, with where it lives in the code and external learning resources.
- [`PAYMENTS.md`](./PAYMENTS.md) — checkout, India payment gateways, pending-payment behavior and
  payment security.
- [`SHOPIFY-WALKTHROUGH.md`](./SHOPIFY-WALKTHROUGH.md) — Shopify, Hydrogen and Vercel in detail.
- [`HYDROGEN-USAGE.md`](./HYDROGEN-USAGE.md) — the exact Hydrogen SDK surface in use.
- [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) — the presentation rebuilt in this repository.
- [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) — the presentation contract.
- [`CONTENT.md`](./CONTENT.md) — content ownership and invalidation.
- [`OBSERVABILITY.md`](./OBSERVABILITY.md) — logs, analytics and monitoring gaps.
- [`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md) — the catalog and parity closure plan.

`AGENTS.md` remains the binding rulebook. This document explains the shape those rules produce; it
does not replace them.

## 1. Current state at a glance

| Item                                 | State                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Framework                            | Next.js 16.4 App Router, React 19.3, React Compiler, Cache Components                         |
| Shopify SDK                          | `@shopify/hydrogen` 2026.10.2, framework-agnostic SDK only                                    |
| Styling                              | Tailwind CSS 4.3, shadcn/base-ui primitives, tokens in `app/globals.css`                      |
| Runtime                              | Node 26, pnpm 12.16.1, deployed to Vercel                                                     |
| Store                                | Lorem Ipsum (`dummy-store-f0ejfuh9.myshopify.com`), store currency INR (set 10 November 2026) |
| Catalog                              | 95 products, 880 variants, 709 images, 41 collections, 0 unavailable variants                 |
| Content                              | 11 published Shopify pages, the `journal-2` blog and 3 articles; 3 app-owned pages            |
| Customer accounts                    | **Enabled** (`shopConfig.auth.isEnabled = true`)                                              |
| Shop Agent (Eve)                     | **Disabled** (`shopConfig.agent.isEnabled = false`)                                           |
| BotID                                | Disabled                                                                                      |
| Vercel Analytics / Speed Insights    | Disabled                                                                                      |
| Shopify analytics / consent / WebMCP | Disabled                                                                                      |
| GA4                                  | Loads when `NEXT_PUBLIC_GA_MEASUREMENT_ID` or `NEXT_PUBLIC_GTM_ID` is set                     |
| Currency                             | Store currency INR; INR-only display; prices are interim ×100 values                          |
| Locale                               | Single locale: country `US`, language `EN`, formatting locale `en-US`                         |

The catalog figures come from a read-only Storefront API check on 7 November 2026. Treat them as a
snapshot, not a schema.

## 2. The three owners

Every feature belongs to exactly one owner. A change that needs two owners is split at the data
boundary.

**Shopify owns commerce.** Products, prices, availability, collections, carts, checkout, customers,
orders, policies and editorial content all come from Shopify. The app reads them through the
Storefront API and the Customer Account API, and writes carts through Hydrogen's cart handlers. It
never recomputes a price, a discount, a total or an identity.

**Next.js owns the app.** Routing, Server Components, Suspense, caching and invalidation, metadata,
images, the request boundary, and the machine-readable surface for answer engines. It decides when
to call Shopify and what to cache. It never owns a commerce fact.

**Eve owns the agent.** Sessions, channels, tools, instructions and model selection. It is optional,
disabled by default, and calls the same uncached Shopify operations the storefront uses.

### Request path

```
Browser
  │
  ├─ page request ─────────────► proxy.ts
  │                                ├─ Hydrogen handlers: /api/cart, /api/predictive-search, auth
  │                                ├─ Shopify routes: /api/mcp, /api/ucp/mcp, /.well-known/ucp
  │                                ├─ collection refine rewrite
  │                                └─ markdown negotiation
  │                                      │
  │                                      ▼
  │                                app/** Server Components
  │                                  ├─ get*() cached wrapper
  │                                  │    └─ fetch*() uncached operation
  │                                  │         └─ storefront.request()
  │                                  │              └─ Storefront API
  │                                  └─ request-time read: fetch*() directly
  │
  └─ checkout ──────────────────► Shopify-hosted checkout
                                   (cart.checkoutUrl)
```

The important split is **Shopify fetches, Next.js caches**. `lib/shopify/operations/**/server.ts`
exports uncached `fetch*` operations and never imports `next/cache`. Cached domains export `get*`
wrappers from `lib/<domain>/server.ts` that own `"use cache: remote"`, `cacheLife` and `cacheTag`;
request-time domains such as search and cart export uncached or per-request helpers instead.

## 3. Repository map

```
app/                      Next.js routes, route handlers and route groups
  account/                Customer account routes, gated by layout
  api/                    Webhook, revalidation and agent-session handlers
  agent/                  Eve UCP profile route
  blogs/                  Shopify blog and article routes
  collections/            Collection index, detail and request-time refine route
  md/                     Markdown mirrors for answer engines
  pages/                  Shopify pages plus app-owned contact, size guide, wishlist
  policies/               Shopify policy routes
  products/               Product detail route
  search/                 Search results route
  sitemap/                Sitemap shards
  wishlist/               Redirect to /pages/wishlist
components/               Presentation
  ui/                     Primitive-only building blocks
  <domain>/               Domain components (nav, cart, product, collections, account, …)
  agent/                  Eve chat UI
  schema/                 JSON-LD
lib/                      Universal, server, client, request, action and type modules
  shopify/                Shopify transports, operations, fragments, transforms, logging
  cart/                   Hydrogen cart handlers, store and checkout
  auth/                   Customer session adapter and read helpers
  product/ collection/ search/ filters/ blog/ pages/ policies/
  money/ seo/ markdown/ nav/ content/ wishlist/ config/ agent/ botid/
agent/                    Eve agent definition, channels, tools and instructions
scripts/                  Offline catalog import, content seed, design and reference checks
design/                   Token manifest, drift baseline and exception file
tests/design/             Playwright computed-style, ARIA and flow contracts
docs/                     Architecture, design, content, deployment and research records
public/                   Brand, reference imagery and icons
proxy.ts                  Request boundary
next.config.ts            Next.js, images, BotID and Eve wiring
turbo.json                globalEnv declarations
```

### Why `lib/` is split by file name

| File         | Runs where             | Purpose                                                                                                                |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `index.ts`   | Anywhere               | Universal helpers and transforms. Never a barrel.                                                                      |
| `server.ts`  | Server only            | Cached `get*` wrappers and server-only helpers.                                                                        |
| `request.ts` | Proxy / route handlers | Takes the `Request` or `Headers` explicitly; must not import `next/headers`, `next/cache`, `next/navigation` or React. |
| `client.ts`  | Client boundary        | Hooks and providers (`"use client"`). Not an HTTP client.                                                              |
| `action.ts`  | Server Actions         | `"use server"`; verb + `Action` exports, validated with Zod.                                                           |
| `types.ts`   | Anywhere               | Domain models, imported with `import type`.                                                                            |

## 4. Route map

| Route                                                                         | File                                               | Data source                                              | Rendering / caching                                       |
| ----------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `/`                                                                           | `app/page.tsx`                                     | Shopify bestsellers collection + local editorial tiles   | Static shell; rail is a cached collection read            |
| `/collections`                                                                | `app/collections/page.tsx`                         | `getCollectionsListing`                                  | Cached, `collections` tags                                |
| `/collections/[handle]`                                                       | `app/collections/[handle]/page.tsx` + `layout.tsx` | `getCollection`, `getCollectionResults`                  | Default first page cached; layout resolves the collection |
| `/collections/[handle]/refine`                                                | `refine/page.tsx`                                  | `fetchCollectionResults`                                 | Request-time; reachable only through the proxy rewrite    |
| `/collections/all`                                                            | `app/collections/all/page.tsx`                     | `getAllProductsResults`                                  | Default first page cached                                 |
| `/collections/all/refine`                                                     | `refine/page.tsx`                                  | `fetchSearchResults`                                     | Request-time; proxy rewrite only                          |
| `/products/[handle]`                                                          | `app/products/[handle]/page.tsx`                   | `getProduct`; selected variant via `fetchProductVariant` | Product cached; selected variant live                     |
| `/search`                                                                     | `app/search/page.tsx`                              | `fetchSearchResults`                                     | Request-time; `noindex`                                   |
| `/cart`                                                                       | `app/cart/page.tsx`                                | Hydrogen cart store / handlers                           | Per-request; never cached                                 |
| `/account/*`                                                                  | `app/account/(authenticated)/…`                    | Customer Account API                                     | Per-request; `noindex`; layout gate                       |
| `/pages/[handle]`                                                             | `app/pages/[handle]/page.tsx`                      | `getPage`                                                | Cached, `pages` + `page-<handle>`                         |
| `/pages/contact-us`                                                           | `app/pages/contact-us/page.tsx`                    | Local contact form and `shopConfig.site.contact`         | App-owned                                                 |
| `/pages/size-guide`                                                           | `app/pages/size-guide/page.tsx`                    | Local size tables                                        | App-owned                                                 |
| `/pages/wishlist`                                                             | `app/pages/wishlist/page.tsx`                      | `localStorage`                                           | Client-only; `noindex`                                    |
| `/wishlist`                                                                   | `app/wishlist/page.tsx`                            | Redirect                                                 | Redirects to `/pages/wishlist`                            |
| `/policies/[handle]`                                                          | `app/policies/[handle]/page.tsx`                   | `getShopPolicy`                                          | Cached, `policies`                                        |
| `/blogs/[blogHandle]`                                                         | `app/blogs/[blogHandle]/page.tsx`                  | `getBlog`                                                | Cached, `blogs` + `blog-<handle>`                         |
| `/blogs/[blogHandle]/[articleHandle]`                                         | article page                                       | `getBlogArticle`                                         | Cached, `articles` + `article-…`                          |
| `/md`, `/md/products/[handle]`, `/md/collections/[handle]`, `/md/search`      | `app/md/**`                                        | Home/search static; product/collection use `get*`        | Markdown representations                                  |
| `/llms.txt`                                                                   | `app/llms.txt/route.ts`                            | Collections + policies                                   | Plain text, one-day CDN cache                             |
| `/sitemap.xml` and `/sitemap/[shard]`                                         | `app/sitemap*`                                     | Shopify sitemap operations                               | XML shards                                                |
| `/robots.txt`                                                                 | `app/robots.ts`                                    | `shopConfig`                                             | Metadata route                                            |
| `/manifest.webmanifest`                                                       | `app/manifest.ts`                                  | `shopConfig`                                             | Metadata route                                            |
| `/api/cart`, `/api/predictive-search`                                         | `proxy.ts`                                         | Hydrogen handlers                                        | Per-request                                               |
| `/api/webhooks/shopify`                                                       | `app/api/webhooks/shopify/route.ts`                | HMAC-verified webhook                                    | Invalidates tags                                          |
| `/api/revalidate`                                                             | `app/api/revalidate/route.ts`                      | Bearer token                                             | Invalidates up to 20 tags                                 |
| `/api/agent/session`                                                          | `app/api/agent/session/route.ts`                   | Cart cookie / empty cart                                 | 404 when Eve is disabled                                  |
| `/agent/ucp-profile.json`                                                     | `app/agent/ucp-profile.json/route.ts`              | Static agent profile                                     | 404 when Eve is disabled                                  |
| `/account/authorize`, `/account/login`, `/account/logout`, `/account/refresh` | `proxy.ts`                                         | Hydrogen customer handlers                               | OAuth lifecycle                                           |

### Rendering rules the routes follow

- Pages are Server Components. Client Components are leaves for state, effects, browser APIs and
  event handlers.
- Routes with runtime params render a synchronous page and wrap async content in `Suspense` with a
  route skeleton exported beside the component (`ProductDetailSkeleton`, `RichTextPageSkeleton`,
  `BlogIndexSkeleton`, …). There is no `loading.tsx`.
- `PLACEHOLDER_HANDLE` (`__placeholder__`) is the fallback static param when a Shopify read is
  empty or fails. Routes normally return real Shopify handles from `generateStaticParams`; the
  placeholder renders `notFound()`.
- The default collection results do not depend on search params, so their products stay in the
  static shell. `SearchParamsProbe` still awaits the params so the proxy rewrite runs. Filtered and
  sorted URLs are rewritten by `proxy.ts` to `refine`, which reads them at request time.
- The root layout exports `ensureStatic = "prefetch"` so the app shell and per-link prefetches stay
  static.

## 5. Caching model

There are 15 `"use cache: remote"` directives across six files. Every one uses
`cacheLife("max")`.

| Cached read                            | File                        | Tags                                                                          |
| -------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `getProduct`                           | `lib/product/server.ts`     | `products`, `product-<handle>`, `product-<id>`                                |
| `getSearchIndexProducts`               | `lib/product/server.ts`     | `products`, `products-index`, product IDs                                     |
| `getProductRecommendations`            | `lib/product/server.ts`     | `products`, `recommendations-<handle>`, product IDs                           |
| `getCollections`                       | `lib/collections/server.ts` | `collections`, `collections-index`, collection tags                           |
| `getCollection`                        | `lib/collections/server.ts` | `collections`, `collection-<handle>`, collection ID                           |
| `getCollectionsListing`                | `lib/collections/server.ts` | `collections`, `collections-index`, thumbnail product IDs                     |
| `getCollectionResults`                 | `lib/collections/server.ts` | `collections`, `collection-<handle>`, `products-index`, product IDs           |
| `getAllProductsResults`                | `lib/collections/server.ts` | `products-index`, product IDs                                                 |
| `getBlog`                              | `lib/blog/server.ts`        | `articles`, `blogs`, `blog-<handle>`                                          |
| `getBlogArticle`                       | `lib/blog/server.ts`        | `articles`, `blogs`, `article-<blog>-<article>`, `blog-<blog>`                |
| `getPage`                              | `lib/pages/server.ts`       | `pages`, `page-<handle>`                                                      |
| `getShopPolicies`                      | `lib/policies/server.ts`    | `policies`                                                                    |
| Sitemap counts and pages (3 functions) | `lib/seo/server.ts`         | `products`, `collections`, `pages`, `blogs`, `articles` and per-resource tags |

**Never cached:** carts, cart IDs, customer data, selected product variants, filtered or sorted
browse, Load more pages, search results and facets, and all `fetch*` operations.

Why filtered browse is request-time: cursor pagination plus Search & Discovery can reorder results
without a webhook. A cached page two would drift from page one and duplicate products.

Invalidation has two paths:

1. `app/api/webhooks/shopify/route.ts` verifies `X-Shopify-Hmac-Sha256` and invalidates product and
   collection tags. `products/create` and `products/delete` also clear `products-index`;
   `collections/create` and `collections/delete` also clear `collections-index`. The current
   metaobject branch invalidates tags no read uses.
2. `POST /api/revalidate` accepts up to 20 `?tag=` values with `REVALIDATE_SECRET`. Pages, policies,
   blogs and articles have no Shopify webhook topic, so this is their invalidation path.

## 6. Commerce data layer

### `lib/shopify/`

| Path                                | Responsibility                                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `storefront/server.ts`              | `storefront.request()` and `createRequestStorefrontClient()`; locale injection, 10 s timeout, `?operation=` annotation |
| `customer-account/server.ts`        | Customer Account API client and unauthorized detection                                                                 |
| `operations/products/server.ts`     | 10 product, search, collection and option operations                                                                   |
| `operations/collections/server.ts`  | Collection reads and listing                                                                                           |
| `operations/blogs/server.ts`        | Blog index and article reads; article body sanitized                                                                   |
| `operations/pages/server.ts`        | Page reads; body sanitized                                                                                             |
| `operations/policies/server.ts`     | Storefront policy reads plus the `search_shop_policies_and_faqs` MCP call                                              |
| `operations/customer/server.ts`     | Customer profile, orders, addresses and four mutations                                                                 |
| `operations/localization/server.ts` | Store currency read; Eve uses it for price caps                                                                        |
| `operations/sitemap/server.ts`      | Sitemap counts and shards                                                                                              |
| `operations/catalog/server.ts`      | `search_catalog` on `/api/ucp/mcp`; Eve only                                                                           |
| `fragments/**`                      | 19 `gql()` documents                                                                                                   |
| `transforms/**`                     | Shopify responses → domain models                                                                                      |
| `html/server.ts`                    | `sanitizeShopifyHtml`                                                                                                  |
| `errors/server.ts`                  | `assertStorefrontOk`, `withFallback`                                                                                   |
| `logging/server.ts`                 | Shared Hydrogen logger and `DEBUG_SHOPIFY` timing                                                                      |
| `mcp/server.ts`                     | JSON-RPC / SSE client for Shopify MCP endpoints                                                                        |
| `id/server.ts`                      | Numeric Shopify ID helpers                                                                                             |
| `types.ts`                          | `ResultOf` and response wrappers                                                                                       |

`storefront.request()` returns `{ data, errors }` for GraphQL responses. HTTP, network and timeout
failures throw Hydrogen's `StorefrontApiError` / `StorefrontTimeoutError`; callers handle returned
GraphQL errors through `assertStorefrontOk`.

### Transform rule

Presentation consumes domain models from `lib/<domain>/types.ts`, never raw Shopify responses.
Prices are `Money`, media are `Image`, pagination is `PageInfo`. Cross-domain primitives live in
`lib/money/types.ts`, `lib/media/types.ts` and `lib/pagination/types.ts`.

### Cart

- `lib/cart/request.ts` creates the Hydrogen cart handlers. `createCustomerCartHandlers()` attaches
  the customer session so new carts carry buyer identity and checkout URLs can include
  `logged_in=true`.
- `proxy.ts` serves `/api/cart`. The cart cookie is Hydrogen's `cart` cookie (14 days,
  `SameSite=Lax`, no `HttpOnly` or `Secure`).
- `lib/cart/client.ts` exposes `CartProvider`, `useCart`, `useCartActions`, `useCartForm`,
  `useSuspenseCart` and `useCheckout`.
- `seedCartData` is repository code in `lib/cart/server.ts`. It is React `cache()`, called
  un-awaited in the root layout, and shares one per-request promise. It is not a Next.js data-cache
  entry.
- `prepareCheckoutAction` is the only cart Server Action. It reads the confirmed checkout URL and
  does not mutate the cart.
- `createEmptyCart` is the one cart write that bypasses the `/api/cart` handler: it calls Hydrogen's
  `cartCreate` query directly because `/api/agent/session` must create a cart before the agent's
  first turn.
- There is no cart caching, no cart Server Action for mutations, and no cache-tag invalidation for
  cart changes.

### Customer accounts

Sign-in happens on Shopify's hosted account page, where Shopify sends the default passwordless email
one-time code; see [`AUTHENTICATION.md`](./AUTHENTICATION.md).

- Session cookie family: `shop_customer_session.0` through `.3`, up to four chunks, AES-256-GCM encrypted
  with a SHA-256 key derived from `CUSTOMER_ACCOUNT_SESSION_SECRET`, 7-day lifetime, `HttpOnly`,
  `SameSite=Lax`, `Secure` over HTTPS.
- OAuth paths: `/account/authorize`, `/account/login`, `/account/logout` (same-origin POST),
  `/account/refresh`.
- `isCustomerLoggedIn()` reads session state. `requireCustomerSession()` gates account routes.
  `requireCustomerAccessToken()` redirects refreshable sessions through `/account/refresh` and is
  called immediately before every Customer Account API request.
- Server Components never refresh tokens. Refresh happens only where Hydrogen can commit cookies.

### Currency display — INR only

The store currency is **INR** (set 10 November 2026). The storefront shows INR only; the former
display-only USD option was removed, so the header, mobile menu and footer render a static `INR`
label. `lib/money/display.ts` keeps the conversion helpers for a future multi-currency decision, and
`components/currency/provider.tsx` still reads `ps_display_currency`, but INR is the only valid
value. Checkout, Schema.org, Markdown and Eve remain in the store currency, INR.

The reference store shows “Approx. in USD — charged in INR at checkout” when a non-INR display
currency is selected. Reproduce that note if a second display currency is ever added; do not show
converted prices without it.

Prices are **interim**: every former USD variant amount was multiplied by 100 on 10 November rather
than converted at the reference rate, so a $51 product now reads ₹5,100. The cached source INR
catalog (95 products) should replace those values; the importer reads the shop currency and
preserves source INR prices. Free-shipping copy and the cart threshold are ₹50,000.

This is the one place where the app renders a price-derived value that Shopify did not return, and
it is a documented exception rather than the rule. The pending decision is whether to keep it,
remove it, or replace it with Shopify Markets.

## 7. Component system

**`components/ui/` takes primitive props only.** It may not import domain types, Shopify types or
content helpers. Domain wrappers supply labels and data. Interactive primitives are client
components; the rest are server-safe.

**Domain components** own a surface: `nav/`, `cart/`, `collections/`, `product/`, `product-detail/`,
`account/`, `content/`, `blog/`, `footer/`, `newsletter/`, `wishlist/`, `analytics/`, `schema/` and
`agent/`.

**Push `"use client"` down.** Pages, layouts and data wrappers stay server components. State,
effects, browser APIs and handlers live in leaves.

### Surface-to-component map

| Surface        | Key files                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell      | `app/layout.tsx`, `components/currency/provider.tsx`, `components/cart/context.tsx`, `components/newsletter/popup.tsx`, `components/action-bar/index.tsx`                                                                 |
| Home           | `app/page.tsx`, `components/product/home-product-rail.tsx`, `components/product/product-rail.tsx`, `components/product-card/product-card.tsx`                                                                             |
| Header and nav | `components/nav/index.tsx`, `header.tsx`, `announcement.tsx`, `desktop-nav.tsx`, `mobile-menu.tsx`, `search-modal.tsx`, `contact-drawer.tsx`, `cart.tsx`, `account.tsx`, `lib/nav/index.ts`                               |
| Search         | `components/nav/search-modal.tsx`, `app/search/page.tsx`, `components/collections/browse.tsx`                                                                                                                             |
| Collections    | `app/collections/**`, `components/collections/{collection-page,browse,collection-browse-provider,filters,filters-client,toolbar,sort-select,infinite-product-grid,collection-card}.tsx`                                   |
| Product        | `app/products/[handle]/page.tsx`, `components/product-detail/{product-detail-section,product-media,product-info,product-form,buy-buttons,product-tabs,size-guide,lightbox}.tsx`, `components/product-card/quick-shop.tsx` |
| Cart           | `components/cart/{cart-ui,context,overlay,line-item,line-form,summary,discount-form,warnings,cart-page}.tsx`, `lib/cart/client.ts`                                                                                        |
| Footer         | `components/footer/index.tsx`, `payment-marks.tsx`, `components/newsletter/form.tsx`, `components/currency/selector.tsx`                                                                                                  |
| Account        | `app/account/(authenticated)/**`, `components/account/**`, `components/nav/account.tsx`                                                                                                                                   |
| Content        | `app/pages/**`, `app/policies/**`, `app/blogs/**`, `components/content/**`, `components/blog/**`                                                                                                                          |
| Wishlist       | `app/pages/wishlist/page.tsx`, `components/wishlist/content.tsx`, `components/product-card/wishlist-button.tsx`, `lib/wishlist/client.ts`                                                                                 |
| Agent          | `components/agent/**`, `components/action-bar/index.tsx`, `agent/**`                                                                                                                                                      |
| Analytics      | `components/analytics/**`, `lib/analytics/client.ts`                                                                                                                                                                      |
| Schema         | `components/schema/**`, `components/product-detail/schema.tsx`                                                                                                                                                            |
| Errors         | `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `components/error/error-boundary-content.tsx`                                                                                                               |

### Provider tree

```
CurrencyProvider
  └─ CartProviderWrapper            Hydrogen CartProvider + cart-drawer state
      ├─ Nav                        (PredictiveSearchProvider scoped to the search modal)
      ├─ main
      ├─ Footer
      ├─ CartUI
      ├─ NewsletterPopup
      ├─ ActionBar / AgentButton
      └─ AnalyticsComponents
```

Scoped providers: `PredictiveSearchProvider` around the search modal, `ProductProvider` in the PDP
form and quick shop, and Hydrogen's `CollectionProvider` in the collection layout.

### State ownership

| State                                                      | Owner                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| Product options, collection filters and sort, search query | URL search params                                                        |
| Cart lines and optimistic mutations                        | Hydrogen cart store, persisted by the cart cookie                        |
| Cart drawer open/closed                                    | `CartDrawerProvider`                                                     |
| Customer identity                                          | Hydrogen customer session cookie                                         |
| Display currency                                           | INR only; `localStorage["ps_display_currency"]` is accepted only for INR |
| Wishlist                                                   | `localStorage["wishlist"]` (product snapshots; per-browser)              |
| Recently viewed                                            | `localStorage["template-recently-viewed-v1"]`                            |
| Newsletter dismissal                                       | `localStorage["newsletter-dismissed-at"]`                                |
| Eve conversation                                           | `localStorage["template-eve-chat-v1"]`                                   |
| Header scroll, menus, filters, forms                       | Local React state                                                        |

## 8. Design system

- Tokens live only in `app/globals.css`, under `@theme` and `:root`.
- Breakpoints are `tablet` 750px and `desktop` 1100px. `wide` 1440px is registered but unused.
- Spacing uses `--gutter`, `--page-top`, `--section-gap`, `--grid-gap`, `--grid-row-gap` and
  `--card-inset`.
- Type uses the role utilities (`type-display`, `type-h2`, `type-h3`, `type-h4`, `type-label`,
  `type-body`, `type-body-sm`, `type-control`, `type-chip`, `type-tab`, `type-nav`); never raw
  `text-[…]`, `leading-[…]` or `font-medium`.
- Radii are zero; `rounded-full` is only for counts, colour dots and gallery indicators.
  `shadow-modal` is the only elevation.
- `pnpm lint` runs the static drift gate in `scripts/check-design.mjs`
  (`pnpm lint:design` runs only that gate).
- `pnpm test:design` runs the Playwright computed-style, ARIA, reduced-motion and flow contracts in
  `tests/design/`.
- `pnpm audit:reference` measures the running template and the live reference and writes
  `docs/reference/PLAYWRIGHT-COMPARISON.md`.

The design gate is a ratchet over `app/**` and `components/**`: exact token values, forbidden class
patterns, `next/link` outside `components/ui/link.tsx`, and a fixed import list in
`components/ui/` (`@/lib/shopify`, `@/lib/cart`, `@/lib/product`, `@/lib/collections`,
`next/navigation`, `next/headers`, `next/cache`). It does not scan `lib/`, `agent/`, `tests/` or
`scripts/`, and several default Tailwind namespaces remain available. The enforcement document
records the intended contract; this document records the actual gate.

## 9. Configuration and environment

`shopConfig` in `lib/config/index.ts` is the feature-flag source. It is read directly by server and
client code.

| Flag                                  | Current | Effect                                                                                 |
| ------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `auth.isEnabled`                      | `true`  | Customer Account proxy routes, account UI, customer-aware cart, required auth env vars |
| `agent.isEnabled`                     | `false` | `withEve`, agent button, session/profile routes, BotID routes                          |
| `botid.isEnabled`                     | `false` | BotID client and Eve browser check                                                     |
| `analytics.vercel.isEnabled`          | `false` | Vercel Analytics                                                                       |
| `analytics.speedInsights.isEnabled`   | `false` | Speed Insights                                                                         |
| `analytics.shopify.isEnabled`         | `false` | Shopify analytics scripts                                                              |
| `analytics.shopify.consent.isEnabled` | `false` | Contributes to Shopify script mounting                                                 |
| `shopify.webmcp.isEnabled`            | `false` | WebMCP registration                                                                    |
| `search.isEnabled`                    | `true`  | Header predictive-search modal only                                                    |
| `pdp.bundles.isEnabled`               | `true`  | Bundle fragments and PDP bundle UI                                                     |
| `pdp.buyWithShop.isEnabled`           | `true`  | Shop Pay button                                                                        |
| `pdp.quantityPicker.isEnabled`        | `true`  | PDP and quick-shop quantity control                                                    |
| `pdp.complementaryProducts.isEnabled` | `true`  | No effect; the flag is unused                                                          |
| `pdp.relatedProducts.isEnabled`       | `true`  | Related-products grid                                                                  |
| `redirects.shopifyNotFound.isEnabled` | `false` | Shopify URL-redirect resolution from the 404 page                                      |

### Required environment

`lib/config/server.ts` validates the environment during `next dev` and `next build`:

- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `NEXT_PUBLIC_SHOPIFY_SHOP_ID`

While `auth.isEnabled` is `true`, it also requires:

- `CUSTOMER_ACCOUNT_SESSION_SECRET`
- `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID`
- `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET`

A fresh checkout cannot start or build until those six values exist, or until auth is explicitly
disabled. `next typegen` is the only exempt phase.

Production should also set `NEXT_PUBLIC_SITE_URL` for canonical URLs; without it the site derives
the URL from `VERCEL_PROJECT_PRODUCTION_URL`. `SHOPIFY_WEBHOOK_SECRET` and `REVALIDATE_SECRET` are
optional feature gates: the webhook and revalidation routes return 404 until they are set. GA4/GTM,
Shopify analytics, BotID and Eve add their own variables; see `.env.example`.

The repository rule is that every user-configurable `process.env` read has a row in `.env.example`
and an entry in `turbo.json` `globalEnv`. The current tree declares the seed, verification and
preview switches; platform-injected values such as `VERCEL_ENV` and
`VERCEL_PROJECT_PRODUCTION_URL` are documented but not user-set.

## 10. Answer-engine surface

- `proxy.ts` rewrites a page request to its Markdown mirror when `Accept: text/markdown` wins, or
  when the URL ends in `.md` (`/index.md` for the home page). Mirrors exist for the home page,
  products, collections and search.
- `/llms.txt` lists the store, policies, collections and the Shopify UCP/MCP endpoints agents
  should use for live commerce.
- `/sitemap.xml` is an index of static, product, collection, page, blog and article shards.
- `/robots.txt` disallows cart, account, login, search and filtered collection URLs.
- Schema.org components cover the site, breadcrumbs, collections and products; product pages also
  emit Open Graph metadata.
- Shopify's own `/api/mcp`, `/api/ucp/mcp` and `/.well-known/ucp` are forwarded by Hydrogen through
  `proxy.ts`. They are not reimplemented here.

## 11. Agent layer (Eve)

The agent is **disabled**. When enabled:

- `agent/agent.ts` selects `openai/gpt-6-luna-fast`, disables default tools, and keeps workflow
  retention for chat restore.
- `agent/channels/eve.ts` defines one channel with Vercel OIDC, local-dev and browser auth; BotID
  runs only for browser auth and only when `botid.isEnabled` is true.
- Nine authored tools: `browse-collections`, `get-cart`, `get-product-details`,
  `get-recommendations`, `navigate`, `present-products`, `search-policies`, `search-products`,
  `update-cart`.
- There are no Eve connections. `search-products` calls `fetchCatalogSearch`, which calls
  `search_catalog` on Shopify's `/api/ucp/mcp` with the agent profile in
  `meta.ucp-agent.profile`. `search-policies` calls `search_shop_policies_and_faqs` on
  `/api/mcp`.
- Cart tools bind the cart from the browser cookie through channel session attributes. They never
  accept a cart ID from the model and never replay restored mutations. `mutateCart` treats an
  uncertain write as an error.
- `components/agent/cart-bridge.tsx` refreshes Hydrogen after each settled `update-cart` tool call,
  not after the whole turn settles, and blocks checkout while the write or refresh is unresolved.
- `UCP_AGENT_PROFILE_URL` overrides the profile URL sent to Shopify catalog search. It does not
  change what `/agent/ucp-profile.json` serves. Local, preview and `EVE_DEV=1` environments send
  Shopify's example profile unless the override is set.
- Enabling the agent requires BotID, Vercel Firewall rate limits, AI Gateway spending controls, a
  reachable production UCP profile, a production cart-cookie check and privacy copy.

## 12. What is pending

This is the current backlog, deduplicated across the docs. Historical records such as the root
`PLAN.md` (gitignored), `DESIGN-SYSTEM-AUDIT.md`, `UX-RECON-2026-11-05.md` and
`reference/PLAYWRIGHT-COMPARISON.md` are snapshots, not current task lists.

### A. Blocked on Shopify admin or external approval

| Item                                       | Blocker                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Mirror sold-out variants                   | New app version with `read_locations` and `write_inventory`; approve scopes and provide the location ID |
| Product type, Colour and Fabric filters    | Search & Discovery filter configuration in Shopify admin                                                |
| Checkout verification                      | Disable Online Store password protection                                                                |
| Production webhooks and cache invalidation | Register product/collection webhooks and set `SHOPIFY_WEBHOOK_SECRET`                                   |
| Production Customer Account OAuth          | Register callback/logout URLs and set the three auth secrets in Vercel                                  |
| Payments, shipping, taxes and duties       | Shopify admin configuration; the development store cannot take live payments                            |
| Production store ownership                 | A development store cannot become the merchant's production store                                       |
| Legal and privacy review                   | Merchant/legal review of seeded policies and any agent privacy copy                                     |

### B. Product decisions

| Decision                       | Current state                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Currency                       | INR is the store currency and the only display currency; prices are interim ×100 values; replace from the source INR catalog |
| Checkout test order            | Not placed; verification stops at the Shopify checkout redirect                                                              |
| Gallery parity                 | Stacked desktop gallery + lightbox + mobile snap carousel; no zoom, previous/next or image counter                           |
| Checkout provider              | Shopify checkout; no gateway configured; GoKwik is not implemented; see `PAYMENTS.md`                                        |
| Contact and newsletter backend | Both show a local success state and send nothing                                                                             |
| Wishlist persistence           | Browser-local only                                                                                                           |
| Navigation ownership           | Code-owned in `lib/nav/index.ts`; Shopify menus are not enabled                                                              |
| Product data depth             | Description-only; no structured fabric, fit, composition, origin or size-chart assignment                                    |
| Shipping and fulfilment        | Shopify native rates; no Shiprocket code                                                                                     |
| Localization                   | Single locale US/EN; no next-intl or Markets                                                                                 |
| Analytics and consent          | GA4 only; no consent management, Vercel Analytics or Speed Insights                                                          |
| Public Shop Agent              | Disabled; launch controls are external                                                                                       |

### C. Frontend code remaining

| Item                                                                 | Files                                                                      |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Add the missing `POLITE BLUE` swatch alias                           | `lib/product/color-swatches.ts`                                            |
| Add `--inventory-only` and preserve inventory on other imports       | `scripts/import-live-catalog.mjs`                                          |
| Add metadata-only import and Fabric/Fit metafields end to end        | importer, product fragment/transform, `product-tabs.tsx`, product Markdown |
| Render colour facets as swatch + label + count                       | `components/collections/filters-client.tsx`                                |
| Connect contact and newsletter forms                                 | `components/content/contact-form.tsx`, `components/newsletter/form.tsx`    |
| Add gallery zoom, lightbox navigation and counter if chosen          | `components/product-detail/product-media.tsx`, `lightbox.tsx`              |
| Import product/collection SEO copy and collection images             | importer and collection transforms                                         |
| Add error reporting, request IDs, structured logs and a health route | `instrumentation.ts`, `lib/shopify/logging`, new route                     |
| Make webhooks observable and idempotent                              | `app/api/webhooks/shopify/route.ts`                                        |
| Add CI for lint, typecheck, build and design tests                   | repository root                                                            |
| Sync wishlist to Customer Account if chosen                          | `lib/wishlist/client.ts`, `lib/customer/action.ts`                         |
| Move navigation to Shopify menus if chosen                           | `lib/nav/index.ts`, nav components                                         |
| Add ecommerce analytics events and consent handling                  | `components/analytics`, `lib/analytics/client.ts`                          |
| Remove or resolve dead config and components                         | `pdp.complementaryProducts`, unused product-card/lightbox variants         |

### D. Content and data remaining

- Structured product attributes: fabric/care, fit, composition, origin, manufacturer, category,
  size-chart assignment and fabric/colour families.
- Unique product and collection SEO titles, descriptions and images; collection descriptions.
- Product vendor and category correctness; the imported vendor is still `Polite Society`.
- Sold-out inventory availability.
- Descriptive image alt text; imported alt text is `TITLE image N`.
- Licensed or original photography and brand assets to replace reference imagery.
- Replace the interim ×100 variant prices with the cached source INR catalog; re-check compare-at
  prices and the zero-priced sold-out variants. The 39 Uniplus drafts now carry category-median
  prices; replace them with real prices before publishing.
- Real brand, contact, social, legal and shipping copy; verify policy thresholds match the INR
  store and the ₹50,000 free-shipping threshold.
- `/collections` and `/collections/all` are missing from the static sitemap shard.

### E. Production readiness

- Set the full production environment: Shopify values, auth secrets, site URL, webhook secret,
  revalidation secret and analytics IDs.
- Register Shopify webhooks and verify tag invalidation.
- Configure the Customer Account API callback and logout URLs for production and previews.
- Decide and configure analytics, consent, error reporting, request correlation and health checks.
- Add CI.
- Replace the stale anonymous Vercel artifact and create the production Vercel project/domain.
- Verify checkout, Customer Account OAuth, Eve, analytics and revalidation against a preview.

### F. Documentation status

This pass corrected the material drift in the core docs: catalog counts, enabled auth, the currency
selector, payment marks, gallery structure, available facets, admin script readers, menu ownership,
UCP profile behavior, webhook scope and the Eve cart-refresh timing. The design docs now separate the
presentation contract from current implementation and record the remaining deviations in
[`DESIGN-SYSTEM-AUDIT.md`](./DESIGN-SYSTEM-AUDIT.md). Regenerate
`docs/reference/PLAYWRIGHT-COMPARISON.md` before treating any visual snapshot as current.

## 13. Where to change what

| I want to…                                 | Change                                                                       | Do not                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------- |
| Change a product, price, title or image    | Shopify admin, or the Admin API importer                                     | Hardcode it in Next.js                        |
| Add one product                            | Shopify admin                                                                | Edit the seeder                               |
| Replace the catalog                        | `pnpm import:catalog`                                                        | Storefront API writes                         |
| Show a product, collection, page or policy | `get*` wrapper + `fetch*` operation                                          | Admin API at request time                     |
| Add a filter or sort                       | Shopify Search & Discovery + `fetch*` browse                                 | Compute filters in Next.js                    |
| Add to cart or change a line               | Hydrogen handlers behind `/api/cart`, `useCartForm`                          | Server Actions or direct Storefront mutations |
| Read the cart                              | `useCart` / `getCart`                                                        | A fresh Storefront query                      |
| Send a shopper to payment                  | `prepareCheckoutAction`                                                      | Build a checkout                              |
| Sign a customer in                         | Customer Account API + `proxy.ts` handlers                                   | A custom auth table                           |
| Add a page, blog index or policy route     | Storefront read + Next.js route                                              | A static duplicate                            |
| Add a URL, redirect or rewrite             | `next.config.ts` or `proxy.ts`                                               | Shopify navigation                            |
| Cache a read                               | `"use cache: remote"` + `cacheLife` + `cacheTag` in `lib/<domain>/server.ts` | Cache in `fetch*`                             |
| Invalidate content                         | Shopify webhook or `/api/revalidate`                                         | Purge the whole cache                         |
| Improve image delivery                     | `next/image` with reserved dimensions and `sizes="100vw"`                    | A custom CDN                                  |
| Change a token or primitive                | `app/globals.css` + `components/ui/` + design tests                          | A second styling system                       |
| Add an agent tool                          | `agent/tools/` with a `z.strictObject` schema                                | A new chat API route                          |
| Expose the store to answer engines         | Markdown, `/llms.txt`, Schema.org, sitemap                                   | Duplicate Shopify's agent endpoints           |

## 14. Verification

```sh
pnpm lint             # oxlint, formatting, static design drift gate
pnpm typecheck        # next typegen + tsc
pnpm build            # production build
pnpm test:design      # Playwright computed-style, ARIA, motion and flow contracts
pnpm audit:reference  # measure the running clone against the live reference
```

The design tests need `pnpm exec playwright install chromium` once. The reference audit needs the
clone running at `CLONE_URL` (default `http://localhost:3000`). The catalog and content scripts need
`.env.local`; they never run during a build.
