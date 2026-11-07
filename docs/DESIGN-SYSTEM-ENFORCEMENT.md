# Design system enforcement in 2026

**Scope.** Keeping a Next.js 16 + Tailwind CSS 4 + TypeScript storefront on-system without buying a
design-system platform.

**Short version.** Three layers: **tokens as data**, **components as the only styling API**, and **CI as a
ratchet**. Static rules catch values; visual/computed-style tests catch behavior; governance decides what may
change. No leading system relies on documentation alone.

## 0. Implemented in this repo

| Layer                          | Artifact                                                           | Command                                 |
| ------------------------------ | ------------------------------------------------------------------ | --------------------------------------- |
| Token contract                 | `design/tokens.manifest.json`, `app/globals.css`                   | `pnpm lint:design`                      |
| Static drift gate              | `scripts/check-design.mjs`, `design/drift-baseline.json`           | `pnpm lint`                             |
| Computed/ARIA/motion contracts | `tests/design/tokens.spec.ts`, `contracts.spec.ts`, `a11y.spec.ts` | `pnpm test:design`                      |
| Runtime flows                  | `tests/design/flows.spec.ts`                                       | `pnpm test:design`                      |
| Reference comparison           | `scripts/compare-reference.mjs`                                    | `pnpm audit:reference`                  |
| Browser runner                 | `playwright.config.ts`                                             | `pnpm exec playwright install chromium` |

The gate scans `app/**/*.{ts,tsx}` and `components/**/*.{ts,tsx}`, not `lib/`, `agent/`, `tests/` or
`scripts/`. It asserts the manifest's exact colour values; type size and line height (not weight,
tracking or case); six base spacing tokens and three desktop spacing overrides (matched anywhere in
the stylesheet, not inside the media query); motion and breakpoint values. It rejects the named
`rounded-xs`–`rounded-4xl` and `shadow-xs`–`shadow-2xl` utilities,
`font-medium`/`semibold`/`bold`, `text-2xl`–`text-7xl`, arbitrary text/leading/radius, `dark:`,
`sm:`/`md:`/`lg:`/`xl:` (not `2xl:`), `text-3xs`, `text-2xs`, `text-xxs`, `text-13`, `font-mono`, the
named spectral palette classes, raw hex `bg`/`text`/`border` classes, `next/link` outside
`components/ui/link.tsx`, and the UI import list in §3. It does not catch bare `rounded`, directional
radius utilities, bare or arbitrary shadow, `drop-shadow`, `text-xs`–`text-xl`, `font-light`,
arbitrary tracking or layout pixels, `outline-none`, opacity modifiers, or the default Tailwind
palette namespaces. Alias usage is ratcheted against `design/drift-baseline.json`: it can fall, not
grow. `pnpm lint` runs the gate, so the normal review path cannot skip it. Exceptions match file,
rule and an optional `expires`; owner, reason and scope are documentation, not validated, and an
expired entry fails.

`app/globals.css` keeps the default palette, radius and shadow namespaces; `@theme inline` aliases do
not emit `:root` variables, so runtime values live in `:root`. The Playwright suite is a contract
sample, not full-surface coverage: it covers shell geometry, collection and PDP contracts, a
six-route target sweep, search-dialog ARIA and focus, announcement and transition reduced motion, and
five flows. Search results and empty state, the contact drawer, lightbox, quick shop, gift card,
bundles, selling plans, the discount form, wishlist, account, agent, blog, policies, error pages,
currency conversion, free-shipping copy, footer marks, tablet widths, screenshots, focus traps and
computed radius/shadow are not covered.

## 1. The 2026 baseline

- DTCG **2025.10** is the first stable token format (28 Oct 2025): `$value`, `$type`, `$description`, aliases,
  `$extensions`, and `$deprecated`. Style Dictionary, Tokens Studio, and Terrazzo are reference implementations. [1]
- Tailwind 4 is CSS-first: `@theme` tokens become utilities and CSS variables; `@theme inline`
  substitutes a variable reference without emitting its own `:root` variable; `:root` holds runtime
  values; `--*: initial` removes a default namespace. [3]
