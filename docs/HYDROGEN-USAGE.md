# Hydrogen usage

The storefront uses `@shopify/hydrogen` 2026.10.2 as a framework-agnostic Shopify SDK. It does not
use the Hydrogen React Router framework, Oxygen, MiniOxygen or the Hydrogen Vite toolchain. Next.js
owns routing, rendering, caching and deployment; Hydrogen owns the Shopify clients, cart protocol,
customer sessions, route handlers and Shopify-specific UI state.

77 source files import Hydrogen directly, through 91 import statements:

| Module                                         | Import statements |
| ---------------------------------------------- | ----------------- |
| `@shopify/hydrogen`                            | 63                |
| `@shopify/hydrogen/customer-account`           | 12                |
| `@shopify/hydrogen/react`                      | 10                |
| `@shopify/hydrogen/storefront-api-types`       | 4                 |
| `@shopify/hydrogen/customer-account-api-types` | 2                 |

## What Hydrogen provides

### Storefront API client and GraphQL

`lib/shopify/storefront/server.ts` creates a public `createStorefrontClient` per request and locale
pair. Hydrogen overrides `$country` and `$language` variables from client config, so one client
cannot serve multiple locale pairs. The client uses a 10-second timeout and a custom fetch that:

- annotates the URL with `?operation=<name>` for external tracing;
- sets `Accept-Encoding: gzip, br`;
- logs duration and operation through `logShopifyDebug` when `DEBUG_SHOPIFY` is enabled.

`createShopifyRequestContext` carries the request, country and language. `storefront.request()` wraps
`client.graphql()` and returns `{ data, errors }` without throwing. Domain operations decide how to
handle errors through `assertStorefrontOk`.

GraphQL documents use `gql()` from the API-specific entry point: `@shopify/hydrogen` for Storefront
and `@shopify/hydrogen/customer-account` for Customer Account. Response types come from
`ResultOf<typeof DOC>`; no Shopify response types are handwritten. Fragments under
`lib/shopify/fragments/` are composed through `gql()`'s second argument. `flattenConnection`,
`parseSortByValue`, `ProductFilter` and the generated Storefront schema types come from Hydrogen.

### Cart

- `createCartServerHandlers({ fragment: CART_FRAGMENT })` in `lib/cart/request.ts` defines the cart
  protocol. `createCustomerCartHandlers()` adds the customer session so new carts attach the buyer
  and checkout URLs carry `logged_in=true`.
- `handleShopifyRoutes` in `proxy.ts` serves `/api/cart` and predictive search from those handlers.
  Components never mutate the cart through Server Actions.
- `createCartComponents<typeof cartHandlers>()` in `lib/cart/client.ts` exposes `CartProvider`,
  `useCart`, `useCartActions`, `useCartForm` and `useSuspenseCart` to client leaves.
- `useCartForm` and `useProductForm` submit Hydrogen's form protocol from
  `components/cart/*`, `components/agent/shopping-results.tsx` and the product forms.
- `getCartId`, `createCartCookie` and `cartQueries.cartCreate` are used for cookie binding and for
  creating an empty cart before the agent's first mutation.
- `seedCartData` shares one per-request promise; carts never enter the Next.js data cache.

### Customer accounts

`lib/auth/request.ts` uses `createCustomerSession` from `@shopify/hydrogen/customer-account` and the
`ReadonlyCustomerSessionManager` / `WritableCustomerSessionManager` interfaces. The app supplies the
session adapter: an AES-256-GCM encrypted, chunked, HttpOnly cookie with a seven-day lifetime.

`proxy.ts` registers `createCustomerAccountServerHandlers` for the four Hydrogen OAuth paths
(authorize, login, logout, refresh), with the cart handlers attached so buyer identity stays in step.
`getOrRefreshAccessToken()` is called only where Hydrogen can commit cookies; Server Components read
`isLoggedIn()` and never refresh. `CustomerAccountApiError` and
`CustomerAccountAuthenticationError` distinguish unauthorized responses.

### Routing

