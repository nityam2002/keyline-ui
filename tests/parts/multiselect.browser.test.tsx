import "./render-count";

import * as React from "react";
import { Multiselect, type MultiselectOption } from "@/components/keyline/ui/multiselect";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

/*
 * Multiselect exports no parts of its own: it is a preset over Combobox's parts (whose wrapper contract
 * combobox.browser.test.tsx runs). Here: the preset's markup, keyboard and look.
 */

const CARRIERS: MultiselectOption[] = [
  { value: "msc", label: "MSC", count: 412 },
  { value: "maersk", label: "Maersk", count: 29 },
  { value: "dsv", label: "DSV Road", description: "Groupage" },
  { value: "dhl", label: "DHL Freight", disabled: true },
];

const load = (q: string) => Promise.resolve(CARRIERS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase())));

/** The multiselect and its list (portalled into the host, inside the page's landmark), between two page fields. */
function Example(props: Partial<React.ComponentProps<typeof Multiselect>>) {
  const [host, setHost] = React.useState<HTMLElement | null>(null);
  return (
    <main>
      {/* text fields: every engine tabs to them (WebKit on macOS does not tab to buttons by default) */}
      <input aria-label="Before" />
      <div data-testid="host" ref={setHost}>
        <Multiselect
          label="Carriers"
          loadOptions={load}
          noun={["carrier", "carriers"]}
          container={host}
          defaultValue={[CARRIERS[0]!]}
          {...props}
        />
      </div>
      <input aria-label="After" />
    </main>
  );
}

const input = () => document.querySelector<HTMLInputElement>('[data-slot="combobox-input"]')!;
const isOpen = () => input().getAttribute("aria-expanded") === "true";
const chips = () =>
  [...document.querySelectorAll('[data-slot="combobox-chip"]')].map((c) => c.getAttribute("aria-label"));
const options = () => [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent);
const status = () => document.querySelector('[data-slot="combobox-status"]')?.textContent ?? "";
const highlighted = () => document.querySelector('[role="option"][data-highlighted]')?.textContent ?? "";

async function openByKeyboard() {
  input().focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(isOpen).toBe(true);
  await expect.poll(status).toBe("4 carriers");
}

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("multiselect: markup", () => {
  it("is a combobox over a multi-selectable list; className reaches the field", async () => {
    await render(<Example className="from-field" />);
    expect(input().getAttribute("role")).toBe("combobox");
    expect(document.querySelector('[data-slot="multiselect"]')!.classList.contains("from-field")).toBe(true);
    await openByKeyboard();
    expect(document.querySelector('[role="listbox"]')!.getAttribute("aria-multiselectable")).toBe("true");
  });
});

describe("multiselect: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // open, Base UI hides the rest of the page from assistive technology; judge the field and its list
    await expectNoAxeViolations(document.querySelector('[data-testid="host"]')!);
  });

  it("every chip's remove cell, and Clear, are named", async () => {
    await render(<Example defaultValue={[CARRIERS[0]!, CARRIERS[1]!]} />);
    const names = [...document.querySelectorAll('[data-slot="combobox-chip-remove"]')].map((b) =>
      b.getAttribute("aria-label"),
    );
    expect(names).toEqual(["Remove MSC", "Remove Maersk"]);
    await openByKeyboard();
    expect(document.querySelector('[data-slot="combobox-clear"]')!.getAttribute("aria-label")).toBe("Clear carriers");
  });
});

