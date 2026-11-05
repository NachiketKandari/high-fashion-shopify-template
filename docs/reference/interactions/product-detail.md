# Product detail interactions — live reference

Audited on 5 November 2026 against <https://politesocietyshop.com>, using four PDPs:

| Product                              | Shape                         | Default selection          | Price (INR) |
| ------------------------------------ | ----------------------------- | -------------------------- | ----------- |
| `/products/alma-lace-corset-top`     | 3 colours × 6 sizes           | `BROWN / XS`               | `₹15,000`   |
| `/products/tote-bag`                 | 2 colours, no size            | `BLACK`                    | `₹4,000`    |
| `/products/iris-halterneck-jumpsuit` | 6 sizes, no colour            | `XL` (only available size) | `₹10,250`   |
| `/products/core-cotton-shirt-all`    | 2 colours × 4 sizes, sold out | `LIMON / S`                | `₹5,200`    |

H1s: `ALMA LACE CORSET TOP`, `FITS EVERYTHING TOTE BAG`, `IRIS HALTERNECK JUMPSUIT`, and
`CORE COTTON SHIRT`. `CORE COTTON SHIRT` was found through the `/collections/all` grid, where its
cards carry a `SOLD OUT` badge. Every value below is a computed style or bounding box read from the
live page, not an estimate.

> Read-only audit. No account, checkout, or personal data was submitted. Cart writes were limited
> to Add to Cart and Buy it now; the evidence-context items were removed afterwards and `/cart.js`
> returned `item_count: 0`. No order was placed.

## Environment

- Desktop: 1440 × 900, Chromium 156.0.8078.4 headless, fresh context, `locale: en-IN`,
  DPR 1. Mobile: 390 × 844, same browser, `isMobile: true`, `hasTouch: true`, DPR 1.
- Geo-localized to India: `Shopify.country = IN`, `Shopify.currency.active = INR`; prices use
  Indian digit grouping (`₹15,000`, `₹10,250`).
- The newsletter pop-up (5 s delay) was suppressed through its own `ps_popup_seen` localStorage key
  so it did not cover the PDP; the initial desktop screenshot was captured before it appears. When
  left open, its `.ps-popup__veil` intercepts pointer events until closed.
- Method: standalone Node scripts using `@playwright/test` Chromium, fresh contexts,
  `getComputedStyle`, `getBoundingClientRect`, ARIA snapshots, CDP touch events for mobile swipes,
  network/console listeners, screenshots. The shared Playwright MCP browser was not used.

## Controls inventory

| Control               | Accessible name / text                                                                                                | Behaviour                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Title                 | heading `ALMA LACE CORSET TOP` (level 1); product-specific on the others                                              | Static H1.                                                                                                   |
| Wishlist              | button `Save to wishlist`, `aria-pressed="false"`                                                                     | Toggles `aria-pressed`, fills the heart, writes `ps_wishlist` in localStorage. No login.                     |
| Price                 | text `₹15,000`                                                                                                        | Replaced from the variant JSON on option change. No compare-at price on these products.                      |
| Currency              | header button `INR` with chevron; a long currency `<select>` is also in the footer                                    | INR is selected. No currency code is printed beside the PDP price.                                           |
| Colour                | group `COLOUR`; radios `BROWN`, `BURNT ORANGE`, `BLACK` (Alma), `BLACK`, `CLOUD` (tote), `LIMON`, `LIGHT BLUE` (core) | Native radio group; visual control is a colour chip. Selecting changes the gallery and URL `?variant=…`.     |
| Size                  | group `SIZE`; radios `XS S M L XL XXL` (Alma, iris), `S S M L XL` (core)                                              | Native radio group shown as text labels. Unavailable sizes get `line-through` + `opacity: 0.45`.             |
| Size guide            | link `Size guide`                                                                                                     | Opens a right-hand drawer with the size-chart page fetched same-origin into the drawer.                      |
| Quantity              | spinbutton `Quantity`; buttons `Decrease quantity`, `Increase quantity`                                               | `type=number`, `min=1`, no `max`, no `step`.                                                                 |
| Add to Cart           | button `Add to Cart`                                                                                                  | Submits `/cart/add`, opens the cart drawer. Becomes disabled/hidden for sold-out variants.                   |
| Buy it now            | button `Buy it now`                                                                                                   | Adds the item, then starts the GoKwik checkout overlay for IN traffic.                                       |
| Notify me             | button `Notify me`, `aria-haspopup="dialog"`                                                                          | Replaces quantity/ATC/Buy when the selected variant is sold out. Opens the notify dialog.                    |
| Tabs                  | tablist with tabs `Description`, `Shipping, Exchange & Returns`, `Fabric`, `Fit`                                      | Four panels; click switches one panel with a 200 ms exit.                                                    |
| Related               | buttons `You may also like` / `Recently viewed`; buttons `Slide left` / `Slide right`                                 | Recommendation row loads when scrolled into view. Recently viewed is hidden until another product is viewed. |
| Help                  | link `Need help?` (desktop fixed; mobile below Buy it now)                                                            | Opens the `Contact Us` dialog instead of navigating to `/pages/contact-us`.                                  |
| Sold-out notification | button `NOTIFY ME`                                                                                                    | Opens the back-in-stock form.                                                                                |

