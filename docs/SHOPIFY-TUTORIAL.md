# Shopify tutorial: merchant fundamentals and the developer path

A practical tutorial for learning Shopify from both sides: the merchant admin that runs the store,
and the APIs and tools that a headless storefront uses. It uses the High-Fashion Shopify Template's
Lorem Ipsum store as the worked example, so every concept has a concrete counterpart in the running
app.

- If you are merchandising, read Part 1 and the labs.
- If you are building, read Part 0, Part 2 and the labs.
- For how this repository maps Shopify, Hydrogen, Next.js and Vercel, read
  [`SHOPIFY-WALKTHROUGH.md`](./SHOPIFY-WALKTHROUGH.md). This tutorial teaches Shopify itself; the
  walkthrough explains where each piece lives here.

The Shopify docs are the source of truth. Every link in Part 5 was reachable when this was written
on 5 November 2026; if a page moves, search the title on `shopify.dev` or `help.shopify.com`.

## 0. How to use this tutorial

| Track                           | Start here          | Goal                                                               |
| ------------------------------- | ------------------- | ------------------------------------------------------------------ |
| Merchant / operator             | Part 1              | Create products, collections, inventory, discounts and test orders |
| Frontend developer              | Part 0, then Part 2 | Read the catalog, build a cart, send shoppers to checkout          |
| Backend / integration developer | Part 2.2–2.7        | Authenticate, write products, receive webhooks                     |
| Full-stack / this repo          | Part 3              | Run the labs against the local storefront                          |

Two habits make Shopify much easier:

1. **Separate the record from the surface.** Shopify stores the fact; the admin, theme, headless
   storefront, POS and APIs are different ways to read or change it.
2. **Separate the product from its publication.** A product can be `ACTIVE` and still invisible to a
   storefront because it is not published to that sales channel.

## 1. The mental model

Shopify is a commerce database with several front doors.

```
                       ┌──────────────────────────────┐
                       │        Shopify core          │
                       │ products, variants, prices,  │
                       │ inventory, collections,      │
                       │ carts, customers, orders     │
                       └──────────────┬───────────────┘
                                      │
       ┌──────────────────┬───────────┼────────────┬──────────────────┐
       │                  │           │            │                  │
  Shopify admin     Online Store   Headless     POS / apps       APIs
  (merchant UI)     (theme)        storefront   (channels)       (Admin,
                                   (this repo)                   Storefront,
                                                                 Customer)
```

The five objects to learn first:

| Object      | What it is                                     | Why it matters                                         |
| ----------- | ---------------------------------------------- | ------------------------------------------------------ |
| Product     | The thing you sell, with shared copy and media | Holds title, description, vendor, type, tags, status   |
| Variant     | One purchasable combination, such as Brown / M | Holds price, SKU, barcode, inventory and weight        |
| Collection  | A group of products, manual or rule-based      | Powers category pages and merchandising                |
| Publication | A sales channel a product is published to      | Controls which surface can see the product             |
| Cart        | A Shopify-owned basket tied to a cart ID       | The only place cart totals and checkout URLs come from |

Vocabulary that Shopify uses differently from generic e-commerce:

- **Handle** — the URL slug, such as `alma-lace-corset-top`. It is stable and readable; the numeric
  ID is what APIs use internally.
- **GID** — a global ID such as `gid://shopify/Product/123`. GraphQL returns and accepts these.
- **Sales channel** — a surface that sells, such as Online Store, Shop, POS or a Headless storefront.
- **Publication** — the join between a resource and a sales channel. Publishing is a separate step
  from creating.
- **Market** — a country/region configuration with its own currency, domain, language and pricing.
- **Metafield** — custom data attached to a resource, addressed by namespace and key.
- **Theme** — a Liquid storefront hosted by Shopify. This repo is not a theme.

## Part 1 — Merchant fundamentals

### 1.1 Products, options and variants

