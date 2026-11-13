// AppShell's parts (Root, Header, Toggle, Crumbs, Actions, Nav, Main, Aside) and the convenience AppShell: conformance,
// axe, the Tab order through the landmarks, the toggle (wide, rail, narrow sheet), and the aside sheet's eventDetails.
// The band is chosen by narrowAt and asideInlineAt against the test frame's width, never by the viewport.
import * as React from "react";
import {
  AppShell,
  AppShellActions,
  AppShellAside,
  AppShellCrumbs,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellRoot,
  AppShellToggle,
} from "@/components/keyline/ui/app-shell";
import { Nav, type NavItem } from "@/components/keyline/ui/nav";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

// every frame the tests run in is wider than 300px: the shell is wide, the aside inline
const wide = (part: React.ReactNode) => (
  <AppShellRoot narrowAt={200} asideInlineAt={300} asideOpen>
    {part}
  </AppShellRoot>
);
const inHeader = (part: React.ReactNode) => wide(<AppShellHeader>{part}</AppShellHeader>);

describeConformance("app-shell", {
  AppShellRoot: {
    element: <AppShellRoot narrowAt={200} asideInlineAt={300} />,
    refInstanceof: HTMLDivElement,
    slot: "app-shell",
  },
  AppShellHeader: { element: <AppShellHeader />, refInstanceof: HTMLElement, slot: "app-shell-header", wrap: wide },
  AppShellToggle: {
    element: <AppShellToggle />,
    refInstanceof: HTMLButtonElement,
    slot: "app-shell-toggle",
    wrap: inHeader,
  },
  AppShellCrumbs: {
    element: <AppShellCrumbs />,
    refInstanceof: HTMLDivElement,
    slot: "app-shell-crumbs",
    wrap: inHeader,
  },
  AppShellActions: {
    element: <AppShellActions />,
    refInstanceof: HTMLDivElement,
    slot: "app-shell-actions",
    wrap: inHeader,
  },
  AppShellNav: { element: <AppShellNav />, refInstanceof: HTMLDivElement, slot: "app-shell-nav", wrap: wide },
  AppShellMain: { element: <AppShellMain />, refInstanceof: HTMLElement, slot: "app-shell-main", wrap: wide },
  AppShellAside: { element: <AppShellAside />, refInstanceof: HTMLDivElement, slot: "app-shell-aside", wrap: wide },
});

const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const active = () => document.activeElement as HTMLElement | null;
const slot = (s: string) => document.querySelector<HTMLElement>(`[data-slot="${s}"]`);
const toggle = () => slot("app-shell-toggle")!;

const DOT = (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
    <rect x="5" y="5" width="6" height="6" />
  </svg>
);
const ITEMS: NavItem[] = [
  { value: "ships", label: "Shipments", icon: DOT },
  { value: "docks", label: "Docks", icon: DOT },
];

function Shell(props: Partial<React.ComponentProps<typeof AppShell>>) {
  const [value, setValue] = React.useState("ships");
  return (
    <AppShell
      narrowAt={200}
      asideInlineAt={300}
      navLabel="Sidebar"
      nav={<Nav layout="cell" label="Places" items={ITEMS} value={value} onValueChange={setValue} />}
      header={<a href="#crumb">Shipments</a>}
      actions={<button type="button">Export</button>}
      {...props}
    >
      <button type="button">In the page</button>
    </AppShell>
  );
}

describe("app-shell: a11y", () => {
  it("has no axe violations, wide with the aside open", async () => {
    await render(<Shell asideOpen aside={<button type="button">In the aside</button>} />);
    await expectNoAxeViolations();
  });

  it("has no axe violations, narrow with the sidebar sheet open", async () => {
    await render(<Shell narrowAt={100000} asideInlineAt={100000} />);
    await userEvent.click(toggle());
    await expect.poll(() => document.querySelector('[data-kl-shell-sheet="nav"]')).not.toBeNull();
    await expectNoAxeViolations();
  });
});

