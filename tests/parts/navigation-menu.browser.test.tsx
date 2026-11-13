import "./render-count";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuCard,
  NavigationMenuContent,
  NavigationMenuGrid,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuRoot,
  NavigationMenuTrigger,
} from "@/components/keyline/ui/navigation-menu";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

/** A one-section menu, its section open (controlled), with `part` in the section's panel. */
const section = (part: React.ReactNode) => (
  <NavigationMenu value="services" aria-label="Site">
    <NavigationMenuList>
      <NavigationMenuItem value="services">
        <NavigationMenuTrigger>Services</NavigationMenuTrigger>
        {part}
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);
const inPanel = (part: React.ReactNode) => section(<NavigationMenuContent>{part}</NavigationMenuContent>);
const inList = (part: React.ReactNode) => (
  <NavigationMenu aria-label="Site">
    <NavigationMenuList>{part}</NavigationMenuList>
  </NavigationMenu>
);

describeConformance("navigation-menu", {
  NavigationMenuRoot: {
    element: (
      <NavigationMenuRoot aria-label="Site">
        <NavigationMenuList />
      </NavigationMenuRoot>
    ),
    refInstanceof: HTMLElement,
    slot: "navigation-menu",
  },
  NavigationMenu: {
    element: (
      <NavigationMenu aria-label="Site">
        <NavigationMenuList />
      </NavigationMenu>
    ),
    refInstanceof: HTMLElement,
    slot: "navigation-menu",
  },
  NavigationMenuList: {
    element: (
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    ),
    refInstanceof: HTMLUListElement,
    slot: "navigation-menu-list",
    wrap: (part) => <NavigationMenu aria-label="Site">{part}</NavigationMenu>,
  },
  NavigationMenuItem: {
    element: (
      <NavigationMenuItem>
        <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
      </NavigationMenuItem>
    ),
    refInstanceof: HTMLLIElement,
    slot: "navigation-menu-item",
    wrap: inList,
  },
  NavigationMenuTrigger: {
    element: <NavigationMenuTrigger>Services</NavigationMenuTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "navigation-menu-trigger",
    button: true,
    wrap: (part) => inList(<NavigationMenuItem value="services">{part}</NavigationMenuItem>),
  },
  NavigationMenuLink: {
    element: <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>,
    refInstanceof: HTMLAnchorElement,
    slot: "navigation-menu-link",
    wrap: (part) => inList(<NavigationMenuItem>{part}</NavigationMenuItem>),
  },
  NavigationMenuContent: {
    element: (
      <NavigationMenuContent>
        <NavigationMenuCard href="#ocean" title="Ocean freight" />
      </NavigationMenuContent>
    ),
    refInstanceof: HTMLDivElement,
    slot: "navigation-menu-content",
    wrap: section,
  },
  NavigationMenuPopup: {
    element: <NavigationMenuPopup />,
    refInstanceof: HTMLElement,
    slot: "navigation-menu-popup",
    wrap: (part) => (
      <NavigationMenuRoot value="services" aria-label="Site">
        <NavigationMenuList>
          <NavigationMenuItem value="services">
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuCard href="#ocean" title="Ocean freight" />
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        {part}
      </NavigationMenuRoot>
    ),
  },
  NavigationMenuGrid: {
    element: (
      <NavigationMenuGrid>
        <NavigationMenuCard href="#ocean" title="Ocean freight" />
      </NavigationMenuGrid>
    ),
    refInstanceof: HTMLUListElement,
    slot: "navigation-menu-grid",
    wrap: inPanel,
  },
  NavigationMenuCard: {
    element: <NavigationMenuCard href="#ocean" title="Ocean freight" />,
    refInstanceof: HTMLAnchorElement,
    slot: "navigation-menu-card",
    wrap: inPanel,
  },
});

/** Two sections and two links between page fields; the panel portals into the page's landmark. */
function Example({ cut }: { cut?: boolean }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    // whole-pixel layout: Base UI places the popup on whole pixels, so the frame's edges are whole too
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
      <NavigationMenuRoot aria-label="Site">
        <NavigationMenuList>
          <NavigationMenuItem value="services">
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuGrid>
                <NavigationMenuCard href="#ocean" title="Ocean freight" code="OCN" description="Door to door by sea." />
                <NavigationMenuCard href="#customs" title="Customs" code="CUS" description="Filing and permits." />
                <NavigationMenuCard href="#air" title="Air freight" code="AIR" description="Priority and economy." />
              </NavigationMenuGrid>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="terminals">
            <NavigationMenuTrigger>Terminals</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuGrid>
                <NavigationMenuCard href="#rtm" title="Rotterdam" code="RTM" description="Maasvlakte II." />
              </NavigationMenuGrid>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" active>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#contact">Contact</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuPopup container={main} />
      </NavigationMenuRoot>
      <input aria-label="After" />
    </main>
  );
}

const list = () => document.querySelector<HTMLElement>('[data-slot="navigation-menu-list"]')!;
const trigger = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('[data-slot="navigation-menu-trigger"]')].find(
    (t) => t.textContent === name,
  )!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="navigation-menu-popup"]');
const openTrigger = () => document.querySelector<HTMLElement>('[data-slot="navigation-menu-trigger"][data-popup-open]');