A product is the parent. A variant is one exact combination of its options. Shopify allows up to
**three options** and **2,048 variants per product** (the variant limit rose from 100 on
15 October 2025).

| Field                                                    | Lives on           | Notes                                                      |
| -------------------------------------------------------- | ------------------ | ---------------------------------------------------------- |
| Title, description, vendor, product type, tags, category | Product            | Shared across every variant                                |
| Media                                                    | Product            | Images, video, 3D; variant images are assigned per variant |
| Status                                                   | Product            | `ACTIVE`, `DRAFT` or `ARCHIVED`                            |
| Options                                                  | Product            | Up to three, such as Colour and Size                       |
| Price, compare-at price, cost per item                   | Variant            | Per variant, in the store or market currency               |
| SKU, barcode                                             | Variant            | Your identifiers, not Shopify's                            |
| Inventory                                                | Variant + location | Tracked/untracked, quantity, policy                        |
| Weight, dimensions                                       | Variant            | Used for shipping rates                                    |
| SEO title and description                                | Product            | Falls back to the product title and description            |
| Publication                                              | Product or variant | Which channels can see it                                  |

**Worked example.** `Alma Lace Corset Top` has two options:

- Colour: Brown, Burnt Orange, Black (3)
- Size: XS, S, M, L, XL, XXL (6)

That is 3 × 6 = **18 variants**, each with its own SKU and price ($185 in this store). In the API,
the product holds the options and the variants hold the purchasable facts.

**Status is not visibility.** `ACTIVE` means the product is not a draft or archived; it still needs
to be published to the Headless channel before the Storefront API returns it.

### 1.2 Collections

There are two kinds:

- **Manual** — you add products by hand. Good for edits, capsules and collaborations.
- **Automated** — a rule set, such as “product type equals Corsets” or “tag contains new-in”.
  Products enter and leave automatically.

A collection has its own handle, title, description, image, SEO fields and sort order. It is also
published to sales channels separately from its products.

**Worked example.** `corsets` is a manual collection with six products; `new-in` is a manual
collection with all ten seeded products. The storefront reads them through the Storefront API and
renders the same grid for both.

**Sort order matters.** The default collection sort can be manual, best-selling, price, or
alphabetical. The app also exposes user-selected sort values; those go back to Shopify rather than
being sorted in React.

### 1.3 Inventory

Inventory is tracked per variant per location.

| Setting                  | Effect                                            |
| ------------------------ | ------------------------------------------------- |
| Tracked                  | Shopify counts quantity and stops sales at zero   |
| Untracked                | Shopify never counts; the variant stays available |
| Deny when out of stock   | The variant becomes unavailable at zero           |
| Continue selling at zero | The variant stays purchasable and can go negative |

Locations are warehouses, retail stores or fulfilment services. A variant can have different
quantities at each. The storefront only needs the resulting `availableForSale`; it should never
invent availability from a number it read elsewhere.

### 1.4 Orders and fulfilment

An order is created at checkout. It moves through payment, fulfilment and delivery, and can be
cancelled, refunded or returned.

Useful admin concepts:

- **Draft order** — an order you build manually, for invoices or wholesale.
- **Abandoned checkout** — a checkout that started but did not complete.
- **Fulfilment order** — the work item that tells a location what to pick and ship.
- **Return** — the reverse flow, with its own states and refunds.

The storefront never creates orders directly. It creates a cart and sends the shopper to Shopify
Checkout; Shopify creates the order.

### 1.5 Checkout and payments

Checkout is Shopify-hosted. This is deliberate: payment, tax, shipping, fraud and compliance are
Shopify's responsibility, and the storefront only needs the checkout URL.

For development stores:

1. Settings → **Payments** → **See all other providers** (or the test-provider link).
2. Activate **(for testing) Bogus Gateway** or Shopify Payments **test mode**.
3. At checkout, use the test values:
   - Name on card: `Bogus Gateway` or `Test payment gateway`
   - Card number: `1` for approved, `2` for declined, `3` for a gateway failure
   - Expiry: any future date
   - CVV: any three digits
