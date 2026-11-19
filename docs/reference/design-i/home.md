# Home — implementation spec

Source: `lorem-ipsum-design-i-(copy)-export.json` · file **"Lorem Ipsum Design I (Copy)"** · page
**"All desings"**. Measurements below come from `absoluteBoundingBox` values and layout props.

## Canonical frames

| Role             | Frame                                       | id          | Size      |
| ---------------- | ------------------------------------------- | ----------- | --------- |
| Desktop default  | `2003:263` `default`                        | `2003:263`  | 1441×2944 |
| Desktop scrolled | `2003:177` `Scrolled / Sticky Header State` | `2003:177`  | 1441×2944 |
| Mobile default   | `5:874` `iPhone 13 & 14 - 1`                | `5:874`     | 390×4825  |
| Mobile viewport  | `2022:2955` `Home`                          | `2022:2955` | 440×956   |

The desktop header is a 74 px transparent overlay in the default frame and a white bar in the scrolled
frame. The mobile frames draw the older 76 px `Menu / wordmark / Bag / Help` bar; the storefront uses
the current 56 px wordmark-left icon bar from `2022:4641` and `2022:4768`.

## Desktop `2003:263` — 1440×2972

| #   | Section       | id         | Box                | Notes                                                                    |
| --- | ------------- | ---------- | ------------------ | ------------------------------------------------------------------------ |
| 1   | Hero          | `2003:266` | 0,0 · 1440×812     | Full-bleed image, header overlays the top 74 px, two hero dots           |
| 2   | Marquee       | `2003:274` | 0,780 · 1440×50    | Helvetica 20/700, `#353535`, overlaid across hero/product edge           |
| 3   | New arrivals  | `2003:275` | 0,812 · 1440×649   | 80 px inset, 102 px gap, four 250×489 cards                              |
| 4   | Category pair | `2003:293` | 24,1461 · 1392×700 | 24 px inset, 24 px gap, two 684×700 image tiles                          |
| 5   | Campaign band | `2003:302` | 24,2185 · 1392×369 | 24 px inset, full-bleed image, no copy                                   |
| 6   | Footer        | `2003:304` | 0,2554 · 1436×418  | 120/22 px padding; wordmark + Help, Policies, Brand, Socials, newsletter |

Product card: 250×447 image (≈5:9), 24 px gap, 14/400 centred title. Category labels are 12/400 at
36 px from the left and 42 px from the bottom.

## Mobile `5:874` — 390×4825

| #   | Section       | id       | Height | Notes                                                   |
| --- | ------------- | -------- | ------ | ------------------------------------------------------- |
| 1   | Hero          | `5:1017` | 772    | 36/54 title at 37 %, 43 px outline CTA at the bottom    |
| 2   | New arrivals  | `5:1067` | 318.56 | Four 180.75 px columns, 270.56 px image + 48 px caption |
| 3   | Category pair | `5:1068` | 700    | Two 390×350.5 stacked tiles                             |
| 4   | Get the Look  | `5:1076` | 528    | 40 px vertical padding, 16 px heading, 267.5×400 rail   |
| 5   | Exclusives    | `5:1089` | 700    | 36/54 title and 43 px outline CTA at the bottom         |
| 6   | Product row   | `5:1095` | 318.56 | Second four-up rail                                     |
| 7   | Category pair | `5:1117` | 700    | Second stacked pair                                     |
| 8   | Footer        | `5:1124` | 716    | Wordmark, four link columns, newsletter                 |

## Code mapping

- `app/(storefront)/page.tsx` composes both viewports. The page pulls itself under the sticky header
  with `-mt-(--header-total-h)`; the header stays transparent at the top and turns white on scroll.
- Desktop-only: hero dots, marquee, category pair + campaign band. Mobile-only: Get the Look,
  Exclusives, second product rail and second category pair, per D4 in
  [`../../DESIGN-I-CHECKOUT-JOURNEY.md`](../../DESIGN-I-CHECKOUT-JOURNEY.md).
- `components/home/product-row.tsx` has a `home` variant: 5:9 desktop media with a centred 14/400
  title and no price; 2:3 mobile media with a 48 px title/price row. The default variant stays in use
  on the cart page.
- Collection handles resolve to populated catalog collections: `new-in`, `womenswear`, `menswear`,
  `dresses`, `racer-backs`.

## Deviations

- The export carries `imageRef` hashes but no image bytes. The page uses the reference photography in
  `public/reference/`; replace those slots with Figma exports when the image assets are available.
- The frame's two hero dots are drawn at arbitrary positions inside the hero. They are decorative in
  the storefront and sit together at the bottom centre, above the marquee.
- The marquee is a CSS loop that pauses under `prefers-reduced-motion`. The frame is static, so the
  speed is an implementation choice.
- The desktop frame omits Get the Look, Exclusives and the second product rail; the mobile frame
  includes them. The storefront follows that split rather than inventing desktop equivalents.
