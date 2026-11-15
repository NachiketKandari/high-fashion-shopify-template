# Wireframe inventory — Lorem Ipsum Wireframe

Every top-level frame in the source file, with a verdict. Generated from the Figma REST API
(`GET /v1/files/{key}?depth=2`) against file `TzeMmJHUVWuiuknAcm1hq4`,
version `2421747092237574279`, last modified `2026-11-14T17:37:18Z`.

Verdicts are the build decision, not a description of the frame:

| Verdict            | Meaning                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Build**          | Belongs to Next.js in this repository.                                                       |
| **Shopify-hosted** | The surface is Shopify checkout or Customer Account OAuth. The frame is context.             |
| **Gated**          | Needs a data source Shopify does not expose to a storefront by default. Blocked on P0.       |
| **Skip**           | A divider strip, a device shell, a legacy duplicate, or a frame that is not a specification. |

The execution order these verdicts feed is `docs/WIREFRAME-EXECUTION-PLAN.md`.

## Summary

221 frames.

| Verdict        | Frames |
| -------------- | ------ |
| Build          | 93     |
| Shopify-hosted | 60     |
| Gated          | 37     |
| Skip           | 31     |

| Surface                                         | Frames | Desktop | Mobile |
| ----------------------------------------------- | ------ | ------- | ------ |
| Header, menu and currency drawer                | 5      | 5       | 0      |
| Browse — PLP, filter and sort                   | 32     | 19      | 13     |
| Product page                                    | 14     | 7       | 7      |
| Search                                          | 5      | 5       | 0      |
| Cart                                            | 9      | 4       | 5      |
| Checkout (Shopify-hosted)                       | 26     | 13      | 13     |
| Authentication (Shopify-hosted)                 | 22     | 11      | 11     |
| Account and wallet                              | 18     | 10      | 8      |
| Private wishlist                                | 6      | 3       | 3      |
| Post-purchase — tracking, cancellation, returns | 43     | 22      | 21     |
| Support and editorial pages                     | 10     | 5       | 5      |
| Error screens                                   | 4      | 2       | 2      |

## Frames

### Header, menu and currency drawer

Navigation, mega menu and the region/currency drawer. Route target: root layout.

| Frame     | State                             | Viewport | Size      | Verdict | Note                                  |
| --------- | --------------------------------- | -------- | --------- | ------- | ------------------------------------- |
| `3:716`   | Region / Currency Switcher Drawer | desktop  | 1440×794  | Build   | drawer; frame is a full-page capture. |
| `1:152`   | menu-woman                        | desktop  | 1440×1086 | Build   | mega menu.                            |
| `1:309`   | menu-man                          | desktop  | 1440×1086 | Build   | mega menu.                            |
| `107:455` | Scrolled / Sticky Header State    | desktop  | 1440×5011 | Skip    | legacy, superseded.                   |
| `107:584` | default                           | desktop  | 1440×5011 | Skip    | legacy, superseded.                   |

### Browse — PLP, filter and sort

Collection pages, both grid variants, the filter drawer and every empty state. Route target: `/collections/[handle]`.

