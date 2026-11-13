import "./render-count";

import * as React from "react";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectList,
  SelectPopup,
  SelectRoot,
  SelectScrollDownArrow,
  SelectScrollUpArrow,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/keyline/ui/select";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const ITEMS = { rtm: "Rotterdam", ant: "Antwerp" };

const root = (part: React.ReactNode) => (
  <SelectRoot items={ITEMS} defaultValue="rtm">
    {part}
  </SelectRoot>
);
const inTrigger = (part: React.ReactNode) => root(<SelectTrigger aria-label="Port">{part}</SelectTrigger>);
const inPopup = (part: React.ReactNode) => (
  <SelectRoot items={ITEMS} defaultValue="rtm" open>
    <SelectTrigger aria-label="Port" />
    <SelectPopup>
      <SelectList>{part}</SelectList>
    </SelectPopup>
  </SelectRoot>
);
const inItem = (part: React.ReactNode) => inPopup(<SelectItem value="rtm">{part}</SelectItem>);

describeConformance("select", {
  SelectLabel: {
    element: <SelectLabel>Port</SelectLabel>,
    refInstanceof: HTMLDivElement,
    slot: "select-label",
    wrap: root,
  },
  SelectTrigger: {
    element: <SelectTrigger aria-label="Port" />,
    refInstanceof: HTMLButtonElement,
    slot: "select-trigger",
    // not `button: true`: Base UI gives the trigger the combobox role, not button
    wrap: root,
  },
  SelectValue: {
    element: <SelectValue />,
    refInstanceof: HTMLSpanElement,
    slot: "select-value",
    wrap: inTrigger,
  },
  SelectIcon: {
    element: <SelectIcon />,
    refInstanceof: HTMLSpanElement,
    slot: "select-icon",
    wrap: inTrigger,
  },
  SelectPopup: {
    element: (
      <SelectPopup>
        <SelectList>
          <SelectItem value="rtm">Rotterdam</SelectItem>
        </SelectList>
      </SelectPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "select-popup",
    wrap: (part) => (
      <SelectRoot items={ITEMS} open>
        <SelectTrigger aria-label="Port" />
        {part}
      </SelectRoot>
    ),
  },
  SelectList: {
    element: (
      <SelectList>
        <SelectItem value="rtm">Rotterdam</SelectItem>
      </SelectList>
    ),
    refInstanceof: HTMLDivElement,
    slot: "select-list",
    wrap: (part) => (
      <SelectRoot items={ITEMS} open>
        <SelectTrigger aria-label="Port" />
        <SelectPopup>{part}</SelectPopup>
      </SelectRoot>
    ),
  },
  SelectItem: {
    element: <SelectItem value="rtm">Rotterdam</SelectItem>,
    refInstanceof: HTMLDivElement,
    slot: "select-item",
    wrap: inPopup,
  },
  SelectItemText: {
    element: <SelectItemText>Rotterdam</SelectItemText>,
    refInstanceof: HTMLDivElement,
    slot: "select-item-text",
    wrap: inItem,
  },
  SelectItemIndicator: {
    element: <SelectItemIndicator />,
    refInstanceof: HTMLSpanElement,
    slot: "select-item-indicator",
    wrap: inItem,
  },
  SelectGroup: {
    element: (
      <SelectGroup>
        <SelectGroupLabel>Ports</SelectGroupLabel>
      </SelectGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "select-group",
    wrap: inPopup,
  },
  SelectGroupLabel: {
    element: <SelectGroupLabel>Ports</SelectGroupLabel>,
    refInstanceof: HTMLDivElement,
    slot: "select-group-label",
    wrap: (part) => inPopup(<SelectGroup>{part}</SelectGroup>),
  },
  SelectSeparator: {
    element: <SelectSeparator />,
    refInstanceof: HTMLDivElement,
    slot: "select-separator",
    wrap: inPopup,
  },
  // the arrows render while the list can scroll; keepMounted keeps them in the document for the contract
  SelectScrollUpArrow: {
    element: <SelectScrollUpArrow keepMounted />,
    refInstanceof: HTMLDivElement,
    slot: "select-scroll-up-arrow",
    wrap: (part) => (
      <SelectRoot items={ITEMS} open>
        <SelectTrigger aria-label="Port" />
        <SelectPopup>
          {part}
          <SelectList>
            <SelectItem value="rtm">Rotterdam</SelectItem>
          </SelectList>
        </SelectPopup>
      </SelectRoot>
    ),
  },
  SelectScrollDownArrow: {
    element: <SelectScrollDownArrow keepMounted />,
    refInstanceof: HTMLDivElement,
    slot: "select-scroll-down-arrow",
    wrap: (part) => (
      <SelectRoot items={ITEMS} open>
        <SelectTrigger aria-label="Port" />
        <SelectPopup>
          <SelectList>
            <SelectItem value="rtm">Rotterdam</SelectItem>
          </SelectList>
          {part}
        </SelectPopup>
      </SelectRoot>
    ),
  },
});

const OPTIONS = [
  { value: "rtm", label: "Rotterdam Europoort", group: "Netherlands", code: "NLRTM" },
  { value: "ams", label: "Amsterdam Westpoort", group: "Netherlands" },
  { value: "ant", label: "Antwerp Deurganck", group: "Belgium", description: "Left bank" },
  { value: "zee", label: "Zeebrugge", group: "Belgium", disabled: true },
];

/** The select and its popup (portalled into the host, inside the page's landmark), between two page fields. */
function Example(props: Partial<React.ComponentProps<typeof Select<string>>>) {
  const [host, setHost] = React.useState<HTMLElement | null>(null);
  return (
    <main>
      {/* text fields: every engine tabs to them (WebKit on macOS does not tab to buttons by default) */}
      <input aria-label="Before" />
      <div data-testid="host" ref={setHost}>
        <Select label="Port" options={OPTIONS} defaultValue="rtm" container={host} {...props} />
      </div>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="select-trigger"]')!;
const isOpen = () => trigger().hasAttribute("data-popup-open");
const shown = () => document.querySelector('[data-slot="select-value"]')!.textContent;
/** Open, with focus in the list (WebKit moves it there after the open; a key pressed before lands on the trigger). */
const inList = () => !!document.activeElement?.closest('[data-slot="select-popup"]');
const highlighted = () => document.querySelector('[data-slot="select-item"][data-highlighted]')?.textContent ?? "";

async function landed() {
  const popup = document.querySelector<HTMLElement>('[data-slot="select-popup"]')!;
  await expect.poll(() => popup.hasAttribute("data-starting-style")).toBe(false);
  await Promise.all(popup.getAnimations().map((a) => a.finished));
}

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("select: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(isOpen).toBe(true);
    await landed();
    // open, Base UI makes the rest of the page inert; the open state is judged on the select and its popup
    await expectNoAxeViolations(document.querySelector('[data-testid="host"]')!);
  });
});

