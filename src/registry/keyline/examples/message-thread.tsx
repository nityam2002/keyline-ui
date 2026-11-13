"use client";

import { useState } from "react";
import { Avatar } from "../ui/avatar";
import { Bubble, BubbleContent } from "../ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "../ui/message";

export function ThreadWithJim() {
  const [state, setState] = useState<"failed" | "sending" | "sent">("failed");

  const retry = () => {
    setState("sending");
    setTimeout(() => setState("sent"), 1200);
  };

  return (
    <div className="grid max-w-[520px] gap-5">
      <Message align="start">
        <MessageAvatar>
          <Avatar name="Jim Halpert" decorative />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span>Jim Halpert</span>
            <time dateTime="2026-11-10T10:42">10:42</time>
          </MessageHeader>
          <Bubble>
            <BubbleContent>Blue Cross wants the recycled stock samples by Friday.</BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>Can you check we have 20 lb in the warehouse?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <span>You</span>
            <time dateTime="2026-11-10T10:45">10:45</time>
          </MessageHeader>
          <Bubble tone="tint">
            <BubbleContent>Darryl says 30 cases, enough for samples.</BubbleContent>
          </Bubble>
          <Bubble tone={state === "failed" ? "attention" : "tint"} pending={state === "sending"}>
            <BubbleContent>I&apos;ll put two cases on Thursday&apos;s truck.</BubbleContent>
          </Bubble>
          {state === "failed" ? (
            <MessageFooter tone="attention">
              <span>Not sent: you&apos;re offline.</span>
              <button type="button" onClick={retry}>
                Retry
              </button>
            </MessageFooter>
          ) : (
            <MessageFooter role="status">{state === "sending" ? "Sending…" : "Sent"}</MessageFooter>
          )}
        </MessageContent>
      </Message>
    </div>
  );
}
