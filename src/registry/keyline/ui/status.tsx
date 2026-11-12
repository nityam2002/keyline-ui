import * as React from "react";

import { cn } from "@/lib/utils";

type StatusKind = "normal" | "waiting" | "attention" | "done" | "none";

/** Status = glyph shape + text. The shape carries meaning in grayscale and forced colours; only attention is red. */
function Status({ kind, className, children, ...props }: React.ComponentProps<"span"> & { kind: StatusKind }) {
  return (
    <span data-slot="status" className={cn("kl-status", className)} data-kind={kind} {...props}>
      <span className="kl-glyph" data-kind={kind} aria-hidden />
      {children}
    </span>
  );
}

/** A square code badge: mono text in a 1px frame. Never cut, never a pill. `tone="signal"` is the only filled form. */
function Badge({
  className,
  tone = "plain",
  ...props
}: React.ComponentProps<"span"> & { tone?: "plain" | "signal" | "attention" }) {
  return <span data-slot="badge" data-tone={tone} className={cn("kl-badge", className)} {...props} />;
}

export { Status, Badge, type StatusKind };
