// MessageScroller: the separator Keyline renders itself (conformance), the @shadcn/react parts' forwarding, axe, the
// log's place in the Tab order, and when the jump to Latest shows, including the order WebKit delivers a fast wheel in.
import * as React from "react";
import { Bubble, BubbleContent } from "@/components/keyline/ui/bubble";
import { Message, MessageContent } from "@/components/keyline/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerSeparator,
  MessageScrollerViewport,
} from "@/components/keyline/ui/message-scroller";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inLog = (part: React.ReactNode) => (
  <MessageScrollerProvider>
    <MessageScroller style={{ height: 200 }}>
      <MessageScrollerViewport>
        <MessageScrollerContent>{part}</MessageScrollerContent>
      </MessageScrollerViewport>
    </MessageScroller>
  </MessageScrollerProvider>
);

describeConformance("message-scroller", {
  MessageScrollerSeparator: {
    element: <MessageScrollerSeparator>TODAY</MessageScrollerSeparator>,
    refInstanceof: HTMLDivElement,
    slot: "message-scroller-separator",
  },
});

/*
 * The other parts are @shadcn/react's MessageScroller (it owns following the end, holding the place and the jump).
 * They take a string className, so Base UI's wrapper contract applies only in part: each forwards its props, its ref
 * and a className to its element, which carries the part's slot.
 */
const PRIMITIVE_PARTS: Record<
  string,
  {
    element: React.ReactElement<Record<string, unknown>>;
    slot: string;
    tag: string;
    wrap: (p: React.ReactNode) => React.ReactNode;
  }
> = {
  MessageScroller: {
    element: <MessageScroller />,
    slot: "message-scroller",
    tag: "DIV",
    wrap: (p) => <MessageScrollerProvider>{p}</MessageScrollerProvider>,
  },
  MessageScrollerViewport: {
    element: <MessageScrollerViewport />,
    slot: "message-scroller-viewport",
    tag: "DIV",
    wrap: (p) => (
      <MessageScrollerProvider>
        <MessageScroller>{p}</MessageScroller>
      </MessageScrollerProvider>
    ),
  },
  MessageScrollerContent: {
    element: <MessageScrollerContent />,
    slot: "message-scroller-content",
    tag: "DIV",
    wrap: (p) => (
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>{p}</MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
    ),
  },
  MessageScrollerItem: { element: <MessageScrollerItem />, slot: "message-scroller-item", tag: "DIV", wrap: inLog },
  MessageScrollerButton: {
    element: <MessageScrollerButton />,
    slot: "message-scroller-button",
    tag: "BUTTON",
    wrap: (p) => (
      <MessageScrollerProvider>
        <MessageScroller>{p}</MessageScroller>
      </MessageScrollerProvider>
    ),
  },
};

describe("message-scroller: @shadcn/react parts", () => {
  for (const [name, part] of Object.entries(PRIMITIVE_PARTS)) {
    it(`${name}: props, ref and className reach its element, which carries its slot`, async () => {
      const ref = React.createRef<HTMLElement>();
      const el = React.cloneElement(part.element, {
        ref,
        "data-testid": "part",
        "data-probe": "kept",
        className: "from-part",
      });
      await render(<main>{part.wrap(el)}</main>);
      const node = document.querySelector<HTMLElement>('[data-testid="part"]')!;
      expect(node.tagName).toBe(part.tag);
      expect(ref.current).toBe(node);
      expect(node.getAttribute("data-probe")).toBe("kept");
      expect(node.classList.contains("from-part")).toBe(true);
      expect(node.getAttribute("data-slot")).toBe(part.slot);
    });
  }
});

