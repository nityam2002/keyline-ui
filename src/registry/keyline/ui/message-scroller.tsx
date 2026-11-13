"use client";

import * as React from "react";
import {
  MessageScroller as Primitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shadcn/react/message-scroller";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { tokenMs } from "../lib/keyline-motion";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { ScrollAreaBars, ScrollAreaRoot, ScrollAreaViewport, type ScrollbarVisibility } from "./scroll-area";

/* A conversation log that keeps to the newest message, on @shadcn/react's MessageScroller (as the reference):
   stick-to-end while new messages arrive, a held position when the reader has scrolled up, scroll kept
   when older messages are prepended, an anchor to land on, and the log semantics (a focusable region
   holding a role="log" list, additions announced). Keyline draws the frame and the jump cell, and adds
   what the primitive leaves to the browser:
   - the reader's place holds when something above it changes size (a file's error wraps, a thumbnail loads).
     Chrome anchors scrolling natively, WebKit does not; one rule now serves both;
   - a message that arrives while the reader follows the conversation unfolds from its top keyline (the
     shared edge with the message before it). Older history never animates;
   - the jump cell counts what arrived below the reader, and a long jump is bounded: it lands one screen
     short at once, then travels the last screen, so it takes the same time from anywhere and stays
     interruptible by wheel, touch or keys.
   The log scrolls inside Keyline's Scroll Area (Base UI), so its bar is the shared one: a cell on the
   frame's edge whose thumb reveals while the reader scrolls or points at the edge, then fades. The viewport and
   content are the primitive's own elements, rendered as the Scroll Area's parts, so neither library is re-implemented. */

/* ------------------------------------------------------------------ *
 * CLASSES
 * ------------------------------------------------------------------ */

const VP = '[data-slot="message-scroller-viewport"]';

const frame = "kl-frame relative flex min-h-0 min-w-0 flex-col";

/* The log scrolls in Keyline's Scroll Area (scroll-area.tsx draws the bar, its reveal and the focus ring above it).
   A log nearly always overflows, so the bar's room is kept from the first message: the first message that overflows
   does not narrow the conversation. overflow-anchor: none: the reader's place is held by one rule in every engine
   (MessageScrollerContent), not by Chrome's own anchoring on top of it. */
const viewport =
  "pe-(--kl-sb) overflow-x-hidden! overscroll-contain [overflow-anchor:none] data-pending-scroll:invisible";

/* runs sit one gutter-and-a-half apart; inside a run, bubbles share keylines. The log is a size container (kl-log),
   so a narrow panel narrows the messages, not the window. */
const content = cn(
  "@container/kl-log flex min-h-full flex-col gap-[calc(var(--kl-gutter)+8px)]",
  "px-[calc(var(--kl-inset)+4px)] pt-[calc(var(--kl-inset)+4px)] pb-[calc(var(--kl-inset)+8px)]",
);

const item = "min-w-0 flex-none";

const separator = cn(
  "flex items-center gap-2.5 text-kl-ink-2",
  "[[data-slot=message-scroller-item]>&]:mb-[calc(var(--kl-gutter)+8px)]",
  "before:flex-[1_1_0] before:border-t-(length:--kl-k1) before:border-kl-line-soft before:content-['']",
  "after:flex-[1_1_0] after:border-t-(length:--kl-k1) after:border-kl-line-soft after:content-['']",
);

/* THE JUMP CELL sits over the frame's bottom (or top) keyline, centred: the label, then a count cell that is inserted
   (0 → its width) while messages wait below. It folds out when there is nothing that way. */
const jump = cn(
  "kl-ctl kl-key group/jump absolute start-1/2 z-2 inline-flex h-8 cursor-pointer items-stretch",
  "-translate-x-1/2 bg-kl-raised text-kl-ink kl-rtl:translate-x-1/2",
  "font-(family-name:--kl-font) text-[13px] font-(--kl-weight-strong)",
  "[transition:opacity_var(--kl-t-unfold)_linear]",
  "data-[direction=end]:bottom-3 data-[direction=start]:top-3",
  "data-[active=false]:pointer-events-none data-[active=false]:invisible data-[active=false]:opacity-0",
  "data-[active=false]:[transition:opacity_var(--kl-t-fold)_linear,visibility_0s_var(--kl-t-fold)]",
);
const jumpLabel = "inline-flex items-center gap-1.5 ps-2.5 pe-3 group-hover/jump:bg-kl-tint";
const jumpCount = cn(
  "grid place-items-center border-s-(length:--kl-k1) border-kl-seam px-2.5 whitespace-nowrap",
  "bg-kl-inverse font-(family-name:--kl-font-mono) text-[11px]/none font-medium text-kl-on-inverse not-italic tabular-nums",
);

const UNITS = '[data-slot="bubble"], [data-slot="message-header"], [role="separator"]';
const reduced = (el: Element) =>
  matchMedia("(prefers-reduced-motion: reduce)").matches || !!el.closest('[data-kl-motion="reduce"]');

/** State for one log. `autoScroll` (default true here) keeps the log on the newest message while the reader
 *  is at the end; scrolled up, their place is held. After the reader sends, call `useMessageScroller().scrollToEnd()`. */
function MessageScrollerProvider({ autoScroll = true, ...props }: React.ComponentProps<typeof Primitive.Provider>) {
  return <Primitive.Provider autoScroll={autoScroll} {...props} />;
}

/** The frame. Give it a height (or put it in a flex column): the viewport scrolls inside. */
function MessageScroller({ className, ...props }: React.ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root data-slot="message-scroller" className={cn(frame, className)} {...props} />;
}

/** The scrolling region; `aria-label` names it (default "Messages"). `scrollbarVisibility` as on ScrollArea. */
function MessageScrollerViewport({
  className,
  children,
  tabIndex,
  scrollbarVisibility = "system",
  ...props
}: React.ComponentProps<typeof Primitive.Viewport> & { scrollbarVisibility?: ScrollbarVisibility }) {
  return (
    <ScrollAreaRoot
      data-slot="message-scroller-scroll"
      scrollbarVisibility={scrollbarVisibility}
      className="flex-auto"
      // Pressing the bar is the reader taking over, as a wheel is: the log stops following the newest message (so a
      // message arriving under a held thumb does not move the content beneath it), and a jump in flight stops where it
      // is. The primitive reads intent from the viewport's wheel, so the press tells it that way, with no distance.
      onPointerDownCapture={(e) => {
        const vp = e.currentTarget.querySelector<HTMLElement>(VP);
        if (e.button !== 0 || !vp || !(e.target as Element).closest?.('[data-slot="scroll-area-scrollbar"]')) return;
        if (vp.scrollHeight - vp.clientHeight - vp.scrollTop <= 2) {
          const bubbles = vp.querySelectorAll('[data-slot="bubble"]');
          const newest = bubbles[bubbles.length - 1];
          if (newest) seenAtPress.set(vp, newest);
          const release = () => {
            seenAtPress.delete(vp);
            window.removeEventListener("pointerup", release, true);
            window.removeEventListener("pointercancel", release, true);
          };
          window.addEventListener("pointerup", release, true);
          window.addEventListener("pointercancel", release, true);
        }
        vp.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true }));
      }}
    >
      {/* the reader's props go to Base UI, which merges handlers with its own and hands everything to the primitive */}
      <ScrollAreaViewport
        {...(props as React.ComponentProps<typeof ScrollAreaViewport>)}
        data-slot="message-scroller-viewport"
        className={cn(viewport, className)}
        // the log stays a tab stop even before it overflows, as the primitive makes it
        tabIndex={tabIndex ?? 0}
        render={(p) => <Primitive.Viewport {...(p as React.ComponentProps<typeof Primitive.Viewport>)} />}
      >
        {children}
      </ScrollAreaViewport>
      <ScrollAreaBars />
    </ScrollAreaRoot>
  );
}

