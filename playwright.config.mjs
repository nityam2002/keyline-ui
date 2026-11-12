// Browser tests (tests/browser/*.spec.mjs) in Chrome, Firefox and WebKit.
//
//   pnpm test:browser                                 every spec, every engine
//   pnpm exec playwright test toolbar menu            specs whose file name matches
//   pnpm exec playwright test --project=chromium      one engine (skips the @timing projects)
//
// The app under test is a development-mode build of src/demo/ served by scripts/test-app.mjs (React's development
// build, so its warnings reach the console checks). Set KL_BASE to test an app that is already running instead.
//
// Tests tagged @timing measure a duration (a settle time, frames to a commit). They run after the main projects,
// one at a time in Chrome and WebKit, so the load of other workers is not part of what they measure. If a main
// project has a failure, Playwright does not start the timing projects; the run is red either way.
import { defineConfig } from "playwright/test";

const CI = !!process.env.CI;
const PORT = 5391;
const base = process.env.KL_BASE;
const TIMING = /@timing/;

const chrome = { browserName: "chromium", channel: "chrome" };
const firefox = { browserName: "firefox" };
const webkit = { browserName: "webkit" };

export default defineConfig({
  testDir: "tests/browser",
  testMatch: /\.spec\.mjs$/,
  outputDir: ".artifacts/playwright",
  fullyParallel: true,
  workers: Number(process.env.KL_WORKERS || 4),
  // no retries: a test that passes only sometimes has a cause to fix (.github/CONTRIBUTING.md, "Fix the cause")
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  forbidOnly: CI,
  reporter: CI
    ? [["github"], ["list"], ["html", { outputFolder: ".artifacts/playwright-report", open: "never" }]]
    : [["list"]],
  use: {
    baseURL: base || `http://127.0.0.1:${PORT}/`,
    viewport: { width: 1280, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    // a failed test keeps its trace; passing tests discard theirs
    trace: "retain-on-failure",
  },
  webServer: base
    ? undefined
    : {
        command: `node scripts/test-app.mjs --port=${PORT}`,
        url: `http://127.0.0.1:${PORT}/`,
        reuseExistingServer: false,
        timeout: 180_000,
      },
  projects: [
    { name: "chromium", use: chrome, grepInvert: TIMING },
    { name: "firefox", use: firefox, grepInvert: TIMING },
    { name: "webkit", use: webkit, grepInvert: TIMING },
    { name: "chromium-timing", use: chrome, grep: TIMING, workers: 1, dependencies: ["chromium", "firefox", "webkit"] },
    { name: "webkit-timing", use: webkit, grep: TIMING, workers: 1, dependencies: ["chromium-timing"] },
  ],
});
