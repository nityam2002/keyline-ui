// DateRangePicker's parts (a Popover's Root, Trigger and Popup, and the cells Keyline renders itself), the range
// calendar's look on react-day-picker's DOM (its classNames carry the utilities), keyboard and axe.
import "./render-count";

import * as React from "react";
import {
  DateRangeAffix,
  DateRangeCaption,
  DateRangeCount,
  DateRangeFooter,
  DateRangePicker,
  DateRangePopup,
  DateRangePreset,
  DateRangePresets,
  DateRangeRoot,
  DateRangeTotal,
  DateRangeTrigger,
  DateRangeValue,
  RangeCalendar,
  type DateRange,
} from "@/components/keyline/ui/date-range";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const TODAY = new Date(2026, 10, 12);
const inOpen = (part: React.ReactNode) => (
  <DateRangeRoot open>
    <DateRangePopup>{part}</DateRangePopup>
  </DateRangeRoot>
);

describeConformance("date-range", {
  DateRangeTrigger: {
    element: <DateRangeTrigger aria-label="Stay" />,
    refInstanceof: HTMLButtonElement,
    slot: "date-range-trigger",
    button: true,
    wrap: (part) => <DateRangeRoot>{part}</DateRangeRoot>,
  },
  DateRangeAffix: { element: <DateRangeAffix />, refInstanceof: HTMLSpanElement, slot: "date-range-affix" },
  DateRangeValue: {
    element: <DateRangeValue placeholder="Any date" />,
    refInstanceof: HTMLSpanElement,
    slot: "date-range-value",
  },
  DateRangeCount: {
    element: <DateRangeCount>7</DateRangeCount>,
    refInstanceof: HTMLSpanElement,
    slot: "date-range-count",
  },
  DateRangePopup: {
    element: <DateRangePopup>Body</DateRangePopup>,
    refInstanceof: HTMLDivElement,
    slot: "date-range-popup",
    wrap: (part) => <DateRangeRoot open>{part}</DateRangeRoot>,
  },
  DateRangeFooter: {
    element: <DateRangeFooter />,
    refInstanceof: HTMLDivElement,
    slot: "date-range-footer",
    wrap: inOpen,
  },
  DateRangeTotal: {
    element: <DateRangeTotal>7</DateRangeTotal>,
    refInstanceof: HTMLDivElement,
    slot: "date-range-total",
  },
  DateRangeCaption: {
    element: <DateRangeCaption>12 – 18 Nov</DateRangeCaption>,
    refInstanceof: HTMLDivElement,
    slot: "date-range-caption",
  },
  DateRangePresets: { element: <DateRangePresets />, refInstanceof: HTMLDivElement, slot: "date-range-presets" },
  DateRangePreset: {
    element: <DateRangePreset>This week</DateRangePreset>,
    refInstanceof: HTMLButtonElement,
    slot: "date-range-preset",
  },
});

/** A range picker between two page fields, its popup portalled into the page's landmark. */
function Example(props: Partial<React.ComponentProps<typeof DateRangePicker>>) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  const [value, setValue] = React.useState<DateRange | null>({
    from: new Date(2026, 10, 10),
    to: new Date(2026, 10, 17),
  });
  return (
    <main ref={setMain} style={{ padding: 40, width: 560 }}>
      <input aria-label="Before" />
      <DateRangePicker
        label="Stay"
        today={TODAY}
        value={value}
        onValueChange={setValue}
        container={main}
        isDateUnavailable={(d) => d.getDate() === 13 && "closed"}
        presets={[{ label: "This week", range: () => ({ from: TODAY, to: TODAY }) }]}
        {...props}
      />
      <input aria-label="After" />
    </main>
  );
}

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const day = (n: number) =>
  [...document.querySelectorAll<HTMLButtonElement>("[role=gridcell] button")].find((b) =>
    new RegExp(`^\\w+, ${n} November 2026`).test(b.getAttribute("aria-label") ?? ""),
  )!;

/** A colour as the engine computes it, resolved where `at` is (a popup's --kl-cell is the raised surface). */
function color(value: string, at: Element = document.body) {
  const probe = document.createElement("span");
  probe.style.color = value;
  at.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

async function openPicker() {
  await userEvent.click(q("date-range-trigger"));
  await expect.poll(() => document.querySelector('[data-slot="date-range-popup"]')).not.toBeNull();
  const popup = q("date-range-popup");
  await expect.poll(() => popup.hasAttribute("data-starting-style")).toBe(false);
  await Promise.all(popup.getAnimations({ subtree: true }).map((a) => a.finished));
  return popup;
}

describe("date-range: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openPicker();
    await expectNoAxeViolations();
  });
});

describe("date-range: keyboard", () => {
  it("Enter opens on the grid's day, Escape closes back to the trigger; Tab leaves at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(q("date-range-trigger"));
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement?.closest("[role=grid]")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.activeElement).toBe(q("date-range-trigger"));
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("date-range: style", () => {
  it("the popup is seven days and its two sides wide; the calendar fills it", async () => {
    await render(<Example />);
    const popup = await openPicker();
    expect(popup.getBoundingClientRect().width).toBe(7 * 44 + 2 * 2);
    expect(q("range-calendar", popup).getBoundingClientRect().width).toBe(7 * 44);
  });

  it("docked to a trigger a little wider, the popup takes its width and the calendar still fills it", async () => {
    await render(<Example className="w-[340px]" />);
    const popup = await openPicker();
    expect(popup.getBoundingClientRect().width).toBe(340);
    expect(q("range-calendar", popup).getBoundingClientRect().width).toBe(340 - 2 * 2);
  });

  it("compact density: a day is 34px", async () => {
    await render(
      <div data-kl-density="compact">
        <RangeCalendar value={null} onValueChange={() => {}} today={TODAY} />
      </div>,
    );
    expect(q("range-calendar").getBoundingClientRect().width).toBe(7 * 34);
  });

  it("seams sit on the cells: soft after each day but a row's last, and under each row but the last", async () => {
    await render(<RangeCalendar value={null} onValueChange={() => {}} today={TODAY} />);
    const rows = [...document.querySelectorAll<HTMLElement>("[role=grid] tbody tr")];
    const first = rows[0]!.querySelectorAll("td");
    expect(getComputedStyle(first[0]!).borderInlineEndWidth).toBe("1px");
    expect(getComputedStyle(first[0]!).borderInlineEndColor).toBe(color("var(--kl-line-soft)"));
    expect(getComputedStyle(first[6]!).borderInlineEndWidth).toBe("0px");
    expect(getComputedStyle(first[0]!).borderBottomWidth).toBe("1px");
    expect(getComputedStyle(rows.at(-1)!.querySelector("td")!).borderBottomWidth).toBe("0px");
  });

  it("weekday headers are the Code voice in proportional figures", async () => {
    await render(<RangeCalendar value={null} onValueChange={() => {}} today={TODAY} />);
    const th = document.querySelector<HTMLElement>("[role=grid] th")!;
    const cs = getComputedStyle(th);
    expect([cs.fontSize, cs.fontWeight, cs.lineHeight, cs.fontVariantNumeric]).toEqual([
      "11px",
      "500",
      "11px",
      "normal",
    ]);
    expect(cs.color).toBe(color("var(--kl-ink-2)"));
  });

  it("today is underlined; an unavailable day is hatched and struck", async () => {
    await render(<Example />);
    await openPicker();
    expect(getComputedStyle(day(12).firstElementChild!).borderBottomWidth).toBe("3px");
    expect(getComputedStyle(day(11).firstElementChild!).borderBottomWidth).toBe("0px");
    expect(getComputedStyle(day(13)).backgroundImage).toContain("repeating-linear-gradient");
    expect(getComputedStyle(day(13).firstElementChild!).textDecorationLine).toBe("line-through");
  });

  it("an unavailable day inside the range takes the pale yellow", async () => {
    await render(<Example />);
    const popup = await openPicker();
    expect(getComputedStyle(day(13)).backgroundColor).toBe(
      color("color-mix(in oklab, var(--kl-yellow) 35%, var(--kl-cell))", popup),
    );
  });

  it("a range broken across rows: a notch at the row's end points on, and at the next row's start", async () => {
    await render(<Example />);
    await openPicker();
    // Monday-first: Sunday 15 ends a row, Monday 16 starts the next
    const end = getComputedStyle(day(15), "::after");
    expect(end.borderInlineStartWidth).toBe("6px");
    expect(end.borderInlineStartColor).toBe(color("var(--kl-ink)"));
    expect(end.insetInlineEnd).toBe("0px");
    const start = getComputedStyle(day(16), "::after");
    expect(start.insetInlineStart).toBe("0px");
    expect(getComputedStyle(day(14), "::after").content).toBe("none");
  });

  it("a previewed range floods the lighter yellow; its ends stay ink", async () => {
    await render(<Example />);
    const popup = await openPicker();
    await userEvent.click(day(19));
    await userEvent.hover(day(24));
    await expect.poll(() => day(21).hasAttribute("data-preview")).toBe(true);
    const fc = (d: number) => color(getComputedStyle(day(d)).getPropertyValue("--kl-fc"), popup);
    expect(fc(21)).toBe(color("color-mix(in oklab, var(--kl-yellow) 45%, var(--kl-cell))", popup));
    expect(fc(19)).toBe(color("var(--kl-inverse)", popup));
  });

  it("an open trigger with keyboard focus keeps the plain line, not the focus edge (the popup is the focus)", async () => {
    const page = (open: boolean) => (
      <main>
        <input aria-label="Before" />
        <DateRangeRoot open={open}>
          <DateRangeTrigger aria-label="Stay" />
          <DateRangePopup aria-label="Stay" initialFocus={false}>
            Body
          </DateRangePopup>
        </DateRangeRoot>
      </main>
    );
    const screen = await render(page(false));
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    const trigger = q("date-range-trigger");
    expect(document.activeElement).toBe(trigger);
    await screen.rerender(page(true));
    await expect.poll(() => trigger.matches(":focus-visible[data-popup-open]")).toBe(true);
    expect(getComputedStyle(trigger).borderTopColor).toBe(color("var(--kl-line)"));
  });

  it("an open month cell is the inverse; the open trigger's edge is the plain line", async () => {
    await render(<Example />);
    const popup = await openPicker();
    expect(getComputedStyle(q("date-range-trigger")).borderTopColor).toBe(color("var(--kl-line)"));
    const month = popup.querySelector<HTMLElement>('[data-slot="calendar-dropdown"][aria-label="Month"]')!;
    await userEvent.click(month);
    await expect.poll(() => month.hasAttribute("data-popup-open")).toBe(true);
    expect(getComputedStyle(month).backgroundColor).toBe(color("var(--kl-inverse)"));
  });

  it("the year cell after the month cell draws the soft seam between them", async () => {
    await render(<RangeCalendar value={null} onValueChange={() => {}} today={TODAY} />);
    const cells = [...document.querySelectorAll<HTMLElement>('[data-slot="calendar-dropdown"]')];
    expect(getComputedStyle(cells[0]!).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(cells[1]!).borderInlineStartWidth).toBe("1px");
    expect(getComputedStyle(cells[1]!).borderInlineStartColor).toBe(color("var(--kl-line-soft)"));
  });

  it("on its own, the calendar carries Keyline's type and ink", async () => {
    await render(
      <div style={{ fontFamily: "serif", color: "rgb(255, 0, 0)", fontVariantNumeric: "normal" }}>
        <RangeCalendar value={null} onValueChange={() => {}} today={TODAY} />
      </div>,
    );
    const cs = getComputedStyle(q("range-calendar"));
    expect(cs.color).toBe(color("var(--kl-ink)"));
    expect(cs.fontFamily).not.toBe("serif");
    expect(cs.fontVariantNumeric).toBe("tabular-nums");
  });
});