- Linting is split by file type. Stylelint sees CSS, not Tailwind classes in TSX. Class-string policy needs a
  JS/TS linter; Oxlint now runs ESLint-compatible JS plugins (alpha) with per-path `overrides`. [10][11]
- Visual/a11y testing is commodity: Playwright screenshots, computed styles, and axe; Storybook + Chromatic
  for component review. [13][14][15] Drift is not one failure: token, variant, pattern, docs, and behavioral
  drift diverge differently—only ~40% of teams automate a token pipeline and ~8% call their system "very stable". [22]

## 2. Token source of truth

| Pattern                                                 | Best for                                                  | Cost                                  |
| ------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| **CSS-first** — `@theme` + `:root` in `app/globals.css` | One app, one platform, no Figma write-back                | Cheapest; tokens are not portable     |
| **DTCG JSON → Style Dictionary → CSS/TS**               | Figma variables, multiple consumers, native apps later    | Build step, generated-file discipline |
| **Tokens Studio → Git → PR → build**                    | Designers edit in Figma; code repo is the source of truth | Two-way sync conflicts, Git literacy  |

Style Dictionary 4 has first-class DTCG support; v5's full 2025.10 support is still in progress. [2] Tokens
Studio exports DTCG and syncs two-way with GitHub; its docs say tokens in code are the source of truth. [4]

**For this repo:** keep `app/globals.css` canonical for the MVP. Keep `design/tokens.manifest.json`
beside it as the script's expected values, and add `lib/design/tokens.ts` when scripts and types need
shared token names. Move to DTCG + Style Dictionary only when Figma write-back or a second consumer
appears. Never run both sources.

**Rules that prevent drift**

1. **One owner, one file.** Generated CSS is committed and never hand-edited.
2. **Two tiers.** Reference values (`--color-neutral-0`) and semantic roles (`--color-paper`, `--color-ink`,
   `--color-rule`, `--color-error`). Component variants belong in CVA, not new CSS variables. This repo has
   two vocabularies (`background/foreground` and `paper/ink`); make `paper/ink` canonical and keep old names
   as documented aliases until migrated.
3. **`@theme inline` is only an alias layer.** Keep runtime values in `:root`; reference the underlying variable
   outside utilities. Use `@theme static` if all CSS variables must be emitted. [3]
4. **Remove the default palette.** `@theme { --color-*: initial; ... }` makes `bg-red-500` generate no CSS; the
   lint rule explains why it is wrong instead of silently rendering nothing.
5. **Generate, then diff.** When the DTCG build lands, `pnpm tokens:build && git diff --exit-code
   app/tokens.generated.css lib/design/tokens.ts` fails when a token changes without regeneration.
6. **Lint the token layer.** `$type` required, kebab-case names, aliases resolve, no circular refs, no orphans,
   no duplicate values without a reason, no new use of `$deprecated`.
7. **Deprecate in data.** DTCG `$deprecated` carries a string reason; `design/deprecated-tokens.json` carries
   the replacement and removal release. [1]
8. **Check contrast and sync via PR.** Validate every semantic foreground/background pair; never let a Figma
   plugin push to `main`, because a designer's change is reviewed like code. [1]

## 3. Static enforcement

Only `check-design.mjs` enforces class strings in this repo today; the Stylelint, Oxlint and Tailwind
namespace-removal rows below are the target stack.

