// AppShell on the specimen page: the medium layout (sidebar toggle, aside as an end sheet), the narrow layout
// (sidebar and aside as sheets, focus return), and the wide layout (aside inline, breadcrumb, inspector close).
import { test, idle } from "./fixtures.mjs";
import { near, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["participants", "shell"] });

const READY = "#participants form";

test("shell: medium and narrow layouts, sidebar toggle, sheets, focus return", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#shell");
  await sec.scrollIntoViewIfNeeded();
  const shell = sec.locator('[data-slot="app-shell"]');
  ok(
    "shell: medium layout at this width (sidebar inline, aside as a sheet)",
    (await shell.getAttribute("data-kl-shell")) === "medium",
    [await shell.getAttribute("data-kl-shell"), (await shell.boundingBox()).width],
  );
  const toggle = shell.locator("[data-slot=app-shell-toggle]");
  const nav = shell.locator("[data-slot=app-shell-nav]");
  // regression: the breadcrumb sat as a strip along the header's top; its cells must fill the frame's height
  const hb = await shell.locator("[data-slot=app-shell-header]").evaluate((e) => {
    const cs = getComputedStyle(e);
    return e.getBoundingClientRect().height - 2 * parseFloat(cs.borderTopWidth);
  });
  const cb = (await shell.locator("[data-slot=breadcrumb-list]").boundingBox()).height;
  ok("shell: the breadcrumb cells fill the header frame's height", near(cb, hb), [cb, hb]);
  ok(
    "shell: the toggle cell names and controls the sidebar",
    (await toggle.getAttribute("aria-expanded")) === "true" &&
      (await toggle.getAttribute("aria-controls")) === (await nav.getAttribute("id")) &&
      (await toggle.getAttribute("aria-label")) === "Hide navigation",
    null,
  );
  await toggle.click();
  await until(async () => !(await nav.isVisible()) && (await toggle.getAttribute("aria-expanded")) === "false");
  ok(
    "shell: the toggle hides the sidebar column",
    !(await nav.isVisible()) && (await toggle.getAttribute("aria-expanded")) === "false",
    null,
  );
  const main = shell.locator("[data-slot=app-shell-main]");
  await idle(p);
  const wMain = (await main.boundingBox()).width;
  await toggle.click();
  await until(async () => (await nav.isVisible()) && (await main.boundingBox()).width < wMain - 100);
  ok(
    "shell: …and shows it again (the page narrows by the column and a gutter)",
    (await nav.isVisible()) && (await main.boundingBox()).width < wMain - 100,
    null,
  );
  await idle(p);
  const wMain2 = (await main.boundingBox()).width;
  const r0 = main.getByRole("button", { name: /Rotterdam/ });
  await r0.focus();
  await p.keyboard.press("Enter");
  const asideSheet0 = p.getByRole("dialog", { name: "Shipment SHP-24018" });
  await asideSheet0.waitFor();
  await idle(p);
  ok(
    "shell: medium, a row opens the aside as an end sheet and the page keeps its width",
    (await asideSheet0.isVisible()) && near((await main.boundingBox()).width, wMain2),
    null,
  );
  await p.keyboard.press("Escape");
  await asideSheet0.waitFor({ state: "hidden" });
  await idle(p);

  await sec.getByRole("radio", { name: "600px (sheets)" }).click();
  await until(
    async () =>
      (await shell.getAttribute("data-kl-shell")) === "narrow" &&
      (await shell.locator("[data-slot=app-shell-nav]").count()) === 0,
  );
  ok(
    "shell: at 600px of its own width the shell is narrow and the sidebar leaves the page",
    (await shell.getAttribute("data-kl-shell")) === "narrow" &&
      (await shell.locator("[data-slot=app-shell-nav]").count()) === 0,
    null,
  );
  await idle(p);
  await toggle.click();
  const navSheet = p.getByRole("dialog", { name: "Navigation" });
  await until(() => navSheet.isVisible());
  await idle(p);
  ok("shell: narrow, the toggle opens the sidebar as a start sheet", await navSheet.isVisible(), null);
  await navSheet.getByRole("button", { name: /Carriers/ }).click();
  await until(async () => !(await navSheet.isVisible()) && (await shell.getByText("Carriers").first().isVisible()));
  ok(
    "shell: choosing a place closes the sheet and the place changes",
    !(await navSheet.isVisible()) && (await shell.getByText("Carriers").first().isVisible()),
    null,
  );
  await idle(p);
  const row = main.getByRole("button", { name: /Hamburg/ });
  // keyboard: WebKit (like Safari) does not focus a clicked button, so focus return is a keyboard path
  await row.focus();
  await p.keyboard.press("Enter");
  const asideSheet = p.getByRole("dialog", { name: "Shipment SHP-24019" });
  await until(() => asideSheet.isVisible());
  await idle(p);
  ok("shell: narrow, a row (Enter) opens the aside as an end sheet", await asideSheet.isVisible(), null);
  await p.keyboard.press("Escape");
  const rowFocused = () => row.evaluate((e) => e === document.activeElement);
  await until(async () => !(await asideSheet.isVisible()) && (await rowFocused()));
  ok(
    "shell: Escape closes the aside sheet and focus returns to the row",
    !(await asideSheet.isVisible()) && (await rowFocused()),
    null,
  );
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});

test("shell: wide layout, aside inline, inspector close", async ({ open, ok }) => {
  // wide: a viewport where the shell has room for all three columns
  const w = await open({ width: 1700, ready: READY });
  const sec = w.locator("#shell");
  await sec.scrollIntoViewIfNeeded();
  const shell = sec.locator('[data-slot="app-shell"]');
  ok("shell: wide layout with room for the aside", (await shell.getAttribute("data-kl-shell")) === "wide", [
    await shell.getAttribute("data-kl-shell"),
    (await shell.boundingBox()).width,
  ]);
  const main = shell.locator("[data-slot=app-shell-main]");
  await main.getByRole("button", { name: /Rotterdam/ }).click();
  const inline = () => shell.locator("[data-slot=app-shell-aside]").getByText("SHP-24018").first().isVisible();
  await until(inline);
  await idle(w);
  ok(
    "shell: wide, a row opens the aside inline (not a dialog) and the breadcrumb ends at the shipment",
    (await inline()) &&
      (await w.getByRole("dialog").count()) === 0 &&
      (await shell.locator('[aria-current="page"]').first().textContent()).includes("SHP-24018"),
    null,
  );
  ok(
    "shell: wide, the page keeps at least 320px beside the sidebar and aside",
    (await main.boundingBox()).width >= 320,
    (await main.boundingBox()).width,
  );
  await shell.locator("[data-slot=app-shell-aside]").getByRole("button", { name: "Close inspector" }).click();
  await until(async () => (await shell.locator("[data-slot=app-shell-aside]").count()) === 0);
  ok(
    "shell: closing the inspector removes the aside",
    (await shell.locator("[data-slot=app-shell-aside]").count()) === 0,
    null,
  );
  ok("shell (wide page): no page errors", w.errs.length === 0, w.errs);
});
