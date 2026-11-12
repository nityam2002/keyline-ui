import "./render-count";

import * as React from "react";
import { NativeSelect } from "@/components/keyline/ui/native-select";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

/*
 * NativeSelect exports no Base UI parts: it is the platform's <select> (Base UI's Field.Control) in a field frame, so
 * the wrapper contract (render, function className) does not apply. What it does promise is checked here: the
 * select's own props and ref reach the <select>, and className reaches the field.
 */

const OPTIONS = [
  { value: "ect", label: "Rotterdam ECT Delta" },
  { value: "psa", label: "Antwerp PSA" },
  { group: "Closed", options: [{ value: "zee", label: "Zeebrugge", disabled: true }] },
];

function Example(props: Partial<React.ComponentProps<typeof NativeSelect>>) {
  return (
    <main>
      {/* text fields: every engine tabs to them */}
      <input aria-label="Before" />
      <NativeSelect label="Terminal" options={OPTIONS} {...props} />
      <input aria-label="After" />
    </main>
  );
}

const select = () => document.querySelector<HTMLSelectElement>('[data-slot="native-select-control"]')!;
const icon = () => document.querySelector<HTMLElement>('[data-slot="native-select-icon"]')!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("native-select: props", () => {
  it("passes the select's props and ref to the <select>, and className to the field", async () => {
    const ref = React.createRef<HTMLSelectElement>();
    await render(<Example ref={ref} data-probe="kept" autoComplete="off" className="from-field" />);
    expect(ref.current).toBe(select());
    expect(select().getAttribute("data-probe")).toBe("kept");
    expect(select().getAttribute("autocomplete")).toBe("off");
    expect(document.querySelector('[data-slot="native-select"]')!.classList.contains("from-field")).toBe(true);
  });

  it("is named by its label and lists options and groups", async () => {
    await render(<Example />);
    expect(select().labels[0]!.textContent).toBe("Terminal");
    expect([...select().options].map((o) => o.value)).toEqual(["ect", "psa", "zee"]);
    expect(select().querySelector("optgroup")!.label).toBe("Closed");
  });
});

describe("native-select: axe", () => {
  it("has no violations: plain, with a placeholder, invalid, disabled", async () => {
    await render(
      <main>
        <NativeSelect label="Terminal" options={OPTIONS} />
        <NativeSelect label="Berth" options={OPTIONS} placeholder="Choose a terminal" />
        <NativeSelect label="Gate" options={OPTIONS} invalid error="Choose a gate" />
        <NativeSelect label="Yard" options={OPTIONS} disabled />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("native-select: keyboard", () => {
  it("Tab reaches the select and leaves it at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(select());
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(select());
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });

  it("a choice fires change with the new value", async () => {
    const seen: string[] = [];
    await render(<Example onChange={(e) => seen.push(e.currentTarget.value)} />);
    await userEvent.selectOptions(select(), "psa");
    expect(seen).toEqual(["psa"]);
    expect(select().value).toBe("psa");
  });
});

describe("native-select: style", () => {
  it("the caret cell is 36px at the frame's end, lets presses through, and the text stops before it", async () => {
    await render(<Example />);
    const frame = document.querySelector<HTMLElement>('[data-slot="native-select-frame"]')!.getBoundingClientRect();
    const c = icon().getBoundingClientRect();
    expect(c.width).toBe(36);
    expect(c.right).toBe(frame.right - 2);
    expect(getComputedStyle(icon()).pointerEvents).toBe("none");
    const cs = getComputedStyle(select());
    expect(parseFloat(cs.paddingInlineEnd)).toBe(36 + parseFloat(cs.paddingInlineStart));
    expect(cs.appearance).toBe("none");
  });

  it("the placeholder reads in the faint ink until a value is chosen", async () => {
    await render(<Example placeholder="Choose a terminal" />);
    expect(select().value).toBe("");
    expect(getComputedStyle(select()).color).toBe(color("var(--kl-ink-3)"));
    await userEvent.selectOptions(select(), "ect");
    await expect.poll(() => getComputedStyle(select()).color).toBe(color("var(--kl-ink)"));
  });

  it("disabled: the value and the caret are the out-of-service ink", async () => {
    await render(<Example disabled />);
    expect(select().disabled).toBe(true);
    const dis = color("var(--kl-dis)");
    expect(getComputedStyle(select()).color).toBe(dis);
    expect(getComputedStyle(icon()).color).toBe(dis);
  });
});
