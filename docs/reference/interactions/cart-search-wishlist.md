# Cart, search, wishlist and account interactions — live reference

Audited on 5 November 2026 against <https://politesocietyshop.com>, with fresh headless browser
contexts at 1440 × 900 and 390 × 844. Every value below is a computed style, bounding box,
accessible name, or observed response from the live page. No order, payment, account, or personal
data was submitted.

**Short version**

- Search is a right-hand 440 px panel on desktop and a full-screen panel on mobile. It searches
  Shopify predictive search, retains the query after an X close, and returns stale results after
  an Escape close.
- `Escape` in search throws `clearSearchTerm is not defined` in the page and leaves the previous
  result text behind on reopen. X close, backdrop close, and the in-field clear control do not.
- Cart add, quantity, remove, persistence, and empty state work. The drawer has no discount field;
  the only coupon field is inside the GoKwik checkout overlay.
- Checkout is intercepted by a GoKwik iframe (`https://pdp.gokwik.co/index.html`), not a
  `checkout.shopify.com` navigation. The audit stopped at the coupon / phone step.
- Wishlist is device-local (`ps_wishlist`), persists across reload, and clears correctly. The
  header count span updates to `(1)` in the DOM but is `display:none` at both breakpoints, so no
  visible count changes.
- Newsletter validation is native browser validation. A valid fake email triggers an hCaptcha
  challenge; no success or duplicate response could be observed without solving it.

Read-only audit. The final desktop and mobile sessions ended with cart `0` and wishlist `[]`. The
newsletter submission did not create a subscription because hCaptcha blocked it.

## Environment

- Desktop: 1440 × 900, `isMobile: false`, DPR 1.
- Mobile: 390 × 844, `isMobile: true`, `hasTouch: true`, DPR 1.
- Browser: Chromium 156.0.8078.4 headless, standalone Node script using `@playwright/test` 1.64.1.
  The shared Playwright MCP browser was not used.
- Contexts were fresh: no account, cart, or wishlist state carried in. `locale: en-US`,
  timezone `Asia/Kolkata`; the store geo-localized to India, so all prices are INR (`₹`).
- The 5-second newsletter pop-up was suppressed with `ps_popup_seen = Date.now()` for the main
  passes, then tested in a separate fresh context.
- Country/locale shown by Shopify: `IN`; account host uses `locale=en-IN`.
- Evidence JSON: `.playwright-mcp/audit/audit-1440.json` and `.playwright-mcp/audit/audit-390.json`
  (full console, failed requests, samples, ARIA snapshots).
- Screenshots are viewport captures at `.playwright-mcp/ux-live-cart-<state>-<viewport>.png`.

## Controls inventory

