import { expect, test } from "@playwright/test";
import { installCommand } from "../src/format";
import { fetchIndex, fetchMeta, firstEntry, watchForErrors } from "./helpers";

test("страница расширения согласована с meta из API", async ({ page, request }) => {
    const errors = watchForErrors(page);
    const index = await fetchIndex(request);
    const entry = firstEntry(index);
    const meta = await fetchMeta(request, entry.id);

    await page.goto(`#/ext/${entry.id}`);
    // README может нести собственный h1 — заголовок страницы скоупим до title-row.
    await expect(page.locator(".title-row h1")).toHaveText(meta.displayName);
    await expect(page.locator(".lead")).toHaveText(meta.description);
    await expect(page.locator(".meta-line")).toContainText(`@${meta.publisher}`);

    // Aside: только то, что реально есть в meta.
    const facts = page.locator(".facts");
    await expect(facts).toContainText(meta.id);
    await expect(facts).toContainText(`@${meta.publisher}`);
    if (meta.license !== undefined) await expect(facts).toContainText(meta.license);

    // Overview: README-файл или plain description — по наличию поля.
    await expect(page.locator(".ext-main .eyebrow")).toHaveText("01 / overview");
    if (meta.readme !== undefined) {
        await expect(page.locator(".file-label")).toHaveText("README.md");
    } else {
        await expect(page.locator(".readme")).toHaveText(meta.description);
    }

    // Версии: запись на каждый артефакт (версия может повторяться по платформам).
    await expect(page.locator(".version-entry")).toHaveCount(meta.versions.length);
    for (const version of meta.versions) {
        await expect(
            page.locator(".version-entry .sha").filter({ hasText: version.sha256.slice(0, 16) }).first(),
        ).toBeVisible();
        if (version.artifact.type === "url") {
            await expect(page.locator(`.version-entry a[href="${version.artifact.url}"]`).first()).toBeVisible();
        }
    }

    errors.assertClean();
});

test("команда установки показана и копируется по клику", async ({ page, request, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const index = await fetchIndex(request);
    const entry = firstEntry(index);
    const command = installCommand(entry.id);

    await page.goto(`#/ext/${entry.id}`);
    await page.getByText(command, { exact: true }).click();
    await expect(page.getByText("ok", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
    // Индикатор возвращается в исходное состояние.
    await expect(page.getByText("copy", { exact: true })).toBeVisible();
});
