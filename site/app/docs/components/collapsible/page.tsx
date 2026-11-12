import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { CollapsibleOptions } from "@site/components/layout-previews";

const ITEM = "collapsible";

export const metadata = componentMetadata(
  "Collapsible",
  "A React collapsible: one unframed disclosure for the less common settings in a form or panel, with a summary of what is inside while it is closed. On Base UI.",
  "collapsible",
);

const IMPORT = `import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/keyline/ui/collapsible"`;

const USAGE = `<Collapsible>
  <CollapsibleTrigger meta="2 set">Delivery options</CollapsibleTrigger>
  <CollapsiblePanel>…</CollapsiblePanel>
</Collapsible>`;

const PROPS: Prop[] = [
  {
    name: "open \u00b7 defaultOpen \u00b7 onOpenChange",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>Collapsible</code>.
      </>
    ),
  },
  {
    name: "meta",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>CollapsibleTrigger</code>: what&apos;s hidden, in the code voice, such as a count.
      </>
    ),
  },
  {
    name: "hiddenUntilFound",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>CollapsiblePanel</code>: find-in-page opens it.
      </>
    ),
  },
  {
    name: "contentClassName",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>CollapsiblePanel</code>: classes for the content on the spine, inside the panel&apos;s clip, such as
        its layout (<code>grid gap-4</code>). <code>className</code> goes to the panel itself.
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
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

export default function CollapsiblePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Collapsible" toc={TOC}>
      <h1>Collapsible</h1>
      <p className="s-doc-lede">
        One disclosure with no frame, for the less common settings in a form. The trigger&apos;s caret box runs a
        keyline down the panel&apos;s edge, so what unfolds reads as part of it. <code>meta</code> says what&apos;s
        inside while it&apos;s closed.
      </p>

      <ComponentDemo
        label="Collapsible example"
        preview={<CollapsibleOptions />}
        code={code("collapsible-options.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Collapsible props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/collapsible">Base UI Collapsible</a>. For several
        sections in one frame, use Accordion.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>CollapsibleRoot</code> (also exported as{" "}
        <code>Collapsible</code>), <code>CollapsibleTrigger</code> and <code>CollapsiblePanel</code>. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>collapsible</code>,{" "}
        <code>collapsible-trigger</code>, <code>collapsible-panel</code>; inside them, <code>collapsible-box</code>,{" "}
        <code>collapsible-label</code>, <code>collapsible-meta</code> and <code>collapsible-content</code>), and Base
        UI&apos;s state attributes: <code>data-open</code> on the root and panel, <code>data-panel-open</code> on the
        trigger, <code>data-disabled</code>, and <code>data-starting-style</code> and <code>data-ending-style</code>{" "}
        while the panel unfolds or folds.
      </p>
    </DocPage>
  );
}
