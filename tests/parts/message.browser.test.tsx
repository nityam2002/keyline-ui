// Message's parts (conformance), axe over both sides of a conversation, the footer's live receipt, and the Tab order
// through a failed message's Retry.
import * as React from "react";
import { Avatar } from "@/components/keyline/ui/avatar";
import { Bubble, BubbleContent } from "@/components/keyline/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/keyline/ui/message";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inMessage = (part: React.ReactNode) => <Message>{part}</Message>;
const inContent = (part: React.ReactNode) => inMessage(<MessageContent>{part}</MessageContent>);

describeConformance("message", {
  MessageGroup: { element: <MessageGroup />, refInstanceof: HTMLDivElement, slot: "message-group" },
  Message: { element: <Message />, refInstanceof: HTMLDivElement, slot: "message" },
  MessageAvatar: { element: <MessageAvatar />, refInstanceof: HTMLDivElement, slot: "message-avatar", wrap: inMessage },
  MessageContent: {
    element: <MessageContent />,
    refInstanceof: HTMLDivElement,
    slot: "message-content",
    wrap: inMessage,
  },
  MessageHeader: {
    element: <MessageHeader>Tomasz Wolak</MessageHeader>,
    refInstanceof: HTMLDivElement,
    slot: "message-header",
    wrap: inContent,
  },
  MessageFooter: {
    element: <MessageFooter>Sent</MessageFooter>,
    refInstanceof: HTMLDivElement,
    slot: "message-footer",
    wrap: inContent,
  },
});

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const SHIFT_TAB = server.browser === "webkit" ? "{Alt>}{Shift>}{Tab}{/Shift}{/Alt}" : "{Shift>}{Tab}{/Shift}";
const active = () => document.activeElement as HTMLElement | null;

function Conversation({ onRetry }: { onRetry?: () => void }) {
  return (
    <MessageGroup>
      <Message>
        <MessageAvatar>
          <Avatar name="Tomasz Wolak" decorative />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span>Tomasz Wolak</span> <time dateTime="2026-11-09T14:09">14:09</time>
          </MessageHeader>
          <Bubble>
            <BubbleContent>Moving to bay 2 now.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <span>You</span> <time dateTime="2026-11-09T14:07">14:07</time>
          </MessageHeader>
          <Bubble tone="tint">
            <BubbleContent>Thanks.</BubbleContent>
          </Bubble>
          <MessageFooter data-testid="receipt">Read 14:08</MessageFooter>
          <Bubble tone="attention">
            <BubbleContent>Bay 2 has power for the reefer.</BubbleContent>
          </Bubble>
          <MessageFooter tone="attention">
            <bdi>Not sent: no signal.</bdi>
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

describe("message: a11y", () => {
  it("has no axe violations on either side, with a receipt and a failed message", async () => {
    await render(
      <main>
        <Conversation />
      </main>,
    );
    await expectNoAxeViolations();
  });

  it("each run says which side it is on, and the footer announces the receipt politely", async () => {
    await render(
      <main>
        <Conversation />
      </main>,
    );
    const runs = [...document.querySelectorAll<HTMLElement>("[data-slot=message]")];
    expect(runs.map((r) => r.getAttribute("data-align"))).toEqual(["start", "end"]);
    const footers = [...document.querySelectorAll<HTMLElement>("[data-slot=message-footer]")];
    expect(footers.map((f) => f.getAttribute("aria-live"))).toEqual(["polite", "polite"]);
    expect(footers[1]!.getAttribute("data-tone")).toBe("attention");
  });
});

describe("message: keyboard", () => {
  it("Tab reaches the failed message's Retry between the fields around it, and Enter retries", async () => {
    let retried = 0;
    await render(
      <main>
        <input aria-label="Before" />
        <Conversation onRetry={() => retried++} />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLInputElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    expect(active()?.textContent).toBe("Retry");
    await userEvent.keyboard("{Enter}");
    expect(retried).toBe(1);
    await userEvent.keyboard(TAB);
    expect(active()?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard(SHIFT_TAB);
    await userEvent.keyboard(SHIFT_TAB);
    expect(active()?.getAttribute("aria-label")).toBe("Before");
  });
});