| Surface           | Control              | Accessible name / visible text                                                                                                 | Notes                                                                  |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Header, desktop   | Search               | button `Search`                                                                                                                | Opens the search panel; no URL change.                                 |
| Header, desktop   | Help                 | button `Contact Us`, visible `HELP`                                                                                            | Opens the `Contact Us` dialog.                                         |
| Header, desktop   | Wishlist             | link `Wishlist`, visible `WISHLIST`                                                                                            | Count span exists but is `display:none`.                               |
| Header, desktop   | Account              | link `Account`                                                                                                                 | 302 to Shopify Customer Accounts.                                      |
| Header, desktop   | Cart                 | link with `aria-label="Cart"`, visible `CART (0) …`                                                                            | Count updates after add/remove.                                        |
| Header, mobile    | Menu                 | button `Menu`                                                                                                                  | Contains `WISHLIST` and `ACCOUNT`.                                     |
| Header, mobile    | Search / Help / Cart | buttons `Search`, `Contact Us`, `Cart`                                                                                         | Cart is an icon-only link with `aria-label="Cart"`.                    |
| Search panel      | Input                | combobox `Search`, placeholder `Type to Search`                                                                                | Focus moves here on open.                                              |
| Search panel      | Submit               | button `Search`                                                                                                                | Duplicate name with the header trigger.                                |
| Search panel      | Close                | button `Close`                                                                                                                 | 24 × 24 at top right.                                                  |
| Search panel      | Result               | link `Product link`                                                                                                            | **Accessible name is literally “Product link”**, not the product name. |
| Search panel      | Collection result    | link `CORSETS`                                                                                                                 | Collections group.                                                     |
| PDP               | Wishlist             | button `Save to wishlist`                                                                                                      | `aria-pressed` becomes `true`; label does **not** change.              |
| PDP               | Options              | radio group `COLOUR`, `SIZE`                                                                                                   | Clicking a swatch/size changes the URL `?variant=…`.                   |
| PDP               | Quantity             | buttons `Decrease quantity`, `Increase quantity`; input `Quantity`                                                             | Native number input, `min=1`.                                          |
| PDP               | Add                  | button `ADD TO CART`                                                                                                           | Submits `/cart/add`, opens the drawer.                                 |
| PDP               | Buy                  | button `BUY IT NOW`                                                                                                            | Starts the GoKwik overlay (not audited to completion).                 |
| Cart drawer       | Dialog               | dialog `Cart` (`aria-modal="true"`)                                                                                            | Focus lands on the dialog container, not a control.                    |
| Cart drawer       | Close                | button `Close`                                                                                                                 | Slides the drawer out.                                                 |
| Cart drawer       | Quantity             | buttons `Decrease quantity for ROSA CORSET TOP`, `Increase quantity for ROSA CORSET TOP`; input `Quantity for ROSA CORSET TOP` | 30 × 28 buttons.                                                       |
| Cart drawer       | Remove               | button `Remove ROSA CORSET TOP - BLACK / S`                                                                                    | Visible text `REMOVE`.                                                 |
| Cart drawer       | Checkout             | button `CHECKOUT`                                                                                                              | `type="button"`, GoKwik-decorated.                                     |
| Cart drawer       | Cart page            | link `VIEW SHOPPING CART`                                                                                                      | `/cart`.                                                               |
| Cart page         | Remove               | link `Remove ROSA CORSET TOP - BLACK / S`                                                                                      | `/cart/change?...&quantity=0`.                                         |
| Cart page         | Checkout             | button `CHECKOUT`                                                                                                              | `type="button"`, `form="cart"`, GoKwik-decorated.                      |
| Cart page         | Empty CTA            | link `EXPLORE COLLECTIONS`                                                                                                     | `/collections?sort_by=best-selling`.                                   |
| Wishlist          | Remove               | button `Remove from wishlist`                                                                                                  | Visible as a filled heart on the card.                                 |
| Wishlist          | Empty CTA            | link `Shop new in`                                                                                                             | `/collections/chapter-x`.                                              |
| Account           | Sign in              | email field, `Continue` arrow, button `Continue with Shop`                                                                     | Shopify-hosted; no account created.                                    |
| Contact           | Dialog               | dialog `Contact Us`                                                                                                            | Focus moves to `Close`.                                                |
| Contact           | Links                | `WhatsApp`, `Call Us`, `Email Us`, `Visit Our Flagship Store`                                                                  | Visible uppercase; accessible names title case.                        |
| Newsletter        | Dialog               | dialog `Join Polite Society`                                                                                                   | `aria-modal="true"`, labelledby heading.                               |
| Newsletter        | Email                | textbox `Your e-mail`                                                                                                          | `type=email`, `required`.                                              |
| Newsletter        | Submit               | button `Subscribe`                                                                                                             | Invisible hCaptcha attached.                                           |
| Newsletter footer | Email / submit       | textbox `Subscribe to Our Newsletter` (placeholder `Your e-mail`), button `Subscribe`                                          | Footer form `ps-newsletter-*`; valid submit also opens hCaptcha.       |

The search result name is worth calling out separately: the visible text is
`LILITH CORSET` / `ROSA CORSET TOP`, but the link's accessible name is `Product link` for all
five product suggestions. A screen reader cannot tell the results apart.

## Interaction findings

### 1. Search

- **Open:** header `Search` opens a right panel, not a dialog. Desktop panel is 440 × 900 at
  `x = 1000`; mobile panel is 390 × 844 at `x = 0`. The page URL does not change on open or while
  typing. Focus moves to the combobox.
- **Motion:** the panel is transform-driven with `transition: all 0.6s ease`. The first visible
  movement was ~200 ms after the click; it settled at ~850 ms desktop / ~890 ms mobile.
- **“corset” suggestions:** 5 products + 1 collection:
  `LILITH CORSET`, `ROSA CORSET TOP`, `RATI CORSET`, `SOLAPUR CORSET`,
  `ALMA LACE CORSET TOP`, then `Collections` → `CORSETS`. Footer reads
  `5 results found for “corset”`.