describe("multiselect: keyboard", () => {
  it("typing filters the list through loadOptions", async () => {
    await render(<Example />);
    input().focus();
    await userEvent.keyboard("ma");
    await expect.poll(isOpen).toBe(true);
    await expect.poll(status).toBe("1 match for “ma”");
    expect(options()).toEqual(["Maersk29"]);
  });

  it("Enter toggles the highlighted option; the list stays open", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(highlighted).toBe("Maersk29");
    await userEvent.keyboard("{Enter}");
    await expect.poll(chips).toEqual(["MSC", "Maersk"]);
    expect(isOpen()).toBe(true);
    await userEvent.keyboard("{Enter}");
    await expect.poll(chips).toEqual(["MSC"]);
  });

  it("Backspace in the empty input removes the last chip", async () => {
    await render(<Example defaultValue={[CARRIERS[0]!, CARRIERS[1]!]} />);
    input().focus();
    await userEvent.keyboard("{Backspace}");
    await expect.poll(chips).toEqual(["MSC"]);
  });

  it("Escape closes the list, keeps focus in the input and keeps the chips", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(isOpen).toBe(false);
    expect(document.activeElement).toBe(input());
    // a second Escape on the closed field clears nothing (Base UI would clear every chip)
    await userEvent.keyboard("{Escape}");
    expect(chips()).toEqual(["MSC"]);
  });

  it("Tab leaves the open list forward and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Tab}");
    await expect.poll(isOpen).toBe(false);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
  });

  it("Shift+Tab leaves the open list backward and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(isOpen).toBe(false);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });

  it("passes Base UI's event details through onValueChange", async () => {
    const calls: unknown[][] = [];
    await render(<Example onValueChange={(...args) => calls.push(args)} />);
    await openByKeyboard();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(highlighted).toBe("Maersk29");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => calls.length).toBe(1);
    const [value, details] = calls[0] as [MultiselectOption[], { reason: string; event: Event }];
    expect(value.map((o) => o.value)).toEqual(["msc", "maersk"]);
    expect(details.reason).toBe("item-press");
    expect(details.event).toBeInstanceOf(Event);
  });
});

describe("multiselect: style", () => {
  it("the count cell is dimmed at zero and in the ink once something is chosen", async () => {
    await render(
      <main>
        <Multiselect label="None" loadOptions={load} />
        <Multiselect label="Some" loadOptions={load} defaultValue={[CARRIERS[0]!]} />
      </main>,
    );
    const [none, some] = [...document.querySelectorAll<HTMLElement>('[data-slot="multiselect-count"]')];
    expect(none!.textContent).toBe("0");
    expect(getComputedStyle(none!).color).toBe(color("var(--kl-ink-3)"));
    expect(getComputedStyle(some!).color).toBe(color("var(--kl-ink)"));
    expect(getComputedStyle(some!).fontSize).toBe("18px");
  });

  it("every row draws its 16px check box; a chosen row floods its mark cell yellow and ticks the box", async () => {
    await render(<Example />);
    await openByKeyboard();
    const rows = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')];
    const boxes = rows.map((r) => r.querySelector<HTMLElement>('[data-slot="combobox-item-indicator"]')!);
    expect(boxes.map((b) => getComputedStyle(b).visibility)).toEqual(["visible", "visible", "visible", "visible"]);
    expect(boxes.map((b) => b.getBoundingClientRect().width)).toEqual([16, 16, 16, 16]);
    const tick = (b: HTMLElement) => getComputedStyle(b.firstElementChild!).visibility;
    expect(boxes.map(tick)).toEqual(["visible", "hidden", "hidden", "hidden"]);
    const yellow = color("var(--kl-yellow)");
    expect(getComputedStyle(rows[0]!.firstElementChild!).backgroundColor).toBe(yellow);
    expect(getComputedStyle(rows[1]!.firstElementChild!).backgroundColor).not.toBe(yellow);
    // out of service: the box is dashed
    expect(getComputedStyle(boxes[3]!).borderTopStyle).toBe("dashed");
  });

  it("the list's head is in the code voice, with proportional figures", async () => {
    await render(<Example />);
    await openByKeyboard();
    const head = getComputedStyle(document.querySelector('[data-slot="multiselect-head"]')!);
    const probe = document.createElement("span");
    probe.style.fontFamily = "var(--kl-font-mono)";
    document.body.append(probe);
    expect(head.fontFamily).toBe(getComputedStyle(probe).fontFamily);
    probe.remove();
    // the stylesheet's `font` shorthand reset the figures; the list's tabular figures must not reach the head
    expect(head.fontVariantNumeric).toBe("normal");
  });

  it("the trailing cell is a count in the plain voice, not a code", async () => {
    await render(<Example />);
    await openByKeyboard();
    const count = document.querySelector<HTMLElement>('[data-slot="combobox-item-code"]')!;
    const cs = getComputedStyle(count);
    expect(count.textContent).toBe("412");
    expect(cs.fontFamily).toBe(getComputedStyle(input()).fontFamily);
    expect(cs.fontVariantNumeric).toBe("tabular-nums");
  });
});
