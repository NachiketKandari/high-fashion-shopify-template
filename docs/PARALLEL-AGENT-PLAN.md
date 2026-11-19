# Parallel agent plan — Design I checkout journey

Yes, the work can run in parallel across worktrees, with one gate: the design foundation lands first.
Every surface below consumes the same tokens, route-group chrome, product card and primitive layer;
starting page work before that exists guarantees conflicting rewrites. The foundation is one
worktree, one merge, and the rest fan out from it.

Source of truth for the visuals: [`DESIGN-I-CHECKOUT-JOURNEY.md`](./DESIGN-I-CHECKOUT-JOURNEY.md) and
[`reference/design-i/`](./reference/design-i/README.md). The export is
`~/Downloads/lorem-ipsum-design-i-(copy)-export.json`, produced by
`docs/reference/figma/export-plugin/`. Do not build these surfaces from the wireframe frames.

## 1. Workstreams

| #   | Worktree                          | Branch                    | Scope                                                                                 | Depends on                 | Est.  | Status          |
| --- | --------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- | -------------------------- | ----- | --------------- |
| 0   | `hf-worktrees/design-foundation`  | `work/design-foundation`  | Tokens, route groups, header/footer, product card/row, shared primitives, design gate | —                          | 2–3 d | Merged          |
| 1   | `hf-worktrees/design-home`        | `work/design-home`        | Home desktop + mobile composition                                                     | 0                          | 1–2 d | Not started     |
| 2   | `hf-worktrees/design-menu-search` | `work/design-menu-search` | Desktop/mobile menu, full-page search, five search states                             | 0                          | 2–3 d | Built, unmerged |
| 3   | `hf-worktrees/design-pdp`         | `work/design-pdp`         | PDP geometry, buy panel, gallery, try-on, modals, recs                                | 0                          | 3–4 d | Merged          |
| 4   | `hf-worktrees/design-cart`        | `work/design-cart`        | Cart page desktop + mobile, states, sticky bar, add confirmation                      | 0                          | 2–3 d | Merged          |
| 5   | `hf-worktrees/design-auth`        | `work/design-auth`        | Identity gate UI + Shopify handoff, validation states; OTP screens gated              | 0, D2                      | 1–2 d | Not started     |
| 6   | `hf-worktrees/design-checkout`    | `work/design-checkout`    | Address and shipping pre-checkout step, summary, serviceability, promo/gift           | 0, D3, 4 (cart components) | 3–5 d | Merged          |

Waves:

```
wave 0:  foundation ──► merge to main
wave 1:  home ─┐
         menu/search ─┤
         pdp ─┼─► merge independently
         cart ─┘
wave 2:  auth ─────► merge
         checkout ─► merge after cart
```

Auth and checkout can start their spec/read-only work in parallel with wave 1, but their branches
must rebase on the foundation and cart merge before review. They are gated by decisions D2 and D3
in the journey document; do not invent a custom identity service or a custom payment checkout in
these worktrees.

### Local development ports

Each worktree serves on its own fixed port, so parallel sessions and their browsers never share a
server. Point the design suite at the same port with `DESIGN_BASE_URL`.

| Worktree    | Port |
| ----------- | ---- |
| foundation  | 3000 |
| home        | 3001 |
| menu-search | 3002 |
| pdp         | 3003 |
| cart        | 3004 |
| auth        | 3005 |
| checkout    | 3006 |

```sh
PORT=3002 corepack pnpm dev
DESIGN_BASE_URL=http://localhost:3002 corepack pnpm test:design
DESIGN_BASE_URL=http://localhost:3002 corepack pnpm exec playwright test tests/design --headed
```

Playwright is headless by default; `--headed` opens a browser window without changing the port. A
browser automation session can attach to the same URL. Before moving a worktree to its slot, stop
only that worktree's server: `lsof -ti tcp:<port> | xargs kill`.

## 2. Exclusive file ownership

Rule: a workstream edits only its column. If a shared file must change, the foundation workstream
does it, or the owning workstream opens a small prerequisite change and merges it first. Never edit
`app/globals.css`, `design/**`, `tests/design/**`, `components/ui/**` outside the foundation
workstream.

