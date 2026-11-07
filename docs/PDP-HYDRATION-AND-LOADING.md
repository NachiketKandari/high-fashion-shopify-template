# PDP hydration and loading

Measured 2026-11-08 against the live reference (`politesocietyshop.com`) and a production
build of this storefront. The reference is a Shopify Liquid theme, not a React app; its
loading model is still the right target because it keeps the product content in the first
server response and lets the browser fetch only what the shopper can see.

## What the reference does

Playwright, Chromium, 1440 × 1000, `waitUntil: "load"`:

| Signal                        | Reference                                             |
| ----------------------------- | ----------------------------------------------------- |
| Document                      | Full Shopify HTML, 435 kB, 71.6 kB compressed         |
| First paint / FCP             | 488 ms                                                |
| DOMContentLoaded / load       | 617 ms / 1,917 ms                                     |
| Product content in first HTML | Title, price, colour, size, description, gallery      |
| Gallery images                | All in HTML; first two `loading="eager"`, rest `lazy` |
| First product image request   | ~261 ms, before DOMContentLoaded                      |
| Size guide                    | Fetched only when opened (`?ps_embed=1`)              |
| Related products              | `<product-recommendations>` empty at load             |
| Related request               | `/recommendations/products…` only when scrolled near  |
| Navigation from collection    | Full document navigation, no client-side router       |
| JavaScript disabled           | PDP still shows title, price, options and description |

The reference does not hydrate the product content. Theme JavaScript progressively enhances
the gallery, variant picker, cart drawer and recommendation section. That is why there is no
skeleton: the server response already contains everything above the fold.

Gallery details from the same probe:

- The first two images are marked `loading="eager"`; the remaining slides are
  `loading="lazy"`.
- Images are served from the Shopify CDN at the requested width, not through a second image
  optimizer.
- `sizes` is `(min-width: 1100px) 50vw, 100vw`, which matches the two-column desktop layout.
- Recommendation images are only requested after the recommendation section is inserted,
  and each card image is `loading="lazy"` at a 400 px width.

## What our storefront does now

The storefront is a Next.js App Router page with Partial Prerendering. The route shell is
static; the product read and URL selection stream into it. The target order is:

1. The route-level `Suspense` boundary shows `ProductDetailSkeleton` only while the product
   read and URL selection resolve. It never waits for gallery images or recommendations.
2. `ProductDetailSection` renders the media synchronously from the resolved
   `selectedOptions`. The selected colour image is no longer behind a second `Suspense`
   boundary, so the first image is in the first product pass.
3. The first gallery image uses `loading="eager"`, `fetchpriority="high"` and React
   `preload`. The next image is prefetched only after the first image decodes, at low
   priority. Gallery images after the first are mounted with an `IntersectionObserver`
   (`300px` margin), so a long gallery does not queue every optimizer request at once.
4. The product info area keeps its own `Suspense` boundary around the live variant query.
   The option picker and buy controls have a static fallback with matching geometry, so the
   media never waits for Shopify.
5. Related products render only when the section is within `300px` of the viewport
   (`components/product/deferred-related-products.tsx`). The server still starts the
   recommendation query beside the product query, so the data is ready when the shopper
   reaches the section; the images stay lazy.
6. Cart feedback is local to the action. The checkout button stays “Checkout” while a cart
   mutation is in flight and only shows the spinner/“Redirecting…” state after the shopper
   actually starts checkout.

### Implementation map

| Concern                           | File                                                   |
| --------------------------------- | ------------------------------------------------------ |
| Product read + URL selection      | `app/products/[handle]/page.tsx`                       |
| Media-first product layout        | `components/product-detail/product-detail-section.tsx` |
| First image, lazy tiles, prefetch | `components/product-detail/product-media.tsx`          |
| Deferred recommendations          | `components/product/deferred-related-products.tsx`     |
| Stable checkout feedback          | `components/cart/summary.tsx`, `lib/cart/client.ts`    |

## Measured result

Local production build, desktop 1440 × 1000, cold optimizer cache, Playwright:

- Product content replaces the skeleton in roughly 400 ms; the route TTFB is ~15 ms warm.
- The first gallery image is requested as soon as the product pass renders; the second is
  requested after the first decodes.
- Only the first two gallery images are in the document at load. The third mounts when the
  shopper scrolls near it.
- Related products are absent from the DOM at load and appear when scrolled near the section.
- On a cold Next image optimizer cache, a single unoptimized gallery request can take
  2.5–4 s locally. Gating the gallery means that cost is paid by the image the shopper is
  looking at, not by every image at once. Warm requests are tens of milliseconds.

The earlier performance audit remains the source for route-level TTFB, LCP, transfer bytes
and request counts (`docs/PERFORMANCE-AUDIT.md`). This document records the PDP loading
order, not a new full-page benchmark.

## Rules

- Do not wrap the whole PDP in a skeleton that waits for images, recommendations or the
  cart.
- Do not prefetch the whole gallery. The first image is eager; the second may warm after the
  first; the rest wait for proximity.
- Do not put the selected colour image behind a client-only boundary or a second Suspense
  boundary. It is part of the product response.
- Do not render recommendation cards in the initial DOM just because the server query is
  fast. Mount the section when it is near the viewport.
- Do not turn cart mutations into a page-level loading label. Keep the feedback beside the
  control that caused it.
- Keep `sizes="100vw"` and the existing `1320 | 1920` image policy. The loading order, not
  a second sizing system, is the lever.

## Open risks

- **Image optimizer cold cache.** Vercel caches optimized images, but the first request per
  width still pays the transform. If production shows repeated cold latency, measure a
  Shopify CDN loader before changing the image policy.
- **Combined sizes.** Products whose Shopify variants are `XS/S`, `M/L`, `XL/XXL` keep those
  labels. They are a size range, not a sort bug; splitting them into six sizes requires new
  variant data. Standard runs are sorted `XXS XS S M L XL XXL XXXL`.
- **Recommendations need JavaScript.** They are supplementary, so deferring the DOM is
  acceptable. Core product content remains server-rendered.
