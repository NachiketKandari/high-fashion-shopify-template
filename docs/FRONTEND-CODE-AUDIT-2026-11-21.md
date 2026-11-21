# Frontend code audit — 21 November 2026

Read-only audit. No source, test, config, dependency or lockfile was changed; this report is the
only authored file. The untracked `docs/DESIGN-AUDIT-2026-11-21.md` was written in parallel by the
design audit and is deliberately not edited here.

## Scope and ref

| Item      | Value                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commit    | `c80b802e20e8449d795589ff48496f58a678c170` (`fix: set the pdp title, price and recommend header in design i weights`)                                                      |
| Tree      | Clean tracked checkout. Untracked: `.agents/skills/design-audit/`, `.agents/skills/frontend-code-audit/`, `.opencode/`, `opencode.json`, `docs/DESIGN-AUDIT-2026-11-21.md` |
| Runtime   | macOS, Node 26.13.0, Next 16.4.6, React 19.3.1, Playwright 1.64.1                                                                                                          |
| Server    | Reused the running dev server at `http://localhost:3000`; no second server started                                                                                         |
| Browser   | Playwright MCP Chromium, 1440 × 1000 and 390 × 844                                                                                                                         |
| Audit set | `app/`, `components/`, the `lib/` modules those import, `proxy.ts`, `next.config.ts`, and `app/globals.css` for code-quality boundaries                                    |

The existing design audit (`docs/DESIGN-AUDIT-2026-11-21.md`) owns the visual, target-size and
copy findings. Its product-card action gap, prose regression, menu/search target sizes, search
combobox label, Get the Look link names, home heading order, `/search` H1, tuned `sizes`, and hero
typo are not repeated here. This report covers code behaviour outside that visual/design scope. The
two reports should be read together.

## Commands and checks

| Check                          | Result                                                                |
| ------------------------------ | --------------------------------------------------------------------- |
| `git status --short`           | Only the untracked skill, audit and OpenCode files listed above       |
| `git rev-parse HEAD`           | `c80b802e20e8449d795589ff48496f58a678c170`                            |
| `pnpm lint`                    | Passed: oxlint, oxfmt, design gate across 195 files                   |
| `pnpm typecheck`               | Passed: route types generated, `tsc --noEmit` clean                   |
| `pnpm test:design`             | Passed: 16/16 tests in 48.6 s against the running dev server          |
| Manual `axe-core@4.14.0` probe | Injected from unpkg in the browser; results are listed under findings |
| Header/title probes            | `node` fetch and Playwright DOM checks for `Vary`, OG tags and titles |

`pnpm build`, `next analyze` and the Lighthouse/performance harness were not run. The audit is a
code and rendered-DOM audit, not a production performance measurement.

## Health summary

The code is in good health. Lint, typecheck and all 16 design contracts pass. The three-owner
boundaries hold in the paths that matter: `lib/shopify/operations/**` never imports `next/cache`;
the `fetch*`/`get*` split is applied consistently; filtered browse, refine, search, selected
variants and carts stay request-time, and the Markdown route handlers set their own cache headers
while their product/collection data comes from the cached `get*` wrappers. Server Actions validate
every argument with module-private zod schemas before doing work; cart writes stay inside Hydrogen
handlers; and every
`dangerouslySetInnerHTML` call is sanitized at the Shopify fetch boundary.

The Major finding is an edge-surface cache-correctness issue rather than a commerce-core failure:
content-negotiated Markdown rewrites do not ask shared caches to separate HTML and Markdown
responses. The browser-storage finding is a latent data-boundary risk rather than a current
shopper-facing break: the wishlist key is unversioned and unvalidated, and the wishlist page could
render stale commerce snapshots once the design audit's card action is restored. Neither breaks the
current HTML purchase flow. The remaining findings are avoidable cart latency, an unhandled Load
more failure, a dead image-preload branch, two measured heading gaps on cart and checkout, manual
menu focus traps, broad external-store subscriptions, a duplicated home title, and dead code. There
are no Critical findings and no security findings.

## Findings

### Major

