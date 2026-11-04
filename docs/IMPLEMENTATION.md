# Polite Society replica — implementation notes

The storefront in this repository now reproduces the design system and page anatomy captured in
[`docs/reference/DESIGN.md`](./reference/DESIGN.md). This file records what is implemented, how it
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
and `google-analytics.com/g/collect` receives `en=page_view` for `/`, `/collections/all`,
`/products/*`, and `/cart`. GTM takes precedence when `NEXT_PUBLIC_GTM_ID` is also set, matching
`components/analytics/index.tsx`.

## Shopify catalog

The connected store still contains the Hydrogen demo catalog (snowboards). That is why product
photography and titles in the rebuilt surfaces do not match the fashion reference yet. The design,
layout and every commerce interaction are catalog-agnostic.

Changing the catalog requires a Shopify Admin API access token. The storefront token in
`.env.local` cannot create products or collections. To seed the fashion catalog, add a custom app
token with these scopes:

```
read_products, write_products, read_collections, write_collections, read_files, write_files
```

Then run the seeding script (added alongside this note) with:

```bash
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx \
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \
node --env-file=.env.local scripts/seed-catalog.mjs
```

After seeding, switch the navigation and editorial links from `/collections/all` to the seeded
collection handles (`/collections/corsets`, `/collections/dresses-and-jumpsuits`, etc.). The
collection chips already read live collections, so they update automatically.

## Verification

- `corepack pnpm lint` — passes.
- `corepack pnpm typecheck` — passes.
- `corepack pnpm build` — passes; all storefront routes prerender.
- Browser checks with Playwright MCP at desktop and mobile sizes, including header collapse,
  mega menu, search, contact, filter, PDP tabs, cart drawer and cart page.
- GA4 network verification as above.

## Known gaps

- **Catalog**: needs the Admin API token described above. The source assets are licensed for this
  private prototype only; replace them before distribution.
- **Wishlist and account**: wishlist saves products in local storage and renders at `/wishlist`;
  it is per-browser and not synced to a customer account. The account utility opens the existing
  `/account` surface, while Shopify Customer Account OAuth remains disabled unless
  `shopConfig.auth.isEnabled` is turned on.
- **Checkout, order status and payment failure** are Shopify-hosted.
- **Newsletter submission** shows a local success state; it does not yet post to Shopify or a
  marketing provider.
- **Payment marks** are typographic, not brand logo assets.
- **Header wordmark and editorial photography** are the reference brand's assets. Replace them
  before a public launch.
