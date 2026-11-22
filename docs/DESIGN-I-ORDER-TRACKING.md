# Design I — order tracking and cancellation

Status: 23 November 2026. Maps the "Order tracking and cancelation" frames and the orders-list entry
point to the code. Source file: **"Lorem Ipsum Design I (Copy)"**, `All desings` page; the export is
the same one recorded in [`DESIGN-I-CHECKOUT-JOURNEY.md`](./DESIGN-I-CHECKOUT-JOURNEY.md).

## 1. Scope

| Surface               | Frames                                                                     | Route                                   |
| --------------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| Public track form     | `55:161`, `55:312`, `55:239`, `55:390`                                     | `/track`                                |
| Member order tracking | `55:463`, `55:686`, `55:909`, `55:1132` (+ mobile pair)                    | `/account/orders/[id]`                  |
| Cancellation modals   | `55:1355`, `55:1578` (+ mobile pair); guest `55:1801`, `55:1917` not built | `components/orders/cancel-order-dialog` |
| Orders list and empty | `67:16186`, `67:16241`, `67:16289`, `67:16318`                             | `/account/orders`                       |

The Overview hub, Account Balance, invoices, returns pages, addresses and profile screens are out of
this pass. They keep their existing content; only the shared account shell changed.

## 2. Route and chrome

- `app/(orders)/layout.tsx` owns the 60px brand bar for post-purchase and account surfaces.
- The authenticated account pages moved from `(storefront)/account` to `(orders)/account` without
  changing URLs. They no longer render the storefront navigation or footer.
- `/account/orders/[id]` sits outside the account layout so tracking can use the designed 848 + 592
  split with no rail.
- The account rail is 288px with a 1px black rule, 40px padding and the designed active black block.
  It links only to pages that exist: My orders, Saved addresses, Profile details, Private wishlist,
  Sign out. Overview, Account Balance and Invoices & notes are omitted until those pages exist.
- The mobile account header keeps the designed `My account / <page> / Account menu` disclosure.

## 3. State model

`lib/orders/index.ts` derives one of five stages from Customer Account API order data:

| Stage        | Evidence                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- |
| `processing` | No fulfillment, order not cancelled                                                      |
| `packed`     | A fulfillment exists without tracking or a dispatch event                                |
| `dispatched` | Tracking information, or a `CARRIER_PICKED_UP` / `IN_TRANSIT` / `OUT_FOR_DELIVERY` event |
| `delivered`  | A `DELIVERED` / `PICKED_UP` event, or `latestShipmentStatus` delivered                   |
| `cancelled`  | `cancelledAt` is set                                                                     |

The stepper marks step 2 current for processing and packed, step 3 for dispatched, and all four
complete for delivered. There is no designed frame with step 3 current; the dispatched page reuses
the tracking shell and copy.

`getOrderCancellation` reads `requestedEditInformation.hasEditableLineItems` and
`requestedOrderEdits`. A `REQUESTED` edit hides the cancel button and shows the pending notice. The
24-hour cut-off only selects the refund-destination copy; eligibility always comes from Shopify.

## 4. Cancellation transport

The Customer Account API has no `orderCancel`. It does expose `orderRequestEdit`, which accepts
`lineItems.removals` for unfulfilled items and returns a `RequestedOrderEdit` with status `REQUESTED`.
The storefront submits that request; a merchant resolves it in Shopify. Instant cancellation and
refunds remain an Admin API concern.

So the modal is a request, not an instant cancel:

- the button labels read `Request Cancellation — Refund to Card` / `Request Cancellation — Wallet
  Credit`;
- the copy says the team reviews the request and emails the outcome, and that no refund has been
  issued yet;
- the success state is `Cancellation requested`;
- the order page then shows the pending notice from `requestedOrderEdits`.

The guest OTP path (`55:1801`, `55:1917`) is not built. It belongs to a public lookup result, and
public lookup is not available. Do not route a signed-in member through an OTP they do not need, and
do not build an OTP screen that cannot send a code.

## 5. Gated capabilities

`ORDER_CAPABILITIES` in `lib/orders/index.ts` is the capability register:

| Capability      | State         | Effect                                                                       |
| --------------- | ------------- | ---------------------------------------------------------------------------- |
| `cancellation`  | `available`   | Submits `orderRequestEdit` for editable line items                           |
| `addressChange` | `unavailable` | No Modify Address control; the policy copy routes address changes to support |
| `invoices`      | `unavailable` | No Download Tax Invoice control                                              |
| `returns`       | `unavailable` | Delivered orders show return policy and support, not Request Return          |

A capability flips only when its transport exists. The UI reads the constant; it never renders a
control that cannot complete.

## 6. Deliberate deviations

- The public form's valid submit shows `Order lookup is unavailable`, not a fabricated mismatch. The
  designed mismatch alert would claim a lookup that did not run.
- The orders-list filter is omitted. The query supports `query`, but the filter values were not
  validated against the Customer Account search syntax; a dead select is worse than no filter.
- The two delivered frames collapse into one honest return-eligibility panel because Shopify exposes
  returnable line items, not a return-window end date. The policy links to the Shopify refund policy.
- Type roles replace the export's raw line heights: 18/23 for 18/25.2, 14/18 for 14/19.6, 12/16 for
  12/16.8. Controls are 48px, not 47px. The design's 2px list CTA radius normalizes to the 4px
  `rounded-control` primitive.
- The modal keeps the frame geometry (560px, 4px radius, 1px black border, 35% overlay) and the
  system's `shadow-modal` elevation. No other shadow is used.
- The wordmark is `components/brand/wordmark` (303 × 24 SVG at the `bar` width), not the export's
  placeholder text.
- Prices use the storefront's `formatPrice` (₹ with minor units), not the frame's `INR 10,000`.

## 7. Verification

- `pnpm typecheck`, `pnpm lint` and `pnpm build` pass.
- Playwright checked `/track` at 1440 and 390 in default and unavailable states, and a temporary
  local preview checked every tracking stage, both cancellation modals, the orders list and the
  account shell at both widths. The preview route was deleted before the build.
- Signed-in verification on the live store: logged in through Shopify's hosted code flow and loaded
  `/account/orders` and `/account/orders/[id]` for the test account's dispatched order at 1440. This
  caught three things the package types and the preview did not:
  - the live API rejects `Order.lineItemsSummary` and `Order.latestFulfillmentDeliveryDate` with a
    400 even though the installed schema declares them; both are removed and the count/date are
    derived from line items and fulfillment events;
  - Next passes the dynamic `[id]` segment percent-encoded, so the GID must be decoded before the
    Customer Account query;
  - the dispatch copy now falls back to the fulfillment's `createdAt` when the courier writes
    tracking without a dispatch event.
  The real list and tracking page render order `#1002`, its dispatched stepper, tracking details,
  address, item and totals.
- Still unverified: the `orderRequestEdit` mutation needs an eligible unfulfilled order. The test
  account's only order is dispatched, so the cancel button is correctly absent. Run one unfulfilled
  order through processing → request → pending before launch.
