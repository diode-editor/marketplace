import { expect, test } from "@playwright/test";
import { EXTENSION_LANGUAGES, LANGUAGES } from "../src/curation";
import { installCommand } from "../src/format";
import { fetchIndex, watchForErrors } from "./helpers";

if (LANGUAGES.length === 0) throw new Error("в курации нет ни одного языка");

for (const lang of LANGUAGES) {
    test(`страница языка ${lang.id}: сайдбар, витрина и строки согласованы с курацией и индексом`, async ({
        page,
        request,
    }) => {
        const errors = watchForErrors(page);
        const index = await fetchIndex(request);

        await page.goto(`#/lang/${lang.id}`);
        for (const l of LANGUAGES) {
            await expect(page.locator(`.lang-sidebar a[href="#/lang/${l.id}"]`)).toHaveText(l.label);
        }
        await expect(page.locator(`.lang-sidebar a[href="#/lang/${lang.id}"]`)).toHaveClass("active");
        await expect(page.locator("h1")).toHaveText(lang.label);
        await expect(page.locator(".lang-hero .lead")).toHaveText(lang.blurb);

        // Считаем ровно как страница: витрина — первый recommended из живого индекса.
        const extensions = index.extensions.filter((e) => (EXTENSION_LANGUAGES[e.id] ?? []).includes(lang.id));
        const showcase = lang.recommended
            .map((id) => index.extensions.find((e) => e.id === id))
            .find((e) => e !== undefined);
        const rows = [...(showcase !== undefined ? [showcase] : []), ...extensions.filter((e) => e.id !== showcase?.id)];

        if (showcase !== undefined) {
            await expect(page.getByText(installCommand(showcase.id), { exact: true })).toBeVisible();
            await expect(page.locator(`.lang-hero a[href="#/ext/${showcase.id}"]`)).toContainText("details");
        }
        if (extensions.length === 0) {
            // Честно к дрейфу данных: реестр мог опустеть по этому языку.
            await expect(page.locator(".lang-rows .status-block")).toHaveText(
                "nothing in the catalog for this language yet",
            );
        } else {
            await expect(page.locator(".lang-rows .ext-row")).toHaveCount(rows.length);
            const first = rows[0];
            if (first !== undefined) {
                await expect(page.locator(".lang-rows .ext-row .row-name").first()).toHaveText(first.displayName);
            }
        }

        errors.assertClean();
    });
}

const aliased = LANGUAGES.flatMap((lang) => (lang.aliases ?? []).map((alias) => ({ lang, alias })));
for (const { lang, alias } of aliased) {
    test(`алиас #/lang/${alias} открывает страницу ${lang.id}`, async ({ page }) => {
        const errors = watchForErrors(page);

        await page.goto(`#/lang/${alias}`);
        await expect(page.getByRole("alert")).toHaveCount(0);
        await expect(page.locator("h1")).toHaveText(lang.label);
        // Активен пункт основного языка — алиас не заводит второй пункт в сайдбаре.
        await expect(page.locator(`.lang-sidebar a[href="#/lang/${lang.id}"]`)).toHaveClass("active");
        await expect(page.locator(`.lang-sidebar a[href="#/lang/${alias}"]`)).toHaveCount(0);

        errors.assertClean();
    });
}

test("неизвестный язык — состояние ошибки со ссылкой домой", async ({ page }) => {
    await page.goto("#/lang/nope");
    const alert = page.getByRole("alert");
    await expect(alert).toContainText("no language");
    await expect(alert).toContainText("nope");
    await alert.getByText("← all extensions").click();
    await expect(page.locator(".hero h1")).toHaveText("extensions");
});
