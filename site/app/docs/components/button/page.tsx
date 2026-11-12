import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { ButtonInvoice, ButtonVariants, ButtonRetry, ButtonAffixExample } from "@site/components/action-previews";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";

const ITEM = "button";

export const metadata = componentMetadata(
  "Button",
  "A React button on Base UI that shows pending, done and failed inside its own frame, so nothing moves. Primary, secondary, destructive and quiet variants.",
  "button",
);

const IMPORT = `import { Button } from "@/components/keyline/ui/button"`;

const USAGE = `<Button variant="primary" signal={sending ? "pending" : "idle"} onClick={send}>
  Email invoice
</Button>`;

const PROPS: Prop[] = [
  {
    name: "variant",
    type: '"secondary" | "primary" | "destructive" | "quiet"',
    default: '"secondary"',
    description: "Primary is the one commitment on a screen. Quiet drops the frame and underlines its label.",
  },
  {
    name: "size",
    type: '"default" | "compact" | "icon"',
    default: '"default"',
    description: (
      <>
        Icon is square; give it an <code>aria-label</code>.
      </>
    ),
  },
  {
    name: "signal",
    type: '"idle" | "pending" | "done" | "failed"',
    default: '"idle"',
    description: (
      <>
        <code>pending</code> runs a segment along the bottom edge and keeps focus while the button is busy.{" "}
        <code>done</code> inserts a ✓ cell, <code>failed</code> a ! cell. Return it to <code>idle</code> yourself.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame, to sit as a cell of a ButtonGroup, a Panel footer or a table row.
      </>
    ),
  },
  {
    name: "render",
    type: "ReactElement",
    default: "—",
    description: (
      <>
        Renders another element, such as a link: pass <code>nativeButton={"{false}"}</code> with it.
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
      { id: "variants", label: "Variants" },
      { id: "failed", label: "Failed and retry" },
      { id: "affix", label: "Affix" },
    ],
  },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function ButtonPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Button" toc={TOC}>
      <h1>Button</h1>
      <p className="s-doc-lede">
        A command in its own frame. While it works, the button says so: pending, done and failed happen inside the
        frame, so nothing around it moves.
      </p>

      <ComponentDemo
        label="Button example"
        preview={<ButtonInvoice />}
        code={code("button-invoice.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="variants">Variants</h3>
      <p>
        One <code>primary</code> per decision. <code>destructive</code> is for the action that loses something, and{" "}
        <code>quiet</code> for the one you can always come back to.
      </p>
      <ComponentDemo
        label="Variants example"
        preview={<ButtonVariants />}
        code={code("button-variants.tsx", "variants example code")}
      />

      <h3 id="failed">Failed and retry</h3>
      <p>
        <code>signal=&quot;failed&quot;</code> puts a ! cell at the start of the frame. Say what failed beside it and
        keep the button in place, so the retry is where the reader is already looking.
      </p>
      <ComponentDemo
        label="Failed and retry example"
        preview={<ButtonRetry />}
        code={code("button-retry.tsx", "retry example code")}
      />

      <h3 id="affix">Affix</h3>
      <p>
        <code>ButtonAffix</code> adds a cell to the frame for a count, a unit or a shortcut. Its keyline separates it
        from the label.
      </p>
      <ComponentDemo
        label="Affix example"
        preview={<ButtonAffixExample />}
        code={code("button-affix.tsx", "affix example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Button props" props={PROPS} />
      <p className="s-small">
        Also exported: <code>ButtonAffix</code>, and <code>buttonVariants</code> for styling a plain link as a button.
        To make the button itself a link, pass <code>render={'{<a href="…" />}'}</code> with{" "}
        <code>nativeButton={"{false}"}</code>. <code>className</code> and <code>style</code> also take a function of the
        button&apos;s state. Built on <a href="https://base-ui.com/react/components/button">Base UI Button</a>; its
        other props pass through.
      </p>
    </DocPage>
  );
}
