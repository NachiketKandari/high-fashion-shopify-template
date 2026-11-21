---
name: frontend-code-audit
description: Audit the storefront's frontend code for correctness, architecture, accessibility, performance, and React/Next.js practice. Use when reviewing the codebase, a route, a component, a diff, or before launch.
license: MIT
---

# Frontend code audit

Audit the code that ships to the browser and the Server Components that compose it. Report evidence,
not impressions: every finding names a file, a line, an axis, a severity, and the owner who fixes it.
Stay read-only unless the user explicitly asks for fixes.

## Ground the audit

1. Read `AGENTS.md`, `docs/FRONTEND-ARCHITECTURE.md`, and the target route or component.
2. Read `docs/FRONTEND-REVIEW-AUTOMATION.md`; reuse the checks that already exist instead of
   inventing tools.
3. Establish the ref with `git status --short` and `git rev-parse HEAD`. Say whether the audit covers
   a clean checkout, uncommitted work, or a specific commit.
4. Run the project checks that already exist; do not add tests, dependencies, or scripts:
   `pnpm lint`, `pnpm typecheck`, and `pnpm test:design` when UI behavior is in scope.
5. Read `references/five-axis-review.md` and `references/react-next-best-practices.md` before
   judging. The Vercel rules are the default; the repository's boundaries override them when they
   differ.

## Audit axes

### Correctness

- Route params and handles resolve, missing data calls `notFound()`, and redirects survive edits.
- Async work starts together where independent. A route with runtime params renders a synchronous
  page that wraps async content in `Suspense` with the skeleton exported beside it. Do not introduce
  `loading.tsx`.
- Error, empty, loading, and pending states are distinguishable. A failed mutation never looks like
  an empty success.
- Server Actions parse every argument with a module-private `zod` schema, `z.strictObject` for
  objects, before any other work, and return the usual failure result when parsing fails.
- Cart writes go through Hydrogen handlers. No Server Action or public cache invalidation owns a
  cart mutation. Checkout uses the handler's confirmed URL.
- Server Components read auth and never refresh it. `requireCustomerAccessToken()` runs immediately
  before Customer Account API calls.
- Shopify HTML (`body`, `contentHtml`, `descriptionHtml`) is rendered only after the `fetch*`
  operation passes it through `sanitizeShopifyHtml`, under the documented oxlint directive.
- Content-negotiated routes set `Vary: Accept` on every representation. A shared cache must not
  store HTML for a later Markdown request.
- Product Open Graph, price, and availability tags that belong in `<head>` come from
  `generateMetadata` or a server head path, not from markup streamed into `<body>`.

### Architecture and ownership

- Commerce facts come from Shopify: price, discount, availability, currency, cart totals, customer
  identity. The frontend never recomputes them.
- Presentation uses domain models, not raw Shopify responses or hand-written Shopify types.
- `lib/` follows the domain and execution-context split: `index.ts`, `server.ts`, `request.ts`,
  `client.ts`, `action.ts`, `types.ts`. No descriptive siblings, flat root modules, or barrels.
- Shopify transports live in `lib/shopify/**/server.ts`; cached `get*` wrappers live in
  `lib/<domain>/server.ts` and own `"use cache"`, `cacheLife`, and `cacheTag`. Only the default first
  page of a collection and `/collections/all` is cached. Filtered, sorted, Load more, and search
  results call `fetch*`.
- `components/ui/` takes primitive props only. No domain types, SDK types, or content helpers.
- Copy is inline and server-first. No `t()` runtime, no next-intl in the default storefront.
- `proxy.ts` forwards Shopify agent endpoints and Hydrogen handlers; it does not reimplement them.
  Eve tools call `fetch*` and bind the cart from the browser cookie, never from model arguments.

### React and Next.js

- Prefer Server Components; push `"use client"` to the smallest leaf. Keep server-only modules out of
  client graphs.
- Eliminate waterfalls with `Promise.all`, early promise creation, and Suspense boundaries.
- Keep the client bundle small: direct imports, `next/dynamic` for heavy client leaves, third-party
  scripts deferred after hydration, no barrel imports.
