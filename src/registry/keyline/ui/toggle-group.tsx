"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";

import { cn } from "@/lib/utils";
import { floodHandlers } from "../lib/keyline-motion";
import { resolveClassName } from "../lib/keyline-render";
import { toggleContents, toggleVariants } from "./toggle";
import { useScrollEdges } from "../lib/scroll-edges";
import { useMergedRef } from "../lib/keyline-scope";

type ToggleGroupProps = ToggleGroupPrimitive.Props & {
  /** cell: a cell of an enclosing frame (no own border, cut or background). */
  layout?: "control" | "cell";
};

/** Independent toggles in one frame. Each cell FLOODS yellow from the press point and carries a lamp. A row that
 * does not fit scrolls inside its frame. */
function ToggleGroup({
  className,
  multiple = true,
  layout = "control",
  ref: refProp,
  ...props
}: ToggleGroupProps): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  useScrollEdges(ref);
  const setRef = useMergedRef(ref, refProp);
  return (
    <ToggleGroupPrimitive
      ref={setRef}
      data-kl-layout={layout}
      multiple={multiple}
      className={resolveClassName(
        cn(
          "kl-ctl kl-cells inline-flex min-h-(--kl-ctl) max-w-full overflow-x-auto",
          // a cell gives its background to the enclosing frame (the foundation's layout="cell")
          layout === "control" && "bg-kl-cell",
        ),
        className,
      )}
      {...props}
      data-slot="toggle-group"
    />
  );
}

type ToggleGroupItemProps = TogglePrimitive.Props & { count?: React.ReactNode };

/** One toggle of the group: Base UI's Toggle, drawn as Toggle's cell inside the group's frame. */
function ToggleGroupItem({ className, children, count, ...props }: ToggleGroupItemProps): React.ReactElement {
  return (
    <TogglePrimitive
      className={resolveClassName(cn(toggleVariants()), className)}
      {...floodHandlers}
      {...props}
      data-slot="toggle-group-item"
    >
      {toggleContents(children, { count })}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps };
