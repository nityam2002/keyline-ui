import "./render-count";

import * as React from "react";
import {
  CheckboxGroup,
  CheckboxGroupFrame,
  CheckboxGroupItem,
  CheckboxGroupLegend,
  CheckboxGroupRoot,
} from "@/components/keyline/ui/checkbox-group";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => <CheckboxGroupRoot>{part}</CheckboxGroupRoot>;

describeConformance("checkbox-group", {
  CheckboxGroupRoot: {
    element: <CheckboxGroupRoot />,
    refInstanceof: HTMLDivElement,
    slot: "checkbox-group",
  },
  CheckboxGroupLegend: {
    element: <CheckboxGroupLegend>Notify me about</CheckboxGroupLegend>,
    refInstanceof: HTMLDivElement,
    slot: "checkbox-group-legend",
    wrap: inRoot,
  },
  CheckboxGroupFrame: {
    element: <CheckboxGroupFrame />,
    refInstanceof: HTMLDivElement,
    slot: "checkbox-group-frame",
    wrap: inRoot,
  },
});

type Details = { reason: string; event: Event };

const OPTIONS = [
  { value: "delayed", label: "Delayed", meta: "12" },
  { value: "delivered", label: "Delivered", meta: "48" },
  { value: "returned", label: "Returned", description: "Back at the depot" },
];

function Example(props: Partial<React.ComponentProps<typeof CheckboxGroup>>) {
  return (
    <main>
      <input aria-label="Before" />
      <CheckboxGroup legend="Notify me about" options={OPTIONS} selectAll="All events" {...props} />
      <input aria-label="After" />
    </main>
  );
}

const boxes = () => [...document.querySelectorAll<HTMLElement>('[data-slot="checkbox"]')];
const frame = () => document.querySelector<HTMLElement>('[data-slot="checkbox-group-frame"]')!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("checkbox-group: structure", () => {
  it("is a group named by its legend; each box is named by its row", async () => {
    await render(<Example />);
    const group = document.querySelector<HTMLElement>('[data-slot="checkbox-group"]')!;
    const legend = document.querySelector<HTMLElement>('[data-slot="checkbox-group-legend"]')!;
    expect(group.getAttribute("aria-labelledby")).toBe(legend.id);
    expect(legend.textContent).toBe("Notify me about");
    expect(boxes()).toHaveLength(4);
    expect(document.querySelector('[data-kl-parent] [data-slot="checkbox-group-item-meta"]')!.textContent).toBe("0/3");
  });

  it("the parent row meets its options on a 2px rule; options meet on 1px keylines", async () => {
    await render(<Example />);
    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="checkbox-group-item"]')];
    expect(getComputedStyle(items[0]!).borderTopWidth).toBe("0px");
    expect(getComputedStyle(items[1]!).borderTopWidth).toBe("2px");
    expect(getComputedStyle(items[2]!).borderTopWidth).toBe("1px");
  });
});

describe("checkbox-group: axe", () => {
  it("has no violations: plain, some checked, invalid, disabled, a cell", async () => {
    await render(
      <main>
        <CheckboxGroup legend="Plain" options={OPTIONS} />
        <CheckboxGroup legend="Some" options={OPTIONS} defaultValue={["delayed"]} selectAll />
        <CheckboxGroup legend="Invalid" options={OPTIONS} invalid error="Choose at least one" />
        <CheckboxGroup legend="Disabled" options={OPTIONS} disabled defaultValue={["delivered"]} />
        <CheckboxGroup legend="Cell" options={OPTIONS} layout="cell" />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("checkbox-group: keyboard", () => {
  it("Tab visits each box and leaves at both edges; Space on the parent checks all, then clears all", async () => {
    const seen: [string[], Details][] = [];
    await render(<Example onValueChange={(v, details) => seen.push([v, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    for (const b of boxes()) {
      await userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(b);
    }
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(boxes()[3]);

    const [parent, delayed] = boxes();
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement).toBe(delayed);
    await userEvent.keyboard(" ");
    await expect.poll(() => parent!.getAttribute("aria-checked")).toBe("mixed");
    expect(parent!.hasAttribute("data-indeterminate")).toBe(true);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(parent);
    await userEvent.keyboard(" ");
    await expect.poll(() => parent!.getAttribute("aria-checked")).toBe("true");
    expect(boxes().map((b) => b.getAttribute("aria-checked"))).toEqual(["true", "true", "true", "true"]);
    await userEvent.keyboard(" ");
    await expect.poll(() => parent!.getAttribute("aria-checked")).toBe("false");
    expect(seen.map(([v]) => v)).toEqual([["delayed"], ["delayed", "delivered", "returned"], []]);
    expect(seen[0]![1].reason).toBe("none");
    expect(seen[0]![1].event).toBeInstanceOf(Event);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("checkbox-group: style", () => {
  it("invalid: the frame turns red", async () => {
    await render(<Example invalid error="Choose at least one" />);
    expect(getComputedStyle(frame()).borderTopColor).toBe(color("var(--kl-red)"));
  });

  it("disabled: the frame takes the out-of-service keyline and each row is hatched", async () => {
    await render(<Example disabled />);
    expect(getComputedStyle(frame()).borderTopColor).toBe(color("var(--kl-dis-line)"));
    const row = document.querySelector<HTMLElement>('[data-slot="checkbox-group-item-row"]')!;
    expect(getComputedStyle(row).backgroundImage).toMatch(/linear-gradient/);
  });

  it("a disabled option keeps its state and is hatched; the others stay live", async () => {
    await render(
      <CheckboxGroupRoot defaultValue={["b"]} allValues={["a", "b"]}>
        <CheckboxGroupLegend>Mode</CheckboxGroupLegend>
        <CheckboxGroupFrame>
          <CheckboxGroupItem value="a" label="A" />
          <CheckboxGroupItem value="b" label="B" disabled />
        </CheckboxGroupFrame>
      </CheckboxGroupRoot>,
    );
    const rows = [...document.querySelectorAll<HTMLElement>('[data-slot="checkbox-group-item-row"]')];
    expect(getComputedStyle(rows[0]!).backgroundImage).toBe("none");
    expect(getComputedStyle(rows[1]!).backgroundImage).toMatch(/linear-gradient/);
    expect(boxes()[1]!.getAttribute("aria-checked")).toBe("true");
  });
});
