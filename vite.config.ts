import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// The demo app: src/demo/ is the Vite root (src/demo/index.html, static files in src/demo/public). `@/` is src/.
export default defineConfig({
  root: fileURLToPath(new URL("src/demo", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("src", import.meta.url)) } },
  build: { outDir: fileURLToPath(new URL(".artifacts/dist", import.meta.url)), emptyOutDir: true },
});