## Interaction findings

### 1. Gallery, lightbox and zoom

- **No thumbnails and no gallery arrows.** Desktop: 0 thumbnail elements, 0 gallery buttons, 0
  dots visible. Mobile: 0 thumbnails, 0 gallery arrows, 7 dot indicators (5 px, non-interactive
  `span`s). The visible media are laid out as a single 720 px column on desktop (each image
  1079 px tall) and as a 390 px horizontal snap track on mobile (`scrollWidth: 2730` for 7 media).
- Media count depends on colour. Alma: 17 assets total, 7 visible for `BROWN`, 5 for
  `BURNT ORANGE`, 5 for `BLACK`. Tote: 7 total, 6 visible for `BLACK`, 2 for `CLOUD`. Iris: 4
  visible. Core: 7 total, 3 visible for `LIMON`. No `<video>` or media `<iframe>` on any audited PDP.
- Clicking any gallery image opens a lightbox: `role="dialog"`, `aria-modal="true"`,
  `aria-label="Product image viewer"`, full viewport, black. Count `1 / 7`, close button `Close`
  (44 × 44 at top right), arrows `Previous image` / `Next image` (44 × 44 at mid-left/right).
  Focus moves to `Close`; `Escape` closes; `ArrowLeft` / `ArrowRight` navigate.
- Lightbox count and focus: `Tab` cycles `Close → Previous image → Next image → BODY → page header`.
  There is no focus trap; keyboard focus leaves the modal into the page behind it.
- **The gallery itself is not keyboard reachable.** `.ps-pdp__media` and its `<img>` have no
  `tabindex` and no key handler; a keyboard user cannot open the viewer because only a pointer
  click on a media element calls `open()`. There is no gallery button to focus.
- Zoom: wheel zoom works on desktop (`transform: … scale(1.15)`; max 4). Pinch works on mobile
  (`scale(2.8)` observed). Double-click on desktop and double-tap on mobile both end at `scale(1)`
  from an unzoomed state: the pointer-up double-tap handler and the browser `dblclick` handler each
  toggle, cancelling each other. Double-tap from a zoomed state correctly resets to 1.
- Mobile lightbox: arrows are `display:none`; swipe left/right changes image and count; swipe down
  closes. Close is 44 × 44 at top right. Count is 9 px white text at the bottom.

### 2. Title, price, currency note, wishlist

- Title `ALMA LACE CORSET TOP`, price `₹15,000`; both desktop 22 px / 29 px / 400. Mobile both
  18 px / 24 px / 400. Price sits 8 px under the title.
- No tax, VAT, or shipping note is shown beside the PDP price. The only such note is in the cart
  drawer: `Tax included and shipping calculated at checkout`. The header shows `INR`; the price
  itself carries only `₹`.
