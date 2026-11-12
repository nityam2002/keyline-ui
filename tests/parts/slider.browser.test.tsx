import "./render-count";

import * as React from "react";
import {
  Slider,
  SliderControl,
  SliderFrame,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/components/keyline/ui/slider";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => <SliderRoot defaultValue={20}>{part}</SliderRoot>;
const inTrack = (part: React.ReactNode) =>
  inRoot(
    <SliderControl>
      <SliderTrack>{part}</SliderTrack>
    </SliderControl>,
  );

describeConformance("slider", {
  SliderRoot: { element: <SliderRoot defaultValue={20} />, refInstanceof: HTMLDivElement, slot: "slider" },
  SliderLabel: {
    element: <SliderLabel>Weight</SliderLabel>,
    refInstanceof: HTMLDivElement,
    slot: "slider-label",
    wrap: inRoot,
  },
  SliderFrame: { element: <SliderFrame />, refInstanceof: HTMLDivElement, slot: "slider-frame", wrap: inRoot },
  SliderControl: { element: <SliderControl />, refInstanceof: HTMLDivElement, slot: "slider-control", wrap: inRoot },
  SliderTrack: {
    element: <SliderTrack />,
    refInstanceof: HTMLDivElement,
    slot: "slider-track",
    wrap: (part) => inRoot(<SliderControl>{part}</SliderControl>),
  },
  SliderIndicator: {
    element: <SliderIndicator />,
    refInstanceof: HTMLDivElement,
    slot: "slider-indicator",
    wrap: inTrack,
  },
  SliderThumb: {
    element: <SliderThumb aria-label="Weight" />,
    refInstanceof: HTMLDivElement,
    slot: "slider-thumb",
    wrap: inTrack,
  },
  SliderValue: { element: <SliderValue />, refInstanceof: HTMLOutputElement, slot: "slider-value", wrap: inRoot },
});

type Details = { reason: string; event: Event };

/* WebKit on macOS leaves a range input out of plain Tab, as it does buttons; Option+Tab is the key a Safari user
   presses for the same order. */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const BACK = server.browser === "webkit" ? "{Alt>}{Shift>}{Tab}{Tab}{/Shift}{/Alt}" : "{Shift>}{Tab}{Tab}{/Shift}";

function Example(props: Partial<React.ComponentProps<typeof Slider<number>>>) {
  return (
    <main>
      <input aria-label="Before" />
      <Slider label="Axle load" unit="t" min={0} max={40} step={0.5} defaultValue={12} {...props} />
      <input aria-label="After" />
    </main>
  );
}

const q = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const range = () => document.querySelector<HTMLInputElement>('[data-slot="slider"] input[type="range"]')!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

/** Resolves once the thumb and the fill have stopped travelling. */
const settled = () =>
  Promise.all([q("slider-thumb"), q("slider-indicator")].flatMap((el) => el.getAnimations().map((a) => a.finished)));

describe("slider: structure", () => {
  it("the label names the thumb; the unit is in its value text; the readout prints the value", async () => {
    await render(<Example />);
    expect(range().getAttribute("aria-valuenow")).toBe("12");
    expect(range().getAttribute("aria-valuetext")).toBe("12 t");
    const labelledBy = range().getAttribute("aria-labelledby") ?? "";
    expect(document.getElementById(labelledBy)?.textContent).toBe("Axle load");
    expect(q("slider-value").textContent).toContain("12");
  });
});

describe("slider: axe", () => {
  it("has no violations: plain, range, invalid, disabled, a cell", async () => {
    await render(
      <main>
        <Slider label="Plain" defaultValue={30} unit="%" />
        <Slider label="Window" defaultValue={[8, 16]} min={0} max={24} unit="h" />
        <Slider label="Invalid" defaultValue={98} invalid error="Above 95 %" />
        <Slider label="Disabled" defaultValue={10} disabled />
        <div className="flex">
          <Slider label="Cell" defaultValue={50} layout="cell" />
        </div>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("slider: keyboard", () => {
  it("Tab reaches the thumb and leaves at both edges; arrows step, with Base UI's event details", async () => {
    const seen: [number, Details][] = [];
    await render(<Example onValueChange={(v, details) => seen.push([v, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    expect(document.activeElement).toBe(range());
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => range().getAttribute("aria-valuenow")).toBe("12.5");
    expect(seen[0]![0]).toBe(12.5);
    expect(seen[0]![1].event).toBeInstanceOf(Event);
    await userEvent.keyboard(TAB);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard(BACK);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("slider: style", () => {
  it("focus: keyboard focus rings the thumb, outside it", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    const cs = getComputedStyle(q("slider-thumb"));
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]).toEqual(["solid", "2px", "2px"]);
  });

  it("invalid: the frame turns red and the ! cell opens", async () => {
    await render(<Example invalid error="Too heavy" />);
    expect(getComputedStyle(q("slider-frame")).borderTopColor).toBe(color("var(--kl-red)"));
    expect(getComputedStyle(q("slider-control")).borderInlineStartColor).toBe(color("var(--kl-red)"));
  });

  it("disabled: the frame is hatched and the thumb out of service", async () => {
    await render(<Example disabled />);
    expect(getComputedStyle(q("slider-frame")).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(q("slider-thumb")).borderTopColor).toBe(color("var(--kl-dis)"));
  });

  it("a painted rail carries the scale: the fill is hidden", async () => {
    await render(<Example railStyle={{ backgroundImage: "linear-gradient(90deg, red, blue)" }} />);
    expect(getComputedStyle(q("slider-indicator")).visibility).toBe("hidden");
    expect(getComputedStyle(q("slider-track")).backgroundImage).toMatch(/linear-gradient/);
  });

  it("compact: the thumb is 12×18 and the rail 8px", async () => {
    await render(
      <div data-kl-density="compact">
        <Example />
      </div>,
    );
    const t = q("slider-thumb").getBoundingClientRect();
    expect([t.width, t.height]).toEqual([12, 18]);
    expect(q("slider-track").getBoundingClientRect().height).toBe(8);
  });

  it("the readout cell keeps its width from min to max", async () => {
    await render(<Example />);
    range().focus();
    await userEvent.keyboard("{End}");
    await expect.poll(() => range().getAttribute("aria-valuenow")).toBe("40");
    const wMax = q("slider-value").getBoundingClientRect().width;
    await userEvent.keyboard("{Home}");
    await expect.poll(() => range().getAttribute("aria-valuenow")).toBe("0");
    expect(q("slider-value").getBoundingClientRect().width).toBe(wMax);
    // the sizer and the printed value share one grid cell
    const [shown, sizer] = [...document.querySelectorAll<HTMLElement>('[data-slot="slider-readout"]')].map((s) =>
      s.getBoundingClientRect(),
    );
    expect(shown!.top).toBe(sizer!.top);
    expect(shown!.left).toBeGreaterThanOrEqual(sizer!.left);
    expect(shown!.right).toBeLessThanOrEqual(sizer!.right);
  });

  it("RTL: the root reads the DOM direction, so max sits at the left end", async () => {
    await render(
      <div dir="rtl">
        <Example defaultValue={40} />
      </div>,
    );
    await settled();
    const track = q("slider-track").getBoundingClientRect();
    const thumb = q("slider-thumb").getBoundingClientRect();
    // the thumb's centre is the value: at max it is on the start edge of the track's inner box, the left edge in RTL
    expect(Math.abs(thumb.left + thumb.width / 2 - (track.left + q("slider-track").clientLeft))).toBeLessThan(0.5);
  });
});