| Frame     | State                                                | Viewport | Size      | Verdict | Note |
| --------- | ---------------------------------------------------- | -------- | --------- | ------- | ---- |
| `1:584`   | PLP - 4 Column, Model                                | desktop  | 1440×4743 | Build   |      |
| `9:5051`  | PLP - 4 Column, Hover / Alternate Look State         | desktop  | 1440×4743 | Build   |      |
| `7:1628`  | PLP - 4 Column, Image                                | desktop  | 1440×4743 | Build   |      |
| `8:2554`  | PLP - 2 Column, Image                                | desktop  | 1440×8524 | Build   |      |
| `13:951`  | PLP alt - 2 Column, Image                            | desktop  | 1440×4868 | Build   |      |
| `15:5738` | PLP alt - 2 Column, Image                            | desktop  | 1440×5069 | Build   |      |
| `15:4740` | PLP alt - 2 Column, Active Filtered State            | desktop  | 1440×4868 | Build   |      |
| `15:5317` | PLP alt - 4 Column, Zero Filter Results              | desktop  | 1440×3853 | Build   |      |
| `7:1858`  | PLP - 4 Column, Item                                 | desktop  | 1440×4743 | Build   |      |
| `8:2780`  | PLP - 2 Column, Item                                 | desktop  | 1440×8524 | Build   |      |
| `13:1107` | PLP alt - 2 Column, Item                             | desktop  | 1440×4868 | Build   |      |
| `1:810`   | PLP - 2 column, Model                                | desktop  | 1440×8524 | Build   |      |
| `13:248`  | PLP alt - 2 column, Model                            | desktop  | 1440×4867 | Build   |      |
| `13:1437` | PLP alt - 2 column, Hover / Alternate Look State     | desktop  | 1440×4867 | Build   |      |
| `13:68`   | PLP - 2 column, Hover / Alternate Look State         | desktop  | 1440×8524 | Build   |      |
| `1:2035`  | Filter & Sort Drawer (Slide-Over) - Color            | desktop  | 1440×795  | Build   |      |
| `13:2194` | Filter & Sort Drawer (Slide-Over) - size             | desktop  | 1440×795  | Build   |      |
| `13:2441` | Filter & Sort Drawer (Slide-Over) - price            | desktop  | 1440×795  | Build   |      |
| `13:2688` | Filter & Sort Drawer (Slide-Over) - sort by          | desktop  | 1440×795  | Build   |      |
| `8:3174`  | Mobile PLP - 2 Column, Model                         | mobile   | 390×3853  | Build   |      |
| `15:5894` | Mobile PLP - 2 Column, Model                         | mobile   | 390×4172  | Build   |      |
| `15:4896` | Mobile PLP - 2 Column, Active Filtered               | mobile   | 390×3853  | Build   |      |
| `15:5490` | Mobile PLP - 2 Column, Zero Filter Results           | mobile   | 390×3853  | Build   |      |
| `9:4224`  | Mobile PLP - 1 Column, Image                         | mobile   | 390×3853  | Build   |      |
| `9:4509`  | Mobile PLP - 1 Column, Item                          | mobile   | 390×3853  | Build   |      |
| `9:3437`  | Mobile PLP - 1 Column, Model                         | mobile   | 390×4080  | Build   |      |
| `9:4402`  | Mobile PLP - 1 Column, Image                         | mobile   | 390×4080  | Build   |      |
| `9:4687`  | Mobile PLP - 1 Column, Item                          | mobile   | 390×4080  | Build   |      |
| `9:3994`  | Mobile - Filter & Sort Drawer (Slide-Over) - Color   | mobile   | 390×844   | Build   |      |
| `13:3064` | Mobile - Filter & Sort Drawer (Slide-Over) - size    | mobile   | 390×844   | Build   |      |
| `13:3229` | Mobile - Filter & Sort Drawer (Slide-Over) - price   | mobile   | 390×844   | Build   |      |
| `13:3394` | Mobile - Filter & Sort Drawer (Slide-Over) - sort by | mobile   | 390×844   | Build   |      |

### Product page

Gallery, buy column, stock states, and the three overlay surfaces. Route target: `/products/[handle]`.

| Frame     | State                                 | Viewport | Size      | Verdict | Note                     |
| --------- | ------------------------------------- | -------- | --------- | ------- | ------------------------ |
| `1:967`   | PDP - Variant Selected State          | desktop  | 1440×5445 | Build   |                          |
| `16:7053` | PDP - Default State (In Stock)        | desktop  | 1440×5445 | Build   |                          |
| `1:1090`  | PDP - low stock alert                 | desktop  | 1440×5445 | Build   |                          |
| `1:1910`  | PDP - Out-of-Stock / Waitlist         | desktop  | 1440×5445 | Build   | needs a waitlist source. |
| `16:7450` | PDP - Size Guide & Fit Modal          | desktop  | 1440×795  | Build   |                          |
| `16:7696` | PDP - Notify Me Modal                 | desktop  | 1440×795  | Build   | needs a waitlist source. |
| `16:8173` | PDP - Slide-Over Confirmation         | desktop  | 1440×795  | Build   |                          |
| `16:6217` | Mobile PDP - Default State (In Stock) | mobile   | 390×4080  | Build   |                          |
| `16:6601` | Mobile PDP - Variant Selected State)  | mobile   | 390×4080  | Build   |                          |
| `16:6714` | Mobile PDP - Low stock alert          | mobile   | 390×4080  | Build   |                          |
| `16:6827` | Mobile PDP - Default State (In Stock) | mobile   | 390×4080  | Build   |                          |
| `16:7270` | Mobile PDP - Size Guide & Fit Modal   | mobile   | 390×844   | Build   |                          |
| `16:8009` | Mobile PDP - Notify Me Modall         | mobile   | 390×844   | Build   | needs a waitlist source. |
| `16:8341` | Mobile PDP - Slide-Over Confirmation  | mobile   | 390×844   | Build   |                          |

