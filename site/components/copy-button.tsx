"use client";

import * as React from "react";
import { Button } from "@/components/keyline/ui/button";

/** Copies `text`; the done signal (an inserted ✓ cell) confirms it, and a live region says so. */
/** `after`: the next step, shown once the text is on the clipboard (it stays; it is the answer to "now what?"). */
/** `cell`: Copy is the end cell of a one-line command (attached, on its own keyline), not a button over the code. */
export function CopyButton({
  text,
  label,
  after,
  cell,
}: {
  text: string;
  label: string;
  after?: string;
  cell?: boolean;
}) {
  const [state, setState] = React.useState<"idle" | "done" | "failed">("idle");
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
      setCopied(true);
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  };
  return (
    <>
      {/* Copy floats over the code's top end; the hint is its sibling, not its child, so it is placed
          against the whole code block (below it, from its start edge), not against this small box */}
      <div
        className={
          cell
            ? "flex border-s-(length:--kl-k1) border-s-kl-line-soft"
            : "absolute end-0 inset-bs-2 z-[2] flex bg-linear-to-r from-transparent to-kl-cell to-[14px] ps-4 pe-2 group-data-[tall]/code:end-3 rtl:bg-linear-to-l"
        }
      >
        <Button
          size="compact"
          layout={cell ? "cell" : "control"}
          // the label changes to Copied: the cell keeps one width so the command beside it never moves
          className={cell ? "min-w-[5.5rem]" : undefined}
          signal={state}
          onClick={copy}
          aria-label={`Copy ${label}`}
        >
          {state === "done" ? "Copied" : "Copy"}
        </Button>
        <span className="sr-only" role="status">
          {state === "done"
            ? `Copied ${label}.${after ? " " + after : ""}`
            : state === "failed"
              ? "Copy failed. Select the text instead."
              : ""}
        </span>
      </div>
      {after && copied ? (
        <span
          className="absolute -start-0.5 top-[calc(100%+8px)] text-[14px] text-kl-ink-2 before:me-2 before:inline-block before:size-2 before:bg-kl-cobalt before:align-[1px] motion-safe:animate-[s-after_240ms_cubic-bezier(0.16,1,0.3,1)_both]"
          aria-hidden="true"
          data-testid="copy-after"
        >
          {after}
        </span>
      ) : null}
    </>
  );
}
