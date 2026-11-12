import "./render-count";

import * as React from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarItem,
  MenubarMenu,
  MenubarPopup,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSubmenuPopup,
  MenubarSubmenuRoot,
  MenubarSubmenuTrigger,
  MenubarTrigger,
} from "@/components/keyline/ui/menubar";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <Menubar>
    <MenubarMenu open>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarPopup>{part}</MenubarPopup>
    </MenubarMenu>
  </Menubar>
);

describeConformance("menubar", {
  Menubar: {
    element: (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menubar",
  },
  MenubarTrigger: {
    element: <MenubarTrigger>File</MenubarTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "menubar-trigger",
    wrap: (part) => (
      <Menubar>
        <MenubarMenu>{part}</MenubarMenu>
      </Menubar>
    ),
  },
  MenubarPopup: {
    element: (
      <MenubarPopup>
        <MenubarItem>New</MenubarItem>
      </MenubarPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) => (
      <Menubar>
        <MenubarMenu open>
          <MenubarTrigger>File</MenubarTrigger>
          {part}
        </MenubarMenu>
      </Menubar>
    ),
  },
  MenubarItem: {
    element: <MenubarItem>New</MenubarItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-item",
    wrap: open,
  },
  MenubarCheckboxItem: {
    element: <MenubarCheckboxItem>Status bar</MenubarCheckboxItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-checkbox-item",
    wrap: open,
  },
  MenubarRadioGroup: {
    element: (
      <MenubarRadioGroup defaultValue="24">
        <MenubarRadioItem value="24">24 rows</MenubarRadioItem>
      </MenubarRadioGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-radio-group",
    wrap: open,
  },
  MenubarRadioItem: {
    element: <MenubarRadioItem value="24">24 rows</MenubarRadioItem>,
    refInstanceof: HTMLDivElement,
    slot: "menu-radio-item",
    wrap: (part) => open(<MenubarRadioGroup defaultValue="24">{part}</MenubarRadioGroup>),
  },
  MenubarSeparator: {
    element: <MenubarSeparator />,
    refInstanceof: HTMLDivElement,
    slot: "menu-separator",
    wrap: open,
  },
  MenubarGroup: {
    element: (
      <MenubarGroup>
        <MenubarItem>New</MenubarItem>
      </MenubarGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-group",
    wrap: open,
  },
  MenubarGroupLabel: {
    element: <MenubarGroupLabel>Rows</MenubarGroupLabel>,
    refInstanceof: HTMLDivElement,
    slot: "menu-group-label",
    wrap: (part) => open(<MenubarGroup>{part}</MenubarGroup>),
  },
  MenubarSubmenuTrigger: {
    element: <MenubarSubmenuTrigger>Export</MenubarSubmenuTrigger>,
    refInstanceof: HTMLDivElement,
    slot: "menu-submenu-trigger",
    wrap: (part) => open(<MenubarSubmenuRoot>{part}</MenubarSubmenuRoot>),
  },
  MenubarSubmenuPopup: {
    element: (
      <MenubarSubmenuPopup>
        <MenubarItem>CSV</MenubarItem>
      </MenubarSubmenuPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) =>
      open(
        <MenubarSubmenuRoot open>
          <MenubarSubmenuTrigger>Export</MenubarSubmenuTrigger>
          {part}
        </MenubarSubmenuRoot>,
      ),
  },
});

/** Three menus in a bar between two page fields; the menus portal into the page's landmark. */
function Example({ layout, cut }: { layout?: "control" | "cell"; cut?: boolean }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    // whole-pixel layout: Base UI places the popup on whole pixels, so the bar's edges are whole too
    <main
      ref={setMain}
      data-kl-cut={cut ? "on" : undefined}
      style={{
        padding: 40,
        display: "grid",
        gridTemplateRows: "40px auto 40px",
        justifyItems: "start",
        alignItems: "start",
      }}
    >
      <input aria-label="Before" />
      <Menubar layout={layout}>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPopup container={main}>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
            <MenubarSubmenuRoot>
              <MenubarSubmenuTrigger>Export</MenubarSubmenuTrigger>
              <MenubarSubmenuPopup container={main}>
                <MenubarItem>CSV</MenubarItem>
              </MenubarSubmenuPopup>
            </MenubarSubmenuRoot>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPopup container={main}>
            <MenubarItem>Copy</MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPopup container={main}>
            <MenubarCheckboxItem defaultChecked>Status bar</MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup defaultValue="24">
              <MenubarGroupLabel>Rows</MenubarGroupLabel>
              <MenubarRadioItem value="24">24 rows</MenubarRadioItem>
              <MenubarRadioItem value="48">48 rows</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarPopup>
        </MenubarMenu>
      </Menubar>
      <input aria-label="After" />
    </main>
  );
}

const bar = () => document.querySelector<HTMLElement>('[data-slot="menubar"]')!;
const titles = () => [...document.querySelectorAll<HTMLElement>('[data-slot="menubar-trigger"]')];
const title = (name: string) => titles().find((t) => t.textContent === name)!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="menu-popup"]');
const openTitle = () => titles().find((t) => t.hasAttribute("data-popup-open"));

async function openFile() {
  title("File").focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => popup()!.contains(document.activeElement)).toBe(true);
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("menubar: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openFile();
    await expectNoAxeViolations();
  });
});

