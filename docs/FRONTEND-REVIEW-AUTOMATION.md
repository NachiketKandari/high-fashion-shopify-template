# Frontend review automation

Measured 2026-11-08 against a production build on `http://localhost:3200` and GitHub releases /
licences fetched the same day. This document records what can review the storefront end to end,
what this repo actually runs, and what it deliberately does not.

## Principle

Three layers, in order:

1. **Measure** — deterministic checks on the rendered DOM and computed styles.
2. **Judge** — a model reviews screenshots or semantics against a written rubric.
3. **Decide** — a human accepts, rejects, or turns the finding into a rule.

No open-source tool does all three. The three products closest to "an agent walks the site and
lists inconsistencies" are archived or dormant (Lost Pixel, web-eval-agent, Magnitude). The
deterministic layer is cheap, repeatable, and catches most of the defects that matter. Build on it
first; add a model only for judgment calls.

## What runs today

| Check                     | Command                           | Catches                                                                    | Gate          |
| ------------------------- | --------------------------------- | -------------------------------------------------------------------------- | ------------- |
| Lint + design drift       | `pnpm lint`                       | oxlint rules, formatting, token/utility drift (`scripts/check-design.mjs`) | Every change  |
| Types                     | `pnpm typecheck`                  | TypeScript and route types                                                 | Every change  |
| Design contracts          | `pnpm test:design`                | computed type, 36px targets, ARIA wiring, reduced motion, key flows        | Every change  |
| Reference measurements    | `pnpm audit:reference`            | live reference geometry versus ours                                        | UI changes    |
| axe                       | see below                         | WCAG and best-practice violations in the rendered page                     | UI changes    |
| Knip                      | see below                         | unused files, exports, types, dependencies, cycles                         | Monthly       |
| jscpd                     | see below                         | copy-paste drift                                                           | Monthly       |
| SiteOne Crawler           | see below                         | whole-site 404s, metadata, heading tree, slow URLs                         | Before launch |
| Lighthouse / Unlighthouse | see below                         | per-route performance, a11y, SEO budgets                                   | Perf changes  |
| `next analyze`            | `pnpm exec next analyze --output` | Turbopack bundle composition and import chains                             | Perf changes  |

### axe

Injected into the existing Playwright install, so no dependency is added:

```bash
curl -sL -o /tmp/axe.min.js https://unpkg.com/axe-core@4.14.0/axe.min.js
```

Then load a route, `page.addScriptTag({ path: "/tmp/axe.min.js" })`, and run
`axe.run(document, { resultTypes: ["violations"] })`. The audited set is home, collection, search,
two PDPs, size guide, journal and cart at 1440 × 1000 and 390 × 844. All 18 combinations are clean
as of 2026-11-08.

This is intentionally a manual command. Adding `@axe-core/playwright` and a test would make it a
gate, but the repo testing policy requires an explicit request for new test files and dependencies.

### Knip

```bash
pnpm dlx knip@6 --files --dependencies --exports --cycles --reporter compact --no-progress
```

Run outside the repo's dependency set. It understands the App Router, `proxy.ts`, oxlint and
Tailwind. The current output is in the results section.

### jscpd

```bash
pnpm dlx jscpd@5 --min-tokens 70 --ignore "**/.next/**,**/node_modules/**,**/*.d.ts,**/components/ai-elements/**" .
```

Duplication below roughly 1% of TS/TSX is not worth acting on. JSON fixtures dominate the raw
percentage because the catalog seed data repeats product shapes.

### SiteOne Crawler

Single Rust binary, no install into the repo:

```bash
siteone-crawler \
  --url=http://localhost:3200/ \
  --disable-all-assets --workers=8 \
  --transform-url="localhost:3000 -> localhost:3200" \
  --ignore-regex='/(cart|account|login|search|api|agent|md)(/|$)' \
  --output=json --ci
```

Three caveats specific to this storefront:

- The sitemap advertises `http://localhost:3000`, so rewrite the host or the crawl follows broken
  URLs.
- Collection cards link `?Colour=&Size=` variants. Deduplicate by pathname before reading
  duplicate-title or heading reports, or one PDP becomes 40 pages.
- `/account/login` returns 500 locally because Customer Account OAuth requires HTTPS. This is the
  environment constraint already recorded in `docs/UI-UX-CONSISTENCY-AUDIT.md`, not a defect.

### Lighthouse and Unlighthouse

```bash
npx lighthouse http://localhost:3200/products/alma-lace-corset-top --output=json --chrome-flags="--headless"
pnpm dlx unlighthouse@0.19 --site http://localhost:3200
```

Localhost is unthrottled and CDN-free, so scores are directional. Field performance stays with
Vercel Speed Insights.

## Results — 8 November 2026

### axe: four defects, all fixed

| Route              | Impact   | Rule                          | Cause                                                               | Fix                                                           |
| ------------------ | -------- | ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| Collection, search | critical | `button-name`                 | Sort trigger is `role="combobox"`; name-from-content is not allowed | `aria-label="Sort by {value}"` on the trigger                 |
| Collection, search | moderate | `heading-order`               | H1 → H3, no H2 before the product grid                              | Visually hidden `h2` "Products" above the grid                |
| PDP, 390           | serious  | `scrollable-region-focusable` | Mobile gallery scrolls but cannot receive keyboard focus            | `role="region"`, `aria-label`, `tabIndex={0}` on the carousel |
| Size guide, 390    | serious  | `scrollable-region-focusable` | Two overflowing tables are not focusable                            | Labelled `role="region"` wrappers with `tabIndex={0}`         |
| Size guide         | minor    | `empty-table-header`          | Corner `th` is empty                                                | Visually hidden "Size" label                                  |

