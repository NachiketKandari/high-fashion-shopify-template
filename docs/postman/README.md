# Storefront API testing

Postman collection for the trial storefront. It calls the same Shopify Storefront GraphQL API the app uses.

## Files

- `shopify-storefront.postman_collection.json` — import this into Postman
- `local.postman_environment.json.example` — optional environment template

## Import

1. Postman → **Import** → select the collection file.
2. Optional: copy the environment example to `local.postman_environment.json`, import it, and select it in the environment picker.
3. Set the `storefront_token` variable to your **public Storefront API access token**:
   - Collection → **Variables** → `storefront_token` → _Current value_, or
   - the imported environment → `storefront_token`
4. Confirm `store_domain` and `api_version` (`2026-10`).

The collection sends the token as `X-Shopify-Storefront-Access-Token`. An Admin API `shpat_` token will not work.

## Run order

1. **Shop → Shop info** — verifies domain + token
2. **Catalog → List products** — saves `variant_id` and `product_handle` automatically
3. **Catalog → Product by handle / List collections / Collection products / Search products**
4. **Cart → Create cart** — saves `cart_id` and `line_id` automatically
5. **Cart → Get cart / Add line / Update line quantity / Remove line**

`Create cart` needs a non-empty `variant_id`, so run `List products` (or `Product by handle`) first.

The requests include test scripts that fail on GraphQL errors or Shopify `userErrors`, so a red result usually means the token, scopes, or product publishing is wrong.

## Notes

- `checkoutUrl` opens Shopify-hosted checkout. On a development store, checkout cannot complete a real payment.
- `quantityAvailable` is not queried because it needs the optional `unauthenticated_read_product_inventory` scope.
- Never commit a real token. The collection references `{{storefront_token}}`; the real environment file is git-ignored.
- Field reference: <https://shopify.dev/docs/api/storefront/2026-10>

## Adding requests

Keep new operations as GraphQL documents in the collection, not as REST calls. Shopify's Storefront API is GraphQL-only.
