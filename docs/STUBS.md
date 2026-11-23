# Unverified integrations and their stubs

Some screens in the wireframe need data Shopify does not expose to a storefront by default. This file
is the register: what is unverified, where its stub lives, and what would replace it. A feature that
reads an unverified source ships with a stub and a row here, or does not ship.

## Rules

1. **A stub never fabricates commerce data.** No invented prices, balances, delivery promises,
   invoices, stock or tracking events. A stub returns an explicit status, and the UI renders an
   unavailable state or nothing at all.
2. **Every stub is named in this table** in the same pull request that introduces it.
3. **Every stub keeps its comment.** The marker is `TODO(handle): <reason>`; it survives only while
   the integration is unverified.
4. **A stub never runs server-side work it cannot complete.** It returns the unavailable state
   before any fetch, so an unverified integration costs no request.
5. **Replace the stub and delete its row in the same change.** A register that only grows is a
   register nobody reads.

## Register

| Surface                | Needed                                                 | Status            | Stub                                                                                                                                                                                                                                           | Unblocked by                                                                                     |
| ---------------------- | ------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Account credits        | Customer store-credit balance and checkout application | Read-only         | Balance and transactions from `customer.storeCreditAccounts`; the wallet and cart read live balances, and the pre-checkout step projects the deduction. Shopify checkout applies the credit when its `Apply store credit` checkbox is selected | Verified in the dev store; the pre-checkout toggle remains a projection                          |
| Address prefill        | Write a shipping address into Shopify checkout         | Not wired         | `cartDeliveryAddressesAdd` is available; the step still hands off without a cart write                                                                                                                                                         | A cart write owner for delivery addresses                                                        |
| Delivery ETA           | Shiprocket delivery estimate                           | Unverified        | — — no date or promise is rendered                                                                                                                                                                                                             | Shiprocket API credentials                                                                       |
| Pincode serviceability | Shiprocket serviceability API                          | Unverified        | `lib/serviceability/index.ts`, created and not yet called                                                                                                                                                                                      | D5 decision plus API credentials                                                                 |
| Waitlist / notify me   | A place to store an email per variant                  | Local only        | `NotifyMe` shows the design-complete panel and confirms locally; no email leaves the browser                                                                                                                                                   | A storage decision: metafield, app or list provider                                              |
| Low stock line         | Tracked inventory at the Headless location             | Live when tracked | `getLowStockLabel` renders only for tracked variants at 1–5 units; every catalog variant is currently untracked                                                                                                                                | Enable Track quantity and set 1–5 available per variant                                          |
| Size recommendation    | Fit data on the product                                | Not started       | —                                                                                                                                                                                                                                              | Metafield schema or a fit app                                                                    |
| Public order lookup    | Order lookup by number plus email                      | Form only         | `/track` validates the pair and returns an unavailable result; no lookup request is sent                                                                                                                                                       | A lookup service plus a security decision on enumeration                                         |
| Cancellation write     | Admin API `orderCancel` plus a refund                  | Not started       | The tracking page submits an `orderRequestEdit` removal request; no instant cancel or refund is shown                                                                                                                                          | A server-side admin credential and a refund policy                                               |
| Returns write          | Shopify Returns or Shiprocket reverse pickup           | Request built     | `/returns` submits `orderRequestReturn` and reads return status; no cancel, reverse-pickup, tracking or label events                                                                                                                           | A reverse-logistics provider plus a return-cancel decision                                       |
| Tax invoices           | GST invoice app or Admin API plus generation           | Not available     | The Customer Account API in this app version exposes neither tax invoices nor credit notes; Invoices & notes shows an honest empty state and no fabricated documents                                                                           | A document source plus GST invoice configuration                                                 |
| Newsletter signup      | A list provider or marketing-consent sink              | Blocked           | `NewsletterForm` renders an unavailable status                                                                                                                                                                                                 | A provider plus a consent policy                                                                 |
| Contact form           | A mailbox or ticketing transport                       | Blocked           | `ContactForm` renders an unavailable status                                                                                                                                                                                                    | A transport endpoint or a ticketing app                                                          |
| Search typo correction | A did-you-mean result set                              | Gated (D6)        | `SearchZeroState` shows the honest zero-result copy and trending terms, and never fabricates closest products                                                                                                                                  | A search service or synonym dictionary; Shopify predictive search returns query suggestions only |

## Verified 2026-11-20

`ProductVariant.quantityAvailable` is in the installed Storefront schema, is selected by
`PRODUCT_VARIANT_FRAGMENT`, and the Headless channel grants `unauthenticated_read_product_inventory`.
The field returns numbers instead of an access error. Every catalog variant is untracked
(`inventoryItem.tracked: false`, `inventoryPolicy: CONTINUE`), so it returns 0 and the low-stock
line stays absent until a variant tracks inventory at 1–5 units.

Product payloads are cached with `product-<handle>` tags. The webhook handler has no
`inventory_levels/update` mapping, so an inventory change does not refresh a cached PDP; revalidate
the product tag or save the product after changing stock.

## Verified during P0

These were checked against the installed Customer Account API schema and are not stubs.

| Surface              | Evidence                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cancellation request | `orderRequestEdit` accepts `lineItems.removals` for unfulfilled items and returns a `RequestedOrderEdit` with status `REQUESTED`, `RESOLVED` or `DECLINED`. `fetchCustomerOrder` reads `requestedEditInformation` and `requestedOrderEdits`. Instant `orderCancel` is still absent. |
| Return request       | `orderRequestReturn` is wired through `requestCustomerReturn` from `/returns/[orderId]`. The delivered tracking panel reads `returnInformation` and `returns`, lists active returns, and links to the request flow while items are returnable.                                      |
| Instant cancellation | `orderCancel` and Admin refunds are absent from the Customer Account and Storefront schemas. The tracking page never claims an instant cancellation or refund.                                                                                                                      |

## Writing a stub

A stub is a small module in the domain that will own the real integration, with a status union that
includes the unverified case:

```ts
export type ServiceabilityStatus = "serviceable" | "unserviceable" | "unverified";
```

The calling component switches on the status and renders the unverified branch as absence, not as a
placeholder sentence. A shopper never reads the word "unverified"; they simply do not see the control
until it works.
