# Playwright reference comparison

Generated 2026-11-05T08:54:51.096Z by `scripts/compare-reference.mjs`.

- Reference: https://politesocietyshop.com
- Clone: http://localhost:3000
- Routes: /, /collections/all, /products/alma-lace-corset-top
- Viewports: 1440×1000, 390×844
- Screenshots: `.playwright/compare/`
- Method: fresh browser context per site, viewport and route; `getComputedStyle`, `getBoundingClientRect`, viewport screenshots. No forms, orders or personal data.

Values are `size / weight / line-height` for type and `width × height` for the brand mark.

## 1440

| Route      | Reference H1      | Clone H1          | Reference H2        | Clone H2          | Reference brand | Clone brand | Ref cols | Clone cols | Ref col gap | Clone col gap | Ref gutter | Clone gutter | Ref scrollWidth | Clone scrollWidth |
| ---------- | ----------------- | ----------------- | ------------------- | ----------------- | --------------- | ----------- | -------- | ---------- | ----------- | ------------- | ---------- | ------------ | --------------- | ----------------- |
| Home       | 22px / 400 / 29px | 14px / 300 / 21px | 18px / 400 / 23px   | 18px / 400 / 23px | 1016 × 82       | 1016 × 82   | —        | —          | —           | —             | —          | 30px         | 1425            | 1440              |
| Collection | 18px / 400 / 23px | 18px / 400 / 23px | 16px / 500 / 23px   | —                 | 342 × 27.6      | 342 × 27.6  | —        | 4          | —           | 3px           | —          | 30px         | 1425            | 1440              |
| Product    | 22px / 400 / 29px | 22px / 400 / 29px | 18px / 500 / 23.4px | 18px / 400 / 23px | 342 × 27.6      | 342 × 27.6  | —        | 4          | —           | 3px           | —          | 30px         | 1425            | 1440              |

## 390

| Route      | Reference H1      | Clone H1          | Reference H2        | Clone H2          | Reference brand | Clone brand | Ref cols | Clone cols | Ref col gap | Clone col gap | Ref gutter | Clone gutter | Ref scrollWidth | Clone scrollWidth |
| ---------- | ----------------- | ----------------- | ------------------- | ----------------- | --------------- | ----------- | -------- | ---------- | ----------- | ------------- | ---------- | ------------ | --------------- | ----------------- |
| Home       | 18px / 400 / 24px | 14px / 300 / 21px | 16px / 400 / 21px   | 18px / 400 / 23px | 0 × 0           | 0 × 0       | —        | —          | —           | —             | —          | 20px         | 375             | 390               |
| Collection | 16px / 400 / 21px | 18px / 400 / 23px | 16px / 500 / 21px   | —                 | 210 × 16.9      | 170 × 13.7  | —        | 2          | —           | 3px           | —          | 20px         | 375             | 390               |
| Product    | 18px / 400 / 24px | 22px / 400 / 29px | 18px / 500 / 23.4px | 18px / 400 / 23px | 210 × 16.9      | 170 × 13.7  | —        | 2          | —           | 3px           | —          | 20px         | 375             | 390               |

## Console

- reference 1440 Home: 2 error(s) — Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.
  | Failed to load resource: the server responded with a status of 403 ()
- reference 1440 Collection: 2 error(s) — Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.
  | Failed to load resource: the server responded with a status of 403 ()
- reference 1440 Product: 2 error(s) — Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.
  | Failed to load resource: the server responded with a status of 403 ()
- reference 390 Home: 2 error(s) — Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.
  | Failed to load resource: the server responded with a status of 403 ()

## Notes

- The reference geo-localizes currency and may show a newsletter after five seconds. Measurements are taken before that delay.
- Differences in product data, default sort and available collections are data drift, not visual-system drift.
- The clone exposes `--gutter`; the reference does not, so its gutter is `—`.
