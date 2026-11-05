# Shopify App Scopes for Catalog and Content Seeding

## 1. Purpose and current state

The Shopify Dev Dashboard app is a local seeding tool, not a runtime dependency of the storefront. It authenticates with the client credentials grant using `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` from `.env.local`, receives an Admin API token that expires after 24 hours, and is never used by a deployed request.

The only seeding script in the repository is `scripts/seed-catalog.mjs`, run through `pnpm seed:catalog`. It creates products, variants and collections, imports product images into Shopify Files, and publishes the results to the Headless channel. No content seeding script exists yet. The scopes below make content seeding possible; they do not create pages, articles, menus or policies by themselves.

`scripts/seed-catalog.mjs` uses Admin GraphQL API version `2026-10` by default and accepts `SHOPIFY_API_VERSION` as an override. `SHOPIFY_ADMIN_ACCESS_TOKEN` is supported as a static-token alternative to client credentials, but the Dev Dashboard app is the normal path.

The app is installed on the store identified by `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`. The following scopes are currently granted, verified with `currentAppInstallation { accessScopes { handle } }`:

```text
read_files
write_files
read_legal_policies
write_legal_policies
read_online_store_navigation
write_online_store_navigation
read_online_store_pages
write_online_store_pages
read_products
write_products
read_publications
write_publications
```

The storefront's `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` is a read-only Storefront API token. It cannot create or update content and is not a substitute for the seeding app.

`docs/IMPLEMENTATION.md` and `docs/CLONING.md` link here for the full scope inventory and the migration prerequisite. This file is the current scope inventory for the installation.

## 2. Scope-to-capability table

Every `write_` scope includes its `read_` counterpart. The read handles below are present on the current installation because both were approved; declaring both is not required for new grants.

| Scope pair                                                      | Admin API access                                                                                                                             | Repository use                                                                                                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `read_products`, `write_products`                               | `Product`, `ProductVariant`, `Collection`, and product and collection mutations                                                              | `productSet` creates products, variants and image inputs; `collectionCreate` and `collectionAddProducts` build collections. Used by `scripts/seed-catalog.mjs`. |
| `read_publications`, `write_publications`                       | Publication fields on products and collections, plus publishing mutations such as `publishablePublish` and `publishableUnpublish`            | Resolves the Headless publication and publishes every seeded product and collection. Also used by `UNPUBLISH_OTHERS=1`.                                         |
| `read_files`, `write_files`                                     | `File` and its implementing types, including `MediaImage`, `GenericFile`, `Video` and `Model3d`; file queries and mutations                  | `productSet` image inputs point at the reference CDN and Shopify downloads them into Shopify Files. The same scope can hold page and article images.            |
| `read_online_store_pages`, `write_online_store_pages`           | `Page`, `Blog`, `Article` and `Comment` objects and their mutations, such as `pageCreate`, `blogCreate`, `articleCreate` and `articleUpdate` | No current script. Enables a future content seeder for local pages and the `journal-2` blog.                                                                    |
| `read_online_store_navigation`, `write_online_store_navigation` | Menus and link lists, including `menuCreate` and `menuUpdate`; URL redirects                                                                 | No current script. Enables moving `MAIN_NAV` and `FOOTER_COLUMNS` from `lib/nav/index.ts` into Shopify navigation.                                              |
| `read_legal_policies`, `write_legal_policies`                   | `ShopPolicy` and `shopPolicyUpdate`                                                                                                          | No current script. Enables moving the local terms, privacy, shipping and returns copy into Shopify policies.                                                    |

`write_online_store_pages` is accepted by the current Shopify documentation as an alternative to `write_content`; `pageCreate`, for example, requires either scope.

## 3. Why `write_content` is not declared

`write_content` is the older, broader combined content scope. `write_online_store_pages` is the current scoped alternative and covers the same Page, Blog, Article and Comment mutations needed here. The app has the scoped handle, so adding `write_content` would duplicate access without adding a capability.

Do not declare both `write_content` and `write_online_store_pages`, and do not add a `read_` scope alongside a `write_` scope you are already declaring. A write scope already includes read. An absent `read_` handle in `currentAppInstallation` does not mean read access is missing.

The current installation reports read and write handles for each pair. That is the observed approved state, not a requirement for future versions.

## 4. Add or change a scope

