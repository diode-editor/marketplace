import { expect, test } from "@playwright/test";
import { fetchIndex, firstEntry, watchForErrors } from "./helpers";

test("главная → расширение → назад по крошке и по истории браузера", async ({ page, request }) => {
    const index = await fetchIndex(request);
    const entry = firstEntry(index);

    await page.goto(".");
    await page.locator(".ext-row").first().click();
    await expect(page).toHaveURL(`#/ext/${entry.id}`);
    await expect(page.locator(".title-row h1")).toHaveText(entry.displayName);

    await page.locator(".breadcrumbs a", { hasText: "extensions" }).first().click();
    await expect(page.locator(".hero h1")).toHaveText("extensions");

    // Hash-роутинг живёт в истории браузера.
    await page.goBack();
    await expect(page.locator(".title-row h1")).toHaveText(entry.displayName);
    await page.goBack();
    await expect(page.locator(".hero h1")).toHaveText("extensions");
});

test("deep link на расширение работает без захода на главную", async ({ page, request }) => {
    const index = await fetchIndex(request);
    const entry = firstEntry(index);
    await page.goto(`#/ext/${entry.id}`);
    await expect(page.locator(".title-row h1")).toHaveText(entry.displayName);
});

test("неизвестный id расширения — честная ошибка HTTP 404", async ({ page }) => {
    // 404 меты здесь ожидаем — разрешаем его вотчеру.
    const errors = watchForErrors(page, { allowUrl: (url) => url.includes("no.such-extension") });

    await page.goto("#/ext/no.such-extension");
    const alert = page.getByRole("alert");
    await expect(alert).toContainText("failed to load no.such-extension");
    await expect(alert).toContainText("HTTP 404");
    await alert.getByText("← all extensions").click();
    await expect(page.locator(".hero h1")).toHaveText("extensions");

    errors.assertClean();
});
