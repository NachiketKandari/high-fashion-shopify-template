---
name: ux-explorer
description: Explore a live storefront or the template as a first-time shopper with Playwright, inventory popups and interactions, measure the rendered system, and write an evidence-backed UX report. Use when researching the reference storefront, comparing it with the template, or reproducing an interaction.
---

# UX Explorer

You are a first-time shopper, not a crawler. Explore the rendered experience, measure it, and leave
a report another engineer can reproduce.

## Setup

- Use the Playwright MCP browser tools: `browser_navigate`, `browser_snapshot`, `browser_click`,
  `browser_hover`, `browser_type`, `browser_press_key`, `browser_evaluate`, `browser_resize`,
  `browser_take_screenshot`, `browser_console_messages`, `browser_network_requests`.
- For repeatable measurements, run `pnpm audit:reference`; it writes
  `docs/reference/PLAYWRIGHT-COMPARISON.md` and screenshots in `.playwright/compare/`.
- For contract and flow checks, run `pnpm test:design`.
- Start each session clean. Close extra tabs, clear the site's local storage when testing a popup,
  and do not carry a cart from one journey into another.

## Browser behaviour

1. Prefer a headed browser when a human is watching. Use a fresh context for a new session.
2. Never use `force: true` to click through an overlay.
3. Never remove or restyle page elements to get past an obstruction.
4. Use normal pointer, keyboard and locator actions; hover before clicking navigation.
5. Scroll progressively; let transitions settle before judging the next state.
6. Distinguish an actual observation from an assumption in the report.

## Popup handling

Treat cookie consent, newsletter, discount, location, login and chat invitations as different
experiences. For each one record:

- when it appeared and what triggered it;
- whether a backdrop blocks the page;
- the close control, its hit area and whether Escape or an outside click dismisses it;
- whether dismissal survives a reload and how long it persists;
- whether the same popup appears on another route.

Do not dismiss every popup automatically. The decision is part of the observation.

## Journeys

Home, navigation and mega menu; collection chips, filters and sort; product card hover and quick
shop; product gallery, options, size guide and tabs; add to cart and cart drawer; search; newsletter;
mobile menu. Do not place orders, pay, or submit personal data.

## What to measure

Use `browser_evaluate` with `getComputedStyle` and `getBoundingClientRect`, not screenshots alone:

- body, heading, nav, chip, tab and button type size, weight, line height and tracking;
- header, wordmark, grid, card, drawer, modal and target geometry;
- viewport overflow (`document.documentElement.scrollWidth` versus `innerWidth`);
- transition duration and timing function on the element that animates;
- console errors and failed requests.

Capture screenshots at the moment of the observation, not only at the end. Name them
`.playwright-mcp/ux-<site>-<journey>-<viewport>.png`.

## Report

Write Markdown with:

1. environment, URLs, viewports and commit under test;
2. measured deltas, split into design-system drift, data drift and defects;
3. popup and interruption inventory;
4. interaction observations with motion values;
5. console and network findings;
6. screenshots and reproduction steps;
7. ideas worth implementing, each mapped to a design-system token or component owner.

Keep the report evidence-first. A card that looks different is not a finding until a measurement or a
recorded interaction explains why.
