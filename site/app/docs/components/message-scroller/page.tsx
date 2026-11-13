import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { MessageScrollerChat } from "@site/components/conversation-previews";

const ITEM = "message-scroller";

export const metadata = componentMetadata(
  "Message scroller",
  "A React chat message scroller that follows the newest message, holds your place when you scroll up, and counts new messages on a jump cell.",
  "message-scroller",
);

const IMPORT = `import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerSeparator,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/keyline/ui/message-scroller"`;

const USAGE = `<MessageScrollerProvider>
  <MessageScroller className="h-[380px]">
    <MessageScrollerViewport aria-label="Conversation with Darryl Philbin">
      <MessageScrollerContent>
        <MessageScrollerItem messageId="m1"><Message>…</Message></MessageScrollerItem>
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>`;

const PARTS = `<MessageScrollerProvider>
  <MessageScroller className="h-[380px]">
    <MessageScrollerViewport aria-label="Conversation with Darryl Philbin">
      <MessageScrollerContent>
        <MessageScrollerItem>
          <MessageScrollerSeparator>TODAY</MessageScrollerSeparator>
        </MessageScrollerItem>
        <MessageScrollerItem messageId="m1"><Message>…</Message></MessageScrollerItem>
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>`;

const PROPS: Prop[] = [
  {
    name: "autoScroll",
    type: "boolean",
    default: "true",
    description: (
      <>
        On <code>MessageScrollerProvider</code>: follow new messages while the reader is at the end.
      </>
    ),
  },
  {
    name: "aria-label",
    type: "string",
    default: '"Messages"',
    description: (
      <>
        On <code>MessageScrollerViewport</code>: who the conversation is with.
      </>
    ),
  },
  {
    name: "messageId",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>MessageScrollerItem</code>: to scroll to a message, or to land on one.
      </>
    ),
  },
  {
    name: "MessageScrollerSeparator",
    type: "div",
    default: "\u2014",
    description: "A day or “New messages” divider: a seam with its words in the code voice.",
  },
  {
    name: "direction",
    type: '"end" | "start"',
    default: '"end"',
    description: (
      <>
        On <code>MessageScrollerButton</code>: the jump cell&apos;s target.
      </>
    ),
  },
  {
    name: "useMessageScroller",
    type: "() => { scrollToEnd, \u2026 }",
    default: "\u2014",
    description: "After the reader sends, call <code>scrollToEnd()</code>; their own message always shows.",
  },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "parts", label: "Parts" },
      { id: "props", label: "Props" },
    ],
  },
];

export default function MessageScrollerPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Message scroller" toc={TOC}>
      <h1>Message scroller</h1>
      <p className="s-doc-lede">
        A conversation log that stays on the newest message while you&apos;re at the end, and holds your place when
        you&apos;ve scrolled up to read. New messages below you are counted on a jump cell, and a jump from far up takes
        the same short time as one from near. Your place holds when something above you changes size.
      </p>

      <ComponentDemo
        label="Message scroller example"
        preview={<MessageScrollerChat />}
        code={code("message-scroller-chat.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as @shadcn/react names them: <code>MessageScrollerProvider</code> holds the state,{" "}
        <code>MessageScroller</code> is the frame, <code>MessageScrollerViewport</code> the log that scrolls,{" "}
        <code>MessageScrollerContent</code> the column of <code>MessageScrollerItem</code>s, and{" "}
        <code>MessageScrollerButton</code> the jump cell. Keyline adds <code>MessageScrollerSeparator</code>, a day or
        &ldquo;New messages&rdquo; divider (<code>role=&quot;separator&quot;</code>) that goes in an item of its own.
        The library&apos;s parts take its own props and a string <code>className</code>;{" "}
        <code>MessageScrollerSeparator</code> also takes <code>render</code> and a function <code>className</code> or{" "}
        <code>style</code>.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />

      <h2 id="props">Props</h2>
      <PropsReference label="Message scroller props" props={PROPS} />
      <p className="s-small">
        Scroll up in the example, then press Darryl replies: the jump cell counts what arrived. Built on{" "}
        <a href="https://github.com/shadcn-ui/ui">@shadcn/react</a>&apos;s MessageScroller, scrolling in Keyline&apos;s
        Scroll Area. Each part carries a <code>data-slot</code> named after it (<code>message-scroller</code>,{" "}
        <code>message-scroller-viewport</code>, <code>message-scroller-content</code>,{" "}
        <code>message-scroller-item</code>, <code>message-scroller-separator</code>,{" "}
        <code>message-scroller-button</code>, its words in <code>message-scroller-button-label</code> and the count in{" "}
        <code>message-scroller-button-count</code>). The jump cell has <code>data-active=&quot;true&quot;</code> while
        it shows.
      </p>
    </DocPage>
  );
}
