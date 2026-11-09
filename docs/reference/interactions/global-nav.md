# Global navigation interactions — live reference storefront

Evidence from the live storefront at <https://politesocietyshop.com> on 2026-11-05. Read-only: no order, checkout, or real personal data. The only form submitted used `test+audit@example.com`.

## Environment

- Live URL: <https://politesocietyshop.com> (Shopify storefront, theme 59).
- Browser: headless Chromium via a standalone `@playwright/test` 1.64.1 script, not the shared Playwright MCP browser.
- Viewports: **1440×900** and **390×844** (mobile context with `isMobile`, `hasTouch`).
- Locale `en-US`; timezone `Asia/Kolkata`. Fresh browser context per pass; localStorage was seeded only to suppress the 5-second signup popup after it had been captured.
- Geo state on arrival: Shopify `localization=IN` cookie, currency **INR**, account locale `en-IN`. This is not a USD-default storefront.
- Initial page state is a **large masthead header**: announcement 30 px; header section **183 px** tall at 1440 (masthead 110 px + 76 px bar, with a 3 px overlap). On scroll it collapses to the 76 px bar with the compact wordmark.
- Interference: a **“JOIN THE NEWSLETTER” signup popup** auto-opens after 5 s on a fresh context. It covers the page with a 45% black veil and blocks pointer events until closed. Closed via X or Escape; it writes `ps_popup_seen` and suppresses itself for 30 days. Captured once, then suppressed for the interaction passes.

## Inventory of controls

### Header, desktop 1440

| Control                             | Selector / accessible name                                                 | Type                        | Destination or result                 |
| ----------------------------------- | -------------------------------------------------------------------------- | --------------------------- | ------------------------------------- |
| Wordmark (masthead)                 | `a.ps-header__masthead-link`, “reference wordmark”                         | link                        | `/`                                   |
| Wordmark (compact, collapsed state) | `a.ps-header__wordmark`                                                    | link                        | `/`                                   |
| New In                              | `a.ps-header__menu-link` “NEW IN”                                          | link                        | `/collections/chapter-x`              |
| Woman                               | `a.ps-header__menu-link` “WOMAN”                                           | hover/focus mega trigger    | `href="#"`; opens mega panel          |
| Unisex                              | `a.ps-header__menu-link` “UNISEX”                                          | hover/focus mega trigger    | `href="#"`; opens mega panel          |
| Edit                                | `a.ps-header__menu-link` “EDIT”                                            | hover/focus mega trigger    | `href="#"`; opens mega panel          |
| Our World                           | `a.ps-header__menu-link` “OUR WORLD”                                       | hover/focus mega trigger    | `href="#"`; opens mega panel          |
| Currency                            | `div.ps-header__currency`; select `[data-ps-currency-select]`, label “INR” | native select, 56 options   | converts displayed prices client-side |
| Search                              | `#search-icon-open`, aria-label “Search”, `aria-haspopup="dialog"`         | button                      | right search drawer                   |
| Wishlist                            | `a.ps-header__icon--wishlist`, aria-label “Wishlist”                       | link                        | `/pages/wishlist`                     |
| Help                                | `.concierge__trigger`, aria-label “Contact Us”, `aria-haspopup="dialog"`   | button                      | right contact drawer                  |
| Account                             | `a.ps-header__icon--account`, aria-label “Account”                         | link                        | Shopify customer-account login        |
| Cart                                | `a.ps-header__icon--cart`, aria-label “Cart”, text “CART (0)”              | link **and** drawer trigger | opens cart drawer; does not navigate  |

Visible utility order at 1440: **INR ⌄ · SEARCH · WISHLIST · HELP · ACCOUNT · CART (0)**, right-aligned at y≈166. Nav labels are 13 px with 0.65 px letter-spacing.

### Header, mobile 390

Left-to-right: wordmark (210×17 at x=14), then Search, Help, Cart, Menu at x≈359. Wishlist, Account, and Currency are **not** in the mobile header bar; they live in the menu drawer.

| Control | Selector / accessible name                    | Result                                             |
| ------- | --------------------------------------------- | -------------------------------------------------- |
| Menu    | `header-drawer summary[aria-label="Menu"]`    | opens full-width menu below header; icon becomes X |
| Search  | `.ps-header__bar button[aria-label="Search"]` | full-screen search                                 |
| Help    | `.ps-header__bar .concierge__trigger`         | full-width contact drawer                          |
| Cart    | `.ps-header__bar a.ps-header__icon--cart`     | full-screen cart drawer                            |

### Footer

| Group     | Links                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HELP      | Size Guide → `/pages/size-guide`; Care Instructions → `/pages/care-guide`; FAQ → `/pages/faqs`; Contact Us → `/pages/contact-us`                                            |
| POLICIES  | Terms & Conditions → `/pages/terms-of-service`; Privacy → `/pages/privacy-policies`; Shipping → `/pages/shipping-returns`; Returns & Exchange → `/pages/returns-exchanges`  |
| THE BRAND | Our World → `/pages/about-us`; Journal → `/blogs/journal-2`; Press → `/pages/press-v2`                                                                                      |
| SOCIALS   | Instagram → instagram.com/politesociety_official/; Facebook → facebook.com/politesocietyshop/; Pinterest → in.pinterest.com/politesociety_official/ (all `target="_blank"`) |

Also: store address/hours, footer wordmark → `/`, newsletter form, currency select, payment marks (Amex, Diners, Maestro, Mastercard, RuPay, Visa), copyright “© 2026 · reference brand · Website by UniPlus”. Social **icon** row is `display:none`; socials appear only as the text column.

Newsletter: `form.ps-footer__form` → `POST /contact#ps-newsletter-sections--24198141214859__ps_footer`, input type `email`, name `contact[email]`, placeholder **“Your e-mail”**, `required`, submit **“SUBSCRIBE”**.

Footer currency: `div.ps-footer__currency` with visually hidden label “Currency”, visible `span[data-ps-currency-label]` and invisible native select (56 options, opacity 0). Desktop bottom-right; mobile centred above the copyright.

## Interaction findings

### 1. Announcement bar

- Text: **“Need it sooner? Reach out to us before placing your order”** and **“Free shipping worldwide above $500”**. No links; both are plain text.
- Container: `role="region"`, `aria-label="Announcement"`, `aria-live="polite"`, black `#000`, white text, height **30 px** desktop / **35 px** mobile, 12 px text with 16 px line-height.
- Rotation: every **3000 ms** (`data-interval="3000"`). Each slide fades/slides over **0.5 s** with `opacity 0.5s cubic-bezier(0.2, 0.6, 0.2, 1), transform 0.5s cubic-bezier(0.2, 0.6, 0.2, 1)`, from `translateY(4px)` to none. Both slides are absolutely stacked, so both are partially visible during the 0.5 s crossfade.
- Hover **pauses** rotation (confirmed by sampling active index before/after 3.4 s). Visibilitychange also pauses in the inline script. Focus does **not** pause.
- At 390, the first message wraps to two lines inside the 35 px bar. During crossfade the outgoing and incoming messages overlap visibly; a screenshot happened to catch both legible at once. This is the strongest visual defect in the announcement bar.
- Reproduction: load `/`, watch for 7 s; hover the bar and wait 4 s to confirm the active slide does not change.

### 2. Header and mega menus

Desktop mega menus are **CSS hover/focus menus**, not click dialogs:

- Trigger elements are `<a href="#" class="ps-header__menu-link">`, not buttons. They have **no `aria-expanded`, no `aria-haspopup`, no `role`**.
- CSS: `.ps-header__menu-item.has-mega:hover .ps-mega` and `:focus-within .ps-mega` set `opacity:1; visibility:visible; transform:none`.
- Panel geometry at 1440: full viewport width **1440×496 px** at y=213 (immediately under the 183 px header). It is a full-width white panel with a 1 px top/bottom rule, z-index 6. Tiles are **260×390 px**.
- Open transition: **0.3 s cubic-bezier(0.2, 0.6, 0.2, 1)** on opacity and transform, from `translateY(-4px)` to none. Close samples: opacity 1 → 0.27 at 80 ms → 0.064 at 160 ms → 0.0028 at 260 ms → **hidden at 400 ms**. `visibility` is delayed 0.3 s on close.
- Hovering from one top-level item to another switches panels; moving the pointer below the header closes the panel.
- There is **no click handler**. The trigger’s href is `#`, so clicking with a pointer (which is also hovering) opens the panel and pushes the URL to `/#`; the panel is not a click-toggled popup.

Panels:

| Trigger       | Columns                                        | Column links                                                                                                                                           | Tiles                                                                                          |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Woman**     | SHOP WOMAN; SHOP BY OCCASION; SHOP BY CATEGORY | All, Tops, Corsets, Dresses & Jumpsuits, Co-ord Sets, Knitwear, Bottoms, Accessories; Work Wear, Evening, Weekend, FESTIVE; Core, Essentials, Elevated | Corsets → `/collections/corsets`; Dresses & Jumpsuits → `/collections/dresses-and-jumpsuits`   |
| **Unisex**    | SHOP UNISEX                                    | Shirt & T-Shirts, Bottoms, Outerwear                                                                                                                   | Shirts & T-shirts → `/collections/shirts-and-tshirts`; Bottoms → `/collections/bottoms-unisex` |
| **Edit**      | (no column title)                              | Lookbooks → `/pages/lookbooks`; Journal → `/blogs/journal-2`                                                                                           | Lookbooks; Journal                                                                             |
| **Our World** | (no column title)                              | About Us → `/pages/about-us`; Press → `/pages/press-v2`                                                                                                | The Founder → `/pages/about-us#founder`; Flagship Store → `/pages/about-us#store`              |

Every tile is a portrait image with `width=900 height=1350` in the markup, rendered **260×390 px** at 1440, alt text equal to the label, lazy-loaded, with the uppercase label below the image. The panel itself uses three text columns for Woman and one for the other menus.

**New In** has no panel; it is a direct link to `/collections/chapter-x`.

Keyboard behavior (this is where live differs from an accessible menu):

- Focusing the Woman trigger via keyboard opens the panel through `:focus-within`.
- Pressing **Escape does not close it** and does not move focus. Focus remains on the trigger and the panel remains fully visible.
- Tab moves into the panel’s first link (ALL) and keeps the panel open; after 8 Tabs focus was still on ACCESSORIES. Closing by keyboard requires moving focus out of the entire item (Shift+Tab back past the trigger, or tabbing through all 17 links).
- No `role="menu"`; the nav has `aria-label="Menu"`. The panel is not announced as expanded.

Reproduction: at 1440, move the mouse over WOMAN and wait 300 ms; inspect the full-width panel. Move the pointer below the header and sample opacity. Then reload, Tab to WOMAN, press Escape, and observe the panel stays open.

### 3. Header utilities

**Currency — display-only client-side conversion.** Initial label **INR**, prices such as `₹13,500`, `₹14,000`, `₹10,500`. Choosing **USD** changed the label to USD and the same cards to `$142`, `$148`, `$111`; choosing **EUR** changed them to `€127`, `€132`, `€99`. There was **no navigation, no page reload, and no `/localization` request** in 15 s; `localization=IN` and `ps_fx_country=IN` stayed unchanged, while `ps_fx_rates` remained in localStorage. The footer and header selectors sync labels and prices. The native select is transparent and overlaid on the visible label + chevron; 56 options from INR to FJD.

**Wishlist.** `aria-label="Wishlist"`, href `/pages/wishlist`; count badge is `hidden` when empty. Loads a page titled **Wishlist**. Mobile exposes Wishlist only inside the drawer.

**Search.** Button “SEARCH”, `aria-haspopup="dialog"`; opens the right-side search drawer described below. It is not a `role="dialog"` and has no `aria-modal`.

**Help / Contact.** Button “HELP”, aria-label “Contact Us”. Opens a right drawer `<aside class="concierge__panel" role="dialog" aria-modal="true" aria-label="Contact Us">`:

- Header: close button (aria-label **Close**, 44 px circle), title **CONTACT US**.
- Rows: **WHATSAPP** → `https://wa.me/918976064836` (`_blank`, `noopener noreferrer`); **CALL US** → `tel:+918976064836`; **EMAIL US** → `mailto:hi@politesociety.in`; **VISIT OUR FLAGSHIP STORE** → Google Maps place URL (`_blank`).
- Desktop panel **420×900** at x=1020; mobile **390×844**. Panel transition **0.35 s cubic-bezier(0.22, 1, 0.36, 1)** on transform from `translateX(100%)`; overlay `rgba(0,0,0,.4)` with **0.3 s ease**; z-index 9998/9999.
- Opening adds `concierge-lock` to `<html>` (overflow hidden), moves focus to Close, and leaves the rest of the page scroll-locked.
- Close controls: X, **Escape**, and **backdrop click** all close. Verified each separately.
- Focus is **not trapped**: after Tab through the four rows, focus jumped to a page hero link behind the panel. This is a real accessibility gap.
- Panel closes to `hidden` with `translateX(420px)`; content below the four rows is empty whitespace.

**Account.** Desktop link href `https://politesocietyshop.com/customer_authentication/redirect?locale=en&region_country=IN`; clicking navigates to `https://account.politesocietyshop.com/authentication/login?...` (Shopify customer accounts). No modal opens. An unused `<account-modal>` element exists in the DOM with “Welcome to Your Account” / “Log in”, but the header link bypasses it. Mobile only exposes Account in the drawer bottom row.

**Cart.** Link text `CART (0)`, aria-label “Cart”, `aria-haspopup="dialog"`, href `/cart`, but click is intercepted: it opens `<cart-drawer>` without navigating. Empty state: “CART (0)” / “YOUR SHOPPING CART IS EMPTY” / browse copy / **EXPLORE COLLECTIONS** button; Checkout button is present but hidden. Close via **X**, **Escape**, and backdrop. Drawer inner is 440×900 desktop, 390×844 mobile; inner transform **0.6 s**, container visibility **0.7 s**; body scroll locks. The container has a 10% black scrim; the separate `.cart-drawer__overlay` computes to `rgba(0,0,0,0)`, so the visible dim is only 10%. It has **no `role="dialog"`/`aria-modal`**, and focus remains on the Cart link rather than moving into the drawer.

### 4. Search drawer

- Opens from the header SEARCH button into a right drawer. `<search-modal class="header__search animate active">`; no native `<dialog>`, no `open` attribute, no `role="dialog"`, no `aria-modal`. Trigger has `aria-haspopup="dialog"`.
- Desktop drawer **440×900** docked right; mobile **390×844** full-screen. Content transition **0.6 s ease** (`transform` from `translateX(440px)` to `0` on desktop; same mechanism at mobile width).
- Backdrop `#SearchModal-Overlay`: fixed, `rgba(0,0,0,.1)`, no transition (computed 0 s), full-viewport pointer events. Body overflow hidden while open.
- Input: `#Search-In-Modal-1`, `role="combobox"`, `aria-expanded="false"`, `aria-controls="predictive-search-results-list"`, `aria-haspopup="listbox"`, `aria-autocomplete="list"`, placeholder **“Type to Search”**. The placeholder is **invisible**: computed `::placeholder` color is `rgba(0,0,0,0.6)` but opacity is **0**. The empty drawer therefore shows only a hairline, the SEARCH submit label, and a close X.
- Empty state has no suggestions: the predictive-search container is 0×0 and contains only a spinner. No trending/recent searches.
- Typing `dress` (desktop or mobile) after ~2 s yields: group **Suggestions** with 5 product rows (Meira Corset Mini Dress denim, Meira Corset Mini Dress solapur, Classic Maxi Dress, Lolita Slip Dress, Gulnar Denim Maxi Dress), each with a 48 px thumbnail, title only, no price; then **Collections** with **DRESSES & JUMPSUITS**. Results list measured 392×549 desktop / 342×549 mobile. There is a clear-X inside the input when text exists; clicking it clears the value but **leaves the previous suggestions visible** (stale results) and sets `aria-expanded=false`.
- Close: **Escape**, the close X, and clicking the 10% backdrop all close; focus returns to the trigger. Body overflow is released. On mobile the drawer is full-screen, so there is no exposed backdrop area.

Reproduction: click SEARCH, observe the blank drawer and missing placeholder, type “dress”, wait for results, press Escape; reopen, type, click the clear X and observe stale suggestions.

### 5. Footer

- Four link groups as listed in the inventory; links open in place except socials (new tab).
- Newsletter: label **Subscribe to Our Newsletter**, input **Your e-mail**, submit **SUBSCRIBE**, native HTML5 `required` + `type=email`, form POST to `/contact#...`. With `test+audit@example.com`, clicking Subscribe produced **no navigation, no POST to `/contact`, no inline success or error, and left the email in the field** after 12 s. Shopify’s hCaptcha script loaded and `checksiteconfig` returned 200; the submission appears gated by the invisible challenge, which cannot complete in headless Chromium. There is no visible pending state, so a shopper gets no feedback while the challenge runs.
- Social links: text column only (icons hidden). Instagram/Facebook/Pinterest open new tabs.
- Currency: selecting **EUR** in the footer changed both the footer and header labels to EUR and converted visible prices (`₹13,500` → `€127`) with no reload and no localization request, matching the header selector.
- Mobile footer order: store address, 2-column link groups, newsletter, wordmark, centred currency, copyright, payment marks. Social icon row remains hidden. Footer measured 839 px tall at 390 vs 361 px at 1440 (excluding the image strip above it).

### 6. Mobile menu drawer

- Trigger: `header-drawer summary[aria-label="Menu"]`, rightmost header icon; open icon becomes X. Drawer is `<div id="menu-drawer">` inside a native `<details>`.
- Open geometry: **390×753** at y=91 (below 35 px announcement + 56 px header), full width, white, no separate dim overlay. Drawer visibility/opacity transition **0.3 s**; inner container transform **0.6 s**. Body overflow becomes `hidden`; wheel scrolling does not move the page (scrollY stays 0).
- Top-level links: **NEW IN** (direct), **WOMAN**, **UNISEX**, **EDIT**, **OUR WORLD** (accordion chevrons), **WISHLIST**.
- Woman expands **inline** (not a second-level slide-out): ALL, TOPS, CORSETS, DRESSES & JUMPSUITS, CO-ORD SETS, KNITWEAR, BOTTOMS, ACCESSORIES; nested **SHOP BY OCCASION** (Work Wear, Evening, Weekend, FESTIVE) and **SHOP BY CATEGORY** (Core, Essentials, Elevated). Chevron rotates; the `.menu-drawer__close-button` back control is `display:none`, so there is no visible back button. Unisex/Edit/Our World use the same accordion pattern.
- Pinned bottom row: 87 px high, border-top, at y=757. **Currency** select on the left (visible label INR + chevron, 56 options, 35×50 hit area) and **ACCOUNT** link on the right. The nav area above it is 654 px and scrolls independently.
- Close: tapping the burger again (X) closes. **Escape from the base drawer closes it in one press** and focus stays on the summary. With a submenu open, the **first Escape closes the submenu**, the **second closes the drawer**, after which focus falls to `<body>` instead of returning to the menu button.
- Backdrop: there is none at 390 because the drawer is full-width. Clicking near the bottom-right (inside the drawer) does not close it.
- Search, Help, and Cart are separate full-screen surfaces on mobile; the drawer is not reused for them.

### Reproduction steps

1. **Announcement:** open <https://politesocietyshop.com/> at 1440×900; wait 3 s for the slide change; hover the bar for 4 s and confirm the active slide pauses.
2. **Mega menus:** hover **WOMAN**; wait 300 ms; inspect the 1440×496 panel. Move the pointer to y≈850 and sample opacity. Reload, focus WOMAN with the keyboard, press Escape, then Tab into the panel.
3. **Currency:** at the top right, choose **US Dollar (USD)** from the INR select; compare card prices before/after and check that the URL and `localization` cookie do not change. Scroll to the footer and choose **EUR**; compare again.
4. **Search:** click **SEARCH**; inspect the empty drawer; type `dress`; wait ~2 s; observe 5 product rows + Collections. Click the clear X, then Escape; reopen, click the close X; reopen, click the left backdrop.
5. **Help:** click **HELP**; inspect all four rows; press Escape. Reopen, click the dimmed area at x≈200, then reopen and click the X.
6. **Account/cart:** click **ACCOUNT** and record the redirect to `account.politesocietyshop.com`; go back. Click **CART (0)** and confirm the drawer opens without navigating; close with Escape.
7. **Footer:** scroll to the footer; fill `test+audit@example.com`; click **SUBSCRIBE**; wait 10 s and confirm no message/navigation; then select **EUR** in the footer currency picker.
8. **Mobile:** at 390×844, tap the rightmost menu icon; tap **WOMAN**; press Escape twice; reopen and tap X. Then test Search, Help, and Cart from the header.

## Measured values

| Surface         | Size / position                                      | Motion from `getComputedStyle`                                               | Notes                                          |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Announcement    | 1440×30 desktop; 390×35 mobile                       | items `opacity .5s cubic-bezier(.2,.6,.2,1)`, `transform .5s` same           | 3000 ms interval; both slides crossfade        |
| Desktop header  | 183 px total; masthead 110, bar 76; sticky top 0 z12 | collapse anim `0.3s cubic-bezier(.32,.72,0,1)`                               | compact wordmark 342×27 hidden until collapsed |
| Mega panel      | 1440×496 at y213                                     | `opacity .3s cubic-bezier(.2,.6,.2,1)`, `transform .3s`, `visibility 0s .3s` | closed at `translateY(-4px)`, open `none`      |
| Header currency | 35.7×18 visible label                                | none                                                                         | native select 56 options, transparent overlay  |
| Search drawer   | 440×900 desktop; 390×844 mobile                      | content `0.6s ease`; overlay 0s                                              | closed transform `translateX(440px)` desktop   |
| Search overlay  | 1440×900                                             | none                                                                         | `rgba(0,0,0,.1)`                               |
| Search input    | 392×35 desktop; 342 wide mobile                      | inherited                                                                    | placeholder opacity 0                          |
| Search results  | 392×549 desktop; 342×549 mobile                      | inherited                                                                    | 5 products + 1 collection                      |
| Contact drawer  | 420×900 desktop; 390×844 mobile                      | `transform .35s cubic-bezier(.22,1,.36,1)`; overlay `.3s ease`               | z 9998/9999; `role=dialog`, `aria-modal=true`  |
| Cart drawer     | inner 440×900 desktop / 390×844 mobile               | inner `.6s`; container `visibility .7s`                                      | 10% scrim; no dialog role                      |
| Mobile menu     | 390×753 at y91                                       | drawer `.3s`; inner `.6s`                                                    | bottom row 87; nav 654                         |
| Signup popup    | card max 720 wide; 45% veil                          | veil `.3s`, card `.35s`                                                      | opens after 5 s; 30-day `ps_popup_seen`        |

## Console/network

No uncaught JavaScript exceptions during navigation, mega menus, search, contact, cart, footer, or mobile drawer.

Console:

- **Error:** `Framing 'https://shop.app/' violates ... frame-ancestors` — Shopify Shop Pay iframe blocked by CSP.
- **Error:** `Failed to load resource: 403`; the corresponding blocked document is `https://shop.app/pay/hop?...` (status **403**).
- Warnings only: GoKwik “No buttons claimed”, Meta Pixel invalid currency parameter, Shiprocket “Universal Cookies script is already loaded”, WebGL ReadPixels stall, Swym “No Retailer Id specified”.

Failed requests (tracking/third-party, not nav assets): repeated `/.well-known/shopify/monorail/unstable/produce_batch` (`ERR_ABORTED`), Google Ads `ccm/collect` and `pagead/1p-conversion` (`ERR_ABORTED`), `chimpstatic.com/pixel/v1/track` (`ERR_ABORTED`), and the 403 Shop Pay hop. No failed requests for the wordmark, mega imagery, or footer assets. On the newsletter attempt, hCaptcha assets loaded (`checksiteconfig` 200) but no `/contact` POST was sent.

## Screenshots

All in `.playwright-mcp/`, named `ux-live-global-<state>-<viewport>.png`.

| File                                           | State                                      |
| ---------------------------------------------- | ------------------------------------------ |
| `ux-live-global-announcement-1440.png`         | announcement bar                           |
| `ux-live-global-header-1440.png`               | initial masthead header and utilities      |
| `ux-live-global-mega-woman-1440.png`           | Woman mega, 3 columns + 2 tiles            |
| `ux-live-global-mega-unisex-1440.png`          | Unisex mega, 1 column + 2 tiles            |
| `ux-live-global-mega-edit-1440.png`            | Edit mega                                  |
| `ux-live-global-mega-ourworld-1440.png`        | Our World mega                             |
| `ux-live-global-mega-keyboard-1440.png`        | mega opened by keyboard focus              |
| `ux-live-global-currency-usd-1440.png`         | USD conversion, no reload                  |
| `ux-live-global-search-empty-1440.png`         | empty search drawer, invisible placeholder |
| `ux-live-global-search-results-1440.png`       | “dress” results                            |
| `ux-live-global-contact-1440.png`              | Contact drawer                             |
| `ux-live-global-cart-drawer-empty-1440.png`    | empty cart drawer                          |
| `ux-live-global-footer-1440.png`               | footer at desktop, collapsed header        |
| `ux-live-global-footer-currency-1440.png`      | footer currency EUR                        |
| `ux-live-global-newsletter-submitted-1440.png` | after fake newsletter submit (no feedback) |
| `ux-live-global-popup-1440.png`                | signup popup and veil                      |
| `ux-live-global-header-390.png`                | mobile header                              |
| `ux-live-global-menu-390.png`                  | mobile menu, pinned bottom row             |
| `ux-live-global-menu-woman-390.png`            | inline Woman accordion                     |
| `ux-live-global-search-empty-390.png`          | full-screen mobile search                  |
| `ux-live-global-search-results-390.png`        | mobile “dress” results                     |
| `ux-live-global-contact-390.png`               | full-screen mobile contact                 |
| `ux-live-global-cart-drawer-empty-390.png`     | full-screen mobile cart                    |
| `ux-live-global-footer-390.png`                | mobile footer                              |

## Open questions

- **Newsletter success path:** headless Chromium cannot complete the invisible hCaptcha, so the actual success page/`/contact#...` response and any post-submit message were not observed. A human browser check is needed to separate “captcha gate” from “no feedback by design”.
- **Currency persistence:** display prices convert client-side with no localization request. It is unverified whether cart, checkout, and order currency follow the selector; the cart was empty and checkout was out of scope.
- **Announcement overlap:** at 390 the first message wraps to two lines and the 0.5 s crossfade can render both messages over each other in the 35 px bar. Confirm whether this is accepted.
- **Search empty state:** the placeholder is deliberately computed to `opacity: 0`, and there are no suggestions until typing. Confirm whether the blank drawer is intended.
- **Mega keyboard model:** live leaves Escape unhandled and the panel open while focus is inside it. This is a live behavior to match only if exact parity is desired; it is not an accessible pattern.
- **Unused account modal:** `<account-modal>` exists but is not reachable from the header account link. Confirm whether it is dead code or intended for another entry point.
- **Clone parity to check without editing:** the clone currently uses desktop `<button>` triggers with `aria-expanded` and Escape-to-close, while live uses anchors with hover/`:focus-within` and no Escape handling. The clone mobile bottom row and footer show a static INR currency label; live has a 56-option selector and a “charged in INR at checkout” note for non-INR display. The clone newsletter shows a local success state and does not submit to a provider, unlike the live hCaptcha path. The clone’s search empty state uses recently viewed products and its mega tile imagery should be checked against the live screenshots above.
