// TimeField is a convenience component with no Base UI parts (Base UI has no time field): it takes no `render` and no
// function className, so it has no conformance suite. This checks its keyboard, axe and the look its utilities draw,
// and the date picker's time row, which places it as a cell.
import "./render-count";

import * as React from "react";
import { DateTimePicker } from "@/components/keyline/ui/date-picker";
import { TimeField } from "@/components/keyline/ui/time-field";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

function Example(props: Partial<React.ComponentProps<typeof TimeField>>) {
  return (
    <main>
      <input aria-label="Before" />
      <TimeField label="Pickup" defaultValue="14:30" zone="CET" {...props} />
      <input aria-label="After" />
    </main>
  );
}

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const parts = () => [...document.querySelectorAll<HTMLInputElement>('[role="spinbutton"]')];

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("time-field: axe", () => {
  it("has no violations: 24-hour, 12-hour, empty, invalid, disabled, a cell", async () => {
    await render(
      <main>
        <TimeField label="Pickup" defaultValue="14:30" zone="CET" />
        <TimeField label="Drop" defaultValue="06:00" hourCycle={12} locale="en-US" />
        <TimeField label="Empty" />
        <TimeField label="Invalid" invalid error="Too late" defaultValue="23:00" />
        <TimeField label="Disabled" disabled defaultValue="08:00" zone="local" />
        <div className="flex">
          <TimeField label="Cell" layout="cell" defaultValue="09:15" />
        </div>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("time-field: keyboard", () => {
  it("Tab goes through the parts in clock order and leaves at both edges; arrows step and wrap", async () => {
    const seen: (string | null)[] = [];
    await render(<Example onValueChange={(v) => seen.push(v)} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(parts()[0]);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(parts()[1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(seen).toEqual(["14:29"]);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("time-field: style", () => {
  it("each part is two tabular digits wide, so the frame keeps its width while the time changes", async () => {
    await render(<Example />);
    const w = q("time-field-frame").getBoundingClientRect().width;
    parts()[0]!.focus();
    await userEvent.keyboard("{Backspace}");
    await expect.poll(() => parts()[0]!.value).toBe("");
    expect(q("time-field-frame").getBoundingClientRect().width).toBe(w);
    expect(getComputedStyle(parts()[0]!).fontVariantNumeric).toBe("tabular-nums");
    // two digits (2ch) and 10px either side
    const cs = getComputedStyle(parts()[0]!);
    const probe = document.createElement("span");
    Object.assign(probe.style, {
      display: "inline-block",
      width: "2ch",
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
    });
    document.body.append(probe);
    const twoCh = probe.getBoundingClientRect().width;
    probe.remove();
    expect(parts()[0]!.getBoundingClientRect().width).toBeCloseTo(twoCh + 20, 1);
  });

  it("the part being edited takes the cursor tint", async () => {
    await render(<Example />);
    parts()[1]!.focus();
    expect(getComputedStyle(parts()[1]!).backgroundColor).toBe(color("var(--kl-tint)"));
    expect(getComputedStyle(parts()[0]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("the zone reads with the time: the seam before it is the soft one", async () => {
    await render(<Example />);
    expect(getComputedStyle(q("time-field-zone")).borderInlineStartColor).toBe(color("var(--kl-line-soft)"));
  });

  it("disabled: the join and the zone are out of service", async () => {
    await render(<Example disabled />);
    expect(getComputedStyle(q("time-field-join")).color).toBe(color("var(--kl-dis)"));
    expect(getComputedStyle(q("time-field-zone")).color).toBe(color("var(--kl-dis)"));
  });

  it("12-hour: the period cell is as wide as the longer of the locale's names", async () => {
    await render(<Example hourCycle={12} locale="en-US" defaultValue="06:00" />);
    const sizers = [...document.querySelectorAll<HTMLElement>('[data-slot="time-field-period-sizer"]')];
    // a sizer stretches to the cell, so measure its text: the name, and 8px either side
    const text = (el: HTMLElement) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return r.getBoundingClientRect().width + 16;
    };
    const widest = Math.max(...sizers.map(text));
    const input = q("time-field-period-input").getBoundingClientRect();
    expect(q("time-field-period").getBoundingClientRect().width).toBeCloseTo(widest, 0);
    expect(input.width).toBeCloseTo(widest, 0);
    // the input and the sizers share one grid cell
    for (const s of sizers) expect(s.getBoundingClientRect().top).toBe(input.top);
  });

  it("in a date-time picker's time row, the time cell hugs its parts; the spare room stays after it", async () => {
    await render(
      <main className="w-[480px]">
        <DateTimePicker label="Pickup" defaultValue={new Date(2026, 10, 12, 14, 30)} />
      </main>,
    );
    await userEvent.click(document.querySelector<HTMLElement>('[data-slot="date-time-picker"] button')!);
    await expect.poll(() => document.querySelector('[data-slot="time-field"]')).not.toBeNull();
    const field = document.querySelector<HTMLElement>('[data-slot="time-field"]')!;
    expect([getComputedStyle(field).flexGrow, getComputedStyle(field).flexShrink]).toEqual(["0", "0"]);
  });
});