describe("menubar: keyboard", () => {
  it("Left/Right move between titles, wrapping", async () => {
    await render(<Example />);
    title("File").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(title("Edit"));
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(title("File"));
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(title("View"));
  });

  it("with a menu open, Right/Left open the neighbouring menu", async () => {
    await render(<Example />);
    await openFile();
    // focus on a plain row: Right on a submenu row would open the submenu
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => openTitle()?.textContent).toBe("Edit");
    await expect.poll(() => popup()?.textContent).toContain("Copy");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => openTitle()?.textContent).toBe("File");
  });

  it("Escape closes the menu and returns focus to its title", async () => {
    await render(<Example />);
    await openFile();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => openTitle()).toBeUndefined();
    await expect.poll(() => document.activeElement).toBe(title("File"));
  });
});

describe("menubar: construction", () => {
  for (const [layout, weight] of [
    ["control", "2px"],
    ["cell", "1px"],
  ] as const) {
    it(`${layout}: the menu docks under its title, its top border on the bar's bottom keyline at ${weight}`, async () => {
      await render(<Example layout={layout} />);
      await openFile();
      const p = popup()!;
      const b = bar().getBoundingClientRect();
      const barBottom = parseFloat(getComputedStyle(bar()).borderBottomWidth);
      expect(getComputedStyle(p).borderTopWidth).toBe(weight);
      expect(p.getBoundingClientRect().top).toBeCloseTo(b.bottom - barBottom, 1);
      expect(p.getBoundingClientRect().left).toBeCloseTo(title("File").getBoundingClientRect().left, 1);
    });
  }

  it("the open title is the inverse cell", async () => {
    await render(<Example />);
    const tone = (v: string) => {
      const i = document.createElement("i");
      i.style.color = `var(${v})`;
      bar().append(i);
      const c = getComputedStyle(i).color;
      i.remove();
      return c;
    };
    await openFile();
    const cs = getComputedStyle(title("File"));
    expect(cs.backgroundColor).toBe(tone("--kl-inverse"));
    expect(cs.color).toBe(tone("--kl-on-inverse"));
    expect(getComputedStyle(title("Edit")).backgroundColor).not.toBe(tone("--kl-inverse"));
  });

  it("with the cut on, only the first title clears the frame's corner", async () => {
    await render(<Example cut />);
    // the frame's cut, resolved (a custom property reads back unresolved)
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:var(--kl-c)";
    bar().append(probe);
    const c = probe.getBoundingClientRect().width;
    probe.remove();
    expect(c).toBeGreaterThan(0);
    const [first, second] = titles();
    expect(parseFloat(getComputedStyle(first!).paddingInlineStart)).toBeCloseTo(14 + c * 0.35, 1);
    expect(getComputedStyle(second!).paddingInlineStart).toBe("14px");
  });
});