- Currency copy is mixed: the announcement says `Free shipping worldwide above $500`, the Shipping
  tab says `5000 INR` and `$30`, and the cart free-shipping state is evaluated in INR. This is a
  copy inconsistency, not a formatting failure.
- Wishlist button is 26 × 26 with a 17.5 px icon; `aria-label` stays `Save to wishlist` in both
  states. First click set `aria-pressed="true"`, stored
  `["alma-lace-corset-top"]`, showed a 230 × 66 black toast at (605, 802) reading
  `SAVED TO YOUR WISHLIST · VIEW`, and filled the heart. Second click cleared both. The toast has
  no `role` or `aria-live`, so it is not announced as a status. The header wishlist count updates
  to `(1)` in the DOM but is `display:none`, so no visible count changes.

### 3. Colour: actual swatches, not text names

**Colour is shown as actual colour swatches/boxes, not text names.** The only visible text is the
group label `COLOUR`. Each colour is a 13.5 × 13.5 px filled square with 1 px radius and an inset
1 px `rgba(0,0,0,0.12)` hairline (rendered 14 px). Hex values are inline:

| Colour       | Chip               | Hex       |
| ------------ | ------------------ | --------- |
| BROWN        | brown square       | `#4e3628` |
| BURNT ORANGE | orange square      | `#BB5F26` |
| BLACK        | black square       | `#000000` |
| CLOUD        | pale blue square   | `#CEE1F4` |
| LIMON        | pale yellow square | `#F3F7E0` |
| LIGHT BLUE   | pale blue square   | `#CEE1F4` |

- The colour name exists only in visually hidden text: the radio's `<label>` contains a
  `.visually-hidden` name, and the current colour is a separate `.visually-hidden`
  `[data-ps-colour-name]` at 1 × 1 px. Screen readers therefore hear the name twice: once as the
  radio's accessible name and again as adjacent hidden text. Sighted shoppers see no name.
- Selected state: 1 px solid black bottom border under the chip with 3.5 px padding; unselected is
  transparent. The row gap is ~8 px. There is no hover style (opacity 1, border unchanged) and no
  transition (`transition-property: all`, `transition-duration: 0s`). Cursor is `pointer`.
- Keyboard: `Tab` from the wishlist button lands on the checked colour radio (native group, one
  tab stop). `ArrowRight` / `ArrowLeft` change the selected colour and trigger the gallery update.
  Keyboard focus paints a 1 px `rgba(0,0,0,0.5)` outline with 2 px offset around the chip.
- Selecting a colour changes the gallery immediately. Alma: `BROWN` 7 visible → `BURNT ORANGE` 5 →
  `BLACK` 5. Tote: `BLACK` 6 → `CLOUD` 2. The URL changes via `history.replaceState` to
  `?variant=…`; the page scrolls to the variant's featured media. For Alma the grouped first image
  was already at the top, so `scrollY` stayed 0. On mobile the track resets to the first image and
  the dot count changes 7 → 5.
- Unavailable colours are **not disabled**. On the fully sold-out Core shirt both colour labels
  receive `.is-unavailable`, but the swatch CSS has no unavailable rule: computed `opacity: 1`,
  `text-decoration: none`, same selected underline. They remain clickable and look enabled. Alma
  and Tote have no unavailable colours.

### 4. Size, availability and size guide

- Alma: `XS S M L XL XXL`, all available, `XS` selected. Iris: `XS S M L XL XXL`, only `XL`
  available; `XS S M L XXL` are `line-through` + `opacity: 0.45`, but the inputs are not
  `disabled`. Selecting `XS` still works, switches the PDP to sold-out, and shows `NOTIFY ME`.
  Core: `S M L XL`, all sold out; page loads in sold-out state. Tote has no size field and no
  size-guide link.
- Selected size: black text, 1 px black bottom border, 2 px padding; unselected `#4D4D4D` with a
  transparent border. No hover change. 12 px / 18 px / 400.
- **No missing-size state is reachable.** Every PDP pre-checks a variant: Alma `XS`, Tote no size,
  Iris `XL` (first available), Core `S` (first variant even though sold out). Native radios cannot
  be unchecked by the shopper, and the form has `novalidate`; there is no UI path to submit without
  a size. This answers the “Add to Cart with missing size” case for these products.
- Size guide link: 11 px `SIZE GUIDE`, `href="/pages/size-chart-tops"`. Clicking prevents
  navigation and opens a right-hand drawer:
  - Desktop 720 × 900 at x 720; mobile 366.6 × 844 at x 23.4 (94vw). Slide-in transform 0.4 s
    `cubic-bezier(0.2, 0.6, 0.2, 1)`; overlay opacity 0.3 s.
  - Panel is `role="dialog"`, `aria-modal="true"`, `aria-label="Size guide"`, with a `Close`
    button and a large `SIZE GUIDE` heading.
  - Content: `TOPS — SIZE GUIDE`; `FIND MY SIZE` with `BUST`, `HIGH WAIST`, `SHOULDER` inputs and a
    `FIND MY SIZE` button; `PS SIZING` table (`XS`–`XXXL`; Bust 32–44, High Waist 25–37, Shoulder
    14–17); `CM / IN` toggle (IN active); `SIZING CONVERSION` table (USA / UK / EU / GERMANY /
    ITALY); `HOW TO MEASURE?` A–F. On mobile the tables overflow horizontally with a
    `SWIPE TO SEE ALL SIZES` hint; the right columns are clipped.
  - Close works via `Close`, overlay click, and `Escape`. Focus is not moved when the drawer opens:
    it stays on the `Size guide` link, and `Tab` goes to `Decrease quantity` behind the drawer.
    Escape closes it, leaves focus on that background control, and does not restore it to the link.
    The page behind is not inert; desktop body overflow stayed visible while the drawer was open.

### 5. Quantity

- `input[type=number]`, `min="1"`, `max` empty, `step` empty, `inputmode="numeric"`,
  `aria-label="Quantity"`, initial value `1`. Box 100 × 36 with a 1 px `#CCCCCC` border; inner
  input 34 × 34, 12 px.
- `Decrease quantity` at 1 stayed 1. Two `Increase quantity` clicks produced 3. Typing `0` or
  `-5` and blurring clamped to 1. Typing `999` remained `999` and `validity.valid` was true (no
  range overflow), because there is no `max`. Non-numeric text is rejected by the number input.
  The plus button has no client-side inventory cap.

### 6. Add to Cart

- Pending state (request held for 1.8 s; sampled at 500 ms): button class became
  `… ps-pdp__atc loading`, `aria-disabled="true"` was set, the 16 × 16 spinner became visible at
  (1140, 366), and the label stayed `Add to Cart`. The native `disabled` property remained `false`.
- Success: `POST /cart/add` returned 200 and the cart drawer opened automatically. No toast was
  shown. Drawer: 440 × 900 at x 1000, `role="dialog"`, `aria-label="Cart"`, heading `CART (1)`;
  item `ALMA LACE CORSET TOP`, variant `BROWN · XS`, price `₹15,000`, quantity stepper,
  `REMOVE`; footer `Subtotal ₹15,000`, `Tax included and shipping calculated at checkout`,
  `CHECKOUT`, `VIEW SHOPPING CART`. It also shows
  `Congratulations! You qualify for free shipping.`
- Remove: the button's accessible name is
  `Remove ALMA LACE CORSET TOP - BROWN / XS`. After clicking, the drawer stayed open, heading
  became `CART (0)`, class gained `is-empty`, and the body read
  `YOUR SHOPPING CART IS EMPTY` with an `Explore collections` button. The header cart badge changed
  from `(1)` to `(0)` and `/cart.js` reported 0 items.
- Sold-out variant / product: selecting `XS` on Iris or loading Core sets `.ps-pdp.is-soldout`;
  the quantity block (`.ps-pdp__buy`) and Buy it now are `display:none`; the hidden ATC is
  `disabled` with label `Sold Out`; `NOTIFY ME` is shown full-width. Price and gallery remain.
