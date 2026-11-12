// Interaction checks on the independent consumer (Chrome + WebKit). Exit 1 on any failure.
// Usage: node tests/consumer/flows.mjs <consumerURL>   (the app built by tests/consumer/setup.sh; see scripts/consumer-check.sh)
import { chromium, webkit } from "playwright";
const URL = process.argv[2] || "http://localhost:5295/";
let fails = 0;
const ok = (eng, name, cond, detail) => {
  console.log(`${cond ? "  ✓" : "  ✖"} [${eng}] ${name}${cond ? "" : " — " + JSON.stringify(detail)}`);
  if (!cond) fails++;
};
for (const [eng, type, opts] of [
  ["chromium", chromium, { channel: "chrome" }],
  ["webkit", webkit, {}],
]) {
  const b = await type.launch(opts);
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(URL + "?cut=on");
  await p.waitForTimeout(700);
  const toasts = () => p.locator("[data-slot=toast-root]").allTextContents();

  // dialog: async failure → retry succeeds; closing while pending cancels
  await p.getByRole("button", { name: "Book pickup…" }).click();
  const dlg = p.getByRole("dialog");
  await dlg.waitFor();
  ok(eng, "dialog: focus starts inside the dialog", await dlg.evaluate((d) => d.contains(document.activeElement)));
  ok(
    eng,
    "dialog: inherits cut 1 (a non-default value, so inheritance is what is tested) from where it is written",
    (await dlg.evaluate((d) => getComputedStyle(d).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await dlg.locator("[data-slot=select] [role=combobox]").click();
  const lb = p.locator("[role=listbox]:visible");
  await lb.waitFor();
  ok(
    eng,
    "select in dialog: listbox inherits cut 1 (a non-default value, so inheritance is what is tested)",
    (await lb.evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await lb.locator("[role=option]", { hasText: "DSV Road" }).click();
  ok(eng, "select in dialog: choosing keeps the dialog open", await dlg.isVisible());
  await dlg.getByRole("button", { name: "Book pickup" }).click();
  await dlg.getByRole("alert").waitFor({ timeout: 3000 });
  ok(
    eng,
    "async failure: dialog stays open with an alert and a retry",
    (await dlg.getByRole("button", { name: "Try again" }).count()) === 1,
  );
  await dlg.getByRole("button", { name: "Try again" }).click();
  await p.waitForTimeout(200);
  await p.keyboard.press("Escape"); // close while pending → cancels
  await p.waitForTimeout(1200);
  ok(eng, "close while pending: nothing booked", !(await toasts()).some((t) => /booked/.test(t)), await toasts());
  ok(
    eng,
    "close: focus returns to the trigger",
    await p.evaluate(() => document.activeElement?.textContent?.includes("Book pickup")),
  );
  await p.getByRole("button", { name: "Book pickup…" }).click();
  await dlg.getByRole("button", { name: /Book pickup|Try again/ }).click();
  await p.waitForTimeout(1300);
  ok(
    eng,
    "retry after failure succeeds and confirms",
    (await toasts()).some((t) => /booked/.test(t)),
    await toasts(),
  );

  // records: select, bulk reassign, Undo restores each owner
  const rows = p.locator("table tbody tr");
  const owners = async () => Promise.all([0, 1, 2].map((i) => rows.nth(i).locator("td").last().textContent()));
  const before = await owners();
  for (const i of [1, 2]) await rows.nth(i).getByRole("checkbox").click();
  await p.getByRole("button", { name: /Give to Ada/ }).click();
  ok(
    eng,
    "bulk: selected rows reassigned",
    JSON.stringify(await owners()) === JSON.stringify([before[0], "Ada", "Ada"]),
  );
  await p.getByRole("button", { name: "Undo" }).last().click();
  ok(
    eng,
    "Undo restores each row's own owner",
    JSON.stringify(await owners()) === JSON.stringify(before),
    await owners(),
  );
  await p.getByRole("region", { name: "Purchase orders" }).getByRole("button", { name: "Next page" }).click();
  ok(eng, "pagination: range moves", /9–16/.test(await p.locator("bdi").first().textContent()));
  // Carrier rules (accordion of cells, combobox, sliders, select parts) and uploads (progress, context menu)
  const term = p.getByRole("combobox", { name: "Delivery terminal" });
  await term.scrollIntoViewIfNeeded();
  ok(
    eng,
    "combobox: installed, controlled value shows its label",
    (await term.inputValue()) === "Rotterdam ECT Delta",
    await term.inputValue(),
  );
  await term.fill("");
  await p.keyboard.type("hamb");
  const cbOpts = p.locator("[role=listbox]:visible [role=option]");
  await cbOpts.first().waitFor();
  ok(
    eng,
    "combobox: filters and lists a closed terminal as disabled",
    (await cbOpts.count()) === 2 && (await cbOpts.nth(1).getAttribute("aria-disabled")) === "true",
    await cbOpts.count(),
  );
  ok(
    eng,
    "combobox: list inherits cut 1 (a non-default value, so inheritance is what is tested) in the portal",
    (await p
      .locator("[role=listbox]:visible")
      .evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await p.keyboard.press("Enter");
  ok(
    eng,
    "combobox: Enter chooses; the accordion header's meta follows",
    (await term.inputValue()) === "Hamburg Altenwerder" &&
      (await p.getByRole("button", { name: /Route/ }).textContent()).includes("HAM-CTA"),
  );
  const gross = p.getByRole("slider", { name: "Max gross weight" });
  await gross.focus();
  for (let i = 0; i < 4; i++) await p.keyboard.press("ArrowLeft");
  ok(
    eng,
    "slider: keyboard steps; header meta follows",
    (await gross.getAttribute("aria-valuenow")) === "36" &&
      (await p.getByRole("button", { name: /Limits/ }).textContent()).includes("36 t"),
  );
  ok(
    eng,
    "slider range: two named thumbs",
    (await p.getByRole("slider", { name: "Delivery window, to" }).count()) === 1,
  );
  await p.getByRole("button", { name: /Tolerances/ }).click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "collapsible: opens and its slider is reachable",
    await p.getByRole("slider", { name: "Weight tolerance" }).isVisible(),
  );
  await p.getByRole("button", { name: /Escalation/ }).click();
  await p.waitForTimeout(300);
  const esc = p.getByRole("combobox", { name: "Escalate to", exact: true }).last();
  ok(eng, "select parts: trigger shows the label", (await esc.textContent()).includes("Shift lead"));
  await esc.click();
  await p.locator("[role=listbox]:visible").waitFor();
  ok(eng, "select parts: two group headings", (await p.locator("[role=listbox]:visible [role=group]").count()) === 2);
  await p.locator("[role=listbox]:visible [role=option]", { hasText: "Regional director" }).click();
  ok(
    eng,
    "select parts: choosing updates trigger and header",
    (await esc.textContent()).includes("Regional director") &&
      (await p.getByRole("button", { name: /Escalation/ }).textContent()).includes("Regional director"),
  );
  await p.getByRole("button", { name: "Save rules" }).click();
  await p.waitForTimeout(400);
  ok(
    eng,
    "save: the toast carries every chosen value",
    (await toasts()).some((t) => /HAM-CTA, 36 t, 6–18 h, Regional director/.test(t)),
    await toasts(),
  );
  const up = p.getByRole("progressbar", { name: "Packing list" });
  ok(eng, "progress: value exposed", (await up.getAttribute("aria-valuenow")) === "64");
  await p.getByRole("button", { name: "Advance", exact: true }).click();
  ok(eng, "progress: advances", (await up.getAttribute("aria-valuenow")) === "76");
  ok(
    eng,
    "progress: failed says so",
    /Failed/.test(
      (await p.getByRole("progressbar", { name: "EUR.1 certificate" }).getAttribute("aria-valuetext")) || "",
    ),
  );
  const row = p
    .getByRole("button", { name: /EUR\.1 certificate\. Context menu/ })
    .or(p.locator("[aria-label^='EUR.1 certificate.']"));
  await row.first().scrollIntoViewIfNeeded();
  await row.first().click({ button: "right" });
  const menu = p.getByRole("menu").first();
  await menu.waitFor();
  ok(
    eng,
    "context menu: opens on right-click, inherits cut 1 (a non-default value, so inheritance is what is tested)",
    (await menu.evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  // WebKit moves focus into the menu a frame after it is shown; keys pressed before that go to the row
  await p.waitForFunction(() => !!document.activeElement?.closest("[role=menu]"));
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(300);
  ok(eng, "context menu: submenu opens by keyboard", (await p.getByRole("menu").count()) === 2);
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(200);
  await menu.getByRole("menuitem", { name: "Retry upload" }).click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "context menu: action runs; recovery clears the failed bar",
    (await p.getByRole("progressbar", { name: "EUR.1 certificate" }).getAttribute("data-failed")) === null &&
      (await p.getByRole("status").filter({ hasText: "Retrying" }).count()) === 1,
  );
  // Dispatch. react-hook-form booking form → sortable bookings table, view menu, empty, pagination
  const crumbs = p.getByRole("navigation", { name: "Breadcrumb" });
  await crumbs.scrollIntoViewIfNeeded();
  ok(
    eng,
    "breadcrumb: installed; here is aria-current and cobalt",
    (await crumbs.locator("[aria-current=page]").innerText()) === "Bookings" &&
      (await crumbs.locator("[aria-current=page]").evaluate((e) => getComputedStyle(e).backgroundColor)) !==
        "rgba(0, 0, 0, 0)",
  );
  const form = p.getByRole("form", { name: "New booking" });
  const refIn = form.getByLabel("Reference", { exact: true });
  const flb = await form.locator(".kl-field-label").first().boundingBox();
  const fb = await form.locator(".kl-field-frame").first().boundingBox();
  const fw = (await form.boundingBox()).width;
  ok(
    eng,
    "form: responsive orientation follows the form's own width (under 560px: label above)",
    fw < 560 && flb.y + flb.height <= fb.y + 1 && Math.abs(flb.x - fb.x) <= 1,
    { fw, flb, fb },
  );
  await form.getByRole("button", { name: "Add booking" }).click();
  await p.waitForTimeout(150);
  ok(
    eng,
    "rhf: required error shows in the Keyline field (! cell, message)",
    (await form.getByText("Enter a booking reference.").isVisible()) &&
      (await form.locator(".kl-field").first().getAttribute("data-invalid")) !== null,
  );
  await refIn.fill("BK-7");
  const pal = form.getByLabel("Pallets", { exact: true });
  await pal.focus();
  for (let i = 0; i < 3; i++) await p.keyboard.press("ArrowUp");
  ok(
    eng,
    "number field: controlled through Controller (12 → 15)",
    (await pal.inputValue()) === "15",
    await pal.inputValue(),
  );
  await form.getByRole("combobox", { name: "Service level" }).click();
  await p.locator("[role=listbox]:visible [role=option]", { hasText: "Express" }).click();
  const car = form.getByRole("combobox", { name: "Carrier" });
  await car.fill("geo");
  await p.locator("[role=listbox]:visible [role=option]").first().waitFor();
  await p.keyboard.press("Enter");
  await form.getByRole("button", { name: "Add booking" }).click();
  await p.waitForTimeout(500);
  ok(
    eng,
    "rhf: a duplicate reference comes back as a field error (setError)",
    await form.getByText("BK-7 is already booked.").isVisible(),
  );
  await refIn.fill("BK-40");
  await form.getByRole("button", { name: "Add booking" }).click();
  await p.waitForTimeout(600);
  ok(
    eng,
    "rhf: submit carries every control's value into the toast",
    (await toasts()).some((t) => /Booked BK-40: 15 PLT, exp, GEO/.test(t)),
    await toasts(),
  );
  const tbl = p.getByRole("table", { name: "Bookings" });
  // the installed CSS styles the parts (a shallow merge in the build once shipped table and field without their base rules)
  const th0 = await tbl
    .locator("thead th")
    .first()
    .evaluate((e) => {
      const c = getComputedStyle(e);
      return { pos: c.position, bb: c.borderBottomWidth };
    });
  const fr0 = await form
    .locator(".kl-field-frame")
    .first()
    .evaluate((e) => {
      const c = getComputedStyle(e);
      return { d: c.display, bw: c.borderTopWidth };
    });
  ok(
    eng,
    "css: table and field base rules arrived (sticky header with its keyline; 2px flex frame)",
    th0.pos === "sticky" && th0.bb === "1px" && fr0.d === "flex" && fr0.bw === "2px",
    { th0, fr0 },
  );
  ok(
    eng,
    "table: the new booking is the first row",
    (await tbl.locator("tbody tr").first().locator("td").first().innerText()) === "BK-40",
  );
  await tbl.getByRole("button", { name: "Pallets" }).click();
  ok(
    eng,
    "sort: pallets starts high-to-low (33 first), aria-sort descending",
    (await tbl.locator("tbody tr").first().locator("td").nth(2).innerText()) === "33" &&
      (await tbl.locator("th[aria-sort=descending]").count()) === 1,
  );
  await tbl.getByRole("button", { name: "Reference" }).click();
  ok(
    eng,
    "sort: reference ascending is numeric-aware (BK-1, BK-2, BK-3)",
    (await tbl.locator("tbody tr td:first-child").allInnerTexts()).slice(0, 3).join(",") === "BK-1,BK-2,BK-3",
    await tbl.locator("tbody tr td:first-child").allInnerTexts(),
  );
  const pages = p.getByRole("navigation", { name: "Bookings pages" });
  ok(
    eng,
    "pagination: 14 bookings at 5 per page is 3 pages",
    (await pages.getByRole("button", { name: "Page 3" }).count()) === 1 &&
      (await pages.getByRole("button", { name: "Page 4" }).count()) === 0,
  );
  await pages.getByRole("button", { name: "Next page" }).click();
  ok(
    eng,
    "pagination: Next shows BK-9 first on page 2",
    (await pages.locator("[aria-current=page]").innerText()) === "2" &&
      (await tbl.locator("tbody tr td:first-child").first().innerText()) === "BK-9",
    await tbl.locator("tbody tr td:first-child").first().innerText(),
  );
  await p.getByRole("button", { name: "View", exact: true }).click();
  await p.getByRole("menu").waitFor();
  await p.getByRole("menuitemcheckbox", { name: "Gross weight" }).click();
  await p.getByRole("menuitemradio", { name: "10" }).click();
  ok(
    eng,
    "view menu: stays open while choosing; column hidden; 10 rows; back to page 1",
    (await p.getByRole("menu").isVisible()) &&
      (await tbl.locator("thead th").count()) === 3 &&
      (await tbl.locator("tbody tr").count()) === 10 &&
      (await pages.locator("[aria-current=page]").innerText()) === "1",
  );
  ok(
    eng,
    "view menu: inherits cut 1 (a non-default value, so inheritance is what is tested) in its portal",
    (await p.getByRole("menu").evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await p.keyboard.press("Escape");
  await p.getByRole("searchbox", { name: "Search bookings" }).fill("zzz");
  ok(
    eng,
    "empty: no match shows an Empty row with the way out; pagination shows –",
    (await tbl.getByText("No bookings match “zzz”").isVisible()) &&
      (await pages.locator(".kl-pg-of").innerText()) === "–",
  );
  await tbl.getByRole("button", { name: "Clear search" }).click();
  ok(eng, "empty: Clear search recovers the rows", (await tbl.locator("tbody tr").count()) === 10);
  // Base UI Form collects Select, Combobox and TimeField by name; server errors land on the field
  const pk = p.getByRole("form", { name: "Pickup" });
  ok(
    eng,
    "skeleton: busy group gives way to the slots",
    (await pk.locator("[aria-busy=true]").count()) === 0 && (await pk.getByText("10:00–12:00").count()) === 1,
  );
  await pk.getByRole("button", { name: "Request pickup" }).click();
  await p.waitForTimeout(200);
  ok(
    eng,
    "form: required combobox and time field show their messages",
    (await pk.locator("[data-slot=combobox][data-invalid]").count()) === 1 &&
      (await pk.getByText("Enter a time.").isVisible()),
  );
  await pk.getByRole("combobox", { name: "Pickup carrier" }).fill("dhl");
  await p.locator("[role=listbox]:visible [role=option]").first().waitFor();
  await p.keyboard.press("Enter");
  const hh = pk.getByRole("spinbutton", { name: "Hours" });
  await hh.click();
  await p.keyboard.type("1630");
  ok(
    eng,
    "time field: typing 1630 fills both parts",
    (await hh.inputValue()) === "16" && (await pk.getByRole("spinbutton", { name: "Minutes" }).inputValue()) === "30",
  );
  await pk.getByRole("button", { name: "Request pickup" }).click();
  await p.waitForTimeout(200);
  ok(
    eng,
    "form: a rejected value comes back as the time field's error",
    await pk.getByText("The dock closes at 16:00.").isVisible(),
  );
  await hh.focus();
  await p.keyboard.press("PageDown");
  await pk.getByRole("button", { name: "Request pickup" }).click();
  await p.waitForTimeout(400);
  ok(
    eng,
    "form: values reach onFormSubmit by name",
    (await toasts()).some((t) => /Pickup 10:30 with DHL, std/.test(t)),
    await toasts(),
  );
  // TanStack Table with Keyline sort headers; the Menubar hides a column
  const ln = p.getByRole("table", { name: "Lanes" });
  await ln.getByRole("button", { name: "Rate (EUR)" }).click();
  ok(
    eng,
    "tanstack: rate sorts high-to-low first with aria-sort",
    (await ln.locator("tbody tr td:last-child").first().innerText()) === "2,310" &&
      (await ln.locator("th[aria-sort=descending]").count()) === 1,
  );
  await ln.getByRole("button", { name: "Rate (EUR)" }).click();
  ok(
    eng,
    "tanstack: second click is ascending",
    (await ln.locator("tbody tr td:last-child").first().innerText()) === "720",
  );
  const mb = p.getByRole("menubar", { name: "Lanes" });
  await mb.getByRole("menuitem", { name: "View" }).click();
  await p.getByRole("menuitemcheckbox", { name: "Carrier" }).click();
  ok(eng, "menubar: hiding Carrier leaves 3 columns", (await ln.locator("thead th").count()) === 3);
  ok(
    eng,
    "menubar: the menu inherits cut 1 (a non-default value, so inheritance is what is tested) in its portal",
    (await p.getByRole("menu").evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  ok(
    eng,
    "menubar: Escape returns focus to its trigger",
    await p.evaluate(
      () => document.activeElement?.textContent === "View" && !!document.activeElement.closest("[role=menubar]"),
    ),
  );
  // A cell Toolbar (one Tab stop) filters a queue; a CheckboxGroup in a popover; a CheckboxGroup in a Form
  const tb = p.getByRole("toolbar", { name: "Exceptions" });
  await tb.scrollIntoViewIfNeeded();
  await tb.getByRole("textbox", { name: "Search exceptions" }).focus();
  await p.keyboard.press("Tab");
  ok(
    eng,
    "toolbar: one Tab stop (Tab leaves the toolbar)",
    await tb.evaluate((t) => !t.contains(document.activeElement)),
  );
  const excRows = () => p.getByRole("list", { name: "Exception list" }).locator("li, [role=listitem]").count();
  ok(eng, "toolbar: open state shows 3", (await excRows()) === 3, await excRows());
  await tb.getByRole("button", { name: "All" }).click();
  ok(eng, "toolbar: exclusive filter → All shows 4", (await excRows()) === 4);
  ok(eng, "toolbar: exclusive group keeps one pressed", (await tb.locator("[aria-pressed=true]").count()) === 1);
  await tb.getByRole("button", { name: "Open" }).focus();
  await p.keyboard.press("ArrowRight");
  ok(
    eng,
    "toolbar: arrows move between items",
    await p.evaluate(() => document.activeElement?.textContent?.trim() === "Closed"),
  );
  await tb.getByRole("button", { name: "Carrier" }).click();
  ok(
    eng,
    "toolbar menu: inherits cut 1 (a non-default value, so inheritance is what is tested) in its portal",
    (await p.getByRole("menu").evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await p.getByRole("menuitemcheckbox", { name: "DSV" }).click();
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  ok(eng, "toolbar menu: unchecking DSV leaves 2", (await excRows()) === 2);
  ok(
    eng,
    "toolbar menu: Escape returns focus to its trigger",
    await p.evaluate(() => document.activeElement?.textContent?.includes("Carrier")),
  );
  await p.getByRole("button", { name: /^Kind/ }).click();
  const kg = p.getByRole("group", { name: "Kind" });
  await kg.waitFor();
  ok(
    eng,
    "checkbox group in popover: inherits cut 1 (a non-default value, so inheritance is what is tested)",
    (await kg.evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await kg.getByRole("checkbox", { name: "Damaged pallet" }).click();
  ok(
    eng,
    "checkbox group: parent is mixed after one",
    (await kg.getByRole("checkbox", { name: "Every kind" }).getAttribute("aria-checked")) === "mixed",
  );
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  ok(eng, "checkbox group in popover: filters the queue to 1", (await excRows()) === 1);
  const al = p.getByRole("form", { name: "Alerts" });
  const ev = al.getByRole("group", { name: "Alert me about" });
  await ev.getByRole("checkbox", { name: "All events" }).click();
  ok(
    eng,
    "checkbox group: select all skips the disabled option",
    (await ev.getByRole("checkbox", { name: "Proof of delivery" }).getAttribute("aria-checked")) === "false" &&
      (await ev.getByRole("checkbox", { name: "Customs hold" }).getAttribute("aria-checked")) === "true",
  );
  await ev.getByRole("checkbox", { name: "All events" }).click();
  await al.getByRole("button", { name: "Save alerts" }).click();
  await p.waitForTimeout(200);
  ok(
    eng,
    "checkbox group: validate shows its error when none is checked",
    await al.getByText("Choose at least one event.").isVisible(),
  );
  await ev.getByRole("checkbox", { name: "Customs hold" }).click();
  await al.getByRole("button", { name: "Save alerts" }).click();
  await p.waitForTimeout(200);
  ok(
    eng,
    "checkbox group: a Form error reaches it by name",
    await al.getByText("Customs alerts need late-pickup alerts too.").isVisible(),
  );
  await ev.getByRole("checkbox", { name: "Late pickup" }).click();
  await al.getByRole("button", { name: "Save alerts" }).click();
  await p.waitForTimeout(400);
  ok(
    eng,
    "checkbox group: values reach onFormSubmit by name",
    (await toasts()).some((t) => /Alerts: (late, customs|customs, late)\./.test(t)),
    await toasts(),
  );
  // TanStack multi-sort through TableSortHeader's Shift + press
  await ln
    .getByRole("button", { name: /Lane/ })
    .first()
    .click({ modifiers: ["Shift"] });
  await p.waitForTimeout(150);
  ok(
    eng,
    "tanstack: Shift + press adds a second level (numbered 1, 2; aria-sort on the first only)",
    (await ln.locator("thead .kl-sort-n").allTextContents()).sort().join(",") === "1,2" &&
      (await ln.locator("th[aria-sort=ascending], th[aria-sort=descending]").count()) === 1,
    await ln.locator("thead .kl-sort-n").allTextContents(),
  );
  // Manifests: command rows on Toolbar with overflow, multi-sort, signal
  const mf = p.getByRole("region", { name: "Manifests" });
  await mf.scrollIntoViewIfNeeded();
  const mtools = mf.getByRole("toolbar", { name: "Manifest tools" });
  const macts = mf.getByRole("toolbar", { name: "Manifest actions" });
  const stops = (t) =>
    t.evaluate((x) => [...x.querySelectorAll("button, a, input")].filter((e) => e.tabIndex === 0).length);
  ok(
    eng,
    "manifests: the views end and the bulk actions are toolbars, one Tab stop each",
    (await stops(mtools)) === 1 && (await stops(macts)) === 1,
  );
  ok(eng, "manifests: wide, no More item", (await mf.locator(".kl-tb-overflow").count()) === 0);
  await mf.getByRole("checkbox", { name: "MF-31" }).click();
  await mf.getByRole("checkbox", { name: "MF-33" }).click();
  await p.getByRole("radio", { name: "Narrow" }).click();
  await p.waitForTimeout(350);
  const more = macts.locator(".kl-tb-overflow");
  ok(
    eng,
    "manifests narrow: actions collapse into More; Seal (primary) stays in the row",
    (await more.count()) === 1 && (await macts.getByRole("button", { name: "Seal" }).isVisible()),
  );
  ok(
    eng,
    "manifests narrow: the rows fit inside the frame",
    await macts.evaluate(
      (t) =>
        [...t.children]
          .filter((c) => !/fixed|absolute/.test(getComputedStyle(c).position))
          .reduce((s, c) => s + c.getBoundingClientRect().width, 0) <=
        t.clientWidth + 1,
    ),
  );
  await more.click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "manifests narrow: the More menu inherits cut 1 (a non-default value, so inheritance is what is tested) in its portal",
    (await p.getByRole("menu").evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  );
  await p.getByRole("menuitem", { name: "Print labels" }).click();
  await p.waitForTimeout(150);
  ok(
    eng,
    "manifests narrow: Print labels (moved into More) runs its command from the menu",
    /Printed 2/.test(await p.getByTestId("mf-log").innerText()),
    await p.getByTestId("mf-log").innerText(),
  );
  await macts.getByRole("button", { name: "Seal" }).click();
  await p.waitForTimeout(80);
  ok(
    eng,
    "manifests: Seal shows pending (aria-busy) while it works",
    (await macts.getByRole("button", { name: "Seal" }).getAttribute("aria-busy")) === "true",
  );
  await p.waitForTimeout(600);
  ok(
    eng,
    "manifests: then done",
    (await macts.getByRole("button", { name: "Seal" }).getAttribute("data-signal")) === "done" &&
      /Sealed 2/.test(await p.getByTestId("mf-log").innerText()),
  );
  await p.getByRole("radio", { name: "Wide" }).click();
  await p.waitForTimeout(350);
  ok(
    eng,
    "manifests wide again: every action is back and More goes",
    (await mf.locator(".kl-tb-overflow").count()) === 0 &&
      (await macts.getByRole("button", { name: "Print labels" }).isVisible()),
  );
  const mt = mf.getByRole("table", { name: "Manifest rows" });
  await mt.getByRole("button", { name: /Pallets/ }).click({ modifiers: ["Shift"] });
  await p.waitForTimeout(150);
  const order = await mt
    .locator("tbody tr")
    .evaluateAll((rs) => rs.map((r) => [...r.children].map((c) => c.textContent.trim())));
  ok(
    eng,
    "multi-sort: Dock, then Pallets high-to-low (D1 33, 8, 8; D2 20, 12, 5)",
    order.map((r) => `${r[1]}:${r[3]}`).join(",") === "D1:33,D1:8,D1:8,D2:20,D2:12,D2:5",
    order,
  );
  ok(
    eng,
    "multi-sort: the second level says its place in text",
    /sort 2 of 2, descending/.test(await mt.locator("th", { hasText: "Pallets" }).locator(".kl-sr").textContent()),
  );
  await mt.getByRole("button", { name: /Carrier/ }).click();
  await p.waitForTimeout(150);
  ok(
    eng,
    "multi-sort: a plain press sorts by Carrier alone",
    /carrier ascending$/.test(await p.getByTestId("mf-log").innerText()) &&
      (await mt.locator(".kl-sort-n").count()) === 0,
    await p.getByTestId("mf-log").innerText(),
  );
  // Dock booking: DateTimePicker and 12-hour TimeField in a Keyline Form inside a shadcn Card
  const db = p.getByRole("region", { name: "Dock booking" });
  await db.scrollIntoViewIfNeeded();
  await db.getByRole("button", { name: "Book slot" }).click();
  await p.waitForTimeout(200);
  ok(
    eng,
    "dock booking: the empty required slot fails with its message, and its ! cell opens",
    (await db.getByText("Choose a date and time.").isVisible()) &&
      (await db
        .locator("[data-slot=date-time-picker] .kl-field-bang")
        .evaluate((e) => e.getBoundingClientRect().width)) >= 28,
  );
  await db.getByRole("button", { name: /^Slot( |$)/ }).click();
  await p.waitForTimeout(350);
  const pop = p.getByRole("dialog").last();
  ok(
    eng,
    "dock booking: the picker's popup inherits the page's cut in its portal",
    (await pop.evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-cut").trim())) === "1",
  ); // the page runs at ?cut=on (a non-default value)
  // The calendar is react-day-picker; its month/year dropdowns work inside the portal (en-US)
  await pop.getByRole("combobox", { name: "Year" }).click();
  await p.waitForTimeout(250);
  await p.getByRole("option", { name: "2027", exact: true }).click();
  await p.waitForTimeout(250);
  ok(
    eng,
    "dock booking: the year dropdown moves the grid in the popup, which stays open",
    (await p.getByRole("dialog").count()) >= 1 &&
      (await pop.getByRole("grid", { name: "November 2027" }).count()) === 1,
  );
  await pop.getByRole("combobox", { name: "Year" }).click();
  await p.waitForTimeout(250);
  await p.getByRole("option", { name: "2026", exact: true }).click();
  await p.waitForTimeout(250);
  ok(
    eng,
    "dock booking: day buttons carry en-US names and Keyline's flood",
    await pop
      .getByRole("button", { name: /^Tuesday, November 10, 2026$/ })
      .evaluate((e) => e.closest("[role=gridcell]") !== null && e.classList.contains("kl-flood")),
  );
  await pop.getByRole("button", { name: /November 10, 2026/ }).click();
  await pop.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("11");
  await p.keyboard.type("00");
  await p.keyboard.type("p");
  await pop.getByRole("button", { name: "Done" }).click();
  await p.waitForTimeout(300);
  await db.getByRole("button", { name: "Book slot" }).click();
  await p.waitForTimeout(250);
  ok(
    eng,
    "dock booking: 11:00 PM is outside maxTime 22:00 and refused with the 12-hour message",
    await db.getByText("Choose a time from 06:00 AM to 10:00 PM.").isVisible(),
  );
  await db.getByRole("button", { name: /^Slot( |$)/ }).click();
  await p.waitForTimeout(350);
  await pop.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("2");
  await p.keyboard.type("15");
  await p.keyboard.type("p");
  await pop.getByRole("button", { name: "Done" }).click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "dock booking: day and 12-hour time typed in the popup (Tue, Nov 10, 2026, 02:15 PM: en-US)",
    /Tue, Nov 10, 2026, 02:15 PM/.test(await db.getByRole("button", { name: /^Slot( |$)/ }).textContent()),
    await db.getByRole("button", { name: /^Slot( |$)/ }).textContent(),
  );
  ok(
    eng,
    "dock booking: Done returns focus to the trigger",
    await db.getByRole("button", { name: /^Slot( |$)/ }).evaluate((e) => e === document.activeElement),
  );
  const temp = db.getByRole("slider", { name: "Set point" });
  await temp.focus();
  for (let i = 0; i < 6; i++) await p.keyboard.press("ArrowRight");
  await db.getByRole("button", { name: "Book slot" }).click();
  await p.waitForTimeout(250);
  ok(
    eng,
    "dock booking: the slider's validate fails at 10 °C and opens its ! cell",
    (await db.getByText("Chilled goods ride at 8 °C or colder.").isVisible()) &&
      (await db.locator("[data-slot=slider] .kl-field-bang").evaluate((e) => e.getBoundingClientRect().width)) >= 28,
  );
  await temp.focus();
  for (let i = 0; i < 4; i++) await p.keyboard.press("ArrowLeft");
  await db.getByRole("button", { name: "Book slot" }).click();
  await p.waitForTimeout(400);
  ok(
    eng,
    "dock booking: values reach onFormSubmit by name, times stored 24-hour (2026-11-10T14:15, 17:30, 6)",
    (await toasts()).some((t) => /Booked: 2026-11-10T14:15 · cut-off 17:30 · 6 °C\./.test(t)),
    await toasts(),
  );
  // Workspace shell: grouped Nav with icons and identity, collapsing to a rail with tooltips
  const ws = p.getByRole("region", { name: "Workspace shell" });
  const wnav = ws.getByRole("navigation", { name: "Workspace sections" });
  ok(
    eng,
    "workspace shell: groups are lists named by their labels (Work: 2 items, Admin: 1)",
    (await wnav.getByRole("list", { name: "Work" }).getByRole("link").count()) +
      (await wnav.getByRole("list", { name: "Work" }).getByRole("button").count()) ===
      2 && (await wnav.getByRole("list", { name: "Admin" }).getByRole("button").count()) === 1,
  );
  const wcol = ws.locator(".kl-shell-nav");
  const geo = await ws.evaluate((r) => {
    const n = r.querySelector(".kl-shell-nav").getBoundingClientRect(),
      m = r.querySelector("main").getBoundingClientRect();
    return [n.bottom, m.bottom, Math.min(innerHeight, m.bottom)];
  });
  ok(
    eng,
    "workspace shell: the sidebar column ends with the page column or the viewport, not before",
    geo[0] >= geo[2] - 26 && geo[0] <= geo[1] + 1,
    geo,
  );
  await ws.getByRole("button", { name: "Collapse navigation" }).click();
  await p.waitForTimeout(250);
  ok(
    eng,
    "workspace shell: collapse makes a rail (56px), the toggle says Expand",
    Math.round((await wcol.boundingBox()).width) === 56 &&
      (await ws.getByRole("button", { name: "Expand navigation" }).getAttribute("aria-expanded")) === "false",
  );
  ok(
    eng,
    "workspace shell: rail items keep their names",
    (await wnav.getByRole("button", { name: /^Queue/ }).count()) === 1,
  );
  // real keyboard focus (a scripted .focus() after a mouse press is not focus-visible, so no tooltip): Tab from the toggle
  for (
    let i = 0;
    i < 6 && !(await p.evaluate(() => (document.activeElement?.textContent ?? "").startsWith("Lanes")));
    i++
  )
    await p.keyboard.press(eng === "webkit" ? "Alt+Tab" : "Tab");
  await p.waitForTimeout(600);
  ok(
    eng,
    "workspace shell: keyboard focus on a rail item shows its label as a tooltip",
    await p.locator("[data-slot=tooltip-popup]").filter({ hasText: "Lanes" }).isVisible(),
  );
  await p.keyboard.press("Enter");
  await p.waitForTimeout(250);
  ok(
    eng,
    "workspace shell: Enter on a rail item navigates (the shadcn Card title follows)",
    (await ws.getByText("Lanes", { exact: true }).count()) >= 1 &&
      (await wnav.getByRole("button", { name: /^Lanes/ }).getAttribute("aria-current")) === "page",
  );
  await ws.getByRole("button", { name: "Expand navigation" }).click();
  await p.waitForTimeout(250);
  // Night handover. Avatar group, hover card by keyboard focus, OTP in a shadcn Card's Form
  const ho = p.locator("section[aria-labelledby=ho-h]");
  await ho.scrollIntoViewIfNeeded();
  const watchers = ho.getByRole("group", { name: "Watchers" });
  ok(
    eng,
    "handover: watchers group shows two avatars and +3, named",
    (await watchers.locator("[role=img]").count()) === 3 &&
      (await watchers.getByRole("img", { name: "3 more" }).count()) === 1,
  );
  ok(
    eng,
    "handover: item avatars are decorative beside printed names",
    await ho
      .locator("[data-slot=item] [data-slot=avatar]")
      .evaluateAll((xs) => xs.length === 3 && xs.every((x) => x.getAttribute("aria-hidden") === "true")),
  );
  // reach the name by keyboard (WebKit tabs to links only with Option), so the focus is focus-visible
  const tab = eng === "webkit" ? "Alt+Tab" : "Tab";
  await ho.getByRole("link", { name: "Ade Okafor" }).focus();
  await p.keyboard.press("Shift+" + tab);
  await p.keyboard.press(tab);
  await p.waitForTimeout(900);
  const card = p.locator("[data-slot=hover-card-popup]");
  ok(
    eng,
    "handover: keyboard focus on a name opens its card (code U-0388), focus stays on the link",
    (await card.count()) === 1 &&
      /U-0388/.test(await card.textContent()) &&
      (await p.evaluate(() => document.activeElement?.tagName)) === "A",
  );
  ok(
    eng,
    "handover: the card is a raised overlay in Keyline type",
    await card.evaluate(
      (c) => getComputedStyle(c).fontFamily.includes("Atkinson") && getComputedStyle(c.parentElement).zIndex === "60",
    ),
  );
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  const hf = ho.locator("[data-slot=card] form");
  await hf.getByRole("button", { name: "Confirm" }).press("Enter");
  await p.waitForTimeout(200);
  ok(
    eng,
    "handover: an empty required code is invalid in the shadcn Card",
    (await hf.locator("[data-slot=otp-field]").getAttribute("data-invalid")) !== null,
  );
  await hf.getByRole("textbox", { name: "Handover code" }).focus();
  await p.keyboard.type("4820");
  await hf.getByRole("button", { name: "Confirm" }).press("Enter");
  await p.waitForTimeout(200);
  ok(
    eng,
    "handover: validate rejects the wrong code with its message",
    await hf.getByText("That code doesn't match the latest message.").isVisible(),
  );
  await hf.getByRole("textbox", { name: "Handover code" }).focus();
  await p.keyboard.press("ControlOrMeta+a").catch(() => {});
  for (let i = 0; i < 4; i++) await p.keyboard.press("Backspace");
  await hf.getByRole("textbox", { name: "Handover code" }).focus();
  await p.keyboard.type("4821");
  await hf.getByRole("button", { name: "Confirm" }).press("Enter");
  await p.waitForTimeout(400);
  ok(
    eng,
    "handover: the right code submits by name",
    (await toasts()).some((t) => /Handover confirmed: 4821\./.test(t)),
    await toasts(),
  );
  // Manifest lookup. NativeSelect required in a Form, input group cells, Kbd hint, in a shadcn Card
  const ml = p.locator("section[aria-labelledby=ml-h]");
  await ml.scrollIntoViewIfNeeded();
  const mlf = ml.locator("form");
  await mlf.getByRole("button", { name: "Search" }).press("Enter");
  await p.waitForTimeout(200);
  ok(
    eng,
    "lookup: the required native select starts on its placeholder and is invalid when empty",
    (await mlf.getByRole("combobox", { name: "Terminal" }).inputValue()) === "" &&
      (await mlf.locator("[data-slot=native-select]").getAttribute("data-invalid")) !== null,
  );
  await mlf.getByRole("combobox", { name: "Terminal" }).selectOption("ANR-PSA");
  const q19 = mlf.getByRole("textbox", { name: "Container or booking" });
  await q19.fill("MSCU1234567");
  const exact = mlf.getByRole("button", { name: "Exact match" });
  await exact.focus();
  await p.keyboard.press("Space");
  ok(
    eng,
    "lookup: the match toggle is a named toggle button inside the field frame",
    (await exact.getAttribute("aria-pressed")) === "true" &&
      (await exact.evaluate((e) => !!e.closest(".kl-field-frame"))),
  );
  const fit = await mlf
    .locator(".kl-field-frame")
    .last()
    .evaluate((f) => {
      const r = f.getBoundingClientRect();
      return [...f.querySelectorAll('[data-slot="button"][data-kl-layout="cell"], [data-slot="toggle"]')].every((c) => {
        const b = c.getBoundingClientRect();
        return b.left >= r.left - 0.5 && b.right <= r.right + 0.5;
      });
    });
  ok(eng, "lookup: button and toggle cells sit inside the frame", fit);
  ok(
    eng,
    "lookup: the hint bar holds a kbd in the theme's mono voice",
    await mlf.locator('[data-slot=field-bar] kbd[data-slot="kbd"]').evaluate(
      (k) =>
        getComputedStyle(k).fontFamily.replace(/[\s"']/g, "") ===
          getComputedStyle(k)
            .getPropertyValue("--kl-font-mono")
            .replace(/[\s"']/g, "") && k.getBoundingClientRect().height <= 24,
    ),
  );
  ok(
    eng,
    "lookup: ⌘K is named 'Command' for assistive tech",
    (await ml.locator('[data-slot="kbd-group"]').first().textContent()).includes("Command"),
  );
  await mlf.getByRole("button", { name: "Search" }).press("Enter");
  await p.waitForTimeout(400);
  ok(
    eng,
    "lookup: select and input reach onFormSubmit by name",
    (await toasts()).some((t) => /Lookup: ANR-PSA · MSCU1234567 · exact\./.test(t)),
    await toasts(),
  );
  await mlf.getByRole("button", { name: "Clear" }).click();
  ok(
    eng,
    "lookup: clear empties the input and gives it focus",
    (await q19.inputValue()) === "" && (await q19.evaluate((e) => e === document.activeElement)),
  );
  // Yard planner. NavigationMenu over a shadcn Card with a controlled Resizable split
  const yp = p.locator("section[aria-labelledby=yp-h]");
  await yp.scrollIntoViewIfNeeded();
  ok(
    eng,
    "yard: the site menu is a nav landmark",
    (await yp.getByRole("navigation", { name: "Yard site" }).count()) === 1,
  );
  const yards = yp.getByRole("button", { name: "Yards" });
  await yards.focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(500);
  const ypop = p.locator("[data-slot=navigation-menu-popup]");
  ok(
    eng,
    "yard: Enter opens the Yards panel docked under the frame, the current yard aria-current",
    (await yards.getAttribute("aria-expanded")) === "true" &&
      (await ypop.getByRole("link", { name: /North yard/ }).getAttribute("aria-current")) === "page" &&
      Math.abs(
        (await ypop.boundingBox()).y -
          ((await yp.locator("[data-slot=navigation-menu-list]").boundingBox()).y +
            (await yp.locator("[data-slot=navigation-menu-list]").boundingBox()).height -
            2),
      ) <= 1,
  );
  ok(
    eng,
    "yard: the panel is in Keyline type and raised over the page",
    await ypop.evaluate(
      (e) => getComputedStyle(e).fontFamily.includes("Atkinson") && getComputedStyle(e.parentElement).zIndex === "60",
    ),
  );
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  ok(
    eng,
    "yard: Escape closes and returns focus to Yards",
    (await yards.getAttribute("aria-expanded")) === "false" &&
      (await yards.evaluate((e) => e === document.activeElement)),
  );
  const ysep = yp.getByRole("separator", { name: "Blocks" });
  await ysep.focus();
  await p.keyboard.press("ArrowRight");
  const yv = await ysep.getAttribute("aria-valuenow");
  ok(
    eng,
    "yard: arrow keys move the seam and reach the app's state",
    Number(yv) > 30 && new RegExp(`Blocks ${yv}%`).test(await yp.getByTestId("yp-sizes").textContent()),
    [yv, await yp.getByTestId("yp-sizes").textContent()],
  );
  await p.keyboard.press("Home");
  ok(
    eng,
    "yard: Home collapses the block list",
    (await ysep.getAttribute("aria-valuenow")) === "0" &&
      /Blocks 0%/.test(await yp.getByTestId("yp-sizes").textContent()),
  );
  await p.keyboard.press("Enter");
  ok(eng, "yard: Enter restores it", Number(await ysep.getAttribute("aria-valuenow")) >= 20);
  const yb = await ysep.boundingBox();
  const y0 = Number(await ysep.getAttribute("aria-valuenow"));
  await p.mouse.move(yb.x + 0.5, yb.y + 20);
  await p.mouse.down();
  await p.mouse.move(yb.x - 40, yb.y + 20, { steps: 5 });
  await p.mouse.up();
  ok(
    eng,
    "yard: dragging the seam resizes inside the shadcn Card",
    Number(await ysep.getAttribute("aria-valuenow")) < y0,
    [y0, await ysep.getAttribute("aria-valuenow")],
  );
  // Carrier intake
  const inq = p.getByRole("form", { name: "Intake" });
  await inq.scrollIntoViewIfNeeded();
  await inq.getByRole("button", { name: "Next" }).click();
  await p.waitForTimeout(150);
  ok(
    eng,
    "intake: Next on the required step shows its alert",
    (await inq.getByRole("alert").textContent())?.includes("Choose a mode."),
  );
  await inq.locator("[data-slot=questionnaire-choice]", { hasText: "Rail" }).click();
  await inq.getByRole("button", { name: "Next" }).click();
  await p.waitForTimeout(200);
  ok(
    eng,
    "intake: focus moves to the next step's heading",
    await p.evaluate(() => document.activeElement?.textContent?.startsWith("Booking reference")),
  );
  await inq.getByRole("button", { name: "Back" }).click();
  await p.waitForTimeout(150);
  ok(eng, "intake: Back keeps the answer", await inq.locator("input[value=rail]").isChecked());
  await inq.getByRole("button", { name: "Next" }).click();
  await p.waitForTimeout(150);
  await inq.getByRole("button", { name: "Skip" }).click();
  await p.waitForTimeout(150);
  const indock = p.getByTestId("in-dock");
  ok(
    eng,
    "intake: Skip on the last step submits; the toast raised outside React is loading",
    (await indock.locator("[data-slot=toast-root]").getAttribute("data-kind")) === "loading",
  );
  await p.waitForTimeout(800);
  ok(
    eng,
    "intake: then done with the answer in its description",
    (await indock.locator("[data-slot=toast-description]").textContent()) === "Mode: rail",
  );
  const igrp = p.getByRole("group", { name: "Intake pages" });
  await igrp.getByRole("button", { name: "Previous" }).focus();
  await p.keyboard.press("Tab");
  ok(
    eng,
    "intake: button group cells are separate Tab stops",
    await p.evaluate(() => document.activeElement?.textContent?.endsWith("Next")),
  );
  ok(
    eng,
    "intake: the pending marker is a busy status",
    (await p.getByRole("status").filter({ hasText: "Checking carrier insurance" }).getAttribute("aria-busy")) ===
      "true",
  );
  const rb = p.getByTestId("in-rtl").getByRole("button");
  await rb.hover();
  await p.waitForTimeout(800);
  const tipR = await p.locator("[data-slot=tooltip-popup]").evaluate((t) => t.getBoundingClientRect().right);
  ok(
    eng,
    "intake: DirectionProvider rtl puts an inline-end tooltip on the left",
    tipR <= (await rb.boundingBox()).x + 1,
    tipR,
  );
  const ish = p.getByTestId("in-shell");
  const triage = ish.getByRole("button", { name: "Triage" });
  ok(
    eng,
    "intake sidebar: a nested item is a closed disclosure",
    (await triage.getAttribute("aria-expanded")) === "false",
  );
  await triage.click();
  await ish.getByRole("button", { name: "Stale" }).click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "intake sidebar: a nested link becomes current",
    (await ish.getByRole("button", { name: "Stale" }).getAttribute("aria-current")) === "page",
  );
  await ish.getByRole("button", { name: "More for Hazmat" }).click();
  await p.getByRole("menuitem", { name: "Remove" }).click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "intake sidebar: a row action acts on its row",
    (await ish.getByRole("button", { name: "Hazmat", exact: true }).count()) === 0,
  );
  await p.getByRole("button", { name: "Discard intake…" }).click();
  await p.waitForTimeout(300);
  ok(
    eng,
    "intake: the alert dialog opens on its safe action",
    await p.evaluate(() => document.activeElement?.textContent === "Keep"),
  );
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  // coexistence: stock shadcn keeps its own radius, font and ring after every Keyline install
  const shad = await p.getByPlaceholder("shadcn input").evaluate((e) => {
    const s = getComputedStyle(e);
    const c = getComputedStyle(e.closest("[data-slot=card]"));
    return { r: s.borderTopLeftRadius, cr: c.borderTopLeftRadius, f: s.fontFamily };
  });
  ok(
    eng,
    "shadcn: input and card keep their radius and font",
    parseFloat(shad.r) > 0 && parseFloat(shad.cr) > 0 && !/Atkinson/.test(shad.f),
    shad,
  );
  // A query pasted into a closed async field is the search shown; responses arriving out of
  // order list only the latest query's; Escape on a closed field keeps the value
  const held = (field) =>
    p.evaluate(
      (f) =>
        (window.__klc ?? []).map((r, i) => ({ i, f: r.field, q: r.q, aborted: r.aborted })).filter((r) => r.f === f),
      field,
    );
  const settle = (i) => p.evaluate((i) => window.__klc[i].settle(), i);
  for (const [id, pick, chosen] of [
    ["cs-cb", "COSCO", "COSCO"],
    ["cs-ms", "COSCO", "COSCO"],
  ]) {
    const inp = p.getByTestId(id).locator("input").first();
    await inp.scrollIntoViewIfNeeded();
    await inp.fill("hap");
    await p.waitForTimeout(150);
    let r = await held(id);
    ok(
      eng,
      `${id}: a pasted query is the live search, not superseded by the open`,
      r.at(-1)?.q === "hap" && r.filter((x) => !x.aborted).length === 1,
      r,
    );
    for (const q of ["o", "co", "cos"]) await inp.fill(q);
    await p.waitForTimeout(150);
    r = await held(id);
    await settle(r.at(-1).i);
    await p.waitForTimeout(50);
    for (const x of r.slice(0, -1)) await settle(x.i);
    await p.waitForTimeout(200);
    ok(
      eng,
      `${id}: late responses to earlier queries do not replace the latest`,
      JSON.stringify(await p.getByRole("option").allTextContents()) === JSON.stringify([pick]),
      await p.getByRole("option").allTextContents(),
    );
    await p.getByRole("option", { name: pick }).click();
    await p
      .getByRole("listbox")
      .waitFor({ state: "detached" })
      .catch(() => {});
    await inp.focus();
    await p.keyboard.press("Escape");
    await p.waitForTimeout(200);
    ok(
      eng,
      `${id}: Escape on the closed field keeps the value`,
      (await p.getByTestId(`${id}-value`).textContent()) === chosen,
      await p.getByTestId(`${id}-value`).textContent(),
    );
  }
  ok(eng, "no page errors", errs.length === 0, errs);
  await b.close();
}
console.log(fails ? `${fails} failed` : "all passed");
process.exit(fails ? 1 : 0);