- Use `React.cache()` for per-request deduplication, not module-level mutable state in RSC/SSR.
  Minimize serialized props passed to client components.
- Derive state during render instead of syncing it in effects. Use functional `setState`, lazy
  initialization, and `startTransition` for non-urgent updates.
- Select only the external-store slice a component uses. A full cart or collection subscription
  re-renders on every unrelated store change.
- Do not define components inside components. Hoist static JSX and stable defaults.
- Use `next/image` with reserved dimensions and `sizes="100vw"` for every image, including
  thumbnails. Preload only the LCP image; keep grids lazy below the first row.
- Link internally with `@/components/ui/link`, never `next/link`.

### Accessibility

- Semantic HTML first: `button`, `a`, `label`, `table`, `dialog`. ARIA only when native semantics
  cannot express the pattern.
- Every control has an accessible name. Icon-only buttons use `aria-label`. Decorative icons and
  media use `aria-hidden`.
- Visible focus for every interactive element. Never remove an outline without an equivalent
  `:focus-visible` treatment.
- Keyboard paths work: Tab order, Escape closes overlays and returns focus, arrows/Home/End work for
  tabs and composite widgets.
- Async updates use a live region. Errors are inline and focus the first invalid field.
- Headings are hierarchical. Each page has one `h1`; add a visually hidden `h2` when a grid would
  otherwise jump from `h1` to `h3`.
- Honor `prefers-reduced-motion`. Animate transform and opacity, not layout properties.
- Targets are at least 36px. Dialog and drawer focus traps, `aria-modal`, scroll lock, and
  `overscroll-behavior` are wired.

### Performance

- Check the route's LCP element, image priority, font loading, and third-party scripts.
- Look for sequential server fetches, duplicated Shopify calls, and over-fetching into client props.
- Check long lists for unnecessary rendering work and large client components for bundle cost.
- Use `pnpm exec next analyze --output` for bundle questions. Use Lighthouse or Unlighthouse only
  when performance is the task; localhost scores are directional.
- Do not tune `sizes` or add image widths. The two device sizes are intentional.

### Security and data boundaries

- No secrets in client code, `NEXT_PUBLIC_*`, logs, or rendered HTML.
- No `dangerouslySetInnerHTML` outside sanitized Shopify HTML.
- Validate untrusted input at the boundary: Server Actions, route handlers, search params, and
  webhook payloads.
- Check open redirects, auth gates, and cache keys that could mix customers or locales.
- Browser storage is versioned and validated, and never treats a persisted price, availability, or
  image URL as current commerce data.
- Treat Shopify, Customer Account, and agent responses as untrusted until transformed.

## Findings

Use four severities:

- **Critical** — data loss, security exposure, checkout/cart corruption, or a broken route.
- **Major** — user-visible failure, wrong cache/auth behavior, or an inaccessible primary flow.
- **Minor** — degraded quality with a workaround.
- **Nit** — style preference; never blocks.

Write each finding as:

```text
[severity] file:line — axis — finding. Evidence. Fix. Owner.
```

Rules:

- Cite the line and the call path that proves the issue. Drop a finding when callers, guards, or
  tests rule it out.
- Label measured facts separately from judgment calls.
- Do not re-report an issue already recorded as fixed in `docs/DESIGN-SYSTEM-AUDIT.md`,
  `docs/UI-UX-CONSISTENCY-AUDIT.md`, or `docs/FRONTEND-REVIEW-AUTOMATION.md` unless it regressed.
- Zero findings is valid. Do not invent findings to fill a report.
- Do not propose a new dependency without naming the existing stack that fails and the measured cost.
- Do not make code changes in an audit. If the user asks for fixes, finish and present the report
  first, then apply them as a separate change.

## Report

Write `docs/FRONTEND-CODE-AUDIT-<YYYY-MM-DD>.md` with:

1. scope, commit, commands run, and what was not verified;
2. a one-paragraph health summary;
3. findings ordered by severity;
4. a short "working well" list with evidence;
5. the three highest-leverage next fixes.

If the user asked for a review, stop after the report. If they asked for fixes, wait for the report
to be accepted before editing.
