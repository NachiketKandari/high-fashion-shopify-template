# Shiprocket integration

This storefront sells through Shopify-hosted checkout. Shopify owns the order, the payment and
the customer record; Shiprocket owns the pickup, courier selection, AWB, label and delivery
tracking. The two systems are connected after the order is paid, not inside the storefront.

There are two viable routes. Start with the first one unless a requirement forces the second.

## Option A — Shiprocket Shopify app (recommended)

Use this when the goal is to ship real orders without adding a second order system to the code.

1. **Create the Shiprocket account.** Add the pickup address for the flagship store and complete
   KYC. Add the GST details if the business entity needs them on the label.
2. **Install the Shiprocket app** from the Shopify App Store and connect the store. The Shopify
   channel reads orders from Shopify Admin and writes fulfilment and tracking back to the order.
3. **Configure the basics** in Shiprocket:
   - Primary pickup location: `Shop No. 1, Solace Apartment, 33rd Road, Bandra West, Mumbai`.
   - Default package weight and dimensions. Use the packed weight, not the product weight.
   - Courier allocation: automatic for launch; manual once the lane data is known.
   - COD: enable only if Shopify checkout offers COD for the market.
4. **Place a test order** in the Shopify store. Confirm it appears in Shiprocket, assign a
   courier, generate the label, schedule pickup and check that the AWB and tracking link flow
   back to the Shopify order.
5. **Set the customer-facing tracking message.** The Shopify order status page and the
   customer account order page show the fulfilment tracking number once Shiprocket writes it.
6. **Configure NDR and returns** in Shiprocket before launch. Decide who owns failed-delivery
   calls and how domestic returns become store credit.

### What this storefront needs to change

Nothing in code. The app works through Shopify Admin, which already owns the order. The only
prerequisite is that the Shopify plan and the Headless sales channel allow the app to read and
write orders and fulfilments. Confirm this in Shopify Admin before enabling the channel.

### Limitations

- Carrier-calculated shipping rates at Shopify checkout need Shopify's carrier service feature
  and a carrier-service endpoint. The Shiprocket app does not replace that by itself.
- The storefront cannot show a live Shiprocket ETA on the product page without the custom route
  below.
- Shiprocket's app owns the fulfilment workflow. Do not also run the custom flow for the same
  orders, or the parcel will be created twice.

## Option B — custom Shiprocket API integration

Use this only when product pages need pincode serviceability, when the team needs a custom
operations console, or when orders must be pushed to Shiprocket from a system other than Shopify
Admin.

### What gets built

| Layer              | Responsibility                                                | Location                                      |
| ------------------ | ------------------------------------------------------------- | --------------------------------------------- |
| Shiprocket client  | Token cache, order create, AWB, pickup, label, tracking       | `lib/shipping/server.ts`                      |
| Domain types       | Serviceability quote, shipment record, tracking event         | `lib/shipping/types.ts`                       |
| Route handler      | Receive tracking webhooks, verify `x-api-key`, return `200`   | `app/api/webhooks/shiprocket/route.ts`        |
| Shopify fulfilment | Write AWB, courier and tracking URL back to the Shopify order | server-only Admin API call                    |
| Optional UI        | Pincode check and delivery estimate on the cart page          | `components/cart/` + `lib/shipping/action.ts` |

`lib/shipping/server.ts` is server-only. It must never be imported by a client component or
expose the API token.

### Credentials

Shiprocket API users are separate from the panel login. Create one in **Settings → API → Create
API User** and store its credentials only in the deployment environment.

```bash
SHIPROCKET_API_EMAIL="your-api-user@example.com"
SHIPROCKET_API_PASSWORD="your-api-user-password"
SHIPROCKET_PICKUP_LOCATION="Primary"
SHIPROCKET_WEBHOOK_TOKEN="your-webhook-token"
# Optional override; defaults to https://apiv2.shiprocket.in/v1/external
SHIPROCKET_BASE_URL="https://apiv2.shiprocket.in/v1/external"
```

Every variable is server-only. Add each one to `.env.example` and to `turbo.json` `globalEnv`
before the first deployment. A webhook token is not a signature; treat it as a shared secret and
rotate it if it leaks.

### Authentication

```http
POST /auth/login
Content-Type: application/json

{ "email": "...", "password": "..." }
```

The response contains a bearer token valid for roughly ten days. Cache it in module memory and
refresh on `401`, not on every request. Never send the Shiprocket password to the browser.

### Forward order flow

1. **Order paid in Shopify.** Receive `orders/create` or `orders/paid` at a new Shopify webhook
   route, or reconcile on a schedule. Verify the Shopify webhook with `SHOPIFY_WEBHOOK_SECRET`
   before doing anything. The existing `/api/webhooks/shopify` handler only caches catalog
   topics, so add an order topic there or use a separate route.
2. **Create the Shiprocket order.**

   ```http
   POST /orders/create/adhoc
   Authorization: Bearer <token>
   Content-Type: application/json
   ```

   Required fields include `order_id` (use the Shopify order ID or name), `order_date`,
   `pickup_location`, `billing_customer_name`, `billing_address`, `billing_city`,
   `billing_pincode`, `billing_state`, `billing_country`, `billing_phone`,
   `shipping_is_billing`, `order_items[]`, `payment_method`, `sub_total`, `length`,
   `breadth`, `height`, `weight`.

   Use a stable `order_id`. A retry must not create a second Shiprocket order; check the
   response and query the order before retrying.

