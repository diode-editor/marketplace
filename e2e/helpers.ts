import { expect, type APIRequestContext, type Page } from "@playwright/test";
import type { RegistryExtensionMeta, RegistryIndex, RegistryIndexEntry } from "../src/registry/client";

/**
 * Общая обвязка e2e. Тесты честные: сами читают живой реестр через request API
 * и сверяют UI с тем, что реально отдаёт API (самосверка вместо фикстур).
 */

export const REGISTRY = "https://diode-editor.github.io";

export async function fetchIndex(request: APIRequestContext): Promise<RegistryIndex> {
    const response = await request.get(`${REGISTRY}/registry/v1/index.json`);
    expect(response.ok(), `реестр недоступен: ${response.status()}`).toBe(true);
    return (await response.json()) as RegistryIndex;
}

export async function fetchMeta(request: APIRequestContext, id: string): Promise<RegistryExtensionMeta> {
    const response = await request.get(`${REGISTRY}/registry/v1/meta/${encodeURIComponent(id)}.json`);
    expect(response.ok(), `meta ${id} недоступна: ${response.status()}`).toBe(true);
    return (await response.json()) as RegistryExtensionMeta;
}

export function firstEntry(index: RegistryIndex): RegistryIndexEntry {
    const entry = index.extensions[0];
    if (entry === undefined) throw new Error("живой индекс пуст — тестировать не на чем");
    return entry;
}

/** Семантика поиска из registryFormat.ts — та же, что в src/pages/Home.tsx. */
export function matchesQuery(entry: RegistryIndexEntry, needle: string): boolean {
    return (
        entry.id.toLowerCase().includes(needle) ||
        entry.displayName.toLowerCase().includes(needle) ||
        entry.description.toLowerCase().includes(needle)
    );
}

export interface ErrorWatch {
    readonly assertClean: () => void;
}

/**
 * Вешать до первой навигации: собирает console.error, pageerror и ответы
 * реестра ≥ 400. allowUrl — для тестов, где ошибка ожидаема (404 меты).
 */
export function watchForErrors(page: Page, options: { readonly allowUrl?: (url: string) => boolean } = {}): ErrorWatch {
    const allow = options.allowUrl ?? ((): boolean => false);
    const problems: string[] = [];

    page.on("console", (message) => {
        if (message.type() !== "error") return;
        if (allow(message.location().url) || allow(message.text())) return;
        problems.push(`console.error: ${message.text()}`);
    });
    page.on("pageerror", (error) => {
        problems.push(`pageerror: ${error.message}`);
    });
    page.on("requestfailed", (request) => {
        if (!request.url().includes("/registry/") || allow(request.url())) return;
        problems.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ""}`);
    });
    page.on("response", (response) => {
        if (response.status() < 400 || !response.url().includes("/registry/") || allow(response.url())) return;
        problems.push(`HTTP ${String(response.status())}: ${response.url()}`);
    });

    return {
        assertClean: (): void => {
            expect(problems, "страница должна прожить сценарий без ошибок").toEqual([]);
        },
    };
}