| Layer             | Mechanism                                                                 | Concrete rule                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CSS               | Stylelint 16/17 + v4 syntax config + `stylelint-declaration-strict-value` | No raw hex/rgb outside `@theme`/`:root`; no arbitrary values; no `@apply` outside `globals.css`                                                                                            |
| TSX class strings | Oxlint + `@evilmartians/design-lint` (or `check-design.mjs`)              | No spectral/raw colors, undefined tokens, arbitrary type/radius, `dark:`, opacity modifiers                                                                                                |
| Banned utilities  | Tailwind namespace removal + lint                                         | `bg-red-*`, `rounded-lg`, `shadow-*`, `font-medium`, `text-[13px]`, `tracking-wider`, `xl:`                                                                                                |
| Imports           | `check-design.mjs`; Oxlint overrides when added                           | `components/ui` cannot import `@/lib/shopify`, `@/lib/cart`, `@/lib/product`, `@/lib/collections`, `next/navigation`, `next/headers` or `next/cache`; the `lib/shopify` side is unenforced |
| TypeScript        | CVA + primitive props + Base UI `useRender`                               | `VariantProps` unions, `data-slot`, no domain types in `components/ui`, no color/type overrides via `className`                                                                            |
| Scripts           | `check-design.mjs`; future `check-tokens` and report                      | Baseline ratchet, exceptions with expiry; generated-file diff when the token build lands                                                                                                   |

**Stylelint** is right for `app/globals.css` and future CSS modules. Use
`@dreamsicle.io/stylelint-config-tailwindcss` so v4 directives parse, then `stylelint-declaration-strict-value`
to require `var(--token)` for color, spacing, and z-index; it cannot see `className="bg-red-500"` in TSX. [10]
`eslint-plugin-tailwindcss` is mainly class ordering/validity, not token policy, and its v4 support historically
lagged; prefer a Tailwind-aware Oxlint plugin or the custom scan. [23]

**`@evilmartians/design-lint`** is the most directly useful 2026 tool: it reads the same Tailwind token
stylesheet as the build and ships `no-raw-color`, `no-spectral-color`, `no-undefined-token`, `no-style-color`,
`no-arbitrary-typography`, `no-arbitrary-radius`, `no-component-color-override`, `no-dark-variant`,
`no-opacity-modifier`, and `token-constraints`. It has `basic`/`strict` presets, and `report` shows disabled rules
and suppressed violations. [12] It needs `oxlint.config.ts`; merge `.oxlintrc.json` as a base, not through
`extends` (relative `jsPlugins` paths are rejected there). [12]

**Oxlint custom rules.** JS plugins are alpha but ESLint v9-compatible: `jsPlugins` + a rule name in
`oxlint.config.ts`; the API supports AST traversal, fixes, suggestions, and inline disables. [11] Type-aware
JS-plugin rules are not supported yet, so keep token/boundary rules syntactic; pin Oxlint because the plugin API
is explicitly outside semver.

**Banned utilities, first ten (target policy).** Raw hex (`bg-[#fff]`), spectral colors (`bg-red-500`), arbitrary type
(`text-[13px]`, `leading-[23px]`), arbitrary radius (`rounded-[6px]`), `font-medium`/`semibold`/`bold`,
`shadow-*` except the modal, `rounded-*` except `rounded-full` on counts/dots, `dark:*`, `xl:`/`lg:` for the
desktop breakpoint (use `desktop:`), and `outline-none` without a `focus-visible` replacement.

**Import boundaries.** `scripts/check-design.mjs` enforces the UI side only: `components/ui/**` may not
import `@/lib/shopify`, `@/lib/cart`, `@/lib/product`, `@/lib/collections`, `next/navigation`,
`next/headers` or `next/cache`. The `lib/shopify/**` side — no `next/cache`, `@/components/*`,
`@/app/*` — is not enforced yet; add it through `.oxlintrc.json` overrides, which support both
`overrides` and `no-restricted-imports`. [11]

**TypeScript/primitive API.** `components/ui/button.tsx` already shows the pattern: `cva` + `VariantProps` +
Base UI `useRender` + `mergeProps`. [17][18] Keep it. Add `data-slot`, use `cn()` for merges, and type visual
props as closed unions (`variant`, `size`, `tone`). Do not add a second polymorphic mechanism (`as` prop) beside
`render`. For `components/ui`, make `className` layout-only: type it narrowly or let `design-lint`'s
`no-component-color-override` catch color/type overrides. Domain wrappers supply labels and data; primitives
never import domain types (repo boundary rule 5).

## 4. Visual and interaction enforcement

