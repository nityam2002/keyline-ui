"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";
import { useStretch } from "../lib/keyline-motion";
import { useScrollEdges } from "../lib/scroll-edges";

/**
 * Tabs: location. The current tab sits under a cobalt band that STRETCHES between tabs (leading edge
 * first, zero bounce). Keyboard, roving focus, aria and panels come from Base UI Tabs; activation follows
 * focus by default, as in a view switcher. Works with or without panels (e.g. table views).
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("kl-tabs", className)} {...props} />;
}

/** The tab row. `layout="cell"` puts it inside an enclosing frame (no own border, no cut). */
function TabsList({
  className,
  children,
  layout = "control",
  activateOnFocus = true,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { layout?: "control" | "cell" }) {
  const ref = React.useRef<HTMLDivElement>(null);
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
      ref={ref}
      data-slot="tabs-list"
      data-kl-stretch=""
      data-kl-layout={layout}
      activateOnFocus={activateOnFocus}
      className={cn("kl-ctl kl-cells kl-tabs-list", className)}
      {...props}
    >
      <span data-kl-band="" className="kl-tabs-band" aria-hidden hidden />
      {children}
    </TabsPrimitive.List>
  );
}

/** A tab. `count` adds the count voice under the label (e.g. records in a view). */
function TabsTab({
  className,
  children,
  count,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab> & { count?: React.ReactNode }) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      data-kl-item=""
      data-has-count={count != null || undefined}
      className={cn("kl-key kl-tab", className)}
      {...props}
    >
      <span className="kl-tab-l">{children}</span>
      {count != null ? <span className="kl-tab-n">{count}</span> : null}
    </TabsPrimitive.Tab>
  );
}

function TabsPanel({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Panel>) {
  return <TabsPrimitive.Panel data-slot="tabs-panel" className={cn("kl-tabs-panel", className)} {...props} />;
}

export { Tabs, TabsList, TabsTab, TabsPanel };
