import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { MessageThread } from "@site/components/conversation-previews";

const ITEM = "message";

export const metadata = componentMetadata(
  "Message",
  "A React chat message group: one sender's consecutive bubbles in one stack, with name, time and a receipt on one edge, the other party at the start.",
  "message",
);

const IMPORT = `import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/keyline/ui/message"`;

const USAGE = `<Message align="start">
  <MessageAvatar><Avatar name="Jim Halpert" decorative /></MessageAvatar>
  <MessageContent>
    <MessageHeader><span>Jim Halpert</span><time>10:42</time></MessageHeader>
    <Bubble><BubbleContent>…</BubbleContent></Bubble>
  </MessageContent>
</Message>`;

const PARTS = `<MessageGroup>
  <Message align="start">
    <MessageAvatar><Avatar name="Jim Halpert" decorative /></MessageAvatar>
    <MessageContent>
      <MessageHeader><span>Jim Halpert</span><time>10:42</time></MessageHeader>
      <Bubble><BubbleContent>…</BubbleContent></Bubble>
    </MessageContent>
  </Message>
  <Message align="end">
    <MessageContent>
      <Bubble tone="attention"><BubbleContent>…</BubbleContent></Bubble>
      <MessageFooter tone="attention">
        <bdi>Not sent: no signal.</bdi>
        <button type="button" onClick={retry}>Retry</button>
      </MessageFooter>
    </MessageContent>
  </Message>
</MessageGroup>`;

const PROPS: Prop[] = [
  {
    name: "align",
    type: '"start" | "end"',
    default: '"start"',
    description: (
      <>
        On <code>Message</code>: <code>start</code> for the other party, <code>end</code> for the reader&apos;s own. It
        mirrors in right-to-left text.
      </>
    ),
  },
  {
    name: "MessageAvatar",
    type: "div",
    default: "\u2014",
    description: (
      <>
        An Avatar, level with the first bubble. Mark it <code>decorative</code>: the header names the sender.
      </>
    ),
  },
  {
    name: "MessageHeader",
    type: "div",
    default: "\u2014",
    description: (
      <>
        The sender and a <code>&lt;time&gt;</code>.
      </>
    ),
  },
  {
    name: "tone",
    type: '"attention"',
    default: "\u2014",
    description: (
      <>
        On <code>MessageFooter</code>: the bubble above wasn&apos;t sent. Give the reason, then a Retry button.
      </>
    ),
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

export default function MessagePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Message" toc={TOC}>
      <h1>Message</h1>
      <p className="s-doc-lede">
        One sender&apos;s run: their consecutive messages, close in time. The name, the time, every bubble&apos;s text
        and the receipt start on one vertical edge, so a run reads as one unit on either side. The other party sits at
        the start with an avatar; the reader&apos;s own run sits at the end. A footer says how the bubble above it
        stands.
      </p>

      <ComponentDemo
        label="Message example"
        preview={<MessageThread />}
        code={code("message-thread.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h3 id="parts">Parts</h3>
      <p>
        <code>Message</code> is one sender&apos;s run; <code>MessageAvatar</code> holds its Avatar and{" "}
        <code>MessageContent</code> its header, bubbles and footer. <code>MessageHeader</code> names the sender and the
        time; <code>MessageFooter</code> says how the bubble above it stands, and a screen reader hears a change to it (
        <code>aria-live=&quot;polite&quot;</code>). <code>MessageGroup</code> spaces runs apart in a conversation.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />

      <h2 id="props">Props</h2>
      <PropsReference label="Message props" props={PROPS} />
      <p className="s-small">
        Put every consecutive message of a run in one Message: the header, then the bubbles, then at most one footer.
        Files go inside a bubble as Attachment cells. Every part takes <code>render</code>, and a <code>className</code>{" "}
        or <code>style</code> that may be a function of its state. The run carries{" "}
        <code>data-slot=&quot;message&quot;</code> and <code>data-align</code>; the others <code>data-slot</code>{" "}
        <code>message-group</code>, <code>message-avatar</code>, <code>message-content</code>,{" "}
        <code>message-header</code> and <code>message-footer</code> (with <code>data-tone</code>).
      </p>
    </DocPage>
  );
}
