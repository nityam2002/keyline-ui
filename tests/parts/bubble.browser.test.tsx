// Bubble's parts (conformance), axe over every tone, and the Tab order through a text cell that acts (rendered as a
// button), a link in the text and a reaction.
import * as React from "react";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/keyline/ui/bubble";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inBubble = (part: React.ReactNode) => <Bubble>{part}</Bubble>;

describeConformance("bubble", {
  BubbleGroup: { element: <BubbleGroup />, refInstanceof: HTMLDivElement, slot: "bubble-group" },
  Bubble: { element: <Bubble />, refInstanceof: HTMLDivElement, slot: "bubble" },
  BubbleContent: {
    element: <BubbleContent>Ok.</BubbleContent>,
    refInstanceof: HTMLDivElement,
    slot: "bubble-content",
    wrap: inBubble,
  },
  BubbleReactions: {
    element: <BubbleReactions />,
    refInstanceof: HTMLDivElement,
    slot: "bubble-reactions",
    wrap: inBubble,
  },
});

/* WebKit on macOS leaves buttons and links out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const SHIFT_TAB = server.browser === "webkit" ? "{Alt>}{Shift>}{Tab}{/Shift}{/Alt}" : "{Shift>}{Tab}{/Shift}";
const active = () => document.activeElement as HTMLElement | null;
/* a text cell's name is its text; the ! cell beside it is hidden */
const name = (el: HTMLElement | null) =>
  el?.getAttribute("aria-label") ?? (el?.querySelector("[data-slot=bubble-text]") ?? el)?.textContent?.trim() ?? "";

function Thread({ onOpen }: { onOpen?: () => void }) {
  return (
    <BubbleGroup>
      <Bubble>
        <BubbleContent>
          The log is here: <a href="#log">unit log</a>
        </BubbleContent>
      </Bubble>
      <Bubble tone="tint" pending>
        <BubbleContent render={<button type="button" onClick={onOpen} />}>Open the thread</BubbleContent>
        <BubbleReactions>
          <button type="button" aria-pressed="true" aria-label="Thumbs up, 1, you reacted">
            👍 <span className="kl-code">1</span>
          </button>
        </BubbleReactions>
      </Bubble>
      <Bubble tone="attention">
        <BubbleContent>Bay 2 has power for the reefer.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}

describe("bubble: a11y", () => {
  it("has no axe violations in any tone, pending, with reactions and a text cell that acts", async () => {
    await render(
      <main>
        <Thread />
      </main>,
    );
    await expectNoAxeViolations();
  });

  it("the ! cell and the pending segment are hidden from the accessibility tree; a pending bubble is busy", async () => {
    await render(
      <main>
        <Thread />
      </main>,
    );
    for (const bang of document.querySelectorAll("[data-slot=bubble-bang]"))
      expect(bang.getAttribute("aria-hidden")).toBe("true");
    const pending = document.querySelector<HTMLElement>("[data-slot=bubble][data-pending]")!;
    expect(pending.getAttribute("aria-busy")).toBe("true");
    expect(pending.querySelector(".kl-pending")?.getAttribute("aria-hidden")).toBe("true");
    // the text takes its direction from its first strong letter
    expect(document.querySelector("[data-slot=bubble-text]")?.getAttribute("dir")).toBe("auto");
  });
});

describe("bubble: keyboard", () => {
  it("Tab runs from the field before, through the link, the text cell and the reaction, to the field after", async () => {
    await render(
      <main>
        <input aria-label="Before" />
        <Thread />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLInputElement>('[aria-label="Before"]')!.focus();
    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard(TAB);
      order.push(name(active()));
    }
    expect(order).toEqual(["unit log", "Open the thread", "Thumbs up, 1, you reacted", "After"]);
    for (let i = 0; i < 4; i++) await userEvent.keyboard(SHIFT_TAB);
    expect(name(active())).toBe("Before");
  });

  it("Enter on a text cell rendered as a button acts", async () => {
    let opened = 0;
    await render(
      <main>
        <Thread onOpen={() => opened++} />
      </main>,
    );
    const cell = document.querySelector<HTMLElement>("button[data-slot=bubble-content]")!;
    cell.focus();
    await userEvent.keyboard("{Enter}");
    expect(opened).toBe(1);
  });
});
