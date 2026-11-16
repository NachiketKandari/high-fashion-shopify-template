# Wireframe execution plan

The build target is the Figma file `Lorem Ipsum Wireframe` (`TzeMmJHUVWuiuknAcm1hq4`), a single page of 221 top-level frames covering desktop (1440) and mobile (390) for every storefront and post-purchase state. The file contains no components, no component sets and no published styles: every state is a separate artboard, so the states exist only as frames and must be inventoried before they can be built.

This plan sequences that build against the existing template. It is a specification-to-code plan, not a redesign: where the template already implements a state correctly, the phase closes it by verification rather than rewrite.

Related documents own adjacent decisions and are not restated here:

- `GAP-CLOSURE-PLAN.md` — catalog, facet and gallery parity, plus the checkout-unblock items G1–G9.
- `PAYMENTS.md` — gateway, currency and Razorpay/PayU decisions.
- `SHIPROCKET.md` — shipping, tracking and returns transport.
- `DESIGN-SYSTEM-ENFORCEMENT.md` — the token layer and test contract.
- `AUTHENTICATION.md` — Customer Account OAuth.

A phase does not start until its predecessor's exit criteria pass. Each phase ships as its own pull request and leaves `main` deployable.

## Phase map

| Phase | Scope                                       | Owner             | Gate                                                |
| ----- | ------------------------------------------- | ----------------- | --------------------------------------------------- |
| P0    | Decisions and capability gates              | Product + Shopify | Six decisions signed off                            |
| P1    | Specification inventory and design contract | Next.js           | Every frame has a verdict; tokens mapped            |
| P2    | Shopify connectivity verification           | Shopify           | Real cart, real session on the dev store            |
| P3    | Design contract in code                     | Next.js           | `pnpm lint` design gate passes                      |
| P4    | Shell, navigation, footer                   | Next.js           | Header and footer match frames at both breakpoints  |
| P5    | Browse                                      | Next.js           | Default and refined browse verified with facets     |
| P6    | Product page                                | Next.js           | Seven PDP states verified                           |
| P7    | Cart and checkout handoff                   | Shopify           | Cart states verified; checkout URL reached          |
| P8    | Search                                      | Next.js + Shopify | Six search states verified                          |
| P9    | Account                                     | Shopify           | Real customer session and order history             |
| P10   | Private wishlist                            | Shopify           | Wishlist survives a new device                      |
| P11   | Post-purchase and operations                | Shopify           | Each gated feature has a signed-off data source     |
| P12   | Content, errors, agent surface              | Next.js           | Markdown and schema surface verified                |
| P13   | Hardening and launch                        | Both              | Performance, accessibility and analytics signed off |

## Blocking decisions

These cannot be answered by code. Defaults are the recommendation, not the decision.

| ID  | Decision                                                                                                                                     | Blocks     | Default                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| D1  | Is the identity gate (OTP before checkout) required, or is guest checkout with phone verification acceptable?                                | P2, P7, P9 | **Answered:** guest checkout; accounts only for wallet, invoices, wishlist, cancellation |
| D2  | Is the shipped home page (`home-desktop-frame-64.md`, exported from a different Figma frame) still the target, given it is not in this file? | P4         | **Answered:** rebuild to the wireframe, blocked on a home frame that does not exist      |
| D3  | Which of the six post-purchase features are in scope for launch?                                                                             | P11        | **Answered:** full suite — tracking, pincode, cancellation, wallet, invoices, returns    |
| D4  | Do collection pages keep the 2-column/4-column and model/image/item selectors, or fix one layout per breakpoint?                             | P5         | Keep model/image/item; fix 4-up desktop, 2-up mobile                                     |
| D5  | Where does pincode serviceability data come from — Shiprocket, a Shopify app, or a metafield ruleset?                                        | P6, P11    | Shiprocket, per `SHIPROCKET.md`                                                          |
| D6  | Does the wireframe's type treatment (left, negative tracking) replace the template's (positive tracking) or is it confined to display sizes? | P3         | Confine to display and heading roles                                                     |

