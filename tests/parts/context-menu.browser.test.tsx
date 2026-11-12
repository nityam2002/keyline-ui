import "./render-count";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSubmenuPopup,
  ContextMenuSubmenuRoot,
  ContextMenuSubmenuTrigger,
  ContextMenuTrigger,
} from "@/components/keyline/ui/context-menu";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <ContextMenu open>
    <ContextMenuPopup>{part}</ContextMenuPopup>
  </ContextMenu>
);

describeConformance("context-menu", {
  ContextMenuTrigger: {
    element: <ContextMenuTrigger>Shipment SH-204832</ContextMenuTrigger>,
    refInstanceof: HTMLDivElement,
    slot: "context-menu-trigger",
    wrap: (part) => <ContextMenu>{part}</ContextMenu>,
  },
  ContextMenuPopup: {
    element: (
      <ContextMenuPopup>
        <ContextMenuItem>Copy</ContextMenuItem>
      </ContextMenuPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) => <ContextMenu open>{part}</ContextMenu>,
  },
  ContextMenuItem: {
    element: <ContextMenuItem>Copy</ContextMenuItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-item",
    wrap: open,
  },
  ContextMenuCheckboxItem: {
    element: <ContextMenuCheckboxItem>Pin</ContextMenuCheckboxItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-checkbox-item",
    wrap: open,
  },
  ContextMenuRadioGroup: {
    element: (
      <ContextMenuRadioGroup defaultValue="a">
        <ContextMenuRadioItem value="a">A</ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-radio-group",
    wrap: open,
  },
  ContextMenuRadioItem: {
    element: <ContextMenuRadioItem value="a">A</ContextMenuRadioItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-radio-item",
    wrap: (part) => open(<ContextMenuRadioGroup defaultValue="a">{part}</ContextMenuRadioGroup>),
  },
  ContextMenuSeparator: {
    element: <ContextMenuSeparator />,
    refInstanceof: HTMLDivElement,
    slot: "menu-separator",
    wrap: open,
  },
  ContextMenuGroup: {
    element: (
      <ContextMenuGroup>
        <ContextMenuItem>Copy</ContextMenuItem>
      </ContextMenuGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-group",
    wrap: open,
  },
  ContextMenuGroupLabel: {
    element: <ContextMenuGroupLabel>SH-204832</ContextMenuGroupLabel>,
    refInstanceof: HTMLDivElement,
    slot: "menu-group-label",
    wrap: (part) => open(<ContextMenuGroup>{part}</ContextMenuGroup>),
  },
  ContextMenuSubmenuTrigger: {
    element: <ContextMenuSubmenuTrigger>Send to</ContextMenuSubmenuTrigger>,
    refInstanceof: HTMLDivElement,
    slot: "menu-submenu-trigger",
    wrap: (part) => open(<ContextMenuSubmenuRoot>{part}</ContextMenuSubmenuRoot>),
  },
  ContextMenuSubmenuPopup: {
    element: (
      <ContextMenuSubmenuPopup>
        <ContextMenuItem>Customs broker</ContextMenuItem>
      </ContextMenuSubmenuPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) =>
      open(
        <ContextMenuSubmenuRoot open>
          <ContextMenuSubmenuTrigger>Send to</ContextMenuSubmenuTrigger>
          {part}
        </ContextMenuSubmenuRoot>,
      ),
  },
});

/** A focusable object with a context menu, between two page fields; the menu portals into the page's landmark. */
function Example() {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} style={{ padding: 40 }}>
      <input aria-label="Before" />
      <ContextMenu>
        <ContextMenuTrigger
          tabIndex={0}
          aria-label="Shipment SH-204832. Context menu available."
          style={{ padding: 16 }}
        >
          SH-204832
        </ContextMenuTrigger>
        <ContextMenuPopup container={main}>
          <ContextMenuGroup>
            <ContextMenuGroupLabel>SH-204832</ContextMenuGroupLabel>
            <ContextMenuItem>Open</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem defaultChecked>Pinned</ContextMenuCheckboxItem>
          <ContextMenuSubmenuRoot>
            <ContextMenuSubmenuTrigger>Send to</ContextMenuSubmenuTrigger>
            <ContextMenuSubmenuPopup container={main}>
              <ContextMenuItem>Customs broker</ContextMenuItem>
            </ContextMenuSubmenuPopup>
          </ContextMenuSubmenuRoot>
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuPopup>
      </ContextMenu>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="context-menu-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="menu-popup"]');
const isOpen = () => trigger().hasAttribute("data-popup-open");

/** The keyboard's context-menu command on the focused object. Browsers turn Shift+F10 and the Menu key into a
 *  `contextmenu` event (button 0) at the focused element; synthetic key presses skip that browser step (WebKit for
 *  both, Chromium for Shift+F10), so this sends the event the browser would. A real Menu key press is tested where
 *  the engine delivers it (Chromium). */
function contextMenuCommand() {
  const r = trigger().getBoundingClientRect();
  trigger().dispatchEvent(
    new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 0, clientX: r.left, clientY: r.bottom }),
  );
}

async function opened() {
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => popup()!.contains(document.activeElement)).toBe(true);
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

async function openByKeyboard() {
  trigger().focus();
  contextMenuCommand();
  await opened();
}

async function escapeReturnsFocus() {
  expect(isOpen()).toBe(true);
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement?.closest('[data-slot="menu-popup"]')).toBe(popup());
  await userEvent.keyboard("{Escape}");
  await expect.poll(isOpen).toBe(false);
  await expect.poll(() => document.activeElement).toBe(trigger());
}

describe("context-menu: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    await expectNoAxeViolations();
  });
});

describe("context-menu: keyboard", () => {
  it("Shift+F10 / the Menu key on the focused object opens its menu with focus inside; Escape returns focus", async () => {
    await render(<Example />);
    await openByKeyboard();
    await escapeReturnsFocus();
  });

  it.runIf(server.browser === "chromium")("a real Menu key press opens it the same way", async () => {
    await render(<Example />);
    trigger().focus();
    await userEvent.keyboard("{ContextMenu}");
    await opened();
    await escapeReturnsFocus();
  });
});

describe("context-menu: construction", () => {
  it("marks the object while its menu is open: an inset ink keyline on its own edge, and nothing else", async () => {
    await render(<Example />);
    const closed = getComputedStyle(trigger());
    expect(closed.outlineStyle).toBe("none");
    const background = closed.backgroundColor;
    await openByKeyboard();
    const cs = getComputedStyle(trigger());
    const k2 = getComputedStyle(document.documentElement).getPropertyValue("--kl-k2").trim();
    expect(cs.outlineStyle).toBe("solid");
    expect(cs.outlineWidth).toBe(k2);
    expect(cs.outlineOffset).toBe(`-${k2}`);
    expect(cs.backgroundColor).toBe(background);
  });

  it("the menu stands alone: control weight on every side, a minimum width of its own (220px)", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const cs = getComputedStyle(p);
    expect([cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth]).toEqual([
      "2px",
      "2px",
      "2px",
      "2px",
    ]);
    expect(cs.minWidth).toBe("220px");
  });
});
