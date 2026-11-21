---
name: design-audit
description: Audit the storefront's rendered and coded design for design-system compliance, visual consistency, responsive behavior, interaction states, motion, and accessibility. Use when reviewing UI, a route, a component's styling, or before launch.
license: MIT
---

# Design audit

The design system is the contract. A finding is a measured or inferred deviation from a token, a
primitive, a documented pattern, or a Web Interface Guideline, not a matter of taste. Audit both the
code and the rendered result.

## Ground the audit

1. Read `AGENTS.md` (Design system), `docs/DESIGN-SYSTEM.md`,
   `docs/DESIGN-SYSTEM-ENFORCEMENT.md`, and `app/globals.css` with
   `design/tokens.manifest.json`. Read `docs/DESIGN-I-PDP.md` when the PDP is in scope. When
   `docs/DESIGN-SYSTEM.md` disagrees with the stylesheet or the manifest, the manifest is current;
   report the document drift instead of following the stale document.
2. Read `docs/FRONTEND-REVIEW-AUTOMATION.md` for the checks that already run.
3. Establish the ref with `git status --short` and `git rev-parse HEAD`.
4. Run the existing checks; do not add tests, dependencies, or scripts:
   `pnpm lint` (includes the static drift gate), `pnpm typecheck`, and `pnpm test:design`.
   `pnpm audit:reference` writes the live-reference comparison when the reference is the question.
5. Read `references/web-interface-guidelines.md` before reviewing UI code.

## The repository contract

`app/globals.css` is the only token source. A component uses a named token, a role utility, or a
scale utility. Raw values are defects.

- **Type.** Use `type-*` role utilities (`type-display-lg`, `type-h2`, `type-body`, `type-label`,
  `type-control`, `type-chip`, `type-tab`, `type-nav`, …). Never use raw `text-[…]`, `leading-[…]`,
  `font-medium`/`semibold`/`bold`, or a heading size utility. Each role sets size, line height,
  weight, tracking, and case together.
- **Breakpoints.** Use `tablet:` (750px), `desktop:` (1100px), and `wide:` (1440px). Never `sm:`,
  `md:`, `lg:`, or `xl:`.
- **Spacing.** Use the scale and the layout tokens `--gutter`, `--page-top`, `--section-gap`,
  `--grid-gap`, and `--grid-row-gap`. `Container` owns horizontal padding and max width; `Page` owns
  top padding; `Sections` owns the gap between sibling sections. Do not put `py-*` on `Container`, a
  bottom padding on `Page`, or outer margins on section children.
- **Radius.** Rectangular controls and surfaces are zero radius. `rounded-full` is reserved for
  counts, colour dots, and gallery indicators.
- **Shadow.** `shadow-modal` is the only template shadow. Every other shadow is a defect.
- **Colour.** The shopping surface is monochrome. The Shop mark colour belongs to the Shop Pay
  button only. Status colour is limited to form errors.
- **Images.** Use `next/image` with reserved dimensions and `sizes="100vw"`, including thumbnails.
  Preload only the LCP image; keep grids lazy below the first row. Do not tune `sizes` or add widths.
- **Links.** Use `@/components/ui/link`, never `next/link`.
- **Motion.** Use `--motion-*` tokens and `--ease-standard`. Animate transform and opacity. Honor
  `prefers-reduced-motion`. Never `transition: all`.
- **Focus and targets.** Use the `focus-ring`, `focus-underline`, or `focus-none` utility. Never
  remove an outline without an equivalent visible focus treatment. Interactive targets are at least
  36px.
- **Copy.** Copy is inline and server-first. Sentence case in source is normal even when the type
  role renders uppercase.

When a repository rule conflicts with the generic guidelines, the repository rule wins. Record the
override in the report instead of flagging the repository.

## Measure ratios, not pixel parity

Computed pixels are evidence, not a target. Record them to verify a documented ratio, token, or
accessibility target; do not file a finding because a value differs from a reference screenshot.

- **Ratios that matter:** media aspect (browse cards 3:4 mobile and 4:5 desktop; gallery 2:3),
  grid columns and gutters, type scale and line-height relationships, control proportions, and the
  spacing rhythm.
- **Target size is not type size.** The 36px floor is a hit-area contract. Meet it with padding or
  a row primitive while keeping the type role unchanged; do not enlarge the text or hardcode a
  pixel width.
- **Tokens over values.** Recommend the named token, role utility, or scale step. A fix that
  replaces one arbitrary pixel value with another is not a fix.
- **Breakage over difference.** Clipping, overflow, overlap, or an unreachable action is a defect.
  A proportional difference inside the documented ratio is not.

## Static scan

Run `pnpm lint` first. Then look for drift the gate does not catch:

- bare `rounded`, directional radius utilities, bare or arbitrary shadow, `drop-shadow`;
- `text-xs`–`text-xl`, `font-light`, arbitrary tracking, arbitrary layout pixels;
- Tailwind Typography overrides (`prose-headings:*`, `prose-p:*`, `prose-li:*`) that bypass the type
  roles or reintroduce a non-token palette;
- `outline-none` without a `focus-visible` replacement;
- opacity modifiers that hard-code a colour instead of using a token;
- default Tailwind palette namespaces;
- `transition-all`, layout-property animation, and missing reduced-motion handling;
- images without dimensions, `sizes`, or `alt`;
- interactive `<div>`/`<span>` elements, missing labels, and missing keyboard handlers;
- hardcoded currency, date, or number formatting instead of `Intl.*`;
- long or user-generated text without truncation, `line-clamp-*`, or `break-words`.

## Rendered audit

Start the storefront with `pnpm dev` and use the Playwright MCP browser tools. If a server is
already running, reuse it. Do not place orders, pay, or submit personal data.

Measure at 1440 × 1000, 768 × 1024, and 390 × 844:

- `getComputedStyle` for font size, line height, weight, tracking, colour, radius, shadow,
  transition duration, and timing function;
- `getBoundingClientRect` for gutters, header, grid columns, card and media ratios, drawer and modal
  geometry, and target sizes;
- `document.documentElement.scrollWidth` versus `innerWidth` for horizontal overflow;
- focus order, visible focus, Escape behavior, and focus return;
- `emulateMedia({ reducedMotion: "reduce" })` for authored motion;
- console errors and failed requests.

Cover the shell and the commerce paths: home, navigation and mega menu, collection chips/filters/
sort, product card hover and quick shop, PDP gallery/options/tabs/size guide, cart drawer and empty
cart, search, newsletter, mobile menu, footer, and account/login when enabled. Use the route list in
`docs/PAGE-INVENTORY.md` for the full surface.

For each route, check the states a shopper sees: default, hover, focus, active, disabled, loading,
empty, error, and long content. A state that has no visual treatment is a finding.

## What not to flag

These are deliberate repository decisions:

- zero radius, no accent colour, monochrome imagery, uppercase display type;
- `sizes="100vw"` on every image, including thumbnails;
- INR-only prices and `en-IN` formatting;
- no dark mode, no next-intl, no i18n routing in the default storefront;
- no virtualization on the default collection grid unless a real route renders an unbounded list;
- the existing localhost caveat for `/account/login`, which needs HTTPS for Customer Account OAuth.

## Findings

Use four severities:

- **Critical** — the shopper cannot complete a primary task, or the layout breaks at a supported
  viewport.
- **Major** — a visible contract violation across a surface or a state.
- **Minor** — a local deviation with a workaround.
- **Nit** — a preference that does not affect comprehension or task completion.

Write each finding as:

```text
[severity] file:line — rule or token — measured evidence. Fix. Owner.
```

Rules:

- Cite the rendered measurement or the exact class/token. A screenshot alone is not evidence.
- Separate measured facts from judgment calls. Label the judged ones.
- Do not re-report an issue already recorded as fixed in `docs/DESIGN-SYSTEM-AUDIT.md`,
  `docs/UI-UX-CONSISTENCY-AUDIT.md`, or `docs/FRONTEND-REVIEW-AUTOMATION.md` unless it regressed.
- Zero findings is valid. Do not invent findings to fill a report.
- Do not make code changes in an audit. Finish and present the report first.

## Report

Write `docs/DESIGN-AUDIT-<YYYY-MM-DD>.md` with:

1. environment, commit, routes, viewports, and commands run;
2. a one-paragraph health summary;
3. measured findings ordered by severity, with screenshots named
   `.playwright-mcp/design-audit-<route>-<viewport>.png`;
4. a "verified passes" list with the measurement that proves each one;
5. design-system drift versus product decisions versus defects;
6. the three highest-leverage next fixes, each mapped to a token or component owner;
7. what was not verified.
