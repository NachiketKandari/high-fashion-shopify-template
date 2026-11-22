# TODO

The repository's open-work backlog, reconciled against the code and the live Storefront API on
23 November 2026.

This file is the checklist; the linked documents hold the detail. It lists open work only — when an
item lands, update the detail document and delete the row. Do not append completed work here.

Owners follow [`AGENTS.md`](./AGENTS.md): **Shopify** owns commerce, **Next.js** owns the app,
**Eve** owns the agent.

## Start here

- [ ] **Decide and publish the launch catalog.** The live Storefront API exposes 11 active products
      and 55 variants; the Admin API reports 11 active, 188 draft and 200 total products (one
      archived). Several navigation destinations are empty — `menswear`, `bottoms`,
      `bottoms-unisex`, `bodysuits`, `bralettes`, `core`, `jackets`, `shirts`, `shirts-and-tshirts`,
      `shorts`, `signature`, `skirts` and `tshirts` — and many other collections (`corsets`,
      `knits`, `work-wear`, `evening`, `weekend`, `festive`, `outerwear`, `accessories` and more)
      have no products. Choose the launch set, publish the right products and collections (or remove
      the empty links), then re-verify the header menus, home rails, PLP, search and sitemap. Reconcile
      the catalog docs with the result; the 95-product and 27-product counts in older docs are
      historical.
- [ ] **Make Markdown negotiation cache-safe.** Add `Vary: Accept` to HTML responses for every path
      `getMarkdownRewritePath()` can rewrite, then verify both response headers on a production
      build behind the deployment cache. Detail:
      [`FRONTEND-CODE-AUDIT-2026-11-21.md`](./docs/FRONTEND-CODE-AUDIT-2026-11-21.md) (Major).
      `proxy.ts`, `lib/markdown/representation/index.ts`. Owner: Next.js.
- [ ] **Version and guard browser storage.** The wishlist key is unversioned and stores full
      commerce snapshots; the newsletter dismissal read/write is unguarded. Version, validate and
      migrate the wishlist, store handles plus selected options, resolve current prices and
      availability through Shopify, and wrap both stores in `try`/`catch`.
      `lib/wishlist/client.ts`, `components/newsletter/popup.tsx`. Owner: Next.js.
- [ ] **Restore the product-card action surface, or remove the wishlist promise.** Browse and home
      cards suppress wishlist and quick shop, so the wishlist cannot be populated from any card.
      Do this only after the storage fix above. `components/product-card/product-card.tsx`,
      `components/collections/browse.tsx`, `components/home/product-row.tsx`. Owner: Next.js.
- [ ] **Add the missing `POLITE BLUE` swatch alias** (`#005BD3`) beside `LOREM BLUE`. The reference
      catalog and source swatch data use it; the map leaves it blank. Add it before those products are
      published. `lib/product/color-swatches.ts`. Owner: Next.js.
- [ ] **Add `/collections` and `/collections/all` to the static sitemap shard.**
      `STATIC_CONTENT_PATHS` currently contains only the home page and two content pages.
      `app/sitemap/[shard]/route.ts`. Owner: Next.js.
- [ ] **Add CI** for lint, typecheck, build and the design tests; decide whether axe, Knip, jscpd and
      Lighthouse join the permanent gate. No workflow exists yet. Repository root. Owner: Next.js.

## Code, accessibility and performance

- [ ] Take the buyer-identity read off every cart POST. Sync only on cart creation, market change,
      or inside the cart mutation, then measure add-to-cart latency.
      `proxy.ts`, `lib/cart/request.ts`. Owner: Shopify transport.
- [ ] Emit product `og:type`, price and availability from `generateMetadata` (or drop the custom
      tags). They currently render inside `<body>` and social crawlers do not execute JavaScript.
      `components/product-detail/open-graph.tsx`,
      `app/(storefront)/products/[handle]/page.tsx`. Owner: Next.js.
- [ ] Catch and announce Load more failures; keep the retry button and do not treat a parse failure
      as the end of results. `components/collections/infinite-product-grid.tsx`. Owner: Next.js.
- [ ] Fix cart and checkout heading order: add an `h2` above the cart items and an `h1` for the
      checkout address step. `components/cart/cart-page.tsx`,
      `components/checkout/address-step.tsx`. Owner: Next.js.
- [ ] Complete the menu focus traps: Shift+Tab from the panel must wrap for both menus, and the
      desktop X must return focus to its trigger (mobile already does).
      `components/nav/mobile-menu.tsx`, `components/nav/desktop-nav.tsx`. Owner: Next.js.
- [ ] Label the search combobox and move menu/search text rows onto a shared 36px row primitive.
      `components/search/search-explorer.tsx`, nav menus. Owner: Next.js.
- [ ] Narrow `CollectionBrowseProvider` to `Promise<BrowseState>` or split the value and promise
      paths so the conditional hook cannot change order.
      `components/collections/collection-browse-provider.tsx`. Owner: Next.js.
- [ ] Remove the unreachable desktop grid-preload branch.
      `components/product-detail/product-media.tsx`. Owner: Next.js.
- [ ] Fix the duplicate home document title (`Everyday Luxury Clothing | Lorem Ipsum | Lorem Ipsum`)
      by letting the root template apply once. `app/(storefront)/page.tsx`. Owner: Next.js.
- [ ] Re-verify the Prose contract against the current `DESIGN-SYSTEM.md`, then either map content
      pages to `type-*` utilities or record the exception. The 21 Nov audit measured Tailwind
      Typography defaults (300 weight, uppercase headings) on prose surfaces.
      `components/ui/prose.tsx`, `docs/DESIGN-SYSTEM.md`. Owner: Next.js.
- [ ] Re-check the remaining minor and nit findings in the 21 Nov code audit and close or carry
      forward each one. Detail:
      [`FRONTEND-CODE-AUDIT-2026-11-21.md`](./docs/FRONTEND-CODE-AUDIT-2026-11-21.md).
- [ ] Re-check the 21 Nov design audits and close or carry forward each finding. Detail:
      [`DESIGN-AUDIT-2026-11-21.md`](./docs/DESIGN-AUDIT-2026-11-21.md),
      [`DESIGN-AUDIT-RATIOS-2026-11-21.md`](./docs/DESIGN-AUDIT-RATIOS-2026-11-21.md).
- [ ] Run Knip again and remove confirmed dead exports; keep `lib/menu/types.ts` because the
      `enable-shopify-menus` skill imports it. Detail:
      [`FRONTEND-REVIEW-AUTOMATION.md`](./docs/FRONTEND-REVIEW-AUTOMATION.md). Owner: Next.js.

## Design and interaction gaps

- [ ] Decide the pre-checkout path: wire the cart Checkout action to `/checkout/address` or remove
      the direct-link-only address step and keep Shopify checkout direct. The address step is built;
      the cart still opens Shopify directly. Detail:
      [`DESIGN-I-CHECKOUT-JOURNEY.md`](./docs/DESIGN-I-CHECKOUT-JOURNEY.md) §4.5–4.6. Owner: Next.js.
- [ ] Add the designed PDP add-to-bag confirmation slide-over, or record that the cart drawer is the
      accepted replacement. `components/product-detail/buy-buttons.tsx`. Owner: Next.js.
- [ ] Decide whether the remaining Design I geometry deltas are still targets: the 74 px header vs
      the built 76 px, the 709 px desktop menu vs the built 592 px, the home section order and the home
      product row (which follows `new-in` order rather than the four frame products). Record accepted
      deviations rather than leaving the specs ambiguous. Detail:
      [`DESIGN-I-CHECKOUT-JOURNEY.md`](./docs/DESIGN-I-CHECKOUT-JOURNEY.md) and
      [`DESIGN-I-PDP.md`](./docs/DESIGN-I-PDP.md). Owner: Next.js.
- [ ] Decide whether the filter sheet gets a draft state (it currently applies immediately) and
      whether the product rail gets pointer drag. Detail:
      [`DESIGN-SYSTEM-AUDIT.md`](./docs/DESIGN-SYSTEM-AUDIT.md) §8. Owner: Next.js.

