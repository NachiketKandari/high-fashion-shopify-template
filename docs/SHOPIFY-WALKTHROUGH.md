# Shopify walkthrough

How the pieces of this storefront fit together: what Shopify owns, which Shopify API to call, what
Hydrogen and Next.js each do, and where Vercel and Eve sit. Read this before changing anything that
touches commerce data, and use the decision tables when you are unsure which layer a change belongs
to.

This document describes this repository as it exists today. For the design study itself, see
[`reference/DESIGN.md`](./reference/DESIGN.md) and [`reference/FLOWS.md`](./reference/FLOWS.md); for
what has been rebuilt and verified, see [`IMPLEMENTATION.md`](./IMPLEMENTATION.md).

## 1. The one-paragraph model

Shopify is the system of record. It stores products, prices, inventory, collections, carts,
customers, orders, policies and pages. This repository is a **headless storefront**: a Next.js app
that reads Shopify through the **Storefront API**, writes carts through Hydrogen's cart handlers,
and authenticates customers through Shopify's **Customer Account API**. The only thing that ever
uses the **Admin API** is an offline provisioning script, because the Storefront API cannot create
products. Hydrogen is the SDK that supplies the Shopify clients and cart/form bindings; it is not
the Hydrogen React Router framework. Next.js owns routing, rendering, caching, metadata and the
markdown/answer-engine surface. Vercel hosts the Next.js app and its image optimizer. Eve is the
optional shopping agent, and it reads the same catalog through the same operations.

Nothing in the app reimplements a commerce fact. Prices, availability, currency, cart totals,
discounts and customer identity always come from Shopify.

## 2. The five layers

| Layer                | What it is                                                         | Owns                                                                                                                        | Lives in                                                                                            |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Shopify              | Commerce platform and database                                     | Products, variants, prices, inventory, collections, carts, checkout, customers, orders, policies, pages, blogs              | Outside the repo; configured in the Shopify admin                                                   |
| Storefront API       | Shopify's public, read-oriented GraphQL API for custom storefronts | Catalog reads, predictive search, cart creation and mutations, policy/page/blog reads                                       | `lib/shopify/storefront/server.ts`, `lib/shopify/operations/**`                                     |
| Admin API            | Shopify's private GraphQL API for store management                 | Creating and updating products, variants, images, collections, publications                                                 | `scripts/seed-catalog.mjs` only                                                                     |
| Customer Account API | Shopify's customer-scoped GraphQL API                              | Signed-in customer profile, addresses, orders                                                                               | `lib/shopify/customer-account/server.ts`, `lib/auth/**`                                             |
| Hydrogen             | Shopify's framework-agnostic storefront SDK                        | Storefront and Customer Account clients, cart server handlers, cart/product form bindings, predictive search, Shopify types | `@shopify/hydrogen` imports in `lib/` and `components/`; handlers registered in `proxy.ts`          |
| Next.js              | The application framework                                          | Routing, Server Components, caching, metadata, SEO, markdown negotiation, sitemap, robots, images                           | `app/`, `components/`, `lib/<domain>/{index,server,client,action}.ts`, `proxy.ts`, `next.config.ts` |
| Vercel               | Hosting and platform                                               | Builds, CDN, image optimization, environment variables, analytics, AI Gateway OIDC, Eve deployment                          | `next.config.ts`, Vercel project settings                                                           |
| Eve                  | The optional agent runtime                                         | Sessions, channels, tools, model selection, `/eve/v1/*`                                                                     | `agent/`, `lib/agent/`, `components/agent/`                                                         |

### Which layer should a change go in?

Ask who owns the fact you are changing:

- A price, stock level, product title, collection membership or policy text → **Shopify**.
- Reading that fact for a page → **Storefront API**, wrapped by a Next.js `get*` function.
- Creating or bulk-editing that fact → **Admin API** (or the Shopify admin UI).
- A URL, layout, cache tag, metadata tag or loading state → **Next.js**.
- A server or CDN concern, environment variable or deployment → **Vercel**.
- A shopping conversation or agent tool → **Eve**.

If a change needs two owners, split it at the data boundary. Do not let Next.js compute a price or
Shopify decide a route.

## 3. The three Shopify APIs used here

### 3.1 Storefront API — the storefront's read path

**What it is.** A public GraphQL API designed to be called from a storefront. The token is safe to
ship to the browser because it can only read published catalog data and mutate carts and checkouts.
It is not an admin credential.

