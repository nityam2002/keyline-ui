import "./render-count";

import { Button } from "@/components/keyline/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/keyline/ui/button-group";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("button-group", {
  ButtonGroup: {
    element: (
      <ButtonGroup aria-label="Zoom">
        <Button layout="cell">Fit</Button>
      </ButtonGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "button-group",
  },
  ButtonGroupText: {
    element: <ButtonGroupText>100%</ButtonGroupText>,
    refInstanceof: HTMLSpanElement,
    slot: "button-group-text",
    wrap: (part) => <ButtonGroup aria-label="Zoom">{part}</ButtonGroup>,
  },
  ButtonGroupSeparator: {
    element: <ButtonGroupSeparator />,
    refInstanceof: HTMLDivElement,
    slot: "button-group-separator",
    wrap: (part) => <ButtonGroup aria-label="Zoom">{part}</ButtonGroup>,
  },
});

function Example({ orientation }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <ButtonGroup aria-label="Zoom" orientation={orientation}>
      <Button layout="cell" aria-label="Zoom out">
        −
      </Button>
      <ButtonGroupText>100%</ButtonGroupText>
      <Button layout="cell" aria-label="Zoom in">
        +
      </Button>
      <ButtonGroupSeparator />
      <Button layout="cell">Fit</Button>
    </ButtonGroup>
  );
}

describe("button-group: axe", () => {
  it("has no violations, horizontal and vertical", async () => {
    await render(
      <main>
        <Example />
        <Example orientation="vertical" />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("button-group: separator", () => {
  it("runs across the group and carries the seam at a control's weight; the next cell draws none", async () => {
    await render(
      <main>
        <Example />
        <Example orientation="vertical" />
      </main>,
    );
    const [row, column] = [...document.querySelectorAll<HTMLElement>('[data-slot="button-group-separator"]')];
    const k2 = getComputedStyle(row!.closest('[data-slot="button-group"]')!).borderTopWidth;
    expect(row!.getAttribute("aria-orientation")).toBe("vertical");
    expect(getComputedStyle(row!).borderInlineStartWidth).toBe(k2);
    expect(getComputedStyle(row!.nextElementSibling!).borderInlineStartWidth).toBe("0px");
    expect(column!.getAttribute("aria-orientation")).toBe("horizontal");
    expect(getComputedStyle(column!).borderTopWidth).toBe(k2);
    expect(getComputedStyle(column!.nextElementSibling!).borderTopWidth).toBe("0px");
  });
});