## Blocked on Shopify admin or credentials

- [ ] **Mirror sold-out variants.** Add `read_locations` and `write_inventory` to the app version,
      approve the scopes, resolve the location ID, and extend the importer with `--inventory-only`
      plus inventory preservation on other runs. The current launch set is entirely available with
      `totalInventory: 0` (untracked); acceptance is that the chosen catalog's sold-out variants
      become unavailable and sold-out add-to-cart is rejected. Detail:
      [`GAP-CLOSURE-PLAN.md`](./docs/GAP-CLOSURE-PLAN.md) G1.
- [ ] **Configure product, colour and fabric filters.** The Storefront API currently returns only
      Availability and Price for `new-in`. Search & Discovery must expose Product type, Colour
      (`custom.colour_family`), Fabric (`custom.fabric`) and Price; the colour filter renders swatch + label + count, with `getColorSwatch` as fallback. The metafield writes and UI fallback can be
      prepared before the admin save. Detail: GAP-CLOSURE-PLAN G3.
- [ ] **Complete checkout verification.** The cart currently redirects to
      `https://dummy-store-f0ejfuh9.myshopify.com/password`; disable the Online Store password, then
      verify line item, quantity, subtotal, currency and shipping on the first Shopify checkout
      step. Also verify the saved-address and store-credit paths with an authenticated HTTPS
      session. A test order needs explicit approval. Detail: GAP-CLOSURE-PLAN G5.
- [ ] **Register production webhooks and verify invalidation.** Product, collection, metaobject and
      inventory topics; set `SHOPIFY_WEBHOOK_SECRET`; verify tag invalidation. The handler has no
      `inventory_levels/update` mapping, so an inventory change does not refresh a cached PDP.
      Detail: [`CACHING.md`](./docs/CACHING.md).
- [ ] **Register production Customer Account OAuth.** Callback and logout URLs for production and
      previews, plus `CUSTOMER_ACCOUNT_SESSION_SECRET`,
      `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` and `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET` in
      Vercel. Detail: [`AUTHENTICATION.md`](./docs/AUTHENTICATION.md).
- [ ] **Configure payments, shipping, taxes and duties.** The development store cannot take live
      payments. Detail: [`PAYMENTS.md`](./docs/PAYMENTS.md).
- [ ] **Move to a merchant-owned production store.** A development store cannot be transferred or
      converted into the brand's production store.
- [ ] **Legal and privacy review** of the seeded policies, contact details, shipping thresholds and
      any agent privacy copy.

## Decisions

- [ ] **Newsletter and contact transport.** Choose a list provider and mailbox or ticketing
      transport; both forms currently show a local-only unavailable state.
      `components/newsletter/form.tsx`, `components/content/contact-form.tsx`.
- [ ] **Wishlist persistence.** Keep it browser-local or sync it to the Customer Account.
- [ ] **Navigation ownership.** Keep `lib/nav/index.ts` code-owned or move to Shopify menus.
- [ ] **Catalog merchandising.** Decide whether the home hero, tiles and navigation stay hardcoded,
      move to Shopify metaobjects/menus, or use a thinner curated model. Today a content change
      needs a deploy. Detail:
      [`MEDIA-AND-MERCHANDISING.md`](./docs/MEDIA-AND-MERCHANDISING.md) §5.
- [ ] **Gallery parity.** Accept the current stacked gallery, lightbox and mobile carousel, or add
      wheel/pinch zoom, previous/next, an image counter and a full focus trap.
- [ ] **Checkout provider.** Keep Shopify checkout or plan a separate GoKwik integration.
- [ ] **Buy now, guest checkout and order status.** The wireframe decision is guest checkout (D1).
      Shop Pay is disabled on the INR store and checkout is reachable only from `/cart`. Verify guest
      checkout is reachable, then decide whether to add a buy-now path without Shop Pay, a tokenised
      order-status route and a payment-failure surface. Detail:
      [`UNIPLUS-ASSET-PLAN.md`](./docs/UNIPLUS-ASSET-PLAN.md) §7.
