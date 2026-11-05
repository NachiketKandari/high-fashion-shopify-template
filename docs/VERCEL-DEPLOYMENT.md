# Deploying to Vercel

This is a Next.js 16 App Router application with an optional Eve agent. Vercel is the target
runtime: it provides the Next.js build and compute, Vercel Workflow and Sandbox for Eve, Cron for
schedules, and observability for agent runs. Shopify remains the commerce backend.

The repository currently runs locally against a development store. This guide is the production
runbook.

## 1. Prerequisites

- A Vercel account and a Git remote the Vercel project can read.
- Node.js 26 and pnpm 12.16.1 locally (the versions in `package.json`). Vercel must use the same
  major Node version.
- A Shopify store with the Headless sales channel and a Storefront API token.
- A production domain, if the storefront should not use `*.vercel.app`.

## 2. Import the project

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, **Add New → Project** and import the repository.
3. Keep the repository root as the root directory. The project is not a monorepo.
4. Framework preset: **Next.js**.
5. Install command: `pnpm install`.
6. Build command: `pnpm build`.
7. Output directory: leave the Next.js default.
8. Node.js version: **26.x**. If the Vercel project settings do not offer 26 yet, pin the closest
   supported LTS and change `engines.node` and `.nvmrc` in the same pull request; do not leave the
   deployment on a Node version the repository does not declare.

The first build can succeed without Shopify credentials, but the rendered catalog will be empty.
Add the environment variables before the first production deployment.

## 3. Environment variables

Set variables per environment. Previews can point at a staging Shopify store; Production must
point at the production store.

### Required

| Variable                                      | Scope      | Notes                                                                                                     |
| --------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`            | All        | `your-store.myshopify.com`                                                                                |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | All        | Public Storefront API token                                                                               |
| `NEXT_PUBLIC_SHOPIFY_SHOP_ID`                 | All        | Numeric shop ID                                                                                           |
| `NEXT_PUBLIC_SITE_URL`                        | Production | Canonical URL, e.g. `https://politesociety.example`. Without it, metadata uses the Vercel production URL. |

### Recommended for production

| Variable                            | Scope      | Notes                                                                  |
| ----------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID` | All        | Required only when Shopify analytics or WebMCP is enabled.             |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`     | All        | Loads GA4 directly. Leave unset when GTM sends GA4.                    |
| `NEXT_PUBLIC_GTM_ID`                | All        | Loads Tag Manager; it owns the GA4 page view when set.                 |
| `SHOPIFY_WEBHOOK_SECRET`            | Production | Verifies Shopify product, collection and metaobject webhooks.          |
| `REVALIDATE_SECRET`                 | Production | Bearer token for `POST /api/revalidate` for pages, policies and menus. |
| `SHOPIFY_API_VERSION`               | All        | Optional override; defaults to the Hydrogen-targeted version.          |

### Optional features