- **Product row layout:** desktop row is 387 × 72 at `x = 1024`; mobile row is 337 × 72 at
  `x = 24`. Thumbnail is 48 × 72 in both. Title is 12 px / 400 / 18 px. **No price is shown.**
- **Full results:** pressing `Enter` navigates to
  `/search?q=corset&options%5Bprefix%5D=last`. The page title is
  `Search: 86 results found for "corset"`; H1 is `86 SEARCH RESULTS: CORSET`. It renders 24 cards
  and pagination `1 2 3 4`.
  - Desktop grid: 4 × 339 px columns, gap `36px 12px`.
  - Mobile grid: 2 × 173.5 px columns, gap `24px 3px`.
- **No results:** `zzzzzzzzzz` gives `0 results found for “zzzzzzzzzz”` in the panel. The phrase
  exists three times in the DOM (one visible status, two visually-hidden/live-region copies) but
  is seen once. Short nonsense is not a no-results case: `zzzzqq` returned 3 fuzzy products and
  `nonsense` returned 6; Shopify typo/fuzzy matching fills the list.
- **Close / reopen:**
  - X button, backdrop click, and `Escape` all close the panel; focus returns to the header
    `Search` button.
  - X close preserves the query and results (`corset` was still in the input on reopen).
  - `Escape` closes, clears the input, but **leaves the previous result text visible on reopen**:
    the reopened panel had an empty input and still read
    `0 results found for “zzzzzzzzzz”`.
  - `Escape` also throws a page error: `clearSearchTerm is not defined` (see Console/network).
    X and the in-field clear control did not throw it.
- **Clear control:** the `×` inside the input clears the text but keeps the panel open. It is a
  `<span>` with no button role or accessible name; the top-right `Close` is the labelled control.
- **Scroll:** opening search adds `overflow-hidden` to `<body>`; it is removed on close.

### 2. PDP → cart drawer

- Selected `BLACK / S` on `/products/rosa-corset-top`; the page changed to
  `?variant=46399841599627` and the drawer showed `ROSA CORSET TOP`, `BLACK`, `S`, `₹13,500`.
- Add to Cart opened the drawer automatically. Observed open time including `/cart/add` was
  1.3 s desktop / 1.0 s mobile. Drawer animation is `all 0.6s ease`.
- **Desktop drawer:** 440 × 900 at `x = 1000`; header 440 × 125; item 394 × 150; image 72 × 90;
  footer 440 × 184.1. Checkout button 392 × 36; `VIEW SHOPPING CART` 124 × 34.
- **Mobile drawer:** 323.1 × 844 at `x = 66.9` (a 66.9 px strip of page remains visible). Item
  277.1 × 171; footer 323.1 × 184.1; checkout 275.1 × 36. At rest after 2.2 s the width stayed
  323.1. The **empty** drawer, by contrast, opened at the full 390 × 844 (`x = 0`).
- Contents: title, selected options, line price, quantity stepper, `REMOVE`, free-shipping
  message, `Subtotal`, `Tax included and shipping calculated at checkout`, `CHECKOUT`,
  `VIEW SHOPPING CART`. The `Loading...` string in the text is a visually-hidden live region,
  not a visible spinner.
- **Quantity:** plus changed the heading to `CART (2)`, subtotal to `₹27,000`; minus returned to
  `CART (1)` / `₹13,500` and disabled the minus button (`quantity__button ... disabled`).
- **Remove:** the drawer stayed open, changed to `CART (0)`, and showed
  `YOUR SHOPPING CART IS EMPTY`, the explanatory line, and `EXPLORE COLLECTIONS`. The header cart
  changed to `CART Cart (0) 0 items` on desktop.
- **Persistence:** add → close → reload → header cart reopened showed quantity `1` and the same
  variant. Removing afterwards left the cart empty after reload.
- **Focus / scroll:** focus moves to the dialog container; close returns it to `ADD TO CART`
  (the auto-open case). The body gets `cart-overflow-hidden overflow-hidden` while open.
- **No discount field** exists in the drawer (`0` matching inputs; no discount/coupon text).

### 3. Cart page (`/cart`)

- `/cart` exists, title `Your Shopping Cart`; the item and prices match the drawer.
- Desktop item block 750 × 328 with a 200 × 300 image; mobile item 350 × 223 with a 130 × 195
  image. Quantity input 38 × 34. Checkout 441 × 36 desktop / 350 × 36 mobile.
- **No discount code field.** `0` discount inputs; only the GoKwik iframe has an
  `Enter coupon code` field.
- **No headings.** `document.querySelectorAll('main h1, main h2, main h3')` returned `[]` on the
  filled cart. `SHOPPING CART`, `ORDER SUMMARY`, and `Subtotal` are text, not heading elements.
- Remove is an `<a>` with `href="/cart/change?id=…&quantity=0"`; clicking it produced:
  `SHOPPING CART` / `YOU HAVE NO PRODUCTS IN YOUR SHOPPING CART.` / `EXPLORE COLLECTIONS`.
- **Checkout handoff:** clicking `CHECKOUT` keeps the page on `/cart` and injects an iframe at
  `https://pdp.gokwik.co/index.html` over the page. Inside the iframe:
  `1 item`, `₹13,500`, `Enter coupon code`, `Login to Redeem Store Credits / Gift Card`,
  `Login to continue`, `+91`, `Enter Mobile Number`, a checked
  `Send me order updates & offers - (no spam)`, `Continue`, and the GoKwik privacy/T&C line.
  No `checkout.shopify.com` URL was reached, and no phone/email/address was entered.
- The cart page has the same GoKwik-decorated button (`type="button"`, `form="cart"`) as the
  drawer; it does not post the native cart form directly.

### 4. Wishlist (`/pages/wishlist`)

- Empty: `WISHLIST` / `Saved on this device.` / `You haven't saved anything yet.` / `SHOP NEW IN`.
- Adding from the PDP heart set `aria-pressed="true"`, stored
  `ps_wishlist = ["rosa-corset-top"]`, and showed a toast:
  `SAVED TO YOUR WISHLIST · VIEW`, 230.2 × 66 at (604.9, 802) desktop, 195 × 66 at (97.5, 746)
  mobile. The toast has no `role` or `aria-live`.
- The heart's label stays `Save to wishlist` after saving; only `aria-pressed` changes. The
  wishlist card's remove button is labelled `Remove from wishlist`.
- Filled page: `ROSA CORSET TOP`, `₹13,500`, card 336 × 529. Desktop grid is 4 × 336 px,
  gap `36px 12px`; mobile is 2 × 172.5 px, gap `24px 5px`.
- Reload preserved `ps_wishlist` and the card. Remove returned to the empty state and stored `[]`.
- **Header count:** a `span.ps-header__count[data-ps-wish-count]` exists in the desktop header
  and the mobile menu. It becomes `(1)` after saving, but computed `display` is `none` in both
  places. No visible count or badge appears; the visible header still reads `WISHLIST`.

### 5. Account

- Desktop `Account` and mobile menu `ACCOUNT` both point to
  `https://politesocietyshop.com/customer_authentication/redirect?locale=en&region_country=IN`,
  which redirects to:
  `https://account.politesocietyshop.com/authentication/login?...`.
- Page title `Sign in - Polite Society`; visible gate:
  `Sign in` / `Sign in or create an account` / `or` / `Email` / `Email me with news and offers`
  / `Continue with Shop` / `Continue` / `Terms of service` / `Privacy policy`.
- No account was created and no email was entered.

### 6. Contact / Help

- Header trigger is `Contact Us` with visible `HELP` on desktop; the mobile trigger is
  `Contact Us`. It opens dialog `Contact Us` (`aria-modal="true"`).
- Desktop panel 420 × 900 at `x = 1020`; mobile full-screen 390 × 844 at `x = 0`. Motion is
  `transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)`.
- Four full-width rows (420 × 50 desktop, 390 × 50 mobile):
  - `WhatsApp` → `https://wa.me/918976064836`
  - `Call Us` → `tel:+918976064836`
  - `Email Us` → `mailto:hi@politesociety.in`
  - `Visit Our Flagship Store` →
    `https://www.google.com/maps/place/Polite+Society/@19.0653993,72.8280942,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7c9386fc403c7:0x780f34d24e47930d!8m2!3d19.0653993!4d72.8306691!16s%2Fg%2F11wq7m3_lw?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D`
    (Google Maps place for Polite Society, Bandra West, Mumbai).
- Focus moves to `Close`; the close button is 27.5 × 27.5. Close sets `hidden`, moves the panel
  off-canvas, and returns focus to `Contact Us`. `Escape` also closes.
- Unlike search and cart, contact does not add a body scroll-lock class; body class stayed
  `template-index` with computed overflow `hidden auto`.

