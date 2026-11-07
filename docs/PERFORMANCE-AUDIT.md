# Storefront performance audit

Measured 2026-11-07/08 against a production build of this worktree and an untouched `HEAD`
checkout, with the same harness and environment. The storefront server is not the bottleneck:
production TTFB is 46–58 ms cold and 5–9 ms warm. The client-visible lag comes from image
payload on product grids, the dev server, and third-party analytics; Shopify round-trips only
affect routes that are intentionally live.

## What changed

| #   | Fix                                                                                              | Effect                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Campaign hero renders through `<picture>` + `getImageProps` with a `(min-width: 1100px)` source. | Mobile no longer downloads the desktop hero (or vice versa). Home mobile image bytes 277 → 145 kB in the earlier capture; total 891 → 759 kB, load 4.78 → 3.99 s.                                |
| 2   | Product-card hover image is display-gated until hover/focus.                                     | Grid pages stop downloading a second full image per visible card. Controlled fixed-window A/B on `/collections/corsets`: desktop 46 images/4.77 MB → 27/2.55 MB; mobile 38/2.32 MB → 19/1.15 MB. |
| 3   | PDP related products start beside the product query instead of after it.                         | Dynamic PDP Shopify reads overlap: two ~345 ms queries in a 690 ms document, instead of serial.                                                                                                  |
| 4   | `scripts/perf/measure.mjs` is the documented measurement harness.                                | Reproducible TTFB, DCL, load, LCP, CLS, long tasks, bytes, request count, and slowest requests.                                                                                                  |

Safety: all commerce data still comes from Shopify; cached wrappers, tags, and owners are
unchanged. The hero uses the `next/image` API and the same `sizes="100vw"` / `1320|1920`
policy. The hover image stays `next/image` with the same srcset and sizes, and only its
`display` is gated; touch devices never downloaded it in practice, and the first hover on a
cold cache reveals the image once it arrives. The PDP change passes the same cached promise
(`getProductRecommendations`) into the same Suspense boundary, so the skeleton and cache tags
are unchanged.

## Measurement method

- Production: `pnpm build`, then `PORT=3103 pnpm start`, restarted before each route for the
  cold sample. Warm is the second navigation in the same process.
- Browser: Chromium via Playwright. Desktop 1440×900, DPR 1. Mobile 390×844, DPR 3, 4× CPU
  throttling, 1.6 Mbps down / 750 kbps up / 150 ms RTT (Lighthouse-class slow 4G).
- Cache disabled per navigation (`Network.setCacheDisabled`) so client HTTP cache does not
  hide transfer bytes. `SETTLE_MS=6000` after `load`, then read LCP/CLS/long tasks and sum
  CDP `encodedDataLength`. Requests are network requests, bytes are compressed transfer.
- Cold/warm values below are single runs on localhost; mobile throttling makes wall-clock
  deltas noisy. The image A/B used the same 4 s fixed window for both revisions.

## Baseline vs after

Production build, cold = first request after server restart, warm = second navigation.
`ttfb/lcp/dcl/load` in ms; `kB` is total compressed transfer; `req` is request count.

### Desktop

| Route                            | Phase | TTFB     | LCP        | DCL       | Load       | kB          | Req      |
| -------------------------------- | ----- | -------- | ---------- | --------- | ---------- | ----------- | -------- |
| `/`                              | cold  | 58 → 50  | 772 → 304  | 682 → 230 | 785 → 422  | 2266 → 2090 | 66 → 62  |
| `/`                              | warm  | 7 → 5    | 68 → 64    | 126 → 93  | 126 → 93   | 2728 → 2090 | 71 → 62  |
| `/collections/all`               | cold  | 48 → 46  | 1504 → 296 | 236 → 252 | 6945 → 460 | 6007 → 3516 | 110 → 82 |
| `/collections/all`               | warm  | 8 → 9    | 72 → 72    | 170 → 149 | 170 → 149  | 6009 → 3518 | 109 → 85 |
| `/collections/corsets`           | cold  | 46 → 72  | 692 → 356  | 257 → 303 | 951 → 469  | 5472 → 3253 | 95 → 76  |
| `/collections/corsets`           | warm  | 5 → 5    | 68 → 80    | 215 → 174 | 416 → 446  | 5510 → 3253 | 101 → 77 |
| `/products/alma-lace-corset-top` | cold  | 46 → 58  | 268 → 548  | 256 → 459 | 273 → 529  | 1909 → 1909 | 57 → 57  |
| `/products/alma-lace-corset-top` | warm  | 5 → 5    | 68 → 68    | 98 → 94   | 98 → 94    | 1909 → 1909 | 57 → 57  |
| `/cart`                          | cold  | 111 → 46 | 220 → 160  | 260 → 178 | 266 → 188  | 1056 → 1057 | 60 → 61  |
| `/cart`                          | warm  | 4 → 4    | 60 → 44    | 74 → 66   | 83 → 76    | 1056 → 1057 | 60 → 61  |
| `/search?q=shirt`                | cold  | 54 → 46  | 708 → 552  | 623 → 445 | 2419 → 529 | 4983 → 3169 | 109 → 85 |
| `/search?q=shirt`                | warm  | 6 → 6    | 380 → 528  | 380 → 495 | 380 → 507  | 5127 → 3169 | 109 → 85 |

### Mobile (4× CPU, 1.6 Mbps, 150 ms RTT)

| Route                            | Phase | TTFB    | LCP         | DCL         | Load        | kB          | Req     |
| -------------------------------- | ----- | ------- | ----------- | ----------- | ----------- | ----------- | ------- |
| `/`                              | cold  | 45 → 47 | 2296 → 2220 | 1020 → 1020 | 4780 → 3985 | 891 → 759   | 35 → 34 |
| `/`                              | warm  | 5 → 5   | 2332 → 2408 | 1066 → 995  | 4761 → 4033 | 891 → 758   | 35 → 34 |
| `/collections/all`               | cold  | 49 → 48 | 4972 → 5016 | 2108 → 3655 | 6907 → 6412 | 1987 → 1307 | 65 → 55 |
| `/collections/all`               | warm  | 5 → 5   | 5256 → 5024 | 3832 → 3637 | 9782 → 6406 | 1987 → 1307 | 65 → 55 |
| `/collections/corsets`           | cold  | 50 → 48 | 1584 → 1176 | 1871 → 2321 | 5519 → 5886 | 1589 → 1143 | 63 → 53 |
| `/collections/corsets`           | warm  | 7 → 13  | 1256 → 1280 | 2435 → 2371 | 8100 → 5892 | 1589 → 1143 | 63 → 53 |
| `/products/alma-lace-corset-top` | cold  | 45 → 81 | 4744 → 5136 | 1086 → 1387 | 6011 → 6069 | 1176 → 1176 | 35 → 35 |
| `/products/alma-lace-corset-top` | warm  | 6 → 6   | 5048 → 5068 | 1102 → 1130 | 6015 → 6017 | 1176 → 1176 | 35 → 35 |
| `/cart`                          | cold  | 46 → 47 | 916 → 920   | 809 → 816   | 2463 → 2454 | 622 → 622   | 44 → 44 |
| `/cart`                          | warm  | 4 → 7   | 908 → 932   | 801 → 824   | 2434 → 2465 | 622 → 622   | 44 → 44 |
| `/search?q=shirt`                | cold  | 52 → 47 | 3540 → 3076 | 2091 → 2911 | 4847 → 6011 | 1653 → 1170 | 61 → 52 |
| `/search?q=shirt`                | warm  | 8 → 7   | 1828 → 1836 | 2350 → 2308 | 8422 → 6051 | 1653 → 1168 | 61 → 51 |

Read the table at page level: cold samples include first-request initialization (the `/` and
PDP cold rows move for that reason), and mobile `DCL`/`load` are sensitive to 4× CPU script
decode. Transfer bytes and request counts are the stable signal: grid pages drop 28–41% of
bytes, while `/cart`, PDP markup, and server TTFB are unchanged by design.

