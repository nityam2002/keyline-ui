import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { MarkerActivity } from "@site/components/data-previews";

const IMPORT = `import { Marker, MarkerContent, MarkerIcon } from "@/components/keyline/ui/marker"`;

const USAGE = `<Marker variant="separator">
  <MarkerContent>Today</MarkerContent>
</Marker>
<Marker pending={picking}>
  <MarkerIcon>{TruckIcon}</MarkerIcon>
  <MarkerContent>Darryl's team is picking 120 cases…</MarkerContent>
</Marker>`;

const PROPS: Prop[] = [
  {
    name: "variant",
    type: '"default" | "separator" | "border"',
    default: '"default"',
    description: <>A step; words between two seams, such as a day; or a heading with a keyline under it.</>,
  },
  {
    name: "pending",
    type: "boolean",
    default: "false",
    description:
      "Work in progress. The marker becomes a polite status, so the change is announced. Remove it when the step is done.",
  },
  {
    name: "MarkerIcon",
    type: "ReactNode",
    default: "\u2014",
    description: "A 16px glyph cell, hidden from screen readers.",
  },
  { name: "MarkerContent", type: "ReactNode", default: "\u2014", description: "The words." },
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
  seo: "A React activity timeline marker: a step as a glyph and words, a divider between days, a heading over a run of steps, or work still in progress.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A step in an activity timeline or between messages, in the code voice. A glyph and words, a divider between
        days, a heading over a run of steps, or work still going. Pending runs the yellow segment under the words, never
        a spinner.
      </p>

      <ComponentDemo
        label="Marker example"
        preview={<MarkerActivity />}
        code={code("marker-activity.tsx", "example code")}
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
        Parts: <code>Marker</code> (a <code>div</code>; a separator marker has the separator role),{" "}
        <code>MarkerIcon</code> and <code>MarkerContent</code> (each a <code>span</code>). The marker carries{" "}
        <code>data-slot=&quot;marker&quot;</code>, <code>data-variant</code> and <code>data-pending</code> while
        pending; the others <code>data-slot=&quot;marker-icon&quot;</code> and{" "}
        <code>data-slot=&quot;marker-content&quot;</code>. Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
    </>
  ),
};