/** The first unit (bubble, header, separator) whose top is at or below the viewport's top: the line being read. */
function readingAnchor(content: HTMLElement, vpTop: number) {
  const items = content.children;
  // items are in order: find the first that reaches below the top (binary search), then its first unit at or below it
  let lo = 0;
  let hi = items.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const box = items[mid]?.getBoundingClientRect();
    if (box && box.bottom <= vpTop) lo = mid + 1;
    else hi = mid;
  }
  for (let i = lo; i < Math.min(items.length, lo + 3); i++) {
    const item = items[i] as HTMLElement;
    if (item.hidden) continue;
    const units = item.matches(UNITS) ? [item] : Array.from(item.querySelectorAll<HTMLElement>(UNITS));
    for (const u of units) {
      const top = u.getBoundingClientRect().top;
      if (top >= vpTop - 0.5) return { el: u, top };
    }
  }
  return null;
}

function MessageScrollerContent({ className, ref, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  const own = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      own.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  React.useEffect(() => {
    const content = own.current;
    const vp = content?.parentElement;
    if (!content || !vp) return;

    /* HOLD THE READER'S PLACE across size changes above it */
    let anchor: { el: HTMLElement; top: number } | null = null;
    let atEnd = true;
    let frame = 0;
    const record = () => {
      frame = 0;
      atEnd = vp.scrollHeight - vp.clientHeight - vp.scrollTop <= 2;
      anchor = atEnd ? null : readingAnchor(content, vp.getBoundingClientRect().top);
    };
    /* THE READER LEAVES THE END by the scroll itself, not by the order of its events. The primitive stops following
       the end on the reader's wheel, touch or key, and on a scroll up, except in the 180ms after it scrolled to the
       end itself, when it takes a scroll up for its own. WebKit can scroll for a wheel before it dispatches the wheel
       event, so a fast wheel just after a message arrived was taken for the log's own scroll: the log kept following
       (Latest hidden), and its next follow put the reader back at the end. The primitive never scrolls up while it
       follows, so a scroll up that leaves the end while it still follows is the reader's. This listener runs after
       the primitive's (React's listener was added when the element was created): if the primitive still follows
       (data-scrollable, written as it handles the scroll, says nothing waits below) though the reader is away from
       the end, it gets the reader's intent and then the scroll again, so it shows Latest. The intent goes as a
       touchmove, which only the primitive reads: Base UI's scroll area takes a wheel for user input and would reveal
       the thumb for a scroll it did not see the reader make (focus moving to a control above, say). */
    let lastTop = vp.scrollTop;
    const leave = () => {
      const top = vp.scrollTop;
      const up = top < lastTop - 0.5;
      lastTop = top;
      // 8px: the primitive's default edge threshold; nearer the end than that, it follows on its own terms
      if (!up || vp.scrollHeight - vp.clientHeight - top <= 8) return;
      if ((vp.getAttribute("data-scrollable") ?? "").split(" ").includes("end")) return;
      vp.dispatchEvent(new Event("touchmove", { bubbles: true }));
      vp.dispatchEvent(new Event("scroll"));
    };
    const onScroll = () => {
      leave();
      if (!frame) frame = requestAnimationFrame(record);
    };
    vp.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      // following the end belongs to the primitive. (Its data-autoscrolling flag is not a reliable "jump in flight"
      // signal: it can stay set after scrolling stops. A jump records a fresh anchor every frame instead.)
      if (atEnd || !anchor || !anchor.el.isConnected) return;
      const delta = anchor.el.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) > 0.5) vp.scrollTop += delta;
      anchor.top = anchor.el.getBoundingClientRect().top;
    });
    ro.observe(content);

    /* ARRIVAL: messages added after the newest one unfold from their top keyline */
    const units = () => content.querySelectorAll<HTMLElement>('[data-slot="bubble"]');
    let last: HTMLElement | null = Array.from(units()).at(-1) ?? null;
    let ready = false;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => (ready = true)));
    const mo = new MutationObserver(() => {
      const all = Array.from(units());
      const i = last ? all.indexOf(last) : -1;
      const known = !last || i >= 0;
      const fresh = known ? all.slice(i + 1) : [];
      last = all.at(-1) ?? null;
      if (!ready || !fresh.length) return;
      const ms = tokenMs(content, "--kl-t-unfold", 160);
      if (!ms || reduced(content)) return;
      const targets = new Set<HTMLElement>();
      for (const b of fresh) {
        const run = b.closest<HTMLElement>('[data-slot="message"]');
        // the first bubble of a new run brings its header and avatar with it
        targets.add(run && run.querySelector('[data-slot="bubble"]') === b ? run : b);
      }
      const ease = getComputedStyle(content).getPropertyValue("--kl-ease-out").trim() || "ease-out";
      for (const t of targets) {
        t.animate([{ clipPath: "inset(0 -24px 100% -24px)" }, { clipPath: "inset(0 -24px -24px -24px)" }], {
          duration: ms,
          easing: ease,
        });
      }
    });
    mo.observe(content, { childList: true, subtree: true });

    return () => {
      vp.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(r);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  // the Scroll Area's content part (it re-measures the thumb when messages arrive or change size), rendered as the log
  return (
    <ScrollAreaPrimitive.Content
      {...(props as React.ComponentProps<typeof ScrollAreaPrimitive.Content>)}
      ref={setRef}
      data-slot="message-scroller-content"
      className={cn(content, className)}
      // Base UI marks its wrapper presentational; the log keeps its own role ("log" unless the reader names another)
      render={({ role: _presentation, ...p }) => (
        <Primitive.Content {...(p as React.ComponentProps<typeof Primitive.Content>)} role={props.role} />
      )}
    />
  );
}