/* A log of whole-pixel rows that overflows its frame several times over; `add` appends one more message. */
let add: () => void = () => {};
function Log({ count = 30 }: { count?: number }) {
  const [n, setN] = React.useState(count);
  React.useEffect(() => {
    add = () => setN((x) => x + 1);
  }, []);
  return (
    <MessageScrollerProvider>
      <MessageScroller style={{ height: 240, width: 360 }} data-testid="frame">
        <MessageScrollerViewport aria-label="Conversation">
          <MessageScrollerContent>
            <MessageScrollerItem>
              <MessageScrollerSeparator>TODAY</MessageScrollerSeparator>
            </MessageScrollerItem>
            {Array.from({ length: n }, (_, i) => (
              <MessageScrollerItem key={i} messageId={`m${i}`}>
                <Message>
                  <MessageContent>
                    <Bubble>
                      <BubbleContent>{`Message ${i + 1}`}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

const vp = () => document.querySelector<HTMLElement>("[data-slot=message-scroller-viewport]")!;
const jump = () => document.querySelector<HTMLElement>("[data-slot=message-scroller-button]")!;
const frames = (n = 2) =>
  new Promise<void>((r) => {
    const step = (k: number) => (k ? requestAnimationFrame(() => step(k - 1)) : r());
    step(n);
  });
const scrolled = (el: HTMLElement) =>
  new Promise<void>((r) => el.addEventListener("scroll", () => r(), { once: true }));
const atEnd = () => vp().scrollHeight - vp().clientHeight - vp().scrollTop <= 2;

describe("message-scroller: a11y", () => {
  it("has no axe violations at the end and scrolled up (the jump shown)", async () => {
    await render(
      <main>
        <Log />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    await expectNoAxeViolations();
    vp().dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: -400 }));
    vp().scrollTop = 0;
    await expect.poll(() => jump().getAttribute("data-active")).toBe("true");
    // judged once the cell has faded in (axe reads its contrast through the fade)
    await expect.poll(() => getComputedStyle(jump()).opacity).toBe("1");
    await expectNoAxeViolations();
  });
});

describe("message-scroller: keyboard", () => {
  it("Tab goes from the field before to the log to the field after; the hidden jump is skipped", async () => {
    await render(
      <main>
        <input aria-label="Before" />
        <Log />
        <input aria-label="After" />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    expect(jump().getAttribute("data-active")).toBe("false");
    document.querySelector<HTMLInputElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(vp());
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });

  it("Enter on the jump lands on the newest message and puts focus on the log", async () => {
    await render(
      <main>
        <Log />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    vp().dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: -400 }));
    vp().scrollTop = 0;
    await expect.poll(() => jump().getAttribute("data-active")).toBe("true");
    jump().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(atEnd).toBe(true);
    await expect.poll(() => document.activeElement).toBe(vp());
  });
});

describe("message-scroller: the reader leaves the end", () => {
  /*
   * WebKit can scroll for a wheel before it dispatches the wheel event (its scrolling thread scrolls; the page hears
   * the scroll, then the wheel). The primitive tells the reader's scroll from its own by the wheel, and decides
   * whether to show Latest on each scroll event. In the moments after it scrolled to a new message itself, a scroll up
   * that comes without a wheel is taken as its own: the log stays "following" and Latest stays hidden. The wheel
   * then arrives and the log stops following, but no scroll comes after it, so nothing showed Latest: one fast wheel
   * up left the reader at the top of the history with no way back but scrolling. The test sends that order.
   */
  it("a scroll that arrives before its wheel event (WebKit's order) still shows Latest", async () => {
    await render(
      <main>
        <Log />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    await frames();
    // a message arrives while the reader follows: the log scrolls to it itself
    const own = scrolled(vp());
    add();
    await own;
    expect(atEnd()).toBe(true);
    // the reader's fast wheel up, in WebKit's order: the scroll first …
    const reader = scrolled(vp());
    vp().scrollTop = 0;
    await reader;
    await frames(1);
    // … then the wheel event, with no scroll after it
    vp().dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -800 }));
    await frames(3);
    expect(vp().scrollTop).toBe(0);
    expect(jump().getAttribute("data-active")).toBe("true");
  });

  it("scrolls up with no reader input (focus moving to a control above) show Latest and leave the thumb hidden", async () => {
    // No reader input means no pointer over the log either. Base UI takes a pointerenter or pointermove on the
    // viewport for the reader's (and reveals the thumb for the scrolls after it), and the pointer is wherever an
    // earlier test in this page left it: park it in the frame's far corner before the log appears under it.
    await render(<span data-testid="park" style={{ position: "fixed", right: 0, bottom: 0, width: 8, height: 8 }} />);
    await userEvent.hover(document.querySelector<HTMLElement>("[data-testid=park]")!);
    await render(
      <main>
        <Log />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    await frames();
    const own = scrolled(vp());
    add();
    await own;
    for (const top of [0, 40]) {
      const s = scrolled(vp());
      vp().scrollTop = top;
      await s;
    }
    await frames(3);
    expect(jump().getAttribute("data-active")).toBe("true");
    // the scroll area reveals its thumb for the reader's scrolls only
    expect(document.querySelector("[data-slot=scroll-area-scrollbar][data-scrolling]")).toBeNull();
  });

  it("the wheel first (Chromium's order) shows Latest too", async () => {
    await render(
      <main>
        <Log />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    await frames();
    const own = scrolled(vp());
    add();
    await own;
    vp().dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -800 }));
    const reader = scrolled(vp());
    vp().scrollTop = 0;
    await reader;
    await frames(3);
    expect(jump().getAttribute("data-active")).toBe("true");
  });

  it("a wheel at the end that does not leave it keeps Latest hidden", async () => {
    await render(
      <main>
        <Log />
      </main>,
    );
    await expect.poll(atEnd).toBe(true);
    await frames();
    vp().dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 400 }));
    await frames(3);
    expect(jump().getAttribute("data-active")).toBe("false");
  });
});
