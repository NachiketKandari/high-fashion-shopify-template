# Caching and invalidation

Shopify owns the catalogue; Next.js owns the cache. This is the cache model, the tag graph, and the
webhook and revalidation contract that keep cached Shopify reads fresh.

`lib/shopify/operations/**/server.ts` exports uncached `fetch*` operations. `lib/<domain>/server.ts`
wraps them with `"use cache: remote"`, `cacheLife`, and `cacheTag`. Pages call the `get*` wrappers;
Eve tools call the `fetch*` operations and are never cached.

## Cache lifetime

Every cached Shopify read uses `cacheLife("max")`: 5 minutes client-stale, a 30-day background
revalidation window, and a 1-year expiry. Thirty days is too long for a live catalogue, so **tag
invalidation, not time, is the freshness mechanism**.

A new deployment starts with a new build ID and therefore a fresh cache. That makes a redeploy a
valid break-glass refresh, but it is not a strategy: it refreshes every tag and requires a commit.

## What is cached

| Cached read                 | File                        | Tags                                                                |
| --------------------------- | --------------------------- | ------------------------------------------------------------------- |
| `getProduct`                | `lib/product/server.ts`     | `products`, `product-<handle>`, `product-<id>`                      |
| `getSearchIndexProducts`    | `lib/product/server.ts`     | `products`, `products-index`, product IDs                           |
| `getProductRecommendations` | `lib/product/server.ts`     | `products`, `recommendations-<handle>`, product IDs                 |
| `getCollections`            | `lib/collections/server.ts` | `collections`, `collections-index`, collection tags                 |
| `getCollection`             | `lib/collections/server.ts` | `collections`, `collection-<handle>`, `collection-<id>`             |
| `getCollectionsListing`     | `lib/collections/server.ts` | `collections`, `collections-index`, thumbnail product IDs           |
| `getCollectionResults`      | `lib/collections/server.ts` | `collections`, `collection-<handle>`, `products-index`, product IDs |
| `getAllProductsResults`     | `lib/collections/server.ts` | `products-index`, product IDs                                       |
| `getBlog`, `getBlogArticle` | `lib/blog/server.ts`        | `blogs`, `articles`, `blog-<handle>`, article tags                  |
| `getPage`                   | `lib/pages/server.ts`       | `pages`, `page-<handle>`                                            |
| `getShopPolicies`           | `lib/policies/server.ts`    | `policies`                                                          |
| Sitemap counts and pages    | `lib/seo/server.ts`         | resource tags and per-resource tags                                 |

**Never cached:** carts, cart IDs, customer data, selected product variants, filtered or sorted
browse, Load more pages, search results and facets, and every `fetch*` operation.

Filtered and sorted browse stays request-time because cursor pagination plus Search & Discovery can
reorder results without a webhook. A cached page two would drift from page one and duplicate
products.

## Tag graph

- Product tags: `product-<handle>`, `product-<numericId>`, `products-index`,
  `recommendations-<handle>`.
- Collection tags: `collection-<handle>`, `collection-<numericId>`, `collections-index`.
- Content tags: `pages`, `page-<handle>`, `policies`, `blogs`, `articles`, `blog-<handle>`,
  `article-<blog>-<article>`.

A cached read carries both the handle and the numeric ID because Shopify webhook payloads are
asymmetric: a delete carries only the ID, and a rename carries only the new handle.

Product tags cascade. `getCollectionResults` tags every product it returns with
`product-<numericId>`, so invalidating one product also invalidates every cached collection grid
that contains it. A price or title edit therefore refreshes both the product page and its listings
without clearing `products-index`.

## Invalidation paths

### 1. Shopify webhooks

`app/api/webhooks/shopify/route.ts` verifies `X-Shopify-Hmac-Sha256` with
`SHOPIFY_WEBHOOK_SECRET`, then calls `revalidateTag(tag, { expire: 0 })`.

| Topic                                                            | Tags cleared                                                      |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `products/create`                                                | `products-index`, `product-<handle>`, `product-<id>`              |
| `products/update`                                                | `product-<handle>`, `product-<id>`, `recommendations-<handle>`    |
| `products/delete`                                                | `products-index`, `product-<handle>`, `product-<id>`              |
| `collections/create`                                             | `collections-index`, `collection-<handle>`, `collection-<id>`     |
| `collections/update`                                             | `collection-<handle>`, `collection-<id>`                          |
| `collections/delete`                                             | `collections-index`, `collection-<handle>`, `collection-<id>`     |
| `metaobjects/create`, `metaobjects/update`, `metaobjects/delete` | `metaobjects`, `metaobject-<handle>` (no current read uses these) |

The route returns `404` when `SHOPIFY_WEBHOOK_SECRET` is unset, `401` when the HMAC does not match,
and `400` when the topic header is missing.

### 2. Manual revalidation

`POST /api/revalidate` takes `Authorization: Bearer $REVALIDATE_SECRET` and 1–20 `tag` query
parameters:

