# Authentication and sign-in

How customers sign in on this storefront, and — the question that prompted this document — where
the one-time verification code (OTP) comes from. It describes the repository as it exists on
9 November 2026, with `shopConfig.auth.isEnabled = true`.

## The short answer

**Shopify sends the OTP, not this codebase.** The sign-in screen is a Shopify-hosted page, and by
default Shopify's new customer accounts are passwordless: the customer enters their email address,
Shopify emails them a one-time 6-digit verification code from the store's sender email address, and
they type it back on Shopify's page. This template never renders a sign-in form, never generates a
verification code, and never sees the code — by the time the customer returns to this domain, they
have already proven their identity to Shopify and this app only receives an OAuth authorization
code, which it exchanges for tokens.

Also accurate as of today:

- **Sign-in by mobile number is not an option** for Shopify's new customer accounts. An SMS OTP
  reaches customers only through **Sign in with Shop**: shoppers recognized through Shop Pay can
  sign in with one click, or receive the one-time code by SMS to the phone on their Shop account
  (falling back to email when no phone is linked).
- **Email + password sign-in is not supported** in new customer accounts. Legacy accounts still
  support it, but this template integrates the new accounts only.
- **The verification-code email's content cannot be edited.** Its sender address follows the
  store's sender email in Shopify settings, and the sign-in page's branding is customized in the
  checkout and accounts editor — both are store configuration, not code.
- More sign-in options (Google, Facebook, Apple social sign-in; single sign-on) are Shopify admin
  settings and work alongside the default email code. A custom identity provider that could offer
  SMS OTP, passwords, or other methods exists, but only for Shopify Plus stores.

## The sign-in flow, step by step

```
Account icon (components/nav/account.tsx)
  → href /account/login                       client-side link only
  → proxy.ts customerHandlers()               lib/auth/request.ts, Hydrogen createCustomerAccountServerHandlers
  → redirect to Shopify's hosted sign-in page  off-site, store-branded
  → customer enters email
  → SHOPIFY EMAILS THE ONE-TIME 6-DIGIT CODE   ← Shopify platform; not our code
  → customer enters the code on Shopify's page
  → Shopify redirects to the callback URL      /account/callback on this domain
  → proxy completes the OAuth code exchange    access token + refresh token, confidential client
  → session encrypted into cookies             lib/auth/request.ts, futher below
  → redirect to the originally requested page  default /account
```

Failure lands on `/account/sign-in-failed`, which `proxy.ts` sets as Hydrogen's
`loginFailedRedirectPath`. Signing out is a same-origin POST to `/account/logout`: it clears the
local session and performs Shopify RP-initiated logout, then returns the shopper to `/`.

## What Shopify owns versus what this template owns

| Concern                                    | Owner             | Details                                                                                                                                                          |
| ------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generating and sending the one-time code   | **Shopify**       | Email by default; SMS via Sign in with Shop. Content is not customizable.                                                                                        |
| The sign-in screen and its branding        | **Shopify**       | Hosted on the store domain; branded through the checkout and accounts editor.                                                                                    |
| Which sign-in options exist                | **Shopify admin** | Email code is always on; Shop, social and custom IdP are opt-in store settings.                                                                                  |
| New-customer conversion on first sign-in   | **Shopify**       | Signing in with an unknown email creates the customer profile automatically.                                                                                     |
| The OAuth redirect chain and callback URLs | **Template**      | Registered as the Headless storefront's callback/logout URLs; served by `proxy.ts`.                                                                              |
| Token exchange and storage                 | **Template**      | Confidential client: token exchange uses `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` / `..._SECRET` server-side.                                                    |
| Session cookies and lifetime on this site  | **Template**      | See below. 7 days here; Shopify's own platform session can stay valid up to 365 days for other Shop surfaces.                                                    |
| Refreshing tokens                          | **Template**      | Only where cookies can be written: `/account/refresh`. Server Components never refresh.                                                                          |
| Gating account pages                       | **Template**      | `requireCustomerSession()` for routes, `requireCustomerAccessToken()` immediately before Customer Account API calls, `isCustomerLoggedIn()` for header UI state. |

## The template's session mechanics

`lib/auth/request.ts` owns the storage; `lib/auth/server.ts` owns the read helpers used by Server
Components.

- Cookie family: `shop_customer_session.0` through `.3`. The encrypted payload is split into up to
  four cookie chunks of 3,800 bytes.
- Cipher: AES-256-GCM, key derived as SHA-256 of `CUSTOMER_ACCOUNT_SESSION_SECRET` (an app-generated
  secret, distinct from the Shopify client secret). The auth-tag length is pinned so Node does not
  accept short forged tags.
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `Max-Age` 7 days (7 × 24 h), `Secure` whenever the origin
  is HTTPS.
- Refresh: an expired-but-refreshable access token triggers a redirect through `/account/refresh`.
  Hydrogen performs the refresh there, commits the new cookies, and returns the shopper to the
  original URL with a `refreshed` marker so a second refresh cannot loop. A refresh attempt
  propagates through the `x-customer-refresh-attempted` header.
- Your selected `.env.local` value is the encryption key material for exactly this session cookie —
  it protects the tokens this template stores, not anything Shopify sends.

## If the brief requires mobile-number OTP

A standalone "enter your phone, receive an SMS code" sign-in is a product decision, because Shopify
has two different answers depending on plan:

| Option                               | What it means                                                                                                        | Requirements                                                                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Sign in with Shop (recommended path) | Customers with Shop Pay accounts get one-click or SMS-code sign-in; email fallback otherwise.                        | Activate Shop Pay; a store configuration, no code.                                                                         |
| Custom identity provider             | Replace Shopify's sign-in page with an OIDC provider that can send SMS OTP (or passwords).                           | Shopify Plus, an IdP (Auth0, Okta, …), registering its URLs with Shopify. Largest change; replaces the default experience. |
| Build OTP in this template           | Not an integration: the template would have to verify identity itself, which duplicates Shopify's customer identity. | Not viable while accounts live in Shopify.                                                                                 |

Whichever path is chosen, the callback/logout URL registration and `.env` secrets documented in
[`VERCEL-DEPLOYMENT.md`](./VERCEL-DEPLOYMENT.md) stay the same; only the hosted sign-in step changes.

## Verifying sign-in locally

Customer Account OAuth requires an HTTPS origin, so local testing runs through `pnpm dev:portless`
or a tunnel, with the three auth variables set (all three are required while `auth.isEnabled` is
true). The checks worth running after touching auth:

1. Sign in with a real email; confirm the code arrives from the store's sender address.
2. Confirm the session survives a full reload and that the header shows the signed-in state.
3. Let the access token lapse, open an account page, and confirm `/account/refresh` returns you to
   the same page without a fresh sign-in.
4. Sign out: confirm the POST clears the session cookies and Shopify terminates its session.
5. Force a failure (cancel the OAuth round trip) and confirm `/account/sign-in-failed` renders.

## Cross-references

- [`SHOPIFY-WALKTHROUGH.md`](./SHOPIFY-WALKTHROUGH.md) §8.4 — the OAuth plumbing in detail.
- [`FRONTEND-ARCHITECTURE.md`](./FRONTEND-ARCHITECTURE.md) §6 — where auth code lives in the repo map.
- [`VERCEL-DEPLOYMENT.md`](./VERCEL-DEPLOYMENT.md) — production callback/logout URLs and secrets.
- Shopify Help Center, _Sign-in options for customer accounts_ — the authoritative source for
  sign-in methods and what is customizable.
