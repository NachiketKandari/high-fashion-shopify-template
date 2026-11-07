# High-Fashion Shopify Template

A high-fashion Shopify storefront template built on Vercel Shop with Shopify, Next.js and Eve. The
storefront brand is Lorem Ipsum.

## Reference

The design system and reference measurements were derived from a live high-fashion storefront;
reference notes retain source URLs and measured reference labels for provenance. The reference
photography and press imagery are not licensed for redistribution.

- **Shopify owns commerce.** Catalog, cart, checkout, customer accounts, predictive search, and policies come from Shopify through the framework-agnostic Hydrogen SDK (not the Hydrogen React Router framework).
- **Next.js owns the app.** Routing, Server Components, caching and invalidation, metadata, and the storefront's machine-readable surface for answer engines: Markdown representations, `/llms.txt`, structured data, and the sitemap.
- **Eve owns the agent.** Shop Agent's sessions, channels, tools, and instructions; its tools call Shopify directly.

Product titles, vendor, pages, and policies come from Shopify. Navigation and footer links are
code-owned in `lib/nav/index.ts`. Update commerce content in Shopify admin, or reseed a fresh store
with `pnpm import:catalog` and `pnpm seed:content`.

See [vercel.shop](https://vercel.shop) for full documentation.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fshop&project-name=high-fashion-shopify-template&repository-name=high-fashion-shopify-template&demo-title=High-Fashion+Shopify+Template&demo-url=https%3A%2F%2Fshop-template.vercel.app&env=NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN%2CNEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN%2CNEXT_PUBLIC_SHOPIFY_SHOP_ID%2CCUSTOMER_ACCOUNT_SESSION_SECRET%2CSHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID%2CSHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET&envDescription=Required%20Shopify%20store%20values%20and%20the%20Customer%20Account%20API%20credentials%20used%20by%20the%20default%20configuration&envLink=https%3A%2F%2Fvercel.shop%2Fdocs%2Freference%2Fenv-vars)

Vercel prompts for the three Shopify values and the three Customer Account API values. Auth is
enabled by default; if you disable `shopConfig.auth.isEnabled`, the three account values are no
longer required.

## Getting Started

1. Create a new project with pnpm 12 and Node.js 26:

```sh
pnpm create next-app@latest my-store --example https://github.com/vercel/shop
```

The project includes the Shop skills for your agent in `.agents/skills/`.

2. In Shopify admin, create a storefront token in **Settings → Apps and sales channels → Headless**, enable the required Storefront API permissions, then add your Shopify credentials:

```sh
cp .env.example .env.local
```

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
NEXT_PUBLIC_SHOPIFY_SHOP_ID=123456789

CUSTOMER_ACCOUNT_SESSION_SECRET=your-generated-session-secret
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=your-client-secret
```

The last three are required while `shopConfig.auth.isEnabled` is `true`, which is the default in
this repository. Generate the session secret yourself; it is not the Shopify client secret. Customer
Account OAuth requires an HTTPS origin, so local sign-in runs through `pnpm dev:portless` or a
tunnel. Set `shopConfig.auth.isEnabled` to `false` to run without accounts.

3. Start the development server:

```sh
pnpm dev
```

For local HTTPS, install [Portless](https://portless.sh) globally with `pnpm add -g portless`, then run `pnpm dev:portless`.

See [vercel.shop/docs/getting-started](https://vercel.shop/docs/getting-started) for the full setup guide and [Storefront API Permissions](https://vercel.shop/docs/reference/storefront-api-permissions) for the complete scope reference.

## Features

Shopify

- Product, collection, search, blog, page, and policy content from the Storefront API with typed GraphQL
- Optimistic cart with Hydrogen forms, shared cart state, and server handlers
- Customer accounts through the Customer Account API, enabled by default
- Shopify analytics, consent, and WebMCP tool registration, opt-in

Next.js

- Next.js 16 App Router, React 19, React Compiler, Tailwind CSS 4, shadcn/ui
- Partial prerendering with tagged caches invalidated by Shopify webhooks
- Markdown representations, `/llms.txt`, Schema.org data, sitemap, and robots for answer engines
- Single-locale storefront by default; skills add next-intl and Shopify Markets

Eve

- Shop Agent for product discovery, store questions, and cart updates in a side drawer, opt-in
- Shopify catalog and policy MCP tools called by authored Eve tools, plus Hydrogen cart handlers

Customer authentication runs through Shopify's Customer Account API and is enabled by default. Add the Headless sales channel's client ID and secret plus a generated session secret to the environment, and register the callback and logout URLs before deploying; see the [authentication guide](https://vercel.shop/docs/anatomy/authentication).

Shop Agent is disabled by default. Set `shopConfig.agent.isEnabled` to `true` in
`lib/config/index.ts`, set `shopConfig.botid.isEnabled` for bot protection, and follow the
[Shop Agent guide](https://vercel.shop/docs/anatomy/agent) to configure AI Gateway access, Firewall
rate limits, spending controls, and privacy review before enabling public chat.

## Skills

Shop skills guide agents through storefront setup and common commerce patterns. They ship in `.agents/skills/`, and Claude Code reads them through the `.claude/skills` symlink. To add them to an existing storefront, run this from its root:

```sh
pnpm dlx skills add vercel/shop --skill '*' --yes
```

Use the plain skill names below. Shopify AI Toolkit is separate external tooling for authoritative Shopify documentation, API schemas, and operation validation; the Shop skills do not include it. If it is unavailable, use official Shopify documentation and validation tooling.

| Skill                       | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| `init-vercel-shop`          | Scaffold a storefront and configure Shopify credentials                     |
| `build-shop`                | Build or adapt storefront routes with Vercel Shop patterns                  |
| `shopify-graphql-reference` | Add Shopify-validated GraphQL operations in the template's layout           |
| `enable-analytics`          | Add Vercel Analytics, Speed Insights, and Google Tag Manager                |
| `enable-i18n`               | Locale-prefixed URL routing + next-intl message catalogs (no Markets)       |
| `enable-shopify-markets`    | Multi-locale support with Shopify Markets and next-intl                     |
| `enable-shopify-menus`      | Replace hardcoded nav/footer links with Shopify-managed menus               |
| `update-shop`               | Keep a storefront current with template changes                             |
| `ux-explorer`               | Explore a storefront with Playwright and write an evidence-backed UX report |

## Design system checks

`app/globals.css` is the canonical token layer. `pnpm lint` includes a static drift gate, and the
Playwright contracts exercise computed type, geometry, targets, keyboard behaviour, reduced motion
and the main commerce flows:

```sh
pnpm lint             # oxlint, formatting and scripts/check-design.mjs
pnpm test:design      # computed-style, ARIA, motion and flow contracts
pnpm audit:reference  # with the template running, measure it and the reference storefront
```

`pnpm exec playwright install chromium` installs the browser once. The reference audit uses fresh
contexts and writes screenshots to `.playwright/compare/`.

## Documentation

Full documentation is available at [vercel.shop](https://vercel.shop).

Project-specific runbooks:

- [`docs/FRONTEND-ARCHITECTURE.md`](./docs/FRONTEND-ARCHITECTURE.md) — the full frontend map: routes, components, data flow, caching, configuration, owners and pending work.
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — the canonical template tokens, layout, brand, component, motion and accessibility system.
- [`docs/DESIGN-SYSTEM-ENFORCEMENT.md`](./docs/DESIGN-SYSTEM-ENFORCEMENT.md) — the token, lint, computed-contract and governance system that keeps the storefront on-system.
- [`docs/DESIGN-SYSTEM-AUDIT.md`](./docs/DESIGN-SYSTEM-AUDIT.md) — the historical gap analysis, migration record and current exceptions.
- [`docs/reference/PLAYWRIGHT-COMPARISON.md`](./docs/reference/PLAYWRIGHT-COMPARISON.md) — the latest reference-versus-template measurement.
- [`docs/UX-RECON-2026-11-05.md`](./docs/UX-RECON-2026-11-05.md) — the first-time-shopper UX reconnaissance.
- [`docs/SHOPIFY-WALKTHROUGH.md`](./docs/SHOPIFY-WALKTHROUGH.md) — the Shopify, Next.js and Eve stack map.
- [`docs/HYDROGEN-USAGE.md`](./docs/HYDROGEN-USAGE.md) — the Hydrogen SDK surface in use, and what is deliberately app-owned.
- [`docs/OBSERVABILITY.md`](./docs/OBSERVABILITY.md) — logging, analytics, error reporting, health checks and the current gaps.
- [`docs/IMPLEMENTATION.md`](./docs/IMPLEMENTATION.md) — what the template implements and what remains.
- [`docs/CATALOG-IMPORT.md`](./docs/CATALOG-IMPORT.md) — catalog import result, verification and remaining gaps.
- [`docs/CONTENT.md`](./docs/CONTENT.md) — content ownership, Shopify seeding and invalidation rules.
- [`docs/SHOPIFY-APP-SCOPES.md`](./docs/SHOPIFY-APP-SCOPES.md) — the seeding app's Admin API scopes and how to change them.
- [`docs/SHIPROCKET.md`](./docs/SHIPROCKET.md) — shipping and fulfilment integration options.
- [`docs/VERCEL-DEPLOYMENT.md`](./docs/VERCEL-DEPLOYMENT.md) — production deployment, environment and webhook runbook.
- [`docs/reference/DESIGN.md`](./docs/reference/DESIGN.md) — the measured design reference.

## License

MIT
