# Collection browse interactions — live reference

Audited on 5 November 2026 against <https://politesocietyshop.com/collections/tops>, with
`/collections/corsets` as a second sample. Values are computed styles and bounding boxes read
from the live page, not estimates.

> Non-purchasing audit: no account, checkout, or personal data was submitted. One cart mutation
> (`Add to cart`) was performed solely to verify quick-view behaviour; the browser context was
> discarded afterwards. No order was placed.

## Environment

- Reference: `https://politesocietyshop.com/collections/tops` (49 Results) and
  `/collections/corsets` (19 Results).
- Desktop: 1440 × 900, Chromium 156.0.8078.4 headless, fresh context, `reducedMotion: no-preference`.
- Mobile: 390 × 844, iPhone 13 profile (`isMobile`, `hasTouch`, DPR 3), fresh context.
- Geo-localized currency: INR. Prices render as `₹15,000` on cards and `Rs. 15,000` inside quick view.
- A newsletter pop-up (`JOIN THE NEWSLETTER`, 5% offer) appeared at ~5.6 s after load in both
  viewports and was dismissed with its `Close` button before measuring. It is not part of the
  collection UI.
- An hCaptcha badge (`Protected by hCaptcha`, fixed, `z-index: 9999`) is present at the bottom-right
  of both viewports. It overlaps part of the filter Apply control (details below).
- Method: standalone Node script using `@playwright/test` chromium, fresh context, `getComputedStyle`,
  `getBoundingClientRect`, ARIA snapshots, mouse/hover/click/select interactions, screenshots.
  Not the shared Playwright MCP browser.

## Controls inventory

| Control          | Accessible name / text                                                                                                                                                   | Behaviour                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Collection title | `TOPS` (H1); `CORSETS` on the second collection                                                                                                                          | Static heading; no breadcrumb above or below it.                                                                                |
| Breadcrumb       | none                                                                                                                                                                     | No breadcrumb markup or `aria-label="breadcrumb"`; only a CSS `--breadcrumbs-height: 0px`.                                      |
| Collection chips | `ALL PRODUCTS`, `BODYSUIT`, `BRALETTE`, `CO-ORD SET`, `CORSETS`, `SHIRTS`, `T-SHIRTS`, `TOPS`, `VEST`                                                                    | Links. `CORSETS` becomes the active chip when the product-type filter is set.                                                   |
| Product count    | `49 Results` in `#ProductCount`, `aria-live="polite"`                                                                                                                    | Visually hidden at both sizes (`display:none` on desktop; 1 × 1 clipped on mobile). Not visible to shoppers.                    |
| Grid density     | group `Grid`; buttons `Fewer columns`, `More columns`                                                                                                                    | Toggles 4 ↔ 2 desktop columns; stored in `localStorage` as `ps-grid-view` (`large` / `small`). No URL change. Hidden on mobile. |
| Filter           | button `Filter`; `Filter (1)` / `Filter (2)` after selections, `[expanded]`                                                                                              | Opens the right-side filter dialog.                                                                                             |
| Sort             | combobox `Sort by`; visible text `Featured` on desktop, only `SORT BY` on mobile                                                                                         | Native `<select>` with 9 options; updates results through the collection section fetch.                                         |
| Product card     | link `ALMA LACE CORSET TOP`; buttons `Quick view — …`, `Quick add — …` (mobile), `BROWN`/`BURNT ORANGE`/`BLACK`, `Save to wishlist`                                      | Card media/title link to the PDP; colour swatches change the represented variant; wishlist toggles locally.                     |
| Filter dialog    | dialog `Filter`, `aria-modal="true"`; button `Close`; link `Clear all`; button `Apply`                                                                                   | Price, product type, colour and fabric facets.                                                                                  |
| Filter options   | checkboxes `BODYSUIT 4`, `CO-ORD SET 1`, `BLUE 12`, `COTTON 8`, etc.; spinbuttons both named `₹`                                                                         | Counts are visible beside the option names. Zero-count options are disabled at `opacity: 0.4`.                                  |
| Quick view       | dialog `Quick view`, `aria-modal="true"`; buttons `Close`, `Previous image`, `Next image`, `Image 1`–`Image 8`, swatches, sizes, `Add to cart`; link `View full details` | Desktop only.                                                                                                                   |
| Quick add        | button `Quick add — …`, panel `SELECT SIZE`, buttons `XS`…`XXL`, link `Add to cart`                                                                                      | Mobile substitute for quick view; inline panel inside the card.                                                                 |
| Wishlist         | button `Save to wishlist`, `aria-pressed`                                                                                                                                | Writes `ps_wishlist` to `localStorage`; toast `SAVED TO YOUR WISHLIST · VIEW`.                                                  |
| Load more        | link `LOAD MORE`                                                                                                                                                         | Appends the next page of cards without changing the page URL.                                                                   |

