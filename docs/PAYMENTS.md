# Payments and checkout

How this storefront takes money, which provider it should use for an Indian audience, who owns the
payment state when a shopper refreshes mid-OTP, and the security and compliance rules for a
frontend-only storefront with Shopify as the commerce backend. It describes the repository as it
exists on 10 November 2026.

## 1. Where the integration stands

| Item                      | State                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Checkout handoff          | **Implemented**: `prepareCheckoutAction` reads `cart.checkoutUrl` and redirects to Shopify checkout |
| Payment provider          | **Not configured**; the development store has no live gateway                                       |
| Checkout test order       | **Not placed**; verification stops at the Shopify checkout redirect (and the store password gate)   |
| Payment code in this repo | **None, by design**: no card form, no UPI form, no gateway SDK, no payment state                    |
| GoKwik                    | **Not implemented**; the reference storefront uses it for Indian traffic                            |
| Store currency            | **USD**; Indian UPI requires INR, so this is a prerequisite decision, not a detail                  |

"Integration" here does not mean writing a payment form. The template's entire payment surface is:

```
Buy buttons / cart
  → Hydrogen cart handlers (/api/cart)          lib/cart/request.ts
  → prepareCheckoutAction reads checkoutUrl     lib/cart/action.ts
  → browser leaves for Shopify-hosted checkout  Shopify + payment provider
  → Shopify returns the shopper to the order status page
```

Everything after the redirect — the address form, payment method list, UPI app handoff, card 3DS,
OTP entry, retries, receipts — belongs to Shopify checkout and the payment provider. This is the
single most important architectural fact in this document: **the app never touches payment
credentials**, so most of the security burden is Shopify's and the gateway's, not ours.

## 2. India payment landscape (checked 10 November 2026)

### Shopify Payments is not available in India

Stores registered in India cannot use Shopify Payments, and **Shop Pay is part of Shopify Payments**,
so Shop Pay is not available either. Every Indian Shopify store takes prepaid orders through an
RBI-authorised third-party payment aggregator (PA) and pays two fees on each prepaid order:

1. **The gateway's MDR**, typically around 1.95–2% for domestic cards, UPI, netbanking and wallets,
   plus 18% GST. Premium methods and international cards cost more.
2. **Shopify's third-party transaction fee** on gateway orders: 2% on Basic, 1% on Grow, 0.6% on
   Advanced and 0.2% on Plus. It applies to UPI orders too, and it is not refunded when an order is
   refunded. Manual methods such as cash on delivery are exempt.

Rates change and are negotiable above meaningful volume. Treat the numbers above as the published
starting point and get a written quote before committing.

### Gateway shortlist

All of these are Indian, RBI-authorised payment aggregators with Shopify integrations and UPI
support. Published standard rates cluster tightly; the real differences are UPI success rate,
settlement speed, support, and how cleanly the Shopify integration behaves.

| Gateway        | Published standard rate                    | UPI                    | Shopify integration                              | Strengths                                                                                                         | Watch-outs                                                     |
| -------------- | ------------------------------------------ | ---------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Razorpay**   | ~2% domestic, ~3% international, + 18% GST | Yes, strong UPI Intent | Direct provider, mature app                      | Best developer experience, smart routing across acquirers, subscriptions/UPI AutoPay, Magic Checkout, refunds API | Slightly higher headline rate than Cashfree at some volumes    |
| **Cashfree**   | ~1.75–1.95% depending on method and volume | Yes                    | Direct provider                                  | Competitive pricing, fast settlements, strong UPI infrastructure                                                  | Verify current Shopify app behaviour and support SLAs yourself |
| **PayU**       | ~2%                                        | Yes                    | Alternative payment method (merchant key + salt) | Enterprise relationships, 100+ payment modes                                                                      | Older integration path; checkout UX varies by configuration    |
| **PhonePe PG** | ~1.99%                                     | UPI-first              | Direct provider                                  | UPI-native brand trust in India                                                                                   | Narrower non-UPI portfolio than Razorpay                       |
| **Paytm PG**   | ~1.99%                                     | Yes                    | Direct provider                                  | Paytm wallet reach                                                                                                | Wallet usage is declining relative to UPI                      |
| **CCAvenue**   | ~2%, plus possible setup fee               | Yes                    | Direct provider                                  | Very broad payment-mode coverage, long track record                                                               | Dated checkout UX, complex pricing                             |

**Recommendation: Razorpay as the primary gateway, with Cashfree as the commercial benchmark and
negotiation lever.** Razorpay has the most complete Shopify + API story for an Indian D2C store:
native UPI Intent, card tokenisation, subscriptions, refunds and webhooks, smart routing for
redundancy, and the best-documented integration. Choose Cashfree if its final quoted rate and
settlement terms are materially better; choose PayU only if enterprise support or an existing
relationship demands it. Do not choose a gateway on headline MDR alone — an 8-point UPI success-rate
gap costs far more than 0.1% of MDR.

### UPI specifics

- Enable **UPI Intent**, not only UPI Collect: on mobile the shopper is deep-linked into their UPI
  app, which converts substantially better than typing a VPA.
- UPI is INR-denominated. A USD-based store cannot offer a clean INR UPI flow, and third-party
  gateways process orders in the store's default currency — so **make INR the store currency** (or
  use Markets with INR presentment) before enabling payments. The current display-only USD/INR
  selector does not change the checkout currency and must not be treated as a payments solution.
- Show UPI in the footer payment marks and, if the business wants it, a UPI-specific offer; those are
  store configuration and copy, not code.

### "Multiple providers" — what Shopify actually supports

Shopify's native model is **one primary card gateway plus alternative payment methods and manual
methods** shown at checkout. It is not a built-in dual-gateway load balancer. In practice:

- One gateway (Razorpay) provides UPI, cards, netbanking, wallets and EMI inside Shopify checkout.
- Redundancy comes from the gateway's own smart routing across acquirers, not from adding a second
  primary gateway.
- Additional providers can be enabled as alternatives where Shopify exposes them, but expect
  reconciliation overhead and verify the exact shopper-facing behaviour in the admin before launch.
- Cash on delivery is a Shopify **manual payment method**: no gateway fee and no Shopify third-party
  fee, but it introduces RTO and verification risk.

If true multi-gateway traffic splitting is a requirement, it is a separate architecture decision
(gateway-level routing, or a checkout layer such as GoKwik) — not a toggle.

## 3. GoKwik: what it is, and whether to use it

GoKwik is **not a payment gateway or payment aggregator**. GoKwik states this explicitly: payment
routing and settlement are performed by licensed PAs integrated with its platform. GoKwik's product
is the checkout experience — Kwik Checkout: one-click checkout, saved addresses, UPI Intent,
payment-method offers, COD risk scoring and RTO reduction.

On Shopify it is an app that replaces or overlays Shopify checkout for eligible traffic. This
repository's reference storefront does exactly that: the Buy it now path branches on
`browsing_context_suggestions.json` — India opens a `pdp.gokwik.co` overlay, other markets go to
Shopify checkout. See `docs/reference/interactions/product-detail.md`.

| Dimension                   | Shopify checkout + Razorpay           | GoKwik Kwik Checkout                                                                                                      |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Who processes payments      | Razorpay (PA)                         | GoKwik's integrated PA partners (for example PayU, Worldline, Easebuzz)                                                   |
| Who owns checkout state     | Shopify                               | GoKwik's checkout session, with orders synchronized back to Shopify                                                       |
| PCI scope for us            | Smallest: hosted redirect             | Larger: third-party overlay embedded in our pages; due diligence required                                                 |
| COD/RTO tooling             | Basic manual method                   | Strong: risk scoring, COD verification, RTO interventions                                                                 |
| One-click / saved addresses | Through the gateway's own features    | Core product                                                                                                              |
| Cost                        | Gateway MDR + Shopify third-party fee | GoKwik commercial terms (quoted per brand) + underlying PA fees; may also interact with Shopify fees — confirm in writing |
| Headless fit                | Native (checkout URL)                 | Verify with GoKwik that their Shopify app supports this headless storefront and how order sync works                      |
| Operational load            | Lowest                                | Additional vendor, contract, DPA, reconciliation and support path                                                         |

**Recommendation: launch on Shopify checkout + Razorpay. Do not build GoKwik now.** GoKwik is worth
revisiting only if real data shows checkout conversion or COD/RTO is the binding constraint — it is a
conversion product, not a payment prerequisite, and it adds a vendor, a data-processing agreement and
a second checkout system to reconcile. If it is pursued later, require written answers on headless
support, PA partner identity, settlement flow, order creation in Shopify, refund path, webhook
contract, PCI attestation and DPDP processing terms before any code is written.

## 4. What happens when the shopper refreshes mid-payment

The scenario: the shopper has entered the UPI PIN or card OTP, the payment is processing, and the
browser refreshes, loses connection, or closes. The short answer: **nothing in this repository needs
to handle it, because the authoritative state is server-side at Shopify and the payment provider.**
The detail matters, though, so here is the full model.

### Who holds the state

```
Browser (our site)          Shopify checkout              Payment provider / UPI app
      │                          │                                  │
      │  redirect to checkoutUrl │                                  │
      ├─────────────────────────►│  create checkout session         │
      │                          ├─────────────────────────────────►│  authorization / UPI collect
      │   refresh / close  ✗     │                                  │  OTP / PIN entered
      │                          │◄─────────────────────────────────┤  result callback (server-to-server)
      │                          │  order paid / pending / failed   │
      │                          ├── orders/paid webhook            │
      │                          ▼                                  ▼
      │                    Shopify order + order status page + email
```

- The **checkout session and order live at Shopify**, not in our React state.
- The **authorization result lives at the payment provider**, which notifies Shopify
  server-to-server. A browser refresh cannot cancel or duplicate that notification.
- If the shopper pays and closes the tab, Shopify still records the payment and emails the order
  confirmation. The order appears in the Shopify admin and the customer's account.
- On returning to Shopify's order status page (or the confirmation email link), the shopper sees the
  final state. If the payment failed or is pending, Shopify shows that; retry happens there.
- Our app's cart cookie may be empty after a completed order, or may still hold the cart after a
  failed attempt. Both are normal; the cart page should simply render the current cart state.

### Rules this repo must keep

1. **Never store payment status in the browser.** No `localStorage` "pending payment" flag, no
   client-side order state, no trusting a URL parameter that says "success".
2. **Never clear or mutate the cart while the shopper is in checkout.** The browser is away; the cart
   remains valid until checkout completes. (The encoding is Hydrogen's cart cookie; it is not
   payment state.)
3. **Never poll the gateway from the frontend.** Payment confirmation arrives by webhook to the
   backend that owns fulfilment. For this storefront, that is Shopify.
4. **Keep `checkoutUrl` re-fetchable.** If the shopper returns and retries, `prepareCheckoutAction`
   reads the current checkout URL again; the app does not cache a stale one.
5. **Handle the return path gracefully.** A shopper can land back on `/cart`, the order status page,
   or the account orders page. All three already render from Shopify state.
6. **Do not build a custom "payment processing" screen.** It would be a lie: our app cannot know the
   result, and Shopify already owns that screen.

### If a webhook-driven backend is added later

Shopify can notify this app about `orders/paid`, `orders/cancelled` and `refunds/create`. That is only
needed if the backend performs fulfilment automation (for example Shiprocket), server-side analytics,
or custom notifications. When added:

- Verify `X-Shopify-Hmac-Sha256` over the raw body.
- Deduplicate on `X-Shopify-Webhook-Id`; Shopify retries, and handlers must be idempotent.
- Return `200` quickly and process asynchronously.
- Treat the webhook as the source of truth, never the browser redirect.
- The current handler (`app/api/webhooks/shopify/route.ts`) handles product, collection and
  metaobject topics only; it does not consume order topics yet.

## 5. Security protocols

### Scope: what we must never touch

- No card number, expiry, CVV, UPI PIN, OTP, or bank credentials in our UI, logs, analytics or
  error reports.
- No payment form built with our inputs, even "just for validation".
- No gateway secret keys in `NEXT_PUBLIC_*` variables or client bundles.
- No order marked paid, fulfilled or refunded from frontend code.

### PCI DSS

With Shopify-hosted checkout and a redirect, the storefront's PCI scope is the lightest form
(typically SAQ A): the merchant does not store, process or transmit cardholder data. An embedded
overlay or iframe (for example GoKwik) moves the merchant toward SAQ A-EP and requires a written
attestation from the vendor. Confirm the exact SAQ with the acquiring bank or a QSA — do not assume.

### Transport and browser hardening

- HTTPS everywhere; HSTS at the Vercel edge.
- A Content Security Policy that allowlists only the checkout/gateway/overlay domains actually used.
  No wildcard `frame-src` or `script-src`.
- `HttpOnly`, `Secure`, `SameSite=Lax` cookies for customer sessions (already implemented). The cart
  cookie carries only a cart identifier, never payment data.
- No secrets in client bundles; server-only environment variables for gateway and webhook secrets.
- Dependency lockfile, regular audit, least-privilege Shopify app scopes.

### Webhooks and cache endpoints

- Verify Shopify HMAC on the raw body before parsing.
- Idempotency keys and replay protection for every state-changing webhook.
- Bearer-token authentication for `/api/revalidate`; rotate `REVALIDATE_SECRET` on a schedule.
- Rate-limit public endpoints and bot-protect checkout-adjacent forms (BotID, Vercel Firewall).

### Fraud and abuse

- Use Shopify's fraud analysis plus the gateway's risk engine; review high-value and mismatched
  address/email orders before fulfilment.
- COD needs explicit controls: phone verification (OTP), address quality checks, velocity limits,
  blocklists and RTO scoring if COD volume grows. Shopify's COD app ecosystem or GoKwik can supply
  these; do not build identity checks from scratch.
- Enable gateway webhooks and daily reconciliation; a payment captured without an order (or vice
  versa) must alert, not silently vanish.