1. Open the Dev Dashboard and go to **Apps** → the seeding app → **Versions**.
2. Select **Create version**.
3. In the version's **Admin API access scopes**, add the required write scope and keep the existing scopes. Do not add the matching read scope.
4. Select **Release**.
5. Approve the new scopes on the store. Open the app's install or update prompt in Shopify admin and approve the changes. Releasing a version does not automatically apply new scopes to existing installs; repeat approval on every store where the app is installed.
6. Mint a new Admin API token by re-running the client credentials exchange, for example `pnpm seed:catalog`. A token issued before approval keeps its old scopes until it expires.
7. Verify the granted handles with the query in section 5. If a scope is still missing, confirm that the version was released and that the approval happened on the same store as `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`.

Removing a scope follows the same version and release path. The store drops the reduced scope set when the app is next opened; mint a new token afterward.

## 5. Verification query and sample response

Run the client credentials exchange, then query the Admin GraphQL API with the resulting token:

```bash
set -a
. ./.env.local
set +a

ACCESS_TOKEN="$(
  curl -sS -X POST "https://${NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "client_id=${SHOPIFY_CLIENT_ID}" \
    --data-urlencode "client_secret=${SHOPIFY_CLIENT_SECRET}" \
    --data-urlencode "grant_type=client_credentials" |
    jq -r '.access_token'
)"

curl -sS -X POST "https://${NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2026-10/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: ${ACCESS_TOKEN}" \
  --data '{"query":"query { currentAppInstallation { accessScopes { handle description } } }"}' |
  jq .
```

The exchange and query require `curl` and `jq`. Do not echo either value or enable shell tracing around this snippet.

Exact query:

```graphql
query GrantedScopes {
  currentAppInstallation {
    accessScopes {
      handle
      description
    }
  }
}
```

Sample response shape. Descriptions are illustrative; compare the `handle` values, and do not rely on response order.

```json
{
  "data": {
    "currentAppInstallation": {
      "accessScopes": [
        { "handle": "read_files", "description": "Read files" },
        { "handle": "write_files", "description": "Write files" },
        { "handle": "read_legal_policies", "description": "Read legal policies" },
        { "handle": "write_legal_policies", "description": "Write legal policies" },
        { "handle": "read_online_store_navigation", "description": "Read online store navigation" },
        {
          "handle": "write_online_store_navigation",
          "description": "Write online store navigation"
        },
        { "handle": "read_online_store_pages", "description": "Read online store pages" },
        { "handle": "write_online_store_pages", "description": "Write online store pages" },
        { "handle": "read_products", "description": "Read products" },
        { "handle": "write_products", "description": "Write products" },
        { "handle": "read_publications", "description": "Read publications" },
        { "handle": "write_publications", "description": "Write publications" }
      ]
    }
  }
}
```

## 6. Troubleshooting

| Symptom                                                                | Likely cause                                                                                                                                                                                                         | Fix                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACCESS_DENIED` in `errors[n].extensions.code`                         | The token does not carry the scope the field or mutation needs, or the scope was declared but not approved on the store. Admin GraphQL returns HTTP `200` with `data: null`, so status-code-only handling misses it. | Read the error message, which names the required scope. Query `currentAppInstallation`. If the scope is missing, release the version and approve it, then mint a new token. If it is present, check the mutation's reference page for another requirement. |
| A scope is missing from `currentAppInstallation` after editing the app | The version was not released; it was released but not approved on the store; the query targets a different store; the token was minted before approval; or the client ID belongs to a different app.                 | Confirm the active version, approve the new scopes on the store in `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, and re-run the exchange. A token issued before approval does not pick up the new scope until replaced.                                              |
| App or client ID mismatch                                              | `SHOPIFY_CLIENT_ID` in `.env.local` does not match the app open in the Dev Dashboard. Client IDs and secrets are per app, and rotating a secret does not change the client ID.                                       | Compare `.env.local` with **App settings** → **Credentials** for the intended app. Copy both values from the same app and restart the process. A token from one app will not report another app's scopes.                                                  |
| Token cache or 24-hour expiration                                      | `scripts/seed-catalog.mjs` caches the token in memory for one process. Client credentials tokens expire after 24 hours.                                                                                              | Start a new process or re-run `pnpm seed:catalog`; there is no on-disk token cache to clear. If a request returns `401`, exchange the credentials again.                                                                                                   |
| Storefront token cannot write                                          | `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` is a public, read-only Storefront API token. It cannot call the Admin API or create content.                                                                           | Use `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`, or `SHOPIFY_ADMIN_ACCESS_TOKEN`, for seeding. Never substitute the Storefront token.                                                                                                                  |
| A read scope is requested alongside a write scope                      | A write scope already includes read. `read_products` next to `write_products` is redundant, and Shopify can reject optional-scope configurations that declare the implicit read scope.                               | Declare only the write scope. Do not treat an absent `read_` handle as missing access.                                                                                                                                                                     |