## Interaction findings

### 1. Page header, breadcrumb, count, grid and toolbar

- There is no breadcrumb. The page goes from the site header directly to the collection H1, then the
  chip rail. The H1 is the only collection heading.
- Desktop: announcement 30 px, header 76 px, `<main>` starts at y 106, H1 at y 130
  (`18px / 400 / 23px`, tracking `0.9px`, uppercase).
- Mobile: announcement 35 px, header 56 px, `<main>` starts at y 91, H1 at y 115
  (`16px / 400 / 21px`, tracking `0.8px`, uppercase).
- The chip rail sits under the H1 on mobile and to the left of the toolbar on desktop. Desktop
  rail: 1116 × 28 px, 20 px gaps, no overflow. Mobile rail: 390 × 28 px with `scrollWidth: 708`;
  it is horizontally scrollable with a right fade (`has-scroll-end`).
- `49 Results` is announced to screen readers but never displayed. The only visible numeric feedback
  is the per-facet count (e.g. `CORSETS 9`) and the filter badge `(1)`, which counts active filters,
  not results.
- Desktop toolbar at (1156, 176): grid-density pair (24 × 25 each), `Filter` (59 × 18),
  `Sort by` (94 × 18). Mobile toolbar at (20, 222): `Filter` left, `SORT BY` right (77 × 18);
  grid-density buttons are present but `display:none` / 0 × 0.
- Default grid: 4 columns × 342.75 px, 3 px column gap, 20 px row gap, starting at y 225 on desktop;
  2 columns × 173.5 px, 3 px column gap, 24 px row gap, starting at y 271 on mobile.
- Chips and URL: clicking `CORSETS` changed the URL to
  `?sort_by=manual&filter.p.product_type=CORSETS`, kept the page mounted (marker persisted),
  showed `9 Results`, rendered 19 cards (one per colour variant) and marked only `CORSETS` active.
  The filter panel was not opened by a chip.

### 2. Product cards

- Card anatomy: media (343 × 514 desktop, 174 × 260 mobile), colour swatch row, wishlist button,
  title/price row, size list. Desktop card 343 × 563; mobile 174 × 329.
- Desktop title `13px / 400 / 17px` uppercase; price `13px / 300 / 17px`, tracking `0.65px`.
  Mobile title and price are both `11px` (`400` / `300`) with a 16 px line height.
- Size list is plain text, not buttons or links: `SPAN.ps-card__size`, cursor `auto`, no role.
  Clicking a size changed neither image, href, nor URL. On mobile the size list is hidden
  (`inline-flex` but 0 × 0).
- Unavailable sizes on a card get `.is-disabled`: `opacity: 0.5`, `text-decoration: line-through`.
  Ten of 49 cards had at least one disabled size (example: `SOLAPUR CORSET` — XS, S, M, XL, XXL
  disabled; L available). No card had all sizes disabled, no card carried a “Sold out” badge, and
  no card text contained “sold out”. Sold-out state is expressed only through disabled sizes and,
  inside quick view, unavailable option buttons.
