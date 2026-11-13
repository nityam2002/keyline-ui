// Toolbar's parts (Base UI Toolbar's Root, Button, Link, Input, Group and Separator, and Keyline's toggles, spacer and
// menu), keyboard, axe, and overflow="menu": items are found by their data-slot, so a wrapped or custom item folds into
// More like any other, and a folded item stays mounted (hidden) with its state.
import "./render-count";

import * as React from "react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarMenu,
  ToolbarMenuContent,
  ToolbarMenuItem,
  ToolbarMenuTrigger,
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@/components/keyline/ui/toolbar";
import { Tooltip } from "@/components/keyline/ui/tooltip";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => <ToolbarRoot aria-label="Tools">{part}</ToolbarRoot>;

describeConformance("toolbar", {
  ToolbarRoot: { element: <ToolbarRoot aria-label="Tools" />, refInstanceof: HTMLDivElement, slot: "toolbar" },
  Toolbar: { element: <Toolbar aria-label="Tools" />, refInstanceof: HTMLDivElement, slot: "toolbar" },
  ToolbarButton: {
    element: <ToolbarButton>Export</ToolbarButton>,
    refInstanceof: HTMLButtonElement,
    slot: "toolbar-button",
    button: true,
    wrap: inRoot,
  },
  ToolbarLink: {
    element: <ToolbarLink href="#help">Help</ToolbarLink>,
    refInstanceof: HTMLAnchorElement,
    slot: "toolbar-link",
    wrap: inRoot,
  },
  ToolbarInput: {
    element: <ToolbarInput label="Search" />,
    refInstanceof: HTMLInputElement,
    slot: "toolbar-input",
    wrap: inRoot,
  },
  ToolbarGroup: {
    element: <ToolbarGroup aria-label="History" />,
    refInstanceof: HTMLDivElement,
    slot: "toolbar-group",
    wrap: inRoot,
  },
  ToolbarSeparator: {
    element: <ToolbarSeparator />,
    refInstanceof: HTMLDivElement,
    slot: "toolbar-separator",
    wrap: inRoot,
  },
  ToolbarToggle: {
    element: <ToolbarToggle>Wrap</ToolbarToggle>,
    refInstanceof: HTMLButtonElement,
    slot: "toolbar-toggle",
    button: true,
    wrap: inRoot,
  },
  ToolbarToggleGroup: {
    element: <ToolbarToggleGroup aria-label="Style" />,
    refInstanceof: HTMLDivElement,
    slot: "toolbar-toggle-group",
    wrap: inRoot,
  },
  ToolbarSpacer: { element: <ToolbarSpacer />, refInstanceof: HTMLDivElement, slot: "toolbar-spacer", wrap: inRoot },
  ToolbarMenuTrigger: {
    element: <ToolbarMenuTrigger>Insert</ToolbarMenuTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "toolbar-menu-trigger",
    button: true,
    wrap: (part) => inRoot(<ToolbarMenu>{part}</ToolbarMenu>),
  },
  ToolbarMenuContent: {
    element: (
      <ToolbarMenuContent>
        <ToolbarMenuItem>Table</ToolbarMenuItem>
      </ToolbarMenuContent>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) => inRoot(<ToolbarMenu open>{part}</ToolbarMenu>),
  },
});

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const BACK = server.browser === "webkit" ? "{Shift>}{Alt>}{Tab}{/Alt}{/Shift}" : "{Shift>}{Tab}{/Shift}";

const active = () => document.activeElement as HTMLElement | null;
const nameOf = (el: Element | null) =>
  (el?.getAttribute("aria-label") || el?.querySelector("[data-slot=toolbar-label]")?.textContent || "").trim();
const item = (name: string) =>
  [...document.querySelectorAll<HTMLElement>("[data-kl-tb-item]")].find((e) => nameOf(e) === name)!;
const more = () => document.querySelector<HTMLElement>("[data-slot=toolbar-more]");
const menuRows = () =>
  [...document.querySelectorAll("[role=menu] [role^=menuitem]")].map((r) => r.textContent?.trim() ?? "");
const next = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

function Editor() {
  const [log, setLog] = React.useState("—");
  return (
    <>
      <button type="button">before</button>
      <Toolbar aria-label="Formatting">
        <ToolbarGroup aria-label="History">
          <ToolbarButton onClick={() => setLog("undo")}>Undo</ToolbarButton>
          <ToolbarButton disabled>Redo</ToolbarButton>
        </ToolbarGroup>
        <ToolbarToggleGroup aria-label="Style" defaultValue={["bold"]}>
          <ToolbarToggle value="bold">Bold</ToolbarToggle>
          <ToolbarToggle value="italic">Italic</ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarMenu>
          <ToolbarMenuTrigger>Insert</ToolbarMenuTrigger>
          <ToolbarMenuContent>
            <ToolbarMenuItem>Table</ToolbarMenuItem>
          </ToolbarMenuContent>
        </ToolbarMenu>
        <ToolbarSeparator />
        <ToolbarInput label="Find" placeholder="Find" defaultValue="text" />
        <ToolbarLink href="#help">Help</ToolbarLink>
        <ToolbarSpacer />
        <ToolbarButton primary>Publish</ToolbarButton>
      </Toolbar>
      <button type="button">after</button>
      <p role="status">{log}</p>
    </>
  );
}

describe("toolbar: axe", () => {
  it("has no violations: groups, toggles, a menu, an input, a link, a spacer and the primary", async () => {
    const screen = await render(<Editor />);
    await expectNoAxeViolations(screen.container);
  });

  it("has no violations with items folded and More open", async () => {
    const screen = await render(<Narrow width={240} />);
    await expect.poll(() => !!more()).toBe(true);
    await userEvent.click(more()!);
    await expect.poll(() => menuRows().length).toBeGreaterThan(0);
    // the row (with its hidden items), and the menu: it is portalled to the body, outside any landmark of the
    // test page (a landmark is the consuming page's job), so it is judged on its own
    await expectNoAxeViolations(screen.container);
    await expectNoAxeViolations(document.querySelector("[role=menu]")!);
  });
});

describe("toolbar: keyboard", () => {
  it("is one Tab stop: Tab in lands on the first item, Tab out leaves the row, Shift+Tab returns to the last item", async () => {
    await render(<Editor />);
    (document.querySelector("button") as HTMLElement).focus();
    await userEvent.keyboard(TAB);
    expect(nameOf(active())).toBe("Undo");
    await userEvent.keyboard("{ArrowRight}");
    expect(nameOf(active()), "disabled items stay focusable").toBe("Redo");
    await userEvent.keyboard("{ArrowRight}");
    expect(nameOf(active())).toBe("Bold");
    await userEvent.keyboard(TAB);
    // the input is a separate stop only through the toolbar's own order: Tab leaves the toolbar
    expect(active()?.textContent).toBe("after");
    await userEvent.keyboard(BACK);
    expect(nameOf(active()), "the roving tab stop remembers the item").toBe("Bold");
  });

  it("arrow keys move between items and wrap at both ends; Home and End stay with the item (Base UI 1.9)", async () => {
    await render(<Editor />);
    item("Undo").focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(nameOf(active()), "wraps to the end").toBe("Publish");
    await userEvent.keyboard("{ArrowRight}");
    expect(nameOf(active()), "wraps to the start").toBe("Undo");
    await userEvent.keyboard("{End}");
    expect(nameOf(active())).toBe("Undo");
    // in the input, the arrows move the caret; they leave only at the text's ends
    const input = document.querySelector<HTMLInputElement>("[data-slot=toolbar-input]")!;
    input.focus();
    input.setSelectionRange(2, 2);
    await userEvent.keyboard("{ArrowRight}");
    expect(active()).toBe(input);
    // (End is not a caret key in WebKit on macOS: the caret is put at the end directly)
    input.setSelectionRange(input.value.length, input.value.length);
    await userEvent.keyboard("{ArrowRight}");
    expect(nameOf(active())).toBe("Help");
  });

  it("a menu trigger opens its menu with Enter; Escape returns focus to it", async () => {
    await render(<Editor />);
    item("Insert").focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => menuRows()).toEqual(["Table"]);
    expect(item("Insert").getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => active()).toBe(item("Insert"));
  });
});

describe("toolbar: change details", () => {
  it("ToolbarToggle and ToolbarToggleGroup pass Base UI's eventDetails", async () => {
    const toggle: [boolean, { reason: string }][] = [];
    const group: [string[], { reason: string }][] = [];
    await render(
      <Toolbar aria-label="Tools">
        <ToolbarToggle onPressedChange={(v, d) => toggle.push([v, d])}>Wrap</ToolbarToggle>
        <ToolbarToggleGroup aria-label="Align" multiple={false} onValueChange={(v, d) => group.push([v, d])}>
          <ToolbarToggle value="start">Start</ToolbarToggle>
          <ToolbarToggle value="end">End</ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>,
    );
    await userEvent.click(item("Wrap"));
    await userEvent.click(item("End"));
    expect(toggle.at(-1)![0]).toBe(true);
    expect(toggle.at(-1)![1].reason).toBeTypeOf("string");
    expect(group.at(-1)![0]).toEqual(["end"]);
    expect(group.at(-1)![1].reason).toBeTypeOf("string");
  });
});

/* a caller's component that renders a toolbar group: the toolbar never sees a ToolbarGroup element */
function FilterToken({ field, onRemove }: { field: string; onRemove: () => void }) {
  return (
    <ToolbarGroup keepTogether aria-label={`${field} filter`}>
      <ToolbarButton>{`${field}: UPS`}</ToolbarButton>
      <ToolbarButton icon aria-label={`Remove ${field} filter`} onClick={onRemove}>
        ×
      </ToolbarButton>
    </ToolbarGroup>
  );
}

function Narrow({ width, onUndo, onRemove }: { width: number; onUndo?: () => void; onRemove?: () => void }) {
  return (
    <div style={{ width }}>
      <Toolbar aria-label="Edit" overflow="menu">
        <Tooltip content="Undo" shortcut="⌘Z">
          <ToolbarButton onClick={onUndo}>Undo</ToolbarButton>
        </Tooltip>
        <ToolbarToggle>Wrap</ToolbarToggle>
        <FilterToken field="Carrier" onRemove={onRemove ?? (() => {})} />
        <ToolbarButton primary>Save</ToolbarButton>
      </Toolbar>
    </div>
  );
}

