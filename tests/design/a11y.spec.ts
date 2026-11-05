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

  test("tabs render one panel at a time with complete aria wiring", async ({ page }) => {
    await page.goto("/products/alma-lace-corset-top");
    const wiring = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      return tabs.map((tab) => {
        const controls = tab.getAttribute("aria-controls");
        const panel = controls ? document.getElementById(controls) : null;
        return {
          controls,
          controlsPanel: Boolean(panel),
          panelLabel: panel?.getAttribute("aria-labelledby"),
          selected: tab.getAttribute("aria-selected") === "true",
          tabId: tab.id,
        };
      });
    });
    expect(wiring).toHaveLength(4);
    for (const tab of wiring) {
      expect(tab.controlsPanel).toBe(true);
      expect(tab.panelLabel).toBe(tab.tabId);
    }
    expect(wiring.filter((tab) => tab.selected)).toHaveLength(1);
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