### 7. Newsletter

- The pop-up opens after `data-delay="5"` (observed 5.7 s desktop, 6.5 s mobile including polling)
  and suppresses for `data-days="30"` via `localStorage.ps_popup_seen` (epoch ms).
- Dialog `Join Polite Society`, `aria-modal="true"`, labelled by its H2. Card 720 × 271 desktop /
  350 × 258 mobile. Close is 26 × 26. Card transition is
  `opacity 0.35s cubic-bezier(0.2, 0.6, 0.2, 1), transform 0.35s cubic-bezier(0.2, 0.6, 0.2, 1)`.
- Pop-up form: `POST /contact#…`, tags `newsletter,popup`, `data-cptcha="true"`, invisible hCaptcha.
- Footer form: `POST /contact#ps-newsletter-…`, tags `newsletter`, no `data-cptcha` attribute,
  but a valid submit still opened hCaptcha.
- Validation is native and browser-rendered, not an inline styled error:
  - Empty email: `Please fill out this field.`
  - `not-an-email`: `Please include an '@' in the email address. 'not-an-email' is missing an '@'.`
- Valid submit with `test+audit@example.com` triggered a visible hCaptcha challenge
  (`hCaptcha challenge` iframe; desktop pop-up prompt observed: “Tap on every drink that can be
  hot or cold”; footer prompt: “Click on the animal that lives in this habitat”). No POST request,
  success message, error message, or duplicate-email response followed. The pop-up and email value
  stayed on screen. The challenge was not solved. The footer duplicate attempt was likewise gated
  by hCaptcha.
- Closing the pop-up removed `is-open`, stored a fresh `ps_popup_seen`, and did not submit.
- On a first visit, the 5 s timer is independent of cart state. During a first-visit discovery
  run its veil intercepted pointer events while the cart drawer was open; the audited final runs
  suppressed it so cart controls could be measured.

## Measured values

### Geometry

| Element             | 1440 × 900              | 390 × 844                |
| ------------------- | ----------------------- | ------------------------ |
| Search panel        | 440 × 900 at x 1000     | 390 × 844 at x 0         |
| Search close button | 24 × 24 at (1392, 24)   | 24 × 24 at (342, 24)     |
| Search result row   | 387 × 72 at x 1024      | 337 × 72 at x 24         |
| Search thumbnail    | 48 × 72                 | 48 × 72                  |
| Search page grid    | 4 × 339 px, gap 36 / 12 | 2 × 173.5 px, gap 24 / 3 |
| Contact panel       | 420 × 900 at x 1020     | 390 × 844 at x 0         |
| Contact row         | 420 × 50                | 390 × 50                 |
| Contact close       | 27.5 × 27.5             | 27.5 × 27.5              |
| Cart drawer         | 440 × 900 at x 1000     | 323.1 × 844 at x 66.9    |
| Cart drawer item    | 394 × 150               | 277.1 × 171              |
| Cart item image     | 72 × 90                 | 72 × 90                  |
| Cart footer         | 440 × 184.1             | 323.1 × 184.1            |
| Cart checkout       | 392 × 36                | 275.1 × 36               |
| Cart page item      | 750 × 328               | 350 × 223                |
| Cart page image     | 200 × 300               | 130 × 195                |
| Cart page checkout  | 441 × 36                | 350 × 36                 |
| Wishlist card       | 336 × 529               | 172.5 × 302.8            |
| Newsletter card     | 720 × 271               | 350 × 258                |
| Newsletter close    | 26 × 26                 | 26 × 26                  |

Mobile empty drawer opened at 390 × 844; the filled drawer measured 323.1 × 844. Treat the
filled/empty width difference as unresolved (see Open questions).

### Animation

| Surface              | Computed transition                                               | Observed                                                      |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Search panel         | `all 0.6s ease`                                                   | first movement ~200 ms after click; settled ~850–890 ms       |
| Cart drawer          | `all 0.6s ease`                                                   | settled width/position after ~0.9–1.6 s including item update |
| Contact panel        | `transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)`                  | slides in/out; no body scroll lock                            |
| Newsletter card      | `opacity 0.35s cubic-bezier(0.2, 0.6, 0.2, 1), transform 0.35s …` | opens after 5 s delay                                         |
| Search close icon    | `transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)`                 | icon only                                                     |
| Cart checkout button | `background-color 0.45s, color 0.45s`                             | hover/focus treatment                                         |

