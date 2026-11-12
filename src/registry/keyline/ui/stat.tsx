"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type Delta = {
  value: React.ReactNode;
  /** up/down is direction; tone says whether that is good. */ direction: "up" | "down" | "flat";
  tone?: "good" | "bad" | "neutral";
  label?: string;
};

/*
 * A stat measures its cell (cqi), so it has no width of its own: in a row of cells it takes an equal share (in a
 * grid or PanelGrid the track sizes it) instead of collapsing to its padding. The Count never breaks inside a number
 * ("12,345,6 / 78,901"); it scales down with its cell instead.
 */
const stat = cn(
  "@container grid min-w-0 flex-[1_1_0] content-start gap-1.5",
  "px-[calc(var(--kl-inset)+4px)] py-[calc(var(--kl-inset)+2px)]",
);

const deltaVariants = cva(
  "inline-flex items-center gap-1.5 text-(length:--kl-text-label) font-(--kl-weight-strong) tabular-nums",
  {
    variants: {
      tone: { neutral: "text-kl-ink-2", good: "text-kl-ink", bad: "text-kl-red-text" },
    },
  },
);

/* the delta's shape, drawn with borders: a triangle up or down, a bar for flat */
const arrowVariants = cva("h-0 w-0", {
  variants: {
    direction: {
      up: "border-x-[5px] border-b-8 border-x-transparent border-b-current",
      down: "border-x-[5px] border-t-8 border-x-transparent border-t-current",
      flat: "w-2.5 border-t-2 border-t-current",
    },
  },
});

type StatState = Record<string, never>;
const STAT_STATE: StatState = {};

type StatProps = Omit<PartProps<"div", StatState>, "children"> & {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  delta?: Delta;
  meter?: { value: number; max?: number; label?: string };
};

/**
 * A metric: label, the Count voice, unit as code, and an optional delta and meter.
 * The delta is a shape + text, coloured only when it needs attention (tone="bad" → red).
 */
function Stat({ label, value, unit, delta, meter, render, className, style, ...props }: StatProps): React.ReactElement {
  const tone = delta?.tone ?? "neutral";
  const own = {
    "data-slot": "stat",
    className: resolveClassName(stat, className)(STAT_STATE),
    style: resolveStyle(undefined, style)(STAT_STATE),
    children: (
      <>
        <span data-slot="stat-label" className="text-(length:--kl-text-label) font-(--kl-weight-strong) text-kl-ink-2">
          {label}
        </span>
        <span data-slot="stat-value" className="flex min-w-0 flex-wrap items-baseline gap-1.5">
          <span className="kl-count text-[length:clamp(18px,13cqi,32px)] whitespace-nowrap">{value}</span>
          {unit != null ? <span className="kl-code">{unit}</span> : null}
        </span>
        {delta ? (
          <span data-slot="stat-delta" data-tone={tone} className={cn(deltaVariants({ tone }))}>
            <span
              data-slot="stat-arrow"
              data-dir={delta.direction}
              className={cn(arrowVariants({ direction: delta.direction }))}
              aria-hidden
            />
            {/* a label on a plain span is prohibited ARIA and was not read; the words are text, the figure is shown */}
            {delta.label ? <span aria-hidden>{delta.value}</span> : delta.value}
            {delta.label ? <span className="kl-sr">{delta.label}</span> : null}
          </span>
        ) : null}
        {meter ? (
          <Meter
            value={meter.value}
            max={meter.max}
            label={meter.label ?? (typeof label === "string" ? label : "Progress")}
            hideLabel
          />
        ) : null}
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state: STAT_STATE, props: mergeProps<"div">(props, own) });
}

/* the root is a two-column grid: the label and the value share the first row, the track spans both */
const meter = "group/meter grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1";

type MeterProps = Omit<MeterPrimitive.Root.Props, "children"> & {
  /** Over this value the fill and the readout turn red. */
  high?: number;
} & (
    | {
        label: string;
        /** The label and value are visible by default; hide them only when the surrounding text already says both
         *  (e.g. inside Stat). */
        hideLabel?: boolean;
        children?: undefined;
      }
    | {
        /** The parts, composed: MeterLabel, MeterValue, MeterTrack with MeterIndicator. */
        children: React.ReactNode;
        label?: undefined;
        hideLabel?: undefined;
      }
  );

/** A measured quantity in a 1px frame (Base UI Meter). Ink fill; red when over `high`. Value is announced by Base
 * UI Meter. Given `label`, it renders its parts itself; pass children (the parts) to compose them instead. */
function Meter({
  value,
  max = 100,
  high,
  label,
  hideLabel,
  className,
  style,
  children,
  ...props
}: MeterProps): React.ReactElement {
  const over = high != null && value > high;
  return (
    <MeterPrimitive.Root
      value={value}
      max={max}
      aria-label={hideLabel ? label : undefined}
      {...dataAttrs({ over: over ? "" : undefined })}
      className={resolveClassName(meter, className)}
      style={resolveStyle(undefined, style)}
      {...props}
      data-slot="meter"
    >
      {children ?? (
        <>
          {hideLabel ? null : (
            <>
              <MeterLabel>{label}</MeterLabel>
              <MeterValue>{() => `${value}/${max}`}</MeterValue>
            </>
          )}
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </>
      )}
    </MeterPrimitive.Root>
  );
}

/** What is measured (Base UI Meter.Label): it names the meter. */
function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props): React.ReactElement {
  return (
    <MeterPrimitive.Label
      className={resolveClassName(
        "col-start-1 self-baseline text-(length:--kl-text-label) font-(--kl-weight-strong)",
        className,
      )}
      {...props}
      data-slot="meter-label"
    />
  );
}

/** The readout in the Code voice (Base UI Meter.Value), red when over `high`. Hidden from assistive technology:
 * the meter announces its value. */
function MeterValue({ className, ...props }: MeterPrimitive.Value.Props): React.ReactElement {
  return (
    <MeterPrimitive.Value
      aria-hidden
      className={resolveClassName(
        "kl-code col-start-2 self-baseline group-data-over/meter:text-kl-red-text",
        className,
      )}
      {...props}
      data-slot="meter-value"
    />
  );
}

const track = "relative col-span-full block h-2.5 overflow-hidden border-(length:--kl-k1) border-kl-line bg-kl-cell";

/** The frame (Base UI Meter.Track): a k1 keyline box, 10px tall. */
function MeterTrack({ className, ...props }: MeterPrimitive.Track.Props): React.ReactElement {
  return <MeterPrimitive.Track className={resolveClassName(track, className)} {...props} data-slot="meter-track" />;
}

const indicator = cn(
  "block h-full bg-kl-inverse transition-[width] duration-(--kl-t-unfold) ease-(--kl-ease-out)",
  "group-data-over/meter:bg-kl-red forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none",
);

/** The fill (Base UI Meter.Indicator): ink, red when over `high`. */
function MeterIndicator({ className, ...props }: MeterPrimitive.Indicator.Props): React.ReactElement {
  return (
    <MeterPrimitive.Indicator
      className={resolveClassName(indicator, className)}
      {...props}
      data-slot="meter-indicator"
    />
  );
}

export {
  Stat,
  Meter,
  MeterLabel,
  MeterValue,
  MeterTrack,
  MeterIndicator,
  type StatProps,
  type MeterProps,
  type Delta as StatDelta,
};
