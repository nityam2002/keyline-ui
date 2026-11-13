// AppShell before any script runs: the server's HTML is laid out by CSS alone (a container query on the shell),
// so nothing moves at hydration. The rendered shell is copied into boxes of chosen widths, where no React runs:
// only CSS decides which columns take room. Both the default breakpoints (the parts' utilities, keyed on data-kl-at)
// and other ones (the shell's own <style>) are checked; the specimen sets narrowAt 640 and asideInlineAt 1000.
import { test } from "./fixtures.mjs";
test.use({ only: ["shell"] });

test("shell: before any script, CSS lays the columns out for the shell's width", async ({ open, ok }) => {
  // the specimen's box is at its 1100px cap here, so the shell is wide (past asideInlineAt) and the aside is a column
  const p = await open({ width: 1920, ready: '#shell [data-slot=app-shell][data-kl-shell="wide"]' });
  // a row opens the aside beside the page, so the copy holds every column with its own classes
  await p
    .locator("#shell")
    .getByRole("button", { name: /^Rotterdam Europoort/ })
    .click();
  await p.locator("#shell [data-slot=app-shell] > [data-slot=app-shell-aside]").waitFor();
  const layout = (at, width) =>
    p.evaluate(
      ({ at, width }) => {
        const src = document.querySelector("#shell [data-slot=app-shell]");
        const box = document.createElement("div");
        box.style.cssText = `width:${width}px;position:absolute;top:0;left:0`;
        const shell = src.cloneNode(true);
        // as the server renders it: every column present, unmeasured
        shell.setAttribute("data-kl-shell", "wide");
        shell.setAttribute("data-kl-nav", "open");
        shell.querySelector(":scope > [data-slot=app-shell-nav]")?.removeAttribute("hidden");
        if (at !== "own") {
          shell.setAttribute("data-kl-at", at);
          shell.querySelector(":scope > style")?.remove();
        }
        box.append(shell);
        document.body.append(box);
        const shown = (s) => {
          const e = shell.querySelector(`:scope > ${s}`);
          return getComputedStyle(e).display !== "none";
        };
        const main = shell.querySelector(":scope > [data-slot=app-shell-main]").getBoundingClientRect();
        const nav = shell.querySelector(":scope > [data-slot=app-shell-nav]").getBoundingClientRect();
        const r = {
          nav: shown("[data-slot=app-shell-nav]"),
          aside: shown("[data-slot=app-shell-aside]"),
          mainStart: Math.round(main.left),
          mainEnd: Math.round(main.right),
          navEnd: Math.round(nav.right),
          w: Math.round(shell.getBoundingClientRect().width),
        };
        box.remove();
        return r;
      },
      { at, width },
    );
  for (const [at, narrowAt, inlineAt] of [
    ["own", 640, 1000],
    ["960-1400", 960, 1400],
  ]) {
    const name = at === "own" ? "its own <style> (640/1000)" : "the default breakpoints (960/1400)";
    const narrow = await layout(at, narrowAt - 1);
    ok(
      `shell, ${name}: below narrowAt only the page takes room, the full width`,
      !narrow.nav && !narrow.aside && narrow.mainStart === 0 && narrow.mainEnd === narrow.w,
      narrow,
    );
    const mid = await layout(at, narrowAt);
    ok(
      `shell, ${name}: at narrowAt the sidebar is back, the page runs to the end`,
      mid.nav && !mid.aside && mid.mainStart > mid.navEnd && mid.mainEnd === mid.w,
      mid,
    );
    const midTop = await layout(at, inlineAt - 1);
    ok(
      `shell, ${name}: just below asideInlineAt the aside still takes no room`,
      midTop.nav && !midTop.aside && midTop.mainEnd === midTop.w,
      midTop,
    );
    const wide = await layout(at, inlineAt);
    ok(
      `shell, ${name}: at asideInlineAt sidebar, page and aside`,
      wide.nav && wide.aside && wide.mainEnd < wide.w,
      wide,
    );
  }
});