| Variable                                                | Feature                                                                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `AI_GATEWAY_API_KEY`                                    | Eve model access outside Vercel OIDC, such as local development. On Vercel, OIDC covers the default gateway path. |
| `CUSTOMER_ACCOUNT_SESSION_SECRET`                       | Customer accounts. Must be an app-generated secret, not the Shopify client secret.                                |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` / `..._SECRET` | Customer Account API OAuth. Server-only.                                                                          |
| `UCP_AGENT_PROFILE_URL`                                 | Public Eve agent profile for UCP discovery.                                                                       |
| `SHIPROCKET_*`                                          | Only when the custom shipping flow in `docs/SHIPROCKET.md` is implemented.                                        |

### Do not set in production

- `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` are for `pnpm seed:catalog` only. Keep them in a
  local shell or a CI secret, not in the storefront runtime.
- `SHOPIFY_ADMIN_ACCESS_TOKEN` is not read by the deployed storefront.
- `UNPUBLISH_OTHERS` and `V0_CALLBACK_URL` are operational switches, not production settings.

Every user-configurable variable must have a row in `.env.example` and an entry in `turbo.json`
`globalEnv`. The repository already lists them; add the row before adding the read.

`NEXT_PUBLIC_*` values are embedded in the browser bundle. Never put an Admin token, customer
account secret, Shiprocket password or webhook secret behind a `NEXT_PUBLIC_` name.

## 4. Deploy

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

Then either push to the connected branch or deploy from the CLI:

```bash
pnpm dlx vercel link
pnpm dlx vercel deploy --prod
```

The build runs `next build`. With `shopConfig.agent.isEnabled === false`, `withEve` is not applied
and the deployment is a plain Next.js app. When the agent is enabled, `withEve` from `eve/next`
adds the agent service to the same Vercel project. It requires the Eve runtime and Vercel
Workflow; no separate service is deployed.

## 5. Custom domain

1. Vercel project → **Settings → Domains** → add the apex and `www` domains.
2. Point DNS at Vercel:
   - Apex: `A` record to `76.76.21.21` or the value Vercel shows.
   - `www`: `CNAME` to `cname.vercel-dns.com`.
3. Wait for the certificate to issue, then set the primary domain.
4. Set `NEXT_PUBLIC_SITE_URL` to the primary domain and redeploy so metadata, `robots.txt` and
   `sitemap.xml` use it.
5. Update the Shopify storefront's allowed domains and any Customer Account API callback URLs to
   the production domain.

## 6. Shopify configuration after the first deploy

### Headless storefront

The Storefront API token is the same one used locally. Confirm the production domain is allowed
in the Headless channel and that the token has the scopes the storefront queries
(`unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`,
`unauthenticated_read_content`, and the optional scopes for inventory, tags or metaobjects).

### Webhooks

Create a Shopify webhook for each topic the storefront caches:

| Topic                                                            | URL                                     |
| ---------------------------------------------------------------- | --------------------------------------- |
| `products/create`, `products/update`, `products/delete`          | `https://<domain>/api/webhooks/shopify` |
| `collections/create`, `collections/update`, `collections/delete` | `https://<domain>/api/webhooks/shopify` |
| `metaobjects/create`, `metaobjects/update`, `metaobjects/delete` | `https://<domain>/api/webhooks/shopify` |

Use the same `SHOPIFY_WEBHOOK_SECRET` that is set in Vercel. The handler verifies the
`X-Shopify-Hmac-Sha256` header and invalidates tags; it returns `404` when the secret is unset.

Pages, policies and menus do not send the topics this handler consumes. Call the revalidation
endpoint after editing them:

```bash
curl -X POST "https://<domain>/api/revalidate?tag=pages&tag=page-about-us" \
  -H "Authorization: Bearer $REVALIDATE_SECRET"
```

Use the tags the page or route reads. `pages`, `policies`, `menus` and their per-handle tags are
the usual set.

### Customer accounts

When `shopConfig.auth.isEnabled` is turned on, configure the Customer Account API client in the
Shopify Dev Dashboard and add the production callback URL. The Hydrogen customer-account routes
are served by `proxy.ts`; the default authorize path is `/account/authorize`. Add both the
production and preview domains while testing. The three `CUSTOMER_ACCOUNT_*` values are
server-only.

### Checkout

Checkout remains Shopify-hosted. Set the store's payment providers, shipping zones, taxes and
policies in Shopify Admin. The Vercel deployment never handles card data.

## 7. Caching on Vercel

- Product, collection, page, policy, blog and article reads use `"use cache"` with `cacheLife` and
  `cacheTag` wrappers. Filtered and sorted browse, Load more pages and search results bypass the
  cache and read Shopify directly.
- `revalidateTag(tag, { expire: 0 })` is called from webhooks and `/api/revalidate`.
- Cart state is per-request and cookie-bound. Never cache a cart response.
- Preview deployments should use a staging store. Do not point a preview at production if the
  team is testing seed or unpublish scripts.

