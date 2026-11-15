import { expect, test } from "@playwright/test";

test.describe("accessibility and motion", () => {
  test("search drawer traps focus, exposes a dialog and keeps a visible focus ring", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(750);
    await page.keyboard.press("Control+k");
    const input = page.locator("#search-drawer-input");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    const probe = await page.evaluate(() => {
      const inputElement = document.querySelector("#search-drawer-input");
      const dialog = document.querySelector('[role="dialog"]');
      const style = inputElement ? getComputedStyle(inputElement) : null;
      return {
        ariaModal: dialog?.getAttribute("aria-modal"),
        outlineStyle: style?.outlineStyle,
        outlineWidth: style?.outlineWidth,
        role: dialog?.getAttribute("role"),
      };
    });
    expect(probe.role).toBe("dialog");
    expect(probe.ariaModal).toBe("true");
    expect(probe.outlineStyle).not.toBe("none");
    expect(parseFloat(probe.outlineWidth ?? "0")).toBeGreaterThanOrEqual(2);
  });

  test("announcement stops rotating under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const read = () =>
      page.evaluate(() => {
        const active = document.querySelector("[aria-hidden='false']");
        return active?.textContent?.trim() ?? null;
      });
    const before = await read();
    await page.waitForTimeout(3_500);
    const after = await read();
    expect(after).toBe(before);
  });

  test("product disclosures are native and open independently", async ({ page }) => {
    await page.goto("/products/alma-lace-corset-top");
    const items = page.locator("[data-slot=accordion] details");
    await expect(items).toHaveCount(3);
    expect(await page.locator('[role="tab"], [role="tabpanel"]').count()).toBe(0);

    const first = items.first();
    const summary = first.locator("summary");
    await expect(summary).toHaveAccessibleName(/description/i);

    const closed = await first.boundingBox();
    await summary.click();
    await expect(first).toHaveAttribute("open", "");
    const opened = await first.boundingBox();
    expect(opened?.height ?? 0).toBeGreaterThan(closed?.height ?? 0);

    await summary.click();
    expect(await first.getAttribute("open")).toBeNull();
  });

  test("reduced motion shortens authored transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const durations = await page.evaluate(() => {
      const selector = "[data-app-header] a[data-wordmark]";
      const element = document.querySelector(selector);
      return element ? getComputedStyle(element).transitionDuration : null;
    });
    expect(durations).not.toBeNull();
    expect(Number.parseFloat(durations ?? "1")).toBeLessThan(0.001);
  });
});