D1, D2 and D3 were answered on 2026-11-16 and the decision log lives in `docs/WIREFRAME-PROGRESS.md`.
D4–D6 stay open with their defaults. D2 is answered in intent but not actionable until a home frame
exists, so home work does not begin.

## P0 — Decisions and capability gates

**Goal:** convert six open questions into signed-off answers, and confirm what Shopify can actually serve before promising it.

**Work:**

1. Answer D1–D6 and record the answers in this document under each phase's scope.
2. For each gated feature, verify the data source against Shopify's current API surface before any UI is promised. Specifically confirm:
   - store credit balance and application: whether the Customer Account API exposes a balance to the storefront, or whether the balance is checkout-only.
   - tax invoices and credit notes: native, app, or Admin API plus document generation.
   - public order lookup without login: Shopify's order status surface requires an order number plus email; decide whether that satisfies `Public Track Order — Initial Form (No Login)`.
   - cancellation after payment: `orderCancel` is an Admin API mutation, not a storefront one; decide whether a server-side admin credential is acceptable.
   - self-serve returns: native Shopify returns, an app, or manual operations.
3. Confirm the checkout-unblock items in `GAP-CLOSURE-PLAN.md` G5 (store password) and G1 (inventory scopes), since P7 and P6 cannot be verified without them.

**Exit criteria:** a capability table listing each gated feature, its data source, its owner, and whether it is in launch scope.

**Risk:** promising a screen whose data Shopify does not expose. This is the single largest risk in the programme, and it is why P0 exists before P1.

## P1 — Specification inventory and design contract

**Goal:** make the 221 frames addressable, and turn the wireframe into a design contract the token layer can express.

**Work:**

1. Write `docs/reference/figma/wireframe-inventory.md`: one row per frame with journey, screen, state, platform, frame id, dimensions, and a verdict of `Build`, `Shopify-hosted`, `Gated`, or `Skip`, following the conventions in `docs/reference/figma/README.md`. Done: 221 frames classified as 93 build, 60 Shopify-hosted, 37 gated, 31 skip.
2. Record the defects found in the source file so they are not built: the pre-payment audit renders `INR 11,000` while deducting `INR 1,000` of account credit (the subtotal plus tax reconciles, the credit line does not); all five payment frames contain zero text nodes and cannot serve as a build reference; thirteen frame-name pairs are duplicates (`Mobile PDP - Default State (In Stock)`, `Order confirmation - Happy Path`, and others); and the copy typos `CONTROL YOUR NURRATIVE`, `Shop for Man`, `Subscribe to Our Newsletters`, `Typo correcton`, `Notify Me Modall`.
3. Map the wireframe's type scale and spacing onto the existing roles in `app/globals.css`. The wireframe uses DM Sans at 10–18px with negative tracking; the template uses 9–22px roles with `0.05em` tracking. Reconcile under D6.
4. Inventory the primitives the frames require that have no counterpart: accordion, stepper, segmented content toggle, quantity stepper, drawer with two-level navigation.

**Exit criteria:** every frame has a verdict; every visual pattern the build will use has a token or a primitive assigned.

## P2 — Shopify connectivity verification

**Goal:** prove the data path end to end on the dev store before building screens against it.

**Work:**

1. Verify environment: store domain, Storefront API token, Customer Account client id and secret, session secret, webhook secret. Every variable read has a row in `.env.example` and an entry in `turbo.json` `globalEnv`.
2. Verify the read path: one collection, one product, one page, one policy, one order and one address round-trips through `lib/shopify/operations/**/server.ts` into a domain type.
3. Verify the cart write path through `proxy.ts` and `/api/cart`: add, update quantity, remove, and the empty state.
4. Verify the customer path: OAuth sign-in, session cookie, refresh through `/account/refresh`, sign-out as a same-origin POST.
5. Verify webhook-driven invalidation reaches the cache tags used by `get*` wrappers.
6. Confirm the GraphQL workflow: document authored with `gql()`, validated with `shopify-ai-toolkit`, response typed with `ResultOf`, transformed in `lib/shopify/transforms/`, surfaced as a domain type. No hand-written Shopify response types.

