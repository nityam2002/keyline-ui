import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { BubbleReactions } from "@site/components/conversation-previews";

const IMPORT = `import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/keyline/ui/bubble"`;

const USAGE = `<Bubble tone="tint" pending={sending}>
  <BubbleContent>I'll put two cases on Thursday's truck.</BubbleContent>
  <BubbleReactions>…</BubbleReactions>
</Bubble>`;

const PARTS = `<BubbleGroup>
  <Bubble tone="plain">
    <BubbleContent>Bay 2 has power for the reefer.</BubbleContent>
  </Bubble>
  <Bubble tone="plain">
    <BubbleContent render={<button type="button" onClick={openThread} />}>3 replies</BubbleContent>
    <Attachment … />
    <BubbleReactions>
      <button type="button" aria-pressed="true" aria-label="Thumbs up, 2, you reacted">…</button>
    </BubbleReactions>
  </Bubble>
</BubbleGroup>`;

const PROPS: Prop[] = [
  {
    name: "tone",
    type: '"plain" | "tint" | "attention"',
    default: '"plain"',
    description: (
      <>
        <code>plain</code> for the other party, <code>tint</code> for the reader&apos;s own, <code>attention</code> for
        one that wasn&apos;t sent, with a ! cell before the text.
      </>
    ),
  },
  {
    name: "pending",
    type: "boolean",
    default: "false",
    description: "The message is on its way. A static hatch under reduced motion.",
  },
  {
    name: "render",
    type: "ReactElement",
    default: "\u2014",
    description: (
      <>
        On <code>BubbleContent</code>: a button or link, when the message itself acts, such as opening a thread.
      </>
    ),
  },
  {
    name: "BubbleReactions",
    type: "div",
    default: "\u2014",
    description: (
      <>
        A row of small cells on the bottom keyline. Use buttons with <code>aria-pressed</code> and a label that says the
        count.
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React chat message bubble: the text, any files and the reactions in one frame. Bubbles in a run share edges, and a message being sent shows a pending segment.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        One message: a frame holding the text, then any files, then its reactions on the bottom keyline. Bubbles in a
        run share their edges, so the run is one stack rather than a pile of boxes. Tone comes from who sent it, never
        decoration, and a message on its way runs a pending segment along its foot.
      </p>

      <ComponentDemo
        label="Bubble example"
        preview={<BubbleReactions />}
        code={code("bubble-reactions.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h3 id="parts">Parts</h3>
      <p>
        <code>Bubble</code> is the frame; <code>BubbleContent</code> its text cell, with the ! cell before it when the
        tone is <code>attention</code>; <code>BubbleReactions</code> the row on its bottom keyline. Attachment cells go
        between the text and the reactions and take a seam between them. <code>BubbleGroup</code> stacks bubbles on
        shared edges; Message&apos;s <code>MessageContent</code> does the same for a sender&apos;s run.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        Text takes its direction from its first strong letter (<code>dir=&quot;auto&quot;</code>), so a message in
        Hebrew reads right to left in an English conversation. The Message page shows a failed bubble and its Retry.
        Every part takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function
        of its state. The bubble carries <code>data-slot=&quot;bubble&quot;</code>, <code>data-tone</code> and{" "}
        <code>data-pending</code>; the others <code>data-slot</code> <code>bubble-group</code>,{" "}
        <code>bubble-content</code> (its text in <code>bubble-text</code>, the ! cell <code>bubble-bang</code>) and{" "}
        <code>bubble-reactions</code>.
      </p>
    </>
  ),
};