- Colour swatches are actual colour boxes, not names: 14 × 14 px, 1 px radius, with
  `aria-label`/`title` (`BROWN`, `BURNT ORANGE`, `BLACK`). No text label appears beside a card
  swatch. First card colours: `BROWN #4e3628`, `BURNT ORANGE #BB5F26`, `BLACK #000000`.
- Clicking another colour swatch:
  - changes the active swatch and `aria-pressed`;
  - swaps the main image and updates the title/price if the sibling product differs;
  - changes the media and title-link href to that variant
    (`…/alma-lace-corset-top?variant=50533008736395`);
  - sets the card’s hover image to `display:none` (hover image swap is then unavailable until the
    original colour is selected again).
- Hover (desktop, first card):
  - hover image opacity `0 → 1` over `0.5s cubic-bezier(0.2, 0.6, 0.2, 1)`;
  - main image stays at opacity 1 underneath;
  - `Quick view` button opacity `0 → 1`, `translateY(4px) → 0`, over
    `0.25s cubic-bezier(0.2, 0.6, 0.2, 1)`; it is 28 × 28 at the bottom-right of the media;
  - card has no transform or box-shadow on hover; wishlist stays visible at opacity 1.
- Wishlist: always visible (11 × 16 button with an 11 × 11 icon desktop; 9 × 15 button with a
  9 × 9 icon mobile). First click set
  `aria-pressed="true"`, stored `["alma-lace-corset-top"]` in `localStorage`, and showed a
  230 × 66 toast at y 802 reading `SAVED TO YOUR WISHLIST · VIEW`. Second click set
  `aria-pressed="false"` and removed the handle. No login required.
- Click destination: the title/media link goes to the PDP with the selected variant, e.g.
  `/products/alma-lace-corset-top?variant=47522055291019`; verified H1 and document title
  `ALMA LACE CORSET TOP`.
- Mobile has no quick view button (`display:none`). Its place is a visible 28 × 28
  `Quick add` button. Tapping it opens an inline card panel (174 × 101) with `SELECT SIZE`,
  size buttons and `Add to cart`; it does not show a gallery, price or colour list.

### 3. Filters

The filter is a right-side sheet over the page. The initial panel is 420 × 900 at x 1020 on
desktop and 359 × 844 at x 31 on mobile; the mobile sheet leaves a 31 px dimmed strip. The page
behind is dimmed by a full-viewport `rgba(0, 0, 0, 0.3)` overlay and body scrolling is locked.

**Groups and option types**

| Group        | Type                                                                                                  | Options (initial count)                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Price        | two number inputs, `filter.v.price.gte` / `lte`, min 0, max 15000, placeholders 0 / 15000, prefix `₹` | Price range                                                                                                            |
| Product type | checkboxes                                                                                            | BODYSUIT 4, BRALETTE 2, CO-ORD SET 1, CORSETS 9, SHIRTS 5, T-SHIRTS 7, TOPS 20, VEST 1                                 |
| Colour       | checkboxes with 16 × 16 colour swatches                                                               | BLUE 12, GREEN 10, GREY 9, BROWN 4, BEIGE 11, ORANGE 1, WHITE 9, DENIM 2, BLACK 22, RED 2, PINK 2, PURPLE 1            |
| Fabric       | checkboxes                                                                                            | COTTON 8, DENIM 2, HEMP 2, LYCRA 5, LYOCELL 1, NYLON 2, POLYESTER 6, RAYON 1, SATIN 1, SILK 1, TERRYCLOTH 1, VISCOSE 6 |

Price and Product type are open by default; Colour and Fabric are collapsed. There is **no size
facet** in this filter — size is only shown as disabled/available text on cards and as size buttons
in quick view. Expanding all groups
made the desktop group area scroll (734 px viewport, 1206 px content) while the 87 px footer stayed
pinned at y 813; on mobile the group area was 678 px with the footer at y 757.

