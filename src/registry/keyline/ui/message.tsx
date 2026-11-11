import * as React from "react"

import { cn } from "@/lib/utils"

/* A message is one sender's run in the conversation: consecutive messages from the same person, close in time.
   A run hangs from its own side of the log as one stack (the bubbles share keylines):
   - align="start": the other party, at the start of the log, with an avatar in the gutter, level with the
     first bubble's top keyline. The header, every bubble and the receipt line up on the start edge;
   - align="end": the reader's own run, at the end of the log (the left in RTL). It needs no avatar. Every
     bubble is flush to the end edge, and the header and receipt sit over the bubbles' end text inset.
   Put every consecutive message of the run in one Message: Header, then Bubbles (attachments go inside the
   bubble), then a Footer for the delivery state of the bubble right above it. */

function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-group" className={cn("kl-msg-group", className)} {...props} />
}

function Message({ className, align = "start", ...props }: React.ComponentProps<"div"> & { /** start: the other party. end: the reader's own messages. */ align?: "start" | "end" }) {
  return <div data-slot="message" data-align={align} className={cn("kl-msg", className)} {...props} />
}

/** The avatar gutter. Put a size="md" Avatar in it (decorative when the header prints the name). The reader's own run leaves it out. */
function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-avatar" className={cn("kl-msg-av", className)} {...props} />
}

/** The run's column: header, bubbles, footers. It is as wide as its widest bubble, and everything in it hangs from the run's outer edge (start for theirs, end for yours). */
function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-content" className={cn("kl-msg-body", className)} {...props} />
}

/** Sender and time, over the bubbles' text inset on the run's outer edge: the name in the UI voice, the time in the Code voice (pass a <time>). */
function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-header" className={cn("kl-msg-h", className)} {...props} />
}

/** Delivery state of the bubble right above it ("Sent", "Read 14:22", "Not sent: no signal." + a Retry button), on the run's outer edge, in the Code voice. */
function MessageFooter({ className, tone, ...props }: React.ComponentProps<"div"> & { /** attention: the bubble above was not sent (the reason, then a Retry button). */ tone?: "attention" }) {
  return <div data-slot="message-footer" data-tone={tone} aria-live="polite" className={cn("kl-msg-f", className)} {...props} />
}

export { MessageGroup, Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter }
