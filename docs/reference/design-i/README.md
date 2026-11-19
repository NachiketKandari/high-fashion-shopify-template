# Design I reference

The storefront's pre-checkout surfaces are built from **“Lorem Ipsum Design I (Copy)”**, not from the
earlier wireframe. This directory is the repo-resident reading of that file.

## Source of truth

| Item       | Value                                                                                |
| ---------- | ------------------------------------------------------------------------------------ |
| Figma file | `Lorem Ipsum Design I (Copy)`                                                        |
| Export     | `~/Downloads/lorem-ipsum-design-i-(copy)-export.json` (7.1 MB, exported 2026-11-16)  |
| Exporter   | `docs/reference/figma/export-plugin/` — a Figma plugin, not the REST API             |
| Pages      | `design system` (3 frames), `All desings` (221 frames), `Journey` (7 curated frames) |

The plugin reads the document through the plugin API, which has no REST quota, and trims every node
to the shape the specs are written from: `id`, `name`, `type`, `absoluteBoundingBox`, layout props,
solid `fills`/`strokes`, and for text `characters` plus `style { fontFamily, fontSize, fontWeight,
letterSpacing, lineHeightPx, textAlignHorizontal }`. It does **not** export image bytes; `imageRef`
is a hash with nothing behind it in the JSON.

`Journey` is a curated duplicate for the pre-checkout flow: `default` home, cookie bar, `menu-woman`,
one PLP and the three PDP states. Its nodes are pixel-identical clones of the same frames on
`All desings` (`2084:10710` ↔ `2003:263`, `2084:10359` ↔ `2044:2602`, `2084:10223` ↔ `2044:2736`,
`2084:10494` ↔ `2044:2869`). Use `All desings` for the inventory; `Journey` changes nothing.

**Design I supersedes the wireframe frames** in `docs/reference/figma/`, `docs/WIREFRAME-EXECUTION-PLAN.md`
and `docs/reference/interactions/` for the seven surfaces listed below. The older documents remain
valid for account, post-purchase, returns, wishlist, support and errors until those surfaces move.

## Canonical frames

| Surface                                       | Desktop                                                              | Mobile                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Home default                                  | `2003:263` 1441×2944                                                 | `5:874` 390×4825 (duplicate `6:1166`; hero-only `2022:2955`)           |
| Home scrolled header                          | `2003:177` 1441×2944                                                 | header inside `5:874`                                                  |
| PLP model / image / item                      | `2044:1155`, `2044:1560`, `2044:1963` 1441×3302                      | `2059:7398` 440×4158, `2059:7814` 440×11072                            |
| PLP 2-column gallery                          | `2050:5425` 1441×7535                                                | `2059:7814` 440×11072                                                  |
| PLP active filters / zero results             | `15:4740` 1440×4868, `15:5317` 1440×3853                             | `15:4896` 390×3853, `15:5490` 390×3853                                 |
| Menu woman / man                              | `2022:2660` / `1:309` 1440×748                                       | `2022:4641` / `2022:4768` 440×956                                      |
| Search empty / typing / results / zero / typo | `1:461`, `1:485`, `1:517`, `7:1426`, `2044:1016`                     | no mobile frame                                                        |
| Auth gate / validation                        | `1:3745`, `30:11706`                                                 | `30:11557`, `30:11731`                                                 |
| Login OTP / password / errors / retry         | `1:3844`, `30:12263`, `30:12449`, `30:12525`, `30:11917`, `30:12098` | `30:11826`, `30:12305`, `30:12489`, `30:12565`, `30:11959`, `30:12220` |
| New client OTP / verified hand-off            | `1:3777`, `30:12637`                                                 | `30:12601`, `30:12695`                                                 |
| PDP default / selected / low stock / OOS      | `2044:2602`, `2044:2736`, `2050:3697`, `2050:4111`                   | `16:6217`, `16:6601`, `16:6714`                                        |
| PDP modals                                    | `2050:4539`, `2050:4689`, `2044:2869`                                | `16:7270`, `16:8009`, `16:8341`                                        |
| Cart active / updating / OOS / empty          | `2068:8220`, `2075:8767`, `2075:9160`, `2075:9064`                   | `22:8538`, `22:8976`, `30:11398`, `22:9199`, `45:13616`                |
| Address member / guest / gift                 | `39:12982`, `39:13055`, `39:13165`                                   | `37:12867`, `39:13019`, `39:13113`, `39:13223`                         |
| Address promo / pincode / credits             | `51:14764`, `45:13446`, `45:13852`, `45:14049`, `46:14396`           | `51:14868`, `45:13896`, `45:14134`, `46:14500`                         |
| Payment (out of scope)                        | `52:14969`–`52:15022`                                                | `52:15051`–`52:15063`                                                  |

The measured PDP geometry is in [`pdp.md`](./pdp.md), copied from the try-on implementation's
`docs/figma/pdp-design-spec.md`. The home composition is in [`home.md`](./home.md), the PLP grid and
toolbar in [`plp.md`](./plp.md), and the cookie bar in [`cookie.md`](./cookie.md).

## Reading a frame

`jq` works because every page is an array of top-level frames. To print one frame as a tree:

```bash
EXPORT="$HOME/Downloads/lorem-ipsum-design-i-(copy)-export.json"

jq -r '
  def walk($d):
    [range(0;$d)|"  "] | join("") as $pad |
    "\($pad)[\(.id)] \(.type) \(.name) \(.absoluteBoundingBox.width)x\(.absoluteBoundingBox.height) @\(.absoluteBoundingBox.x),\(.absoluteBoundingBox.y)" +
    (if .characters then " :: \(.characters)" else "" end),
    (.children[]? | walk($d+1));
  .pages[] | .children[] | select(.id=="2044:2602") | walk(0)
' "$EXPORT"
```

To list every frame with page, id, size and position:

```bash
jq -r '.pages[] | .name as $p | .children[] |
  "\($p)\t\(.id)\t\(.absoluteBoundingBox.width)x\(.absoluteBoundingBox.height)\t\(.name)"' "$EXPORT"
```

To dump all text runs in a frame:

```bash
jq -r --arg id "39:12982" '
  .. | objects | select(.id==$id) | ..
  | objects | select(.type=="TEXT")
  | "\(.style.fontFamily) \(.style.fontSize)/\(.style.fontWeight) \(.characters)"' "$EXPORT"
```

Python is easier for a full geometry dump; any agent can adapt the walker from
`docs/reference/figma/export-plugin/code.js`.

## Known defects in the file

- The five payment frames contain **zero text nodes**; they cannot be a build reference.
- Duplicated frame names: `Mobile PDP - Default State (In Stock)` (twice), `New Client Onboarding -
  New User OTP Verification` (twice), `Login Screen - Wrong Password Error State` (twice), `Order
  confirmation - Happy Path` (twice), `Address and Shipping - Saved Address Cards (Member)` (three
  times), `Address and Shipping - Default Pre-Payment Audit` (twice).
- Copy typos: `CONTROL YOUR NURRATIVE`, `Shop for Man`, `My Accout`, `Typo correcton`, `Notify Me
  Modall`, `Return` for Returns. Correct them in code unless the owner says otherwise.
- The desktop home hero (`2003:263`) is image-only with two dots; the mobile hero (`5:874`) carries
  “CONTROL YOUR NURRATIVE” and “Explore Collections”. Treat this as a responsive difference, not a
  missing layer.
- The mobile PDP frame is padded to 4080 px with 1,704 px of empty white; build to the 2,375.56 px
  content height.
- The 390 px PDP and cart frames draw the older 76 px `Menu / wordmark / Bag / Help` header. The
  440 px `Home` and `Mobile Menu` frames draw the current 56 px wordmark-left icon bar. The
  storefront builds the 56 px bar; treat the 76 px bar as stale.
- Mobile PDP image boxes are 390×585 placeholders with no image fill; use the desktop hero asset
  until an export exists.
- Recommendation image boxes overflow their 250×447 holders and differ per card; implement the
  holder, not the misplaced rectangles.
- `size recommendation` is drawn but has no data source; see `docs/STUBS.md`.
- The mobile header decision in `docs/reference/figma/mobile-frames.md` is resolved in favour of
  Design I: 56 px, wordmark left, search / bag / account / menu icons right.
- `Use account credits` is drawn but the Storefront API does not expose the balance; hide it.

## Design-system notes

- Fonts in the file: **DM Sans** for UI, **Helvetica** for the footer and mobile header, **Inter**
  for some search/cart titles, and one off-canvas **Mea Culpa** wordmark study. The try-on page
  normalised everything to DM Sans; keep that decision.
- The footer wordmark is drawn as **text** `LOREM IPSUM` 36/54, not the vector used in the header.
  The repo's `public/brand/wordmark.png` can serve both at different widths.
- Control radius is **4 px** in the design; the repo's zero-radius contract is the deliberate
  deviation (see `docs/DESIGN-I-CHECKOUT-JOURNEY.md` D1).