**Colour swatch vs name:** colour facets show both — a real colour box (16 × 16) and the colour
name plus count (`BLUE 12`, `BLACK 22`). Swatch hex values are inline:
`#005BD3`, `#688660`, `#9a9a9a`, `#4e3628`, `#E8D7C8`, `#e6742a`, `#FFFFFF`, `#5B7695`,
`#000000`, `#C1323C`, `#FFC0CB`, `#5b3a6e`. Cards show only the box; quick view shows the box plus
the selected colour name.

**Counts are faceted.** A group’s counts ignore the selection inside that same group and respect
the other groups. Observed:

| State                           | Product type counts                                                                                      | Colour counts                                                                                                                | Fabric counts                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Initial                         | Original 4/2/1/9/5/7/20/1                                                                                | Original 12/10/9/4/11/1/9/2/22/2/2/1                                                                                         | Original 8/2/2/5/1/2/6/1/1/1/1/6                                                                                                         |
| `CORSETS` selected (9 Results)  | Unchanged original counts                                                                                | Narrowed by CORSETS: BLUE 0, GREEN 1, GREY 1, BROWN 1, BEIGE 4, ORANGE 1, WHITE 0, DENIM 2, BLACK 5, RED 1, PINK 1, PURPLE 1 | Narrowed: COTTON 3, DENIM 2, HEMP 0, LYCRA 0, LYOCELL 0, NYLON 2, POLYESTER 4, RAYON 0, SATIN 0, SILK 1, TERRYCLOTH 0, VISCOSE 2         |
| `CORSETS` + `BLACK` (5 Results) | Narrowed by BLACK: BODYSUIT 3, BRALETTE 1, CO-ORD SET 0, CORSETS 5, SHIRTS 2, T-SHIRTS 1, TOPS 9, VEST 1 | Unchanged from previous (same-group selection ignored)                                                                       | Narrowed further: COTTON 2, DENIM 1, HEMP 0, LYCRA 0, LYOCELL 0, NYLON 1, POLYESTER 2, RAYON 0, SATIN 0, SILK 1, TERRYCLOTH 0, VISCOSE 1 |

Counts sum to more than the result count where a product has multiple colours or fabrics. Zero-count
options are disabled (`input.disabled = true`, label `.is-disabled`, opacity `0.4`) — in the empty
result state every facet read 0 and every option was disabled.

**Applying / URL / no reload**

- Selecting `CORSETS` changed the URL before any Apply click:
  `?filter.p.product_type=CORSETS&sort_by=manual`. The page marker and navigation-entry count were
  unchanged (one navigation entry), so results updated in place.
- The filter button became `Filter (1)` with `aria-expanded="true"`; the top `CORSETS` chip became
  active; `#ProductCount` read `9 Results`; 19 cards were rendered.
- Selecting `BLACK` added `&filter.p.m.custom.colour_family=BLACK`, made the badge `Filter (2)`,
  and rendered 5 cards (`5 Results`). Product-type chips still showed only `CORSETS`; there was no
  removable colour/fabric chip or second active-chip row.
- `Apply` only closes the sheet. The URL and results were already updated; after Apply the URL was
  unchanged, the panel had `aria-hidden="true"`, and focus returned to the `Filter` button.
- `Close` (X) and overlay click also close the sheet, set `aria-hidden="true"`, and return focus to
  `Filter`; Escape is wired to the page's global close handler.
- `Clear all` is a link with `href="/collections/tops"`; it prevents navigation, unchecks all
  inputs, clears the price fields, and re-renders. Observed result:
  URL `?sort_by=manual`, `49 Results`, 49 cards, filter badge empty, `All products` chip active.
  The sheet stays open after clearing.
- Empty result: setting price max to 1 produced URL
  `?filter.v.price.lte=1&sort_by=manual`, `0 Results`, badge `(1)`, grid text
  `No products found`, no load-more link, and every facet count 0/disabled. The page still shows
  the toolbar and relocates the value-props/footer upward. `Clear all` remains available in the
  filter footer and restored the 49-result view in this pass.
