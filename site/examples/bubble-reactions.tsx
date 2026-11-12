"use client";

import { useState } from "react";
import { Avatar } from "@/components/keyline/ui/avatar";
import { Bubble, BubbleContent, BubbleReactions } from "@/components/keyline/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/keyline/ui/message";

export function PartyAnnouncement() {
  const [mine, setMine] = useState(false);
  const count = 4 + (mine ? 1 : 0);

  return (
    <div className="max-w-[520px]">
      <Message align="start">
        <MessageAvatar>
          <Avatar name="Angela Martin" decorative />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span>Angela Martin</span>
            <time dateTime="2026-11-10T09:05">9:05</time>
          </MessageHeader>
          <Bubble>
            <BubbleContent>The Party Planning Committee meets at 3 in the break room.</BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>Theme is decided. It is not up for discussion.</BubbleContent>
            <BubbleReactions>
              <button
                type="button"
                aria-pressed={mine}
                aria-label={`Thumbs up, ${count}${mine ? ", you reacted" : ""}`}
                onClick={() => setMine(!mine)}
              >
                👍 <span className="font-kl-mono">{count}</span>
              </button>
            </BubbleReactions>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  );
}
