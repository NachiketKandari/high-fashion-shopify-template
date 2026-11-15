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

| Surface                | Needed                                       | Status      | Stub                                                      | Unblocked by                               |
| ---------------------- | -------------------------------------------- | ----------- | --------------------------------------------------------- | ------------------------------------------ |
| Pincode serviceability | Shiprocket serviceability API                | Unverified  | `lib/serviceability/index.ts`, created and not yet called | D5 decision plus API credentials           |
| Waitlist / notify me   | No source chosen                             | Not started | —                                                         | D3 decision                                |
| Size recommendation    | Fit data on the product                      | Not started | —                                                         | Metafield schema or a fit app              |
| Order tracking events  | Shiprocket API or Admin API                  | Not started | —                                                         | P11 scope, Shiprocket credentials          |
| Public order lookup    | Order lookup by number plus email            | Not started | —                                                         | Security decision on enumeration           |
| Cancellation write     | Admin API `orderCancel`                      | Not started | —                                                         | Decision on a server-side admin credential |
| Returns write          | Shopify Returns or Shiprocket reverse pickup | Not started | —                                                         | P11 scope                                  |
| Store credit balance   | Customer Account API, unconfirmed            | Unverified  | —                                                         | One API check before any wallet UI         |
| Tax invoices           | GST invoice app or Admin API plus generation | Not started | —                                                         | App procurement decision                   |

## Writing a stub

A stub is a small module in the domain that will own the real integration, with a status union that
includes the unverified case:

```ts
export type ServiceabilityStatus = "serviceable" | "unserviceable" | "unverified";
```

The calling component switches on the status and renders the unverified branch as absence, not as a
placeholder sentence. A shopper never reads the word "unverified"; they simply do not see the control
until it works.