- Selected state is carried by the active product-type chip plus the numeric filter badge.
  Colour and fabric selections have no chip representation.
- Accessibility notes: filter dialog is labelled `Filter`; option checkboxes are named with their
  count (`BODYSUIT 4`, `BLUE 12`); both price spinbuttons are named only `₹`, so they are
  indistinguishable by name; `Clear all` is a link, `Apply` is a button, and every close control is
  named `Close`.

### 4. Sort

Default is `Featured`, value `manual`. The initial URL has no `sort_by`; any sort selection adds
`?sort_by=…` and updates in place (marker persisted, one navigation entry). All nine options worked
and changed the first cards:

| Value                | Visible label (desktop) | URL                           | Cards rendered | First three cards                         |
| -------------------- | ----------------------- | ----------------------------- | -------------- | ----------------------------------------- |
| `manual`             | FEATURED                | `?sort_by=manual`             | 49             | ALMA ×3 (₹15,000)                         |
| `most-relevant`      | MOST RELEVANT           | `?sort_by=most-relevant`      | 50             | ROSA ×2, RATI                             |
| `best-selling`       | BEST SELLING            | `?sort_by=best-selling`       | 48             | RATI ×3                                   |
| `title-ascending`    | ALPHABETICALLY, A-Z     | `?sort_by=title-ascending`    | 44             | A VERY POLITE TEE, ALMA ×2                |
| `title-descending`   | ALPHABETICALLY, Z-A     | `?sort_by=title-descending`   | 45             | WEALTHY IN ITS KIND T-SHIRT, VERA ×2      |
| `price-ascending`    | PRICE, LOW TO HIGH      | `?sort_by=price-ascending`    | 44             | SEX IS ART CAMISOLE, BABY TEE ×2 (₹3,000) |
| `price-descending`   | PRICE, HIGH TO LOW      | `?sort_by=price-descending`   | 44             | ALMA ×3 (₹15,000)                         |
| `created-ascending`  | DATE, OLD TO NEW        | `?sort_by=created-ascending`  | 40             | CORA ×3                                   |
| `created-descending` | DATE, NEW TO OLD        | `?sort_by=created-descending` | 48             | MARINA KNIT SET ×2, EVERYDAY BODYSUIT     |

The visible sort label is the `<span data-ps-sort-value>` (`Featured`), while the actual control is
a native `<select aria-label="Sort by">` overlaid on the text. On mobile the visible value is
`display:none`; after changing to A-Z the toolbar still showed only `SORT BY`, so the current sort
is not visible on mobile. There is no custom mobile sort drawer.

### 5. Load more / pagination

- Desktop default: `LOAD MORE` is a link to `/collections/tops?page=2`, 72 × 21 px at the end of
  the grid. Clicking it appended page 2 in place:
  - cards 49 → 88 (+39);
  - URL stayed `/collections/tops` (no `page=` in the address bar);
  - the link became `?page=3` and stayed `LOAD MORE`;
  - `#ProductCount` stayed `49 Results`;
  - no `is-row-pad` items were needed.
- The collection section request was
  `GET /collections/tops?page=2&section_id=template--24198140133515__ps_collection` → 200.
- Mobile after sorting A-Z: 44 → 89 cards, URL stayed
  `?sort_by=title-ascending`, next link `?page=3&sort_by=title-ascending`.
- This is explicit load-more pagination, not infinite scroll.

### 6. Quick view

Desktop only; the mobile quick-view button is `display:none`. The dialog is created on first open:

- `role="dialog"`, `aria-modal="true"`, `aria-label="Quick view"`; focus moves to `Close`.
- Dialog 923 × 738 at (258, 81); overlay full viewport `rgba(0,0,0,0.35)`.
- Layout: gallery 492 × 738, thumbnail rail, info column 340 × 738. Close 32 × 32.
- Content: product title, `Rs. 15,000`, `Tax included.`, `COLOUR` + selected colour name
  (`BROWN`), three colour swatches (`BROWN`, `BURNT ORANGE`, `BLACK`), `SIZE` with
  `XS S M L XL XXL`, `ADD TO CART` 260 × 44, `VIEW FULL DETAILS`.
