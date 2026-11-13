"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* What the parts need from the root that Base UI does not carry: the failure, and the max for the done glyph. */
const ProgressContext = React.createContext<{ failed: boolean; failedText: string; max: number }>({
  failed: false,
  failedText: "Failed",
  max: 100,
});

/*
 * PROGRESS: the Meter's rail (k1, 10px), the pending signal's colour. The fill's leading end is an ink keyline, so
 * the boundary holds where yellow on paper is faint (light) and reads as one edge in dark. Indeterminate runs the
 * pending segment inside the rail. The root is a two-column grid: the label and the readout share the first row on
 * their baselines, the rail and the detail span both columns.
 */
const root = "group/progress grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1";

type ProgressState = ProgressPrimitive.Root.State;

type ProgressProps = Omit<ProgressPrimitive.Root.Props, "children"> & {
  /** The task stopped. The fill turns attention-red and the readout says so; `value` keeps how far it got. */
  failed?: boolean;
  /** Readout text when failed. Default "Failed". */
  failedText?: string;
} & (
    | {
        /** What is in progress ("Uploading manifest.pdf"). Visible unless `hideLabel`. */
        label: React.ReactNode;
        /** A line under the rail: amounts, time left, the failure's reason and what to do. */
        detail?: React.ReactNode;
        /** Hide the label and readout when the surrounding text already says both (a table cell, a toast). */
        hideLabel?: boolean;
        children?: undefined;
      }
    | {
        /** The parts, composed: ProgressLabel, ProgressValue, ProgressTrack with ProgressIndicator, ProgressDetail. */
        children: React.ReactNode;
        label?: undefined;
        detail?: undefined;
        hideLabel?: undefined;
      }
  );

/**
 * Task progress: how far a job has got, not a measurement (that is Meter). It is the pending signal
 * made determinate. Pending runs a yellow segment along a keyline; Progress fills the rail with the
 * same yellow, and draws the fill's leading end as a keyline so the boundary reads in every theme.
 *
 *   Uploading manifest.pdf                 64%
 *   [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|                    ]     k1 rail · yellow fill · ink leading edge
 *   3.2 of 5 MB · about 12 s left
 *
 * - `value={null}`: indeterminate. The pending segment runs inside the rail (hatched and still under
 *   reduced motion).
 * - Complete: the readout gains the done glyph.
 * - `failed`: the fill turns red where it stopped and the readout says "Failed" with the attention glyph;
 *   say why and what to do in `detail`.
 *
 * Given `label`, it renders its parts itself; pass children (the parts) to compose them instead.
 * Semantics (role="progressbar", value text, status attributes) and number formatting are Base UI Progress's.
 */
function Progress({
  label,
  detail,
  failed = false,
  failedText = "Failed",
  hideLabel,
  className,
  style,
  getAriaValueText,
  children,
  ...props
}: ProgressProps): React.ReactElement {
  const detailId = React.useId();
  const context = React.useMemo(() => ({ failed, failedText, max: props.max ?? 100 }), [failed, failedText, props.max]);
  return (
    <ProgressContext.Provider value={context}>
      <ProgressPrimitive.Root
        data-failed={failed ? "" : undefined}
        aria-describedby={detail ? detailId : undefined}
        aria-label={hideLabel && typeof label === "string" ? label : undefined}
        getAriaValueText={
          failed ? (formatted) => `${failedText}${formatted ? ` at ${formatted}` : ""}` : getAriaValueText
        }
        className={resolveClassName(root, className)}
        style={resolveStyle(undefined, style)}
        {...props}
        data-slot="progress"
      >
        {children ?? (
          <>
            {hideLabel ? null : (
              <>
                <ProgressLabel>{label}</ProgressLabel>
                <ProgressValue />
              </>
            )}
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
            {detail ? <ProgressDetail id={detailId}>{detail}</ProgressDetail> : null}
          </>
        )}
      </ProgressPrimitive.Root>
    </ProgressContext.Provider>
  );
}

const label = "col-start-1 min-w-0 self-baseline text-(length:--kl-text-label) font-(--kl-weight-strong) wrap-anywhere";

/** What is in progress (Base UI Progress.Label): it names the bar. */
function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Label className={resolveClassName(label, className)} {...props} data-slot="progress-label" />
  );
}

const value = cn(
  "col-start-2 inline-flex flex-none items-center gap-1.5 self-baseline",
  "text-(length:--kl-text-label) font-(--kl-weight-strong) whitespace-nowrap tabular-nums",
  "group-data-failed/progress:text-kl-red-text",
);

