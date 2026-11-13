import "./render-count";

import * as React from "react";
import { Switch, SwitchField, SwitchRoot, SwitchThumb } from "@/components/keyline/ui/switch";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("switch", {
  SwitchRoot: { element: <SwitchRoot aria-label="Notify" />, refInstanceof: HTMLSpanElement, slot: "switch" },
  SwitchThumb: {
    element: <SwitchThumb />,
    refInstanceof: HTMLSpanElement,
    slot: "switch-thumb",
    wrap: (part) => <SwitchRoot aria-label="Notify">{part}</SwitchRoot>,
  },
});

type Details = { reason: string; event: Event };

function Example(props: Partial<React.ComponentProps<typeof SwitchField>>) {
  return (
    <main>
      <input aria-label="Before" />
      <SwitchField label="Notify the consignee" description="By e-mail, on delivery" {...props} />
      <input aria-label="After" />
    </main>
  );
}

const sw = () => document.querySelector<HTMLElement>('[data-slot="switch"]')!;
const thumb = () => document.querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

/** The thumb's centre, as a share of the switch's width from its physical left. */
const thumbAt = () => {
  const r = sw().getBoundingClientRect();
  const t = thumb().getBoundingClientRect();
  return (t.left + t.width / 2 - r.left) / r.width;
};

/** Resolves once the thumb has stopped travelling. */
const settled = () =>
  Promise.all(
    thumb()
      .getAnimations()
      .map((a) => a.finished),
  );

describe("switch: field", () => {
  it("the row's label names the switch and its description describes it; a press on the row toggles it", async () => {
    await render(<Example />);
    expect(sw().getAttribute("role")).toBe("switch");
    const describedBy = (sw().getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
    expect(describedBy.map((id) => document.getElementById(id)?.textContent)).toEqual(["By e-mail, on delivery"]);
    await userEvent.click(document.querySelector('[data-slot="switch-field-label"]')!);
    await expect.poll(() => sw().getAttribute("aria-checked")).toBe("true");
  });
});

describe("switch: axe", () => {
  it("has no violations: off, on, disabled, in a field", async () => {
    await render(
      <main>
        <Switch aria-label="Off" />
        <Switch aria-label="On" defaultChecked />
        <Switch aria-label="Disabled" disabled />
        <Switch aria-label="Disabled, on" disabled defaultChecked />
        <SwitchField label="In a field" description="With a description" />
        <SwitchField label="Invalid" aria-invalid />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("switch: keyboard", () => {
  it("Tab reaches the switch and leaves it at both edges; Space toggles it with Base UI's event details", async () => {
    const seen: [boolean, Details][] = [];
    await render(<Example onCheckedChange={(checked, details) => seen.push([checked, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(sw());
    await userEvent.keyboard(" ");
    await expect.poll(() => sw().getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard(" ");
    await expect.poll(() => sw().getAttribute("aria-checked")).toBe("false");
    expect(seen.map(([c]) => c)).toEqual([true, false]);
    expect(seen[0]![1].reason).toBe("none");
    expect(seen[0]![1].event).toBeInstanceOf(Event);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("switch: style", () => {
  it("the thumb travels to the end half when on: right in LTR, left in RTL", async () => {
    await render(
      <main>
        <div dir="ltr">
          <Switch aria-label="Notify" />
        </div>
      </main>,
    );
    expect(thumbAt()).toBeLessThan(0.5);
    await userEvent.click(sw());
    await settled();
    expect(thumbAt()).toBeGreaterThan(0.5);
  });

  it("RTL: the thumb starts on the right and travels left", async () => {
    await render(
      <main>
        <div dir="rtl">
          <Switch aria-label="Notify" />
        </div>
      </main>,
    );
    expect(thumbAt()).toBeGreaterThan(0.5);
    await userEvent.click(sw());
    await settled();
    expect(thumbAt()).toBeLessThan(0.5);
  });

  it("on: the thumb is solid ink; off it is hollow", async () => {
    await render(
      <main>
        <Switch aria-label="Off" />
        <Switch aria-label="On" defaultChecked />
      </main>,
    );
    const [off, on] = [...document.querySelectorAll<HTMLElement>('[data-slot="switch-thumb"]')];
    expect(getComputedStyle(on!).backgroundColor).toBe(color("var(--kl-inverse)"));
    expect(getComputedStyle(off!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("disabled: the frame is hatched with the out-of-service keyline", async () => {
    await render(<Switch aria-label="Notify" disabled />);
    expect(getComputedStyle(sw()).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(sw()).borderTopColor).toBe(color("var(--kl-dis-line)"));
  });

  it("focus: the switch draws the focus ring", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    const cs = getComputedStyle(sw());
    expect(cs.outlineStyle).toBe("solid");
    expect(cs.outlineColor).toBe(color("var(--kl-focus)"));
  });
});