### Foundation — locked for everyone else

```
app/globals.css
app/layout.tsx
app/(storefront)/layout.tsx            new
app/(auth)/layout.tsx                  new
app/(checkout)/layout.tsx              new
design/**                              manifest, baseline, exceptions
tests/design/**                        token/ARIA/flow contracts
scripts/check-design.mjs
components/ui/**                       all shared primitives
components/brand/wordmark.tsx
components/nav/header.tsx
components/nav/fallback.tsx
components/footer/**
components/product-card/**
components/home/product-row.tsx
components/product/price.tsx
components/product/products-grid.tsx
lib/nav/index.ts
docs/DESIGN-SYSTEM.md
docs/DESIGN-I-CHECKOUT-JOURNEY.md       section 4.0 only
```

The route-group move is the highest-risk change: every page route moves under `(storefront)`,
`(auth)` or `(checkout)` with URLs unchanged. Do it in one commit, run `pnpm build`, and confirm
`/`, `/products/[handle]`, `/cart`, `/search`, `/account`, `/policies/*`, `/pages/*`, `/blogs/*`
and the `/md/*` handlers still resolve.

### Home

```
app/(storefront)/page.tsx
components/home/**                     except product-row.tsx
public/reference/design-i/home/**      new assets only
```

### Menu and search

```
components/nav/index.tsx               composition of DesktopNav/MobileMenu/Search
components/nav/desktop-nav.tsx
components/nav/mobile-menu.tsx
components/nav/search-modal.tsx        replace with the full-page surface
components/nav/nav-chip.ts
app/(storefront)/search/page.tsx
components/search/**                   new
lib/search/**                          only if a query/typo helper is needed
public/reference/design-i/search/**    new assets only
```

### PDP

```
app/(storefront)/products/[handle]/page.tsx
components/product-detail/**
components/product/related-products-section.tsx
components/product/deferred-related-products.tsx
lib/product/**                         only with a note in the PR; coordinate with foundation
public/reference/design-i/pdp/**       new assets only
```

Port the try-on studio from `/Users/nachiket/UniPlus/tryon-product-page/components/try-on/` as
client components. Keep Shopify `useProductForm`, `useCart`, cart handlers and metadata. The demo
stock bar in that repo is not production code.

### Cart

```
app/(storefront)/cart/page.tsx
components/cart/**
components/nav/cart.tsx                bag trigger; opens /cart, not a drawer
components/nav/cart-client.tsx
lib/cart/**                            only with a note; never re-implement totals
```

### Auth

```
app/(auth)/**                          gate, validation, OTP presentation, failed state
components/auth/**                     new
components/nav/account.tsx
app/account/sign-in-failed/page.tsx
lib/auth/**                            only if the OAuth lifecycle requires it (D2)
```

### Checkout

```
app/(checkout)/checkout/**
components/checkout/**                 new
lib/checkout/**                       new
lib/serviceability/**                  replace the stub or keep the honest unverified state
```

Checkout may read `components/cart/*` and `lib/cart/*` but must not edit them. If a shared cart
piece is needed, request it from the cart workstream.

## 3. Merge protocol

1. Foundation merges to `main` with `pnpm lint`, `pnpm typecheck`, `pnpm build` and
   `pnpm test:design` green.
2. Every surface branch rebases on `main` (`git rebase main`) before code review.
3. Merge order: home, menu-search, pdp, cart, auth, checkout. File ownership means these should
   apply without conflicts; a conflict means a boundary was crossed.
4. Each PR is terse: what the shopper can now do, which owner (Next.js/Shopify) it belongs to, how
   it was verified, and any gated state.
5. After each merge, the next branch rebases; do not batch merges and fix a conflict pile later.
6. No branch adds a test file or a new test runner (repo policy). Use the existing checks and
   browser verification.

## 4. Agent briefs

Paste one block into each worktree agent. Every brief starts with the same reading list.

**Common preamble**