`lib/shopify/routing/index.ts` uses `createShopifyRouteTemplates({})` to keep Shopify's standard
storefront paths. `handleShopifyRoutes` receives the request, request context, storefront client,
route templates and handlers from `proxy.ts`. `handleShopifyRedirects` in `app/not-found.tsx` resolves
Shopify URL redirects when `shopConfig.redirects.shopifyNotFound.isEnabled` is true.

### Product and variant selection

- `createProductComponents<ProductFormInput>()` exposes `ProductProvider`, `useProduct` and
  `useProductForm` in `lib/product/client.ts`.
- `getSelectedProductOptions` and `buildProductSelectionSearchParams` parse and build the
  lowercased option query string.
- `getShopPayButtonUrl` renders the Shop Pay button.
- `ValidProductSelectionResult`, `ProductInput` and the generated variant types keep the client
  store typed without hand-written Shopify response types.
- `formatMoney` in `lib/money/index.ts` formats every price and currency label. The app does not
  render a Hydrogen `Money` component.

### Collection browsing and search

- The client collection store is Hydrogen's `CollectionProvider`, `useCollection` and
  `useCollectionActions`, wrapped by `components/collections/collection-browse-provider.tsx`. It
  keeps filters, sort and cursor state in the URL while Next.js renders the results.
- `parseCollectionParams`, `serializeCollectionParams`, `getSortByValue`, `isFilterInputActive` and
  `ProductFilter` translate between the URL and Shopify's filter shape.
- Predictive search uses `createPredictiveSearchServerHandlers` in `lib/search/request.ts`, mounted
  through `handleShopifyRoutes`, and `PredictiveSearchProvider`, `usePredictiveSearch` and
  `usePredictiveSearchActions` in the nav client.
- `getSearchResultUrl` builds search links in the nav, Markdown routes and the agent's navigate tool.

### Analytics and logging

- `ShopifyScripts` mounts Shopify's runtime scripts with consent, headless channel, route templates
  and optional WebMCP.
- `useCartAnalytics` publishes confirmed cart changes. `AnalyticsEvent` publishes page, product,
  collection, search and cart views to `window.Shopify.analytics` through `lib/analytics/client.ts`.
- `configureLogging`, `HydrogenLogger`, `LogContext` and `LogLevel` back
  `lib/shopify/logging/server.ts`, so Hydrogen SDK logs share the `[shopify:<level>:<scope>]`
  console format. See [OBSERVABILITY.md](./OBSERVABILITY.md).

## What is not used

| Hydrogen feature                                                  | Replacement                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| React Router framework routes, loaders and actions                | Next.js App Router, Server Components and Server Actions                                |
| Oxygen, MiniOxygen, `hydrogen.config.*`, `@shopify/hydrogen/vite` | Next.js on Vercel                                                                       |
| `createWithCache`, `Cache` and Hydrogen caching strategies        | Next.js `"use cache"`, `cacheLife`, `cacheTag` and `revalidateTag`                      |
| Hydrogen image components and CDN URL transforms                  | `next/image` with the Shopify CDN in `remotePatterns`                                   |
| Hydrogen SEO and meta helpers                                     | Next.js Metadata API, `lib/seo/` and Schema.org components                              |
| Hydrogen Markets                                                  | Single-locale `shopConfig.localization`; the Markets skill adds it explicitly           |
| Hydrogen CLI                                                      | Not invoked; documents use the installed schema types and Shopify AI Toolkit validation |

Hydrogen's packaged skills remain the SDK reference in
`node_modules/@shopify/hydrogen/skills/`; the repository's own product skills live in
`.agents/skills/`.

## Boundaries to preserve

- Keep Shopify transports in `lib/shopify/**` and return domain models, never raw Shopify responses.
- Keep `fetch*` operations uncached and Next.js `get*` wrappers cached, as described in `AGENTS.md`.
- Keep cart writes in Hydrogen handlers behind `proxy.ts`; do not add cart Server Actions or
  cache-tag invalidation for cart changes.
- Use `gql()` from the correct API package and derive response types with `ResultOf`.
- Do not introduce React Router loaders, actions or Oxygen configuration. The Hydrogen dependency is
  intentionally the SDK, not the framework.