**Exit criteria:** a real cart reaches a real checkout URL, a real customer session renders a real order, and a webhook invalidates a cached collection. Anything short of this stops the programme, because every later phase assumes it.

**Note:** `GAP-CLOSURE-PLAN.md` G5 records that checkout currently stops at the store password. Clear that before claiming P7.

## P3 — Design contract in code

**Goal:** express the wireframe through the existing token layer, not alongside it.

**Work:**

1. Adjust `app/globals.css` tokens only where P1 proved a gap: type roles, `--gutter`, `--section-gap`, grid columns, and any state colour the wireframe actually introduces. The wireframe's palette is nine neutral greys, so expect little or no colour change.
2. Build the missing primitives in `components/ui/` with primitive props only, following existing conventions: accordion, stepper, segmented toggle, quantity stepper.
3. Keep rectangular surfaces at zero radius and `rounded-full` for counts, colour dots and gallery indicators only.
4. Pass the static drift gate with `pnpm lint` and the computed-style contracts with `pnpm test:design`.

**Exit criteria:** the gate passes, and every new primitive is used by at least one real screen in a later phase without ad-hoc overrides.

## P4 — Shell and navigation

**Goal:** the frame-independent chrome the wireframe specifies on every screen.

**Work:**

1. Header: `WOMEN | MEN | SEARCH` left, centred wordmark, `WISHLIST | BAG | HELP | ACCOUNT` right, with the bag count and the mobile menu.
2. Mega menu (`menu-woman`, `menu-man` frames) and the region/currency drawer. The drawer frame is a mis-captured full page containing a `Credits: 9,000 INR` header element that appears nowhere else; treat the credits line as out of scope until D3.
3. Footer: brand block, four link columns, newsletter form, legal row.
4. Cookie consent, matching the frames' `Only Essentials` / `Allow All` pair.
5. Home page is specified outside this file, in `docs/reference/figma/home-desktop-frame-64.md`, and is already implemented in `app/page.tsx`. Under D2, keep it and surface any conflict with the new header, product cards or footer as a change to that spec rather than a rewrite.

**Exit criteria:** header, mega menu, footer and consent render correctly at 390, 750 and 1100 and above, with the account icon inside its fixed-size container and Suspense boundary.

## P5 — Browse

**Goal:** the eight `PLP` frames, nine `PLP alt` frames and nine mobile frames, including filter, sort and zero-result states.

**Work:**

1. Content-mode toggle `model | image | item` as a browse dimension, carried in the URL alongside filters so it survives refresh and sharing. This has no counterpart today: `BrowseState` carries `filters` and `sort` only.
2. Column behaviour per D4. The frames specify both two and four columns; best-in-class stores have removed density selectors in favour of one fixed layout.
3. Filter drawer states: colour, size, price, sort, active-filter count badge, active filtered state, zero results. The drawer, badge and result count already exist; this is completion work against the frames.
4. Ensure the default first page of a collection and of `/collections/all` stays cached, and that filtered, sorted and load-more paths keep calling `fetch*` rather than cached wrappers. The rewrite in `proxy.ts`, `SearchParamsProbe` and `CollectionBrowseBoundary` must survive unchanged.
5. Add what the frames omit but the surface needs: breadcrumb, H1, product count, `ItemList` and `BreadcrumbList` schema, canonical handling for filtered URLs.
6. Confirm the load-more mechanism; `infinite-product-grid` already provides it.

**Exit criteria:** default browse ships its products in the static shell, a filter change rewrites to the refine route, the toolbar and open sheet survive the change, and only the grid falls back.

## P6 — Product page

**Goal:** the seven desktop and seven mobile PDP states.

**Work:**

