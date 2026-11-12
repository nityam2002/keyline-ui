// Part tests (tests/parts/*.browser.test.tsx): each exported part mounted on its own in a real browser, checked
// against Base UI's wrapper contract (tests/parts/conformance.tsx) and axe.
//
//   pnpm test:parts                every part test, in Chromium, Firefox and WebKit
//   pnpm test:parts button         part tests whose file name matches
//
// Tests import parts through `@/components/keyline/*`, the path an installed project uses, so they exercise what
// consumers import. There are no retries: a test that passes only sometimes has a cause to fix.
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const src = (path: string) => fileURLToPath(new URL(`src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\/components\/keyline\//, replacement: `${src("registry/keyline")}/` },
      { find: /^@\//, replacement: `${src("")}` },
    ],
  },
  cacheDir: ".artifacts/vite-parts",
  // Pre-bundle every dependency the parts can import before the first test runs. A dependency Vite meets only at
  // run time (a new Base UI subpath, say) makes it re-bundle and reload the page mid-run, and the test file then
  // fails with "Vitest failed to find the runner". Scanning all registry source on every start costs a second.
  optimizeDeps: {
    entries: ["tests/parts/**/*.browser.test.tsx", "src/registry/keyline/**/*.{ts,tsx}"],
    force: true,
  },
  test: {
    name: "parts",
    include: ["tests/parts/**/*.browser.test.tsx"],
    setupFiles: ["tests/parts/setup.ts"],
    retry: 0,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      screenshotFailures: false,
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
    },
  },
});
