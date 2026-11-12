import "./render-count";

import * as React from "react";
import { MenuItem } from "@/components/keyline/ui/menu";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonPopup,
  SplitButtonTrigger,
} from "@/components/keyline/ui/split-button";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("split-button", {
  SplitButton: {
    element: (
      <SplitButton aria-label="Book">
        <SplitButtonAction>Book</SplitButtonAction>
      </SplitButton>
    ),
    refInstanceof: HTMLDivElement,
    slot: "split-button",
  },
  SplitButtonAction: {
    element: <SplitButtonAction>Book</SplitButtonAction>,
    refInstanceof: HTMLButtonElement,
    slot: "split-button-action",
    button: true,
    wrap: (part) => <SplitButton>{part}</SplitButton>,
  },
  SplitButtonTrigger: {
    element: <SplitButtonTrigger aria-label="More booking options" />,
    refInstanceof: HTMLButtonElement,
    slot: "split-button-trigger",
    button: true,
    wrap: (part) => (
      <SplitButton>
        <SplitButtonMenu>{part}</SplitButtonMenu>
      </SplitButton>
    ),
  },
  SplitButtonPopup: {
    element: (
      <SplitButtonPopup>
        <MenuItem>Book for tomorrow</MenuItem>
      </SplitButtonPopup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "menu-popup",
    wrap: (part) => (
      <SplitButton>
        <SplitButtonMenu open>{part}</SplitButtonMenu>
      </SplitButton>
    ),
  },
});

function Example({ variant }: { variant?: "primary" | "secondary" }) {
  // the popup portals into the page's landmark (a page's own concern; axe's region rule expects it)
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain}>
      <input aria-label="Before" />
      <SplitButton variant={variant}>
        <SplitButtonAction>Book pickup</SplitButtonAction>
        <SplitButtonMenu>
          <SplitButtonTrigger aria-label="More booking options" />
          <SplitButtonPopup container={main}>
            <MenuItem>Book for tomorrow</MenuItem>
            <MenuItem>Book recurring</MenuItem>
          </SplitButtonPopup>
        </SplitButtonMenu>
      </SplitButton>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="split-button-trigger"]')!;
const frame = () => document.querySelector<HTMLElement>('[data-slot="split-button"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="menu-popup"]');
const label = () => document.activeElement?.getAttribute("aria-label");

async function openByKeyboard() {
  trigger().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => document.activeElement?.closest('[data-slot="menu-popup"]')).toBe(popup());
}

describe("split-button: axe", () => {
  for (const variant of ["secondary", "primary"] as const)
    it(`has no violations, closed and open (${variant})`, async () => {
      await render(<Example variant={variant} />);
      await expectNoAxeViolations();
      await openByKeyboard();
      await expectNoAxeViolations();
    });
});

describe("split-button: menu", () => {
  it("docks to the whole frame, not to the caret cell", async () => {
    await render(<Example />);
    await openByKeyboard();
    const f = frame().getBoundingClientRect();
    const m = popup()!.getBoundingClientRect();
    expect(Math.abs(m.left - f.left)).toBeLessThanOrEqual(0.5);
  });

  it("an open menu returns the frame to the line and turns the caret ink", async () => {
    await render(<Example variant="primary" />);
    const closed = getComputedStyle(frame()).borderTopColor;
    await openByKeyboard();
    expect(getComputedStyle(frame()).borderTopColor).not.toBe(closed);
    expect(getComputedStyle(trigger()).backgroundColor).not.toBe(getComputedStyle(frame()).backgroundColor);
  });
});

describe("split-button: keyboard", () => {
  it("Tab reaches each cell in turn and leaves at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.textContent).toBe("Book pickup");
    await userEvent.keyboard("{Tab}");
    await expect.poll(label).toBe("More booking options");
    await userEvent.keyboard("{Tab}");
    await expect.poll(label).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Shift>}{Tab}{Shift>}{Tab}{/Shift}");
    await expect.poll(label).toBe("Before");
  });

  it("Escape closes the menu and returns focus to the caret", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => trigger().hasAttribute("data-popup-open")).toBe(false);
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("Tab leaves the open menu forward and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => trigger().hasAttribute("data-popup-open")).toBe(false);
    await expect.poll(label).toBe("After");
  });
});
