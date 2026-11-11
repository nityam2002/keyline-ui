"use client";

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

type ProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "children"> & {
  /** What is in progress ("Uploading manifest.pdf"). Visible unless `hideLabel`. */
  label: React.ReactNode
  /** A line under the rail: amounts, time left, the failure's reason and what to do. */
  detail?: React.ReactNode
  /** The task stopped. The fill turns attention-red and the readout says so; `value` keeps how far it got. */
  failed?: boolean
  /** Readout text when failed. Default "Failed". */
  failedText?: string
  /** Hide the label and readout when the surrounding text already says both (a table cell, a toast). */
  hideLabel?: boolean
}

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
 * Semantics (role="progressbar", value text, status attributes) and number formatting are Base UI Progress's.
 */
function Progress({ label, detail, failed, failedText = "Failed", hideLabel, className, getAriaValueText, ...props }: ProgressProps) {
  const detailId = React.useId()
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-failed={failed || undefined}
      aria-describedby={detail ? detailId : undefined}
      aria-label={hideLabel && typeof label === "string" ? label : undefined}
      getAriaValueText={failed ? (formatted) => `${failedText}${formatted ? ` at ${formatted}` : ""}` : getAriaValueText}
      className={cn("kl-progress", className)}
      {...props}
    >
      {hideLabel ? null : (
        <span className="kl-progress-head">
          <ProgressPrimitive.Label className="kl-progress-l">{label}</ProgressPrimitive.Label>
          {failed ? (
            <span className="kl-progress-v" data-tone="failed">
              <span className="kl-glyph" data-kind="attention" aria-hidden />
              {failedText}
            </span>
          ) : (
            <ProgressPrimitive.Value className="kl-progress-v">
              {(formatted, value) =>
                value == null ? null : (
                  <>
                    {value >= (props.max ?? 100) ? <span className="kl-glyph" data-kind="done" aria-hidden /> : null}
                    <bdi>{formatted}</bdi>
                  </>
                )
              }
            </ProgressPrimitive.Value>
          )}
        </span>
      )}
      <ProgressPrimitive.Track className="kl-progress-rail">
        <ProgressPrimitive.Indicator className="kl-progress-fill" />
      </ProgressPrimitive.Track>
      {detail ? (
        <span id={detailId} className="kl-progress-detail">
          {detail}
        </span>
      ) : null}
    </ProgressPrimitive.Root>
  )
}

export { Progress, type ProgressProps }