| Check              | Tool                                                   | Assertion                                                                                    |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Component states   | Storybook + Chromatic                                  | Every variant/state has a story; cloud snapshots across browsers/viewports/themes; UI Review |
| Page regressions   | Playwright `toHaveScreenshot`                          | 3 viewports, animations disabled, dynamic regions masked, small `maxDiffPixelRatio`          |
| Computed contracts | Playwright `toHaveCSS` + `getComputedStyle`            | Heading 400, body 300, nav 13/18 400, chips 12/18 400, buttons 11/14 400, 36px targets       |
| Accessibility      | `@axe-core/playwright` or Storybook a11y addon         | No serious/critical violations; keyboard path; focus visible; labels/roles [16]              |
| Reduced motion     | Playwright `emulateMedia({ reducedMotion: "reduce" })` | No authored animation, autoplay, or smooth scroll                                            |
| Keyboard           | Playwright                                             | Tab order, Arrow/Home/End for tabs, Escape closes and returns focus, no focus removal        |

Chromatic snapshots every story in a cloud browser, diffs against a baseline, and adds a required PR check. [13]
Storybook's a11y addon uses axe-core (up to 57% of WCAG issues); set `parameters.a11y.test = "error"` and use
`"todo"` only as a visible migration list. [14] Playwright's `toHaveScreenshot` waits for two stable captures,
disables animations by default, and supports masks/thresholds; `toHaveCSS` reads computed values. [15] Contract
examples: `toHaveCSS("font-weight", "400")`, `toHaveCSS("border-radius", "0px")`,
`toHaveCSS("transition-duration", "0.3s")`; a token probe reads
`getComputedStyle(document.documentElement).getPropertyValue("--color-ink")`.

**For this repo, Playwright beats full Storybook.** RSC + Shopify data makes a complete Storybook a second app.
Use Storybook only for `components/ui` primitives; keep real-route Playwright tests for shell, product card, PDP,
collection, cart, and overlays. **Visual regression is not spec compliance:** it detects change from a baseline,
not deviation from the spec; pair it with computed contracts and the measured audit in `docs/DESIGN-SYSTEM-AUDIT.md`. [22]

## 5. Process and governance

- **Owner.** Next.js presentation owns tokens, primitives, and the visual contract; Shopify owns commerce data;
  Eve owns the agent. Put `/app/globals.css`, `/components/ui/`, `/design/`, and `/tests/design/` under a
  `CODEOWNERS` entry for the design-system owner.
- **Contribution.** Split workflows by size, as Nathan Curtis argues: small fixes can be fast and autonomous;
  new tokens/primitives need a proposal, one named consumer, design review, and a release note. A contribution
  is complete only when released through the system. [21]
- **Design review.** A UI PR carries a before/after screenshot or Chromatic diff and the routes/viewports
  checked. Token/primitive PRs need the design-system owner plus one consumer owner. No screenshot, no approval.
- **Changelog, versioning, ADRs.** `docs/design-system/CHANGELOG.md` with Added/Changed/Deprecated/Removed and
  semver-style impact; use Changesets if a package is extracted. Record irreversible choices in `docs/adr/`
  (context, decision, alternatives, consequences): token source of truth, visual tool, primitive API. [19][20]
- **Deprecation.** `$deprecated` names the replacement; lint blocks new uses; keep two minor releases; ship a
  codemod; remove and note it. Atlassian's `no-deprecated-design-token-usage` is the model. [7]
- **Exceptions.** `design/exceptions.json` entries match on `file` and `rule` with an optional
  `expires`; `owner`, `reason` and `scope` are recorded for review but not validated. Expired
  exceptions fail CI; better than permanent inline disables.
- **Drift report.** Weekly (monthly with AI-generated code): token coverage, raw values, primitive bypasses,
  deprecated tokens, exceptions, visual diffs, axe violations. Baseline + fail-on-regression burns down the
  existing P0/P1 backlog without blocking all work. **CI gates:** lint, typecheck, token check, design lint,
  build, design tests; Chromatic UI Review for `components/ui` once it exists; nightly report is not a gate.