Vercel's Data Cache is regional and shared by the deployment. The app does not need a separate
Redis or KV store for the storefront.

## 8. Eve agent

The agent is disabled in `lib/config/index.ts` (`agent.isEnabled: false`). Leave it off until the
following are true:

1. `AI_GATEWAY_API_KEY` or Vercel OIDC model access is configured.
2. Bot protection and rate limits are enabled. BotID is configured through `shopConfig.botid`;
   Firewall rules and AI Gateway spending controls live in Vercel.
3. The public agent profile at `/agent/ucp-profile.json` points at the production URL through
   `UCP_AGENT_PROFILE_URL`.
4. The cart cookie flow has been tested against the production domain. The agent binds the cart
   from the browser cookie; it does not accept a cart ID from the model.
5. Someone has reviewed the privacy and responsible-use text.

Enabling the agent changes the build to include the Eve service. Verify the health route after
deploy:

```bash
curl https://<domain>/eve/v1/health
```

If the deployment uses Vercel Deployment Protection, set `VERCEL_AUTOMATION_BYPASS_SECRET` locally
before connecting.

## 9. Analytics

- **GA4** is already wired in `components/analytics/index.tsx`. Set
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` for the direct tag, or `NEXT_PUBLIC_GTM_ID` to let Tag Manager
  own the page view. Never set both unless the GA4 tag is removed from the container; the
  component prefers GTM to avoid double counting.
- **Vercel Analytics** and **Speed Insights** are opt-in through `shopConfig.analytics`. Their
  packages are already installed. Enable them in `lib/config/index.ts` and enable the products in
  the Vercel project.
- **Shopify analytics** is opt-in through `shopConfig.analytics.shopify`. It uses the storefront
  ID and the shop domain.

## 10. Verification checklist

After the first production deploy:

- [ ] `/` renders the seeded catalog, not demo products.
- [ ] `/collections/all` and each navigation collection return products.
- [ ] A product page selects a variant, adds to cart and reaches a Shopify checkout URL.
- [ ] The cart survives a refresh and a second tab.
- [ ] `/pages/about-us`, `/pages/lookbooks`, `/pages/care-guide`, `/pages/size-guide`,
      `/pages/faqs`, `/pages/contact-us`, `/blogs/journal-2` and the policy pages return `200`.
- [ ] `/sitemap.xml`, `/robots.txt` and `/llms.txt` use the production domain.
- [ ] `POST /api/webhooks/shopify` rejects a request without a valid HMAC and returns `200` for a
      signed test payload.
- [ ] `POST /api/revalidate` rejects a missing bearer token and revalidates a tag with the secret.
- [ ] GA4 shows a `page_view` in Realtime for `/`, `/collections/all`, a product page and `/cart`.
- [ ] No secret appears in the client bundle, build logs or Vercel environment preview.

## 11. Rollback and operations

- Vercel keeps every deployment. **Instant Rollback** promotes a previous deployment without a
  rebuild.
- Preview deployments are isolated by environment variables. Use them for Shopify staging.
- If a cache tag is stuck, call `/api/revalidate` with the tag rather than redeploying.
- Rotate `SHOPIFY_WEBHOOK_SECRET`, `REVALIDATE_SECRET` and the Storefront token in Shopify, then
  update Vercel and redeploy.
- Seed and unpublish scripts are not part of the build. Run them from a trusted machine against
  the intended store, never from a Vercel build step.

## Cost notes

The storefront itself is a standard Next.js deployment. Costs come from:

- Vercel plan and bandwidth.
- Vercel Analytics / Speed Insights if enabled.
- Eve model and sandbox usage if the agent is enabled.
- Shopify plan and payment fees.
- Shiprocket per-shipment charges, if used.

Check the current Vercel plan for BotID, Firewall, Observability and Sandbox limits before
enabling the agent. The storefront does not need Vercel Pro for Next.js hosting, but the agent
features and some protection products may require a paid plan.
