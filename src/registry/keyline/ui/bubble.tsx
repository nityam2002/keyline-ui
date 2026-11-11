"use client";

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/* A bubble is one message: a control-weight frame (2px, no radius; the control cut only on the first of a run)
   holding a column of cells, the text and then any files (Attachment layout="cell").
   - consecutive bubbles of a run are attached: the later one lies on the earlier's bottom keyline and the
     shared edge is a 1px seam, so a run reads as one stack of messages, not a pile of boxes;
   - an attachment-only message is a bubble holding only file cells; the file glyph sits on the text edge;
   - tone by role, never decoration: plain (the other party, the cell surface), tint (the reader's own, one
     step off it), attention (not sent: the attention frame, and a ! cell inserted before the text);
   - pending: the message is on its way; the Signal segment runs inside the bottom keyline until it lands.
   Reactions sit on the bottom keyline as a small frame of their own. */

type Tone = "plain" | "tint" | "attention"

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-group" className={cn("kl-bubble-group", className)} {...props} />
}

type BubbleProps = React.ComponentProps<"div"> & {
  tone?: Tone
  /** Sending: the pending segment runs along the bottom keyline (a static hatch under reduced motion). */
  pending?: boolean
}

function Bubble({ tone = "plain", pending, className, children, ...props }: BubbleProps) {
  return (
    <div data-slot="bubble" data-tone={tone} data-pending={pending ? "" : undefined} aria-busy={pending || undefined} className={cn("kl-ctl kl-bubble", className)} {...props}>
      {children}
      {pending ? <span className="kl-pending kl-bubble-pend" aria-hidden /> : null}
    </div>
  )
}

/** The text cell. Render it as a button or link (`render`) when the message itself acts (open a thread). */
function BubbleContent({ className, render, children, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("kl-bubble-c", className),
        children: (
          <>
            {/* the ! cell is inserted (0 → its width) when a message turns out not to be sent */}
            <span className="kl-slot kl-bubble-bang" aria-hidden>
              <span>
                <span>!</span>
              </span>
            </span>
            {/* people write in their own language: the text takes its direction from its first strong letter */}
            <span className="kl-bubble-t" dir="auto">
              {children}
            </span>
          </>
        ),
      },
      props,
    ),
  })
}

/** Reactions on the bubble's bottom keyline: a row of small cells ("👍 2"). Buttons inside are fine. */
function BubbleReactions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-reactions" className={cn("kl-cells kl-bubble-rx", className)} {...props} />
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions }
