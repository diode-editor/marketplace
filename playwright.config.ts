import { defineConfig, devices } from "@playwright/test";

/**
 * E2E против запущенного dev server: в dev-режиме клиент (src/registry/client.ts)
 * ходит в живой прод-реестр diode-editor.github.io — тесты честные, без моков.
 * `vite preview` не годится: в prod-сборке пути относительные и на localhost
 * реестра нет.
 */

const CI = process.env["CI"] !== undefined && process.env["CI"] !== "";

export default defineConfig({
    testDir: "e2e",
    fullyParallel: true,
    forbidOnly: CI,
    // Живой реестр по сети — терпим сетевые всплески.
    retries: CI ? 2 : 0,
    // В CI не долбим живой реестр во все ядра.
    ...(CI ? { workers: 2 } : {}),
    reporter: [["list"], ["html", { open: "never" }]],
    expect: { timeout: 10_000 },
    use: {
        baseURL: "http://localhost:5173/marketplace/",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        // strictPort: пусть падает сразу, а не прыгает на 5174 мимо baseURL.
        command: "npm run dev -- --port 5173 --strictPort",
        url: "http://localhost:5173/marketplace/",
        reuseExistingServer: !CI,
        timeout: 60_000,
    },
});