- Refunds and chargebacks are operated in Shopify admin and the gateway dashboard; they are not
  frontend features.

### Logging and privacy

- Redact emails, phone numbers, addresses, tokens and any payment identifiers from logs.
- Do not send payment events to GA4/GTM with personal data; analytics receives order value and
  method only after Shopify confirms the order.
- Apply data minimisation to the wishlist, currency and newsletter state already stored in
  `localStorage`; none of it is payment data.

### India compliance checklist

- Use only an **RBI-authorised payment aggregator**; confirm the authorisation on the provider's site
  and in the contract.
- **Card tokenisation** and **UPI MDR** rules are the gateway's responsibility; confirm current terms,
  including the 2026 UPI merchant MDR changes reported for payments above ₹2,000.
- **DPDP Act 2023**: lawful notice and consent, purpose limitation, breach notification, grievance
  officer and data-principal rights. Payment data processing terms belong in the gateway's DPA.
- **Consumer Protection (E-Commerce) Rules 2020**: named grievance officer, refund timelines,
  country-of-origin and seller details.
- **GST**: correct tax configuration in Shopify, tax invoices for every order, e-invoicing above the
  applicable threshold, and credit notes for refunds. Shopify handles collection; invoicing may need
  an app or the merchant's accounting system.

## 6. Launch checklist

### Decisions before configuration

- [ ] Base currency **INR** (recommended) or a Markets model with INR presentment.
- [ ] Primary gateway (Razorpay recommended) and whether Cashfree/PayU is a real fallback.
- [ ] Cash on delivery: yes/no, and who verifies COD orders.
- [ ] GoKwik: defer (recommended) or commission a separate evaluation.

### Shopify admin

- [ ] Complete gateway KYC and activate the provider.
- [ ] Enable UPI (Intent), cards, netbanking, wallets and EMI as the business allows.
- [ ] Set INR pricing, taxes, shipping zones and return/refund policy.
- [ ] Add COD as a manual payment method only with verification rules.
- [ ] Disable the Shop Pay button for this market: `shopConfig.pdp.buyWithShop` is currently `true`,
      but Shop Pay requires Shopify Payments, which is unavailable in India.
- [ ] Remove the Online Store password and place a real test order (then refund it).
- [ ] Configure order notification emails and the sender address; the payment receipt comes from
      Shopify/the gateway, not this app.

### Repository

- [ ] No checkout code changes are required for the Shopify checkout path.
- [ ] Update `components/footer/payment-marks.tsx` to the methods actually offered (add UPI; drop
      marks the store does not accept).
- [ ] Keep `prepareCheckoutAction` as the only checkout entry point; do not add a second checkout.
- [ ] If order webhooks are added, extend the existing handler with HMAC verification and
      idempotency; do not create a parallel endpoint.

### Verification

- [ ] UPI Intent on Android and iOS, including app-switch return.
- [ ] Card payment with 3DS/OTP, success and failure.
- [ ] Netbanking and one wallet.
- [ ] Refresh during OTP; close the tab after payment and confirm the order still appears in Shopify
      and in the customer's account.
- [ ] Refund from Shopify admin and confirm the customer notification.
- [ ] Verify the order status page, confirmation email and account order history agree.
- [ ] Run a low-value live order after launch and reconcile it against the gateway settlement report.

## 7. Open decisions

| Decision                   | Current state   | Recommendation                                           |
| -------------------------- | --------------- | -------------------------------------------------------- |
| Store currency             | USD             | Move to INR before taking Indian payments                |
| Primary gateway            | None configured | Razorpay                                                 |
| Fallback / second provider | None            | Negotiate Cashfree; rely on Razorpay smart routing first |
| GoKwik checkout            | Not implemented | Defer until conversion or RTO data justifies it          |
| COD                        | Not configured  | Only with verification and RTO controls                  |
| Order webhooks             | Not consumed    | Add only when fulfilment or analytics needs them         |
| Payment marks              | Six card brands | Mirror the real method mix, including UPI                |

## 8. Cross-references

- [`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md) G6 (currency) and G8 (GoKwik) — the decision records.
- [`VERCEL-DEPLOYMENT.md`](./VERCEL-DEPLOYMENT.md) — deployment and webhook configuration.
- [`SHIPROCKET.md`](./SHIPROCKET.md) — fulfilment, the consumer of `orders/paid` if it is added.
- [`AUTHENTICATION.md`](./AUTHENTICATION.md) — account sign-in, a separate flow from checkout.
- [`FRONTEND-ARCHITECTURE.md`](./FRONTEND-ARCHITECTURE.md) §6 — cart and checkout code ownership.
- `docs/reference/interactions/product-detail.md` — the measured GoKwik overlay on the reference store.