- [ ] **Shipping and fulfilment.** Keep Shopify native rates or plan Shiprocket; no Shiprocket code
      ships. Detail: [`SHIPROCKET.md`](./docs/SHIPROCKET.md).
- [ ] **Localisation.** Keep single-locale `en-IN`, or add next-intl and/or Shopify Markets.
- [ ] **Analytics and consent.** Decide which of GA4, GTM, Vercel Analytics, Speed Insights and
      Shopify analytics ship, and how each is gated. All are currently off.
- [ ] **Agent launch.** BotID, firewall rate limits, AI Gateway spending controls, a production UCP
      profile, cart-cookie checks and privacy copy. The agent is disabled.
- [ ] **Product data depth.** Decide where structured fabric, fit, composition, origin and size
      charts live. The old Fabric/Fit tab plan is stale: the PDP now uses description, details and
      shipping disclosures, so choose whether the data joins those rows or a new one.
- [ ] **Brand identity sign-off.** One hex or Pantone per role, cream versus white surface, whether
      the brand red becomes an accent token, font licences, size run (XXS), photography rights and
      credit, and whether AI ghost-mannequin imagery may represent the product. Detail:
      [`UNIPLUS-ASSET-PLAN.md`](./docs/UNIPLUS-ASSET-PLAN.md) §9.
- [ ] **Remaining UI/UX decisions.** Editorial measure (672/768/896), search-results affordance,
      footer height (404 vs 361), mobile announcement copy, page-title hierarchy, agent card ratio
      and hero tokenisation. Detail:
      [`UI-UX-CONSISTENCY-AUDIT.md`](./docs/UI-UX-CONSISTENCY-AUDIT.md) §"Remaining open decisions".

## Content and data

- [ ] Bring the launch photography to PDP resolution and coverage: many source JPEGs are 853–854 px
      wide against a 1320–1920 px column; some products are missing front, back or colourway views
      and no hero-size image exists. Detail:
      [`UNIPLUS-ASSET-PLAN.md`](./docs/UNIPLUS-ASSET-PLAN.md) §2 and §6.
- [ ] Replace unlicensed reference photography and press imagery with rights-cleared brand assets;
      replace the raster wordmark with a vector master and regenerate the icon, Apple icon, manifest
      icons and social image. Detail: UNIPLUS-ASSET-PLAN §3.
- [ ] Replace brand, contact, social, legal and shipping copy; confirm the trading name, legal
      entity and registered address, and verify policy thresholds against the INR store and the
      ₹50,000 free-shipping threshold.
- [ ] Import structured product attributes and per-product Fabric/Fit copy once the storage decision
      above is made; keep static copy only as a fallback. Two care labels contradict themselves.
- [ ] Import unique product and collection SEO titles, descriptions and images, plus collection
      descriptions. Every active collection currently has a null image. Detail:
      [`CATALOG-IMPORT.md`](./docs/CATALOG-IMPORT.md).
- [ ] Write descriptive image alt text; imported alt text is `TITLE image N`.
- [ ] Decide content invalidation for pages, blogs and articles. Shopify has no classic webhook
      topics for them, so use `/api/revalidate` or a shorter content `cacheLife`. Detail:
      [`CONTENT.md`](./docs/CONTENT.md).

## Merchandising and media gaps

Confirm each against the current code before acting; the linked doc is a snapshot.

- [ ] The collections index is in creation order with no merchant reorder control.
- [ ] The collection page does not render the collection's art-directed image; it appears only on the
      index card and Markdown. `components/collections/collection-page.tsx`.
- [ ] Collection cards and search collection rows are text-only until collection images are set.
- [ ] Cart recommendations fall back to `new-in` because `bestsellers` is empty; publish it or choose
      the intended recommendation source.
- [ ] Colour gallery is approximate: one image per variant is known, and other colour shots are
      shared across colours.
- [ ] A cart line has no product-image fallback when the variant has no image.
- [ ] The shared filter can repeat the selected image when a product's only images are colour images.
- [ ] Social image is featured-only; there is no separate OG override.
- [ ] Detail and status: [`MEDIA-AND-MERCHANDISING.md`](./docs/MEDIA-AND-MERCHANDISING.md) §7.

