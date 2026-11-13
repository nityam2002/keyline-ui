import "./render-count";

import * as React from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxStatus,
  ComboboxTrigger,
} from "@/components/keyline/ui/combobox";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const ITEMS = ["Rotterdam", "Antwerp"];

const root = (part: React.ReactNode) => (
  <ComboboxRoot items={ITEMS} defaultValue="Rotterdam">
    {part}
  </ComboboxRoot>
);
const inPopup = (part: React.ReactNode) => (
  <ComboboxRoot items={ITEMS} open>
    <ComboboxPopup>{part}</ComboboxPopup>
  </ComboboxRoot>
);
const inChips = (part: React.ReactNode) => (
  <ComboboxRoot items={ITEMS} multiple defaultValue={["Rotterdam"]}>
    <ComboboxChips>{part}</ComboboxChips>
  </ComboboxRoot>
);

describeConformance("combobox", {
  ComboboxInputGroup: {
    element: (
      <ComboboxInputGroup>
        <ComboboxInput aria-label="Terminal" />
      </ComboboxInputGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "combobox-input-group",
    wrap: root,
  },
  ComboboxInput: {
    element: <ComboboxInput aria-label="Terminal" />,
    refInstanceof: HTMLInputElement,
    slot: "combobox-input",
    wrap: root,
  },
  ComboboxTrigger: {
    element: <ComboboxTrigger aria-label="Show terminals" />,
    refInstanceof: HTMLButtonElement,
    slot: "combobox-trigger",
    button: true,
    buttonTabIndex: -1,
    // beside an input, as it is used (alone, Base UI makes the trigger the combobox itself)
    wrap: (part) =>
      root(
        <>
          <ComboboxInput aria-label="Terminal" />
          {part}
        </>,
      ),
  },
  ComboboxClear: {
    element: <ComboboxClear aria-label="Clear terminal" />,
    refInstanceof: HTMLButtonElement,
    slot: "combobox-clear",
    button: true,
    buttonTabIndex: -1,
    wrap: root,
  },
  ComboboxPopup: {
    element: (
      <ComboboxPopup>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "combobox-popup",
    wrap: (part) => (
      <ComboboxRoot items={ITEMS} open>
        {part}
      </ComboboxRoot>
    ),
  },
  ComboboxStatus: {
    element: <ComboboxStatus>2 terminals</ComboboxStatus>,
    refInstanceof: HTMLDivElement,
    slot: "combobox-status",
    wrap: inPopup,
  },
  ComboboxList: {
    element: (
      <ComboboxList>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    ),
    refInstanceof: HTMLDivElement,
    slot: "combobox-list",
    wrap: inPopup,
  },
  ComboboxItem: {
    element: <ComboboxItem value="Rotterdam">Rotterdam</ComboboxItem>,
    refInstanceof: HTMLDivElement,
    slot: "combobox-item",
    wrap: (part) => inPopup(<ComboboxList>{part}</ComboboxList>),
  },
  ComboboxGroup: {
    element: (
      <ComboboxGroup items={ITEMS}>
        <ComboboxGroupLabel>Ports</ComboboxGroupLabel>
      </ComboboxGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "combobox-group",
    wrap: (part) => inPopup(<ComboboxList>{part}</ComboboxList>),
  },
  ComboboxGroupLabel: {
    element: <ComboboxGroupLabel>Ports</ComboboxGroupLabel>,
    refInstanceof: HTMLDivElement,
    slot: "combobox-group-label",
    wrap: (part) =>
      inPopup(
        <ComboboxList>
          <ComboboxGroup items={ITEMS}>{part}</ComboboxGroup>
        </ComboboxList>,
      ),
  },
  ComboboxEmpty: {
    element: <ComboboxEmpty>No terminals</ComboboxEmpty>,
    refInstanceof: HTMLDivElement,
    slot: "combobox-empty",
    wrap: inPopup,
  },
  ComboboxChips: {
    element: (
      <ComboboxChips>
        <ComboboxInput aria-label="Terminals" />
      </ComboboxChips>
    ),
    refInstanceof: HTMLDivElement,
    slot: "combobox-chips",
    wrap: (part) => (
      <ComboboxRoot items={ITEMS} multiple defaultValue={["Rotterdam"]}>
        {part}
      </ComboboxRoot>
    ),
  },
  ComboboxChip: {
    element: <ComboboxChip aria-label="Rotterdam">Rotterdam</ComboboxChip>,
    refInstanceof: HTMLDivElement,
    slot: "combobox-chip",
    wrap: inChips,
  },
  ComboboxChipRemove: {
    element: <ComboboxChipRemove aria-label="Remove Rotterdam" />,
    refInstanceof: HTMLButtonElement,
    slot: "combobox-chip-remove",
    button: true,
    buttonTabIndex: -1,
    wrap: (part) => inChips(<ComboboxChip aria-label="Rotterdam">{part}</ComboboxChip>),
  },
});

const OPTIONS = [
  { value: "rtm", label: "Rotterdam Europoort", group: "Rotterdam", code: "NLRTM" },
  { value: "ant", label: "Antwerp Deurganck", group: "Antwerp", code: "BEANR", description: "Left bank" },
  { value: "ham", label: "Hamburg Burchardkai", group: "Hamburg", disabled: true },
];

/** The combobox and its popup (portalled into the host, inside the page's landmark), between two page fields. */
function Example() {
  const [host, setHost] = React.useState<HTMLElement | null>(null);
  return (
    <main>
      {/* text fields: every engine tabs to them (WebKit on macOS does not tab to buttons by default) */}
      <input aria-label="Before" />
      <div data-testid="host" ref={setHost}>
        <Combobox
          label="Terminal"
          options={OPTIONS}
          defaultValue="rtm"
          noun={["terminal", "terminals"]}
          container={host}
        />
      </div>
      <input aria-label="After" />
    </main>
  );
}

function Multiple() {
  return (
    <main>
      <ComboboxRoot items={ITEMS} multiple defaultValue={["Rotterdam", "Antwerp"]}>
        <ComboboxInputGroup>
          <ComboboxChips>
            {["Rotterdam", "Antwerp"].map((v) => (
              <ComboboxChip key={v} aria-label={v}>
                <span>{v}</span>
                <ComboboxChipRemove aria-label={`Remove ${v}`} />
              </ComboboxChip>
            ))}
            <ComboboxInput aria-label="Terminals" />
          </ComboboxChips>
        </ComboboxInputGroup>
      </ComboboxRoot>
    </main>
  );
}

const input = () => document.querySelector<HTMLInputElement>('[data-slot="combobox-input"]')!;
const isOpen = () => input().getAttribute("aria-expanded") === "true";

async function openByKeyboard() {
  input().focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(isOpen).toBe(true);
}

describe("combobox: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // open, Base UI hides the rest of the page from assistive technology (aria-hidden, inert) until the list
    // closes; axe flags the page's own buttons for that, so the open state is judged on the combobox and its popup
    await expectNoAxeViolations(document.querySelector('[data-testid="host"]')!);
  });

  it("has no violations with chips: every remove button has a name", async () => {
    await render(<Multiple />);
    await expectNoAxeViolations();
    const names = [...document.querySelectorAll('[data-slot="combobox-chip-remove"]')].map((b) =>
      b.getAttribute("aria-label"),
    );
    expect(names).toEqual(["Remove Rotterdam", "Remove Antwerp"]);
  });
});

describe("combobox: keyboard", () => {
  it("Escape closes the list and keeps focus and the choice in the input", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(isOpen).toBe(false);
    expect(document.activeElement).toBe(input());
    expect(input().value).toBe("Rotterdam Europoort");
  });

  it("Tab leaves the open list forward and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Tab}");
    await expect.poll(isOpen).toBe(false);
    // the clear and caret cells are not tab stops (Base UI): Tab goes on to the page's next control
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
    await render(
      <main>
        <Combobox label="Terminal" options={OPTIONS} onValueChange={(...args) => calls.push(args)} />
      </main>,
    );
    await openByKeyboard();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => calls.length).toBe(1);
    const [value, option, details] = calls[0] as [string, { value: string }, { reason: string }];
    expect(value).toBe("rtm");
    expect(option.value).toBe("rtm");
    expect(details.reason).toBe("item-press");
  });
});
