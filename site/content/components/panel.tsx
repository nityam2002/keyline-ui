import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { PanelTargets, PanelGridBoard } from "@site/components/layout-previews";

const IMPORT = `import { Panel, PanelBody, PanelFooter, PanelGrid, PanelHeader } from "@/components/keyline/ui/panel"`;

const USAGE = `<Panel>
  <PanelHeader code="Q4" title="Sales targets" />
  <PanelBody>…</PanelBody>
  <PanelFooter>
    <Button layout="cell" variant="primary">Send to corporate</Button>
  </PanelFooter>
</Panel>`;

const PROPS: Prop[] = [
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        On <code>Panel</code>: <code>cell</code> drops its frame to sit in a PanelGrid or another frame.
      </>
    ),
  },
  {
    name: "title \u00b7 code \u00b7 description \u00b7 actions",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>PanelHeader</code>: <code>code</code> sits before the title; <code>actions</code> are cells at the end.
      </>
    ),
  },
  {
    name: "headingLevel",
    type: "2 | 3 | 4",
    default: "2",
    description: (
      <>
        On <code>PanelHeader</code>: the title&apos;s heading level.
      </>
    ),
  },
  {
    name: "flush",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>PanelBody</code>: no padding, for lists and tables that bring their own keylines.
      </>
    ),
  },
  {
    name: "min",
    type: "number",
    default: "240",
    description: (
      <>
        On <code>PanelGrid</code>: the narrowest a cell gets before the grid wraps, in pixels.
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
      { id: "one-frame-for-a-board", label: "One frame for a board" },
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React panel: a region of a screen in a 3px frame, with header, body and footer cells on shared keylines and footer actions as cells.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A region of a screen in a 3px frame. Its header, body and footer are cells stacked on shared keylines, and the
        footer&apos;s actions are cells too. Standalone panels sit one gutter apart.
      </p>

      <ComponentDemo
        label="Panel example"
        preview={<PanelTargets />}
        code={code("panel-targets.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: (
    <>
      <h2 id="examples">Examples</h2>

      <h3 id="one-frame-for-a-board">One frame for a board</h3>
      <p>
        Inside <code>PanelGrid</code>, panels with <code>layout=&quot;cell&quot;</code> become cells of one frame, so a
        dashboard reads as one instrument. The seams stay right however the grid wraps; <code>min</code> sets the
        narrowest cell.
      </p>
      <ComponentDemo
        label="One frame for a board example"
        preview={<PanelGridBoard />}
        code={code("panel-grid.tsx", "one frame for a board example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Resizable, Scroll area and Item pages put their content in a Panel body with <code>flush</code>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Panel</code>, <code>PanelHeader</code>, <code>PanelBody</code>, <code>PanelFooter</code> and{" "}
        <code>PanelGrid</code> are the parts; Keyline renders each one. Every part takes <code>render</code> (to render
        a different element, a <code>form</code> for a <code>PanelBody</code> say), and a <code>className</code> or{" "}
        <code>style</code> that may be a function of its state (<code>layout</code> on <code>Panel</code>,{" "}
        <code>flush</code> on <code>PanelBody</code>).
      </p>
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>panel</code>, <code>panel-header</code>,{" "}
        <code>panel-body</code>, <code>panel-footer</code>, <code>panel-grid</code>; inside the header,{" "}
        <code>panel-heading</code>, <code>panel-title</code>, <code>panel-description</code> and{" "}
        <code>panel-actions</code>), and its state: <code>data-kl-layout</code> on <code>Panel</code>,{" "}
        <code>data-flush</code> on a flush <code>PanelBody</code>.
      </p>
    </>
  ),
};
