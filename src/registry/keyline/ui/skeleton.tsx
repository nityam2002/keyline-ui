import * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = Omit<React.ComponentProps<"span">, "children"> & {
  /**
   * line: a run of text; `lines` stacks several, the last one shorter. block: an area (a chart, media, a
   * paragraph you won't line out). value: a number in the count voice. control: the footprint of a
   * control frame (the real control replaces it without moving anything).
   */
  shape?: "line" | "block" | "value" | "control";
  lines?: number;
  /** Any CSS length. Defaults: line 100%, value 4ch, control 100%, block 100%. */
  width?: React.CSSProperties["width"];
  /** block only. Default 96px. */
  height?: React.CSSProperties["height"];
};

/* a fixed pattern, so the same skeleton renders the same way on every load (no random widths) */
const LINE_WIDTHS = ["100%", "94%", "86%", "97%", "90%"];

/**
 * A placeholder for content that is on its way. It is the Table's loading cell outside the table: a
 * keyline box on the tint, with a running segment while it waits.
 *
 *   ┌──────────────────────────────┐
 *   │░░░░░░▓▓▓▓░░░░░░░░░░░░░░░░░░░░│   line (k1 soft keyline, tint fill, running segment)
 *   └──────────────────────────────┘
 *
 * - Always aria-hidden. Wrap the loading region in SkeletonGroup, which marks it busy and says what is
 *   loading once; a page of skeletons never reads as a list of blanks.
 * - Size it to the real content (lines of the same count, a control of the same frame) so nothing moves
 *   when the content lands.
 * - Motion: the segment runs 1100ms linear, the same rhythm as the table. Reduced motion: no segment,
 *   the static box alone.
 */
function Skeleton({ shape = "line", lines = 1, width, height, className, style, ...props }: SkeletonProps) {
  if (shape === "line" && lines > 1) {
    return (
      <span
        data-slot="skeleton"
        data-shape="lines"
        aria-hidden
        className={cn("kl-skeleton-lines", className)}
        style={{ width, ...style }}
        {...props}
      >
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className="kl-skeleton"
            data-shape="line"
            style={{ width: i === lines - 1 ? "58%" : LINE_WIDTHS[i % LINE_WIDTHS.length] }}
          />
        ))}
      </span>
    );
  }
  return (
    <span
      data-slot="skeleton"
      data-shape={shape}
      aria-hidden
      className={cn("kl-skeleton", className)}
      style={{ width, height: shape === "block" ? height : undefined, ...style }}
      {...props}
    />
  );
}

/**
 * The region that is loading. `aria-busy` while `busy`, and one polite status naming what is on its
 * way ("Loading carrier details"); when it lands, the status clears and the content replaces the
 * skeletons in place.
 */
function SkeletonGroup({
  label,
  busy = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: string; busy?: boolean }) {
  return (
    <div
      data-slot="skeleton-group"
      aria-busy={busy || undefined}
      className={cn("kl-skeleton-group", className)}
      {...props}
    >
      <span role="status" className="kl-sr">
        {busy ? label : ""}
      </span>
      {children}
    </div>
  );
}

export { Skeleton, SkeletonGroup, type SkeletonProps };
