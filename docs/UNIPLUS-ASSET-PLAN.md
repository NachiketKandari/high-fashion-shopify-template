# UniPlus asset plan

What the UniPlus research files change in the storefront: which assets are usable as they are,
which need a decision first, and which code reads them. The catalog itself is already imported and
published; this plan covers everything the import did not carry and the assets that block it. See
[`UNIPLUS-IMPORT.md`](./UNIPLUS-IMPORT.md) for what is live, [`CATALOG-AUDIT-UNIPLUS.md`](./CATALOG-AUDIT-UNIPLUS.md)
for the per-product record, and [`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md) for the storefront gaps
(G2, G3, G7) that this plan feeds.

Sources analysed: `~/UniPlus/e-Commerce Research` (44 PDF, 67 PNG), `~/UniPlus/Lorum Ipsum resources`
(95 JPEG, flow diagram, `labels_mapping.csv`, `Ghost mannequin pilot`), and
`~/UniPlus/UniPlus_Product_Catalog.xlsx`.

## 1. What the research files hold

| Location                       | Contents                                                                                                                                                            | Storefront use                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `e-Commerce Research`          | 6 fabric care labels ×2 exports, 7 size tags (XXS–XXL), hang/neck/fold-over tags, logo usage board, colour and strategy boards, 8 wordmark strips, 53 lookbook PNGs | Care copy, size guide, brand assets |
| `Lorum Ipsum resources`        | 95 labelled photoshoot JPEGs, `flowchart_ecommerce_user_flow_*`, `labels_mapping.csv`, 3-tier ghost-mannequin pilot                                                 | Product media, purchase flow        |
| `UniPlus_Product_Catalog.xlsx` | 354 variant rows × 48 columns, `Notes` sheet                                                                                                                        | Catalog data, already imported      |

**Neither folder holds a page wireframe.** No frame describes a layout, route or component, so no
export-to-page workflow applies to these files. The only flow artefact is the diagram, which §7 maps
onto existing routes.

A homepage layout spec does exist, exported separately from Figma:
[`reference/figma/home-desktop-frame-64.md`](./reference/figma/home-desktop-frame-64.md). It describes 1440 × 5158 of
page in eight sections, and it disagrees with the current homepage in five of them, so it is a
redesign rather than a rebuild. Its imagery is the same under-resolved photography counted in §6.

The 53 lookbook PNGs are not a second set of products: they resolve to 15 unique images, all
re-crops of JPEGs that already exist in `Lorum Ipsum resources` at larger sizes. They add nothing
and should not be imported.

## 2. Release blockers

| ID  | Blocker                                                                                                | Owner   | Effort  | Gates                        |
| --- | ------------------------------------------------------------------------------------------------------ | ------- | ------- | ---------------------------- |
| B1  | 65 of 89 product JPEGs are 853–854 px wide; the PDP column needs 1320–1920 px                          | Shopify | 1 d     | PDP gallery, editorial, hero |
| B2  | 9 products have no front view (5 have no photograph at all) and 9 have no back view                    | Shopify | Reshoot | Card + gallery integrity     |
| B3  | 12 colourways have no photograph at all, so their products stay `DRAFT`                                | Shopify | Reshoot | 12 products                  |
| B4  | No vector wordmark exists; the only SVG wraps a bitmap                                                 | Next.js | 2 h     | Header, footer, icon, OG     |
| B5  | The brand surface is cream with a brand red; neither is a token and the red collides with `--error`    | Next.js | 4 h     | Every page                   |
| B6  | Two of the six care labels contradict themselves; the storefront copy contradicts all six              | Both    | 1 h     | Fabric tab, Care Guide       |
| B7  | No hero-size photograph exists: the spec wants 400 × 718 portrait, the live page 1920 × 1280 landscape | Shopify | Reshoot | Homepage                     |

## 3. Brand identity

### Wordmark

The primary lockup is an extended grotesque at **12.04:1** (ink box 2372 × 197 inside the 3011 × 352
strip). `public/brand/wordmark.svg` is a placeholder at 12.39:1, so swapping the file without
recomputing heights distorts it by 3 %.

| Surface        | Current width | Height at 12.04:1 |
| -------------- | ------------- | ----------------- |
| Masthead       | 1016 px       | 84.4 px           |
| Desktop header | 342 px        | 28.4 px           |
| Compact header | 170 px        | 14.1 px           |
| Footer         | 315 px        | 26.2 px           |
| Mobile menu    | 210 px        | 17.4 px           |

The smallest legible size is 12 px of ink height (about 145 px wide); below that the counters close.

`IMG_0923.svg` is not a vector — it wraps an embedded bitmap. A crisp mark needs a Figma re-export
as paths. The usage board (`Group 121`) sets the surrounding rules: **no skewing, no stretching, no
colour change, and clear space around the mark**, so the storefront must not tint it or crop it into
a container narrower than its clear space.

Two further lockups are `Group 158`'s script signature (4:1) and the `L/I` monogram with a
`1` numeral. Neither is in the repo.

| Change                                                                     | File                                                            |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Replace the placeholder mark with the traced horizontal lockup             | `public/brand/wordmark.svg`                                     |
| Recompute `WIDTH`/`HEIGHT` and the `VARIANTS` widths                       | `components/brand/wordmark.tsx`                                 |
| Add the script and monogram as SVG assets                                  | `public/brand/`, new `WordmarkVariant` members                  |
| Regenerate icon, apple icon and the three manifest icons from the monogram | `app/icon.svg`, `app/apple-icon.png`, `public/icons/icon-*.png` |
| Replace the template social image                                          | `public/og-default.png`, referenced by `lib/seo/index.ts`       |

### Colour and tokens

| Role               | Brand value                        | Token today                     | Required decision                                                              |
| ------------------ | ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| Paper              | `#FFFEF1` cream                    | `--paper: #ffffff`              | Retone `--paper`/`--inverse`, or accept white and lose the brand surface       |
| Brand red          | `#A7261D`                          | none; `--error-rule` `#c7261b`  | Add an accent token, then re-audit error styling so red is not always an error |
| Ink                | `#1D1D1D`                          | `--ink: #000000`                | Set as the SVG fill only, unless ink is retoned everywhere                     |
| Colourway swatches | 13-swatch first-collection palette | `lib/product/color-swatches.ts` | Shopify data, not tokens                                                       |

The PDFs disagree with themselves under colour management: two reds (`#A7261D`, `#C53322`) and
three creams (`#FFFEF1`, `#FFFEEB`, `#FEFBF0`). Get one signed-off hex or Pantone per role before
touching `app/globals.css` and `design/tokens.manifest.json`; both must change together or
`pnpm lint` fails the drift gate.

### Typography

Three voices, none of which needs a new type token: the extended grotesque (wordmark and monogram
only, kept as SVG because no extended cut is installed), the neutral grotesque that every care
label, tag and board uses in caps (already covered by `type-label`, `type-control`, `type-body-sm`),
and the script signature (an asset, not a face). The font specimen in `Group 121` literally reads
`FONT NAME`, and no font files ship, so neither face can be licensed or matched yet.

## 4. Care and size copy

Six woven care labels exist, one per fabric family. Verbatim, in label order:

| Family                 | Label copy                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| DENIM                  | MADE IN INDIA / MACHINE WASH COLD / LINE DRY / WARM IRON / Do not bleach / WASH INSIDE OUT                                                 |
| KNITS                  | MADE IN INDIA / MACHINE WASH COLD / DO NOT BLEACH / TUMBLE DRY LOW / COOL IRON                                                             |
| MESH                   | MADE IN INDIA / Dry clean recommended / LINE DRY / Do not bleach / Cool iron / HAND WASH                                                   |
| LINEN, COTTON, SUITING | MADE IN INDIA / DRY CLEAN / DO NOT BLEACH / HAND WASH / DO NOT TUMBLE DRY / WARM IRON                                                      |
| LEATHER & SUEDE        | MADE IN INDIA / Professional leather clean only / SPOT CLEAN WHEN POSSIBLE / Do not bleach / Do not tumble dry / Store in a cool dry place |
| SATIN, VELVET          | MADE IN INDIA / Dry clean recommended / Spot clean when possible / Do not bleach / Cool iron on reverse / Store hanging                    |

Two labels are internally contradictory and need a merchandising decision before they are imported:
LINEN says `DRY CLEAN` and `HAND WASH` together, and MESH says `Dry clean recommended` alongside
`HAND WASH`.

Today `components/product-detail/product-tabs.tsx` renders one string for every product —
**"Dry clean on low heat. Do not bleach. Cool iron on the reverse."** — which matches none of the six
labels and contradicts DENIM and KNITS outright. The seeded Care Guide contradicts them too: it
groups care as "Corsets" (dry clean only, do not hand wash) and "Others" (dry clean or hand wash
cold), against the two labels that specify machine washing and the two that permit hand washing. The
care rules therefore reach shoppers as wrong information, not merely as missing information.

| Change                                                                                         | File                                                                        |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Write `custom.fabric_care` per product from its family label, then render it in the Fabric tab | importer metafield + fragment + transform + `product-tabs.tsx` (G2 pattern) |
| Regroup the Care Guide page by fabric family instead of today's "Corsets"/"Others"             | `scripts/content/pages.mjs` → `pnpm seed:content`                           |
| Use the 9-symbol wash-care board as the guide's icon row                                       | `app/pages/**` content                                                      |
| Record `MADE IN INDIA` as country of origin                                                    | product metafield                                                           |

**Size coverage is wrong at both ends.** The physical tags are XXS, XS, S, M, L, XL, XXL (7). The
catalog variants run XS–XXL (6), so XXS cannot be sold. `components/content/size-guide.tsx` lists
XS through XXXL (7) with a XXXL row, so the guide advertises a size the tags never print.
`components/product-detail/size-guide.tsx` must match whichever run the merchant confirms.

## 5. Catalog data

The workbook describes 39 products, 59 colourways and 354 variants across 13 collections — the
UniPlus range already in `scripts/data/uniplus-catalog.json`, not the Polite Society catalog that
fills the rest of the store. 22 of its 48 columns are empty on all 354 rows, including
`composition`, `care`, `fit`, `lining`, `trims`, `colour_hex`, `price`, `sku`, `barcode`,
`inventory`, `weight`, `dimensions`, `hs_code`, `model_height`, `model_size`,
`garment_measurements`, `styling_notes`, `badges`, `preorder_date`, `care_warnings` and
`other_option`. `long_description` duplicates `short_description` on all 39 products. `image_*`
holds Google Drive view links, not downloadable files.

Four gaps matter more than the blanks:

1. **Nothing reads metafields.** `scripts/import-uniplus-catalog.mjs` writes SEO and
   `origin`/`composition`/`care`/`fit`, but no fragment, transform or component reads any metafield,
   so those writes change nothing a shopper sees. The read path is G2's work in
   [`GAP-CLOSURE-PLAN.md`](./GAP-CLOSURE-PLAN.md#g2--import-per-product-fabric-and-fit-copy).
2. **`complete_the_look` is authored but never created.** 108 references across 17 products would
   become `list.product_reference` metafields; today the rail is unrelated-product filler.
3. **Options are hardcoded to two.** A filled `other_option` column would be dropped silently.
4. **The reference importer has no metadata path.** `scripts/import-live-catalog.mjs` writes no SEO
   and no metafields and lacks `--metadata-only`, so the two catalogs cannot share a schema.

Two corrections to the existing docs, both verified here: a blank `colour_hex` is not a launch
blocker because `lib/product/color-swatches.ts` already resolves all 59 colour names to hexes, and
`UNIPLUS-IMPORT.md` still points the workbook at `$HOME/workspace/UniPlus_Product_Catalog.xlsx` when
it lives at `~/UniPlus/`. `package.json` also exposes no `import:uniplus` script; the two UniPlus
scripts are only run directly.

## 6. Photography

89 JPEGs reduce to 76 unique files and 58 outfit frames, because each frame photographs a look
rather than a single product: one image serves up to two SKUs. 13 files are byte-identical `_copy`
duplicates and 16 UIDs are shared across two products (`UNIPLUS-IMPORT.md` still records nine), so
the same frame leads the cards of, for example, `mini-chipped-skirt` and `animal-poplin-bralette`.

| Coverage     | Frames |
| ------------ | ------ |
| Front + back | 12     |
| Front only   | 24     |
| Back only    | 18     |
| Side only    | 2      |
| Closeup only | 2      |

Per product the picture is worse than per frame, because a shared look frame can serve both a top
and a bottom: **21 of 39 products have both a front and a back view, 9 have no back view, and 9 have
no front view** — 5 of those because they have no photograph at all. Detail closeups number two in
total, both waist-up crops rather than fabric macros. Back-only products cannot lead a PDP, which
rules out `armani-t-shirt`, `ribbed-racer-back` and `delicate-satin-racer-back` without a front
frame.

Resolution is the hard constraint. All sources are 2:3, which suits the existing card and gallery
crop, but the pixels are short of the `deviceSizes: [1320, 1920]` contract. At `desktop:grid-cols-2`
a 1440 px viewport gives a 720 px column, or 1440 device pixels, so `next/image` serves the 1920
step and upscales every photograph by 1.8×–2.25×.

| Group                      | Files | Max width | PDP gallery    | Card  | Hero / editorial |
| -------------------------- | ----- | --------- | -------------- | ----- | ---------------- |
| 853–854 × 1280             | 65    | 854 px    | Fails (−35 %)  | Pass  | Fails            |
| 1066 × 1600                | 24    | 1066 px   | Fails (−19 %)  | Pass  | Fails            |
| Lookbook PNGs              | 49    | 380 px    | Fails (−71 %)  | Fails | Fails            |
| Lookbook thumbnails        | 4     | 186 px    | Fails (−86 %)  | Fails | Fails            |
| `IMG_8467` lifestyle       | 2     | 1770 px   | Pass           | Pass  | Pass             |
| Ghost mannequin (voidwear) | 3     | 1254 px   | Near miss, 1:1 | Pass  | Fails            |

Re-exporting the camera originals at 1920 px wide is one export setting, not a reshoot, if those
originals still exist — that is the single highest-value action in this plan.

The ghost-mannequin pilot is a three-tier experiment, not a media pipeline. `voidwear` returns a
clean garment-only pair but at 1254 × 1254, so it needs a re-render at ≥1320 and a 1:1-to-2:3 crop
that loses a third of the frame; `generalAI` keeps a hand and floating shoes; the hard tier cropped
the print skirt away entirely. Use them as a `flat` gallery item in slot 4 or 5, never as the
featured image or a variant image, and treat "AI-synthesised" as a legal question before calling
one the product.

Alt text is generated wrong: **38 of 86 images say "front view"** while showing a back, styled or
detail frame. The recorded `view` is unreliable too — on 17 images it disagrees with the filename
token (an `_FP` styled shot recorded as `styled`, a `_BP` crop recorded as `closeup`), and the
vocabulary has no `side`. Fix the generator in `scripts/import-uniplus-catalog.mjs`, not the 38
strings. Rename stored files to `{handle}-{nn}-{colour-family}-{view}.jpg` so variant assignment
survives a re-import, and make `view` and `colour` explicit fields in `lib/media/types.ts` instead of
inferring both from alt text.

## 7. Purchase flow

The diagram is a happy path with two forks: homepage → listing → PDP, then buy-now or add-to-cart;
buy-now asks whether the shopper is logged in, and an unauthenticated shopper goes to login, email,
OTP, retry-on-failure, then optional personal details, then checkout; success lands on order
details.

| Node in the diagram               | Route today                                                   |
| --------------------------------- | ------------------------------------------------------------- |
| Homepage, listing, PDP            | `app/page.tsx`, `app/collections/**`, `app/products/[handle]` |
| Add to cart                       | `proxy.ts` cart handler, drawer                               |
| Buy now                           | **Not implemented**                                           |
| Login, email, OTP, retry, details | Shopify-hosted account domain                                 |
| Checkout, payment                 | Shopify-hosted checkout                                       |
| Order details                     | `/account/orders/[id]`, auth-gated                            |

Three things the flow promises and the storefront cannot express:

- **Buy now.** `components/product-detail/buy-buttons.tsx` renders a Shop Pay button only, and it is
  disabled because Shop Pay is unavailable on an INR store, so checkout is reachable from `/cart`
  alone. The first fork in the diagram does not exist.
- **Guest checkout.** The diagram forces login before checkout; Shopify allows guests, and no route
  branches on either behaviour.
- **Payment failure.** There is no surface for it, and no order-status page for a guest, so
  "Order Details" dead-ends unless the shopper has an account. A tokenised order-status route is
  the smallest fix.

Everything else in the diagram is Shopify's hosted surface, which the app must not re-create: OTP
generation and verification, the retry screen and the pre-checkout details form stay where Shopify
puts them. Routes the diagram omits and the storefront keeps are search, cart review, wishlist,
returns, policies and the agent — parity with this diagram is not a goal it can define.

## 8. Sequence

| Phase                  | Work                                                                                      | Depends on        | Effort        |
| ---------------------- | ----------------------------------------------------------------------------------------- | ----------------- | ------------- |
| 0. Asset decisions     | Signed-off brand hex/Pantone, font licence, care conflicts, re-export of originals        | Merchant          | 1 d           |
| 1. Brand               | Wordmark, monogram, icon set, OG, cream/accent tokens, drift manifest                     | Phase 0 colours   | 1 d           |
| 2. Copy and metafields | `custom.fabric_care`, per-product care, Care Guide by fabric, size run fix                | Phase 0 care call | 2 d           |
| 3. Media               | Re-export at 1920, alt-text generator, `view`/`colour` on media, ghost slot 4–5           | Phase 0 originals | 2 d + reshoot |
| 4. Flow                | Buy-now without Shop Pay, guest order status, payment-failure surface                     | Decision          | 1–2 d         |
| 5. Catalog plumbing    | `complete_the_look` references, third option, `--metadata-only` on the reference importer | —                 | 1 d           |

Phases 1, 2 (once the care call is made) and 5 ship without new photography. Phase 3 is the only
workstream that cannot be completed from what exists on disk.

## 9. Decisions needed

1. Trading name, legal entity and registered address to replace every "Lorem Ipsum" placeholder.
2. One hex or Pantone per brand role, plus whether the storefront surface moves from white to cream.
3. Font licences for the extended grotesque and the script signature.
4. Care copy for LINEN and MESH, whose labels contradict themselves.
5. Size run: keep XS–XXL, or add XXS to match the tags.
6. Whether the brand red becomes an accent token, and what error colour then means.
7. Whether guest checkout should be offered, or the flow keeps forcing login as drawn.
8. Photography rights, credit and whether the original captures exist above 1066 px.
9. Whether AI ghost-mannequin imagery may be presented as the product.

## 10. Verification

```bash
pnpm lint          # includes the token drift gate
pnpm typecheck
pnpm test:design   # computed type, targets, ARIA, reduced motion
pnpm seed:content  # after the Care Guide regroups by fabric
node scripts/publish-uniplus-catalog.mjs   # after media or metafield changes
```

Check the header and footer at 1440 and 390 for distorting from the new mark ratio, the Fabric tab
on a DENIM product against its label, and the card grid for upscaled photography at 2× DPR.