1. Gallery: stacked media with the model/image distinction the PLP toggle implies, plus alignment to the `G7` gallery decision in `GAP-CLOSURE-PLAN.md`.
2. Buy column: price, colour swatches, three accordions (description, details, shipping), size chips, and size guidance. The `size-guide` component and route exist; size _recommendation_ has no data source and needs one before it is promised.
3. Stock states: default in-stock, variant selected, low-stock alert, out-of-stock with waitlist. `PDP - Out-of-Stock / Waitlist` and `PDP - Notify Me Modal` require a waitlist data source that does not exist today; gate on D3.
4. Modals and sheets: size guide, notify me, slide-over confirmation.
5. Serviceability check on the page, per D5. The frames put it at address entry only, which is too late for an Indian catalogue; if D5 lands on Shiprocket, this is a small read on the PDP using the same source as P11.
6. Keep the existing cache, bundle, complementary and related surfaces; `shopConfig.pdp` already controls them.

**Exit criteria:** all in-stock and selected states verified against real Shopify data at both breakpoints, with unavailable states either built against a real data source or explicitly deferred.

## P7 — Cart and checkout handoff

**Goal:** the four cart states and a correct handoff to Shopify checkout.

**Work:**

1. Cart states: active, updating quantity with price recalculation, empty, out-of-stock line. Mobile variants included.
2. Summary: free-shipping statement, subtotal, delivery, total, checkout. Every value comes from Shopify; no storefront arithmetic.
3. Promo entry and gift toggle: decide whether these live in the cart or are deferred to checkout. `Use account credits` is a checkout control and is not implementable in the cart.
4. Checkout handoff through the existing `prepareCheckoutAction`, which reads the confirmed URL and does not mutate the cart.
5. Add the trust signals the research and the frames together justify: payment marks, returns link, delivery estimate, all inside the summary.

**Exit criteria:** each state verified in a browser against a live cart, and the checkout URL reached. Cart writes still go only through Hydrogen handlers.

## P8 — Search

**Goal:** the six search frames.

**Work:**

1. Overlay states: initial, active typing, results, zero results, typo correction.
2. The predictive path already exists in `lib/search`; this phase aligns presentation and state coverage.
3. Typo correction is not a Shopify predictive-search guarantee. Confirm what the API actually returns before building the state, and degrade to a suggestion list if it does not.
4. Search results page, markdown representation and `SearchAction` schema.

**Exit criteria:** all six states verified with real queries, including a query that legitimately returns zero results.

## P9 — Account

**Goal:** the account hub and its sub-pages, with Shopify owning identity.

**Work:**

1. Identity is Shopify-hosted. The `Identity Gate`, `Login Screen` OTP/password frames and `New Client Onboarding` are context, not build work. The storefront owns the entry point, the failure page and the refresh route.
2. Hub: sidebar, three summary cards, latest-order card with a track action, default address. Orders list, order detail, addresses and profile exist; align them to the frames.
3. Wallet balance and invoices are gated on P0. The hub's balance card renders only when a real balance source exists.

**Exit criteria:** a real customer signs in, sees real orders, edits a real address, and signs out. No screen renders fabricated balances or invoices.

## P10 — Private wishlist

**Goal:** `Private Wishlist` as a per-account collection.

**Work:**

1. Today the wishlist is `localStorage` only (`lib/wishlist/client.ts`), which cannot satisfy a private, cross-device wishlist. Choose storage: customer metafield, or a wishlist app. Metafields keep ownership in Shopify and avoid a new dependency.
2. Migrate reads and writes behind the existing client entry point so components do not change.
3. Cover populated, empty and quick-size-selector-sheet states, and the merge of any anonymous wishlist into the account on sign-in.

**Exit criteria:** saved items survive a new browser and a new device on the same customer.

## P11 — Post-purchase and operations

**Goal:** the gated journeys, each independently shippable.

Order of delivery, cheapest and highest value first:

1. Public track order and the four-step tracking stepper, on Shiprocket data per `SHIPROCKET.md`.
2. Cancellation inside and outside the 24-hour window, if P0 confirms a write path.
3. Returns and exchange, steps 05–10, including the inspection gate.
4. Wallet balance and store credit.
5. Tax invoices and credit notes.
6. Non-serviceable pincode alert.

