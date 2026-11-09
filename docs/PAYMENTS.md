# Payments and checkout

How this storefront takes money, how an Indian gateway is actually incorporated now that Shopify
Payments is unavailable, which gateway to choose and what each choice trades away, who owns the
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
| GoKwik / Magic Checkout   | **Not implemented**; the reference storefront uses GoKwik for Indian traffic                        |
| Store currency            | **INR** (set 10 November 2026); catalog prices are final INR values                                 |

"Integration" here does not mean writing a payment form. The template's entire payment surface is:

```
Buy buttons / cart
  → Hydrogen cart handlers (/api/cart)          lib/cart/request.ts
  → prepareCheckoutAction reads checkoutUrl     lib/cart/action.ts
  → browser leaves for Shopify-hosted checkout  Shopify + payment provider
  → Shopify returns the shopper to the order status page
```

Everything after the redirect — address, payment method list, UPI app handoff, card 3DS, OTP,
retries, receipts — belongs to Shopify checkout and the provider. **The app never touches payment
credentials**, so most of the security burden is Shopify's and the gateway's, not ours.

## 2. The gateway model Shopify actually enforces

**Shopify Payments is not available to Indian businesses**, and **Shop Pay is part of Shopify
Payments**, so neither can be used. UPI, cards, netbanking and wallets therefore come from a
third-party Indian payment aggregator (PA), and Shopify charges its own third-party transaction fee
on every prepaid order.

### Direct versus external providers

Shopify supports two kinds of third-party provider, and the difference is the shopper experience:

|                       | Direct provider                                                                | External provider                                                                             |
| --------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Where payment happens | Inside Shopify checkout                                                        | Provider-hosted page, then a redirect back                                                    |
| Example               | PayU onsite cards app; Cashfree cards app; Razorpay Direct (cards only)        | Razorpay Secure; PayU's full-method app; Cashfree's full-method app; PhonePe; Paytm; CCAvenue |
| UPI                   | Only if the provider's direct app supports it; most direct apps are cards-only | Yes, on the hosted page                                                                       |
| Friction              | Lower for the methods it covers                                                | One extra redirect and page load                                                              |

### One primary card provider

Shopify permits **one active credit-card provider at a time**. Other providers can exist only as
additional alternative methods or manual methods (COD, bank transfer). The practical model is
**one gateway carrying UPI, cards, netbanking and wallets, plus manual methods**. Two primary card
gateways cannot run side by side, and payment-method routing by cart value or country is not a
native Shopify feature. Redundancy comes from the gateway's own smart routing instead.

A custom checkout is not an option on non-Plus plans. Checkout UI extensions on the
information/shipping/payment steps are Plus-only; building a merchant-owned payment method is
Plus-only and requires an approved Payments Partner. For this storefront, checkout stays
Shopify-hosted.

### Shopify's third-party transaction fee

| Plan     | Monthly (monthly billing) | Third-party fee |
| -------- | ------------------------- | --------------- |
| Basic    | ₹1,994                    | 2.0%            |
| Grow     | ₹7,447                    | 1.0%            |
| Advanced | ₹30,164                   | 0.6%            |
| Plus     | from ₹1,75,000            | 0.2%            |

It is charged on `(products − discounts) + tax + shipping`, applies to UPI as well as cards, is
excluded for COD/manual methods, and is credited pro rata when a refund is issued through Shopify
admin (because Shopify Payments is unavailable in India). It is not capped.

Break-even for upgrading on monthly billing: Basic → Grow at about **₹5.45 lakh/month** of gateway
GMV, Grow → Advanced at about **₹56.8 lakh/month**, Advanced → Plus at about **₹3.6 crore/month**.
Annual billing lowers the first two to roughly ₹4.1 lakh and ₹42.7 lakh. Plan features can justify
an upgrade earlier; the fee alone usually does not.

## 3. Currency: resolved

The store currency is **INR** (set 10 November 2026), so third-party providers receive INR and UPI
can appear. There is no remaining currency work for launch.

- Variant prices are **final INR values**. They were set at 100× the former USD amounts when the
  store moved to INR; the cached source INR catalog is no longer the target.
- The storefront shows INR only; the former display-only USD option was removed, so there is no
  conversion note to show.
- Keeping international shoppers is a Markets decision: markets can adjust **prices** (catalogs,
  adjustments, rounding) on any plan, but without Shopify Payments they are still **charged in INR**
  with FX handled by the card network or gateway.