4. After testing, disable the test provider so real payments are not blocked.

Bogus Gateway is for test orders only. It does not support subscriptions or POS card readers.

### 1.6 Discounts, markets, taxes and shipping

- **Discounts** — amount off, percentage off, buy X get Y, free shipping; limited by eligibility
  rules, usage limits and combinations. The cart returns the discounted totals.
- **Markets** — country/region groups with their own currency, language, domain and pricing. The
  Storefront API uses `@inContext(country, language)` to return the right prices and availability.
- **Taxes** — configured per region and product; Shopify calculates them at checkout.
- **Shipping** — rates come from zones, weight, price or carrier services; the cart and checkout
  return the result.

The rule for a headless storefront: never hardcode currency, tax or shipping. Ask Shopify with the
right context and render what comes back.

### 1.7 Apps, sales channels and publications

Apps extend the admin or the storefront; sales channels are surfaces that sell. The **Headless**
channel is the one a custom storefront reads. A product must be published to that channel, not just
created, before the Storefront API returns it.

The practical checklist for “my product is missing”:

1. Is the product `ACTIVE`?
2. Is it published to the Headless channel?
3. Is the collection published to the Headless channel?
4. Is the storefront reading a cached page whose tag has not been invalidated?
5. Is the token the right store and sales channel?

### 1.8 Theme or headless?

|             | Theme (Liquid)                         | Headless (this repo)                             |
| ----------- | -------------------------------------- | ------------------------------------------------ |
| Rendering   | Shopify hosts and renders              | Your app renders                                 |
| Language    | Liquid                                 | React / Next.js                                  |
| Data access | Liquid objects, Storefront API         | Storefront API, Customer Account API             |
| Checkout    | Shopify-hosted                         | Shopify-hosted                                   |
| Caching     | Shopify CDN and theme settings         | Your framework, here Next.js                     |
| Best for    | Fastest launch, Shopify-native editing | Custom UX, multiple surfaces, app-like frontends |

Neither is “better”. A theme is less code; headless is more control and more responsibility.

## Part 2 — Developer fundamentals

### 2.1 The API map

| API                  | Direction                              | Used for                                                                     | Auth                        |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| GraphQL Admin API    | Read/write store management            | Products, variants, collections, orders, inventory, publications, metafields | Admin access token (secret) |
| Storefront API       | Read catalog, write cart               | Products, collections, search, cart, checkout URL, policies, pages           | Public Storefront token     |
| Customer Account API | Read/write a signed-in customer's data | Profile, addresses, orders                                                   | Customer OAuth token        |
| Web Pixels API       | Browser events                         | Analytics and marketing pixels                                               | App-specific                |
| Shopify Functions    | Server-side checkout logic             | Discounts, delivery, payment customisation                                   | App deployment              |
| Storefront MCP       | Agent access to a store                | Catalog search, cart, policies for AI agents                                 | Store-scoped endpoint       |

The Admin API is the only one that can create products. The Storefront API is the one a shopper-facing
app uses at request time. The Customer Account API is separate again; a Storefront token cannot read
customer orders.

### 2.2 Authentication and scopes

Legacy custom apps created in the Shopify admin are closed to new merchants. The current path is a
**Dev Dashboard app**:

1. Create the app, create a version with scopes, release it, install it on the store.
2. Copy the **Client ID** and **Client secret** from Settings → Credentials.
3. Exchange them for a 24-hour Admin API token with the client credentials grant:

```bash
curl -X POST "https://{shop}.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=$SHOPIFY_CLIENT_ID" \
  --data-urlencode "client_secret=$SHOPIFY_CLIENT_SECRET"
```