### Search

The overlay's five states plus the two category menus. Route target: `/search`.

| Frame    | State                      | Viewport | Size      | Verdict | Note                                        |
| -------- | -------------------------- | -------- | --------- | ------- | ------------------------------------------- |
| `1:461`  | Empty / Initial Open State | desktop  | 1440×1086 | Build   |                                             |
| `1:485`  | Active Typing State        | desktop  | 1440×1086 | Build   |                                             |
| `7:1426` | 0 Result state             | desktop  | 1440×1610 | Build   |                                             |
| `1:517`  | Result State               | desktop  | 1440×1508 | Build   |                                             |
| `7:1460` | Typo correcton             | desktop  | 1440×1610 | Build   | typo correction is not a Shopify guarantee. |

### Cart

Four line-item states, desktop and mobile. Route target: `/cart`.

| Frame      | State                                       | Viewport | Size      | Verdict | Note |
| ---------- | ------------------------------------------- | -------- | --------- | ------- | ---- |
| `1:1599`   | Cart - Active Shopping Bag                  | desktop  | 1440×1774 | Build   |      |
| `27:10147` | Cart - out of stock                         | desktop  | 1439×795  | Build   |      |
| `22:8820`  | Cart - Updating Qty / Price Recalc          | desktop  | 1440×1774 | Build   |      |
| `22:9075`  | Cart -Empty Cart State                      | desktop  | 1440×1774 | Build   |      |
| `22:8538`  | Mobile cart - Active Shopping Bag           | mobile   | 390×844   | Build   |      |
| `30:11398` | Mobile Cart - out of stock                  | mobile   | 390×844   | Build   |      |
| `45:13616` | Mobile Cart - Non-Serviceable Pincode Alert | mobile   | 390×844   | Build   |      |
| `22:8976`  | Mobile cart - Updating Qty / Price Recalc   | mobile   | 390×844   | Build   |      |
| `22:9199`  | Mobile Cart -Empty Cart State               | mobile   | 390×844   | Build   |      |

### Checkout (Shopify-hosted)

Frames exist, but the surfaces are Shopify checkout. Built in Shopify admin, not here. Route target: Shopify checkout.