describe("toolbar: overflow by data-slot", () => {
  it("a custom item (a component rendering a ToolbarGroup) folds first, as one unit, and works from More", async () => {
    let removed = 0;
    const screen = await render(<Narrow width={560} onRemove={() => removed++} />);
    await next();
    expect(more(), "wide: everything fits").toBeNull();
    await screen.rerender(<Narrow width={300} onRemove={() => removed++} />);
    await expect.poll(() => !!more()).toBe(true);
    const group = document.querySelector<HTMLElement>("[data-slot=toolbar-group]")!;
    expect(group.hidden, "the token left whole (keepTogether)").toBe(true);
    expect(item("Save").hidden, "the primary never leaves").toBe(false);
    await userEvent.click(more()!);
    await expect.poll(() => menuRows()).toContain("Remove Carrier filter");
    const row = [...document.querySelectorAll<HTMLElement>("[role=menu] [role=menuitem]")].find(
      (r) => r.textContent?.trim() === "Remove Carrier filter",
    )!;
    await userEvent.click(row);
    expect(removed, "the row runs the item's own handler").toBe(1);
  });

  it("a wrapped item (a ToolbarButton in a Tooltip) folds and works from More", async () => {
    let undone = 0;
    await render(<Narrow width={150} onUndo={() => undone++} />);
    await expect.poll(() => item("Undo").hidden).toBe(true);
    await userEvent.click(more()!);
    await expect.poll(() => menuRows()).toContain("Undo");
    const row = [...document.querySelectorAll<HTMLElement>("[role=menu] [role=menuitem]")].find(
      (r) => r.textContent?.trim() === "Undo",
    )!;
    await userEvent.click(row);
    expect(undone).toBe(1);
  });

  it("a folded item stays mounted, hidden and out of the row's size, and keeps its state", async () => {
    const screen = await render(<Narrow width={560} />);
    await userEvent.click(item("Wrap"));
    expect(item("Wrap").hasAttribute("data-pressed")).toBe(true);
    await screen.rerender(<Narrow width={150} />);
    await expect.poll(() => item("Wrap").hidden).toBe(true);
    // the fit counts it gone: a hidden item that kept its box would leave the row overflowing
    expect(item("Wrap").getBoundingClientRect().width).toBe(0);
    await userEvent.click(more()!);
    await expect
      .poll(() =>
        [...document.querySelectorAll("[role=menu] [role=menuitemcheckbox]")].map((r) => [
          r.textContent?.trim(),
          r.getAttribute("aria-checked"),
        ]),
      )
      .toContainEqual(["Wrap", "true"]);
    await userEvent.keyboard("{Escape}");
    await screen.rerender(<Narrow width={560} />);
    await expect.poll(() => more()).toBeNull();
    expect(item("Wrap").hasAttribute("data-pressed"), "unmounting would have lost it").toBe(true);
  });

  it("the tab stop never strands on a folded item", async () => {
    const screen = await render(
      <>
        <button type="button">before</button>
        <Narrow width={560} />
      </>,
    );
    item("Carrier: UPS").focus();
    (document.querySelector("button") as HTMLElement).focus();
    await screen.rerender(
      <>
        <button type="button">before</button>
        <Narrow width={300} />
      </>,
    );
    await expect.poll(() => !!more()).toBe(true);
    await userEvent.keyboard(TAB);
    expect(active()?.closest("[hidden]"), "focus landed on a hidden item").toBeNull();
    expect(active()?.closest("[data-slot=toolbar]")).not.toBeNull();
  });

  it("focus on an item that folds moves to More", async () => {
    const screen = await render(<Narrow width={560} />);
    item("Carrier: UPS").focus();
    await screen.rerender(<Narrow width={300} />);
    await expect.poll(() => active()?.getAttribute("data-slot")).toBe("toolbar-more");
  });
});

describe("toolbar: the sub-pixel edge", () => {
  // items whose widths add up to the row's content width plus `over` pixels; the row measures fractionally
  function Row({ width, each }: { width: number; each: number }) {
    return (
      <div style={{ width }}>
        <Toolbar aria-label="Row" overflow="menu">
          {["A", "B", "C", "D"].map((n) => (
            <ToolbarButton key={n} style={{ width: each, minWidth: 0 }}>
              {n}
            </ToolbarButton>
          ))}
        </Toolbar>
      </div>
    );
  }
  const content = async () => {
    const screen = await render(<Row width={400} each={10} />);
    await next();
    const tb = document.querySelector<HTMLElement>("[data-slot=toolbar]")!;
    const box = tb.getBoundingClientRect().width - (tb.offsetWidth - tb.clientWidth);
    return { screen, box };
  };

  it("half a pixel of items over the row folds the last one", async () => {
    const { screen, box } = await content();
    await screen.rerender(<Row width={400} each={(box + 0.53) / 4} />);
    await expect.poll(() => item("D").hidden).toBe(true);
  });

  it("items that fill the row exactly stay", async () => {
    const { screen, box } = await content();
    await screen.rerender(<Row width={400} each={box / 4} />);
    await next();
    await next();
    expect(more()).toBeNull();
    expect(item("D").hidden).toBe(false);
  });
});
