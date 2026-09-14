import { expect, test } from "@playwright/test";
import { FEATURED, LANGUAGES } from "../src/curation";
import { fetchIndex, watchForErrors } from "./helpers";

test("главная: hero, весь каталог из живого индекса и ни одной ошибки", async ({ page, request }) => {
    const errors = watchForErrors(page);
    const index = await fetchIndex(request);

    await page.goto(".");
    await expect(page.locator(".hero .eyebrow").first()).toHaveText("extension store");
    await expect(page.locator("h1")).toHaveText("extensions");
    await expect(page.getByRole("alert")).toHaveCount(0);

    // Счётчик и список согласованы с index.json.
    await expect(page.locator(".section-note").last()).toHaveText(`${String(index.extensions.length)} in the catalog`);
    await expect(page.locator(".ext-row")).toHaveCount(index.extensions.length);
    for (const entry of index.extensions) {
        await expect(page.locator(".ext-row .row-name").filter({ hasText: entry.displayName }).first()).toBeVisible();
    }

    errors.assertClean();
});

test("подборка: карточки — пересечение FEATURED с живым индексом", async ({ page, request }) => {
    const index = await fetchIndex(request);
    // Пересечение с индексом: курация может опережать или отставать от реестра.
    const featured = FEATURED.map((id) => index.extensions.find((e) => e.id === id)).filter((e) => e !== undefined);

    await page.goto(".");
    await expect(page.locator(".featured-card")).toHaveCount(featured.length);
    for (const entry of featured) {
        const card = page
            .locator(".featured-card")
            .filter({ has: page.locator(".card-title", { hasText: entry.displayName }) })
            .first();
        await expect(card).toHaveAttribute("href", `#/ext/${entry.id}`);
        await expect(card.locator(".card-head")).toContainText(entry.latest.version);
    }
});

test("чипы языков ведут на страницы языков", async ({ page }) => {
    await page.goto(".");
    for (const lang of LANGUAGES) {
        await expect(page.locator(".chip", { hasText: lang.label })).toHaveAttribute("href", `#/lang/${lang.id}`);
    }
});