- Mobile cart drawer: same pattern, 347 × 844 at x 43. The buy controls sit below the fold at
  initial load (ATC at y 841 in an 844 px viewport) and are not sticky.

### 7. Buy it now (stopped before checkout)

- Clicking Buy it now adds the item (`/cart.js` then reports 1) and opens a GoKwik checkout
  overlay for the detected Indian market. The host URL stays on the PDP; there is no Shopify
  `/checkout` navigation.
- Overlay evidence: a 450 × 810 iframe at (495, 45), `title="Checkout window"`,
  `src="https://pdp.gokwik.co/index.html"`. It shows `1 item ₹15,000`, a coupon field, a
  `Login to continue` panel, an `Enter Mobile Number` field prefilled with `+91`, a checked
  `Send me order updates & offers - (no spam)` checkbox, and a `Continue` button styled disabled
  (`button-disabled` class; native `disabled` stays `false`) until a valid number is entered. No
  personal data was entered and `Continue` was never clicked.
- `Escape`, an outside click, and the iframe's `Go back` control did not remove the host overlay;
  the page was reloaded to return to the PDP. After reload the header cart badge caught up to
  `CART (1)`; before reload it still read `(0)` while the cart contained 1. The item was then
  removed through the cart drawer.
- The PDP script branches on `browsing_context_suggestions.json`: India → GoKwik, otherwise
  `location.href = Shopify.routes.root + 'checkout'`. The observed IN path is GoKwik.

### 8. Notify me / sold out

- The notify dialog is appended to `body`, full-viewport overlay, white panel 440 × 517 at
  (500, 192), `role="dialog"`, `aria-modal="true"`, labelled `Notify me`. Title `NOTIFY ME`;
  product line `IRIS HALTERNECK JUMPSUIT — XS`; copy
  `This size is sold out. Leave your details and we'll email you as soon as it's back.`
  Fields `Name` (text), `Email` (email), `Phone number` (tel), all required; submit `NOTIFY ME`.
- Opening focuses `Name`. Empty submit produced `Please add your name.` and
  `aria-invalid="true"` on Name; submission stopped there and the success state was not reached.
  `Escape` and `Close` hide the dialog and return focus to the `NOTIFY ME` trigger. On mobile the
  panel is full width and bottom aligned (`max-height: 90dvh`).
- Core loads sold out with the same notify control and `LIMON / S` selected; no ATC or Buy it now
  is available.

### 9. Tabs

- All four PDPs use the same tab set: `Description`, `Shipping, Exchange & Returns`, `Fabric`,
  `Fit`. Clicking a tab updates `aria-selected`, `.is-active`, and shows exactly one `tabpanel`.
  The switch uses a 200 ms leave/enter fade (`transform: translateY(0.6rem)` → none).
- Alma content:
  - Description: `- Panelled corset with internal boning & cups`, `- Eyelets and adjustable lacing
    at the back`, `- Body-fitted silhouette`, `- Model is wearing size XS`; then
    `Fabric & Care: - Main: 100% Viscose Satin with Nylon Lace - Lining: Poly Cotton - Care: Dry
    Clean on low heat`.
  - Shipping: `Domestic Orders (India)` shipped in 6–7 business days, free domestic shipping above
    `5000 INR`; `International Orders` shipped in 7–10 business days, `$30` shipping; 14-day
    exchange/return; links `Shipping & Delivery Policy`, `Return & Exchange Policy`, `Contact Us`.
  - Fabric: `Viscose with Nylon Lace`.
  - Fit: `Panelled Corset`.
- Tabs are 11 px / 16 px / 400, 1 px active underline. Desktop tablist 424 px wide with 32 px
  gaps; mobile tablist 350 px with all four on one row (`space-between`, 8 px gaps).
- Keyboard: all four tabs are in the tab order, but `ArrowRight` on the focused tab does nothing;
  there is no roving tabindex or arrow-key handling. Tabs have no `aria-controls`; panels have no
  `aria-labelledby` and no accessible name.

### 10. Related products, recently viewed, sticky bar, help