## Production readiness

- [ ] Set the full production environment: Shopify values, auth secrets, site URL, webhook secret,
      revalidation secret and analytics IDs. Detail:
      [`VERCEL-DEPLOYMENT.md`](./docs/VERCEL-DEPLOYMENT.md).
- [ ] Add application error reporting, request IDs and structured logs, and a `/api/health` route.
      Webhook deliveries and `revalidateTag` calls are currently not logged. Add cache warm-up and
      404 monitoring alongside. Detail: [`OBSERVABILITY.md`](./docs/OBSERVABILITY.md).
- [ ] Make webhooks observable and idempotent, including inventory changes.
- [ ] Create the production Vercel project and domain; replace the stale anonymous Vercel artifact.
- [ ] Run the deployment verification checklist against a preview: catalog, cart, checkout,
      content pages, sitemap/robots/llms, webhook HMAC, revalidation and analytics.
- [ ] Verify checkout, Customer Account OAuth, Eve, analytics and tag invalidation against a preview.
- [ ] Settle the known performance levers before tuning: per-image width/quality policy, initial
      grid size, analytics weight, remote cache handler for self-hosting, server region for live
      routes and client-side navigation. Verify the LCP element per template and check that grids do
      not regress per-link prefetching. Detail:
      [`PERFORMANCE-AUDIT.md`](./docs/PERFORMANCE-AUDIT.md) §"What remains".
- [ ] Browser and device coverage beyond Chromium: Firefox, Safari, real touch hardware and
      `pointer: coarse`.
- [ ] Manual screen-reader pass. Automated ARIA, focus, tab-key, target and reduced-motion checks
      pass.

## Stubbed integrations

Keep [`STUBS.md`](./docs/STUBS.md) authoritative for the stub location and replacement condition.

| Surface                | Current state                                                  | Unblocked by                                            |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Newsletter signup      | Local unavailable state; nothing is sent                       | A list provider plus consent policy                     |
| Contact form           | Local unavailable state; nothing is sent                       | A mailbox or ticketing transport                        |
| Waitlist / notify me   | Confirms locally; no email leaves the browser                  | A storage decision (metafield, app or provider)         |
| Low stock line         | Dormant; every active variant is untracked                     | Tracked inventory at 1–5 units                          |
| Account credits        | Read-only projection; Shopify applies the credit at checkout   | Store-credit scope and checkout configuration           |
| Address prefill        | Step hands off without writing the address to the cart         | A cart-write owner for delivery addresses               |
| Delivery ETA           | No date or promise is rendered                                 | Shiprocket credentials                                  |
| Pincode serviceability | Module exists but is not called                                | D5 decision plus API credentials                        |
| Size recommendation    | Not started                                                    | Fit metafield schema or a fit app                       |
| Public order tracking  | Not started; order pages link to Shopify's status page         | A Shiprocket tracking source or Shopify status decision |
| Order cancellation     | Not started                                                    | Server-side Admin API credential decision               |
| Returns                | Not started                                                    | P11 scope                                               |
| Tax invoices           | Not started                                                    | GST app or Admin API generation decision                |
| Search typo correction | Shows honest zero results; does not fabricate closest products | A search service or synonym dictionary                  |

## Documentation to reconcile

- [ ] Reconcile catalog counts and launch state across [`IMPLEMENTATION.md`](./docs/IMPLEMENTATION.md),
      [`CATALOG-IMPORT.md`](./docs/CATALOG-IMPORT.md),
      [`UNIPLUS-IMPORT.md`](./docs/UNIPLUS-IMPORT.md) and
      [`CATALOG-AUDIT-UNIPLUS.md`](./docs/CATALOG-AUDIT-UNIPLUS.md). They describe 95 published
      reference products and 27 published UniPlus products; the live store currently exposes 11
      active products and 188 drafts.
- [ ] Re-baseline [`WIREFRAME-PROGRESS.md`](./docs/WIREFRAME-PROGRESS.md). Several phases still say
      "not started" for surfaces that exist. Close or reconfirm the remaining wireframe decisions D4
      (collection layout), D5 (pincode source) and D6 (type treatment) at the same time.