## 6. What leading systems actually do

| System              | Concrete mechanism                                                                                                                                                                                                                                                    | Lesson                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Shopify Polaris** | `@shopify/polaris-tokens` exposes CSS variables (`--p-*`) and metadata; `@shopify/stylelint-polaris` enforces token adoption/coverage; Polaris web components' CSS cannot be overridden. [6]                                                                          | Constrain the styling surface, not just values.                                             |
| **GitHub Primer**   | DTCG JSON5 tokens built with Style Dictionary; `npm run lint:tokens` validates names; custom Stylelint rules `primer/colors`, `spacing`, `typography`, `borders`, `box-shadow`, `responsive-widths`; `eslint-plugin-primer-react`; `as`/slot APIs; Changesets. [5]    | Validate at the token source, lint each property family, design the API.                    |
| **Atlassian**       | `@atlaskit/tokens` + ESLint: `ensure-design-token-usage`, `no-deprecated-design-token-usage`, `use-tokens-space/typography/motion/shape`, `no-html-button`, `no-banned-imports`, `no-unsafe-style-overrides`; many autofix. Also Stylelint and a Storybook addon. [7] | Make the right thing the autofixable thing.                                                 |
| **Material 3**      | Reference → system → component token hierarchy; tokens are CSS custom properties scoped by selector; component tokens map to system tokens. [8]                                                                                                                       | Tiering makes intent explicit; component tokens are an escape hatch.                        |
| **Vercel Geist**    | Ten-step color scales with usage per step (`100` default background … `1000` primary text); CSS variables `--ds-*`; components ship as `@vercel/geistcn`; docs are Markdown for agents. [9]                                                                           | A small, opinionated scale plus components is enough; not every system needs a token build. |

## 7. Recommendation for this repo

**7.1 Implemented minimum viable**

1. **Token contract.** `app/globals.css` is canonical and `design/tokens.manifest.json` records the
   expected values. `scripts/check-design.mjs` checks the declarations, forbidden tokens and values.
2. **Design lint.** The same script applies the rules in §0, including `sm:`/`md:`/`lg:`/`xl:`, raw
   hex classes and the listed `components/ui` imports; it writes `design/drift-report.json`.
3. **Ratchet.** `design/drift-baseline.json` records legacy alias counts. Alias usage can fall, not grow.
4. **Boundaries.** `components/ui` may not import `@/lib/shopify`, `@/lib/cart`, `@/lib/product`,
   `@/lib/collections`, `next/navigation`, `next/headers` or `next/cache`; `next/link` is restricted
   to `components/ui/link.tsx`. The `lib/shopify` side is not enforced yet.
5. **Contracts.** `tests/design/{tokens,contracts,a11y,flows}.spec.ts` assert computed type, geometry,
   targets, ARIA, reduced motion, keyboard paths and the shell/commerce flows.
6. **Process.** The owner is the Next.js presentation owner. Extend the contracts with any new
   primitive or flow; record a deliberate exception in `docs/DESIGN-SYSTEM-AUDIT.md` §8 with an owner
   and reason. A CI workflow should run `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm test:design`.

**7.2 Advanced (only when it earns its keep).** DTCG `design/tokens/*.tokens.json` → Style Dictionary → generated
CSS/TS; Tokens Studio GitHub sync opens PRs; a future `pnpm tokens:build` diff gate. `oxlint.config.ts` + `design-lint`
strict + a local Oxlint plugin for repo rules. Storybook + Chromatic for `components/ui` with
`a11y.test = "error"` and required UI Review. Deprecation codemods, quarterly audit, drift dashboard.

**7.3 Files and commands**

```text
design/ tokens.manifest.json drift-baseline.json
scripts/ check-design.mjs compare-reference.mjs
tests/design/ tokens.spec.ts contracts.spec.ts a11y.spec.ts flows.spec.ts
playwright.config.ts
```

`pnpm lint` runs `lint:design`; `pnpm test:design` runs Playwright; `pnpm audit:reference` writes the
reference-versus-template report. `playwright.config.ts` reuses an existing server, or starts `npm run dev`.

