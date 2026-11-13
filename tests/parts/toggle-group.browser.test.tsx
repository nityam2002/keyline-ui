import "./render-count";

import { ToggleGroup, ToggleGroupItem } from "@/components/keyline/ui/toggle-group";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("toggle-group", {
  ToggleGroup: {
    element: (
      <ToggleGroup aria-label="Status">
        <ToggleGroupItem value="transit">In transit</ToggleGroupItem>
      </ToggleGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "toggle-group",
  },
  ToggleGroupItem: {
    element: <ToggleGroupItem value="transit">In transit</ToggleGroupItem>,
    refInstanceof: HTMLButtonElement,
    slot: "toggle-group-item",
    button: true,
    wrap: (part) => <ToggleGroup aria-label="Status">{part}</ToggleGroup>,
  },
});

function Example() {
  return (
    <main>
      <input aria-label="Before" />
      <ToggleGroup aria-label="Status" defaultValue={["transit"]}>
        <ToggleGroupItem value="transit" count={23}>
          In transit
        </ToggleGroupItem>
        <ToggleGroupItem value="docs" count={4}>
          Awaiting docs
        </ToggleGroupItem>
        <ToggleGroupItem value="delayed">Delayed</ToggleGroupItem>
        <ToggleGroupItem value="none" disabled>
          Not booked
        </ToggleGroupItem>
      </ToggleGroup>
      <input aria-label="After" />
    </main>
  );
}

const items = () => [...document.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]')];
const active = () => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent;

describe("toggle-group: axe", () => {
  it("has no violations, with cells on, off and disabled", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
  });
});

describe("toggle-group: keyboard", () => {
  it("is one Tab stop; arrows move between cells; Space toggles one without the others", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement).toBe(items()[0]);
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(items()[1]);
    await userEvent.keyboard(" ");
    await expect.poll(() => items()[1]!.getAttribute("aria-pressed")).toBe("true");
    expect(items()[0]!.getAttribute("aria-pressed")).toBe("true");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => document.activeElement).toBe(items()[0]);
    await userEvent.keyboard("{Tab}");
    await expect.poll(active).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(() => items().includes(document.activeElement as HTMLElement)).toBe(true);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(active).toBe("Before");
  });
});