| Frame      | State                                                      | Viewport | Size     | Verdict        | Note                          |
| ---------- | ---------------------------------------------------------- | -------- | -------- | -------------- | ----------------------------- |
| `37:12809` | Address and Shipping - Saved Address Cards (Member)        | desktop  | 1440×755 | Shopify-hosted |                               |
| `52:14969` | Payment Screen - Payment Mode Selection                    | desktop  | 1440×755 | Shopify-hosted | zero text nodes — not a spec. |
| `52:15016` | Payment Screen - Card Entry & Brand Detection              | desktop  | 1440×755 | Shopify-hosted | zero text nodes — not a spec. |
| `52:15018` | Payment Screen - Split-Tender Summary                      | desktop  | 1440×755 | Shopify-hosted | zero text nodes — not a spec. |
| `52:15020` | Payment Screen - Processing / Gateway Overlay              | desktop  | 1440×755 | Shopify-hosted | zero text nodes — not a spec. |
| `52:15022` | Payment Screen - Payment Failed Recovery Screen            | desktop  | 1440×755 | Shopify-hosted | zero text nodes — not a spec. |
| `39:12982` | Address and Shipping - Saved Address Cards (Member)        | desktop  | 1440×755 | Shopify-hosted |                               |
| `45:13852` | Address and Shipping - Default Pre-Payment Audit           | desktop  | 1440×755 | Shopify-hosted |                               |
| `45:14049` | Address and Shipping - Account Balance Toggle              | desktop  | 1440×755 | Shopify-hosted |                               |
| `51:14764` | Address and Shipping - Invalid Promo Error State           | desktop  | 1440×755 | Shopify-hosted |                               |
| `46:14396` | Address and Shipping - 100% Balance Coverage               | desktop  | 1440×755 | Shopify-hosted |                               |
| `37:12867` | Mobile Address and Shipping - Saved Address Cards (Member) | mobile   | 390×844  | Shopify-hosted |                               |
| `39:13019` | Mobile Address and Shipping - Saved Address Cards (Member) | mobile   | 390×844  | Shopify-hosted |                               |
| `45:13896` | Mobile Address and Shipping - Default Pre-Payment Audit    | mobile   | 390×1209 | Shopify-hosted |                               |
| `45:14134` | Mobile Address and Shipping - Account Balance Toggle       | mobile   | 390×1258 | Shopify-hosted |                               |
| `51:14868` | Mobile Address and Shipping - Invalid Promo Error State    | mobile   | 390×1258 | Shopify-hosted |                               |
| `46:14500` | Mobile Address and Shipping - 100% Balance Coverage        | mobile   | 390×1300 | Shopify-hosted |                               |
| `39:13055` | Address and Shipping - New Address Form (Guest)            | desktop  | 1440×755 | Shopify-hosted |                               |
| `39:13165` | Address and Shipping - This Order is a Gift Toggle         | desktop  | 1440×755 | Shopify-hosted |                               |
| `39:13113` | Mobile Address and Shipping - New Address Form (Guest)     | mobile   | 390×1177 | Shopify-hosted |                               |
| `39:13223` | Mobile Address and Shipping - This Order is a Gift Toggle  | mobile   | 390×1272 | Shopify-hosted |                               |
| `52:15051` | Mobile Payment Screen - Payment Mode Selection             | mobile   | 390×844  | Shopify-hosted | zero text nodes — not a spec. |
| `52:15054` | Mobile Payment Screen - Card Entry & Brand Detection       | mobile   | 390×844  | Shopify-hosted | zero text nodes — not a spec. |
| `52:15057` | Mobile Payment Screen - Split-Tender Summary               | mobile   | 390×844  | Shopify-hosted | zero text nodes — not a spec. |
| `52:15060` | Mobile Payment Screen - Processing / Gateway Overlay       | mobile   | 390×844  | Shopify-hosted | zero text nodes — not a spec. |
| `52:15063` | Mobile Payment Screen - Payment Failed Recovery Screen     | mobile   | 390×844  | Shopify-hosted | zero text nodes — not a spec. |

### Authentication (Shopify-hosted)

Frames exist, but identity is Shopify Customer Account OAuth. Only entry, failure and refresh are ours. Route target: Shopify Customer Account.

| Frame      | State                                                     | Viewport | Size     | Verdict        | Note                                                  |
| ---------- | --------------------------------------------------------- | -------- | -------- | -------------- | ----------------------------------------------------- |
| `30:12637` | Mobile New Client Onboarding - OTP Verified Hand-off      | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `1:3745`   | Identity Gate - Default Split View                        | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:11706` | Identity Gate -Email Format Validation                    | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `1:3777`   | New Client Onboarding - New User OTP Verification         | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `1:3844`   | Login Screen - OTP Entry with Password Option             | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:12263` | Login Screen - Password Entry Alternative                 | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:12449` | Login Screen - Wrong Password Error State                 | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:12525` | Login Screen - Wrong Password Error State                 | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:11917` | Login Screen - OTP Error                                  | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:12098` | Login Screen - OTP Retry loop                             | desktop  | 1440×755 | Shopify-hosted |                                                       |
| `30:11557` | Mobile Identity Gate - Default Split View                 | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:11731` | Mobile Identity Gate -Email Format Validation             | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:11826` | Mobile Login Screen - OTP Entry with Password Option      | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:12305` | Mobile Login Screen - Password Entry Alternative          | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:12489` | Mobile Login Screen - Wrong Password Error State          | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:12565` | Mobile Login Screen - Wrong Password Error State          | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:12601` | Mobile New Client Onboarding - New User OTP Verification  | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:12695` | Mobile New Client Onboarding - New User OTP Verification  | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:11959` | Mobile Login Screen - OTP Error                           | mobile   | 390×844  | Shopify-hosted |                                                       |
| `30:12220` | Mobile Login Screen - OTP Retry Loop                      | mobile   | 390×844  | Shopify-hosted |                                                       |
| `55:1801`  | Cancellation Flow — Cancellation > 24h (Guest OTP)        | desktop  | 1440×985 | Gated          | needs OTP verification plus a cancellation write path |
| `55:1917`  | Mobile Cancellation Flow — Cancellation > 24h (Guest OTP) | mobile   | 390×844  | Gated          | needs OTP verification plus a cancellation write path |

