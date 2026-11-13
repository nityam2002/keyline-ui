// Nav's parts (NavIdentity, NavAction: conformance) and the data-driven Nav: axe, the Tab order through items and a
// row's action cell, a nested item's disclosure, and aria-current on the chosen place.
import * as React from "react";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/keyline/ui/menu";
import { Nav, NavAction, NavIdentity, type NavGroup } from "@/components/keyline/ui/nav";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("nav", {
  NavIdentity: {
    element: <NavIdentity mark="R" title="Rotterdam" meta="NLRTM" />,
    refInstanceof: HTMLSpanElement,
    slot: "nav-identity",
  },
  NavAction: {
    element: <NavAction label="More for Late arrivals" />,
    refInstanceof: HTMLButtonElement,
    slot: "nav-action",
  },
});

const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const active = () => document.activeElement as HTMLElement | null;
const item = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('[data-slot="nav-item"]')].find((e) => e.textContent?.startsWith(name))!;

const GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { value: "ships", label: "Shipments", count: 12 },
      {
        value: "docks",
        label: "Docks",
        items: [
          { value: "north", label: "North quay" },
          { value: "south", label: "South quay" },
        ],
      },
    ],
  },
  {
    label: "Views",
    items: [
      {
        value: "late",
        label: "Late arrivals",
        action: (
          <Menu>
            <MenuTrigger render={<NavAction label="More for Late arrivals" />} />
            <MenuPopup>
              <MenuItem>Rename</MenuItem>
            </MenuPopup>
          </Menu>
        ),
      },
    ],
  },
];

function Places({ onValue }: { onValue?: (v: string) => void }) {
  const [value, setValue] = React.useState("ships");
  return (
    <main>
      <Nav
        layout="cell"
        label="Places"
        groups={GROUPS}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onValue?.(v);
        }}
        header={<NavIdentity mark="R" title="Rotterdam" meta="NLRTM" />}
      />
    </main>
  );
}

describe("nav: a11y", () => {
  it("has no axe violations, with groups, a nested list and a row action", async () => {
    await render(<Places />);
    await expectNoAxeViolations();
  });
});

describe("nav: keyboard", () => {
  it("Tab runs through the items in order, the row's action cell its own stop after its item", async () => {
    await render(<Places />);
    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard(TAB);
      order.push(active()?.getAttribute("aria-label") ?? active()?.textContent ?? "");
    }
    // Docks is closed (no nested link is current), so its links are out of the tab order
    expect(order).toEqual(["Shipments12", "Docks", "Late arrivals", "More for Late arrivals"]);
  });

  it("a nested item is a disclosure: Enter opens its list, and its links join the tab order", async () => {
    await render(<Places />);
    const docks = item("Docks");
    expect(docks.getAttribute("aria-expanded")).toBe("false");
    expect(docks.hasAttribute("aria-current")).toBe(false);
    docks.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => docks.getAttribute("aria-expanded")).toBe("true");
    const sub = document.getElementById(docks.getAttribute("aria-controls")!)!;
    expect(sub.getAttribute("data-slot")).toBe("nav-sub");
    expect(sub.getAttribute("aria-label")).toBe("Docks");
    await userEvent.keyboard(TAB);
    expect(active()).toBe(item("North quay"));
    await userEvent.keyboard(TAB);
    expect(active()).toBe(item("South quay"));
  });

  it("choosing a place moves aria-current to it", async () => {
    const chosen: string[] = [];
    await render(<Places onValue={(v) => chosen.push(v)} />);
    expect(item("Shipments").getAttribute("aria-current")).toBe("page");
    item("Late arrivals").focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => item("Late arrivals").getAttribute("aria-current")).toBe("page");
    expect(item("Shipments").hasAttribute("aria-current")).toBe(false);
    expect(chosen).toEqual(["late"]);
  });

  it("the action cell opens the row's menu, never choosing the row", async () => {
    const chosen: string[] = [];
    await render(<Places onValue={(v) => chosen.push(v)} />);
    const action = document.querySelector<HTMLElement>('[data-slot="nav-action"]')!;
    action.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => action.getAttribute("aria-expanded")).toBe("true");
    expect(chosen).toEqual([]);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => active()).toBe(action);
  });
});
