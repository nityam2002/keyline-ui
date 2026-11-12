// Assertions for tests/consumer/shadcn-optin.sh: stock shadcn components under the opt-in `keyline-shadcn` item.
//   node tests/consumer/shadcn-optin.mjs <url>
import { chromium, webkit } from "playwright";

const url = process.argv[2];
let fails = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✖"} ${msg}`);
  if (!cond) fails++;
};

for (const [eng, type, opts] of [
  ["chromium", chromium, { channel: "chrome" }],
  ["webkit", webkit, {}],
]) {
  const b = await type.launch(opts);
  const p = await b.newPage();
  await p.goto(url);
  await p.getByTestId("light-btn").waitFor();
  // a property of an element, and a --kl-* token resolved to a colour on the same element (via a probe child)
  const read = (id, prop) =>
    p.evaluate(
      ([id, prop]) =>
        getComputedStyle(id === "html" ? document.documentElement : document.querySelector(`[data-testid="${id}"]`))
          .getPropertyValue(prop)
          .trim(),
      [id, prop],
    );
  const token = (id, name) =>
    p.evaluate(
      ([id, name]) => {
        const probe = document.createElement("i");
        probe.style.color = `var(${name})`;
        document.querySelector(`[data-testid="${id}"]`).append(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      },
      [id, name],
    );
  // compare colours as the browser serialises them
  const colour = (id) =>
    p.evaluate((id) => {
      const e = document.querySelector(`[data-testid="${id}"]`);
      const probe = document.createElement("i");
      probe.style.color = getComputedStyle(e).backgroundColor;
      e.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, id);

  console.log(eng);
  ok((await read("html", "--radius")) === "0px", `--radius is 0px (got ${await read("html", "--radius")})`);
  for (const set of ["light", "dark"]) {
    ok(
      (await read(`${set}-card`, "border-radius")) === "0px",
      `${set}: card is square (got ${await read(`${set}-card`, "border-radius")})`,
    );
    ok(
      (await read(`${set}-btn`, "border-radius")) === "0px",
      `${set}: button is square (got ${await read(`${set}-btn`, "border-radius")})`,
    );
    ok(
      (await read(`${set}-rounded`, "border-radius")) === "0px",
      `${set}: a bare rounded utility is square (got ${await read(`${set}-rounded`, "border-radius")})`,
    );
    ok(
      (await colour(`${set}-btn`)) === (await token(`${set}-btn`, "--kl-cobalt")),
      `${set}: button fill is --kl-cobalt`,
    );
    ok(
      (await colour(`${set}-sidebar`)) === (await token(`${set}-sidebar`, "--kl-cell")),
      `${set}: bg-sidebar is --kl-cell (got ${await colour(`${set}-sidebar`)})`,
    );
  }
  ok((await colour("light-sidebar")) !== (await colour("dark-sidebar")), "the sidebar differs between light and dark");
  ok(
    (await read("html", "color-scheme")) === "light",
    `color-scheme is light on html (got ${await read("html", "color-scheme")})`,
  );
  ok(
    (await read("dark", "color-scheme")) === "dark",
    `color-scheme is dark in .dark (got ${await read("dark", "color-scheme")})`,
  );
  await b.close();
}
console.log(fails ? `${fails} failed` : "all passed");
process.exit(fails ? 1 : 0);