- `You may also like` loads only when the section is scrolled into view. Alma rendered 7 cards:
  `ALMA LACE SKIRT`, `RATI CORSET`, `ROSA CORSET TOP`, `LILITH CORSET`, `GULNAR CORSET TOP`,
  `HERA APPLIQUE CORSET`, `DRAPED SATIN SKIRT`. Desktop shows 4 across plus a peek; arrows
  `Slide left` (disabled at start) and `Slide right` (enabled). Mobile hides the arrows and scrolls
  the row horizontally.
- `Recently viewed` is hidden until a second product is viewed. After visiting Tote and returning
  to Alma, the tab appeared, selecting it showed one card (`FITS EVERYTHING TOTE BAG`), and the
  handles persisted in localStorage `ps_recent` (`["alma-lace-corset-top","tote-bag"]`). The
  current product is excluded; the tab is not a server-rendered list.
- **No sticky Add to Cart bar exists.** Desktop and mobile each report 0 fixed ATC buttons. The
  desktop info column (`.ps-pdp__sticky`, 408 px) is `position: sticky` at top 140 px once the
  header is stuck; it keeps the buy controls visible while the gallery scrolls, then moves off at
  the end of the info column (top `-198 px` at `scrollY 7200`). On mobile the column is static and
  the ATC scrolls away (top `-359 px` at `scrollY 1200`).
- Help: desktop shows a fixed 68 × 14 `Need help?` link at (1342, 856); mobile shows a static
  `Need help?` link at (20, 976), below Buy it now. Both open the `Contact Us` dialog rather than
  navigating to `/pages/contact-us`. Desktop dialog 420 × 900 at x 1020; mobile full-screen
  390 × 844. It contains `Close`, `WhatsApp`, `Call Us`, `Email Us`, `Visit Our Flagship Store`;
  `Escape` and `Close` close it. The sitewide hCaptcha badge, when loaded, is a fixed 225 × 55
  element at bottom-right (measured in the collection audit) and overlaps the desktop help pill.

## Measured values

| Metric                | 1440 × 900                                                       | 390 × 844                                                                 |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Announcement / header | 30 / 76 px                                                       | 35 / 56 px                                                                |
| Main top              | 106 px                                                           | 91 px                                                                     |
| PDP / gallery top     | 30 / 30 px                                                       | 35 / 35 px                                                                |
| Gallery               | 720 × 7554; 7 stacked media at 720 × 1079                        | 390 × 602; track 2730 scrollWidth, 1 media per 390                        |
| Info column           | 720 × 7554; padding 140px 0 80px                                 | 390 × 633; padding 24px 20px 48px                                         |
| Sticky column         | 408 × 503 at (880, 170)                                          | static; 350 × 561 at (20, 661)                                            |
| H1 / price            | 22 / 29 / 400; price 22 / 29 / 400, tracking 1.1                 | 18 / 24 / 400; price 18 / 24 / 400, tracking 0.9                          |
| Wishlist              | 26 × 26 at (1267, 172)                                           | 26 × 26 at (349, 663)                                                     |
| Colour chip           | 13.5 × 13.5, radius 1, inset 1px shadow; label 13.5 × 18; gap ~8 | same 13.5 × 13.5; label 13.5 × 18                                         |
| Colour name           | 1 × 1 clipped at (879, 272)                                      | 1 × 1 clipped at (19, 756)                                                |
| Size label            | 12 / 18 / 400; 16 × 21 selected, 8 × 21 unselected; gap 11       | same; 16 × 21 selected                                                    |
| Size guide link       | 62 × 19 at (1226, 310), 11 px                                    | 62 × 19 at (308, 795)                                                     |
| Quantity / input      | 100 × 36 / 34 × 34, border `#CCC`                                | 100 × 36 / 34 × 34                                                        |
| Add to Cart           | 296 × 36 at (992, 356), 11 px                                    | 238 × 36 at (132, 841)                                                    |
| Buy it now            | 408 × 36 at (880, 404), black                                    | 350 × 36 at (20, 889)                                                     |
| Tabs                  | 424 wide; 11 / 16 / 400; 1 px underline                          | 350 wide; all four on one row                                             |
| Dots                  | `display:none`                                                   | 7 × (5 × 5), gap 6, y 632                                                 |
| Cart drawer           | 440 × 900 at x 1000                                              | 347 × 844 at x 43                                                         |
| Size guide drawer     | 720 × 900 at x 720                                               | 366.6 × 844 at x 23.4                                                     |
| Notify panel          | 440 × 517 at (500, 192)                                          | full width, bottom aligned                                                |
| Wishlist toast        | 230 × 66 at (605, 802), 9 px                                     | same style                                                                |
| Lightbox              | 1440 × 900; close 44 × 44; arrows 44 × 44; count 9 px white      | full 390 × 844; close 44 × 44; arrows `display:none`; count 9 px at y 803 |
| Buy it now overlay    | 450 × 810 iframe at (495, 45)                                    | —                                                                         |
| Page scroll height    | 8302 px                                                          | 2400 px                                                                   |

