# Trial Run Plan — Shopify Storefront Frontend

**Status:** planning
**Scope:** local trial only
**Date:** 2026-11-04

---

## 1. Decision

Build a **Next.js 16 App Router** storefront with **Hydrogen 2026-10** (`@shopify/hydrogen`), starting from the **Vercel Shop** template.

| Choice | Decision | Reason |
| --- | --- | --- |
| Framework | Next.js 16.4 App Router | You asked for Next.js; App Router is what the current template uses |
| Shopify toolkit | `@shopify/hydrogen` 2026.10.x | Framework-agnostic since Oct 14, 2026. Typed Storefront API client + cart handlers |
| Starter | [vercel/shop](https://github.com/vercel/shop) | Working PLP/PDP/search/cart/checkout wiring on day one |
| Hosting (trial) | Local only | No need for Vercel Pro or Oxygen to validate the integration |
| Hosting (later) | Vercel | Next.js is first-class there; Oxygen is for the React Router template |

### Why not Oxygen

Oxygen is free and fine, but it is a Web Worker runtime and the natural home of the **React Router** Hydrogen template. Putting a conventional Next.js app there means fighting the runtime to save $0–20/month. Not worth it, even less so for a trial.

### Package naming (important)

- Use `@shopify/hydrogen` and `@shopify/hydrogen/react`.
- Do **not** follow older tutorials that use `@shopify/hydrogen-react` — that is the legacy React Router-era package.

---

## 2. Trial scope

### In scope

- Local Next.js app running on `localhost:3000`
- Storefront API reads: products, collections, product detail, search
- Variant/size selection with live price + availability
- Cart: create, add, update quantity, remove, persist across refresh
- Checkout handoff via `cart.checkoutUrl`
- Basic responsive styling (template defaults are fine for the trial)

### Explicitly out of scope (for now)

- Staging/production environment split
- Custom domains, Vercel Pro, Oxygen
- Shiprocket / shipping integration
- Payment gateway configuration, COD
- Customer accounts / login
- GA4, GTM, Merchant Center, Sentry
- Webhooks and cache invalidation
- SEO work beyond template defaults
- The Eve shopping agent (leave disabled)

The full production plan stays valid — this trial only proves the commerce loop.

---

## 3. Definition of done

The trial is successful when all of these are true:

1. `pnpm dev` starts without errors.
2. Home page renders products from **your** store, not demo data.
3. A collection page lists those products.
4. A product page shows images, price, and variants.
5. Selecting a size/variant updates price and availability.
6. "Add to cart" creates a real Shopify cart and survives a page refresh.
7. Cart shows line items, quantities, and totals.
8. Checkout button opens the Shopify-hosted checkout URL for that cart.
9. No token or secret is committed to git.

Checkout **completion** is not required — trial stores may not process payments. Reaching a valid `checkoutUrl` with the right line items is the goal.

---

## 4. Architecture

```
Browser
  │
  ├─ page requests ──────────────► Next.js server (App Router / RSC)
  │                                    │
  │                                    ├─ Hydrogen Storefront client (typed gql)
  │                                    │        │
  │                                    │        ▼
  │                                    │  Shopify Storefront GraphQL API
  │                                    │  (products, collections, cart)
  │                                    │
  │                                    └─ Hydrogen request handlers
  │                                             /api/cart  /checkout
  │
  └─ checkout ───────────────────► cart.checkoutUrl
                                       │
                                       ▼
                              Shopify-hosted checkout
```

No separate backend. No database. Shopify is the source of truth for catalog, cart, and checkout.

---

## 5. Phases

### Phase 0 — Prerequisites (you + me, ~20 min)

- [ ] Install Node 26 (template `engines.node` is `26`)
- [ ] Enable pnpm 12.16.1 via corepack
- [ ] Confirm Shopify admin access

### Phase 1 — Shopify configuration (you, ~20 min)

- [ ] Create the Headless sales channel + storefront
- [ ] Create/copy the public Storefront API token
- [ ] Grant the required scopes
- [ ] Add 3–5 products and publish them to the Headless channel
- [ ] Collect store domain + shop ID

Detailed steps in section 6.

### Phase 2 — Scaffold (me, ~30 min)

- [ ] Scaffold Vercel Shop template into this repo
- [ ] `cp .env.example .env.local`
- [ ] You paste the three values into `.env.local`
- [ ] `pnpm dev` and verify the home page hits your catalog

### Phase 3 — Storefront pages (me, ~2–4 h)

- [ ] Replace template branding/content with a neutral trial design
- [ ] Verify PLP, PDP, search, and collection filtering against real data
- [ ] Confirm variant selection reflects real availability

### Phase 4 — Cart and checkout (me, ~2–3 h)

- [ ] Add to cart from PDP
- [ ] Quantity update / remove
- [ ] Cart persistence across reload
- [ ] Checkout redirect with correct line items
- [ ] Handle empty cart and out-of-stock variants

### Phase 5 — Verification and handoff (me, ~1–2 h)

- [ ] Run the definition-of-done checklist
- [ ] Write a short `README` with run instructions
- [ ] Confirm `.env.local` is ignored
- [ ] Summarize what changes for staging/production later

**Estimate:** roughly one focused day for a working trial.

---

## 6. What I need from you

### 6.1 The three values

| Value | Env var | Where to find it | Secret? |
| --- | --- | --- | --- |
| Store domain | `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `Settings → General → Store details` → `your-store.myshopify.com` | No |
| Public Storefront API token | `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `Settings → Apps and sales channels → Headless` → your storefront → **Storefront API permissions** | Treat as sensitive |
| Shop ID | `NEXT_PUBLIC_SHOPIFY_SHOP_ID` | `Settings → General` (store ID) or the number in `https://shopify.com/<shop-id>/account` | No |

That is the entire auth surface for the trial. **No** OAuth app, **no** Admin API token, **no** webhook secret, **no** Customer Account credentials.

### 6.2 Create the development store (Partners)

Use a development store under the new Partners account for the trial:

1. Partners Dashboard → **Stores** → **Add store** → **Create development store**
2. Choose **Create a store to test and build** (not "transfer to a client")
3. Pick a store name and handle; the handle becomes `<handle>.myshopify.com`
4. Open the new store's admin

Development-store limits that matter here:

- Free, and fine for the trial.
- Cannot process real payments — checkout reaches Shopify but cannot complete a live purchase.
- Password-protected by default; disable the password for the trial if the storefront preview asks for it.
- Cannot be converted into, or transferred as, the brand's production store. The real store must be merchant-owned.

No credentials are stored in this repo. `.env.local` does not exist yet; only `.env.example` with placeholders.

### 6.3 Shopify admin steps

1. **Add the Headless channel**
   `Settings → Apps and sales channels → Headless → Create storefront`
   (If Headless is not listed, add it from the sales channel list first.)

2. **Grant scopes**
   Open the storefront → **Storefront API permissions** → **Edit** → enable:

   Required:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_selling_plans`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_content`

   Optional (enable only if we query them):
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_metaobjects`

3. **Copy the token**
   The Headless storefront page shows the public Storefront API access token. Copy it into `.env.local` yourself.

4. **Create products**
   Add 3–5 products with:
   - 2+ variants (e.g. sizes S/M/L)
   - at least one image each
   - inventory set
   - one product deliberately out of stock
   - one product with a compare-at price

5. **Publish to Headless** (the most common failure)
   For each product: `Product → Publishing → Manage sales channels → Headless`.
   Products not published to the Headless channel **do not appear in the Storefront API**. Empty responses are almost always this.

6. **Optional but useful**
   - One collection (e.g. "Trial Collection")
   - One discount code
   - A shipping zone so checkout shows a rate

### 6.4 How to hand over secrets safely

- Do **not** paste the token into chat.
- I will create `.env.example`; you copy it to `.env.local` and fill it in locally.
- `.env.local` stays git-ignored.
- The public Storefront token is designed for client-side use and is scoped to published catalog + cart, but it should still not be committed.

---

## 7. Environment variables

From the template's `.env.example`:

```bash
# Required
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="your-storefront-access-token"
NEXT_PUBLIC_SHOPIFY_SHOP_ID="123456789"

# Optional — not needed for the trial
# SHOPIFY_API_VERSION="2026-10"
# SHOPIFY_WEBHOOK_SECRET="..."
# REVALIDATE_SECRET="..."
# CUSTOMER_ACCOUNT_SESSION_SECRET="..."
# SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID="..."
# SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET="..."
```

`SHOPIFY_API_VERSION` defaults to the version Hydrogen targets, which is `2026-10`.

---

## 8. Gotchas

1. **Products must be published to the Headless channel.** Otherwise the API returns `null` / empty edges. Check this before debugging code.
2. **Use the public Storefront token, not the Admin API token.** The template sends `X-Shopify-Storefront-Access-Token`. An Admin token will not work and is far more dangerous to leak.
3. **Trial store checkout may not complete.** That is expected. A valid `checkoutUrl` is the acceptance criterion.
4. **Node 26 is required.** This machine has Node 22.22.2 and no pnpm. Fix before scaffolding or the install/build will fail.
5. **Password-protected storefronts still work with the Storefront API**, but the checkout/preview UI may ask for the storefront password. Disable it for the trial if convenient.
6. **Don't build a backend or DB.** Shopify owns catalog, cart, and checkout. Adding a database now creates sync problems for no benefit.
7. **Storefront API is included with the Shopify plan.** The trial does not need Vercel Pro. Deploy to a Vercel preview only if you want a shareable URL.
8. **Template extras are opt-in.** Customer accounts and the Eve agent are disabled by default — leave them off for the trial.

---

## 9. Two ways to scaffold

| | A. Vercel Shop template | B. Minimal Hydrogen setup |
| --- | --- | --- |
| Time to working storefront | ~1 hour | ~1 day |
| Code you must understand | More (agent, analytics, shadcn) | Less (3–5 files) |
| Commerce wiring | Already done | Built by us |
| Best for | Validating the store + shipping a trial fast | Learning the Storefront API deeply |

**Recommendation: A.** Use the template to prove the commerce loop, then strip the parts we don't need. If the goal is specifically to learn the API, B is cleaner.

---

## 10. Changes vs the full production plan

The production plan is sound. For the trial, defer these:

- Staging/production Shopify stores and Vercel custom environments
- Shiprocket abstraction and mocks
- Payment gateway selection and test payments
- GA4 staging/production separation
- SEO, Merchant Center, structured data
- `llms.txt` and AI-crawler tuning

Revisit them once the trial loop works. Nothing in this trial blocks that architecture later.