- Gallery: 8 thumbnails and 8 dots, `Previous image` / `Next image` arrows. Clicking `Image 3`
  scrolled the track to 985 px (client width 492); `Next image` then moved it to 1477 px.
  Thumbnails and dots track the scroll position.
- Colour switching updates the `COLOUR <name>` label, selected swatch, price and gallery position;
  for `BURNT ORANGE` the track moved to 3444 px. Size availability is recalculated per variant.
- `Add to cart` is not disabled when no size is chosen. Observed states:
  - click with no size → `Please select a size`;
  - select an unavailable size and click → `Sold out in this option` (verified on `SOLAPUR CORSET`,
    where XS/S/M/XL/XXL are `.is-unavailable` and only L is available);
  - select an available size and click → `Added to bag`, dialog hidden, cart drawer opens with
    `CART (1)`, item `ALMA LACE CORSET TOP / BROWN / XS / ₹15,000`, and `POST /cart/add.js` → 200.
- After a successful add the URL remained the collection URL; no checkout occurred. The drawer’s
  class still contained `is-empty` despite showing an item.
- Close behaviour: `Close`, `Escape`, and overlay click all hide the dialog after ~300 ms, remove
  the body scroll lock, and return focus to the card’s `Quick view` button.
- `VIEW FULL DETAILS` points to the base product (`/products/alma-lace-corset-top`), not the
  selected variant. Quick view prices use `Rs.`, while cards use `₹`.
- Opening motion: dialog opacity `0 → 1`, `translateY(12px) → 0`, `0.3s
  cubic-bezier(0.2, 0.6, 0.2, 1)`; overlay opacity `0.35`, `0.3s`; body gets `overflow:hidden`.

### 7. Mobile filter and sort

- Filter sheet: 359 × 844 at x 31, full height, 31 px dimmed strip; initial transform
  `translateX(358.797px)`, opens to `none` over `0.4s cubic-bezier(0.2, 0.6, 0.2, 1)`.
- Footer is pinned by the flex layout: group area 678 px tall, footer 359 × 87 at y 757; Apply
  76 × 36 at (294, 778), `Clear all` 50 × 19 at (51, 787), close 28 × 28 at (342, 30).
- Apply closed the sheet and returned focus to `Filter`; `Clear all` cleared and kept the sheet
  open, matching desktop.
- The hCaptcha badge is fixed at (334, 769) and is 225 × 55, `z-index: 9999`. It overlaps the
  Apply button by 36 × 36 px (1296 px²) on the right side. A normal click at the button centre
  still succeeded; the badge visually covers the right edge of Apply.
- Colour facet on mobile is the same component: 16 × 16 swatch + name + count, labels 319 × 16
  (`BLUE 12`, `GREEN 10`, …). The 16 px label height makes the touch target much shorter than 44 px.
- No horizontal page overflow: `document.scrollWidth = innerWidth = 390`; the chip rail itself
  scrolls (client 390, scroll 708).
- Sort is a native select, not a drawer. The selected value is hidden on mobile
  (`[data-ps-sort-value] { display:none }`), so the toolbar reads `SORT BY` with no current value.
- Quick add panel: 174 × 101 inside the card, opens with `.is-quick-open` and
  `aria-expanded="true"`; contains `SELECT SIZE`, close, size values, `Add to cart`; no gallery,
  price or colour list.

## Measured values