### Account and wallet

The hub, sub-pages and the states inside each one. Route target: `/account`.

| Frame      | State                                    | Viewport | Size      | Verdict | Note                                          |
| ---------- | ---------------------------------------- | -------- | --------- | ------- | --------------------------------------------- |
| `3:296`    | Wallet Balance Active State              | desktop  | 1440×5011 | Skip    | legacy, superseded by 14.                     |
| `108:717`  | Wallet Balance Active State              | desktop  | 1440×5011 | Skip    | legacy, superseded by 14.                     |
| `67:16095` | 11. Overview Hub                         | desktop  | 1440×949  | Build   |                                               |
| `67:16144` | 11. Mobile — Overview Hub                | mobile   | 390×1435  | Build   |                                               |
| `67:16186` | 12. Populated Orders List                | desktop  | 1440×1207 | Build   |                                               |
| `67:16241` | 12. Mobile — Populated Orders List       | mobile   | 390×1398  | Build   |                                               |
| `67:16289` | 13. Empty Orders State                   | desktop  | 1440×854  | Build   |                                               |
| `67:16318` | 13. Mobile — Empty Orders State          | mobile   | 390×844   | Build   |                                               |
| `67:16340` | 14. Active Balance Display               | desktop  | 1440×929  | Gated   | needs a balance or document source.           |
| `67:16382` | 14. Mobile — Active Balance Display      | mobile   | 390×1108  | Gated   | needs a balance or document source.           |
| `67:16417` | 15. Zero Balance State                   | desktop  | 1440×854  | Gated   | needs a balance or document source.           |
| `67:16449` | 15. Mobile — Zero Balance State          | mobile   | 390×844   | Gated   | needs a balance or document source.           |
| `67:16474` | 16. Tax Invoices & Credit Notes          | desktop  | 1440×1050 | Gated   | needs a document source, not storefront data. |
| `67:16524` | 16. Mobile — Tax Invoices & Credit Notes | mobile   | 390×1258  | Gated   | needs a document source, not storefront data. |
| `67:16567` | 17. Saved Addresses Grid                 | desktop  | 1440×854  | Build   |                                               |
| `67:16604` | 17. Mobile — Saved Addresses Grid        | mobile   | 390×1016  | Build   |                                               |
| `67:16634` | 18. Profile Details Form                 | desktop  | 1440×1157 | Build   |                                               |
| `67:16687` | 18. Mobile — Profile Details Form        | mobile   | 390×1278  | Build   |                                               |

### Private wishlist

Populated, empty and the quick size selector. Route target: `/wishlist`.

| Frame      | State                                  | Viewport | Size     | Verdict | Note |
| ---------- | -------------------------------------- | -------- | -------- | ------- | ---- |
| `67:16735` | 19. Populated Wishlist Grid            | desktop  | 1440×986 | Build   |      |
| `67:16786` | 19. Mobile — Populated Wishlist Grid   | mobile   | 390×1314 | Build   |      |
| `67:16829` | 20. Quick Size Selector Sheet          | desktop  | 1440×960 | Build   |      |
| `67:16904` | 20. Mobile — Quick Size Selector Sheet | mobile   | 390×844  | Build   |      |
| `67:16971` | 21. Empty Wishlist State               | desktop  | 1440×960 | Build   |      |
| `67:16998` | 21. Mobile — Empty Wishlist State      | mobile   | 390×844  | Build   |      |

### Post-purchase — tracking, cancellation, returns

Each frame needs a data source Shopify does not expose to a storefront by default. See P0. Route target: —.

