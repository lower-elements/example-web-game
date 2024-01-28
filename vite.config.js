import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
export default defineConfig({
    plugins: [
        react(),
        createHtmlPlugin({
            // entry: "src/app.ts",
            template: "src/index.html",
        }),
    ],
});