All six are in scope under D3. Each is its own phase-sized unit with its own data source and its own
exit criteria, and none ships behind a mock. Two are conditional on verification rather than on scope:
the wallet needs store credit visible to a storefront, and cancellation and returns need write paths
that are Admin-side or Shiprocket-side. If a capability check fails, the feature stalls at P0 and does
not become a screen that renders invented data. The `Returns` frame's own caveat — final settlement after inspection — is a business rule that must exist in the data, not only in the copy.

## P12 — Content, errors, agent surface

**Goal:** the remaining static and derived surfaces.

**Work:**

1. Support pages 22–26, the atelier story, policies.
2. `27. Editorial 404 Page` and `28. 500 Maintenance Screen`, including the existing `Global Error`.
3. The answer-engine surface stays consistent with the new routes: markdown representations, `/llms.txt`, sitemap, robots, and schema for any page added above.
4. Keep Eve out of this surface; it has its own channel.

## P13 — Hardening and launch

**Work:**

1. Performance: LCP element per template, image widths limited to the two configured sizes, no per-link prefetch regressions in grids.
2. Accessibility: the existing computed-style, target-size, ARIA and reduced-motion contracts extended to new primitives through the design gate, not through new test files.
3. Analytics and consent per `shopConfig.analytics`.
4. Launch checklist: environment parity, webhook registration, cache warm-up, 404 monitoring.

## Shopify surface map

Each screen consumes exactly one owning surface.

| Screen                              | Surface                               | Operation owner                                 |
| ----------------------------------- | ------------------------------------- | ----------------------------------------------- |
| Browse, facets, sort                | Storefront API                        | `lib/shopify/operations/collections`, `catalog` |
| Product page                        | Storefront API                        | `lib/shopify/operations/products`               |
| Search and predictive               | Storefront API                        | `lib/search`, `operations/catalog`              |
| Cart                                | Hydrogen cart handlers via `proxy.ts` | `lib/cart`                                      |
| Checkout                            | Cart checkout URL                     | `lib/cart/action`                               |
| Account, orders, addresses, profile | Customer Account API                  | `lib/shopify/operations/customer`               |
| Policies, pages, blogs              | Storefront API                        | `operations/policies`, `pages`, `blogs`         |
| Invalidation                        | Webhooks                              | `lib/shopify` webhook handler                   |
| Post-purchase (P11)                 | Shiprocket and/or Admin API           | new domain under `lib/`                         |

Two rules hold across every phase: Shopify fetches and Next.js caches, and commerce facts are never recomputed on the storefront.

## Sequencing and pull requests

Critical path: P0 → P2 → P1 → P3 → P4 → P5 → P6 → P7. P8 through P12 can run in parallel once P3 lands, because they depend on primitives and the shell rather than on each other.

Two phases are unusually parallelisable: P1 needs no Shopify access, and P11 item 1 depends on Shiprocket configuration rather than storefront work.

One phase is unusually serialising: P2 reaches P7 and P9. Treat it as a spike with a written result.

## Checkpoints, pausing and context compaction

This programme is larger than one working session, and the frames, API responses and decisions needed
to build a phase do not survive a context compaction. Chat state is not a source of truth. Every
pause point therefore ends with an artifact on disk, and every phase begins by reading two files
rather than re-deriving its inputs.

**Pause only at a phase boundary.** Never compact mid-phase. The unit of resumable work is one phase,
or one numbered feature inside P11.

**Checkpoint table.** Each row is a required pause. The artifact is written before the session ends.

| Pause | After | Artifact written before pausing                                  | Frame ids and inputs that must be in it                    |
| ----- | ----- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| C0    | P0    | Capability table appended to `docs/WIREFRAME-PROGRESS.md`        | Six decisions with answers and dates                       |
| C1    | P1    | `docs/reference/figma/wireframe-inventory.md`; design delta list | Every frame id in scope for P3                             |
| C2    | P2    | Spike result in the progress ledger                              | Store, API version, verified operations, failures          |
| C3    | P3    | Token and primitive list, with the gate result                   | Role names and primitive files                             |
| C4    | P4    | Shell spec deltas                                                | Header, menu, drawer, footer frame ids                     |
| C5    | P5    | Browse delta list                                                | The eight PLP frames and nine alt frames in scope          |
| C6    | P6    | PDP delta list                                                   | The seven desktop and seven mobile PDP frames              |
| C7    | P7    | Cart state list and checkout evidence                            | Four cart frames, checkout URL                             |
| C8    | P8    | Search state list                                                | Six search frames, what predictive search actually returns |
| C9    | P9    | Account delta list                                               | Hub and sub-page frame ids                                 |
| C10   | P10   | Storage decision and migration note                              | Three wishlist frames                                      |
| C11   | P11   | One entry per feature, each independently resumable              | The gated frame ids for that feature only                  |
| C12   | P12   | Route list added or changed                                      | Content and error frame ids                                |
| C13   | P13   | Launch checklist result                                          | —                                                          |