**Motion values (computed):**

- Swatches and size labels: `transition-property: all`, `transition-duration: 0s`; no hover change.
- Tabs: `border-color 0.2s cubic-bezier(0.2, 0.6, 0.2, 1), opacity 0.2s`.
- Add to Cart / Buy it now: `background 0.3s cubic-bezier(0.2, 0.6, 0.2, 1), color 0.3s`.
  ATC hover goes outline → black fill/white text; Buy hover goes black fill → white fill/black text.
- Help pill: `opacity 0.2s`.
- Size guide drawer: panel `transform 0.4s cubic-bezier(0.2, 0.6, 0.2, 1)`; overlay `opacity 0.3s`.
- Tab panel: `opacity 0.22s` + `transform 0.28s`; leaving state `translateY(0.6rem)`; switch waits
  200 ms before showing the next panel.

## Console and network

- Product, cart, and recommendation requests succeeded in the focused runs. `POST /cart/add`
  returned 200; `/cart.js` returned 200; `/recommendations/products…` returned 200; product `.js`
  and `.json` returned 200.
- In the focused PDP/ATC run the only non-2xx response was
  `403 https://shop.app/pay/hop?…` (document), blocked by the page's CSP
  `frame-ancestors`; it does not affect the PDP. Other runs logged generic `403`/`429` resource
  errors from tracking or hCaptcha assets; no product, cart, or recommendation endpoint failed.
- Console errors: the CSP refusal for `shop.app`, and a generic `Failed to load resource: 403`.
  One sold-out-page run also logged a generic `429` and an hCaptcha WebAssembly `EvalError`; no
  user-facing failure followed.
- Console warnings: `[GoKwik OCC] No buttons claimed…`, `[Meta Pixel] - Invalid parameter format
  for currency`, `Swym No Retailer Id specified!`, `Universal Cookies script is already loaded`,
  and WebGL `GPU stall due to ReadPixels`.
- Failed requests were analytics/beacon aborts (`monorail`, Google Ads/GA, Chimpstatic, Meta
  pixel) plus the blocked `shop.app` document. Buy it now additionally loaded
  `sdk.gokwik.co/sdk/latest/gokwik-sdk.min.js` and `pdp.gokwik.co/…merchant.integration.js`, both
  successfully.
- Add to Cart emitted a `Clear-Site-Data` response header clearing `prefetchCache` and
  `prerenderCache`; no functional error.

## Screenshots

All are in `.playwright-mcp/`, viewport or element captures:

Desktop 1440 × 900:

- `ux-live-pdp-initial-desktop.png` — initial PDP, title/price/swatches/sizes/buy controls.
- `ux-live-pdp-colour-closeup-desktop.png` — 3× close-up: selected brown chip underline, three
  chips, size row.
- `ux-live-pdp-swatches-closeup-desktop.png` — chip-only close-up.
- `ux-live-pdp-colour-keyboard-focus-desktop.png` — keyboard focus ring on the selected chip.
- `ux-live-pdp-colour-burnt-orange-desktop.png` — `BURNT ORANGE` selected, gallery changed.
- `ux-live-pdp-gallery-lightbox-desktop.png` — viewer open, count `1 / 7`.
- `ux-live-pdp-gallery-wheel-zoom-desktop.png` — wheel zoom at `scale(1.15)`.
- `ux-live-pdp-atc-pending-desktop.png` — spinner and loading class while the add is pending.
- `ux-live-pdp-cart-drawer-desktop.png` — item in the cart drawer.
- `ux-live-pdp-cart-empty-desktop.png` — empty drawer after `REMOVE`.
- `ux-live-pdp-size-guide-desktop.png` — size-guide drawer and tables.
- `ux-live-pdp-tabs-shipping-desktop.png`, `ux-live-pdp-tabs-fabric-desktop.png` — tab panels.
- `ux-live-pdp-wishlist-desktop.png` — filled heart and toast.
- `ux-live-pdp-soldout-iris-desktop.png`,
  `ux-live-pdp-soldout-selected-iris-desktop.png` — Iris available/sold-out size states.
- `ux-live-pdp-notify-desktop.png` — back-in-stock dialog.
- `ux-live-pdp-soldout-core-desktop.png` — fully sold-out Core PDP.
- `ux-live-pdp-tote-colour-desktop.png` — colour-only tote.
- `ux-live-pdp-reco-desktop.png`,
  `ux-live-pdp-recently-viewed-desktop.png` — related/recently viewed rows.
- `ux-live-pdp-buy-now-desktop.png` — GoKwik checkout overlay (stopped at phone entry).
- `ux-live-pdp-help-desktop.png` — Contact Us drawer.
- `ux-live-pdp-scroll-sticky-desktop.png` — sticky info column at `scrollY 2000`.

Mobile 390 × 844:

- `ux-live-pdp-initial-mobile.png` — initial viewport, dots, info below the gallery.
- `ux-live-pdp-gallery-swipe-mobile.png` — second image after a CDP touch swipe.
- `ux-live-pdp-gallery-lightbox-mobile.png` — viewer with `2 / 7` count and close.
- `ux-live-pdp-info-mobile.png` — info column, mobile controls, help link.
- `ux-live-pdp-colour-closeup-mobile.png` — mobile colour chips.
- `ux-live-pdp-colour-burnt-orange-mobile.png` — colour change and 5-dot gallery.
- `ux-live-pdp-size-guide-mobile.png` — 94vw size-guide drawer with horizontally clipped table.
- `ux-live-pdp-tabs-default-mobile.png`,
  `ux-live-pdp-tabs-shipping-mobile.png` — mobile tab row and Shipping panel.
- `ux-live-pdp-cart-drawer-mobile.png` — mobile cart drawer.
- `ux-live-pdp-help-mobile.png` — full-screen Contact Us drawer.
- `ux-live-pdp-scroll-sticky-mobile.png` — no sticky buy bar; related row and value props.
- `ux-live-pdp-gallery-pinch-mobile.png` — pinch zoom at `scale(2.8)`.

## Open questions

1. Should the gallery expose thumbnails or make the media keyboard-focusable? Currently the
   lightbox is pointer-only, and the viewer has no focus trap.
2. Should sold-out colours look disabled? Core's unavailable colour labels receive
   `.is-unavailable` but no swatch CSS changes, so they look selectable.
3. Is the missing-size state intentionally unreachable? Every PDP preselects a variant; there is no
   user path to an unselected state or “Please select a size”.
4. Should the size-guide drawer move/trap focus and make the page behind inert? It currently leaves
   focus on the trigger, then lets `Tab` move behind the drawer.
5. Should the colour name be visible next to the swatches? It is screen-reader-only today, and the
   current colour is announced twice.
6. Is the mixed currency copy intentional: `$500` free shipping in the announcement, `5000 INR`
   and `$30` in the Shipping tab, and an INR cart threshold?
7. Should Buy it now close or suppress the GoKwik overlay on `Escape`/backdrop, and refresh the
   header cart count when the added item is not reflected until reload?
8. The ATC pending state sets `aria-disabled` but does not set native `disabled`; can rapid repeat
   clicks enqueue more than one add?
