import "./render-count";

import * as React from "react";
import {
  HoverCard,
  HoverCardBody,
  HoverCardFacts,
  HoverCardHeader,
  HoverCardPopup,
  HoverCardTrigger,
} from "@/components/keyline/ui/hover-card";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <HoverCard open>
    <HoverCardPopup>{part}</HoverCardPopup>
  </HoverCard>
);

describeConformance("hover-card", {
  HoverCardTrigger: {
    element: <HoverCardTrigger href="#nora">Nora</HoverCardTrigger>,
    refInstanceof: HTMLAnchorElement,
    slot: "hover-card-trigger",
    wrap: (part) => <HoverCard>{part}</HoverCard>,
  },
  HoverCardPopup: {
    element: <HoverCardPopup>Nora</HoverCardPopup>,
    refInstanceof: HTMLDivElement,
    slot: "hover-card-popup",
    wrap: (part) => <HoverCard open>{part}</HoverCard>,
  },
  HoverCardHeader: {
    element: <HoverCardHeader title="Nora van der Berg" />,
    refInstanceof: HTMLDivElement,
    slot: "hover-card-header",
    wrap: open,
  },
  HoverCardFacts: {
    element: <HoverCardFacts facts={[["Shift", "Early"]]} />,
    refInstanceof: HTMLDListElement,
    slot: "hover-card-facts",
    wrap: open,
  },
  HoverCardBody: {
    element: <HoverCardBody>On site</HoverCardBody>,
    refInstanceof: HTMLDivElement,
    slot: "hover-card-body",
    wrap: open,
  },
});

/** A link in running text with a preview, between two page fields, portalled into the page's landmark. */
function Example() {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} style={{ padding: 40, display: "grid", gridAutoRows: 40, justifyItems: "start" }}>
      <input aria-label="Before" />
      <p style={{ margin: 0, lineHeight: "20px" }}>
        Dispatched by{" "}
        <HoverCard>
          <HoverCardTrigger href="#nora">Nora van der Berg</HoverCardTrigger>
          <HoverCardPopup container={main}>
            <HoverCardHeader media="NB" title="Nora van der Berg" description="Dispatcher" code="E-1042" />
            <HoverCardFacts
              facts={[
                ["Shift", "06:00–14:00"],
                ["Bay", "2"],
              ]}
            />
            <HoverCardBody>On site until 14:00.</HoverCardBody>
          </HoverCardPopup>
        </HoverCard>
      </p>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="hover-card-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="hover-card-popup"]');

/** Keyboard focus on the link opens the card (Option+Tab reaches a link in WebKit). */
async function openByKeyboard() {
  document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
  await userEvent.keyboard(server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}");
  await expect.poll(() => document.activeElement).toBe(trigger());
  await expect.poll(() => popup(), { timeout: 3000 }).not.toBeNull();
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("hover-card: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // non-modal: the page stays live around it, so the whole page is judged
    await expectNoAxeViolations();
  });
});

describe("hover-card: keyboard", () => {
  it("Escape closes the card with focus kept on the link", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => popup()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("is supplementary: Tab from the link goes on to the page, not into the card", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
  });
});

describe("hover-card: construction", () => {
  it("is a control frame one gutter below the link", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const cs = getComputedStyle(p);
    expect([cs.borderTopWidth, cs.borderLeftWidth, cs.borderBottomWidth]).toEqual(["2px", "2px", "2px"]);
    expect(p.getBoundingClientRect().top).toBeCloseTo(trigger().getBoundingClientRect().bottom + 8, 0);
    // the media cell sets initials and codes in proportional figures; the facts' values are tabular
    const media = p.querySelector('[data-slot="hover-card-media"]')!;
    expect(getComputedStyle(media).fontVariantNumeric).toBe("normal");
    expect(getComputedStyle(p.querySelector("dd")!).fontVariantNumeric).toBe("tabular-nums");
  });

  it("the link's underline is a keyline: 1px at rest, a full 2px ink keyline while the card is open", async () => {
    await render(<Example />);
    expect(getComputedStyle(trigger()).backgroundSize).toBe("0% 2px, 100% 1px");
    await openByKeyboard();
    expect(getComputedStyle(trigger()).backgroundSize).toBe("100% 2px, 100% 1px");
  });

  it("under reduced motion the underline does not draw", async () => {
    await render(<Example />);
    expect(getComputedStyle(trigger()).transitionProperty).toBe("background-size");
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    const cs = getComputedStyle(trigger());
    expect(cs.transitionProperty).toBe("none");
    expect(cs.getPropertyValue("--kl-hc-draw").trim()).toBe("0%");
  });

  it("enters from the link side (a fade where clip-path is the cut), instantly under reduced motion", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const bevel = CSS.supports("corner-start-start-shape", "bevel");
    p.style.transition = "none";
    p.setAttribute("data-starting-style", "");
    const start = getComputedStyle(p);
    expect(bevel ? start.clipPath : start.opacity).toBe(bevel ? "inset(0px 0px 100%)" : "0");
    p.removeAttribute("data-starting-style");
    p.style.transition = "";
    expect(parseFloat(getComputedStyle(p).transitionDuration)).toBeGreaterThan(0);
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    expect(getComputedStyle(p).transitionDuration).toBe("0s");
  });
});
