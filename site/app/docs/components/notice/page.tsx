import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { NoticeStock } from "@site/components/overlay-previews";

const ITEM = "notice";

export const metadata = componentMetadata(
  "Notice",
  "A React inline notice (alert banner) about the place it sits in: tone as a shape and a colour, actions as cells. For events that just happened, use Toast.",
  "notice",
);

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

export default function NoticePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Notice" toc={TOC}>
      <h1>Notice</h1>
      <p className="s-doc-lede">
        An inline message about the place it sits in. Its signal cell carries the tone as a shape and a colour, and its
        actions are cells on the same keylines. It never floats: a toast records something that happened, a notice
        describes something that is still true.
      </p>

      <ComponentDemo label="Notice example" preview={<NoticeStock />} code={code("notice-stock.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Notice props" props={PROPS} />
      <p className="s-small">
        The signal is a shape as well as a colour, so it reads without colour vision. For a record of something that
        just happened, use Toast.
      </p>
    </DocPage>
  );
}
