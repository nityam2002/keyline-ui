import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { ResizableCalls } from "@site/components/layout-previews";

const ITEM = "resizable";

export const metadata = componentMetadata(
  "Resizable",
  "React resizable panels on react-resizable-panels: panes share a seam you drag by pointer or touch, move with arrow keys, and reset with a double-click.",
  "resizable",
);

const IMPORT = `import { ResizableHandle, ResizablePanel, ResizablePanelGroup, usePanelRef } from "@/components/keyline/ui/resizable"`;

const USAGE = `<ResizablePanelGroup orientation="vertical">
  <ResizablePanel defaultSize="55%" minSize="35%" collapsible>…</ResizablePanel>
  <ResizableHandle withHandle aria-label="Call list height" />
  <ResizablePanel minSize="25%">…</ResizablePanel>
</ResizablePanelGroup>`;

const PROPS: Prop[] = [
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: (
      <>
        On <code>ResizablePanelGroup</code>.
      </>
    ),
  },
  {
    name: "defaultSize \u00b7 minSize \u00b7 maxSize",
    type: "number | string",
    default: "\u2014",
    description: (
      <>
        On <code>ResizablePanel</code>: numbers are pixels, strings percentages (<code>&quot;30%&quot;</code>).
      </>
    ),
  },
  { name: "collapsible", type: "boolean", default: "false", description: "Lets the pane fold away past its minimum." },
  {
    name: "panelRef",
    type: "usePanelRef()",
    default: "\u2014",
    description: (
      <>
        <code>collapse()</code>, <code>expand()</code> and <code>resize()</code>, for a button that does what a drag
        does.
      </>
    ),
  },
  {
    name: "withHandle",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>ResizableHandle</code>: a grip on the seam.
      </>
    ),
  },
  {
    name: "aria-label",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>ResizableHandle</code>: name it after the pane it resizes.
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

export default function ResizablePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Resizable" toc={TOC}>
      <h1>Resizable</h1>
      <p className="s-doc-lede">
        Panes that share one seam you can move. Hover or drag thickens it; arrow keys move it, Enter collapses a
        collapsible pane, and a double-click resets it. It draws no frame of its own, so put it in a Panel or a shell
        column.
      </p>

      <ComponentDemo
        label="Resizable example"
        preview={<ResizableCalls />}
        code={code("resizable-calls.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Resizable props" props={PROPS} />
      <p className="s-small">
        Dragging needs another way in (WCAG 2.5.7): the example&apos;s Hide list button collapses the pane. Built on{" "}
        <a href="https://github.com/bvaughn/react-resizable-panels">react-resizable-panels</a>;{" "}
        <code>useDefaultLayout</code> remembers the layout.
      </p>
    </DocPage>
  );
}
