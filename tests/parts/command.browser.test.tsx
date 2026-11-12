import "./render-count";

import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/keyline/ui/command";
import { Kbd } from "@/components/keyline/ui/kbd";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("command", {
  CommandFooter: {
    element: <CommandFooter>Hints</CommandFooter>,
    refInstanceof: HTMLDivElement,
    slot: "command-footer",
  },
});

/*
 * The other parts are cmdk's components (cmdk owns the filter and the active row). cmdk takes no `render` and no
 * function className or style, so Base UI's wrapper contract applies only in part: each forwards its props, its ref
 * and a className to its element, which carries the part's slot.
 */
const inCommand = (part: React.ReactNode) => <Command label="Commands">{part}</Command>;
const inList = (part: React.ReactNode) => inCommand(<CommandList>{part}</CommandList>);
const CMDK_PARTS: Record<
  string,
  {
    element: React.ReactElement<Record<string, unknown>>;
    slot: string;
    tag: string;
    wrap?: (p: React.ReactNode) => React.ReactNode;
  }
> = {
  Command: { element: <Command label="Commands" />, slot: "command", tag: "DIV" },
  CommandInput: { element: <CommandInput aria-label="Search" />, slot: "command-input", tag: "INPUT", wrap: inCommand },
  CommandList: { element: <CommandList />, slot: "command-list", tag: "DIV", wrap: inCommand },
  CommandEmpty: { element: <CommandEmpty query="zz" />, slot: "command-empty", tag: "DIV", wrap: inList },
  CommandGroup: { element: <CommandGroup heading="View" />, slot: "command-group", tag: "DIV", wrap: inList },
  CommandSeparator: { element: <CommandSeparator alwaysRender />, slot: "command-separator", tag: "DIV", wrap: inList },
  CommandItem: { element: <CommandItem>Show overdue</CommandItem>, slot: "command-item", tag: "DIV", wrap: inList },
};

describe("command: cmdk parts", () => {
  for (const [name, part] of Object.entries(CMDK_PARTS)) {
    it(`${name}: props, ref and className reach its element, which carries its slot`, async () => {
      const ref = React.createRef<HTMLElement>();
      const el = React.cloneElement(part.element, {
        ref,
        "data-testid": "part",
        "data-probe": "kept",
        className: "from-part",
      });
      await render(<main>{part.wrap ? part.wrap(el) : el}</main>);
      const node = document.querySelector<HTMLElement>('[data-testid="part"]')!;
      expect(node.tagName).toBe(part.tag);
      expect(ref.current).toBe(node);
      expect(node.getAttribute("data-probe")).toBe("kept");
      expect(node.classList.contains("from-part")).toBe(true);
      expect(node.getAttribute("data-slot")).toBe(part.slot);
    });
  }
});

/** A page with the menu behind a button (opened by Enter on it), portalled into the page's landmark. */
function Example({ onRun }: { onRun?: (what: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [host, setHost] = React.useState<HTMLElement | null>(null);
  const run = (what: string) => {
    onRun?.(what);
    setOpen(false);
  };
  return (
    <main ref={setHost}>
      <button type="button" onClick={() => setOpen(true)}>
        Commands
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} container={host}>
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <CommandEmpty query="" />
          <CommandGroup heading="View" code="V">
            <CommandItem onSelect={() => run("overdue")} meta="12">
              Show overdue
            </CommandItem>
            <CommandItem onSelect={() => run("today")}>Show today</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Shipment">
            <CommandItem onSelect={() => run("new")} shortcut="N">
              New shipment
            </CommandItem>
            <CommandItem disabled>Archive</CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span>
            <Kbd>↵</Kbd> run
          </span>
        </CommandFooter>
      </CommandDialog>
    </main>
  );
}

const opener = () => document.querySelector<HTMLButtonElement>("main > button")!;
const input = () => document.querySelector<HTMLInputElement>('[data-slot="command-input"]');
const popup = () => document.querySelector<HTMLElement>('[data-slot="dialog-popup"]');
const selected = () => document.querySelector('[data-slot="command-item"][data-selected="true"]')?.textContent ?? "";
const visibleItems = () => [...document.querySelectorAll('[data-slot="command-item"]')].map((i) => i.textContent);

async function openMenu() {
  opener().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => document.activeElement).toBe(input());
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("command: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openMenu();
    // modal: Base UI makes the page inert while it is open, so the open state is judged on the dialog
    await expectNoAxeViolations(popup()!);
  });
});