/** One entry of the log: one sender's run (a Message), a separator, or a notice. `messageId` lets you scroll to
 *  it; `scrollAnchor` lands the first view on it. */
function MessageScrollerItem({ className, ...props }: React.ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item data-slot="message-scroller-item" className={cn(item, className)} {...props} />;
}

/** A day or "New messages" divider: a seam with its words in the Code voice. */
function MessageScrollerSeparator({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", Record<string, never>>): React.ReactElement {
  const state = {};
  return useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">(props, {
      role: "separator",
      className: resolveClassName(separator, className)(state),
      style: resolveStyle(undefined, style)(state),
      children: <span className="kl-code">{children}</span>,
      "data-slot": "message-scroller-separator",
    } as React.ComponentProps<"div">),
  });
}

/** The newest message when the reader pressed the bar while at the end (for the count; cleared at release). */
const seenAtPress = new WeakMap<Element, Element>();

/** How many messages arrived below the reader since they left the end (0 while they are at the end). */
function useUnseen(button: React.RefObject<HTMLElement | null>, active: boolean) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const vp = button.current?.closest('[data-slot="message-scroller"]')?.querySelector<HTMLElement>(VP);
    const content = vp?.querySelector<HTMLElement>('[data-slot="message-scroller-content"]');
    if (!active || !vp || !content) {
      setN(0);
      return;
    }
    const bubbles = () => content.querySelectorAll<HTMLElement>('[data-slot="bubble"]');
    // the mark is the newest message when the reader left the end: they had seen it. A reader holding the
    // thumb at the end leaves it because a message arrived under it, so the mark is the newest at the press.
    const held = seenAtPress.get(vp);
    const mark = (held?.isConnected ? held : null) ?? Array.from(bubbles()).at(-1) ?? null;
    let frame = 0;
    const count = () => {
      frame = 0;
      if (!mark?.isConnected) return setN(0);
      const bottom = vp.getBoundingClientRect().bottom;
      let c = 0;
      for (const b of bubbles())
        if (
          mark.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING &&
          b.getBoundingClientRect().top > bottom - 8
        )
          c++;
      setN(c);
    };
    const later = () => {
      if (!frame) frame = requestAnimationFrame(count);
    };
    const mo = new MutationObserver(later);
    mo.observe(content, { childList: true, subtree: true });
    vp.addEventListener("scroll", later, { passive: true });
    later(); // what is already below the mark (a message that arrived as the reader left the end)
    return () => {
      mo.disconnect();
      vp.removeEventListener("scroll", later);
      cancelAnimationFrame(frame);
    };
  }, [active, button]);
  return n;
}