```bash
curl -X POST "https://<domain>/api/revalidate?tag=pages&tag=page-about-us" \
  -H "Authorization: Bearer $REVALIDATE_SECRET"
```

This is the invalidation path for pages, policies, blogs, and articles, which have no Shopify
webhook topic the handler consumes. It is also the break-glass path for a single tag without a
deploy. The route returns `404` when `REVALIDATE_SECRET` is unset and `401` when the bearer token is
wrong.

### 3. Deployment

A new deployment starts with a new build ID and a fresh cache. Use it only when a tag cannot be
invalidated, or after changing the cache model itself.

## Production setup

Automatic invalidation needs all four pieces below. Missing any one leaves the storefront on the
30-day revalidation window.

1. **Set the secrets in Vercel Production.**
   - `SHOPIFY_WEBHOOK_SECRET`: the Shopify app's client secret. This is the value Shopify signs
     webhooks with.
   - `REVALIDATE_SECRET`: a random string used only by `POST /api/revalidate`.
2. **Grant `write_webhooks` to the seeding app.** The current Dev Dashboard app does not have it.
   Follow [`SHOPIFY-APP-SCOPES.md`](./SHOPIFY-APP-SCOPES.md): create a version, add
   `write_webhooks`, release it, and approve the change on the store.
3. **Register the six product and collection topics.**

   ```bash
   pnpm webhooks:register --dry-run --url=https://<domain>/api/webhooks/shopify
   pnpm webhooks:register --url=https://<domain>/api/webhooks/shopify
   ```

   Without `--url`, the script uses `NEXT_PUBLIC_SITE_URL`. It is idempotent: existing subscriptions
   for the same callback URL are left alone, missing topics are created. Metaobject topics are not
   registered because no cached read uses their tags.

   If the app cannot be granted `write_webhooks`, create the same six subscriptions in the Shopify
   admin webhook console and use the signing secret Shopify shows as `SHOPIFY_WEBHOOK_SECRET`.

4. **Redeploy** so the functions pick up the new environment variables.

### Verify

```bash
# 401 means the secret is set and the signature check is active; 404 means it is unset.
curl -s -o /dev/null -w '%{http_code}\n' -X POST "https://<domain>/api/webhooks/shopify"

# 200 with revalidated tags means the bearer token and tag names are correct.
curl -s -X POST "https://<domain>/api/revalidate?tag=products-index" \
  -H "Authorization: Bearer $REVALIDATE_SECRET"
```

Then edit a product title, price, or collection membership in Shopify. The product page and its
collection grids should refresh on the next request. Confirm the delivery under Shopify admin →
Settings → Notifications → Webhooks.

## Troubleshooting

| Symptom                                         | Cause                                                        | Fix                                                             |
| ----------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `POST /api/webhooks/shopify` returns `404`      | `SHOPIFY_WEBHOOK_SECRET` is unset in Vercel                  | Set it and redeploy                                             |
| `POST /api/webhooks/shopify` returns `401`      | The Vercel secret is not the app secret Shopify signs with   | Copy the app client secret again, or the admin webhook secret   |
| `POST /api/webhooks/shopify` returns `400`      | The request has no `X-Shopify-Topic` header                  | Send a real Shopify delivery, not a bare curl                   |
| A catalogue edit does not appear                | No subscription for that topic, or the callback URL is wrong | Run `pnpm webhooks:register --dry-run` and compare URLs         |
| A collection grid keeps an old price            | The product update webhook did not arrive                    | Verify the product subscription and its delivery log            |
| A page, policy, blog, or article stays stale    | Those topics have no webhook                                 | Call `POST /api/revalidate` with the page's tags                |
| A filtered or sorted browse view looks stale    | Browse is request-time, not cached                           | Check Shopify Search & Discovery and the uncached `fetch*` path |
| Everything is stale after a catalogue migration | The build happened before the data changed                   | Redeploy once, then verify webhooks                             |

## Operating rules

- Do not clear `products` or `collections` for routine edits. The per-resource tags already cascade.
- Search & Discovery changes send no webhook. They appear on the next product or collection webhook,
  or after a manual `POST /api/revalidate?tag=products-index`.
- Never invalidate public caches for cart changes. Carts are never cached.
- A deployment is a cache rebuild, not a revalidation. Do not use it as the normal path.
- After changing `cacheLife`, a tag, or a cached read, update this file and the table in
  [`FRONTEND-ARCHITECTURE.md`](./FRONTEND-ARCHITECTURE.md#5-caching-model).

## Current production wiring

As of 2026-11-21, the production deployment has no automatic invalidation:

| Item                               | State                                             |
| ---------------------------------- | ------------------------------------------------- |
| `SHOPIFY_WEBHOOK_SECRET` in Vercel | Unset; `POST /api/webhooks/shopify` returns `404` |
| `REVALIDATE_SECRET` in Vercel      | Unset; `POST /api/revalidate` returns `404`       |
| Shopify webhook subscriptions      | None                                              |
| Cache freshness                    | A new deployment, or 30 days                      |

Completing the production setup above is the remaining work. Until then, a catalogue change needs a
redeploy to appear.
