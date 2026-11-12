"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useStretch } from "../lib/keyline-motion";
import { resolveClassName } from "../lib/keyline-render";
import { useScrollEdges } from "../lib/scroll-edges";
import { useMergedRef } from "../lib/keyline-scope";

/*
 * Tabs: location. The current tab sits under a cobalt band that STRETCHES between tabs (leading edge first, zero
 * bounce). The band and the covered labels are drawn by the stretch engine (keyline-motion): it sizes the band and
 * marks each tab it covers with data-kl-covered. In flight it clones the row with every tab covered and drops the
 * clone's data-slot, so every style here sits on the element it styles, and the clone reads the same.
 *
 * The root is the outermost Keyline element (kl-type), so its panels take Keyline's type and ink from it, as the list
 * does, and a Tabs inside another Keyline element inherits instead.
 */
const root = "kl-type grid min-w-0 [align-content:start] gap-(--kl-gutter)";

/** The row: one control frame of tab cells, scrolling sideways when it doesn't fit. */
const listVariants = cva("kl-ctl kl-cells relative isolate flex min-h-(--kl-ctl) max-w-full overflow-x-auto", {
  variants: {
    // a cell gives its background to the enclosing frame (the foundation's layout="cell") and fills the row
    layout: { control: "justify-self-start bg-kl-cell", cell: "justify-self-stretch" },
  },
  defaultVariants: { layout: "control" },
});

/*
 * A tab: its label, and the count voice under it. The first tab after the band draws no divider and clears the
 * enclosing frame's cut (--kl-c-room). A disabled tab that is still the chosen one keeps the disabled ink.
 */
const tab = cn(
  "group/tab kl-key flex cursor-pointer flex-col items-start justify-center gap-[3px] bg-transparent px-4 py-1.5",
  "text-start font-(family-name:--kl-font) whitespace-nowrap text-kl-ink",
  "first-of-type:ps-[calc(16px+var(--kl-c-room,0px))] data-has-count:min-w-[104px] nth-2:border-s-0",
  "hover:not-data-active:not-data-disabled:bg-kl-tint focus-visible:outline-offset-(--kl-ring-in)",
  "data-kl-covered:not-data-disabled:text-kl-on-cobalt",
  "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  "forced-colors:data-kl-covered:text-[HighlightText] forced-colors:data-kl-covered:forced-color-adjust-none",
);

const panel = cn(
  "min-w-0 outline-none",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-out) focus-visible:outline-kl-focus focus-visible:outline-solid",
);

/**
 * Tabs: location. Keyboard, roving focus, aria and panels come from Base UI Tabs; activation follows focus by
 * default, as in a view switcher. Works with or without panels (e.g. table views).
 */
function TabsRoot({ className, ...props }: TabsPrimitive.Root.Props): React.ReactElement {
  return <TabsPrimitive.Root className={resolveClassName(root, className)} {...props} data-slot="tabs" />;
}

type TabsListProps = TabsPrimitive.List.Props & {
  /** control: its own frame. cell: inside an enclosing frame (no own border, no cut). */
  layout?: "control" | "cell";
};

/** The tab row (Base UI Tabs.List), with the band beneath its tabs. */
function TabsList({
  className,
  children,
  layout = "control",
  activateOnFocus = true,
  ref: refProp,
  ...props
}: TabsListProps): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(ref, refProp);
  const [active, setActive] = React.useState(-1);
  // Base UI owns the value (controlled or not). Uncontrolled Tabs change selection without re-rendering
  // this wrapper, so the active tab is read from the DOM on mount and whenever a tab's selection flips.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const tabs = Array.from(el.querySelectorAll<HTMLElement>("[data-kl-item]"));
      const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      setActive((p) => (p === i ? p : i));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected"] });
    return () => mo.disconnect();
  }, []);
  useStretch(ref, active);
  useScrollEdges(ref);
  return (
    <TabsPrimitive.List
      ref={setRef}
      data-kl-stretch=""
      data-kl-layout={layout}
      activateOnFocus={activateOnFocus}
      className={resolveClassName(cn(listVariants({ layout })), className)}
      {...props}
      data-slot="tabs-list"
    >
      <span
        data-kl-band=""
        className="pointer-events-none absolute -z-1 bg-kl-cobalt forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none"
        aria-hidden
        hidden
      />
      {children}
    </TabsPrimitive.List>
  );
}

type TabsTabProps = TabsPrimitive.Tab.Props & {
  /** The count voice under the label (e.g. records in a view). */
  count?: React.ReactNode;
};

/** A tab (Base UI Tabs.Tab). `count` adds the count voice under the label. */
function TabsTab({ className, children, count, ...props }: TabsTabProps): React.ReactElement {
  return (
    <TabsPrimitive.Tab
      data-kl-item=""
      data-has-count={count != null || undefined}
      className={resolveClassName(tab, className)}
      {...props}
      data-slot="tabs-tab"
    >
      <span
        data-slot="tabs-tab-label"
        className="text-(length:--kl-text-body) font-(--kl-weight-strong) group-data-has-count/tab:text-(length:--kl-text-label)"
      >
        {children}
      </span>
      {count != null ? (
        <span data-slot="tabs-tab-count" className="text-[21px]/none font-(--kl-weight-strong) tabular-nums">
          {count}
        </span>
      ) : null}
    </TabsPrimitive.Tab>
  );
}

/** A tab's panel (Base UI Tabs.Panel). */
function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props): React.ReactElement {
  return <TabsPrimitive.Panel className={resolveClassName(panel, className)} {...props} data-slot="tabs-panel" />;
}

/** The root under its short name, as before the parts were named after Base UI's. */
const Tabs = TabsRoot;

export { Tabs, TabsRoot, TabsList, TabsTab, TabsPanel, type TabsListProps, type TabsTabProps };
