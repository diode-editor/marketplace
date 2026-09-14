import { expect, test } from "@playwright/test";

/* Цикл темы system → dark → light → system (src/App.tsx): system — без
   атрибута data-theme, выбор хранится в localStorage. */

async function themeAttr(page: import("@playwright/test").Page): Promise<string | undefined> {
    return page.evaluate(() => document.documentElement.dataset["theme"]);
}

test("цикл темы, атрибут, localStorage и персистентность через reload", async ({ page }) => {
    await page.goto(".");
    const toggle = page.locator(".theme-toggle");

    // Свежий контекст — system, атрибута нет.
    await expect(toggle).toHaveText("theme: system");
    expect(await themeAttr(page)).toBeUndefined();

    await toggle.click();
    await expect(toggle).toHaveText("theme: dark");
    expect(await themeAttr(page)).toBe("dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    await toggle.click();
    await expect(toggle).toHaveText("theme: light");
    expect(await themeAttr(page)).toBe("light");

    // Выбор переживает перезагрузку.
    await page.reload();
    await expect(page.locator(".theme-toggle")).toHaveText("theme: light");
    expect(await themeAttr(page)).toBe("light");

    await page.locator(".theme-toggle").click();
    await expect(page.locator(".theme-toggle")).toHaveText("theme: system");
    expect(await themeAttr(page)).toBeUndefined();
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("system");
});
