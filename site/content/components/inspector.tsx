import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { InspectorOrder } from "@site/components/layout-previews";

const IMPORT = `import { Inspector, InspectorActions, InspectorBody, InspectorFacts, InspectorHeader, InspectorRow, InspectorSection } from "@/components/keyline/ui/inspector"`;

const USAGE = `<Inspector aria-label="Order DM-4109">
  <InspectorHeader code="DM-4109" title="Vance Refrigeration" status={<Status kind="attention">Held</Status>} onClose={close} />
  <InspectorBody>
    <InspectorFacts items={[{ label: "Cases", value: 12 }]} />
  </InspectorBody>
  <InspectorActions>…</InspectorActions>
</Inspector>`;

const PROPS: Prop[] = [
  {
    name: "code \u00b7 title \u00b7 status",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>InspectorHeader</code>: the record&apos;s code, its name and a Status.
      </>
    ),
  },
  {
    name: "onClose \u00b7 closeLabel",
    type: "() => void \u00b7 string",
    default: '\u2014 \u00b7 "Close inspector"',
    description: "Adds a close cell.",
  },
  {
    name: "items",
    type: "{ label, value }[]",
    default: "\u2014",
    description: (
      <>
        On <code>InspectorFacts</code>: facts two to a row.
      </>
    ),
  },
  {
    name: "InspectorSection \u00b7 InspectorRow",
    type: "div",
    default: "\u2014",
    description: "A labelled cell, and a row that puts two short sections side by side.",
  },
  {
    name: "InspectorBody",
    type: "Scroll area",
    default: "\u2014",
    description: (
      <>
        The scrolling body: a Scroll area. <code>className</code> and <code>style</code> reach the scroll area;{" "}
        <code>contentClassName</code> lays out what it holds.
      </>
    ),
  },
  {
    name: "InspectorActions",
    type: "div",
    default: "\u2014",
    description: (
      <>
        A row of <code>Button layout=&quot;cell&quot;</code> at the foot.
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React inspector panel beside a list that shows the chosen record under the row's own code. The body scrolls, actions stay at the foot, the list stays usable.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A panel beside a list that shows the chosen record. Its header cites the same code as the row, so the two share
        an address. The body scrolls and the actions stay put at the foot. It doesn&apos;t block the page: you can
        choose another row while it&apos;s open.
      </p>

      <ComponentDemo
        label="Inspector example"
        preview={<InspectorOrder />}
        code={code("inspector-order.tsx", "example code")}
      />
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
        In an AppShell, pass it as <code>aside</code> and it becomes a sheet on narrow screens; the App shell page shows
        that.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Inspector</code>, <code>InspectorHeader</code>, <code>InspectorFacts</code>, <code>InspectorBody</code>,{" "}
        <code>InspectorSection</code>, <code>InspectorRow</code> and <code>InspectorActions</code> are the parts;
        Keyline renders each one. Every part but <code>InspectorBody</code> takes <code>render</code>; every part takes
        a <code>className</code> or <code>style</code> that may be a function (of an empty state: the parts have none).
      </p>
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>inspector</code>, <code>inspector-header</code>
        , <code>inspector-facts</code>, <code>inspector-body</code>, <code>inspector-section</code>,{" "}
        <code>inspector-row</code>, <code>inspector-actions</code>; inside the header, <code>inspector-heading</code>,{" "}
        <code>inspector-title</code> and <code>inspector-close</code>; each fact is <code>inspector-fact</code>).
      </p>
    </>
  ),
};
