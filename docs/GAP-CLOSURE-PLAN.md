# Gap closure plan

Status: 7 November 2026. The catalog import is complete; this plan closes the remaining catalog,
store-configuration, checkout and parity gaps without re-importing products unnecessarily. The
current frontend map and pending-work summary is
[`FRONTEND-ARCHITECTURE.md`](./FRONTEND-ARCHITECTURE.md).

## Baseline

| Item                | Current state                                                                 |
| ------------------- | ----------------------------------------------------------------------------- |
| Products            | 95 of 95 published reference products                                         |
| Variants            | 880; 659 available and 221 unavailable in the reference                       |
| Images              | 709                                                                           |
| Collections         | 41; 709 memberships                                                           |
| Storefront checks   | 0 missing, 0 extra, 0 product issues, 0 collection issues                     |
| Admin checks        | 41/41 collection memberships match the reference, including unpublished items |
| Reference reports   | Four live interaction audits plus `clone-flows.md`                            |
| Code checks         | `pnpm lint` and `pnpm typecheck` pass; working tree clean                     |
| Published catalogue | “Lorem Ipsum” Headless publication                                            |

The 221 sold-out variants are the largest remaining catalog difference: 50 products are partially
sold out and `core-cotton-shirt-all` is completely sold out in the reference, while every variant
in this store is currently available because inventory is untracked.

## Gap inventory

| ID  | Gap                                                | Owner   | Type                | Blocker                                      | Effort           |
| --- | -------------------------------------------------- | ------- | ------------------- | -------------------------------------------- | ---------------- |
| G1  | Inventory availability not mirrored                | Shopify | Code + app scopes   | `read_locations`, `write_inventory` approval | 2–3 h + approval |
| G2  | Fabric and Fit tabs are static                     | Shopify | Code + Admin API    | None                                         | 4–6 h            |
| G3  | Collection facets show only Availability and Price | Shopify | Store config + code | Search & Discovery admin setup               | 2–4 h + 15 min   |
| G4  | Colour palette has a missing `POLITE BLUE`         | Next.js | Code                | None                                         | 30 min           |
| G5  | Checkout stops at the store password               | Shopify | Store config + test | Online Store password setting                | 30 min + 1 h     |
| G6  | Currency selector differs from the reference       | Next.js | Decision + code     | Product decision                             | 0 h or 1–2 days  |
| G7  | Gallery is close but not fully at parity           | Next.js | Decision + code     | Product decision                             | 0 h or 4–6 h     |
| G8  | Reference uses GoKwik, clone uses Shopify          | Shopify | Decision            | Product decision                             | 0 h or separate  |
| G9  | Docs and final verification drift                  | Both    | Docs + verification | None                                         | 2 h              |

## G1 — Mirror inventory availability

**Goal:** make the 221 sold-out reference variants unavailable, without changing catalogue data.

1. In the Dev Dashboard, create a new app version with `read_locations` and `write_inventory`; keep
   all existing scopes. Release the version and approve the new scopes on the store.
2. Mint a fresh client-credentials token and confirm both handles with
   `currentAppInstallation { accessScopes { handle } }`.
3. Query the active location ID.
4. Extend `scripts/import-live-catalog.mjs` with `--inventory-only`. `--location-id` and the
   quantity code already exist:
   - resolve each catalog variant by product handle plus selected options/SKU;
   - set `inventoryItem.tracked = true` and `inventoryPolicy = DENY`;
   - set `available` to 100 for reference-available variants and 0 for sold-out variants;
   - skip product/media/collection writes;
   - preserve existing inventory fields when a later import omits `--location-id`.
5. Invalidate product caches after the run (`REVALIDATE_URL` with the `products` and
   `products-index` tags, or restart the local dev server).
6. Verify the Storefront API and the PDP:
   - 659 variants available / 221 unavailable;
   - `core-cotton-shirt-all` renders sold out;
   - `iris-halterneck-jumpsuit` exposes only `XL`;
   - a partially sold-out product shows struck-through sizes and the sold-out branch;
   - adding a sold-out variant is rejected by the cart.

**Acceptance:** counts match the reference, and no available reference variant is marked sold out.
The mirror stores availability, not exact on-hand quantities; document that limit.

## G2 — Import per-product Fabric and Fit copy

**Goal:** replace the static Fabric and Fit tab copy with the reference product copy.

1. Extend the catalog importer with `--metadata-only` and a cached
   `.catalog-import/live-metadata.json`.
