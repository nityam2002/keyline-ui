import "./render-count";

import * as React from "react";
import { Checkbox, CheckboxField, CheckboxIndicator, CheckboxRoot } from "@/components/keyline/ui/checkbox";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("checkbox", {
  CheckboxRoot: { element: <CheckboxRoot aria-label="Hazardous" />, refInstanceof: HTMLSpanElement, slot: "checkbox" },
  CheckboxIndicator: {
    element: <CheckboxIndicator />,
    refInstanceof: HTMLSpanElement,
    slot: "checkbox-indicator",
    wrap: (part) => <CheckboxRoot aria-label="Hazardous">{part}</CheckboxRoot>,
  },
});

type Details = { reason: string; event: Event };

function Example(props: Partial<React.ComponentProps<typeof CheckboxField>>) {
  return (
    <main>
      <input aria-label="Before" />
      <CheckboxField label="Hazardous goods" description="Class 1 to 9" {...props} />
      <input aria-label="After" />
    </main>
  );
}

const box = () => document.querySelector<HTMLElement>('[data-slot="checkbox"]')!;
const indicator = () => document.querySelector<HTMLElement>('[data-slot="checkbox-indicator"]')!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("checkbox: field", () => {
  it("the row's label names the box and its description describes it", async () => {
    await render(<Example />);
    expect(box().getAttribute("role")).toBe("checkbox");
    const labelledBy = box().getAttribute("aria-labelledby");
    const name = labelledBy
      ? labelledBy
          .split(" ")
          .map((id) => document.getElementById(id)?.textContent)
          .join(" ")
      : document.querySelector<HTMLLabelElement>('[data-slot="checkbox-field-row"]')!.textContent;
    expect(name).toContain("Hazardous goods");
    const describedBy = (box().getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
    expect(describedBy.map((id) => document.getElementById(id)?.textContent)).toEqual(["Class 1 to 9"]);
  });

  it("a press anywhere on the row toggles the box", async () => {
    await render(<Example />);
    await userEvent.click(document.querySelector('[data-slot="checkbox-field-description"]')!);
    await expect.poll(() => box().getAttribute("aria-checked")).toBe("true");
  });
});

describe("checkbox: axe", () => {
  it("has no violations: plain, checked, indeterminate, invalid, disabled", async () => {
    await render(
      <main>
        <CheckboxField label="Plain" />
        <CheckboxField label="Checked" defaultChecked />
        <CheckboxField label="Mixed" indeterminate />
        <CheckboxField label="Invalid" aria-invalid />
        <CheckboxField label="Disabled" disabled />
        <CheckboxField label="Disabled, checked" disabled defaultChecked />
        <Checkbox aria-label="Standalone" />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("checkbox: keyboard", () => {
  it("Tab reaches the box and leaves it at both edges; Space toggles it with Base UI's event details", async () => {
    const seen: [boolean, Details][] = [];
    await render(<Example onCheckedChange={(checked, details) => seen.push([checked, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(box());
    await userEvent.keyboard(" ");
    await expect.poll(() => box().getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard(" ");
    await expect.poll(() => box().getAttribute("aria-checked")).toBe("false");
    expect(seen.map(([c]) => c)).toEqual([true, false]);
    expect(seen[0]![1].reason).toBe("none");
    expect(seen[0]![1].event).toBeInstanceOf(Event);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("checkbox: style", () => {
  it("checked: an ink box with the tick masked into its 12px indicator", async () => {
    await render(<Checkbox aria-label="Hazardous" defaultChecked />);
    expect(getComputedStyle(box()).backgroundColor).toBe(color("var(--kl-inverse)"));
    const cs = getComputedStyle(indicator());
    expect(indicator().getBoundingClientRect().width).toBe(12);
    expect(indicator().getBoundingClientRect().height).toBe(12);
    const mask = cs.maskImage || cs.getPropertyValue("-webkit-mask-image");
    expect(mask).toMatch(/^url\("data:image\/svg\+xml/);
    // the tick's path, whose stroked ink is centred in its 12×12 box (tests/browser/checkbox.tick measures it)
    expect(decodeURIComponent(mask)).toContain("M1.6 6.18 4.6 9.18 10.4 2.78");
    expect(cs.backgroundColor).toBe(color("var(--kl-on-inverse)"));
  });

  it("indeterminate: a 9px bar, no tick; hovering the row leaves the box ink", async () => {
    await render(<CheckboxField label="All" indeterminate />);
    const r = indicator().getBoundingClientRect();
    const cs = getComputedStyle(indicator());
    expect(r.width).toBe(9);
    // 2.5px, which an engine may snap to the device pixel
    expect(parseFloat(cs.borderBottomWidth)).toBeGreaterThanOrEqual(2);
    expect(cs.borderBottomStyle).toBe("solid");
    expect(cs.borderBottomColor).toBe(color("var(--kl-on-inverse)"));
    expect(cs.maskImage === "none" || cs.maskImage === "").toBe(true);
    await userEvent.hover(document.querySelector('[data-slot="checkbox-field-label"]')!);
    expect(getComputedStyle(box()).backgroundColor).toBe(color("var(--kl-inverse)"));
  });

  it("unchecked: no indicator drawn", async () => {
    await render(<Checkbox aria-label="Hazardous" />);
    expect(getComputedStyle(indicator()).display).toBe("none");
  });

  it("disabled: the box is hatched with the out-of-service keyline", async () => {
    await render(<Checkbox aria-label="Hazardous" disabled />);
    expect(getComputedStyle(box()).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(box()).borderTopColor).toBe(color("var(--kl-dis-line)"));
  });

  it("focus: the box draws the focus ring", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    const cs = getComputedStyle(box());
    expect(cs.outlineStyle).toBe("solid");
    expect(cs.outlineColor).toBe(color("var(--kl-focus)"));
  });
});
