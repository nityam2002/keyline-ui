// DatePicker's parts (a Popover's Root, Trigger, Popup and Close, and the cells Keyline renders itself), the
// DateTimePicker built from them (its time row and slots), keyboard and axe. The calendar's look is date-range's
// (calendarStyles) and is guarded in date-range.browser.test.tsx.
import "./render-count";

import * as React from "react";
import {
  Calendar,
  DatePicker,
  DatePickerAffix,
  DatePickerClose,
  DatePickerPopup,
  DatePickerPreset,
  DatePickerPresets,
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerValue,
  DateTimePicker,
} from "@/components/keyline/ui/date-picker";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const TODAY = new Date(2026, 10, 12);
const inOpen = (part: React.ReactNode) => (
  <DatePickerRoot open>
    <DatePickerPopup aria-label="Pickup">{part}</DatePickerPopup>
  </DatePickerRoot>
);

describeConformance("date-picker", {
  DatePickerTrigger: {
    element: <DatePickerTrigger aria-label="Pickup" />,
    refInstanceof: HTMLButtonElement,
    slot: "date-picker-trigger",
    button: true,
    wrap: (part) => <DatePickerRoot>{part}</DatePickerRoot>,
  },
  DatePickerAffix: { element: <DatePickerAffix />, refInstanceof: HTMLSpanElement, slot: "date-picker-affix" },
  DatePickerValue: {
    element: <DatePickerValue placeholder="Any date" />,
    refInstanceof: HTMLSpanElement,
    slot: "date-picker-value",
  },
  DatePickerPopup: {
    element: <DatePickerPopup aria-label="Pickup">Body</DatePickerPopup>,
    refInstanceof: HTMLDivElement,
    slot: "date-picker-popup",
    wrap: (part) => <DatePickerRoot open>{part}</DatePickerRoot>,
  },
  DatePickerPresets: { element: <DatePickerPresets />, refInstanceof: HTMLDivElement, slot: "date-picker-presets" },
  DatePickerPreset: {
    element: <DatePickerPreset>Today</DatePickerPreset>,
    refInstanceof: HTMLButtonElement,
    slot: "date-picker-preset",
  },
  DatePickerClose: {
    element: <DatePickerClose>Done</DatePickerClose>,
    refInstanceof: HTMLButtonElement,
    slot: "date-picker-close",
    button: true,
    wrap: inOpen,
  },
});

/** A picker between two page fields, its popup portalled into the page's landmark. */
function Example(props: Partial<React.ComponentProps<typeof DatePicker>>) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 10, 10));
  return (
    <main ref={setMain} style={{ padding: 40, width: 560 }}>
      <input aria-label="Before" />
      <DatePicker
        label="Pickup"
        today={TODAY}
        value={value}
        onValueChange={setValue}
        container={main}
        isDateUnavailable={(d) => d.getDate() === 13 && "closed"}
        presets={[{ label: "Today", date: () => TODAY }]}
        {...props}
      />
      <input aria-label="After" />
    </main>
  );
}

/** A date-time picker with slots or a typed time, its popup portalled into the page's landmark. */
function TimeExample({ dir, ...props }: Partial<React.ComponentProps<typeof DateTimePicker>> & { dir?: "rtl" }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} dir={dir} style={{ padding: 40, width: 560 }}>
      <DateTimePicker
        label="Pickup"
        today={TODAY}
        defaultValue={new Date(2026, 10, 10, 9, 0)}
        container={main}
        zone="CET"
        {...props}
      />
    </main>
  );
}

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

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
  await userEvent.click(q("date-picker-trigger"));
  await expect.poll(() => document.querySelector('[data-slot="date-picker-popup"]')).not.toBeNull();
  const popup = q("date-picker-popup");
  await expect.poll(() => popup.hasAttribute("data-starting-style")).toBe(false);
  await Promise.all(popup.getAnimations({ subtree: true }).map((a) => a.finished));
  return popup;
}

describe("date-picker: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openPicker();
    await expectNoAxeViolations();
  });

  it("the date-time picker has no violations, closed and open, with slots", async () => {
    await render(
      <TimeExample slots={["09:00", "10:00", "11:00"]} isTimeUnavailable={(_, t) => t === "10:00" && "booked"} />,
    );
    await expectNoAxeViolations();
    await openPicker();
    await expectNoAxeViolations();
  });
});

describe("date-picker: keyboard", () => {
  it("Enter opens on the grid's day, Escape closes back to the trigger; Tab leaves at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(q("date-picker-trigger"));
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement?.closest("[role=grid]")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.activeElement).toBe(q("date-picker-trigger"));
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });

  it("Done closes the date-time picker back to its trigger", async () => {
    await render(<TimeExample />);
    const popup = await openPicker();
    await userEvent.click(q("date-picker-close", popup));
    await expect.poll(() => document.querySelector('[data-slot="date-picker-popup"]')).toBeNull();
  });
});

