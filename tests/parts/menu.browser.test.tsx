import "./render-count";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
  MenuSurface,
  MenuTrigger,
} from "@/components/keyline/ui/menu";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <Menu open>
    <MenuPopup>{part}</MenuPopup>
  </Menu>
);

describeConformance("menu", {
  MenuTrigger: {
    element: <MenuTrigger>Actions</MenuTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "menu-trigger",
    button: true,
    wrap: (part) => <Menu>{part}</Menu>,
  },
  MenuPopup: {
    element: (
      <MenuPopup>
        <MenuItem>Copy</MenuItem>
      </MenuPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) => <Menu open>{part}</Menu>,
  },
  MenuSurface: {
    element: (
      <MenuSurface>
        <MenuItem>Copy</MenuItem>
      </MenuSurface>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) => (
      <Menu open>
        <MenuPrimitive.Portal>
          <MenuPrimitive.Positioner>{part}</MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      </Menu>
    ),
  },
  MenuItem: { element: <MenuItem>Copy</MenuItem>, refInstanceof: HTMLDivElement, slot: "menu-item", wrap: open },
  MenuCheckboxItem: {
    element: <MenuCheckboxItem>Wrap</MenuCheckboxItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-checkbox-item",
    wrap: open,
  },
  MenuRadioGroup: {
    element: (
      <MenuRadioGroup defaultValue="a">
        <MenuRadioItem value="a">A</MenuRadioItem>
      </MenuRadioGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-radio-group",
    wrap: open,
  },
  MenuRadioItem: {
    element: <MenuRadioItem value="a">A</MenuRadioItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-radio-item",
    wrap: (part) => open(<MenuRadioGroup defaultValue="a">{part}</MenuRadioGroup>),
  },
  MenuSeparator: { element: <MenuSeparator />, refInstanceof: HTMLDivElement, slot: "menu-separator", wrap: open },
  MenuGroup: {
    element: (
      <MenuGroup>
        <MenuItem>Copy</MenuItem>
      </MenuGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-group",
    wrap: open,
  },
  MenuGroupLabel: {
    element: <MenuGroupLabel>Edit</MenuGroupLabel>,
    refInstanceof: HTMLDivElement,
    slot: "menu-group-label",
    wrap: (part) => open(<MenuGroup>{part}</MenuGroup>),
  },
  MenuSubmenuTrigger: {
    element: <MenuSubmenuTrigger>Send to</MenuSubmenuTrigger>,
    refInstanceof: HTMLDivElement,
    slot: "menu-submenu-trigger",
    wrap: (part) => open(<MenuSubmenuRoot>{part}</MenuSubmenuRoot>),
  },
});

function Example() {
  // the popups portal into the page's landmark (a page's own concern; axe's region rule expects it)
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain}>
      <button type="button">Before</button>
      <Menu>
        <MenuTrigger>Actions</MenuTrigger>
        <MenuPopup container={main}>
          <MenuGroup>
            <MenuGroupLabel>Edit</MenuGroupLabel>
            <MenuItem code="1" shortcut="⌘C">
              Copy
            </MenuItem>
            <MenuItem code="2" description="Moves the row">
              Move
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuCheckboxItem defaultChecked>Wrap lines</MenuCheckboxItem>
          <MenuRadioGroup defaultValue="sea">
            <MenuRadioItem value="sea">Sea</MenuRadioItem>
            <MenuRadioItem value="air">Air</MenuRadioItem>
          </MenuRadioGroup>
          <MenuSubmenuRoot>
            <MenuSubmenuTrigger>Send to</MenuSubmenuTrigger>
            <MenuPopup container={main}>
              <MenuItem>Customs broker</MenuItem>
            </MenuPopup>
          </MenuSubmenuRoot>
          <MenuItem variant="destructive">Delete</MenuItem>
          <MenuItem variant="destructive" disabled>
            Cancel shipment
          </MenuItem>
        </MenuPopup>
      </Menu>
      <button type="button">After</button>
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="menu-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="menu-popup"]');

async function openByKeyboard() {
  trigger().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => document.activeElement?.closest('[data-slot="menu-popup"]')).toBe(popup());
}

describe("menu: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    await expectNoAxeViolations();
  });
});

describe("menu: keyboard", () => {
  it("Escape closes the menu and returns focus to the trigger", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => trigger().hasAttribute("data-popup-open")).toBe(false);
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("Tab leaves the open menu forward and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => trigger().hasAttribute("data-popup-open")).toBe(false);
    await expect.poll(() => document.activeElement?.textContent).toBe("After");
  });

  it("Shift+Tab leaves the open menu backward and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(() => trigger().hasAttribute("data-popup-open")).toBe(false);
    await expect.poll(() => document.activeElement?.textContent).toBe("Actions");
  });

  it("a disabled destructive row reads disabled, not red", async () => {
    await render(<Example />);
    await openByKeyboard();
    const row = [...document.querySelectorAll<HTMLElement>('[data-slot="menu-item"]')];
    const live = row.find((r) => r.textContent?.includes("Delete"))!;
    const dead = row.find((r) => r.textContent?.includes("Cancel shipment"))!;
    expect(getComputedStyle(dead).color).not.toBe(getComputedStyle(live).color);
  });
});

describe("menu: scrolling", () => {
  it("a long menu scrolls natively, in the Scroll Area's tones", async () => {
    await render(<Example />);
    await openByKeyboard();
    const tone = document.createElement("span");
    tone.style.color = "var(--kl-ink-3)";
    popup()!.append(tone);
    const ink3 = getComputedStyle(tone).color;
    tone.remove();
    const cs = getComputedStyle(popup()!);
    expect(cs.scrollbarWidth).toBe("thin");
    expect(cs.scrollbarColor).toBe(`${ink3} rgba(0, 0, 0, 0)`);
  });
});