**Where it is used.**

- `lib/shopify/storefront/server.ts` creates the client from
  `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
- `storefront.request(doc, { locale })` injects `$country: CountryCode` and
  `$language: LanguageCode` from `shopConfig.localization`, and returns `{ data, errors }`.
- `lib/shopify/operations/**/server.ts` holds one uncached `fetch*` function per operation. These
  files never import `next/cache`.
- `proxy.ts` creates a per-request Storefront client for Hydrogen's route handlers.

**What it can do.**

- Read products, variants, collections, filters, search, pages, blogs, policies and menus.
- Create a cart and mutate its lines, buyer identity, discount codes, attributes and delivery
  addresses.
- Read a cart.
- Produce a checkout URL.

**What it cannot do.**

- Create or edit products, collections or images. There are no catalog mutations.
- Read orders or customer records without the Customer Account API.
- Read unpublished products. Products must be published to the Headless sales channel.

**In this repo**, a page calls a cached `get*` wrapper, which calls an uncached `fetch*` operation,
which calls `storefront.request`. Eve tools call the `fetch*` operation directly, because an agent
must not read a cached snapshot.

### 3.2 Admin API — the management path

**What it is.** A private GraphQL API for managing the store. Its access token can read orders,
customers, inventory and every product, and can create or destroy data. It must never reach the
browser and must never be prefixed with `NEXT_PUBLIC_`.

**Where it is used.**

- `scripts/seed-catalog.mjs` only. The script creates products with `productSet`, collections with
  `collectionCreate`, adds products with `collectionAddProducts`, and publishes both with
  `publishablePublish`.
- Nothing in `app/`, `components/` or `lib/` calls the Admin API.

**Why the seeder exists.** The Storefront API has no product mutations. Seeding a catalog is an
administrative, one-off provisioning task, so it belongs in an offline script with a secret
credential, not in the runtime app. The script is idempotent: it looks up each handle and skips what
already exists.

**Publication is mandatory.** Creating a product or collection in Shopify does not make it visible
to the Storefront API. It must be published to the Headless sales channel. The seeder now does this
with `publishablePublish`, resolving the publication named Headless/Hydrogen/Storefront, or
`SHOPIFY_PUBLICATION_ID` when the name differs. A product that exists in the admin but 404s on the
site is almost always unpublished.

**Authentication changed in 2026.** Merchants can no longer create legacy custom apps in the
Shopify admin, so the old "Develop apps → Create app → reveal `shpat_…`" path is gone. The current
path is the Dev Dashboard and a client credentials grant; tokens expire after 24 hours. See
§12 for the exact runbook.

### 3.3 Customer Account API — the signed-in customer path

**What it is.** A customer-scoped GraphQL API that returns only the signed-in customer's profile,
addresses and orders. It is separate from both the Storefront and Admin APIs.

**Where it is used.**

- `lib/shopify/customer-account/server.ts` creates the client with the shop ID and the customer's
  access token.
- `lib/auth/request.ts` manages the Hydrogen customer session, OAuth callbacks and token refresh.
- `proxy.ts` registers Hydrogen's customer account handlers on the authorize, login, logout and
  refresh paths.
- `lib/auth/server.ts` exposes the read helpers used by Server Components:
  `isCustomerLoggedIn()`, `requireCustomerSession()` and `requireCustomerAccessToken()`.

**Rules.**

- Server Components read auth state; they never refresh it. Refresh only happens where Hydrogen can
  commit cookies, which is why refreshable sessions are redirected through `/account/refresh`.
- Enabling the feature requires `CUSTOMER_ACCOUNT_SESSION_SECRET`,
  `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` and `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET`, and
  `shopConfig.auth.isEnabled = true`.
- Sign-out is a same-origin POST so Hydrogen can clear the session and perform Shopify
  RP-initiated logout.

**Current state:** `shopConfig.auth.isEnabled` is `false`, so `/account` is not active and the
account flows cannot be exercised until those credentials exist.

### 3.4 API comparison

|                       | Storefront API                                | Admin API                                                         | Customer Account API        |
| --------------------- | --------------------------------------------- | ----------------------------------------------------------------- | --------------------------- |
| Audience              | Shoppers                                      | Store operators and integrations                                  | Signed-in customers         |
| Token                 | `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Dev Dashboard client credentials, or `SHOPIFY_ADMIN_ACCESS_TOKEN` | Customer OAuth access token |
| Secret?               | No, public by design                          | Yes, server-only                                                  | Yes, per customer           |
| Catalog writes        | No                                            | Yes                                                               | No                          |
| Cart writes           | Yes                                           | No (not the cart API)                                             | No                          |
| Orders                | No                                            | Yes                                                               | The customer's own orders   |
| Used at request time? | Yes                                           | No, offline script                                                | Yes, for signed-in routes   |
| Cached by Next.js?    | Yes, through `get*` wrappers                  | Not applicable                                                    | No                          |

