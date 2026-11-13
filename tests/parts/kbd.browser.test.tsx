import "./render-count";

import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("kbd", {
  Kbd: { element: <Kbd>K</Kbd>, refInstanceof: HTMLElement, slot: "kbd" },
  KbdGroup: {
    element: (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    ),
    refInstanceof: HTMLElement,
    slot: "kbd-group",
  },
});

function Example() {
  return (
    <main>
      <p>
        Press{" "}
        <KbdGroup>
          <Kbd label="Command">⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>{" "}
        to open the command menu, <Kbd>/</Kbd> to search, and{" "}
        <KbdGroup separator="then">
          <Kbd>G</Kbd>
          <Kbd>I</Kbd>
        </KbdGroup>{" "}
        to go to the inbox.
      </p>
    </main>
  );
}

describe("kbd: axe", () => {
  it("has no violations: keys, a chord with a named symbol, a sequence", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
  });
});

describe("kbd: chord", () => {
  it("is one key frame: its keys drop their own frame and floor, and each later key draws the seam before it", async () => {
    await render(<Example />);
    const group = document.querySelector<HTMLElement>('[data-slot="kbd-group"]')!;
    const keys = [...group.querySelectorAll<HTMLElement>(':scope > [data-slot="kbd"]')];
    const lone = document.querySelector<HTMLElement>('p > [data-slot="kbd"]')!;
    // a key on its own: a 1px keyline with a 2px floor, 22px tall
    expect(getComputedStyle(lone).borderTopWidth).toBe("1px");
    expect(getComputedStyle(lone).borderBottomWidth).toBe("2px");
    expect(lone.getBoundingClientRect().height).toBe(22);
    // the group owns the frame; the keys fill it
    expect(getComputedStyle(group).borderBottomWidth).toBe("2px");
    expect(group.getBoundingClientRect().height).toBe(22);
    expect(getComputedStyle(keys[0]!).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(keys[0]!).borderBottomWidth).toBe("0px");
    expect(getComputedStyle(keys[1]!).borderInlineStartWidth).toBe("1px");
    expect(getComputedStyle(keys[1]!).borderBottomWidth).toBe("0px");
    expect(getComputedStyle(keys[1]!).marginTop).toBe("0px");
  });

  it("reads its separator and stays left to right in an RTL page", async () => {
    await render(
      <main dir="rtl">
        <KbdGroup separator="then">
          <Kbd>G</Kbd>
          <Kbd>I</Kbd>
        </KbdGroup>
      </main>,
    );
    const group = document.querySelector<HTMLElement>('[data-slot="kbd-group"]')!;
    expect(group.textContent).toBe("G then I");
    const [g, i] = [...group.querySelectorAll<HTMLElement>('[data-slot="kbd"]')];
    expect(g!.getBoundingClientRect().left).toBeLessThan(i!.getBoundingClientRect().left);
  });
});
