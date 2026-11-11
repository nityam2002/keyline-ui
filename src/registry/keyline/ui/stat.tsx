"use client";

import * as React from "react"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"

import { cn } from "@/lib/utils"

type Delta = { value: React.ReactNode; /** up/down is direction; tone says whether that is good. */ direction: "up" | "down" | "flat"; tone?: "good" | "bad" | "neutral"; label?: string }

/**
 * A metric: label, the Count voice, unit as code, and an optional delta and meter.
 * The delta is a shape + text, coloured only when it needs attention (tone="bad" → red).
 */
function Stat({ label, value, unit, delta, meter, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { label: React.ReactNode; value: React.ReactNode; unit?: React.ReactNode; delta?: Delta; meter?: { value: number; max?: number; label?: string } }) {
  return (
    <div data-slot="stat" className={cn("kl-stat", className)} {...props}>
      <span className="kl-stat-l">{label}</span>
      <span className="kl-stat-v">
        <span className="kl-count">{value}</span>
        {unit != null ? <span className="kl-code">{unit}</span> : null}
      </span>
      {delta ? (
        <span className="kl-stat-d" data-tone={delta.tone ?? "neutral"}>
          <span className="kl-stat-arrow" data-dir={delta.direction} aria-hidden />
          {/* a label on a plain span is prohibited ARIA and was not read; the words are text, the figure is shown */}
          {delta.label ? <span aria-hidden>{delta.value}</span> : delta.value}
          {delta.label ? <span className="kl-sr">{delta.label}</span> : null}
        </span>
      ) : null}
      {meter ? <Meter value={meter.value} max={meter.max} label={meter.label ?? (typeof label === "string" ? label : "Progress")} hideLabel /> : null}
    </div>
  )
}

/** A measured quantity in a 1px frame. Ink fill; red when over `high`. Value is announced by Base UI Meter. */
function Meter({ value, max = 100, high, label, hideLabel, className }: { value: number; max?: number; high?: number; label: string; /** The label and value are visible by default; hide them only when the surrounding text already says both (e.g. inside Stat). */ hideLabel?: boolean; className?: string }) {
  const over = high != null && value > high
  return (
    <MeterPrimitive.Root value={value} max={max} aria-label={hideLabel ? label : undefined} className={cn("kl-meter", className)} data-over={over || undefined}>
      {hideLabel ? null : (
        <span className="kl-meter-head">
          <MeterPrimitive.Label className="kl-meter-l">{label}</MeterPrimitive.Label>
          <span className="kl-code kl-meter-v" aria-hidden>
            {value}/{max}
          </span>
        </span>
      )}
      <MeterPrimitive.Track className="kl-meter-track">
        <MeterPrimitive.Indicator className="kl-meter-fill" />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

export { Stat, Meter }