- Changing store currency after the first sale requires Shopify Support and resets market
  currencies, shipping rates, gift cards, app behaviour and reports; the store has no orders, so the
  INR change is settled.

The free-shipping threshold and copy are ₹50,000.

## 4. How Razorpay is incorporated (recommended path)

### What the integration is

The standard Razorpay Shopify app is **"Razorpay Secure"** — an **external** provider. It appears in
Shopify checkout as "Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)". The shopper completes the
Shopify checkout, is redirected to Razorpay's hosted page, enters a phone number, chooses UPI/card/
netbanking/wallet, pays, and returns to Shopify's confirmation. UPI always takes this redirect path.

Razorpay also publishes **"Razorpay Direct - Credit Card"**, a separate **onsite, cards-only** app.
Because Shopify allows one credit-card provider at a time, choosing between the all-method redirect
app and the cards-only onsite app is effectively exclusive; confirm the current behaviour with
Shopify and Razorpay before committing.

### Setup sequence

1. **Confirm the store currency is INR** and that prices, discounts and shipping are final. Do this
   before the first order.
2. **Complete Razorpay KYC** for the legal entity: PAN, address and bank proof, entity documents
   (CIN/MOA/AOA/board resolution for a company), GST certificate or the no-GST route, and a video
   KYC/cancelled-cheque fallback. The business name and address must match the website.
3. **Publish a reviewable store**: live URL, About, Contact, Terms, Privacy, Refund/Shipping
   policies and a sample invoice. Remove the Shopify password page. A password-protected store
   cannot pass underwriting.
4. **Use a paid Shopify plan** if you need test orders; trials cannot place them.
5. In Shopify admin: **Settings → Payments → Add payment method → search Razorpay → install →
   sign in as the store owner → activate**. The standard app uses OAuth; there are no API keys to
   paste. One Razorpay MID per Shopify store.
6. Set **Settings → Checkout → Customer contact method = "Phone number or email"**; Razorpay needs a
   phone number.
7. Enable the methods the business wants: UPI Intent/QR, cards, netbanking, wallets, EMI. EMI,
   international cards, Apple Pay, COD and Magic Checkout are separate activations.
8. **Test with both toggles on**: Shopify's Razorpay test mode and Razorpay Dashboard test mode.
   Test success (`success@razorpay`), failure (`failure@razorpay`), a card 3DS flow and a refund. UPI
   Intent and Apple Pay are live-only; test mode simulates them.
9. Go live, place a low-value real order, then refund it from Shopify admin and reconcile the
   settlement report.

### What to expect, and the limits

- **Refunds:** initiate in Shopify admin; Razorpay returns the money to source in about 5–7 working
  days. Refunds older than six months fail. Shopify credits its third-party fee pro rata when the
  refund goes through Shopify admin.
- **Settlement:** domestic T+2 working days standard, with instant settlement available on request;
  international T+7 plus reserves. All settlements are in INR.
- **Chargebacks:** handled in the Razorpay Dashboard; lost disputes are debited from the live
  balance. Shopify's dispute tools are for Shopify Payments only.
- **Reconciliation:** Shopify stores the Razorpay Payment ID; match it against Razorpay's Order ID
  column or use Shopify's Payments Report. No merchant webhook is required for the standard app.
- **Test mode blocks live orders** while enabled; leaving it on is a common launch failure.
- **Subscriptions, UPI AutoPay and Route are not supported** by the Shopify plugin.
- **UPI Collect has been deprecated** in favour of UPI Intent/QR (with limited exceptions); mobile
  shoppers are deep-linked into their UPI app, desktop shows a QR.
- **Magic Checkout's Shopify app is theme-bound** (it needs a published theme and a Liquid snippet)
  and does not load on this headless storefront. A documented custom Next.js path exists, but it
  bypasses Shopify checkout, requires server routes, INR and order creation — treat it as a
  separate project, not a configuration toggle.
- **Capture risk:** Razorpay notes that a small share of authorised payments can fail capture and
  auto-refund; verify captured status before fulfilment.
- **Support and reviews:** the Razorpay Secure listing has little review history, and the Magic
  Checkout app is poorly rated. Judge on your own pilot, not app-store stars.

### Published Razorpay cost

| Item                                                       | Rate                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Domestic cards, UPI, netbanking, wallets, RuPay debit      | **2% platform fee** + 18% GST = **2.36% effective**                                  |
| EMI, corporate/Amex/Diners, pay-later, international cards | **3%** + 18% GST = **3.54% effective**                                               |
| Setup / AMC / refund fee                                   | ₹0                                                                                   |
| New-merchant offer                                         | 0% platform fee up to ₹5 lakh or 90 days for accounts activated on/after 1 July 2026 |

UPI carries zero MDR at the bank level, but Razorpay's 2% is a **platform fee**, so UPI is not free.
NPCI's separate 0.4% MDR on P2M UPI above ₹2,000 (capped at ₹300 at ₹75,000) was deferred from
15 October 2026 and, as of 10 November, has no confirmed new date. Model it as a possible future
cost; confirm with Razorpay whether it is included in or added to the quoted fee.

## 5. How PayU, Cashfree and the others fit

All of these install through Shopify's Payments settings and work headless because the integration
lives in Shopify checkout, not in the theme. The differences are redirect friction, credentials,
fees and support.

| Gateway        | Integration on Shopify                                                                                            | Checkout path                                                                | Published domestic rate                                           | Strengths                                                                                  | Watch-outs                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Razorpay**   | Razorpay Secure app (OAuth, all methods) + separate Direct Card app                                               | External redirect; cards-only direct app available                           | 2% + GST (2.36%)                                                  | Best documentation, OAuth setup, refunds and reconciliation, smart routing, 135 currencies | UPI and cards redirect; no subscriptions; Magic Checkout not headless                             |
| **PayU**       | Two apps: "Cards, UPI, NB by PayU India" (external) and "Onsite Card Payments by PayU India" (direct, cards only) | Hosted redirect for UPI/NB/wallet; cards stay on Shopify with the onsite app | ~1.85% cards; 0.90% Visa/MC debit; 0% UPI (published, verify)     | Only provider here that keeps card entry inside Shopify checkout while hosting UPI         | Merchant key + salt handling; slower support reputation; two apps to reason about                 |
| **Cashfree**   | "1Cashfree" (external) + "Cashfree Payments – Cards" (direct)                                                     | Redirect for full methods; cards direct                                      | 1.95% + GST (2.30%); 0% promo on first ₹20 lakh until 31 Mar 2027 | Cheapest standard rate, fast settlement, clean docs, direct card app                       | Promo/fair-use terms; less ecosystem breadth than Razorpay                                        |
| **PhonePe PG** | PhonePe PG app (OTP login)                                                                                        | External redirect                                                            | 1.99% + GST                                                       | UPI brand trust, T+1 settlement claims                                                     | Thinnest Shopify integration; no published method-wise or international rate; refund path unclear |
| **Paytm PG**   | Paytm app (login + MID)                                                                                           | External redirect                                                            | ~1.99% credit card; 0% UPI (published, contradictory)             | Paytm wallet reach, low debit-card rates                                                   | Weakest-reviewed app; pricing pages conflict; declining wallet share                              |
| **CCAvenue**   | CCAvenue app (Merchant ID + Access Code + Working Key)                                                            | External redirect                                                            | 2% + 0.20% Shopify-plugin surcharge; optional ₹20,000 setup       | Broad acquiring coverage, 27 currencies, 200+ modes                                        | Dated UX, highest effective cost, legacy integration                                              |