describe("app-shell: keyboard", () => {
  it("Tab runs through the header, the sidebar, the page and the aside, in that order", async () => {
    await render(<Shell asideOpen aside={<button type="button">In the aside</button>} />);
    const order: string[] = [];
    for (let i = 0; i < 7; i++) {
      await userEvent.keyboard(TAB);
      order.push(active()?.getAttribute("aria-label") ?? active()?.textContent ?? "");
    }
    expect(order).toEqual(["Hide sidebar", "Shipments", "Export", "Shipments", "Docks", "In the page", "In the aside"]);
    // the second "Shipments" is the current place, in the sidebar landmark
    expect(slot("app-shell-nav")!.contains(document.querySelector('[aria-current="page"]'))).toBe(true);
  });

  it("the toggle hides and shows the sidebar column, with aria-expanded and aria-controls", async () => {
    await render(<Shell />);
    const nav = slot("app-shell-nav")!;
    expect(toggle().getAttribute("aria-controls")).toBe(nav.id);
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard(TAB);
    expect(active()).toBe(toggle());
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => toggle().getAttribute("aria-expanded")).toBe("false");
    expect(slot("app-shell-nav")!.hidden).toBe(true);
    expect(toggle().getAttribute("aria-label")).toBe("Show sidebar");
    await userEvent.keyboard(" ");
    await expect.poll(() => toggle().getAttribute("aria-expanded")).toBe("true");
    expect(slot("app-shell-nav")!.hidden).toBe(false);
  });

  it('collapse="rail" keeps the column as a rail of key cells, each label still the accessible name', async () => {
    await render(<Shell collapse="rail" />);
    expect(toggle().getAttribute("aria-label")).toBe("Collapse sidebar");
    await userEvent.click(toggle());
    await expect.poll(() => slot("app-shell-nav")!.hasAttribute("data-kl-rail")).toBe(true);
    expect(slot("app-shell")!.getAttribute("data-kl-nav")).toBe("rail");
    expect(slot("app-shell-nav")!.hidden).toBe(false);
    expect(toggle().getAttribute("aria-label")).toBe("Expand sidebar");
    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="nav-item"]')];
    expect(items.map((i) => i.textContent)).toEqual(["Shipments", "Docks"]);
  });

  it("narrow: the toggle opens the start sheet, and choosing a place closes it", async () => {
    await render(<Shell narrowAt={100000} asideInlineAt={100000} />);
    expect(slot("app-shell")!.getAttribute("data-kl-shell")).toBe("narrow");
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(toggle().hasAttribute("aria-controls")).toBe(false);
    await userEvent.keyboard(TAB);
    expect(active()).toBe(toggle());
    await userEvent.keyboard("{Enter}");
    const sheet = () => document.querySelector<HTMLElement>('[data-kl-shell-sheet="nav"]');
    await expect.poll(sheet).not.toBeNull();
    expect(sheet()!.getAttribute("aria-label")).toBe("Sidebar");
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    await expect.poll(() => sheet()!.contains(active())).toBe(true);
    await userEvent.click(sheet()!.querySelector<HTMLElement>('[data-slot="nav-item"]:not([aria-current])')!);
    await expect.poll(() => toggle().getAttribute("aria-expanded")).toBe("false");
    await expect.poll(sheet).toBeNull();
  });
});

describe("app-shell: eventDetails", () => {
  it("narrow: Escape asks the aside's sheet to close, with Base UI's eventDetails", async () => {
    const calls: unknown[][] = [];
    function Probe() {
      const [open, setOpen] = React.useState(true);
      return (
        <Shell
          narrowAt={100000}
          asideInlineAt={100000}
          asideOpen={open}
          onAsideOpenChange={(...args) => {
            calls.push(args);
            setOpen(args[0]);
          }}
          aside={<button type="button">In the aside</button>}
        />
      );
    }
    await render(<Probe />);
    const sheet = () => document.querySelector<HTMLElement>('[data-kl-shell-sheet="aside"]');
    await expect.poll(() => sheet()?.contains(active()) ?? false).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => calls.length).toBe(1);
    const [open, details] = calls[0] as [boolean, { reason: string; event: Event }];
    expect(open).toBe(false);
    expect(details.reason).toBe("escape-key");
    expect(details.event).toBeInstanceOf(Event);
    await expect.poll(sheet).toBeNull();
  });
});
