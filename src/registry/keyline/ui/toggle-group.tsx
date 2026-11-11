"use client";

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Toggle } from "@base-ui/react/toggle"

import { cn } from "@/lib/utils"
import { floodHandlers } from "../lib/keyline-motion"
import { ToggleLabel } from "./toggle"
import { useScrollEdges } from "../lib/scroll-edges"
import { useMergedRef } from "../lib/keyline-scope"

/** Independent toggles in one frame. Each cell FLOODS yellow from the press point and carries a lamp. */
function ToggleGroup({ className, multiple = true, layout = "control", ref: refProp, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive> & { /** cell: a cell of an enclosing frame (no own border or cut). */ layout?: "control" | "cell" }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useScrollEdges(ref)
  const setRef = useMergedRef(ref, refProp)
  return <ToggleGroupPrimitive ref={setRef} data-slot="toggle-group" data-kl-layout={layout} multiple={multiple} className={cn("kl-ctl kl-cells kl-toggle-group", className)} {...props} />
}

function ToggleGroupItem({ className, children, count, ...props }: React.ComponentProps<typeof Toggle> & { count?: React.ReactNode }) {
  return (
    <Toggle data-slot="toggle-group-item" className={cn("kl-flood kl-key kl-toggle", className)} {...floodHandlers} {...props}>
      <ToggleLabel count={count}>{children}</ToggleLabel>
    </Toggle>
  )
}

export { ToggleGroup, ToggleGroupItem }
