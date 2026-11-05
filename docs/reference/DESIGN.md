# Polite Society design reference

Source: <https://politesocietyshop.com/>. Captured on 4 November 2026 with Playwright at
1440 × 1000, 768 × 1024 and 390 × 844. Values below are computed styles read from the live
page, not estimates from screenshots. Screenshots for each flow live beside this file and are
indexed in [FLOWS.md](./FLOWS.md).

> This file records the original measurement pass. The canonical implementation contract is
> [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md). A 5 November 2026 re-measurement found live drift in
> editorial captions and grids, the product-card ratio, the rail heading size and PDP top spacing;
> those values are recorded in [`../DESIGN-SYSTEM-AUDIT.md`](../DESIGN-SYSTEM-AUDIT.md).

This is a design study for a private prototype. The photography, wordmark and brand copy belong
to Polite Society; replace them before publishing or distributing the clone.

## 1. Foundations

### Typography

| Token                   | Value                                                        | Used for                                        |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| Body family             | `"DM Sans", sans-serif`                                      | Everything except the wordmark                  |
| Body size / line        | `14px / 21px`                                                | Default text, footer, product cards             |
| Body weight             | `300`                                                        | Default copy; `400` for labels and titles       |
| Body tracking           | `0.7px` (`0.05em`)                                           | Default copy                                    |
| Announcement            | `12px / 16px`, `400`, tracking `0.6px`                       | Rotating announcement bar                       |
| Nav                     | `13px / 18px`, `400`, tracking `0.65px`, uppercase           | Desktop menu                                    |
| Utility links           | `14px / 21px`, `300`                                         | Currency, search, wishlist, help, account, cart |
| Collection title        | `18px / 23px`, `400`, tracking `0.9px`, uppercase            | PLP heading                                     |
| Product card title      | `13px / 17px`, `400`, uppercase                              | PLP and rails                                   |
| Product card price      | `13px / 17px`, `300`, tracking `0.65px`                      | PLP and rails                                   |
| Card size list          | `12px / 16px`, `300`, tracking `0.6px`, `#4d4d4d`            | PLP card                                        |
| Chip / toolbar / button | `11–12px / 14–18px`, `400`, uppercase, tracking `0.55–0.6px` | Filters, sort, buttons                          |
| PDP title / price       | `22px / 29px`, `400`, tracking `1.1px`, uppercase            | Product page                                    |
| PDP body                | `14px / 21px`, `300`                                         | Description tabs                                |
| Wordmark                | SVG, 1016 × 82 at 1440; 342 × 28 compact                     | Header and footer                               |

The wordmark is a high-contrast, wide-tracked serif. The prototype uses the reference SVG for
fidelity; swap in the production brand mark before launch.

### Colour

| Token             | Value                                             | Notes                          |
| ----------------- | ------------------------------------------------- | ------------------------------ |
| Background        | `#ffffff`                                         | Page, header, drawers          |
| Foreground        | `#000000`                                         | Text, buttons, rules           |
| Muted             | `#4d4d4d`                                         | Secondary copy, size lists     |
| Border            | `#e1e1e1`                                         | Rules, card dividers           |
| Input border      | `#cccccc`                                         | Search field, newsletter field |
| Surface           | `#f2f2f2`                                         | Image placeholder before load  |
| Button background | `#000000`                                         | Primary button                 |
| Button text       | `#f9f9f9`                                         | Primary button                 |
| Announcement      | `#000000` / `#ffffff`                             | Black bar, white copy          |
| Errors            | `#d94c4c`, border `#c7261b`, background `#fff5f5` | Inherited Shopify error styles |

No accent colour is used in the shopping surface. Colour comes from photography and product
swatches. The interface is strictly monochrome.

### Spacing and layout

| Token                  | Value                                           |
| ---------------------- | ----------------------------------------------- |
| Page gutter            | `20px` (mobile and desktop)                     |
| Editorial side padding | `30px` at 1440                                  |
| Content max width      | Full-bleed; header and footer use the gutter    |
| Base spacing unit      | `4px`; common steps `5, 10, 20, 24, 30, 40, 60` |
| Section spacing        | `60–80px` between homepage sections             |
| Card grid gap          | `3px` horizontal, `20–24px` vertical            |
| Form control height    | `36px` buttons, `35px` search input             |
| Header bar height      | `76px` desktop, `56px` mobile                   |
| Announcement height    | `30px` desktop, `35px` mobile                   |
| Large masthead         | `110px` wordmark row + `76px` bar = `186px`     |
| Compact header         | `56px`                                          |

### Breakpoints

| Range        | Behaviour                                                                          |
| ------------ | ---------------------------------------------------------------------------------- |
| `< 750px`    | Mobile: compact 56px header, hamburger, 2-column PLP, horizontal PDP gallery       |
| `750–1099px` | Tablet: compact header, 3-column PLP, hamburger or condensed menu                  |
| `≥ 1100px`   | Desktop: large homepage masthead, full nav, 4-column PLP, mega menus, side drawers |

### Motion

| Token             | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Ease              | `cubic-bezier(.2, .6, .2, 1)`                                  |
| Short             | `100ms`                                                        |
| Default           | `300ms`                                                        |
| Long              | `500ms`                                                        |
| Extra long        | `600ms`                                                        |
| Announcement swap | `500ms` opacity + `4px` translate                              |
| Header collapse   | `300ms` height/translate                                       |
| Drawers           | `300ms` transform; overlay fades                               |
| Image hover       | `scale(1.03)` over `600ms`, product card swaps to second image |

## 2. Page shell

### Announcement bar

Black full-width bar, centred 12px white copy, one message at a time, fading every 3s.
Messages: “Need it sooner? Reach out to us before placing your order” and “Free shipping
worldwide above $500”. 30px tall on desktop, 35px on mobile. Pauses on hover and when the tab is
hidden.

### Header — homepage

- Sticky, white, full-bleed.
- Large state: `110px` masthead with the wordmark anchored at the 30px gutter; the wordmark is
  `1016 × 82` at 1440 and grows with the viewport.
- Below it, a `76px` bar with a top rule, nav on the left and utilities on the right.
- Nav: `NEW IN`, `WOMAN`, `UNISEX`, `EDIT`, `OUR WORLD`. 13px uppercase, `0.65px` tracking,
  12px vertical padding. Active item gets a 1px underline sitting ~4px below the text.
- Utilities: `INR ⌄`, `SEARCH`, `WISHLIST`, `HELP`, `ACCOUNT`, `CART (0)`. 12–14px, spaced
  24px apart, aligned to the right gutter.
- On scroll the masthead collapses and the bar sticks to the top; the page content does not
  jump (reserved height).
- On the collection, product, cart and content routes the header starts in its compact state:
  342 × 28 wordmark on the left, nav beside it, utilities right.

### Header — mobile

`35px` announcement + `56px` bar. Wordmark at 20px gutter, utility icons for search, help,
account, cart (with count) and hamburger on the right. Hero starts immediately under the bar and
fills the rest of the first viewport.

### Mega menu

Full-width white panel directly under the bar, opening on hover/focus.

- `1440 × 496` for Woman; `36px 30px 40px` inner padding.
- Two zones: link columns `794px`, media tiles `526px`, `60px` gap.
- Link columns: 3 columns of 10–12px uppercase labels (`SHOP WOMAN`, `SHOP BY OCCASION`,
  `SHOP BY CATEGORY`) with 8 links each in a single column, 25px row rhythm.
- Two portrait tiles, each about `254 × 360` (2:3), label below in 10–11px uppercase.
- Fade/translate in over 300ms; nav trigger gets an underline while open.

### Search

Right-side drawer, `440px`, white, full height.

- Header row: close (14px ×) on the right, `SEARCH` label under it.
- Search input: borderless line with placeholder `Type to Search`, 12px uppercase submit label
  on the right; typed query shows a clear ×.
- Results: `Suggestions` heading, then 40 × 60 thumbnails with 11px uppercase product names;
  `Collections` heading with matching collection links.
- Empty state shows recent/popular searches instead.
- Overlay dims the page; drawer slides in from the right.

### Mobile menu

Full-height white panel under the 56px header, sliding from the right.

- Primary links in 13px uppercase with 24px vertical rhythm: NEW IN, WOMAN, UNISEX, EDIT,
  OUR WORLD, WISHLIST.
- Items with children show a chevron and open a nested list.
- Bottom row pinned to the viewport: `INR ⌄` left, `ACCOUNT` right.

### Newsletter popup

Centred white card, `448px` wide, no radius, thin 1px border/shadow.

- 14px × close at top right.
- Heading `JOIN POLITE SOCIETY` in 14px uppercase.
- Body copy: “Get 5% off your first order, and first access to new chapters, campaigns,
  restocks and more.”
- Underlined email field with `Your e-mail` placeholder and `SUBSCRIBE` label on the right.
- `You can unsubscribe at any time.` note in 12px muted copy.
- Appears after ~5s; dismissible; remembered for 30 days.

### Contact drawer

Right-side drawer, `440px`. Header `CONTACT US` with close. Rows: WhatsApp, Call Us, Email Us,
Visit Our Flagship Store, each with a 16px line icon, 11px uppercase label, chevron and bottom
rule.

### Footer

White, full-bleed, `~361px` tall at 1440. Top rule, four zones on one row:

1. Flagship store: 11px uppercase heading, 12px address and hours, then the `315 × 25` wordmark.
2. Help: Size Guide, Care Instructions, FAQ, Contact Us.
3. Policies: Terms & Conditions, Privacy, Shipping, Returns & Exchange.
4. The Brand: Our World, Journal, Press.
5. Socials: Instagram, Facebook, Pinterest.
6. Newsletter: “Subscribe to Our Newsletter”, underlined email field, `SUBSCRIBE`.

Bottom row: copyright and “Website by Embed Studios” on the left, payment marks (Amex,
Diners, Mastercard, RuPay, Visa) on the right. All links 12px, `#4d4d4d`; headings 11px
uppercase black. On mobile the columns stack with 32px gaps.

## 3. Homepage

1. **Hero** — full-bleed image, `1440 × 784` desktop (aspect `1.837:1`), mobile uses a portrait
   crop `390 × 753` (fills the viewport under the header). Single slide; eager, high priority.
   Image darkens slightly at the bottom for legibility.
2. **Two-up editorial** — two full-bleed images side by side, each `720 × 893` at 1440
   (4:5 crop), 3px gap, labels bottom-left in white 11px uppercase (`CORSETS`,
   `DRESSES & JUMPSUITS`).
3. **“Our Picks” product rail** — 60px top padding, heading 16px uppercase at the gutter,
   `VIEW ALL` with left/right arrows at the right. Horizontal rail of 5 cards (266px wide,
   3:4 image, 10px gap) with drag/arrow navigation. Card: image, colour swatches top right,
   wishlist icon bottom right of text row, title + price, optional size row.
4. **Three-up editorial** — three images, `480 × 557` (aspect 0.86), 3px gap, labels bottom-left
   in white uppercase (`CORE`, `ESSENTIALS`, `ELEVATED`).
5. **Link tiles** — four equal square images (`360 × 360`), 3px gap, label below each in 11px
   uppercase (`FLAGSHIP STORE`, `JOURNAL`, `POLITE CAREGUIDE`, `OUR WORLD`).
6. Footer.

## 4. Collection page

- Compact header.
- `30px` gutter. Title 18px uppercase at `y = 130`; 24px below the header.
- Category chips row: `ALL PRODUCTS`, `CORSETS`, `DRESS`, `JUMPSUITS`, `TOPS`; 12px uppercase,
  20px gap, active chip underlined. Scrolls horizontally on mobile with edge fades.
- Toolbar on the same row as chips at desktop, right-aligned: 2 grid-density icons, `FILTER`,
  `FEATURED ⌄`. On mobile the toolbar is a separate row with `FILTER` left and `SORT BY` right.
- Grid starts `24px` below the toolbar. Desktop 4 columns, tablet 3, mobile 2.
  `column-gap: 3px`, `row-gap: 20px` desktop and `24px` mobile. Page gutter 30px desktop /
  20px mobile.
- Product card: 3:4 image, swatch dots top-right, title and price on one baseline row, then size
  list (`XS S M L XL XXL`) and a wishlist outline icon on the right. Title 13px uppercase,
  price 13px, sizes 12px muted. Hover swaps to the second image and zooms ~3%.
- Filter drawer: `420px` right drawer. Header `FILTER` + close. Accordion groups `PRICE`
  (currency inputs), `PRODUCT TYPE`, `COLOUR`, `FABRIC`; checkbox rows with counts. Sticky footer
  with `CLEAR ALL` link and black `APPLY` button.
- Sort is a native-looking select labelled `FEATURED`.

## 5. Product detail

- Compact header. Two columns, each 50% (`720px` at 1440).
- Left: stacked gallery. Each image is 2:3 (`720 × 1080`), no thumbnails, page-scrolls through
  the look. Mobile becomes a horizontal scroll-snap strip with six dots.
- Right: `408px` content column centred inside the 720px panel, `24px` top padding.
  - Title 22px uppercase; wishlist outline icon at the far right.
  - Price 22px, 8px under the title.
  - `COLOUR` label 12px, then 10px square swatches, 8px gap, active has a 1px ring.
  - `SIZE` label + sizes in a row (`XS S M L XL XXL`), active underlined; `SIZE GUIDE` right.
  - Quantity stepper (`96 × 36`, 1px border) + outlined `ADD TO CART` (`238–296 × 36`).
  - Black `BUY IT NOW` full width, 36px.
  - Tab row: `DESCRIPTION`, `SHIPPING, EXCHANGE & RETURNS`, `FABRIC`, `FIT`; active tab
    underlined; content is 13–14px body copy with a bullet list and Fabric & Care block.
  - Sticky while the gallery scrolls. `NEED HELP?` pinned at the bottom right of the info panel.
- Size guide opens a `720px` right drawer with a “Find my size” form and measurement tables.
- Below: “You may also like” / “Recently viewed” tabs and a product rail.

## 6. Cart

### Drawer

- `440px` right drawer, white, `30px` inner padding.
- Header `CART (n)` 14px uppercase with close ×; 1px rule under it.
- Free-shipping progress: 1px track, message 11px under it. Above threshold:
  “Congratulations! You qualify for free shipping.”
- Line item: 60 × 75 image, 12px uppercase title, `BROWN · XS` options, price right; compact
  quantity stepper and underlined `REMOVE` below.
- Footer: `Subtotal` + value, tax note, outlined `CHECKOUT`, underlined
  `VIEW SHOPPING CART`.
- Empty state: “YOUR SHOPPING CART IS EMPTY”, helper copy, outlined `EXPLORE COLLECTIONS`.

### Cart page

- Compact header, `30px` gutter, two columns (`~560px` content / `~310px` summary with a rule
  between).
- Left: `SHOPPING CART`, free-shipping rule and message, line items with image, options,
  quantity, remove, price.
- Right: `ORDER SUMMARY` 11px uppercase, subtotal, outlined `CHECKOUT`, tax note.
- Footer follows directly.

## 7. Responsive rules

| Element        | Desktop                            | Mobile                        |
| -------------- | ---------------------------------- | ----------------------------- |
| Header         | 186px large home / 56px compact    | 56px compact                  |
| Hero           | 4:1.84 landscape                   | full viewport height portrait |
| Editorial 2-up | 2 columns, 4:5                     | stacked, 4:5                  |
| Editorial 3-up | 3 columns                          | stacked or horizontal scroll  |
| Product rail   | 5 cards, 266px                     | 1.6 cards, 226px, edge peek   |
| PLP grid       | 4 columns, 3px gap                 | 2 columns, 3px gap            |
| PDP gallery    | 50% left, stacked 2:3              | full-width snap strip + dots  |
| PDP info       | 408px centred                      | full width, 20px gutter       |
| Cart           | drawer 440px + cart page 2 columns | full-width drawer/page        |
| Footer         | 6 zones in one row                 | stacked columns               |

## 8. Accessibility and interaction notes

- All interactive targets are at least 36px tall; text links have a visible underline on hover.
- The mega menu opens on hover and focus; `:focus-visible` rather than `:focus-within` avoids
  pinning it after a click.
- Drawers use `role="dialog"`, `aria-modal`, a labelled title and a close button; focus returns
  to the trigger.
- Product media always has reserved aspect-ratio boxes; no layout shift while images load.
- Colour swatches include visually hidden colour names.
- Sold-out variants remain visible with a disabled state, never removed.
- Announcement is `aria-live="polite"` and pauses when hovered or when the tab is hidden.

## 9. Replication gaps and decisions

- **Catalog**: the connected Shopify store currently contains the Hydrogen demo catalog
  (snowboards). The prototype reproduces the design system and all flows, but the merchandising
  only matches after the store catalog is seeded with fashion products and collections.
- **Fonts**: DM Sans is loaded from Google Fonts; the reference wordmark is used as an SVG.
  Both must be replaced with the production brand identity.
- **Assets**: the reference photography is stored under `public/reference/` for the private
  prototype only. It is not licensed for redistribution.
- **Checkout, account, wishlist and Shopify analytics** remain Shopify-owned. Their hosted and
  authenticated surfaces are out of scope for a pixel match.
- **Currency**: the prototype shows the store currency from Shopify; the reference defaults to
  INR and offers a 55-currency selector.