describe("select: keyboard", () => {
  for (const key of ["Enter", " ", "ArrowDown"]) {
    it(`${key === " " ? "Space" : key} opens the list on the chosen option`, async () => {
      await render(<Example />);
      trigger().focus();
      await userEvent.keyboard(key === " " ? " " : `{${key}}`);
      await expect.poll(isOpen).toBe(true);
      await expect.poll(highlighted).toContain("Rotterdam Europoort");
    });
  }

  it("typeahead moves the cursor to the option that starts with the typed text", async () => {
    await render(<Example />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(inList).toBe(true);
    await userEvent.keyboard("ant");
    await expect.poll(highlighted).toContain("Antwerp Deurganck");
    await userEvent.keyboard("{Enter}");
    await expect.poll(isOpen).toBe(false);
    expect(shown()).toBe("Antwerp Deurganck");
  });

  it("Escape closes the list, returns focus to the trigger and keeps the value", async () => {
    await render(<Example />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(highlighted).toContain("Rotterdam Europoort");
    await expect.poll(inList).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(highlighted).toContain("Amsterdam Westpoort");
    await userEvent.keyboard("{Escape}");
    await expect.poll(isOpen).toBe(false);
    await expect.poll(() => document.activeElement).toBe(trigger());
    expect(shown()).toBe("Rotterdam Europoort");
  });

  it("Tab leaves the trigger at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(trigger());
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(trigger());
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });

  it("passes Base UI's event details through onValueChange", async () => {
    const calls: unknown[][] = [];
    await render(<Example onValueChange={(...args) => calls.push(args)} />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(highlighted).toContain("Rotterdam Europoort");
    await expect.poll(inList).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(highlighted).toContain("Amsterdam Westpoort");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => calls.length).toBe(1);
    const [value, details] = calls[0] as [string, { reason: string; event: Event }];
    expect(value).toBe("ams");
    expect(details.reason).toBe("item-press");
    expect(details.event).toBeInstanceOf(Event);
  });
});

describe("select: style", () => {
  it("the caret cell is inverse only while the list is open", async () => {
    await render(<Example />);
    const icon = document.querySelector<HTMLElement>('[data-slot="select-icon"]')!;
    const inverse = color("var(--kl-inverse)");
    expect(getComputedStyle(icon).backgroundColor).not.toBe(inverse);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(isOpen).toBe(true);
    await expect.poll(() => getComputedStyle(icon).backgroundColor).toBe(inverse);
  });

  it("the placeholder is the faint ink; a value is the trigger's ink", async () => {
    await render(
      <main>
        <Select label="Chosen" options={OPTIONS} defaultValue="rtm" />
        <Select label="Empty" options={OPTIONS} placeholder="Choose a port" />
      </main>,
    );
    const [chosen, empty] = [...document.querySelectorAll<HTMLElement>('[data-slot="select-value"]')];
    expect(empty!.textContent).toBe("Choose a port");
    expect(getComputedStyle(empty!).color).toBe(color("var(--kl-ink-3)"));
    expect(getComputedStyle(chosen!).color).toBe(color("var(--kl-ink)"));
  });

  it("a long value truncates in its cell and the caret cell keeps 36px", async () => {
    await render(
      <main style={{ width: 180 }}>
        <Select label="Port" options={OPTIONS} defaultValue="rtm" />
      </main>,
    );
    const value = document.querySelector<HTMLElement>('[data-slot="select-value"]')!;
    const icon = document.querySelector<HTMLElement>('[data-slot="select-icon"]')!;
    expect(getComputedStyle(value).textOverflow).toBe("ellipsis");
    expect(value.scrollWidth).toBeGreaterThan(value.clientWidth);
    expect(icon.getBoundingClientRect().width).toBe(36);
  });

  it("a group label is in the code voice: mono, the code size, proportional figures", async () => {
    await render(<Example open />);
    const label = document.querySelector<HTMLElement>('[data-slot="select-group-label"]')!;
    const cs = getComputedStyle(label);
    const probe = document.createElement("span");
    probe.style.fontFamily = "var(--kl-font-mono)";
    probe.style.fontSize = "var(--kl-text-code)";
    document.body.append(probe);
    const mono = getComputedStyle(probe);
    expect(cs.fontFamily).toBe(mono.fontFamily);
    expect(cs.fontSize).toBe(mono.fontSize);
    probe.remove();
    // the stylesheet's `font` shorthand reset the figures; the popup's tabular figures must not reach the label
    expect(cs.fontVariantNumeric).toBe("normal");
  });

  it("only the chosen row shows its mark", async () => {
    await render(<Example open />);
    const marks = [...document.querySelectorAll<HTMLElement>('[data-slot="select-item-indicator"]')];
    expect(marks.map((m) => getComputedStyle(m).visibility)).toEqual(["visible", "hidden", "hidden", "hidden"]);
  });

  it("the list docks under the trigger, sharing its 2px edge, and is at least the trigger's width", async () => {
    // the trigger alone, so its edges are whole pixels (a label above it would put them on a fraction), clear of
    // the list's 12px collision padding
    await render(
      <main style={{ padding: 24 }}>
        <SelectRoot items={ITEMS} defaultValue="rtm" open>
          <SelectTrigger aria-label="Port" />
          <SelectPopup>
            <SelectList>
              <SelectItem value="rtm">Rotterdam</SelectItem>
              <SelectItem value="ant">Antwerp</SelectItem>
            </SelectList>
          </SelectPopup>
        </SelectRoot>
      </main>,
    );
    await landed();
    const t = trigger().getBoundingClientRect();
    const p = document.querySelector<HTMLElement>('[data-slot="select-popup"]')!.getBoundingClientRect();
    expect(p.top).toBe(t.bottom - 2);
    expect(p.left).toBe(t.left);
    expect(p.width).toBeGreaterThanOrEqual(t.width);
  });
});