**The progress ledger** is `docs/WIREFRAME-PROGRESS.md`. It is the resume brief and it is rewritten,
not appended to indefinitely. It holds exactly: the current phase, its status, the decisions taken
with dates, the open questions blocking the next phase, the evidence from the last verification run,
and the next single action. It does not hold narration, screenshots or reasoning.

**Starting a session.** Read `docs/WIREFRAME-PROGRESS.md`, then the phase section of this plan. If the
ledger's next action names a frame id, look it up in `docs/reference/figma/wireframe-inventory.md`
rather than re-exporting the file.

**What must be on disk before a pause.** Anything derived from the Figma API or a Shopify response:
frame ids, sizes, verdicts, node JSON excerpts that justify a decision, and the GraphQL document names
touched. Values that exist only in a tool result are gone after compaction.

**What must never be on disk.** The Figma access token, Shopify access tokens, customer session
secrets, or any credential. The token belongs in the environment or a mode-600 file outside the
repository, and is regenerated per working session.

**Compaction triggers.** Pause when any of these is true, whichever comes first:

- the phase's exit criteria pass;
- the phase has consumed its plan and the next action is in a different phase;
- the session is about to cross into P11, because that phase is six independent features;
- verification evidence can no longer be reproduced without re-running the whole spike.

**Verification evidence survives as text.** Record the command, the URL tested, and the observed
result for each check. A screenshot in a temp directory is not evidence after a pause; the sentence
describing what it showed is.

## Definition of done per phase

- `pnpm lint` passes, including the static design gate.
- `pnpm typecheck` and a production build pass.
- The phase's screens verified in a browser against real Shopify data at 390 and 1440, with the specific state named in the check.
- Existing tests in `pnpm test:design` run where the phase touches the token layer or a primitive.
- No fabricated commerce data anywhere: no invented prices, balances, invoices, stock or delivery promises.
- Documentation updated only where a reader needs it to act.
- `docs/WIREFRAME-PROGRESS.md` updated: phase status, decisions with dates, verification evidence, and the next single action.

New tests are not part of this plan; the repository's testing policy defers them.

## Risk register

| Risk                                        | Impact                          | Mitigation                                  |
| ------------------------------------------- | ------------------------------- | ------------------------------------------- |
| A gated feature has no Shopify data source  | Screen cannot ship              | P0 capability gate before P11 scope         |
| Checkout blocked by store password          | P7 unverifiable                 | Clear `GAP-CLOSURE-PLAN.md` G5 early        |
| Wireframe palette mistaken for brand design | Wrong tokens propagated         | P1 reconciles explicitly under D6           |
| Credit arithmetic bug copied into the build | Wrong totals                    | P1 defect list; totals always from Shopify  |
| Wishlist stays local                        | Private wishlist unmet          | P10 storage decision, metafields preferred  |
| Identity gate suppresses conversion         | Revenue                         | D1 answered with data, not taste            |
| Refine route and cache rules regress        | Duplicate products, stale pages | P5 exit criteria pin the existing behaviour |

## Out of scope

Checkout, payment entry and OTP authentication are Shopify-hosted and are not built here. The five payment frames carry no text and are not a specification. The home page is specified outside this file in `home-desktop-frame-64.md` and is kept, not redesigned. Nothing in this plan adds a test runner, a second styling system, or a storefront-side commerce calculation.