**[Major] `proxy.ts:66-77`, `lib/markdown/representation/index.ts:79-88,114-128` — correctness/caching — Markdown content negotiation does not mark the HTML response as varying on `Accept`.**
`getMarkdownRewritePath()` chooses HTML or Markdown from the request `Accept` header, but only
`markdownHeaders()` adds `Vary: Accept`. A production HTML response for `/`, `/products/*` or
`/collections/*` can therefore be stored by a shared cache without an `Accept` key, and a later
agent request for `text/markdown` can receive the cached HTML. Measured on the dev server:
`GET /` with `Accept: text/html` returned `Vary: rsc, next-router-state-tree,
next-router-prefetch, next-router-segment-prefetch, Accept-Encoding` with no `Accept`, while the
same URL with `Accept: text/markdown` returned `Vary: …, Accept` and
`Cache-Control: public, max-age=86400`. Dev HTML is `no-store`, so the production cache behaviour
was not exercised; the code path is verified, the cached outcome is a judgment call.
Fix: add `Vary: Accept` to HTML responses for paths where `getMarkdownPath()` is non-null (and keep it
on Markdown responses), or make Markdown a path-only surface and drop `Accept` negotiation. Verify
on a production build behind the deployment cache. Owner: Next.js app / `proxy.ts`.

### Minor

**[Minor] `lib/wishlist/client.ts:7-33`, `components/wishlist/content.tsx:28-31`, `components/newsletter/popup.tsx:23,43` — architecture/correctness — Browser storage holds unvalidated commerce snapshots and is not versioned or guarded.**
The wishlist key is the unversioned string `wishlist`, and `read()` casts any array returned by
`JSON.parse` to `WishlistItem[]` before rendering each item as a normal `ProductCard`. The stored
object contains the commerce facts `price`, `maxPrice`, `compareAtPrice`, `availableForSale`,
`featuredImage` and `options`; the wishlist page renders those values without a Shopify read, so a
returning shopper can see stale prices and availability. `write()` calls
`localStorage.setItem` without a try/catch. The design audit's local probe stored an already
optimised `/_next/image?...` URL, which made `next/image` throw `Image ... is using a query string
which is not configured in images.localPatterns` and replaced the wishlist route with the root error
boundary; current normal writes store the CDN URL, but the missing schema/version boundary makes a
stale build or an external write a route-level failure. `NewsletterPopup` has the same unguarded
`localStorage` read and write. This is latent today because the design audit also records that no
browse card renders the wishlist save action; it must be fixed before that action is restored.
Fix: version the key (`wishlist:v1`), validate and migrate stored items, store handles plus selected
options rather than full commerce snapshots, resolve current cards through Shopify, and wrap both
newsletter reads and writes. Owner: Next.js app (wishlist/newsletter presentation).

**[Minor] `proxy.ts:52-55`, `lib/cart/request.ts:23-37` — performance — Every cart POST performs a serial buyer-identity read before the mutation.**
For every `POST /api/cart` with a cart cookie, the proxy awaits `syncCartBuyerIdentity()` before
`handleShopifyRoutes()`. That function always calls `fetchCartBuyerIdentity()` first and only skips
the update when the country already matches. Add, update, remove, discount and attribute mutations
therefore pay an extra Storefront round trip on the primary conversion path. The current store has
one market (`shopConfig.localization.country` is `IN`) and carts are created with that country, so
the check is redundant for this deployment. The extra hop was not profiled; this is a call-path
judgment, not a measured latency.
Fix: sync only when a cart is created/imported, when the configured market can change, or fold the
country into the cart mutation so the read is unnecessary. Owner: Shopify transport / cart boundary
(`lib/cart/**`, `proxy.ts`).

**[Minor] `components/product-detail/open-graph.tsx:9-23`, `app/(storefront)/products/[handle]/page.tsx:145-149` — correctness/SEO — Product Open Graph tags stream into `<body>` and only reach `<head>` after hydration.**
`ProductOpenGraph` renders raw `property=` meta tags inside the streamed `ProductDetailSection`.
Measured on `/products/micro-pleated-shorts`: the server `<head>` contained the Next metadata
`og:title`, `og:description`, `og:url`, `og:image` and Twitter tags, but **not** `og:type`,
`og:price:*` or `product:*`; those appeared in `<body>` after the product content. After hydration,
Playwright found 1 `og:type`, 4 `og:price`/`product:price` metas and 2 availability metas in `<head>`
and 0 in `<body>`. Social
crawlers and link unfurlers that do not execute JavaScript therefore do not see the product type,
price or availability. The in-code comment that React hoists the tags is true only client-side.
Fix: emit what Next Metadata can express from `generateMetadata` (and document any `property`
limitation), or move the tags to a server-rendered head path; if neither is possible, drop the
custom product property tags and rely on the standard OG fields. Owner: Next.js app / product detail.

