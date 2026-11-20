import { expect, test } from "@playwright/test";

test.describe("design tokens", () => {
  test("desktop tokens and shell geometry", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector("[data-app-header]")?.getBoundingClientRect().height ?? 0) > 0,
    );
    const probe = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const heading = document.querySelector("main h2");
      const headingStyle = heading ? getComputedStyle(heading) : null;
      const navLink = document.querySelector(
        'nav[aria-label="Menu"] a, nav[aria-label="Menu"] button',
      );
      const navStyle = navLink ? getComputedStyle(navLink) : null;
      const header = document.querySelector("[data-app-header]");
      const wordmark = [...document.querySelectorAll('[data-wordmark="nav"]')].find(
        (node) => node.getBoundingClientRect().width > 0,
      );
      const wordmarkText = wordmark?.querySelector("span");
      const wordmarkTextStyle = wordmarkText ? getComputedStyle(wordmarkText) : null;
      const headerRect = header?.getBoundingClientRect();
      const wordmarkRect = wordmark?.getBoundingClientRect();
      return {
        bodyFontSize: body.fontSize,
        bodyFontWeight: body.fontWeight,
        bodyLineHeight: body.lineHeight,
        drawerCart: root.getPropertyValue("--drawer-cart").trim(),
        ease: root.getPropertyValue("--ease-standard").trim(),
        gridGap: root.getPropertyValue("--grid-gap").trim(),
        gridRowGap: root.getPropertyValue("--grid-row-gap").trim(),
        gutter: root.getPropertyValue("--gutter").trim(),
        headerHeight: headerRect?.height,
        headingLineHeight: headingStyle?.lineHeight,
        headingSize: headingStyle?.fontSize,
        headingWeight: headingStyle?.fontWeight,
        motionBase: root.getPropertyValue("--motion-base").trim(),
        navFontSize: navStyle?.fontSize,
        navFontWeight: navStyle?.fontWeight,
        navLineHeight: navStyle?.lineHeight,
        pageTop: root.getPropertyValue("--page-top").trim(),
        sectionGap: root.getPropertyValue("--section-gap").trim(),
        target: root.getPropertyValue("--target-min").trim(),
        wordmarkFontFamily: wordmarkTextStyle?.fontFamily,
        wordmarkFontSize: wordmarkTextStyle?.fontSize,
        wordmarkFontWeight: wordmarkTextStyle?.fontWeight,
        wordmarkHeight: wordmarkRect?.height,
        wordmarkLineHeight: wordmarkTextStyle?.lineHeight,
        wordmarkText: wordmarkText?.textContent,
        wordmarkTextTransform: wordmarkTextStyle?.textTransform,
        wordmarkWidth: wordmarkRect?.width,
      };
    });

    expect(probe.gutter).toBe("24px");
    expect(probe.pageTop).toBe("24px");
    expect(probe.sectionGap).toBe("60px");
    expect(probe.gridGap).toBe("3px");
    expect(probe.gridRowGap).toBe("20px");
    expect(Number.parseFloat(probe.motionBase)).toBeCloseTo(0.3, 3);
    expect(probe.ease.replace(/\s/g, "")).toBe("cubic-bezier(.2,.6,.2,1)");
    expect(probe.drawerCart).toBe("440px");
    expect(probe.bodyFontSize).toBe("14px");
    expect(probe.bodyFontWeight).toBe("400");
    expect(probe.bodyLineHeight).toBe("21px");
    expect(probe.headingSize).toBe("18px");
    expect(probe.headingWeight).toBe("400");
    expect(probe.headingLineHeight).toBe("23px");
    expect(probe.navFontSize).toBe("14px");
    expect(probe.navFontWeight).toBe("700");
    expect(probe.navLineHeight).toBe("21px");
    expect(probe.headerHeight).toBeCloseTo(74, 0);
    expect(probe.wordmarkText).toBe("Lorem Ipsum");
    expect(probe.wordmarkFontFamily).toContain("DM Sans");
    expect(probe.wordmarkFontSize).toBe("18px");
    expect(probe.wordmarkFontWeight).toBe("400");
    expect(probe.wordmarkLineHeight).toBe("27px");
    expect(probe.wordmarkTextTransform).toBe("uppercase");
    expect(probe.wordmarkWidth).toBeGreaterThan(100);
  });

  test("mobile tokens and shell geometry", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector("[data-app-header]")?.getBoundingClientRect().height ?? 0) > 0,
    );
    const probe = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const header = document.querySelector("[data-app-header]");
      const wordmark = [...document.querySelectorAll('[data-wordmark="nav"]')].find(
        (node) => node.getBoundingClientRect().width > 0,
      );
      const wordmarkText = wordmark?.querySelector("span");
      const wordmarkTextStyle = wordmarkText ? getComputedStyle(wordmarkText) : null;
      const nav = document.querySelector('nav[aria-label="Menu"]');
      const menu = document.querySelector('[aria-controls="mobile-menu"]');
      const headerRect = header?.getBoundingClientRect();
      const wordmarkRect = wordmark?.getBoundingClientRect();
      const menuRect = menu?.getBoundingClientRect();
      return {
        gutter: root.getPropertyValue("--gutter").trim(),
        headerHeight: headerRect?.height,
        navDisplay: nav ? getComputedStyle(nav).display : null,
        menuHeight: menuRect?.height,
        menuWidth: menuRect?.width,
        sectionGap: root.getPropertyValue("--section-gap").trim(),
        wordmarkFontFamily: wordmarkTextStyle?.fontFamily,
        wordmarkFontSize: wordmarkTextStyle?.fontSize,
        wordmarkFontWeight: wordmarkTextStyle?.fontWeight,
        wordmarkHeight: wordmarkRect?.height,
        wordmarkLineHeight: wordmarkTextStyle?.lineHeight,
        wordmarkText: wordmarkText?.textContent,
        wordmarkTextTransform: wordmarkTextStyle?.textTransform,
        wordmarkWidth: wordmarkRect?.width,
      };
    });

    expect(probe.gutter).toBe("24px");
    expect(probe.sectionGap).toBe("40px");
    expect(probe.headerHeight).toBeCloseTo(56, 0);
    expect(probe.navDisplay).toBe("none");
    expect(probe.wordmarkText).toBe("Lorem Ipsum");
    expect(probe.wordmarkFontFamily).toContain("DM Sans");
    expect(probe.wordmarkFontSize).toBe("18px");
    expect(probe.wordmarkFontWeight).toBe("400");
    expect(probe.wordmarkLineHeight).toBe("27px");
    expect(probe.wordmarkTextTransform).toBe("uppercase");
    expect(probe.wordmarkWidth).toBeGreaterThan(100);
    expect(probe.menuWidth).toBeGreaterThanOrEqual(36);
    expect(probe.menuHeight).toBeGreaterThanOrEqual(36);
  });

  test("1100px is the desktop breakpoint", async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 1000 });
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector("[data-app-header]")?.getBoundingClientRect().height ?? 0) > 0,
    );
    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Menu"]');
      return {
        header: document.querySelector("[data-app-header]")?.getBoundingClientRect().height,
        nav: nav ? getComputedStyle(nav).display : null,
      };
    });
    expect(desktop.header).toBeCloseTo(74, 0);
    expect(desktop.nav).toBe("block");

    await page.setViewportSize({ width: 1099, height: 1000 });
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector("[data-app-header]")?.getBoundingClientRect().height ?? 0) > 0,
    );
    const compact = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Menu"]');
      return {
        header: document.querySelector("[data-app-header]")?.getBoundingClientRect().height,
        nav: nav ? getComputedStyle(nav).display : null,
      };
    });
    expect(compact.header).toBeCloseTo(56, 0);
    expect(compact.nav).toBe("none");
  });
});
