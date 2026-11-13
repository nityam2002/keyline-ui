import "./render-count";

import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("segmented", {
  Segmented: {
    element: (
      <Segmented aria-label="Period" defaultValue="day">
        <SegmentedItem value="day">Day</SegmentedItem>
      </Segmented>
    ),
    refInstanceof: HTMLDivElement,
    slot: "segmented",
  },
  SegmentedItem: {
    element: <SegmentedItem value="day">Day</SegmentedItem>,
    refInstanceof: HTMLSpanElement,
    slot: "segmented-item",
    wrap: (part) => (
      <Segmented aria-label="Period" defaultValue="day">
        {part}
      </Segmented>
    ),
  },
});

function Example() {
  return (
    <main>
      <input aria-label="Before" />
      <Segmented aria-label="Period" defaultValue="week">
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="month">Month</SegmentedItem>
        <SegmentedItem value="quarter" disabled>
          Quarter
        </SegmentedItem>
      </Segmented>
      <input aria-label="After" />
    </main>
  );
}

const radios = () => [...document.querySelectorAll<HTMLElement>('[data-slot="segmented-item"]')];
const checked = () => radios().find((r) => r.getAttribute("aria-checked") === "true")?.textContent;

describe("segmented: axe", () => {
  it("has no violations, at each size", async () => {
    await render(
      <main>
        {(["default", "compact"] as const).map((size) => (
          <Segmented key={size} aria-label={`Period, ${size}`} defaultValue="week" size={size}>
            <SegmentedItem value="day">Day</SegmentedItem>
            <SegmentedItem value="week">Week</SegmentedItem>
            <SegmentedItem value="quarter" disabled>
              Quarter
            </SegmentedItem>
          </Segmented>
        ))}
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("segmented: keyboard", () => {
  it("is one Tab stop on the chosen item; arrows move and choose; Tab leaves at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Week");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(checked).toBe("Month");
    expect(document.activeElement?.textContent).toBe("Month");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect.poll(checked).toBe("Day");
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Day");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });

  it("the band is ink under the chosen item, whose label reads on-inverse", async () => {
    await render(<Example />);
    const week = radios().find((r) => r.textContent === "Week")!;
    await expect.poll(() => week.hasAttribute("data-kl-covered")).toBe(true);
    const band = document.querySelector<HTMLElement>('[data-slot="segmented"] > [data-kl-band]')!;
    const tone = (v: string) => {
      const probe = document.createElement("span");
      probe.style.color = `var(${v})`;
      document.querySelector("main")!.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    };
    expect(getComputedStyle(band).backgroundColor).toBe(tone("--kl-inverse"));
    expect(getComputedStyle(week).color).toBe(tone("--kl-on-inverse"));
    expect(getComputedStyle(radios()[0]!).color).toBe(tone("--kl-ink"));
  });
});