### Sizes at or below common touch-target minimums

- Search close 24 × 24; search submit 61.2 × 20.
- Cart quantity buttons 30 × 28; remove 46.9 × 34; checkout 36 px tall.
- Contact close 27.5 × 27.5.
- PDP wishlist heart 25.5 × 25.5.
- PDP colour swatches 13.5 × 18; size labels 7–23 × 21 (e.g. `S` is 7.7 × 21). The PDP options
  are the smallest targets audited.
- Newsletter close 26 × 26.

## Console / network

Both runs completed with no request failures on search, add/change/remove, cart, wishlist, or
contact endpoints. The noise is third-party/analytics and the hCaptcha gate.

**JavaScript page error**

- `clearSearchTerm is not defined` — thrown once per page after `Escape` closes search, on the
  homepage, in both viewports. X close, backdrop close, and the in-field clear control did not
  throw it. The visual close still occurs.

**Console errors**

- `Framing 'https://shop.app/' violates the following Content Security Policy directive:
  "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been
  blocked.` (1 desktop, 2 mobile; repeated on page loads).
- `Failed to load resource: the server responded with a status of 403 ()` — the blocked
  `https://shop.app/pay/hop?...` request.
- Account sign-in: 3 × `Unsafe attempt to load URL https://cdn.shopify.com/shopifycloud/
  customer-authentication-web/production/sprite-86bf53.svg from frame …` on the Shopify-hosted
  login page. The gate still rendered and worked.
- `[GoKwik OCC] No buttons claimed. Check that CHECKOUT_TEXT / BUYNOW_TEXT match your button
  labels.` (17 warnings per run, from the GoKwik integration).
- `[Meta Pixel] - Invalid parameter format for currency.` (17 warnings per run).
- `Swym No Retailer Id specified!` (16–17 per run).
- `Universal Cookies script is already loaded` (16–17 per run).
- One-off warnings: `postMessage` target-origin mismatch for `pay.shopify.com`, `web-share`
  feature warning, headless WebGL GPU-stall messages.

**Failed requests (navigation/analytics dominated)**

- 285 failed requests desktop / 226 mobile. Most are `net::ERR_ABORTED` from navigation:
  Shopify Monorail `produce_batch` (148 / 137), Google Ads/Analytics (58 each), Mailchimp pixel
  (23 each), Facebook `connect.facebook.net/log/error` ORB blocks (49 desktop).
- `https://shop.app/pay/hop` — 1 desktop / 2 mobile `net::ERR_BLOCKED_BY_RESPONSE`, HTTP 403.
- Shopify CDN account sprite — 3 `origin` failures each.
- hCaptcha logo assets — 1–2 aborted requests; the challenge itself loaded.
- No product, search, cart, wishlist, or contact link request failed.

The full lists are in the two `audit-*.json` files. Treat `ERR_ABORTED` analytics as navigation
noise, not storefront failures.

## Screenshots

All paths are repository-root relative. The mobile menu only exists at 390; every other state was
captured at both viewports.