## 4. Hydrogen's role

Hydrogen is the Shopify SDK, not the application framework. This repo deliberately uses the
framework-agnostic parts and **does not** use Hydrogen's React Router framework, loaders, actions or
Oxygen setup.

**What Hydrogen provides here.**

- `createStorefrontClient` and `createShopifyRequestContext` for the Storefront API, including
  locale-aware `$country` and `$language` variables and request-scoped clients.
- `createCartServerHandlers` for the cart routes served by `proxy.ts`.
- `createCustomerAccountServerHandlers` and the customer session helpers.
- `createPredictiveSearchServerHandlers` for the search endpoint.
- `useProductForm` and `useCartForm`, which bind product selection and cart mutations to those
  handlers and to Shopify's optimistic cart store.
- `seedCartData`, `createCartCookie` and cart cookie helpers.
- GraphQL helpers: `gql()`, `ResultOf`, operation documents and Shopify's generated types.

**Where it is used.**

- `proxy.ts`: the request boundary. It maps Shopify's standard routes onto Hydrogen handlers.
- `lib/cart/request.ts`: cart handler construction, including customer-aware carts.
- `lib/search/request.ts`: predictive search handlers.
- `lib/product/client.ts`: `ProductProvider` and `useProductForm`.
- `lib/cart/client.ts`: `CartProvider`, `useCart`, `useCartForm` and checkout preparation.
- `lib/shopify/storefront/server.ts` and `lib/shopify/customer-account/server.ts`: API clients.

**Where it must not be used.**

- Do not add React Router routes, loaders, actions, `entry.server.tsx` or Oxygen configuration.
- Do not create a second cart API. Cart writes go through the Hydrogen handlers behind `/api/cart`.
- Do not read cart data through the Storefront API directly in a component; use the cart store and
  the form bindings so optimistic state and cart cookies stay consistent.

**The division of labour:** Hydrogen speaks Shopify. Next.js decides when to call it, what to cache,
and how to render the result.

## 5. Next.js's role

Next.js owns everything around the commerce call.

**Routing and rendering.**

- `app/` holds the routes: home, collections, products, search, cart, account, blogs, pages,
  policies, wishlist, markdown mirrors, `llms.txt`, sitemap and robots.
- Pages are Server Components by default. Client Components are leaves for state, effects, browser
  APIs and handlers.
- Routes with runtime params render a synchronous page and suspend the async content with a route
  skeleton. There is no `loading.tsx`; the skeleton is exported beside the component it mirrors.
- `proxy.ts` is the request boundary. It serves Shopify's routes, rewrites filtered and sorted
  collection URLs to the refine route, negotiates markdown representations, and forwards customer
  headers.

**Data loading and caching.**

- `lib/shopify/operations/**/server.ts` is uncached: `fetch*` only.
- `lib/<domain>/server.ts` owns the cache: `get*` functions use `"use cache: remote"`,
  `cacheLife("max")` and `cacheTag(...)`.
- Pages call `get*`. Eve tools call `fetch*`.
- Carts are never publicly cached. `seedCartData` shares a per-request promise, not a data-cache
  entry.
- The default first page of a collection and of `/collections/all` is cached. Filtered and sorted
  browse, Load more pages, search results and their facets are not: cached cursor pages drift and
  duplicate products, and Search & Discovery edits send no webhook.

**Metadata and the answer-engine surface.**

- Metadata, canonical URLs, Open Graph, Schema.org, sitemap and robots are Next.js concerns, built
  from the same domain types as the HTML pages.
- `lib/markdown/`, `app/md/`, `app/llms.txt/` and `text/markdown` negotiation expose the storefront
  to answer engines.
