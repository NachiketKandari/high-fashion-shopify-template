#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "@playwright/test";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3000";
const REFERENCE = process.env.REFERENCE_URL ?? "https://politesocietyshop.com";
const ROUTES = [
  { label: "Home", path: "/", slug: "home" },
  { label: "Collection", path: "/collections/all", slug: "collection" },
  { label: "Product", path: "/products/alma-lace-corset-top", slug: "product" },
];
const VIEWPORTS = [
  { height: 1000, label: "1440", width: 1440 },
  { height: 844, label: "390", width: 390 },
];
const OUTPUT_DIR = join(process.cwd(), ".playwright/compare");
const REPORT_PATH = join(process.cwd(), "docs/reference/PLAYWRIGHT-COMPARISON.md");

mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch();
const rows = [];

for (const site of [
  { name: "reference", url: REFERENCE },
  { name: "clone", url: CLONE },
]) {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({
        reducedMotion: "no-preference",
        viewport: { height: viewport.height, width: viewport.width },
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text().slice(0, 240));
      });
      let measurement;
      try {
        await page.goto(`${site.url}${route.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 45_000,
        });
        await page.waitForTimeout(2_000);
        measurement = await page.evaluate(() => {
          const readStyle = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const style = getComputedStyle(element);
            return {
              lineHeight: style.lineHeight,
              size: style.fontSize,
              weight: style.fontWeight,
            };
          };
          const rect = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const box = element.getBoundingClientRect();
            return {
              height: Math.round(box.height * 10) / 10,
              width: Math.round(box.width * 10) / 10,
            };
          };
          const brand = document.querySelector(
            "[data-app-header] a[data-wordmark] img, header img[alt]",
          );
          const brandRect = brand?.getBoundingClientRect();
          const root = getComputedStyle(document.documentElement);
          const card = document.querySelector("article");
          let grid = card?.parentElement;
          while (grid && getComputedStyle(grid).display !== "grid") {
            grid = grid.parentElement;
          }
          const gridStyle = grid ? getComputedStyle(grid) : null;
          return {
            body: readStyle("body"),
            brand: brandRect
              ? {
                  height: Math.round(brandRect.height * 10) / 10,
                  width: Math.round(brandRect.width * 10) / 10,
                }
              : null,
            gridColumnGap: gridStyle?.columnGap ?? null,
            gridColumns: gridStyle?.gridTemplateColumns.split(" ").length ?? null,
            gridRowGap: gridStyle?.rowGap ?? null,
            gutter: root.getPropertyValue("--gutter").trim() || null,
            h1: readStyle("main h1") ?? readStyle("h1"),
            h2: readStyle("main h2") ?? readStyle("h2"),
            header: rect("header"),
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            title: document.title,
            url: location.href,
          };
        });
        await page.screenshot({
          path: join(OUTPUT_DIR, `${site.name}-${route.slug}-${viewport.label}.png`),
        });
      } catch (error) {
        measurement = { error: error instanceof Error ? error.message : String(error) };
      }
      rows.push({
        ...measurement,
        consoleErrorCount: consoleErrors.length,
        consoleErrors: consoleErrors.slice(0, 3),
        route: route.label,
        site: site.name,
        viewport: viewport.label,
      });
      await context.close().catch(() => {});
    }
  }
}

await browser.close().catch(() => {});

const table = (viewport) => {
  const filtered = rows.filter((row) => row.viewport === viewport);
  const routes = [...new Set(filtered.map((row) => row.route))];
  return routes
    .map((route) => {
      const reference = filtered.find((row) => row.route === route && row.site === "reference");
      const clone = filtered.find((row) => row.route === route && row.site === "clone");
      const format = (value) => {
        if (value === null || value === undefined) return "—";
        if (typeof value === "object") {
          if ("size" in value) return `${value.size} / ${value.weight} / ${value.lineHeight}`;
          if ("width" in value) return `${value.width} × ${value.height}`;
        }
        return String(value);
      };
      return [
        route,
        format(reference?.h1),
        format(clone?.h1),
        format(reference?.h2),
        format(clone?.h2),
        format(reference?.brand),
        format(clone?.brand),
        reference?.gridColumns ?? "—",
        clone?.gridColumns ?? "—",
        reference?.gridColumnGap ?? "—",
        clone?.gridColumnGap ?? "—",
        reference?.gutter ?? "—",
        clone?.gutter ?? "—",
        reference?.scrollWidth ?? "—",
        clone?.scrollWidth ?? "—",
      ].join(" | ");
    })
    .join("\n");
};

const consoleRows = rows.filter((row) => row.consoleErrorCount > 0);

const report = `# Playwright reference comparison

Generated ${new Date().toISOString()} by \`scripts/compare-reference.mjs\`.

- Reference: ${REFERENCE}
- Clone: ${CLONE}
- Routes: ${ROUTES.map((route) => route.path).join(", ")}
- Viewports: ${VIEWPORTS.map((viewport) => `${viewport.width}×${viewport.height}`).join(", ")}
- Screenshots: \`.playwright/compare/\`
- Method: fresh browser context per site, viewport and route; \`getComputedStyle\`, \`getBoundingClientRect\`, viewport screenshots. No forms, orders or personal data.

Values are \`size / weight / line-height\` for type and \`width × height\` for the brand mark.

## 1440

| Route | Reference H1 | Clone H1 | Reference H2 | Clone H2 | Reference brand | Clone brand | Ref cols | Clone cols | Ref col gap | Clone col gap | Ref gutter | Clone gutter | Ref scrollWidth | Clone scrollWidth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${table("1440")
  .split("\n")
  .map((line) => `| ${line} |`)
  .join("\n")}

## 390

| Route | Reference H1 | Clone H1 | Reference H2 | Clone H2 | Reference brand | Clone brand | Ref cols | Clone cols | Ref col gap | Clone col gap | Ref gutter | Clone gutter | Ref scrollWidth | Clone scrollWidth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${table("390")
  .split("\n")
  .map((line) => `| ${line} |`)
  .join("\n")}

## Console

${consoleRows.map((row) => `- ${row.site} ${row.viewport} ${row.route}: ${row.consoleErrorCount} error(s) — ${row.consoleErrors.join(" | ")}`).join("\n") || "- No console errors captured."}

## Notes

- The reference geo-localizes currency and may show a newsletter after five seconds. Measurements are taken before that delay.
- Differences in product data, default sort and available collections are data drift, not visual-system drift.
- The clone exposes \`--gutter\`; the reference does not, so its gutter is \`—\`.
`;

writeFileSync(REPORT_PATH, report);
console.log(`Wrote ${REPORT_PATH}`);
console.log(`Wrote ${OUTPUT_DIR}`);