/** The readout (Base UI Progress.Value): the formatted value, with the done glyph when complete, or the failure
 * with the attention glyph. Hidden from assistive technology; the bar's value text says the same. Pass children (a
 * function of the formatted value and the value) to write it yourself. */
function ProgressValue({ className, children, ...props }: ProgressPrimitive.Value.Props): React.ReactElement {
  const { failed, failedText, max } = React.useContext(ProgressContext);
  return (
    <ProgressPrimitive.Value className={resolveClassName(value, className)} {...props} data-slot="progress-value">
      {children ??
        (failed
          ? () => (
              <>
                <span className="kl-glyph" data-kind="attention" aria-hidden />
                {failedText}
              </>
            )
          : (formatted, current) =>
              current == null ? null : (
                <>
                  {current >= max ? <span className="kl-glyph -translate-y-px" data-kind="done" aria-hidden /> : null}
                  <bdi>{formatted}</bdi>
                </>
              ))}
    </ProgressPrimitive.Value>
  );
}

const track = cn(
  "relative col-span-full box-border block h-2.5 overflow-hidden",
  "border-(length:--kl-k1) border-kl-line bg-kl-cell",
);

/** The rail (Base UI Progress.Track): a k1 keyline box, 10px tall. */
function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Track className={resolveClassName(track, className)} {...props} data-slot="progress-track" />
  );
}

/* Base UI sizes the fill while it has a value. Indeterminate, it leaves the indicator unsized and the pending
   segment runs instead: kl-run (theme), 1100ms linear, reversed in RTL through --kl-run-dir. Reduced motion (the
   system's, or data-kl-motion="reduce") stills it as a hatched full rail. */
const indicator = cn(
  "box-border block h-full bg-kl-yellow transition-[width] duration-(--kl-t-unfold) ease-(--kl-ease-out)",
  "data-progressing:border-e-(length:--kl-k1) data-progressing:border-e-kl-line",
  "group-data-failed/progress:bg-kl-red group-data-failed/progress:data-progressing:border-e-kl-red",
  "data-indeterminate:absolute data-indeterminate:inset-y-0 data-indeterminate:left-0 data-indeterminate:w-[34%]",
  "data-indeterminate:border-x-(length:--kl-k1) data-indeterminate:border-x-kl-line",
  "data-indeterminate:animate-[kl-run_1100ms_linear_infinite_var(--kl-run-dir,normal)]",
  "in-data-[kl-motion=reduce]:data-indeterminate:start-0 in-data-[kl-motion=reduce]:data-indeterminate:w-full",
  "in-data-[kl-motion=reduce]:data-indeterminate:animate-none in-data-[kl-motion=reduce]:data-indeterminate:border-0",
  "in-data-[kl-motion=reduce]:data-indeterminate:bg-(image:--kl-hatch)",
  "motion-reduce:data-indeterminate:start-0 motion-reduce:data-indeterminate:w-full",
  "motion-reduce:data-indeterminate:animate-none motion-reduce:data-indeterminate:border-0",
  "motion-reduce:data-indeterminate:bg-(image:--kl-hatch)",
  "forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
  "forced-colors:group-data-failed/progress:bg-[CanvasText]",
);

/** The fill (Base UI Progress.Indicator): yellow with an ink leading edge; red where a failed task stopped. */
function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Indicator
      className={resolveClassName(indicator, className)}
      {...props}
      data-slot="progress-indicator"
    />
  );
}

const detailClass = cn(
  "col-span-full text-(length:--kl-text-label) wrap-anywhere text-kl-ink-2",
  "group-data-failed/progress:text-kl-ink",
);

type ProgressDetailState = { failed: boolean };

/** A line under the rail: amounts, time left, or why the task failed and what to do. Point the root's
 * `aria-describedby` at its id when you compose the parts. */
function ProgressDetail({
  render,
  className,
  style,
  ...props
}: PartProps<"span", ProgressDetailState>): React.ReactElement {
  const { failed } = React.useContext(ProgressContext);
  const state: ProgressDetailState = { failed };
  const own = {
    "data-slot": "progress-detail",
    className: resolveClassName(detailClass, className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  return useRender({ defaultTagName: "span", render, state, props: mergeProps<"span">(props, own) });
}

export {
  Progress,
  ProgressLabel,
  ProgressValue,
  ProgressTrack,
  ProgressIndicator,
  ProgressDetail,
  type ProgressProps,
  type ProgressState,
};