2. Scrape the four PDP tab panels for all 95 products. Store the `Fabric` and `Fit` panel text.
   Validate that both panels were found and that no product silently falls back to the static copy.
3. Create product metafield definitions with storefront read access:
   - `custom.fabric_care` — `multi_line_text_field` for the Fabric tab;
   - `custom.fit` — `single_line_text_field` for the Fit tab;
   - `custom.fabric` — `list.single_line_text_field` for the fabric facet;
   - `custom.colour_family` — `list.single_line_text_field` for the colour facet.
4. Write values with `metafieldsSet` in batches.
5. Extend the product GraphQL fragment and transform with `fabricCare` and `fit`, then pass both
   into `components/product-detail/product-tabs.tsx`. Keep the current static copy as a fallback
   only when a value is absent.
6. Add the same fields to the product Markdown representation so the answer-engine surface stays
   aligned with the HTML PDP.
7. Invalidate product caches.

**Acceptance:** `alma-lace-corset-top` shows `Viscose with Nylon Lace` and `Panelled Corset`; a
sample of products with missing metadata still renders the fallback; the Markdown product response
contains both fields.

## G3 — Enable Product type, Colour and Fabric facets

**Goal:** the collection filter sheet exposes the same four groups as the reference.

1. Scrape the live filter membership once and cache it:
   - 12 colour families from
     `filter.p.m.custom.colour_family=BLUE|GREEN|GREY|BROWN|BEIGE|ORANGE|WHITE|DENIM|BLACK|RED|PINK|PURPLE`;
   - 12 fabric families from
     `filter.p.m.custom.fabric=COTTON|DENIM|HEMP|LYCRA|LYOCELL|NYLON|POLYESTER|RAYON|SATIN|SILK|TERRYCLOTH|VISCOSE`.
     Store each product’s family list in the metafields created in G2.
2. Product type is already imported as `productType`; no metafield is needed.
3. In Shopify admin → Search & Discovery → Filters, add Product type, Colour (from
   `custom.colour_family`), and Fabric (from `custom.fabric`). Price is already present. Save and
   wait for the filter index to refresh.
4. Verify `collection(handle: "all") { products(first: 1) { filters { ... } } }` returns all four
   groups with the expected labels and values.
5. In `components/collections/filters-client.tsx`, render colour filter values as a swatch plus
   label and count, matching the reference, instead of relying on Shopify returning
   `presentation: "swatch"`. Use `getColorSwatch(value.label)` as the fallback.
6. Verify in the browser: filter counts, URL changes, combinations, clear-all, empty results,
   desktop sheet and mobile sheet.

**Acceptance:** Product type, Colour, Fabric and Price are visible; Colour shows a box, name and
count; selecting a facet narrows results and updates the URL; no filter returns every product
because of a missing metafield.

## G4 — Complete the colour palette

**Goal:** every colour option resolves to a swatch.

1. Add the missing `POLITE BLUE` alias (`#005BD3`) to `lib/product/color-swatches.ts`. The template
   rebrand is complete; keep the existing `LOREM BLUE` alias only if older product data still uses
   it.
2. Re-scrape the four PDPs that timed out (`meira-corset-mini-dress-black`,
   `ira-pintucked-shorts`, `baby-tee-1`, `greasy-denim-biker-jacket-beige`) with a longer timeout
   or the collection card’s `data-colours` payload.
3. Compare every colour option value in the 95-product catalog against the palette. The current
   gap is only `POLITE BLUE`; four scrape timeouts are products whose values are already covered.
4. Verify PDP chips, card dots, quick view and the colour filter all render a swatch.

**Acceptance:** 43/43 catalog colour names resolve; no blank dot or empty swatch.

## G5 — Complete checkout verification

**Goal:** prove the cart hands off to a usable Shopify checkout.

1. Shopify admin → Online Store → Preferences → disable password protection.
2. Add an available product to the cart and click Checkout. Assert the URL is the Shopify checkout
   for this store, not `/password`.
3. Verify the first checkout step shows the line item, quantity, subtotal, currency and shipping.
4. Optional only with explicit approval: complete a test order using the store’s test payment
   provider and a clearly fake address, then cancel/refund it. Do not use a real card.
5. Document that the clone intentionally uses Shopify checkout, not the reference’s India-only
   GoKwik overlay.

**Acceptance:** checkout is reachable and the order summary matches the cart; no password redirect.

## G6 — Currency and store-currency decision

