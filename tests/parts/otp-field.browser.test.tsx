import "./render-count";

import * as React from "react";
import {
  OtpField,
  OtpFieldFrame,
  OtpFieldInput,
  OtpFieldRoot,
  OtpFieldSeparator,
} from "@/components/keyline/ui/otp-field";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => (
  <OtpFieldRoot length={2} aria-label="Code">
    {part}
  </OtpFieldRoot>
);

describeConformance("otp-field", {
  OtpFieldFrame: { element: <OtpFieldFrame />, refInstanceof: HTMLDivElement, slot: "otp-field-frame" },
  OtpFieldRoot: { element: <OtpFieldRoot length={1} />, refInstanceof: HTMLDivElement, slot: "otp-field-root" },
  OtpFieldInput: {
    element: <OtpFieldInput aria-label="Character 1" />,
    refInstanceof: HTMLInputElement,
    slot: "otp-field-input",
    wrap: inRoot,
  },
  OtpFieldSeparator: {
    element: <OtpFieldSeparator />,
    refInstanceof: HTMLDivElement,
    slot: "otp-field-separator",
    wrap: inRoot,
  },
});

type Details = { reason: string; event: Event };

function Example(props: Partial<React.ComponentProps<typeof OtpField>>) {
  return (
    <main>
      <input aria-label="Before" />
      <OtpField label="Sign-in code" length={6} groups={[3, 3]} {...props} />
      <input aria-label="After" />
    </main>
  );
}

const q = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const slots = () => [...document.querySelectorAll<HTMLInputElement>('[data-slot="otp-field-input"]')];

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("otp-field: axe", () => {
  it("has no violations: empty, filled, grouped, masked, invalid, disabled, pending, done", async () => {
    await render(
      <main>
        <OtpField label="Empty" length={4} />
        <OtpField label="Filled" length={6} groups={[3, 3]} defaultValue="123456" />
        <OtpField label="PIN" length={4} mask defaultValue="12" />
        <OtpField label="Failed" length={4} defaultValue="1234" signal="failed" error="That code has expired." />
        <OtpField label="Disabled" length={4} disabled />
        <OtpField label="Pending" length={4} defaultValue="1234" signal="pending" />
        <OtpField label="Done" length={4} defaultValue="1234" signal="done" />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("otp-field: keyboard", () => {
  it("typing advances through the slots, with Base UI's event details; Tab leaves at both edges", async () => {
    const seen: [string, Details][] = [];
    await render(<Example onValueChange={(v, details) => seen.push([v, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(slots()[0]);
    await userEvent.keyboard("12");
    await expect.poll(() => document.activeElement).toBe(slots()[2]);
    expect(seen.at(-1)![0]).toBe("12");
    expect(seen.at(-1)![1].event).toBeInstanceOf(Event);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
    slots()[5]!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
  });
});

describe("otp-field: style", () => {
  it("every slot is one unit of the row and a join half of one", async () => {
    await render(<Example />);
    const row = q("otp-field-root").getBoundingClientRect().width;
    // six slots and one join: 6.5 units
    expect(slots()[0]!.getBoundingClientRect().width).toBeCloseTo(row / 6.5, 1);
    expect(q("otp-field-separator").getBoundingClientRect().width).toBeCloseTo(row / 13, 1);
  });

  it("the slots meet on seams; the join is a drawn dash", async () => {
    await render(<Example />);
    const [a, b, c, d] = slots().map((s) => getComputedStyle(s));
    expect(a!.borderInlineStartWidth).toBe("0px");
    expect([b!.borderInlineStartWidth, b!.borderInlineStartColor]).toEqual(["1px", color("var(--kl-seam)")]);
    expect(c!.borderInlineStartWidth).toBe("1px");
    expect(d!.borderInlineStartWidth).toBe("1px");
    expect(getComputedStyle(q("otp-field-separator"), "::before").height).toBe("2px");
  });

  it("the slot being typed into takes a commit keyline on its floor", async () => {
    await render(<Example defaultValue="123" />);
    slots()[1]!.focus();
    expect(document.activeElement).toBe(slots()[1]);
    expect(getComputedStyle(slots()[1]!).boxShadow).toMatch(/inset/);
    expect(getComputedStyle(slots()[0]!).boxShadow).toBe("none");
  });

  it("compact: a slot is 34px, its character half of that", async () => {
    await render(
      <div data-kl-density="compact">
        <Example />
      </div>,
    );
    expect(slots()[0]!.getBoundingClientRect().width).toBe(34);
    expect(getComputedStyle(slots()[0]!).fontSize).toBe("17px");
  });

  it("done: a yellow ✓ cell opens at the end", async () => {
    await render(<Example defaultValue="123456" signal="done" />);
    const cell = q("otp-field-done").querySelector(":scope > span > span")!;
    expect(getComputedStyle(cell).backgroundColor).toBe(color("var(--kl-yellow)"));
  });

  it("disabled: the closed ✓ cell draws no seam at the end of the code", async () => {
    await render(<Example disabled />);
    expect(getComputedStyle(q("otp-field-done")).borderInlineStartColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("RTL, invalid: the ! cell is on the code's right, and the red seam on the code's right edge", async () => {
    await render(
      <div dir="rtl">
        <Example signal="failed" error="Expired" />
      </div>,
    );
    const cs = getComputedStyle(q("otp-field-root"));
    expect([cs.borderRightWidth, cs.borderRightColor, cs.borderLeftWidth]).toEqual([
      "1px",
      color("var(--kl-red)"),
      "0px",
    ]);
  });
});