describe("date-picker: style", () => {
  it("the popup is seven days and its two sides wide; the calendar fills it", async () => {
    await render(<Example />);
    const popup = await openPicker();
    expect(popup.getBoundingClientRect().width).toBe(7 * 44 + 2 * 2);
    expect(q("calendar", popup).getBoundingClientRect().width).toBe(7 * 44);
  });

  it("docked to a trigger a little wider, the popup takes its width and the calendar still fills it", async () => {
    await render(<Example className="w-[340px]" />);
    const popup = await openPicker();
    expect(popup.getBoundingClientRect().width).toBe(340);
    expect(q("calendar", popup).getBoundingClientRect().width).toBe(340 - 2 * 2);
  });

  it("on its own, the calendar carries Keyline's type and ink", async () => {
    await render(
      <div style={{ fontFamily: "serif", color: "rgb(255, 0, 0)", fontVariantNumeric: "normal" }}>
        <Calendar value={null} onValueChange={() => {}} today={TODAY} />
      </div>,
    );
    const cs = getComputedStyle(q("calendar"));
    expect(cs.color).toBe(color("var(--kl-ink)"));
    expect(cs.fontFamily).not.toBe("serif");
    expect(cs.fontVariantNumeric).toBe("tabular-nums");
  });

  it("a disabled date-time picker's trigger shows the not-allowed cursor", async () => {
    await render(<TimeExample disabled />);
    expect(getComputedStyle(q("date-picker-trigger")).cursor).toBe("not-allowed");
  });

  it("an invalid date-time picker keeps its error edge while open", async () => {
    await render(<TimeExample invalid error="Choose a weekday." />);
    const closed = getComputedStyle(q("date-picker-trigger")).borderTopColor;
    expect(closed).not.toBe(color("var(--kl-line)"));
    await openPicker();
    expect(getComputedStyle(q("date-picker-trigger")).borderTopColor).toBe(closed);
  });

  it("a long value ends in an ellipsis inside the trigger", async () => {
    await render(<TimeExample className="w-[220px]" />);
    const text = q("date-time-picker-text");
    const cs = getComputedStyle(text);
    expect([cs.textOverflow, cs.overflow, cs.whiteSpace]).toEqual(["ellipsis", "hidden", "nowrap"]);
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    expect(q("date-time-picker-zone").getBoundingClientRect().right).toBeLessThanOrEqual(
      q("date-picker-trigger").getBoundingClientRect().right,
    );
  });

  it("the time row: the label cell shows, and compact density hides it", async () => {
    await render(<TimeExample />);
    let popup = await openPicker();
    expect(getComputedStyle(q("date-time-picker-time-label", popup)).display).not.toBe("none");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector('[data-slot="date-picker-popup"]')).toBeNull();
    document.querySelector("main")!.setAttribute("data-kl-density", "compact");
    popup = await openPicker();
    expect(getComputedStyle(q("date-time-picker-time-label", popup)).display).toBe("none");
  });

  it("slots: four days tall whatever the day offers; each slot draws its seams end and foot", async () => {
    await render(<TimeExample slots={["09:00", "10:00"]} />);
    const popup = await openPicker();
    const grid = q("date-time-picker-slots", popup);
    expect(grid.getBoundingClientRect().height).toBe(4 * 44);
    const shadow = getComputedStyle(q("date-time-picker-slot", popup)).boxShadow;
    expect(shadow).toContain(color("var(--kl-line-soft)", popup));
    expect(shadow).toMatch(/(^|\s)1px 1px 0px 0px/);
  });

  it("slots in right to left draw their end seam on the left", async () => {
    await render(<TimeExample dir="rtl" slots={["09:00", "10:00"]} />);
    const popup = await openPicker();
    expect(getComputedStyle(q("date-time-picker-slot", popup)).boxShadow).toMatch(/(^|\s)-1px 1px 0px 0px/);
  });

  it("a day with no slots says so, centred, at the slots' height", async () => {
    await render(<TimeExample slots={() => []} defaultValue={null} />);
    const popup = await openPicker();
    const none = q("date-time-picker-slots", popup);
    expect(none.tagName).toBe("P");
    const cs = getComputedStyle(none);
    expect([cs.alignContent, cs.textAlign]).toEqual(["start", "center"]);
    expect(none.getBoundingClientRect().height).toBe(4 * 44);
  });
});