The response contains `access_token`, `scope` and `expires_in` (86,399 seconds). Send it as
`X-Shopify-Access-Token`. The storefront's public token is different: it is designed to be shipped
to the browser and is sent as `X-Shopify-Storefront-Access-Token`.

Scope rules:

- Request the minimum. A write scope includes its read counterpart.
- Products, variants and collections share `read_products` / `write_products`.
- Publications need `read_publications` / `write_publications`.
- Files and product media need `read_files` / `write_files`.
- Customer data needs protected-customer-data approval; do not request it for a catalog job.
- A leaked Admin token can edit orders, customers and themes. Treat it as a password.

This repository's seeder uses `write_products`, `write_publications` and `write_files`, stored only
in `.env.local` and exchanged at run time. See
[`SHOPIFY-WALKTHROUGH.md` §12](./SHOPIFY-WALKTHROUGH.md#12-dev-dashboard-runbook-current-shopify-app-flow).

### 2.3 GraphQL essentials

Both the Admin and Storefront APIs are GraphQL. The patterns are the same:

- A **query** reads; a **mutation** writes.
- Connections use `edges { node { ... } }` and `pageInfo { hasNextPage endCursor }`.
- IDs are GIDs, not integers.
- Responses can contain both `data` and `errors`; handle partial errors.
- Cost-based throttling is reported under `extensions.cost`. Watch it on bulk jobs.

Admin endpoint:

```
POST https://{shop}.myshopify.com/admin/api/2026-10/graphql.json
X-Shopify-Access-Token: {admin token}
```

Storefront endpoint:

```
POST https://{shop}.myshopify.com/api/2026-10/graphql.json
X-Shopify-Storefront-Access-Token: {public token}
```

### 2.4 The product model in the Admin API

The objects mirror the admin:

| Object           | Key fields                                                                        |
| ---------------- | --------------------------------------------------------------------------------- |
| `Product`        | `id`, `handle`, `title`, `status`, `options`, `variants`, `media`, `publications` |
| `ProductOption`  | `name`, `optionValues`                                                            |
| `ProductVariant` | `id`, `title`, `price`, `sku`, `barcode`, `inventoryItem`, `selectedOptions`      |
| `Collection`     | `id`, `handle`, `title`, `ruleSet`, `products`, `publications`                    |
| `Publication`    | `id`, `name`, `autoPublish`                                                       |

Creating a full product is easiest with `productSet`, which can create or replace the options,
variants, media and metafields in one operation. A minimal shape:

```graphql
mutation ProductSet($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}
```

The input carries `title`, `handle`, `status`, `productOptions`, `variants` (each with
`optionValues`, `price`, `inventoryItem` and `inventoryPolicy`) and `files` for media. If you are
editing an existing product, `productSet` replaces the variant set; for additive edits use
`productVariantsBulkCreate` / `productVariantsBulkUpdate`.

Publishing is a separate mutation:

```graphql
mutation Publish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    userErrors {
      field
      message
    }
  }
}
```

Find the publication with the `publications` query. In this store it is called
**Dummy Store Headless**.

Collections follow the same pattern: `collectionCreate` (with `ruleSet` for automated collections),
`collectionAddProducts`, then `publishablePublish`.

### 2.5 The Storefront API

The Storefront API is what a shopper-facing app reads at request time. A product query:

```graphql
query Product($handle: String!) {
  product(handle: $handle) {
    id
    title
    handle
    descriptionHtml
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
}
```

Cart writes are mutations: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`,
`cartDiscountCodesUpdate` and `cartBuyerIdentityUpdate`. The response includes `checkoutUrl`; send
the shopper there. Never build a checkout yourself.

Search uses `search` (products, collections, pages) or predictive search. Availability and prices
follow the `@inContext(country, language)` directive, so pass the market context rather than
formatting money in the client.

### 2.6 The Customer Account API

This is a separate, customer-scoped API. It needs OAuth, a session and a customer access token.
Use it for profile, addresses and order history; do not use the Admin API to read a shopper's
orders. In this repo it lives behind `lib/shopify/customer-account/` and `lib/auth/`, and is
enabled by default through `shopConfig.auth.isEnabled`.

### 2.7 Webhooks and cache invalidation

Shopify can call your app when something changes. A webhook request carries:

- `X-Shopify-Topic`, such as `products/update`
- `X-Shopify-Shop-Domain`
- `X-Shopify-Hmac-Sha256`

Verify the HMAC with your webhook secret before trusting the body. Then invalidate only the affected
cache tags. In this repo, `app/api/webhooks/shopify/route.ts` maps product and collection topics to
`revalidateTag` calls. Pages, policies and menus send no webhook, so `POST /api/revalidate` handles
them with a bearer secret.

Useful topics: `products/create`, `products/update`, `products/delete`, `collections/create`,
`collections/update`, `collections/delete`, `inventory_levels/update`, `orders/create`,
`orders/fulfilled`, `carts/update`.

### 2.8 Hydrogen and headless

Hydrogen is Shopify's storefront SDK. It is two things depending on how you use it:

- **The SDK** — clients, handlers, types and React bindings. This repo uses this part.
- **The framework** — React Router routes, loaders, actions and Oxygen deployment. This repo does
  not use this part.

In this repo, Hydrogen provides:

- `createStorefrontClient` and `createShopifyRequestContext` for locale-aware Storefront calls.
- `createCartServerHandlers` for `/api/cart`.
- `createCustomerAccountServerHandlers` for account OAuth.
- `useProductForm` and `useCartForm` for optimistic cart/product state.
- `gql()` and `ResultOf` for typed documents.

Next.js owns routing, rendering, caching and metadata; Hydrogen owns the Shopify protocol. For the
full boundary map, read [`SHOPIFY-WALKTHROUGH.md`](./SHOPIFY-WALKTHROUGH.md).

### 2.9 Shopify CLI

The CLI is the fastest way to scaffold and run an app or theme locally:

```bash
shopify app init          # scaffold an app
shopify app dev           # run it with a tunnel and a dev store
shopify app deploy        # deploy extensions and config
shopify app config link   # link this directory to an existing app
shopify theme dev         # preview a Liquid theme
shopify theme push        # upload a theme
```

For this repository the app is already scaffolded; the Admin API script is plain Node and does not
need the CLI.

### 2.10 Deployment

Headless means two deployments to think about:

1. **The storefront** — build and host the Next.js app; set the public storefront token and any
   server secrets in the host's environment.
2. **The Shopify app** — only needed if you have OAuth, webhooks or extensions. Release a version,
   install it, and point webhooks at the deployed URL.

Never run a catalog seeder during a build or deploy. It is an operator action with a secret.

## Part 3 — Labs

These labs use this repository and its `Dummy Store`. Run them in order; each one builds on the
previous.

### Lab 1 — Create a product in the admin

1. Shopify admin → **Products** → **Add product**.
2. Title `Test Silk Scarf`, handle `test-silk-scarf`.
3. Add one option `Colour` with `Ivory`, and one option `Size` with `One Size`.
4. Set the variant price to `$45`, SKU `TEST-SCARF-IVORY`.
5. Add an image, set status **Active**, and save.
6. In the product's **Sales channels** section, publish to **Dummy Store Headless**.
7. Visit `http://localhost:3000/products/test-silk-scarf`.

If it 404s, recheck the publication and wait for the product cache tag to expire or send a
`products/create` webhook.

### Lab 2 — Query the Storefront API

```bash
curl -s "https://$NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN/api/2026-10/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: $NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN" \
  -d '{"query":"{ products(first: 5) { nodes { title handle } } }"}'
```

Then inspect a product and its variants in the same way. Notice that unpublished products never
appear, even if they exist in the admin.

### Lab 3 — Seed a catalog through the Admin API

This repository already ran the equivalent of:

```bash
DRY_RUN=1 corepack pnpm import:catalog
corepack pnpm import:catalog
UNPUBLISH_OTHERS=1 corepack pnpm import:catalog
```

Results:

- 95 products, 41 collections, 880 variants and 709 images imported from the published reference catalog.
- 7 stale demo products and 2 non-catalog collections unpublished from the Headless channel.
- 0 records deleted; everything remains in the admin.

The importer is idempotent: it upserts by handle and can skip products whose counts already match.
Read it at `scripts/import-live-catalog.mjs`. The older `pnpm seed:catalog` still seeds the original
12-product, 23-collection design study and is not the current catalog source.

### Lab 4 — Add to cart and reach checkout

1. Open `http://localhost:3000/products/alma-lace-corset-top`.
2. Choose a colour and size.
3. Select **Add to cart**. The drawer shows the line and the subtotal.
4. Open `/cart`, then select **Checkout**.
5. You are redirected to Shopify Checkout with the cart.

If you want to complete a test order, activate the Bogus Gateway in Settings → Payments and use
card `1`, any future expiry and any three-digit CVV.

### Lab 5 — Change a price and watch the storefront

1. In the admin, change `Alma Lace Corset Top` from `$185` to `$190`.
2. Reload the PDP. If the cached page still shows `$185`, the product tag has not been invalidated.
3. In production, the `products/update` webhook clears it. In development, restart the dev server or
   wait for the cache lifetime.

This is the clearest demonstration that the page is a view of Shopify, not a copy.

### Lab 6 — Webhooks and revalidation

1. Expose the app with a tunnel or deploy a preview.
2. Create a webhook in the admin or via the Admin API for `products/update` pointing at
   `/api/webhooks/shopify`.
3. Set `SHOPIFY_WEBHOOK_SECRET` to the signing secret.
4. Change a product and watch the route log a tag invalidation.

The route verifies the HMAC before parsing the body. Never skip that check.

### Lab 7 — Add a metafield

1. In the admin, open a product → **Metafields** → add `custom.care_notes` as a multi-line text.
2. Expose it to the Storefront API (storefront access is a per-metafield setting).
3. Query it:

```graphql
query ProductCare($handle: String!) {
  product(handle: $handle) {
    metafield(namespace: "custom", key: "care_notes") {
      value
      type
    }
  }
}
```

Metafields are the right place for size charts, fabric notes and care instructions that do not
belong in the description. Keep them in a namespace you own, such as `custom`.

## Part 4 — Curated resources

### Merchant / product side

| Topic                       | Link                                                               |
| --------------------------- | ------------------------------------------------------------------ |
| Shopify manual (start here) | <https://help.shopify.com/en/manual>                               |
| Products                    | <https://help.shopify.com/en/manual/products>                      |
| Variants and options        | <https://help.shopify.com/en/manual/products/variants>             |
| Collections                 | <https://help.shopify.com/en/manual/products/collections>          |
| Import and export products  | <https://help.shopify.com/en/manual/products/import-export>        |
| Inventory                   | <https://help.shopify.com/en/manual/inventory>                     |
| Orders                      | <https://help.shopify.com/en/manual/orders>                        |
| Fulfilment                  | <https://help.shopify.com/en/manual/fulfillment>                   |
| Checkout settings           | <https://help.shopify.com/en/manual/checkout-settings>             |
| Test orders                 | <https://help.shopify.com/en/manual/checkout-settings/test-orders> |
| Discounts                   | <https://help.shopify.com/en/manual/discounts>                     |
| Markets                     | <https://help.shopify.com/en/manual/markets>                       |
| Themes                      | <https://help.shopify.com/en/manual/online-store/themes>           |
| Apps                        | <https://help.shopify.com/en/manual/apps>                          |

### Developer side

| Topic                               | Link                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Developer docs home                 | <https://shopify.dev/docs>                                                                            |
| GraphQL Admin API                   | <https://shopify.dev/docs/api/admin-graphql>                                                          |
| Storefront API                      | <https://shopify.dev/docs/api/storefront>                                                             |
| Customer Account API                | <https://shopify.dev/docs/api/customer>                                                               |
| Access scopes                       | <https://shopify.dev/docs/api/usage/access-scopes>                                                    |
| Authentication and tokens           | <https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens>                      |
| Client credentials grant            | <https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant>           |
| Dev Dashboard apps                  | <https://shopify.dev/docs/apps/build/dev-dashboard>                                                   |
| Get API access tokens               | <https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens>                             |
| Headless storefronts                | <https://shopify.dev/docs/storefronts/headless>                                                       |
| Hydrogen                            | <https://shopify.dev/docs/storefronts/headless/hydrogen>                                              |
| Storefront product/collection guide | <https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections> |
| Storefront cart guide               | <https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage>          |
| Product model and product data      | <https://shopify.dev/docs/apps/build/product-merchandising/products-and-collections>                  |
| Add product data                    | <https://shopify.dev/docs/apps/build/product-merchandising/products-and-collections/add-data>         |
| Webhooks                            | <https://shopify.dev/docs/apps/build/webhooks>                                                        |
| Shopify Functions                   | <https://shopify.dev/docs/apps/build/functions>                                                       |
| Checkout extensibility              | <https://shopify.dev/docs/apps/build/checkout>                                                        |
| Themes and Liquid                   | <https://shopify.dev/docs/storefronts/themes>                                                         |
| Shopify CLI                         | <https://shopify.dev/docs/api/shopify-cli>                                                            |
| `productSet`                        | <https://shopify.dev/docs/api/admin-graphql/latest/mutations/productSet>                              |
| `publishablePublish`                | <https://shopify.dev/docs/api/admin-graphql/latest/mutations/publishablePublish>                      |
| `cartCreate`                        | <https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate>                                 |
| `cartLinesAdd`                      | <https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesAdd>                               |

### Learning, news and community

| Resource                               | What it is                                                   |
| -------------------------------------- | ------------------------------------------------------------ |
| <https://shopify.dev/changelog>        | API and platform changes; read before upgrading a version    |
| <https://community.shopify.dev/>       | Developer forum for API and app questions                    |
| <https://shopify.engineering/>         | Engineering deep dives                                       |
| <https://www.shopify.com/editions>     | Shopify's twice-yearly product releases                      |
| <https://www.youtube.com/@ShopifyDevs> | Shopify developer videos                                     |
| <https://learnshopify.dev/>            | Independent, hands-on Liquid and app exercises (third party) |

Shopify's own course catalog has changed several times; `shopify.com/learn` now redirects to the
Shopify blog. Use the docs and changelog as the stable path, and treat third-party courses as
supplements rather than references.

## Part 5 — Cheat sheet

### Endpoints and headers

| API                | Endpoint                               | Header                                           |
| ------------------ | -------------------------------------- | ------------------------------------------------ |
| Admin GraphQL      | `/admin/api/2026-10/graphql.json`      | `X-Shopify-Access-Token`                         |
| Storefront GraphQL | `/api/2026-10/graphql.json`            | `X-Shopify-Storefront-Access-Token`              |
| Customer Account   | Use Hydrogen's customer-account client | Customer OAuth token                             |
| Webhook receiver   | Your app's route                       | `X-Shopify-Hmac-Sha256` verified with the secret |

### Common Admin API operations

| Goal                            | Operation                   |
| ------------------------------- | --------------------------- |
| Create or replace a product     | `productSet`                |
| Add variants                    | `productVariantsBulkCreate` |
| Update variants                 | `productVariantsBulkUpdate` |
| Create a collection             | `collectionCreate`          |
| Add products to a collection    | `collectionAddProducts`     |
| Publish a product or collection | `publishablePublish`        |
| Unpublish                       | `publishableUnpublish`      |
| Find publications               | `publications`              |
| Set metafields                  | `metafieldsSet`             |
| Read orders                     | `orders`                    |

### Common Storefront operations

| Goal             | Operation                              |
| ---------------- | -------------------------------------- |
| Read products    | `products` or `product(handle:)`       |
| Read collections | `collections` or `collection(handle:)` |
| Search           | `search`                               |
| Create a cart    | `cartCreate`                           |
| Add lines        | `cartLinesAdd`                         |
| Update quantity  | `cartLinesUpdate`                      |
| Remove a line    | `cartLinesRemove`                      |
| Apply a discount | `cartDiscountCodesUpdate`              |
| Get checkout URL | `cart.checkoutUrl`                     |

### Commands in this repo

```bash
corepack pnpm dev                     # local storefront
corepack pnpm import:catalog          # import the full reference catalog
corepack pnpm seed:content            # create Shopify pages, blog and articles
corepack pnpm seed:catalog            # original 12-product design study
DRY_RUN=1 corepack pnpm import:catalog # print one input, no writes
UNPUBLISH_OTHERS=1 corepack pnpm import:catalog
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

## Part 6 — Pitfalls and FAQ

**A product exists in the admin but 404s on the storefront.**
Check status, publication to the Headless channel, and cache tag. Creating is not publishing.

**A new product appears in the admin but not in a collection.**
Adding a product to a collection is a third step after creating the product and publishing it. For
automated collections, check the rule set.

**Prices are wrong or in the wrong currency.**
Do not convert in the app. Check the market, the Storefront `@inContext(country, language)`, and
the store's currency. Shopify returns the authoritative amount and currency code.

**A variant is missing.**
Shopify allows three options and 2,048 variants per product. Past that, split the product. Some
themes and older apps still assume 100 variants.

**The Admin API returns 401 or 403.**
401 means missing or expired token; 403 means the scope is not granted. Re-run the client
credentials exchange or add the scope to a new app version, release it, and reinstall/approve.

**`shop_not_permitted`.**
The app and store are not in the same Dev Dashboard organization. Use a store from the Dev
Dashboard, or switch to an OAuth authorization-code flow.

**The cart is empty after add-to-cart.**
The cart cookie is missing, blocked, or scoped to another domain. Check the `/api/cart` response and
its `Set-Cookie`. Never cache cart responses.

**A price change does not appear.**
The page is cached. In production, verify the `products/update` webhook and `revalidateTag`. In
development, restart or wait.

**Checkout will not accept a test card.**
Use the test provider's values: Bogus Gateway card `1`, or the Shopify Payments test card
`4242 4242 4242 4242`. Make sure test mode is actually active.

**`productSet` returns user errors.**
Read the array; it names the field. Common causes are duplicate handles, option values that do not
match the variants, and filename extensions that do not match the source image.

## Part 7 — Glossary

| Term                 | Meaning                                                              |
| -------------------- | -------------------------------------------------------------------- |
| Admin API            | Private GraphQL API for managing the store                           |
| Storefront API       | Public API for catalog reads and cart/checkout                       |
| Customer Account API | Customer-scoped API for profile, addresses and orders                |
| Hydrogen             | Shopify's storefront SDK and, separately, its React Router framework |
| Headless             | A storefront rendered outside Shopify's theme system                 |
| Headless channel     | The sales channel that exposes products to the Storefront API        |
| Publication          | The link between a resource and a sales channel                      |
| Market               | A country/region configuration with currency and language            |
| Handle               | The URL slug of a product, collection, page or blog                  |
| GID                  | A Shopify global ID such as `gid://shopify/Product/123`              |
| Metafield            | Custom data attached to a resource                                   |
| Scope                | A permission such as `write_products`                                |
| Webhook              | A Shopify callback to your app when data changes                     |
| Bogus Gateway        | A test payment provider for development stores                       |
