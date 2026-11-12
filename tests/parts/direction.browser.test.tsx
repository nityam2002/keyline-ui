// DirectionProvider (Keyline renders it): the wrapper contract, and what it does: the DOM `dir` on a box that adds no
// box of its own (display: contents), and Base UI's direction for what it holds.
import "./render-count";

import { DirectionProvider, useDirection } from "@/components/keyline/ui/direction";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { describeConformance } from "./conformance";

describeConformance("direction", {
  DirectionProvider: {
    element: <DirectionProvider direction="rtl" />,
    refInstanceof: HTMLDivElement,
    slot: "direction",
  },
});

function Reads() {
  return <span data-testid="reads">{useDirection()}</span>;
}

describe("direction: what it sets", () => {
  it("sets the DOM dir on a wrapper with no box, and Base UI's direction for its subtree", async () => {
    await render(
      <main>
        <DirectionProvider direction="rtl" data-testid="dir" className={(s) => `is-${s.direction}`}>
          <Reads />
        </DirectionProvider>
      </main>,
    );
    const el = document.querySelector<HTMLElement>('[data-testid="dir"]')!;
    expect(el.getAttribute("dir")).toBe("rtl");
    expect(getComputedStyle(el).display).toBe("contents");
    expect(el.classList.contains("is-rtl")).toBe(true);
    expect(document.querySelector('[data-testid="reads"]')!.textContent).toBe("rtl");
  });

  it("a caller's dir does not override the direction it was given", async () => {
    await render(
      <main>
        <DirectionProvider direction="rtl" data-testid="dir" {...{ dir: "ltr" }} />
      </main>,
    );
    expect(document.querySelector('[data-testid="dir"]')!.getAttribute("dir")).toBe("rtl");
  });
});