- [ ] Re-baseline the "Current" state in [`DESIGN-I-PDP.md`](./docs/DESIGN-I-PDP.md) and
      [`DESIGN-I-CHECKOUT-JOURNEY.md`](./docs/DESIGN-I-CHECKOUT-JOURNEY.md); both still describe the
      template PDP and other pre-build states.
- [ ] Reconcile [`GAP-CLOSURE-PLAN.md`](./docs/GAP-CLOSURE-PLAN.md) with current code: currency is
      decided, the PDP uses disclosures instead of Fabric/Fit tabs, and the catalog counts are
      historical.
- [ ] Regenerate [`docs/reference/PLAYWRIGHT-COMPARISON.md`](./docs/reference/PLAYWRIGHT-COMPARISON.md)
      before treating any visual snapshot as current.
- [ ] Keep [`FRONTEND-ARCHITECTURE.md`](./docs/FRONTEND-ARCHITECTURE.md) §12 and this file in sync.
- [ ] Treat the design, code, performance and UX audits as snapshots: re-verify findings before
      acting, then close or carry them forward here.

## Where the detail lives

| Document                                                                        | Use it for                                                            |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`FRONTEND-ARCHITECTURE.md`](./docs/FRONTEND-ARCHITECTURE.md)                   | Routes, data flow, caching and the long-form pending list (§12)       |
| [`IMPLEMENTATION.md`](./docs/IMPLEMENTATION.md)                                 | Implemented surfaces, verification history and known gaps             |
| [`STUBS.md`](./docs/STUBS.md)                                                   | Every unverified integration and the condition that replaces it       |
| [`GAP-CLOSURE-PLAN.md`](./docs/GAP-CLOSURE-PLAN.md)                             | Catalog, store configuration and checkout gaps with acceptance checks |
| [`UNIPLUS-ASSET-PLAN.md`](./docs/UNIPLUS-ASSET-PLAN.md)                         | Brand, photography, care copy, purchase flow and launch blockers      |
| [`MEDIA-AND-MERCHANDISING.md`](./docs/MEDIA-AND-MERCHANDISING.md)               | Media ordering, surface control and open merchandising gaps           |
| [`WIREFRAME-PROGRESS.md`](./docs/WIREFRAME-PROGRESS.md)                         | Figma build-phase ledger for the design work                          |
| [`FRONTEND-CODE-AUDIT-2026-11-21.md`](./docs/FRONTEND-CODE-AUDIT-2026-11-21.md) | Correctness, accessibility and performance findings                   |
| [`DESIGN-AUDIT-2026-11-21.md`](./docs/DESIGN-AUDIT-2026-11-21.md)               | Rendered design and interaction findings                              |
| [`DESIGN-SYSTEM-AUDIT.md`](./docs/DESIGN-SYSTEM-AUDIT.md)                       | Historical design gap analysis and current exceptions (§8)            |
| [`PAYMENTS.md`](./docs/PAYMENTS.md)                                             | Checkout, India payment options and launch compliance                 |
| [`CACHING.md`](./docs/CACHING.md), [`CONTENT.md`](./docs/CONTENT.md)            | Cache lifetimes, tags and invalidation contracts                      |
| [`OBSERVABILITY.md`](./docs/OBSERVABILITY.md)                                   | Logging, analytics, error reporting and health checks                 |
| [`PERFORMANCE-AUDIT.md`](./docs/PERFORMANCE-AUDIT.md)                           | Measured performance and the remaining levers                         |
| [`VERCEL-DEPLOYMENT.md`](./docs/VERCEL-DEPLOYMENT.md)                           | Production environment and deployment checklist                       |

Historical records are not task lists: the root `PLAN.md`, `PARALLEL-AGENT-PLAN.md`,
`UX-RECON-2026-11-05.md`, `UI-UX-CONSISTENCY-AUDIT.md`, `DESIGN-SYSTEM-AUDIT.md` and
`reference/PLAYWRIGHT-COMPARISON.md` are snapshots. Check the current code and live store before
working from them.