Compressed document size (`curl --compressed`, warm): `/` 58 kB, `/collections/all` 142 kB,
`/collections/corsets` 102 kB, PDP 61 kB, `/cart` 32 kB, `/search?q=shirt` 102 kB.

## Dev vs production

Dev compiles routes on first request, which dominates everything else. Measured with the same
desktop browser and no network throttling.

| Route                            | Dev cold TTFB                 | Dev warm TTFB | Prod cold TTFB | Prod warm TTFB | Dev cold LCP | Prod cold LCP |
| -------------------------------- | ----------------------------- | ------------- | -------------- | -------------- | ------------ | ------------- |
| `/`                              | 5620 ms (curl; 5.1 s compile) | 193 ms        | 58 ms          | 7 ms           | —            | 772 ms        |
| `/collections/all`               | 2416 ms                       | 589 ms        | 48 ms          | 8 ms           | 4360 ms      | 1504 ms       |
| `/products/alma-lace-corset-top` | 3098 ms                       | 119 ms        | 46 ms          | 5 ms           | 4276 ms      | 268 ms        |
| `/search?q=shirt`                | 2160 ms                       | 127 ms        | 54 ms          | 6 ms           | 2836 ms      | 708 ms        |

A dev server that has already compiled a route is still 10–100× slower to first byte than
production. If the reported lag is evaluated on `pnpm dev` or a route that has not compiled
yet, the fix is to measure a production build; no application change moves dev compilation
into the request budget.

## Root causes, ranked

1. **Every product card downloaded two full images (fixed).** `ProductCard` rendered the
   featured image plus a hover image. The hover image was `loading="lazy"` and `opacity-0`,
   but Chrome still fetched it for every card near the viewport: on `/collections/corsets`
   desktop, 19 of 46 images (2.23 MB of 4.77 MB) were `-02` hover images. Display-gating them
   until hover/focus removes them from the initial load and from touch devices entirely.
   Verified after the fix: 0 hover-image requests; 27 images/2.55 MB desktop, 19/1.15 MB mobile.
2. **Mobile downloaded the desktop campaign hero (fixed).** Both art-direction `<Image>`
   elements were in the DOM, and the desktop one used `priority`, so it was preloaded and
   eager on every viewport. On throttled mobile it was a 132 kB, 3.9 s request competing with
   the actual mobile hero. The `<picture>` source now selects one image per viewport; verified
   `heroDesktop=0` on mobile, `heroMobile=0` on desktop.
3. **Dev mode compile cost (environment).** First request after `next dev` spends 2.2–5.6 s
   compiling; see the table above. This is the largest single difference between the reported
   experience and the production build.
