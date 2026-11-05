# Content ownership and best practices

Shopify is the source of truth for merchant-editable content. Next.js owns presentation, routing,
caching and interactive tools. A page must have exactly one owner; never keep a local static route
and a Shopify page for the same handle.

## Current inventory

| Surface                                                                        | Source                                                 | Route                                                           |
| ------------------------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------- |
| About Us, Lookbooks, Press, FAQ, Care Guide, Shipping, Returns, Terms, Privacy | Shopify pages                                          | `/pages/[handle]`                                               |
| Journal index and three articles                                               | Shopify blog `journal-2`                               | `/blogs/[blogHandle]` and `/blogs/[blogHandle]/[articleHandle]` |
| Contact page and form                                                          | Next.js                                                | `/pages/contact-us`                                             |
| Size guide and find-my-size form                                               | Next.js                                                | `/pages/size-guide`                                             |
| Wishlist                                                                       | Next.js and browser storage                            | `/pages/wishlist`                                               |
| Home, collections, products, cart, account, search                             | Next.js and Shopify commerce APIs                      | Existing routes                                                 |
| Navigation and footer links                                                    | Next.js                                                | `lib/nav/index.ts`                                              |
| Product and editorial media                                                    | Shopify Files or `public/reference/` for design assets | —                                                               |

The migrated pages were seeded by `scripts/seed-content.mjs`. Their local React route directories
were deleted after the Shopify routes returned `200`, so the dynamic `app/pages/[handle]` route is
now the only handler for those URLs. `app/blogs/journal-2` was deleted; the generic blog routes
serve the Shopify blog.

## Rules

1. **One owner per URL.** Do not add `app/pages/<handle>/page.tsx` for a handle that exists in
   Shopify. A static route shadows `app/pages/[handle]`, so Shopify edits never appear. Delete the
   local route instead.
2. **Shopify owns editable copy.** Pages, blogs, articles and their images belong in Shopify. Create
   them through the Admin API seeder or the Shopify admin, then read them through the Storefront API.
3. **Next.js owns interactive surfaces.** Contact forms, wishlists, size finders and other stateful
   tools stay as React routes. Do not move them into a Shopify page body; page bodies are HTML and
   cannot run React state or submit a form.
4. **Seeding is create-only by default.** `scripts/seed-content.mjs` skips existing handles. Use
   `UPDATE=1` only when intentionally replacing content, because it overwrites merchant edits.
5. **Upload content images to Shopify Files.** The seeder caches uploaded URLs in
   `.seed-content-cache.json` and rewrites page bodies to Shopify CDN URLs with width and `srcset`
   attributes. Do not commit local image paths into Shopify content unless the image is an
   app-owned design asset.
6. **Sanitize every Shopify HTML body.** `sanitizeShopifyHtml` runs in `fetchPage`, `fetchBlog` and
   `fetchBlogArticle`. Keep the allowlist narrow. `<details>` and `<summary>` are allowed so FAQ
   content can be interactive without JavaScript.
7. **Cache content reads.** `getPage`, `getBlog` and `getBlogArticle` use `"use cache: remote"`,
   `cacheLife("max")` and tags. A Shopify page fetch should not run on every request.
8. **Plan invalidation.** Classic Shopify webhooks do not expose `pages/*`, `blogs/*` or `articles/*`
   topics. With `cacheLife("max")`, an admin edit stays stale until a tag is revalidated. Run the
   seeder with `REVALIDATE_URL` and `REVALIDATE_SECRET`, or call `/api/revalidate` after content
   changes. If editors change content often, lower the content `cacheLife` to `"days"` or `"hours"`
   instead of relying on manual revalidation.
9. **Pre-render known handles.** `generateStaticParams` reads the first sitemap page for pages,
   blogs and articles. New handles still work through the dynamic route and cache; add them to the
   sitemap-backed params when they should be part of the static build.
10. **Keep navigation code-owned unless the merchant needs to edit it.** Navigation is design and
    latency-critical; a Shopify menu fetch in the root layout adds a dependency to every page. If
    menus move to Shopify, cache them with `cacheLife("max")`, keep a static fallback, and delete
    `lib/nav/index.ts` as the source of truth. Do not maintain both.
11. **Do not duplicate legal policies.** This store uses Shopify pages for the linked Terms,
    Privacy, Shipping and Returns destinations. Shopify's shop policies remain available at
    `/policies/[handle]` for Shopify's checkout links but are excluded from the sitemap. If the
    shop policies become the source, update the navigation links, remove the page copies, and
    never keep both editable.
12. **Deleted routes stay deleted.** If a Shopify page is removed, add a redirect or a 404; do not
    restore a local static replica. The exception is an app-owned tool that was never Shopify
    content.

## Seeding commands

```bash
DRY_RUN=1 corepack pnpm seed:content                  # inventory only, no writes
corepack pnpm seed:content                            # create missing pages, blog and articles
UPDATE=1 corepack pnpm seed:content                   # replace bodies from scripts/content/
UPLOAD_IMAGES=0 corepack pnpm seed:content            # keep local image paths
```

Optional revalidation after seeding:

```bash
REVALIDATE_URL=https://your-store.example/api/revalidate \
REVALIDATE_SECRET=your-secret \
corepack pnpm seed:content
```

The seeder needs `write_online_store_pages` and `write_files`; see
[`SHOPIFY-APP-SCOPES.md`](./SHOPIFY-APP-SCOPES.md). It is a local migration tool, not a Vercel
runtime dependency.

## Verification checklist

- The page or article exists in the Shopify admin and is published to the Headless channel.
- `page(handle:)` or `blog(handle:)` returns the content through the Storefront API.
- The storefront route returns `200` and contains a marker from the Shopify body, not only the title.
- Images resolve from `cdn.shopify.com`.
- The sitemap contains the route once, from the Shopify page or article shard.
- `pnpm lint`, `pnpm typecheck` and `pnpm build` pass.
