import "./render-count";

import * as React from "react";
import { Radio, RadioGroup, RadioGroupItem, RadioIndicator, RadioRoot } from "@/components/keyline/ui/radio-group";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("radio-group", {
  RadioGroup: { element: <RadioGroup aria-label="Mode" />, refInstanceof: HTMLDivElement, slot: "radio-group" },
  RadioRoot: {
    element: <RadioRoot value="road">Road</RadioRoot>,
    refInstanceof: HTMLSpanElement,
    slot: "radio",
    wrap: (part) => <RadioGroup aria-label="Mode">{part}</RadioGroup>,
  },
  RadioIndicator: {
    element: <RadioIndicator />,
    refInstanceof: HTMLSpanElement,
    slot: "radio-indicator",
    wrap: (part) => (
      <RadioGroup aria-label="Mode">
        <Radio value="road">{part}</Radio>
      </RadioGroup>
    ),
  },
});

type Details = { reason: string; event: Event };

function Example(props: Partial<React.ComponentProps<typeof RadioGroup>>) {
  return (
    <main>
      <input aria-label="Before" />
      <RadioGroup aria-label="Mode" defaultValue="road" {...props}>
        <RadioGroupItem value="road" label="Road" description="Door to door, 2–4 days" meta="€" />
        <RadioGroupItem value="rail" label="Rail" meta="€€" />
        <RadioGroupItem value="sea" label="Sea" />
      </RadioGroup>
      <input aria-label="After" />
    </main>
  );
}

const radios = () => [...document.querySelectorAll<HTMLElement>("[role=radio]")];

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("radio-group: rows", () => {
  it("each row is named by its label and described by its description", async () => {
    await render(<Example />);
    const [road] = radios();
    const text = (attr: string) =>
      (road!.getAttribute(attr) ?? "")
        .split(" ")
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");
    expect(text("aria-labelledby")).toBe("Road");
    expect(text("aria-describedby")).toBe("Door to door, 2–4 days");
  });

  it("a row without meta keeps the meta column, so the divider runs straight", async () => {
    await render(<Example />);
    const sea = radios()[2]!;
    const after = getComputedStyle(sea, "::after");
    expect(after.content).not.toBe("none");
    expect(parseFloat(after.minWidth)).toBe(64);
  });
});

describe("radio-group: axe", () => {
  it("has no violations: plain, chosen, disabled, a disabled row, invalid", async () => {
    await render(
      <main>
        <RadioGroup aria-label="Mode" defaultValue="road">
          <RadioGroupItem value="road" label="Road" description="Door to door, 2–4 days" meta="€" />
          <RadioGroupItem value="rail" label="Rail" meta="€€" />
        </RadioGroup>
        <RadioGroup aria-label="Disabled" disabled defaultValue="a">
          <RadioGroupItem value="a" label="A" />
          <RadioGroupItem value="b" label="B" />
        </RadioGroup>
        <RadioGroup aria-label="One disabled">
          <RadioGroupItem value="a" label="A" />
          <RadioGroupItem value="b" label="B" disabled />
        </RadioGroup>
        <RadioGroup aria-label="Invalid" aria-invalid>
          <RadioGroupItem value="a" label="A" />
        </RadioGroup>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("radio-group: keyboard", () => {
  it("Tab enters on the chosen row and leaves the group; arrows move and choose, with Base UI's event details", async () => {
    const seen: [string, Details][] = [];
    await render(<Example onValueChange={(v, details) => seen.push([v, details])} />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(radios()[0]);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement).toBe(radios()[1]);
    await expect.poll(() => radios()[1]!.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => radios()[0]!.getAttribute("aria-checked")).toBe("true");
    expect(seen.map(([v]) => v)).toEqual(["rail", "road"]);
    expect(seen[0]![1].reason).toBe("none");
    expect(seen[0]![1].event).toBeInstanceOf(Event);
    // one tab stop: the next Tab leaves the group
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(radios()[0]);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("radio-group: style", () => {
  it("the chosen row is covered by the ink band; its box shows the dot", async () => {
    await render(<Example />);
    const [road, rail] = radios();
    await expect.poll(() => road!.hasAttribute("data-kl-covered")).toBe(true);
    expect(getComputedStyle(road!).color).toBe(color("var(--kl-on-inverse)"));
    const band = document.querySelector<HTMLElement>("[data-kl-band]")!;
    expect(getComputedStyle(band).backgroundColor).toBe(color("var(--kl-inverse)"));
    const dot = (r: HTMLElement) => r.querySelector<HTMLElement>('[data-slot="radio-indicator"] > span')!;
    expect(getComputedStyle(dot(road!)).visibility).toBe("visible");
    expect(getComputedStyle(dot(rail!)).visibility).toBe("hidden");
  });

  it("disabled: the row is hatched in the out-of-service ink", async () => {
    await render(
      <RadioGroup aria-label="Mode">
        <RadioGroupItem value="a" label="A" disabled />
      </RadioGroup>,
    );
    const row = radios()[0]!;
    expect(getComputedStyle(row).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(row).color).toBe(color("var(--kl-dis)"));
  });

  it("focus: the row draws the ring inside its keylines", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    const cs = getComputedStyle(radios()[0]!);
    expect(cs.outlineStyle).toBe("solid");
    expect(parseFloat(cs.outlineOffset)).toBeLessThan(0);
  });
});
