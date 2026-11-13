import "./render-count";

import * as React from "react";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
  NumberFieldUnit,
} from "@/components/keyline/ui/number-field";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => <NumberFieldRoot defaultValue={4}>{part}</NumberFieldRoot>;
const inGroup = (part: React.ReactNode) => inRoot(<NumberFieldGroup>{part}</NumberFieldGroup>);

describeConformance("number-field", {
  NumberFieldRoot: { element: <NumberFieldRoot />, refInstanceof: HTMLDivElement, slot: "number-field-root" },
  NumberFieldGroup: {
    element: <NumberFieldGroup />,
    refInstanceof: HTMLDivElement,
    slot: "number-field-group",
    wrap: inRoot,
  },
  NumberFieldDecrement: {
    element: <NumberFieldDecrement aria-label="Decrease" />,
    refInstanceof: HTMLButtonElement,
    slot: "number-field-decrement",
    button: true,
    buttonTabIndex: -1,
    wrap: inGroup,
  },
  NumberFieldInput: {
    element: <NumberFieldInput aria-label="Pallets" />,
    refInstanceof: HTMLInputElement,
    slot: "number-field-input",
    wrap: inGroup,
  },
  NumberFieldIncrement: {
    element: <NumberFieldIncrement aria-label="Increase" />,
    refInstanceof: HTMLButtonElement,
    slot: "number-field-increment",
    button: true,
    buttonTabIndex: -1,
    wrap: inGroup,
  },
  NumberFieldUnit: {
    element: <NumberFieldUnit>PLT</NumberFieldUnit>,
    refInstanceof: HTMLSpanElement,
    slot: "number-field-unit",
    wrap: inGroup,
  },
});

type Details = { reason: string; event: Event };

function Example(props: Partial<React.ComponentProps<typeof NumberField>>) {
  return (
    <main>
      <input aria-label="Before" />
      <NumberField label="Pallets" unit="PLT" defaultValue={24} min={0} max={33} {...props} />
      <input aria-label="After" />
    </main>
  );
}

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const input = () => q("number-field-input") as HTMLInputElement;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("number-field: structure", () => {
  it("the label names the input; the steppers are named and out of the tab order", async () => {
    await render(<Example />);
    expect(document.querySelector("label")!.htmlFor).toBe(input().id);
    expect(q("number-field-decrement").getAttribute("aria-label")).toBe("Decrease");
    expect(q("number-field-increment").getAttribute("tabindex")).toBe("-1");
    expect(q("number-field-unit").textContent).toBe("PLT");
  });
});

describe("number-field: axe", () => {
  it("has no violations: plain, a unit, invalid, disabled, no steppers, a cell", async () => {
    await render(
      <main>
        <NumberField label="Plain" defaultValue={3} />
        <NumberField label="Weight" unit="kg" defaultValue={12} />
        <NumberField label="Invalid" defaultValue={40} invalid error="At most 33" />
        <NumberField label="Disabled" defaultValue={2} disabled />
        <NumberField label="Order" steppers={false} />
        <div className="flex">
          <NumberField label="Cell" layout="cell" defaultValue={1} />
        </div>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("number-field: keyboard", () => {
  it("the input is the one Tab stop; arrows step, with Base UI's event details", async () => {
    const seen: [number | null, Details][] = [];
    await render(<Example onValueChange={(v, details) => seen.push([v, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(input());
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => input().value).toBe("25");
    expect(seen[0]![0]).toBe(25);
    expect(seen[0]![1].event).toBeInstanceOf(Event);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("number-field: style", () => {
  it("a stepper is square: as wide as the frame is tall inside its border", async () => {
    await render(<Example />);
    const frame = q("number-field-group");
    expect(q("number-field-increment").getBoundingClientRect().width).toBe(frame.clientHeight);
  });

  it("a cell's steppers keep the row height as their width", async () => {
    await render(
      <div className="flex w-[480px]">
        <NumberField label="Cell" layout="cell" defaultValue={2} />
      </div>,
    );
    const row = getComputedStyle(q("number-field-group")).getPropertyValue("--kl-row").trim();
    expect(`${q("number-field-increment").getBoundingClientRect().width}px`).toBe(row);
  });

  it("the step that would leave [min, max] is hatched; the other stays live", async () => {
    await render(<Example defaultValue={0} />);
    expect(getComputedStyle(q("number-field-decrement")).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(q("number-field-increment")).backgroundImage).toBe("none");
  });

  it("disabled: the frame is hatched, not each step", async () => {
    await render(<Example disabled />);
    expect(getComputedStyle(q("number-field-group")).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(q("number-field-decrement")).backgroundImage).toBe("none");
    expect(getComputedStyle(q("number-field-unit")).color).toBe(color("var(--kl-dis)"));
  });

  it("the input and its unit read as one value: the seam between them is the soft one", async () => {
    await render(<Example />);
    expect(getComputedStyle(q("number-field-unit")).borderInlineStartColor).toBe(color("var(--kl-line-soft)"));
    expect(getComputedStyle(q("number-field-increment")).borderInlineStartColor).toBe(color("var(--kl-line)"));
  });

  it("a narrow cell folds its steppers into one end cell, + over −", async () => {
    await render(
      <div className="flex w-[150px]">
        <NumberField label="Narrow" layout="cell" defaultValue={2} />
      </div>,
    );
    const inc = q("number-field-increment").getBoundingClientRect();
    const dec = q("number-field-decrement").getBoundingClientRect();
    const field = q("number-field-input").getBoundingClientRect();
    expect(inc.left).toBe(dec.left);
    expect(inc.bottom).toBe(dec.top);
    expect(field.right).toBeLessThanOrEqual(inc.left);
    // the end cell is the frame's last column, a row wide
    const group = q("number-field-group");
    const g = group.getBoundingClientRect();
    expect(inc.right).toBeCloseTo(g.left + group.clientLeft + group.clientWidth, 1);
    expect(`${inc.width}px`).toBe(getComputedStyle(group).getPropertyValue("--kl-row").trim());
  });

  it("RTL: a negative number keeps its sign first (its own paragraph)", async () => {
    await render(
      <div dir="rtl">
        <Example defaultValue={-18} min={-30} />
      </div>,
    );
    expect(getComputedStyle(input()).unicodeBidi).toBe("plaintext");
  });
});
