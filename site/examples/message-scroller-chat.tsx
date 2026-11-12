"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar } from "@/components/keyline/ui/avatar"
import { Bubble, BubbleContent } from "@/components/keyline/ui/bubble"
import { Button } from "@/components/keyline/ui/button"
import { Field, FieldFrame, FieldInput, FieldLabel } from "@/components/keyline/ui/field"
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/keyline/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerSeparator,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/keyline/ui/message-scroller"

type Msg = { id: string; own: boolean; at: string; text: string; day?: string }

const SEED: Msg[] = [
  { id: "m1", own: false, at: "8:55", text: "Truck's loaded. Lackawanna first, then Blue Cross.", day: "Today" },
  { id: "m2", own: true, at: "8:57", text: "Vance Refrigeration is on the list too. 12 cases." },
  { id: "m3", own: false, at: "8:58", text: "Last time nobody was there to sign." },
  { id: "m4", own: true, at: "9:00", text: "Bob says someone will be on the dock from nine." },
  { id: "m5", own: false, at: "9:02", text: "Then I'll go there after lunch." },
  { id: "m6", own: false, at: "9:02", text: "Cugino's, if anyone wants anything." },
]

const REPLIES = ["Lackawanna's done. 120 cases signed for.", "Blue Cross wants to know about the recycled stock.", "Nobody at Vance. Again.", "Heading back. Traffic on 81."]

// consecutive messages from the same person, close in time, make one run (one Message); a run is never empty
type Run = [Msg, ...Msg[]]
const runs = (ms: Msg[]) =>
  ms.reduce<Run[]>((acc, m) => {
    const last = acc.at(-1)
    return last && last[0].own === m.own && !m.day ? (last.push(m), acc) : [...acc, [m]]
  }, [])

function Chat() {
  const { scrollToEnd } = useMessageScroller()
  const [msgs, setMsgs] = useState(SEED)
  const [draft, setDraft] = useState("")
  const sent = useRef(false)
  const n = useRef(0)

  // after the reader sends, the log goes to the end once the new message is in
  useEffect(() => {
    if (sent.current) {
      sent.current = false
      scrollToEnd()
    }
  }, [msgs, scrollToEnd])

  const add = (own: boolean, text: string) => {
    const i = n.current++
    setMsgs((ms) => [...ms, { id: `n${i}`, own, at: `9:${String(10 + i).padStart(2, "0")}`, text }])
  }

  return (
    <div className="grid gap-3">
      <MessageScroller className="h-[380px]">
        <MessageScrollerViewport aria-label="Conversation with Darryl Philbin">
          <MessageScrollerContent>
            {runs(msgs).map((run) => (
              <MessageScrollerItem key={run[0].id} messageId={run[0].id}>
                {run[0].day ? <MessageScrollerSeparator>{run[0].day}</MessageScrollerSeparator> : null}
                <Message align={run[0].own ? "end" : "start"}>
                  {run[0].own ? null : (
                    <MessageAvatar>
                      <Avatar name="Darryl Philbin" decorative />
                    </MessageAvatar>
                  )}
                  <MessageContent>
                    <MessageHeader>
                      <span>{run[0].own ? "You" : "Darryl Philbin"}</span>
                      <time>{run[0].at}</time>
                    </MessageHeader>
                    {run.map((m) => (
                      <Bubble key={m.id} tone={m.own ? "tint" : "plain"}>
                        <BubbleContent>{m.text}</BubbleContent>
                      </Bubble>
                    ))}
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
      <form
        className="flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          sent.current = true
          add(true, draft.trim())
          setDraft("")
        }}
      >
        <Field className="flex-1">
          <FieldLabel className="sr-only">Message</FieldLabel>
          <FieldFrame>
            <FieldInput value={draft} onValueChange={(v) => setDraft(String(v))} placeholder="Write to Darryl" />
          </FieldFrame>
        </Field>
        <Button type="submit" variant="primary">
          Send
        </Button>
      </form>
      <Button size="compact" variant="quiet" className="justify-self-start" onClick={() => {
          const reply = REPLIES[n.current % REPLIES.length]
          if (reply) add(false, reply)
        }}>
        Darryl replies
      </Button>
    </div>
  )
}

export function DriverChat() {
  return (
    <MessageScrollerProvider>
      <Chat />
    </MessageScrollerProvider>
  )
}
