import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { ButtonGroupReview, ButtonGroupZoom, ButtonGroupMenu } from "@site/components/action-previews";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";

const ITEM = "button-group";

export const metadata = componentMetadata(
  "Button group",
  "A React button group: a few related buttons joined in one frame on shared seams, each still its own Tab stop. For a long row of commands, use Toolbar.",
  "button-group",
);

const IMPORT = `import { Button } from "@/components/keyline/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/keyline/ui/button-group"`;

const USAGE = `<ButtonGroup aria-label="Today’s orders">
  <Button layout="cell">Previous</Button>
  <ButtonGroupText>Order 1 of 5</ButtonGroupText>
  <Button layout="cell">Next</Button>
</ButtonGroup>`;

const PROPS: Prop[] = [
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: "Vertical stacks the cells on horizontal seams.",
  },
  {
    name: "aria-label",
    type: "string",
    default: "—",
    description: (
      <>
        The group is <code>role=&quot;group&quot;</code>; name it for what the buttons act on.
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
    label: "Examples",
    items: [
      { id: "text-and-separator", label: "Text and separator" },
      { id: "with-a-menu", label: "With a menu" },
    ],
  },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function ButtonGroupPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Button group" toc={TOC}>
      <h1>Button group</h1>
      <p className="s-doc-lede">
        A few related buttons in one frame, joined on shared seams. Each button stays its own Tab stop. For a long row
        of commands that should be one stop, use <Link href="/docs/components/toolbar">Toolbar</Link>.
      </p>

      <ComponentDemo
        label="Button group example"
        preview={<ButtonGroupReview />}
        code={code("button-group-review.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <p>
        Children are cells: a <code>Button</code> with <code>layout=&quot;cell&quot;</code>, a{" "}
        <code>ButtonGroupText</code>, or a menu trigger rendering a cell button.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="text-and-separator">Text and separator</h3>
      <p>
        <code>ButtonGroupText</code> holds a value between steppers. <code>ButtonGroupSeparator</code> draws a heavier
        seam where one run of cells ends and the next begins.
      </p>
      <ComponentDemo
        label="Text and separator example"
        preview={<ButtonGroupZoom />}
        code={code("button-group-zoom.tsx", "zoom example code")}
      />

      <h3 id="with-a-menu">With a menu</h3>
      <p>
        A <code>MenuTrigger</code> that renders a cell button joins the group; its menu docks to that cell.
      </p>
      <ComponentDemo
        label="Menu example"
        preview={<ButtonGroupMenu />}
        code={code("button-group-menu.tsx", "menu example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Button group props" props={PROPS} />
      <p className="s-small">
        Parts: <code>ButtonGroup</code> (a <code>div</code>, <code>role=&quot;group&quot;</code>),{" "}
        <code>ButtonGroupText</code> (a <code>span</code>) and <code>ButtonGroupSeparator</code> (Base UI{" "}
        <code>Separator</code>, oriented across the group). Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state. The group carries{" "}
        <code>data-slot=&quot;button-group&quot;</code> and <code>data-orientation</code>; the others{" "}
        <code>data-slot=&quot;button-group-text&quot;</code> and{" "}
        <code>data-slot=&quot;button-group-separator&quot;</code>.
      </p>
    </DocPage>
  );
}
