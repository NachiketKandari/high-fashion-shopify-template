# Asset inventory

Assets used by the prototype live in `public/reference/`. They were captured from the reference
site's public CDN on 4 November 2026 for design study only.

| File                       | Source role                | Size  | Replace before launch       |
| -------------------------- | -------------------------- | ----- | --------------------------- |
| `ps-wordmark.svg`          | Header and footer wordmark | 37 KB | Yes — production brand mark |
| `hero-desktop.jpg`         | Homepage hero, desktop     | 1920w | Yes — photography licence   |
| `hero-mobile.jpg`          | Homepage hero, mobile crop | 1000w | Yes — photography licence   |
| `editorial-corsets.jpg`    | 2-up, left                 | 1000w | Yes                         |
| `editorial-dresses.jpg`    | 2-up, right                | 900w  | Yes                         |
| `editorial-core.jpg`       | 3-up, left                 | 1000w | Yes                         |
| `editorial-essentials.jpg` | 3-up, centre               | 1000w | Yes                         |
| `editorial-elevated.jpg`   | 3-up, right                | 1000w | Yes                         |
| `tile-flagship.jpg`        | Link tile                  | 720w  | Yes                         |
| `tile-journal.jpg`         | Link tile                  | 720w  | Yes                         |
| `tile-careguide.jpg`       | Link tile                  | 720w  | Yes                         |
| `tile-our-world.jpg`       | Link tile                  | 720w  | Yes                         |

Product photography comes from the connected Shopify catalog, not this folder. Once the catalog
is seeded, product images are served from `cdn.shopify.com` through `next/image`.

The reference wordmark is a trademark of Polite Society. The photography is copyrighted. Use
these files only in a private, non-distributed prototype, and replace them with licensed assets
before deploying publicly.