| State                   | 1440 × 900                                                 | 390 × 844                                                 |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Home / header           | `.playwright-mcp/ux-live-cart-home-1440.png`               | `.playwright-mcp/ux-live-cart-home-390.png`               |
| Search open             | `.playwright-mcp/ux-live-cart-search-open-1440.png`        | `.playwright-mcp/ux-live-cart-search-open-390.png`        |
| Search “corset”         | `.playwright-mcp/ux-live-cart-search-corset-1440.png`      | `.playwright-mcp/ux-live-cart-search-corset-390.png`      |
| Full search page        | `.playwright-mcp/ux-live-cart-search-page-1440.png`        | `.playwright-mcp/ux-live-cart-search-page-390.png`        |
| Search no results       | `.playwright-mcp/ux-live-cart-search-no-results-1440.png`  | `.playwright-mcp/ux-live-cart-search-no-results-390.png`  |
| Contact / Help          | `.playwright-mcp/ux-live-cart-contact-1440.png`            | `.playwright-mcp/ux-live-cart-contact-390.png`            |
| Mobile menu             | —                                                          | `.playwright-mcp/ux-live-cart-menu-390.png`               |
| Account gate            | `.playwright-mcp/ux-live-cart-account-1440.png`            | `.playwright-mcp/ux-live-cart-account-390.png`            |
| PDP                     | `.playwright-mcp/ux-live-cart-pdp-1440.png`                | `.playwright-mcp/ux-live-cart-pdp-390.png`                |
| Cart drawer, 1 item     | `.playwright-mcp/ux-live-cart-cart-drawer-1440.png`        | `.playwright-mcp/ux-live-cart-cart-drawer-390.png`        |
| Cart drawer, quantity 2 | `.playwright-mcp/ux-live-cart-cart-drawer-qty2-1440.png`   | `.playwright-mcp/ux-live-cart-cart-drawer-qty2-390.png`   |
| Cart page               | `.playwright-mcp/ux-live-cart-cart-page-1440.png`          | `.playwright-mcp/ux-live-cart-cart-page-390.png`          |
| GoKwik checkout overlay | `.playwright-mcp/ux-live-cart-checkout-gokwik-1440.png`    | `.playwright-mcp/ux-live-cart-checkout-gokwik-390.png`    |
| Empty cart page         | `.playwright-mcp/ux-live-cart-cart-page-empty-1440.png`    | `.playwright-mcp/ux-live-cart-cart-page-empty-390.png`    |
| Empty cart drawer       | `.playwright-mcp/ux-live-cart-cart-drawer-empty-1440.png`  | `.playwright-mcp/ux-live-cart-cart-drawer-empty-390.png`  |
| Wishlist empty          | `.playwright-mcp/ux-live-cart-wishlist-empty-1440.png`     | `.playwright-mcp/ux-live-cart-wishlist-empty-390.png`     |
| Wishlist filled         | `.playwright-mcp/ux-live-cart-wishlist-filled-1440.png`    | `.playwright-mcp/ux-live-cart-wishlist-filled-390.png`    |
| Wishlist toast          | `.playwright-mcp/ux-live-cart-wishlist-toast-1440.png`     | `.playwright-mcp/ux-live-cart-wishlist-toast-390.png`     |
| Newsletter pop-up       | `.playwright-mcp/ux-live-cart-newsletter-popup-1440.png`   | `.playwright-mcp/ux-live-cart-newsletter-popup-390.png`   |
| Newsletter hCaptcha     | `.playwright-mcp/ux-live-cart-newsletter-captcha-1440.png` | `.playwright-mcp/ux-live-cart-newsletter-captcha-390.png` |

Extra evidence: `.playwright-mcp/audit/wish-count-header.png` (header crop after saving),
`.playwright-mcp/ux-live-cart-wishlist-count-menu-390.png` (mobile menu with the hidden count),
and `.playwright-mcp/ux-live-cart-newsletter-footer-result-1440.png` /
`.playwright-mcp/ux-live-cart-newsletter-footer-duplicate-1440.png` (footer hCaptcha gate).

## Open questions

1. **Newsletter success / duplicate behavior is unverified.** A valid fake email opens hCaptcha on
   both the pop-up and footer forms; without solving it there is no POST or success/duplicate
   state. A human pass, or a Shopify admin subscriber check, is still needed. This audit did not
   solve either challenge or create a subscriber.
2. **Checkout handoff is GoKwik, not Shopify.** The cart and drawer buttons both open
   `https://pdp.gokwik.co/index.html` inside the page; no `checkout.shopify.com` URL was reached.
   Whether GoKwik later hands off to Shopify checkout after phone verification is unverified.
3. **Search Escape is broken.** `clearSearchTerm is not defined` fires on Escape, and the reopened
   panel shows an empty input with stale result text. X close preserves the query/results, so the
   two close paths behave differently. This needs a code-owner fix, not a content change.
4. **The wishlist count is intentionally or accidentally hidden.** `ps-header__count` updates to
   `(1)` but `display:none` in the desktop header and mobile menu. If a count was intended, it
   never becomes visible.
5. **Filled vs empty mobile cart drawer width differs.** Filled is 323.1 × 844 at x 66.9; empty is
   390 × 844 at x 0. Confirm whether the filled width is an intentional page-edge reveal or a
   CSS regression.
6. **The cart has no discount field and no heading elements.** Coupons exist only inside GoKwik,
   and the filled cart exposes no `h1`–`h3`. If both are deliberate, they should be documented;
   otherwise they are accessibility/discoverability gaps.
7. **Short nonsense search terms still return fuzzy products.** `nonsense` → 6 and `zzzzqq` → 3;
   only a longer string produced zero results. This is Shopify search behavior, but it makes a
   “no results” state hard to reach.