**[Minor] `components/collections/collection-browse-provider.tsx:95-99` — correctness/architecture — `use(state)` is called conditionally based on the prop type.**
`const { dataSearch } = state instanceof Promise ? use(state) : state;` calls a React hook only when
the `state` prop is a Promise, while the public prop type permits either a `BrowseState` or a
Promise. If a caller ever switches the prop from a promise to a value between renders, the hook order
changes and React can throw “Rendered more hooks than during the previous render.” The current search
page always passes a promise, so this is latent. Fix: narrow the prop to `Promise<BrowseState>` and
document it, or split the value and promise paths into separate components. Owner: Next.js app /
collection browse.

**[Minor] `components/collections/infinite-product-grid.tsx:53-73` — correctness/error state — A failed Load more leaves no error state and an unhandled rejection.**
`loadMorePage` has `try { await loadMoreBrowseProductsAction(...) } finally {}` with no `catch`.
The observer calls it with `void loadMorePage()`, so a Shopify or action rejection is an unhandled
promise; `finally` hides the spinner and re-enables the Load more button, but the polite live region
still says “Loading more products.” and there is no failure message or retry guidance. The grid also
treats the action's `EMPTY_PAGE` parse-failure result as a normal end of results.
Fix: catch the outcome, announce a failure in the existing live region, keep the retry button
visible, and only treat a valid page as progress. Owner: collection browse presentation.

**[Minor] `components/product-detail/product-media.tsx:236-241` — readability/dead code — The desktop grid preload helper is unreachable.**
`DESKTOP_GRID_PRELOAD_COUNT` is `1`, and the loop breaks when `idx >= 1`; the only preload call is
guarded by `idx > 0`, so `preloadDesktopGridImage()` is never executed. The comment says tile 0 is
already preloaded through `next/image`, which makes the loop and helper dead. The layout still works
because the hero image uses `preload`/`fetchPriority`; the code just misleads future changes.
Fix: remove the loop and helper, or set a real preload count and test the emitted preload. Owner:
product media.

**[Minor] `components/cart/cart-page.tsx:31`, `components/cart/line-item.tsx:123`, `components/checkout/checkout-view.tsx:94-235` — accessibility — Filled cart and checkout have incomplete heading structure.**
On a filled cart the only heading is the screen-reader `<h1>Cart</h1>`; each line title is an `<h3>`,
with no `<h2>` between them. axe reports `heading-order` (moderate, 1 node) on `/cart` with a cart
line at both 1440 and 390. `/checkout/address` has no `<h1>` at all: `AddressStep` starts at
`<h2>Choose Address`/`<h2>Delivery Detail`, and axe reports `page-has-heading-one` (moderate) at both
viewports. These are separate from the design audit's home/search heading findings.
Fix: add a visually hidden `<h2>` (e.g. “Items”) above `CartLineItems`, and an `<h1>` (“Checkout”)
in `CheckoutContent`/`CheckoutView` above the address step. Owner: cart and checkout presentation.

**[Minor] `components/nav/mobile-menu.tsx:47-63`, `components/nav/desktop-nav.tsx:45-61` — accessibility — The manual menu focus traps let Shift+Tab escape and do not restore focus on close.**
Both panels move focus to the panel container (`tabIndex={-1}`), then only wrap when
`document.activeElement` is exactly the first or last focusable node. Shift+Tab from the container
goes to the page/trigger behind the `aria-modal` overlay. Closing with the X button unmounts the
panel without returning focus to the trigger; Escape does return it. The design audit's focus
finding covers the missing outline on the panel, not the trap behaviour.
Fix: when focus is on the panel itself or outside the focusable list, send Shift+Tab to the last
control and Tab to the first; restore focus to the trigger on every close path, or use the existing
base-ui Dialog/Sheet primitive. Owner: shell navigation.