```
Repo: /Users/nachiket/workspace/high-fashion-shopify-template (or the worktree path)
Read in this order:
1. AGENTS.md
2. docs/DESIGN-I-CHECKOUT-JOURNEY.md
3. docs/reference/design-i/README.md
4. docs/PARALLEL-AGENT-PLAN.md (this file)
5. The frame ids for your surface in docs/reference/design-i/README.md
6. node_modules/next/dist/docs/ before changing Next.js behavior

Rules:
- Touch only the files assigned to your workstream.
- Design I is canonical. The wireframe frames are historical for this surface.
- Use the existing tokens and primitives; do not add arbitrary type, raw hex, a second radius
  system, or a second styling system.
- Preserve route data loading, caching, tag invalidation, metadata, Suspense geometry and auth gates.
- Shopify owns commerce facts; never compute prices, totals, availability or identity.
- Do not add tests or dependencies. Run the existing checks.
- Report: what changed, what is gated, what you verified at 1440 and 390, what stayed unverified.
```

### 0 — Foundation

```
You own the shared contract. Deliver:
1. Design-I tokens in app/globals.css: palette, type roles with weights 400/500/600/700, sentence
   case, --radius-control: 4px, DM Sans 600/700. Update design/tokens.manifest.json,
   scripts/check-design.mjs, tests/design/* and docs/DESIGN-SYSTEM.md so the gate accepts the new
   contract and still rejects everything else.
2. Route groups: move page routes under (storefront), add (auth) and (checkout) layouts with the
   60px brand bar. URLs must not change. Keep providers in the root layout.
3. Header: 74px desktop plain-text nav; 56px mobile bar with the wordmark left and search, bag,
   account and menu icons right; transparent over the home hero and white when scrolled. Auth and
   checkout use their own 60px brand bar.
4. Footer: 419px design-I composition (wordmark 36px, four columns, newsletter).
5. Product card and product row: 250x447 image, 14/400 caption, 4-up desktop / 2-up overflow mobile,
   hover alternate. Update every consumer.
6. Shared primitives: quantity stepper, 16px checkbox, OTP input, design accordion, empty state.
7. Run pnpm lint, pnpm typecheck, pnpm build, pnpm test:design. Do not declare done with a failing
   gate or an exception without owner, reason and expiry.
```

### 1 — Home

```
Frames: 2003:263 (desktop default), 2003:177 (scrolled), 5:874 (mobile), 2022:2955 (mobile hero).
Rebuild app/(storefront)/page.tsx: 812px hero with two working dots; 50px marquee; 4-up new-in row;
2-up 684x700 category tiles; 1392x369 black image band; footer from foundation. Mobile adds Get the
Look, Exclusives, Bestsellers and the second category pair at the measured sizes.
Use real collections via the existing cached getCollectionResults wrappers and ProductRow. Add
design-I imagery under public/reference/design-i/home/; the current clone photography is a
placeholder. Verify the default collection pages stay cached and the home shell does not block on a
rail. Check 1440 and 390. Report the hero-copy decision (desktop image-only vs mobile title).
```

### 2 — Menu and search

```
Frames: 2022:2660, 1:309, 2022:4641, 2022:4768; search 1:461, 1:485, 1:517, 7:1426, 2044:1016.
Desktop panel 709px: 74px header (WOMAN/MAN/SEARCH + close), 354px link column, 354px tile column of
three 442px images, 20% scrim. Mobile panel 440x905 with the four header icons and three tiles.
Replace the search drawer with a full-page surface: 1392x57 input row + 276x57 black SEARCH button,
trending terms, 4-up 348x509 result cards, and the empty/typing/results/zero/closest states. Keep
the /search deep link, predictive search, ⌘K and analytics. Mobile search has no frame: produce a
390px stack with the same controls and keyboard behavior. True typo correction is gated (D6); use
closest-title results and honest copy.
```

### 3 — PDP