**7.4 CI pipeline**

```sh
# One required "verify" job.
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm test:design
# optional once Storybook exists: pnpm chromatic --exit-zero-on-changes
```

Make `verify` required. Add a `chromatic` job only when Storybook lands; require it for `components/ui` PRs.
A nightly `pnpm audit:reference` can publish the comparison as an artifact without blocking work. Schedule `pnpm lint:design` nightly and commit `design/drift-report.json` weekly so drift stays
visible when no one changes the system.

**7.5 Rollout order.** Freeze the token vocabulary and remove duplicate colour names (aliases, then codemod).
Add checks in warn mode + baseline; fix P0 items (heading weights, focus rings, 36px targets). Make checks
blocking; add computed-style and reduced-motion contracts. Add Storybook/Chromatic only if primitives multiply.
Move to DTCG when Figma write-back or a second consumer appears. **Do not:** run Stylelint over TSX and call it
class-string enforcement; treat screenshots as a design spec; let exceptions live forever; add a second token
vocabulary; or let a Figma plugin push to `main`.

## Sources

1. [DTCG stable announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) · [format spec 2025.10](https://www.designtokens.org/TR/2025.10/format/)
2. [Style Dictionary and DTCG](https://styledictionary.com/info/dtcg/)
3. [Tailwind theme variables](https://tailwindcss.com/docs/theme)
4. [Tokens Studio token format](https://docs.tokens.studio/manage-settings/token-format) · [Git sync](https://docs.tokens.studio/token-storage/remote/sync-git-github)
5. [Primer primitives](https://github.com/primer/primitives) · [Primer Stylelint](https://github.com/primer/stylelint-config) · [Primer linting](https://primer.style/product/getting-started/react/linting/) · [polymorphic/slots](https://primer.style/product/getting-started/react/extending-components/)
6. [Polaris tokens](https://www.npmjs.com/package/@shopify/polaris-tokens) · [Stylelint Polaris](https://www.npmjs.com/package/@shopify/stylelint-polaris) · [web components styling](https://shopify.dev/docs/api/polaris/using-polaris-web-components)
7. [Atlassian ESLint plugin rules](https://atlassian.design/components/eslint-plugin-design-system/usage)
8. [Material theming and token tiers](https://material-web.dev/theming/material-theming/)
9. [Geist colors](https://vercel.com/geist/colors) · [Geist introduction](https://vercel.com/geist/introduction)
10. [Stylelint Tailwind v4 config](https://github.com/tailwindlabs/tailwindcss/discussions/19252) · [stylelint-plugin-tailwindcss](https://www.npmjs.com/package/stylelint-plugin-tailwindcss) · [declaration-strict-value](https://github.com/AndyOGo/stylelint-declaration-strict-value)
11. [Oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) · [Oxlint config/overrides](https://oxc.rs/docs/guide/usage/linter/config.html) · [no-restricted-imports](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-imports.html)
12. [Evil Martians design-lint](https://github.com/evilmartians/design-lint)
13. [Chromatic visual tests](https://www.chromatic.com/docs/visual/) · [Chromatic CI checks](https://www.chromatic.com/docs/ci)
14. [Storybook accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing)
15. [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) · [toHaveCSS](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-css) · [media emulation](https://playwright.dev/docs/emulation)
16. [axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
17. [CVA](https://cva.style/docs)
18. [Base UI useRender](https://base-ui.com/react/utils/use-render)
19. [Changesets](https://changesets.dev/)
20. [ADR](https://adr.github.io/)
21. [Nathan Curtis: contributions](https://nathanacurtis.substack.com/p/defining-design-system-contributions-eb48e00e8898) · [team models](https://medium.com/eightshapes-llc/team-models-for-scaling-a-design-system-2cf9d03be6a0)
22. [Design system drift taxonomy](https://overlayqa.com/blog/design-system-drift/) · [zeroheight Design Systems Report 2026](https://zeroheight.com/resource/design-systems-report-2026/)
23. [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss)