- Shopify's own agent endpoints (`/api/mcp`, `/api/ucp/mcp`, `/.well-known/ucp`) are Shopify's.
  `proxy.ts` only forwards them. Do not reimplement them in Next.js, and do not route Eve through
  the markdown surface.

**Images.**

- Every image uses `next/image` with reserved dimensions and `sizes="100vw"`.
- `next.config.ts` sets `deviceSizes: [1320, 1920]` and allows `cdn.shopify.com`, so Shopify's CDN
  supplies the source and Vercel's optimizer supplies the variants.
- Only the LCP image is preloaded; grids stay lazy below the first row.

**Writes that are not cart writes.**

- Server Actions are public endpoints. Every `action.ts` export parses every argument with a
  module-private Zod schema before doing any work.
- Cart writes are the exception: they go through Hydrogen handlers, not Server Actions.

## 6. Vercel's role

Vercel hosts the Next.js application. It does not store commerce data and it does not decide what a
product costs.

**What Vercel provides.**

- Builds and deployments for `main`, previews and branch deployments.
- The CDN and edge network in front of the app.
- The image optimizer behind `next/image`, using the `remotePatterns` entry for `cdn.shopify.com`.
- Environment variables for production and preview. Anything read through `process.env` must be set
  there; local values live in `.env.local`.
- `VERCEL_PROJECT_PRODUCTION_URL`, which `lib/config/index.ts` uses to derive the site URL.
- Vercel Analytics and Speed Insights, wired in `components/analytics/index.tsx` and disabled in
  `shopConfig` for now.
- Vercel AI Gateway OIDC for Eve's model access outside local development.
- `withEve` in `next.config.ts`, which mounts the Eve runtime alongside Next.js.

**What Vercel does not own.**

- Product data, prices, inventory, carts, customers and orders. Those are Shopify's.
- Cache semantics. Next.js owns `"use cache"`, `cacheLife` and `cacheTag`; Vercel only runs the
  result.
- The Admin API. Never run the seeder as part of a deployment.

**Preview behaviour.** Previews use their own environment variables and Shopify may still point at
the same store. That means preview deployments can mutate real carts and read real products; treat
them as production-adjacent.

## 7. Eve's role

Eve is optional and disabled in `shopConfig.agent`. When enabled, it is a third owner with its own
boundaries.

- Sessions, channels, tools, connections and model selection live in `agent/` and `lib/agent/`.
- Product discovery is Shopify catalog search (`search_catalog` on `/api/ucp/mcp`), called through
  `fetchCatalogSearch` and rendered by `present-products`. There is no second Storefront search tool.
- Cart tools bind the cart from the browser cookie through channel auth context. The browser
  refreshes Hydrogen only after turns settle. Never replay cart mutations from restored messages.
- Eve calls uncached `fetch*` operations, not `get*`.
- `app/api/agent/session` prepares the browser cart; `app/agent/ucp-profile.json` serves the agent's
  UCP profile. Those are the only Next.js routes Eve owns.
- Public traffic can incur model charges, so BotID and deployment rate limits are the mitigations.
  Do not add per-session token caps.

## 8. End-to-end flows

### 8.1 Browsing a product

```
Browser
  → Next.js route (app/products/[handle]/page.tsx)
  → getProduct() in lib/product/server.ts        cached, tagged product-<handle>
  → fetchProduct() in lib/shopify/operations/products/server.ts
  → storefront.request()                          Storefront API
  → Shopify returns price, media, variants, availability
```

The cache tag lets a Shopify `products/update` webhook invalidate only that product.

### 8.2 Adding to cart

```
Product form (useProductForm)
  → Hydrogen cart store
  → POST /api/cart
  → proxy.ts
  → cartHandlers from lib/cart/request.ts
  → Storefront API cartLinesAdd
  → Set-Cookie with the cart ID
  → optimistic cart state reconciles
```

No Server Action, no public cache, no Next.js revalidation. Cart state is per shopper.

### 8.3 Checkout

```
Cart drawer or cart page
  → prepareCheckoutAction() in lib/cart/action.ts
  → reads the confirmed checkout URL from the cart
  → browser navigates to Shopify-hosted checkout
```

`prepareCheckoutAction` does not mutate the cart. Payment, taxes, shipping and order creation happen
on Shopify's hosted checkout, outside this repo.

### 8.4 Customer account

