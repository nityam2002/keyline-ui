import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { NoticeStock } from "@site/components/overlay-previews";

const IMPORT = `import { Notice } from "@/components/keyline/ui/notice"`;

const USAGE = `<Notice
  tone="attention"
  title="Letter paper is down to 30 cases"
  description="That covers two days of deliveries."
  actions={<Button layout="cell" variant="primary">Reorder</Button>}
/>`;

const PROPS: Prop[] = [
  {
    name: "tone",
    type: '"info" | "done" | "attention" | "neutral"',
    default: '"info"',
    description: "The signal cell: i, \u2713, ! or a plain rule.",
  },
  {
    name: "title \u00b7 description",
    type: "ReactNode",
    default: "\u2014",
    description: "The condition, then what it means or what to do.",
  },
  {
    name: "actions",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        Buttons with <code>layout=&quot;cell&quot;</code>. They wrap below the message on a narrow width.
      </>
    ),
  },
  { name: "onDismiss", type: "() => void", default: "\u2014", description: "Adds a close cell." },
  {
    name: "open",
    type: "boolean",
    default: "true",
    description: <>false folds it back to its top keyline and makes it inert, so it can animate away.</>,
  },
  {
    name: "live",
    type: "boolean",
    default: "false",
    description: "Announces it when it appears. Use it for the result of something the reader just did.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> is a row of an enclosing frame, such as the top of a panel.
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React inline notice (alert banner) about the place it sits in: tone as a shape and a colour, actions as cells. For events that just happened, use Toast.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        An inline message about the place it sits in. Its signal cell carries the tone as a shape and a colour, and its
        actions are cells on the same keylines. It never floats: a toast records something that happened, a notice
        describes something that is still true.
      </p>

      <ComponentDemo label="Notice example" preview={<NoticeStock />} code={code("notice-stock.tsx", "example code")} />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        Part: <code>Notice</code> (a <code>div</code>; Base UI has no inline notice). The frame takes the props,{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state (
        <code>tone</code>, <code>layout</code>, <code>open</code>). It carries <code>data-slot=&quot;notice&quot;</code>
        , <code>data-tone</code> and <code>data-kl-layout</code>; its cells are <code>notice-signal</code>,{" "}
        <code>notice-content</code> (<code>notice-title</code>, <code>notice-description</code>),{" "}
        <code>notice-actions</code> and <code>notice-dismiss</code>. The frame sits in a fold,{" "}
        <code>data-slot=&quot;notice-root&quot;</code>, which has <code>data-open</code> while open. At 520px of its own
        width and under, the actions drop to a row of cells under the message.
      </p>
      <p className="s-small">
        The signal is a shape as well as a colour, so it reads without colour vision. For a record of something that
        just happened, use Toast.
      </p>
    </>
  ),
};