**[Minor] `lib/cart/client.ts:28`, `components/analytics/trackers.tsx:13`, `components/collections/active-filters.tsx:16`, `components/collections/filters-client.tsx:76`, `components/collections/sort-options.tsx:10` — performance — Full external-store subscriptions re-render on every store change.**
`useCheckout` and `CartViewedTracker` subscribe with `useCart((state) => state)`; the Hydrogen cart
hook re-renders when the selected value changes by reference, and the full state changes on every
cart update. The collection filter and sort components call `useCollection()` with no selector, so
they re-render on every collection status/filter change. The full-state reads are not needed:
`useCheckout` uses `data`, `loading`, `revalidating` and `pending`; the tracker uses `data`/`loading`.
Fix: select the needed slices (or pass an equality function) and keep full state only where the
whole object is genuinely rendered. Owner: cart/collection client leaves.

**[Minor] `app/(storefront)/page.tsx:71-75`, `app/layout.tsx:70-73` — correctness/SEO — The home page duplicates the site name in its title.**
The home `generateMetadata` returns `title: "Everyday Luxury Clothing | Lorem Ipsum"`, and the root
layout also applies `template: "%s | Lorem Ipsum"`. Measured document title:
`Everyday Luxury Clothing | Lorem Ipsum | Lorem Ipsum`. Every other route uses the template once.
Fix: use `title: { absolute: … }` or omit the site name from the home title. Owner: home metadata.

### Nit

**[Nit] `components/footer/payment-marks.tsx:147`, `components/currency/selector.tsx:5`, `components/ui/one-time-code.tsx:16`, `components/ui/quantity-stepper.tsx:15`, `components/ui/select.tsx`, `lib/product/client.ts:38`, `components/product-detail/recently-viewed.tsx:10-12`, `lib/analytics/client.ts:13` — readability — Dead storefront modules and an incomplete recently-viewed feature remain.**
`PaymentMarks` (157 lines of inline SVG), `CurrencySelector`, `OneTimeCode`, `QuantityStepper` and
the whole `Select` primitive have no importer. `useRecentlyViewedProducts()` has no caller, while
`RecentlyViewedRecorder` writes four product snapshots to `localStorage` on every PDP; the write has
no reader, so it is pure work and stale data. `addAnalyticsDestination` is also unused. None of the
unimported files cost client bytes today, but they mislead ownership and the recorder does run.
Fix: delete the unimported modules or wire the recently-viewed surface; keep the documented
`lib/menu/types.ts` exception. Owner: Next.js presentation.

**[Nit] `components/account/sidebar-client.tsx:19-30`, `components/account/mobile-tabs-client.tsx:19-30` — accessibility — The active account section is visual only.**
Both navigation variants style the current route but do not set `aria-current`. A screen-reader user
cannot tell Profile, Orders and Addresses apart from the current page.
Fix: add `aria-current={pathname.startsWith(link.href) ? "page" : undefined}`. Owner: account
presentation.

## Working well

- **Ownership and caching.** `grep` shows no `next/cache` import in `lib/shopify/operations/**`; the
  15 cached wrappers live in `lib/<domain>/server.ts`, all use `"use cache: remote"` and
  `cacheLife("max")`, and tag their Shopify reads. The default collection and `/collections/all`
  pages are cached; `refine`, filtered browse, Load more, search and facets call `fetch*` directly.
  Carts, customer data, selected variants and the entity Markdown mirrors stay request-time.
- **Server Action boundaries.** `lib/collections/action.ts`, `lib/product/action.ts` and
  `lib/customer/action.ts` parse every argument with module-private `z.strictObject` schemas before
  any work and return a normal failure result. Customer writes authenticate inside `customerFetch`
  through `requireCustomerAccessToken` immediately before the API call.
- **Cart boundary.** `proxy.ts` serves `/api/cart`; `lib/cart/action.ts` only reads the checkout URL;
  no cart mutation uses a Server Action or public cache invalidation. `createEmptyCart` remains the
  documented agent-only exception.
- **HTML safety.** `lib/shopify/html/server.ts` sanitizes rich text with an allowlist, schemes and
  iframe domains. All three `dangerouslySetInnerHTML` sites carry the documented oxlint directive,
  and each body is sanitized in its `fetch*` operation.
