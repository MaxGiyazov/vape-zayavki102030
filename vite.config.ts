import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * VITE_BASE_PATH задаётся при сборке под GitHub Pages:
 *   VITE_BASE_PATH=/my-repo/ npm run build
 * По умолчанию используется корень — удобно для dev/preview.
 */
const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