4. **Google Tag Manager / GA is 177 kB on every page.** `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
   in `.env.local`, so `@next/third-parties` injects `gtag/js` (177 kB transferred). It was
   the slowest request on throttled mobile (4.4 s) for `/`, `/cart`, and PDP. It loads
   `afterInteractive`, so it does not block first paint, but it consumes mobile bandwidth and
   main-thread time.
5. **Shopify round-trips on live routes.** A warm GraphQL round trip to the store is ~136 ms;
   query time is 210–345 ms. `/search` runs products + facets in parallel (~210 ms each), and
   a dynamic PDP runs product + recommendations in parallel (~345 ms each). These routes are
   intentionally uncached. The PDP fix removes one serial ~350 ms hop for non-prerendered
   products.
6. **Oversized images remain the largest byte cost.** The storefront intentionally uses
   `sizes="100vw"` and `deviceSizes: [1320, 1920]`, so a card displayed at ~330–360 px still
   receives a 1920 px asset (1320 px on mobile). At ~60–100 kB per image, a 27-image grid is
   ~2.5 MB. `components/product-card/product-card.tsx` still triggers Next's own dev warning
   about `fill` + `sizes="100vw"` not matching the rendered width. Changing this requires an
   owner decision on the image policy, not a local tweak.
7. **HTML/RSC and JS payload.** `/collections/all` is 720 kB uncompressed (144 kB compressed)
   because 40 product cards are prerendered and serialized for the client grid; initial JS is
   ~1 MB uncompressed (~285 kB compressed first-party, plus 177 kB GA). Reducing the initial
   product count or the serialized card tree changes presentation/architecture and was not
   done here.

## Caching in the production run

- `next.config.ts` has `cacheComponents: true`; cached routes report `Revalidate 30d` /
  `Expire 1y` in the build table.
- All stable `get*` wrappers in `lib/*/server.ts` use `"use cache: remote"` with `cacheLife("max")`
  and Shopify webhook tags. The build prerenders Shopify data into `.next/server/app/*.html`
  and `.segments`; `x-next-cache-tags` on those responses lists `products`, `collections`,
  `product-<id>`, and `collection-<handle>`.
- No `cacheHandlers` is configured. In this local/self-hosted production process, Next backs
  both the `default` and `remote` handlers with its in-memory LRU: entries are per process and
  lost on restart. On Vercel, the platform adapter supplies a durable remote handler. A
  multi-instance self-hosted deployment needs a `remote` handler to share and persist entries.
- Carts, auth, predictive/search results, and filtered/sorted browse stay uncached by design:
  they depend on the request or live pricing. `/search?q=shirt` therefore always pays the
  Shopify round trip.
- Cold vs warm confirms the split: static routes are 46–58 ms cold and 5–9 ms warm, while
  `/search` is 0.5–0.7 s end-to-end at both temperatures.

## What remains

- **Per-image width/quality** (biggest remaining lever): requires relaxing
  `sizes="100vw"`/`deviceSizes` or reducing quality; both are explicit design-policy
  decisions. Current throttled-mobile LCP is ~2.2 s for `/`, ~1.2 s for
  `/collections/corsets`, and ~5.0 s for `/collections/all` (first card decode dominates).
- **Initial 40-product grid**: the HTML/RSC payload and the number of images to decode. A
  smaller first page or an architecture that sends fewer card props would cut it, but both
  change how the catalog is presented.
- **GA/GTM**: loading 177 kB on every page is a config/analytics decision. Consent-gated or
  server-side GTM would remove it from the critical path.
- **Remote cache handler for self-hosting**: without one, `use cache: remote` is only
  per-process in-memory. Vercel deployments get the platform handler.
- **Live routes**: search, refine, and cart still take 136–345 ms of Shopify RTT. Deploying
  the server closer to Shopify's API region is the remaining infrastructure fix.
- **Client-side navigation** was not part of this pass; `partialPrefetching` and
  `ensureStatic="prefetch"` are unchanged. Measure it separately if route transitions (rather
  than first load) are the complaint.

## Reproduction

```bash
export PATH="$HOME/.nvm/versions/node/v26.13.0/bin:$PATH"
pnpm build
PORT=3103 pnpm start
```

Per-route cold/warm harness (restart the server before each route for a cold sample):

```bash
BASE_URL=http://localhost:3103 \
ROUTE=/collections/all \
PROFILE=desktop \
ITERATIONS=2 \
SETTLE_MS=6000 \
OUT=/tmp/collections-all-desktop.json \
node scripts/perf/measure.mjs
```

`PROFILE=mobile` applies 4× CPU throttling and 1.6 Mbps/150 ms RTT; `THROTTLE=0` disables
network emulation. The JSON contains TTFB, DCL, load, LCP, CLS, long tasks, bytes by resource
type, request count, and the slowest ten requests.

Quick server-side check:

```bash
for r in / /collections/all /collections/corsets /products/alma-lace-corset-top /cart '/search?q=shirt'; do
  curl -s --compressed -o /dev/null -w "$r ttfb=%{time_starttransfer}s total=%{time_total}s transfer=%{size_download}B\n" "http://localhost:3103$r"
done
```

Dev comparison:

```bash
PORT=3104 pnpm dev
curl -s -o /dev/null -w 'first=%{time_starttransfer} total=%{time_total}\n' http://localhost:3104/
curl -s -o /dev/null -w 'second=%{time_starttransfer} total=%{time_total}\n' http://localhost:3104/
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm build`.
