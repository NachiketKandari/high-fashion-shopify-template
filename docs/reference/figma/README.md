# Figma frame specs

Layout sources exported from Figma, one pair per frame. The `.md` is the readable spec and the file to
build from; the `.css` beside it is the Dev Mode export kept for provenance.

## Naming

```
<surface>-<viewport>-frame-<n>.md      # spec: sections, geometry, type, mapping, open questions
<surface>-<viewport>-frame-<n>.css     # raw Dev Mode export, never copied into components
<surface>-<viewport>-frame-<n>.png     # optional 1x render for visual comparison
```

`surface` is the route family, not the Figma page name: `home`, `collection`, `product`, `cart`,
`search`, `checkout`, `account`, `header`, `footer`, `menu`. `viewport` is `desktop` (1440),
`tablet` (768) or `mobile` (390). `n` is the Figma frame id, so a frame can be found again in the
file. Never include spaces, "copy", or a date.

Figma's `Copy CSS` emits bare declarations in document order, not a stylesheet, so a `.css` export
here does not parse as CSS. It is exempted from `oxfmt` in `.oxfmtrc.json` and must stay out of
`app/globals.css`.

## Exporting a frame

1. Select the frame, not a child layer, so the export covers the whole section.
2. Dev Mode → **Copy CSS**. Paste into `<name>.css` and add the provenance header.
3. Export the frame as PNG at 1x and keep `<name>.png` beside it when the layout depends on imagery.
4. Write the `.md` with the same five sections as the existing spec: a one-line frame summary
   (dimensions and offset), a section table in document order, a mapping table against the current
   route, the assets the frame names but does not contain, and open questions.
5. Record what the frame omits — header, mobile, states, motion — in open questions. A frame with no
   `top: 0` starts below something, and that something is usually unspec'd.

## Frames captured

| Frame            | Surface | Viewport | Size      | Spec                                                     |
| ---------------- | ------- | -------- | --------- | -------------------------------------------------------- |
| Home, `Frame 64` | home    | desktop  | 1440×5158 | [`home-desktop-frame-64.md`](./home-desktop-frame-64.md) |

## Offline exports and the REST quota

The REST API is metered per token and plan tier, not per minute. A 429 carries the real number:

```
x-figma-plan-tier: starter
x-figma-rate-limit-type: low
retry-after: 380911          # seconds, ~4 days
```

On 2026-11-16 the wireframe file answered every endpoint — `/files`, `/files/{key}/nodes`,
`/files/{key}/images`, `/images` — with the same `retry-after`, so the quota is shared and the whole
token is out until about 2026-11-20T14:11Z. Retrying a frame does not help and spends nothing useful.

Fetch once, read locally:

```
node figma-cache.mjs fetch <fileKey>                 # whole document, one request
node figma-cache.mjs fetch <fileKey> --ids 1:1090    # one subtree, still one request
node figma-cache.mjs trim <cached.json> --ids 1:1090 # re-read a frame, no request at all
node figma-cache.mjs list
```

`fetch` honours `Retry-After` and refuses to write a partial file. `trim` keeps `id`, `name`, `type`,
`absoluteBoundingBox`, `layoutMode`, `itemSpacing`, paddings, fills, strokes, `characters` and the
text style, which is every field a spec uses. The cache lives outside the repository, next to the
token, because the raw document is tens of megabytes and a checkout does not need it; the specs in
this directory are the durable artifact.

When the quota is exhausted, in order of preference:

1. `trim` an export that was already fetched — one document covers every frame in it.
2. Fetch with a token on a paid seat: the limit follows the plan, so a Professional or Organization
   account raises it for the same file.
3. Export through a development plugin in the Figma desktop app, which runs on the plugin API and
   never touches the REST quota. It returns the node tree and can render PNGs at any scale.
4. Select a frame in the editor and read its properties from the right sidebar, for one or two
   frames that are needed before the quota returns.

Images share the quota. Render each surface once at 1x and keep the PNG beside its spec rather than
re-rendering while writing.

## Constraints that apply to every frame

These come from `AGENTS.md` and `docs/DESIGN-SYSTEM-ENFORCEMENT.md`, and they override anything a
Figma export says:

- Breakpoints are `tablet:` 750 and `desktop:` 1100, never `md:`/`xl:`.
- Type uses `type-*` roles; arbitrary `text-[…]` and `leading-[…]` fail `pnpm lint`.
- Spacing uses `--gutter`, `--section-gap` and `--grid-*`; one-off pixel values need a token.
- Surfaces are zero-radius; `shadow-modal` is the only shadow.
- Dev Mode CSS is absolute positioning. Section order, sizes and type are the transferable facts;
  `left`, `top` and `position: absolute` are not.

## When a frame disagrees with the design system

Say so in the spec's open questions rather than implementing the export literally. A Figma value that
has no token is a decision for the design owner, not a licence to add an arbitrary value.