- **Render architecture.** Runtime-param routes render a synchronous page with a route skeleton in
  `Suspense`; there is no `loading.tsx` and no `instant = false`. `PLACEHOLDER_HANDLE`,
  `SearchParamsProbe` and the proxy rewrite keep the default collection shell static. `pnpm
  test:design` exercises search focus, reduced motion, PDP disclosures, collection geometry and the
  cart/filter flows.
- **Images and links.** Every image goes through `next/image` with `sizes="100vw"` and reserved
  geometry except the mega-menu tile already recorded by the design audit; the home hero and PDP
  lead image are preloaded, product grids mark only their first four cards eager and stay lazy
  below that. Internal links use `@/components/ui/link`; there is no `next/link` outside the
  primitive.
- **Security and hygiene.** Shopify response types in `lib/shopify/**` are derived with `ResultOf`
  or the Hydrogen customer-account helpers (the predictive-search client narrows Hydrogen's own
  types); there is no `any`, no `ts-ignore`, and no hardcoded secret. The Storefront token is public
  by design; Customer Account secrets stay in server modules. Webhook HMAC and revalidate bearer
  checks are timing-safe. The only `dangerouslySetInnerHTML` HTML is sanitized. `.env.example` and
  `turbo.json` cover every user-configurable read.

## Not verified

- **Production build and CDN cache.** No `next build`; the Vary/HTML cache outcome is inferred from
  the proxy and dev headers, not measured behind the deployment cache.
- **Account routes and forms.** OAuth requires HTTPS and Customer Account credentials; the layout,
  sidebar, profile and address code were read but not submitted.
- **Checkout completion.** The pre-checkout address form, Shopify-hosted checkout, shipping/tax and
  the store-credit application were not exercised. The store-credit projection is a documented
  `docs/STUBS.md` stub.
- **Agent.** Disabled (`shopConfig.agent.isEnabled = false`); the panel, tools and channel were not
  rendered or invoked.
- **Webhooks and revalidation.** `SHOPIFY_WEBHOOK_SECRET` and `REVALIDATE_SECRET` are unset; the
  HMAC and bearer paths were code-reviewed only.
- **Gift cards, bundles, selling plans, discount codes, Notify me and the contact/newsletter
  submissions.** Code-reviewed; not exercised end to end. Newsletter and contact are documented
  local-only stubs.
- **Axe coverage.** A manual subset: home (1440/390), collections/all, PDP, cart (filled), checkout,
  search (empty), size guide, Journal index and login. The design audit's account, article and
  policy pages were not re-run.
- **Performance.** No Lighthouse, Unlighthouse, `next analyze` or throttled cart measurement. The
  cart buyer-identity finding is a call-path judgment, not a latency number.
- **Browser coverage.** Chromium only; no Firefox/Safari, real touch hardware or `pointer: coarse`
  device.
- **Design-audit probe.** The wishlist `next/image` error was reproduced with the design audit's
  seeded `/_next/image?...` localStorage entry, not with a normal current save; the storage finding
  treats that as evidence of the missing schema/version guard, not as a normal user path.

## Three highest-leverage next fixes

1. **Make Markdown negotiation cache-safe.** Add `Vary: Accept` to HTML responses for every path
   that `getMarkdownPath()` can rewrite (or drop `Accept` negotiation and keep path-based `.md`
   mirrors), then verify both response headers on a production build behind the cache. Owner:
   Next.js app / `proxy.ts`.
2. **Replace the wishlist storage boundary before restoring the card actions.** Version and guard
   `localStorage`, validate and migrate entries, store handles plus selected options, and resolve
   current prices and availability from Shopify; coordinate with `docs/DESIGN-AUDIT-2026-11-21.md`
   Major 1/the product-card action restoration. Owner: Next.js app.
3. **Take the buyer-identity read off the cart hot path.** Gate `syncCartBuyerIdentity()` to cart
   creation or market changes, or set the country through the cart mutation, and measure the
   add-to-cart latency before and after with the existing perf harness. Owner: Shopify transport /
   cart boundary. This is the single change most likely to improve every cart interaction.