describe("command: keyboard", () => {
  it("opens with focus in the search; typing filters; arrows move the cursor; Enter runs it", async () => {
    const runs: string[] = [];
    await render(<Example onRun={(w) => runs.push(w)} />);
    await openMenu();
    await expect.poll(selected).toContain("Show overdue");
    await userEvent.keyboard("show");
    await expect.poll(visibleItems).toEqual(["Show overdue12", "Show today"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(selected).toBe("Show today");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => runs).toEqual(["today"]);
    await expect.poll(popup).toBe(null);
  });

  it("Alt with a digit runs the visible result with that number", async () => {
    const runs: string[] = [];
    await render(<Example onRun={(w) => runs.push(w)} />);
    await openMenu();
    await userEvent.keyboard("{Alt>}3{/Alt}");
    await expect.poll(() => runs).toEqual(["new"]);
  });

  it("Escape closes the menu and returns focus to what opened it", async () => {
    await render(<Example />);
    await openMenu();
    await userEvent.keyboard("{Escape}");
    await expect.poll(popup).toBe(null);
    expect(document.activeElement).toBe(opener());
  });

  it("passes Base UI's event details through onOpenChange", async () => {
    const calls: unknown[][] = [];
    function Probe() {
      const [open, setOpen] = React.useState(true);
      return (
        <main>
          <CommandDialog
            open={open}
            onOpenChange={(...args) => {
              calls.push(args);
              setOpen(args[0]);
            }}
          >
            <CommandInput placeholder="Type a command…" />
            <CommandList>
              <CommandItem>Show overdue</CommandItem>
            </CommandList>
          </CommandDialog>
        </main>
      );
    }
    await render(<Probe />);
    await expect.poll(() => document.activeElement).toBe(input());
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => calls.length).toBe(1);
    const [open, details] = calls[0] as [boolean, { reason: string; event: Event }];
    expect(open).toBe(false);
    expect(details.reason).toBe("escape-key");
    expect(details.event).toBeInstanceOf(Event);
  });
});

describe("command: style", () => {
  it("each row's digit cell prints the list's row counter, a dot after the ninth, in proportional figures", async () => {
    await render(
      <main>
        <Command label="Commands">
          <CommandList>
            {Array.from({ length: 10 }, (_, i) => (
              <CommandItem key={i}>{`Row ${i + 1}`}</CommandItem>
            ))}
          </CommandList>
        </Command>
      </main>,
    );
    const list = getComputedStyle(document.querySelector('[data-slot="command-list"]')!);
    expect(list.counterReset).toBe("kl-cmd 0");
    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="command-item"]')];
    expect(getComputedStyle(items[0]!).counterIncrement).toBe("kl-cmd 1");
    const cells = items.map((i) => i.querySelector<HTMLElement>('[data-slot="command-item-index"]')!);
    const content = cells.map((c) => getComputedStyle(c, "::before").content);
    expect(content.slice(0, 9).every((c) => c === "counter(kl-cmd)")).toBe(true);
    expect(content[9]).toBe('"·"');
    // the stylesheet's `font` shorthand reset the figures; the dialog's tabular figures must not reach the digits
    expect(getComputedStyle(cells[0]!).fontVariantNumeric).toBe("normal");
  });

  it("the cursor is the inverse row; a disabled row is hatched", async () => {
    await render(<Example />);
    await openMenu();
    const [first, second, , archive] = [...document.querySelectorAll<HTMLElement>('[data-slot="command-item"]')];
    await expect.poll(() => first!.getAttribute("data-selected")).toBe("true");
    expect(getComputedStyle(first!).backgroundColor).toBe(color("var(--kl-inverse)"));
    expect(getComputedStyle(first!).color).toBe(color("var(--kl-on-inverse)"));
    expect(getComputedStyle(second!).backgroundColor).not.toBe(color("var(--kl-inverse)"));
    expect(getComputedStyle(archive!).backgroundImage).toContain("repeating-linear-gradient");
    expect(getComputedStyle(archive!).color).toBe(color("var(--kl-dis)"));
  });

  it("a group after a group is divided by a seam; its heading sits on the paper", async () => {
    await render(
      <main>
        <Command label="Commands">
          <CommandList>
            <CommandGroup heading="View">
              <CommandItem>Show overdue</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Shipment">
              <CommandItem>New shipment</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </main>,
    );
    const [first, second] = [...document.querySelectorAll<HTMLElement>('[data-slot="command-group"]')];
    expect(getComputedStyle(first!).borderTopWidth).toBe("0px");
    expect(getComputedStyle(second!).borderTopWidth).toBe("1px");
    const heading = first!.querySelector<HTMLElement>("[cmdk-group-heading]")!;
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--kl-paper)";
    document.body.append(probe);
    expect(getComputedStyle(heading).backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
    probe.remove();
  });

  it("the footer's keys are in the ink, its hints in the meta voice", async () => {
    await render(<Example />);
    await openMenu();
    const foot = document.querySelector<HTMLElement>('[data-slot="command-footer"]')!;
    const kbd = foot.querySelector<HTMLElement>('[data-slot="kbd"]')!;
    expect(getComputedStyle(foot).color).toBe(color("var(--kl-ink-2)"));
    expect(getComputedStyle(kbd).color).toBe(color("var(--kl-ink)"));
  });

  it("the search field is 18px, and the list scrolls within its height", async () => {
    await render(<Example />);
    await openMenu();
    expect(getComputedStyle(input()!).fontSize).toBe("18px");
    const list = getComputedStyle(document.querySelector('[data-slot="command-list"]')!);
    expect(list.overflowY).toBe("auto");
  });
});
