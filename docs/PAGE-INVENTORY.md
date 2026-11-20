# Page inventory

Shopper-facing pages and how to reach them. Production base is
`https://high-fashion-shopify-template.vercel.app`; local development is `http://localhost:3000`
with the same paths. Prefix the paths below with the production base unless a full URL is shown.
The route source of truth is `app/**/page.tsx`; this document lists pages, not API handlers or
Shopify's hosted surfaces.

## Storefront

| Page              | Path                    | Reached from                                             |
| ----------------- | ----------------------- | -------------------------------------------------------- |
| Home              | `/`                     | Wordmark, any breadcrumb back to the shop                |
| Collections index | `/collections`          | Direct, or the collection grid on the home page          |
| All products      | `/collections/all`      | Direct; empty-cart "Trending Collection"                 |
| Collection        | `/collections/[handle]` | Header Woman/Man panels, menu tiles, home category tiles |
| Product           | `/products/[handle]`    | Any product card                                         |
| Search            | `/search`               | Header search, mobile search icon                        |
| Search results    | `/search?q=[query]`     | Submit the search field                                  |
| Cart              | `/cart`                 | Header bag, add-to-cart drawer                           |
| Wishlist          | `/pages/wishlist`       | Header Wishlist                                          |
| Wishlist (legacy) | `/wishlist`             | Redirects to `/pages/wishlist`                           |

Examples:

- Collection: https://high-fashion-shopify-template.vercel.app/collections/womenswear
- Product: https://high-fashion-shopify-template.vercel.app/products/micro-pleated-shorts
- Search: https://high-fashion-shopify-template.vercel.app/search?q=corset

Filtered and sorted browse keeps the public collection URL and is served by the request-time
`refine` route through the proxy rewrite. `/collections/[handle]/refine` returns 404 when requested
directly.

- https://high-fashion-shopify-template.vercel.app/collections/womenswear?sort_by=price-ascending
- https://high-fashion-shopify-template.vercel.app/collections/womenswear?filter.v.availability=1
- https://high-fashion-shopify-template.vercel.app/collections/all?sort_by=price-descending

The complete handle list is on `/collections` and in `/sitemap.xml`; do not duplicate it here.

## Cart and checkout

| Step                         | Path                 | Current behavior                                                                           |
| ---------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| Product                      | `/products/[handle]` | Choose a variant and add to cart                                                           |
| Cart                         | `/cart`              | Full-page bag; Checkout currently opens Shopify's hosted checkout directly                 |
| Address and shipping         | `/checkout/address`  | Built pre-checkout step, reachable by direct link only; an empty cart redirects to `/cart` |
| Shipping, payment, placement | Shopify checkout     | Generated per cart from `cart.checkoutUrl`; no fixed storefront URL                        |
| Confirmation                 | Shopify checkout     | Shopify-owned; no storefront page                                                          |

`/checkout` is a Hydrogen redirect to Shopify's checkout, not a storefront page. The cart Checkout
action does not link to `/checkout/address` yet.

## Authentication and account

| Page                  | Path                                      | Reached from                                                                         |
| --------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Login / register gate | `/login`                                  | Header Account, cart Sign in, account redirects                                      |
| Shopify sign-in       | `/account/login?return_to=…&login_hint=…` | Generated when the gate submits; Hydrogen OAuth handoff, not a page                  |
| Sign-in failed        | `/account/sign-in-failed`                 | Shopify redirect after a failed sign-in                                              |
| Account overview      | `/account`                                | Account links while signed in; signed out redirects to `/login?return_to=%2Faccount` |
| Orders                | `/account/orders`                         | Account navigation                                                                   |
| Order detail          | `/account/orders/[id]`                    | An order in the orders list                                                          |
| Addresses             | `/account/addresses`                      | Account navigation                                                                   |
| Profile               | `/account/profile`                        | Account navigation                                                                   |

Every `/account` page requires a customer session, except `/account/sign-in-failed` and the OAuth
paths served by `proxy.ts`. There is no separate register URL; Shopify's hosted flow decides whether
the email is new or existing. Customer Account OAuth requires HTTPS, so local sign-in needs
`pnpm dev:portless` and configured Customer Account API credentials.

## Content

| Page           | Path                               | Reached from             |
| -------------- | ---------------------------------- | ------------------------ |
| Journal        | `/blogs/journal-2`                 | Footer Journal           |
| Article        | `/blogs/journal-2/[articleHandle]` | A Journal card           |
| Secondary blog | `/blogs/news`                      | Direct                   |
| Contact        | `/pages/contact-us`                | Footer, login help, cart |
| Size guide     | `/pages/size-guide`                | Footer Help              |
| CMS page       | `/pages/[handle]`                  | Footer columns           |
| Policy         | `/policies/[handle]`               | Header utility links     |

Journal articles:

- https://high-fashion-shopify-template.vercel.app/blogs/journal-2/guide-to-bombay-after-dark
- https://high-fashion-shopify-template.vercel.app/blogs/journal-2/in-conversation-with-neetta
- https://high-fashion-shopify-template.vercel.app/blogs/journal-2/the-polite-society-watchlist

CMS pages:

- https://high-fashion-shopify-template.vercel.app/pages/about-us
- https://high-fashion-shopify-template.vercel.app/pages/care-guide
- https://high-fashion-shopify-template.vercel.app/pages/contact
- https://high-fashion-shopify-template.vercel.app/pages/data-sharing-opt-out
- https://high-fashion-shopify-template.vercel.app/pages/faqs
- https://high-fashion-shopify-template.vercel.app/pages/lookbooks
- https://high-fashion-shopify-template.vercel.app/pages/press-v2
- https://high-fashion-shopify-template.vercel.app/pages/privacy-policies
- https://high-fashion-shopify-template.vercel.app/pages/returns-exchanges
- https://high-fashion-shopify-template.vercel.app/pages/shipping-returns
- https://high-fashion-shopify-template.vercel.app/pages/terms-of-service

Shopify policies:

- https://high-fashion-shopify-template.vercel.app/policies/privacy-policy
- https://high-fashion-shopify-template.vercel.app/policies/refund-policy
- https://high-fashion-shopify-template.vercel.app/policies/shipping-policy
- https://high-fashion-shopify-template.vercel.app/policies/terms-of-service

## Machine-readable surfaces

- `/llms.txt`
- `/sitemap.xml` and `/sitemap/[shard]`
- `/robots.txt`
- Markdown mirrors: `/md`, `/md/products/[handle]`, `/md/collections/[handle]`, `/md/search`, and
  the `.md` suffix on product, collection, home and search URLs

## Not built

- OTP, password and new-user registration screens; Shopify's hosted flow owns them
- A storefront payment page
- Order confirmation, tracking, cancellation, returns and wallet pages
