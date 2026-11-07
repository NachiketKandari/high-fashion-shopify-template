import { expect, test } from "@playwright/test";

test.describe("storefront contracts", () => {
  test("homepage type and product card hierarchy", async ({ page }) => {
    await page.goto("/");
    const styles = await page.evaluate(() => {
      const read = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return {
          lineHeight: style.lineHeight,
          size: style.fontSize,
          weight: style.fontWeight,
        };
      };
      return {
        h2: read("main h2"),
      };
    });
    expect(styles.h2).toEqual({ lineHeight: "23px", size: "18px", weight: "400" });
  });

  test("collection grid, typography and mobile containment", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/collections/all");
    await page.waitForFunction(() => {
      const card = document.querySelector('[data-slot="product-card"]');
      const grid = card?.parentElement;
      return grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length === 4 : false;
    });
    const desktop = await page.evaluate(() => {
      const card = document.querySelector('[data-slot="product-card"]');
      const grid = card?.parentElement;
      const heading = document.querySelector("main h1");
      const style = heading ? getComputedStyle(heading) : null;
      const gridStyle = grid ? getComputedStyle(grid) : null;
      const title = card?.querySelector("h3");
      const titleStyle = title ? getComputedStyle(title) : null;
      const price = card?.querySelector(".tabular-nums");
      const priceStyle = price ? getComputedStyle(price) : null;
      const media = card?.querySelector('a[aria-hidden="true"]');
      const mediaRect = media?.getBoundingClientRect();
      return {
        columns: gridStyle?.gridTemplateColumns.split(" ").length,
        columnGap: gridStyle?.columnGap,
        heading: style
          ? { lineHeight: style.lineHeight, size: style.fontSize, weight: style.fontWeight }
          : null,
        mediaRatio: mediaRect ? mediaRect.height / mediaRect.width : null,
        price: priceStyle
          ? {
              color: priceStyle.color,
              lineHeight: priceStyle.lineHeight,
              size: priceStyle.fontSize,
              weight: priceStyle.fontWeight,
            }
          : null,
        rowGap: gridStyle?.rowGap,
        title: titleStyle
          ? {
              lineHeight: titleStyle.lineHeight,
              size: titleStyle.fontSize,
              weight: titleStyle.fontWeight,
            }
          : null,
      };
    });
    expect(desktop.columns).toBe(4);
    expect(desktop.columnGap).toBe("3px");
    expect(desktop.rowGap).toBe("20px");
    expect(desktop.heading).toEqual({ lineHeight: "23px", size: "18px", weight: "400" });
    expect(desktop.title).toEqual({ lineHeight: "16px", size: "12px", weight: "400" });
    expect(desktop.price).toEqual({
      color: "rgb(77, 77, 77)",
      lineHeight: "16px",
      size: "12px",
      weight: "300",
    });
    expect(desktop.mediaRatio).toBeCloseTo(1.5, 2);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/collections/all");
    await page.waitForFunction(() => {
      const card = document.querySelector('[data-slot="product-card"]');
      const grid = card?.parentElement;
      return grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length === 2 : false;
    });
    const mobile = await page.evaluate(() => {
      const card = document.querySelector('[data-slot="product-card"]');
      const grid = card?.parentElement;
      const gridStyle = grid ? getComputedStyle(grid) : null;
      const sort = document.querySelector('[data-slot="select-trigger"]');
      const sortRect = sort?.getBoundingClientRect();
      return {
        columns: gridStyle?.gridTemplateColumns.split(" ").length,
        innerWidth: window.innerWidth,
        rowGap: gridStyle?.rowGap,
        scrollWidth: document.documentElement.scrollWidth,
        sortHeight: sortRect?.height,
      };
    });
    expect(mobile.columns).toBe(2);
    expect(mobile.rowGap).toBe("24px");
    expect(mobile.sortHeight).toBeGreaterThanOrEqual(36);
    expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.innerWidth);
  });

  test("product detail tabs, typography and gallery targets", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/products/alma-lace-corset-top");
    await page.locator("main h1").waitFor();
    await page.locator('[role="tab"]').first().waitFor();
    const pdp = await page.evaluate(() => {
      const read = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return {
          lineHeight: style.lineHeight,
          size: style.fontSize,
          weight: style.fontWeight,
        };
      };
      return {
        addToCartHeight: document
          .querySelector('main form button[type="submit"]')
          ?.getBoundingClientRect().height,
        h1: read("main h1"),
        panels: document.querySelectorAll('[role="tabpanel"]').length,
        tabs: read('[role="tab"]'),
        tabCount: document.querySelectorAll('[role="tab"]').length,
      };
    });
    expect(pdp.h1).toEqual({ lineHeight: "29px", size: "22px", weight: "400" });
    expect(pdp.tabs).toEqual({ lineHeight: "16px", size: "11px", weight: "400" });
    expect(pdp.tabCount).toBe(4);
    expect(pdp.panels).toBe(4);
    expect(pdp.addToCartHeight).toBeGreaterThanOrEqual(36);

    const firstTab = page.locator('[role="tab"]').first();
    await firstTab.focus();
    await page.keyboard.press("ArrowRight");
    const keyboard = await page.evaluate(() => ({
      activeId: document.activeElement?.id,
      selectedId: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
      selectedPanel: document
        .querySelector('[role="tab"][aria-selected="true"]')
        ?.getAttribute("aria-controls"),
      panelExists: Boolean(
        document.querySelector(
          `#${document.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute("aria-controls")}`,
        ),
      ),
    }));
    expect(keyboard.activeId).toBe("product-tab-1");
    expect(keyboard.selectedId).toBe("product-tab-1");
    expect(keyboard.selectedPanel).toBe("product-panel-1");
    expect(keyboard.panelExists).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/products/alma-lace-corset-top");
    await page.locator('[aria-label^="Go to image"]').first().waitFor({ state: "visible" });
    const dots = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-label^="Go to image"]')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { height: rect.height, width: rect.width };
      }),
    );
    expect(dots.length).toBeGreaterThan(0);
    for (const dot of dots) {
      expect(dot.height).toBeGreaterThanOrEqual(36);
      expect(dot.width).toBeGreaterThanOrEqual(36);
    }
  });

  test("visible interactive targets meet the 36px contract", async ({ page }) => {
    const paths = [
      "/",
      "/blogs/journal-2",
      "/collections/all",
      "/pages/size-guide",
      "/products/alma-lace-corset-top",
      "/search?q=corset",
    ];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      for (const path of paths) {
        await page.goto(path);
        const small = await page.evaluate(() => {
          const roots = ["[data-app-header]", "main", "footer"]
            .map((selector) => document.querySelector(selector))
            .filter(Boolean) as Element[];
          const elements = roots.flatMap((root) => [
            ...root.querySelectorAll(
              'a, button, input, select, textarea, [role="button"], [role="tab"]',
            ),
          ]);
          return elements
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              if (rect.width === 0 || rect.height === 0) return false;
              if (
                style.visibility === "hidden" ||
                style.display === "none" ||
                style.opacity === "0"
              ) {
                return false;
              }
              if (element.closest(".sr-only")) return false;
              if (element.closest("p")) return false;
              if (element.matches("input[type=hidden]")) return false;
              if (rect.width <= 1 && rect.height <= 1) return false;
              return true;
            })
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              const tag = element.tagName.toLowerCase();
              const minimum = tag === "input" || tag === "select" || tag === "textarea" ? 35 : 36;
              const minimumWidth =
                tag === "input" && (element as HTMLInputElement).type === "number" ? 20 : minimum;
              return rect.height < minimum || rect.width < minimumWidth;
            })
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                label:
                  element.getAttribute("aria-label") ||
                  element.textContent?.trim().slice(0, 40) ||
                  element.tagName,
                height: Math.round(rect.height),
                tag: element.tagName,
                width: Math.round(rect.width),
              };
            });
        });
        expect(small, `undersized targets on ${path} at ${width}px`).toEqual([]);
      }
    }
  });
});