async function openServices() {
  trigger("Services").focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => openTrigger()).toBe(trigger("Services"));
  await expect.poll(() => popup()?.hasAttribute("data-starting-style")).toBe(false);
}

afterEach(async () => {
  await page.viewport(1280, 900);
});

describe("navigation-menu: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openServices();
    await expectNoAxeViolations();
  });
});

describe("navigation-menu: keyboard", () => {
  it("Left/Right move between the top-level cells", async () => {
    await render(<Example />);
    trigger("Services").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(trigger("Terminals"));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("Pricing");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(document.activeElement).toBe(trigger("Services"));
  });

  it("Tab moves between the sections' triggers", async () => {
    await render(<Example />);
    trigger("Services").focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(trigger("Terminals"));
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(trigger("Services"));
  });

  it("Enter opens a section, Tab moves into its panel, Escape closes it and returns focus to the trigger", async () => {
    await render(<Example />);
    await openServices();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.getAttribute("href")).toBe("#ocean");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => openTrigger()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger("Services"));
  });
});

describe("navigation-menu: construction", () => {
  it("the panel docks to the frame: top border on the frame's bottom keyline at k2, start edges coincide", async () => {
    await render(<Example />);
    await openServices();
    const f = list().getBoundingClientRect();
    const p = popup()!;
    expect(getComputedStyle(p).borderTopWidth).toBe("2px");
    expect(p.getBoundingClientRect().top).toBeCloseTo(f.bottom - 2, 1);
    expect(p.getBoundingClientRect().left).toBeCloseTo(f.left, 1);
  });

  it("the panel is its content's size, 600px and two columns where there is room", async () => {
    await render(<Example />);
    await openServices();
    const p = popup()!;
    const content = p.querySelector<HTMLElement>('[data-slot="navigation-menu-content"]')!;
    const cs = getComputedStyle(p);
    const inner = p.getBoundingClientRect().width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
    expect(inner).toBeCloseTo(content.getBoundingClientRect().width, 0);
    expect(content.getBoundingClientRect().width).toBe(600);
    const cols = getComputedStyle(p.querySelector('[data-slot="navigation-menu-grid"]')!).gridTemplateColumns;
    expect(cols.split(" ")).toHaveLength(2);
  });

  it("switching sections, the panel holds Base UI's measured size (--popup-height) and never cuts the content", async () => {
    await render(<Example />);
    await openServices();
    const p = popup()!;
    trigger("Terminals").click();
    // every frame of the swap, from the click on: the panel contains the content it shows
    for (let frame = 0; frame < 12; frame++) {
      const c = p.querySelector<HTMLElement>('[data-slot="navigation-menu-content"]')!.getBoundingClientRect();
      expect(p.getBoundingClientRect().height).toBeGreaterThanOrEqual(c.height + 4 - 0.5);
      await new Promise((r) => requestAnimationFrame(r));
    }
    await expect.poll(() => openTrigger()).toBe(trigger("Terminals"));
  });

  it("narrow, the panel is one column", async () => {
    await page.viewport(400, 900);
    await render(<Example />);
    await openServices();
    const content = popup()!.querySelector<HTMLElement>('[data-slot="navigation-menu-content"]')!;
    expect(content.getBoundingClientRect().width).toBe(400 - 24 - 4);
    const cols = getComputedStyle(popup()!.querySelector('[data-slot="navigation-menu-grid"]')!).gridTemplateColumns;
    expect(cols.split(" ")).toHaveLength(1);
  });

  it("the band does not count as a cell: the first cell draws no divider and clears the frame's cut, the next do not", async () => {
    await render(<Example cut />);
    const band = list().firstElementChild as HTMLElement;
    expect(band.hasAttribute("data-kl-band")).toBe(true);
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:var(--kl-c)";
    list().append(probe);
    const c = probe.getBoundingClientRect().width;
    probe.remove();
    expect(c).toBeGreaterThan(0);
    const items = [...list().querySelectorAll<HTMLElement>(':scope > [data-slot="navigation-menu-item"]')];
    expect(getComputedStyle(items[0]!).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(items[1]!).borderInlineStartWidth).toBe("1px");
    expect(parseFloat(getComputedStyle(trigger("Services")).paddingInlineStart)).toBeCloseTo(14 + c * 0.35, 1);
    expect(getComputedStyle(trigger("Terminals")).paddingInlineStart).toBe("14px");
  });

  it("the open trigger reads on the band (on-inverse); the current page's link is cobalt", async () => {
    await render(<Example />);
    const tone = (v: string) => {
      const i = document.createElement("i");
      i.style.color = `var(${v})`;
      list().append(i);
      const c = getComputedStyle(i).color;
      i.remove();
      return c;
    };
    const pricing = list().querySelector<HTMLElement>('[aria-current="page"]')!;
    expect(getComputedStyle(pricing).backgroundColor).toBe(tone("--kl-cobalt"));
    await openServices();
    await expect.poll(() => getComputedStyle(trigger("Services")).color).toBe(tone("--kl-on-inverse"));
    const band = list().firstElementChild as HTMLElement;
    expect(band.hidden).toBe(false);
    expect(getComputedStyle(band).backgroundColor).toBe(tone("--kl-inverse"));
  });
});
