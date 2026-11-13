// Carousel's parts (conformance; Previous and Next are Buttons), axe, the arrow keys on the region (mirrored in RTL),
// the Tab order through the control row and out at both edges, and slides out of view kept out of it.
import * as React from "react";
import {
  Carousel,
  CarouselBar,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPosition,
  CarouselPrevious,
} from "@/components/keyline/ui/carousel";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inCarousel = (part: React.ReactNode) => <Carousel aria-label="Trailers">{part}</Carousel>;

describeConformance("carousel", {
  Carousel: { element: <Carousel aria-label="Trailers" />, refInstanceof: HTMLElement, slot: "carousel" },
  CarouselContent: {
    element: <CarouselContent />,
    refInstanceof: HTMLDivElement,
    slot: "carousel-content",
    wrap: inCarousel,
  },
  CarouselItem: {
    element: <CarouselItem>TR-4471</CarouselItem>,
    refInstanceof: HTMLDivElement,
    slot: "carousel-item",
    wrap: (part) => inCarousel(<CarouselContent>{part}</CarouselContent>),
  },
  CarouselBar: { element: <CarouselBar />, refInstanceof: HTMLDivElement, slot: "carousel-bar", wrap: inCarousel },
  CarouselPosition: {
    element: <CarouselPosition />,
    refInstanceof: HTMLDivElement,
    slot: "carousel-position",
    wrap: inCarousel,
  },
  CarouselPrevious: {
    element: <CarouselPrevious />,
    refInstanceof: HTMLButtonElement,
    slot: "button",
    button: true,
    wrap: inCarousel,
  },
  CarouselNext: {
    element: <CarouselNext />,
    refInstanceof: HTMLButtonElement,
    slot: "button",
    button: true,
    wrap: inCarousel,
  },
});

const TRAILERS = ["TR-4471", "TR-4480", "TR-4492"];

function Trailers({ dir, onKeyDown }: { dir?: "rtl"; onKeyDown?: React.KeyboardEventHandler<HTMLElement> }) {
  return (
    <main dir={dir} style={{ width: 420 }}>
      <input aria-label="Before" />
      <Carousel aria-label="Trailers" data-testid="trailers" onKeyDown={onKeyDown}>
        <CarouselContent>
          {TRAILERS.map((t) => (
            <CarouselItem key={t}>
              <p>
                {t} <a href="#manifest">manifest</a>
              </p>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselBar />
      </Carousel>
      <input aria-label="After" />
    </main>
  );
}

/* WebKit on macOS leaves buttons and links out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const SHIFT_TAB = server.browser === "webkit" ? "{Alt>}{Shift>}{Tab}{/Shift}{/Alt}" : "{Shift>}{Tab}{/Shift}";
const active = () => document.activeElement as HTMLElement | null;
const name = (e: Element | null) => e?.getAttribute("aria-label") ?? e?.textContent ?? "";
const count = () => document.querySelector('[data-slot="carousel-count"]')?.textContent;
const region = () => document.querySelector<HTMLElement>('[data-testid="trailers"]')!;
const tick = (n: number) => document.querySelector<HTMLElement>(`[aria-label="Go to ${n} of 3"]`)!;
// Embla reports the slides in view once its observer has run: until then every slide is inert
const ready = async () => {
  await expect.poll(count).toBe("1 / 3");
  await expect
    .poll(() => document.querySelector('[data-slot="carousel-item"][data-in-view]')?.getAttribute("aria-label"))
    .toBe("1 of 3");
};

describe("carousel: a11y", () => {
  it("has no axe violations", async () => {
    await render(<Trailers />);
    await ready();
    await expectNoAxeViolations();
  });

  it("is a named region of slides labelled n of N; slides out of view are inert", async () => {
    await render(<Trailers />);
    await ready();
    expect(region().getAttribute("aria-roledescription")).toBe("carousel");
    const slides = [...document.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]')];
    expect(slides.map((s) => s.getAttribute("aria-label"))).toEqual(["1 of 3", "2 of 3", "3 of 3"]);
    expect(slides.map((s) => s.inert)).toEqual([false, true, true]);
  });
});

describe("carousel: keyboard", () => {
  it("arrow keys step the slides from the control row", async () => {
    await render(<Trailers />);
    await ready();
    tick(1).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(count).toBe("2 / 3");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(count).toBe("1 / 3");
  });

  it("in RTL the arrows mirror: ArrowLeft moves forward", async () => {
    await render(<Trailers dir="rtl" />);
    await ready();
    tick(1).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(count).toBe("2 / 3");
  });

  it("the consumer's onKeyDown runs first and can stop a step", async () => {
    await render(<Trailers onKeyDown={(e) => e.key === "ArrowLeft" && e.preventDefault()} />);
    await ready();
    tick(2).focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(count).toBe("2 / 3");
    // ArrowLeft is stopped; ArrowRight still steps. Had ArrowLeft stepped back, the count would end at 2 / 3
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(count).toBe("3 / 3");
  });

  it("Tab runs through the slide in view and the control row, and out at both edges", async () => {
    await render(<Trailers />);
    await ready();
    document.querySelector<HTMLInputElement>('[aria-label="Before"]')!.focus();
    const order: string[] = [];
    for (let i = 0; i < 7; i++) {
      await userEvent.keyboard(TAB);
      order.push(name(active()));
    }
    // the slides out of view are inert, so their links are not stops; Previous at the start stays focusable
    expect(order).toEqual([
      "manifest",
      "Previous slide",
      "Go to 1 of 3",
      "Go to 2 of 3",
      "Go to 3 of 3",
      "Next slide",
      "After",
    ]);
    for (let i = 0; i < 7; i++) await userEvent.keyboard(SHIFT_TAB);
    expect(name(active())).toBe("Before");
  });

  it("a tick goes to its slide and becomes the current one", async () => {
    await render(<Trailers />);
    await ready();
    tick(3).focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(count).toBe("3 / 3");
    expect(tick(3).getAttribute("aria-current")).toBe("true");
    const next = document.querySelector<HTMLElement>('[aria-label="Next slide"]')!;
    expect(next.getAttribute("aria-disabled")).toBe("true");
  });
});
