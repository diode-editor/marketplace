import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    // Проект-сайт GitHub Pages живёт на https://diode-editor.github.io/marketplace/
    base: "/marketplace/",
    plugins: [react()],
});
