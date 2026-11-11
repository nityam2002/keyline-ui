"use client";

import * as React from "react"
import { RadioGroup } from "@base-ui/react/radio-group"
import { Radio } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"
import { useStretch } from "../lib/keyline-motion"
import { useScrollEdges } from "../lib/scroll-edges"

type SegmentedProps = Omit<React.ComponentProps<typeof RadioGroup>, "value" | "defaultValue" | "onValueChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "default" | "compact"
  /** control: its own frame. cell: a cell of an enclosing frame. */
  layout?: "control" | "cell"
}

/**
 * Exclusive choice inside one control frame. Radio-group semantics (arrows move and select).
 * The ink band STRETCHES between cells: leading edge first, trailing edge follows, zero bounce.
 */
function Segmented({ value, defaultValue, onValueChange, size = "default", layout = "control", className, children, ...props }: SegmentedProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const ref = React.useRef<HTMLDivElement>(null)
  const values = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((c) => (c.props as { value?: string }).value)
  useStretch(ref, values.indexOf(current))
  useScrollEdges(ref)
  return (
    <RadioGroup
      ref={ref}
      data-slot="segmented"
      data-kl-stretch=""
      data-kl-layout={layout}
      value={current}
      onValueChange={(v) => {
        setInner(v as string)
        onValueChange?.(v as string)
      }}
      className={cn("kl-ctl kl-cells kl-segmented", size === "compact" && "kl-segmented-compact", className)}
      {...props}
    >
      <span data-kl-band="" className="kl-segmented-band" aria-hidden hidden />
      {children}
    </RadioGroup>
  )
}

function SegmentedItem({ className, children, ...props }: React.ComponentProps<typeof Radio.Root> & { value: string }) {
  return (
    <Radio.Root data-slot="segmented-item" data-kl-item="" className={cn("kl-key kl-segmented-item", className)} {...props}>
      <span>{children}</span>
    </Radio.Root>
  )
}

export { Segmented, SegmentedItem }
