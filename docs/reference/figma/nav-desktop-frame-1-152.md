# Header and menu — Figma `1:152`, `1:309`

`menu-woman` and `menu-man` are 1440 × 1086: the page with a 592 px panel open over a 20 % scrim.
The same bar appears on every 1440 frame, so it is the storefront's shell.

## Bar — `Frame 5`, 1440 × 76

Padding 16 / 24, one hairline under it, three zones.

| Zone   | Content                                                  |
| ------ | -------------------------------------------------------- |
| Left   | `Woman` 70 × 43, `Man` 49 × 43, `Search` 66 × 43, gap 10 |
| Centre | Wordmark 125 × 27 at x 658 (18/400 in the frame)         |
| Right  | `Wishlist` 70, `Bag` 47, `Help` 51, `Account` 72, gap 24 |

Every control is a 43 px chip: 1 px border, 10 px horizontal padding, 14/400 label.

## Panel — `Frame 81`, 592 × 1086, left edge

| Part   | Node          | Geometry                                                                                    |
| ------ | ------------- | ------------------------------------------------------------------------------------------- |
| Scrim  | `Rectangle 1` | `#000000` at 20 % over the page                                                             |
| Header | `Frame 80`    | 73 tall, padding 24; the three chips and a 24 × 24 close at the panel's right               |
| Body   | `Frame 78`    | padding 24, gap 24; `SHOP WOMAN` 16/400 `#353535`, then links 16/400, 43 px baseline rhythm |
| Footer | —             | `Lorem Ipsum` 16/400, 24 from the bottom                                                    |

Woman links: All, Bralettes, Bodysuits, Dress, Pants, Racer Backs, Shirts, Skirt, Shorts, T-shirt,
Tops. Men links: All, Jackets, Pants, Shirts, Shorts, T-shirt.

## What the storefront renders

| Frame                  | Shipped                                                |
| ---------------------- | ------------------------------------------------------ |
| 76 px bar, three zones | `--header-bar-h: 76px`, three-zone grid                |
| Bordered 43 px chips   | `NAV_CHIP_CLASS`, 14/400 sentence case                 |
| No announcement bar    | Removed; the bar is the first element on every page    |
| Wordmark 125 wide      | `Wordmark variant="nav"`, 125 wide at both breakpoints |
| 592 px left panel      | `#nav-panel`, 592 wide, 20 % scrim, body scroll locked |
| Panel footer           | `Lorem Ipsum`                                          |

## Deviations

- The frame says `Man`; the storefront keeps `Men`, the label the catalogue and navigation already
  use.
- The panel's third chip is `Search`; the storefront reuses its search sheet, so the chip is a link
  into the panel while the bar's own `Search` opens the sheet. Both reach search.
- `Bag` carries the cart count when it is non-zero.
- The currency selector is not in the frame, so it lives in the footer only.
- The frames draw a 24 × 24 close; the storefront uses a 36 px target.

## Mobile — 390 frames

Every 390 frame shows the closed bar only: `Menu` 57 × 43, wordmark 125 × 27 at x 104, `Bag` 47 × 43,
`Help` 51 × 43, same 76 px height and 24 px gutter. No frame shows the menu open, so the open state
follows the desktop panel: the active category's links in two columns over one image, then the
secondary destinations.

## Open questions

1. **Mobile menu layout.** If a 390 menu-open frame exists, it is not in the two exported files.
   The two-column-with-image layout is the current assumption and can be replaced wholesale.
2. **Menu imagery.** The frames leave placeholders; each category uses one editorial image.