**PayU in more detail:** it is one of three providers with a direct card app (alongside Razorpay
Direct and Cashfree's cards app), and its split between hosted UPI and onsite cards is the clearest
example of the trade. Keeping card entry inside Shopify checkout can matter for card-heavy high-AOV
orders, but it requires handling merchant key/salt and running two apps. It is not a "better
Razorpay" across the board; it is a card-friction trade.

**Cashfree in more detail:** the value alternative. At 1.95% + GST it is slightly cheaper than
Razorpay, has a direct card app, and runs aggressive new-merchant offers. Verify the offer's
fair-use conditions, support SLAs and the exact Shopify app behaviour before switching.

**PhonePe, Paytm, CCAvenue:** choose only for a specific reason — PhonePe for UPI-first brand
association, Paytm for wallet users, CCAvenue for existing enterprise relationships or unusual
currency/method coverage. None is a stronger default than Razorpay or Cashfree for this store.

## 6. The trade-off, stated plainly

| If the priority is…                       | Choose                                           | What you give up                                           |
| ----------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| Lowest launch risk and best documentation | **Razorpay Secure**                              | Every method redirects; 2% on UPI; T+2 settlement          |
| Cheapest standard rate                    | **Cashfree** (or its promo)                      | Smaller ecosystem and support surface; verify offer terms  |
| Card conversion inside Shopify checkout   | **PayU onsite cards** (or Cashfree direct cards) | Key/salt handling; UPI still redirects; two apps to manage |
| Enterprise acquiring breadth              | **CCAvenue** or **PayU**                         | Cost and dated UX                                          |
| UPI brand trust                           | **PhonePe PG**                                   | Weakest Shopify integration and refund tooling             |

**Recommendation: launch on INR + Shopify checkout + Razorpay Secure.** It has the cleanest setup
(OAuth, no credential paste), the best-documented refund/reconciliation path, smart routing for
redundancy, and the broadest international coverage. The redirect is the same friction every Indian
UPI flow has on Shopify; PayU's onsite cards are the only structural exception, and that is a
conversion experiment to run later, not a launch blocker. Revisit Cashfree if its written rate and
settlement terms beat Razorpay by enough to justify the migration; revisit PayU only if card
checkout data shows the redirect is costing meaningful revenue.

**Do not plan on dual primary gateways.** Shopify's model is one credit-card provider; a second
provider can only be an alternative or manual method. If gateway redundancy matters, use Razorpay's
own smart routing and keep a tested rollback plan.

## 7. GoKwik and Magic Checkout: checkout layers, not gateways

**GoKwik is not a payment aggregator.** Its own materials state that payment routing and settlement
are performed by licensed PAs integrated with the platform; GoKwik supplies the checkout experience
and COD/RTO tooling. Its Shopify app requires theme edits, checkout extensions and Shopify
Functions, and its public documentation does not describe a Hydrogen/headless integration. For this
storefront, headless support is **unverified** and must be confirmed in writing before contracting.
The reference storefront uses a GoKwik overlay for Indian traffic; that is evidence it can work on
a Shopify storefront, not evidence it will work on this headless one.

**Razorpay Magic Checkout** replaces Shopify checkout with a one-page Razorpay flow. The app version
is theme-based and does not run headless. Razorpay documents a custom Next.js integration that
creates the Shopify order through Razorpay's endpoints, but it bypasses Shopify checkout, needs
server routes, signature verification and an INR store, and adds a second checkout to reconcile.
Do not use it as the baseline; evaluate it only as a separate conversion project with a fallback to
Shopify checkout.

Both layers expand the data-processing surface: they collect phone, address and cart data before
payment, so the DPA and DPDP obligations grow beyond a standard payment-processing agreement.

## 8. What happens when the shopper refreshes mid-payment

The scenario: the shopper has entered the UPI PIN or card OTP, the payment is processing, and the
browser refreshes, loses connection, or closes. The short answer: **nothing in this repository needs
to handle it, because the authoritative state is server-side at Shopify and the payment provider.**

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

- The **checkout session and order live at Shopify**, not in React state.
- The **authorization result lives at the provider**, which notifies Shopify server-to-server. A
  browser refresh cannot cancel or duplicate that notification.
- If the payment is pending, Shopify records the order as **Payment pending**, sets an expiry
  (typically about a week), blocks editing/cancelling/marking it paid, and emails a **Pay now** link
  if the payment fails. Unresolved payments become **Expired**. No storefront code participates.
- If the shopper pays and closes the tab, Shopify still records the payment and emails the order
  confirmation; the order appears in the admin and the customer's account.
- `checkoutUrl` can go stale. Re-request it before navigating; do not cache it indefinitely.
- Our cart cookie may be empty after a completed order, or still hold the cart after a failed
  attempt. Both are normal; render the current cart state.

### Rules this repo must keep

1. **Never store payment status in the browser.** No `localStorage` "pending payment" flag, no
   client-side order state, no trusting a URL parameter that says "success".
2. **Never clear or mutate the cart while the shopper is in checkout.** The browser is away; the
   cart remains valid until checkout completes.
3. **Never poll the gateway from the frontend.** Payment confirmation arrives by webhook to the
   backend that owns fulfilment. For this storefront, that is Shopify.
4. **Keep `checkoutUrl` re-fetchable.** `prepareCheckoutAction` reads the current URL each time.
5. **Handle the return path gracefully.** A shopper can land back on `/cart`, the order status page,
   or the account orders page. All render from Shopify state.
6. **Do not build a custom "payment processing" screen.** Our app cannot know the result, and
   Shopify already owns that screen.

### Webhooks, if a backend is added later

Shopify can notify this app about `orders/paid`, `orders/cancelled` and `refunds/create`; that is
needed only for fulfilment automation, server-side analytics or custom notifications. When added:

- Verify `X-Shopify-Hmac-Sha256` over the raw body with a timing-safe compare.
- Deduplicate on `X-Shopify-Webhook-Id`; Shopify retries, and handlers must be idempotent.
- Return `200` within 5 seconds; Shopify retries over about 4 hours, then deletes a failing
  subscription after repeated failures.
- Treat the webhook as the source of truth, never the browser redirect.
- **Admin-created webhooks cannot target a custom domain attached to the store.** Use an app-managed
  subscription (Admin API `webhookSubscriptionCreate` / `shopify.app.toml`) or a separate endpoint
  domain. The current handler (`app/api/webhooks/shopify/route.ts`) handles product, collection and
  metaobject topics only.

## 9. Security and compliance

### Never touch payment credentials

No card number, expiry, CVV, UPI PIN, OTP or bank credentials in the UI, logs, analytics or error
reports. No payment form built from our inputs. No gateway secret keys in `NEXT_PUBLIC_*` variables.
No order marked paid, fulfilled or refunded from frontend code.

### PCI DSS

| Flow                                                | Typical SAQ                                                                              | Notes                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Redirect to Shopify checkout, then provider page    | **SAQ A**                                                                                | Merchant never receives card data; still requires quarterly ASV scans of every e-commerce page |
| Provider iframe/overlay on our page (Magic, GoKwik) | **SAQ A**, if all card fields are provider-hosted and the site is not script-susceptible | Collect the provider's AoC, ASV attestation and DPA                                            |
| Our own card form posting to a provider             | **SAQ A-EP**                                                                             | Do not build this                                                                              |
| Merchant scripts/pixels injected into checkout      | Moves toward A-EP/D                                                                      | Keep third-party scripts out of payment pages                                                  |

Collect: current Attestation of Compliance naming the legal entity and assessed products, ASV scan
attestation, PCI Level 1 listing, SOC 2 Type II, ISO 27001, subprocessor list, signed DPA, breach
notification SLA and a pen-test summary. The merchant still owns the annual SAQ, quarterly scans,
vendor register, incident-response plan, least-privilege admin, CSP and log hygiene.

### India checklist

- **Use an RBI-authorised PA and verify the legal entity, not the brand.** Examples: Razorpay
  Payments Pvt Ltd, Cashfree Payments India Pvt Ltd, PayU Payments Pvt Ltd. Check the RBI
  authorised-entity register and match the name on the checkout page and settlement account.
- **Card tokenisation**: only network-issued Card-on-File tokens; the merchant never stores PAN.
- **UPI MDR**: the 0.4% P2M charge above ₹2,000 is deferred; watch NPCI for the effective date and
  confirm how the gateway applies it.
- **E-mandates** apply only if subscriptions/recurring payments are introduced: AFA registration,
  24-hour pre-debit notice, AFA-free debits up to ₹15,000.
- **DPDP Act 2023 / DPDP Rules 2025**: itemised notice, specific consent with separate marketing
  opt-in, purpose limitation, grievance officer, retention/erasure, 72-hour breach report. The
  gateway DPA must cover roles, data categories, India-only storage, subprocessors, breach notice,
  audit rights, DSAR assistance, deletion on termination and no independent use.
- **Consumer Protection (E-Commerce) Rules 2020**: legal name, address, contact and grievance
  officer; acknowledge complaints within 48 hours and redress within one month; publish the
  return/refund policy.
- **GST**: tax invoice within 30 days, correct tax breakup at checkout, credit notes for refunds,
  e-invoicing above the applicable threshold.

### Storefront controls

- HTTPS/HSTS; CSP that allowlists only the payment origins actually used; no wildcard
  `frame-src`/`script-src`; `report-to` monitoring.
- Server-only secrets, distinct per environment, rotated on schedule and on staff change.
- Webhook HMAC + idempotency; rate limits and bot protection on checkout-adjacent endpoints.
- No PII or payment identifiers in logs, analytics, error trackers, session replay or
  `localStorage`.
- COD controls if COD is enabled: phone verification, address quality, velocity limits, pincode
  blocklists, RTO scoring and a manual review queue.
- Incident response: rotate gateway keys, `SHOPIFY_WEBHOOK_SECRET`, `REVALIDATE_SECRET` and the
  customer session secret; preserve logs; notify the PA and CERT-In within 6 hours and the Data
  Protection Board within 72 hours where applicable.

## 10. Launch checklist

### Decisions before configuration

- [ ] Base currency **INR** (recommended) or a Markets model with INR charges.
- [ ] Primary gateway (Razorpay recommended) and whether PayU/Cashfree is a real fallback.
- [ ] Cash on delivery: yes/no, and who verifies COD orders.
- [ ] GoKwik / Magic Checkout: defer (recommended) or commission a separate evaluation.

### Shopify admin

- [ ] Complete gateway KYC and activate the provider.
- [ ] Enable UPI (Intent/QR), cards, netbanking, wallets and EMI as the business allows.
- [ ] Set INR pricing, taxes, shipping zones and return/refund policy.
- [ ] Add COD as a manual payment method only with verification rules.
- [ ] Set checkout customer contact to phone or email; Razorpay needs a phone number.
- [ ] Disable the Shop Pay button: `shopConfig.pdp.buyWithShop` is currently `true`, but Shop Pay
      requires Shopify Payments, which is unavailable in India.
- [ ] Remove the Online Store password and place a real test order (then refund it).
- [ ] Configure order notification emails and the sender address.

### Repository

- [ ] No checkout code changes are required for the Shopify checkout path.
- [ ] Update `components/footer/payment-marks.tsx` to the methods actually offered (add UPI; drop
      marks the store does not accept).
- [ ] Keep `prepareCheckoutAction` as the only checkout entry point; do not add a second checkout.
- [ ] If order webhooks are added, extend the existing handler with HMAC verification and
      idempotency; use an app-managed subscription if the storefront domain is attached to Shopify.

### Verification

- [ ] UPI Intent on Android and iOS, including app-switch return; desktop QR.
- [ ] Card payment with 3DS/OTP, success and failure.
- [ ] Netbanking and one wallet.
- [ ] Refresh during OTP; close the tab after payment and confirm the order still appears in Shopify
      and the customer's account.
- [ ] Verify a pending payment: Shopify shows Payment pending, sends the Pay now link, and the order
      expires correctly.
- [ ] Refund from Shopify admin and confirm the customer notification and fee credit.
- [ ] Confirm the order status page, confirmation email and account order history agree.
- [ ] Run a low-value live order and reconcile it against the gateway settlement report.

## 11. Open decisions

| Decision                | Current state                       | Recommendation                                                                   |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| Store currency          | INR (set 10 Nov 2026); final prices | No action; revisit Markets only for international presentment                    |
| Primary gateway         | None configured                     | Razorpay Secure                                                                  |
| Onsite cards            | None                                | Stay with Razorpay redirect at launch; evaluate PayU/Cashfree direct cards later |
| Fallback gateway        | None                                | Not native; rely on Razorpay smart routing and a tested rollback                 |
| GoKwik / Magic Checkout | Not implemented                     | Defer; verify headless support before any pilot                                  |
| COD                     | Not configured                      | Only with verification and RTO controls                                          |
| Order webhooks          | Not consumed                        | Add only when fulfilment or analytics needs them                                 |
| Payment marks           | Six card brands                     | Mirror the real method mix, including UPI                                        |

## 12. Cross-references and sources

- [`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md) G6 (currency) and G8 (GoKwik) — decision records.
- [`VERCEL-DEPLOYMENT.md`](./VERCEL-DEPLOYMENT.md) — deployment and webhook configuration.
- [`SHIPROCKET.md`](./SHIPROCKET.md) — fulfilment, the consumer of `orders/paid` if added.
- [`AUTHENTICATION.md`](./AUTHENTICATION.md) — account sign-in, a separate flow from checkout.
- [`FRONTEND-ARCHITECTURE.md`](./FRONTEND-ARCHITECTURE.md) §6 — cart and checkout code ownership.
- `docs/reference/interactions/product-detail.md` — the measured GoKwik overlay on the reference.

Checked 10 November 2026: Shopify Payments supported countries and third-party provider docs;
Shopify India pricing; Razorpay Shopify integration, pricing, settlements and refund docs; PayU,
Cashfree, PhonePe, Paytm and CCAvenue Shopify documentation; NPCI UPI MDR FAQ and deferral notices;
PCI SSC SAQ A guidance; RBI PA directions; DPDP Rules 2025; Consumer Protection (E-Commerce) Rules 2020. Rates and policies change; confirm the final numbers in writing before signing.
