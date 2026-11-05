import { expect, test } from "@playwright/test";

test.describe("shell and commerce flows", () => {
  test("mega menu opens on hover and Escape returns focus", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    const trigger = page.getByRole("button", { name: "Woman" });
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#mega-1");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("mobile menu opens below the header and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    const panel = page.locator("#mobile-menu");
    await expect(panel).toBeVisible();
    const geometry = await page.evaluate(() => {
      const header = document.querySelector("[data-app-header]")?.getBoundingClientRect();
      const menu = document.querySelector("#mobile-menu")?.getBoundingClientRect();
      const row = document.querySelector("#mobile-menu a")?.getBoundingClientRect();
      return {
        headerBottom: header?.bottom,
        menuTop: menu?.top,
        rowHeight: row?.height,
      };
    });
    expect(Math.abs((geometry.menuTop ?? 0) - (geometry.headerBottom ?? 0))).toBeLessThanOrEqual(
      1.5,
    );
    expect(geometry.rowHeight).toBeGreaterThanOrEqual(38);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("add to cart opens the 440px drawer with progress semantics", async ({ page }) => {
    await page.goto("/products/alma-lace-corset-top");
    await page.getByRole("button", { name: "Add to Cart" }).click();
    const drawer = page.locator('[data-slot="sheet-content"]');
    await expect(drawer).toBeVisible();
    const probe = await page.evaluate(() => {
      const sheet = document.querySelector('[data-slot="sheet-content"]');
      const progress = document.querySelector('[role="progressbar"]');
      const close = document.querySelector('[aria-label="Close cart"]');
      const rect = sheet?.getBoundingClientRect();
      const closeRect = close?.getBoundingClientRect();
      return {
        ariaModal: sheet?.getAttribute("aria-modal"),
        closeHeight: closeRect?.height,
        closeWidth: closeRect?.width,
        progressLabel: progress?.getAttribute("aria-label"),
        progressMax: progress?.getAttribute("aria-valuemax"),
        progressMin: progress?.getAttribute("aria-valuemin"),
        width: rect?.width,
      };
    });
    expect(probe.width).toBeCloseTo(440, 0);
    expect(probe.ariaModal).toBe("true");
    expect(probe.progressLabel).toBe("Free shipping progress");
    expect(probe.progressMin).toBe("0");
    expect(probe.progressMax).toBe("100");
    expect(probe.closeWidth).toBeGreaterThanOrEqual(36);
    expect(probe.closeHeight).toBeGreaterThanOrEqual(36);
  });

  test("filter drawer has a sticky header and footer with clear and apply", async ({ page }) => {
    await page.goto("/collections/all");
    await page.getByRole("button", { name: "Filter" }).click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();
    const probe = await page.evaluate(() => {
      const content = document.querySelector('[data-slot="sheet-content"]');
      const title = content?.querySelector('[data-slot="sheet-title"]');
      const clear = [...(content?.querySelectorAll("button") ?? [])].find(
        (button) => button.textContent?.trim() === "Clear all",
      );
      const apply = [...(content?.querySelectorAll("button") ?? [])].find(
        (button) => button.textContent?.trim() === "Apply",
      );
      const rect = content?.getBoundingClientRect();
      return {
        applyHeight: apply?.getBoundingClientRect().height,
        clearHeight: clear?.getBoundingClientRect().height,
        title: title?.textContent?.trim(),
        width: rect?.width,
      };
    });
    expect(probe.width).toBe(420);
    expect(probe.title).toBe("Filter");
    expect(probe.clearHeight).toBeGreaterThanOrEqual(36);
    expect(probe.applyHeight).toBeGreaterThanOrEqual(36);
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(sheet).toBeHidden();
  });

  test("newsletter opens after five seconds, closes at 36px and stays dismissed", async ({
    page,
  }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(400);
    const probe = await page.evaluate(() => {
      const popup = document.querySelector('[role="dialog"]');
      const close = popup?.querySelector('[data-slot="dialog-close"]');
      const rect = popup?.getBoundingClientRect();
      const closeRect = close?.getBoundingClientRect();
      return {
        closeHeight: closeRect?.height,
        closeWidth: closeRect?.width,
        width: rect?.width,
      };
    });
    expect(probe.width).toBe(448);
    expect(probe.closeWidth).toBeGreaterThanOrEqual(36);
    expect(probe.closeHeight).toBeGreaterThanOrEqual(36);
    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await page.waitForTimeout(5_500);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