/**
 * The jump cell: appears on the frame's bottom keyline (end) or top keyline (start) when there is more that
 * way; out of the tab order and hidden while there is nothing to jump to. Toward the end it counts the messages
 * that arrived below the reader ("Latest | 3 new"); pass `children` to name it otherwise.
 */
function MessageScrollerButton({
  direction = "end",
  className,
  children,
  behavior,
  onClick,
  onPointerDown,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof Primitive.Button>) {
  // The jump smooth-scrolled under reduced motion, and a keyboard jump left focus on the page (the library
  // blurs the button). Motion is read when the press starts (a discrete event, so the state lands before the click);
  // after a keyboard jump focus goes to the log, which is where the reader now is.
  const [still, setStill] = React.useState(false);
  const read = (e: React.SyntheticEvent<HTMLElement>) => setStill(reduced(e.currentTarget));
  const self = React.useRef<HTMLButtonElement | null>(null);
  const scrollable = useMessageScrollerScrollable();
  const unseen = useUnseen(self, direction === "end" && scrollable.end);
  const label = children ?? (direction === "end" ? "Latest" : "Earliest");
  return (
    <Primitive.Button
      ref={self}
      data-slot="message-scroller-button"
      data-direction={direction}
      direction={direction}
      behavior={behavior ?? (still ? "auto" : "smooth")}
      aria-label={
        unseen
          ? `${typeof label === "string" ? label : direction === "end" ? "Latest" : "Earliest"}, ${unseen} new ${unseen === 1 ? "message" : "messages"}`
          : undefined
      }
      className={cn(jump, className)}
      onPointerDown={(e) => {
        read(e);
        onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        read(e);
        onKeyDown?.(e);
      }}
      onClick={(e) => {
        onClick?.(e);
        const vp = e.currentTarget.closest('[data-slot="message-scroller"]')?.querySelector<HTMLElement>(VP);
        // The jump and the bar are one response. Base UI shows the thumb for the reader's own scrolling only,
        // so while the jump they asked for travels, the bar shows it travelling, and fades with the usual idle after it lands.
        const area = vp?.closest<HTMLElement>('[data-slot="message-scroller-scroll"]');
        if (vp && area && !e.defaultPrevented) {
          area.setAttribute("data-kl-travel", "");
          let idle = 0;
          const land = () => {
            clearTimeout(idle);
            idle = window.setTimeout(done, 500);
          };
          const done = () => {
            clearTimeout(idle);
            clearTimeout(cap);
            vp.removeEventListener("scroll", land);
            area.removeAttribute("data-kl-travel");
          };
          vp.addEventListener("scroll", land, { passive: true });
          land();
          const cap = window.setTimeout(done, 1500);
        }
        // A bounded jump: from far away, land one screen short at once; the smooth part is always about one screen.
        if (vp && !e.defaultPrevented && !(still || behavior === "auto")) {
          const h = vp.clientHeight;
          if (direction === "end") {
            const max = vp.scrollHeight - h;
            if (max - vp.scrollTop > 2 * h) vp.scrollTop = max - h;
          } else if (vp.scrollTop > 2 * h) vp.scrollTop = h;
          // Neither engine stops a scripted smooth scroll when the reader takes over (the wheel is swallowed
          // until it lands). Their first wheel, touch or key stops it where it is, and then acts as usual.
          const stop = () => {
            off();
            vp.scrollTo({ top: vp.scrollTop, behavior: "instant" });
          };
          const off = () => {
            clearTimeout(t);
            for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"]) vp.removeEventListener(ev, stop);
          };
          for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"])
            vp.addEventListener(ev, stop, { passive: true, once: true });
          const t = setTimeout(off, 1000);
        }
        if (e.detail !== 0) return;
        requestAnimationFrame(() => vp?.focus({ preventScroll: true }));
      }}
      {...props}
    >
      <span data-slot="message-scroller-button-label" className={jumpLabel}>
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
          aria-hidden
        >
          <path d={direction === "end" ? "M8 2.5v10M3.5 8.5l4.5 4.5 4.5-4.5" : "M8 13.5v-10M3.5 7.5L8 3l4.5 4.5"} />
        </svg>
        <span>{label}</span>
      </span>
      <span
        data-slot="message-scroller-button-count"
        className="kl-slot"
        data-open={unseen ? "" : undefined}
        aria-hidden
      >
        <span className="flex">
          <span className={jumpCount}>{unseen ? `${unseen} new` : ""}</span>
        </span>
      </span>
    </Primitive.Button>
  );
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerSeparator,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};