| Frame      | State                                                         | Viewport | Size      | Verdict        | Note                                                   |
| ---------- | ------------------------------------------------------------- | -------- | --------- | -------------- | ------------------------------------------------------ |
| `3:560`    | Order confirmation - Happy Path (≤ 24h Window)                | desktop  | 1440×755  | Shopify-hosted | thank-you page; custom states gated.                   |
| `52:15230` | Order confirmation - Happy Path (≤ 24h Window)                | desktop  | 1440×755  | Shopify-hosted | thank-you page; custom states gated.                   |
| `45:13446` | Address and Shipping - Non-Serviceable Pincode Alert          | desktop  | 1440×755  | Gated          | serviceability source undecided.                       |
| `52:15069` | Mobile Order confirmation - Happy Path (≤ 24h Window)         | mobile   | 390×1256  | Shopify-hosted | thank-you page; custom states gated.                   |
| `52:15307` | Mobile Order confirmation - Happy Path (≤ 24h Window)         | mobile   | 390×1256  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:161`   | Order confirmation — Policy expired (> 24h)                   | desktop  | 1440×854  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:238`   | Mobile order confirmation — Policy expired (> 24h)            | mobile   | 390×1393  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:310`   | Order confirmation — Guest profile activation                 | desktop  | 1440×1081 | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:387`   | Mobile order confirmation — Guest profile activation          | mobile   | 390×1712  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:459`   | Order confirmation — Payment pending delay                    | desktop  | 1440×854  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:536`   | Mobile order confirmation — Payment pending delay             | mobile   | 390×1514  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:608`   | Order confirmation — Modify address (≤ 24h)                   | desktop  | 1440×854  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:685`   | Mobile order confirmation — Modify address (≤ 24h)            | mobile   | 390×1295  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:757`   | Order confirmation — Confirm cancellation — dual rules        | desktop  | 1440×854  | Shopify-hosted | thank-you page; custom states gated.                   |
| `54:834`   | Mobile order confirmation — Confirm cancellation — dual rules | mobile   | 390×1295  | Shopify-hosted | thank-you page; custom states gated.                   |
| `55:161`   | Public Track Order — Initial Form (No Login)                  | desktop  | 1440×854  | Gated          | Admin API or Shiprocket.                               |
| `55:239`   | Mobile Public Track Order — Initial Form (No Login)           | mobile   | 390×844   | Gated          | Admin API or Shiprocket.                               |
| `55:312`   | Public Track Order — Invalid Order Match Alert                | desktop  | 1440×854  | Gated          | Admin API or Shiprocket.                               |
| `55:390`   | Mobile Public Track Order — Invalid Order Match Alert         | mobile   | 390×844   | Gated          | Admin API or Shiprocket.                               |
| `55:463`   | Order Tracking — Pre-Delivery 4-Step Stepper                  | desktop  | 1440×1044 | Gated          | Admin API or Shiprocket.                               |
| `55:579`   | Mobile Order Tracking — Pre-Delivery 4-Step Stepper           | mobile   | 390×1617  | Gated          | Admin API or Shiprocket.                               |
| `55:686`   | Order Tracking — Order Locked for Dispatch                    | desktop  | 1440×910  | Gated          | Admin API or Shiprocket.                               |
| `55:802`   | Mobile Order Tracking — Order Locked for Dispatch             | mobile   | 390×1449  | Gated          | Admin API or Shiprocket.                               |
| `55:909`   | Order Tracking — Delivered (In Return Window)                 | desktop  | 1440×880  | Gated          | Admin API or Shiprocket.                               |
| `55:1025`  | Mobile Order Tracking — Delivered (In Return Window)          | mobile   | 390×1419  | Gated          | Admin API or Shiprocket.                               |
| `55:1132`  | Order Tracking — Delivered (Window Closed)                    | desktop  | 1440×939  | Gated          | Admin API or Shiprocket.                               |
| `55:1248`  | Mobile Order Tracking — Delivered (Window Closed)             | mobile   | 390×1478  | Gated          | Admin API or Shiprocket.                               |
| `55:1355`  | Cancellation Flow — Cancellation ≤ 24h Modal                  | desktop  | 1440×1044 | Gated          | Admin API or Shiprocket.                               |
| `55:1471`  | Mobile Cancellation Flow — Cancellation ≤ 24h Modal           | mobile   | 390×844   | Gated          | Admin API or Shiprocket.                               |
| `55:1578`  | Cancellation Flow — Cancellation > 24h (Member)               | desktop  | 1440×985  | Gated          | Admin API or Shiprocket.                               |
| `55:1694`  | Mobile Cancellation Flow — Cancellation > 24h (Member)        | mobile   | 390×844   | Gated          | Admin API or Shiprocket.                               |
| `67:15387` | 05. Item-Level Partial Return                                 | desktop  | 1440×959  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15448` | 05. Mobile — Item-Level Partial Return                        | mobile   | 390×1534  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15509` | 06. Exchange vs. Return Choice                                | desktop  | 1440×909  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15567` | 06. Mobile — Exchange vs. Return Choice                       | mobile   | 390×1501  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15625` | 07. Size/Color Swap Selection                                 | desktop  | 1440×939  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15693` | 07. Mobile — Size/Color Swap Selection                        | mobile   | 390×1514  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15761` | 08. Reason & Refund Method                                    | desktop  | 1440×1202 | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15827` | 08. Mobile — Reason & Refund Method                           | mobile   | 390×1811  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15893` | 09. Reverse Courier Scheduled                                 | desktop  | 1440×994  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:15950` | 09. Mobile — Reverse Courier Scheduled                        | mobile   | 390×1668  | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:16007` | 10. Atelier Inspection Gate                                   | desktop  | 1440×1017 | Gated          | needs a returns write path (Shiprocket reverse pickup) |
| `67:16050` | 10. Mobile — Atelier Inspection Gate                          | mobile   | 390×1708  | Gated          | needs a returns write path (Shiprocket reverse pickup) |

### Support and editorial pages

Policy, story and support pages. Route target: `/pages/[handle]`.

| Frame      | State                                     | Viewport | Size      | Verdict | Note |
| ---------- | ----------------------------------------- | -------- | --------- | ------- | ---- |
| `67:17018` | 22. Concierge & Contact Hub               | desktop  | 1440×1040 | Build   |      |
| `67:17074` | 22. Mobile — Concierge & Contact Hub      | mobile   | 390×1843  | Build   |      |
| `67:17130` | 23. Shipping & 24h Cancel Policy          | desktop  | 1440×854  | Build   |      |
| `67:17180` | 23. Mobile — Shipping & 24h Cancel Policy | mobile   | 390×1714  | Build   |      |
| `67:17230` | 24. Returns & Alterations SOP             | desktop  | 1440×942  | Build   |      |
| `67:17279` | 24. Mobile — Returns & Alterations SOP    | mobile   | 390×1621  | Build   |      |
| `67:17328` | 25. Atelier Craftsmanship Story           | desktop  | 1440×1020 | Build   |      |
| `67:17361` | 25. Mobile — Atelier Craftsmanship Story  | mobile   | 390×1405  | Build   |      |
| `67:17394` | 26. Terms of Service & Privacy            | desktop  | 1440×1011 | Build   |      |
| `67:17444` | 26. Mobile — Terms of Service & Privacy   | mobile   | 390×1667  | Build   |      |

### Error screens

404 and the 500 maintenance state. Route target: `/not-found`, `/error`.

| Frame      | State                               | Viewport | Size     | Verdict | Note |
| ---------- | ----------------------------------- | -------- | -------- | ------- | ---- |
| `67:17496` | 27. Editorial 404 Page              | desktop  | 1440×854 | Build   |      |
| `67:17518` | 27. Mobile — Editorial 404 Page     | mobile   | 390×844  | Build   |      |
| `67:17540` | 28. 500 Maintenance Screen          | desktop  | 1440×904 | Build   |      |
| `67:17568` | 28. Mobile — 500 Maintenance Screen | mobile   | 390×977  | Build   |      |

### Skipped — dividers and device shells

Not specifications. The `Frame N` strips are 262 px journey labels that group the canvas; the
`iPhone 13 & 14` frames are device shells wrapping mobile artboards.

| Frame      | Name                              | Size      | Reason                |
| ---------- | --------------------------------- | --------- | --------------------- |
| `1:3772`   | Frame 183                         | 2920×262  | journey divider strip |
| `3:294`    | Frame 196                         | 8737×262  | journey divider strip |
| `9:4888`   | Frame 198                         | 42999×262 | journey divider strip |
| `16:6092`  | Frame 205                         | 13330×262 | journey divider strip |
| `22:8536`  | Frame 206                         | 7599×262  | journey divider strip |
| `51:14964` | Frame 208                         | 9510×262  | journey divider strip |
| `52:15066` | Frame 209                         | 17150×262 | journey divider strip |
| `56:15383` | Frame 210                         | 13320×262 | journey divider strip |
| `37:12918` | Frame 207                         | 17150×262 | journey divider strip |
| `13:1877`  | Frame 199                         | 15900×262 | journey divider strip |
| `13:1879`  | Frame 200                         | 5260×262  | journey divider strip |
| `13:2192`  | Frame 201                         | 7600×262  | journey divider strip |
| `15:4738`  | Frame 202                         | 2640×262  | journey divider strip |
| `15:5141`  | Frame 203                         | 2699×262  | journey divider strip |
| `15:6075`  | Frame 204                         | 1870×262  | journey divider strip |
| `1:3773`   | Frame 184                         | 7360×262  | journey divider strip |
| `1:3775`   | Frame 185                         | 19094×262 | journey divider strip |
| `5:874`    | iPhone 13 & 14 - 1                | 390×4825  | device shell, no spec |
| `13:1881`  | iPhone 13 & 14 - 12               | 390×3853  | device shell, no spec |
| `13:2061`  | iPhone 13 & 14 - 13               | 390×4080  | device shell, no spec |
| `6:1166`   | iPhone 13 & 14 - 2                | 390×4825  | device shell, no spec |
| `6:1289`   | iPhone 13 & 14 - 3                | 390×844   | device shell, no spec |
| `67:15385` | Exchange & Return — Journey label | 11420×262 | journey divider strip |
| `67:16093` | Account & Wallet — Journey label  | 15240×262 | journey divider strip |
| `67:16733` | Private Wishlist — Journey label  | 5690×262  | journey divider strip |
| `67:17016` | Support Pages — Journey label     | 9510×262  | journey divider strip |
| `67:17494` | Error Screens — Journey label     | 3780×262  | journey divider strip |

## Duplicate frames

The same state is drawn more than once under an identical name. Treat the higher node id as the
later revision and archive the other; confirm before building either.

| State                                                      | Copies                     |
| ---------------------------------------------------------- | -------------------------- |
| Address and Shipping - Saved Address Cards (Member)        | 2 — `37:12809`, `39:12982` |
| Login Screen - Wrong Password Error State                  | 2 — `30:12449`, `30:12525` |
| Mobile Address and Shipping - Saved Address Cards (Member) | 2 — `37:12867`, `39:13019` |
| Mobile Login Screen - Wrong Password Error State           | 2 — `30:12489`, `30:12565` |
| Mobile New Client Onboarding - New User OTP Verification   | 2 — `30:12601`, `30:12695` |
| Mobile Order confirmation - Happy Path (≤ 24h Window)      | 2 — `52:15069`, `52:15307` |
| Mobile PDP - Default State (In Stock)                      | 2 — `16:6217`, `16:6827`   |
| Mobile PLP - 1 Column, Image                               | 2 — `9:4224`, `9:4402`     |
| Mobile PLP - 1 Column, Item                                | 2 — `9:4509`, `9:4687`     |
| Mobile PLP - 2 Column, Model                               | 2 — `8:3174`, `15:5894`    |
| Order confirmation - Happy Path (≤ 24h Window)             | 2 — `3:560`, `52:15230`    |
| PLP alt - 2 Column, Image                                  | 2 — `13:951`, `15:5738`    |

## Defects in the source file

- **The money does not reconcile.** `Address and Shipping - Default Pre-Payment Audit` shows
  subtotal `INR 10,000`, account credit used `INR 1,000`, delivery free, and a total of
  `INR 11,000`. The total is subtotal plus tax; the credit line is drawn but not applied.
- **The payment frames are not specifications.** All five `Payment Screen` frames contain zero
  text nodes: no method names, no field labels, no UPI.
- **Copy typos that would ship as-is:** `CONTROL YOUR NURRATIVE`, `Shop for Man`,
  `Subscribe to Our Newsletters`, `Typo correcton`, `Notify Me Modall`,
  `PDP - Variant Selected State)`.
- **`Region / Currency Switcher Drawer` is a full-page capture**, not a drawer. It shows a
  `Credits: 9,000 INR` header element that appears in no other frame.

## What the file does not specify

- **The home page.** No frame in this file is a homepage. The home surface is specified
  separately in `home-desktop-frame-64.md`, exported from a different Figma frame and already built
  into `app/page.tsx`.
- **Components and styles.** Zero components, zero component sets, zero published styles.
  States exist only because each one is a separate artboard, so nothing is tokenised.
- **Interactive states.** No hover, focus, active, disabled or loading frame for any control.
- **Header and footer on inner pages.** Both appear inside page frames but are never drawn alone.
- **Real copy.** Product names, prices and body text are `lorem ipsum`, `10,000`, `9,000`.
- **Brand colour and type.** The palette is nine neutral greys; type is DM Sans at 10–18 px with
  negative tracking, which conflicts with the template's roles. See decision D6 in the plan.
