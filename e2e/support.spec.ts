import { expect, test } from "@playwright/test";
import type { RegistryIndexEntry } from "../src/registry/client";
import { fetchIndex, fetchMeta, watchForErrors } from "./helpers";

/**
 * Пометка о частичной поддержке. Тест честный, как и остальные: берёт из живого
 * реестра запись, которую мейнтейнеры пометили `partial`, и сверяет с ней UI.
 * Если помеченных записей в реестре нет — проверять нечего, и тест это говорит
 * вслух, а не молча зеленеет.
 */
function partialEntry(entries: readonly RegistryIndexEntry[]): RegistryIndexEntry {
    const entry = entries.find((e) => e.support?.level === "partial");
    if (entry === undefined) throw new Error("в живом реестре нет записи с support.level=partial");
    return entry;
}

test("бейдж partial стоит в строке списка", async ({ page, request }) => {
    const errors = watchForErrors(page);
    const index = await fetchIndex(request);
    const entry = partialEntry(index.extensions);

    await page.goto("#/");
    await page.getByPlaceholder(/search/i).fill(entry.displayName);

    const row = page.locator(".ext-row").filter({ hasText: entry.displayName }).first();
    await expect(row.locator(".row-partial")).toHaveText("partial");

    // У непомеченной записи бейджа нет — иначе «partial» ничего не различает.
    const plain = index.extensions.find((e) => e.support === undefined);
    if (plain !== undefined) {
        await page.getByPlaceholder(/search/i).fill(plain.displayName);
        const plainRow = page.locator(".ext-row").filter({ hasText: plain.displayName }).first();
        await expect(plainRow).toBeVisible();
        await expect(plainRow.locator(".row-partial")).toHaveCount(0);
    }

    errors.assertClean();
});

test("страница расширения разворачивает пометку в два списка", async ({ page, request }) => {
    const errors = watchForErrors(page);
    const index = await fetchIndex(request);
    const entry = partialEntry(index.extensions);
    const meta = await fetchMeta(request, entry.id);
    const support = meta.support;
    if (support === undefined) throw new Error(`meta ${entry.id} потеряла support, хотя индекс его несёт`);

    await page.goto(`#/ext/${entry.id}`);

    const note = page.locator(".support-note");
    await expect(note).toBeVisible();
    await expect(note.getByText("partial support")).toBeVisible();
    for (const item of support.works ?? []) {
        await expect(note.locator(".support-works li").filter({ hasText: item })).toHaveCount(1);
    }
    for (const item of support.limits ?? []) {
        await expect(note.locator(".support-limits li").filter({ hasText: item })).toHaveCount(1);
    }

    // Пометка — над readme: это решение «ставить или нет», а не справка.
    const notePos = await note.boundingBox();
    const readmePos = await page.locator(".readme").first().boundingBox();
    expect(notePos && readmePos && notePos.y < readmePos.y).toBe(true);

    // И продублирована фактом в aside.
    await expect(page.locator(".facts")).toContainText("partial");

    errors.assertClean();
});
