import "./render-count";

import { Toggle } from "@/components/keyline/ui/toggle";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("toggle", {
  Toggle: { element: <Toggle>Urgent</Toggle>, refInstanceof: HTMLButtonElement, slot: "toggle", button: true },
});

function Example() {
  return (
    <main>
      <input aria-label="Before" />
      <Toggle defaultPressed count={12}>
        Assigned to me
      </Toggle>
      <input aria-label="After" />
    </main>
  );
}

const toggle = () => document.querySelector<HTMLElement>('[data-slot="toggle"]')!;

describe("toggle: axe", () => {
  it("has no violations, on and off, in each layout, icon and disabled", async () => {
    await render(
      <main>
        <Toggle>Follow shipment</Toggle>
        <Toggle defaultPressed count={12}>
          Assigned to me
        </Toggle>
        <Toggle layout="cell">Cell</Toggle>
        <Toggle icon aria-label="Pin to dashboard" defaultPressed>
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M8 2v12" stroke="currentColor" />
          </svg>
        </Toggle>
        <Toggle disabled>Archived</Toggle>
        <Toggle disabled defaultPressed>
          Locked
        </Toggle>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("toggle: state", () => {
  it("pressed floods the cell and fills the lamp; off, the cell is its own background", async () => {
    await render(
      <main>
        <Toggle defaultPressed>On</Toggle>
        <Toggle>Off</Toggle>
      </main>,
    );
    const [on, off] = [...document.querySelectorAll<HTMLElement>('[data-slot="toggle"]')];
    const lamp = (t: HTMLElement) => getComputedStyle(t.querySelector('[data-slot="toggle-lamp"]')!).borderTopWidth;
    const probe = document.createElement("span");
    probe.style.color = "var(--kl-yellow)";
    document.body.append(probe);
    const yellow = getComputedStyle(probe).color;
    probe.remove();
    // the foundation's flood paints the pressed cell: no utility on the toggle may beat it
    expect(getComputedStyle(on!).backgroundColor).toBe(yellow);
    expect(getComputedStyle(off!).backgroundColor).not.toBe(yellow);
    expect(lamp(on!)).toBe("5px");
    expect(lamp(off!)).toBe("2px");
  });
});

describe("toggle: keyboard", () => {
  it("Tab reaches the toggle and leaves it at both edges; Space and Enter toggle it", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement).toBe(toggle());
    expect(toggle().getAttribute("aria-pressed")).toBe("true");
    await userEvent.keyboard(" ");
    await expect.poll(() => toggle().getAttribute("aria-pressed")).toBe("false");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => toggle().getAttribute("aria-pressed")).toBe("true");
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});