```
Frames: 2044:2602 (desktop), 16:6217 (mobile) plus selected/low-stock/OOS and modals.
Apply docs/reference/design-i/pdp.md exactly: 800px gallery with 800x1432 hero and two 2-up
400x535.71 rows; 592px buy column with 80px padding, 432px content, 40px gap; 12/600 title, 14/600
price, 16px swatch, 44px size chips, 432x40 4px-radius CTA, accordions; 4-up 360x515 recommendations.
Port the try-on studio (multi-image upload, hero + 2-up, reorder/promote, reset, mobile swipe
carousel, body-scroll lock) from /Users/nachiket/UniPlus/tryon-product-page as client components
using blob: URLs only. Keep Shopify useProductForm, cart handlers and metadata. Add the slide-over
add confirmation. Omit waitlist, size recommendation, live low stock and the demo stock bar; record
them in STUBS.md if touched. Verify 1440 and 390 with real catalogue data.
```

### 4 — Cart

```
Frames: 2068:8220 (desktop), 22:8538 (mobile) plus updating/OOS/empty.
Rebuild the cart as a full page: 800px lines + 592px summary desktop; 342px lines + summary mobile;
123x191 line art; 12/600 title; quantity stepper from foundation; 431x40 black Checkout; promo
disclosure; help; 4-up / 2-up recommendations. Add the fixed mobile TOTAL + Checkout bar with
safe-area padding, the empty state, the out-of-stock line treatment and the optimistic updating
state. Make the header Bag navigate to /cart and replace the add-to-bag drawer with the PDP slide-
over confirmation. Keep all writes through /api/cart and checkout through prepareCheckoutAction.
No storefront arithmetic.
```

### 5 — Auth

```
Frames: desktop 1:3745, 30:11706, 1:3844, 30:12263, 30:12449, 30:12525, 30:11917, 30:12098,
1:3777, 30:12637; mobile 30:11557, 30:11731, 30:11826, 30:12305, 30:12489, 30:12565, 30:12601,
30:12695, 30:11959, 30:12220.
Build the identity gate at the unauthenticated entry: 592px form + 848px image desktop, 341px form
mobile, 60px brand bar, 431x40 fields and Proceed, guest continuation, Google affordance, help,
email validation. Present the OTP/password/new-user states only as far as Shopify actually supports
them: the session is created by the Hydrogen /account/login handler, so the form must hand off
rather than fake a code. The exact in-storefront OTP screens are gated by D2; do not implement a
custom identity service. Restyle sign-in-failed and point the header Account entry at the gate.
```

### 6 — Checkout

```
Frames: desktop 39:12982, 39:13055, 39:13165, 51:14764, 45:13446, 45:13852, 45:14049, 46:14396;
mobile 37:12867, 39:13019, 39:13113, 39:13223, 51:14868, 45:13896, 45:14134, 46:14500.
Build the pre-checkout Address and Shipping step in (checkout): 60px brand bar; 800px left column
(choose saved address or guest form, delivery block, gift checkbox, items accordion); 592px summary
(items, gift, promo, subtotal/delivery/total, Proceed to Payment). Read the Hydrogen cart and
Customer Account addresses; use the plain-India form with +91. Show pincode serviceability only as
far as lib/serviceability is verified — today that means absent. Gift and promo write through cart
attributes / discount codes; no storefront arithmetic. Proceed calls prepareCheckoutAction and
leaves for Shopify checkout. Do not build payment entry. Record the address re-entry limitation and
the credits gap; both are gated (D3).
```

## 5. Launch checklist

- [ ] Foundation merged; `pnpm lint`, `typecheck`, `build`, `test:design` green.
- [ ] Surface branches rebased; each PR names its frames and its gated states.
- [ ] Desktop 1440 and mobile 390 checked against the frames.
- [ ] Real Shopify catalogue, cart and account data; no mocked commerce facts.
- [ ] Checkout reaches a real Shopify checkout URL (store password cleared per G5).
- [ ] `docs/STUBS.md` updated for any new unavailable state.
- [ ] Decisions D1–D6 recorded in the journey document; auth/checkout scopes signed off.
- [ ] No workstream added a test file, runner, dependency or second styling system.
