# Product detail stock states — Figma `1:1090`, `1:1910`, `16:7696`

Three frames on the same 1440 × 5445 canvas as [`product-desktop-frame-16-7053.md`](./product-desktop-frame-16-7053.md),
plus mobile `16:6714` and `16:8009`. Read from the plugin export of `Lorem Ipsum Wireframe`, because the
REST token is out of quota.

Each frame is the default state with one block changed, so only the changed block is specified.

## Low stock — `1:1090` (`PDP - low stock alert`)

The size block grows from 432 × 54 to 432 × 82 by adding one line under the chips:

| Node      | Position   | Size    | Type                                              |
| --------- | ---------- | ------- | ------------------------------------------------- |
| `16:7223` | (904, 558) | 96 × 16 | `only 1 left in stock`, DM Sans 12/500, `#000000` |

The size block is `VERTICAL, gap 12`: label row 16, 12, chips 26, 12, this line 16. Everything below it
moves down 28, so the add-to-bag button sits at 614 instead of 586.

## Out of stock — `1:1910` (`PDP - Out-of-Stock / Waitlist`)

Two changes in the buy column, nothing else:

- **Size chips become unavailable.** Each chip keeps its 26 px height and 4 px inset but swaps its
  1 px `#000000` border for `#BBBBBB`, and no chip carries the selected fill.
- **The button becomes a waitlist trigger** (`1:1959`): 432 × 42 at y 586, padding 12/24, **1 px
  `#000000` border, no fill**, radius 4, label `Notify me when available` in DM Sans 12/500 `#000000`,
  centred. The help line follows at y 668.

## Notify me — `16:7696` (`PDP - Notify Me Modal`)

A right-side sheet over the product page, not a centred dialog.

| Part    | Node      | Geometry                                                                                                                                                           |
| ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scrim   | `16:7884` | `#000000` at 20 % over the page                                                                                                                                    |
| Panel   | `16:7935` | 592 × 794 at x 848, flush to the right edge, white, `VERTICAL gap 40`                                                                                              |
| Header  | `16:7936` | 592 × 72, padding 24; title `Notify Me` 16/400; close 24 × 24 at the right                                                                                         |
| Body    | `16:7941` | 592 × 621, padding 24, `gap 32`                                                                                                                                    |
| Product | `16:7943` | 544 × 191, `gap 24`: image 123 × 191 (2:3) and a 397-wide block with the name, price and selected size                                                             |
| Size    | `16:7981` | 544 × 54: label row 16, 12, chips 26 — the same size row as the page                                                                                               |
| Email   | `16:8006` | 544 × 75, `gap 10`: helper `Enter you email/address for notifying` 12/500, then a 544 × 49 field with a 1 px border and placeholder `E-mail/address` 12/400 `#666` |
| Footer  | `16:7969` | 592 × 101, padding 24, white; button 544 × 53, padding 16/12, 1 px border, label `Notify Me` 16/600                                                                |

Mobile `16:8009` is the same sheet at 390 wide, anchored to the bottom: panel 390 × 744 at y 100, body
342 wide, scrim solid black.

## Deviations from the design system

- The sheet's title, submit button and the category strip above it are set in **Inter 16**, while the
  rest of the page is DM Sans 12. That reads as a stock component dropped into the file. The
  storefront keeps `type-h3` for the title and `type-control` for the button rather than adding Inter.
- Both frames draw a 4 px radius on buttons; the storefront is zero-radius.
- `Enter you email/address` is missing a `r`. The storefront writes "Enter your email address".

## Copy the frames add

`only 1 left in stock` · `Notify me when available` · `Notify Me` · `Enter you email/address for notifying`
· `E-mail/address`.

## Open questions

1. **Waitlist destination.** No Shopify surface here stores a waitlist entry: there is no
   `waitlist` mutation in the Customer Account or Storefront schemas, and the file shows no
   confirmation state. The sheet can collect an address, but something must receive it — a
   metafield write through the Customer Account API, a Shopify app, or a list provider.
2. **Who may submit.** The frame asks for an email rather than using the signed-in customer, so the
   form is anonymous. That needs a spam control (BotID, as the agent panel uses) before launch.
3. **Low-stock threshold.** The frame shows "only 1 left". Nothing in the file says where the line
   appears, so the threshold (and whether it is per variant) is a catalogue decision.
4. **Inventory visibility.** `ProductVariant.quantityAvailable` returns a number only when the store
   exposes inventory to the storefront; otherwise it is `null` and the line cannot be drawn.