| Metric                          | 1440 × 900                               | 390 × 844                                 |
| ------------------------------- | ---------------------------------------- | ----------------------------------------- |
| Announcement / header           | 30 / 76 px                               | 35 / 56 px                                |
| Main top                        | 106 px                                   | 91 px                                     |
| H1                              | 18 px / 400 / 23 px, tracking 0.9, y 130 | 16 px / 400 / 21 px, tracking 0.8, y 115  |
| Chip rail                       | 1116 × 28, gap 20                        | 390 × 28, scrollWidth 708                 |
| Toolbar                         | 254 × 25 at (1156, 176)                  | 350 × 25 at (20, 222)                     |
| Product count                   | `display:none`                           | 1 × 1 clipped                             |
| Grid                            | 4 × 342.75, col 3 / row 20, y 225        | 2 × 173.5, col 3 / row 24, y 271          |
| Card / media                    | 343 × 563 / 343 × 514                    | 174 × 329 / 174 × 260                     |
| Card title / price              | 13 / 400 / 17; 13 / 300 / 17             | 11 / 400 / 16; 11 / 300 / 16              |
| Card sizes                      | 12 / 300 / 16, `#4d4d4d`                 | hidden, 0 × 0                             |
| Card colour swatch              | 14 × 14, radius 1                        | 14 × 14, radius 1                         |
| Wishlist button                 | 11 × 16 target (11 × 11 icon)            | 9 × 15 target (9 × 9 icon)                |
| Quick view / quick add          | 28 × 28 opacity 0 / none                 | none / 28 × 28 visible                    |
| Filter panel                    | 420 × 900 at x 1020                      | 359 × 844 at x 31                         |
| Filter group viewport / content | 734 / 734 collapsed; 1206 expanded       | 678 / 678 collapsed; 862 with Colour open |
| Filter footer                   | 420 × 87 at y 813                        | 359 × 87 at y 757                         |
| Apply / Clear all / Close       | 76 × 36 / 50 × 19 / 28 × 28              | 76 × 36 / 50 × 19 / 28 × 28               |
| Quick view dialog               | 923 × 738 at (258, 81)                   | not available                             |
| Quick view gallery / info       | 492 / 340 wide; 738 tall                 | —                                         |
| Quick view Add / Close          | 260 × 44 / 32 × 32                       | —                                         |
| hCaptcha badge                  | 225 × 55 at (1384, 825), z 9999          | 225 × 55 at (334, 769), z 9999            |
| hCaptcha overlap with Apply     | 26 × 36 = 936 px²                        | 36 × 36 = 1296 px²                        |

**Motion values (computed):**

- Filter panel: `transform 0.4s cubic-bezier(0.2, 0.6, 0.2, 1)`; translates 420 px (desktop) or
  358.797 px (mobile) to 0.
- Filter overlay: `opacity 0.3s cubic-bezier(0.2, 0.6, 0.2, 1)`, 0 → 1; `rgba(0, 0, 0, 0.3)`.
- Card hover image: `opacity 0.5s cubic-bezier(0.2, 0.6, 0.2, 1)`, 0 → 1.
- Card quick view: `opacity 0.25s` + `transform 0.25s`, both `cubic-bezier(0.2, 0.6, 0.2, 1)`;
  off state `translateY(4px)`, on state none.
- Quick view dialog: `opacity 0.3s` + `transform 0.3s`, both
  `cubic-bezier(0.2, 0.6, 0.2, 1)`; `translateY(12px)` → none; hidden 300 ms after close.
- Quick view overlay: `opacity 0.3s` `cubic-bezier(0.2, 0.6, 0.2, 1)`.
- Quick add panel: `transform 0.3s` + `opacity 0.3s`, both
  `cubic-bezier(0.2, 0.6, 0.2, 1)`.

## Console and network

Captured for the desktop and mobile sessions while loading, filtering, sorting, loading more, opening
quick view and adding one item.