```
/account/login
  → proxy.ts customer account handlers
  → Shopify OAuth
  → session cookie
  → requireCustomerSession() / requireCustomerAccessToken()
  → Customer Account API
```

Refreshable sessions are redirected through `/account/refresh` so Hydrogen can commit new cookies.

### 8.5 Seeding the catalog

```
scripts/seed-catalog.mjs
  → client credentials grant or static token
  → Admin API productSet / collectionCreate / collectionAddProducts
  → publishablePublish to the Headless publication
  → Storefront API can now read the new catalog
  → Next.js cache tags invalidate, or the cache expires
```

### 8.6 Webhook invalidation

```
Shopify webhook
  → POST /api/webhooks/shopify
  → HMAC verification with SHOPIFY_WEBHOOK_SECRET
  → revalidateTag("product-…", "products-index", …)
```

Pages, policies and menus send no webhook, so `POST /api/revalidate` with `REVALIDATE_SECRET` covers
them.

## 9. Tokens and environment variables

| Variable                                      | Used by              | Secret?              | Notes                                                   |
| --------------------------------------------- | -------------------- | -------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`            | App, script          | No                   | `your-store.myshopify.com`                              |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | App                  | No, public by design | Read-only catalog and cart access                       |
| `NEXT_PUBLIC_SHOPIFY_SHOP_ID`                 | Customer Account API | No                   | Numeric shop ID                                         |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID`           | Hydrogen             | No                   | Optional storefront ID                                  |
| `SHOPIFY_API_VERSION`                         | App, script          | No                   | Defaults to the version Hydrogen targets                |
| `SHOPIFY_ADMIN_ACCESS_TOKEN`                  | Seeder               | **Yes**              | Legacy static token; still supported                    |
| `SHOPIFY_CLIENT_ID`                           | Seeder               | **Yes**              | Dev Dashboard app client ID                             |
| `SHOPIFY_CLIENT_SECRET`                       | Seeder               | **Yes**              | Dev Dashboard app client secret                         |
| `SHOPIFY_PUBLICATION_ID`                      | Seeder               | No                   | Only when the Headless publication is named differently |
| `CUSTOMER_ACCOUNT_SESSION_SECRET`             | Auth                 | **Yes**              | App-generated, not the Shopify client secret            |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID`      | Auth                 | **Yes**              | Customer Account API client                             |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET`  | Auth                 | **Yes**              | Customer Account API secret                             |
| `SHOPIFY_WEBHOOK_SECRET`                      | Webhooks             | **Yes**              | HMAC verification                                       |
| `REVALIDATE_SECRET`                           | `/api/revalidate`    | **Yes**              | Bearer token                                            |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`               | Analytics            | No                   | Direct GA4 tag                                          |
| `NEXT_PUBLIC_GTM_ID`                          | Analytics            | No                   | GTM container; owns the page view when set              |
| `AI_GATEWAY_API_KEY`                          | Eve                  | **Yes**              | Local model access without Vercel OIDC                  |
| `VERCEL_PROJECT_PRODUCTION_URL`               | App                  | No                   | Injected by Vercel                                      |
| `VERCEL_ENV`                                  | Eve profile          | No                   | Injected by Vercel                                      |

**Rules.**

- Every user-configurable `process.env` read has a row in `.env.example` with a comment on when to
  set it.
- Every `process.env` read is listed in `turbo.json` `globalEnv`. Turborepo's strict mode hides
  undeclared variables and leaves them out of cache keys.
- Never prefix a secret with `NEXT_PUBLIC_`.
- Never commit `.env.local`.

## 10. Where to do what

### 10.1 Decision table

| I want to…                                  | Use                                                                          | Not                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| Change a price, title, description or image | Shopify admin, or Admin API for bulk                                         | Hardcoding it in Next.js                           |
| Add one product                             | Shopify admin                                                                | Editing the seeder                                 |
| Add or replace the whole catalog            | `scripts/seed-catalog.mjs`                                                   | Storefront API, Server Actions                     |
| Show a product, collection, page or policy  | Storefront API via `get*`                                                    | Admin API at request time                          |
| Add a product filter or sort                | Storefront API search/facets via `fetch*`                                    | Computing filters in Next.js                       |
| Add to cart, change quantity, remove a line | Hydrogen cart handlers via `/api/cart` and `useCartForm`                     | Server Actions, Storefront mutations in components |
| Read the cart                               | `useCart` from `lib/cart/client.ts`                                          | A fresh Storefront query                           |
| Send a shopper to payment                   | `prepareCheckoutAction` → Shopify checkout                                   | Building a checkout                                |
| Sign a customer in                          | Customer Account API + `proxy.ts` handlers                                   | A custom auth table                                |
| Read the signed-in customer's orders        | Customer Account API                                                         | Admin API                                          |
| Add a page, blog index or policy route      | Storefront API read + Next.js route                                          | Static markdown copies                             |
| Add a URL, redirect or rewrite              | `next.config.ts` or `proxy.ts`                                               | Shopify navigation                                 |
| Cache a read                                | `"use cache: remote"` + `cacheLife` + `cacheTag` in `lib/<domain>/server.ts` | Caching in `fetch*`                                |
| Invalidate cached content                   | Shopify webhook → `revalidateTag`, or `/api/revalidate`                      | Purging the whole cache                            |
| Improve an image's delivery                 | `next/image` with reserved dimensions                                        | A custom CDN                                       |
| Deploy                                      | Vercel                                                                       | Committing build output                            |
| Add a shopping-agent tool                   | `agent/tools/` with Eve, calling `fetch*`                                    | A new chat API route                               |
| Expose the store to answer engines          | Markdown, `llms.txt`, Schema.org, sitemap                                    | Duplicating Shopify's agent endpoints              |

### 10.2 Anti-patterns

- **Do not** call the Admin API from the browser or from a Server Component.
- **Do not** add `next/cache` imports to `lib/shopify/operations/**`.
- **Do not** cache carts or cart IDs.
- **Do not** recompute prices, discounts or currency in the app.
- **Do not** add a second cart route or a second product-search tool.
- **Do not** reimplement Shopify's `/api/mcp`, `/api/ucp/mcp` or `/.well-known/ucp`.
- **Do not** use the Storefront API for writes it does not support; fix the design instead.
- **Do not** seed products in a deployment or build step.

## 11. Caching model

| Surface                                | Cached? | Where                       | Tags                                           |
| -------------------------------------- | ------- | --------------------------- | ---------------------------------------------- |
| Product page                           | Yes     | `getProduct`                | `products`, `product-<handle>`, `product-<id>` |
| Product recommendations                | Yes     | `getProductRecommendations` | `recommendations-<handle>`                     |
| Collection page, default first page    | Yes     | `getCollectionResults`      | `collection-<handle>`, product tags            |
| `/collections/all`, default first page | Yes     | `getAllProductsResults`     | `products-index`, product tags                 |
| Filtered or sorted browse              | No      | `fetch*` directly           | None                                           |
| Load more pages                        | No      | `fetch*` directly           | None                                           |
| Search results and facets              | No      | `fetch*` directly           | None                                           |
| Policies, pages, blogs                 | Yes     | `get*` wrappers             | Domain tags                                    |
| Cart                                   | No      | Per-request promise         | None                                           |
| Customer data                          | No      | Per-request                 | None                                           |

Why filtered browse is uncached: cursor pagination plus Shopify Search & Discovery can reorder
results without a webhook. A cached page two would drift from page one and duplicate products.

`tagProducts` and `tagCollections` add both the handle and the numeric ID tag, because Shopify's
delete payloads carry only the ID while renames carry only the new handle.

## 12. Dev Dashboard runbook (current Shopify app flow)

Legacy custom apps can no longer be created in the Shopify admin. Use this flow when the catalog
seeder needs credentials, or when any administrative script needs the Admin API.

1. Open **https://dev.shopify.com/dashboard/**.
2. Confirm the target store is under **Stores** in the same organization. Client credentials only
   work for stores in the app's organization. A store created from the Shopify admin rather than
   from the Dev Dashboard may not be listed; if it is not, either create a dev store from
   **Create a store**, or use an OAuth authorization-code flow instead of client credentials.
3. **Create an app** → **Start from Dev Dashboard** → name it (for example, `Catalog Seeder`) →
   **Create**.
4. Open the app → **Versions** → **Create version**:
   - **App URL**: `https://shopify.dev/apps/default-app-home`
   - **Webhooks API version**: the newest
   - **Scopes**: `read_products`, `write_products`, `read_publications`, `write_publications`,
     `read_files`, `write_files`
   - **Release**
5. **Install app** → select the store → **Install**. Approve the scopes.
6. **App settings** → **Credentials** → copy **Client ID** and **Client secret**.
7. Add them to `.env.local`:

   ```
   SHOPIFY_CLIENT_ID=...
   SHOPIFY_CLIENT_SECRET=...
   ```

8. Run the seeder:

   ```
   corepack pnpm seed:catalog
   ```

   The script exchanges the credentials for a 24-hour Admin API token on every run, so there is no
   static token to rotate. Add `DRY_RUN=1` to print one product input without calling Shopify.

**Note on the dashboard options.** "Create a catalog" publishes product feeds for AI shopping; it
does not seed your store catalog. "Agents" configures Shopify's agent surfaces, not Eve. Neither is
a substitute for the Admin API seeder.

### Common Admin API errors

| Error                               | Meaning                                             | Fix                                                     |
| ----------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| `shop_not_permitted`                | The store is not in the app's organization          | Create the store from the Dev Dashboard, or use OAuth   |
| `401 Unauthorized`                  | Missing, expired or wrong token                     | Re-run the script; it fetches a fresh token             |
| `403 Forbidden` / scope error       | The app version lacks a scope                       | Add the scope, release a new version, reinstall/approve |
| `productSet` user errors            | Invalid input, duplicate handle or bad option names | Read the error array; the script prints it              |
| Product created but 404 on the site | Not published to the Headless channel               | `publishablePublish`, already in the seeder             |

## 13. Repository map

```
app/                         Next.js routes and route handlers
  api/webhooks/shopify/      Shopify webhook → cache tags
  api/revalidate/            Manual tag revalidation
  api/agent/session/         Eve cart preparation
  agent/ucp-profile.json/    Eve UCP profile
  md/, llms.txt/             Markdown surface for answer engines
agent/                       Eve agent, channels, tools
components/                  Presentation; ui/ takes primitive props only
lib/
  shopify/
    storefront/              Storefront API client
    customer-account/        Customer Account API client
    operations/              Uncached fetch* operations, one folder per domain
    fragments/               gql() documents
    transforms/              Shopify response → domain models
    html/                    sanitizeShopifyHtml
    routing/                 Hydrogen route templates
  <domain>/
    index.ts                 Universal transforms and helpers
    server.ts                Cached get* wrappers, "use cache"
    client.ts                React client boundary
    action.ts                "use server" actions
    request.ts               Request-scoped handlers for proxy.ts
    types.ts                 Domain models
  cart/                      Hydrogen cart handlers, store, checkout
  config/                    shopConfig and env-derived flags
  auth/                      Customer session helpers
scripts/seed-catalog.mjs     Admin API catalog seeder
proxy.ts                     Request boundary: Shopify routes, rewrites, markdown
next.config.ts               Next.js, BotID, Eve, images
turbo.json                   globalEnv declarations
```

## 14. Cookbook

### Add a product manually

Use the Shopify admin. Set title, description, media, price, options and variants, then publish to
the Headless sales channel. The storefront picks it up through the existing collection and product
routes; no code change is required.

### Replace the catalog

Fill `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`, run `DRY_RUN=1 corepack pnpm seed:catalog`,
then `corepack pnpm seed:catalog`. The seeder skips existing handles, so it is safe to re-run. After
seeding, repoint the hardcoded navigation and editorial links in `lib/nav/index.ts` and `app/page.tsx`
to the seeded collection handles.

### Change the navigation

Edit `lib/nav/index.ts`. It is a typed data file, not a Shopify menu. If menus later move to
Shopify, replace the data source, not the components.

### Add a new commerce read

1. Add the GraphQL document to `lib/shopify/fragments/` with `gql()` and a `ResultOf` type.
2. Add a `fetch*` function in the owning `lib/shopify/operations/<domain>/server.ts`. No `next/cache`.
3. Add a transform in `lib/shopify/transforms/<domain>/` and a domain type in `lib/<domain>/types.ts`.
4. Add a cached `get*` wrapper in `lib/<domain>/server.ts` with `"use cache: remote"`, `cacheLife`
   and `cacheTag`.
5. Call `get*` from the page, or `fetch*` from an Eve tool.

### Add an agent tool

Create `agent/tools/<name>.ts` with `defineTool`, a `z.strictObject` input schema, and a call to
`fetch*`. Return compact model-facing data. Register nothing if Eve discovers tools by file.

### Change the design system

Tokens live in `app/globals.css` under `@theme`. Follow the rules in `AGENTS.md`: utilities over
global CSS, scale utilities over arbitrary values, `data-[attr]` over conditional classes, no
`py-*` on `Container`, no global element rules.

### Deploy

Push to the branch Vercel tracks. Set every variable from `.env.example` in the Vercel project.
Never run the seeder during a build. Production cache invalidation depends on the Shopify webhook
pointing at `/api/webhooks/shopify` and `SHOPIFY_WEBHOOK_SECRET` matching.

## 15. Troubleshooting

| Symptom                                      | Likely cause                             | Check                                                   |
| -------------------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Product 404s though it exists in admin       | Not published to the Headless channel    | Publication, then `publishablePublish`                  |
| New product does not appear on a cached page | Cache tag not invalidated                | Webhook delivery, `/api/revalidate`, or wait for expiry |
| Price differs from the admin                 | Market or currency context               | `shopConfig.localization`, Shopify market, `$country`   |
| Cart is empty after add                      | Cart cookie missing or blocked           | `/api/cart` response, `Set-Cookie`, proxy matching      |
| Cart shows another shopper's items           | Cart data cached or shared               | Ensure no `"use cache"` on cart reads                   |
| Admin API 403                                | Scope not approved on the latest version | Versions, scopes, reinstall                             |
| `shop_not_permitted`                         | Store outside the app's organization     | Dev Dashboard → Stores                                  |
| Images 404 through `next/image`              | Host not allowed                         | `remotePatterns` in `next.config.ts`                    |
| Customer account redirect loops              | Missing refresh path or session secret   | `/account/refresh`, `CUSTOMER_ACCOUNT_SESSION_SECRET`   |
| Markdown URL returns HTML                    | Negotiation or rewrite missed            | `proxy.ts`, `lib/markdown/representation`               |

## 16. Current state of this clone

- Store: `Dummy Store`, USD, Hydrogen demo snowboard catalog.
- Design: Polite Society reference, rebuilt in `app/` and `components/`.
- Reference photography and wordmark: `public/reference/`, private prototype use only.
- GA4: `G-SQVPB589E7` loads and sends `page_view`.
- Catalog seeding: script ready, Admin API credentials pending.
- Customer accounts: disabled (`shopConfig.auth.isEnabled = false`).
- Eve: disabled (`shopConfig.agent.isEnabled = false`).
- Vercel Analytics and Speed Insights: disabled in `shopConfig`.
- Checkout: verified to the Shopify redirect; no test order has been placed.

## 17. Glossary

| Term                     | Meaning                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| Headless                 | A storefront that uses Shopify APIs instead of a Shopify theme          |
| Headless channel         | The Shopify sales channel that publishes products to the Storefront API |
| Storefront API           | Public GraphQL API for catalog reads and cart/checkout                  |
| Admin API                | Private GraphQL API for store management                                |
| Customer Account API     | Customer-scoped API for profile, addresses and orders                   |
| Hydrogen                 | Shopify's storefront SDK; here, not the React Router framework          |
| Cache Components         | Next.js's `"use cache"`, `cacheLife` and `cacheTag` model               |
| Publication              | The channel a product or collection is published to                     |
| Offline token            | A token obtained without a user present, used by scripts                |
| Client credentials grant | Exchanging client ID and secret for a 24-hour Admin API token           |

## 18. Reading list

- [`AGENTS.md`](../AGENTS.md): the binding architecture rules for this repository.
- [`reference/DESIGN.md`](./reference/DESIGN.md): extracted design tokens and page anatomy.
- [`reference/FLOWS.md`](./reference/FLOWS.md): screenshot index for every captured flow.
- [`IMPLEMENTATION.md`](./IMPLEMENTATION.md): what was rebuilt, how it was verified, known gaps.
- `node_modules/next/dist/docs/`: the installed Next.js version's own docs. Read the relevant guide
  before writing code; this version has breaking changes.
- `node_modules/@shopify/hydrogen/README.md` and its bundled skills: read before changing an SDK
  integration.
- Shopify: [Storefront API](https://shopify.dev/docs/api/storefront),
  [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql),
  [Customer Account API](https://shopify.dev/docs/api/customer),
  [Dev Dashboard apps](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard),
  [client credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant).