3. **Assign a courier.**

   ```http
   POST /courier/assign/awb
   { "shipment_id": 123456789, "courier_id": 1 }
   ```

   Omit `courier_id` to let Shiprocket recommend a courier. Persist `awb_code`,
   `courier_name`, `shipment_id` and the tracking URL.

4. **Schedule pickup.** `POST /courier/generate/pickup` with the `shipment_id`. Treat pickup
   failures as recoverable; the AWB still exists.
5. **Generate the label and manifest.** `GET /courier/generate/label?shipment_id=...` and
   `POST /manifests/generate` with the shipment IDs. Store the label URL, not the PDF, unless the
   operations team needs an archive.
6. **Write the fulfilment to Shopify.** Use the Admin API `fulfillmentCreateV2` mutation with
   `trackingInfo.number`, `trackingInfo.company` and `trackingInfo.url`, then notify the
   customer. This needs Shopify Admin scopes for orders and fulfilments; the current catalog
   seeder app does not have them. Create a separate app or add the scopes deliberately.

### Tracking webhook

Configure the URL in **Shiprocket → Settings → API → Webhooks**, enable it, and set the same
`SHIPROCKET_WEBHOOK_TOKEN` in the `x-api-key` header. Shiprocket sends one POST per new scan.

```json
{
  "awb": "19041424751540",
  "courier_name": "Delhivery Surface",
  "current_status": "IN TRANSIT",
  "current_status_id": 20,
  "shipment_status": "IN TRANSIT",
  "shipment_status_id": 18,
  "current_timestamp": "23 05 2023 11:43:52",
  "order_id": "1373900_150876814",
  "sr_order_id": 348456385,
  "etd": "2023-05-23 15:40:19",
  "scans": [{ "date": "...", "status": "...", "activity": "...", "location": "..." }],
  "is_return": 0
}
```

Handler rules:

- Reject requests whose `x-api-key` does not match.
- Return `200` quickly. Do the Shopify write in the same request only if it can finish inside the
  platform limit; otherwise enqueue and return `200`.
- Deduplicate on `awb + current_status_id + current_timestamp` (and `is_return`). Shiprocket does
  not guarantee a single delivery of a webhook.
- Map `current_status` to the customer-facing state. Do not infer delivery from a scan label.
- Ignore the URL keyword restriction: Shiprocket rejects callback URLs containing `shiprocket`,
  `kartrocket`, `sr` or `kr`. Use a neutral path such as `/api/webhooks/shipping`.
- Log the event ID and status, never the customer address or phone number.

### Serviceability and rates

`GET /courier/serviceability/?pickup_postcode=...&delivery_postcode=...&weight=...&cod=...`
returns couriers, rates and ETAs. It is useful on the cart page, but it cannot change the price
inside Shopify-hosted checkout by itself.

To show a rate before checkout, pick one of these:

- **Shiprocket Checkout** (fastrr) as the checkout surface, if the business accepts its payment
  and conversion trade-offs.
- **Shopify Carrier Service API** with a small endpoint that proxies Shiprocket rates. This needs a
  Shopify plan that includes carrier-calculated shipping.
- **Flat shipping rules** in Shopify, with Shiprocket used only for fulfilment. This is the least
  code and the least risk for launch.

For the current storefront, the third option matches the existing architecture: Shopify owns
checkout, Shiprocket owns fulfilment, and the storefront does not invent shipping prices.

### COD

Set `payment_method: "COD"` and the correct `cod_amount` when creating the Shiprocket order.
Only enable COD for pincodes and order values the business is prepared to underwrite. Reconcile
COD remittances in Shiprocket against Shopify orders; the storefront never stores the COD amount.

### Returns

Shiprocket exposes reverse pickups through the return and exchange order endpoints. The store's
published policy is store credit for approved domestic returns and no returns on international
orders. Keep the policy text and the Shiprocket return flow aligned before enabling self-serve
returns.

### Failure handling

| Failure                        | Behaviour                                                            |
| ------------------------------ | -------------------------------------------------------------------- |
| Shiprocket token expired       | Refresh once, retry the request, then fail the job.                  |
| Duplicate `order_id`           | Query the existing order and reuse its shipment.                     |
| No courier serviceable         | Surface the pincode and ask operations to choose a courier manually. |
| Pickup not scheduled           | Keep the AWB; retry pickup independently.                            |
| Webhook replayed               | Return `200` without writing the fulfilment twice.                   |
| Shopify fulfilment write fails | Retry from the stored AWB; never re-create the Shiprocket order.     |

### Rollout

1. Shiprocket app + Shopify fulfilment in a staging store.
2. Manual test order: label, pickup, tracking webhook, delivery.
3. Custom API only if pincode serviceability or an operations console is still required.
4. Add the credentials to `.env.example` and `turbo.json` before the feature ships.
5. Keep the app path available as a fallback while the custom path is new.

## Decision summary

| Requirement                        | Choice                                             |
| ---------------------------------- | -------------------------------------------------- |
| Launch quickly, no code            | Option A, Shiprocket Shopify app                   |
| Live pincode/ETA on the storefront | Option B, plus a rate surface                      |
| Rates inside Shopify checkout      | Shopify Carrier Service API or Shiprocket Checkout |
| Custom operations console          | Option B, with Shopify Admin fulfilment writes     |
| Returns and NDR                    | Shiprocket panel first; automate later             |

The current repository has no shipping code. This document is the implementation plan, not a
description of shipped behaviour.