All 18 route/viewport combinations are clean afterwards. The size-guide table change also fixes
keyboard scrolling on mobile.

### Knip: dead weight, not removed

Unused files:

- `components/footer/social-links.tsx`
- `components/nav/menu-link.tsx`
- `components/product-detail/buy-with-shop-logo.tsx`
- `components/product-detail/complementary-products.tsx`
- `lib/menu/types.ts`

Scripts and `.agents/skills/**` are reported too but are invoked manually; leave them.

Unused exports worth reviewing: `ProductInfoDescription`, `ProductsGrid`, `addAnalyticsDestination`,
`getBrowseSort`, `getMarkdownPath`, `getMarkdownMirrorPath`, and several type exports. Some are
re-exported through component barrels; confirm before removing.

`turbo` is listed as a dependency but no script invokes it. Keep it while `turbo.json` remains the
`globalEnv` contract.

### jscpd: no application duplication

TSX duplication is 0.10% (13 lines). TypeScript is 0.41%. The only clones are in the catalog seed
scripts and one repeated helper in `tests/design/contracts.spec.ts`. No action.

### oxlint jsx-a11y: not enabled

Adding `"jsx-a11y"` to the plugin list and `react/rules-of-hooks` as an error produces 18 warnings
across this codebase. Sixteen come from wrapper components (`Button` with a `render` prop, the
generic `Label`, `role="status"` live regions) and are false positives. The two real findings were
`control-has-associated-label` on account order links and `no-static-element-interactions` on the
agent scroll container. Neither is on the storefront critical path.

Enabling the plugin would add permanent noise to `pnpm lint` without a reliable signal. axe on the
rendered page is the better source of truth here. Revisit if oxlint learns to see through wrapper
components.

### Performance

Lighthouse on the PDP: performance 0.72, accessibility 1.00, best practices 1.00, SEO 1.00.
Unlighthouse on four routes took 38 s at 8-core concurrency. The server is not the bottleneck;
image optimizer cold starts and third-party scripts dominate. See `docs/PERFORMANCE-AUDIT.md` and
`docs/PDP-HYDRATION-AND-LOADING.md` for the route-level numbers.

## Not adopted

Verified as archived, frozen, stale, or non-OSI:

| Tool                             | Why not                                              |
| -------------------------------- | ---------------------------------------------------- |
| Lost Pixel                       | Archived 2026-04                                     |
| Happo                            | Repo frozen; hosted service required                 |
| Storybook test-runner            | Archived; replaced by the Vitest addon               |
| ts-prune / depcheck / unimported | Stale or archived; Knip supersedes                   |
| Million Lint                     | `@million/lint` is UNLICENSED and deprecated         |
| eslint-plugin-tailwindcss        | Tailwind v4 support still partial                    |
| React Doctor                     | Modified MIT (no AI-training use), not OSI           |
| Chromatic / Percy                | OSS CLI, proprietary service                         |
| Deque axe MCP                    | Proprietary subscription                             |
| Skyvern                          | AGPL and built for form workflows, not design review |
| Magnitude / web-eval-agent       | Dormant or archived                                  |

## Agentic review

Off-the-shelf "walk the site and tell me what is inconsistent" is not production-ready. The
reliable shape is deterministic measurement followed by model adjudication against a rubric:

```ts
type Finding = {
  id: string; // hash(rule + selector + viewport) so runs are diffable
  kind: "measured" | "judged";
  rule: string; // contrast | off-grid-spacing | hover-missing | ...
  route: string;
  viewport: 390 | 768 | 1440;
  selector: string;
  measured?: number;
  expected?: number;
  severity: "blocker" | "major" | "minor";
  evidence: string; // screenshot path
};
```

If the judged layer becomes necessary, **Midscene.js** (MIT, ~15.5k stars) is the only maintained
OSS project with visual assertions (`aiAssert`), multi-breakpoint runs, and JSON/Markdown reports.
Pair it with **Chrome DevTools MCP** for evidence collection. Budget for one screenshot per route
per breakpoint, cache by DOM hash, and never let a model finding omit a selector or measured value.

## Cadence

| When                            | Run                                               |
| ------------------------------- | ------------------------------------------------- |
| Every change                    | `pnpm lint`, `pnpm typecheck`, `pnpm test:design` |
| Any PDP, cart, or browse UI     | axe over the audited routes                       |
| Monthly                         | Knip, jscpd                                       |
| Performance work                | Lighthouse, `next analyze`                        |
| Before launch or a crawl change | SiteOne Crawler, Unlighthouse                     |

## If we want a permanent gate

The smallest useful addition is one dev dependency and one test:

1. Add `@axe-core/playwright`.
2. In `tests/design/a11y.spec.ts`, loop the audited routes at both viewports and fail on
   `serious` or `critical` violations.

The next step after that is visual baselines: **Argos** (MIT CLI, hosted review) or **Vizzly**
(local review server). Both need one canonical PDP and collection snapshot with prices and product
names masked. Do not adopt pixel baselines before the deterministic checks are clean.