The store is INR-priced (set 10 November 2026). The reference's selector is a client-side FX display: it changes prices
without changing the cart, checkout or order currency. Indian payments add a harder constraint:
Shopify processes third-party-provider payments in the store currency, and UPI is INR-only, so a USD
base disables UPI and domestic payment methods.

| Option                        | What it means                                                                                       | Recommendation                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A. Keep USD only              | Static `USD` label, one currency everywhere. Remove this from the gap list and document the choice. | Not viable for an Indian audience: no UPI                  |
| B. INR base + Markets pricing | Set store currency to INR; use Markets catalogs/price adjustments for international shoppers.       | **Implemented**; international shoppers are charged in INR |
| C. Reference-style FX display | Convert displayed prices client-side; cart and checkout stay in the store currency.                 | Removed; the storefront is INR-only                        |

**Current status:** the store currency is INR (set 10 November 2026) with final INR prices. The
storefront shows INR only; the former display-only USD toggle was removed. No reprice is pending.
The full payment rationale is in [`PAYMENTS.md`](./PAYMENTS.md).

## G7 — Gallery parity decision

The clone already has the reference’s main structure: a stacked desktop gallery with a lightbox and
a mobile snap carousel. The reports’ “thumbnails” line is stale. Remaining differences:

- no wheel/pinch zoom or double-tap reset;
- the lightbox has no previous/next controls or image counter;
- mobile dots are buttons while the reference uses non-interactive spans;
- focus behaviour in the lightbox differs.

Options: accept the current gallery and correct the report, or spend 4–6 hours adding zoom,
previous/next, counter and a focus trap. This is presentation parity, not a catalog gap.

## G8 — GoKwik decision

The reference opens a GoKwik iframe for India; the clone hands off to Shopify checkout. GoKwik is a
checkout-experience layer, not a payment aggregator: licensed payment aggregators integrated with
GoKwik process the payments. Recommended: keep Shopify checkout with Razorpay and revisit GoKwik
only if conversion or COD/RTO data justifies a second checkout system. The full evaluation and
launch checklist is in [`PAYMENTS.md`](./PAYMENTS.md).

## G9 — Final verification and handoff

1. Re-run the catalog verifier against the Storefront API and the Admin API collection membership.
2. Re-check all 95 product routes and 41 collection routes.
3. Browser-check the changed surfaces: PDP tabs, colour chips, filter sheet, sold-out PDP, cart and
   checkout handoff.
4. Run `pnpm lint`, `pnpm typecheck` and `pnpm build`.
5. Update `docs/FRONTEND-ARCHITECTURE.md`, `docs/CATALOG-IMPORT.md`, `docs/IMPLEMENTATION.md`,
   `docs/SHOPIFY-APP-SCOPES.md` and `docs/reference/interactions/clone-flows.md` with the final
   state.
6. Commit the tracked code and docs; keep `.catalog-import/` and `.playwright-mcp/` ignored.

## Sequence and critical path

| Order | Work                                          | Depends on              |
| ----- | --------------------------------------------- | ----------------------- |
| 1     | G4 palette fix; G9 docs truth pass            | None                    |
| 2     | G2 metadata scrape, definitions, import, tabs | None                    |
| 3     | G3 facet metafields and admin filter setup    | G2 definitions          |
| 4     | G1 inventory scopes and import                | External scope approval |
| 5     | G5 password disable and checkout test         | External store setting  |
| 6     | G7 gallery polish and/or G6 currency          | Product decisions       |
| 7     | Final verification, docs and commit           | All chosen work         |

## Decisions needed

1. **Currency:** keep USD-only (recommended) or implement Shopify Markets?
2. **Gallery:** accept the current stacked gallery/lightbox or add zoom and lightbox navigation?
3. **Checkout:** may a test order be placed with the store’s test payment provider, or should
   verification stop at the first checkout step?
4. **Shopify admin actions:** who will approve the inventory scopes, configure Search & Discovery,
   and disable the password? These are not available through the current Admin API.
5. **GoKwik:** keep Shopify checkout (recommended) or plan a separate GoKwik integration?

## What can proceed without any decision

- G4 palette completion.
- G2 Fabric/Fit scrape, metafield import and PDP rendering.
- G3 metafield population and filter UI swatch fallback; only the Search & Discovery save is
  manual.
- G9 documentation and verification.

These are the first implementation batch. G1 and G5 are blocked on Shopify admin actions; G6–G8
are product decisions.