For more detail on `ACCESS_DENIED` and scope approval behavior, see [Manage access scopes](https://shopify.dev/docs/apps/build/authentication-authorization/manage-access-scopes#troubleshoot-scope-problems).

## 7. Safety

- Keep `SHOPIFY_CLIENT_SECRET` in `.env.local` or a secret manager. Never use a `NEXT_PUBLIC_` name for it, and never place it in browser code or client components.
- Never commit `.env.local`. The repository's `.gitignore` excludes `.env*` and re-includes only `.env.example`; do not force-add the file.
- If the secret is exposed in a screenshot, chat, log or commit, rotate it in the Dev Dashboard under **App settings** → **Credentials**, update `.env.local`, and treat any token issued with the exposed secret as compromised.
- Do not use the Admin API token in browser code or client components. Keep it in the seeding process.
- The seeding scripts are not part of the Vercel build. `pnpm build` runs `next build`; `pnpm seed:catalog` is a manual command. Do not add seeding credentials to the production Vercel environment.
- Do not paste tokens, client secrets, or full credential-bearing error responses into issues, chat or logs.

## 8. What the scopes unlock, and what is still local

The scopes are permissions, not a migration. No content seeding script exists. `scripts/seed-catalog.mjs` only handles catalog data, and the local content routes remain the source of truth until a content seeder is written, run and verified. This document records the prerequisite; it is not evidence that the migration ran.

| Area                          | Current source                                                                                                              | Enabled by these scopes                                                              | Current state                                                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Product and collection images | Shopify Files, written by `scripts/seed-catalog.mjs`                                                                        | `productSet` file inputs and `write_files`                                           | Implemented for the catalog.                                                                                                          |
| Pages                         | Static routes under `app/pages/*`                                                                                           | `pageCreate` and `pageUpdate` with `write_online_store_pages`                        | Local routes remain. A content seeder does not exist.                                                                                 |
| Journal and articles          | `app/blogs/journal-2/*` and `lib/content/journal.ts`                                                                        | `blogCreate`, `articleCreate` and `articleUpdate` with `write_online_store_pages`    | Local routes and local article data remain.                                                                                           |
| Navigation                    | `MAIN_NAV` and `FOOTER_COLUMNS` in `lib/nav/index.ts`                                                                       | `menuCreate` and `menuUpdate` with `write_online_store_navigation`                   | Local navigation remains; the storefront does not read Shopify menus yet.                                                             |
| Legal policies                | Local `/pages/terms-of-service`, `/pages/privacy-policies`, `/pages/shipping-returns` and `/pages/returns-exchanges` routes | `shopPolicyUpdate` with `write_legal_policies`                                       | Local policy copies remain. Shopify policies render at `/policies/<handle>` through `app/policies/[handle]/page.tsx` when they exist. |
| Orders and fulfilment         | Shopify-hosted checkout and the Shiprocket flow described in `docs/SHIPROCKET.md`                                           | Not covered by this app's scopes; fulfilment writes need order and fulfilment scopes | Out of scope for the seeding app. Use a separate app or add scopes deliberately.                                                      |

Static route directories take precedence over `app/pages/[handle]`. Adding a Shopify page with the same handle does not replace a local route until the static directory is removed.

## 9. Shopify documentation

- [API access scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Manage access scopes](https://shopify.dev/docs/apps/build/authentication-authorization/manage-access-scopes)
- [Create apps using the Dev Dashboard](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard)
- [`pageCreate`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/pageCreate)
- [`shopPolicyUpdate`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/shopPolicyUpdate)

## 10. Related documentation

- `docs/IMPLEMENTATION.md` covers catalog seeding, credential storage and the local content route table. It links here for the current scope inventory.
- `docs/CLONING.md` covers seeding authentication, publication behavior, local content routes and the navigation inventory.
- `docs/SHIPROCKET.md` covers fulfilment writes that require order and fulfilment scopes outside this app.
- `docs/VERCEL-DEPLOYMENT.md` covers the production environment boundary: client credentials and Admin tokens are seed-only and are not set in the deployed storefront.