- Desktop: 4 console errors, 7 warnings, 81 failed requests (29 unique URLs), one non-2xx response
  outside analytics: `404 /products/alma-lace-corset-top-brown.js`.
  - Errors: CSP refusal for `https://shop.app/` framing (`frame-ancestors`), a generic
    `Failed to load resource: 403`, the 404 above, and an uncaught
    `pageerror: Cannot read properties of null (reading 'querySelectorAll')`.
  - Warnings: GoKwik `No buttons claimed`, Meta Pixel `Invalid parameter format for currency`,
    Swym `No Retailer Id specified`, `Universal Cookies script is already loaded`, two WebGL
    `GPU stall due to ReadPixels` messages, and a preloaded CSS not-used warning.
  - Analytics/beacon failures (aborted `monorail`, Google Ads/GA, Chimpstatic, Meta) dominated the
    81 failures; the `shop.app/pay/hop` document was blocked by CSP/403.
- Mobile: 1 console error (`Failed to load resource: 401`), 5 warnings, 26 failed requests
  (11 unique). The non-2xx response was `401 /sf_private_access_tokens` (Swym); the rest were
  analytics/beacon aborts. No page error on mobile.
- Collection/section requests were successful and all returned 200:
  `?section_id=…` for CORSETS, CORSETS+BLACK, price-empty, every sort value, and
  `?page=2&section_id=…` for load more. Quick view’s `GET /products/alma-lace-corset-top.js`
  returned 200; `POST /cart/add.js` returned 200.
- The 404 above was not reproduced in a focused hover/swatch/quick-view/filter sequence; it appears
  to come from prewarming a sibling product handle (`…-brown`) and did not surface in the UI.
  The uncaught `querySelectorAll` error was also not reproduced in that focused sequence.

## Screenshots

All are viewport screenshots in `.playwright-mcp/`:

- Desktop 1440 × 900:
  `ux-live-collection-default-1440.png`,
  `ux-live-collection-hover-1440.png`,
  `ux-live-collection-wishlist-toast-1440.png`,
  `ux-live-collection-filter-open-1440.png`,
  `ux-live-collection-filter-colour-1440.png`,
  `ux-live-collection-filter-applied-1440.png`,
  `ux-live-collection-filter-empty-1440.png`,
  `ux-live-collection-sort-price-asc-1440.png`,
  `ux-live-collection-loaded-more-1440.png`,
  `ux-live-collection-quickview-1440.png`,
  `ux-live-collection-quickview-colour-1440.png`,
  `ux-live-collection-quickview-added-1440.png`,
  `ux-live-collection-corsets-1440.png`.
- Mobile 390 × 844:
  `ux-live-collection-default-390.png`,
  `ux-live-collection-filter-open-390.png`,
  `ux-live-collection-filter-colour-390.png`,
  `ux-live-collection-filter-applied-390.png`,
  `ux-live-collection-quick-add-390.png`,
  `ux-live-collection-loaded-more-390.png`.

## Open questions

1. Is the card-count vs result-count mismatch intended? `49 Results` can render 40–50 cards
   depending on sort, and `CORSETS` shows `9 Results` but 19 cards because each colour variant is a
   separate card. Load more leaves `49 Results` while adding 39 more cards.
2. “Most relevant” and “Best selling” both change the order, but their ranking semantics and the
   reason card counts change across sorts are not exposed in the UI.
3. The hCaptcha badge covers the right edge of Apply (26 px desktop, 36 px mobile). Is that accepted,
   or should the sheet reserve space for it?
4. The quick-view button sits at `opacity: 0` before hover while remaining `display:flex`; keyboard
   focus may land on an invisible 28 × 28 control. This pass did not exhaustively tab through the
   grid.
5. Both price spinbuttons are named only `₹`; there is no visible “Min” / “Max” label.
6. Mobile shows `SORT BY` but hides the selected sort value; is that intentional?
7. There is no breadcrumb at all. Is the H1 + chip rail the intended replacement?
8. Clicking a card colour swatch permanently sets that card’s hover image to `display:none` until
   the original colour is reselected. Is the disabled image swap intended?
9. Colour/fabric selections have no removable chip; only the numeric Filter badge and the checkbox
   state show them.
10. The cart drawer retains the `is-empty` class while containing one item (`CART (1)`); is this a
    stale class or a styling hook?
