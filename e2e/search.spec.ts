import { expect, test } from "@playwright/test";
import { fetchIndex, firstEntry, matchesQuery } from "./helpers";

test('"/" фокусирует поле поиска', async ({ page }) => {
    await page.goto(".");
    await expect(page.locator(".ext-row").first()).toBeVisible();
    await page.keyboard.press("/");
    await expect(page.getByLabel("Search extensions")).toBeFocused();
});

test("подстрочный фильтр без учёта регистра, счёт сверен с индексом", async ({ page, request }) => {
    const index = await fetchIndex(request);
    const entry = firstEntry(index);
    // Срез из середины имени в lowercase — проверяет и substring, и регистр.
    const source = entry.displayName.length >= 5 ? entry.displayName : entry.id;
    const needle = source.toLowerCase().slice(1, 5).trim();
    if (needle.length === 0) throw new Error(`не из чего собрать запрос: ${source}`);
    const expected = index.extensions.filter((e) => matchesQuery(e, needle));

    await page.goto(".");
    await page.getByLabel("Search extensions").fill(needle);
    await expect(page.locator(".section-note")).toHaveText(`query: ${needle} · ${String(expected.length)} found`);
    await expect(page.locator(".ext-row")).toHaveCount(expected.length);
    // Hero и подборка схлопываются в режиме поиска.
    await expect(page.locator("h1")).toHaveCount(0);
    await expect(page.locator(".featured-card")).toHaveCount(0);
});

test("мусорный запрос — 0 found и пустой список", async ({ page }) => {
    await page.goto(".");
    await page.getByLabel("Search extensions").fill("zzzz-definitely-nothing");
    await expect(page.locator(".section-note")).toHaveText("query: zzzz-definitely-nothing · 0 found");
    await expect(page.locator(".ext-row")).toHaveCount(0);
});

test("Escape сбрасывает поиск и возвращает главную", async ({ page }) => {
    await page.goto(".");
    const input = page.getByLabel("Search extensions");
    await input.fill("ruff");
    await expect(page.locator("h1")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(input).toHaveValue("");
    await expect(page.locator("h1")).toHaveText("extensions");
});
